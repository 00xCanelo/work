const fs = require('fs');
const path = require('path');

class TokenSubmit {
    constructor() {
        this.tokensFile = path.join(process.cwd(), 'tokens.txt');
        this.ensureTokensFile();
    }

    ensureTokensFile() {
        try {
            if (!fs.existsSync(this.tokensFile)) {
                fs.writeFileSync(this.tokensFile, '', 'utf8');
            }
        } catch (error) {
            throw new Error(`Failed to create tokens file: ${error.message}`);
        }
    }

    async saveToken(encryptedToken) {
        try {
            fs.appendFileSync(this.tokensFile, encryptedToken + '\n', 'utf8');
            
            return true;
        } catch (error) {
            throw new Error(`Failed to save token: ${error.message}`);
        }
    }

    async saveAccountData(email, password, token) {
        try {
            const TokenEncryptor = require('./TokenEncryptor');
            const encryptor = new TokenEncryptor();
            
            const encryptedData = encryptor.formatAndEncrypt(email, password, token);
            
            const saved = await this.saveToken(encryptedData);
            
                         if (saved) {
                try {
                    const GlobalCounterService = require('../ServerSide/GlobalCounterService');
                    await GlobalCounterService.incrementTokenEncrypted();
                } catch (counterError) {
                    console.warn('[!] Failed to update token counter:', counterError.message);
                }
            }
            
            return saved;
            
        } catch (error) {
            throw new Error(`Failed to save account data: ${error.message}`);
        }
    }

    async readAllTokens() {
        try {
            if (!fs.existsSync(this.tokensFile)) {
                return [];
            }
            
            const content = fs.readFileSync(this.tokensFile, 'utf8');
            const lines = content.split('\n').filter(line => line.trim() !== '');
            
            return lines;
            
        } catch (error) {
            throw new Error(`Failed to read tokens: ${error.message}`);
        }
    }

    async decryptAllTokens() {
        try {
            const TokenEncryptor = require('./TokenEncryptor');
            const encryptor = new TokenEncryptor();
            
            const encryptedTokens = await this.readAllTokens();
            const decryptedTokens = [];
            
            for (const encryptedToken of encryptedTokens) {
                try {
                    const accountData = encryptor.decryptAndParse(encryptedToken);
                    decryptedTokens.push(accountData);
                } catch (error) {
                    console.log(`Failed to decrypt token: ${error.message}`);
                }
            }
            
            return decryptedTokens;
            
        } catch (error) {
            throw new Error(`Failed to decrypt tokens: ${error.message}`);
        }
    }

    async getTokenCount() {
        try {
            const tokens = await this.readAllTokens();
            return tokens.length;
        } catch (error) {
            return 0;
        }
    }
}

module.exports = TokenSubmit;
