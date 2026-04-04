import { useState, useRef } from 'react';
import { X, ImagePlus, Loader2, Send } from 'lucide-react';
import usePostsStore from '../../../store/posts.store.js';
import useFeedStore from '../../../store/feed.store.js';
import useUIStore from '../../../store/ui.store.js';

export default function PostFormModal({ isOpen, onClose }) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);
  const { createPost, isLoading } = usePostsStore();
  const { toast } = useUIStore();

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Please write something before posting');

    const formData = new FormData();
    formData.append('content', content.trim());
    if (imageFile) formData.append('image', imageFile);

    try {
      await createPost(formData);
      useFeedStore.getState().refreshFeed(); // Refresh feed after posting
      toast.success('Post created successfully!');
      setContent('');
      removeImage();
      onClose();
    } catch {
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a project update, insight, or anything..."
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              autoFocus
            />
            <div className="text-right text-xs text-gray-400 mt-1">{content.length}/2000</div>

            {/* Image preview */}
            {imagePreview && (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-100">
                <img src={imagePreview} alt="preview" className="w-full max-h-60 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              <ImagePlus className="w-5 h-5" />
              <span>Add Image</span>
            </button>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-orange-200"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
