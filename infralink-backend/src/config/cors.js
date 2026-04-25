const corsOptions = {
    origin: (origin, callback) => {
        const allowed = (process.env.CORS_ORIGIN || 'https://infra-link-sepia.vercel.app').split(',').map((o) => o.trim());
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowed.includes('*') || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy blocked origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
};

export default corsOptions;
