async function spoofLanguages(page, languages = ['en-US', 'en']) {
  await page.evaluateOnNewDocument(langs => {
    Object.defineProperty(navigator, 'languages', {
      get: () => langs,
    });
  }, languages);
}

module.exports = spoofLanguages; 