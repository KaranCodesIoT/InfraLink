import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, ChevronDown, AlertCircle } from 'lucide-react';

// ─── Supported Languages ────────────────────────────────────────────────────
const LANGUAGES = [
    { code: 'en-IN', label: 'English', flag: '🇬🇧' },
    { code: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr-IN', label: 'मराठी', flag: '🇮🇳' },
    { code: 'gu-IN', label: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa-IN', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'hi-IN', label: 'भोजपुरी', flag: '🇮🇳', id: 'bho' },  // fallback to Hindi
    { code: 'ta-IN', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'bn-IN', label: 'বাংলা', flag: '🇮🇳' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

const STORAGE_KEY = 'infralink_voice_lang';

// ─── Get saved language or default ──────────────────────────────────────────
function getSavedLang() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const found = LANGUAGES.find(l => (l.id || l.code) === saved);
            if (found) return found;
        }
    } catch {}
    return LANGUAGES[0]; // English default
}

function saveLang(lang) {
    try {
        localStorage.setItem(STORAGE_KEY, lang.id || lang.code);
    } catch {}
}

// ─── Check browser support ──────────────────────────────────────────────────
const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function VoiceRecorder({ onTranscript, disabled, onRecordingStart }) {
    const [isSupported] = useState(!!SpeechRecognition);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedLang, setSelectedLang] = useState(getSavedLang);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState('');

    const recognitionRef = useRef(null);
    const timerRef = useRef(null);
    const langMenuRef = useRef(null);

    // Close language menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = useCallback(() => {
        if (!isSupported || disabled) return;
        setError('');
        setTranscript('');
        setElapsed(0);

        const recognition = new SpeechRecognition();
        recognition.lang = selectedLang.code;
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript + ' ';
                } else {
                    interimText += result[0].transcript;
                }
            }
            setTranscript(finalText + interimText);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                setError('No speech detected. Try again.');
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow mic permission.');
            } else {
                setError(`Error: ${event.error}`);
            }
            stopRecording();
        };

        recognition.onend = () => {
            // Auto-restart if still supposed to be recording (handles Chrome's ~60s cutoff)
            if (recognitionRef.current && isRecording) {
                try { recognition.start(); } catch {}
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
            setIsRecording(true);
            if (onRecordingStart) onRecordingStart();

            // Start timer
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 200);
        } catch (err) {
            setError('Could not start recording. Check microphone permissions.');
        }
    }, [isSupported, disabled, selectedLang, isRecording, onRecordingStart]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
            recognitionRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const handleStop = useCallback(() => {
        stopRecording();
        // Send final transcript to parent
        if (transcript.trim()) {
            onTranscript(transcript.trim());
        }
        setTranscript('');
        setElapsed(0);
    }, [stopRecording, transcript, onTranscript]);

    const handleCancel = useCallback(() => {
        stopRecording();
        setTranscript('');
        setElapsed(0);
        setError('');
    }, [stopRecording]);

    const handleLangSelect = (lang) => {
        setSelectedLang(lang);
        saveLang(lang);
        setShowLangMenu(false);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ─── Unsupported browser fallback ───────────────────────────────────────
    if (!isSupported) {
        return (
            <button
                disabled
                title="Voice input is not supported in this browser. Use Chrome or Edge."
                className="p-2.5 text-gray-300 cursor-not-allowed rounded-xl"
            >
                <MicOff className="w-5 h-5" />
            </button>
        );
    }

    // ─── Recording Active State ─────────────────────────────────────────────
    if (isRecording) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl animate-in fade-in w-full">
                {/* Pulse indicator */}
                <div className="relative flex items-center justify-center shrink-0">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute w-5 h-5 bg-red-400/30 rounded-full animate-ping" />
                </div>

                {/* Language badge */}
                <span className="text-[11px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-md shrink-0">
                    {selectedLang.label}
                </span>

                {/* Live waveform bars */}
                <div className="flex items-center gap-[2px] h-6 flex-1 justify-center overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-[3px] bg-red-400 rounded-full"
                            style={{
                                height: `${Math.random() * 100}%`,
                                minHeight: '4px',
                                animation: `waveBar 0.4s ease-in-out ${i * 0.05}s infinite alternate`,
                            }}
                        />
                    ))}
                </div>

                {/* Timer */}
                <span className="text-xs font-mono text-red-600 font-bold shrink-0 tabular-nums">
                    {formatTime(elapsed)}
                </span>

                {/* Stop button */}
                <button
                    onClick={handleStop}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shrink-0 shadow-sm"
                    title="Stop & send"
                >
                    <Square className="w-4 h-4 fill-current" />
                </button>

                {/* Cancel */}
                <button
                    onClick={handleCancel}
                    className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                    Cancel
                </button>

                {/* Waveform animation keyframes */}
                <style>{`
                    @keyframes waveBar {
                        0% { height: 15%; }
                        100% { height: ${60 + Math.random() * 40}%; }
                    }
                `}</style>
            </div>
        );
    }

    // ─── Default State (Mic + Language Selector) ────────────────────────────
    return (
        <div className="flex items-center gap-1 shrink-0 relative" ref={langMenuRef}>
            {/* Error tooltip */}
            {error && (
                <div className="absolute bottom-12 right-0 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg shadow-lg max-w-[220px] z-30 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Language selector */}
            <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                disabled={disabled}
                className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-40"
                title="Select voice language"
            >
                <span>{selectedLang.flag}</span>
                <ChevronDown className="w-3 h-3" />
            </button>

            {/* Language dropdown */}
            {showLangMenu && (
                <div className="absolute bottom-10 right-0 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[170px] z-30 animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Voice Language
                    </div>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.id || lang.code}
                            onClick={() => handleLangSelect(lang)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                                (selectedLang.id || selectedLang.code) === (lang.id || lang.code)
                                    ? 'bg-orange-50 text-orange-700 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {(selectedLang.id || selectedLang.code) === (lang.id || lang.code) && (
                                <span className="ml-auto text-orange-500">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Mic button */}
            <button
                onClick={startRecording}
                disabled={disabled}
                className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-40"
                title={`Voice input (${selectedLang.label})`}
            >
                <Mic className="w-5 h-5" />
            </button>
        </div>
    );
}
