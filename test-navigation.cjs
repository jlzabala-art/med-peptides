const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to Home...');
  await page.goto('https://regenpept-web-app.web.app', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'home.png' });
  
  console.log('Navigating to Collections...');
  await page.goto('https://regenpept-web-app.web.app/collections', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'collections.png' });
  
  console.log('Navigating to a Product...');
  await page.goto('https://regenpept-web-app.web.app/product/bpc-157', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'product.png' });
  
  await browser.close();
})();
