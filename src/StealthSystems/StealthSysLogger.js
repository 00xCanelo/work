const log = require('../utils/LoggerSetup');

class StealthSysLogger {
    
    static allStealthSystemsApplied() {
        log.success('All stealth systems applied successfully!');
    }
}

module.exports = StealthSysLogger;
