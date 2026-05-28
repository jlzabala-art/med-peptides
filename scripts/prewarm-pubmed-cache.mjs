import { db, admin } from './lib/firebase-admin.mjs';

const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Normalizes product names to chemical base names for maximum PubMed accuracy.
 */
const getPharmaBaseName = (name) => {
  if (!name) return '';
  
  let clean = name;
  
  // 1. Parentheses handling
  const parenMatch = clean.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const content = parenMatch[1].trim();
    if (content.includes('/') || content.includes('+')) {
      const parts = content.split(/[\/+]/);
      clean = parts[0].trim();
    } else {
      // Use parenthetical synonym if chemical/pharmacological name
      if (content.toLowerCase() === 'copper peptide') {
        clean = 'GHK-Cu';
      } else {
        clean = content;
      }
    }
  }
  
  // Remove parenthetical stuff if we didn't use it
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  
  // 2. Separate blends (keep only first compound name)
  if (clean.includes('+')) {
    clean = clean.split('+')[0].trim();
  }
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }
  
  // 3. Remove "with DAC" / "without DAC" and other commercial suffixes
  clean = clean.replace(/\s+with\s+DAC\b/gi, '');
  clean = clean.replace(/\s+without\s+DAC\b/gi, '');
  clean = clean.replace(/\s+DAC\b/gi, '');
  
  // 4. Specific product mappings to maximize matches
  const upper = clean.toUpperCase().trim();
  if (upper.includes('5-AMINO 1 MQ') || upper.includes('5-AMINO-1-MQ')) {
    return '5-amino-1-methylquinolinium';
  }
  if (upper === 'LDN') {
    return 'low dose naltrexone';
  }
  if (upper === 'SNAP-8' || upper === 'SNAP 8') {
    return 'acetyl octapeptide 3';
  }
  
  // 5. Remove dosage/unit qualifiers cleanly
  clean = clean.replace(/\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|ui|spu)\b/gi, '');
  
  // 6. General commercial noise
  clean = clean.replace(/\/?\s?vial\b/gi, '');
  clean = clean.replace(/\b(pure|grade|research|grade|lyophilized|acetate)\b/gi, '');
  
  return clean.trim();
};

async function fetchPubMedForProduct(searchQuery) {
  try {
    const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.status === 429) {
      console.warn(`⚠️ NCBI Rate limit hit for query: "${searchQuery}". Retrying after delay...`);
      return { rateLimited: true };
    }
    if (!searchRes.ok) {
      throw new Error(`NCBI Search failed with status ${searchRes.status}`);
    }
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) {
      return { articles: [] };
    }

    const summaryUrl = `${API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) {
      throw new Error(`NCBI Summary failed with status ${summaryRes.status}`);
    }
    const summaryData = await summaryRes.json();

    const articles = ids.map(id => {
      const info = summaryData.result?.[id];
      if (!info) return null;
      return {
        pmid: id,
        title: (info.title || 'Scientific Publication').replace(/<\/?[^>]+(>|$)/g, ""), // Clean HTML tags
        journal: (info.fulljournalname || info.source || 'Medical Journal').toUpperCase(),
        year: info.pubdate ? parseInt(info.pubdate.substring(0, 4)) : 'N/D',
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    }).filter(Boolean);

    return { articles };
  } catch (err) {
    console.error(`Fetch error for "${searchQuery}":`, err.message);
    throw err;
  }
}

async function run() {
  const snapshot = await db.collection('products').get();
  console.log(`Fetched ${snapshot.size} products from Firestore.`);
  
  let processed = 0;
  let skipped = 0;
  let successCount = 0;
  
  for (const doc of snapshot.docs) {
    const p = doc.data();
    const slug = p.slug || p.name.toLowerCase().replace(/\s+/g, '-');
    const searchQuery = getPharmaBaseName(p.name);
    
    if (!searchQuery) {
      console.warn(`Product ID: ${doc.id} - empty search query, skipping.`);
      skipped++;
      continue;
    }

    processed++;
    console.log(`[${processed}/${snapshot.size}] Processing: "${p.name}" (Slug: "${slug}") -> Clean Query: "${searchQuery}"`);
    
    let result = null;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await fetchPubMedForProduct(searchQuery);
        if (result && result.rateLimited) {
          // If rate limited, sleep for a longer time and retry
          console.log(`Rate limited. Sleeping 2 seconds...`);
          await new Promise(r => setTimeout(r, 2000));
          retries--;
          continue;
        }
        break;
      } catch (err) {
        console.error(`Retry ${4 - retries}/3 failed:`, err.message);
        await new Promise(r => setTimeout(r, 1000));
        retries--;
      }
    }

    if (!result) {
      console.error(`❌ Could not fetch PubMed data for "${p.name}" after retries.`);
      continue;
    }

    // Save to Firestore using slug as the document ID
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days expiration
    
    await db.collection('pubmed_cache').doc(slug).set({
      productSlug: slug,
      queryUsed: searchQuery,
      articles: result.articles || [],
      expiresAt: admin.firestore.Timestamp.fromDate(expires),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`   ✅ Saved to Firestore! Articles Count: ${result.articles?.length || 0}`);
    successCount++;

    // Sleep to avoid NCBI rate limit (max 3 req/sec)
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n🎉 Pre-warming Completed!`);
  console.log(`- Total products: ${snapshot.size}`);
  console.log(`- Processed: ${processed}`);
  console.log(`- Saved: ${successCount}`);
  console.log(`- Skipped: ${skipped}`);
}

run().catch(console.error);
