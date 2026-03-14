import { JOB_SOCKET_EVENTS } from './events/job.events.js';

export const registerJobSocket = (io, socket) => {
    socket.on(JOB_SOCKET_EVENTS.SUBSCRIBE, ({ jobId }) => {
        socket.join(`job:${jobId}`);
    });

    socket.on(JOB_SOCKET_EVENTS.UNSUBSCRIBE, ({ jobId }) => {
        socket.leave(`job:${jobId}`);
    });
};

// Call this from service layer to broadcast job status updates
export const emitJobUpdate = (io, jobId, payload) => {
    io.to(`job:${jobId}`).emit(JOB_SOCKET_EVENTS.UPDATED, payload);
};

export const emitJobMatchReady = (io, jobId, matchCount) => {
    io.to(`job:${jobId}`).emit(JOB_SOCKET_EVENTS.MATCH_READY, { jobId, matchCount });
};
