const admin = require('firebase-admin');
const dotenv = require('dotenv');
const algoliasearch = require('algoliasearch');
const path = require('path');

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

const db = admin.firestore();

// Note: algoliasearch v5 initialization
const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function backfill() {
  const snapshot = await db.collection('protocols').get();
  const records = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    
    records.push({
        objectID:    doc.id,
        name:        data.protocol_name || data.protocol_title || data.title || '',
        peptides:    Array.isArray(data.peptides) ? data.peptides : [],
        has_peptides: Array.isArray(data.peptides) && data.peptides.length > 0,
        category:    data.therapeutic_category || data.category || '',
        status:      data.status || 'draft',
        goals:       Array.isArray(data.goals) ? data.goals.join(', ') : (data.goals || ''),
        tags:        Array.isArray(data.tags) ? data.tags : [],
        description: data.description ? data.description.substring(0, 200) : '',
        phaseCount:  Array.isArray(data.phases) ? data.phases.length : 0,
        slug:        data.slug || data.protocol_slug || '',
        version:     data.version || 1,
        createdAt_ts: data.created_at ? (data.created_at.toMillis ? data.created_at.toMillis() : new Date(data.created_at).getTime()) : Date.now(),
    });
  });

  console.log(`Pushing ${records.length} protocols to Algolia index: atlas_protocols`);
  
  try {
    const { taskID } = await client.saveObjects({ indexName: 'atlas_protocols', objects: records });
    console.log(`Successfully queued indexing task: ${taskID}`);
  } catch(err) {
    console.error("Error saving to Algolia:", err);
  }
}

backfill();
