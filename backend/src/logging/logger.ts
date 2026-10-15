type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private format(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const ctxString = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctxString}`;
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: Record<string, any>) {
    console.error(this.format('error', message, context));
  }
}

export const logger = new Logger();
