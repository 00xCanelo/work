const log = require('../utils/LoggerSetup');
const ErrorHandler = require('../utils/ErrorHandler');
const { getRandomDisplayName, getRandomUserName } = require('../data/Random Info');
const { emailInput, displayNameInput, usernameInput, passwordInput, continueButton } = require('../data/Steps Elements');

class ThanosMailProcess {
    constructor(page, emailBot) {
        this.page = page;
        this.emailBot = emailBot;
        this.accountData = {
            email: '',
            displayName: '',
            username: '',
            password: '',
            token: ''
        };
    }

    async execute() {
        try {
            log.info('Starting ThanosMail automation process...');
            
            await this.generateAccountData();
            
            await this.fillRegistrationForm();
            
            await this.handleEmailVerification();
            
            await this.completeAccountSetup();
            
            await this.extractToken();
            
            log.success('ThanosMail process completed successfully!');
            return this.accountData;
            
        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'ThanosMail process');
            throw error;
        }
    }

    async generateAccountData() {
        log.info('Generating account data...');
        
        this.accountData = {
            email: this.emailBot.getEmailAddress(),
            displayName: getRandomDisplayName(),
            username: getRandomUserName(),
            password: this.generateSecurePassword(),
            token: ''
        };
        
        log.success('Account data generated');
    }

    generateSecurePassword() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    async fillRegistrationForm() {
        log.info('Filling Discord registration form...');
        
        try {
            await this.page.waitForSelector(emailInput, { timeout: 30000 });
            
            await this.page.type(emailInput, this.accountData.email);
            log.info('Email filled');
            
            await this.page.type(displayNameInput, this.accountData.displayName);
            log.info('Display name filled');
            
            await this.page.type(usernameInput, this.accountData.username);
            log.info('Username filled');
            
            await this.page.type(passwordInput, this.accountData.password);
            log.info('Password filled');
            
            await this.page.click(continueButton);
            log.success('Registration form submitted');
            
        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'filling registration form');
            throw error;
        }
    }

    async handleEmailVerification() {
        log.info('Handling ThanosMail email verification...');
        
        try {
            await this.page.waitForSelector('[data-testid="verification-code-input"]', { timeout: 45000 });
            
            const verificationCode = await this.getThanosMailVerificationCode();
            
            if (!verificationCode) {
                throw new Error('Failed to get verification code from ThanosMail');
            }
            
            await this.page.type('[data-testid="verification-code-input"]', verificationCode);
            
            await this.page.click('[data-testid="verification-submit-button"]');
            
            log.success('ThanosMail email verification completed');
            
        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'ThanosMail email verification');
            throw error;
        }
    }

    async getThanosMailVerificationCode() {
        try {
            const code = await this.emailBot.getThanosMailVerificationCode();
            return code;
        } catch (error) {
            log.warning('ThanosMail verification code retrieval failed');
            return null;
        }
    }

    async completeAccountSetup() {
        log.info('Completing account setup...');
        
        try {
            await this.handleBirthdaySelection();
            
            await this.handleAdditionalSetup();
            
            log.success('Account setup completed');
            
        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'account setup');
            throw error;
        }
    }

    async handleBirthdaySelection() {
        try {
            await this.page.click('.month_b0f4cc .css-19bomwf-control');
            await this.page.click(`[role="option"]:nth-child(${Math.floor(Math.random() * 12) + 1})`);
            
            await this.page.click('.day_b0f4cc .css-19bomwf-control');
            await this.page.click(`[role="option"]:nth-child(${Math.floor(Math.random() * 28) + 1})`);
            
            await this.page.click('.year_b0f4cc .css-19bomwf-control');
            const yearIndex = Math.floor(Math.random() * 15) + 1;
            await this.page.click(`[role="option"]:nth-child(${yearIndex})`);
            
        } catch (error) {
            log.warning('Birthday selection failed, continuing...');
        }
    }

    async handleAdditionalSetup() {
        try {
            await this.handleCaptcha();
            
            await this.handleTermsAndConditions();
            
        } catch (error) {
            log.warning('Additional setup failed, continuing...');
        }
    }

    async handleCaptcha() {
        try {
            const captchaElement = await this.page.$('[data-testid="captcha"]');
            if (captchaElement) {
                log.warning('Captcha detected - manual intervention may be required');
                await this.page.waitForTimeout(120000);
            }
        } catch (error) {
        }
    }

    async handleTermsAndConditions() {
        try {
            const termsCheckbox = await this.page.$('[data-testid="terms-checkbox"]');
            if (termsCheckbox) {
                await termsCheckbox.click();
            }
        } catch (error) {
        }
    }

    async extractToken() {
        log.info('Extracting Discord token...');
        
        try {
            await this.page.waitForTimeout(10000);
            
            const token = await this.page.evaluate(() => {
                return localStorage.getItem('token') || 
                       localStorage.getItem('discord_token') ||
                       document.querySelector('meta[name="token"]')?.content;
            });
            
            if (token) {
                this.accountData.token = token;
                log.success('Discord token extracted successfully');
            } else {
                log.warning('Could not extract Discord token');
            }
            
        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'token extraction');
        }
    }

    async cleanup() {
        try {
            if (this.emailBot && this.emailBot.cleanup) {
                await this.emailBot.cleanup();
            }
        } catch (error) {
            log.warning('Cleanup failed');
        }
    }
}

module.exports = ThanosMailProcess;
