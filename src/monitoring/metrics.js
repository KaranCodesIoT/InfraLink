/**
 * Metrics — Prometheus-style counters/histograms using prom-client.
 *
 * Install: npm install prom-client
 * Expose:  GET /metrics  (internal only — do NOT expose publicly)
 */

let register;
let httpRequestDuration;
let httpRequestTotal;
let activeConnections;

const setupMetrics = async () => {
    try {
        const promClient = await import('prom-client');
        register = promClient.register;

        promClient.collectDefaultMetrics({ register });

        httpRequestDuration = new promClient.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
        });

        httpRequestTotal = new promClient.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
        });

        activeConnections = new promClient.Gauge({
            name: 'active_socket_connections',
            help: 'Number of active Socket.IO connections',
        });

        return { register, httpRequestDuration, httpRequestTotal, activeConnections };
    } catch {
        // prom-client not installed — monitoring silently disabled
        return null;
    }
};

/**
 * Express middleware that records request duration and total.
 */
export const metricsMiddleware = (req, res, next) => {
    if (!httpRequestDuration) return next();
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        const labels = { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode };
        end(labels);
        httpRequestTotal?.inc(labels);
    });
    next();
};

/**
 * Express route handler — returns Prometheus metrics text.
 */
export const metricsHandler = async (_req, res) => {
    if (!register) return res.status(503).send('Metrics not available');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

export const incActiveConnections = () => activeConnections?.inc();
export const decActiveConnections = () => activeConnections?.dec();

export default setupMetrics;
