import { IndianRupee, Building, CalendarDays, Hash } from 'lucide-react';

export default function StepPricingUnits({ data, onChange, errors }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-sm placeholder-gray-400 outline-none transition-all
    ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'}`;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <IndianRupee className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Pricing & Units</h3>
          <p className="text-sm text-gray-500">Set your pricing and availability</p>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <IndianRupee className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Price (₹) *
        </label>
        <input
          type="number"
          value={data.price || ''}
          onChange={set('price')}
          placeholder="e.g., 4500000"
          min="0"
          className={inputClass('price')}
        />
        {data.price && (
          <p className="mt-1 text-xs text-gray-500">
            ₹ {Number(data.price).toLocaleString('en-IN')}
          </p>
        )}
        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Units */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Building className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Total Units *
          </label>
          <input
            type="number"
            value={data.totalUnits || ''}
            onChange={set('totalUnits')}
            placeholder="e.g., 200"
            min="1"
            className={inputClass('totalUnits')}
          />
          {errors.totalUnits && <p className="mt-1 text-xs text-red-500">{errors.totalUnits}</p>}
        </div>

        {/* Available Units */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Hash className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Available Units *
          </label>
          <input
            type="number"
            value={data.availableUnits || ''}
            onChange={set('availableUnits')}
            placeholder="e.g., 50"
            min="0"
            className={inputClass('availableUnits')}
          />
          {errors.availableUnits && <p className="mt-1 text-xs text-red-500">{errors.availableUnits}</p>}
        </div>
      </div>

      {/* Possession Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <CalendarDays className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Possession Date
        </label>
        <input
          type="date"
          value={data.possessionDate || ''}
          onChange={set('possessionDate')}
          className={inputClass('possessionDate')}
        />
      </div>
    </div>
  );
}
