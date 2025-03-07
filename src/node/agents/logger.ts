/**
 * Simple logger for the Agent system
 */

export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * A simple console-based logger
 */
class ConsoleLogger implements Logger {
  private prefix: string;
  
  constructor(prefix: string = 'AI-WARROOM') {
    this.prefix = prefix;
  }
  
  formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${this.prefix}] [${level}] ${message}`;
    
    if (meta) {
      formattedMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return formattedMessage;
  }
  
  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, meta));
    }
  }
  
  info(message: string, meta?: any): void {
    console.info(this.formatMessage('INFO', message, meta));
  }
  
  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }
  
  error(message: string, meta?: any): void {
    console.error(this.formatMessage('ERROR', message, meta));
  }
}

// Create and export a singleton instance
export const logger: Logger = new ConsoleLogger(); 