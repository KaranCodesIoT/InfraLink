import React, { useState } from 'react';
import useBuilderStore from '../store/useBuilderStore.js';
import { Loader2 } from 'lucide-react';

export default function Step1Basic() {
  const { formData, setFormData, submitStep1, isLoading, error } = useBuilderStore();
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  const handleServicesChange = (e) => {
    const value = e.target.value;
    const areas = value.split(',').map(a => a.trim()).filter(Boolean);
    setFormData({ serviceAreas: areas });
  };

  const validate = () => {
    const errors = {};
    if (!formData.officeAddress) errors.officeAddress = "Office address is required";
    if (formData.serviceAreas.length === 0) errors.serviceAreas = "At least one service area is required. Comma separated.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) submitStep1();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 1: Basic Information</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us about your organization and services.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Type</label>
          <select
            value={formData.profileType}
            onChange={(e) => setFormData({ profileType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm"
          >
            <option value="Individual Contractor">Individual Contractor</option>
            <option value="Builder Company">Builder Company</option>
            <option value="Builder">Builder</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company / Contractor Name</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ companyName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm"
            placeholder="E.g. BuildRight Constructions"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Office Address</label>
          <textarea
            value={formData.officeAddress}
            onChange={(e) => setFormData({ officeAddress: e.target.value })}
            className={`mt-1 block w-full rounded-md outline-none focus:ring-2 p-2 border shadow-sm sm:text-sm ${validationErrors.officeAddress ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
            placeholder="123 Builder St, Anytown"
            rows="3"
            required
          />
          {validationErrors.officeAddress && <p className="mt-1 text-xs text-red-500">{validationErrors.officeAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Service Areas (Cities / Pincodes)</label>
          <input
            type="text"
            value={formData.serviceAreas.join(', ')}
            onChange={handleServicesChange}
            className={`mt-1 block w-full rounded-md outline-none focus:ring-2 p-2 border shadow-sm sm:text-sm ${validationErrors.serviceAreas ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
            placeholder="Delhi, Noida, 110001 (Comma separated)"
            required
          />
          {validationErrors.serviceAreas && <p className="mt-1 text-xs text-red-500">{validationErrors.serviceAreas}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
          <input
            type="number"
            min="0"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData({ yearsOfExperience: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </button>
      </div>
    </form>
  );
}
