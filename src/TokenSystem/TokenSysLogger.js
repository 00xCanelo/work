const log = require('../utils/LoggerSetup');

function startingTokenExtraction() {
    log.warning('Starting Token Extraction');
}

function tokenExtractedAndSaved() {
    log.success('Token Extracted and saved');
}

module.exports = {
    startingTokenExtraction,
    tokenExtractedAndSaved
};
