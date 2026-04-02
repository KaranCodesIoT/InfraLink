import { useState } from 'react';
import useSupplierStore from '../store/useSupplierStore.js';
import { Loader2, Plus, Trash2, Package } from 'lucide-react';

const PAYMENT_OPTIONS = ['Cash', 'UPI', 'Bank Transfer', 'Online'];

export default function Step3Products() {
  const { submitStep, isLoading, error } = useSupplierStore();
  
  const [products, setProducts] = useState([
    { name: '', pricePerUnit: '', unit: 'ton', moq: '', availableStock: '', deliveryTimeDays: '' }
  ]);
  const [logistics, setLogistics] = useState({
    deliveryAvailable: false, deliveryCharges: 0, transportType: 'Third-party', sameDayDelivery: false
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [advance, setAdvance] = useState(0);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', pricePerUnit: '', unit: 'ton', moq: '', availableStock: '', deliveryTimeDays: '' }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const togglePayment = (method) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter(m => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethods.length === 0) {
      alert("Please select at least one payment method");
      return;
    }
    
    // Formatting numbers
    const formattedProducts = products.map(p => ({
        ...p,
        pricePerUnit: Number(p.pricePerUnit),
        moq: Number(p.moq),
        availableStock: Number(p.availableStock || 0),
        deliveryTimeDays: Number(p.deliveryTimeDays)
    }));

    const payload = {
      data: {
        products: formattedProducts,
        logistics: { ...logistics, deliveryCharges: Number(logistics.deliveryCharges) },
        paymentDetails: { paymentMethods, advanceRequiredPercentage: Number(advance) }
      }
    };

    await submitStep(3, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" /> Products & Materials
            </h2>
            <button type="button" onClick={addProduct} className="flex items-center gap-1 text-sm text-orange-600 font-bold hover:text-orange-700">
                <Plus className="w-4 h-4" /> Add Product
            </button>
        </div>
        
        {products.map((prod, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 relative">
            {products.length > 1 && (
                <button type="button" onClick={() => removeProduct(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-md">
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Product Name</label>
                    <input type="text" required value={prod.name} onChange={e => handleProductChange(index, 'name', e.target.value)} placeholder="e.g. UltraTech Cement" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Price per Unit (₹)</label>
                    <input type="number" required min="0" value={prod.pricePerUnit} onChange={e => handleProductChange(index, 'pricePerUnit', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Unit Measure</label>
                    <select value={prod.unit} onChange={e => handleProductChange(index, 'unit', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm">
                        <option value="kg">Kg</option>
                        <option value="ton">Ton</option>
                        <option value="bag">Bag (50kg)</option>
                        <option value="piece">Piece</option>
                        <option value="sqft">Sq Ft</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Min Order / MOQ</label>
                    <input type="number" required min="1" value={prod.moq} onChange={e => handleProductChange(index, 'moq', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Stock Avail. (Opt.)</label>
                    <input type="number" min="0" value={prod.availableStock} onChange={e => handleProductChange(index, 'availableStock', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase">Delivery (Days)</label>
                    <input type="number" min="0" required value={prod.deliveryTimeDays} onChange={e => handleProductChange(index, 'deliveryTimeDays', e.target.value)} placeholder="e.g. 2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                </div>
            </div>
          </div>
        ))}
      </section>

      <hr className="border-gray-200" />

      {/* Logistics & Payment */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery & Logistics</h3>
            <div className="space-y-4">
                <label className="flex items-center gap-3">
                    <input type="checkbox" checked={logistics.deliveryAvailable} onChange={e => setLogistics({...logistics, deliveryAvailable: e.target.checked})} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300" />
                    <span className="text-sm font-medium text-gray-700">We offer delivery services</span>
                </label>
                
                {logistics.deliveryAvailable && (
                    <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Charges (₹)</label>
                        <input type="number" value={logistics.deliveryCharges} onChange={e => setLogistics({...logistics, deliveryCharges: e.target.value})} className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Transport Type</label>
                        <select value={logistics.transportType} onChange={e => setLogistics({...logistics, transportType: e.target.value})} className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md shadow-sm">
                            <option value="Own Transport">Own Transport</option>
                            <option value="Third-party">Third-party Logistics</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" checked={logistics.sameDayDelivery} onChange={e => setLogistics({...logistics, sameDayDelivery: e.target.checked})} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300" />
                        <span className="text-sm font-medium text-gray-700">Same-Day Delivery Available</span>
                    </label>
                    </>
                )}
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payments</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods</label>
                    <div className="flex flex-wrap gap-2">
                        {PAYMENT_OPTIONS.map(method => (
                            <button type="button" key={method} onClick={() => togglePayment(method)} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${paymentMethods.includes(method) ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                                {method}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Advance Required (%)</label>
                    <input type="number" min="0" max="100" value={advance} onChange={e => setAdvance(e.target.value)} className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md shadow-sm" placeholder="e.g. 50" />
                    <p className="mt-1 text-xs text-gray-500">Percentage required before dispatch.</p>
                </div>
            </div>
        </div>
      </section>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
}
