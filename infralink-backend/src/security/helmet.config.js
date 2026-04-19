/**
 * Helmet security configuration.
 *
 * Centralises all HTTP security headers in one place.
 * Import `helmetOptions` and use: app.use(helmet(helmetOptions))
 */

const helmetOptions = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com', 'blob:'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", 'https://infralink-production.up.railway.app', 'https://infra-link-sepia.vercel.app', 'wss://infralink-production.up.railway.app'],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for Swagger UI
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow frontend to load avatars cross-origin
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
    noSniff: true,
    frameguard: { action: 'deny' },
};

export default helmetOptions;
