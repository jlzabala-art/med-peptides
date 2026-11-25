import assert from 'node:assert/strict';
import test from 'node:test';
import { extractDurationDays, computeRefillSchedule } from '../src/utils/refillSchedule.js';
import { normalizePrescriptionWritePayload } from '../src/utils/firestoreModelGuard.js';

test('Refill Schedule: extracts 90 days from Fagron/BioBlend text posology and instructions', () => {
  const fagronRx = {
    prescriptionDate: '2026-11-01T00:00:00Z',
    instructions: '1 capsule per day, 90 capsules for 3 months.',
  };
  assert.equal(extractDurationDays(fagronRx), 90);

  const bioblendRx = {
    prescriptionDate: '2026-11-01T00:00:00Z',
    items: [
      {
        name: 'Glutathione Pen (BioBlend)',
        instructions: 'Inject 15 clicks subcutaneously every morning. 3-month supply = 5 pens.',
      },
    ],
  };
  assert.equal(extractDurationDays(bioblendRx), 90);

  const schedule = computeRefillSchedule(bioblendRx, [], new Date('2026-11-25T00:00:00Z'));
  assert.equal(schedule.durationDays, 90);
  assert.equal(schedule.daysRemaining, 66);
  assert.equal(schedule.isTwoWeekWarning, false);
});

test('Saudi Importer Regex Guard: Semax 7500 mcg/ml never parses trailing x as quantity 7500', () => {
  const parseQty = (part) => {
    const qtyMatch = part.match(/(?:\bx\s*(\d+)\b|\b(\d+)\s*pcs\b|\b(\d+)\s*caps\b)/i);
    return qtyMatch ? (parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3], 10) || 1) : 1;
  };
  assert.equal(parseQty('Selank 7500 mcg/ml 15 ml nasal spray x 3pcs.'), 3);
  assert.equal(parseQty('Semax 7500 mcg/ml 15 ml nasal spray'), 1);
  assert.equal(parseQty('BPC157 250mcg 60 caps'), 60);
});

test('Firestore Write Guard: guarantees code, posology, durationDays, and sanitizes aberrant nasal qty', () => {
  const normalized = normalizePrescriptionWritePayload({
    id: 'RX-FAG-TEST-001',
    status: 'approved',
    dispensingForm: 'nasal_spray',
    items: [{ name: 'Semax Nasal Spray 7500 mcg/ml (15 ml)', quantity: 7500 }],
  });
  assert.equal(normalized.code, 'RX-FAG-TEST-001');
  assert.equal(normalized.items[0].quantity, 1);
  assert.equal(normalized.durationDays, 30);
  assert.ok(normalized.posology && normalized.posology.length > 10);

  const telotest = normalizePrescriptionWritePayload({
    code: 'BOX03048AATEL',
    status: 'approved',
    items: [{ name: 'Oral Astaxanthin', quantity: 100 }],
  });
  assert.equal(telotest.durationDays, 100);
  assert.equal(telotest.doctorCountry, 'UAE');

  const ksaRx = normalizePrescriptionWritePayload({
    code: 'RX-KSA-NEW-01',
    status: 'pending',
    doctorPhone: '+966 55 123 4567',
  });
  assert.equal(ksaRx.doctorCountry, 'Saudi Arabia');

  const uaeAlias = normalizePrescriptionWritePayload({
    code: 'RX-UAE-01',
    status: 'approved',
    doctorCountry: 'United Arab Emirates',
  });
  assert.equal(uaeAlias.doctorCountry, 'UAE');
});
