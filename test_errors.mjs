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

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  try {
    await page.goto('http://localhost:5173', {waitUntil: 'networkidle2'});
    // wait a bit for React errors to surface
    await new Promise(r => setTimeout(r, 3000));
    console.log('Console errors captured:', JSON.stringify(errors, null, 2));
  } catch (e) {
    console.error("Failed to load page:", e.message);
  } finally {
    await browser.close();
  }
})();
