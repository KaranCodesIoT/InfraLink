import { CHAT_EVENTS } from './events/chat.events.js';

export const registerChatSocket = (io, socket) => {
    socket.on(CHAT_EVENTS.JOIN, ({ roomId }) => {
        socket.join(roomId);
        socket.to(roomId).emit(CHAT_EVENTS.USER_JOINED, { socketId: socket.id });
    });

    socket.on(CHAT_EVENTS.SEND_MESSAGE, ({ roomId, message }) => {
        io.to(roomId).emit(CHAT_EVENTS.NEW_MESSAGE, { message, from: socket.id, timestamp: new Date() });
    });

    socket.on(CHAT_EVENTS.TYPING, ({ roomId, isTyping }) => {
        socket.to(roomId).emit(CHAT_EVENTS.TYPING_STATUS, { socketId: socket.id, isTyping });
    });

    socket.on(CHAT_EVENTS.STOP_TYPING, ({ roomId }) => {
        socket.to(roomId).emit(CHAT_EVENTS.TYPING_STATUS, { socketId: socket.id, isTyping: false });
    });

    socket.on(CHAT_EVENTS.LEAVE, ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit(CHAT_EVENTS.USER_LEFT, { socketId: socket.id });
    });
};
