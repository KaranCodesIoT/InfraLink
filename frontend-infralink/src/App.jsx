import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index.jsx';
import useAuthStore from './store/auth.store.js';
import OneSignal from 'react-onesignal';

export default function App() {
  const { initAuth, isInitializing } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        if (OneSignal.initialized) return; // Prevent double initialization in React Strict Mode

        await OneSignal.init({
          appId: "4012d559-445e-4fba-a676-63bd6dae7a83",
          allowLocalhostAsSecureOrigin: true,
        });
        
        // Trigger notification permission prompt when user visits the site
        OneSignal.Slidedown.promptPush();
      } catch (error) {
        // Suppress expected development domain errors if testing on localhost
        if (error.message?.includes("Can only be used on")) {
          console.warn("OneSignal: Localhost testing requires configuring Local Testing in OneSignal dashboard. Push notifications are disabled for now.");
        } else {
          console.error("OneSignal initialization failed:", error);
        }
      }
    };

    initOneSignal();
  }, []);

  if (isInitializing) {
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
