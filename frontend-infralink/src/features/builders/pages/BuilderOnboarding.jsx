import React from 'react';
import { Navigate } from 'react-router-dom';
import useBuilderStore from '../store/useBuilderStore.js';
import Step1Basic from '../components/Step1Basic.jsx';
import Step2KYC from '../components/Step2KYC.jsx';
import Step3Professional from '../components/Step3Professional.jsx';
import { CheckCircle } from 'lucide-react';

export default function BuilderOnboarding() {
  const { step, isComplete } = useBuilderStore();

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your builder profile has been submitted successfully. Your KYC status is now <span className="font-semibold text-orange-600">Pending Verification</span>. You will be notified once the admin approves your account.
          </p>
          <a
            href="/"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Builder Onboarding</h1>
          <p className="mt-2 text-md text-gray-600">Complete your profile to start finding projects.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-colors ${
                  step >= num 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}
              >
                {step > num ? '✓' : num}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-gray-500 uppercase">
            <span>Basic Info</span>
            <span>KYC Verification</span>
            <span>Professional Details</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8">
            {step === 1 && <Step1Basic />}
            {step === 2 && <Step2KYC />}
            {step === 3 && <Step3Professional />}
          </div>
        </div>
      </div>
    </div>
  );
}
