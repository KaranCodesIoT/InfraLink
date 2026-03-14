export const registerProjectSocket = (io, socket) => {
    socket.on('project:join', ({ projectId }) => {
        socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', ({ projectId }) => {
        socket.leave(`project:${projectId}`);
    });
};

export const emitProjectUpdate = (io, projectId, payload) => {
    io.to(`project:${projectId}`).emit('project:updated', payload);
};
