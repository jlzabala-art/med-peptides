const { initializeApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const os = require('os');
const { executeUniversalParse } = require('./src/http/universal_parser_core');

initializeApp();

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSy..."; // I will pass it
    // Try to execute universal parse directly on a dummy file
    const fs = require('fs');
    const dummyPath = path.join(os.tmpdir(), 'dummy.txt');
    fs.writeFileSync(dummyPath, "test");
    const result = await executeUniversalParse(dummyPath, 'text/plain', 'RFQ', '', apiKey);
    console.log(result);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
