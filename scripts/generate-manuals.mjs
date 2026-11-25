#!/usr/bin/env node
/**
 * scripts/generate-manuals.mjs
 * -----------------------------------------------------------------------------
 * Captures live screenshots of Atlas Health patient & labels pages via Chrome
 * Headless (falling back to curated baseline screenshots for auth-gated admin
 * views when run unauthenticated) and renders all 4 English Operations Manuals
 * into public/manuals/*.pdf.
 *
 * Usage:
 *   npm run manuals:refresh
 *   BASE_URL=https://www.atlashealth-services.com node scripts/generate-manuals.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const BASE_URL = process.env.BASE_URL || 'https://www.atlashealth-services.com';
const MANUALS_DIR = path.join(ROOT, 'public', 'manuals');
const SCREENSHOTS_DIR = path.join(MANUALS_DIR, 'screenshots');
const TMP_HTML_DIR = path.join(ROOT, '.tmp-manuals-html');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const CHROME_BIN = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME_BIN) {
  console.error('❌ Google Chrome binary not found. Set CHROME_PATH to generate PDF manuals.');
  process.exit(1);
}

fs.mkdirSync(MANUALS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(TMP_HTML_DIR, { recursive: true });

function captureLiveScreenshot(url, outPath) {
  try {
    execFileSync(
      CHROME_BIN,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--window-size=1440,920',
        '--virtual-time-budget=6500',
        `--screenshot=${outPath}`,
        url,
      ],
      { stdio: 'ignore', timeout: 25000 }
    );
    return fs.existsSync(outPath) && fs.statSync(outPath).size > 20000;
  } catch {
    return false;
  }
}

function resolveImgUri(filename, liveUrl = null) {
  const target = path.join(SCREENSHOTS_DIR, filename);
  if (liveUrl && process.env.SKIP_LIVE_CAPTURE !== '1') {
    const tmpTarget = path.join(TMP_HTML_DIR, `live-${filename}`);
    if (captureLiveScreenshot(liveUrl, tmpTarget)) {
      fs.copyFileSync(tmpTarget, target);
    }
  }
  return `file://${target}`;
}

function buildHtmlShell({ badge, title, subtitle, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @page { size: A4; margin: 14mm 14mm 15mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #202124; margin: 0; padding: 0; font-size: 10.2pt; line-height: 1.46; background: #fff;
    }
    .page-break { page-break-before: always; }
    .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #003666; padding-bottom: 9px; margin-bottom: 14px; }
    .brand { font-size: 12.5pt; font-weight: 800; color: #003666; }
    .brand span { color: #1a73e8; font-weight: 600; }
    .doc-badge { font-size: 8pt; font-weight: 700; color: #1a73e8; background: #e8f0fe; border: 1px solid #d2e3fc; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em; }
    h1 { font-size: 18.5pt; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; line-height: 1.2; }
    .subtitle { font-size: 10.5pt; color: #5f6368; margin: 0 0 14px 0; }
    h2 { font-size: 12.5pt; font-weight: 800; color: #003666; margin: 16px 0 8px 0; padding-left: 9px; border-left: 4px solid #1a73e8; }
    h3 { font-size: 10.5pt; font-weight: 700; color: #202124; margin: 10px 0 5px 0; }
    p { margin: 0 0 8px 0; color: #3c4043; }
    ul, ol { margin: 5px 0 10px 18px; padding: 0; }
    li { margin-bottom: 4px; color: #3c4043; }
    .callout { background: #f8fafc; border: 1px solid #dadce0; border-left: 4px solid #1a73e8; border-radius: 8px; padding: 10px 13px; margin: 10px 0; }
    .callout-green { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 10px 13px; margin: 10px 0; }
    .workflow-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
    .step-card { background: #f8fafc; border: 1px solid #dadce0; border-radius: 8px; padding: 9px; }
    .step-num { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: #1a73e8; color: #fff; font-size: 8.5pt; font-weight: 800; margin-bottom: 5px; }
    .step-title { font-size: 9pt; font-weight: 700; color: #202124; margin-bottom: 2px; }
    .step-desc { font-size: 8pt; color: #5f6368; line-height: 1.35; }
    .screenshot-box { border: 1px solid #cbd5e1; border-radius: 9px; overflow: hidden; margin: 10px 0; background: #fff; }
    .screenshot-box img { display: block; width: 100%; height: auto; }
    .screenshot-caption { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 6px 10px; font-size: 8pt; color: #5f6368; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 12px 0; font-size: 9pt; }
    th, td { border: 1px solid #dadce0; padding: 7px 9px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; color: #0f172a; font-weight: 700; }
    .case-box { border: 1px solid #dadce0; border-radius: 8px; padding: 10px 13px; margin-bottom: 10px; background: #fff; }
    .case-tag { display: inline-block; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; background: #e8f0fe; color: #1a73e8; margin-bottom: 5px; }
    .wa-bubble { background: #e7fce8; border: 1px solid #bbf7d0; border-radius: 7px; padding: 8px 10px; font-size: 8.5pt; color: #14532d; margin-top: 5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .footer-note { margin-top: 14px; padding-top: 7px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #64748b; display: flex; justify-content: space-between; }
    code { background: #f1f5f9; padding: 1px 4px; border-radius: 4px; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="brand">Atlas Health <span>Services</span></div>
    <div class="doc-badge">${badge}</div>
  </div>
  <h1>${title}</h1>
  <p class="subtitle">${subtitle}</p>
  ${bodyHtml}
  <div class="footer-note">
    <span>Atlas Health Services · Operations Manual (Auto-Synced)</span>
    <span>Updated: ${new Date().toISOString().slice(0, 10)} · ${BASE_URL}/labels</span>
  </div>
</body>
</html>`;
}

function renderPdf(htmlName, pdfFilename, htmlContent) {
  const htmlPath = path.join(TMP_HTML_DIR, htmlName);
  const pdfPath = path.join(MANUALS_DIR, pdfFilename);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  execFileSync(
    CHROME_BIN,
    [
      '--headless',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore', timeout: 30000 }
  );
  const sizeKb = Math.round(fs.statSync(pdfPath).size / 1024);
  console.log(`✅ Generated ${pdfFilename} (${sizeKb} KB)`);
}

// Refresh live screenshots of public patient views; keep auth-protected /labels baseline intact if headless hits login
const imgLabelsMain = resolveImgUri('labels-worklist-share.jpg');
const imgLabelsExpanded = resolveImgUri('labels-row-expanded.jpg');
const imgPatientGuide = resolveImgUri('patient-guide-live.png', `${BASE_URL}/rx/BOX03505AATRI?view=patient&lang=en`);
const imgPatientRefill = resolveImgUri('patient-refill-live.png', `${BASE_URL}/rx/BOX03505AATRI?view=patient&action=refill&lang=en`);

// 1. Share User Manual
renderPdf(
  'manual-share.html',
  'Atlas-Labels-Share-User-Manual-EN.pdf',
  buildHtmlShell({
    badge: 'Manual 1 · Patient Sharing',
    title: 'How to Share Prescription Guides via WhatsApp from /labels',
    subtitle: 'Post-delivery workflow for Pharmacy, Logistics, and Clinic Coordinators.',
    bodyHtml: `
      <div class="callout-green">
        <strong>Best Practice:</strong> Send the patient guide link via WhatsApp <strong>once the patient receives their package</strong>. With the medication in hand, the patient opens step-by-step instructions, logs their dose, and accesses 1-click refills.
      </div>
      <h2>1. Post-Delivery Workflow</h2>
      <div class="workflow-grid">
        <div class="step-card"><div class="step-num">1</div><div class="step-title">Print Label</div><div class="step-desc">Print Delivery &amp; Shipping labels. Row moves to <strong>Printed (1x)</strong>.</div></div>
        <div class="step-card"><div class="step-num">2</div><div class="step-title">Delivered</div><div class="step-desc">Courier confirms parcel delivery to patient or clinic.</div></div>
        <div class="step-card"><div class="step-num">3</div><div class="step-title">Click Share ▾</div><div class="step-desc">Select <strong>WhatsApp to Patient</strong> or <strong>Partner / Clinic</strong>. Row turns <strong>Sent ✓</strong>.</div></div>
        <div class="step-card"><div class="step-num">4</div><div class="step-title">Patient Guided</div><div class="step-desc">Patient views simple daily steps, storage &amp; 1-click refill.</div></div>
      </div>
      <div class="screenshot-box">
        <img src="${imgLabelsMain}" alt="Labels Share Menu" />
        <div class="screenshot-caption">Screen 1 — /labels Worklist with filters, 4-in-1 Actions capsule [ Share ▾ | Rx ↗ | Delivery | Shipping ], and Share ▾ menu.</div>
      </div>
      <div class="page-break"></div>
      <h2>2. Concrete Real-World Examples</h2>
      <div class="case-box">
        <div class="case-tag">Case 1 · Nasal Spray (#NSLBSO1640)</div>
        <p>Click <code>Share ▾</code> → <strong>WhatsApp to Patient</strong>. WhatsApp opens pre-filled with the patient's private guide link:</p>
        <div class="wa-bubble">Hi Mediluxe-Reimi, thank you for trusting Atlas Health. Here is your private treatment guide (#NSLBSO1640) with instructions &amp; 1-click refill: ${BASE_URL}/rx/NSLBSO1640?view=patient&amp;src=shared_link</div>
      </div>
      <div class="case-box">
        <div class="case-tag">Case 2 · Multi-Part Hair Regimen (#BOX03505AATRI)</div>
        <p>Patient opens the link and sees <strong>"1. What to do today"</strong> (Morning / Evening / Weekly) and can tap <strong>"Refill this part →"</strong> on any individual bottle or full kit.</p>
      </div>
      <div class="case-box">
        <div class="case-tag">Case 3 · Clinic-Managed Patient (Send to Partner / Clinic)</div>
        <p>Filter by <strong>Doctor Country</strong> (e.g., Kuwait or Saudi Arabia) and click <code>Share ▾</code> → <strong>Send to Partner / Clinic</strong> to forward the guide to the clinic coordinator.</p>
      </div>
      <div class="screenshot-box">
        <img src="${imgPatientGuide}" alt="Live Patient Guide" />
        <div class="screenshot-caption">Screen 2 — Live Patient View (/rx/BOX03505AATRI?view=patient) captured directly from production.</div>
      </div>
    `,
  })
);

// 2. Delivery Labels & QR Refill Studio Manual
renderPdf(
  'manual-delivery.html',
  'Atlas-Delivery-Labels-QR-Manual-EN.pdf',
  buildHtmlShell({
    badge: 'Manual 2 · Delivery Labels',
    title: 'Delivery Labels & QR Refill Studio Guide',
    subtitle: 'How to generate clinical bottle/box labels, bind Lot & BUD, and enable QR refills.',
    bodyHtml: `
      <h2>1. Opening Delivery Label Studio</h2>
      <p>From <code>/labels</code>, click <strong><code>Delivery</code></strong> inside the 4-in-1 Actions capsule on any prescription row (or expand the row and click <strong><code>Open Studio</code></strong>).</p>
      <ul>
        <li><strong>Single vs Multi-Part Kits:</strong> Multi-part regimens (e.g., TrichoTest 3-part kits) generate separate bottle/box labels per part while keeping clean vehicle names (<em>TrichoSol</em>, <em>Oral Capsules</em>, <em>TrichoOil</em>).</li>
        <li><strong>Queue All for Same Patient:</strong> If a patient has multiple prescriptions (<code>2 Rx</code> badge), click <strong><code>Queue all</code></strong> to batch-print all labels together.</li>
      </ul>
      <div class="screenshot-box">
        <img src="${imgLabelsExpanded}" alt="Expanded Row Studio" />
        <div class="screenshot-caption">Screen 1 — Expanded row showing Lot, BUD, Cycle, Phone, Preview PDF, and Open Studio.</div>
      </div>
      <h2>2. Lot, BUD &amp; "SCAN FOR REFILL" QR Code</h2>
      <table>
        <thead><tr><th>Field</th><th>Rule &amp; Purpose</th></tr></thead>
        <tbody>
          <tr><td><strong>Batch / Lot</strong></td><td>Auto-generated on approval (<code>PHARM-YYYY-XXXXXX</code>) or editable before printing.</td></tr>
          <tr><td><strong>BUD (Expiry)</strong></td><td>Default 90-day beyond-use date; embedded automatically in the QR URL (<code>?lot=...&amp;bud=...</code>).</td></tr>
          <tr><td><strong>QR Refill Link</strong></td><td>Scanning the label opens the exact part in <strong>3. Request Refill</strong> so patients can reorder in 1 tap.</td></tr>
        </tbody>
      </table>
      <div class="screenshot-box">
        <img src="${imgPatientRefill}" alt="Live Patient Refill Screen" />
        <div class="screenshot-caption">Screen 2 — Live 1-Click Refill screen supporting Full Regimen or Specific Parts selection.</div>
      </div>
    `,
  })
);

// 3. Shipping & Customs Labels Manual
renderPdf(
  'manual-shipping.html',
  'Atlas-Shipping-Customs-Manual-EN.pdf',
  buildHtmlShell({
    badge: 'Manual 3 · Shipping & Customs',
    title: 'Customs & Courier Shipping Labels Guide',
    subtitle: 'Preparing outer parcel labels for UAE domestic and GCC/EU international dispatch.',
    bodyHtml: `
      <h2>1. Generating a Shipping Label</h2>
      <p>Click <strong><code>Shipping</code></strong> on the right end of the Actions capsule in <code>/labels</code> to open the Shipping &amp; Customs tab for that prescription.</p>
      <div class="callout">
        <strong>Legacy ✓ Indicator:</strong> Rows showing the blue <code>Legacy ✓</code> badge under <em>Print / Imported</em> already have pre-configured customs descriptions saved on file.
      </div>
      <h2>2. Regional Dispatch Checklist (GCC &amp; International)</h2>
      <table>
        <thead><tr><th>Destination</th><th>Key Verification Steps</th></tr></thead>
        <tbody>
          <tr><td><strong>🇦🇪 UAE Domestic</strong></td><td>Verify Emirates/City, recipient mobile (<code>+971</code>), and cold-chain ice pack flag for pens/nasal sprays.</td></tr>
          <tr><td><strong>🇸🇦 KSA / 🇶🇦 Qatar / 🇰🇼 Kuwait</strong></td><td>Verify full recipient name, customs item count (e.g., 15 mL nasal spray), and commercial invoice description.</td></tr>
          <tr><td><strong>🇪🇸 EU / UK</strong></td><td>Confirm VAT/customs declaration and include original Rx PDF copy (accessible via <code>Preview PDF</code>).</td></tr>
        </tbody>
      </table>
      <h2>3. After Courier Pickup &amp; Delivery</h2>
      <p>Once the courier marks the parcel as delivered, return to <code>/labels</code> (filter by <code>Printed (1x)</code> or <code>All countries ▾</code>) and click <strong><code>Share ▾ → WhatsApp to Patient</code></strong>.</p>
    `,
  })
);

// 4. Rx Intake, Lifecycle & Country Filters Manual
renderPdf(
  'manual-intake.html',
  'Atlas-Rx-Intake-Lifecycle-Filters-Manual-EN.pdf',
  buildHtmlShell({
    badge: 'Manual 4 · Intake & Filters',
    title: 'Rx Intake, Lifecycle Stepper & Doctor Country Filters',
    subtitle: 'Importing prescriptions, updating 1-click lifecycle statuses, and filtering the worklist.',
    bodyHtml: `
      <h2>1. Creating or Importing Prescriptions</h2>
      <ul>
        <li><strong><code>Import Rx</code>:</strong> Upload Fagron PDFs or clinical spreadsheets. The system automatically assigns canonical <code>dispensingForm</code>, <code>posology</code>, <code>durationDays</code>, and normalized <code>doctorCountry</code>.</li>
        <li><strong><code>Create Rx</code>:</strong> Create a new prescription directly in seconds when an order arrives via WhatsApp or email.</li>
      </ul>
      <h2>2. 1-Click Lifecycle Stepper (Status Column)</h2>
      <p>Click the status pill (e.g., <code>Draft</code> or <code>Approved</code>) in any row to open the 5-stage popover: <strong><code>1. Rx · 2. Pay · 3. Lab · 4. Label · 5. Ship</code></strong>.</p>
      <h2>3. Filtering by Doctor Country &amp; Time Range</h2>
      <table>
        <thead><tr><th>Filter Control</th><th>How It Helps</th></tr></thead>
        <tbody>
          <tr><td><strong>Status Tabs</strong></td><td>Switch between <code>Unprinted</code>, <code>Pending Approval</code>, <code>Refills</code>, <code>Printed (1x)</code>, <code>Reprints</code>, and <code>All</code>.</td></tr>
          <tr><td><strong><code>All countries ▾</code></strong></td><td>Filter immediately by prescribing doctor country: 🇦🇪 UAE, 🇶🇦 Qatar, 🇰🇼 Kuwait, 🇸🇦 Saudi Arabia, 🇪🇸 Spain.</td></tr>
          <tr><td><strong><code>Last 30 days ▾</code></strong></td><td>Focus on recent orders (<code>7d</code> / <code>30d</code>) or expand to <code>All time</code>.</td></tr>
        </tbody>
      </table>
      <div class="screenshot-box">
        <img src="${imgLabelsMain}" alt="Labels Filters Overview" />
        <div class="screenshot-caption">Screen 1 — /labels header toolbar with Import Rx, Create Rx, Search (⌘K), Status tabs, and Country/Date filters.</div>
      </div>
    `,
  })
);

fs.rmSync(TMP_HTML_DIR, { recursive: true, force: true });
console.log('🎉 All 4 English PDF manuals refreshed in public/manuals/');
