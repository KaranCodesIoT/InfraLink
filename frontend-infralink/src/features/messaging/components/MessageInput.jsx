import { useState, useRef } from 'react';
import { Send, Paperclip, Image, FileText, X, Loader2, Video } from 'lucide-react';

export default function MessageInput({ onSend, disabled, placeholder }) {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const fileRef = useRef(null);
    const inputRef = useRef(null);

    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed && attachments.length === 0) return;
        if (isSending) return;
        
        setIsSending(true);
        try {
            await onSend(trimmed, attachments);
            setText('');
            setAttachments([]);
            inputRef.current?.focus();
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const newAttachments = files.map((f) => ({
            file: f,
            name: f.name,
            type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'pdf',
            url: URL.createObjectURL(f),
            size: f.size,
        }));
        setAttachments((prev) => [...prev, ...newAttachments].slice(0, 10));
        setShowAttachMenu(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const removeAttachment = (idx) => {
        setAttachments((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
            {/* Attachment preview */}
            {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                    {attachments.map((att, i) => (
                        <div key={i} className="relative group">
                            {att.type === 'image' || att.type === 'video' ? (
                                att.type === 'image' ? (
                                    <img src={att.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                ) : (
                                    <div className="w-16 h-16 flex items-center justify-center rounded-lg border border-gray-200 bg-black">
                                        <Video className="w-6 h-6 text-white" />
                                    </div>
                                )
                            ) : (
                                <div className="w-16 h-16 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                                    <FileText className="w-6 h-6 text-red-400" />
                                </div>
                            )}
                            <button
                                onClick={() => removeAttachment(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Attach button */}
                <div className="relative">
                    <button
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        disabled={disabled}
                        className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-40"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    {showAttachMenu && (
                        <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[160px] z-20">
                            <button
                                onClick={() => {
                                    fileRef.current?.setAttribute('accept', 'image/*');
                                    fileRef.current?.click();
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Image className="w-4 h-4 text-green-500" /> Photo
                            </button>
                            <button
                                onClick={() => {
                                    fileRef.current?.setAttribute('accept', 'video/*');
                                    fileRef.current?.click();
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Video className="w-4 h-4 text-purple-500" /> Video
                            </button>
                            <button
                                onClick={() => {
                                    fileRef.current?.setAttribute('accept', '.pdf');
                                    fileRef.current?.click();
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <FileText className="w-4 h-4 text-red-500" /> Document
                            </button>
                        </div>
                    )}
                    <input ref={fileRef} type="file" onChange={handleFileSelect} className="hidden" multiple />
                </div>

                {/* Text input */}
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder || 'Type a message...'}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-400 transition-all max-h-32"
                    style={{ minHeight: '42px' }}
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={disabled || isSending || (!text.trim() && attachments.length === 0)}
                    className="p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}
