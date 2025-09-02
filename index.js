const chalk = require('chalk');
const { selectBrowser, launchBrowser } = require('./src/BrowsersSystem/Browsers.js');
const log = require('./src/utils/LoggerSetup');
const { printBranding } = require('./src/utils/Tool Ui');
const ErrorHandler = require('./src/utils/ErrorHandler');
const GlobalErrorHandler = require('./src/ServerSide/GlobalErrorHandler');
const ProcessSelector = require('./src/utils/ProcessSelector');
const UtilsLogger = require('./src/utils/UtilsLogger');
const BrowsersSysLogger = require('./src/BrowsersSystem/BrowsersSysLogger');
const AutomationProccessLogger = require('./src/Automation Processes/AutomationProccessLogger');
const StealthSysLogger = require('./src/StealthSystems/StealthSysLogger');
const Hotmail007Service = require('./src/MailServicesAPIs/Hotmail007');
const Hotmail007Process = require('./src/Automation Processes/Process For Hotmail007');
const { getTypingSpeed } = require('./src/utils/typingSpeedSetup');
const StartupManager = require('./src/utils/StartupManager');
const HeartbeatService = require('./src/ServerSide/HeartbeatService');
const spoofTimezone = require('./src/StealthSystems/Timezone');
const spoofWebGL = require('./src/StealthSystems/WebGL');
const spoofLanguages = require('./src/StealthSystems/Languages');
const spoofNavigator = require('./src/StealthSystems/Navigator');
const spoofScreen = require('./src/StealthSystems/Screen');
const spoofPermissions = require('./src/StealthSystems/Permissions');
const spoofMediaDevices = require('./src/StealthSystems/MediaDevices');
const spoofWebRTC = require('./src/StealthSystems/WebRTC');
const spoofFonts = require('./src/StealthSystems/Fonts');
const spoofAudioContext = require('./src/StealthSystems/AudioContext');
const DISCORD_REGISTER_URL = 'https://discord.com/register';
const PROXY_SERVER = null;
async function createAccount(browserChoice, emailService = null) {
    let browser = null;
    let page = null;

    while (true) {
        try {
            browser = await launchBrowser(browserChoice, DISCORD_REGISTER_URL, PROXY_SERVER);
            const pages = await browser.pages();
            page = pages[0];

            try {
                await Promise.all([
                    spoofTimezone(page), spoofWebGL(page), spoofLanguages(page),
                    spoofNavigator(page), spoofScreen(page), spoofPermissions(page),
                    spoofMediaDevices(page), spoofWebRTC(page), spoofFonts(page),
                    spoofAudioContext(page)
                ]);
            } catch (stealthError) {
                ErrorHandler.handleError(stealthError, 'stealth', 'applying stealth systems');
                throw stealthError;
            }

            StealthSysLogger.allStealthSystemsApplied();
            AutomationProccessLogger.browserReadyForAutomating();
            
            if (ProcessSelector.SELECTED_PROCESS === 'hotmail007' && emailService) {
                const yaml = require('js-yaml');
                const fs = require('fs');
                const config = yaml.load(fs.readFileSync('./config/config.yaml', 'utf8'));
                const typingSpeed = getTypingSpeed(config.typing_speed);
                const automationProcess = new Hotmail007Process(page, emailService);
                await automationProcess.execute(typingSpeed);
            }

            const inquirer = require('inquirer');
            await inquirer.prompt([
                {
                    type: 'input',
                    name: 'continue',
                    message: 'Press Enter To Create Another Account',
                    default: ''
                }
            ]);

            if (browser && browser.isConnected()) {
                await browser.close();
                browser = null;
                page = null;
            }

            const { printBrandingInstant } = require('./src/utils/Tool Ui');
            printBrandingInstant();

            const selectedEmailService = ProcessSelector.getSelectedEmailService();
            AutomationProccessLogger.creatingTokensWithService(selectedEmailService);

            if (ProcessSelector.SELECTED_PROCESS === 'hotmail007' && emailService) {
                await emailService.getNewEmail();
            }

        } catch (error) {
            ErrorHandler.handleError(error, 'browser', 'account creation');
            
            if (browser && browser.isConnected()) {
                try {
                    await browser.close();
                } catch (closeError) {
                }
            }
            
            log.warning('An error occurred. Press Enter to try again or Ctrl+C to exit.');
            await new Promise(resolve => {
                process.stdin.once('data', () => {
                    resolve();
                });
            });
        }
    }
}

function setupGracefulShutdown() {
    const shutdown = () => {
        console.log(chalk.gray('\n[!] Shutting down gracefully...'));
        if (HeartbeatService.isActive()) {
            HeartbeatService.stop();
        }
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    
    process.on('SIGTERM', shutdown);
}

(async () => {
    try {
        GlobalErrorHandler.initialize();
        
        setupGracefulShutdown();
        
        await printBranding();
        
        const startupManager = new StartupManager();
        const startupSuccess = await startupManager.initialize();
        
        if (!startupSuccess) {
            ErrorHandler.handleError(new Error('Startup process failed'), 'critical', 'main startup');
            process.exit(1);
        }
        
        UtilsLogger.pressEnterToStart();
        await new Promise(resolve => {
            process.stdin.once('data', () => {
                resolve();
            });
        });
        
        const browserChoice = await selectBrowser();

        const selectedEmailService = ProcessSelector.getSelectedEmailService();
        AutomationProccessLogger.creatingTokensWithService(selectedEmailService);

        let emailService = null;
        if (ProcessSelector.SELECTED_PROCESS === 'hotmail007') {
            emailService = new Hotmail007Service();
            await emailService.initialize();
        }

        try {
            await createAccount(browserChoice, emailService);
        } catch (error) {
            ErrorHandler.handleError(error, 'critical', 'account creation');
            process.exit(1);
        }

    } catch (error) {
        ErrorHandler.handleError(error, 'critical', 'main execution');
        process.exit(1);
    }
})();