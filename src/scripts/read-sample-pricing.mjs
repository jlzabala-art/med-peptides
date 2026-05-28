import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf-8'));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const snap = await db.collection('products').limit(30).get();

const tiers = ['retail','clinic','wholesale','master'];

for (const doc of snap.docs) {
  const d = doc.data();
  const variants = d.variants ?? (d.pricing ? [d] : []);
  for (const v of variants) {
    const p = v.pricing;
    if (!p) continue;
    const vals = {};
    let full = true;
    for (const t of tiers) {
      const e = p[t] ?? p[`${t}Price`];
      const amt = e?.perUnit ?? e?.unit ?? e?.base ?? null;
      vals[t] = amt;
      if (amt == null) full = false;
    }
    if (!full) continue;

    // Show ratios relative to retail
    const r = vals.retail;
    console.log(`\n[${doc.id}] ${d.name ?? ''} — ${d.productType ?? ''}`);
    for (const t of tiers) {
      const pct = r ? ((vals[t] / r) * 100).toFixed(1) : 'N/A';
      console.log(`  ${t.padEnd(10)}: ${String(vals[t]).padStart(8)}  (${pct}% of retail)`);
    }
  }
}
