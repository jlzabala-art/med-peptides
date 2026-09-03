/**
 * seedFagronTrichoTestProducts.mjs
 * 
 * Normalizes and associates canonical products for Fagron Genomics TrichoTest
 * using Fagron Iberia as supplier. Adheres strictly to the multi-program
 * Product ↔ Program Association architecture.
 */
import { adminDb } from '../lib/firebaseAdmin.js';

if (!adminDb) {
  console.error('Firebase Admin not initialized');
  process.exit(1);
}

const TRICHOTEST_PROGRAM_ID = 'fagron-genomics-trichotest';
const TRICHOTEST_PROGRAM_NAME = 'Fagron Genomics | TrichoTest';
const TRICHOTEST_SLUG = 'fagron-genomics-trichotest';
const FAGRON_IBERIA_SUPPLIER_ID = 'supplier-fagron-iberia';
const FAGRON_IBERIA_SUPPLIER_NAME = 'Fagron Iberia';

// Complete TrichoTest Products Definition
const TRICHOTEST_PRODUCTS = [
  // ── PRIORITY A ─────────────────────────────────────────────────────────────
  {
    canonicalSlug: 'ginkgo-biloba',
    name: 'Ginkgo Biloba Extract (EGb 761)',
    canonicalName: 'Ginkgo Biloba',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Standardized Ginkgo Biloba leaf extract (24% flavone glycosides, 6% terpene lactones) enhancing scalp microcirculation, oxygenation, and nutrient delivery to dermal papilla cells.',
    commercialName: 'Ginkgo Biloba Extract 24/6',
    synonyms: ['Ginkgo Biloba Extract', 'EGb 761', 'Ginkgo Extract'],
    route: 'Oral / Topical',
    dosage: '120 mg - 240 mg',
    format: 'Bulk Powder (Extract 24/6)',
    purity: '≥98%',
    casNumber: '90045-36-6',
    tags: ['Microcirculation', 'Antioxidant', 'Hair Growth', 'Vasodilation']
  },
  {
    canonicalSlug: 'trichoxidil',
    name: 'TrichoXidil™ (Fagron Patented Phytocomplex)',
    canonicalName: 'TrichoXidil',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Fagron patented natural phytocomplex that stimulates growth factors (VEGF, IGF-1, FGF-7, FGF-10) and reactivates hair follicle stem cells through the Wnt/β-catenin pathway.',
    commercialName: 'TrichoXidil™',
    synonyms: ['TrichoXidil', 'TrichoXidil TM', 'Phytocomplex TrichoXidil'],
    route: 'Topical',
    dosage: '2.5% - 5.0%',
    format: 'Liquid Active Complex',
    purity: 'Standardized Active',
    casNumber: '',
    tags: ['Hair Growth', 'Stem Cell Activation', 'Wnt Pathway', 'Growth Factors', 'Alopecia']
  },
  {
    canonicalSlug: 'l-arginine',
    name: 'L-Arginine Base',
    canonicalName: 'Arginine',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Essential amino acid precursor of nitric oxide (NO), inducing vasodilation in peri-follicular capillaries and stimulating anagen phase protein synthesis.',
    commercialName: 'L-Arginine Pure API',
    synonyms: ['Arginine', 'L-Arginine', 'L-Arginine Base', 'Arginine HCl'],
    route: 'Oral / Topical',
    dosage: '500 mg - 2000 mg',
    format: 'Bulk API Powder',
    purity: '≥99%',
    casNumber: '74-79-3',
    tags: ['Nitric Oxide', 'Microcirculation', 'Protein Synthesis', 'Hair Follicle']
  },
  {
    canonicalSlug: 'prostaquinon',
    name: 'Prostaquinon™ (Standardized Active)',
    canonicalName: 'Prostaquinon TM',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Specialized botanical blend with anti-androgenic, anti-inflammatory, and 5-alpha reductase inhibiting properties designed specifically for androgenetic alopecia compounding.',
    commercialName: 'Prostaquinon™',
    synonyms: ['Prostaquinon', 'Prostaquinon TM'],
    route: 'Topical',
    dosage: '3% - 5%',
    format: 'Liquid / Extract Complex',
    purity: 'Standardized Complex',
    casNumber: '',
    tags: ['5-Alpha Reductase', 'Anti-Androgen', 'Alopecia', 'Scalp Health']
  },
  {
    canonicalSlug: 'l-carnitine-l-tartrate',
    name: 'L-Carnitine L-Tartrate',
    canonicalName: 'L-Carnitine L-Tartrate',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Highly bioavailable carnitine ester that promotes hair elongation and downregulates follicular apoptosis by boosting beta-oxidation and ATP generation in hair matrix keratinocytes.',
    commercialName: 'L-Carnitine L-Tartrate Pure API',
    synonyms: ['LCLT', 'Carnitine Tartrate', 'L-Carnitine Tartrate'],
    route: 'Oral / Topical',
    dosage: '1000 mg - 2000 mg',
    format: 'Bulk API Crystalline Powder',
    purity: '≥99%',
    casNumber: '36687-82-8',
    tags: ['Mitochondrial Energy', 'Anagen Prolongation', 'Keratinocyte Proliferation', 'Hair Density']
  },
  {
    canonicalSlug: 'selenium-yeast',
    name: 'Selenium Yeast (Saccharomyces cerevisiae)',
    canonicalName: 'Selenium Yeast',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Organic, highly bioavailable selenomethionine complex essential for glutathione peroxidase activation, preventing oxidative follicle arrest and thyroid-linked telogen effluvium.',
    commercialName: 'Selenium Yeast 2000 mcg/g',
    synonyms: ['Selenium Yeast', 'Organic Selenium', 'Selenized Yeast'],
    route: 'Oral',
    dosage: '100 mcg - 200 mcg Se',
    format: 'Bulk Powder (2000 ppm Se)',
    purity: 'Food/Pharma Grade',
    casNumber: '',
    tags: ['Trace Mineral', 'Antioxidant', 'Glutathione', 'Thyroid Support']
  },
  {
    canonicalSlug: 'zinc-sulfate',
    name: 'Zinc Sulfate Monohydrate / Heptahydrate',
    canonicalName: 'Zinc Sulfate',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Essential trace mineral essential for RNA/DNA polymerase, follicular keratinogenesis, and mild enzymatic 5-alpha reductase type I inhibition.',
    commercialName: 'Zinc Sulfate Monohydrate API',
    synonyms: ['Oral Zinc Sulfate', 'Zinc Sulfate', 'Zinc Sulfate Heptahydrate', 'Zinc Sulphate'],
    route: 'Oral',
    dosage: '15 mg - 30 mg elemental Zn',
    format: 'Bulk Crystalline Powder',
    purity: '≥99%',
    casNumber: '7446-19-7',
    tags: ['Mineral', 'Keratin Synthesis', '5-AR Inhibition', 'Enzyme Cofactor']
  },
  {
    canonicalSlug: 'ginseng-extract',
    name: 'Panax Ginseng Root Extract (Ginsenosides)',
    canonicalName: 'Ginseng',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Standardized Panax ginseng extract rich in ginsenosides (Rg1, Rb1) that activates vascular endothelial growth factor (VEGF) and protects follicle cells against dihydrotestosterone (DHT) apoptosis.',
    commercialName: 'Panax Ginseng Extract 20%',
    synonyms: ['Ginseng', 'Panax Ginseng', 'Korean Red Ginseng Extract', 'Ginsenosides Extract'],
    route: 'Oral / Topical',
    dosage: '200 mg - 400 mg',
    format: 'Bulk Powder (Standardized)',
    purity: '≥20% Ginsenosides',
    casNumber: '90045-38-8',
    tags: ['Adaptogen', 'VEGF Activation', 'DHT Protection', 'Microcirculation']
  },
  {
    canonicalSlug: 'saw-palmetto',
    name: 'Saw Palmetto Berry Extract (Serenoa repens)',
    canonicalName: 'Saw Palmetto',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Lipidosterolic extract of Serenoa repens containing 85-95% fatty acids and phytosterols, naturally blocking 5-alpha reductase conversion of testosterone to DHT and inhibiting nuclear DHT binding.',
    commercialName: 'Saw Palmetto Lipidic Extract 85-95%',
    synonyms: ['Topical Saw Palmetto', 'Saw Palmetto', 'Serenoa repens', 'Saw Palmetto Extract', 'Lipidosterolic Saw Palmetto'],
    route: 'Oral / Topical',
    dosage: '160 mg - 320 mg',
    format: 'Bulk Oily Extract / Microencapsulated Powder',
    purity: '≥85% Fatty Acids',
    casNumber: '84604-15-9',
    tags: ['5-Alpha Reductase', 'DHT Blocker', 'Androgenetic Alopecia', 'Botanical']
  },
  {
    canonicalSlug: 'minoxidil',
    name: 'Minoxidil Pure API',
    canonicalName: 'Minoxidil',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Gold-standard ATP-sensitive potassium channel opener and microvascular vasodilator that enhances follicular blood flow, upregulates VEGF, and prematurely shifts telogen follicles into anagen.',
    commercialName: 'Minoxidil USP / Ph. Eur.',
    synonyms: ['Minoxidil', 'Minoxidil Base', 'Minoxidil API'],
    route: 'Topical / Oral (Compounded)',
    dosage: '2% - 7% Topical / 0.5mg - 5mg Oral',
    format: 'Bulk Crystalline Powder',
    purity: '≥99.5%',
    casNumber: '38304-91-5',
    tags: ['Vasodilator', 'Potassium Channel', 'Anagen Induction', 'Gold Standard', 'Alopecia']
  },
  {
    canonicalSlug: 'dutasteride',
    name: 'Dutasteride Pure API',
    canonicalName: 'Dutasteride',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Potent, dual 5-alpha reductase inhibitor (blocking both Type I and Type II isoenzymes), reducing scalp and serum DHT levels by >90% for severe or progressive androgenetic alopecia.',
    commercialName: 'Dutasteride API USP',
    synonyms: ['Dutasteride', 'Dutasteride Base', 'Dual 5-AR Inhibitor'],
    route: 'Oral / Topical (Trichosol / Liposomes) / Mesotherapy',
    dosage: '0.5 mg Oral / 0.05% - 0.5% Topical',
    format: 'Bulk API Powder',
    purity: '≥99%',
    casNumber: '164656-23-9',
    tags: ['Dual 5-AR Inhibitor', 'DHT Suppression', 'Androgenetic Alopecia', 'Potent Anti-Androgen']
  },
  {
    canonicalSlug: 'retinol-vitamin-a',
    name: 'Retinol / Retinyl Palmitate (Vitamin A)',
    canonicalName: 'Retinol (Vitamin A)',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Vitamin A derivative regulating scalp epithelial keratinization, improving stratum corneum penetration of Minoxidil and anti-androgens, and stimulating vascularization of the dermal papilla.',
    commercialName: 'Retinyl Palmitate / Pure Retinol API',
    synonyms: ['Retinol', 'Vitamin A', 'Retinyl Palmitate', 'Retinoic Acid Precursor'],
    route: 'Topical',
    dosage: '0.025% - 0.05%',
    format: 'Oily Liquid / Crystalline',
    purity: 'Pharma Grade',
    casNumber: '68-26-8',
    tags: ['Cell Turnover', 'Stratum Corneum Penetration', 'Keratinization', 'Vitamin']
  },
  {
    canonicalSlug: 'biotin',
    name: 'D-Biotin Pure API (Vitamin B7 / Vitamin H)',
    canonicalName: 'Biotin',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Essential water-soluble B-vitamin serving as a vital coenzyme for carboxylases involved in fatty acid and amino acid synthesis, providing structural integrity to keratin infrastructure.',
    commercialName: 'D-Biotin Pure API USP',
    synonyms: ['Topical Biotin', 'Oral Biotin', 'Biotin', 'D-Biotin', 'Vitamin B7', 'Vitamin H'],
    route: 'Oral (Priority C) / Topical (Priority A)',
    dosage: '2.5 mg - 10 mg Oral / 0.1% - 1% Topical',
    format: 'Bulk Crystalline API Powder',
    purity: '≥99%',
    casNumber: '58-85-5',
    tags: ['Keratin Matrix', 'B-Complex', 'Hair Shaft Strength', 'Coenzyme']
  },
  {
    canonicalSlug: 'pyridoxine-hcl',
    name: 'Pyridoxine HCl (Vitamin B6)',
    canonicalName: 'Pyridoxine HCl (Vitamin B6)',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Active form of Vitamin B6 facilitating cysteine incorporation into keratin, regulating sebaceous gland androgen sensitivity, and potentiating zinc-mediated 5-alpha reductase inhibition.',
    commercialName: 'Pyridoxine Hydrochloride USP',
    synonyms: ['Pyridoxine HCl', 'Vitamin B6', 'Pyridoxine Hydrochloride', 'Vit B6'],
    route: 'Oral / Topical',
    dosage: '25 mg - 50 mg Oral / 0.5% - 1% Topical',
    format: 'Bulk Crystalline Powder',
    purity: '≥99%',
    casNumber: '58-56-0',
    tags: ['Keratin Cofactor', 'Sebum Regulation', 'Zinc Potentiator', 'B-Complex']
  },
  {
    canonicalSlug: 'latanoprost-fagron',
    name: 'Latanoprost API (Fagron Compounding Grade)',
    canonicalName: 'Latanoprost Fagron',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Prostaglandin F2α (PGF2α) analogue stimulating follicular stem cell transition into active anagen, inducing noticeable thickening, hyperpigmentation, and lengthening of hair fibers.',
    commercialName: 'Latanoprost Solution / Pure API',
    synonyms: ['Latanoprost', 'Latanoprost Fagron', 'Prostaglandin F2a'],
    route: 'Topical (Foams / Serums)',
    dosage: '0.005% - 0.05%',
    format: 'Solution / Pure Active',
    purity: '≥99%',
    casNumber: '130209-82-4',
    tags: ['Prostaglandin Analogue', 'Anagen Induction', 'Pigmentation', 'Hair Thickening']
  },
  {
    canonicalSlug: 'vitamin-e',
    name: 'Vitamin E (Tocopherol / Tocopheryl Acetate)',
    canonicalName: 'Tocopherol (Vitamin E)',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Potent lipid-soluble chain-breaking antioxidant protecting follicle cell membrane polyunsaturated fatty acids from peroxidation, reducing scalp oxidative stress.',
    commercialName: 'd-alpha-Tocopherol / dl-alpha-Tocopheryl Acetate',
    synonyms: ['Tocopherol', 'Vitamin E', 'd-alpha-tocopherol', 'Tocopheryl Acetate', 'vit, E'],
    route: 'Oral / Topical',
    dosage: '400 IU / 268 mg Oral / 0.5% - 2% Topical',
    format: 'Bulk Oil / Powder',
    purity: '≥98%',
    casNumber: '59-02-9',
    tags: ['Antioxidant', 'Lipid Protection', 'Scalp Barrier', 'Membrane Stability']
  },
  {
    canonicalSlug: 'siliciumax',
    name: 'SiliciuMax™ (Bioavailable Monomethylsilanetriol)',
    canonicalName: 'Oral SiliciuMax TM',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Organic, patented high-absorption monomeric silicon activating prolyl-hydroxylase enzymes for collagen cross-linking and strengthening glycosaminoglycans in the hair dermal papilla.',
    commercialName: 'SiliciuMax™ Liquid / Powder',
    synonyms: ['SiliciuMax', 'SiliciuMax TM', 'Oral SiliciuMax TM', 'Organic Silicon', 'MMST'],
    route: 'Oral',
    dosage: '10 mg - 20 mg elemental Si',
    format: 'Bulk Liquid / Encapsulated Powder',
    purity: 'Patented Bioavailable Silicon',
    casNumber: '',
    tags: ['Collagen Synthesis', 'Connective Tissue', 'Hair Shaft Elasticity', 'Silicon']
  },
  {
    canonicalSlug: 'd-panthenol',
    name: 'D-Panthenol (Provitamin B5)',
    canonicalName: 'D-Panthenol',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Provitamin of B5 with deep hygroscopic properties, penetrating the hair cuticle to provide long-lasting moisture, increase tensile strength, and soothe irritated scalp dermatoses.',
    commercialName: 'D-Panthenol 75% / 100% Pure USP',
    synonyms: ['D-Panthenol', 'Panthenol', 'Provitamin B5', 'Dexpanthenol'],
    route: 'Topical',
    dosage: '1% - 5%',
    format: 'Viscous Liquid API',
    purity: '≥98%',
    casNumber: '81-13-0',
    tags: ['Shaft Hydration', 'Scalp Soothing', 'Cuticle Elasticity', 'Provitamin']
  },
  {
    canonicalSlug: '17-alpha-estradiol',
    name: '17-α Estradiol (Alfatradiol API)',
    canonicalName: '17-α Estradiol',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Stereoisomer of 17-beta estradiol with negligible systemic estrogenic activity that locally accelerates aromatase conversion of androgens to estrogens while inhibiting 5-alpha reductase.',
    commercialName: '17-alpha-Estradiol / Alfatradiol Pure API',
    synonyms: ['17-α Estradiol', '17-alpha Estradiol', '17-Î± Estradiol', 'Alfatradiol', '17a-Estradiol'],
    route: 'Topical',
    dosage: '0.025% - 0.1%',
    format: 'Bulk Crystalline Powder',
    purity: '≥99%',
    casNumber: '57-91-0',
    tags: ['Local Aromatase Activator', 'Anti-Androgen', 'Female Pattern Hair Loss', '5-AR Inhibition']
  },
  {
    canonicalSlug: 'finasteride',
    name: 'Finasteride Pure API',
    canonicalName: 'Finasteride',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Specific competitive inhibitor of Type II 5-alpha reductase, reducing scalp DHT by ~65-70% and halting follicular miniaturization in male androgenetic alopecia.',
    commercialName: 'Finasteride USP / Ph. Eur.',
    synonyms: ['Finasteride', 'Finasteride API', 'Type II 5-AR Inhibitor'],
    route: 'Oral / Topical (TrichoSol / TrichoFoam)',
    dosage: '1 mg Oral / 0.1% - 0.25% Topical',
    format: 'Bulk API Powder',
    purity: '≥99.5%',
    casNumber: '98319-26-7',
    tags: ['Type II 5-AR Inhibitor', 'DHT Blocker', 'Androgenetic Alopecia', 'Standard of Care']
  },
  {
    canonicalSlug: 'iron-sulfate',
    name: 'Iron (II) Sulfate Heptahydrate / Dried',
    canonicalName: 'Iron Sulfate',
    category: 'supplement',
    type: 'raw_material',
    priority: 'A',
    description: 'Essential elemental iron salt required for ferritin replenishment and ribonucleotide reductase cofactor activity in rapidly dividing hair matrix keratinocytes.',
    commercialName: 'Ferrous Sulfate Dried / Heptahydrate USP',
    synonyms: ['Iron Sulfate', 'Ferrous Sulfate', 'Sulfate iron', 'Iron (II) Sulfate'],
    route: 'Oral',
    dosage: '65 mg elemental Fe',
    format: 'Bulk Crystalline Powder',
    purity: 'Pharma Grade',
    casNumber: '7782-63-0',
    tags: ['Ferritin Support', 'Oxygen Delivery', 'Telogen Effluvium', 'Trace Element']
  },
  {
    canonicalSlug: 'zinc-pyrithione',
    name: 'Zinc Pyrithione (ZPT API)',
    canonicalName: 'Zinc Pyrithione',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Broad-spectrum coordination complex with potent fungistatic activity against Malassezia yeasts, restoring scalp microbiome balance and alleviating inflammatory perifolliculitis.',
    commercialName: 'Zinc Pyrithione 48% Suspension / Pure Powder',
    synonyms: ['Zinc Pyrithione', 'ZPT', 'Zinc Omadine', 'Pyrithione Zinc'],
    route: 'Topical (Shampoos / Scalp Scrubs)',
    dosage: '0.5% - 2.0%',
    format: 'Fine Powder / Dispersion',
    purity: '≥98%',
    casNumber: '13463-41-7',
    tags: ['Anti-Malassezia', 'Microbiome Balance', 'Anti-Dandruff', 'Scalp Inflammation']
  },
  {
    canonicalSlug: 'ketoconazole',
    name: 'Ketoconazole Pure API',
    canonicalName: 'Ketoconazole',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Synthetic broad-spectrum imidazole antifungal disrupting fungal ergosterol synthesis while delivering mild local anti-androgenic effects via 5-AR and androgen receptor downregulation.',
    commercialName: 'Ketoconazole USP / Ph. Eur.',
    synonyms: ['Ketoconazole', 'Ketoconazole API', 'Nizoral Active'],
    route: 'Topical (Shampoos / Foams / Lotions)',
    dosage: '1% - 2%',
    format: 'Bulk API Powder',
    purity: '≥99%',
    casNumber: '65277-42-1',
    tags: ['Antifungal', 'Mild Anti-Androgen', 'Seborrheic Dermatitis', 'Scalp Cleansing']
  },
  {
    canonicalSlug: 'igrantine-f1',
    name: 'IGrantine-F1™ (Follicle Biostimulant Peptide Complex)',
    canonicalName: 'IGrantine-F1 TM',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'A',
    description: 'Advanced biomimetic growth-factor mimicking peptide complex engineered to anchor the follicle bulb in the extracellular matrix and upregulate laminin-5 and collagen IV.',
    commercialName: 'IGrantine-F1™',
    synonyms: ['IGrantine-F1', 'IGrantine-F1 TM', 'IGrantine F1'],
    route: 'Topical',
    dosage: '2% - 5%',
    format: 'Liquid Peptide Concentrate',
    purity: 'Standardized Peptide Complex',
    casNumber: '',
    tags: ['Biomimetic Peptide', 'Follicle Anchoring', 'Collagen IV', 'Growth Factor Mimic']
  },

  // ── PRIORITY B ─────────────────────────────────────────────────────────────
  {
    canonicalSlug: 'l-cystine',
    name: 'L-Cystine Pure API',
    canonicalName: 'Cystine',
    category: 'supplement',
    type: 'raw_material',
    priority: 'B',
    description: 'Sulfur-containing dimeric amino acid providing critical disulfide bridges that determine the mechanical strength, rigidity, and cross-linked structure of human hair keratin.',
    commercialName: 'L-Cystine Non-Animal Source USP',
    synonyms: ['Cystine', 'L-Cystine', 'Dicysteine'],
    route: 'Oral',
    dosage: '500 mg - 1000 mg',
    format: 'Bulk API Powder',
    purity: '≥99%',
    casNumber: '56-89-3',
    tags: ['Keratin Disulfide Bonds', 'Shaft Tensile Strength', 'Sulfur Amino Acid']
  },
  {
    canonicalSlug: 'cafeisome',
    name: 'CafeiSome™ (Liposomal Encapsulated Caffeine)',
    canonicalName: 'CafeiSome TM',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'B',
    description: 'Liposomal phospholipid-encapsulated caffeine vector allowing up to 5x deeper follicular penetration, neutralizing testosterone-induced follicle growth suppression.',
    commercialName: 'CafeiSome™',
    synonyms: ['CafeiSome', 'CafeiSome TM', 'Liposomal Caffeine'],
    route: 'Topical',
    dosage: '2% - 5%',
    format: 'Liposomal Dispersion',
    purity: 'Phospholipid Complex',
    casNumber: '',
    tags: ['Liposomal Delivery', 'Phosphodiesterase Inhibitor', 'DHT Neutralization', 'Deep Penetration']
  },
  {
    canonicalSlug: 'nicotinamide',
    name: 'Nicotinamide / Niacinamide (Vitamin B3)',
    canonicalName: 'Nicotinamide (Vitamin B3)',
    category: 'supplement',
    type: 'raw_material',
    priority: 'B',
    description: 'Non-flushing form of Vitamin B3 boosting NAD+/NADH ratios in hair keratinocytes, improving epidermal barrier ceramide synthesis, and mitigating oxidative follicle aging.',
    commercialName: 'Niacinamide / Nicotinamide USP',
    synonyms: ['Nicotinamide', 'Niacinamide', 'Vitamin B3', 'Vit B3', 'Nicotinic Acid Amide'],
    route: 'Oral / Topical',
    dosage: '500 mg Oral / 2% - 5% Topical',
    format: 'Bulk Crystalline Powder',
    purity: '≥99%',
    casNumber: '98-92-0',
    tags: ['NAD+ Precursor', 'Ceramide Synthesis', 'Scalp Barrier', 'Cellular Energy']
  },
  {
    canonicalSlug: 'melatonin',
    name: 'Melatonin Pure API',
    canonicalName: 'Melatonin',
    category: 'supplement',
    type: 'raw_material',
    priority: 'B',
    description: 'Potent chronobiological indoleamine and direct free radical scavenger, extending the anagen phase duration, activating estrogen receptor pathways in follicles, and preventing telogen transitions.',
    commercialName: 'Melatonin Synthetic Pure API USP',
    synonyms: ['Melatonin', 'N-acetyl-5-methoxytryptamine'],
    route: 'Oral / Topical (0.0033% - 0.1%)',
    dosage: '1 mg - 5 mg Oral / 0.005% - 0.1% Topical',
    format: 'Bulk Crystalline Powder',
    purity: '≥99.5%',
    casNumber: '73-31-4',
    tags: ['Anagen Extension', 'Circadian Regulation', 'Free Radical Scavenger', 'Hair Aging']
  },

  // ── PRIORITY C ─────────────────────────────────────────────────────────────
  {
    canonicalSlug: 'caffeine',
    name: 'Caffeine Anhydrous Pure API',
    canonicalName: 'Caffeine',
    category: 'supplement',
    type: 'raw_material',
    priority: 'C',
    description: 'Methylxanthine alkaloid that inhibits phosphodiesterase, raises intracellular cAMP levels, promotes cellular proliferation, and counteracts DHT-mediated growth retardation.',
    commercialName: 'Caffeine Anhydrous USP / Ph. Eur.',
    synonyms: ['Caffeine', 'Caffeine Anhydrous', '1,3,7-Trimethylxanthine'],
    route: 'Oral / Topical',
    dosage: '100 mg - 200 mg Oral / 0.2% - 2% Topical',
    format: 'Bulk Crystalline Powder',
    purity: '≥99%',
    casNumber: '58-08-2',
    tags: ['Phosphodiesterase Inhibitor', 'cAMP Booster', 'Microcirculation', 'Energy']
  },
  {
    canonicalSlug: 'astaxanthin',
    name: 'Astaxanthin (Haematococcus pluvialis Extract)',
    canonicalName: 'Astaxanthin',
    category: 'supplement',
    type: 'raw_material',
    priority: 'C',
    description: 'High-potency keto-carotenoid with 6,000x greater antioxidant quenching power than Vitamin C, protecting hair follicles from UV-induced ROS damage and inflammation.',
    commercialName: 'Astaxanthin Oleoresin 5% / 10% / Pure Powder',
    synonyms: ['Astaxanthin', 'Natural Astaxanthin', 'Haematococcus pluvialis', 'AstaPure'],
    route: 'Oral / Topical',
    dosage: '4 mg - 12 mg Oral',
    format: 'Bulk Powder / Oleoresin',
    purity: '≥10% Astaxanthin',
    casNumber: '472-61-7',
    tags: ['Antioxidant', 'UV Follicle Protection', 'Carotenoid', 'Anti-Inflammatory']
  },
  {
    canonicalSlug: 'clotrimazole',
    name: 'Clotrimazole Pure API',
    canonicalName: 'Clotrimazole',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'C',
    description: 'Broad-spectrum synthetic azole antimycotic inhibiting fungal cytochrome P450 14-alpha demethylase, effectively clearing scalp fungal colonies and dermatophytic folliculitis.',
    commercialName: 'Clotrimazole USP / Ph. Eur.',
    synonyms: ['Clotrimazole', 'Clotrimazole API', 'Canesten Active'],
    route: 'Topical',
    dosage: '1%',
    format: 'Bulk API Powder',
    purity: '≥99%',
    casNumber: '23593-75-1',
    tags: ['Antifungal', 'Azole', 'Scalp Dermatophytosis', 'Topical Antimycotic']
  },
  {
    canonicalSlug: 'erythromycin',
    name: 'Erythromycin Base Pure API',
    canonicalName: 'Erythromycin',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'C',
    description: 'Macrolide antibacterial binding to the 50S bacterial ribosomal subunit, exerting anti-inflammatory and bacteriostatic effects in scalp folliculitis and severe acne necrotica.',
    commercialName: 'Erythromycin Base USP',
    synonyms: ['Erythromycin', 'Erythromycin Base', 'Erythromycin API'],
    route: 'Topical',
    dosage: '2% - 4%',
    format: 'Bulk API Powder',
    purity: '≥98%',
    casNumber: '114-07-8',
    tags: ['Macrolide Antibacterial', 'Anti-Inflammatory', 'Scalp Folliculitis']
  },
  {
    canonicalSlug: 'ciclopirox-olamine',
    name: 'Ciclopirox Olamine Pure API',
    canonicalName: 'Ciclopirox Olamine',
    category: 'raw_material',
    type: 'raw_material',
    priority: 'C',
    description: 'Hydroxypyridone broad-spectrum antimycotic and anti-inflammatory agent chelating polyvalent cations (Fe3+, Al3+) to disrupt fungal membrane transport and control stubborn seborrheic dermatitis.',
    commercialName: 'Ciclopirox Olamine USP',
    synonyms: ['Ciclopirox Olamine', 'Cyclopirox olamine', 'Ciclopirox', 'Ciclopirox Ethanolamine Salt'],
    route: 'Topical (Shampoos / Solutions)',
    dosage: '1% - 1.5%',
    format: 'Bulk API Powder',
    purity: '≥99%',
    casNumber: '41621-49-2',
    tags: ['Broad-Spectrum Antifungal', 'Iron Chelator', 'Anti-Inflammatory', 'Seborrheic Dermatitis']
  }
];

async function run() {
  console.log(`Starting Fagron TrichoTest Seeding & Multi-Program Association (${TRICHOTEST_PRODUCTS.length} products)...`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of TRICHOTEST_PRODUCTS) {
    const docRef = adminDb.collection('products').doc(item.canonicalSlug);
    const docSnap = await docRef.get();

    const programAssociation = {
      id: TRICHOTEST_PROGRAM_ID,
      slug: TRICHOTEST_SLUG,
      name: TRICHOTEST_PROGRAM_NAME,
      priority: item.priority,
      applicationRoute: item.route || 'Topical / Oral',
      metadata: {
        commercialName: item.commercialName,
        purity: item.purity,
        format: item.format,
        dosage: item.dosage,
        casNumber: item.casNumber || ''
      },
      updatedAt: new Date()
    };

    const searchAliases = [
      TRICHOTEST_PROGRAM_NAME,
      'TrichoTest',
      'Fagron Genomics',
      'Fagron Iberia',
      item.canonicalName,
      ...(item.synonyms || [])
    ];

    if (docSnap.exists) {
      const existing = docSnap.data();
      const existingPrograms = Array.isArray(existing.programs) ? existing.programs : [];
      const existingTags = Array.isArray(existing.tags) ? existing.tags : [];
      const existingSupplierIds = Array.isArray(existing.supplierIds) ? existing.supplierIds : [];

      // Preserve any other programs (like TeloTest with its own Priority) and update/add TrichoTest
      const filteredPrograms = existingPrograms.filter(p => p.id !== TRICHOTEST_PROGRAM_ID && p.slug !== TRICHOTEST_SLUG);
      filteredPrograms.push(programAssociation);

      // Merge tags
      const updatedTags = Array.from(new Set([
        ...existingTags,
        TRICHOTEST_SLUG,
        TRICHOTEST_PROGRAM_NAME,
        'TrichoTest',
        'Fagron Genomics',
        'Hair Health',
        'Alopecia',
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

      console.log(`[UPDATED] ${item.canonicalSlug} -> TrichoTest Priority ${item.priority} (Total Programs: ${filteredPrograms.length})`);
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
          TRICHOTEST_SLUG,
          TRICHOTEST_PROGRAM_NAME,
          'TrichoTest',
          'Fagron Genomics',
          'Hair Health',
          'Alopecia',
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
            price: 55,
            unit_price: 55,
            supplierCost: 30,
            stock: 100,
            status: 'active'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await docRef.set(newDoc);
      console.log(`[CREATED] ${item.canonicalSlug} (${item.name}) -> TrichoTest Priority ${item.priority}`);
      createdCount++;
    }
  }

  console.log(`\nTrichoTest Seeding Finished Successfully! Created: ${createdCount}, Updated: ${updatedCount}, Total: ${TRICHOTEST_PRODUCTS.length}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding TrichoTest products:', err);
  process.exit(1);
});
