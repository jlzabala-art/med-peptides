const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../templates/WholesalerHome.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove firebase imports
content = content.replace(
  /import \{\s*collection,\s*query,\s*where,\s*orderBy,\s*limit,\s*onSnapshot,\s*doc,\s*updateDoc,\s*serverTimestamp,\s*getDocs\s*\} from 'firebase\/firestore';\nimport \* as fb from '\.\.\/firebase';\nconst db = fb\?\.db;/g,
  `import { wholesalerRepository } from '../repositories/wholesalerRepository';\nimport { prescriptionRepository } from '../repositories/prescriptionRepository';`
);

// 2. Replace updateDoc with prescriptionRepository
content = content.replace(/await updateDoc\(doc\(db, 'prescriptions', (.*?)\), (\{[\s\S]*?\})\);/g, "await prescriptionRepository.updatePrescription($1, $2);");

// 3. Replace serverTimestamp() with new Date().toISOString()
content = content.replace(/serverTimestamp\(\)/g, "new Date().toISOString()");

// 4. Replace Rx subscription
content = content.replace(
  /const rxQuery = query\(\s*collection\(db, 'prescriptions'\),\s*where\('wholesalerId', '==', wholesalerId\),\s*orderBy\('createdAt', 'desc'\),\s*limit\(50\)\s*\);\s*const unsubRx = onSnapshot\(\s*rxQuery,\s*\(snap\) => \{\s*setRxList\(snap\.docs\.map\(\(d\) => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);\s*setLoadingRx\(false\);\s*\},\s*\(err\) => \{\s*console\.error\('Error en onSnapshot rxList:', err\);\s*setLoadingRx\(false\);\s*\}\s*\);/g,
  `const unsubRx = wholesalerRepository.subscribeToPrescriptions(\n        wholesalerId,\n        50,\n        (data) => {\n          setRxList(data);\n          setLoadingRx(false);\n        },\n        (err) => {\n          console.error('Error en rxList:', err);\n          setLoadingRx(false);\n        }\n      );`
);

// 5. Replace Bulk Orders subscription
content = content.replace(
  /const bulkQuery = query\(\s*collection\(db, 'bulk_orders'\),\s*where\('wholesalerId', '==', wholesalerId\),\s*orderBy\('createdAt', 'desc'\),\s*limit\(10\)\s*\);\s*const unsubBulk = onSnapshot\(bulkQuery, \(snap\) => \{\s*setBulkOrders\(snap\.docs\.map\(\(d\) => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);\s*setLoadingBulk\(false\);\s*\}\);/g,
  `const unsubBulk = wholesalerRepository.subscribeToBulkOrders(wholesalerId, (data) => {\n        setBulkOrders(data);\n        setLoadingBulk(false);\n      });`
);

// 6. Replace Catalog Load
content = content.replace(
  /const \[prodSnap, protSnap\] = await Promise\.all\(\[\s*getDocs\(query\(collection\(db, 'products'\), limit\(150\)\)\),\s*getDocs\(query\(collection\(db, 'protocols'\), limit\(100\)\)\)\s*\]\);\s*const loadedProducts = prodSnap\.docs\.map\(\(d\) => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\);\s*const loadedProtocols = protSnap\.docs\.map\(\(d\) => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\);\s*setCatalogProducts\(loadedProducts\);\s*setCatalogProtocols\(loadedProtocols\);/g,
  `const { products, protocols } = await wholesalerRepository.getCatalogForRxInbox();\n      setCatalogProducts(products);\n      setCatalogProtocols(protocols);`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('WholesalerHome.jsx refactored successfully.');
