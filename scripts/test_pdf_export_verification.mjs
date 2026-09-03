import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log('🚀 Calling /api/generate-pdf with supplierFilter=lotusland and catalogueFilter=RegenPept...');

  const payload = {
    docType: 'pricelist',
    priceTier: 'cost',
    currency: 'USD',
    isExWorks: true,
    showKitPrice: true,
    kitSize: 10,
    showPricePerMg: true,
    supplierFilter: 'lotusland',
    catalogueFilter: 'RegenPept',
    language: 'en',
    pdfLanguage: 'en',
  };

  try {
    const res = await fetch('http://localhost:3000/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('API Error:', res.status, err);
      process.exit(1);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let pdfUrl = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          console.log(`[Stream Event]: ${json.step || json.type} - ${json.message || ''}`);
          if (json.type === 'done' && (json.meta?.url || json.url)) {
            pdfUrl = json.meta?.url || json.url;
          }
        } catch {}
      }
    }

    console.log('\n📄 Result PDF URL:', pdfUrl);
    if (!pdfUrl) {
      console.error('No PDF URL returned in stream completion!');
      process.exit(1);
    }

    // Download PDF bytes
    const pdfRes = await fetch(pdfUrl);
    const pdfBytes = await pdfRes.arrayBuffer();
    const outPath = path.join(__dirname, 'test_output_regenpept.pdf');
    writeFileSync(outPath, Buffer.from(pdfBytes));
    console.log(`💾 Saved test PDF to: ${outPath}`);

  } catch (e) {
    console.error('Fetch error:', e);
    process.exit(1);
  }
}

run();
