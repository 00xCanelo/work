async function extractToken(page) {
    try {
        const networkToken = await extractFromNetworkRequests(page, 3000);
        if (networkToken) {
            return networkToken;
        }

        const webpackToken = await extractFromModernWebpack(page);
        if (webpackToken) {
            return webpackToken;
        }

        const storageToken = await extractFromStorage(page);
        if (storageToken) {
            return storageToken;
        }

        return null;

    } catch (error) {
        return null;
    }
}

async function extractFromNetworkRequests(page, timeout = 3000) {
    return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
            page.removeAllListeners('response');
            resolve(null);
        }, timeout);
        
        const responseHandler = async (response) => {
            try {
                const url = response.url();
                
                if (url.includes('discord.com/api/') || url.includes('discordapp.com/api/')) {
                    const headers = response.headers();
                    
                    if (headers.authorization) {
                        const token = headers.authorization.replace('Bearer ', '').replace('Bot ', '');
                        if (isValidDiscordToken(token)) {
                            clearTimeout(timeoutId);
                            page.removeAllListeners('response');
                            resolve(token);
                            return;
                        }
                    }
                    
                    try {
                        const responseBody = await response.text();
                        const tokenMatch = responseBody.match(/"token":\s*"([^"]+)"/);
                        if (tokenMatch && isValidDiscordToken(tokenMatch[1])) {
                            clearTimeout(timeoutId);
                            page.removeAllListeners('response');
                            resolve(tokenMatch[1]);
                            return;
                        }
                    } catch (e) {
                    }
                }
            } catch (error) {
            }
        };
        
        page.on('response', responseHandler);
        
        page.evaluate(() => {
            try {
                if (window.location.href.includes('discord.com')) {
                    if (window.fetch) {
                        fetch('/api/v9/users/@me').catch(() => {});
                        fetch('/api/v9/gateway').catch(() => {});
                        fetch('/api/v9/channels/@me').catch(() => {});
                    }
                }
            } catch (e) {}
        });
    });
}

async function extractFromModernWebpack(page) {
    return await page.evaluate(() => {
        try {
            const webpackNames = [
                'webpackChunkDiscord_app',
                'webpackChunkdiscord_app'
            ];
            
            for (const webpackName of webpackNames) {
                if (window[webpackName]) {
                    let token = null;
                    
                    try {
                        window[webpackName].push([
                            [Math.random()],
                            {},
                            function(req) {
                                for (const moduleId in req.c) {
                                    try {
                                        const module = req.c[moduleId];
                                        if (module?.exports) {
                                            if (typeof module.exports.getToken === 'function') {
                                                const foundToken = module.exports.getToken();
                                                if (foundToken && foundToken.length > 50) {
                                                    token = foundToken;
                                                    return;
                                                }
                                            }
                                            
                                            if (module.exports.token && typeof module.exports.token === 'string' && module.exports.token.length > 50) {
                                                token = module.exports.token;
                                                return;
                                            }
                                        }
                                    } catch (e) {
                                        continue;
                                    }
                                }
                            }
                        ]);
                        
                        if (token) return token;
                    } catch (e) {
                    }
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    });
}

async function extractFromStorage(page) {
    return await page.evaluate(() => {
        try {
            if (window.localStorage) {
                const storageKeys = Object.keys(localStorage);
                for (const key of storageKeys) {
                    try {
                        const value = localStorage.getItem(key);
                        if (value) {
                            try {
                                const parsed = JSON.parse(value);
                                if (parsed.token && parsed.token.length > 50) {
                                    return parsed.token;
                                }
                            } catch (e) {
                                if (value.length > 50 && /^[A-Za-z0-9\-_\.]+$/.test(value)) {
                                    return value;
                                }
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    });
}

function isValidDiscordToken(token) {
    if (!token || typeof token !== 'string') return false;
    
    token = token.replace(/['"]/g, '');
    
    if (token.startsWith('mfa.') && token.length > 50) {
        return true;
    }
    
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
        const [userID, timestamp, hmac] = tokenParts;
        return userID.length >= 18 && timestamp.length >= 6 && hmac.length >= 27;
    }
    
    if (token.length > 50 && /^[A-Za-z0-9\-_\.]+$/.test(token)) {
        return true;
    }
    
    return false;
}

async function debugLocalStorage(page) {
    try {
        const localStorageData = await page.evaluate(() => {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                data[key] = value;
            }
            return data;
        });
        return localStorageData;
    } catch (error) {
        return {};
    }
}

async function extractTokenWithRetry(page) {
    let attempts = 0;
    
    while (true) {
        attempts++;
        
        try {
            const token = await extractToken(page);
            
            if (token && token.length > 0) {
                return token;
            }
            
            await page.waitForTimeout(1000);
            
        } catch (error) {
            await page.waitForTimeout(1000);
        }
    }
}

class TokenExtraction {
    constructor() {
        this.maxRetries = 0;
        this.retryDelay = 1000;
    }

    async extractToken(page) {
        return await extractTokenWithRetry(page);
    }

    async debugLocalStorage(page) {
        return await debugLocalStorage(page);
    }
}

module.exports = TokenExtraction;
