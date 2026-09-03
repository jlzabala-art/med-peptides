import assert from 'node:assert/strict';

console.log('🧪 Starting Reconstitution & Dosing Calculator Test Suite...\n');

function calculateReconstitution({ vialMg, bacWaterMl, desiredDoseMcg }) {
  const concentrationMgMl = bacWaterMl > 0 ? vialMg / bacWaterMl : 0;
  const concentrationMcgUnit = concentrationMgMl * 10;
  const unitsToInject = Math.round((desiredDoseMcg / concentrationMcgUnit) * 10) / 10;
  const volumeMl = unitsToInject / 100;
  const totalDoses = Math.floor((vialMg * 1000) / desiredDoseMcg);
  const penClicks = Math.round(unitsToInject);

  return {
    concentrationMgMl,
    concentrationMcgUnit,
    unitsToInject,
    volumeMl,
    totalDoses,
    penClicks
  };
}

// --- TEST 1: Tirzepatide 10mg in 2.0mL BAC Water (2.5mg Dose) ---
console.log('▶ Test 1: Tirzepatide 10mg + 2.0mL BAC Water (2.5mg Induction Dose)');
const t1 = calculateReconstitution({ vialMg: 10, bacWaterMl: 2.0, desiredDoseMcg: 2500 });
console.log('Result:', t1);
assert.equal(t1.concentrationMgMl, 5.0, 'Concentration must be 5.0 mg/mL');
assert.equal(t1.unitsToInject, 50, 'Units to inject must be 50 units');
assert.equal(t1.volumeMl, 0.5, 'Volume must be 0.5 mL');
assert.equal(t1.totalDoses, 4, 'Total doses must be 4');
assert.equal(t1.penClicks, 50, 'Pen clicks must be 50');
console.log('✔ Test 1 Passed: Tirzepatide 10mg calculations verified.\n');

// --- TEST 2: BPC-157 5mg in 2.0mL BAC Water (250mcg Daily Dose) ---
console.log('▶ Test 2: BPC-157 5mg + 2.0mL BAC Water (250mcg Daily Dose)');
const t2 = calculateReconstitution({ vialMg: 5, bacWaterMl: 2.0, desiredDoseMcg: 250 });
console.log('Result:', t2);
assert.equal(t2.concentrationMgMl, 2.5, 'Concentration must be 2.5 mg/mL');
assert.equal(t2.unitsToInject, 10, 'Units to inject must be 10 units');
assert.equal(t2.volumeMl, 0.1, 'Volume must be 0.1 mL');
assert.equal(t2.totalDoses, 20, 'Total doses must be 20');
assert.equal(t2.penClicks, 10, 'Pen clicks must be 10');
console.log('✔ Test 2 Passed: BPC-157 5mg calculations verified.\n');

// --- TEST 3: Semaglutide 2mg in 1.0mL BAC Water (0.25mg Weekly Dose) ---
console.log('▶ Test 3: Semaglutide 2mg + 1.0mL BAC Water (0.25mg Dose)');
const t3 = calculateReconstitution({ vialMg: 2, bacWaterMl: 1.0, desiredDoseMcg: 250 });
console.log('Result:', t3);
assert.equal(t3.concentrationMgMl, 2.0, 'Concentration must be 2.0 mg/mL');
assert.equal(t3.unitsToInject, 12.5, 'Units to inject must be 12.5 units');
assert.equal(t3.totalDoses, 8, 'Total doses must be 8');
console.log('✔ Test 3 Passed: Semaglutide 2mg calculations verified.\n');

console.log('🎉 ALL RECONSTITUTION CALCULATOR TESTS PASSED (3/3)!');
