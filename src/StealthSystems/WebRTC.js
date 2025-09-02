async function spoofWebRTC(page) {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'RTCPeerConnection', {
      get: () => undefined,
    });
  });
}

module.exports = spoofWebRTC; 