const crypto = require('crypto');

class TokenEncryptor {
    constructor() {
        // Hardcoded encryption password configuration
        const encryptionPassword = 'Key123!@#$YourSecretEncryptionKey123!@#$%^&*()'; // Replace with your actual encryption password
        this.secretKey = encryptionPassword;
    }

    // updateEncryptionPassword method removed - using hardcoded value instead

    encrypt(data) {
        try {
            const key = this.secretKey;
            let encrypted = '';
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                encrypted += charCode.toString(16).padStart(2, '0');
            }
            return encrypted;
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    decrypt(encryptedData) {
        try {
            const key = this.secretKey;
            let decrypted = '';
            for (let i = 0; i < encryptedData.length; i += 2) {
                const hex = encryptedData.substr(i, 2);
                const charCode = parseInt(hex, 16) ^ key.charCodeAt((i / 2) % key.length);
                decrypted += String.fromCharCode(charCode);
            }
            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    formatAndEncrypt(email, password, token) {
        const accountData = `${email}:${password}:${token}`;
        return this.encrypt(accountData);
    }

    decryptAndParse(encryptedData) {
        const decrypted = this.decrypt(encryptedData);
        const [email, password, token] = decrypted.split(':');
        
        return {
            email,
            password,
            token
        };
    }
}

module.exports = TokenEncryptor;
