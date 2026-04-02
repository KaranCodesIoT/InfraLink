import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import { 
  Loader2, MapPin, User, Mail, Phone, ArrowLeft, Star, Briefcase, 
  ShieldCheck, Package, Truck, CreditCard, History, LayoutGrid, 
  CheckCircle2, AlertCircle, MessageSquare, Clock
} from 'lucide-react';
import MaterialPostingWizard from '../components/MaterialPostingWizard.jsx';

export default function SupplierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedProfessional, 
    getProfessionalById, 
    clearSelectedProfessional, 
    requestSupplierQuote,
    rateSupplier,
    addSupplierProduct
  } = useDirectoryStore();
  
  const isLoading = useDirectoryStore(state => state.isLoading);
  const error = useDirectoryStore(state => state.error);
  const { user: currentUser } = useAuthStore();
  const { toast } = useUIStore();

  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    getProfessionalById(id).catch(() => {
        toast.error('Failed to load supplier profile');
    });
    return () => clearSelectedProfessional();
  }, [id, getProfessionalById, clearSelectedProfessional, toast]);

  const isOwner = !!(currentUser?._id && id && currentUser._id.toString() === id.toString());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
        <p className="text-gray-500 mt-4 font-medium">Loading supplier details...</p>
      </div>
    );
  }

  if (error || !selectedProfessional) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-700 font-semibold">{error || 'Supplier not found'}</p>
          <button onClick={() => navigate(-1)} className="mt-6 inline-flex items-center text-sm font-bold text-red-700 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const { name, avatar, supplierProfile, isVerified } = selectedProfessional;
  const businessName = supplierProfile?.businessName || name;
  const products = supplierProfile?.products || [];
  const logistics = supplierProfile?.logistics || {};
  const payment = supplierProfile?.paymentDetails || {};
  const portfolio = supplierProfile?.portfolio || [];
  const aiMetrics = supplierProfile?.aiMetrics || {};
  const categories = supplierProfile?.categories || [];

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Please log in to request a quote');
    
    setIsSubmittingQuote(true);
    try {
      await requestSupplierQuote(id, quoteMessage, selectedProducts);
      toast.success('Quote request sent successfully!');
      setIsQuoteModalOpen(false);
      setQuoteMessage('');
      setSelectedProducts([]);
    } catch (err) {
      toast.error('Failed to send quote request');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const toggleProductSelection = (productName) => {
    setSelectedProducts(prev => 
      prev.includes(productName) 
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Business Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 rounded-3xl bg-orange-50 flex items-center justify-center overflow-hidden mb-6 shadow-sm border border-orange-100 p-2">
                {avatar ? (
                  <img src={avatar} alt={businessName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Package className="w-16 h-16 text-orange-600" />
                )}
              </div>
              
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold text-gray-900">{businessName}</h1>
                  {isVerified && (
                    <div className="bg-blue-500 text-white rounded-full p-0.5" title="Verified Supplier">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-orange-600 font-bold text-xs uppercase tracking-widest mb-6">
                    Material Supplier
                </p>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 mb-6">
                  <div className="text-center">
                    <p className="text-xl font-black text-gray-900 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {Number(selectedProfessional.averageRating || 0).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Rating</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-xl font-black text-gray-900">{supplierProfile?.reputation?.totalOrders || 0}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-gray-900">{aiMetrics?.deliverySuccessRate || 0}%</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Success</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                    {isVerified && (
                        <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded-xl text-xs font-bold border border-blue-100">
                            <ShieldCheck className="w-4 h-4" /> Verified Supplier
                        </div>
                    )}
                    {selectedProfessional.averageRating >= 4.5 && (
                        <div className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 py-2 rounded-xl text-xs font-bold border border-orange-100">
                            <Star className="w-4 h-4 fill-orange-500 text-orange-500" /> Top Rated
                        </div>
                    )}
                    {logistics.sameDayDelivery && (
                        <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-xl text-xs font-bold border border-green-100">
                            <Truck className="w-4 h-4" /> Fast Delivery
                        </div>
                    )}
                </div>

                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 shadow-orange-100 shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Request a Quote
                </button>

                {isOwner && (
                    <button 
                      onClick={() => setIsAddMaterialModalOpen(true)}
                      className="w-full mt-4 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" /> Post Material
                    </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-orange-500">Logistics & Payment</h3>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delivery</p>
                        <p className="text-sm font-medium">{logistics.deliveryAvailable ? `Starts at ₹${logistics.deliveryCharges}` : 'Pickup Only'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment</p>
                        <p className="text-sm font-medium">{payment.paymentMethods?.join(', ')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                        <History className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Experience</p>
                        <p className="text-sm font-medium">{supplierProfile?.verification?.yearsOfExperience || 0}+ Years in Market</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Content: Products & Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          {/* Categories */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Supplier Categories</h2>
             <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                    <span key={i} className="bg-gray-50 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 uppercase tracking-wide">
                        {cat}
                    </span>
                ))}
             </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <LayoutGrid className="w-6 h-6 text-orange-600" /> Available Materials
                </h2>
                <div className="text-xs font-bold text-gray-400 uppercase">
                    {products.length} Products
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.length > 0 ? products.map((prod, i) => (
                    <div key={i} className="group bg-gray-50 rounded-3xl p-6 border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:border-orange-100 relative">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{prod.name}</h3>
                                <div className="mt-1 flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <Clock className="w-3 h-3 mr-1" /> Ready in {prod.deliveryTimeDays} Days
                                </div>
                            </div>
                            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl font-black text-sm">
                                ₹{prod.pricePerUnit} / {prod.unit}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white p-3 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Min Order</p>
                                <p className="text-sm font-black text-gray-900">{prod.moq} {prod.unit}s</p>
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Stock</p>
                                <p className="text-sm font-black text-gray-900">{prod.availableStock > 0 ? `${prod.availableStock} Available` : 'Enquire'}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No products listed by supplier</p>
                    </div>
                )}
            </div>
          </div>

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Supply History</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolio.map((port, i) => (
                        <div key={i} className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group transition-all hover:shadow-lg">
                            <div className="p-6">
                                <h3 className="font-black text-gray-900 uppercase tracking-tight leading-tight group-hover:text-orange-600 transition-colors">{port.title}</h3>
                                {port.clientName && (
                                    <div className="mt-2 flex items-center text-xs font-bold text-gray-500 uppercase">
                                        <Briefcase className="w-3 h-3 mr-1" /> Client: {port.clientName}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* Ratings & Reviews */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Customer Reviews</h2>
            
            <div className="space-y-6 mb-10">
              {supplierProfile?.ratings?.length > 0 ? supplierProfile.ratings.map((rev, i) => (
                <div key={i} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black uppercase text-gray-400">
                          {rev.user?.name?.substring(0,2) || 'U'}
                       </div>
                       <span className="text-sm font-black text-gray-900">{rev.user?.name || 'Infralink User'}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-3 h-3 ${idx < rev.value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed pl-10">{rev.review}</p>
                </div>
              )) : (
                <p className="text-gray-400 italic text-sm">No reviews yet. Be the first to rate!</p>
              )}
            </div>

            {/* Rate Form */}
            {currentUser?._id !== selectedProfessional?._id && (
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Rate this Supplier</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!currentUser) return toast.error('Please log in to rate');
                    if (rating === 0) return toast.error('Please select a rating');
                    setRatingLoading(true);
                    try {
                      await rateSupplier(id, rating, reviewText);
                      toast.success('Thank you for your feedback!');
                      setRating(0);
                      setHoverRating(0);
                      setReviewText('');
                      getProfessionalById(id); // refresh data
                    } catch (err) {
                      toast.error('Failed to submit review');
                    } finally {
                      setRatingLoading(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setRating(s)} 
                        onMouseEnter={() => setHoverRating(s)} 
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star className={`w-8 h-8 ${(hoverRating || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    rows="3" 
                    placeholder="Describe your delivery experience, material quality, and communication..."
                    className="w-full bg-white border border-gray-200 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all resize-none"
                  />
                  <button 
                    type="submit" 
                    disabled={ratingLoading || rating === 0}
                    className="bg-black text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {ratingLoading && <Loader2 className="w-4 h-4 animate-spin" />} Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material Posting Wizard */}
      <MaterialPostingWizard 
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        onRefresh={() => getProfessionalById(id)}
      />

      {/* Quote Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Request Quote</h2>
                            <p className="text-gray-400 text-sm font-bold uppercase mt-1 tracking-widest">Connect with {businessName}</p>
                        </div>
                        <button onClick={() => setIsQuoteModalOpen(false)} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100">
                             <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleQuoteSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1">Message to Supplier</label>
                            <textarea 
                              required 
                              value={quoteMessage} 
                              onChange={e => setQuoteMessage(e.target.value)}
                              rows={4}
                              placeholder="Describe your requirement (Quantities, Location, and Timeline)..."
                              className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all resize-none"
                            />
                        </div>

                        {products.length > 0 && (
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Select Products of Interest</label>
                              <div className="flex flex-wrap gap-2">
                                  {products.map((p, i) => (
                                      <button 
                                        type="button" 
                                        key={i} 
                                        onClick={() => toggleProductSelection(p.name)}
                                        className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                          selectedProducts.includes(p.name) 
                                            ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-100' 
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200'
                                        }`}
                                      >
                                          {p.name}
                                      </button>
                                  ))}
                              </div>
                          </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={isSubmittingQuote || !quoteMessage}
                          className="w-full bg-black text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-800 disabled:opacity-50 disabled:translate-y-0 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isSubmittingQuote ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <MessageSquare className="w-4 h-4" /> Send Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
