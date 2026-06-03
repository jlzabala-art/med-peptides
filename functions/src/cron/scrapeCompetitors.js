const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleGenAI } = require("@google/genai");
const { defineSecret } = require("firebase-functions/params");
const stringSimilarity = require("string-similarity");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

const DEFAULT_COMPETITORS = [
  { name: "UAE Peptides", url: "https://uaepeptides.com/collections/all" },
  { name: "Peptide Sciences", url: "https://www.peptidesciences.com/peptides" },
  { name: "Limitless Life Nootropics", url: "https://limitlesslifenootropics.com/product-category/peptides/" }
];

async function scrapeUrlAndParse(url, trackPromptExtension = "") {
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
    
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const apiKey = GEMINI_API_KEY_SECRET.value();
    if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");
    const ai = new GoogleGenAI({ apiKey });
    
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
      
      ${trackPromptExtension}
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
  const configDocRef = db.collection("settings").doc("competitor_analysis");
  const configDoc = await configDocRef.get();
  
  let frequency = "Diario";
  let lastRun = null;
  let competitors = DEFAULT_COMPETITORS;
  
  if (configDoc.exists) {
    const data = configDoc.data();
    if (data.frequency) frequency = data.frequency;
    if (data.lastRun) lastRun = data.lastRun.toDate();
    
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

  // Check frequency
  if (lastRun) {
    const now = new Date();
    const diffHours = (now - lastRun) / (1000 * 60 * 60);
    let shouldRun = true;
    if (frequency === "Cada 3 días" && diffHours < 70) shouldRun = false;
    else if (frequency === "Semanal" && diffHours < 160) shouldRun = false;
    else if (frequency === "Quincenal" && diffHours < 330) shouldRun = false;
    
    if (!shouldRun) {
      console.log(`Skipping scrape, frequency is ${frequency} and last run was ${lastRun}`);
      return { success: true, skipped: true, reason: "frequency" };
    }
  }

  // Fetch tracked products
  const productsSnap = await db.collection("products").get();
  const allProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const trackedNames = allProducts.filter(p => p.trackCompetitors).map(p => p.name || p.displayName);
  
  const trackPromptExtension = trackedNames.length > 0 
    ? `\nCRITICAL: Pay special attention to finding pricing for these specific products: ${trackedNames.join(', ')}.` 
    : '';
  
  const batch = db.batch();
  const timestamp = new Date().toISOString();
  
  let scrapedCount = 0;
  let allScrapedData = [];

  for (const comp of competitors) {
    console.log(`Scraping competitor: ${comp.name} at ${comp.url}`);
    const products = await scrapeUrlAndParse(comp.url, trackPromptExtension);
    
    for (const prod of products) {
      if (prod.product_name && prod.price_usd) {
        const item = {
          competitor_name: comp.name,
          competitor_url: comp.url,
          product_name: prod.product_name,
          dosage_mg: prod.dosage_mg || null,
          price_usd: prod.price_usd,
          in_stock: prod.in_stock !== false,
          scraped_at: timestamp
        };
        allScrapedData.push(item);
        
        // Add to historical ledger
        const docRef = db.collection("competitor_prices").doc();
        batch.set(docRef, item);
        scrapedCount++;
      }
    }
  }

  // Load previous cache to compare trends
  const cacheDocRef = db.collection("settings").doc("competitor_cache");
  const cacheDoc = await cacheDocRef.get();
  const previousCache = cacheDoc.exists ? cacheDoc.data().matches || [] : [];
  
  // Calculate Multi-tier Matches and Cache
  const newCacheMatches = [];

  for (const ourProduct of allProducts) {
    const myName = (ourProduct.name || ourProduct.displayName || "").toLowerCase().trim();
    if (!myName) continue;
    
    const matchesForThisProduct = [];

    for (const compItem of allScrapedData) {
      const compName = (compItem.product_name || "").toLowerCase().trim();
      const similarity = stringSimilarity.compareTwoStrings(myName, compName);
      
      const isMatch = similarity > 0.6 || compName.includes(myName) || myName.includes(compName);
      if (isMatch) {
        
        // Compare with previous price to detect trend
        let trend = "same";
        let diff = 0;
        
        // find this competitor item in previous cache for this product
        const prevProductCache = previousCache.find(p => p.productId === ourProduct.id);
        if (prevProductCache) {
           const prevCompMatch = prevProductCache.competitors.find(c => c.competitor_name === compItem.competitor_name && c.product_name === compItem.product_name);
           if (prevCompMatch) {
             diff = compItem.price_usd - prevCompMatch.price_usd;
             if (diff > 0) trend = "up";
             else if (diff < 0) trend = "down";
           }
        }
        
        matchesForThisProduct.push({
           ...compItem,
           similarity,
           trend,
           price_diff_vs_yesterday: diff,
           ppm: compItem.dosage_mg ? (compItem.price_usd / compItem.dosage_mg) : null
        });
      }
    }

    if (matchesForThisProduct.length > 0) {
      // Sort matches by best similarity
      matchesForThisProduct.sort((a,b) => b.similarity - a.similarity);
      
      const myMg = ourProduct.mg || 1;
      
      // Calculate our PPMs
      const myPPMs = {
        retail: ourProduct.price ? (ourProduct.price / myMg) : null,
        clinic: ourProduct.clinicPrice ? (ourProduct.clinicPrice / myMg) : null,
        wholesaler: ourProduct.wholesalerPrice ? (ourProduct.wholesalerPrice / myMg) : null,
        distributor: ourProduct.distributorPrice ? (ourProduct.distributorPrice / myMg) : null,
        master: ourProduct.masterPrice ? (ourProduct.masterPrice / myMg) : null
      };

      newCacheMatches.push({
        productId: ourProduct.id,
        productName: ourProduct.name || ourProduct.displayName,
        myMg,
        myPPMs,
        competitors: matchesForThisProduct
      });
    }
  }
  
  // Save cache
  batch.set(cacheDocRef, {
     lastUpdated: timestamp,
     matches: newCacheMatches
  });

  // Update lastRun
  batch.set(configDocRef, { lastRun: new Date() }, { merge: true });

  if (scrapedCount > 0) {
    await batch.commit();
    console.log(`Successfully scraped and stored ${scrapedCount} competitor products and generated cache.`);
  } else {
    console.log('No competitor products found to store.');
  }

  return { success: true, count: scrapedCount, timestamp };
}

exports.scheduledScrapeCompetitors = onSchedule({
  schedule: '0 2 * * *',
  timeZone: 'UTC',
  memory: '1GiB',
  timeoutSeconds: 300,
  secrets: [GEMINI_API_KEY_SECRET]
}, async (event) => {
  await runScrapingJob();
});

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
