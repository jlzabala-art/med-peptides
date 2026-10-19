/**
 * scripts/backfill_dr_khalid_dates.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Corrects the dateIssued / deliveryDate / startDate / refillDate for ALL
 * Dr. Khalid Shukri prescriptions.
 *
 * ROOT CAUSE: The original import script hardcoded `dateIssued: '2026-06-25'`
 * for every single prescription, ignoring the real DELIVERY DATE and PROPUESTA
 * columns from the Lotusland Saudi spreadsheet.
 *
 * This script maps each prescription (by row number) to its real date from
 * the spreadsheet, then batch-updates Firestore.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';

// ── Date Mapping from the Official Lotusland Spreadsheet ──────────────────
// Format: rowNum → { delivery: 'YYYY-MM-DD' | null, propuesta: 'YYYY-MM-DD' | null }
// delivery = actual delivery date (for ORDER=YES)
// propuesta = proposal/consultation date (for ORDER=NO, or secondary date)

const DATE_MAP = {
  // Row 1: Jumanah Khayat (INV 112, ORDER YES)
  1:  { delivery: '2026-04-30', propuesta: null },
  // Row 2: Arwa Julaidan (INV 119, ORDER YES)
  2:  { delivery: '2026-04-30', propuesta: null },
  // Row 3: Hajar AlHewaiti (ORDER NO)
  3:  { delivery: null, propuesta: '2026-04-13' },
  // Row 4: Reem Julaidan (ORDER NO)
  4:  { delivery: null, propuesta: '2026-04-19' },
  // Row 5: Puja Surtani (INV 134, ORDER YES) — Singapore
  5:  { delivery: '2026-04-23', propuesta: '2026-04-24' },
  // Row 6: Dina Altayeb (ORDER NO)
  6:  { delivery: null, propuesta: '2026-04-24' },
  // Row 7: Huda Al Amoudi (INV 139, ORDER YES)
  7:  { delivery: '2026-04-28', propuesta: null },
  // Row 8: Feras Al Arfaj (INV 150, ORDER YES)
  8:  { delivery: '2026-05-03', propuesta: null },
  // Row 9: Zienat Moussawi (ORDER NO)
  9:  { delivery: null, propuesta: '2026-04-28' },
  // Row 10: Sarah Al Amoudi (INV 140, ORDER YES)
  10: { delivery: '2026-04-28', propuesta: null },
  // Row 11: Rehab Al Amoudi (INV 151, ORDER YES)
  11: { delivery: '2026-05-03', propuesta: null },
  // Row 12: Sanaa Kaisar (ORDER NO)
  12: { delivery: null, propuesta: '2026-05-03' },
  // Row 13: Sarah Al Amoudi x3 (INV 155, ORDER YES)
  13: { delivery: '2026-05-03', propuesta: null },
  // Row 14: Hoda Elshafey (INV 158, ORDER YES) — Egypt
  14: { delivery: '2026-05-09', propuesta: '2026-04-22' },
  // Row 15: Lulu Al Amoudi (ORDER NO)
  15: { delivery: null, propuesta: '2026-05-05' },
  // Row 16: Rawan Al Amoudi (ORDER NO)
  16: { delivery: null, propuesta: '2026-05-09' },
  // Row 17: Farida Kamil (ORDER NO)
  17: { delivery: null, propuesta: '2026-05-09' },
  // Row 18: Dr. Heba Saher (ORDER NO)
  18: { delivery: null, propuesta: '2026-05-10' },
  // Row 19: Nina Galvao (INV 172, ORDER YES) — UAE
  19: { delivery: '2026-05-12', propuesta: null },
  // Row 20: Darine Hamza (INV 187, ORDER YES)
  20: { delivery: '2026-05-21', propuesta: null },
  // Row 21: Marianne Chehab (ORDER NO)
  21: { delivery: null, propuesta: '2026-05-15' },
  // Row 22: Yasmine Maktabi (ORDER NO)
  22: { delivery: null, propuesta: '2026-05-19' },
  // Row 23: Alanood Aidossary (INV 186, ORDER YES)
  23: { delivery: '2026-05-21', propuesta: null },
  // Row 24: Dr. Ali Faidhi (INV 179, ORDER YES)
  24: { delivery: '2026-05-15', propuesta: null },
  // Row 25: Anna Martirosian (INV 181, ORDER YES)
  25: { delivery: '2026-05-21', propuesta: null },
  // Row 26: Natasha Demetriou (ORDER NO)
  26: { delivery: null, propuesta: '2026-05-21' },
  // Row 27: Abdulrahman Ali (INV 185, ORDER YES)
  27: { delivery: '2026-05-21', propuesta: null },
  // Row 28: Nina Galvao (INV 195, ORDER YES)
  28: { delivery: '2026-06-03', propuesta: null },
  // Row 29: Rehab Al Amoudi (INV 192 & 197, ORDER YES)
  29: { delivery: '2026-06-02', propuesta: null },
  // Row 30: Dr. Ayat (ORDER NO)
  30: { delivery: null, propuesta: '2026-06-03' },
  // Row 31: Solafa Abbas (INV 214, ORDER NO)
  31: { delivery: null, propuesta: '2026-06-03' },
  // Row 32: Aysha Qubaisi (ORDER NO)
  32: { delivery: null, propuesta: '2026-06-05' },
  // Row 33: Meshail Ibrahim (ORDER NO)
  33: { delivery: null, propuesta: '2026-06-05' },
  // Row 34: Rosha Ehsan (ORDER NO)
  34: { delivery: null, propuesta: '2026-06-06' },
  // Row 35: Judith Bach (ORDER NO) — Singapore
  35: { delivery: null, propuesta: '2026-06-06' },
  // Row 36: Nawal Alamoudi (INV 205, ORDER YES)
  36: { delivery: '2026-06-05', propuesta: null },
  // Row 37: Ahmed Khatib (ORDER NO)
  37: { delivery: null, propuesta: '2026-06-09' },
  // Row 38: Nawaf Alourfi (ORDER NO)
  38: { delivery: null, propuesta: '2026-06-10' },
  // Row 39: Yasir Aisasi (INV 222, ORDER YES)
  39: { delivery: '2026-06-10', propuesta: null },
  // Row 40: Dina Altayeb (ORDER NO)
  40: { delivery: null, propuesta: '2026-06-15' },
  // Row 41: Ranim Habib x2 (INV 223, ORDER YES)
  41: { delivery: '2026-06-18', propuesta: null },
  // Row 42: Sumathi R (INV 234, ORDER YES)
  42: { delivery: '2026-06-20', propuesta: null },
  // Row 43: Tami / Sundeep Kooner (INV 225, ORDER YES)
  43: { delivery: '2026-06-18', propuesta: null },
  // Row 48: Amina Eid (ORDER NO)
  48: { delivery: null, propuesta: '2026-07-09' },
  // Row 49: Kais Julaidan (ORDER NO)
  49: { delivery: null, propuesta: '2026-07-09' },
  // Row 51: Asma Kraimi (ORDER NO)
  51: { delivery: null, propuesta: '2026-10-05' },
  // Row 52: Nawal Alamoudi x2 (ORDER NO)
  52: { delivery: null, propuesta: '2026-07-27' },
  // Row 53: Sameera Ibrahim (ORDER NO)
  53: { delivery: null, propuesta: '2026-07-27' },
  // Row 54: Ranim Habib & Saeed Halabi (INV 265, ORDER YES)
  54: { delivery: '2026-08-10', propuesta: null },
  // Row 55: Sandra Altimawi (ORDER NO)
  55: { delivery: null, propuesta: '2026-09-14' },
  // Row 56: Nina Galvao (INV 321, ORDER YES) — 30mg/ml
  56: { delivery: '2026-10-05', propuesta: null }
};

// ── Refill Duration Estimator (in days) ──────────────────────────────────
function estimateRefillDays(prescriptionLines) {
  if (!Array.isArray(prescriptionLines) || prescriptionLines.length === 0) return 30;

  // Use the longest-duration item as the refill cycle
  let maxDays = 0;
  for (const line of prescriptionLines) {
    const name = (line.name || line.productName || '').toLowerCase();
    const qty = Number(line.quantity) || 1;

    let baseDays = 30;
    if (name.includes('nasal spray') && name.includes('15 ml')) {
      baseDays = 30; // 1 spray ≈ 30 days
    } else if (name.includes('nasal spray') && name.includes('10 ml')) {
      baseDays = 20;
    } else if (name.includes('60 caps')) {
      baseDays = 60; // 2 caps/day = 30 days, or 1 cap/day = 60 days
    } else if (name.includes('30 caps')) {
      baseDays = 30;
    } else if (name.includes('pen') || name.includes('cartridge')) {
      baseDays = 90; // Pen systems last ~3 months
    } else if (name.includes('vial')) {
      baseDays = 60; // SubQ vials ~2 months
    }

    const itemDays = baseDays * qty;
    if (itemDays > maxDays) maxDays = itemDays;
  }

  return maxDays || 30;
}

async function main() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  BACKFILLING CORRECT DATES FOR DR. KHALID PRESCRIPTIONS');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // 1. Fetch all Dr. Khalid prescriptions
  const snap = await adminDb.collection('prescriptions')
    .where('doctorId', '==', 'dr-khalid-shukri')
    .get();

  console.log(`Found ${snap.size} prescriptions for Dr. Khalid Shukri.\n`);

  const now = new Date().toISOString();
  const batch = adminDb.batch();
  let updatedCount = 0;
  let skippedCount = 0;
  const monthSummary = {};

  for (const doc of snap.docs) {
    const rx = doc.data();
    const rowNum = rx.sheetRowNumber;

    // For the two early prescriptions (RX-51885, RX-51886) that were
    // imported separately, their dates are already correct
    if (!rowNum && (doc.id === 'RX-51885' || doc.id === 'RX-51886')) {
      console.log(`   ⏭️  ${doc.id} — already has correct date: ${rx.dateIssued}`);
      skippedCount++;
      continue;
    }

    const dateEntry = DATE_MAP[rowNum];
    if (!dateEntry) {
      console.log(`   ⚠️  ${doc.id} (row ${rowNum}) — no date mapping found, skipping`);
      skippedCount++;
      continue;
    }

    const isOrdered = rx.isOrderPlaced || rx.status === 'approved';
    const primaryDate = dateEntry.delivery || dateEntry.propuesta;
    const proposalDate = dateEntry.propuesta || dateEntry.delivery;

    if (!primaryDate) {
      console.log(`   ⚠️  ${doc.id} (row ${rowNum}) — no date available, skipping`);
      skippedCount++;
      continue;
    }

    // Compute refill date
    const refillDays = estimateRefillDays(rx.prescriptionLines || rx.items);
    const startDt = new Date(primaryDate);
    const refillDt = new Date(startDt.getTime() + refillDays * 24 * 60 * 60 * 1000);
    const refillDate = refillDt.toISOString().split('T')[0];

    // Determine delivery date for orders
    const deliveryDate = isOrdered ? (dateEntry.delivery || primaryDate) : null;

    const updatePayload = {
      dateIssued: primaryDate,
      date: primaryDate,
      startDate: primaryDate,
      refillDate: refillDate,
      refillDays: refillDays,
      updatedAt: now
    };

    if (deliveryDate) {
      updatePayload.deliveryDate = deliveryDate;
    }
    if (proposalDate && proposalDate !== primaryDate) {
      updatePayload.proposalDate = proposalDate;
    }

    batch.update(doc.ref, updatePayload);
    updatedCount++;

    // Track monthly distribution for summary
    const monthKey = primaryDate.substring(0, 7); // 'YYYY-MM'
    monthSummary[monthKey] = (monthSummary[monthKey] || 0) + 1;

    console.log(`   ✅ ${doc.id} (row ${rowNum}): ${rx.dateIssued || '???'} → ${primaryDate} [refill: ${refillDate}]`);
  }

  if (updatedCount > 0) {
    await batch.commit();
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(`✅ Updated: ${updatedCount} prescriptions`);
  console.log(`⏭️  Skipped: ${skippedCount} prescriptions`);
  console.log('\n📊 New Monthly Distribution:');
  Object.entries(monthSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([month, count]) => {
      const bar = '█'.repeat(count);
      console.log(`   ${month}: ${bar} (${count})`);
    });
  console.log('══════════════════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
