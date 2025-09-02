const log = require('./LoggerSetup');

function pressEnterToStart() {
    log.success('Press Enter to start Creating');
}

function waitingToSolveCaptcha() {
    log.info('Waiting To Solve Captcha');
}

module.exports = {
    pressEnterToStart,
    waitingToSolveCaptcha
};
