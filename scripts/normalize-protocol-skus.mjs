import { adminDb } from '../src/lib/firebaseAdmin.js';

/**
 * Categorizes a protocol into a distinct therapeutic domain prefix
 */
function getDomainPrefix(data) {
  const cat = String(data.category || data.goal || data.therapeutic_category || '').toLowerCase();
  const name = String(data.name || data.title || '').toLowerCase();
  const slug = String(data.slug || data.protocol_slug || '').toLowerCase();
  const desc = String(data.overview_summary || data.description || '').toLowerCase();
  const combined = `${cat} ${name} ${slug} ${desc}`;

  // 1. Aesthetics, Skin & Hair
  if (
    combined.includes('aesthetic') || 
    combined.includes('dermal') || 
    combined.includes('scalp') || 
    combined.includes('follic') || 
    combined.includes('wrinkle') || 
    combined.includes('ghk-cu') || 
    combined.includes('snap-8') || 
    combined.includes('tanning') || 
    combined.includes('melanogen')
  ) {
    return 'AES';
  }

  // 2. Immune Support & Defense
  if (
    cat.includes('immune') || 
    name.includes('immune') || 
    combined.includes('thymosin alpha') || 
    combined.includes('thymulin') || 
    combined.includes('thymogen') || 
    combined.includes('kpv') || 
    combined.includes('ll-37')
  ) {
    return 'IMM';
  }

  // 3. Metabolism & Weight Management
  if (
    cat.includes('weight') || 
    cat.includes('metabol') || 
    cat.includes('body comp') || 
    name.includes('glp') || 
    name.includes('semaglutide') || 
    name.includes('tirzepatide') || 
    name.includes('retatrutide') || 
    name.includes('cagrilintide') || 
    name.includes('5-amino') || 
    name.includes('slu-pp') || 
    name.includes('adiposity')
  ) {
    return 'MET';
  }

  // 4. Cognitive & Sleep
  if (
    cat.includes('cognit') || 
    cat.includes('neuro') || 
    cat.includes('sleep') || 
    name.includes('semax') || 
    name.includes('selank') || 
    name.includes('pinealon') || 
    name.includes('dsip') || 
    name.includes('pe-22-28') || 
    name.includes('circadian') || 
    name.includes('anxiolytic')
  ) {
    return 'NEU';
  }

  // 5. Hormonal & Sexual Health
  if (
    cat.includes('hormon') || 
    cat.includes('growth hormone') || 
    cat.includes('sexual') || 
    name.includes('cjc') || 
    name.includes('ipamorelin') || 
    name.includes('pt-141') || 
    name.includes('kisspeptin') || 
    name.includes('ghrp') || 
    name.includes('hcg') || 
    name.includes('hmg') || 
    name.includes('sermorelin') || 
    name.includes('testagen') || 
    name.includes('libido') || 
    name.includes('bonding') || 
    name.includes('oxytocin')
  ) {
    return 'HOR';
  }

  // 6. Longevity & Cellular Health
  if (
    cat.includes('longev') || 
    name.includes('longevity') || 
    name.includes('epithalon') || 
    name.includes('epitalon') || 
    name.includes('nad+') || 
    name.includes('nmn') || 
    name.includes('ss-31') || 
    name.includes('mots-c') || 
    name.includes('prostamax') || 
    name.includes('telomere')
  ) {
    return 'LON';
  }

  // 7. Recovery & Tissue Repair (Default for regenerative peptides)
  return 'REC';
}

async function runNormalization() {
  if (!adminDb) {
    console.error('❌ Firestore adminDb is not initialized.');
    process.exit(1);
  }

  console.log('🔍 Fetching all protocols from Firestore...');
  const snapshot = await adminDb.collection('protocols').get();
  console.log(`📋 Found ${snapshot.size} total protocols.`);

  // Group by domain
  const domains = {
    MET: [],
    REC: [],
    LON: [],
    NEU: [],
    HOR: [],
    IMM: [],
    AES: []
  };

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const domain = getDomainPrefix(data);
    domains[domain].push({
      docId: doc.id,
      name: data.name || data.title || 'Clinical Protocol',
      category: data.category || data.goal || domain,
      existingCode: data.protocol_id || data.sku || data.code || doc.id
    });
  });

  // Sort each domain alphabetically by protocol name for deterministic numbering
  const updates = [];
  Object.entries(domains).forEach(([prefix, items]) => {
    items.sort((a, b) => a.name.localeCompare(b.name));
    items.forEach((item, index) => {
      const seq = String(index + 1).padStart(3, '0');
      const newSku = `PR-${prefix}-${seq}`;
      updates.push({
        docId: item.docId,
        name: item.name,
        category: item.category,
        oldCode: item.existingCode,
        newSku
      });
    });
  });

  console.log('\n📊 Normalized SKU Allocation Table:');
  console.log('────────────────────────────────────────────────────────────────────────────');
  console.log('Doc ID                | New SKU     | Old Code       | Protocol Name');
  console.log('────────────────────────────────────────────────────────────────────────────');
  updates.forEach(u => {
    console.log(
      u.docId.padEnd(22), '|',
      u.newSku.padEnd(11), '|',
      String(u.oldCode).substring(0, 14).padEnd(14), '|',
      u.name.substring(0, 30)
    );
  });
  console.log('────────────────────────────────────────────────────────────────────────────');
  console.log(`Total to update: ${updates.length} protocols\n`);

  // Batch commit to Firestore
  console.log('⚡ Executing Firestore batch write...');
  const batch = adminDb.batch();
  const now = new Date().toISOString();

  updates.forEach(u => {
    const ref = adminDb.collection('protocols').doc(u.docId);
    batch.update(ref, {
      sku: u.newSku,
      code: u.newSku,
      protocol_id: u.newSku,
      shortCode: u.newSku,
      sku_normalized_at: now
    });
  });

  await batch.commit();
  console.log(`✅ SUCCESS! Successfully normalized ${updates.length} protocol SKUs in Firestore.`);
}

runNormalization().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
