import { create } from 'zustand';
import api from '../../../lib/axios.js';

const useSupplierStore = create((set, get) => ({
  step: 1,
  isLoading: false,
  error: null,
  isComplete: false,

  setStep: (step) => set({ step }),

  submitStep: async (stepNumber, data, isMultipart = false) => {
    set({ isLoading: true, error: null });
    try {
      const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await api.post(`/suppliers/onboarding/step${stepNumber}`, data, config);
      
      if (stepNumber === 4) {
        set({ isComplete: true, isLoading: false });
      } else {
        set({ step: stepNumber + 1, isLoading: false });
      }
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Something went wrong', 
        isLoading: false 
      });
      throw error;
    }
  }
}));

export default useSupplierStore;
