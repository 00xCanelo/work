const log = require('../utils/LoggerSetup');

class MailServLogger {
    
    static requestingEmail() {
        log.warning('Requesting Email');
    }
    
    static emailAcquiredStartingProcess() {
        log.success('Email Accuried Starting the Process');
    }

    static startingSearchingForVerificationLink() {
        log.success('Starting searching for the Verfication Link');
    }

    static verificationLinkFoundNavigating() {
        log.success('Verfication Link Found... Navigating to it');
    }

    static accountCreated() {
        log.success('Account Created');
    }
}

module.exports = MailServLogger;
