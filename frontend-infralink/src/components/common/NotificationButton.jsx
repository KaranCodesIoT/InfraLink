import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if Push is supported
    if (!OneSignal.Notifications.isPushSupported()) {
      setIsSupported(false);
      return;
    }

    // Check initial subscription status
    const checkSubscription = () => {
      setIsSubscribed(OneSignal.User.PushSubscription.optedIn);
    };

    // Setup listener for subscription changes
    OneSignal.User.PushSubscription.addEventListener("change", (event) => {
      setIsSubscribed(event.current.optedIn);
    });

    // Check after a short delay to ensure initialization is complete
    setTimeout(checkSubscription, 1000);
  }, []);

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await OneSignal.User.PushSubscription.optOut();
      } else {
        await OneSignal.Slidedown.promptPush();
      }
    } catch (error) {
      console.error("Error toggling OneSignal notification:", error);
    }
  };

  if (!isSupported) {
    return null; // Don't render button if push not supported
  }

  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs">
      <div className={`p-2 rounded-full ${isSubscribed ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
        {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">Notifications</p>
        <p className="text-xs text-gray-500">{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</p>
      </div>
      <button
        onClick={handleToggle}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          isSubscribed 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
            : 'bg-orange-600 text-white hover:bg-orange-700'
        }`}
      >
        {isSubscribed ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
}
