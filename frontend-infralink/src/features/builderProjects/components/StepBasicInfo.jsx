import { Building2, MapPin, Home, Layers, Settings2 } from 'lucide-react';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Surat', 'Nagpur',
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Noida', 'Gurgaon',
];
const PROPERTY_TYPES = ['Flat', 'Villa', 'Commercial'];
const CONFIGURATIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Custom'];
const PROJECT_STATUSES = ['Under Construction', 'Ready to Move'];

export default function StepBasicInfo({ data, onChange, errors }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all
    ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'}`;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Building2 className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
          <p className="text-sm text-gray-500">Tell us about your project</p>
        </div>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Name *</label>
        <input
          type="text"
          value={data.projectName || ''}
          onChange={set('projectName')}
          placeholder="e.g., Skyline Towers"
          className={inputClass('projectName')}
        />
        {errors.projectName && <p className="mt-1 text-xs text-red-500">{errors.projectName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> City *
          </label>
          <select value={data.city || ''} onChange={set('city')} className={inputClass('city')}>
            <option value="">Select City</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Home className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Area / Locality *
          </label>
          <input
            type="text"
            value={data.area || ''}
            onChange={set('area')}
            placeholder="e.g., Bandra West"
            className={inputClass('area')}
          />
          {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Layers className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Property Type *
          </label>
          <select value={data.propertyType || ''} onChange={set('propertyType')} className={inputClass('propertyType')}>
            <option value="">Select Type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.propertyType && <p className="mt-1 text-xs text-red-500">{errors.propertyType}</p>}
        </div>

        {/* Configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Configuration *</label>
          <select value={data.configuration || ''} onChange={set('configuration')} className={inputClass('configuration')}>
            <option value="">Select Config</option>
            {CONFIGURATIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.configuration && <p className="mt-1 text-xs text-red-500">{errors.configuration}</p>}
        </div>

        {/* Project Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Settings2 className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Project Status *
          </label>
          <select value={data.projectStatus || ''} onChange={set('projectStatus')} className={inputClass('projectStatus')}>
            <option value="">Select Status</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.projectStatus && <p className="mt-1 text-xs text-red-500">{errors.projectStatus}</p>}
        </div>
      </div>
    </div>
  );
}
