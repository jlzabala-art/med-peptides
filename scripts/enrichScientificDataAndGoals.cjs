const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'med-peptides-app',
    clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
    privateKey: privateKey
  })
});

const db = admin.firestore();

// Fetch PubChem compound details
async function fetchPubChemData(compoundName) {
  try {
    const cleanName = encodeURIComponent(compoundName.replace(/[^a-zA-Z0-9\s-]/g, ''));
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${cleanName}/property/MolecularWeight,MolecularFormula,IUPACName,Title/JSON`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const props = json?.PropertyTable?.Properties?.[0];

    if (props) {
      return {
        molecularWeight: props.MolecularWeight ? parseFloat(props.MolecularWeight) : null,
        molecularFormula: props.MolecularFormula || null,
        iupacName: props.IUPACName || null,
        cid: props.CID ? String(props.CID) : null
      };
    }
  } catch (err) {
    // Silent fallback
  }
  return null;
}

// Canonical goal classification dictionary
const GOAL_RULES = [
  { goal: 'anti_aging', keywords: ['epithalon', 'epitalon', 'ghk', 'nad', 'humanin', 'semax', 'cjc', 'ipamorelin', 'nmn', 'resveratrol', 'longevity', 'aging'] },
  { goal: 'fat_loss', keywords: ['aod', 'retatrutide', 'tirzepatide', 'semaglutide', 'mots', 'slu-pp-332', '5-amino-1mq', 'tesamorelin', 'frag', 'fat', 'metabolic', 'weight'] },
  { goal: 'tissue_repair', keywords: ['bpc', 'tb-500', 'tb500', 'glow', 'klow', 'thymosin', 'll-37', 'kpv', 'ara-290', 'repair', 'recovery', 'wolverine'] },
  { goal: 'cognitive', keywords: ['semax', 'selank', 'dihexa', 'p21', 'cerebrolysin', 'noopept', 'bromantane', 'brain', 'cognitive', 'sleep', 'dsip'] },
  { goal: 'muscle_growth', keywords: ['igf', 'cjc', 'ipamorelin', 'sermorelin', 'follistatin', 'mgf', 'peg-mgf', 'ghrp', 'muscle', 'growth', 'growth hormone'] },
  { goal: 'libido_wellness', keywords: ['pt-141', 'pt141', 'bremelanotide', 'kisspeptin', 'oxytocin', 'tadalafil', 'libido', 'sexual', 'vitality'] }
];

function assignCanonicalGoals(productData, docId) {
  const textStr = `${docId} ${productData.canonicalName || ''} ${productData.name || ''} ${productData.category || ''} ${productData.description || ''}`.toLowerCase();
  const matched = new Set();

  GOAL_RULES.forEach(rule => {
    rule.keywords.forEach(kw => {
      if (textStr.includes(kw)) matched.add(rule.goal);
    });
  });

  // Mandatory Rule: Every product must have AT LEAST ONE canonical goal
  if (matched.size === 0) {
    if (productData.category === 'diagnostic' || textStr.includes('test') || textStr.includes('kit') || textStr.includes('blood')) {
      matched.add('general_health');
    } else if (productData.category === 'raw_material') {
      matched.add('tissue_repair');
    } else {
      matched.add('anti_aging'); // Default fallback for longevity & wellness research
    }
  }

  return Array.from(matched);
}

async function enrichScientificDataAndGoals() {
  console.log('--- ENRICHING SCIENTIFIC METADATA & MANDATORY CANONICAL GOALS ---');

  const pSnap = await db.collection('products').get();
  console.log(`Processing ${pSnap.size} master products...`);

  let batch = db.batch();
  let batchSize = 0;
  let enrichedGoalsCount = 0;
  let enrichedScientificCount = 0;

  // Process in chunks for PubChem API rate limit friendliness
  const CHUNK_SIZE = 10;
  const docs = pSnap.docs;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);

    await Promise.all(chunk.map(async (doc) => {
      const p = doc.data();
      const docId = doc.id;
      const name = p.canonicalName || p.name || docId;
      const updates = {};
      let needsUpdate = false;

      // 1. Ensure Mandatory Canonical Goals on 100% of products
      const canonicalGoals = assignCanonicalGoals(p, docId);
      if (JSON.stringify(p.goals || []) !== JSON.stringify(canonicalGoals)) {
        updates.goals = canonicalGoals;
        needsUpdate = true;
        enrichedGoalsCount++;
      }

      // 2. Fetch Scientific Metadata from PubChem for Peptides
      if (p.category === 'peptide' && (!p.scientificData || !p.scientificData.molecularWeight)) {
        const sci = await fetchPubChemData(name);
        if (sci) {
          updates.scientificData = {
            cid: sci.cid,
            molecularWeight: sci.molecularWeight,
            molecularFormula: sci.molecularFormula,
            iupacName: sci.iupacName,
            fetchedAt: new Date().toISOString()
          };
          needsUpdate = true;
          enrichedScientificCount++;
        }
      }

      if (needsUpdate) {
        updates.updatedAt = new Date().toISOString();
        batch.set(doc.ref, updates, { merge: true });
        batchSize++;
      }
    }));

    if (batchSize >= 300) {
      await batch.commit();
      batch = db.batch();
      batchSize = 0;
      console.log(`✓ Committed batch... (Progress: ${i + chunk.length}/${docs.length})`);
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`\n✓ SUCCESS: Enriched ${enrichedGoalsCount} products with mandatory canonical goals.`);
  console.log(`✓ SUCCESS: Enriched ${enrichedScientificCount} peptides with PubChem scientific metadata.`);
}

enrichScientificDataAndGoals().catch(console.error);
