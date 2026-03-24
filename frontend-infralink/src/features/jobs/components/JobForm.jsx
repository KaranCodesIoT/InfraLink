import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, ArrowLeft, Briefcase, MapPin, IndianRupee,
  FileText, CheckCircle, Calendar, Phone, Mail, User, Tag,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'builder', label: 'Builder / Developer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'architect', label: 'Architect / Engineer' },
  { value: 'labour', label: 'Skilled Labour' },
  { value: 'supplier', label: 'Material Supplier' },
  { value: 'general', label: 'General / Other' },
];

export default function JobForm({ initialData = {}, onSubmit, isLoading }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || 'general',
    city: initialData.location?.city || '',
    state: initialData.location?.state || '',
    budgetMin: initialData.budget?.min || '',
    budgetMax: initialData.budget?.max || '',
    skillsRequired: initialData.requiredSkills?.join(', ') || '',
    deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
    contactName: initialData.contactDetails?.name || '',
    contactPhone: initialData.contactDetails?.phone || '',
    contactEmail: initialData.contactDetails?.email || '',
    isUrgent: initialData.isUrgent || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: {
        city: formData.city,
        state: formData.state,
      },
      budget: formData.budgetMin || formData.budgetMax
        ? {
            min: formData.budgetMin ? Number(formData.budgetMin) : null,
            max: formData.budgetMax ? Number(formData.budgetMax) : null,
          }
        : undefined,
      requiredSkills: formData.skillsRequired
        ? formData.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      deadline: formData.deadline || null,
      contactDetails: {
        name: formData.contactName || undefined,
        phone: formData.contactPhone || undefined,
        email: formData.contactEmail || undefined,
      },
      isUrgent: formData.isUrgent,
    };
    onSubmit(payload);
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors';
  const labelClass = 'flex items-center gap-2 text-sm font-bold text-gray-800 mb-2';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData.title ? 'Edit Job Posting' : 'Post a New Job'}
          </h1>
          <p className="text-sm text-gray-500">Fill in the details to attract the right professionals.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">

          {/* Title */}
          <div>
            <label className={labelClass}>
              <Briefcase className="w-4 h-4 text-orange-500" /> Job Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Need experienced mason for wall construction"
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>
              <Tag className="w-4 h-4 text-orange-500" /> Job Category *
            </label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputClass} required>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-4 h-4 text-orange-500" /> Location *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="City (e.g. Mumbai)"
                className={inputClass}
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State (e.g. Maharashtra)"
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              <FileText className="w-4 h-4 text-orange-500" /> Job Description *
            </label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project scope, measurements, timeline, and specific requirements..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Budget */}
          <div>
            <label className={labelClass}>
              <IndianRupee className="w-4 h-4 text-orange-500" /> Budget (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="budgetMin"
                min="0"
                value={formData.budgetMin}
                onChange={handleChange}
                placeholder="Min Budget (₹)"
                className={inputClass}
              />
              <input
                type="number"
                name="budgetMax"
                min="0"
                value={formData.budgetMax}
                onChange={handleChange}
                placeholder="Max Budget (₹)"
                className={inputClass}
              />
            </div>
          </div>

          {/* Required Skills + Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>
                <CheckCircle className="w-4 h-4 text-orange-500" /> Required Skills
              </label>
              <input
                type="text"
                name="skillsRequired"
                value={formData.skillsRequired}
                onChange={handleChange}
                placeholder="e.g. Plumbing, Carpentry (comma-separated)"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Calendar className="w-4 h-4 text-orange-500" /> Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Contact Details (visible to applicants)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Contact Name"
                className={inputClass}
              />
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Urgent */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <input
              type="checkbox"
              id="isUrgent"
              name="isUrgent"
              checked={formData.isUrgent}
              onChange={handleChange}
              className="w-4 h-4 accent-orange-600 cursor-pointer"
            />
            <label htmlFor="isUrgent" className="text-sm font-semibold text-orange-700 cursor-pointer">
              Mark as Urgent — this job needs to be filled quickly
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-orange-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData.title ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
