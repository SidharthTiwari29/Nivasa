type LogContext = Record<string, string | number | boolean | null | undefined>;

function write(level: 'info' | 'warn' | 'error', message: string, context: LogContext = {}) {
  const entry = { timestamp: new Date().toISOString(), level, service: 'nivasa', message, ...context };
  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.info(JSON.stringify(entry));
}

export const logger = {
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),
};
