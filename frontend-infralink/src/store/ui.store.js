import { create } from 'zustand';

const useUIStore = create((set) => ({
  isLoading: false,
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  toasts: [],

  setLoading: (isLoading) => set({ isLoading }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (toast) => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 4000);
    }
    return id;
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Shorthand helpers
  toast: {
    success: (message) => useUIStore.getState().addToast({ type: 'success', message }),
    error: (message) => useUIStore.getState().addToast({ type: 'error', message }),
    info: (message) => useUIStore.getState().addToast({ type: 'info', message }),
    warning: (message) => useUIStore.getState().addToast({ type: 'warning', message }),
  },
}));

export default useUIStore;
