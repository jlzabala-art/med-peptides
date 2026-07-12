const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13 Pro']
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5174/calendar', { waitUntil: 'load' });
  await page.waitForTimeout(3000); // give it time to render FullCalendar
  
  // Inject some CSS to try and force the grid to expand
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      .regenera-calendar-wrapper .fc {
        height: 600px !important;
      }
      .regenera-calendar-wrapper .fc-view-harness {
        flex-grow: 1 !important;
        height: 100% !important;
      }
      .regenera-calendar-wrapper .fc-scrollgrid {
        height: 100% !important;
      }
    `;
    document.head.appendChild(style);
    
    // Force a resize event so FullCalendar recalculates
    window.dispatchEvent(new Event('resize'));
  });
  
  await page.waitForTimeout(1000);
  
  const path = '/Users/joseluiszabala/.gemini/antigravity/brain/c79fc740-753f-4492-9ec7-c9d035d900f8/mobile_test2.png';
  await page.screenshot({ path });
  console.log('Mobile test 2 screenshot saved to', path);
  
  const gridHeight = await page.evaluate(() => {
    const grid = document.querySelector('.fc-scrollgrid');
    return grid ? grid.getBoundingClientRect().height : 0;
  });
  console.log('Grid height after CSS fix:', gridHeight, 'px');
  
  await browser.close();
})();
