import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updateColwayMaster() {
  console.log('--- 1. Updating Supplier supplier-colway ---');
  const supRef = db.collection('suppliers').doc('supplier-colway');
  const supDoc = await supRef.get();
  if (supDoc.exists) {
    await supRef.update({
      name: 'Colway',
      legalName: 'Colway',
      shortName: 'Colway',
      brand: 'Colway',
      description: 'Polish pioneer in biologically active native freshwater fish tropocollagen (triple-helix preserved), clinical cosmeceuticals, trichology, and dietary supplements.',
      updatedAt: new Date().toISOString()
    });
    console.log('Updated supplier-colway to Colway');
  }

  console.log('--- 2. Updating All Colway Products in Firestore ---');
  const productsSnap = await db.collection('products').get();
  
  const imageMap = {
    'colway-colvita': '/images/products/colway/colvita.png',
    'colway-blue-diamond-cream': '/images/products/colway/blue-diamond-cream.png',
    'colway-blue-diamond-peeling': '/images/products/colway/blue-diamond-peeling.png',
    'colway-collagen-vege': '/images/products/colway/vege-collagen.png',
    'colway-collagen-wash-gel': '/images/products/colway/washing-gel.png',
    'colway-collagen-lip-care': '/images/products/colway/lip-care.png',
    'colway-strengthening-shampoo': '/images/products/colway/shampoo.png',
    'colway-strengthening-conditioner': '/images/products/colway/conditioner.png',
  };

  const colwayProducts = productsSnap.docs.filter(d => {
    const data = d.data();
    return (
      d.id.includes('colway') ||
      (data.brand && data.brand.toLowerCase().includes('colway')) ||
      (data.vendor && data.vendor.toLowerCase().includes('colway')) ||
      (data.supplier && data.supplier.toLowerCase().includes('colway')) ||
      (data.supplierName && data.supplierName.toLowerCase().includes('colway'))
    );
  });

  for (const doc of colwayProducts) {
    const data = doc.data();
    const pid = doc.id;
    const targetImage = imageMap[pid] || data.image || '/images/products/colway/colvita.png';
    
    const updatedVariants = (data.variants || []).map(v => ({
      ...v,
      supplierId: 'supplier-colway',
      supplierName: 'Colway',
      supplier: 'Colway'
    }));

    const updatePayload = {
      brand: 'Colway',
      vendor: 'Colway',
      supplier: 'Colway',
      supplierName: 'Colway',
      supplierId: 'supplier-colway',
      image: targetImage,
      images: [targetImage],
      variants: updatedVariants,
      updatedAt: new Date().toISOString()
    };

    if (pid === 'colway-colvita') {
      updatePayload.category = 'Dietary Supplement';
      updatePayload.therapeutic_category = 'Cellular ECM & Bioactive Tropocollagen Nutricosmetic';
      updatePayload.type = 'supplement';
      updatePayload.productType = 'supplement';
      updatePayload.is_supplement = true;
      updatePayload.isSupplement = true;
      updatePayload.is_cosmetic = false;
    }

    await doc.ref.update(updatePayload);
    console.log(`Updated product: ${pid} -> brand: Colway, image: ${targetImage}`);
  }

  console.log('--- 3. Creating/Updating colway-trichology System Product ---');
  const trichologyRef = db.collection('products').doc('colway-trichology');
  const trichologyDoc = await trichologyRef.get();

  const trichologyData = {
    id: 'colway-trichology',
    slug: 'colway-trichology',
    name: 'Colway Trichology Hair Strengthening System (2-Step Synergistic Routine)',
    canonicalName: 'Colway Trichology Hair Strengthening System',
    title: 'Colway Trichology Hair Strengthening System',
    brand: 'Colway',
    vendor: 'Colway',
    supplier: 'Colway',
    supplierName: 'Colway',
    supplierId: 'supplier-colway',
    suppliers: ['supplier-colway'],
    supplierIds: ['supplier-colway'],
    isSingleSupplierLocked: true,
    status: 'published',
    category: 'cosmetics',
    therapeutic_category: 'Follicular Stem Cell Activation & Anti-Miniaturisation Hair System',
    type: 'cosmetic',
    productType: 'cosmetic',
    is_cosmetic: true,
    is_trichology: true,
    leadTimeDays: 2,
    purity: 'Medical Grade Trichology Cosmeceutical',
    rating: 4.96,
    reviewsCount: 64,
    cost: 32,
    price: 68,
    wholesale_price: 44,
    retail_price: 68,
    unit_price: 68,
    image: '/images/products/colway/colway-trichology-banner.jpg',
    images: [
      '/images/products/colway/colway-trichology-banner.jpg',
      '/images/products/colway/shampoo.png',
      '/images/products/colway/conditioner.png'
    ],
    description: 'Colway Trichology Hair Strengthening System is a complete 2-step synergistic cosmeceutical therapy specifically formulated to arrest follicular miniaturisation, stimulate dormant stem cells at the dermal papilla, and repair damaged hair shafts. Combining the Strengthening Shampoo (densifying, sulphate-free, with diosmin and caffeine) and Strengthening Conditioner (cuticle sealing, with native fish tropocollagen and bio-silica), this system delivers the clinically validated Baicapil™ 2% complex (Scutellaria Baicalensis, Soy & Wheat Sprouts), Kerascalp™ (Phyllanthus Emblica Collagen XVII booster), and biomimetic Hydrafeel® 3.',
    shortDescription: 'Synergistic 2-Step Trichological System (Shampoo 250mL + Conditioner 200mL) with Baicapil™ 2%, Native Tropocollagen, Kerascalp™ & Bio-Silica for Follicular Stem Cell Activation.',
    application_protocol: {
      frequency: '3–4× / Week',
      duration_of_use: 'Minimum 12 Weeks',
      steps: [
        {
          step: 1,
          phase: 'STEP 1: SHAMPOO',
          instruction: 'Apply Colway Strengthening Shampoo to wet scalp. Massage gently for 2–3 minutes to promote microvascular flow and allow diosmin and caffeine to penetrate dermal papilla cells. Rinse thoroughly.',
          duration: '2–3 min'
        },
        {
          step: 2,
          phase: 'STEP 2: CONDITIONER',
          instruction: 'Apply Colway Strengthening Conditioner from roots to ends. Leave in contact for 3–5 minutes for trans-epidermal Baicapil™ delivery and cuticle sealing. Rinse with cool water (≤38°C).',
          duration: '3–5 min',
          temp: '≤38°C'
        }
      ],
      professional_notes: [
        'Synergistic duo routine indicated for androgenetic alopecia, telogen effluvium, post-COVID shedding, and fragile follicular anchoring.',
        'Sulphate-free, paraben-free, silicone-free, and safe for color-treated hair.',
        'Integrates with injectable or oral GHK-Cu, PRP scalp sessions, and microneedling protocols.'
      ]
    },
    active_complexes: [
      {
        name: 'Baicapil™ 2%',
        description: 'Synergistic botanical complex (Scutellaria Baicalensis, Soy & Wheat Sprouts) clinically proven to stimulate hair growth, lengthen anagen phase, and increase density by up to 60.6%.'
      },
      {
        name: 'Kerascalp™',
        description: 'Phyllanthus Emblica (Amla) fruit extract upregulating Collagen XVII expression in follicle stem cells to prevent miniaturisation and graying.'
      },
      {
        name: 'Native Freshwater Fish Tropocollagen',
        description: 'Intact triple-helix collagen molecules that provide structural extracellular matrix scaffolding to the perifollicular sheath.'
      },
      {
        name: 'Hydrafeel® 3',
        description: 'Polyglyceryl-3 PCA biomimetic moisture active providing cuticular hydration, lipid bilayer repair, and shielding against thermal oxidation.'
      }
    ],
    variants: [
      {
        id: 'colway-trichology-var-duo',
        productId: 'colway-trichology',
        productName: 'Colway Trichology Hair Strengthening System',
        name: 'Colway Trichology Complete Duo System (Shampoo 250mL + Conditioner 200mL)',
        sku: 'SKU-COLWAY-TRICHOLOGY-DUO',
        format: 'Complete 2-Step System',
        dosage: 'Duo Pack (250mL + 200mL)',
        size: 'Duo Pack (250mL + 200mL)',
        pricing: {
          master: { perUnit: 32, currency: 'USD' },
          wholesale: { perUnit: 44, currency: 'USD' },
          clinic: { perUnit: 52, currency: 'USD' },
          retail: { perUnit: 68, currency: 'USD' }
        },
        cost: 32,
        price: 68,
        unit_price: 68,
        stock: { available: 50, allocated: 0, reserved: 0 },
        supplierId: 'supplier-colway',
        supplierName: 'Colway',
        supplier: 'Colway',
        hasCoa: true,
        hasGmp: true,
        status: 'published',
        volume: '450 mL Total'
      }
    ],
    formats: [
      { id: 'duo-system', name: 'Complete 2-Step System (Shampoo + Conditioner)', description: 'Full synergistic 90-day clinical regimen' }
    ],
    strengths: [
      { id: 'st-duo', name: 'Duo Pack (250mL + 200mL)' }
    ],
    updatedAt: new Date().toISOString()
  };

  await trichologyRef.set(trichologyData, { merge: true });
  console.log('Successfully written colway-trichology to Firestore!');
}

updateColwayMaster()
  .then(() => {
    console.log('ALL COLWAY UPDATES COMPLETED SUCCESSFULLY!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error updating Colway master:', err);
    process.exit(1);
  });
