const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve('/Users/joseluiszabala/regenpept-web.nosync', '.env.local') });
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') })
  });
}
const db = admin.firestore();
async function backfill() {
  const snapshot = await db.collection('protocols').get();
  const requests = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    requests.push({
      action: "updateObject",
      body: {
        objectID: doc.id,
        protocol_name: data.protocol_name || data.title || '',
        therapeutic_category: data.therapeutic_category || data.category || '',
        status: data.status || 'draft',
        goals: data.goals || [],
        tags: data.tags || [],
        peptides: Array.isArray(data.peptides) ? data.peptides : [],
        has_peptides: Array.isArray(data.peptides) && data.peptides.length > 0,
        version_number: data.version_number || data.version || 1,
        
        // Ensure created_at exists in correct format for rendering
        created_at: data.created_at || new Date().toISOString(),
        createdAt_ts: data.created_at ? (data.created_at.toMillis ? data.created_at.toMillis() : new Date(data.created_at).getTime()) : Date.now(),
        
        // Fields for calculateClinicalCompleteness (optimized for size)
        phases: Array.isArray(data.phases) ? new Array(data.phases.length).fill(1) : [],
        duration_weeks: data.duration_weeks || null,
        dosage_schedule: Array.isArray(data.dosage_schedule) ? new Array(data.dosage_schedule.length).fill(1) : [],
        weekly_doses: data.weekly_doses || null,
        monitoring_cadence: data.monitoring_cadence || null,
        check_in_weeks: data.check_in_weeks || null,
        required_labs: Array.isArray(data.required_labs) ? new Array(data.required_labs.length).fill(1) : [],
        biomarkers: Array.isArray(data.biomarkers) ? new Array(data.biomarkers.length).fill(1) : [],
      }
    });
  });
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_ADMIN_KEY;
  const indexName = "atlas_protocols";
  console.log(`Pushing ${requests.length} protocols to Algolia index: ${indexName}`);
  try {
    const res = await fetch(`https://${appId}.algolia.net/1/indexes/${indexName}/batch`, {
      method: 'POST',
      headers: { 'X-Algolia-API-Key': apiKey, 'X-Algolia-Application-Id': appId, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    });
    if (!res.ok) throw new Error(await res.text());
    console.log(`Successfully queued indexing task:`, (await res.json()).taskID);
  } catch(err) {
    console.error("Error saving to Algolia:", err);
  }
}
backfill();
