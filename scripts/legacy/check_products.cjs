const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').replace(/^['"]|['"]$/g, '');
    }
  });
}

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function checkStructure() {
  const snapshot = await db.collection('products').limit(20).get();
  console.log(`Found ${snapshot.docs.length} products (sample).`);
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`Product: ${doc.id} | Name: ${data.name}`);
    const vSnap = await db.collection('products').doc(doc.id).collection('variants').get();
    console.log(`  -> Variants count: ${vSnap.docs.length}`);
    vSnap.docs.forEach(v => {
      console.log(`     Variant: ${v.id} | Name: ${v.data().name} | Size: ${v.data().size}`);
    });
  }
}

checkStructure().then(() => process.exit(0)).catch(console.error);
