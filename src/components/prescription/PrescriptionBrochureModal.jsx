'use client';

import React, { useState, useRef } from 'react';
import { X, Printer, Download, QrCode, FileText, User, ShieldCheck, Stethoscope, Check, ExternalLink, Calendar, MapPin, Pill, Share2, Clock, Sparkles } from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';

// Clean Doctor Name & Credentials to Professional Standards
const formatDoctorName = (name) => {
  if (!name) return 'Dr. Marina Cordeiro Fernandes';
  return String(name)
    .replace(/,\s*md\b/i, ', MD')
    .replace(/,\s*fishrs\b/i, ', FISHRS')
    .replace(/,\s*phd\b/i, ', PhD')
    .replace(/,\s*facp\b/i, ', FACP')
    .replace(/,\s*faad\b/i, ', FAAD')
    .replace(/\bMd\b/, 'MD')
    .replace(/\bFishrs\b/, 'FISHRS');
};

// Comprehensive Medical English Translation for Active Ingredients (APIs)
const translateTherapeuticClass = (rawClass) => {
  if (!rawClass) return '';
  const classLower = rawClass.toLowerCase().trim();
  const dict = {
    // Follicular / Hair Therapeutics
    'agonista selectivo de receptores de prostaglandina f2α (fp)': 'Selective Prostaglandin F2α (FP) Receptor Agonist',
    'agonista selectivo de receptores de prostaglandina f2a (fp)': 'Selective Prostaglandin F2α (FP) Receptor Agonist',
    'activador de sulfotransferasa & canales k_atp foliculares': 'Sulfotransferase Activator & Follicular K_ATP Channel Opener',
    'activador de sulfotransferasa & canales k_atp': 'Sulfotransferase Activator & Follicular K_ATP Channel Opener',
    'antagonista selectivo del receptor pgd2 / crth2': 'Selective PGD2 / CRTH2 Receptor Antagonist',
    'antagonista selectivo del receptor pgd2': 'Selective PGD2 / CRTH2 Receptor Antagonist',
    'antagonista competitivo de receptores androgénicos': 'Competitive Androgen Receptor Antagonist',
    'inhibidor dual 5α-reductasa tipo i, ii y iii': 'Dual 5α-Reductase Type I, II & III Inhibitor',
    'inhibidor dual 5α-reductasa tipo i y ii': 'Dual 5α-Reductase Type I & II Inhibitor',
    'inhibidor selectivo 5α-reductasa tipo ii': 'Selective 5α-Reductase Type II Inhibitor',
    'agonista de receptores mt1/mt2 & antioxidante mitocondrial': 'MT1/MT2 Receptor Agonist & Mitochondrial Antioxidant',
    'metaloenzima esencial & regulador enzimático folicular': 'Essential Metalloenzyme & Follicular Enzyme Regulator',
    'cofactor de metionina sintasa & síntesis de adn eritropoyético': 'Methionine Synthase Cofactor & Erythropoietic DNA Synthesis Activator',
    'fitoestimulante celular & up-regulador de factores de crecimiento': 'Cellular Phytostimulant & Growth Factor Upregulator',
    'fitoestimulante celular & inductor de vegf': 'Cellular Phytostimulant & VEGF Inducer',
    'antioxidante lipofílico de membrana & protector endotelial': 'Lipophilic Membrane Antioxidant & Endothelial Protector',
    'precursor esencial de óxido nítrico (no) & vasodilatador folicular': 'Essential Nitric Oxide (NO) Precursor & Follicular Vasodilator',
    'precursor de óxido nítrico & estimulador microvascular': 'Nitric Oxide Precursor & Microvascular Stimulator',
    'precursor de coenzima a & regenerador celular': 'Coenzyme A Precursor & Cellular Regenerator',
    'optimizador microvascular & escudo antioxidante': 'Microvascular Optimizer & Antioxidant Shield',
    'supresión de dht folicular & prevención de miniaturización': 'Follicular DHT Suppression & Miniaturization Prevention',
    'estimulación de fase anágena & perfusión microvascular': 'Anagen Phase Induction & Microvascular Perfusion',
    'bloqueo local de dht en cuero cabelludo': 'Local Scalp DHT Blockade',
    'optimización de microcirculación perifolicular': 'Perifollicular Microcirculation Enhancement',
    'activación de la fase anágena del folículo': 'Follicular Anagen Phase Activation',
    'bloqueo periférico de la dht': 'Peripheral DHT Receptor Blockade',
    'vasodilatador periférico': 'Peripheral Vasodilator',
    'vasodilatador periférico & estimulante folicular': 'Peripheral Vasodilator & Follicular Stimulant',
    'antiandrógeno no esteroideo': 'Non-Steroidal Antiandrogen',
    'corticoesteroide antiinflamatorio': 'Anti-inflammatory Corticosteroid',
    'agente quelante de cobre & péptido biorregulador': 'Copper Peptide & Bio-regulatory Matrix Agent',
    'inmuno-modulador local': 'Local Immunomodulator',
    'antifúngico & regulador de microbiota folicular': 'Antifungal & Follicular Microbiota Regulator',
    'vitamina hidrosoluble & cofactor metabólico': 'Water-soluble Vitamin & Metabolic Cofactor',
    'aminoácido azufrado & precursor de queratina': 'Sulfur Amino Acid & Keratin Precursor',
    'antioxidante celular & regenerador mitocondrial': 'Cellular Antioxidant & Mitochondrial Regenerator',
    'bioflavonoide venotónico & microcirculatorio': 'Venotonic Bioflavonoid & Microcirculatory Agent',
    'pharmacogenomic active ingredient': 'Pharmacogenomic Active Ingredient',

    // Bioidentical Hormone Replacement (BHRT) & Endocrine
    'bhrt / neuromuscular & libido restoration': 'BHRT / Neuromuscular & Libido Restoration',
    'bhrt / neuromuscular y restauración de libido': 'BHRT / Neuromuscular & Libido Restoration',
    'bhrt / endocrine homeostasis & vasomotor stability': 'BHRT / Endocrine Homeostasis & Vasomotor Stability',
    'bhrt / homeostasis endocrina & estabilidad vasomotora': 'BHRT / Endocrine Homeostasis & Vasomotor Stability',
    'andrógeno bioidéntico & modulador anabólico': 'Bioidentical Androgen & Anabolic Modulator',
    'estrógeno bioidéntico & regulador vasomotor': 'Bioidentical Estrogen & Vasomotor Regulator',
    'progestágeno bioidéntico & neuroesteroide': 'Bioidentical Progestogen & Neurosteroid',

    // Galenic / Microcirculatory & Local Anesthetics
    'bloqueador de canales de calcio & espasmolítico': 'Calcium Channel Blocker & Microvascular Spasmolytic',
    'antagonista de canales de calcio': 'Calcium Channel Blocker (Spasmolytic)',
    'anestésico local tipo amida': 'Local Amide Anesthetic',
    'anestésico local de acción rápida': 'Rapid-Onset Local Anesthetic',

    // Metabolic / Cellular Detox & Peptides
    'antioxidante mitocondrial & captador de radicales libres': 'Mitochondrial Antioxidant & Free Radical Scavenger',
    'cofactor redox & activador de biogénesis mitocondrial': 'Redox Cofactor & Mitochondrial Biogenesis Activator',
    'donante de grupos metilo & modulador de homocisteína': 'Methyl Donor & Homocysteine Modulator',
    'precursor de glutatión & quelante hepático': 'Glutathione Precursor & Hepatic Chelator',
    'péptido citoprotector & reparador tisular': 'Cytoprotective Peptide & Tissue Repair Activator'
  };

  if (dict[classLower]) return dict[classLower];

  for (const [key, val] of Object.entries(dict)) {
    if (classLower.includes(key)) return val;
  }

  // Safe translation preserving English words ending in 'y' (e.g. Stability, Therapy, Recovery)
  return rawClass
    .replace(/tópico/gi, 'Topical')
    .replace(/oral/gi, 'Oral')
    .replace(/sublingual/gi, 'Sublingual')
    .replace(/agonista/gi, 'Agonist')
    .replace(/antagonista/gi, 'Antagonist')
    .replace(/inhibidor/gi, 'Inhibitor')
    .replace(/receptores/gi, 'Receptors')
    .replace(/\bde\b/gi, 'of')
    .replace(/\by\b/gi, '&');
};

const formatApiDose = (rawDose) => {
  if (!rawDose) return '';
  let str = String(rawDose).trim();
  if (/dose\s+to\s+calibrate/i.test(str)) {
    return 'Personalized Calibrated Dose';
  }
  return str
    .replace(/tópico/gi, 'Topical')
    .replace(/oral/gi, 'Oral')
    .replace(/sublingual/gi, 'Sublingual');
};

// Accurate Modality Detection Engine
const detectTreatmentModality = (rx = {}, formulations = []) => {
  const parts = [
    rx.diagnosis,
    rx.indication,
    rx.productName,
    rx.title,
    rx.category,
    rx.protocolName,
    rx.notes,
    rx.posology,
    ...formulations.map(f => `${f.name || ''} ${f.title || ''} ${f.productName || ''} ${f.dosageForm || ''} ${f.route || ''} ${f.formula || ''} ${f.vehicle?.name || ''} ${f.posology || ''} ${(f.apis || []).map(a => `${a.name || ''} ${a.therapeuticClass || ''}`).join(' ')}`),
    ...(rx.items || []).map(i => `${i.name || ''} ${i.dosageForm || ''} ${i.therapeuticClass || ''}`)
  ];
  const fullText = parts.filter(Boolean).join(' ').toLowerCase();

  // 1. Transdermal Hormone / BHRT Cream
  if (
    fullText.includes('testosterone') ||
    fullText.includes('estradiol') ||
    fullText.includes('progesterone') ||
    fullText.includes('dhea') ||
    fullText.includes('bhrt') ||
    fullText.includes('pentravan') ||
    (fullText.includes('transdermal') && (fullText.includes('cream') || fullText.includes('liposomal')))
  ) {
    return {
      type: 'transdermal_cream',
      label: 'Transdermal Liposomal BHRT Therapy',
      indication: 'Bioidentical Hormone Replacement Therapy (BHRT)',
      summaryBadge: 'Transdermal Liposomal Emulsion (Pentravan®)',
      defaultVehicle: 'Pentravan® Liposomal Transdermal Cream Base (Fagron)',
      vehicleDesc: 'Pentravan® (Fagron) (Patented liposomal transdermal penetration-enhancing emulsion base, alcohol-free)',
      storageGuidelines: [
        'Store at room temperature (15–25°C / 59–77°F) away from direct sunlight.',
        'Keep the metered dispenser pump tightly capped when not in use.',
        'Keep out of reach of children and domestic pets. Do not freeze.'
      ],
      milestones: [
        { period: 'Weeks 1–2', desc: 'Initial endocrine stabilization, improvement in daytime stamina and restorative sleep onset.' },
        { period: 'Weeks 3–6', desc: 'Noticeable reduction in vasomotor symptoms, mood regulation, and neuromuscular tone recovery.' },
        { period: 'Weeks 7–12', desc: 'Sustained hormonal homeostasis, optimized lean metabolic efficiency, and libido restoration.' }
      ],
      steps: [
        {
          step: 1,
          label: 'Site Selection',
          title: 'Clean, Hairless Skin',
          desc: 'Apply to clean, completely dry, unbroken skin. Recommended sites: inner forearms, lower abdomen, or inner thighs. Rotate application sites daily.'
        },
        {
          step: 2,
          label: 'Metered Dosing',
          title: 'Exact Calibrated Actuation',
          desc: 'Depress the metered pump actuator completely to dispense the exact calibrated dose (e.g., 1 pump = 1 mL). Do not alter dose without physician review.'
        },
        {
          step: 3,
          label: 'Cutaneous Absorption',
          title: 'Gentle Fingertip Spread',
          desc: 'Spread the liposomal cream thinly and evenly with clean fingertips. Allow 3–5 minutes for complete cutaneous absorption before dressing.'
        },
        {
          step: 4,
          label: 'Safety Precautions',
          title: 'Hand Hygiene & Contact',
          desc: 'Wash hands thoroughly with soap immediately after application. Avoid skin-to-skin transfer to children, pregnant women, or pets for at least 2 hours.'
        }
      ]
    };
  }

  // 2. Topical Pomade / Ointment
  if (
    fullText.includes('diltiazem') ||
    fullText.includes('lidocaine') ||
    fullText.includes('pomade') ||
    fullText.includes('pomada') ||
    fullText.includes('ointment') ||
    fullText.includes('ungüento')
  ) {
    return {
      type: 'topical_pomade',
      label: 'Compounded Galenic Topical Ointment',
      indication: 'Targeted Microcirculatory & Local Anesthetic Therapy',
      summaryBadge: 'Hypoallergenic Galenic Pomade Base',
      defaultVehicle: 'Compounded Hypoallergenic Non-Irritating Ointment Base',
      vehicleDesc: 'Compounded Hypoallergenic Ointment Base (Non-irritating, soothing occlusive carrier)',
      storageGuidelines: [
        'Store at room temperature (15–25°C) in a dry place protected from humidity.',
        'Keep tube or jar tightly closed immediately after dispensing.',
        'Keep out of reach of children. For topical external use only.'
      ],
      milestones: [
        { period: 'Days 1–3', desc: 'Rapid relief of localized discomfort, acute tension, and pain attenuation.' },
        { period: 'Weeks 1–2', desc: 'Significant reduction in sphincter spasm and improved microvascular capillary blood flow.' },
        { period: 'Weeks 3–8', desc: 'Accelerated epithelial healing, tissue regeneration, and sustained symptom resolution.' }
      ],
      steps: [
        {
          step: 1,
          label: 'Area Preparation',
          title: 'Cleanse & Pat Dry',
          desc: 'Gently wash the affected area with mild lukewarm water and pat dry thoroughly with a soft clean towel before application.'
        },
        {
          step: 2,
          label: 'Calibrated Dose',
          title: 'Pea-Sized Amount',
          desc: 'Dispense a pea-sized amount onto a clean fingertip or disposable applicator cot as prescribed by your doctor.'
        },
        {
          step: 3,
          label: 'Smooth Application',
          title: 'Gentle Cutaneous Layer',
          desc: 'Apply a smooth, thin layer over the target area without rubbing aggressively. Allow the formulation to form a protective soothing barrier.'
        },
        {
          step: 4,
          label: 'Post-Care',
          title: 'Hand Hygiene',
          desc: 'Wash hands thoroughly with warm water and soap after application. Wear loose-fitting, breathable cotton clothing.'
        }
      ]
    };
  }

  // 3. Oral Micronutrition / Capsules
  if (
    fullText.includes('capsule') ||
    fullText.includes('cápsula') ||
    fullText.includes('oral') ||
    fullText.includes('detox') ||
    fullText.includes('mitochondrial') ||
    fullText.includes('ubiquinol') ||
    fullText.includes('alpha-lipoic') ||
    fullText.includes('ala') ||
    fullText.includes('pqq')
  ) {
    return {
      type: 'oral_protocol',
      label: 'Oral Micronutrition & Cellular Protocol',
      indication: 'Mitochondrial Optimization & Cellular Detoxification',
      summaryBadge: 'Hypoallergenic Vegetable Enteric Capsules',
      defaultVehicle: 'Hypoallergenic Vegetable Capsule Base (Gluten-Free, Dairy-Free)',
      vehicleDesc: 'Hypoallergenic Vegetable Enteric Capsule Base (100% plant-derived cellulose, preservative-free)',
      storageGuidelines: [
        'Store in a cool, dry place away from moisture and direct sunlight.',
        'Keep bottle securely sealed with moisture-absorbent desiccant pack intact.',
        'Keep out of reach of children. Do not refrigerate unless instructed.'
      ],
      milestones: [
        { period: 'Weeks 1–2', desc: 'Cellular adaptation, initial metabolic priming, and sustained daytime alertness.' },
        { period: 'Weeks 3–6', desc: 'Enhanced mitochondrial ATP synthesis, reduced fatigue, and cellular resilience.' },
        { period: 'Weeks 7–12', desc: 'Comprehensive antioxidant defense, normalized hepatic markers, and cellular rejuvenation.' }
      ],
      steps: [
        {
          step: 1,
          label: 'Daily Timing',
          title: 'Scheduled Regimen',
          desc: 'Take the prescribed number of capsules according to your circadian schedule (e.g., Morning with breakfast or Evening at bedtime).'
        },
        {
          step: 2,
          label: 'Administration',
          title: 'Full Glass of Water',
          desc: 'Swallow capsules whole with a full glass (250 mL) of water. Do not open, crush, or chew capsules.'
        },
        {
          step: 3,
          label: 'Circadian Consistency',
          title: 'Same Time Daily',
          desc: 'Maintain consistent daily timing to ensure continuous plasma concentrations and optimal enzymatic activation.'
        },
        {
          step: 4,
          label: 'Treatment Adherence',
          title: 'Continuous 90-Day Cycle',
          desc: 'Complete the full 90-day protocol without skipping doses. Log your progress in your digital patient portal.'
        }
      ]
    };
  }

  // 4. Injectable Peptides
  if (
    fullText.includes('peptide') ||
    fullText.includes('bpc') ||
    fullText.includes('tb-500') ||
    fullText.includes('subcutaneous') ||
    fullText.includes('inject') ||
    fullText.includes('semaglutide') ||
    fullText.includes('tirzepatide')
  ) {
    return {
      type: 'injectable_peptide',
      label: 'Physiological Peptide Protocol',
      indication: 'Targeted Peptide Bioregulation & Tissue Regeneration',
      summaryBadge: 'Sterile Compounded Solution / Lyophilized',
      defaultVehicle: 'Bacteriostatic Water for Injection USP (0.9% Benzyl Alcohol)',
      vehicleDesc: 'Bacteriostatic Water for Injection USP (Sterile multidose vehicle, 0.9% Benzyl Alcohol preservative)',
      storageGuidelines: [
        'Store refrigerated at 2–8°C (36–46°F). Protect from light and freezing.',
        'Do not shake reconstituted peptide vials vigorously; swirl gently if needed.',
        'Discard reconstituted vial after 28 days of initial puncture or by expiry date.'
      ],
      milestones: [
        { period: 'Days 1–7', desc: 'Rapid systemic cellular uptake and initial anti-inflammatory signaling pathway modulation.' },
        { period: 'Weeks 2–4', desc: 'Targeted fibroblastic stimulation, tissue repair acceleration, and collagen synthesis.' },
        { period: 'Weeks 5–8', desc: 'Optimized physiological tissue integrity, metabolic homeostasis, and full structural recovery.' }
      ],
      steps: [
        {
          step: 1,
          label: 'Aseptic Cleansing',
          title: 'Sanitize Vial & Skin',
          desc: 'Wipe the vial rubber septum with an alcohol prep swab. Clean the selected subcutaneous injection site (abdomen or thigh) and allow to air dry.'
        },
        {
          step: 2,
          label: 'Calibrated Dosing',
          title: 'Single-Use Syringe',
          desc: 'Using a sterile, single-use calibrated insulin syringe, draw the exact prescribed units into the barrel. Verify dosage against air bubbles.'
        },
        {
          step: 3,
          label: 'Subcutaneous Delivery',
          title: 'Pinch & Inject (45–90°)',
          desc: 'Gently pinch a fold of subcutaneous skin. Insert the needle at a 45–90° angle, depress the plunger smoothly, and hold for 5 seconds before withdrawing.'
        },
        {
          step: 4,
          label: 'Safe Disposal',
          title: 'Sharps Protocol',
          desc: 'Never recap needles. Immediately discard used syringe and needle into an approved biohazard sharps container. Wash hands.'
        }
      ]
    };
  }

  // 5. Default: Follicular / Scalp Solution
  return {
    type: 'scalp_hair',
    label: 'Personalized Follicular Therapy',
    indication: 'Personalized Follicular Therapy & Hair Preservation',
    summaryBadge: 'TrichoSol™ / TrichoFoam™ Patented Vehicle',
    defaultVehicle: 'TrichoSol™ Patented Liposomal Scalp Carrier',
    vehicleDesc: 'TrichoSol™ (Fagron) (Patented liposomal phytocomplex, alcohol-free, non-greasy carrier)',
    storageGuidelines: [
      'Store at room temperature (15–25°C) away from direct sunlight.',
      'Keep the bottle tightly closed when not in use.',
      'Keep out of reach of children and domestic pets.'
    ],
    milestones: [
      { period: 'Weeks 1–4', desc: 'Follicular stimulation & stabilization of the hair growth cycle.' },
      { period: 'Weeks 5–8', desc: 'Noticeable reduction in hair shedding; follicular transition into active anagen phase.' },
      { period: 'Weeks 9–12', desc: 'Visible improvement in hair shaft caliber, density gains, and scalp revitalization.' }
    ],
    steps: [
      {
        step: 1,
        label: 'Preparation',
        title: 'Dry & Clean Scalp',
        desc: 'Ensure your hair and scalp are completely clean and thoroughly dry before applying the solution.'
      },
      {
        step: 2,
        label: 'Accurate Dosage',
        title: 'Calibrated Dosing',
        desc: 'Measure the prescribed dosage (e.g., 1 mL or 2 pumps) directly onto affected scalp areas using the calibrated dropper or nozzle.'
      },
      {
        step: 3,
        label: 'Absorption',
        title: 'Fingertip Massage',
        desc: 'Gently distribute the lotion with clean fingertips for 30–45 seconds to maximize follicular contact.'
      },
      {
        step: 4,
        label: 'Contact Time',
        title: 'Leave-In (≥ 4 Hours)',
        desc: 'Do not wash, wet, or rinse scalp for at least 4 hours. Wash hands thoroughly with soap after application.'
      }
    ]
  };
};

const getVehicleDescription = (vehicleName = '', modalityType = 'scalp_hair') => {
  const v = String(vehicleName).toLowerCase();
  if (v.includes('pentravan')) {
    return 'Pentravan® Liposomal Cream (Fagron) (Patented transdermal liposomal emulsion base for optimal dermal and systemic bioavailability, alcohol-free)';
  }
  if (v.includes('pomade') || v.includes('ointment') || v.includes('pomada')) {
    return 'Compounded Hypoallergenic Ointment Base (Non-irritating, soothing occlusive galenic carrier)';
  }
  if (v.includes('capsule') || v.includes('cápsula') || v.includes('vegetable')) {
    return 'Hypoallergenic Vegetable Enteric Capsule Base (100% plant-derived cellulose, gluten-free, dairy-free)';
  }
  if (v.includes('trichooil') || (v.includes('oil') && !v.includes('lipophilic'))) {
    return 'TrichoOil™ (Fagron) (100% natural plant-derived emollient lipid carrier, alcohol-free)';
  }
  if (v.includes('trichofoam') || v.includes('foam')) {
    return 'TrichoFoam™ (Fagron) (Patented surfactant scalp foam carrier, alcohol-free)';
  }
  if (v.includes('trichocream')) {
    return 'TrichoCream™ (Fagron) (Conditioning lipid emulsion carrier, alcohol-free)';
  }
  if (v.includes('bacteriostatic') || v.includes('water for injection')) {
    return 'Bacteriostatic Water for Injection USP (0.9% Benzyl Alcohol sterile carrier)';
  }
  if (v.includes('trichosol')) {
    return 'TrichoSol™ (Fagron) (Patented liposomal phytocomplex, alcohol-free, non-greasy carrier)';
  }

  // Modality-based fallback
  if (modalityType === 'transdermal_cream') {
    return 'Pentravan® Liposomal Cream (Fagron) (Patented transdermal liposomal carrier, alcohol-free)';
  }
  if (modalityType === 'topical_pomade') {
    return 'Compounded Hypoallergenic Ointment Base (Soothing non-irritating galenic vehicle)';
  }
  if (modalityType === 'oral_protocol') {
    return 'Hypoallergenic Vegetable Enteric Capsule Base (Preservative-free plant cellulose)';
  }
  if (modalityType === 'injectable_peptide') {
    return 'Bacteriostatic Water for Injection USP (Sterile multidose vehicle)';
  }
  return 'TrichoSol™ (Fagron) (Patented liposomal phytocomplex, alcohol-free, non-greasy carrier)';
};

export default function PrescriptionBrochureModal({
  isOpen,
  onClose,
  rx = {},
  compoundedFormulations = [],
  genomicsData = null,
  currentStatus = 'active',
  isPatientView = false,
  publicUrl = '',
  patientPublicUrl = '',
  onOpenLabels = null
}) {
  const [docType, setDocType] = useState(isPatientView ? 'patient' : 'medical'); // 'medical' | 'patient'
  const [copiedLink, setCopiedLink] = useState(false);
  const printAreaRef = useRef(null);

  if (!isOpen) return null;

  const rxId = rx.prescriptionNumber || rx.prescriptionCode || rx.id || 'BOX03483AATRI';
  const fileNumber = rx.fileNumber || rx.fileNo || '51857';
  const patientName = (rx.patientName || rx.patient?.name || 'Patient Record').toUpperCase();
  const doctorName = formatDoctorName(rx.doctorName || rx.treatingDoctor || rx.physician || 'Dr. Marina Cordeiro Fernandes');
  const clinicName = rx.clinicName || 'NOVA Clinic Day Surgery Center, Dubai';
  const doctorLicense = rx.doctorLicense || 'DHA-91105367';
  const batchCode = rx.batchCode || 'PHARM-2026-B948';
  const issueDate = rx.date || rx.createdAt || '15-09-2026';
  const expiryDate = rx.expiryDate || rx.expDate || '15-09-2027';

  // Target URLs for QR codes
  const doctorQrUrl = publicUrl || `https://med-peptides.com/rx/${rxId}`;
  const patientQrUrl = patientPublicUrl || `https://med-peptides.com/rx/${rxId}?view=patient`;
  const cleanDisplayUrl = `med-peptides.com/rx/${rx.prescriptionCode || rx.prescriptionNumber || rxId}`;

  // Formulations fallback
  const formulations = compoundedFormulations && compoundedFormulations.length > 0 
    ? compoundedFormulations 
    : [
        {
          name: rx.productName || 'Personalized Compounded Regimen',
          dosageForm: rx.dosageForm || 'Compounded Topical Formulation',
          volume: rx.volume || '100 mL',
          posology: rx.posology || 'Administer as directed by treating physician.',
          formula: rx.formula || 'Personalized Active Pharmaceutical Ingredients in Compounded Vehicle Base'
        }
      ];

  // Detect Clinical Modality
  const modality = detectTreatmentModality(rx, formulations);

  const getPosologyString = (pos) => {
    if (!pos) return 'Administer as directed by treating physician.';
    if (typeof pos === 'string') return pos;
    if (typeof pos === 'object') {
      return pos.regimen || pos.instructions || pos.dosageInstructions || pos.title || 'Administer as directed by physician.';
    }
    return String(pos);
  };

  const getFormulaString = (phase) => {
    if (phase.formula && typeof phase.formula === 'string') return phase.formula;
    if (phase.ingredients && typeof phase.ingredients === 'string') return phase.ingredients;
    if (Array.isArray(phase.apis) && phase.apis.length > 0) {
      const apisStr = phase.apis.map(a => `${a.name || a.productName || 'API'} ${a.dosage || a.dose || ''}`.trim()).join(' + ');
      const vName = phase.vehicle?.name || phase.vehicle?.productName || phase.vehicleName;
      return vName ? `${apisStr} in ${vName}` : apisStr;
    }
    return 'Active Pharmaceutical Ingredients in Compounded Carrier Base';
  };

  const getPhaseTitle = (phase, idx) => {
    return phase.title || phase.name || phase.productName || `Phase ${phase.phaseNumber || idx + 1} Formulation`;
  };

  // High-Precision Isolated Multi-Page Print Engine
  const handlePrint = () => {
    const printEl = printAreaRef.current;
    if (!printEl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHtml = printEl.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docType === 'medical' ? 'Clinical_Monograph' : 'Patient_Treatment_Guide'}_${rxId}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #202124;
              background: #ffffff;
              font-size: 11px;
              line-height: 1.4;
            }
            .gcp-a4-page-sheet {
              width: 100%;
              min-height: 268mm;
              display: flex;
              flex-direction: column;
              padding: 0 0 10mm 0;
              margin-bottom: 0;
              page-break-after: always !important;
              break-after: page !important;
            }
            .gcp-a4-page-sheet:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .gcp-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .gcp-a4-sheet-footer {
              margin-top: auto;
              padding-top: 10px;
              border-top: 1px solid #dadce0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8.5px;
              color: #70757a;
            }
            h1, h2, h3, h4, p { margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px 8px; border: 1px solid #dadce0; }
            th { background: #f8fafc; font-weight: 600; text-align: left; }
          </style>
        </head>
        <body>
          <div>
            ${printHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSharePatient = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(patientQrUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
    const shareText = `*Personalized Treatment Guide — Ref: #${rxId}*\nPatient: ${patientName}\nPrescribing Physician: ${doctorName}\n\nAccess your digital posology guide, active ingredients, and request compounding refills directly:\n${patientQrUrl}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="gcp-brochure-backdrop">
      <style>{`
        .gcp-brochure-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.78);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .gcp-brochure-dialog {
          background: #ffffff;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
          overflow: hidden;
          border: 1px solid #dadce0;
        }
        @media (max-width: 640px) {
          .gcp-brochure-backdrop {
            padding: 0;
            align-items: flex-end;
          }
          .gcp-brochure-dialog {
            max-height: 100dvh;
            height: 100%;
            border-radius: 14px 14px 0 0;
            border: none;
          }
        }
        .gcp-brochure-header {
          padding: 12px 20px;
          border-bottom: 1px solid #dadce0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          flex-shrink: 0;
          gap: 12px;
        }
        .gcp-brochure-body {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          background: #e8eaed;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 640px) {
          .gcp-brochure-body {
            padding: 12px 8px;
          }
        }
        /* True Multi-Page A4 Sheet Canvas */
        .gcp-a4-page-sheet {
          background: #ffffff;
          width: 100%;
          max-width: 760px;
          min-height: 1020px;
          box-shadow: 0 4px 16px rgba(60, 64, 67, 0.15), 0 1px 3px rgba(60, 64, 67, 0.1);
          border: 1px solid #dadce0;
          border-radius: 4px;
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          color: #202124;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          margin-bottom: 24px;
          position: relative;
          box-sizing: border-box;
          page-break-after: always;
          break-after: page;
        }
        .gcp-a4-page-sheet:last-child {
          margin-bottom: 0;
          page-break-after: auto;
          break-after: auto;
        }
        @media (max-width: 640px) {
          .gcp-a4-page-sheet {
            padding: 20px 16px;
            gap: 14px;
            min-height: auto;
          }
        }
        .gcp-a4-sheet-footer {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid #dadce0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.68rem;
          color: #70757a;
          letter-spacing: 0.02em;
        }
        .gcp-avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .gcp-brochure-footer {
          flex-shrink: 0;
          background: #ffffff;
          border-top: 1px solid #dadce0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          box-shadow: 0 -2px 6px rgba(60, 64, 67, 0.06);
          z-index: 10;
        }
        .gcp-footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          min-width: 0;
        }
        .gcp-meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 28px;
          padding: 0 10px;
          background: #f1f3f4;
          border: 1px solid #dadce0;
          border-radius: 14px;
          font-size: 0.74rem;
          font-weight: 500;
          color: #3c4043;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.1px;
        }
        .gcp-utility-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .gcp-footer-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-left: auto;
          flex-shrink: 0;
        }
        .gcp-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 20px;
          border-radius: 4px;
          background: #1a73e8;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: 0.2px;
          border: 1px solid #1a73e8;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .gcp-btn-primary:hover {
          background: #1765cc;
          box-shadow: 0 1px 3px 1px rgba(60, 64, 67, 0.25);
        }
        .gcp-btn-primary:active {
          background: #1557b0;
        }
        .gcp-btn-cancel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 36px;
          padding: 0 16px;
          border-radius: 4px;
          background: transparent;
          border: 1px solid #dadce0;
          color: #3c4043;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: 0.2px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .gcp-btn-cancel:hover {
          background: #f1f3f4;
          color: #202124;
          border-color: #c6c6c6;
        }
        .gcp-btn-cancel:active {
          background: #e8eaed;
        }
        .gcp-btn-outlined {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 14px;
          border-radius: 4px;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #1a73e8;
          font-size: 0.80rem;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: 0.2px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
        }
        .gcp-btn-outlined:hover {
          background: #f8fafd;
          border-color: #d2e3fc;
        }
        .gcp-btn-outlined:active {
          background: #e8f0fe;
        }
        .gcp-btn-outlined.success {
          background: #e6f4ea;
          border-color: #86efac;
          color: #137333;
        }
        @media (max-width: 960px) {
          .gcp-brochure-footer {
            padding: 10px 16px;
            gap: 10px;
          }
          .gcp-footer-left {
            width: 100%;
            justify-content: space-between;
          }
          .gcp-footer-right {
            width: 100%;
            justify-content: flex-end;
          }
        }
        @media (max-width: 640px) {
          .gcp-brochure-footer {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 8px)) 12px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            box-shadow: 0 -4px 18px rgba(60, 64, 67, 0.14);
            border-top: 1px solid #dadce0;
          }
          .gcp-footer-left {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .gcp-meta-chip {
            align-self: center;
          }
          .gcp-utility-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .gcp-footer-right {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 8px;
            margin-left: 0;
          }
          .gcp-btn-primary {
            height: 44px;
            font-size: 0.86rem;
            width: 100%;
          }
          .gcp-btn-cancel,
          .gcp-btn-outlined {
            height: 42px;
            font-size: 0.80rem;
            width: 100%;
          }
        }
      `}</style>

      <div className="gcp-brochure-dialog">
        {/* Modal Header */}
        <div className="gcp-brochure-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '6px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d2e3fc'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#202124' }}>
                  {docType === 'medical' ? 'Clinical Monograph & Dossier' : 'Patient Personalized Treatment Guide'}
                </h3>
                <span style={{
                  background: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  2 Pages (A4) · Sectional Print Break Ready
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#5f6368' }}>
                Prescription #{rxId} · Modality: {modality.label}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Switcher (Doctor/Admin view) */}
            {!isPatientView && (
              <div style={{
                display: 'inline-flex',
                background: '#f1f3f4',
                padding: '3px',
                borderRadius: '6px',
                gap: '3px'
              }}>
                <button
                  type="button"
                  onClick={() => setDocType('medical')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: docType === 'medical' ? '1px solid #dadce0' : '1px solid transparent',
                    background: docType === 'medical' ? '#ffffff' : 'transparent',
                    color: docType === 'medical' ? '#1a73e8' : '#5f6368',
                    fontSize: '0.76rem',
                    fontWeight: docType === 'medical' ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  Medical Brochure
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('patient')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: docType === 'patient' ? '1px solid #dadce0' : '1px solid transparent',
                    background: docType === 'patient' ? '#ffffff' : 'transparent',
                    color: docType === 'patient' ? '#1a73e8' : '#5f6368',
                    fontSize: '0.76rem',
                    fontWeight: docType === 'patient' ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  Patient Guide
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: '#5f6368',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body containing Distinct A4 Pages */}
        <div className="gcp-brochure-body">
          <div ref={printAreaRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {docType === 'medical' ? (
              /* ════════════════════════════════════════════════════════════════
                  MEDICAL MONOGRAPH: 2 DISTINCT A4 PAGES
              ════════════════════════════════════════════════════════════════ */
              <>
                {/* ── PAGE 1: CLINICAL OVERVIEW & FORMULATIONS ── */}
                <div className="gcp-a4-page-sheet" data-page="1">
                  {/* Header */}
                  <div style={{ borderBottom: '2px solid #003666', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          PHARMAPOLIS COMPOUNDING PHARMACY · OFFICIAL MEDICAL MONOGRAPH
                        </div>
                        <div style={{ fontSize: '1.28rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', letterSpacing: '-0.02em' }}>
                          Personalized Clinical Formulations Dossier
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '3px' }}>
                          EU GMP Certified Compounding Facility · Individualized Pharmacotherapeutic Protocol
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#003666', fontFamily: 'monospace' }}>
                          Ref: #{rxId}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                          Date: {issueDate} · Exp: {expiryDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient & Prescriber Demographics */}
                  <div className="gcp-avoid-break" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '12px 14px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        PATIENT DEMOGRAPHICS
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {patientName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                        Clinical Indication: <strong>{modality.indication}</strong>
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#e6f4ea',
                          color: '#137333',
                          border: '1px solid #ceead6',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }} />
                          {currentStatus || 'ACTIVE TREATMENT'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        PRESCRIBING PHYSICIAN
                      </div>
                      <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {doctorName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                        License: <strong>{doctorLicense}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                        Clinic: <strong>{clinicName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Pharmacogenomics / Clinical Rationale Card */}
                  <div className="gcp-avoid-break" style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    background: '#ffffff'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {genomicsData ? 'Clinical Pharmacogenomics Panel (TrichoTest™ DNA Profile)' : 'Therapeutic Framework & Clinical Modality'}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                      {genomicsData ? (
                        'Formulation customized according to patient genetic polymorphism analysis (SULT1A1 sulfotransferase activity, AR androgen sensitivity, and prostaglandin pathway kinetics).'
                      ) : (
                        `Formulation calibrated for ${modality.indication}. Active pharmaceutical ingredients compounding follows European Pharmacopoeia (Ph. Eur.) and USP standards with validated stability.`
                      )}
                    </div>
                  </div>

                  {/* Formulations Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Compounded Pharmaceutical Formulations ({formulations.length} {formulations.length === 1 ? 'Phase' : 'Phases'})
                    </div>

                    {formulations.map((phase, idx) => (
                      <div
                        key={idx}
                        className="gcp-avoid-break"
                        style={{
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          background: '#f8fafc',
                          padding: '8px 12px',
                          borderBottom: '1px solid #cbd5e1',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', marginRight: '6px' }}>
                              Phase {phase.phaseNumber || idx + 1}:
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                              {getPhaseTitle(phase, idx)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {phase.dosageForm || modality.summaryBadge} · {phase.volume || '90 mL'}
                          </div>
                        </div>

                        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                              Active Formula &amp; Vehicle
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#1e293b', marginTop: '2px', fontFamily: 'monospace' }}>
                              {getFormulaString(phase)}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                              Prescribed Posology &amp; Directions for Use
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#1e293b', marginTop: '2px' }}>
                              {getPosologyString(phase.posology || phase.directions)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Page 1 Footer */}
                  <div className="gcp-a4-sheet-footer">
                    <span>Page 1 of 2 · Official Clinical Dossier · Ref: #{rxId}</span>
                    <span>Pharmapolis Compounding Pharmacy · EU GMP Standards</span>
                  </div>
                </div>

                {/* ── PAGE 2: ACTIVE MONOGRAPH, QA & VERIFICATION SIGNATURES ── */}
                <div className="gcp-a4-page-sheet" data-page="2">
                  {/* Header Continuity */}
                  <div style={{ borderBottom: '2px solid #003666', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          PHARMAPOLIS QUALITY ASSURANCE · CONTINUATION DOSSIER
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          Pharmaceutical Monograph &amp; Batch Validation
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#003666', fontFamily: 'monospace' }}>
                          Ref: #{rxId}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          Patient: {patientName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Compounds & Pharmacological Classification */}
                  <div className="gcp-avoid-break" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                      Detailed Active Pharmaceutical Ingredients (APIs) &amp; Carrier Monograph
                    </div>
                    {formulations.map((phase, pIdx) => {
                      const apis = Array.isArray(phase.apis) && phase.apis.length > 0
                        ? phase.apis
                        : Array.isArray(rx.items) && rx.items.length > 0
                          ? rx.items.filter(it => !String(it.name || '').toLowerCase().includes('vehicle'))
                          : [];
                      const vehicleName = phase.vehicle?.name || phase.vehicleName || modality.defaultVehicle;

                      return (
                        <div key={pIdx} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', background: '#f8fafc' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                            {getPhaseTitle(phase, pIdx)} — {phase.volume || 'Standard Volume'}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '6px' }}>
                            {apis.map((api, aIdx) => {
                              const rawClass = api.therapeuticClass || api.category || api.role || '';
                              const englishClass = translateTherapeuticClass(rawClass);
                              const doseFormatted = formatApiDose(api.dosage || api.dose || api.strength);

                              return (
                                <div key={aIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 10px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.76rem', color: '#0f172a' }}>{api.name || `Active Compound ${aIdx + 1}`}</span>
                                    {doseFormatted && (
                                      <span style={{ color: '#003666', fontWeight: 700, fontSize: '0.70rem', background: '#e0f2fe', padding: '1px 6px', borderRadius: '3px' }}>
                                        {doseFormatted}
                                      </span>
                                    )}
                                  </div>
                                  {englishClass && (
                                    <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '3px', lineHeight: 1.3 }}>
                                      {englishClass}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ fontSize: '0.70rem', color: '#475569', marginTop: '8px' }}>
                            <strong style={{ color: '#1e293b' }}>Compounding Carrier:</strong> {getVehicleDescription(vehicleName, modality.type)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quality Specifications & Storage Block */}
                  <div className="gcp-avoid-break" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '12px 14px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                        Storage &amp; Stability Guidelines
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                        {modality.storageGuidelines.map((g, i) => (
                          <div key={i}>• {g}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                        Expected Clinical Milestones
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                        {modality.milestones.map((m, i) => (
                          <div key={i}>• <strong style={{ color: '#0f172a' }}>{m.period}:</strong> {m.desc}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Official Verification Box with Doctor QR */}
                  <div className="gcp-avoid-break" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                        Official Clinical Dossier Verification
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', maxWidth: '440px', lineHeight: 1.4 }}>
                        Scan the QR code to verify this medical prescription monograph in the European digital repository, inspect certificates of analysis (CoA), and check batch release status.
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#1a73e8', fontFamily: 'monospace', marginTop: '4px' }}>
                        {doctorQrUrl}
                      </div>
                    </div>

                    <div style={{
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}>
                      <QRCodeSVG
                        value={doctorQrUrl}
                        size={84}
                        level="H"
                        includeMargin={false}
                      />
                      <span style={{ fontSize: '0.56rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Doctor Verification
                      </span>
                    </div>
                  </div>

                  {/* Signature Block */}
                  <div className="gcp-avoid-break" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Treating Physician Signature &amp; Stamp:</div>
                      <div style={{ height: '32px', borderBottom: '1px solid #94a3b8', marginTop: '8px' }} />
                      <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                        {doctorName} · License {doctorLicense}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Compounding Pharmacist Release:</div>
                      <div style={{ height: '32px', borderBottom: '1px solid #94a3b8', marginTop: '8px' }} />
                      <div style={{ fontSize: '0.70rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                        Pharmapolis Quality Assurance · EU GMP Certified
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div className="gcp-a4-sheet-footer">
                    <span>Page 2 of 2 · Official Clinical Dossier · Ref: #{rxId}</span>
                    <span>Batch: {batchCode} · Verified EU GMP Release</span>
                  </div>
                </div>
              </>
            ) : (
              /* ════════════════════════════════════════════════════════════════
                  PATIENT BROCHURE: 2 DISTINCT A4 PAGES (SECTION-BASED CUT)
              ════════════════════════════════════════════════════════════════ */
              <>
                {/* ── PAGE 1: DAILY INSTRUCTIONS & REGIMEN OVERVIEW ── */}
                <div className="gcp-a4-page-sheet" data-page="1">
                  {/* Header */}
                  <div style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          PHARMAPOLIS PATIENT CARE · PERSONALIZED TREATMENT GUIDE
                        </div>
                        <div style={{ fontSize: '1.28rem', fontWeight: 700, color: '#202124', marginTop: '2px', letterSpacing: '-0.02em' }}>
                          Personalized Treatment Guide
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#5f6368', marginTop: '3px' }}>
                          Digital Posology Regimen &amp; Step-by-Step Daily Administration Guide
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1a73e8', fontFamily: 'monospace' }}>
                          Ref: #{rxId}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '2px' }}>
                          {clinicName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Demographics Card */}
                  <div className="gcp-avoid-break" style={{
                    background: '#f8f9fa',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                        Prescribed Specifically For
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#202124', marginTop: '2px' }}>
                        {patientName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '3px' }}>
                        Prescribing Physician: <strong style={{ color: '#202124', fontWeight: 600 }}>{doctorName}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: '#e6f4ea',
                        color: '#137333',
                        border: '1px solid #ceead6',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#137333' }} />
                        Active Treatment
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        color: '#1a73e8',
                        fontWeight: 600,
                        background: '#e8f0fe',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {modality.label}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Step-by-Step Daily Application Guide */}
                  <div className="gcp-avoid-break" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="#1a73e8" />
                      <span>How to Administer Your Treatment Correctly</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {modality.steps.map((s) => (
                        <div key={s.step} style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', padding: '12px 14px', borderLeft: '3px solid #1a73e8' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '0.70rem',
                              fontWeight: 700,
                              color: '#1a73e8',
                              background: '#e8f0fe',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              Step {s.step}
                            </span>
                            <span style={{ fontSize: '0.70rem', color: '#5f6368', fontWeight: 500 }}>{s.label}</span>
                          </div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124', marginTop: '6px' }}>{s.title}</div>
                          <div style={{ fontSize: '0.73rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Treatment Regimen Overview & Dosing Schedules */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#1a73e8" />
                      <span>Prescribed Dosing Schedule &amp; Daily Posology</span>
                    </div>

                    {formulations.map((phase, idx) => (
                      <div key={idx} className="gcp-avoid-break" style={{ border: '1px solid #dadce0', borderRadius: '6px', padding: '12px 14px', background: '#f8f9fa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dadce0', paddingBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#202124' }}>
                              {getPhaseTitle(phase, idx)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#5f6368', marginLeft: '6px' }}>
                              ({phase.dosageForm || modality.summaryBadge})
                            </span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#1a73e8', fontWeight: 600, background: '#e8f0fe', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d2e3fc' }}>
                            {phase.volume || '90 mL'} · {phase.duration || '3-Month Supply'}
                          </span>
                        </div>

                        {/* Daily Posology Highlight Box */}
                        <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '4px', padding: '10px 12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} color="#1a73e8" style={{ flexShrink: 0 }} />
                          <div style={{ fontSize: '0.78rem', color: '#202124', fontWeight: 500 }}>
                            <strong style={{ color: '#1a73e8', fontWeight: 600 }}>Daily Administration:</strong> {getPosologyString(phase.posology || phase.directions)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Page 1 Footer */}
                  <div className="gcp-a4-sheet-footer">
                    <span>Page 1 of 2 · Confidential Medical Treatment Guide · Ref: #{rxId}</span>
                    <span>Pharmapolis Compounding Pharmacy · Patient Care Services</span>
                  </div>
                </div>

                {/* ── PAGE 2: COMPOUNDED FORMULATIONS, MILESTONES & REFILL PORTAL ── */}
                <div className="gcp-a4-page-sheet" data-page="2">
                  {/* Header Continuity */}
                  <div style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          PHARMAPOLIS PATIENT CARE · CONTINUATION GUIDE
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#202124', marginTop: '2px' }}>
                          Pharmaceutical Monograph &amp; Digital Refill Access
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1a73e8', fontFamily: 'monospace' }}>
                          Ref: #{rxId}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                          Patient: {patientName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Active Compounded Ingredients (APIs) for Each Phase */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Pill size={15} color="#1a73e8" />
                      <span>Active Compounded Ingredients &amp; Carrier Bases</span>
                    </div>

                    {formulations.map((phase, idx) => {
                      const apis = Array.isArray(phase.apis) && phase.apis.length > 0
                        ? phase.apis
                        : Array.isArray(rx.items) && rx.items.length > 0
                          ? rx.items.filter(it => !String(it.name || '').toLowerCase().includes('vehicle'))
                          : [];
                      const vehicleName = phase.vehicle?.name || phase.vehicleName || modality.defaultVehicle;

                      return (
                        <div key={idx} className="gcp-avoid-break" style={{ border: '1px solid #dadce0', borderRadius: '6px', padding: '12px 14px', background: '#f8f9fa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dadce0', paddingBottom: '6px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                              {getPhaseTitle(phase, idx)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>
                              {phase.volume || '90 mL'}
                            </span>
                          </div>

                          <div style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#1a73e8', letterSpacing: '0.02em', marginBottom: '6px' }}>
                              Active Pharmaceutical Ingredients (APIs):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '6px' }}>
                              {apis.map((api, aIdx) => {
                                const rawClass = api.therapeuticClass || api.category || api.role || '';
                                const englishClass = translateTherapeuticClass(rawClass);
                                const doseFormatted = formatApiDose(api.dosage || api.dose || api.strength || api.concentration);

                                return (
                                  <div key={aIdx} style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '4px', padding: '6px 10px', fontSize: '0.72rem' }}>
                                    <div style={{ fontWeight: 600, color: '#202124', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                                      <span>{api.name || api.drugName || api.activeIngredient || `Active Compound ${aIdx + 1}`}</span>
                                      {doseFormatted && (
                                        <span style={{
                                          color: '#1a73e8',
                                          fontWeight: 600,
                                          fontSize: '0.70rem',
                                          background: '#e8f0fe',
                                          padding: '1px 6px',
                                          borderRadius: '3px',
                                          border: '1px solid #d2e3fc',
                                          whiteSpace: 'nowrap'
                                        }}>
                                          {doseFormatted}
                                        </span>
                                      )}
                                    </div>
                                    {englishClass && (
                                      <div style={{ color: '#5f6368', fontSize: '0.67rem', marginTop: '2px', lineHeight: 1.3 }}>
                                        {englishClass}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '8px' }}>
                              <strong style={{ color: '#202124' }}>Compounding Vehicle:</strong> {getVehicleDescription(vehicleName, modality.type)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Storage Guidelines & Clinical Response Milestones */}
                  <div className="gcp-avoid-break" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    background: '#f8f9fa',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    padding: '12px 14px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a73e8' }}>
                        Storage &amp; Stability Guidelines
                      </div>
                      <div style={{ fontSize: '0.71rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
                        {modality.storageGuidelines.map((g, i) => (
                          <div key={i}>• {g}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1a73e8' }}>
                        Clinical Response Milestones
                      </div>
                      <div style={{ fontSize: '0.71rem', color: '#5f6368', marginTop: '4px', lineHeight: 1.45 }}>
                        {modality.milestones.map((m, i) => (
                          <div key={i}>• <strong style={{ color: '#202124' }}>{m.period}:</strong> {m.desc}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Patient QR Code & Refill Box */}
                  <div className="gcp-avoid-break" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8f9fa',
                    border: '1px solid #dadce0',
                    borderLeft: '4px solid #1a73e8',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    gap: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#202124' }}>
                        Scan to Access Your Patient Portal &amp; Request Refills
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#5f6368', marginTop: '3px', maxWidth: '440px', lineHeight: 1.4 }}>
                        Scan this QR code with your smartphone camera to view your digital dosage tracker, update your treating physician, or request a prescription renewal.
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#1a73e8', fontFamily: 'monospace', marginTop: '4px', fontWeight: 600 }}>
                        {cleanDisplayUrl}
                      </div>
                    </div>

                    <div style={{
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}>
                      <QRCodeSVG
                        value={patientQrUrl}
                        size={88}
                        level="H"
                        includeMargin={false}
                      />
                      <span style={{ fontSize: '0.56rem', fontWeight: 600, color: '#1a73e8', textTransform: 'uppercase' }}>
                        Patient Portal QR
                      </span>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div className="gcp-a4-sheet-footer">
                    <span>Page 2 of 2 · Official Compounding Pharmacy Monograph · Ref: #{rxId}</span>
                    <span>Pharmapolis Batch: {batchCode} · Quality Assured</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Modal Footer Actions (Google Cloud UX Standard for Laptop & Mobile) */}
        <div className="gcp-brochure-footer">
          {/* Left Group: Document Specs & Secondary Utilities */}
          <div className="gcp-footer-left">
            <div 
              className="gcp-meta-chip"
              title={isPatientView ? 'Documento médico oficial en formato estándar A4' : 'A4 Multi-page Medical Layout'}
            >
              <FileText size={13} color="#5f6368" />
              <span>{isPatientView ? 'A4 · 2 Páginas' : 'A4 Portrait · 2 Pages'}</span>
            </div>

            <div className="gcp-utility-actions">
              <button
                type="button"
                onClick={handleSharePatient}
                className={`gcp-btn-outlined ${copiedLink ? 'success' : ''}`}
                title={isPatientView ? 'Copiar enlace permanente de la receta o compartir' : 'Share patient link via WhatsApp or copy URL'}
              >
                {copiedLink ? <Check size={14} color="#137333" /> : <Share2 size={14} color="#1a73e8" />}
                <span>
                  {copiedLink 
                    ? (isPatientView ? 'Enlace Copiado ✓' : 'Link Copied ✓') 
                    : (isPatientView ? 'Compartir / Copiar Enlace' : 'Share with Patient')}
                </span>
              </button>

              {!isPatientView && onOpenLabels && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLabels();
                  }}
                  className="gcp-btn-outlined"
                  title="Open Pharmapolis bottle labels modal"
                >
                  <Pill size={14} color="#1a73e8" />
                  <span>View Bottle Labels</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Group: Confirmation / Dismiss Pair (GCP Standard) */}
          <div className="gcp-footer-right">
            <button
              type="button"
              onClick={onClose}
              className="gcp-btn-cancel"
            >
              {isPatientView ? 'Cerrar' : 'Close'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="gcp-btn-primary"
            >
              <Printer size={15} />
              <span>{isPatientView ? 'Imprimir / Guardar PDF' : 'Print / Save as PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
