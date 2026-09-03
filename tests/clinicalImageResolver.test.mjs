import assert from 'node:assert/strict';
import { resolveVariantClinicalImage, resolveProtocolClinicalImage, CLINICAL_PRODUCT_IMAGES, CLINICAL_GOAL_IMAGES } from '../src/utils/clinicalImageResolver.js';

console.log('🧪 Starting Clinical Image Resolver (Single/Dual Pen & Unified Single Unit) Test Suite...\n');

// --- TEST 1: Product Presentation Formats ---
console.log('▶ Test 1: Testing Single vs Dual Chamber Pens & Single Unit Consistency');

// 1. Single Lyophilized Vial
const vialImg = resolveVariantClinicalImage({ presentation: '10mg Lyophilized Vial', type: 'finished_product' });
console.log('- Single Vial image:', vialImg);
assert.equal(vialImg, CLINICAL_PRODUCT_IMAGES.vial_single);

// 2. 10-Unit Vial Pack -> MUST RESOLVE TO SINGLE VIAL (Golden Rule)
const box10Img = resolveVariantClinicalImage({ presentation: 'Box of 10 Vials (10-vial kit)', type: 'finished_product' });
console.log('- 10-Vial Pack (Single Model Rule):', box10Img);
assert.equal(box10Img, CLINICAL_PRODUCT_IMAGES.vial_single, 'Must show single unit model even for 10-vials');

// 3. Single Cartridge Prefilled Pen
const singlePenImg = resolveVariantClinicalImage({ presentation: '10mg Single Cartridge Pen', type: 'finished_product' });
console.log('- Single Cartridge Pen image:', singlePenImg);
assert.equal(singlePenImg, CLINICAL_PRODUCT_IMAGES.pen_single_cartridge);

// 4. Dual-Chamber / Double Cartridge Reconstitution Pen
const doublePenImg = resolveVariantClinicalImage({ presentation: '20mg Double Cartridge Pen (Dual-Chamber Reconstitution)', type: 'finished_product' });
console.log('- Dual-Chamber Pen image:', doublePenImg);
assert.equal(doublePenImg, CLINICAL_PRODUCT_IMAGES.pen_dual_chamber);

// 5. Standalone Dual-Chamber Refill Cartridges
const dualCartridgeImg = resolveVariantClinicalImage({ presentation: 'Double Cartridge Refill Only (2x3ml)', type: 'clinical_supplies' });
console.log('- Dual Cartridge Refill image:', dualCartridgeImg);
assert.equal(dualCartridgeImg, CLINICAL_PRODUCT_IMAGES.cartridge_dual_chamber);

// 6. Reusable Injector Pen Device
const reusablePenImg = resolveVariantClinicalImage({ presentation: 'Reusable Precision Injector Device (Chassis Only)', type: 'clinical_supplies' });
console.log('- Reusable Pen Device image:', reusablePenImg);
assert.equal(reusablePenImg, CLINICAL_PRODUCT_IMAGES.reusable_pen_device);

// 7. Bulk API Powder (Mass/Weight)
const apiPowderImg = resolveVariantClinicalImage({ presentation: '5g Bulk API Powder', type: 'raw_material' });
console.log('- Bulk API Powder image:', apiPowderImg);
assert.equal(apiPowderImg, CLINICAL_PRODUCT_IMAGES.bulk_api_powder);

// 8. Metered Nasal Spray
const sprayImg = resolveVariantClinicalImage({ presentation: 'Nasal Spray 30ml', type: 'finished_product' });
console.log('- Nasal Spray image:', sprayImg);
assert.equal(sprayImg, CLINICAL_PRODUCT_IMAGES.nasal_spray);

// 9. Oral Capsules Bottle
const capsuleImg = resolveVariantClinicalImage({ presentation: '60 Oral Capsules', type: 'finished_product' });
console.log('- Oral Capsule image:', capsuleImg);
assert.equal(capsuleImg, CLINICAL_PRODUCT_IMAGES.capsules_bottle);

// 10. Topical Cosmetic Serum
const topicalImg = resolveVariantClinicalImage({ presentation: 'Topical Cosmetic Serum 50ml', type: 'finished_product' });
console.log('- Topical Serum image:', topicalImg);
assert.equal(topicalImg, CLINICAL_PRODUCT_IMAGES.topical_serum);

console.log('✔ Test 1 Passed: Single/Dual Pens and Single-Unit Consistency validated.\n');

// --- TEST 2: Protocol Goal Images ---
console.log('▶ Test 2: Testing Protocol Goal Image Resolution');

const recovGoal = resolveProtocolClinicalImage({ goal: 'recovery', category: 'Tissue Repair' });
assert.equal(recovGoal, CLINICAL_GOAL_IMAGES.recovery);

const metabGoal = resolveProtocolClinicalImage({ goal: 'weight_management', category: 'Metabolic & Fat Loss' });
assert.equal(metabGoal, CLINICAL_GOAL_IMAGES.metabolic);

const cogGoal = resolveProtocolClinicalImage({ goal: 'cognitive_performance', category: 'Neuro-Restoration' });
assert.equal(cogGoal, CLINICAL_GOAL_IMAGES.cognition);

const longGoal = resolveProtocolClinicalImage({ goal: 'longevity', category: 'Biological Age Reduction' });
assert.equal(longGoal, CLINICAL_GOAL_IMAGES.longevity);

const immunGoal = resolveProtocolClinicalImage({ goal: 'immune_system', category: 'Immunity & Defense' });
assert.equal(immunGoal, CLINICAL_GOAL_IMAGES.immunity);

const hormGoal = resolveProtocolClinicalImage({ goal: 'hormonal_balance', category: 'HGH & Endocrine Optimization' });
assert.equal(hormGoal, CLINICAL_GOAL_IMAGES.hormonal);

const skinGoal = resolveProtocolClinicalImage({ goal: 'skin_regeneration', category: 'Skin & Hair Matrix' });
assert.equal(skinGoal, CLINICAL_GOAL_IMAGES.skin_hair);

console.log('✔ Test 2 Passed: All 7 clinical protocol goals resolve accurately.\n');

console.log('🎉 ALL CLINICAL IMAGE RESOLUTION TESTS PASSED (2/2)!');
