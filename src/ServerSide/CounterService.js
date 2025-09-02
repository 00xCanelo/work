const fetch = require('node-fetch');

class CounterService {
    constructor() {
        this.apiBaseUrl = process.env.API_BASE_URL || 'https://cazwr-tools-api-server.onrender.com';
        this.hwid = null;
    }

    setHWID(hwid) {
        this.hwid = hwid;
    }

    async incrementEmailBought() {
        if (!this.hwid) {
            console.warn('[!] Warning: HWID not set, cannot update email bought counter');
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/counters/email-bought`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hwid: this.hwid
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[+] Email bought counter updated: ${data.newCount}`);
                return true;
            } else {
                console.warn(`[!] Failed to update email bought counter: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.warn(`[!] Error updating email bought counter: ${error.message}`);
            return false;
        }
    }

    async incrementTokenEncrypted() {
        if (!this.hwid) {
            console.warn('[!] Warning: HWID not set, cannot update token encrypted counter');
            return false;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/counters/token-encrypted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hwid: this.hwid
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`[+] Token encrypted counter updated: ${data.newCount}`);
                return true;
            } else {
                console.warn(`[!] Failed to update token encrypted counter: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.warn(`[!] Error updating token encrypted counter: ${error.message}`);
            return false;
        }
    }
}

module.exports = CounterService;
