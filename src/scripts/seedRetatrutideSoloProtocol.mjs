import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const soloProtocol = {
  id: "retatrutide-monotherapy-titration-16w",
  slug: "retatrutide-monotherapy-titration-16w",
  protocol_slug: "retatrutide-monotherapy-titration-16w",
  name: "Retatrutide Monotherapy Titration Protocol (16-Week)",
  title: "Retatrutide Monotherapy Titration Protocol (16-Week)",
  protocol_title: "Retatrutide Monotherapy Titration Protocol (16-Week)",
  category: "Metabolic Health & Body Recomposition",
  therapeutic_category: "Metabolic Health & Weight Management",
  goal: "weight_management",
  goals: ["weight_management", "metabolic_health", "body_composition", "glycemic_control"],
  duration: "16 Weeks",
  durationWeeks: 16,
  status: "active",
  active: true,
  isFlagship: true,
  featured: true,
  author: "Med-Peptides Clinical & Scientific Advisory Board",
  difficulty_level: "Intermediate",
  evidenceGrade: "Grade A",
  evidence_grade_note: "Grade A: Landmark Phase II NEJM study (Jastreboff et al., 2023) showing up to 24.2% mean body weight reduction, with Phase III TRIUMPH trials demonstrating robust safety and efficacy in triple GIP/GLP-1/Glucagon receptor agonism.",
  summary: "Structured 16-week clinical monotherapy titration pathway of pure Retatrutide (2mg → 4mg → 8mg → 12mg), optimizing metabolic receptor sensitization, appetite suppression, and visceral adipose reduction without multi-peptide stacking.",
  overview_summary: "Structured 16-week clinical monotherapy titration pathway of pure Retatrutide (2mg → 4mg → 8mg → 12mg), optimizing metabolic receptor sensitization, appetite suppression, and visceral adipose reduction without multi-peptide stacking.",
  clinicalRationale: "Retatrutide acts as a triple agonist at GIP, GLP-1, and glucagon receptors. This monotherapy protocol isolates Retatrutide's unique thermodynamic and glycemic actions without auxiliary peptide confounding variables.",
  target_audience: "Clinicians and researchers overseeing individuals with metabolic resistance, obesity (BMI ≥ 30 or ≥ 27 with comorbidity), or impaired glucose homeostasis.",
  bom: [
    {
      productId: "prd_retatrutide",
      product_id: "prd_retatrutide",
      product_slug: "retatrutide",
      name: "Retatrutide",
      title: "Retatrutide Lyophilized Powder",
      strength: "10mg",
      dosage_form: "vial",
      route: "subcutaneous",
      quantity: 6,
      unit: "vials"
    }
  ],
  phases: [
    {
      phaseIndex: 1,
      phaseNumber: 1,
      name: "Phase 1: Initiation & Tolerability Priming",
      phaseLabel: "Initiation (2mg/wk)",
      startWeek: 1,
      endWeek: 4,
      durationWeeks: 4,
      dose: 2.0,
      dosage: "2.0 mg / week",
      unit: "mg",
      frequency: "Once weekly (Day 1)",
      route: "Subcutaneous",
      clinical_objective: "Acclimatize gastrointestinal and neuroendocrine axes to triple receptor agonism; minimize transient nausea.",
      drugs: [
        {
          productId: "prd_retatrutide",
          product_id: "prd_retatrutide",
          name: "Retatrutide",
          dose: 2.0,
          unit: "mg",
          frequency: "Weekly",
          route: "Subcutaneous"
        }
      ]
    },
    {
      phaseIndex: 2,
      phaseNumber: 2,
      name: "Phase 2: Early Therapeutic Escalation",
      phaseLabel: "Escalation (4mg/wk)",
      startWeek: 5,
      endWeek: 8,
      durationWeeks: 4,
      dose: 4.0,
      dosage: "4.0 mg / week",
      unit: "mg",
      frequency: "Once weekly (Day 1)",
      route: "Subcutaneous",
      clinical_objective: "Induce sustained satiety and baseline glycemic stabilization.",
      drugs: [
        {
          productId: "prd_retatrutide",
          product_id: "prd_retatrutide",
          name: "Retatrutide",
          dose: 4.0,
          unit: "mg",
          frequency: "Weekly",
          route: "Subcutaneous"
        }
      ]
    },
    {
      phaseIndex: 3,
      phaseNumber: 3,
      name: "Phase 3: Active Metabolic Acceleration",
      phaseLabel: "Metabolic Peak (8mg/wk)",
      startWeek: 9,
      endWeek: 12,
      durationWeeks: 4,
      dose: 8.0,
      dosage: "8.0 mg / week",
      unit: "mg",
      frequency: "Once weekly (Day 1)",
      route: "Subcutaneous",
      clinical_objective: "Engage glucagon receptor-mediated hepatic lipid oxidation and energy expenditure.",
      drugs: [
        {
          productId: "prd_retatrutide",
          product_id: "prd_retatrutide",
          name: "Retatrutide",
          dose: 8.0,
          unit: "mg",
          frequency: "Weekly",
          route: "Subcutaneous"
        }
      ]
    },
    {
      phaseIndex: 4,
      phaseNumber: 4,
      name: "Phase 4: Optimization & High-Intensity Agonism",
      phaseLabel: "Max Dose (12mg/wk)",
      startWeek: 13,
      endWeek: 16,
      durationWeeks: 4,
      dose: 12.0,
      dosage: "12.0 mg / week",
      unit: "mg",
      frequency: "Once weekly (Day 1)",
      route: "Subcutaneous",
      clinical_objective: "Maximize total adipose mobilization while preserving lean mass; achieve plateau weight recalibration.",
      drugs: [
        {
          productId: "prd_retatrutide",
          product_id: "prd_retatrutide",
          name: "Retatrutide",
          dose: 12.0,
          unit: "mg",
          frequency: "Weekly",
          route: "Subcutaneous"
        }
      ]
    }
  ],
  dosage_schedule: [
    { weekRange: "Weeks 1-4", dosePerWeek: "2 mg", frequency: "Weekly", totalVolume: "0.2 mL (10mg/mL)", vialUsage: "1 vial" },
    { weekRange: "Weeks 5-8", dosePerWeek: "4 mg", frequency: "Weekly", totalVolume: "0.4 mL (10mg/mL)", vialUsage: "1.6 vials" },
    { weekRange: "Weeks 9-12", dosePerWeek: "8 mg", frequency: "Weekly", totalVolume: "0.8 mL (10mg/mL)", vialUsage: "3.2 vials" },
    { weekRange: "Weeks 13-16", dosePerWeek: "12 mg", frequency: "Weekly", totalVolume: "1.2 mL (10mg/mL)", vialUsage: "4.8 vials" }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function seed() {
  console.log('Seeding Retatrutide Solo Monotherapy Protocol to Firestore...');
  const docRef = db.collection('protocols').doc(soloProtocol.id);
  await docRef.set(soloProtocol, { merge: true });
  console.log(`✅ Successfully seeded protocol: ${soloProtocol.id}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding protocol:', err);
  process.exit(1);
});
