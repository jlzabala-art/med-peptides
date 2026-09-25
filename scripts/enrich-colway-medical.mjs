/**
 * Colway Medical Enrichment — Phase 2
 * Adds post-transplant protocol, clinical indications,
 * synergistic products map, and mechanism of action data.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const SHARED_DATA = {
  clinical_indications: [
    'Androgenetic Alopecia (AGA) — Male Pattern (Hamilton-Norwood II–V)',
    'Androgenetic Alopecia (AGA) — Female Pattern (Ludwig I–II)',
    'Telogen Effluvium (TE) — Acute & Chronic',
    'Post-Hair Transplant Recovery (FUE / FUT / DHI)',
    'Traction Alopecia — Preventive Maintenance',
    'Chemotherapy-Induced Alopecia — Supportive Recovery Phase'
  ],

  synergistic_products: [
    { id: 'ghk-cu', name: 'GHK-Cu Peptide', mechanism: 'Wnt/β-catenin follicular stem cell activation. Promotes dermal papilla cell proliferation and angiogenesis.', synergy_score: 96, category: 'peptide', route: 'Mesotherapy / SC injection' },
    { id: 'bpc-157-tb-500-ghk-cu', name: 'BPC-157 + TB-500 + GHK-Cu Stack', mechanism: 'Triple peptide tissue repair blend. BPC-157 accelerates neovascularisation of transplanted follicles; TB-500 modulates actin for cell migration; GHK-Cu activates stem cells.', synergy_score: 94, category: 'peptide', route: 'SC injection' },
    { id: 'finasteride', name: 'Finasteride 1mg', mechanism: 'Systemic 5α-reductase Type II inhibitor. Reduces serum DHT by 70%. Colway Zinc PCA provides complementary topical blockade at the scalp level.', synergy_score: 92, category: 'pharmaceutical', route: 'Oral (systemic)' },
    { id: 'dutasteride', name: 'Dutasteride 0.5mg', mechanism: 'Dual 5α-reductase (Type I + II) inhibitor. More potent than finasteride — reduces DHT by 90%. Colway provides adjunctive topical support.', synergy_score: 90, category: 'pharmaceutical', route: 'Oral (systemic)' },
    { id: 'minoxidil', name: 'Minoxidil 5%', mechanism: 'K-ATP channel opener / vasodilator. Promotes follicular growth via VEGF upregulation. Colway Caffeine provides additive vasodilation via adenosine antagonism.', synergy_score: 88, category: 'pharmaceutical', route: 'Topical' },
    { id: 'latanoprost-fagron', name: 'Latanoprost (Fagron)', mechanism: 'PGF2α analogue. Extends anagen phase via prostaglandin pathway. Colway maintains optimal scalp pH for latanoprost absorption.', synergy_score: 85, category: 'compounding', route: 'Topical (compounded)' },
    { id: 'trichoxidil', name: 'TrichoXidil™ (Fagron)', mechanism: 'Patented phytocomplex with anti-DHT and VEGF-stimulating properties. Colway as scalp preparation vehicle pre-application.', synergy_score: 83, category: 'compounding', route: 'Topical (compounded)' },
    { id: 'ketoconazole', name: 'Ketoconazole 2%', mechanism: 'Imidazole antifungal with secondary anti-androgenic properties. Alternate protocol: Keto 2×/week + Colway 3×/week for complete coverage.', synergy_score: 81, category: 'pharmaceutical', route: 'Topical shampoo' },
    { id: 'saw-palmetto', name: 'Saw Palmetto Extract', mechanism: 'Natural 5α-reductase inhibitor via liposterolic extract. Oral route complements Colway topical DHT blockade.', synergy_score: 79, category: 'nutraceutical', route: 'Oral supplement' }
  ],

  mechanism_of_action: {
    summary: 'Multi-target cosmeceutical approach addressing 5 parallel pathways implicated in androgenetic alopecia pathophysiology.',
    primary_targets: [
      { pathway: '5α-Reductase Inhibition', active: 'Zinc PCA', level: 'Scalp (topical)', strength: 'moderate', icon: 'shield', detail: 'Competitively inhibits Type II 5α-reductase at the follicular unit, reducing local DHT concentration by 15–31%.' },
      { pathway: 'IGF-1 / Anagen Extension', active: 'Caffeine (1,3,7-TMX)', level: 'Follicular keratinocytes', strength: 'strong', icon: 'zap', detail: 'Antagonises adenosine A1/A2A receptors, elevating cAMP and upregulating IGF-1. Extends anagen phase and counteracts testosterone-induced apoptosis.' },
      { pathway: 'VEGF / Vascular Enhancement', active: 'Niacinamide (Vit B3)', level: 'Dermal papilla', strength: 'strong', icon: 'activity', detail: 'Upregulates VEGF mRNA via HIF-1α, expanding the perifollicular capillary network. Clinically demonstrated: +21% hair density at 6 months.' },
      { pathway: 'Keratin Matrix Reinforcement', active: 'Native Collagen + Keratin', level: 'Hair cortex', strength: 'very_strong', icon: 'layers', detail: 'Intact triple-helix collagen deposits at cortical macrofibril interfaces. Keratin hydrolysate fills structural voids via disulphide interchange. Combined: +24% tensile strength.' },
      { pathway: 'Antioxidant / ROS Defense', active: 'Argan Oil Tocopherols', level: 'Cuticle + scalp', strength: 'moderate', icon: 'leaf', detail: 'α-Tocopherol (600–900 mg/kg) scavenges free radicals generated by UV and thermal stress. Protects the 18-MEA lipid coating of the cuticle.' }
    ],
    target_conditions: ['AGA (Male)', 'AGA (Female)', 'Telogen Effluvium', 'Post-Transplant Recovery', 'Traction Alopecia']
  }
};

const SHAMPOO_TRANSPLANT = {
  suitable: true,
  badge: 'TRANSPLANT-SAFE',
  first_use_day: 10,
  phases: [
    {
      phase: 1,
      name: 'Hemostasis & Graft Anchoring',
      timing: 'Days 0–10',
      days_range: [0, 10],
      colway_use: false,
      instruction: 'Do NOT use any shampoo. Grafts are in the critical anchoring phase. Only sterile saline spray and prescribed post-op solution.',
      icon: 'alert',
      color: '#dc2626'
    },
    {
      phase: 2,
      name: 'First Wash Protocol',
      timing: 'Days 10–14',
      days_range: [10, 14],
      colway_use: true,
      dilution: '50% (mix with equal volume lukewarm water)',
      instruction: 'Introduce Colway Shampoo at 50% dilution. Apply by gently pouring over the scalp — NO rubbing, NO circular motions. Allow product to sit for 60 seconds, then rinse with minimal water pressure. The pH 4.8–5.2 is within the optimal range for post-surgical scalp healing.',
      clinical_note: 'The sulphate-free formula avoids the transepidermal water loss (TEWL) spike caused by SLS/SLES surfactants, which is critical during the neo-epithelialisation of micro-incisions.',
      icon: 'droplets',
      color: '#d97706'
    },
    {
      phase: 3,
      name: 'Scalp Normalisation',
      timing: 'Weeks 3–6',
      days_range: [15, 42],
      colway_use: true,
      dilution: 'Full concentration',
      frequency: '3×/week',
      instruction: 'Full-concentration Shampoo with gentle circular massage (fingertips only). The Caffeine and Niacinamide in the formula reactivate microcirculation in the recipient zone, accelerating nutrient delivery to newly anchored grafts.',
      clinical_note: 'Caffeine achieves follicular penetration within 2 minutes. Post-transplant follicles are in telogen/early anagen — caffeine stimulation of IGF-1 can accelerate transition to active growth phase by 2–4 weeks.',
      icon: 'refresh',
      color: '#2563eb'
    },
    {
      phase: 4,
      name: 'Shock Loss Recovery & Growth Phase',
      timing: 'Weeks 6–16',
      days_range: [42, 112],
      colway_use: true,
      frequency: '4×/week',
      instruction: 'Full Colway System (Shampoo + Conditioner) 4 times per week. This is the critical shock-loss recovery window — 50–75% of transplanted hairs temporarily shed before regrowing. Zinc PCA inhibits residual DHT; Native Collagen reinforces the keratin matrix of emerging anagen hairs.',
      clinical_note: 'Shock loss (telogen effluvium post-transplant) peaks at weeks 4–8. Zinc PCA topical DHT inhibition helps preserve non-transplanted native hairs in the surrounding area that may be vulnerable to miniaturisation.',
      icon: 'trending-up',
      color: '#7c3aed'
    },
    {
      phase: 5,
      name: 'Long-Term Maintenance',
      timing: 'Month 4 onwards',
      days_range: [112, 365],
      colway_use: true,
      frequency: '3×/week (indefinite)',
      instruction: 'Maintenance protocol: Colway System 3×/week combined with GHK-Cu mesotherapy sessions (monthly) and systemic DHT blockers (if prescribed). This triple approach maximises transplant density and protects native hairs from further miniaturisation.',
      clinical_note: 'At month 4, 60–80% of transplanted follicles have entered anagen. Full density is typically achieved at months 12–18. Consistent use of Colway during this period supports the anagen phase of both transplanted and native follicles.',
      icon: 'shield-check',
      color: '#16a34a'
    }
  ],
  compatible_procedures: ['FUE (Follicular Unit Extraction)', 'FUT (Follicular Unit Transplantation)', 'DHI (Direct Hair Implantation)', 'PRP (Platelet-Rich Plasma)', 'Mesotherapy (GHK-Cu, Dutasteride)', 'Microneedling (Dermaroller 0.5–1.5mm)'],
  contraindicated_until: 'Day 10 post-procedure — active wound healing, graft anchoring, and neo-epithelialisation phase.',
  surgeon_notes: [
    'pH 4.8–5.2 is safe for post-surgical scalp. Avoids alkaline disruption of healing tissue.',
    'Sulphate-free formula prevents TEWL spike in compromised barrier.',
    'Native collagen (non-hydrolysed) does not interfere with PRP growth factors.',
    'Compatible with post-op antibiotics (topical mupirocin, oral doxycycline).',
    'Can be used same-day as topical minoxidil — apply Colway first, minoxidil 30 min after drying.'
  ]
};

const CONDITIONER_TRANSPLANT = {
  suitable: true,
  badge: 'TRANSPLANT-SAFE',
  first_use_day: 15,
  phases: SHAMPOO_TRANSPLANT.phases.map(p => {
    if (p.phase === 1) return { ...p };
    if (p.phase === 2) {
      const { dilution, ...rest } = p;
      return { ...rest, instruction: 'Do NOT apply conditioner during the first wash phase. Only the diluted shampoo is used. Conditioner application requires contact with the hair shaft — avoid any manipulation of the recipient zone until Day 15.', colway_use: false, color: '#d97706' };
    }
    if (p.phase === 3) return { ...p, instruction: 'Introduce Colway Conditioner on mid-lengths and ends ONLY. Do not apply to the scalp or recipient zone. The BTMS-50 cationic conditioning system deposits on damaged (transplant-stressed) hair fibres, reducing breakage from combing. Use after every Shampoo session.', clinical_note: 'Post-transplant hair is often brittle from surgical stress and medication side-effects. Panthenol + Keratin in the conditioner provide moisture + structural reinforcement without interfering with follicular recovery at the scalp level.' };
    return { ...p };
  }),
  compatible_procedures: SHAMPOO_TRANSPLANT.compatible_procedures,
  contraindicated_until: 'Day 15 post-procedure — scalp manipulation required for conditioner application.',
  surgeon_notes: SHAMPOO_TRANSPLANT.surgeon_notes
};

async function run() {
  console.log('🏥 Colway Medical Enrichment — Phase 2\n');

  // Shampoo
  await db.collection('products').doc('colway-strengthening-shampoo').update({
    ...SHARED_DATA,
    post_transplant_protocol: SHAMPOO_TRANSPLANT,
    product_positioning: 'Medical-Grade Cosmeceutical Hair Treatment',
    updated_at: FieldValue.serverTimestamp()
  });
  console.log('✅ Shampoo: post-transplant + synergistic products + clinical indications');

  // Conditioner
  await db.collection('products').doc('colway-strengthening-conditioner').update({
    ...SHARED_DATA,
    post_transplant_protocol: CONDITIONER_TRANSPLANT,
    product_positioning: 'Medical-Grade Cosmeceutical Hair Treatment',
    updated_at: FieldValue.serverTimestamp()
  });
  console.log('✅ Conditioner: post-transplant + synergistic products + clinical indications');

  console.log('\n✅ Phase 2 enrichment complete. Both products now have medical-grade metadata.');
}

run().catch(err => { console.error('❌', err); process.exit(1); });
