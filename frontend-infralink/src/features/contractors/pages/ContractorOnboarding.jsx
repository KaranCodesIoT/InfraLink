import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUIStore } from '../../../store/index.js';
import api from '../../../lib/axios.js';
import { Loader2, Check, ArrowRight, ArrowLeft, Upload, PenTool, User, ShieldCheck } from 'lucide-react';

export default function ContractorOnboarding() {
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get('step')) || 1;
  const [step, setStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useUIStore();
  const navigate = useNavigate();

  // Form States
  const [step1Data, setStep1Data] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    serviceAreas: '',
    experience: ''
  });

  const [step2Data, setStep2Data] = useState({
    aadhaarNumber: '',
    panNumber: '',
    gstin: ''
  });
  const [files, setFiles] = useState({
    aadhaarCard: null,
    panCard: null,
    gstCertificate: null
  });

  const [step3Data, setStep3Data] = useState({
    services: '',
    skillLevel: 'intermediate',
    pricingType: 'hourly',
    amount: '',
    tools: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/contractors/me/profile');
        const profile = data.data;
        if (profile) {
          if (profile.contractorProfile) {
            const cp = profile.contractorProfile;
            setStep1Data({
              fullName: cp.fullName || '',
              phone: cp.phone || '',
              email: cp.email || '',
              address: cp.address || '',
              serviceAreas: cp.serviceAreas?.join(', ') || '',
              experience: cp.experience || ''
            });
            setStep2Data({
              aadhaarNumber: cp.kycDetails?.aadhaarLast4 || '',
              panNumber: cp.kycDetails?.panNumber || '',
              gstin: cp.kycDetails?.gstin || ''
            });
            if (cp.professionalDetails) {
              const pd = cp.professionalDetails;
              setStep3Data({
                services: pd.services?.join(', ') || '',
                skillLevel: pd.skillLevel || 'intermediate',
                pricingType: pd.pricing?.type || 'hourly',
                amount: pd.pricing?.amount || '',
                tools: pd.tools?.join(', ') || ''
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile for editing', err);
      }
    };
    fetchProfile();
  }, []);

  const handleStep1 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...step1Data,
        serviceAreas: step1Data.serviceAreas.split(',').map(s => s.trim())
      };
      await api.post('/contractors/onboarding/step1', payload);
      setStep(2);
      toast.success('Basic info saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Step 1 failed');
    } finally { setIsLoading(false); }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(step2Data).forEach(key => formData.append(key, step2Data[key]));
      if (files.aadhaarCard) formData.append('aadhaarCard', files.aadhaarCard);
      if (files.panCard) formData.append('panCard', files.panCard);
      if (files.gstCertificate) formData.append('gstCertificate', files.gstCertificate);

      await api.post('/contractors/onboarding/step2', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(3);
      toast.success('KYC submitted!');
    } catch (err) {
      const errData = err.response?.data;
      console.error('[Step2 KYC Error]:', errData || err.message);
      const details = errData?.error?.details?.join(', ') || errData?.error?.message || 'Step 2 failed';
      toast.error(details);
    } finally { setIsLoading(false); }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        services: step3Data.services.split(',').map(s => s.trim()),
        skillLevel: step3Data.skillLevel,
        pricing: { type: step3Data.pricingType, amount: Number(step3Data.amount) },
        tools: step3Data.tools.split(',').map(s => s.trim())
      };
      await api.post('/contractors/onboarding/step3', payload);
      toast.success('Onboarding completed!');
      navigate('/directory');
    } catch (err) {
      toast.error('Step 3 failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Onboarding</h1>
        <p className="text-gray-500">Complete these steps to start getting hired on InfraLink.</p>
        
        {/* Progress Bar */}
        <div className="mt-8 flex items-center justify-between">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                        step >= s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-400 bg-white'
                    }`}>
                        {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && <div className={`h-1 flex-1 mx-4 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-gray-100'}`} />}
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center"><User className="w-5 h-5 mr-2 text-indigo-600" /> Step 1: Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input required type="text" className="mt-1 w-full p-2.5 border rounded-lg" value={step1Data.fullName} onChange={e => setStep1Data({...step1Data, fullName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input required type="text" className="mt-1 w-full p-2.5 border rounded-lg" value={step1Data.phone} onChange={e => setStep1Data({...step1Data, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input required type="email" className="mt-1 w-full p-2.5 border rounded-lg" value={step1Data.email} onChange={e => setStep1Data({...step1Data, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea required className="mt-1 w-full p-2.5 border rounded-lg" value={step1Data.address} onChange={e => setStep1Data({...step1Data, address: e.target.value})} />
                </div>
            </div>
            <button disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center items-center">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <><ArrowRight className="mr-2" /> Next Step</>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" /> Step 2: KYC Verification</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    <input required type="text" maxLength="12" className="mt-1 w-full p-2.5 border rounded-lg" value={step2Data.aadhaarNumber} onChange={e => setStep2Data({...step2Data, aadhaarNumber: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center">
                        <Upload className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Aadhaar Card (Front)</span>
                        <input type="file" className="hidden" id="aadhaar" onChange={e => setFiles({...files, aadhaarCard: e.target.files[0]})} />
                        <label htmlFor="aadhaar" className="mt-2 text-indigo-600 text-sm font-bold cursor-pointer">Choose File</label>
                        {files.aadhaarCard && <span className="text-xs text-green-600 mt-1">{files.aadhaarCard.name}</span>}
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border py-3 rounded-xl font-bold flex items-center justify-center"><ArrowLeft className="mr-2" /> Back</button>
                <button disabled={isLoading} className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex justify-center items-center">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Submit KYC'}
                </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center"><PenTool className="w-5 h-5 mr-2 text-indigo-600" /> Step 3: Professional Details</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Services (comma separated)</label>
                    <input required type="text" placeholder="Plumber, Electrician" className="mt-1 w-full p-2.5 border rounded-lg" value={step3Data.services} onChange={e => setStep3Data({...step3Data, services: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skill Level</label>
                        <select className="mt-1 w-full p-2.5 border rounded-lg" value={step3Data.skillLevel} onChange={e => setStep3Data({...step3Data, skillLevel: e.target.value})}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price Amount</label>
                        <input required type="number" className="mt-1 w-full p-2.5 border rounded-lg" value={step3Data.amount} onChange={e => setStep3Data({...step3Data, amount: e.target.value})} />
                    </div>
                </div>
            </div>
            <button disabled={isLoading} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 flex justify-center items-center shadow-lg shadow-orange-100">
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
