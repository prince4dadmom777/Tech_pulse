import { config } from '../config/index.js';
const requests = new Map();
export function rateLimiter(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = config.security.rateLimitWindowMs;
    const max = config.security.rateLimitMaxRequests;
    const current = requests.get(ip);
    if (!current || now > current.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
    }
    if (current.count >= max) {
        return res.status(429).json({
            error: 'Too many requests. Please slow down.',
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }
    current.count++;
    return next();
}
//# sourceMappingURL=rate-limit.middleware.js.map