import { create } from 'zustand';

const useSocketStore = create((set) => ({
  isConnected: false,
  socketId: null,
  setConnected: (isConnected, socketId = null) => set({ isConnected, socketId }),
}));

export default useSocketStore;
