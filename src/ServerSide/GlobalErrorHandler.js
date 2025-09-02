const log = require('../utils/LoggerSetup');
const ErrorHandler = require('../utils/ErrorHandler');

class GlobalErrorHandler {
    
    static initialize() {
        process.on('uncaughtException', (error) => {
            this.handleUncaughtError(error, 'uncaught exception');
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.handleUncaughtError(reason, 'unhandled promise rejection');
        });

        process.on('warning', (warning) => {
            this.handleWarning(warning);
        });

        process.on('error', (error) => {
            this.handleUncaughtError(error, 'process error');
        });

        process.on('exit', (code) => {
            this.handleExit(code);
        });
    }

    static handleUncaughtError(error, type) {
        const cleanError = this.cleanError(error);
        
        ErrorHandler.handleError(cleanError, 'critical', type);
        
        process.exit(1);
    }

    static handleWarning(warning) {
        if (warning.name === 'DeprecationWarning' || 
            warning.name === 'ExperimentalWarning') {
            return;
        }
        
        log.warning(`System warning: ${warning.message}`);
    }

    static handleExit(code) {
        if (code !== 0) {
            log.failure(`Tool exited with code ${code} - unexpected termination`);
        }
    }

    static cleanError(error) {
        const cleanError = new Error();
        
        if (error.message) {
            cleanError.message = this.cleanMessage(error.message);
        } else {
            cleanError.message = 'Unexpected error occurred';
        }
        
        cleanError.name = error.name || 'Error';
        
        cleanError.stack = undefined;
        
        return cleanError;
    }

    static cleanMessage(message) {
        message = message.replace(/at\s+.*?\(.*?\)/g, '');
        message = message.replace(/at\s+.*?:\d+:\d+/g, '');
        
        message = message.replace(/Error:\s*/, '');
        message = message.replace(/\[.*?\]/g, '');
        
        message = message.replace(/HTTP\s+\d+/, 'Server error');
        
        message = message.replace(/TypeError|ReferenceError|SyntaxError/g, 'System error');
        
        message = message.replace(/\s+/g, ' ').trim();
        
        if (!message || message.length < 5) {
            message = 'Unexpected system error';
        }
        
        return message;
    }

    static wrapAsync(fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handleUncaughtError(error, 'async function');
            }
        };
    }

    static wrapSync(fn) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleUncaughtError(error, 'sync function');
            }
        };
    }
}

module.exports = GlobalErrorHandler;
