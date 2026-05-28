import { db } from './lib/firebase-admin.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runAudit() {
    console.log('🚀 Starting Zoho Books vs Firestore Audit...');
    
    // 1. Get all products from Firestore
    console.log('📥 Fetching products from Firestore...');
    const productSnap = await db.collection('products').get();
    const firestoreProducts = productSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    console.log(`✅ Found ${firestoreProducts.length} products in Firestore.`);

    // 2. Load Zoho Books items (exported previously or fetch now?)
    // For now, I'll assume I have a json export or I need to fetch.
    // Given the task, I should probably fetch them or use a provided list.
    // Since I have Zoho Books MCP, I can't easily iterate all in one script easily without complexity.
    // I will use the scratch/zoho_items.json if it exists, or create a mock for now to show the logic.
    
    let zohoItems = [];
    try {
        const zohoPath = join(__dirname, '../scratch/zoho_items.json');
        zohoItems = JSON.parse(readFileSync(zohoPath, 'utf8'));
        console.log(`✅ Loaded ${zohoItems.length} items from zoho_items.json`);
    } catch (e) {
        console.error('❌ Failed to load Zoho items. Please run the export script first.');
        process.exit(1);
    }

    const report = {
        matches: [],
        missingInFirestore: [],
        missingInZoho: [],
        priceMismatches: [],
        statusMismatches: []
    };

    const firestoreBySku = new Map(firestoreProducts.map(p => [p.sku, p]));
    const zohoBySku = new Map(zohoItems.map(i => [i.sku || i.item_name, i])); // Using item_name as fallback if SKU missing

    // Check Zoho -> Firestore
    for (const item of zohoItems) {
        const sku = item.sku || item.item_name;
        const firestoreProduct = firestoreBySku.get(sku);

        if (!firestoreProduct) {
            report.missingInFirestore.push({
                zohoId: item.item_id,
                name: item.item_name,
                sku: sku,
                zohoPrice: item.rate
            });
            continue;
        }

        // Compare price
        if (parseFloat(firestoreProduct.price) !== parseFloat(item.rate)) {
            report.priceMismatches.push({
                sku,
                name: item.item_name,
                firestorePrice: firestoreProduct.price,
                zohoPrice: item.rate
            });
        }

        // Compare status
        const zohoActive = item.status === 'active';
        const firestoreActive = firestoreProduct.status === 'active' || firestoreProduct.status === 'published';
        
        if (zohoActive !== firestoreActive) {
            report.statusMismatches.push({
                sku,
                name: item.item_name,
                firestoreStatus: firestoreProduct.status,
                zohoStatus: item.status
            });
        }

        report.matches.push(sku);
    }

    // Check Firestore -> Zoho
    for (const product of firestoreProducts) {
        if (!zohoBySku.has(product.sku)) {
            report.missingInZoho.push({
                firestoreId: product.id,
                name: product.name,
                sku: product.sku
            });
        }
    }

    // 3. Write report
    const reportPath = join(__dirname, '../artifacts/audit_report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Audit Summary:');
    console.log(`- Total Matches: ${report.matches.length}`);
    console.log(`- Missing in Firestore: ${report.missingInFirestore.length}`);
    console.log(`- Missing in Zoho: ${report.missingInZoho.length}`);
    console.log(`- Price Mismatches: ${report.priceMismatches.length}`);
    console.log(`- Status Mismatches: ${report.statusMismatches.length}`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

runAudit().catch(err => {
    console.error('❌ Audit failed:', err);
    process.exit(1);
});
