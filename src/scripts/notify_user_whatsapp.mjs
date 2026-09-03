import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Load service account key
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
let app;
if (getApps().length === 0) {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    app = initializeApp({ credential: cert(serviceAccount) });
  } else {
    app = initializeApp();
  }
}

const db = getFirestore();

async function sendWhatsAppNotification() {
  const recipient = '+34654314490';
  const message = `🔔 *Med-Peptides Deployment & Visual System Update Complete*

✅ *Single vs. Dual-Chamber Pens*: Fully integrated with dedicated high-res pharmaceutical models (Single-Chamber Liquid Pen vs. Dual-Chamber Bypass Reconstitution Pen).
✅ *Single-Unit Rule*: 10-unit volume packs now consistently display the clean single-unit presentation model.
✅ *Procedural Visual Enrichment*: Dynamic HUD overlays (Storage, Delivery Type, Lot & Expiry) and interactive pure-SVG HPLC Chromatograms / Amino Acid Sequence ribbons deployed.
✅ *Cross-Platform Verification*: Tested and validated on Chrome for both Laptop (1280x800) and Mobile (390x844).
🚀 *Live URL*: https://med-peptides-app-27a3a.web.app`;

  const queueId = `outbox_whatsapp_${Date.now()}`;
  const outboxDoc = {
    id: queueId,
    topic: 'send_whatsapp_notification',
    idempotencyKey: `notif_${Date.now()}`,
    payload: {
      to: recipient,
      phone: recipient,
      message,
      type: 'deployment_complete',
      timestamp: new Date().toISOString()
    },
    status: 'pending',
    attempts: 0,
    maxRetries: 3,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection('operations_queue').doc(queueId).set(outboxDoc);
  console.log(`✔ WhatsApp notification enqueued successfully to ${recipient} in operations_queue [${queueId}]`);
}

sendWhatsAppNotification().catch(err => {
  console.error('Error enqueuing notification:', err);
  process.exit(1);
});
