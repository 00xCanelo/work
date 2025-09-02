const log = require('./LoggerSetup');
const BrowsersSysLogger = require('../BrowsersSystem/BrowsersSysLogger');

class ErrorHandler {
    
    static handleBrowserError(error, context = '') {
        const errorMessage = error.message.toLowerCase();
        
                        if (errorMessage.includes('executable') || errorMessage.includes('not found')) {
                    BrowsersSysLogger.browserExecutableNotFound();
                    log.info('Please check your config.yaml file and ensure the browser path is correct');
                    return false;
                }
        
                    if (errorMessage.includes('launch') || errorMessage.includes('spawn')) {
                BrowsersSysLogger.failedToLaunchBrowser();
                log.info('Make sure the browser is properly installed and not running in the background');
                return false;
            }
        
        if (errorMessage.includes('timeout')) {
            log.failure(`Browser launch timeout! ${context}`);
            log.info('Try closing other browser instances or restart your computer');
            return false;
        }
        
        log.failure(`Browser error: ${error.message} ${context}`);
        return false;
    }
    
    static handleNavigationError(error, url = '') {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('timeout')) {
            log.failure(`Navigation timeout! Could not reach ${url}`);
            log.info('Check your internet connection or try again later');
            return false;
        }
        
        if (errorMessage.includes('net::err_connection_refused')) {
            log.failure(`Connection refused! Cannot reach ${url}`);
            log.info('The website might be down or your network is blocking the connection');
            return false;
        }
        
        if (errorMessage.includes('net::err_name_not_resolved')) {
            log.failure(`DNS resolution failed! Cannot resolve ${url}`);
            log.info('Check your internet connection or DNS settings');
            return false;
        }
        
        if (errorMessage.includes('net::err_ssl')) {
            log.failure(`SSL certificate error! Cannot securely connect to ${url}`);
            log.info('The website might have certificate issues or your system time is incorrect');
            return false;
        }
        
        log.failure(`Navigation failed: ${error.message}`);
        log.info(`Target URL: ${url}`);
        return false;
    }
    
    static handleNetworkError(error, service = '') {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('timeout')) {
            log.failure(`${service} request timeout!`);
            log.info('The service might be overloaded, try again in a few minutes');
            return false;
        }
        
        if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            log.failure(`${service} rate limit exceeded!`);
            log.info('Too many requests, please wait before trying again');
            return false;
        }
        
        if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
            log.failure(`${service} access forbidden!`);
            log.info('Your IP might be blocked or the service requires authentication');
            return false;
        }
        
        if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
            log.failure(`${service} server error!`);
            log.info('The service is experiencing issues, try again later');
            return false;
        }
        
        log.failure(`Network error: ${error.message}`);
        log.info(`Service: ${service}`);
        return false;
    }
    
    static handleConfigError(error, configFile = '') {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('not found') || errorMessage.includes('enoent')) {
            log.failure(`Configuration file not found: ${configFile}`);
            log.info('Please ensure the config file exists and has the correct path');
            return false;
        }
        
        if (errorMessage.includes('yaml') || errorMessage.includes('parse')) {
            log.failure(`Invalid configuration format in ${configFile}`);
            log.info('Check your YAML syntax and ensure all required fields are present');
            return false;
        }
        
        if (errorMessage.includes('browser_paths')) {
            log.failure(`Browser paths not configured in ${configFile}`);
            log.info('Please add browser_paths section to your configuration');
            return false;
        }
        
        log.failure(`Configuration error: ${error.message}`);
        log.info(`File: ${configFile}`);
        return false;
    }
    
    static handleStealthError(error, stealthModule = '') {
        log.failure(`Stealth system error in ${stealthModule}: ${error.message}`);
        log.info('This might affect the tool\'s ability to avoid detection');
        return false;
    }
    
    static handleEmailError(error, emailService = '') {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            log.failure(`${emailService} quota exceeded!`);
            log.info('Email service has reached its limit, try a different service');
            return false;
        }
        
        if (errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
            log.failure(`${emailService} authentication failed!`);
            log.info('Check your email service credentials or API keys');
            return false;
        }
        
        if (errorMessage.includes('temporary') || errorMessage.includes('unavailable')) {
            log.failure(`${emailService} temporarily unavailable!`);
            log.info('The email service is down, try again later');
            return false;
        }
        
        log.failure(`Email service error: ${error.message}`);
        log.info(`Service: ${emailService}`);
        return false;
    }
    
    static handleAutomationError(error, step = '') {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('element not found') || errorMessage.includes('selector')) {
            log.failure(`Element not found during ${step}!`);
            log.info('The website structure might have changed, updating selectors...');
            return false;
        }
        
        if (errorMessage.includes('timeout') && step.includes('wait')) {
            log.failure(`Timeout waiting for ${step}!`);
            log.info('The page might be loading slowly, check your internet connection');
            return false;
        }
        
        if (errorMessage.includes('captcha') || errorMessage.includes('verification')) {
            log.failure(`Captcha/Verification detected during ${step}!`);
            log.info('Manual intervention required or try again later');
            return false;
        }
        
        log.failure(`Automation error during ${step}: ${error.message}`);
        return false;
    }
    
    static handleCriticalError(error, context = '') {
        log.failure(`Critical system error: ${error.message}`);
        log.info(`Context: ${context}`);
        log.info('This is a serious error that requires immediate attention');
        log.info('Please check your system resources and try again');
        return false;
    }
    
    static handlePermissionError(error, resource = '') {
        log.failure(`Permission denied: ${resource}`);
        log.info('The tool doesn\'t have permission to access this resource');
        log.info('Try running as administrator or check file permissions');
        return false;
    }
    
    static handleMemoryError(error) {
        log.failure('System memory error detected!');
        log.info('Your system might be running low on memory');
        log.info('Try closing other applications or restart your computer');
        return false;
    }
    
    static handleGenericError(error, context = '') {
        log.failure(`Unexpected error: ${error.message}`);
        log.info(`Context: ${context}`);
        log.info('This is an unexpected error, please report it to support');
        return false;
    }
    
    static handleError(error, type = 'generic', context = '') {
        try {
            switch (type.toLowerCase()) {
                case 'browser':
                    return this.handleBrowserError(error, context);
                case 'navigation':
                    return this.handleNavigationError(error, context);
                case 'network':
                    return this.handleNetworkError(error, context);
                case 'config':
                    return this.handleConfigError(error, context);
                case 'stealth':
                    return this.handleStealthError(error, context);
                case 'email':
                    return this.handleEmailError(error, context);
                case 'automation':
                    return this.handleAutomationError(error, context);
                case 'critical':
                    return this.handleCriticalError(error, context);
                case 'permission':
                    return this.handlePermissionError(error, context);
                case 'memory':
                    return this.handleMemoryError(error);
                default:
                    return this.handleGenericError(error, context);
            }
        } catch (handlerError) {
            log.failure(`Error handler failed: ${handlerError.message}`);
            log.failure(`Original error: ${error.message}`);
            return false;
        }
    }
}

module.exports = ErrorHandler;
