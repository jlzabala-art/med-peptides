import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  const url = 'https://regenpept-web-app.web.app';
  
  console.log('Navigating to Home...');
  await page.goto(`${url}/`, { waitUntil: 'load', timeout: 60000 });
  await page.screenshot({ path: 'home_prod.png' });
  
  console.log('Navigating to Collections...');
  await page.goto(`${url}/collections`, { waitUntil: 'load', timeout: 60000 });
  await page.screenshot({ path: 'collections_prod.png' });
  
  console.log('Navigating to a Product...');
  await page.goto(`${url}/product/bpc-157`, { waitUntil: 'load', timeout: 60000 });
  await page.screenshot({ path: 'product_prod.png' });
  
  await browser.close();
  console.log('Navigation test complete.');
})();
