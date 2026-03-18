import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Briefcase, MapPin, IndianRupee, FileText, CheckCircle } from 'lucide-react';

export default function JobForm({ initialData = {}, onSubmit, isLoading }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    city: initialData.location?.city || '',
    state: initialData.location?.state || '',
    budget: initialData.budget || '',
    skillsRequired: initialData.skillsRequired?.join(', ') || '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      location: {
        city: formData.city,
        state: formData.state,
      },
      budget: formData.budget ? { min: Number(formData.budget) } : undefined,
      requiredSkills: formData.skillsRequired
        ? formData.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    onSubmit(payload);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{initialData.title ? 'Edit Job' : 'Post a New Job'}</h1>
          <p className="text-sm text-gray-500">Provide details to attract the right professionals.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500" /> Job Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Need experienced mason for wall construction"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Location */}
          <div>
             <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="State (e.g. Maharashtra)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" /> Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project, measurements, timeline, and any specific requirements..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-orange-500" /> Budget (Optional)
              </label>
              <input
                type="number"
                name="budget"
                min="0"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Total budget in ₹"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500" /> Required Skills *
              </label>
              <input
                type="text"
                name="skillsRequired"
                required
                value={formData.skillsRequired}
                onChange={handleChange}
                placeholder="e.g. Plumbing, Carpentry, RCC (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
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
