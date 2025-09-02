async function spoofFonts(page, fonts = ['Arial', 'Verdana', 'Times New Roman']) {
  await page.evaluateOnNewDocument(fonts => {
    Object.defineProperty(document, 'fonts', {
      get: () => fonts,
    });
  }, fonts);
}

module.exports = spoofFonts; 