import { useState } from 'react';
import { ShieldCheck, X, Plus } from 'lucide-react';

const AMENITY_OPTIONS = [
  'Parking', 'Lift', 'Gym', 'Swimming Pool', '24×7 Security', 'Garden',
  'Clubhouse', 'Power Backup', 'Children\'s Play Area', 'Jogging Track',
  'Intercom', 'Fire Safety', 'Rain Water Harvesting', 'Indoor Games',
  'Community Hall', 'CCTV Surveillance', 'Waste Management', 'EV Charging',
];

export default function StepTrustDetails({ data, onChange, errors }) {
  const [facilityInput, setFacilityInput] = useState('');

  const selectedAmenities = data.amenities || [];
  const nearbyFacilities = data.nearbyFacilities || [];

  const toggleAmenity = (a) => {
    const updated = selectedAmenities.includes(a)
      ? selectedAmenities.filter((x) => x !== a)
      : [...selectedAmenities, a];
    onChange({ ...data, amenities: updated });
  };

  const addFacility = () => {
    const val = facilityInput.trim();
    if (val && !nearbyFacilities.includes(val)) {
      onChange({ ...data, nearbyFacilities: [...nearbyFacilities, val] });
    }
    setFacilityInput('');
  };

  const removeFacility = (f) => {
    onChange({ ...data, nearbyFacilities: nearbyFacilities.filter((x) => x !== f) });
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all
    ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'}`;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-sky-100 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Trust & Details</h3>
          <p className="text-sm text-gray-500">Build buyer confidence with certifications and facilities</p>
        </div>
      </div>

      {/* RERA Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">RERA Number <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={data.reraNumber || ''}
          onChange={(e) => onChange({ ...data, reraNumber: e.target.value })}
          placeholder="e.g., P51900028810"
          className={inputClass('reraNumber')}
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const selected = selectedAmenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selected
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-600'
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nearby Facilities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nearby Facilities</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={facilityInput}
            onChange={(e) => setFacilityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
            placeholder="e.g., Metro Station, School, Hospital"
            className={inputClass('nearbyFacilities')}
          />
          <button
            type="button"
            onClick={addFacility}
            className="px-4 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {nearbyFacilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {nearbyFacilities.map((f) => (
              <span key={f} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium">
                {f}
                <button type="button" onClick={() => removeFacility(f)} className="text-gray-400 hover:text-red-500 transition">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
