import { useState } from 'react';
import useSupplierStore from '../store/useSupplierStore.js';
import { Loader2, UploadCloud } from 'lucide-react';

const CATEGORIES = [
  'Cement Supplier', 'Steel Supplier', 'Sand / Aggregates',
  'Bricks / Blocks', 'Tiles & Flooring', 'Electrical Materials',
  'Plumbing Materials', 'Furniture Supplier'
];

export default function Step1Basic() {
  const { submitStep, isLoading, error } = useSupplierStore();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    address: '',
    city: '',
    pincode: '',
    serviceAreas: '',
    categories: []
  });
  const [logoFile, setLogoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      alert("Select at least one category");
      return;
    }
    
    const payload = new FormData();
    const dataObj = {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      location: {
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        serviceAreas: formData.serviceAreas.split(',').map(s => s.trim())
      },
      categories: formData.categories
    };
    
    payload.append('data', JSON.stringify(dataObj));
    if (logoFile) payload.append('logo', logoFile);

    await submitStep(1, payload, true);
  };

  const toggleCategory = (cat) => {
    setFormData(prev => {
      const cats = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: cats };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Details & Location</h2>
      
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input type="text" required value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Owner Name</label>
          <input type="text" required value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Categories (Select Multiple)</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button type="button" key={cat} onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${formData.categories.includes(cat) ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Logo / Profile Photo</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                </label>
              </div>
              <p className="text-xs text-gray-500">{logoFile ? logoFile.name : 'PNG, JPG up to 5MB'}</p>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Full Business Address</label>
          <textarea required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pincode</label>
          <input type="text" required value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Service Areas (Cities/Districts joined by comma)</label>
          <input type="text" required placeholder="e.g. Mumbai, Pune, Thane" value={formData.serviceAreas} onChange={e => setFormData({ ...formData, serviceAreas: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>
      </div>

      <div className="flex justify-end pt-5">
        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
}
