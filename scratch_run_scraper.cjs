const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const stringSimilarity = require("string-similarity");

// Initialize environment
dotenv.config({ path: path.resolve('/Users/joseluiszabala/regenpept-web.nosync', '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

// We have to mock getFirestore since the service uses firebase-admin/firestore
const { getFirestore } = require("firebase-admin/firestore");

// Load the actual service
const competitorService = require('/Users/joseluiszabala/regenpept-web.nosync/functions-cron/src/services/competitor.service.js');

async function run() {
  console.log("Starting REAL competitor scrape job...");
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("No Gemini API Key found in .env.local!");
    process.exit(1);
  }
  
  try {
    const result = await competitorService.runScrapingJob(apiKey);
    console.log("Scrape job finished successfully:", result);
    process.exit(0);
  } catch (err) {
    console.error("Scrape job failed:", err);
    process.exit(1);
  }
}

run();
