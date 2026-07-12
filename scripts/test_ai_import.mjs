import { execSync } from 'child_process';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

// Create a mock require for the firebase function
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function run() {
  // Initialize admin
  const serviceAccount = JSON.parse(await readFile('./serviceAccount-source.json', 'utf8'));
  try {
    initializeApp({ credential: cert(serviceAccount) });
  } catch(e) {}
  
  const db = getFirestore();
  
  // We mock the handlePrescriptionIntake function from ai_prescription.js
  const aiFuncPath = '../functions/src/http/ai_prescription.js';
  // Note: Since ai_prescription.js is CommonJS and might have side-effects, 
  // we'll just run a quick test using the logic from ai_utils.js directly 
  // or we can require it.
  
  const pdfFiles = [
    "./AI Prompts/Prescriptions/Rx peptides-Gyn - Alice Shamoon - 7th July 26.pdf",
    "./AI Prompts/Prescriptions/Rx peptides-Gyn - Alice Shamoon - 11th July 26.pdf"
  ];
  
  for (const pdf of pdfFiles) {
    console.log(`\n--- Processing: ${pdf} ---`);
    const pyScript = `
import fitz
import sys
doc = fitz.open(sys.argv[1])
print(''.join([page.get_text() for page in doc]))
`;
    // Extract text
    const text = execSync(`python -c "${pyScript.replace(/\n/g, '\\n')}" "${pdf}"`).toString();
    
    console.log("Extracted Text Preview:", text.substring(0, 150).replace(/\n/g, ' '));
    
    // Call the AI function
    // Actually, calling the cloud function code locally might fail due to dependencies or env vars (ALL_SECRETS, etc.)
    // Let's use the local API if it exists, or directly make a prompt using Gemini if the function is complex to run locally.
    console.log("To fully test the function, we would pass this text to handlePrescriptionIntake.");
  }
}

run().catch(console.error);
