import { Check, CheckCheck, FileText, MapPin } from 'lucide-react';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';

const STATUS_ICONS = {
    sent: <Check className="w-3.5 h-3.5 text-gray-400" />,
    delivered: <CheckCheck className="w-3.5 h-3.5 text-gray-400" />,
    seen: <CheckCheck className="w-3.5 h-3.5 text-blue-500" />,
};

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

export default function MessageBubble({ message, isMine }) {
    return (
        <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[75%]`}>
                <div
                    className={`px-4 py-2.5 shadow-sm ${
                        isMine
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
                    }`}
                >
                    {message.text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    )}
                    {message.attachments?.map((att, i) => (
                        <AttachmentItem key={i} attachment={att} isMine={isMine} />
                    ))}
                </div>
                {/* Timestamp + Status */}
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] text-gray-400">{formatTime(message.createdAt)}</span>
                    {isMine && STATUS_ICONS[message.status]}
                </div>
            </div>
        </div>
    );
}
