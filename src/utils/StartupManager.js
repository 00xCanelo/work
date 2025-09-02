const HWIDSystem = require('../ServerSide/HWIDSystem');
const APIIntegration = require('../ServerSide/APIIntegration');
const HeartbeatService = require('../ServerSide/HeartbeatService');
const ErrorHandler = require('./ErrorHandler');
const chalk = require('chalk');

class StartupManager {
    constructor() {
        this.hwidSystem = new HWIDSystem();
        this.apiIntegration = new APIIntegration();
        // Configuration property removed - using hardcoded values instead
    }

    async initialize() {
        try {
            await this.handleHWID();
            
            await this.checkStatus();
            
            // Configuration loading removed - using hardcoded values instead
            
            return true;
            
        } catch (error) {
            ErrorHandler.handleError(error, 'critical', 'startup initialization');
            return false;
        }
    }

    async handleHWID() {
        try {
            const hwid = await this.hwidSystem.getHWID();
            console.log(chalk.grey(`[*] Your HWID: ${hwid}`));
            this.hwid = hwid;
            
             try {
                 const GlobalCounterService = require('../ServerSide/GlobalCounterService');
                 GlobalCounterService.initialize(hwid);
                 this.counterService = GlobalCounterService;
                           } catch (counterError) {
                  ErrorHandler.handleError(counterError, 'counter', 'counter service initialization');
              }
        } catch (error) {
            throw new Error(`HWID initialization failed: ${error.message}`);
        }
    }

    async checkStatus() {
        console.log(chalk.yellowBright('[!] Checking HWID Status...'));
        
        try {
            const statusData = await this.apiIntegration.checkHWIDStatus(this.hwid);
            const result = this.apiIntegration.handleStatusResponse(statusData);
            
            if (!result.success) {
                if (result.type === 'maintenance') {
                    console.log(chalk.red(`[!] ${result.message}`));
                    console.log(chalk.yellow('[!] Exiting in 60 seconds...'));
                    await this.sleep(60000);
                    process.exit(0);
                } else if (result.type === 'unactivated') {
                    console.log(chalk.red('[-] HWID isn\'t Activated. Please contact your Admin to activate it.'));
                    console.log(chalk.yellow('[!] Exiting in 60 seconds...'));
                    await this.sleep(60000);
                    process.exit(0);
                }
            } else {
                console.log(chalk.greenBright(`[+] HWID is Activated. Welcome ${result.username}!`));
                
                try {
                    await HeartbeatService.initialize();
                    await HeartbeatService.start();
                                 } catch (heartbeatError) {
                     ErrorHandler.handleError(heartbeatError, 'heartbeat', 'heartbeat service start');
                 }
            }
            
        } catch (error) {
            ErrorHandler.handleError(error, 'critical', 'HWID status check');
            process.exit(1);
        }
    }

    // Configuration loading removed - using hardcoded values instead

    // Configuration getter removed - using hardcoded values instead

    getHWID() {
        return this.hwid;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = StartupManager;
