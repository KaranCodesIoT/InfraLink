import React, { useState } from 'react';
import useBuilderStore from '../store/useBuilderStore.js';
import { Loader2, UploadCloud, FileText } from 'lucide-react';

export default function Step2KYC() {
  const { formData, setFormData, submitStep2, prevStep, isLoading, error } = useBuilderStore();
  const [validationErrors, setValidationErrors] = useState({});

  // Handle Aadhaar Masking (Display only, we save the raw one to state, but mask it visually if we want. It's tricky with controlled inputs, so we just use normal input and rely on backend masking as instructed or we can mask it here.)
  // Actually, standard masking visually as you type is complex without a library, I will just enforce 12 digits.
  
  const validate = () => {
    const errors = {};
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) errors.aadhaarNumber = "Aadhaar must be exactly 12 digits";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) errors.panNumber = "Must be a valid 10-character PAN";
    
    if (!formData.documents.aadhaarCard) errors.aadhaarCard = "Aadhaar Card upload is required";
    if (!formData.documents.panCard) errors.panCard = "PAN Card upload is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        documents: { ...formData.documents, [docType]: file }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) submitStep2();
  };

  const FileUploadField = ({ label, docType, required }) => (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 text-gray-400 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {formData.documents[docType] ? (
              <>
                <FileText className="w-8 h-8 mb-2 text-indigo-500" />
                <p className="text-sm font-semibold text-gray-900">{formData.documents[docType].name}</p>
                <p className="text-xs text-gray-500">{(formData.documents[docType].size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> {label}</p>
                <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 5MB)</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, docType)} />
        </label>
      </div>
      {validationErrors[docType] && <p className="mt-1 text-xs text-red-500">{validationErrors[docType]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 2: KYC & Legal Verification</h2>
        <p className="text-sm text-gray-500 mt-1">Upload compliance documents to get verified status.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              maxLength="12"
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ aadhaarNumber: e.target.value.replace(/\D/g, '') })}
              className={`mt-1 block w-full rounded-md outline-none focus:ring-2 p-2 border shadow-sm sm:text-sm ${validationErrors.aadhaarNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
              placeholder="12-digit Aadhaar Number"
            />
            {validationErrors.aadhaarNumber && <p className="mt-1 text-xs text-red-500">{validationErrors.aadhaarNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">PAN Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              maxLength="10"
              value={formData.panNumber}
              onChange={(e) => setFormData({ panNumber: e.target.value.toUpperCase() })}
              className={`mt-1 block w-full rounded-md outline-none focus:ring-2 p-2 border shadow-sm sm:text-sm uppercase ${validationErrors.panNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
              placeholder="ABCDE1234F"
            />
            {validationErrors.panNumber && <p className="mt-1 text-xs text-red-500">{validationErrors.panNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GSTIN (Optional)</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ gstin: e.target.value.toUpperCase() })}
              className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm uppercase"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">RERA Registration (Optional)</label>
            <input
              type="text"
              value={formData.reraRegistrationNumber}
              onChange={(e) => setFormData({ reraRegistrationNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 outline-none focus:ring-2 p-2 border focus:ring-indigo-500 shadow-sm sm:text-sm"
              placeholder="RERA Reg Number"
            />
          </div>
        </div>

        <div className="space-y-4">
          <FileUploadField label="Upload Aadhaar Card" docType="aadhaarCard" required />
          <FileUploadField label="Upload PAN Card" docType="panCard" required />
          <FileUploadField label="Upload GST Certificate (Optional)" docType="gstCertificate" />
          <FileUploadField label="Upload RERA Certificate (Optional)" docType="reraCertificate" />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={prevStep}
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue'}
        </button>
      </div>
    </form>
  );
}
