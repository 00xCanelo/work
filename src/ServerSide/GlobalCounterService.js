const CounterService = require('./CounterService');

class GlobalCounterService {
    constructor() {
        this.counterService = null;
    }

    initialize(hwid) {
        if (!this.counterService) {
            this.counterService = new CounterService();
        }
        this.counterService.setHWID(hwid);
    }

    getInstance() {
        return this.counterService;
    }

    async incrementEmailBought() {
        if (this.counterService) {
            return await this.counterService.incrementEmailBought();
        }
        return false;
    }

    async incrementTokenEncrypted() {
        if (this.counterService) {
            return await this.counterService.incrementTokenEncrypted();
        }
        return false;
    }
}

module.exports = new GlobalCounterService();
