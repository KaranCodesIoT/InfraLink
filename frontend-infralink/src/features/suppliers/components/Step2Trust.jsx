import { useState } from 'react';
import useSupplierStore from '../store/useSupplierStore.js';
import { Loader2, UploadCloud, ShieldCheck } from 'lucide-react';

export default function Step2Trust() {
  const { submitStep, isLoading, error } = useSupplierStore();
  const [formData, setFormData] = useState({
    gstNumber: '',
    yearsOfExperience: 0
  });
  const [licenseFile, setLicenseFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = new FormData();
    const dataObj = {
      verification: {
        gstNumber: formData.gstNumber,
        yearsOfExperience: Number(formData.yearsOfExperience)
      }
    };
    
    payload.append('data', JSON.stringify(dataObj));
    if (licenseFile) payload.append('businessLicense', licenseFile);

    await submitStep(2, payload, true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900">Trust & Verification</h2>
            <p className="text-gray-500 text-sm">Verified suppliers get 3x more orders</p>
        </div>
      </div>
      
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">GST Number</label>
          <input type="text" placeholder="Optional but recommended" value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500 uppercase" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
          <input type="number" min="0" required value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border shadow-sm focus:border-orange-500 focus:ring-orange-500" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Business License / Registration Cert.</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" onChange={(e) => setLicenseFile(e.target.files[0])} />
                </label>
              </div>
              <p className="text-xs text-gray-500">{licenseFile ? licenseFile.name : 'PDF, PNG, JPG up to 5MB'}</p>
            </div>
          </div>
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
