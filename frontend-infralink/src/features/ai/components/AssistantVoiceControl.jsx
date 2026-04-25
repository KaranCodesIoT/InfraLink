import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AudioLines } from 'lucide-react';

const LANGUAGES = [
    { code: 'en-IN', label: 'EN', name: 'English' },
    { code: 'hi-IN', label: 'HI', name: 'Hindi' },
    { code: 'mr-IN', label: 'MR', name: 'Marathi' }
];

/**
 * Standard Voice Control (Push-to-talk)
 */
export default function AssistantVoiceControl({
    onTranscription,
    lastAssistantReply,
    language = 'en-IN',
    apiBase = ''
}) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);
    const silenceTimerRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setIsListening(false);
            clearTimeout(silenceTimerRef.current);
            if (onTranscription && text.trim()) onTranscription(text);
        };

        recognition.onerror = (e) => {
            console.warn('Speech recognition error:', e.error);
            setIsListening(false);
            clearTimeout(silenceTimerRef.current);
        };

        recognition.onend = () => {
            setIsListening(false);
            clearTimeout(silenceTimerRef.current);
        };

        recognitionRef.current = recognition;
    }, [language, onTranscription]);

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            clearTimeout(silenceTimerRef.current);
        } else {
            // Stop any playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            try {
                recognitionRef.current.lang = language;
                recognitionRef.current.start();
                setIsListening(true);

                // Auto-stop after 8 seconds of silence
                silenceTimerRef.current = setTimeout(() => {
                    recognitionRef.current?.stop();
                    setIsListening(false);
                }, 8000);
            } catch (err) {
                console.warn('Could not start recognition:', err);
            }
        }
    }, [isListening, language]);

    // Play TTS response via proxy
    const playResponse = useCallback((text) => {
        if (!text) return;

        // Clean text for TTS
        const cleanText = text
            .replace(/[*#_\[\]`]/g, '')
            .replace(/\n+/g, '. ')
            .slice(0, 200);

        const lang = language.split('-')[0];
        const baseUrl = apiBase || (import.meta.env.VITE_API_URL || 'https://infralink-production.up.railway.app/api/v1');
        const url = `${baseUrl}/ai/voice/tts-proxy?tl=${lang}&q=${encodeURIComponent(cleanText)}`;

        if (audioRef.current) {
            audioRef.current.pause();
        }

        audioRef.current = new Audio(url);
        audioRef.current.play().catch(e => console.warn('TTS autoplay blocked:', e));
    }, [language, apiBase]);

    // NOTE: Auto-play removed — TTS only plays when user explicitly triggers it

    // Cleanup
    useEffect(() => {
        return () => {
            clearTimeout(silenceTimerRef.current);
            if (audioRef.current) audioRef.current.pause();
        };
    }, []);

    return (
        <button
            onClick={toggleListening}
            className={`transition-colors p-2 ${isListening ? 'text-orange-500 hover:text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            title={isListening ? 'Stop listening' : `Dictate (${LANGUAGES.find(l => l.code === language)?.name || 'English'})`}
            style={{ 
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
        </button>
    );
}

export { LANGUAGES };
