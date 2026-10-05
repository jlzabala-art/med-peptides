import admin from 'firebase-admin';

if (!admin.apps.length) {
  const cred = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) : null;
  if (cred) admin.initializeApp({ credential: admin.credential.cert(cred) });
  else admin.initializeApp();
}

const db = admin.firestore();

async function seed() {
  const boxId = 'BOX03535AATRI';
  console.log(`🚀 Seeding multi-vehicle TrichoTest prescription: ${boxId}...`);

  const rxDoc = {
    id: boxId,
    prescriptionNumber: `RX-${boxId}`,
    prescriptionCode: boxId,
    code: boxId,
    fileNumber: boxId,
    status: 'approved',
    validationStatus: 'Ready',
    quotationStatus: 'Pending',
    orderStatus: 'Pending',
    sourceType: 'fagron_genomics',
    source: 'fagron',
    importSource: 'fagron_genomics_ai',

    // Patient Identification (Page 1)
    patientName: 'Tausifuzzaman Khaleequzza',
    patient: {
      name: 'Tausifuzzaman Khaleequzza',
      fullName: 'Tausifuzzaman Khaleequzza',
      id: 'tausifuzzaman-khaleequzza',
      patientId: '987456',
      fileNumber: boxId,
      sampleId: boxId,
      sampleType: 'Buccal Swab',
      dob: '1973-01-10',
      age: 53,
      gender: 'Male',
      nationality: 'UAE',
      emiratesId: '784-1973-9874561-2'
    },

    // Doctor / Clinic Identification
    doctorName: 'Dr. Haytham Salem',
    doctorLicense: 'DHA-P-0319842',
    clinicName: 'Med Art Clinic Day Surgery Center',
    doctor: {
      id: 'dr-haytham-salem',
      name: 'Dr. Haytham Salem',
      title: 'Consultant Orthopedic & Regenerative Medicine · Arthregen Clinic',
      license: 'DHA-P-0319842',
      clinic: 'Med Art Clinic Day Surgery Center',
      address: 'Med Art Clinic Day Surgery Center, Villa 823, Jumeirah St., Dubai, UAE',
      city: 'Dubai',
      country: 'United Arab Emirates',
      phone: '+971 4 346 6149'
    },

    // Fagron Genomics metadata
    fagron: {
      boxId: boxId,
      sampleCode: boxId,
      testName: 'TrichoTest',
      sampleType: 'Buccal Swab',
      receivedDate: '2026-06-09',
      reportDate: '2026-06-16',
      ocrExtracted: true,
      importedAt: new Date().toISOString()
    },

    // Clinical Indication & Scope
    treatmentProgram: 'TrichoTest™ Personalized Multi-Vehicle Protocol',
    treatmentType: 'Precision Topical Scalp Solution & Scalp Hygiene Oil',
    dispensingForm: 'Topical Solution / Scalp Oil',
    duration: '3 months (3 bottles TrichoSol 100 mL + 1 bottle TrichoOil 30 mL)',
    volume: '100 mL + 30 mL',
    diagnosis: 'Androgenetic Alopecia & Scalp Barrier Optimization (TrichoTest™ Pharmacogenetic Guided)',

    // Posology Summary
    posology: {
      regimen: 'Phase 1: Apply 1 mL TrichoSol solution nightly to scalp. Phase 2: Apply TrichoOil 1-2 times weekly, massage 3-5 min, leave 10 min before wash.',
      timing: 'Bedtime (Phase 1) & Pre-Wash (Phase 2)',
      steps: [
        'Phase 1: Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
        'Phase 2: 1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.'
      ]
    },

    // ── TWO SEPARATE FORMULATION BLOCKS (MULTI-VEHICLE ARCHITECTURE) ──
    formulationBlocks: [
      {
        index: 1,
        phaseNumber: 1,
        treatmentProgram: 'TrichoTest',
        treatmentType: 'Precision Compounded Topical Solution in TrichoSol™',
        dispensingForm: 'Topical Scalp Solution',
        volume: '100 mL',
        duration: '3 months (3 bottles x 100 mL)',
        container: 'Amber Glass Bottle with Precision Dropper / Metered Spray',
        vehicle: {
          name: 'TrichoSol™ Patented Vehicle',
          activeIngredient: 'TrichoSol™ Hydrophilic Liposomal Vehicle (Fagron)',
          volume: '100 mL',
          description: '100% Alcohol-Free & Propylene Glycol-Free hydrophilic liposomal carrier. Maximizes follicular uptake without scalp irritation or flaking.'
        },
        posology: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
        items: [
          {
            id: 'api-box03535-1',
            name: 'Prostaquinon TM',
            drugName: 'Prostaquinon TM',
            activeIngredient: 'Prostaquinon™ (Standardized Active Phytocomplex)',
            dose: '3% (30 mg/mL)',
            dosage: '3% (30 mg/mL)',
            strength: '3% (30 mg/mL)',
            isVehicleOrBase: false,
            category: 'Standardized Follicular Phytocomplex',
            therapeuticClass: 'Selective 5α-Reductase & PGD2 Receptor Modulation',
            mechanism: 'Botanical phytocomplex that modulates local scalp 5-alpha reductase activity and antagonizes prostaglandin D2 (PGD2) receptors, mitigating inflammatory miniaturization of hair follicles.',
            cellularTarget: 'Follicular 5α-Reductase & PGD2 Receptors',
            instructions: 'Apply 1 mL once daily at night to scalp'
          },
          {
            id: 'api-box03535-2',
            name: 'Spironolactone',
            drugName: 'Spironolactone',
            activeIngredient: 'Spironolactone (Micronized USP)',
            dose: '1% (10 mg/mL)',
            dosage: '1% (10 mg/mL)',
            strength: '1% (10 mg/mL)',
            isVehicleOrBase: false,
            category: 'Competitive Androgen Receptor Antagonist',
            therapeuticClass: 'Local Scalp DHT Blockade',
            mechanism: 'Competitively blocks dihydrotestosterone (DHT) from binding to local follicular androgen receptors in the scalp, preventing DHT-induced follicular miniaturization without systemic anti-androgenic side effects.',
            cellularTarget: 'Follicular Androgen Receptors (AR) in Dermal Papilla',
            instructions: 'Apply 1 mL once daily at night to scalp'
          },
          {
            id: 'api-box03535-3',
            name: 'IGrantine-F1 TM',
            drugName: 'IGrantine-F1 TM',
            activeIngredient: 'IGrantine-F1™ (Follicle Biostimulant Peptide Complex)',
            dose: '0.25% (2.5 mg/mL)',
            dosage: '0.25% (2.5 mg/mL)',
            strength: '0.25% (2.5 mg/mL)',
            isVehicleOrBase: false,
            category: 'Biomimetic Follicular Peptide Complex',
            therapeuticClass: 'Follicular Bulb Biostimulation & Miniaturization Defense',
            mechanism: 'Bioengineered biomimetic signaling peptide complex that stimulates cellular proliferation in the hair matrix, enhances dermal papilla extracellular matrix synthesis, and counteracts miniaturization.',
            cellularTarget: 'Follicular Matrix Keratinocytes & Dermal Papilla Signaling',
            instructions: 'Apply 1 mL once daily at night to scalp'
          },
          {
            id: 'api-box03535-4',
            name: 'TrichoSol™ Patented Vehicle',
            drugName: 'TrichoSol™ Patented Vehicle',
            activeIngredient: 'TrichoSol™ Hydrophilic Phytocomplex Vehicle (Fagron)',
            dose: 'q.s. 100 mL',
            dosage: '100 mL',
            strength: '100 mL',
            isVehicleOrBase: true,
            category: 'Patented Trichological Vehicle',
            therapeuticClass: 'Non-Irritating Scalp Delivery Matrix',
            mechanism: 'Mineral-salts and polyphenol phytocomplex enhances solubility and epidermal deposition of Prostaquinon, Spironolactone, and IGrantine without causing scalp dryness or contact erythema.',
            cellularTarget: 'Follicular Infundibulum & Stratum Corneum'
          }
        ]
      },
      {
        index: 2,
        phaseNumber: 2,
        treatmentProgram: 'TrichoTest',
        treatmentType: 'Scalp Care & Hygiene Pre-Wash Nutrient in TrichoOil™',
        dispensingForm: 'Topical Scalp Oil',
        volume: '30 mL',
        duration: '3 months (1 bottle x 30 mL)',
        container: 'Amber Glass Bottle with Dropper Pipette',
        vehicle: {
          name: 'TrichoOil™ Patented Vehicle',
          activeIngredient: 'TrichoOil™ Natural Lipid Scalp Vehicle (Fagron)',
          volume: '30 mL',
          description: '100% natural, lightweight non-greasy lipid carrier enriched with fatty acids. Restores scalp lipid barrier and optimizes hair bulb microenvironment.'
        },
        posology: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
        items: [
          {
            id: 'api-box03535-5',
            name: 'Vitamin E (Tocoferol)',
            drugName: 'Vitamin E (Tocoferol)',
            activeIngredient: 'D-Alpha-Tocopherol (USP / Ph. Eur.)',
            dose: '3.5% (35 mg/mL)',
            dosage: '3.5% (35 mg/mL)',
            strength: '3.5% (35 mg/mL)',
            isVehicleOrBase: false,
            category: 'Essential Lipid-Soluble Antioxidant',
            therapeuticClass: 'Scalp Lipid Barrier & Radical Protection',
            mechanism: 'Protects scalp stratum corneum lipids and perifollicular cell membranes against oxidative stress and lipid peroxidation, maintaining barrier integrity and cellular vitality.',
            cellularTarget: 'Scalp Stratum Corneum & Perifollicular Membrane Lipids',
            instructions: '1-2 times / week, massage for 3-5 min and leave for 10 min before shampoo'
          },
          {
            id: 'api-box03535-6',
            name: 'TrichoOil™ Patented Vehicle',
            drugName: 'TrichoOil™ Patented Vehicle',
            activeIngredient: 'TrichoOil™ Natural Lipid Scalp Vehicle (Fagron)',
            dose: 'q.s. 30 mL',
            dosage: '30 mL',
            strength: '30 mL',
            isVehicleOrBase: true,
            category: 'Patented Trichological Vehicle',
            therapeuticClass: 'Scalp Restorative Lipid Vehicle',
            mechanism: 'Rich in essential fatty acids and sebum-mimetic triglycerides, conditioning the scalp and hair cuticle prior to cleansing.',
            cellularTarget: 'Scalp Stratum Corneum & Hair Cuticle'
          }
        ]
      }
    ],

    // Consolidated prescriptionLines & items across both vehicles
    prescriptionLines: [
      { drugName: 'Prostaquinon TM', strength: '3% (30 mg/mL)', instructions: 'Apply 1 mL once daily at night to scalp' },
      { drugName: 'Spironolactone', strength: '1% (10 mg/mL)', instructions: 'Apply 1 mL once daily at night to scalp' },
      { drugName: 'IGrantine-F1 TM', strength: '0.25% (2.5 mg/mL)', instructions: 'Apply 1 mL once daily at night to scalp' },
      { drugName: 'TrichoSol™ Vehicle', strength: 'q.s. 100 mL', instructions: 'Hydrophilic vehicle with phytocomplex' },
      { drugName: 'Vitamin E (Tocoferol)', strength: '3.5% (35 mg/mL)', instructions: '1-2 times / week before wash' },
      { drugName: 'TrichoOil™ Vehicle', strength: 'q.s. 30 mL', instructions: 'Natural lipid vehicle' }
    ],

    items: [
      {
        id: 'api-box03535-1',
        name: 'Prostaquinon TM',
        activeIngredient: 'Prostaquinon™',
        dose: '3% (30 mg/mL)',
        dosage: '3% (30 mg/mL)',
        category: 'Standardized Follicular Phytocomplex',
        therapeuticClass: 'Selective 5α-Reductase & PGD2 Receptor Modulation',
        cellularTarget: 'Follicular 5α-Reductase & PGD2 Receptors'
      },
      {
        id: 'api-box03535-2',
        name: 'Spironolactone',
        activeIngredient: 'Spironolactone (Micronized USP)',
        dose: '1% (10 mg/mL)',
        dosage: '1% (10 mg/mL)',
        category: 'Competitive Androgen Receptor Antagonist',
        therapeuticClass: 'Local Scalp DHT Blockade',
        cellularTarget: 'Follicular Androgen Receptors (AR) in Dermal Papilla'
      },
      {
        id: 'api-box03535-3',
        name: 'IGrantine-F1 TM',
        activeIngredient: 'IGrantine-F1™',
        dose: '0.25% (2.5 mg/mL)',
        dosage: '0.25% (2.5 mg/mL)',
        category: 'Biomimetic Follicular Peptide Complex',
        therapeuticClass: 'Follicular Bulb Biostimulation & Miniaturization Defense',
        cellularTarget: 'Follicular Matrix Keratinocytes & Dermal Papilla Signaling'
      },
      {
        id: 'api-box03535-4',
        name: 'TrichoSol™ Patented Vehicle',
        activeIngredient: 'TrichoSol™',
        dose: 'q.s. 100 mL',
        dosage: '100 mL',
        category: 'Patented Trichological Vehicle',
        therapeuticClass: 'Non-Irritating Scalp Delivery Matrix'
      },
      {
        id: 'api-box03535-5',
        name: 'Vitamin E (Tocoferol)',
        activeIngredient: 'D-Alpha-Tocopherol',
        dose: '3.5% (35 mg/mL)',
        dosage: '3.5% (35 mg/mL)',
        category: 'Essential Lipid-Soluble Antioxidant',
        therapeuticClass: 'Scalp Lipid Barrier & Radical Protection',
        cellularTarget: 'Scalp Stratum Corneum & Perifollicular Membrane Lipids'
      },
      {
        id: 'api-box03535-6',
        name: 'TrichoOil™ Patented Vehicle',
        activeIngredient: 'TrichoOil™',
        dose: 'q.s. 30 mL',
        dosage: '30 mL',
        category: 'Patented Trichological Vehicle',
        therapeuticClass: 'Scalp Restorative Lipid Vehicle'
      }
    ],

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('prescriptions').doc(boxId).set(rxDoc, { merge: true });
  console.log(`✅ Successfully seeded multi-vehicle prescription ${boxId} in Firestore!`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
