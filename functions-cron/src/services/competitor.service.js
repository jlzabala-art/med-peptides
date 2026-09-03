const { getFirestore } = require("firebase-admin/firestore");
const stringSimilarity = require("string-similarity");
const geminiService = require("./gemini.service");

const DEFAULT_COMPETITORS = [
  { name: "Peptide Sciences", url: "https://www.peptidesciences.com/peptides" },
  { name: "Limitless Life Nootropics", url: "https://limitlesslifenootropics.com/product-category/peptides/" },
  { name: "DN Lab Research", url: "https://dnlabresearch.com/product-category/peptides/" },
  { name: "UAE Peptides", url: "https://uaepeptides.com/collections/all" }
];

async function scrapeUrlAndParse(url, apiKey, trackPromptExtension = "") {
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

    return await geminiService.parsePricingData(apiKey, textContent, trackPromptExtension);
  } catch (err) {
    console.error(`Error scraping ${url}:`, err);
    return [];
  }
}

/**
 * Runs the competitor scraping job.
 * 
 * @param {string} apiKey - The Gemini API Key
 * @param {string|null} specificProductId - If provided, only scrapes for this specific product
 * @returns {Promise<Object>} - Job status
 */
async function runScrapingJob(apiKey, specificProductId = null) {
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
    
    if (data.targetUrls && data.targetUrls.length > 0) {
      competitors = data.targetUrls.map(url => {
        try {
          const u = new URL(url);
          return { name: u.hostname.replace('www.', ''), url: url };
        } catch(e) {
          return { name: url, url: url };
        }
      });
    } else if (data.urls && data.urls.length > 0) {
      competitors = data.urls;
    }
  }

  // Check frequency (skip if requested manually for a specific product)
  if (lastRun && !specificProductId) {
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

  // Check for queued items from the UI (e.g. Schedule Nightly Scan)
  let queuedProductIds = new Set();
  try {
    const queueSnap = await db.collection("competitor_scrape_queue").where("status", "==", "pending").get();
    queueSnap.forEach(d => queuedProductIds.add(d.id));
  } catch (e) {
    console.warn("competitor_scrape_queue note:", e.message);
  }

  // Fetch tracked products
  const productsSnap = await db.collection("products").get();
  let allProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  if (specificProductId) {
    allProducts = allProducts.filter(p => p.id === specificProductId);
  }
  
  const trackedNames = allProducts
    .filter(p => p.trackCompetitors || specificProductId || queuedProductIds.has(p.id))
    .map(p => p.canonicalName || p.name || p.displayName)
    .filter(Boolean);
  
  const trackPromptExtension = trackedNames.length > 0 
    ? `\nCRITICAL: Pay special attention to finding pricing for these specific products: ${trackedNames.join(', ')}.` 
    : '';
  
  const batch = db.batch();
  const timestamp = new Date().toISOString();
  
  let scrapedCount = 0;
  let allScrapedData = [];

  for (const comp of competitors) {
    console.log(`Scraping competitor: ${comp.name} at ${comp.url}`);
    const products = await scrapeUrlAndParse(comp.url, apiKey, trackPromptExtension);
    
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
  
  // Calculate Multi-tier Matches
  const newCacheMatches = [];

  for (const ourProduct of allProducts) {
    const myName = (ourProduct.canonicalName || ourProduct.name || ourProduct.displayName || "").toLowerCase().trim();
    if (!myName) continue;
    
    const matchesForThisProduct = [];

    for (const compItem of allScrapedData) {
      const compName = (compItem.product_name || "").toLowerCase().trim();
      const similarity = stringSimilarity.compareTwoStrings(myName, compName);
      
      const isMatch = similarity > 0.6 || compName.includes(myName) || myName.includes(compName);
      if (isMatch) {
        matchesForThisProduct.push({
           ...compItem,
           similarity: Math.round(similarity * 100) / 100,
           price_trend: "stable",
           price_diff_vs_yesterday: 0,
           ppm: compItem.dosage_mg ? (compItem.price_usd / compItem.dosage_mg) : null
        });
      }
    }

    if (matchesForThisProduct.length > 0) {
      matchesForThisProduct.sort((a,b) => b.similarity - a.similarity);
      
      let myMg = ourProduct.mg || null;
      let myRetailPrice = ourProduct.price || null;
      let myClinicPrice = ourProduct.clinicPrice || null;
      let myWholesalePrice = ourProduct.wholesalerPrice || null;
      let myAverageCost = null;

      // Extract from unified variants & commercial pricing
      if (ourProduct.variants && ourProduct.variants.length > 0) {
        const costs = [];
        ourProduct.variants.forEach(v => {
          const dose = parseFloat(v.dosage || v.dose || 1) || 1;
          if (!myMg) myMg = dose;
          const unitCost = v.unit_price ?? v.price;
          if (typeof unitCost === 'number' && unitCost > 0) {
            costs.push(unitCost / dose);
          }
          if (v.commercial_pricing) {
            if (!myRetailPrice && v.commercial_pricing.retail_price) myRetailPrice = v.commercial_pricing.retail_price;
            if (!myClinicPrice && v.commercial_pricing.clinic_price) myClinicPrice = v.commercial_pricing.clinic_price;
            if (!myWholesalePrice && v.commercial_pricing.wholesale_price) myWholesalePrice = v.commercial_pricing.wholesale_price;
          }
        });
        if (costs.length > 0) {
          myAverageCost = costs.reduce((a, b) => a + b, 0) / costs.length;
        }
      }

      const effectiveMg = myMg || 1;

      const myPPMs = {
        retail: myRetailPrice ? (myRetailPrice / effectiveMg) : null,
        clinic: myClinicPrice ? (myClinicPrice / effectiveMg) : null,
        wholesaler: myWholesalePrice ? (myWholesalePrice / effectiveMg) : null,
        distributor: ourProduct.distributorPrice ? (ourProduct.distributorPrice / effectiveMg) : null,
        master: ourProduct.masterPrice ? (ourProduct.masterPrice / effectiveMg) : null
      };

      newCacheMatches.push({
        productId: ourProduct.id,
        productName: ourProduct.canonicalName || ourProduct.name || ourProduct.displayName,
        myMg: effectiveMg,
        myPPMs,
        myAverageCost,
        competitors: matchesForThisProduct,
        lastUpdated: timestamp
      });
    }
  }
  
  // Save cache individually
  let kpiTotalMatches = 0;
  let kpiNeedsAdjustment = 0;
  let kpiHighlyCompetitive = 0;
  
  for (const match of newCacheMatches) {
    let totalCompPPM = 0;
    let validComps = 0;
    for (const comp of match.competitors) {
      if (comp.ppm) {
        totalCompPPM += comp.ppm;
        validComps++;
      }
    }
    const avgPpm = validComps > 0 ? (totalCompPPM / validComps) : null;
    
    // Fetch previous history
    const docRef = db.collection("competitor_analysis_results").doc(match.productId);
    const existingDoc = await docRef.get();
    let history = [];
    if (existingDoc.exists) {
      history = existingDoc.data().history || [];
    }
    
    if (avgPpm) {
      history.push({ date: timestamp, avgPpm });
      if (history.length > 30) history = history.slice(-30);
    }
    
    match.history = history;
    batch.set(docRef, match);

    // KPI calculation (using retail tier as benchmark)
    kpiTotalMatches++;
    const myRetailPPM = match.myPPMs?.retail;
    if (myRetailPPM) {
      let isCheaper = true;
      let isExpensive = true;
      match.competitors.forEach(comp => {
        if (!comp.ppm) return;
        if (myRetailPPM - comp.ppm > 0.05) isCheaper = false;
        if (myRetailPPM - comp.ppm < -0.05) isExpensive = false;
      });
      if (isCheaper) kpiHighlyCompetitive++;
      if (isExpensive) kpiNeedsAdjustment++;
    }

    // Mark queued scan completed
    if (queuedProductIds.has(match.productId)) {
      const qRef = db.collection("competitor_scrape_queue").doc(match.productId);
      batch.set(qRef, { status: "completed", completedAt: timestamp }, { merge: true });
    }
  }

  // Save global KPIs if global run
  if (!specificProductId) {
    const kpiRef = db.collection("settings").doc("competitor_kpis");
    batch.set(kpiRef, {
      totalMatches: kpiTotalMatches,
      highlyCompetitive: kpiHighlyCompetitive,
      needsAdjustment: kpiNeedsAdjustment,
      lastUpdated: timestamp
    });
    batch.set(configDocRef, { lastRun: new Date() }, { merge: true });
  }

  if (scrapedCount > 0 || newCacheMatches.length > 0) {
    await batch.commit();
    console.log(`Successfully scraped and stored competitor pricing results.`);
  }

  return { success: true, count: scrapedCount, matches: newCacheMatches.length, timestamp };
}

module.exports = {
  runScrapingJob
};
