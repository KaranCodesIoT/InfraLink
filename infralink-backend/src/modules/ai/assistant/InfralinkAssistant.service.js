import { detectIntent } from './intentDetector.js';
import * as dbService from './dbService.js';
import * as ragService from './ragService.js';
import * as llmService from './llmService.js';
import ConversationMemory from './conversationMemory.model.js';
import logger from '../../../utils/logger.js';

/**
 * Infralink AI Brain — Orchestrator v2
 * 
 * ALWAYS uses LLM for worker/project results to give intelligent recommendations.
 * Never returns raw data without explanation.
 * Always asks follow-up questions for conversational flow.
 */

let ragInitialized = false;

export const askAssistant = async (query, userId = null, language = 'en-IN', onChunk = null) => {
    // Initialize RAG on first call
    if (!ragInitialized) {
        await ragService.initRAG();
        ragInitialized = true;
    }

    // 1. Get conversation memory
    let memory = null;
    let conversationHistory = [];
    if (userId) {
        memory = await ConversationMemory.findOne({ userId });
        if (!memory) memory = new ConversationMemory({ userId });
        conversationHistory = memory.getHistory(6);
    }

    // 2. Detect intent with STRICT entity extraction
    const { intent, entities, action: detectedAction, confidence } = await detectIntent(query);
    logger.info(`[Brain] Intent: ${intent} (${confidence}) | Skill: "${entities.skill}" | Area: "${entities.area}" | City: "${entities.city}"`);

    let contextData = null;
    let ragContext = null;
    let finalAction = detectedAction || null;
    let suggestions = [];
    let dbResults = null;

    // 3. Fetch data based on intent
    switch (intent) {
        case 'find_worker': {
            dbResults = await dbService.searchWorkers(entities);
            contextData = dbResults.results;
            finalAction = 'show_workers';

            // Dynamic suggestions based on results
            if (dbResults.count === 0) {
                suggestions = [
                    `Find ${entities.skill || 'workers'} in ${entities.city || 'Mumbai'}`,
                    'Show all available professionals',
                    'Post a job instead'
                ];
            } else {
                suggestions = [
                    'View top match profile',
                    'Compare prices',
                    `More ${entities.skill || 'workers'} in other areas`,
                    'What\'s the budget?'
                ];
            }
            break;
        }

        case 'project_search': {
            dbResults = await dbService.searchProjects({
                title: entities.query || query,
                type: entities.type,
                budget: entities.budget
            });
            contextData = dbResults.results;
            finalAction = 'show_projects';
            suggestions = ['View in 3D/AR', 'Compare budgets', 'Similar projects'];
            break;
        }

        case 'cost_estimation': {
            const ragResult = await ragService.searchKnowledge(query);
            if (ragResult.found) ragContext = ragResult.context;
            suggestions = ['Detailed breakdown', 'Find contractors for this', 'Material costs'];
            break;
        }

        case 'material_search': {
            dbResults = await dbService.searchMaterials({ name: entities.name });
            contextData = dbResults.results;
            finalAction = 'show_materials';
            suggestions = ['Compare prices', 'Bulk pricing', 'Delivery available?'];
            break;
        }

        case 'job_search': {
            dbResults = await dbService.searchJobs({ query: entities.query || query });
            contextData = dbResults.results;
            finalAction = 'show_jobs';
            suggestions = ['Filter by skill', 'Newest first', 'Apply now'];
            break;
        }

        case 'navigation': {
            finalAction = detectedAction || 'navigate_home';
            const navResponse = getNavigationResponse(finalAction);
            if (memory) {
                memory.addMessage('user', query, intent);
                memory.addMessage('assistant', navResponse);
                await memory.save();
            }
            return { reply: navResponse, intent, action: finalAction, data: null, suggestions: [], timestamp: new Date() };
        }

        case 'platform_help': {
            const helpRag = await ragService.searchKnowledge(query);
            if (helpRag.found) ragContext = helpRag.context;
            suggestions = ['Find workers', 'Post a job', 'Browse projects', 'Cost estimate'];
            break;
        }

        default: {
            const generalRag = await ragService.searchKnowledge(query);
            if (generalRag.found) ragContext = generalRag.context;
            suggestions = ['Find workers', 'Estimate costs', 'Browse projects'];
        }
    }

    // 4. Smart Routing: Skip LLM for DB queries, use LLM for Knowledge
    let reply = '';
    const needsLLM = ['cost_estimation', 'general', 'platform_help'].includes(intent);

    if (!needsLLM && intent !== 'navigation') {
        // Fast localized response (NO LLM)
        reply = getLocalizedResponse(intent, dbResults, entities, language);
        if (onChunk) onChunk(reply);
    } else if (needsLLM) {
        // RAG + LLM response
        let llmContext = {};
        if (contextData) llmContext.databaseResults = contextData;
        if (ragContext) llmContext.knowledgeBase = ragContext;
        if (Object.keys(llmContext).length === 0) llmContext = null;

        const basePrompt = llmService.getSystemPrompt(intent);
        const languagePrompt = `IMPORTANT: You MUST respond entirely in the language corresponding to language code "${language}". Do not use English unless the code is en-IN.`;
        const systemPrompt = `${basePrompt}\n\n${languagePrompt}`;

        reply = await llmService.generateResponse({
            systemPrompt,
            userQuery: query,
            contextData: llmContext,
            conversationHistory,
            intent,
            maxTokens: intent === 'cost_estimation' ? 1500 : 800,
            onChunk
        });
    }

    // 5. Save to conversation memory
    if (memory) {
        memory.addMessage('user', query, intent);
        memory.addMessage('assistant', reply);
        await memory.save();
    }

    // 6. Return structured response with action + data + language
    return {
        reply,
        language,
        intent,
        action: finalAction,
        data: contextData,
        suggestions,
        timestamp: new Date()
    };
};

function getNavigationResponse(action) {
    const messages = {
        'open_ar': '🏗️ Opening the AR Viewer! You can explore 3D models in augmented reality.',
        'navigate_jobs': '💼 Taking you to the Job Board!',
        'navigate_profile': '👤 Opening your Profile.',
        'navigate_messages': '💬 Opening Messages.',
        'navigate_dashboard': '📊 Taking you to your Dashboard.',
        'navigate_projects': '🏠 Opening Projects.',
        'navigate_directory': '📋 Opening Professional Directory.',
        'navigate_notifications': '🔔 Opening Notifications.',
        'navigate_payments': '💳 Opening Payments.',
        'navigate_marketplace': '🛒 Opening Material Marketplace.',
        'navigate_home': '🏠 Taking you Home.'
    };
    return messages[action] || '🔄 Navigating...';
}

function getLocalizedResponse(intent, dbResults, entities, language = 'en-IN') {
    const lang = language.split('-')[0]; // 'en', 'hi', 'mr'
    const count = dbResults?.count || 0;

    if (intent === 'find_worker') {
        const skill = entities?.skill || 'worker';
        const loc = entities?.area || entities?.city || '';
        const locStr = loc ? ` in ${loc}` : '';
        const locHi = loc ? ` ${loc} mein` : '';
        const locMr = loc ? ` ${loc} madhye` : '';
        
        if (count === 0) {
            if (lang === 'hi') return `Maaf karein, mujhe${locHi} koi ${skill} nahi mila.`;
            if (lang === 'mr') return `Maaf kara, mala${locMr} konitehi ${skill} sapadale nahi.`;
            return `I couldn't find any ${skill}s${locStr}.`;
        }
        
        const topName = dbResults.results[0]?.name || 'a professional';
        if (lang === 'hi') return `Mujhe ${count} ${skill} mile hain. Top match ${topName} hai. Inki profile check karein.`;
        if (lang === 'mr') return `Mala ${count} ${skill} sapadale ahet. Top match ${topName} ahe. Tyanchi profile paha.`;
        return `I found ${count} ${skill}s. The top match is ${topName}. I've shared their profile below.`;
    }

    if (intent === 'project_search') {
        if (count === 0) {
            if (lang === 'hi') return `Koi projects nahi mile.`;
            if (lang === 'mr') return `Kontehi projects sapadle nahit.`;
            return `I couldn't find any matching projects.`;
        }
        if (lang === 'hi') return `Mujhe ${count} projects mile hain. Neeche list dekhein.`;
        if (lang === 'mr') return `Mala ${count} projects sapadale ahet. Khali list paha.`;
        return `I found ${count} projects for you to browse.`;
    }

    if (intent === 'material_search') {
        const item = entities?.name || 'materials';
        if (count === 0) {
            if (lang === 'hi') return `Maaf karein, ${item} ki detail nahi mili.`;
            if (lang === 'mr') return `Maaf kara, ${item} baddal mahiti milali nahi.`;
            return `I couldn't find details for ${item}.`;
        }
        if (lang === 'hi') return `Yahan ${item} ke prices aur details hain.`;
        if (lang === 'mr') return `Ithe ${item} che prices ani details ahet.`;
        return `Here are the prices and details for ${item}.`;
    }

    if (intent === 'job_search') {
        if (count === 0) {
            if (lang === 'hi') return `Abhi koi jobs available nahi hain.`;
            if (lang === 'mr') return `Sadhya kontehi jobs available nahit.`;
            return `There are no matching jobs right now.`;
        }
        if (lang === 'hi') return `Mujhe ${count} jobs mili hain. Aap apply kar sakte hain.`;
        if (lang === 'mr') return `Mala ${count} jobs sapadlya ahet. Tumhi apply karu shakta.`;
        return `I found ${count} jobs you can apply for.`;
    }

    return "Done.";
}

/**
 * Retrieve user's chat history mapped to frontend MessageBubble format
 */
export const getChatHistory = async (userId) => {
    if (!userId) return [];
    const memory = await ConversationMemory.findOne({ userId });
    if (!memory || !memory.messages) return [];

    return memory.messages.map((m, i) => ({
        id: m._id || new Date(m.timestamp).getTime() + i,
        role: m.role === 'assistant' ? 'bot' : 'user',
        text: m.content,
        timestamp: m.timestamp
    }));
};
