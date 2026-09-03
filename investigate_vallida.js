require('dotenv').config({ path: '.env.local' });
const { adminDb } = require('./src/lib/firebaseAdmin');

async function main() {
  const snapshot = await adminDb.collectionGroup('variants')
    .where('supplierName', '==', 'Vallida')
    .get();

  const all = await adminDb.collectionGroup('variants').limit(500).get();
  let vallidaVariants = [];
  all.forEach(doc => {
    const d = doc.data();
    if ((d.supplierName || '').includes('Vallida') || (d.supplier || '').includes('Vallida') || (d.supplierId || '').includes('Vallida') || (d.supplierId || '').toLowerCase().includes('vallida')) {
      vallidaVariants.push({ id: doc.id, formatId: d.formatId, format: d.format, name: d.name, ...d });
    }
  });
  console.log('Broad search found:', vallidaVariants.length);
  console.log(JSON.stringify(vallidaVariants.slice(0, 5), null, 2));
}
main().catch(console.error);
