import { adminDb } from '../src/lib/firebaseAdmin.js';

async function registerLarimedical() {
  console.log('--- Registering LARIMEDICAL in Firestore ---');

  // 1. Supplier Document in 'suppliers'
  const supplierRef = adminDb.collection('suppliers').doc('supplier-larimedical');
  const supplierData = {
    id: 'supplier-larimedical',
    name: 'LARIMEDICAL (Larimide S.L.U.)',
    displayName: 'LARIMEDICAL',
    companyName: 'Larimide, S.L.U.',
    brand: 'LARIMEDICAL',
    code: 'LRM',
    type: 'Sterile Cosmeceuticals & Mesotherapy',
    country: 'Spain',
    city: 'Alcoy',
    province: 'Alicante',
    postalCode: '03804',
    address: 'Pol. Ind. Cotes Baixes, Calle G, Nº 7',
    phone: '+34 687 168 464',
    email: 'info@larimide.com',
    website: 'https://www.larimide.com',
    currency: 'EUR',
    defaultCurrency: 'EUR',
    status: 'active',
    warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
    shippingOrigins: ['Spain'],
    leadTime: '2-4 business days (EU)',
    category: 'Skincare & Topicals',
    categoryIds: ['skincare'],
    productCategories: ['skincare'],
    productTypes: ['finished_product'],
    notes: 'Laboratorio español fabricante de alta cosmecéutica profesional, bioestimuladores estériles (gama STERILIA), mesoterapia clínica y peelings químicos para uso médico y estético profesional.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await supplierRef.set(supplierData, { merge: true });
  console.log('✅ Supplier "supplier-larimedical" registered successfully.');

  // 2. The 4 Products in STERILIA range
  const steriliaProducts = [
    {
      id: 'larimedical-ha-15',
      slug: 'larimedical-ha-15',
      name: 'HA 15 (Sterile Solution)',
      canonicalName: 'HA 15 Sterile Hyaluronic Acid Solution (15 mg/ml)',
      status: 'active',
      isActive: true,
      category: 'skincare',
      categoryId: 'skincare',
      subcategory: 'Sterile Mesotherapy Solutions',
      productType: 'finished_product',
      type: 'finished_product',
      primaryType: 'finished_product',
      availableTypes: ['finished_product'],
      catalogBrand: 'LARIMEDICAL',
      supplier: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierId: 'supplier-larimedical',
      supplierIds: ['supplier-larimedical'],
      suppliers: ['supplier-larimedical'],
      countryOfOrigin: 'Spain',
      warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
      description: 'Sterile solution of non-crosslinked hyaluronic acid (15 mg/ml) indicated for intensive hydration protocols and improving skin quality. Promotes firmness, radiance, and softens fine lines of dehydration.',
      clinicalBenefits: 'Intensive hydration and improved dermic firmness without adding unnatural volume. High tissue tolerability and biocompatibility.',
      mechanismOfAction: 'Replenishes extracellular matrix hydration via non-crosslinked hyaluronic acid, supporting fibroblast microenvironment and restoring skin turgor.',
      targetSystem: 'Dermal Extracellular Matrix & Epidermal Barrier',
      primaryGoal: 'Skin Hydration, Radiance & Firmness',
      goals: ['skin_hydration', 'skin_firmness', 'anti_aging'],
      applicationAreas: ['Face', 'Neck', 'Décolletage', 'Hands', 'Elbows', 'Knees'],
      requiresColdChain: false,
      hasCOA: true,
      presentation: 'vial',
      variantsCount: 1,
      variant: {
        id: 'larimedical-ha-15-8ml-box5',
        productName: 'HA 15 Sterile Solution 8 ml (Box of 5 vials)',
        dose: '15 mg/ml (120 mg total / vial)',
        dosage: '8 ml / vial (Box of 5 vials)',
        normalizedDosage: '8ml',
        fill_volume: '8 ml',
        concentration: '15 mg/ml',
        presentation: 'vial',
        presentationName: 'Vial',
        format: 'vial',
        packageType: 'kit',
        unitsPerPack: 5,
        unitsPerKit: 5,
        packSize: 5,
        quantity: '5 vials / box',
        catalogBrand: 'LARIMEDICAL',
        sourceCatalogue: 'LARIMEDICAL Sterilia',
        supplier: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierId: 'supplier-larimedical',
        status: 'published',
        isActive: true,
        currency: 'EUR',
        warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
        shippingOrigins: ['Spain'],
        leadTime: '2-4 business days'
      }
    },
    {
      id: 'larimedical-adipocore-5',
      slug: 'larimedical-adipocore-5',
      name: 'ADIPOCORE 5 (Sterile Solution)',
      canonicalName: 'ADIPOCORE 5 Sterile Lipolytic Solution',
      status: 'active',
      isActive: true,
      category: 'skincare',
      categoryId: 'skincare',
      subcategory: 'Sterile Mesotherapy Solutions',
      productType: 'finished_product',
      type: 'finished_product',
      primaryType: 'finished_product',
      availableTypes: ['finished_product'],
      catalogBrand: 'LARIMEDICAL',
      supplier: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierId: 'supplier-larimedical',
      supplierIds: ['supplier-larimedical'],
      suppliers: ['supplier-larimedical'],
      countryOfOrigin: 'Spain',
      warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
      description: 'Sterile formulation for professional use in protocols targeting localized fat deposits and cellulite. Combines lipid mobilization, fatty acid metabolism support, and tissue microenvironment improvement.',
      clinicalBenefits: 'Targeted body contouring, fat emulsification, skin texture refinement, and fluid balance optimization. Synergistic with lymphatic drainage and lifestyle measures.',
      mechanismOfAction: 'Multimodal lipolytic design: Phosphatidylcholine and Sodium Deoxycholate emulsify membrane adipocytes; L-Carnitine transports free fatty acids to mitochondrial beta-oxidation; Silybum marianum stem cells promote adipose tissue browning.',
      targetSystem: 'Adipose Tissue Microenvironment & Lipid Metabolism',
      primaryGoal: 'Localized Fat Mobilization & Cellulite Contouring',
      goals: ['fat_mobilization', 'body_contouring', 'cellulite_reduction'],
      applicationAreas: ['Abdomen', 'Flanks', 'Thighs', 'Gluteal area', 'Submental / Double chin'],
      requiresColdChain: false,
      hasCOA: true,
      presentation: 'vial',
      variantsCount: 1,
      variant: {
        id: 'larimedical-adipocore-5-10ml-box5',
        productName: 'ADIPOCORE 5 Sterile Solution 10 ml (Box of 5 vials)',
        dose: 'Phosphatidylcholine + Deoxycholate + Carnitine + Stem Cells',
        dosage: '10 ml / vial (Box of 5 vials)',
        normalizedDosage: '10ml',
        fill_volume: '10 ml',
        presentation: 'vial',
        presentationName: 'Vial',
        format: 'vial',
        packageType: 'kit',
        unitsPerPack: 5,
        unitsPerKit: 5,
        packSize: 5,
        quantity: '5 vials / box',
        catalogBrand: 'LARIMEDICAL',
        sourceCatalogue: 'LARIMEDICAL Sterilia',
        supplier: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierId: 'supplier-larimedical',
        status: 'published',
        isActive: true,
        currency: 'EUR',
        warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
        shippingOrigins: ['Spain'],
        leadTime: '2-4 business days'
      }
    },
    {
      id: 'larimedical-biogf-331',
      slug: 'larimedical-biogf-331',
      name: 'BIOGF 331 (Sterile Solution)',
      canonicalName: 'BIOGF 331 Biostimulating Cocktail with Growth Factors',
      status: 'active',
      isActive: true,
      category: 'skincare',
      categoryId: 'skincare',
      subcategory: 'Sterile Mesotherapy Solutions',
      productType: 'finished_product',
      type: 'finished_product',
      primaryType: 'finished_product',
      availableTypes: ['finished_product'],
      catalogBrand: 'LARIMEDICAL',
      supplier: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierId: 'supplier-larimedical',
      supplierIds: ['supplier-larimedical'],
      suppliers: ['supplier-larimedical'],
      countryOfOrigin: 'Spain',
      warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
      description: 'Multi-component biostimulating cocktail for dermal remodeling and dermo-epidermal junction optimization. Indicated in photoaging, loss of density, early sagging, fine wrinkles, atrophic acne scars, and stretch marks.',
      clinicalBenefits: 'Accelerates collagen fibrillogenesis, optimizes cellular signaling, strengthens dermo-epidermal cohesion, and promotes skin renewal.',
      mechanismOfAction: 'Signaling cascade via EGF (epidermal proliferation), TGF-beta2 (fibroblasts & ECM synthesis), and VEGF (microvascular supply). Structural biomimetic matrix with Collagen I-like, Collagen IV-like, Fibrillin-1-like peptides, and Skinarch(TM) for MKX & Collagen VI fibril organization.',
      targetSystem: 'Dermo-Epidermal Junction (DEJ) & Fibroblast Signaling Axis',
      primaryGoal: 'Tissue Remodeling, Dermal Density & Scars Repair',
      goals: ['skin_rejuvenation', 'tissue_remodeling', 'scar_repair', 'collagen_stimulation'],
      applicationAreas: ['Face', 'Neck', 'Décolletage', 'Atrophic Scar Areas', 'Stretch Marks'],
      recommendedProtocol: '1 session every 2 weeks for 2 months (1 vial per session); maintenance starting month 3 based on clinical evaluation.',
      requiresColdChain: false,
      hasCOA: true,
      presentation: 'vial',
      variantsCount: 1,
      variant: {
        id: 'larimedical-biogf-331-5ml-box5',
        productName: 'BIOGF 331 Sterile Solution 5 ml (Box of 5 vials)',
        dose: 'EGF + TGF-β2 + VEGF + Collagen I/IV-like + Skinarch™',
        dosage: '5 ml / vial (Box of 5 vials)',
        normalizedDosage: '5ml',
        fill_volume: '5 ml',
        presentation: 'vial',
        presentationName: 'Vial',
        format: 'vial',
        packageType: 'kit',
        unitsPerPack: 5,
        unitsPerKit: 5,
        packSize: 5,
        quantity: '5 vials / box',
        catalogBrand: 'LARIMEDICAL',
        sourceCatalogue: 'LARIMEDICAL Sterilia',
        supplier: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierId: 'supplier-larimedical',
        status: 'published',
        isActive: true,
        currency: 'EUR',
        warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
        shippingOrigins: ['Spain'],
        leadTime: '2-4 business days'
      }
    },
    {
      id: 'larimedical-vitamatrix-115',
      slug: 'larimedical-vitamatrix-115',
      name: 'VITAMATRIX 115 (Sterile Solution)',
      canonicalName: 'VITAMATRIX 115 Advanced Revitalizing Concentrate',
      status: 'active',
      isActive: true,
      category: 'skincare',
      categoryId: 'skincare',
      subcategory: 'Sterile Mesotherapy Solutions',
      productType: 'finished_product',
      type: 'finished_product',
      primaryType: 'finished_product',
      availableTypes: ['finished_product'],
      catalogBrand: 'LARIMEDICAL',
      supplier: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
      supplierId: 'supplier-larimedical',
      supplierIds: ['supplier-larimedical'],
      suppliers: ['supplier-larimedical'],
      countryOfOrigin: 'Spain',
      warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
      description: 'Sterile concentrate formulated for advanced revitalization protocols. Delivers immediate hydration, functional nutrition, and antioxidant protection, with cosmetic neuromodulating peptides and Reneseed(TM) for retinoid-like renewal without irritation.',
      clinicalBenefits: 'Smooths expression lines, boosts cellular vitality, restores radiance, and unifies skin tone with exceptional tolerance.',
      mechanismOfAction: 'Reneseed(TM) stimulates retinoid signaling for epidermal renewal and elasticity without retinization side effects; neuromodulating cosmetic peptides modulate micro-contractions; comprehensive complex of vitamins, amino acids, and cofactors recharges metabolic pool.',
      targetSystem: 'Cellular Energy Metabolism & Neuromodulating Surface Micro-Tension',
      primaryGoal: 'Cellular Revitalization, Retinoid-like Renewal & Line Smoothing',
      goals: ['skin_revitalization', 'radiance', 'fine_lines_smoothing', 'antioxidant_defense'],
      applicationAreas: ['Face', 'Neck', 'Décolletage', 'Photo-damaged skin areas'],
      requiresColdChain: false,
      hasCOA: true,
      presentation: 'vial',
      variantsCount: 1,
      variant: {
        id: 'larimedical-vitamatrix-115-5ml-box5',
        productName: 'VITAMATRIX 115 Sterile Solution 5 ml (Box of 5 vials)',
        dose: 'Reneseed™ + Multivitamins + Amino Acids + Peptides',
        dosage: '5 ml / vial (Box of 5 vials)',
        normalizedDosage: '5ml',
        fill_volume: '5 ml',
        presentation: 'vial',
        presentationName: 'Vial',
        format: 'vial',
        packageType: 'kit',
        unitsPerPack: 5,
        unitsPerKit: 5,
        packSize: 5,
        quantity: '5 vials / box',
        catalogBrand: 'LARIMEDICAL',
        sourceCatalogue: 'LARIMEDICAL Sterilia',
        supplier: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierName: 'LARIMEDICAL (Larimide S.L.U.)',
        supplierId: 'supplier-larimedical',
        status: 'published',
        isActive: true,
        currency: 'EUR',
        warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
        shippingOrigins: ['Spain'],
        leadTime: '2-4 business days'
      }
    }
  ];

  for (const p of steriliaProducts) {
    const { variant, ...productData } = p;
    const pRef = adminDb.collection('products').doc(p.id);

    productData.createdAt = new Date().toISOString();
    productData.updatedAt = new Date().toISOString();

    await pRef.set(productData, { merge: true });
    console.log(`✅ Product "${p.id}" registered.`);

    // Subcollection variant
    const vRef = pRef.collection('variants').doc(variant.id);
    variant.productId = p.id;
    variant.createdAt = new Date().toISOString();
    variant.updatedAt = new Date().toISOString();

    await vRef.set(variant, { merge: true });
    console.log(`   ↳ Variant "${variant.id}" registered.`);
  }

  console.log('--- All LARIMEDICAL items registered successfully ---');
  process.exit(0);
}

registerLarimedical().catch(err => {
  console.error('❌ Registration failed:', err);
  process.exit(1);
});
