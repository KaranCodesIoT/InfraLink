import { useEffect, useRef } from 'react';
import {
    ShieldCheck, MapPin, DollarSign, Briefcase, Check, X,
    MoreVertical, Ban, UserMinus
} from 'lucide-react';
import { useState } from 'react';
import MessageBubble from './MessageBubble.jsx';
import MessageInput from './MessageInput.jsx';
import useAuthStore from '../../../store/auth.store.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';
import useMessagingStore from '../store/message.store.js';

const ROLE_COLORS = {
    builder: 'bg-blue-100 text-blue-700',
    contractor: 'bg-purple-100 text-purple-700',
    labour: 'bg-green-100 text-green-700',
    architect: 'bg-amber-100 text-amber-700',
    normal_user: 'bg-gray-100 text-gray-600',
};

const INTENT_LABELS = {
    hire_now: { label: 'Hire Now', icon: Briefcase, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    request_quote: { label: 'Request Quote', icon: DollarSign, color: 'text-green-600 bg-green-50 border-green-200' },
};

// Helper to extract sender ID string from any format
function getSenderId(sender) {
    if (!sender) return '';
    if (typeof sender === 'string') return sender;
    if (sender._id) return String(sender._id);
    if (sender.id) return String(sender.id);
    return String(sender);
}

export default function ChatWindow({ conversation, messages, isLoading }) {
    const currentUser = useAuthStore((s) => s.user);
    const { sendMessage, acceptRequest, rejectRequest, markSeen } = useMessagingStore();
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const currentUserId = currentUser ? String(currentUser._id || currentUser.id) : '';
    const otherUser = conversation?.participants?.find((p) => String(p._id || p.id) !== currentUserId) || {};
    const isRequest = conversation?.isRequest && !conversation?.isAccepted;
    const isAccepted = !conversation?.isRequest || conversation?.isAccepted;
    const roleClass = ROLE_COLORS[otherUser.role] || 'bg-gray-100 text-gray-600';
    const projectCtx = conversation?.projectContext;
    const hasProjectCtx = projectCtx?.name || projectCtx?.budget || projectCtx?.location;
    const intentInfo = conversation?.workIntent ? INTENT_LABELS[conversation.workIntent] : null;

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Mark seen on open
    useEffect(() => {
        if (conversation?._id && isAccepted) {
            markSeen(conversation._id);
        }
    }, [conversation?._id]);

    const handleSend = (text, attachments) => {
        const formattedAttachments = attachments
            .filter((a) => a.url)
            .map((a) => ({ url: a.url, type: a.type, name: a.name, size: a.size }));
        return sendMessage(conversation._id, text, formattedAttachments);
    };

    if (!conversation) return null;

    // Determine if current user is the message request recipient (can accept/reject)
    const firstMsg = messages[0];
    const isRecipient = firstMsg && getSenderId(firstMsg.sender) !== currentUserId;

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* ─── Header ────────────────────────────────────────────────────────── */}
            <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {otherUser.avatar ? (
                                    <img src={resolveAvatarUrl(otherUser.avatar)} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    otherUser.name?.charAt(0)?.toUpperCase() || '?'
                                )}
                            </div>
                            {otherUser.isVerified && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900">{otherUser.name || 'User'}</h3>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleClass} capitalize`}>
                                    {otherUser.role?.replace('_', ' ')}
                                </span>
                            </div>
                            {isRequest && (
                                <span className="text-[11px] text-amber-600 font-medium">Message Request</span>
                            )}
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] z-20">
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <UserMinus className="w-4 h-4" /> Remove Connection
                                </button>
                                <button
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Ban className="w-4 h-4" /> Block User
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Context Card */}
                {hasProjectCtx && (
                    <div className="mt-3 flex items-center gap-3 px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/60">
                        {projectCtx.name && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-700">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span className="font-medium">{projectCtx.name}</span>
                            </div>
                        )}
                        {projectCtx.budget && (
                            <div className="flex items-center gap-1 text-xs text-green-700">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{projectCtx.budget}</span>
                            </div>
                        )}
                        {projectCtx.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{projectCtx.location}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Work Intent Badge */}
                {intentInfo && (
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${intentInfo.color}`}>
                        <intentInfo.icon className="w-3.5 h-3.5" />
                        {intentInfo.label}
                    </div>
                )}
            </div>

            {/* ─── Messages Area ──────────────────────────────────────────────────── */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto chat-container">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const rawSender = msg.sender || msg.senderId;
                            let senderIdStr = '';
                            if (rawSender) {
                                if (typeof rawSender === 'string') senderIdStr = rawSender;
                                else if (rawSender._id) senderIdStr = String(rawSender._id);
                                else if (rawSender.id) senderIdStr = String(rawSender.id);
                                else senderIdStr = String(rawSender);
                            }
                            
                            const myIdStr = currentUserId || 'null';
                            const isMine = Boolean(senderIdStr && myIdStr && myIdStr !== 'null' && senderIdStr.toString() === myIdStr.toString());
                            
                            return (
                                <div 
                                    key={msg._id || msg.createdAt} 
                                    className={`chat-bubble-wrapper ${isMine ? 'sent' : 'received'}`} 
                                >
                                    <MessageBubble
                                        message={msg}
                                        isMine={isMine}
                                    />
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* ─── Accept / Reject Bar ────────────────────────────────────────────── */}
            {isRequest && isRecipient && (
                <div className="shrink-0 border-t border-gray-100 bg-amber-50/60 px-5 py-3">
                    <p className="text-xs text-amber-700 mb-2 font-medium text-center">
                        {otherUser.name} wants to connect with you
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => acceptRequest(conversation._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm"
                        >
                            <Check className="w-4 h-4" /> Accept
                        </button>
                        <button
                            onClick={() => rejectRequest(conversation._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                        >
                            <X className="w-4 h-4" /> Reject
                        </button>
                    </div>
                </div>
            )}

            {/* Request Sent indicator (for sender) */}
            {isRequest && !isRecipient && (
                <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-4 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        ⏳ Message request sent. Waiting for acceptance...
                    </p>
                </div>
            )}

            {/* ─── Input ─────────────────────────────────────────────────────────── */}
            {isAccepted && (
                <MessageInput onSend={handleSend} />
            )}
        </div>
    );
}
