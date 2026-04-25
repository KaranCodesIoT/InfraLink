import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function LoginForm() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  
  const { sendOtp, checkOtp, verifyOtp, isLoading, error, clearError, devOtp } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    clearError();
    try {
      await sendOtp(email);
      setStep(2);
      setIsOtpVerified(false);
      setOtp('');
      toast?.success?.('OTP sent successfully!');
    } catch (err) {
      // Error is set in store and shown in UI
    }
  };

  // Step 2: Auto-check OTP
  useEffect(() => {
    const verifyOtpLocally = async () => {
      if (otp.length === 6 && step === 2) {
        clearError();
        try {
          await checkOtp(email, otp);
          setIsOtpVerified(true);
          setStep(3); // Move to password step
          toast?.success?.('OTP Verified Successfully!');
        } catch (err) {
          // Error handled in store
        }
      }
    };
    
    // Small timeout to let user see 6th digit
    const timer = setTimeout(verifyOtpLocally, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step, email]);

  // Step 3: Login with Password
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    clearError();
    try {
      const user = await verifyOtp(email, password);
      toast?.success?.('Logged in successfully!');
      
      // New user → role selection; existing user → dashboard
      if (!user.role || user.role === 'unassigned') {
        navigate(ROUTES.ROLE_SELECT, { replace: true });
      } else {
        const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Error is set in store and shown in UI
    }
  };

  // Go back to email input
  const goBack = () => {
    setStep(1);
    setOtp('');
    setPassword('');
    setIsOtpVerified(false);
    clearError();
  };

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* DEV MODE: Show the OTP nicely */}
      {devOtp && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center font-mono text-sm">
          🔑 Dev OTP: <span className="font-bold tracking-widest">{devOtp}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#2d3748] mb-1">Email address</label>
          <div className="relative flex items-center">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="bhavya@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step > 1 || isLoading}
              className="block w-full pl-3 pr-24 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-[#f3f6f9] disabled:text-gray-500 text-gray-900 bg-[#f3f6f9]"
            />
            {step === 1 && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading || !email}
                className="absolute right-1 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="absolute right-1 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors"
              >
                Change
              </button>
            )}
          </div>
        </div>

        {/* OTP Entry Box - Appears just below Email when Verify is clicked */}
        {step === 2 && !isOtpVerified && (
          <div className="animate-fade-in bg-orange-50 p-3 rounded-md border border-orange-100">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-orange-800">Enter OTP</label>
              <button type="button" onClick={handleSendOtp} className="text-xs text-orange-600 hover:text-orange-500 font-medium">
                Resend code
              </button>
            </div>
            <p className="text-xs text-orange-600 mb-2">Code sent to your email.</p>
            <input
              type="text"
              required
              autoFocus
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              className="block w-full px-3 py-2 text-center tracking-widest text-lg rounded-md border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 bg-white"
            />
          </div>
        )}

        {/* Verified OTP State */}
        {isOtpVerified && (
          <div className="animate-fade-in bg-green-50 p-3 rounded-md border border-green-200 flex items-center justify-between">
            <div className="flex items-center text-green-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm font-medium">Email Verified Successfully</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#2d3748] mb-1">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder={step < 3 ? "Enter email and verify first" : "••••••••"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={step < 3 || isLoading}
            className={`block w-full px-3 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 ${step < 3 ? 'bg-[#f3f6f9] cursor-not-allowed placeholder-gray-400' : 'bg-white'}`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || step < 3 || password.length < 8}
          className="mt-6 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f05000] hover:bg-[#d64700] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f05000] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
