/**
 * scripts/syncCoas.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * Synchronizes Certificate of Analysis (CoA) PDFs from Google Drive
 * to Firestore products.
 *
 * Usage:
 *   node scripts/syncCoas.mjs [--dry-run]
 */

import { google } from 'googleapis';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const dryRun = process.argv.includes('--dry-run');

// 1. Initialize Firebase Admin
let serviceAccount = null;
const possibleKeys = [
  resolve(__dirname, '../serviceAccountKey.json'),
  resolve(__dirname, './serviceAccountKey.json'),
  resolve(__dirname, '../firebase-adminsdk.json')
];

for (const keyPath of possibleKeys) {
  if (fs.existsSync(keyPath)) {
    try {
      serviceAccount = require(keyPath);
      console.log(`🔑 Loaded Firebase Service Account from: ${keyPath}`);
      break;
    } catch (e) {
      console.warn(`⚠️ Failed to load key from ${keyPath}:`, e.message);
    }
  }
}

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    console.log('ℹ️ No service account key found. Initializing with default app credentials.');
    initializeApp();
  }
}
const db = getFirestore();

// 2. Initialize Google Auth for Google Drive
let auth;
if (serviceAccount) {
  auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
} else {
  auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}
const drive = google.drive({ version: 'v3', auth });

// Helper to normalize names for matching
function cleanName(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Matching logic
function getMatchesForFile(fileName, products) {
  // Strip extension
  let baseName = fileName.replace(/\.[^/.]+$/, "");
  let nameLower = baseName.toLowerCase();
  
  // Clean common keywords that are part of file naming convention but not the product name
  nameLower = nameLower
    .replace(/_?coa_?/g, '')
    .replace(/_?batch_?\d*/g, '')
    .replace(/_?lot_?\d*/g, '')
    .replace(/_?analysis_?/g, '')
    .replace(/_?certificate_?/g, '');

  const cleanedFile = cleanName(nameLower);
  
  // Sort products by name length descending to check more specific names first
  const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
  
  const matches = [];
  for (const prod of sortedProducts) {
    const cleanedProd = cleanName(prod.name);
    if (!cleanedProd) continue;
    
    if (cleanedFile === cleanedProd || cleanedFile.startsWith(cleanedProd) || cleanedFile.endsWith(cleanedProd)) {
      matches.push(prod);
    }
  }
  
  return matches;
}

async function syncCoas() {
  console.log(`\n🚀 Starting CoA Synchronization... ${dryRun ? '(DRY RUN)' : ''}`);
  
  try {
    // A. Fetch active products from Firestore
    console.log('⏳ Fetching products from Firestore...');
    const productsSnap = await db.collection('products').get();
    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📦 Found ${products.length} products in database.`);

    // B. Search Google Drive for PDF files containing "coa" in name
    console.log('⏳ Querying Google Drive for CoA files...');
    const driveResponse = await drive.files.list({
      q: "mimeType = 'application/pdf' and name contains 'coa' and trashed = false",
      fields: 'files(id, name, webViewLink, webContentLink)',
      spaces: 'drive',
      pageSize: 1000
    });

    const files = driveResponse.data.files || [];
    console.log(`📄 Found ${files.length} matching PDF files on Google Drive.`);

    let matchedCount = 0;
    let updatedCount = 0;

    for (const file of files) {
      const matchedProducts = getMatchesForFile(file.name, products);
      
      if (matchedProducts.length > 0) {
        matchedCount++;
        for (const prod of matchedProducts) {
          console.log(`✅ MATCH: File "${file.name}" -> Product "${prod.name}" (${prod.id})`);
          
          if (!dryRun) {
            // Update Firestore
            await db.collection('products').doc(prod.id).update({
              coaDriveUrl: file.webViewLink,
              coaDownloadUrl: file.webContentLink,
              coaUpdatedAt: new Date().toISOString()
            });
            updatedCount++;
          } else {
            updatedCount++;
          }
        }
      } else {
        console.log(`❌ NO MATCH: File "${file.name}" could not be associated with any product.`);
      }
    }

    console.log('\n======================================');
    console.log(`📊 Sync Summary:`);
    console.log(`- Files processed: ${files.length}`);
    console.log(`- Files matched to products: ${matchedCount}`);
    console.log(`- Product documents updated: ${updatedCount}`);
    console.log('======================================\n');

  } catch (error) {
    console.error('❌ Error syncing CoAs:', error);
  }
}

syncCoas();
