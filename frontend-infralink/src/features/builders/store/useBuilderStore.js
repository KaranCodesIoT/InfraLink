import { create } from 'zustand';
import axiosInstance from '../../../lib/axios.js';

const useBuilderStore = create((set, get) => ({
  step: 1,
  isLoading: false,
  error: null,
  isComplete: false,
  
  formData: {
    // Step 1
    companyName: '',
    profileType: 'Individual Contractor',
    officeAddress: '',
    serviceAreas: [],
    yearsOfExperience: 0,
    
    // Step 2
    aadhaarNumber: '',
    panNumber: '',
    gstin: '',
    reraRegistrationNumber: '',
    documents: {
      aadhaarCard: null,
      panCard: null,
      gstCertificate: null,
      reraCertificate: null,
    },
    
    // Step 3
    servicesOffered: [],
    pricingModel: 'fixed',
    teamSize: 1,
    pastProjects: [],
  },

  setFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data },
    error: null 
  })),

  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 3), error: null })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1), error: null })),

  submitStep1: async () => {
    set({ isLoading: true, error: null });
    try {
      const { companyName, profileType, officeAddress, serviceAreas, yearsOfExperience } = get().formData;
      await axiosInstance.post('/builders/onboarding/step1', {
        companyName, profileType, officeAddress, serviceAreas, yearsOfExperience
      });
      get().nextStep();
    } catch (err) {
      set({ error: err.response?.data?.error?.message || 'Failed to save Step 1' });
    } finally {
      set({ isLoading: false });
    }
  },

  submitStep2: async () => {
    set({ isLoading: true, error: null });
    try {
      const { aadhaarNumber, panNumber, gstin, reraRegistrationNumber, documents } = get().formData;
      
      const formDataObj = new FormData();
      formDataObj.append('aadhaarNumber', aadhaarNumber);
      formDataObj.append('panNumber', panNumber);
      if (gstin) formDataObj.append('gstin', gstin);
      if (reraRegistrationNumber) formDataObj.append('reraRegistrationNumber', reraRegistrationNumber);
      
      // Append files
      if (documents.aadhaarCard) formDataObj.append('aadhaarCard', documents.aadhaarCard);
      if (documents.panCard) formDataObj.append('panCard', documents.panCard);
      if (documents.gstCertificate) formDataObj.append('gstCertificate', documents.gstCertificate);
      if (documents.reraCertificate) formDataObj.append('reraCertificate', documents.reraCertificate);

      await axiosInstance.post('/builders/onboarding/step2', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      get().nextStep();
    } catch (err) {
      set({ error: err.response?.data?.error?.message || 'Failed to save KYC Details' });
    } finally {
      set({ isLoading: false });
    }
  },

  submitStep3: async () => {
    set({ isLoading: true, error: null });
    try {
      const { servicesOffered, pricingModel, teamSize, pastProjects } = get().formData;
      await axiosInstance.post('/builders/onboarding/step3', {
        servicesOffered, pricingModel, teamSize, pastProjects
      });
      set({ isComplete: true });
    } catch (err) {
      set({ error: err.response?.data?.error?.message || 'Failed to save Professional Details' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useBuilderStore;
