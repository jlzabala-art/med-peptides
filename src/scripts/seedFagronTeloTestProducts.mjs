/**
 * seedFagronTeloTestProducts.mjs
 * 
 * Normalizes and associates canonical products for Fagron Genomics TeloTest
 * using Fagron Iberia as supplier.
 */
import { adminDb } from '../lib/firebaseAdmin.js';

if (!adminDb) {
  console.error('Firebase Admin not initialized');
  process.exit(1);
}

const TELOTEST_PROGRAM_ID = 'fagron-genomics-telotest';
const TELOTEST_PROGRAM_NAME = 'Fagron Genomics | TeloTest';
const TELOTEST_SLUG = 'fagron-genomics-telotest';
const FAGRON_IBERIA_SUPPLIER_ID = 'supplier-fagron-iberia';
const FAGRON_IBERIA_SUPPLIER_NAME = 'Fagron Iberia';

// TeloTest Products Definition with Normalized Metadata
const TELOTEST_PRODUCTS = [
  // PRIORITY A
  {
    canonicalSlug: 'vitamin-e',
    name: 'Vitamin E (Tocopherol)',
    canonicalName: 'Vitamin E',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Lipid-soluble antioxidant (d-alpha-tocopherol) protecting cellular membranes and telomeric DNA from oxidative stress.',
    commercialName: 'Vitamin E',
    synonyms: ['Tocopherol', 'd-alpha-tocopherol', 'Vitamin E Acetate'],
    route: 'oral',
    dosage: '400 IU / 268 mg',
    format: 'Bulk Powder / Softgel',
    purity: '≥98%',
    casNumber: '59-02-9',
    tags: ['Antioxidant', 'Telomere Protection', 'Longevity', 'Lipid Protection']
  },
  {
    canonicalSlug: 'vitamin-c',
    name: 'Vitamin C (Ascorbic Acid)',
    canonicalName: 'Vitamin C',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Essential water-soluble antioxidant essential for collagen synthesis, immune function, and telomere integrity maintenance.',
    commercialName: 'Vitamin C (Oral / Pure API)',
    synonyms: ['Ascorbic Acid', 'L-Ascorbic Acid', 'Oral Vitamin C'],
    route: 'oral',
    dosage: '500 mg - 1000 mg',
    format: 'Bulk Powder / Crystalline',
    purity: '≥99%',
    casNumber: '50-81-7',
    tags: ['Antioxidant', 'Collagen', 'Immunity', 'Telomere Protection']
  },
  {
    canonicalSlug: 'silymarin',
    name: 'Silymarin (Milk Thistle Extract)',
    canonicalName: 'Silymarin',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Standardized flavonolignan complex extracted from Silybum marianum with potent hepatoprotective and telomerase-supporting properties.',
    commercialName: 'Silymarin 80%',
    synonyms: ['Milk Thistle Extract', 'Silybum marianum', 'Silibinin'],
    route: 'oral',
    dosage: '200 mg',
    format: 'Bulk Powder (80% Silymarin)',
    purity: '≥80%',
    casNumber: '65666-07-1',
    tags: ['Hepatoprotection', 'Antioxidant', 'Liver Support', 'Longevity']
  },
  {
    canonicalSlug: 'coenzyme-q10',
    name: 'Coenzyme Q10 (Ubiquinone)',
    canonicalName: 'Coenzyme Q10',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Endogenous mitochondrial electron carrier and lipid antioxidant critical for bioenergetics and cellular longevity.',
    commercialName: 'Oral Coenzyme Q10 / Ubiquinone',
    synonyms: ['Ubiquinone', 'CoQ10', 'Oral CoQ10', 'Ubidecarenone'],
    route: 'oral',
    dosage: '100 mg - 200 mg',
    format: 'Bulk Powder / Crystalline',
    purity: '≥98%',
    casNumber: '303-98-0',
    tags: ['Mitochondria', 'Cardiovascular', 'Antioxidant', 'Energy']
  },
  {
    canonicalSlug: 'pycnogenol',
    name: 'Pycnogenol (Pinus pinaster)',
    canonicalName: 'Pycnogenol',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'French maritime pine bark extract standardized in procyanidins, providing microcirculation support and free-radical quenching.',
    commercialName: 'Pycnogenol®',
    synonyms: ['Pinus pinaster extract', 'French Maritime Pine Bark Extract', 'Proanthocyanidins'],
    route: 'oral',
    dosage: '50 mg - 100 mg',
    format: 'Standardized Powder',
    purity: 'Standardized ≥70% procyanidins',
    casNumber: '90082-75-0',
    tags: ['Endothelial', 'Microcirculation', 'Antioxidant', 'Nitric Oxide']
  },
  {
    canonicalSlug: 'turmeric-extract',
    name: 'Turmeric Dry Extract (Curcumin)',
    canonicalName: 'Turmeric Dry Extract',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Curcuma longa rhizome standardized extract (95% curcuminoids) modulating NF-kB pathways and protecting telomere stability.',
    commercialName: 'Turmeric Dry Extract 95%',
    synonyms: ['Curcumin', 'Curcuma longa', 'Turmeric Extract 95%'],
    route: 'oral',
    dosage: '500 mg',
    format: 'Standardized Dry Extract',
    purity: '≥95% Curcuminoids',
    casNumber: '458-37-7',
    tags: ['Anti-Inflammatory', 'NF-kB', 'Joint Health', 'Longevity']
  },
  {
    canonicalSlug: 'vitamin-d3-cholecalciferol',
    name: 'Cholecalciferol (Vitamin D3)',
    canonicalName: 'Cholecalciferol',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Secosteroid hormone precursor regulating calcium homeostasis, genomic expression, and immune-mediated telomere maintenance.',
    commercialName: 'Vitamin D3 (Cholecalciferol)',
    synonyms: ['Vitamin D3', 'Cholecalciferol', 'Colecalciferol'],
    route: 'oral',
    dosage: '2000 IU - 5000 IU',
    format: 'Powder / Oil Solution',
    purity: '≥98%',
    casNumber: '67-97-0',
    tags: ['Bone Health', 'Immunity', 'Hormone Precursor', 'Longevity']
  },
  {
    canonicalSlug: 'miodesin',
    name: 'Miodesin',
    canonicalName: 'Miodesin',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Patented phyto-complex (Uncaria tomentosa, Astrocaryum murumuru) formulated for deep anti-inflammatory and tissue regeneration cascades.',
    commercialName: 'Miodesin®',
    synonyms: ['Miodesin Phytocomplex', 'Phyto-anti-inflammatory API'],
    route: 'oral / topical',
    dosage: '500 mg',
    format: 'Patented Botanical Complex Powder',
    purity: 'Standardized Fagron API',
    tags: ['Anti-Inflammatory', 'Tissue Repair', 'Patented API', 'Fagron API']
  },
  {
    canonicalSlug: 'piperine',
    name: 'Piperine (Bioperine)',
    canonicalName: 'Piperine',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Black pepper alkaloid enhancing thermogenesis and gastrointestinal absorption / bioavailability of curcumin and polyphenols.',
    commercialName: 'Piperine 95%',
    synonyms: ['Bioperine', 'Piper nigrum extract', 'Black Pepper Alkaloid'],
    route: 'oral',
    dosage: '5 mg - 10 mg',
    format: 'Standardized Crystalline Powder',
    purity: '≥95%',
    casNumber: '94-62-2',
    tags: ['Bioavailability Enhancer', 'Absorption', 'Synergy']
  },
  {
    canonicalSlug: 'omega-3',
    name: 'Omega 3 (EPA / DHA)',
    canonicalName: 'Omega 3',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'High-concentration polyunsaturated essential fatty acids (EPA/DHA) maintaining cell membrane fluidity and lowering telomere attrition.',
    commercialName: 'Omega 3 High EPA/DHA',
    synonyms: ['EPA', 'DHA', 'Fish Oil Extract', 'Omega-3 Triglycerides'],
    route: 'oral',
    dosage: '1000 mg (500 EPA / 250 DHA)',
    format: 'Purified Oil / Softgel API',
    purity: 'TG Form ≥75% Active Omega-3',
    tags: ['Cardiovascular', 'Cell Membrane', 'Brain Health', 'Telomere Support']
  },
  {
    canonicalSlug: 'astaxanthin',
    name: 'Astaxanthin',
    canonicalName: 'Astaxanthin',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Keto-carotenoid with extraordinary transmembrane antioxidant capability, protecting mitochondrial inner membranes.',
    commercialName: 'Astaxanthin Natural 5%',
    synonyms: ['Haematococcus pluvialis extract', 'Natural Astaxanthin'],
    route: 'oral',
    dosage: '4 mg - 12 mg',
    format: 'Microencapsulated Oleoresin / Powder',
    purity: 'Standardized Extract',
    casNumber: '472-61-7',
    tags: ['Mitochondrial Antioxidant', 'Photoprotection', 'Longevity']
  },
  {
    canonicalSlug: 'resveratrol',
    name: 'Resveratrol (trans-Resveratrol)',
    canonicalName: 'Resveratrol',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Natural stilbenoid polyphenol acting as an allosteric activator of SIRT1 and AMPK, promoting DNA repair and mitochondrial biogenesis.',
    commercialName: 'trans-Resveratrol 98%',
    synonyms: ['trans-Resveratrol', 'Polygonum cuspidatum extract', 'SIRT1 Activator'],
    route: 'oral',
    dosage: '250 mg - 500 mg',
    format: 'Crystalline Micronized Powder',
    purity: '≥98% trans-isomer',
    casNumber: '501-36-0',
    tags: ['Sirtuin Activator', 'AMPK', 'Longevity', 'NAD+ Pathway']
  },
  {
    canonicalSlug: 'pinetonin',
    name: 'Pinetonin',
    canonicalName: 'Pinetonin',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Phytocomplex rich in essential oils and terpenes for neuro-endocrine relaxation and restorative physiological homeostasis.',
    commercialName: 'Pinetonin®',
    synonyms: ['Pinetonin Phytocomplex', 'Fagron Essential Phyto-Blend'],
    route: 'nasal / inhalation / oral',
    dosage: 'Custom formulation',
    format: 'Phyto-active liquid / API',
    purity: 'Fagron Standardized Phyto-grade',
    tags: ['Stress Response', 'Sleep Architecture', 'Neuroprotection']
  },
  {
    canonicalSlug: 'pomage',
    name: 'Pomage',
    canonicalName: 'Pomage',
    category: 'skincare',
    type: 'raw_material',
    priority: 'A',
    description: 'Polyphenolic apple pomace extract rich in phloridzin, chlorogenic acid and quercetin for anti-glycation and telomeric health.',
    commercialName: 'Pomage® (Oral / Topical)',
    synonyms: ['Oral Pomage', 'Topical Pomage', 'Apple Polyphenol Extract'],
    route: 'oral / topical',
    dosage: '100 mg - 300 mg',
    format: 'Concentrated Extract Powder',
    purity: 'Standardized Polyphenols',
    tags: ['Anti-Glycation', 'Polyphenol', 'Cellular Rejuvenation']
  },
  {
    canonicalSlug: 'siliciumax-tm',
    name: 'SiliciuMax TM (Bioavailable Silicon)',
    canonicalName: 'SiliciuMax TM',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Monomeric orthosilicic acid stabilized with maltodextrin for superior bioavailability and extracellular matrix regeneration.',
    commercialName: 'SiliciuMax® TM',
    synonyms: ['Oral SiliciuMax TM', 'Monomeric Silicon', 'Stabilized Orthosilicic Acid'],
    route: 'oral',
    dosage: '100 mg - 300 mg',
    format: 'Bioavailable Silicon Powder',
    purity: 'Stabilized Silicon Matrix',
    tags: ['Extracellular Matrix', 'Collagen Elastin', 'Vascular Elasticity']
  },
  {
    canonicalSlug: 'greenselect-phytosome',
    name: 'Green Tea Extract (GreenSelect Phytosome)',
    canonicalName: 'Green Tea Extract',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Decaffeinated green tea extract complexed with phospholipids (Phytosome) for 2x greater bioavailability of epigallocatechin gallate (EGCG).',
    commercialName: 'GreenSelect® Phytosome (Oral Green Tea)',
    synonyms: ['Oral Green Tea (GreenSelect)', 'GreenSelect TM', 'EGCG Phytosome', 'Camellia sinensis'],
    route: 'oral',
    dosage: '150 mg - 300 mg',
    format: 'Phytosome Powder (Standardized EGCG)',
    purity: '≥19% EGCG',
    casNumber: '989-51-5',
    tags: ['EGCG', 'Metabolic Health', 'Telomere Support', 'Phytosome']
  },
  {
    canonicalSlug: 'metformin',
    name: 'Metformin HCl',
    canonicalName: 'Metformin',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Biguanide compound and premier geroprotector acting through AMPK activation, insulin sensitivity, and reduction of telomeric degradation.',
    commercialName: 'Metformin Hydrochloride API',
    synonyms: ['Metformin HCl', '1,1-Dimethylbiguanide', 'Metformin API'],
    route: 'oral',
    dosage: '500 mg - 1000 mg',
    format: 'Pure Pharmaceutical API Powder',
    purity: '≥99.5% Ph. Eur.',
    casNumber: '1115-70-4',
    tags: ['Longevity', 'AMPK Activator', 'Insulin Sensitivity', 'Geroprotector']
  },
  {
    canonicalSlug: 'ginkgo-biloba',
    name: 'Ginkgo Biloba Standardized Extract',
    canonicalName: 'Ginkgo Biloba',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Standardized extract (24% flavone glycosides, 6% terpene lactones) improving cerebral and peripheral blood flow.',
    commercialName: 'Ginkgo Biloba Extract (Oral)',
    synonyms: ['Oral Ginkgo Biloba', 'Ginkgo Biloba Extract', 'EGb 761 equivalent'],
    route: 'oral',
    dosage: '120 mg - 240 mg',
    format: 'Standardized Dry Extract',
    purity: '24/6 Standardized',
    casNumber: '90045-36-6',
    tags: ['Cerebral Circulation', 'Cognitive', 'Microvascular', 'Antioxidant']
  },
  {
    canonicalSlug: 'testosterone',
    name: 'Testosterone (Bioidentical API)',
    canonicalName: 'Testosterone',
    category: 'hormone',
    type: 'raw_material',
    priority: 'A',
    description: 'Bioidentical androgenic hormone API for precision hormone optimization and preservation of muscle and telomeric health.',
    commercialName: 'Testosterone Micronized API',
    synonyms: ['Bioidentical Testosterone', 'Micronized Testosterone'],
    route: 'topical / subcutaneous pellet',
    dosage: 'Custom compounding',
    format: 'Micronized Powder API',
    purity: '≥99% USP/Ph. Eur.',
    casNumber: '58-22-0',
    tags: ['Hormone Optimization', 'Androgen', 'Longevity', 'Anabolic']
  },

  // PRIORITY B
  {
    canonicalSlug: 'nac',
    name: 'Acetylcysteine (NAC / N-Acetyl-L-Cysteine)',
    canonicalName: 'N-Acetyl-L-Cysteine',
    category: 'supplement',
    type: 'raw_material',
    priority: 'B',
    description: 'Rate-limiting precursor to glutathione (GSH), providing vital intracellular detoxification and reducing DNA oxidation.',
    commercialName: 'N-Acetyl-L-Cysteine (NAC)',
    synonyms: ['Acetylcysteine', 'NAC', 'N-Acetylcysteine'],
    route: 'oral',
    dosage: '600 mg - 1200 mg',
    format: 'White Crystalline Powder',
    purity: '≥99%',
    casNumber: '616-91-1',
    tags: ['Glutathione Precursor', 'Detoxification', 'Antioxidant', 'Cellular Defense']
  },
  {
    canonicalSlug: 'vitamin-b12-cyanocobalamin',
    name: 'Cyanocobalamin (Vitamin B12)',
    canonicalName: 'Vitamin B12 (Cyanocobalamin)',
    category: 'supplement',
    type: 'raw_material',
    priority: 'B',
    description: 'Essential cobalamin cofactor required for one-carbon methylation pathways, homocysteine regulation, and DNA synthesis.',
    commercialName: 'Cyanocobalamin 1% / Pure API',
    synonyms: ['Cyanocobalamin', 'Vitamin B12', 'Cianocobalamin'],
    route: 'oral / sublingual / injectable',
    dosage: '1000 mcg',
    format: 'Crystalline Powder',
    purity: '≥98.5%',
    casNumber: '68-19-9',
    tags: ['Methylation', 'Homocysteine', 'DNA Synthesis', 'Energy']
  },

  // PRIORITY C
  {
    canonicalSlug: 'folic-acid-vitamin-b9',
    name: 'Folic Acid (Vitamin B9)',
    canonicalName: 'Folic Acid',
    category: 'supplement',
    type: 'raw_material',
    priority: 'C',
    description: 'Synthetic folate cofactor essential for de novo nucleotide synthesis, purine/pyrimidine assembly, and genomic stability.',
    commercialName: 'Folic Acid (Vitamin B9)',
    synonyms: ['Folic Acid', 'Vitamin B9', 'Pteroylglutamic acid'],
    route: 'oral',
    dosage: '400 mcg - 800 mcg',
    format: 'Yellowish-orange Powder',
    purity: '≥98%',
    casNumber: '59-30-3',
    tags: ['One-Carbon Metabolism', 'DNA Repair', 'Genomic Stability']
  },
  {
    canonicalSlug: 'cycloastragenol',
    name: 'Cycloastragenol',
    canonicalName: 'Cycloastragenol',
    category: 'supplement',
    type: 'raw_material',
    priority: 'C',
    description: 'Triterpene aglycone extracted from Astragalus membranaceus identified as a natural telomerase reverse transcriptase (TERT) activator.',
    commercialName: 'Cycloastragenol 98%',
    synonyms: ['Astragalus Triterpenoid', 'TAT2', 'Telomerase Activator'],
    route: 'oral',
    dosage: '5 mg - 25 mg',
    format: 'Off-white Crystalline Powder',
    purity: '≥98%',
    casNumber: '78574-94-4',
    tags: ['Telomerase Activator', 'TERT Induction', 'Cellular Rejuvenation', 'Longevity']
  }
];

async function run() {
  console.log(`Starting Fagron Genomics TeloTest product seeding and association...`);
  console.log(`Total items to process: ${TELOTEST_PRODUCTS.length}`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of TELOTEST_PRODUCTS) {
    const docRef = adminDb.collection('products').doc(item.canonicalSlug);
    const docSnap = await docRef.get();

    const programAssociation = {
      id: TELOTEST_PROGRAM_ID,
      slug: TELOTEST_SLUG,
      name: TELOTEST_PROGRAM_NAME,
      priority: item.priority,
      metadata: {
        supplierId: FAGRON_IBERIA_SUPPLIER_ID,
        supplierName: FAGRON_IBERIA_SUPPLIER_NAME,
        commercialName: item.commercialName,
        synonyms: item.synonyms,
        route: item.route,
        dosage: item.dosage,
        format: item.format,
        purity: item.purity,
        casNumber: item.casNumber || null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const searchAliases = [
      'TeloTest',
      'Fagron Genomics',
      'fagron-genomics-telotest',
      'Fagron Iberia',
      item.canonicalName,
      ...(item.synonyms || [])
    ];

    if (docSnap.exists) {
      const existing = docSnap.data();
      const existingPrograms = Array.isArray(existing.programs) ? existing.programs : [];
      const existingTags = Array.isArray(existing.tags) ? existing.tags : [];
      const existingSupplierIds = Array.isArray(existing.supplierIds) ? existing.supplierIds : [];

      // Filter out previous version of this specific program if it existed
      const filteredPrograms = existingPrograms.filter(p => p.id !== TELOTEST_PROGRAM_ID && p.slug !== TELOTEST_SLUG);
      filteredPrograms.push(programAssociation);

      // Merge tags
      const updatedTags = Array.from(new Set([
        ...existingTags,
        TELOTEST_SLUG,
        TELOTEST_PROGRAM_NAME,
        'TeloTest',
        'Fagron Genomics',
        ...(item.tags || [])
      ]));

      // Merge supplierIds
      const updatedSupplierIds = Array.from(new Set([
        ...existingSupplierIds,
        FAGRON_IBERIA_SUPPLIER_ID
      ]));

      // Merge searchAliases
      const existingAliases = Array.isArray(existing.searchAliases) ? existing.searchAliases : [];
      const updatedAliases = Array.from(new Set([...existingAliases, ...searchAliases]));

      await docRef.update({
        programs: filteredPrograms,
        tags: updatedTags,
        supplierIds: updatedSupplierIds,
        searchAliases: updatedAliases,
        supplier: existing.supplier || FAGRON_IBERIA_SUPPLIER_NAME,
        updatedAt: new Date()
      });

      console.log(`[UPDATED] ${item.canonicalSlug} -> TeloTest Priority ${item.priority}`);
      updatedCount++;
    } else {
      // Create new canonical product
      const newDoc = {
        name: item.name,
        canonicalName: item.canonicalName,
        category: item.category,
        type: item.type,
        status: 'active',
        isActive: true,
        description: item.description,
        shortDesc: item.description,
        supplier: FAGRON_IBERIA_SUPPLIER_NAME,
        supplierIds: [FAGRON_IBERIA_SUPPLIER_ID],
        tags: [
          TELOTEST_SLUG,
          TELOTEST_PROGRAM_NAME,
          'TeloTest',
          'Fagron Genomics',
          ...(item.tags || [])
        ],
        searchAliases: searchAliases,
        programs: [programAssociation],
        dosage: item.dosage,
        format: item.format,
        purity: item.purity,
        casNumber: item.casNumber || '',
        variants: [
          {
            id: `v_fagron_${item.canonicalSlug}`,
            sku: `FAGRON-${item.canonicalSlug.toUpperCase()}`,
            supplier: FAGRON_IBERIA_SUPPLIER_NAME,
            supplierId: FAGRON_IBERIA_SUPPLIER_ID,
            presentation: item.format || 'Bulk API Powder',
            dosage: item.dosage || 'Standard',
            format: item.format || 'Bulk Powder',
            type: 'raw_material',
            productType: 'api_raw_material',
            price: 45,
            unit_price: 45,
            supplierCost: 25,
            stock: 100,
            status: 'active'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await docRef.set(newDoc);
      console.log(`[CREATED] ${item.canonicalSlug} (${item.name}) -> TeloTest Priority ${item.priority}`);
      createdCount++;
    }
  }

  console.log(`\nFinished successfully! Created: ${createdCount}, Updated: ${updatedCount}, Total: ${TELOTEST_PRODUCTS.length}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding TeloTest products:', err);
  process.exit(1);
});
