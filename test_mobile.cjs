const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13 Pro']
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5174/calendar', { waitUntil: 'load' });
  await page.waitForTimeout(3000); // give it time to render FullCalendar
  
  const harnessHeight = await page.evaluate(() => {
    const harness = document.querySelector('.fc-view-harness');
    return harness ? harness.getBoundingClientRect().height : 0;
  });
  console.log('Mobile calendar grid height is:', harnessHeight, 'px');
  
  await page.screenshot({ path: '/Users/joseluiszabala/.gemini/antigravity/brain/c79fc740-753f-4492-9ec7-c9d035d900f8/mobile_test.png' });
  await browser.close();
})();
