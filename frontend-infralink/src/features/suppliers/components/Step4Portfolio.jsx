import { useState } from 'react';
import useSupplierStore from '../store/useSupplierStore.js';
import { Loader2, Plus, Trash2, Camera } from 'lucide-react';

export default function Step4Portfolio() {
  const { submitStep, isLoading, error } = useSupplierStore();
  const [portfolio, setPortfolio] = useState([
    { title: '', clientName: '' }
  ]);

  const handlePortfolioChange = (index, field, value) => {
    const newPort = [...portfolio];
    newPort[index][field] = value;
    setPortfolio(newPort);
  };

  const addPortfolio = () => {
    setPortfolio([...portfolio, { title: '', clientName: '' }]);
  };

  const removePortfolio = (index) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empties
    const validPortfolio = portfolio.filter(p => p.title.trim() !== "");

    const payload = {
      data: {
        portfolio: validPortfolio
      }
    };

    await submitStep(4, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Portfolio & Past Experience</h2>
          <p className="text-gray-500 text-sm mt-1">Showcase past projects you have supplied to build immense trust with new clients.</p>
      </div>

      {portfolio.map((port, index) => (
        <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
            {portfolio.length > 1 && (
                <button type="button" onClick={() => removePortfolio(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project Supplied To (Title)</label>
                    <input type="text" value={port.title} onChange={e => handlePortfolioChange(index, 'title', e.target.value)} placeholder="e.g. Supplied 500 Tons Steel for ABC Tower" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Client / Builder Name</label>
                    <input type="text" value={port.clientName} onChange={e => handlePortfolioChange(index, 'clientName', e.target.value)} placeholder="e.g. Lodha Group (Optional)" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Work Photos (Integration coming soon)</label>
                    <div className="mt-1 flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                        <Camera className="w-6 h-6 mr-2" />
                        <span className="text-sm font-medium">Photo upload functionality can be done later in Profile</span>
                    </div>
                </div>
            </div>
        </div>
      ))}

      <button type="button" onClick={addPortfolio} className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700">
        <Plus className="w-4 h-4" /> Add Another Project
      </button>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2.5 px-8 border border-transparent shadow-md text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup!'}
        </button>
      </div>
    </form>
  );
}
