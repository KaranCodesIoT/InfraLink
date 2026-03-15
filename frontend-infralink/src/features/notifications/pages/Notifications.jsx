import { useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import useNotificationStore from '../../../store/notification.store.js';

export default function Notifications() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, isLoading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" /> Your Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">You have {unreadCount} unread messages.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            You don't have any notifications right now.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 ${
                  !notification.isRead ? 'bg-orange-50/30' : ''
                }`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${!notification.isRead ? 'bg-orange-600' : 'bg-transparent'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
