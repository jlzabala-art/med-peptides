const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://localhost:5176', {waitUntil: 'networkidle2'});
  // wait for widget title
  await page.waitForFunction(() => document.body.innerText.includes('Liquidaciones de Doctores'), {timeout: 15000});
  // take screenshot
  await page.screenshot({path: 'widget-screenshot.png', fullPage: false});
  console.log('Screenshot saved');
  await browser.close();
})();
