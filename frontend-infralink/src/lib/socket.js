import { io } from 'socket.io-client';
import { ENV } from '../config/env.js';
import { getAccessToken } from '../utils/tokenStorage.js';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(ENV.SOCKET_URL, {
    auth: { token: getAccessToken() },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export default { connectSocket, disconnectSocket, getSocket };
