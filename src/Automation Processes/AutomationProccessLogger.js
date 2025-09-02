const log = require('../utils/LoggerSetup');

class AutomationProccessLogger {  
    static creatingTokensWithService(serviceName) {
        log.info(`Creating Tokens With ${serviceName} Mails`);
    }
    static startingAutomating() {
        log.success('Starting Automating');
    }
    static browserReadyForAutomating() {
        log.success('Browser Ready For Automating');
    }
    static accountInfoTypedSuccessfully() {
        log.success('Account Info Typed Successfully');
    }
    static continueButtonPressedSuccessfully() {
        log.success('Continue Button is successfully pressed on');
    }
}

module.exports = AutomationProccessLogger;
