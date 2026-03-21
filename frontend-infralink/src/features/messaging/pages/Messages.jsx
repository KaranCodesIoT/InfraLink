import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMessagingStore from '../store/message.store.js';
import useAuthStore from '../../../store/auth.store.js';
import { useUIStore } from '../../../store/index.js';
import useChatSocket from '../hooks/useChatSocket.js';
import api from '../../../lib/axios.js';
import * as messageSvc from '../services/message.service.js';
import ConversationList from '../components/ConversationList.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import MessageRequestModal from '../components/MessageRequestModal.jsx';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useUIStore();
    const user = useAuthStore((s) => s.user);
    const {
        conversations,
        messageRequests,
        activeConversation,
        messages,
        isLoading,
        isLoadingMessages,
        activeTab,
        fetchConversations,
        fetchMessageRequests,
        fetchMessages,
        setActiveTab,
        setActiveConversation,
    } = useMessagingStore();

    // Setup socket connection
    useChatSocket();

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestRecipient, setRequestRecipient] = useState(null);
    const [isProcessingRoute, setIsProcessingRoute] = useState(false);

    // Load initial data
    useEffect(() => {
        if (user?._id) {
            fetchConversations();
            fetchMessageRequests();
        }
    }, [user?._id]);

    // Process URL parameter
    useEffect(() => {
        const processUrlParam = async () => {
             if (!id || !user?._id || isLoading) return;
             if (isProcessingRoute) return;

             // 1. Check if an existing loaded conversation matches this user ID
             const existingRef = [...conversations, ...messageRequests].find(c => 
                 c.participants?.some(p => {
                     const pid = p._id || p;
                     return pid.toString() === id.toString();
                 })
             );

             if (existingRef) {
                 if (!activeConversation || activeConversation._id !== existingRef._id) {
                     setActiveConversation(existingRef);
                     setActiveTab(existingRef.isRequest && !existingRef.isAccepted ? 'requests' : 'chats');
                 }
                 navigate('/messages', { replace: true });
                 return;
             }

             // 2. Try to get or create on the backend
             setIsProcessingRoute(true);
             try {
                 const { data } = await messageSvc.getOrCreateConversation({ recipientId: id });
                 await fetchConversations();
                 setActiveConversation(data.data);
                 navigate('/messages', { replace: true });
             } catch (err) {
                 // 3. Not connected (403), open the Message Request Modal
                 if (err.response?.status === 403 || err.response?.data?.message?.includes('connected')) {
                     try {
                         const { data } = await api.get(`/users/${id}`);
                         setRequestRecipient(data.data);
                         setShowRequestModal(true);
                     } catch (e) {
                         toast.error('Could not load user profile for messaging');
                         navigate('/messages', { replace: true });
                     }
                 } else {
                     toast.error(err.response?.data?.message || 'Failed to open conversation');
                     navigate('/messages', { replace: true });
                 }
             } finally {
                 setIsProcessingRoute(false);
             }
        };

        processUrlParam();
    }, [id, user?._id, isLoading, conversations.length, messageRequests.length]);

    // Load messages when conversation changes
    useEffect(() => {
        if (activeConversation?._id) {
            fetchMessages(activeConversation._id);
        }
    }, [activeConversation?._id]);

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
    };

    const handleSendRequest = async (payload) => {
        try {
            await useMessagingStore.getState().sendMessageRequest(payload);
            toast.success('Message request sent!');
            setShowRequestModal(false);
            await fetchMessageRequests();
            setActiveTab('requests');
            navigate('/messages', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex animate-in fade-in">
            {/* ─── Sidebar (Lists) ──────────────────────────────────────────────── */}
            <div
                className={`w-full md:w-[340px] lg:w-[380px] flex flex-col border-r border-gray-100 shrink-0 transition-all ${
                    activeConversation ? 'hidden md:flex' : 'flex'
                }`}
            >
                <ConversationList
                    conversations={conversations}
                    messageRequests={messageRequests}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    activeConversation={activeConversation}
                    onSelectConversation={handleSelectConversation}
                />
            </div>

            {/* ─── Main Content (Chat Window) ───────────────────────────────────── */}
            <div
                className={`flex-1 flex flex-col bg-gray-50/50 min-w-0 ${
                    !activeConversation ? 'hidden md:flex' : 'flex'
                }`}
            >
                {activeConversation ? (
                    <div className="h-full flex flex-col relative">
                        {/* Mobile back button header */}
                        <div className="md:hidden flex items-center px-4 py-3 bg-white border-b border-gray-100 shrink-0">
                            <button
                                onClick={() => setActiveConversation(null)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                            >
                                ← Back to list
                            </button>
                        </div>
                        {/* Chat Window */}
                        <div className="flex-1 overflow-hidden">
                            <ChatWindow
                                conversation={activeConversation}
                                messages={messages}
                                isLoading={isLoadingMessages}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600">Your Messages</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">
                            Select a conversation from the list or start a new message request.
                        </p>
                    </div>
                )}
            </div>

            {/* Message Request Modal */}
            {showRequestModal && requestRecipient && (
                <MessageRequestModal
                    recipient={requestRecipient}
                    onSend={handleSendRequest}
                    onClose={() => {
                        setShowRequestModal(false);
                        navigate('/messages', { replace: true });
                    }}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
