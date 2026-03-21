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

  const removeProject = (index) => {
    const updated = formData.pastProjects.filter((_, i) => i !== index);
    setFormData({ pastProjects: updated });
  };

  // Skip API call in modal during onboarding, we just want the data
  const handleAddProjectSuccess = (newProjectData) => {
      setFormData({
          pastProjects: [...formData.pastProjects, newProjectData]
      });
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

        {/* Dynamic Past Projects */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-[380px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-800">Past Projects (Optional during onboarding)</label>
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="inline-flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Project
            </button>
          </div>

          {formData.pastProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500 mb-3">No projects added yet.</p>
                <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(true)}
                    className="text-xs font-medium text-gray-700 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                    Add Your First Project
                </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.pastProjects.map((project, index) => (
                <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative group">
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="pr-8">
                    <h4 className="font-bold text-gray-900 text-sm">{project.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 mb-2">
                        {project.projectType && <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">{project.projectType}</span>}
                        {project.location && (
                            <span className="text-xs text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-orange-400" /> {project.location}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{project.description}</p>
                    {project.media?.length > 0 && (
                        <p className="text-[10px] font-semibold text-orange-600 mt-2 bg-orange-50 inline-block px-2 py-1 rounded-md">
                            {project.media.length} media attached
                        </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
        
      {/* We pass a custom onSuccess to intercept the form submission. 
          The modal itself submits to the API directly. During onboarding, the user doesn't have an ID yet 
          so direct API submission fails! Oh wait... */}
      {/* Actual FIX: The modal expects to PUT/POST to `/builders/projects`.
          But in onboarding, the profile isn't fully created. We need the modal to support "offline mode" 
          where it just returns the data instead of calling API. Let's add that to AddProjectModal. */}
      {isProjectModalOpen && (
          <AddProjectModal 
              isOpen={isProjectModalOpen} 
              onClose={() => setIsProjectModalOpen(false)} 
              isOfflineMode={true}
              onOfflineSubmit={handleAddProjectSuccess}
          />
      )}
    </form>
  );
}
