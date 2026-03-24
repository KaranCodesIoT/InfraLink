import { useState } from 'react';
import { X, Loader2, Send, Phone, Mail, MessageSquare } from 'lucide-react';
import useJobStore from '../../../store/job.store.js';
import useUIStore from '../../../store/ui.store.js';

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { applyToJob, isSubmitting } = useJobStore();
  const { toast } = useUIStore();
  const [form, setForm] = useState({
    message: '',
    proposedRate: '',
    contactPhone: '',
    contactEmail: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyToJob(job._id, {
        message: form.message,
        proposedRate: form.proposedRate ? Number(form.proposedRate) : undefined,
        contactDetails: {
          phone: form.contactPhone || undefined,
          email: form.contactEmail || undefined,
        },
      });
      toast.success('Application submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes('duplicate')) {
        toast.error('You have already applied to this job.');
      } else {
        toast.error(err.response?.data?.error?.message || 'Failed to submit application');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply for this Job</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Message */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              Proposal / Message <span className="text-orange-500">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your experience, why you're a great fit, and your approach to this project..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Proposed Rate */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Your Rate / Bid (₹) <span className="text-gray-400 font-normal">— Optional</span>
            </label>
            <input
              type="number"
              name="proposedRate"
              min="0"
              value={form.proposedRate}
              onChange={handleChange}
              placeholder="e.g. 25000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                <Phone className="w-4 h-4 text-orange-500" />
                Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                <Mail className="w-4 h-4 text-orange-500" />
                Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
