import React, { useState } from 'react';
import useBuilderStore from '../store/useBuilderStore.js';
import { Loader2, Plus, Trash2, MapPin } from 'lucide-react';
import AddProjectModal from './AddProjectModal.jsx';

export default function Step3Professional() {
  const { formData, setFormData, submitStep3, prevStep, isLoading, error } = useBuilderStore();
  const [validationErrors, setValidationErrors] = useState({});
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const handleServicesChange = (e) => {
    const value = e.target.value;
    const services = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ servicesOffered: services });
  };

  const validate = () => {
    const errors = {};
    if (formData.servicesOffered.length === 0) errors.servicesOffered = "List at least one service provided.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) submitStep3();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 3: Professional Details</h2>
        <p className="text-sm text-gray-500 mt-1">Showcase your expertise and past projects.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Services Offered</label>
            <input
              type="text"
              value={formData.servicesOffered.join(', ')}
              onChange={handleServicesChange}
              className={`mt-1 block w-full rounded-md outline-none focus:ring-2 p-2 border shadow-sm sm:text-sm ${validationErrors.servicesOffered ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
              placeholder="e.g. Residential Construction, Plumbing, Electrical"
            />
            {validationErrors.servicesOffered && <p className="mt-1 text-xs text-red-500">{validationErrors.servicesOffered}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pricing Model</label>
            <select
              value={formData.pricingModel}
              onChange={(e) => setFormData({ pricingModel: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm"
            >
              <option value="fixed">Fixed Price per Project</option>
              <option value="per sq ft">Per Sq Ft</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Team Size (Approximate)</label>
            <input
              type="number"
              min="1"
              value={formData.teamSize}
              onChange={(e) => setFormData({ teamSize: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center rounded-md border border-transparent bg-green-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Complete Profile'}
        </button>
      </div>
    </form>
  );
}
