import { useState, useRef, useCallback, useEffect } from 'react';
import { Check, CheckCheck, FileText, MapPin, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';

const STATUS_ICONS = {
    sent: <Check className="w-3.5 h-3.5 text-gray-400" />,
    delivered: <CheckCheck className="w-3.5 h-3.5 text-gray-400" />,
    seen: <CheckCheck className="w-3.5 h-3.5 text-blue-500" />,
};

// ─── TTS Languages (using Google Translate TTS codes) ────────────────────────
const TTS_LANGUAGES = [
    { code: 'en-IN', gtts: 'en', label: 'English' },
    { code: 'hi-IN', gtts: 'hi', label: 'हिन्दी' },
    { code: 'mr-IN', gtts: 'mr', label: 'मराठी' },
    { code: 'gu-IN', gtts: 'gu', label: 'ગુજરાતી' },
    { code: 'pa-IN', gtts: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'hi-IN', gtts: 'hi', label: 'भोजपुरी', id: 'bho' },
    { code: 'ta-IN', gtts: 'ta', label: 'தமிழ்' },
    { code: 'bn-IN', gtts: 'bn', label: 'বাংলা' },
    { code: 'kn-IN', gtts: 'kn', label: 'ಕನ್ನಡ' },
];

const TTS_STORAGE_KEY = 'infralink_tts_lang';

function getSavedTTSLang() {
    try {
        const saved = localStorage.getItem(TTS_STORAGE_KEY);
        if (saved) {
            const found = TTS_LANGUAGES.find(l => (l.id || l.code) === saved);
            if (found) return found;
        }
    } catch {}
    return TTS_LANGUAGES[0];
}

function saveTTSLang(lang) {
    try {
        localStorage.setItem(TTS_STORAGE_KEY, lang.id || lang.code);
    } catch {}
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── TTS Speaker Button ─────────────────────────────────────────────────────
function TTSButton({ text, isMine }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [selectedLang, setSelectedLang] = useState(getSavedTTSLang);
    const menuRef = useRef(null);
    const audioRef = useRef(null);
    const abortRef = useRef(false);

    // Build Google Translate TTS URL for a text chunk
    const buildTTSUrl = (chunk, langCode) => {
        const encoded = encodeURIComponent(chunk);
        return `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${langCode}&q=${encoded}`;
    };

    // Split text into chunks of ~190 chars at word boundaries
    const splitText = (str) => {
        const MAX = 190;
        if (str.length <= MAX) return [str];
        const chunks = [];
        let remaining = str;
        while (remaining.length > 0) {
            if (remaining.length <= MAX) {
                chunks.push(remaining);
                break;
            }
            let cutAt = remaining.lastIndexOf(' ', MAX);
            if (cutAt <= 0) cutAt = MAX;
            chunks.push(remaining.substring(0, cutAt).trim());
            remaining = remaining.substring(cutAt).trim();
        }
        return chunks;
    };

    const speak = useCallback(async () => {
        if (!text) return;

        // If already speaking, stop
        if (isSpeaking) {
            abortRef.current = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsSpeaking(false);
            return;
        }

        abortRef.current = false;
        setIsSpeaking(true);

        const langCode = selectedLang.gtts || 'en';
        const chunks = splitText(text);

        try {
            for (const chunk of chunks) {
                if (abortRef.current) break;

                // Hit our local backend proxy instead of Google directly! (Port fixed to 5001)
                const encoded = encodeURIComponent(chunk);
                const url = `http://localhost:5001/api/v1/ai/voice/tts-proxy?tl=${langCode}&q=${encoded}`;
                
                const audio = new Audio(url);
                audioRef.current = audio;

                await new Promise((resolve, reject) => {
                    audio.onended = resolve;
                    audio.onerror = () => {
                        console.warn('Backend proxy TTS failed for chunk, skipping');
                        resolve(); // skip failed chunk, continue
                    };
                    audio.play().catch(reject);
                });
            }
        } catch (err) {
            console.warn('TTS playback error:', err);
        } finally {
            audioRef.current = null;
            setIsSpeaking(false);
        }
    }, [text, selectedLang, isSpeaking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortRef.current = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleLangSelect = (lang) => {
        setSelectedLang(lang);
        saveTTSLang(lang);
        setShowLangMenu(false);
    };

    return (
        <div className="relative inline-flex items-center" ref={menuRef}>
            {/* Language picker (small) */}
            <button
                onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu); }}
                className={`text-[9px] font-medium px-1 py-0.5 rounded transition-colors ${
                    isMine
                        ? 'text-white/60 hover:text-white/90 hover:bg-white/10'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Change TTS language"
            >
                <ChevronDown className="w-2.5 h-2.5 inline" />
            </button>

            {/* Speaker button */}
            <button
                onClick={speak}
                className={`p-0.5 rounded transition-all ${
                    isSpeaking
                        ? (isMine ? 'text-white animate-pulse' : 'text-orange-500 animate-pulse')
                        : (isMine ? 'text-white/50 hover:text-white/90' : 'text-gray-300 hover:text-gray-500')
                }`}
                title={isSpeaking ? 'Stop speaking' : `Listen (${selectedLang.label})`}
            >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Language dropdown */}
            {showLangMenu && (
                <div
                    className={`absolute z-30 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[140px] ${
                        isMine ? 'right-0 bottom-6' : 'left-0 bottom-6'
                    } animate-in fade-in slide-in-from-bottom-2`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-2.5 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Listen in
                    </div>
                    {TTS_LANGUAGES.map((lang) => (
                        <button
                            key={lang.id || lang.code}
                            onClick={() => handleLangSelect(lang)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors ${
                                (selectedLang.id || selectedLang.code) === (lang.id || lang.code)
                                    ? 'bg-orange-50 text-orange-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>{lang.label}</span>
                            {(selectedLang.id || selectedLang.code) === (lang.id || lang.code) && (
                                <span className="ml-auto text-orange-500 text-[10px]">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Attachment Renderers ────────────────────────────────────────────────────
function AttachmentItem({ attachment, isMine }) {
    if (attachment.type === 'image') {
        return (
            <a href={resolveAvatarUrl(attachment.url)} target="_blank" rel="noreferrer" className="block mt-1.5">
                <img
                    src={resolveAvatarUrl(attachment.url)}
                    alt={attachment.name || 'Image'}
                    className="max-w-[240px] rounded-lg hover:opacity-90 transition-opacity"
                />
            </a>
        );
    }
    if (attachment.type === 'video') {
        return (
            <div className="mt-1.5 max-w-[280px] rounded-lg overflow-hidden bg-black">
                <video src={resolveAvatarUrl(attachment.url)} controls preload="metadata" className="w-full h-auto object-cover max-h-[300px]" />
            </div>
        );
    }
    if (attachment.type === 'pdf') {
        return (
            <a
                href={resolveAvatarUrl(attachment.url)}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    isMine 
                        ? 'bg-white/20 border-white/30 hover:bg-white/30 text-white'
                        : 'bg-white/80 border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
            >
                <FileText className={`w-4 h-4 shrink-0 ${isMine ? 'text-white' : 'text-red-500'}`} />
                <span className="truncate">{attachment.name || 'Document.pdf'}</span>
            </a>
        );
    }
    if (attachment.type === 'location') {
        return (
            <div className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg border text-sm ${
                isMine ? 'bg-white/20 border-white/30 text-white' : 'bg-white/80 border-gray-200 text-gray-700'
            }`}>
                <MapPin className={`w-4 h-4 shrink-0 ${isMine ? 'text-white' : 'text-orange-500'}`} />
                <span>{attachment.name || 'Shared location'}</span>
            </div>
        );
    }
    return null;
}

// ─── Message Bubble ──────────────────────────────────────────────────────────
export default function MessageBubble({ message, isMine, debugData }) {
    const hasText = message.text && message.text.trim().length > 0;

    return (
        <div className={`w-full`}>
            <div
                className={`px-4 py-2.5 shadow-sm ${
                    isMine
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                }`}
            >
                    {hasText && (
                        <div className="flex items-start gap-1.5">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words flex-1">{message.text}</p>
                            <TTSButton text={message.text} isMine={isMine} />
                        </div>
                    )}
                    {message.attachments?.map((att, i) => (
                        <AttachmentItem key={i} attachment={att} isMine={isMine} />
                    ))}
                </div>
                {/* Timestamp + Status */}
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] text-gray-400">{formatTime(message.createdAt)}</span>
                    <span className="text-[9px] text-red-500 opacity-50">{debugData} e:{isMine.toString()}</span>
                    {isMine && STATUS_ICONS[message.status]}
                </div>
        </div>
    );
}
