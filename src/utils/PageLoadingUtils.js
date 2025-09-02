async function waitForPageNavigation(page, expectedUrl = null) {
    try {
        await page.waitForNavigation({ 
            waitUntil: 'networkidle2',
            timeout: 0
        });

        await page.waitForFunction(() => {
            return document.readyState === 'complete';
        }, { timeout: 0 });

        await page.waitForTimeout(5000);

        return true;
    } catch (error) {
        throw new Error(`Navigation wait failed: ${error.message}`);
    }
}

async function hasPageNavigated(page, originalUrl) {
    const currentUrl = page.url();
    return currentUrl !== originalUrl;
}

module.exports = {
    waitForPageNavigation,
    hasPageNavigated
};