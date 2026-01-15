/**
 * Logger Utility
 * 
 * Provides structured logging that respects environment
 * and prevents sensitive data leaks in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  /**
   * Logs a debug message (development only)
   */
  debug(context: string, message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`[${context}] ${message}`, data);
    }
    this.recordLog('debug', context, message, data);
  }

  /**
   * Logs an info message
   */
  info(context: string, message: string, data?: any): void {
    console.log(`[${context}] ${message}`, data);
    this.recordLog('info', context, message, data);
  }

  /**
   * Logs a warning message
   */
  warn(context: string, message: string, data?: any): void {
    console.warn(`[${context}] ${message}`, data);
    this.recordLog('warn', context, message, data);
  }

  /**
   * Logs an error message
   */
  error(context: string, message: string, error?: Error | any): void {
    if (this.isDevelopment && error) {
      console.error(`[${context}] ${message}`, error);
    } else {
      console.error(`[${context}] ${message}`);
    }
    this.recordLog('error', context, message, error);
  }

  /**
   * Records log in history for debugging
   */
  private recordLog(
    level: LogLevel,
    context: string,
    message: string,
    data?: any
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: this.isDevelopment ? data : undefined,
    };

    this.logHistory.push(entry);

    // Keep history size manageable
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Gets recent log history
   */
  getHistory(limit = 20): LogEntry[] {
    return this.logHistory.slice(-limit);
  }

  /**
   * Clears log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Quick logging functions for convenience
 */
export const logDebug = (context: string, message: string, data?: any) =>
  logger.debug(context, message, data);

export const logInfo = (context: string, message: string, data?: any) =>
  logger.info(context, message, data);

export const logWarn = (context: string, message: string, data?: any) =>
  logger.warn(context, message, data);

export const logError = (context: string, message: string, error?: Error) =>
  logger.error(context, message, error);
