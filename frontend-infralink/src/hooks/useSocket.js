import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket.js';
import useSocketStore from '../store/socket.store.js';
import useAuthStore from '../store/auth.store.js';
import useNotificationStore from '../store/notification.store.js';
import useMessageStore from '../store/message.store.js';

const useSocket = () => {
  const { isAuthenticated, user } = useAuthStore();
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

    socket.on('connect', () => {
      setConnected(true, socket.id);
      // Join personal room for receiving messages & notifications
      if (user?._id) {
        socket.emit('chat:join', { roomId: `user:${user._id}` });
      }
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('notification:new', addNotification);
    // Backend emits 'chat:newMessage' — NOT 'message:new'
    socket.on('chat:newMessage', ({ message }) => {
      if (message) addIncomingMessage(message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification:new');
      socket.off('chat:newMessage');
    };
  }, [isAuthenticated, user?._id]);

  return { socket: getSocket() };
};

export default useSocket;

