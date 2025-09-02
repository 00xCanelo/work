const log = require('../utils/LoggerSetup');

class BrowsersSysLogger {
    
    static loadedBrowsers(count) {
        log.warning(`Loaded ${count} Browsers`);
    }
    
    static chooseBrowser() {
        log.info('Choose the Browser Will be used in this Session');
    }
    
    static selectedBrowser(browserName) {
        log.success(`Selected browser: ${browserName}`);
    }
    
    static noBrowsersFound() {
        log.failure('No browsers found! Please check your config.yaml');
    }
    
    static browserExecutableNotFound() {
        log.failure('Browser executable not found!');
    }
    
    static failedToLaunchBrowser() {
        log.failure('Failed to launch browser');
    }
    
    static errorClosingBrowser(error) {
        log.warning(`Error closing browser: ${error}`);
    }
}

module.exports = BrowsersSysLogger;
