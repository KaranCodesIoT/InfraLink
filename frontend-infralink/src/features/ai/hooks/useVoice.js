import { useState, useEffect, useRef, useCallback } from 'react';

const SUPPORTED_LANGUAGES = [
    { code: 'en-IN', label: 'English', shortLabel: 'EN' },
    { code: 'hi-IN', label: 'Hindi', shortLabel: 'HI' },
    { code: 'mr-IN', label: 'Marathi', shortLabel: 'MR' }
];

/**
 * useVoice — Speech-to-Text and Text-to-Speech hook
 */
export default function useVoice(onTranscription, apiBase = '') {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState('en-IN');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = language;

            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setIsListening(false);
                if (onTranscription && text.trim()) onTranscription(text);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }

        return () => {
            if (audioRef.current) audioRef.current.pause();
        };
    }, [language, onTranscription]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.lang = language;
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.warn('Speech recognition error:', err);
        }
    }, [language]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    const speak = useCallback((text, lang) => {
        if (!text) return;

        const cleanText = text.replace(/[*#_\[\]`]/g, '').replace(/\n+/g, '. ').slice(0, 200);
        const ttsLang = (lang || language).split('-')[0];
        const base = apiBase || (import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1');
        const url = `${base}/ai/voice/tts-proxy?tl=${ttsLang}&q=${encodeURIComponent(cleanText)}`;

        if (audioRef.current) audioRef.current.pause();

        const audio = new Audio(url);
        audioRef.current = audio;

        setIsSpeaking(true);
        audio.play().catch(() => setIsSpeaking(false));
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
    }, [language, apiBase]);

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const cycleLanguage = useCallback(() => {
        const currentIdx = SUPPORTED_LANGUAGES.findIndex(l => l.code === language);
        const nextIdx = (currentIdx + 1) % SUPPORTED_LANGUAGES.length;
        setLanguage(SUPPORTED_LANGUAGES[nextIdx].code);
    }, [language]);

    return {
        isListening,
        isSpeaking,
        language,
        isSupported,
        startListening,
        stopListening,
        toggleListening,
        speak,
        stopSpeaking,
        setLanguage,
        cycleLanguage,
        languages: SUPPORTED_LANGUAGES
    };
}
