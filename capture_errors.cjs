import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  await page.goto('http://localhost:5176', {waitUntil: 'networkidle2'});
  // wait a bit for React errors to surface
  await page.waitForTimeout(5000);
  // capture screenshot of whole page
  await page.screenshot({path: 'fullpage.png', fullPage: true});
  console.log('Console errors captured:', errors);
  await browser.close();
})();
