class Logger {
    format(level, message, context) {
        const timestamp = new Date().toISOString();
        const ctxString = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxString}`;
    }
    debug(message, context) {
        if (process.env.LOG_LEVEL === 'debug') {
            console.debug(this.format('debug', message, context));
        }
    }
    info(message, context) {
        console.log(this.format('info', message, context));
    }
    warn(message, context) {
        console.warn(this.format('warn', message, context));
    }
    error(message, context) {
        console.error(this.format('error', message, context));
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map