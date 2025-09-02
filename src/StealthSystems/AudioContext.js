async function spoofAudioContext(page) {
  await page.evaluateOnNewDocument(() => {
    const copy = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (copy) {
      window.OfflineAudioContext = function(...args) {
        const ctx = new copy(...args);
        ctx.oncomplete = null;
        return ctx;
      };
    }
  });
}

module.exports = spoofAudioContext; 