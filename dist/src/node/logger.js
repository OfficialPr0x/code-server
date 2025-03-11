"use strict";
/**
 * Simple logger for the Agent system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coderLogger = exports.logger = void 0;
const logger_1 = require("@coder/logger");
Object.defineProperty(exports, "coderLogger", { enumerable: true, get: function () { return logger_1.logger; } });
/**
 * A simple console-based logger
 */
class ConsoleLogger {
    constructor(prefix = 'AI-WARROOM') {
        this.prefix = prefix;
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        let formattedMessage = `[${timestamp}] [${this.prefix}] [${level}] ${message}`;
        if (meta) {
            formattedMessage += ` ${JSON.stringify(meta)}`;
        }
        return formattedMessage;
    }
    debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
    info(message, meta) {
        console.info(this.formatMessage('INFO', message, meta));
    }
    warn(message, meta) {
        console.warn(this.formatMessage('WARN', message, meta));
    }
    error(message, meta) {
        console.error(this.formatMessage('ERROR', message, meta));
    }
}
// Create and export a singleton instance
exports.logger = new ConsoleLogger();
