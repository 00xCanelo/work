const fetch = require('node-fetch');
const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const MailServLogger = require('./MailServLogger');
const ErrorHandler = require('../utils/ErrorHandler');

class Hotmail007Service {
    constructor() {
        this.email = null;
        this.refreshToken = null;
        this.clientId = null;
        this.accessToken = null;
        this.imap = null;
        this.isConnected = false;
        
        // Prevent double email buying system
        this.currentTokenEmail = null;
        this.emailsBoughtThisSession = 0;
    }

    // Reset email tracking for new token - ensures each token gets a NEW email
    resetForNewToken() {
        this.currentTokenEmail = null;
        console.log(`[!] Reset email tracking - next token will get a NEW email`);
    }

    // Get current email count for debugging
    getEmailCount() {
        return this.emailsBoughtThisSession;
    }

    // Display current email status
    displayEmailStatus() {
        console.log(`[📊] Email Status:`);
        console.log(`     Current Email: ${this.currentTokenEmail || 'None'}`);
        console.log(`     Emails Bought: ${this.emailsBoughtThisSession}`);
    }

    async getEmailAccount() {
        try {
            const mailType = Math.random() > 0.5 ? 'hotmail' : 'outlook';
            const url = new URL('https://gapi.hotmail007.com/api/mail/getMail');
            
            // Hardcoded API key configuration
            const apiKey = 'a0ce14dd21c048d0b7b22b0d53b312ac371079'; // Replace with your actual API key
            url.searchParams.append('clientKey', apiKey);
            url.searchParams.append('mailType', mailType);
            url.searchParams.append('quantity', '1');
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
                         if (data && data.success && data.data.length > 0) {
                 const emailData = data.data[0];
                 const email = emailData.split(':')[0];
                 
                                                     // Each token gets a NEW email - always buy new email
                  this.currentTokenEmail = email;
                  this.emailsBoughtThisSession++;
                  
                  // Increment counter for each new email
                  try {
                      const GlobalCounterService = require('../ServerSide/GlobalCounterService');
                      await GlobalCounterService.incrementEmailBought();
                  } catch (counterError) {
                      ErrorHandler.handleError(counterError, 'counter', 'email counter update');
                  }
                 
                 return emailData;
            } else {
                throw new Error('Failed to get email account from API or no data returned.');
            }
        } catch (error) {
            throw error;
        }
    }

    async getAccessToken(clientId, refreshToken) {
        try {
            const body = new URLSearchParams({
                'client_id': clientId,
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken,
                'scope': 'https://outlook.office.com/IMAP.AccessAsUser.All offline_access'
            });

            const response = await fetch('https://login.live.com/oauth20_token.srf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            throw error;
        }
    }

    async initialize() {
        try {
            MailServLogger.requestingEmail();
            
            let emailAccountString;
            while (!emailAccountString) {
                try {
                    emailAccountString = await this.getEmailAccount();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            const [email, , refreshToken, clientId] = emailAccountString.split(':');

            if (!email || !refreshToken || !clientId) {
                throw new Error('Invalid email account data received from API.');
            }

            this.email = email;
            this.refreshToken = refreshToken;
            this.clientId = clientId;

            this.accessToken = await this.getAccessToken(clientId, refreshToken);

            await this.setupImapConnection();

            MailServLogger.emailAcquiredStartingProcess();
            
            return {
                email: this.email,
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                clientId: this.clientId
            };

        } catch (error) {
            throw error;
        }
    }

    async setupImapConnection() {
        const authString = `user=${this.email}\x01auth=Bearer ${this.accessToken}\x01\x01`;
        const xoauth2Token = Buffer.from(authString).toString('base64');

        this.imap = new Imap({
            xoauth2: xoauth2Token,
            host: 'outlook.office365.com',
            port: 993,
            tls: true,
            authTimeout: 120000,
            tlsOptions: {
                rejectUnauthorized: false
            }
        });

        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => {
                this.isConnected = true;
                resolve();
            });

            this.imap.once('error', (err) => {
                reject(err);
            });

            this.imap.connect();
        });
    }

    async getVerificationCode() {
        if (!this.isConnected) {
            throw new Error('IMAP not connected');
        }

        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', true, (err, box) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.imap.search(['UNSEEN', ['SUBJECT', 'Verify Email Address for Discord']], (err, results) => {
                    if (err || !results || results.length === 0) {
                        resolve(null);
                        return;
                    }

                    const f = this.imap.fetch(results, { bodies: [''], markSeen: true });
                    let codeFound = false;

                    f.on('message', (msg, seqno) => {
                        msg.on('body', (stream, info) => {
                            simpleParser(stream, (err, parsed) => {
                                if (err || codeFound) return;

                                if (parsed.text) {
                                    const codeMatch = parsed.text.match(/(\d{6})/);
                                    if (codeMatch && codeMatch[1]) {
                                        codeFound = true;
                                        resolve(codeMatch[1]);
                                    }
                                }
                            });
                        });
                    });

                    f.once('error', (err) => {
                        reject(err);
                    });
                });
            });
        });
    }

    async getVerificationLink() {
        if (!this.isConnected) {
            throw new Error('IMAP not connected');
        }

        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', true, (err, box) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.imap.search(['UNSEEN', ['SUBJECT', 'Verify Email Address for Discord']], (err, results) => {
                    if (err || !results || results.length === 0) {
                        resolve(null);
                        return;
                    }

                    const f = this.imap.fetch(results, { bodies: [''], markSeen: true });
                    let linkFound = false;

                    f.on('message', (msg, seqno) => {
                        msg.on('body', (stream, info) => {
                            simpleParser(stream, (err, parsed) => {
                                if (err || linkFound) return;

                                if (parsed.text) {
                                    const linkMatch = parsed.text.match(/(https:\/\/click\.discord\.com\/ls\/click\?upn=[^\s]+)/);
                                    if (linkMatch && linkMatch[1]) {
                                        linkFound = true;
                                        resolve(linkMatch[1]);
                                        return;
                                    }
                                }

                                if (parsed.html) {
                                    const linkMatch = parsed.html.match(/(https:\/\/click\.discord\.com\/ls\/click\?upn=[^\s]+)/);
                                    if (linkMatch && linkMatch[1]) {
                                        linkFound = true;
                                        resolve(linkMatch[1]);
                                        return;
                                    }
                                }
                            });
                        });
                    });

                    f.once('error', (err) => {
                        reject(err);
                    });
                });
            });
        });
    }

    getEmailAddress() {
        return this.email;
    }

    async getNewEmail() {
        try {
            MailServLogger.requestingEmail();
            
            let emailAccountString;
            while (!emailAccountString) {
                try {
                    emailAccountString = await this.getEmailAccount();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            const [email, , refreshToken, clientId] = emailAccountString.split(':');

            if (!email || !refreshToken || !clientId) {
                throw new Error('Invalid email account data received from API.');
            }

            this.email = email;
            this.refreshToken = refreshToken;
            this.clientId = clientId;

            this.accessToken = await this.getAccessToken(clientId, refreshToken);

            await this.setupImapConnection();

            // Duplicate email counter removed - now handled in getEmailAccount() method

            MailServLogger.emailAcquiredStartingProcess();
            
            return {
                email: this.email,
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                clientId: this.clientId
            };

        } catch (error) {
            throw error;
        }
    }

    async cleanup() {
        if (this.imap && this.isConnected) {
            this.imap.end();
            this.isConnected = false;
        }
    }
}

module.exports = Hotmail007Service;
