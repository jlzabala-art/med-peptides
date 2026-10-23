import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = (await import('ws')).default;
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', data => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function auditPage(targetUrl, screenshotName) {
  console.log(`\n🔍 Auditing: ${targetUrl}`);
  
  const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    '--user-data-dir=/tmp/chrome-test-profile-' + Date.now()
  ]);

  try {
    let connected = false;
    let endpoints = [];
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      try {
        endpoints = await getJson('http://127.0.0.1:9222/json/list');
        const pageTarget = endpoints.find(e => e.type === 'page' && !e.url.startsWith('chrome-extension://'));
        if (pageTarget) {
          connected = true;
          break;
        }
      } catch (e) {}
    }

    const pageTarget = endpoints.find(e => e.type === 'page' && !e.url.startsWith('chrome-extension://')) || endpoints[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating...');
    await client.send('Page.navigate', { url: targetUrl });

    // Wait 7s for full client hydration and async chunks
    await sleep(7000);

    // Evaluate in page
    const evalResult = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const footerById = document.getElementById('public-unified-footer');
        const footerTag = document.querySelector('footer');
        const footerClass = document.querySelector('.public-unified-footer');
        const anyFooter = footerById || footerTag || footerClass;
        
        const scrollHeight = document.documentElement.scrollHeight;
        const innerHeight = window.innerHeight;
        
        let footerInfo = null;
        if (anyFooter) {
          const rect = anyFooter.getBoundingClientRect();
          const style = window.getComputedStyle(anyFooter);
          footerInfo = {
            id: anyFooter.id,
            tagName: anyFooter.tagName,
            classes: anyFooter.className,
            parentTagName: anyFooter.parentElement ? anyFooter.parentElement.tagName : null,
            parentClass: anyFooter.parentElement ? anyFooter.parentElement.className : null,
            rect: { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            zIndex: style.zIndex,
            textSnippet: (anyFooter.textContent || '').slice(0, 150)
          };
        }

        // Scroll to footer
        if (anyFooter) {
          anyFooter.scrollIntoView();
        }

        return {
          title: document.title,
          url: window.location.href,
          hasFooter: !!anyFooter,
          footerInfo,
          scrollHeight,
          innerHeight
        };
      })()`,
      returnByValue: true
    });

    console.log('Audit Result:', JSON.stringify(evalResult.result.value, null, 2));

    await sleep(1000);
    const screenshotData = await client.send('Page.captureScreenshot', { format: 'png' });
    const artifactPath = `/Users/joseluiszabala/.gemini/antigravity-ide/brain/68cf828d-63c4-470e-934e-10bc0e6a254b/${screenshotName}.png`;
    fs.writeFileSync(artifactPath, Buffer.from(screenshotData.data, 'base64'));
    console.log(`📸 Screenshot saved: ${artifactPath}`);

    client.close();
  } finally {
    chromeProcess.kill();
  }
}

async function run() {
  await auditPage('https://www.atlashealth-services.com/dr/DR-ATLAS01', 'dr_portal_footer');
  await auditPage('https://www.atlashealth-services.com/rx/RX-70101', 'rx_patient_footer');
}

run().catch(console.error);
