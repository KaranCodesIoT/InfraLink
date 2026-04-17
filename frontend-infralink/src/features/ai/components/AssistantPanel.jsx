import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, Sparkles, Hammer, Calculator, Box, Briefcase,
    Package, HelpCircle, Trash2, Maximize2, Minimize2, Plus, Mic
} from 'lucide-react';
import { askInfralinkAssistant, getAssistantHistory } from '../services/ai.service';
import { executeAction, isNavigationAction } from '../services/actionHandler';
import AssistantVoiceControl, { LANGUAGES } from './AssistantVoiceControl';
import MessageBubble from './MessageBubble';
import WorkerCard from './WorkerCard';
import ProjectCard from './ProjectCard';
import MaterialCard from './MaterialCard';
import './AssistantPanel.css';

const INITIAL_MESSAGE = {
    id: 1,
    role: 'bot',
    text: "Hello! I'm your **Infralink AI Assistant**. I can help you find workers, estimate costs, browse projects, and much more. How can I help you today?",
    timestamp: new Date()
};

const DEFAULT_SUGGESTIONS = [
    { label: 'Find Workers', icon: <Hammer size={13} />, query: 'Find me a painter in Mumbai' },
    { label: 'Cost Estimate', icon: <Calculator size={13} />, query: 'How much to build a 2BHK?' },
    { label: '3D Projects', icon: <Box size={13} />, query: 'Show me available projects' },
    { label: 'Browse Jobs', icon: <Briefcase size={13} />, query: 'Show available construction jobs' },
    { label: 'Materials', icon: <Package size={13} />, query: 'Show me cement prices' },
    { label: 'Help', icon: <HelpCircle size={13} />, query: 'What can you do?' }
];

export default function AssistantPanel() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastReply, setLastReply] = useState('');
    const [language, setLanguage] = useState('en-IN');
    const [dynamicSuggestions, setDynamicSuggestions] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wasVoiceInput, setWasVoiceInput] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Load History
    useEffect(() => {
        let mounted = true;
        const loadHistory = async () => {
            const history = await getAssistantHistory();
            if (mounted && history && history.length > 0) {
                setMessages([INITIAL_MESSAGE, ...history]);
            }
        };
        loadHistory();
        return () => { mounted = false; };
    }, []);

    const handleSend = async (textOverride = null, isVoice = false) => {
        const question = (textOverride || input).trim();
        if (!question || isLoading) return;

        setWasVoiceInput(isVoice);
        const userMsg = { id: Date.now(), role: 'user', text: question, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setDynamicSuggestions([]);
        setLastReply('');

        try {
            const botMsgId = Date.now() + 1;
            
            // Push empty bot message placeholder
            setMessages(prev => [...prev, {
                id: botMsgId,
                role: 'bot',
                text: '',
                timestamp: new Date(),
                isStreaming: true
            }]);

            const responseText = [];

            const onChunk = (chunk) => {
                responseText.push(chunk);
                const currentText = responseText.join('');
                setMessages(prev => prev.map(m => 
                    m.id === botMsgId ? { ...m, text: currentText } : m
                ));
            };

            const response = await askInfralinkAssistant(question, language, onChunk);

            // Stream done, attach final action metadata
            setMessages(prev => prev.map(m => 
                m.id === botMsgId ? { 
                    ...m, 
                    text: response?.reply || m.text,
                    action: response?.action,
                    data: response?.data,
                    intent: response?.intent,
                    isStreaming: false 
                } : m
            ));

            setLastReply(response?.reply || '');

            // Dynamic suggestions from backend
            if (response?.suggestions?.length > 0) {
                setDynamicSuggestions(response.suggestions.map(s => ({
                    label: s, icon: null, query: s
                })));
            }

            // Handle navigation actions
            if (response?.action && isNavigationAction(response.action)) {
                setTimeout(() => {
                    executeAction(response.action, response.data, navigate);
                }, 1500);
            }

        } catch (error) {
            const errText = error?.message || 'Something went wrong. Please try again.';
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                role: 'bot',
                text: errText,
                isError: true,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceTranscription = (text) => {
        handleSend(text, true);
    };

    const clearChat = () => {
        setMessages([INITIAL_MESSAGE]);
        setDynamicSuggestions([]);
        setLastReply('');
        setWasVoiceInput(false);
    };

    const handleWorkerClick = (worker) => {
        if (worker._id) navigate(`/profile/${worker._id}`);
    };

    const handleProjectAR = (project) => {
        if (project._id) navigate(`/ar-view/${project._id}`);
    };

    // Render result cards based on action type
    const renderResultCards = (message) => {
        if (!message.data || !Array.isArray(message.data) || message.data.length === 0) return null;

        switch (message.action) {
            case 'show_workers':
                return (
                    <div className="result-cards">
                        {message.data.map((w, i) => (
                            <WorkerCard key={w._id || i} worker={w} onClick={handleWorkerClick} />
                        ))}
                    </div>
                );
            case 'show_projects':
                return (
                    <div className="result-cards">
                        {message.data.map((p, i) => (
                            <ProjectCard key={p._id || i} project={p} onViewAR={handleProjectAR} />
                        ))}
                    </div>
                );
            case 'show_materials':
                return (
                    <div className="result-cards">
                        {message.data.map((m, i) => (
                            <MaterialCard key={m._id || i} material={m} />
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const activeSuggestions = dynamicSuggestions.length > 0
        ? dynamicSuggestions
        : (messages.length < 4 ? DEFAULT_SUGGESTIONS : []);

    const containerStyle = isFullscreen
        ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, maxHeight: '100vh', borderRadius: 0 }
        : {};

    return (
        <div className="assistant-container" style={containerStyle}>
            {/* ─── Header ─── */}
            <div className="assistant-header">
                <div className="header-left">
                    <div className="header-icon">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div className="header-title">Infralink AI</div>
                        <div className="header-status">
                            <div className="status-dot" />
                            <span className="status-text">Online & Ready</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <select
                        className="lang-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        title="Voice Language"
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                    </select>
                    <button className="header-btn" onClick={clearChat} title="Clear Chat">
                        <Trash2 size={16} />
                    </button>
                    <button className="header-btn" onClick={() => setIsFullscreen(f => !f)} title="Toggle Fullscreen">
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            {/* ─── Chat Area ─── */}
            <div className="chat-area" ref={scrollRef}>
                {messages.length <= 1 && (
                    <div className="welcome-state">
                        <div className="welcome-icon">
                            <Sparkles size={30} />
                        </div>
                        <div className="welcome-title">How can I help you today?</div>
                        <div className="welcome-subtitle">
                            Ask me about workers, projects, cost estimates, materials, or anything about construction.
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id}>
                        <MessageBubble message={m} language={language} />
                        {!m.isStreaming && m.role === 'bot' && renderResultCards(m)}
                    </div>
                ))}

                {isLoading && !messages[messages.length - 1]?.isStreaming && (
                    <div className="typing-indicator">
                        <div className="message-avatar bot-avatar" style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Sparkles size={14} />
                        </div>
                        <div className="typing-dots">
                            <span /><span /><span />
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Input Area ─── */}
            <div className="input-area">
                {activeSuggestions.length > 0 && !isLoading && (
                    <div className="suggestion-chips">
                        {activeSuggestions.map((s, i) => (
                            <button
                                key={i}
                                className="suggestion-chip"
                                onClick={() => handleSend(s.query, false)}
                            >
                                {s.icon}
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="input-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors" title="Add attachment">
                        <Plus size={22} />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(null, false)}
                        placeholder="Ask anything"
                        disabled={isLoading}
                        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', padding: '10px 0' }}
                    />

                    {input.trim() ? (
                        <button
                            onClick={() => handleSend(null, false)}
                            disabled={isLoading}
                            className={`send-btn ${isLoading ? 'disabled' : 'active'}`}
                            style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#007AFF', color: 'white' }}
                        >
                            <Send size={18} />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AssistantVoiceControl
                                onTranscription={handleVoiceTranscription}
                                lastAssistantReply={wasVoiceInput ? lastReply : ''}
                                language={language}
                                isLoading={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
