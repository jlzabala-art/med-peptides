import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

const paths = {
  uae: '/Users/joseluiszabala/.gemini/antigravity/brain/fe479ca6-3520-4166-bbf6-4ae3804a0b0c/.system_generated/steps/2840/output.txt',
  spain: '/Users/joseluiszabala/.gemini/antigravity/brain/fe479ca6-3520-4166-bbf6-4ae3804a0b0c/.system_generated/steps/2854/output.txt'
};

async function run() {
  const syncedIds = [];
  const batch = db.batch();

  for (const [orgName, path] of Object.entries(paths)) {
    try {
      const data = JSON.parse(readFileSync(path, 'utf8'));
      if (!data.contacts) continue;

      for (const c of data.contacts) {
        // We only import active vendors
        if (c.contact_type !== 'vendor') continue;

        const docId = `zoho_${c.contact_id}`;
        const ref = db.collection('wholesellers').doc(docId);

        // Extract Tax ID/VAT if present in custom fields
        let taxId = '';
        if (c.custom_fields) {
          const taxField = c.custom_fields.find(f => f.label?.toLowerCase() === 'tax id' || f.label?.toLowerCase() === 'vat');
          if (taxField) taxId = taxField.value_formatted || taxField.value || '';
        }
        if (!taxId && c.cf_tax_id) taxId = c.cf_tax_id;

        // Map fields
        const payload = {
          id: docId,
          companyName: c.company_name || c.contact_name,
          name: c.contact_name,
          zohoId: c.contact_id,
          type: 'Vendor',
          status: c.status === 'active' ? 'active' : 'inactive',
          email: c.email || '',
          phone: c.phone || c.mobile || '',
          currency: c.currency_code || 'USD',
          paymentTerms: c.payment_terms_label || 'Due on Shipment',
          taxId: taxId || c.tax_treatment || '',
          isZohoMaster: true,
          orgSource: orgName.toUpperCase(),
          createdAt: c.created_time || new Date().toISOString(),
          updatedAt: c.last_modified_time || new Date().toISOString()
        };

        batch.set(ref, payload, { merge: true });
        syncedIds.push(docId);
        console.log(`Prepared sync for: ${payload.companyName} (${orgName.toUpperCase()})`);
      }
    } catch (e) {
      console.error(`Error processing ${orgName}:`, e);
    }
  }

  if (syncedIds.length > 0) {
    await batch.commit();
    console.log(`Successfully synchronized ${syncedIds.length} Zoho Books vendors to Firestore wholesellers!`);
  } else {
    console.log('No vendors found to synchronize.');
  }
}

run().catch(console.error);
