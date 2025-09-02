const fetch = require('node-fetch');
const chalk = require('chalk');
const HWIDSystem = require('./HWIDSystem');

class HeartbeatService {
    constructor() {
        this.hwid = null;
        this.interval = null;
        this.apiBaseUrl = process.env.API_BASE_URL || 'https://cazwr-tools-api-server.onrender.com';
        this.isRunning = false;
    }

    async initialize() {
        try {
            const hwidSystem = new HWIDSystem();
            this.hwid = await hwidSystem.getHWID();
        } catch (error) {
            console.error(chalk.red('[!] Failed to initialize heartbeat service:', error.message));
        }
    }

    async start() {
        if (this.isRunning) {
            return;
        }

        if (!this.hwid) {
            console.error(chalk.red('[!] Cannot start heartbeat: HWID not available'));
            return;
        }

        this.isRunning = true;

        await this.sendHeartbeat();

        this.interval = setInterval(async () => {
            await this.sendHeartbeat();
        }, 5000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    async sendHeartbeat() {
        if (!this.hwid) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/heartbeat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hwid: this.hwid
                })
            });

            if (!response.ok) {
                return;
            }

        } catch (error) {
            return;
        }
    }

    isActive() {
        return this.isRunning;
    }
}

module.exports = new HeartbeatService();
