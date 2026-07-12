const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to local calendar...");
  await page.goto('http://localhost:5174/calendar', { waitUntil: 'load' });
  
  // Wait a bit for the calendar to render
  await page.waitForTimeout(5000);
  
  const path = '/Users/joseluiszabala/.gemini/antigravity/brain/c79fc740-753f-4492-9ec7-c9d035d900f8/calendar_screenshot.png';
  await page.screenshot({ path });
  console.log(`Screenshot saved to ${path}`);
  
  await browser.close();
})();
