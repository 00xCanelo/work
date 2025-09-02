const log = require('../utils/LoggerSetup');
const ErrorHandler = require('../utils/ErrorHandler');
const { getRandomDisplayName, getRandomUserName } = require('../data/Random Info');
const { emailInput, displayNameInput, usernameInput, passwordInput, continueButton, monthInput, dayInput, yearInput } = require('../data/Steps Elements');
const passwordModule = require('../data/password');
const { getTypingVariation } = require('../utils/typingSpeedSetup');
const AutomationProccessLogger = require('./AutomationProccessLogger');

class Hotmail007Process {
    constructor(page, emailBot) {
        this.page = page;
        this.emailBot = emailBot;
    }

    async execute(typingSpeed) {
        try {
            await this.runAutomation(typingSpeed);
        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'Hotmail007 process');
            throw error;
        }
    }

    async clickElement(element) {
        try {
            const box = await element.boundingBox();
            if (box) {
                await this.page.mouse.move(
                    box.x + box.width / 2 + (Math.random() - 0.5) * 5,
                    box.y + box.height / 2 + (Math.random() - 0.5) * 5,
                    { steps: 20 }
                );
                await this.page.waitForTimeout(Math.random() * 200 + 50);
                await this.page.mouse.down();
                await this.page.waitForTimeout(Math.random() * 100 + 50);
                await this.page.mouse.up();
            } else {
                throw new Error('Element not found or not visible to click');
            }
        } catch (error) {
            log.failure(`Error clicking element: ${error.message}`);
            throw error;
        }
    }

    async typeLikeHuman(element, text, typingSpeed) {
        try {
            await this.clickElement(element);
            for (const char of text) {
                await this.page.keyboard.type(char);
                const delay = getTypingVariation(typingSpeed);
                await this.page.waitForTimeout(delay);
            }
        } catch (error) {
            log.failure(`Error typing text: ${error.message}`);
            throw error;
        }
    }

    async runAutomation(typingSpeed) {
        try {
            const email = this.emailBot.getEmailAddress();

            const emailInputElement = await this.page.waitForSelector(emailInput, { visible: true });
            await this.typeLikeHuman(emailInputElement, email, typingSpeed);

            const displayName = getRandomDisplayName();
            const displayNameElement = await this.page.waitForSelector(displayNameInput, { visible: true });
            await this.typeLikeHuman(displayNameElement, displayName, typingSpeed);

            const username = getRandomUserName();
            const usernameElement = await this.page.waitForSelector(usernameInput, { visible: true });
            await this.typeLikeHuman(usernameElement, username, typingSpeed);

            const passwordElement = await this.page.waitForSelector(passwordInput, { visible: true });
            await this.typeLikeHuman(passwordElement, passwordModule.getPassword(), typingSpeed);

            const month = (Math.floor(Math.random() * 12) + 1).toString();
            const day = (Math.floor(Math.random() * 28) + 1).toString();
            const year = (Math.floor(Math.random() * (2000 - 1989 + 1)) + 1989).toString();

            await this.page.waitForSelector(monthInput, { visible: true });
            await this.page.click(monthInput);
            await this.page.waitForTimeout(100);
            await this.page.keyboard.type(month, { delay: 20 });
            await this.page.waitForTimeout(100);
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(200);

            await this.page.waitForSelector(dayInput, { visible: true });
            await this.page.click(dayInput);
            await this.page.waitForTimeout(100);
            await this.page.keyboard.type(day, { delay: 20 });
            await this.page.waitForTimeout(100);
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(200);

            await this.page.waitForSelector(yearInput, { visible: true });
            await this.page.click(yearInput);
            await this.page.waitForTimeout(100);
            await this.page.keyboard.type(year, { delay: 20 });
            await this.page.waitForTimeout(100);
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(200);
            
            AutomationProccessLogger.accountInfoTypedSuccessfully();

            const continueButtonElement = await this.page.waitForSelector(continueButton, { visible: true });
            await this.clickElement(continueButtonElement);
            AutomationProccessLogger.continueButtonPressedSuccessfully();

            const { waitForPageNavigation } = require('../utils/PageLoadingUtils');
            const { waitingToSolveCaptcha } = require('../utils/UtilsLogger');
            const TokenExtraction = require('../TokenSystem/TokenExtraction');
            const TokenSubmit = require('../TokenSystem/TokenSubmit');
            const TokenSysLogger = require('../TokenSystem/TokenSysLogger');

            waitingToSolveCaptcha();

            await waitForPageNavigation(this.page);

            TokenSysLogger.startingTokenExtraction();

            const tokenExtractor = new TokenExtraction();
            const token = await tokenExtractor.extractToken(this.page);

            const tokenSubmitter = new TokenSubmit();
            await tokenSubmitter.saveAccountData(this.emailBot.getEmailAddress(), passwordModule.getPassword(), token);

            TokenSysLogger.tokenExtractedAndSaved();

            await this.handleEmailVerification();

        } catch (error) {
            ErrorHandler.handleError(error, 'automation', 'form filling');
            throw error;
        }
    }

    async handleEmailVerification() {
        try {
            const MailServLogger = require('../MailServicesAPIs/MailServLogger');

            MailServLogger.startingSearchingForVerificationLink();

            let verificationLink = null;
            let attempts = 0;
            const maxAttempts = 30;

            while (!verificationLink && attempts < maxAttempts) {
                try {
                    verificationLink = await this.emailBot.getVerificationLink();
                    if (!verificationLink) {
                        await this.page.waitForTimeout(1000);
                        attempts++;
                    }
                } catch (error) {
                    await this.page.waitForTimeout(1000);
                    attempts++;
                }
            }

            if (verificationLink) {
                MailServLogger.verificationLinkFoundNavigating();

                await this.page.goto(verificationLink);

                MailServLogger.accountCreated();
            } else {
                log.failure('Verification link not found after maximum attempts - tool cannot complete verification');
            }



        } catch (error) {
            ErrorHandler.handleError(error, 'email', 'verification process');
        }
    }
}

module.exports = Hotmail007Process;
