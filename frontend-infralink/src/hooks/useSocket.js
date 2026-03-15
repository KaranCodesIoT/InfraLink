import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket.js';
import useSocketStore from '../store/socket.store.js';
import useAuthStore from '../store/auth.store.js';
import useNotificationStore from '../store/notification.store.js';
import useMessageStore from '../store/message.store.js';

const useSocket = () => {
  const { isAuthenticated } = useAuthStore();
  const { setConnected } = useSocketStore();
  const { addNotification } = useNotificationStore();
  const { addIncomingMessage } = useMessageStore();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setConnected(false);
      return;
    }

    const socket = connectSocket();

    socket.on('connect', () => setConnected(true, socket.id));
    socket.on('disconnect', () => setConnected(false));
    socket.on('notification:new', addNotification);
    socket.on('message:new', addIncomingMessage);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification:new');
      socket.off('message:new');
    };
  }, [isAuthenticated]);

  return { socket: getSocket() };
};

export default useSocket;
