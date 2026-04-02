import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Loader2, User } from 'lucide-react';
import api from '../../../lib/axios.js';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommentsModal({ project, onClose, onCommentAdded }) {
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/builder-projects/${project._id}/comments`);
        setComments(data.data || []);
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  // Scroll to bottom when comments load
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [loading, comments.length]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in to comment'); return; }
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      const { data } = await api.post(`/builder-projects/${project._id}/comments`, { text: trimmed });
      const newComment = data.data;
      setComments((prev) => [...prev, newComment]);
      setText('');
      onCommentAdded?.();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
           style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900 text-base">{project.projectName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ minHeight: 0 }}>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium text-sm">No comments yet</p>
              <p className="text-gray-400 text-xs mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((c, i) => {
              const name = c.user?.name || 'User';
              const initials = name.slice(0, 2).toUpperCase();
              return (
                <div key={c._id || i} className="flex gap-3">
                  {c.user?.avatar ? (
                    <img
                      src={c.user.avatar}
                      alt={name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm truncate">{name}</span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed break-words">{c.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.name?.slice(0, 2).toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                  placeholder="Write a comment..."
                  rows={1}
                  maxLength={500}
                  className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-colors"
                  style={{ lineHeight: '1.5' }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="flex-shrink-0 p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-gray-400 py-2">
              <span className="text-orange-500 font-medium cursor-pointer hover:underline"
                    onClick={() => window.location.href = '/login'}>Log in</span> to join the conversation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
