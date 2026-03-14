import { Server } from 'socket.io';
import { registerChatSocket } from '../sockets/chat.socket.js';
import { registerJobSocket } from '../sockets/job.socket.js';
import { registerNotificationSocket } from '../sockets/notification.socket.js';
import { registerProjectSocket } from '../sockets/project.socket.js';
import logger from '../utils/logger.js';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        registerChatSocket(io, socket);
        registerJobSocket(io, socket);
        registerNotificationSocket(io, socket);
        registerProjectSocket(io, socket);

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) throw new Error('Socket.IO not initialised. Call initSocket() first.');
    return io;
};
