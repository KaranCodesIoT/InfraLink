import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { askInfralinkAssistant } from '../services/ai.service';
import { executeAction, isNavigationAction } from '../services/actionHandler';

/**
 * useAssistant — Full state management for the AI Assistant
 */
export default function useAssistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [lastReply, setLastReply] = useState('');

    const sendMessage = useCallback(async (text) => {
        if (!text?.trim() || isLoading) return;

        const userMsg = { id: Date.now(), role: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const response = await askInfralinkAssistant(text);

            const botMsg = {
                id: Date.now() + 1,
                role: 'bot',
                text: response.reply,
                action: response.action,
                data: response.data,
                intent: response.intent,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
            setLastReply(response.reply);

            if (response.suggestions?.length) {
                setSuggestions(response.suggestions);
            }

            // Auto-navigate for navigation actions
            if (response.action && isNavigationAction(response.action)) {
                setTimeout(() => {
                    executeAction(response.action, response.data, navigate);
                }, 1500);
            }

            return response;
        } catch (err) {
            const errMsg = err?.message || 'Something went wrong';
            setError(errMsg);
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                role: 'bot',
                text: errMsg,
                isError: true,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, navigate]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setSuggestions([]);
        setLastReply('');
        setError(null);
    }, []);

    const handleAction = useCallback((action, data) => {
        executeAction(action, data, navigate);
    }, [navigate]);

    return {
        messages,
        isLoading,
        error,
        suggestions,
        lastReply,
        sendMessage,
        clearChat,
        handleAction
    };
}
