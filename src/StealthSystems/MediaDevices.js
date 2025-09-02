async function spoofMediaDevices(page) {
  await page.evaluateOnNewDocument(() => {
    navigator.mediaDevices.enumerateDevices = async () => [{
      kind: 'audioinput',
      label: '',
      deviceId: 'default',
      groupId: 'default',
    }];
  });
}

module.exports = spoofMediaDevices; 