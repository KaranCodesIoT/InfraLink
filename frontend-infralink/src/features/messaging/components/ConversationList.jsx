import { MessageSquare, Inbox, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../../store/auth.store.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';

function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const ROLE_COLORS = {
    builder: 'bg-blue-100 text-blue-700',
    contractor: 'bg-purple-100 text-purple-700',
    labour: 'bg-green-100 text-green-700',
    architect: 'bg-amber-100 text-amber-700',
    normal_user: 'bg-gray-100 text-gray-600',
    admin: 'bg-red-100 text-red-700',
};

function ConversationItem({ conversation, isActive, onClick, currentUserId }) {
    const otherUser = conversation.participants?.find((p) => p._id !== currentUserId) || {};
    const lastMsg = conversation.lastMessage;
    const roleClass = ROLE_COLORS[otherUser.role] || 'bg-gray-100 text-gray-600';

    return (
        <button
            onClick={() => onClick(conversation)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-orange-50/60 ${
                isActive ? 'bg-orange-50 border-l-3 border-orange-500' : 'border-l-3 border-transparent'
            }`}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {otherUser.avatar ? (
                        <img src={resolveAvatarUrl(otherUser.avatar)} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        otherUser.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                </div>
                {otherUser.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{otherUser.name || 'User'}</h4>
                    <span className="text-[11px] text-gray-400 shrink-0">
                        {formatTimeAgo(lastMsg?.createdAt || conversation.updatedAt)}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleClass} capitalize`}>
                        {otherUser.role?.replace('_', ' ') || 'User'}
                    </span>
                </div>
                {lastMsg && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                        {lastMsg.text || (lastMsg.attachments?.length ? '📎 Attachment' : '')}
                    </p>
                )}
            </div>
        </button>
    );
}

export default function ConversationList({
    conversations,
    messageRequests,
    activeTab,
    onTabChange,
    activeConversation,
    onSelectConversation,
}) {
    const currentUser = useAuthStore((s) => s.user);

    return (
        <div className="flex flex-col h-full">
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-100 shrink-0">
                <button
                    onClick={() => onTabChange('chats')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === 'chats'
                            ? 'text-orange-600 border-orange-500 bg-orange-50/30'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    Chats
                    {conversations.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-full font-bold">
                            {conversations.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('requests')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === 'requests'
                            ? 'text-orange-600 border-orange-500 bg-orange-50/30'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                >
                    <Inbox className="w-4 h-4" />
                    Requests
                    {messageRequests.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-bold">
                            {messageRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'chats' && (
                    <>
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                                <p className="text-sm">No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <ConversationItem
                                    key={conv._id}
                                    conversation={conv}
                                    isActive={activeConversation?._id === conv._id}
                                    onClick={onSelectConversation}
                                    currentUserId={currentUser?._id}
                                />
                            ))
                        )}
                    </>
                )}

                {activeTab === 'requests' && (
                    <>
                        {messageRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <Inbox className="w-10 h-10 mb-2 opacity-40" />
                                <p className="text-sm">No message requests</p>
                            </div>
                        ) : (
                            messageRequests.map((conv) => (
                                <ConversationItem
                                    key={conv._id}
                                    conversation={conv}
                                    isActive={activeConversation?._id === conv._id}
                                    onClick={onSelectConversation}
                                    currentUserId={currentUser?._id}
                                />
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
