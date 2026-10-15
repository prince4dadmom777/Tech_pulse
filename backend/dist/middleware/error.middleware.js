import { logger } from '../logging/logger.js';
import { ZodError } from 'zod';
export function errorHandler(err, req, res, next) {
    logger.error(`API Error: ${err.message}`, {
        url: req.url,
        method: req.method,
        stack: err.stack
    });
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: err.issues.map(i => ({
                path: i.path.join('.'),
                message: i.message
            }))
        });
    }
    const statusCode = err.status || err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected internal server error occurred.'
        : err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        error: message,
        code: err.code || 'INTERNAL_ERROR'
    });
}
//# sourceMappingURL=error.middleware.js.map