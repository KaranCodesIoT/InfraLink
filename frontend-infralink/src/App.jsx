import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index.jsx';
import useAuthStore from './store/auth.store.js';

export default function App() {
  const { initAuth, isLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Starting InfraLink...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
