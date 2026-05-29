/**
 * seed-product-faqs.js
 * Seeds 3 science-based FAQs per unique product into Firestore.
 * Run: node scripts/seed-product-faqs.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? process.env.GOOGLE_APPLICATION_CREDENTIALS
  : path.join(__dirname, '../serviceAccountKey.json');

admin.initializeApp({
  credential: typeof serviceAccount === 'string' && serviceAccount.endsWith('.json')
    ? admin.credential.cert(require(serviceAccount))
    : admin.credential.applicationDefault(),
  projectId: 'Atlas Health-app',
});

const db = admin.firestore();

// ─── FAQ DATA ────────────────────────────────────────────────────────────────
// Structure: { productName, productId (slug prefix), faqs: [{q, a}] }
// productId matches the "name" field in Firestore — used to link FAQs to all
// variants of that product via a COQL-style query on the product collection.

const FAQ_DATA = [
  {
    productName: '5-AMINO 1 MQ',
    faqs: [
      {
        question: 'How does 5-AMINO 1 MQ work to support fat loss?',
        answer:
          '5-AMINO 1 MQ selectively inhibits nicotinamide N-methyltransferase (NNMT), an enzyme highly expressed in white adipose tissue. By blocking NNMT, it redirects S-adenosylmethionine (SAM) back into the methyl cycle, which elevates intracellular NAD+ levels. Higher NAD+ activates SIRT1 and SIRT3 deacetylases, promoting mitochondrial biogenesis and downregulating adipogenesis transcription factors — resulting in reduced fat cell formation and improved cellular energy expenditure.',
      },
      {
        question: 'What is the difference between 5-AMINO 1 MQ tablets and vials?',
        answer:
          'The 50mg tablet form is taken orally and has an estimated bioavailability of ~30–40% due to first-pass hepatic metabolism. The 2mg vial is intended for research reconstitution only. For research purposes, route of administration significantly impacts bioavailability: oral tablets offer convenience while vial preparations allow for more controlled dosing in research settings. Both formats contain the same active compound (5-amino-1-methylquinolinium, CAS 2250005-77-3).',
      },
      {
        question: 'Is 5-AMINO 1 MQ safe to combine with NAD+ precursors like NMN or NR?',
        answer:
          '5-AMINO 1 MQ works by inhibiting NNMT to increase NAD+ availability, so combining it with high-dose niacin supplementation may reduce its inhibitory efficacy by providing an alternative substrate. Concurrent use with PARP inhibitors may also cause NAD+ pathway interference. In pre-clinical models, 5-AMINO 1 MQ demonstrated a half-life of 4–6 hours and undergoes hepatic metabolism. For research purposes, avoid concurrent high-dose niacin and consult the relevant pharmacological data before designing multi-compound protocols.',
      },
    ],
  },
  {
    productName: 'AOD-9604',
    faqs: [
      {
        question: 'What makes AOD-9604 different from Human Growth Hormone (HGH)?',
        answer:
          'AOD-9604 is a modified fragment of the C-terminal region of HGH (residues 177–191). Unlike full-length HGH, AOD-9604 does not activate the IGF-1 axis, meaning it does not promote hyperinsulinemia, cell proliferation, or the anabolic effects of full HGH. Instead, it selectively stimulates beta-3 adrenergic receptors in adipocytes, driving lipolysis (fat breakdown) and fatty acid oxidation without the side effects associated with exogenous HGH administration.',
      },
      {
        question: 'What is the clinical research status of AOD-9604?',
        answer:
          'AOD-9604 has completed Phase 2 clinical trials (obesity studies in Australia, CAS 221231-10-3). Phase 2 data demonstrated favorable safety profiles with no significant hormonal axis disruption. It has not received FDA or EMA approval for therapeutic use. Key published studies include PMID 12533879, 15705129, and 17353992. It remains an investigational compound and is sold strictly for research purposes.',
      },
      {
        question: 'What are the recommended storage conditions and shelf life for AOD-9604 vials?',
        answer:
          'AOD-9604 lyophilized powder should be stored at -20°C and protected from UV light. Under these conditions, shelf life is up to 24 months. Once reconstituted with bacteriostatic water, the solution should be refrigerated at 2–8°C and used within 28 days. Always use aseptic technique during reconstitution to avoid contamination.',
      },
    ],
  },
  {
    productName: 'ARA-290',
    faqs: [
      {
        question: 'What mechanism makes ARA-290 (Cibinetide) effective for neuropathic pain?',
        answer:
          'ARA-290 is a non-erythropoietic peptide designed to selectively bind the innate repair receptor (IRR), which is a heterodimer of the erythropoietin receptor (EPOR) and the beta common receptor (βcR). This binding activates JAK2/STAT3 signaling in peripheral neurons, promoting small-fiber nerve regeneration and suppressing pro-inflammatory cytokines including TNF-α and IL-6. Unlike erythropoietin, ARA-290 does not stimulate red blood cell production, eliminating hematopoietic side effects.',
      },
      {
        question: 'What conditions has ARA-290 been studied for in human trials?',
        answer:
          'ARA-290 (Cibinetide) has been evaluated in Phase 2 human trials primarily for sarcoidosis-associated small-fiber neuropathy and diabetic peripheral neuropathy. Key published studies (PMID 22072597, 23954493, 26071855, 28432175) demonstrated improvements in corneal nerve fiber density and neuropathic pain scores. It is currently an investigational compound with no approved indications.',
      },
      {
        question: 'Who should avoid using ARA-290 in research protocols?',
        answer:
          'ARA-290 is contraindicated in research subjects with polycythemia vera (due to EPOR activity), uncontrolled hypertension, active thromboembolic disease, or active hematological malignancies. It should not be used during pregnancy. Because ARA-290 interacts with the erythropoietin receptor pathway, subjects with known hypersensitivity to EPO-derived compounds should be excluded from research protocols.',
      },
    ],
  },
  {
    productName: 'BPC-157',
    faqs: [
      {
        question: 'How does BPC-157 promote tissue healing and recovery?',
        answer:
          'BPC-157 (Body Protection Compound-157, PL 14736) is a synthetic pentadecapeptide derived from a protective protein in gastric juice. It accelerates healing via four primary mechanisms: (1) upregulation of growth hormone receptors in tendon fibroblasts; (2) modulation of the nitric oxide (NO) pathway to promote angiogenesis; (3) activation of the FAK-paxillin signaling pathway for wound healing; and (4) cytoprotective stabilization of the gastric mucosa via PGE2 synthesis. In animal studies, it has shown efficacy in tendon, ligament, muscle, gut, and bone repair.',
      },
      {
        question: 'Can BPC-157 be taken orally, or does it require injection?',
        answer:
          'BPC-157 is unusual among peptides in that it demonstrates activity via oral administration, particularly for gastrointestinal applications. Oral bioavailability is attributed to its resistance to gastric acid degradation. For systemic effects (joints, tendons, systemic healing), subcutaneous (SC) or intramuscular (IM) injection is preferred. The estimated half-life is ~4 hours with either route. Research protocols for GI-specific applications often use oral administration, while musculoskeletal applications use SC injection.',
      },
      {
        question: 'Is BPC-157 safe for use in individuals with a history of cancer?',
        answer:
          'BPC-157 promotes angiogenesis (blood vessel formation) and upregulates growth factor pathways, which raises a theoretical concern for individuals with a history of malignancy or active cancer. Current safety data is primarily from animal studies (PMID 9839791, 14597095, 24472136). No completed human clinical trials have evaluated oncological safety. Researchers are advised to exclude subjects with active malignancy, high cancer risk, or history of hormone-sensitive cancers from protocols involving BPC-157.',
      },
    ],
  },
  {
    productName: 'BPC-157 + TB-500',
    faqs: [
      {
        question: 'Why are BPC-157 and TB-500 often combined in healing protocols?',
        answer:
          'BPC-157 and TB-500 target complementary healing pathways. BPC-157 primarily activates local growth factor receptors, NO pathways, and angiogenesis at injury sites, while TB-500 (Thymosin Beta-4) promotes actin polymerization, upregulates cell migration (especially stem cells and endothelial cells), and reduces inflammation via a systemic mechanism. Their combination provides both local tissue repair (BPC-157) and systemic cellular recruitment and anti-inflammatory effects (TB-500), making the blend particularly studied for musculoskeletal and soft-tissue injuries.',
      },
      {
        question: 'Are there any contraindications specific to the BPC-157 + TB-500 blend?',
        answer:
          'The combined contraindications of both compounds apply: active malignancy or high cancer risk (both peptides have pro-angiogenic properties), pregnancy, and concurrent anticoagulant therapy (relative contraindication). Neither peptide has completed formal human clinical trials, and the combination has not been independently evaluated in clinical settings. All research protocols using this blend should be reviewed against current preclinical data (BPC-157: PMID 9839791; TB-500: thymosin beta-4 literature).',
      },
      {
        question: 'How should the BPC-157 + TB-500 combination vial be reconstituted and stored?',
        answer:
          'The 5mg|5mg lyophilized vial should be reconstituted with bacteriostatic water (0.9% benzyl alcohol) under aseptic conditions. Add diluent slowly along the vial wall and swirl gently — do not shake. Store unreconstituted vials at -20°C protected from UV light (shelf life: 24 months). After reconstitution, refrigerate at 2–8°C and use within 28 days. The combined peptide solution should remain clear; discard if particulates or color change are observed.',
      },
    ],
  },
  {
    productName: 'Bacteriostatic Water',
    faqs: [
      {
        question: 'Why is bacteriostatic water used instead of sterile water for peptide reconstitution?',
        answer:
          'Bacteriostatic water contains 0.9% benzyl alcohol (w/v), which acts as a preservative by inhibiting bacterial growth. This allows the same vial to be used for multiple injections over up to 28 days after initial puncture — critical for multi-dose peptide protocols. Sterile water for injection contains no preservative and must be discarded after a single use. Bacteriostatic water is the standard reconstitution medium for lyophilized peptides such as BPC-157, TB-500, and GH secretagogues in research settings.',
      },
      {
        question: 'Is bacteriostatic water safe for subcutaneous and intramuscular injection?',
        answer:
          'Yes, bacteriostatic water is suitable for SC and IM injection when used to reconstitute compatible peptides. However, it must NEVER be given intravenously in undiluted form due to the benzyl alcohol content. It is also contraindicated for use in neonates and premature infants (risk of gasping syndrome from benzyl alcohol accumulation). Once reconstituted peptide solutions are prepared, they should be administered using appropriate sterile needles and syringes.',
      },
      {
        question: 'How long can bacteriostatic water be used after opening?',
        answer:
          'Bacteriostatic water (30ml vial) should be discarded 28 days after first puncture, regardless of volume remaining. Always note the date of first use on the vial. Store at room temperature (15–30°C) away from direct light. Do not freeze bacteriostatic water — freezing can compromise the integrity of the preservative and container. Inspect the solution before each use; discard if particles, cloudiness, or discoloration are present.',
      },
    ],
  },
  {
    productName: 'CJC-1295 with DAC',
    faqs: [
      {
        question: 'How does the Drug Affinity Complex (DAC) in CJC-1295 extend its half-life?',
        answer:
          'CJC-1295 with DAC incorporates a maleimido propionic acid moiety (the Drug Affinity Complex) that covalently binds to serum albumin after injection. Albumin has a half-life of approximately 19 days, and this binding dramatically extends CJC-1295\'s effective half-life from ~30 minutes (without DAC) to approximately 6–8 days. This allows once-weekly subcutaneous dosing and produces sustained pulsatile GH secretion from anterior pituitary somatotrophs, which upregulates IGF-1 for anabolic and lipolytic effects.',
      },
      {
        question: 'What are the risks of supraphysiologic GH elevation with CJC-1295 DAC?',
        answer:
          'Because CJC-1295 DAC produces sustained GH stimulation over 6–8 days per dose, there is a higher risk of supraphysiologic IGF-1 elevation compared to short-acting GHRH analogs. Potential side effects observed in research studies (PMID 16352683, 18337471) include water retention, peripheral edema, carpal tunnel syndrome, and insulin resistance at elevated doses. Monitoring IGF-1 levels is critical in research protocols. It is contraindicated in subjects with active acromegaly, active malignancy, diabetic retinopathy, or open growth plates.',
      },
      {
        question: 'Can CJC-1295 with DAC be stacked with other GHRH analogs?',
        answer:
          'Stacking CJC-1295 DAC with other GHRH analogs (such as CJC-1295 without DAC or Sermorelin) is not recommended, as both compounds act on the same GHRH receptor and concurrent use may cause receptor desensitization. However, combining CJC-1295 DAC with a GHRP/ghrelin mimetic such as Ipamorelin is a common research protocol — these act on separate receptors (GHRH-R vs. ghrelin receptor) and produce synergistic GH pulse amplification without redundant receptor stimulation.',
      },
    ],
  },
  {
    productName: 'CJC-1295 without DAC (Modified GRF 1-29)',
    faqs: [
      {
        question: 'What is Modified GRF 1-29 and how does it differ from Sermorelin?',
        answer:
          'Modified GRF 1-29 (CJC-1295 without DAC) is a 29-amino-acid synthetic analog of Growth Hormone Releasing Hormone (GHRH 1-29) with four substituted amino acids to improve stability and receptor binding. Sermorelin is the unmodified GHRH 1-29 sequence with a very short half-life (~3 minutes). Modified GRF 1-29 extends the effective window to approximately 30 minutes by replacing vulnerable cleavage sites (Ala2→D-Ala, Gln8→Ala, Ala15→Gly, Leu27→D-Leu), producing more robust and physiologically mimetic GH pulses.',
      },
      {
        question: 'Why does CJC-1295 without DAC require more frequent dosing?',
        answer:
          'Without the DAC albumin-binding moiety, CJC-1295 without DAC has a half-life of approximately 30 minutes. To maintain effective GHRH receptor stimulation, it typically requires pulsatile dosing 2–3 times daily. Research protocols often time injections around training and sleep (when endogenous GH pulses are highest) for maximum synergy. This contrasts with CJC-1295 with DAC, which needs only once-weekly dosing, but allows more precise control over GH pulse timing.',
      },
      {
        question: 'What is the rationale for combining CJC-1295 without DAC with Ipamorelin?',
        answer:
          'CJC-1295 without DAC stimulates GHRH receptors on pituitary somatotrophs, amplifying the magnitude of GH pulses. Ipamorelin is a selective ghrelin/GHS-R1a receptor agonist that promotes GH release without significantly increasing cortisol, prolactin, or ACTH. When combined, they act via two distinct signaling pathways (GHRH-R and ghrelin-R) that synergistically amplify GH secretion — studies show the combination produces significantly greater GH output than either agent alone. This is one of the most studied peptide combinations for GH optimization in research.',
      },
    ],
  },
  {
    productName: 'CJC-1295 without DAC + Ipamorelin',
    faqs: [
      {
        question: 'How does the CJC-1295 + Ipamorelin combination enhance GH secretion?',
        answer:
          'This combination leverages dual-pathway GH stimulation: CJC-1295 without DAC activates pituitary GHRH receptors (GHRH-R), which amplifies the size of GH pulses, while Ipamorelin acts on ghrelin receptors (GHS-R1a) to trigger GH release. Together, they create synergistic amplification — clinical research shows the combination produces significantly greater total GH output than either peptide alone. Ipamorelin\'s high selectivity means it does not significantly elevate cortisol, ACTH, or prolactin, preserving the clean GH signal.',
      },
      {
        question: 'What results have been observed in research with Ipamorelin?',
        answer:
          'Ipamorelin is a pentapeptide ghrelin mimetic known for its exceptional receptor selectivity. In animal studies and early human data, Ipamorelin produced dose-dependent GH release comparable to GHRP-6 but without the cortisol and prolactin spikes associated with less selective GHRPs. Research goals with this combination include increased lean mass, reduced body fat, improved sleep quality (GH pulses during slow-wave sleep), and enhanced post-exercise recovery. It is sold exclusively for research use.',
      },
      {
        question: 'What dosing format is available for the CJC-1295 + Ipamorelin blend?',
        answer:
          'Atlas Health offers this blend in two vial sizes: 5mg|5mg (5mg of each peptide per vial, 10 vials/kit) and 10mg|10mg (10mg of each peptide per vial, 10 vials/kit). Both are lyophilized powders requiring reconstitution with bacteriostatic water before use. The 10mg|10mg format is intended for extended research protocols where higher cumulative doses are being studied. Store at -20°C until reconstitution; use within 28 days of reconstitution when refrigerated at 2–8°C.',
      },
    ],
  },
  {
    productName: 'Cagrilintide',
    faqs: [
      {
        question: 'What is Cagrilintide and how does it support weight management?',
        answer:
          'Cagrilintide (AM833) is a long-acting amylin analog (CAS 1415456-99-3) engineered for once-weekly subcutaneous administration. Amylin is a pancreatic hormone co-secreted with insulin that promotes satiety, slows gastric emptying, and suppresses glucagon secretion. Cagrilintide mimics and extends these effects, reducing caloric intake by enhancing early satiety signals and modulating central appetite pathways. In Phase 2 trials, it demonstrated dose-dependent body weight reduction as monotherapy and synergistic effects when combined with GLP-1 receptor agonists.',
      },
      {
        question: 'How does Cagrilintide differ from semaglutide or other GLP-1 agonists?',
        answer:
          'Cagrilintide acts on amylin receptors (AMY1R, AMY2R, AMY3R) rather than the GLP-1 receptor. While GLP-1 agonists primarily reduce appetite via hypothalamic and vagal pathways and slow gastric emptying, cagrilintide adds complementary mechanisms: direct suppression of glucagon from alpha cells, reduction of post-meal glucose excursions, and distinct central satiety signaling. The combination of cagrilintide with semaglutide (CagriSema) is under Phase 3 clinical evaluation and has shown additive weight loss effects, which is why the research community considers this a synergistic pairing.',
      },
      {
        question: 'What are the known side effects and contraindications for Cagrilintide research?',
        answer:
          'Based on Phase 2 clinical trial data, the most commonly reported side effects with cagrilintide include nausea, vomiting, and injection site reactions — consistent with other amylin/GLP-1 class agents. Contraindications include personal or family history of medullary thyroid carcinoma (theoretical class concern), active pancreatitis, and pregnancy. Glucagon suppression may increase hypoglycemia risk when combined with insulin or sulfonylureas in diabetic research subjects. It is not currently FDA-approved and is sold for research purposes only.',
      },
    ],
  },
];

// ─── HELPER: get all product docs matching a name ───────────────────────────
async function getProductsByName(name) {
  const snap = await db
    .collection('products')
    .where('name', '==', name)
    .where('status', '==', 'active')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting FAQ seed...\n');

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const entry of FAQ_DATA) {
    console.log(`📦 Processing: ${entry.productName}`);

    // Find matching product slugs
    const products = await getProductsByName(entry.productName);
    if (products.length === 0) {
      console.warn(`  ⚠️  No active products found for "${entry.productName}" — skipping`);
      totalSkipped++;
      continue;
    }

    // Check existing FAQs for this product name to avoid duplicates
    const existingSnap = await db
      .collection('product_faqs')
      .where('product_name', '==', entry.productName)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      console.log(`  ⏭️  FAQs already exist for "${entry.productName}" — skipping`);
      totalSkipped++;
      continue;
    }

    // Use the most canonical product_id (preferably the default variant, or first)
    const defaultProduct =
      products.find((p) => p.isDefault) ||
      products.find((p) => !p.slug.includes('5mg') && !p.slug.includes('10mg')) ||
      products[0];

    const productId = defaultProduct.slug || defaultProduct.id;

    // Write each FAQ as a separate document
    const batch = db.batch();
    for (let i = 0; i < entry.faqs.length; i++) {
      const faq = entry.faqs[i];
      const docRef = db.collection('product_faqs').doc();
      batch.set(docRef, {
        product_id: productId,
        product_name: entry.productName,
        question: faq.question,
        answer: faq.answer,
        order: i + 1,
        category: 'general',
        is_published: true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`  ✅ Created ${entry.faqs.length} FAQs for "${entry.productName}" (product_id: ${productId})`);
    totalCreated += entry.faqs.length;
  }

  console.log(`\n✨ Done! Created ${totalCreated} FAQs, skipped ${totalSkipped} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
