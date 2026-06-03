const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleGenAI } = require("@google/genai");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

/**
 * Default Competitor URLs for fallback.
 */
const DEFAULT_COMPETITORS = [
  { name: "UAE Peptides", url: "https://uaepeptides.com/collections/all" },
  { name: "Peptide Sciences", url: "https://www.peptidesciences.com/peptides" },
  { name: "Limitless Life Nootropics", url: "https://limitlesslifenootropics.com/product-category/peptides/" }
];

/**
 * A helper function to fetch a webpage and attempt to parse product pricing using GenAI.
 * Since HTML is long, we'll strip most of it and keep text content.
 */
async function scrapeUrlAndParse(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    
    // Strip script and style tags to save tokens
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Use Gemini to extract the products
    const apiKey = GEMINI_API_KEY_SECRET.value();
    if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");
    const ai = new GoogleGenAI({ apiKey });
    
    // Truncate text to avoid exceeding token limits for a single prompt, although 2M tokens is plenty
    const truncatedText = textContent.slice(0, 50000); 

    const prompt = `
      You are a data extraction assistant.
      I will provide you with the raw text from a peptide/supplement e-commerce store.
      Extract a list of products with their names, dosage (in mg, if available), and price (in USD).
      If in stock status is visible, note it.
      
      Respond strictly in JSON format matching this schema:
      {
        "products": [
          { "product_name": "Tirzepatide", "dosage_mg": 10, "price_usd": 120.00, "in_stock": true }
        ]
      }
      
      Store Text:
      ${truncatedText}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(result.text);
    return parsed.products || [];
  } catch (err) {
    console.error(`Error scraping ${url}:`, err);
    return [];
  }
}

async function runScrapingJob() {
  const db = getFirestore();
  const configDoc = await db.collection("settings").doc("competitor_analysis").get();
  
  let competitors = DEFAULT_COMPETITORS;
  if (configDoc.exists) {
    const data = configDoc.data();
    if (data.targetUrls) {
      competitors = data.targetUrls.map(url => {
        try {
          const u = new URL(url);
          return { name: u.hostname.replace('www.', ''), url: url };
        } catch(e) {
          return { name: url, url: url };
        }
      });
    } else if (data.urls) {
      competitors = data.urls;
    }
  }

  const batch = db.batch();
  const timestamp = new Date().toISOString();
  
  let scrapedCount = 0;

  for (const comp of competitors) {
    console.log(`Scraping competitor: ${comp.name} at ${comp.url}`);
    const products = await scrapeUrlAndParse(comp.url);
    
    for (const prod of products) {
      if (prod.product_name && prod.price_usd) {
        const docRef = db.collection("competitor_prices").doc();
        batch.set(docRef, {
          competitor_name: comp.name,
          competitor_url: comp.url,
          product_name: prod.product_name,
          dosage_mg: prod.dosage_mg || null,
          price_usd: prod.price_usd,
          in_stock: prod.in_stock !== false, // default true
          scraped_at: timestamp
        });
        scrapedCount++;
      }
    }
  }

  if (scrapedCount > 0) {
    await batch.commit();
    console.log(`Successfully scraped and stored ${scrapedCount} competitor products.`);
  } else {
    console.log('No competitor products found to store.');
  }

  return { success: true, count: scrapedCount, timestamp };
}

// 1. Cron Job: Runs every Monday at 2:00 AM
exports.scheduledScrapeCompetitors = onSchedule({
  schedule: '0 2 * * 1',
  timeZone: 'UTC',
  memory: '1GiB',
  timeoutSeconds: 300,
  secrets: [GEMINI_API_KEY_SECRET]
}, async (event) => {
  await runScrapingJob();
});

// 2. HTTP Endpoint: To force a scan manually from the Admin Portal
exports.forceScrapeCompetitors = onRequest({
  cors: true,
  memory: '1GiB',
  timeoutSeconds: 300,
  secrets: [GEMINI_API_KEY_SECRET]
}, async (req, res) => {
  try {
    const result = await runScrapingJob();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
