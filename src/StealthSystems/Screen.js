async function spoofScreen(page, width = 1280, height = 1024) {
  await page.setViewport({ width, height });
  await page.evaluateOnNewDocument((w, h) => {
    Object.defineProperty(window.screen, 'width', { get: () => w });
    Object.defineProperty(window.screen, 'height', { get: () => h });
  }, width, height);
}

module.exports = spoofScreen; 