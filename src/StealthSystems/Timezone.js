async function spoofTimezone(page, timezone = 'America/New_York') {
  await page.emulateTimezone(timezone);
}

module.exports = spoofTimezone; 