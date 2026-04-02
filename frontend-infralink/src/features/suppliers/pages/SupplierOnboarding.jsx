import React from 'react';
import { Navigate } from 'react-router-dom';
import useSupplierStore from '../store/useSupplierStore.js';
import Step1Basic from '../components/Step1Basic.jsx';
import Step2Trust from '../components/Step2Trust.jsx';
import Step3Products from '../components/Step3Products.jsx';
import Step4Portfolio from '../components/Step4Portfolio.jsx';
import { CheckCircle } from 'lucide-react';

export default function SupplierOnboarding() {
  const { step, isComplete } = useSupplierStore();

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Setup Complete!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your Supplier profile has been successfully submitted. You can now start receiving material orders and connecting with top builders.
          </p>
          <a
            href="/"
            className="inline-flex justify-center rounded-xl bg-orange-600 py-3.5 px-6 text-sm font-bold text-white hover:bg-orange-700 w-full transition-colors shadow-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Supplier Onboarding</h1>
          <p className="mt-2 text-md text-gray-600 font-medium">Complete your supplier profile to unlock a massive construction market.</p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-10 relative px-4">
          <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 z-0 rounded-full"></div>
          <div 
            className="absolute left-6 top-1/2 transform -translate-y-1/2 h-1 bg-orange-500 z-0 transition-all duration-500 rounded-full"
            style={{ width: `calc(${((step - 1) / 3) * 100}% - 1.5rem)` }}
          ></div>
          
          <div className="flex justify-between relative z-10 w-full">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center gap-2">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-4 font-bold transition-all duration-300 shadow-sm ${
                      step > num ? 'bg-orange-500 text-white border-orange-200 scale-110' : 
                      step === num ? 'bg-orange-600 text-white border-orange-100 ring-4 ring-orange-100 scale-110' : 
                      'bg-white text-gray-400 border-gray-200'
                    }`}
                  >
                    {step > num ? '✓' : num}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step >= num ? 'text-gray-900' : 'text-gray-400'}`}>
                    {num === 1 ? 'Basic' : num === 2 ? 'Trust' : num === 3 ? 'Products' : 'Portfolio'}
                  </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100 p-8 sm:p-10 mb-10">
          <div className="transition-all duration-300">
            {step === 1 && <Step1Basic />}
            {step === 2 && <Step2Trust />}
            {step === 3 && <Step3Products />}
            {step === 4 && <Step4Portfolio />}
          </div>
        </div>
        
      </div>
    </div>
  );
}
