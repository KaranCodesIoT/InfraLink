import { Search, SlidersHorizontal, MapPin, Tag, IndianRupee } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'builder', label: 'Builder / Developer' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'architect', label: 'Architect / Engineer' },
  { value: 'labour', label: 'Skilled Labour' },
  { value: 'supplier', label: 'Material Supplier' },
  { value: 'general', label: 'General / Other' },
];

export default function JobFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    'block w-full py-2 px-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-colors';

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            className={`${inputClass} pl-9`}
            placeholder="Search jobs, skills, keywords..."
          />
        </div>

        {/* Category */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
            className={`${inputClass} pl-9 appearance-none`}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="city"
            value={filters.city || ''}
            onChange={handleChange}
            className={`${inputClass} pl-9`}
            placeholder="City"
          />
        </div>

        {/* Budget */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="number"
              name="budgetMin"
              min="0"
              value={filters.budgetMin || ''}
              onChange={handleChange}
              className={`${inputClass} pl-7`}
              placeholder="Min ₹"
            />
          </div>
          <span className="text-gray-400 text-xs shrink-0">–</span>
          <div className="relative flex-1">
            <input
              type="number"
              name="budgetMax"
              min="0"
              value={filters.budgetMax || ''}
              onChange={handleChange}
              className={inputClass}
              placeholder="Max ₹"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
