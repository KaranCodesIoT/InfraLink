import { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Package, Sparkles, 
  MapPin, Truck, IndianRupee, Image as ImageIcon, CheckCircle2,
  AlertCircle, Upload, Trash2, Star, Clock, Info
} from 'lucide-react';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import api from '../../../lib/axios.js';

const CATEGORIES = [
  'Cement', 'Steel', 'Sand & Aggregates', 'Bricks & Blocks', 
  'Tiles & Flooring', 'Electrical', 'Plumbing', 'Paints & Coatings',
  'Wood & Timber', 'Glass & Aluminum', 'Roofing', 'Hardware'
];

const UNITS = ['bag', 'kg', 'ton', 'sqft', 'piece', 'cubic-ft', 'unit', 'meter'];

export default function MaterialPostingWizard({ isOpen, onClose, onRefresh }) {
  const { postMaterial } = useDirectoryStore();
  const { toast } = useUIStore();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]); // { file, preview, isPrimary }
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    description: { short: '', detailed: '' },
    price: '',
    unit: 'bag',
    availableQuantity: '',
    moq: 1,
    bulkPricing: [],
    location: { warehouseCity: '', pincode: '' },
    serviceAreas: [],
    deliveryDetails: { available: false, charges: 0, time: '1-3 days' },
    status: 'in_stock',
    urgencyTag: 'none',
    paymentOptions: ['UPI', 'Bank Transfer']
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 8) {
       toast.error('Maximum 8 images allowed');
       return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: images.length === 0 // First image is primary by default
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].isPrimary && newImages.length > 0) {
       newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const setPrimaryImage = (index) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const img of images) {
       const formData = new FormData();
       formData.append('media', img.file);
       
       try {
         // Use the authenticated 'api' instance
         const { data } = await api.post('/upload', formData, {
           headers: { 'Content-Type': 'multipart/form-data' },
           onUploadProgress: (progressEvent) => {
             const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
             setUploadProgress(progress);
           }
         });
         uploadedUrls.push({ url: data.data.urls[0], isPrimary: img.isPrimary });
       } catch (err) {
         console.error('Upload error:', err);
         throw new Error('Image upload failed. Please try again.');
       }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error('Please upload at least one image');
    
    setIsSubmitting(true);
    try {
      const uploadedImages = await uploadImages();
      
      // Transform strings to numbers for backend validation
      const submissionData = {
        ...formData,
        price: Number(formData.price),
        availableQuantity: Number(formData.availableQuantity),
        moq: Number(formData.moq),
        deliveryDetails: {
          ...formData.deliveryDetails,
          charges: Number(formData.deliveryDetails.charges)
        },
        images: uploadedImages
      };

      await postMaterial(submissionData);
      toast.success('Material posted successfully!');
      onRefresh?.();
      onClose();
    } catch (err) {
      // Extract validation error messages from backend if available
      const errMsg = err.response?.data?.error?.details?.[0] || err.message || 'Failed to post material';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const renderStepIndicators = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
            step >= s ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'
          }`}>
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          {s < 5 && (
            <div className={`w-10 sm:w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
              step > s ? 'bg-orange-600' : 'bg-gray-100'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-0 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Post Material</h2>
            <p className="text-gray-400 text-sm font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" /> 
              Step {step} of 5: {
                step === 1 ? 'Basic Information' :
                step === 2 ? 'Pricing & Quantity' :
                step === 3 ? 'Logistics & Delivery' :
                step === 4 ? 'Upload Media' : 'Final Review'
              }
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-6 scrollbar-hide">
          {renderStepIndicators()}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: BASIC INFO */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Material Name</label>
                    <input 
                      type="text" required placeholder="e.g. UltraTech Cement - OPC 43 Grade"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Category</label>
                    <select 
                      required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Brand (Optional)</label>
                    <input 
                      type="text" placeholder="e.g. UltraTech, Tata Steel"
                      value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Short Tagline</label>
                    <input 
                      type="text" required placeholder="Quick one-line summary"
                      value={formData.description.short} onChange={e => setFormData({...formData, description: {...formData.description, short: e.target.value}})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Detailed Description</label>
                    <textarea 
                      rows={4} placeholder="Specifications, usage, certification, etc."
                      value={formData.description.detailed} onChange={e => setFormData({...formData, description: {...formData.description, detailed: e.target.value}})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PRICING & QTY */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Unit</label>
                    <select 
                      required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Price per Unit (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" required placeholder="0.00"
                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 pl-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Total Stock</label>
                    <input 
                      type="number" required placeholder="1000"
                      value={formData.availableQuantity} onChange={e => setFormData({...formData, availableQuantity: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Min Order (MOQ)</label>
                    <input 
                      type="number" required
                      value={formData.moq} onChange={e => setFormData({...formData, moq: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                  </div>
                </div>
                
                <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                    <h4 className="text-xs font-black uppercase tracking-widest text-orange-700 flex items-center gap-2 mb-4">
                        <IndianRupee className="w-4 h-4" /> Bulk Pricing (Optional)
                    </h4>
                    <p className="text-[10px] text-orange-600/70 font-bold uppercase mb-4 tracking-tight">Add discounts for larger quantities</p>
                    <button type="button" className="text-xs font-black uppercase bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition-all">Add Discount Tier</button>
                </div>
              </div>
            )}

            {/* STEP 3: LOGISTICS */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Warehouse City</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" required placeholder="e.g. Mumbai"
                        value={formData.location.warehouseCity} onChange={e => setFormData({...formData, location: {...formData.location, warehouseCity: e.target.value}})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 pl-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Pincode</label>
                    <input 
                      type="text" required placeholder="400001"
                      value={formData.location.pincode} onChange={e => setFormData({...formData, location: {...formData.location, pincode: e.target.value}})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.deliveryDetails.available ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 uppercase">Delivery Available?</h4>
                                <p className="text-xs text-gray-400 font-bold uppercase">Enable if you ship to customer site</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, deliveryDetails: {...formData.deliveryDetails, available: !formData.deliveryDetails.available}})}
                            className={`w-14 h-8 rounded-full relative transition-all ${formData.deliveryDetails.available ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.deliveryDetails.available ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                  </div>

                  {formData.deliveryDetails.available && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Delivery Charges (₹)</label>
                        <input 
                          type="number" placeholder="0 = Free Delivery"
                          value={formData.deliveryDetails.charges} onChange={e => setFormData({...formData, deliveryDetails: {...formData.deliveryDetails, charges: e.target.value}})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Estimated Time</label>
                        <select 
                          value={formData.deliveryDetails.time} onChange={e => setFormData({...formData, deliveryDetails: {...formData.deliveryDetails, time: e.target.value}})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                        >
                          <option value="same day">Same Day</option>
                          <option value="1-3 days">1 - 3 Days</option>
                          <option value="3-7 days">3 - 7 Days</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: IMAGES */}
            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group hover:border-orange-300 transition-all relative overflow-hidden">
                    <div className="p-4 bg-orange-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Upload Product Images</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Up to 8 High-quality photos (JPG, PNG, WEBP)</p>
                    <input 
                      type="file" multiple accept="image/*" onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, i) => (
                      <div key={i} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${img.isPrimary ? 'border-orange-500 scale-100 shadow-lg' : 'border-gray-100'}`}>
                        <img src={img.preview} alt="Upload" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                           <button onClick={() => setPrimaryImage(i)} className="p-2 bg-white rounded-full hover:bg-orange-500 hover:text-white transition-all">
                              <Star className={`w-4 h-4 ${img.isPrimary ? 'fill-current' : ''}`} />
                           </button>
                           <button onClick={() => removeImage(i)} className="p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-all text-red-500">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        {img.isPrimary && (
                           <div className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg">Cover</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {isSubmitting && uploadProgress > 0 && (
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                        <span>Uploading Images...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                   </div>
                )}
              </div>
            )}

            {/* STEP 5: FINAL REVIEW */}
            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-3xl rounded-full" />
                   <div className="relative">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Almost Ready!</h4>
                      <h3 className="text-xl font-black">{formData.name || 'Untitled Material'}</h3>
                      <div className="flex items-center gap-3 mt-4">
                         <div className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black uppercase">₹{formData.price || 0} / {formData.unit}</div>
                         <div className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black uppercase">Stock: {formData.availableQuantity || 0}</div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Stock Status</label>
                        <select 
                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all border-l-4 border-l-green-500"
                        >
                            <option value="in_stock">In Stock</option>
                            <option value="limited">Limited</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Visibility Tag</label>
                        <select 
                            value={formData.urgencyTag} onChange={e => setFormData({...formData, urgencyTag: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all border-l-4 border-l-orange-500"
                        >
                            <option value="none">Standard</option>
                            <option value="urgent">Urgent List</option>
                            <option value="best_price">Best Price Guaranteed</option>
                            <option value="limited_stock">Limited Stock Warning</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-tight">
                        By posting, you agree to fulfill the orders within the specified timeline. High quality leads depend on accurate specs and responsive communication.
                    </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
          <button 
            type="button" onClick={prevStep} disabled={step === 1 || isSubmitting}
            className="px-8 py-5 rounded-3xl border border-gray-200 text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          {step < 5 ? (
            <button 
              type="button" onClick={nextStep}
              className="flex-1 bg-black text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 bg-orange-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" /> Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Post to Marketplace
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
