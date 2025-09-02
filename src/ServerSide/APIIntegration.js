const fetch = require('node-fetch');

class APIIntegration {
    constructor() {
        this.apiBaseUrl = process.env.API_BASE_URL || 'https://cazwr-tools-api-server.onrender.com';
        this.maxRetries = Infinity;
        this.retryDelay = 5000;
    }

    async checkHWIDStatus(hwid) {
        let lastError = null;
        
        let attempt = 1;
        while (true) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/api/status/${hwid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                lastError = error;
                
                if (error.code === 'ECONNREFUSED' || 
                    error.code === 'ENOTFOUND' || 
                    error.message.includes('fetch') ||
                    error.message.includes('network timeout') ||
                    error.message.includes('timeout')) {
                    
                    await this.sleep(this.retryDelay);
                    attempt++;
                    continue;
                }
                
                throw error;
            }
        }
        
        throw new Error(`Unexpected error: ${lastError.message}`);
    }

    // getConfiguration method removed - no longer needed with hardcoded values

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleStatusResponse(statusData) {
        switch (statusData.status) {
            case 'maintenance':
                return {
                    success: false,
                    type: 'maintenance',
                    message: statusData.message || 'System is under maintenance'
                };
            
            case 'activated':
                return {
                    success: true,
                    type: 'activated',
                    username: statusData.username
                };
            
            case 'unactivated':
                return {
                    success: false,
                    type: 'unactivated',
                    message: 'HWID is not activated'
                };
            
            default:
                throw new Error(`Unknown status: ${statusData.status}`);
        }
    }
}

module.exports = APIIntegration;
