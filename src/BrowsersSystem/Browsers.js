const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const log = require('../utils/LoggerSetup');
const ErrorHandler = require('../utils/ErrorHandler');
const BrowsersSysLogger = require('./BrowsersSysLogger');

puppeteer.use(StealthPlugin());

function loadBrowserPaths() {
    try {
        const configPath = path.join(__dirname, '../../config/config.yaml');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(configContent);
        
        if (!config.browser_paths) {
            throw new Error('browser_paths not found in config.yaml');
        }
        
        return config.browser_paths;
    } catch (error) {
        ErrorHandler.handleError(error, 'config', 'config.yaml');
        return {
            chrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            edge: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
            brave: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
        };
    }
}

function checkBrowserExists(browserPath) {
    try {
        return fs.existsSync(browserPath);
    } catch (error) {
        return false;
    }
}

function getAvailableBrowsers() {
    const browserPaths = loadBrowserPaths();
    const availableBrowsers = {};
    
    for (const [browser, path] of Object.entries(browserPaths)) {
        if (checkBrowserExists(path)) {
            availableBrowsers[browser] = path;
        }
    }
    
    return availableBrowsers;
}

async function selectBrowser() {
    const availableBrowsers = getAvailableBrowsers();
    
    if (Object.keys(availableBrowsers).length === 0) {
        log.failure('No browsers found! Please check your config.yaml file.');
        process.exit(1);
    }
    
    const browserCount = Object.keys(availableBrowsers).length;
    BrowsersSysLogger.loadedBrowsers(browserCount);
    BrowsersSysLogger.chooseBrowser();
    
    const choices = Object.keys(availableBrowsers).map(browser => ({
        name: browser.charAt(0).toUpperCase() + browser.slice(1),
        value: browser
    }));
    
    const { selectedBrowser } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedBrowser',
            message: 'Select your browser:',
            choices: choices,
            default: choices[0].value
        }
    ]);
    
    BrowsersSysLogger.selectedBrowser(selectedBrowser);
    return selectedBrowser;
}

async function launchBrowser(browserChoice, startUrl = 'https://discord.com/register', proxyServer = null) {
    try {
        const browserPaths = loadBrowserPaths();
        const executablePath = browserPaths[browserChoice];
        
        if (!executablePath) {
            const error = new Error(`Browser path not found for: ${browserChoice}`);
            ErrorHandler.handleError(error, 'browser', browserChoice);
            throw error;
        }
        
        if (!checkBrowserExists(executablePath)) {
            const error = new Error(`Browser executable not found: ${executablePath}`);
            ErrorHandler.handleError(error, 'browser', browserChoice);
            throw error;
        }
        
        const launchOptions = {
            executablePath: executablePath,
            headless: false,
            args: [
                `--app=${startUrl}`,
                '--start-maximized',
                '--disable-infobars',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-default-apps',
                '--enable-features=NetworkService',
                '--no-zygote',
                '--disable-accelerated-2d-canvas'
            ],
            ignoreDefaultArgs: ['--enable-automation'],
            defaultViewport: null
        };
        
        if (proxyServer) {
            launchOptions.args.push(`--proxy-server=${proxyServer}`);
        }
        
        const browser = await puppeteer.launch(launchOptions);
        
        const pages = await browser.pages();
        const page = pages[0];
        
        return browser;
        
    } catch (error) {
        ErrorHandler.handleError(error, 'browser', browserChoice);
        throw error;
    }
}

async function closeBrowser(browser) {
    try {
        if (browser && browser.isConnected()) {
            await browser.close();
            log.info('Browser closed successfully');
        }
    } catch (error) {
        BrowsersSysLogger.errorClosingBrowser(error.message);
    }
}

function getBrowserInfo(browserChoice) {
    const browserPaths = loadBrowserPaths();
    const executablePath = browserPaths[browserChoice];
    
    return {
        name: browserChoice,
        path: executablePath,
        exists: checkBrowserExists(executablePath),
        available: Object.keys(getAvailableBrowsers()).includes(browserChoice)
    };
}

module.exports = {
    loadBrowserPaths,
    checkBrowserExists,
    getAvailableBrowsers,
    selectBrowser,
    launchBrowser,
    closeBrowser,
    getBrowserInfo
};
