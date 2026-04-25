import React, { useState, useRef, useEffect } from 'react';
import { User, Bot, Volume2, Square } from 'lucide-react';

/**
 * Renders inline markdown (bold, lists, code) for bot messages
 */
function renderMarkdown(text) {
    if (!text) return null;

    // Split by newlines to handle lists
    const lines = text.split('\n');
    const elements = [];
    let inList = false;
    let listItems = [];

    lines.forEach((line, i) => {
        const trimmed = line.trim();

        // Numbered list item
        if (/^\d+\.\s/.test(trimmed)) {
            if (!inList) { inList = true; listItems = []; }
            listItems.push(trimmed.replace(/^\d+\.\s/, ''));
            return;
        }

        // Bullet list item
        if (/^[-*•]\s/.test(trimmed)) {
            if (!inList) { inList = true; listItems = []; }
            listItems.push(trimmed.replace(/^[-*•]\s/, ''));
            return;
        }

        // End of list
        if (inList && listItems.length > 0) {
            elements.push(
                <ul key={`list-${i}`} style={{ paddingLeft: 18, margin: '6px 0' }}>
                    {listItems.map((item, j) => (
                        <li key={j} style={{ margin: '3px 0' }}>{formatInline(item)}</li>
                    ))}
                </ul>
            );
            inList = false;
            listItems = [];
        }

        if (trimmed === '') {
            elements.push(<br key={`br-${i}`} />);
        } else {
            elements.push(<p key={`p-${i}`} style={{ margin: '3px 0' }}>{formatInline(trimmed)}</p>);
        }
    });

    // Flush remaining list
    if (inList && listItems.length > 0) {
        elements.push(
            <ul key="list-end" style={{ paddingLeft: 18, margin: '6px 0' }}>
                {listItems.map((item, j) => (
                    <li key={j} style={{ margin: '3px 0' }}>{formatInline(item)}</li>
                ))}
            </ul>
        );
    }

    return elements;
}

/**
 * Format inline markdown: **bold**, `code`, *italic*
 */
function formatInline(text) {
    if (!text) return text;

    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Bold
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        // Code
        const codeMatch = remaining.match(/`(.+?)`/);
        // Italic
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

        // Find earliest match
        const matches = [
            boldMatch && { type: 'bold', match: boldMatch },
            codeMatch && { type: 'code', match: codeMatch },
            italicMatch && { type: 'italic', match: italicMatch }
        ].filter(Boolean).sort((a, b) => a.match.index - b.match.index);

        if (matches.length === 0) {
            parts.push(remaining);
            break;
        }

        const first = matches[0];
        const idx = first.match.index;

        if (idx > 0) {
            parts.push(remaining.slice(0, idx));
        }

        if (first.type === 'bold') {
            parts.push(<strong key={key++} style={{ color: '#a5b4fc', fontWeight: 600 }}>{first.match[1]}</strong>);
        } else if (first.type === 'code') {
            parts.push(
                <code key={key++} style={{ background: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                    {first.match[1]}
                </code>
            );
        } else if (first.type === 'italic') {
            parts.push(<em key={key++}>{first.match[1]}</em>);
        }

        remaining = remaining.slice(idx + first.match[0].length);
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

export default function MessageBubble({ message, language = 'en-IN' }) {
    const isUser = message.role === 'user';
    const isError = message.isError;
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const timeStr = message.timestamp
        ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const togglePlayback = () => {
        if (isPlaying) {
            // Stop playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
        } else {
            // Start playing
            const cleanText = message.text
                .replace(/[*#_\[\]`]/g, '')
                .replace(/\n+/g, '. ')
                .slice(0, 200);

            const langShort = language.split('-')[0]; // en, hi, mr
            const baseUrl = import.meta.env.VITE_API_URL || 'https://infralink-production.up.railway.app/api/v1';
            const url = `${baseUrl}/ai/voice/tts-proxy?tl=${langShort}&q=${encodeURIComponent(cleanText)}`;

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(url);
            audioRef.current = audio;
            setIsPlaying(true);

            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => setIsPlaying(false);
            audio.play().catch(e => {
                console.warn('Playback failed:', e);
                setIsPlaying(false);
            });
        }
    };

    return (
        <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
            <div className="message-wrapper">
                <div className={`message-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="message-content">
                    <div className={`message-bubble ${isUser ? 'user-bubble' : isError ? 'error-bubble' : 'bot-bubble'}`}>
                        {isUser ? message.text : renderMarkdown(message.text)}
                    </div>
                    
                    {/* Timestamp & Voice toggle for bot messages */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isUser ? 'flex-end' : 'space-between', marginTop: 4 }}>
                        {!isUser && !isError && (
                            <button 
                                onClick={togglePlayback}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: isPlaying ? '#ea580c' : '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: 0
                                }}
                                title={isPlaying ? "Stop playing" : "Read aloud (English, Hindi, Marathi)"}
                            >
                                {isPlaying ? <Square size={12} fill="currentColor" /> : <Volume2 size={12} />}
                                {isPlaying ? 'STOP' : 'LISTEN'}
                            </button>
                        )}
                        {timeStr && <span className="message-time">{timeStr}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
