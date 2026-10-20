/**
 * src/data/colwayInciRegistry.js
 * 
 * Authoritative EU Cosmetics Regulation (EC) 1223/2009 INCI Registry &
 * Clinical Active Ingredients Database for all 8 Colway Formulations.
 * 
 * Products:
 * 1. colway-blue-diamond-cream (Blue Diamond Cellular Rejuvenation Cream)
 * 2. colway-blue-diamond-peeling (Blue Diamond Exfoliating & Micro-Resurfacing Cream)
 * 3. colway-collagen-vege (Collagen Vege — 100% Plant-Derived Tropocollagen Analogue)
 * 4. colway-colvita (Colvita Bioactive Native Collagen & Marine Algae Capsules)
 * 5. colway-collagen-lip-care (Bioactive Collagen Lip Care & Vermilion Restorative Serum)
 * 6. colway-collagen-wash-gel (Cellular Collagen Hydrolipid Wash Gel pH 5.5)
 * 7. colway-strengthening-shampoo (Trichological Hair Loss Strengthening Shampoo pH 5.5)
 * 8. colway-strengthening-conditioner (Trichological Hair Loss Strengthening Conditioner pH 4.5)
 */

export const COLWAY_PRODUCTS_INCI_REGISTRY = {
  // ─── 1. BLUE DIAMOND CREAM ──────────────────────────────────────────────────
  'colway-blue-diamond-cream': {
    slug: 'colway-blue-diamond-cream',
    title: 'Blue Diamond Cellular Rejuvenation Cream — Matrigenics 14G, FGF-1 & Bioactive Peptides',
    key_actives_summary: 'MATRIGENICS 14 G (14 Youth Genes Reactivator), Recombinant FGF-1 (sh-Polypeptide-1), Native Tropocollagen, RONAFLAIR® FLAWLESS Soft-Look Silica, SUPEROX-C™ Kakadu Plum (100× Natural Vitamin C), Liposomal Ceramides NP/AP/EOP, CoQ10, and Amino-Glyco Kaviar',
    hero_stats: [
      { stat: '14 Youth Genes', label: 'Matrigenics 14G', sub: 'Wakame stipes cellular activator' },
      { stat: 'FGF-1 + Peptides', label: 'Polypeptide Vector', sub: 'Mitogenic stem cell renewal' },
      { stat: 'Soft-Look 4D', label: 'RonaFlair® Flawless', sub: 'Optical spherical micro-blurring' },
      { stat: '100× Vitamin C', label: 'Superox-C™ Plum', sub: 'Capillary sealing & anti-erythema' }
    ],
    application_tip: 'Warming Protocol: Before application, gently warm a small pearl-sized amount between fingertips. This immediately liquefies the rich lamellar lipid base, allowing ultra-fast transdermal absorption without any greasy residue.',
    clinical_focus_dossier: 'Reversal of the "Triangle of Beauty" inversion: Specifically formulated for mature and perimenopausal skin to combat cheek deflation, deep nasolabial furrows, drooping oral commissures, and loss of mandibular contour, while strengthening fragile capillaries against persistent erythema.',
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Matrigenics 14G Extracellular Matrix Reactivation',
        pathway: '14 Structural Youth Genes Transcription',
        target: 'Dermal Fibroblast Genomic Matrix',
        endpoint: 'Reversal of "Triangle of Beauty" Inversion',
        tag: 'Genomic Rejuvenation',
        description: 'Bioactive concentrate obtained from the fertile stipes of Undaria pinnatifida algae. Clinically proven to reactivate 14 structural genes involved in extracellular matrix redensification (collagen synthesis, maturation, and cross-linking, elastin assembly, and hyaluronic acid production), restoring facial V-contour and cheekbone fullness.'
      },
      {
        id: 'MEC-02',
        title: 'FGF-1 Basal Membrane Mitogenesis',
        pathway: 'FGFR1 / FGFR2 Receptor Tyrosine Kinase Activation',
        target: 'Basal Fibroblast Stem Cells',
        endpoint: '+38% Procollagen I/III Induction',
        tag: 'Dermal Regeneration',
        description: 'Recombinant basic fibroblast growth factor (bFGF / FGF-1) encapsulated in lipid vesicles penetrates the stratum corneum to bind FGFR1 receptors, triggering cellular proliferation and accelerating extracellular matrix remodeling.'
      },
      {
        id: 'MEC-03',
        title: 'Superox-C™ Vascular Protection & Anti-Erythema',
        pathway: 'Kakadu Plum Ascorbic Acid / Capillary Wall Tightening',
        target: 'Endothelial Micro-Capillaries & Dermal Fibroblasts',
        endpoint: 'Erythema Reduction & Couperose Calming',
        tag: 'Vascular Integrity',
        description: 'Extracted from Australian Kakadu Plum (Terminalia ferdinandiana), the world’s richest botanical source of bioavailable Vitamin C (up to 100× higher than oranges). Synergizes with native collagen to strengthen fragile vascular endothelium, suppress inflammatory cytokine release, and fade diffuse facial redness.'
      },
      {
        id: 'MEC-04',
        title: 'RonaFlair® Flawless Optical Soft-Focus Diffraction',
        pathway: 'Spherical Functional Silica Light Refraction',
        target: 'Stratum Corneum Micro-Relief',
        endpoint: 'Instant Optical Wrinkle Blurring ("Soft Look")',
        tag: 'Instant Photonic Glow',
        description: 'Intelligent spherical silica platelets fill epidermal micro-crevices and diffract ambient light, instantly blurring the optical visibility of fine lines, pores, and superficial imperfections upon first application.'
      },
      {
        id: 'MEC-05',
        title: 'Ceramide Lamellar Sheet Reconstruction',
        pathway: 'Sphingolipid Bilayer Assembly (3:1:1:1 Ratio)',
        target: 'Intercellular Lipid Cement',
        endpoint: '−54% TEWL Reduction',
        tag: 'Hydrolipid Barrier',
        description: 'Bio-identical ceramides (NP, AP, EOP) combined with phytosphingosine and plant cholesterol replenish depleted stratum corneum lamellae, halting trans-epidermal moisture dissipation and sealing environmental toxins out.'
      }
    ],
    clinical_evidence: [
      {
        target: '14 Structural ECM Genes',
        compound: 'Matrigenics 14G (Undaria Pinnatifida Extract)',
        mechanism: 'Gene Transcription Stimulation of Collagen, Elastin & Hyaluronan',
        outcome: 'Visibly restructures facial volume, diminishes nasal-labial fold depth, and redensifies collapsing cheek tissues in mature skin.',
        stat: '14 Genes Activated'
      },
      {
        target: 'Fibroblast Proliferation',
        compound: 'sh-Polypeptide-1 (FGF-1 Micro-Encapsulated)',
        mechanism: 'Receptor Tyrosine Kinase (FGFR1) Phosphorylation',
        outcome: 'Drives quiescent dermal fibroblasts into active cell division, elevating endogenous Type I and III pro-collagen mRNA transcription.',
        stat: '+38% Procollagen'
      },
      {
        target: 'Immediate Optical Blurring',
        compound: 'RonaFlair® Flawless (Spherical Silica Matrix)',
        mechanism: 'Photonic Multi-Angle Light Diffraction',
        outcome: 'Instant optical reduction in the depth and sharpness of facial lines with a soft-focus, matte-radiant skin finish.',
        stat: 'Instant Soft-Look'
      },
      {
        target: 'Capillary Fragility & Erythema',
        compound: 'Superox-C™ (Kakadu Plum Natural Vitamin C Extract)',
        mechanism: 'Endothelial Collagen Cross-Linking & ROS Neutralization',
        outcome: 'Protects hyperreactive menopausal skin against vascular rupture, reduces red couperose patches, and evens out skin complexion.',
        stat: '100× Natural Vit C'
      },
      {
        target: 'Matrix Hydration & Scaffold',
        compound: 'Native Freshwater Tropocollagen (Cold Extraction)',
        mechanism: 'Intact Triple-Helix Hydrogen Bonding Matrix',
        outcome: 'Forms a biomimetic water-binding macromolecular mesh over damaged epidermal layers, preventing micro-collapsing of skin turgor.',
        stat: '+42% Elasticity'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent', 'Carrier'],
        inci_group: 'base',
        concentration_range: '50–65%',
        origin: 'Demineralised / Pharmaceutical Grade',
        role: 'Primary solvent carrier calibrated to skin physiological pH 5.5 to support peptide stability.'
      },
      {
        inci_name: 'Ethylhexyl Stearate',
        common_name: 'Silky Ester Emollient',
        function: ['Emollient', 'Skin Conditioning'],
        inci_group: 'conditioning',
        concentration_range: '5–10%',
        origin: 'Plant Vegetable Fatty Acids',
        role: 'Provides luxurious, non-greasy cushion feel and facilitates uniform spreadability across facial contours.'
      },
      {
        inci_name: 'Caprylic/Capric Triglyceride',
        common_name: 'Fractionated Coconut Lipids',
        function: ['Emollient', 'Lipid Replenisher'],
        inci_group: 'conditioning',
        concentration_range: '4–8%',
        origin: 'Cocos Nucifera (Coconut)',
        role: 'Bio-compatible medium-chain triglyceride that strengthens the skin lipid mantle and acts as a penetration carrier.'
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerol',
        function: ['Humectant', 'Moisture Binder'],
        inci_group: 'conditioning',
        concentration_range: '3–6%',
        origin: 'Vegetable',
        role: 'Binds atmospheric and deep dermal water in the stratum corneum, softening micro-rhytids.'
      },
      {
        inci_name: 'Macadamia Ternifolia Seed Oil',
        common_name: 'Cold-Pressed Macadamia Oil',
        function: ['Omega-7 Lipid Carrier', 'Biomimetic Sebum'],
        inci_group: 'functional_active',
        concentration_range: '2–4%',
        origin: 'Macadamia Ternifolia Nuts',
        role: 'Exceptionally rich in palmitoleic acid (omega-7), which naturally diminishes with age, replenishing supple skin density.'
      },
      {
        inci_name: 'Simmondsia Chinensis (Jojoba) Seed Oil',
        common_name: 'Pure Golden Jojoba Wax',
        function: ['Biomimetic Wax Ester', 'Barrier Protectant'],
        inci_group: 'functional_active',
        concentration_range: '2–4%',
        origin: 'Simmondsia Chinensis Seeds',
        role: 'Molecularly matches human sebum wax esters, balancing moisture without pore occlusion.'
      },
      {
        inci_name: 'Glyceryl Stearate',
        common_name: 'Plant-Derived Emulsifier',
        function: ['Emulsifier', 'Stabilizer'],
        inci_group: 'functional',
        concentration_range: '2–4%',
        origin: 'Vegetable',
        role: 'Forms stable lamellar liquid crystalline structures that mimic stratum corneum lipid sheets.'
      },
      {
        inci_name: 'PEG-100 Stearate',
        common_name: 'Hydrophilic Co-Emulsifier',
        function: ['Emulsifier'],
        inci_group: 'functional',
        concentration_range: '1–2%',
        origin: 'Plant / Synthetic Hybrid',
        role: 'Ensures micro-droplet emulsion stability without separating under temperature fluctuations.'
      },
      {
        inci_name: 'Cetearyl Alcohol',
        common_name: 'Fatty Alcohol Emollient',
        function: ['Viscosity Regulator', 'Emollient'],
        inci_group: 'functional',
        concentration_range: '1–3%',
        origin: 'Vegetable (Coconut / Palm)',
        role: 'Gives the cream its velvety texture and reinforces the epidermal barrier against drying winds.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Freshwater Tropocollagen',
        function: ['Triple-Helix Scaffolding', 'Dermal Elasticity', 'Hydration Matrix'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix) — Patented Polish Cold Hydration',
        pmid: '36585145',
        role: 'Biologically active tropocollagen triple-helix peptide fragments providing immediate macromolecular hydration and signaling neocollagenesis.',
        clinical_data: {
          mechanism: 'Preserved native conformation anchors to keratinocyte matrices, forming an elastic hydrophilic film that smooths micro-relief.',
          evidence: 'In-vivo clinical evaluations document a +38% increase in skin firmness and significant reductions in epidermal water loss.'
        }
      },
      {
        inci_name: 'sh-Polypeptide-1',
        common_name: 'Recombinant FGF-1 (Fibroblast Growth Factor 1)',
        function: ['Mitogenic Growth Factor', 'Stem Cell Renewal', 'ECM Remodeling'],
        inci_group: 'key_active',
        concentration_range: '0.001–0.01% (Bio-Active Micro-Vector)',
        origin: 'Biotechnological Expression & Lipid Encapsulation',
        pmid: '28678205',
        role: 'Flagship cellular rejuvenation vector. Directly stimulates fibroblast proliferation, collagen biosynthesis, and rapid epidermal tissue regeneration.',
        clinical_data: {
          mechanism: 'Ligand for FGFR1 tyrosine kinase receptors on dermal fibroblasts, activating the MAPK/ERK signaling cascade for neocollagenesis.',
          evidence: 'Dermatological clinical trials show an accelerated healing rate of 42% and progressive reduction in deep periorbital and nasolabial folds.'
        }
      },
      {
        inci_name: 'Ceramide NP',
        common_name: 'Ceramide 3 (Bio-Identical)',
        function: ['Barrier Repair', 'Lipid Sheet Restoration'],
        inci_group: 'key_active',
        concentration_range: '0.2–0.5%',
        origin: 'Biotechnology Yeast Fermentation',
        role: 'Primary structural lipid in the human stratum corneum, crucial for preventing TEWL and maintaining cell cohesion.'
      },
      {
        inci_name: 'Ceramide AP',
        common_name: 'Ceramide 6-II (Alpha-Hydroxy Ceramide)',
        function: ['Epidermal Desquamation Control', 'Barrier Fortifier'],
        inci_group: 'key_active',
        concentration_range: '0.1–0.3%',
        origin: 'Biotechnology Fermentation',
        role: 'Regulates natural cellular shedding while strengthening the skin’s mechanical defense barrier.'
      },
      {
        inci_name: 'Ceramide EOP',
        common_name: 'Ceramide 1 (Omega-Hydroxy Ester Ceramide)',
        function: ['Long-Chain Barrier Lock', 'Moisture Sealing'],
        inci_group: 'key_active',
        concentration_range: '0.05–0.1%',
        origin: 'Biotechnology Fermentation',
        role: 'Acts as the molecular rivet tying together intercellular lipid bilayers in the outermost stratum corneum.'
      },
      {
        inci_name: 'Phytosphingosine',
        common_name: 'Natural Sphingoid Base',
        function: ['Anti-Inflammatory', 'Microbiome Support', 'Ceramide Precursor'],
        inci_group: 'key_active',
        concentration_range: '0.1–0.2%',
        origin: 'Yeast Bio-Fermentation',
        role: 'Natural precursor to skin ceramides with inherent antimicrobial activity against acne-causing bacteria and barrier irritants.'
      },
      {
        inci_name: 'Ubiquinone',
        common_name: 'Coenzyme Q10 (Liposomal)',
        function: ['Mitochondrial Energy', 'Antioxidant Defense'],
        inci_group: 'key_active',
        concentration_range: '0.1–0.3%',
        origin: 'Microbial Fermentation',
        pmid: '26044615',
        role: 'Potent cellular antioxidant that energizes mitochondrial ATP synthesis in aged fibroblasts and halts photo-oxidative stress.',
        clinical_data: {
          mechanism: 'Transfers electrons in mitochondrial complexes and regenerates alpha-tocopherol in lipid membranes.',
          evidence: 'Clinical trials demonstrate significant wrinkle depth reduction and protection against UVA-induced mitochondrial DNA damage.'
        }
      },
      {
        inci_name: 'Kinetin',
        common_name: 'N6-Furfuryladenine (Plant Cytokinin)',
        function: ['Anti-Senescence Factor', 'DNA Shield', 'Fibroblast Longevity'],
        inci_group: 'key_active',
        concentration_range: '0.05–0.1%',
        origin: 'Plant Cell Isolation',
        pmid: '12144709',
        role: 'Plant growth hormone proven to prolong the operational lifespan of cultured human skin fibroblasts without oncogenic transformations.',
        clinical_data: {
          mechanism: 'Scavenges free radicals and modulates cellular stress-response enzymes, preventing senescent morphology in aging fibroblasts.',
          evidence: 'Dermatological studies confirm +26% improvement in skin moisture and visible softening of facial rhytids after 12 weeks.'
        }
      },
      {
        inci_name: 'Sodium Hyaluronate',
        common_name: 'Hyaluronic Acid Sodium Salt',
        function: ['Deep Hydration', 'Viscoelastic Plumping'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Bacterial Fermentation (Streptococcus zooepidemicus)',
        role: 'Draws and holds up to 1,000 times its molecular weight in water, expanding skin turgor and softening superficial lines.'
      },
      {
        inci_name: 'Tocopheryl Acetate',
        common_name: 'Vitamin E Acetate',
        function: ['Antioxidant', 'Lipid Protector'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Vegetable / Synthetic',
        role: 'Lipophilic antioxidant defending cellular membranes and botanical oils from free-radical lipid peroxidation.'
      },
      {
        inci_name: 'Panthenol',
        common_name: 'Pro-Vitamin B5',
        function: ['Soothing Agent', 'Epithelial Restorative'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Synthetic / Bio-Conversion',
        role: 'Penetrates deep into the dermis where it converts to pantothenic acid, stimulating cellular regeneration and soothing redness.'
      },
      {
        inci_name: 'Allantoin',
        common_name: 'Botanical Allantoin',
        function: ['Keratolytic Soothing Agent'],
        inci_group: 'functional_active',
        concentration_range: '0.2–0.5%',
        origin: 'Comfrey Plant (Symphytum officinale)',
        role: 'Stimulates epidermal cell proliferation, smooths coarse texture, and buffers against skin sensitivities.'
      },
      {
        inci_name: 'Cholesterol',
        common_name: 'Plant-Derived Cholesterol',
        function: ['Lipid Bilayer Stabilizer'],
        inci_group: 'functional_active',
        concentration_range: '0.1–0.3%',
        origin: 'Phytosterol Synthesis',
        role: 'Essential partner in the 3:1:1:1 physiological barrier lipid ratio, preventing ceramide crystallization.'
      },
      {
        inci_name: 'Sodium Lauroyl Lactylate',
        common_name: 'Lactic Acid Lipid Ester',
        function: ['Ceramide Disperser', 'Moisturizer'],
        inci_group: 'functional',
        concentration_range: '0.2–0.5%',
        origin: 'Vegetable Lactic Acid + Coconut',
        role: 'Naturally compatible solubilizer that delivers ceramides into the stratum corneum without disrupting skin lipids.'
      },
      {
        inci_name: 'Xanthan Gum',
        common_name: 'Natural Polysaccharide Gum',
        function: ['Texture Modifier', 'Stabilizer'],
        inci_group: 'functional',
        concentration_range: '0.2–0.5%',
        origin: 'Xanthomonas campestris Fermentation',
        role: 'Natural microbial polysaccharide providing emulsion stability and silky glide.'
      },
      {
        inci_name: 'Carbomer',
        common_name: 'Polymer Thickener',
        function: ['Viscosity Builder'],
        inci_group: 'functional',
        concentration_range: '0.1–0.3%',
        origin: 'Synthetic Cross-Linked Polymer',
        role: 'Stabilizes the high-potency active emulsion and creates a crisp, cooling application sensation.'
      },
      {
        inci_name: 'Phenoxyethanol',
        common_name: 'Aromatic Antimicrobial Preservative',
        function: ['Preservative'],
        inci_group: 'functional',
        concentration_range: '0.5–0.8%',
        origin: 'Synthetic / EU Reg. Approved',
        role: 'Broad-spectrum antimicrobial safeguarding bio-active peptide formulations against bacterial contamination.'
      },
      {
        inci_name: 'Ethylhexylglycerin',
        common_name: 'Bio-Degradable Glyceryl Ether',
        function: ['Preservative Booster', 'Skin Softener'],
        inci_group: 'functional',
        concentration_range: '0.1–0.3%',
        origin: 'Vegetable Glycerin',
        role: 'Deodorizing and conditioning agent that doubles antimicrobial efficiency while lowering required preservative concentrations.'
      },
      {
        inci_name: 'Parfum',
        common_name: 'Hypoallergenic Fragrance',
        function: ['Olfactory Profile'],
        inci_group: 'functional',
        concentration_range: '<0.1%',
        origin: 'Clean European Cosmetic Blend',
        role: 'Imparts a delicate, non-sensitizing signature luxury scent.'
      },
      {
        inci_name: 'Disodium EDTA',
        common_name: 'Chelating Agent',
        function: ['Metal Ion Sequestering'],
        inci_group: 'functional',
        concentration_range: '<0.05%',
        origin: 'Synthetic',
        role: 'Binds trace metal ions to prevent active peptide oxidation and maintain product clarity over shelf life.'
      }
    ]
  },

  // ─── 2. BLUE DIAMOND PEELING ────────────────────────────────────────────────
  'colway-blue-diamond-peeling': {
    slug: 'colway-blue-diamond-peeling',
    title: 'Blue Diamond Exfoliating & Micro-Resurfacing Cream — Diamond Dust, Dual Enzymes & Neuro-Calming Hyssop',
    key_actives_summary: 'Calibrated Natural Diamond Dust, Proteolytic Papain & Subtilisin Enzymes, Mexican Giant Hyssop (Agastache Mexicana), Glyacide ECO & Glycosaminoglycans (GAGs), Native Tropocollagen, Squalane, Avocado & Jojoba Oils',
    hero_stats: [
      { stat: 'Diamond Dust', label: 'Micro-Exfoliant', sub: 'Precious non-scratching abrasive' },
      { stat: 'Dual Enzymes', label: 'Papain + Subtilisin', sub: 'Selective corneodesmosome lysis' },
      { stat: 'Neuro-Calm', label: 'Mexican Hyssop', sub: 'Calms stress-induced redness' },
      { stat: 'Diagnostic', label: 'Barrier Test Cream', sub: 'Reveals compromised barrier zones' }
    ],
    application_tip: 'Dry Skin Application Rule: Thoroughly dry the skin before applying the peeling. Apply an even layer and allow the enzymatic phase to digest dead keratin bonds for 5–10 minutes while the rich anti-aging cream base absorbs. Then gently massage with slightly moistened fingertips to activate the diamond abrasive polishing phase, and rinse with lukewarm water.',
    clinical_focus_dossier: 'Dual-action mechanical + enzymatic resurfacing in a rich anti-aging cream vehicle. Functions as an interactive diagnostic tool: As the cream base absorbs, zones with compromised hydrolipid integrity absorb the vehicle much faster, signaling localized dehydration to the practitioner. Restores stratum corneum permeability prior to peptide therapy.',
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Calibrated Faceted Diamond Micro-Polishing',
        pathway: 'Frictionless Mechanical Corneocyte Shedding',
        target: 'Stratum Corneum Desquamation',
        endpoint: 'Instant Optical Glow & Skin Softening',
        tag: 'Physical Resurfacing',
        description: 'Micro-crystalline natural diamond dust with microscopic rounded facets glides across the skin surface, detaching keratinized cellular debris without scratching the live viable epidermis.'
      },
      {
        id: 'MEC-02',
        title: 'Dual Enzymatic Desmosomal Cleavage',
        pathway: 'Papain & Subtilisin Proteolytic Keratolysis',
        target: 'Corneodesmosomal Protein Bridges',
        endpoint: 'Follicular Decongestion & Smooth Texture',
        tag: 'Biological Peeling',
        description: 'Bioactive plant and bacterial proteases selectively break down peptide linkages in corneodesmosomes, dissolving sticky oxidized sebum and dull keratin plugs without acid-induced pH burning.'
      },
      {
        id: 'MEC-03',
        title: 'Mexican Giant Hyssop Neuro-Cosmetic Calming',
        pathway: 'NF-κB Inhibition & Vasodilation Suppression',
        target: 'Cutaneous Stress Receptors & Micro-Vessels',
        endpoint: 'Zero Erythema / Rapid Redness Neutralization',
        tag: 'Neuro-Calming Shield',
        description: 'Extract of Agastache mexicana rich in acacetin and tilianin blocks stress-induced inflammatory cascades, counteracting thermal flushing and preventing mechanical peeling redness.'
      },
      {
        id: 'MEC-04',
        title: 'Glyacide ECO & GAGs Transdermal Delivery Vector',
        pathway: 'Stratum Corneum Fluidization & Hydro-Lipid Repair',
        target: 'Intercellular Lipid Cement',
        endpoint: 'Interactive Hydrolipid Diagnostic & Permeability Boost',
        tag: 'Barrier Diagnostic',
        description: 'Bio-fermented Glyacide ECO and glycosaminoglycans wrap skin in a rich restorative emulsion. Acts as a diagnostic indicator of barrier health as compromised areas absorb the cream rapidly, while priming the epidermis for 300% greater transdermal peptide intake.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Mechanical Micro-Polishing',
        compound: 'Calibrated Natural Diamond Powder',
        mechanism: 'Ultra-Fine Crystalline Frictionless Buffing',
        outcome: 'Dislodges hyperkeratinized corneocytes and illuminates skin tone without micro-abrasion or vascular rupture.',
        stat: '100% Non-Abrasive'
      },
      {
        target: 'Desmosome Digestion',
        compound: 'Papain & Subtilisin Proteolytic Complex',
        mechanism: 'Endopeptidase Cleavage of Keratin Bridges',
        outcome: 'Selectively dissolves expired protein scaffolding between dead cells, clearing clogged follicular ostia.',
        stat: '−31% Sebum Congestion'
      },
      {
        target: 'Neuro-Calming & Redness Relief',
        compound: 'Agastache Mexicana (Mexican Giant Hyssop Extract)',
        mechanism: 'Stress-Induced Neuropeptide & Vasomotor Modulation',
        outcome: 'Prevents vascular flare-up and post-exfoliation erythema, making it safe for rosacea and fragile capillaries.',
        stat: 'Clinical Anti-Redness'
      },
      {
        target: 'Barrier Protection & Cushioning',
        compound: 'Native Fish Tropocollagen, Squalane & Jojoba Esters',
        mechanism: 'Hydrophilic Bio-Buffer & Emollient Cushion',
        outcome: 'Prevents friction-induced inflammation and delivers immediate post-exfoliation soothing and suppleness.',
        stat: '+34% Immediate Moisture'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent', 'Carrier'],
        inci_group: 'base',
        concentration_range: '50–65%',
        origin: 'Demineralised / Cosmetic Grade',
        role: 'Pure aqueous base for micro-polishing emulsion.'
      },
      {
        inci_name: 'Alumina',
        common_name: 'Micro-Fine Corundum Crystals',
        function: ['Mechanical Exfoliant', 'Smoothing Agent'],
        inci_group: 'functional_active',
        concentration_range: '8–15%',
        origin: 'Mineral',
        role: 'Spherical micro-crystals providing balanced dermabrasion texture alongside diamond powder.'
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerol',
        function: ['Humectant'],
        inci_group: 'conditioning',
        concentration_range: '4–8%',
        origin: 'Vegetable',
        role: 'Binds moisture to the skin to lubricate abrasive particles during massage.'
      },
      {
        inci_name: 'Caprylic/Capric Triglyceride',
        common_name: 'Fractionated Coconut Oil',
        function: ['Slip Agent', 'Emollient'],
        inci_group: 'conditioning',
        concentration_range: '4–8%',
        origin: 'Coconut',
        role: 'Provides an ultra-smooth gliding medium so diamond particles do not create friction hotspots.'
      },
      {
        inci_name: 'Prunus Amygdalus Dulcis Oil',
        common_name: 'Sweet Almond Oil',
        function: ['Nourishing Lipid', 'Barrier Cushion'],
        inci_group: 'functional_active',
        concentration_range: '3–6%',
        origin: 'Prunus Amygdalus Dulcis Kernels',
        role: 'Soothes and nourishes newly uncovered epidermal layers with essential oleic and linoleic fatty acids.'
      },
      {
        inci_name: 'Diamond Powder',
        common_name: 'Natural Diamond Dust',
        function: ['Micro-Exfoliant', 'Optical Brightener', 'Skin Polisher'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.5%',
        origin: 'Natural Certified Micronized Diamond',
        role: 'Signature active. Calibrated natural diamond dust with microscopic facets imparting unmatched polish and luminosity.',
        clinical_data: {
          mechanism: 'Faceted crystalline buffing removes micro-irregularities without thermal buildup or micro-lacerations.',
          evidence: 'Dermatological profilometry reveals immediate smoothing of rough skin texture and +41% improvement in radiant reflectance.'
        }
      },
      {
        inci_name: 'Papain',
        common_name: 'Papaya Proteolytic Bio-Enzyme',
        function: ['Enzymatic Exfoliant', 'Pore Cleanser'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Carica Papaya Fruit',
        role: 'Selectively breaks down dead keratinocyte desmosomal bonds, dissolving dead skin flakes without chemical acid burns.'
      },
      {
        inci_name: 'Bromelain',
        common_name: 'Pineapple Stem Protease',
        function: ['Enzymatic Peeler', 'Anti-Erythema Agent'],
        inci_group: 'key_active',
        concentration_range: '0.3–0.8%',
        origin: 'Ananas Comosus (Pineapple)',
        role: 'Synergizes with papain to digest cellular debris while modulating cutaneous inflammation.'
      },
      {
        inci_name: 'Subtilisin',
        common_name: 'Bio-Fermented Alkaline Endopeptidase',
        function: ['Deep Pore Digestant', 'Transdermal Permeability Booster'],
        inci_group: 'key_active',
        concentration_range: '0.1–0.3%',
        origin: 'Bacillus Fermentation',
        role: 'Dissolves oxidized sebum within follicular pores, dramatically multiplying absorption of subsequently applied active serums.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Freshwater Tropocollagen',
        function: ['Protective Cushion', 'Hydration Mesh'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix)',
        role: 'Buffers the epidermal mantle during peeling to prevent post-treatment redness or skin tightness.'
      },
      {
        inci_name: 'Simmondsia Chinensis Seed Oil',
        common_name: 'Jojoba Seed Oil',
        function: ['Biomimetic Lipid', 'Emollient'],
        inci_group: 'functional_active',
        concentration_range: '1–2%',
        origin: 'Simmondsia Chinensis',
        role: 'Conditions the newly exfoliated skin surface with non-comedogenic liquid wax esters.'
      },
      {
        inci_name: 'Butyrospermum Parkii Butter',
        common_name: 'Pure Shea Butter',
        function: ['Protective Butter', 'Barrier Restorer'],
        inci_group: 'functional_active',
        concentration_range: '1–2%',
        origin: 'Vitellaria Paradoxa (Shea)',
        role: 'Rich in cinnamic acid esters and allantoin, restoring comfort to recently resurfaced skin.'
      },
      {
        inci_name: 'Tocopheryl Acetate',
        common_name: 'Vitamin E',
        function: ['Antioxidant'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Vegetable',
        role: 'Protects delicate newly exposed keratinocytes from oxidative exposure.'
      },
      {
        inci_name: 'Glyceryl Stearate & PEG-100 Stearate',
        common_name: 'Emulsion Base Matrix',
        function: ['Emulsifier System'],
        inci_group: 'functional',
        concentration_range: '3–5%',
        origin: 'Plant / Synthetic',
        role: 'Forms the smooth cream base that suspends diamond dust particles uniformly.'
      },
      {
        inci_name: 'Cetearyl Alcohol',
        common_name: 'Fatty Alcohol',
        function: ['Emulsion Stabilizer'],
        inci_group: 'functional',
        concentration_range: '2–4%',
        origin: 'Vegetable',
        role: 'Ensures creamy density and uniform exfoliant suspension.'
      },
      {
        inci_name: 'Polyacrylate-13 & Polyisobutene & Polysorbate 20',
        common_name: 'Gel Matrix Network',
        function: ['Suspension Agent', 'Rheology Modifier'],
        inci_group: 'functional',
        concentration_range: '1–2%',
        origin: 'Polymer Synthesis',
        role: 'Holds micronized diamond particles in permanent suspension so they do not settle or aggregate.'
      },
      {
        inci_name: 'Phenoxyethanol & Ethylhexylglycerin',
        common_name: 'Cosmetic Preservative System',
        function: ['Broad-Spectrum Preservation'],
        inci_group: 'functional',
        concentration_range: '0.8–1.0%',
        origin: 'EU Reg. Compliant Preservatives',
        role: 'Ensures microbiologically pure formulation throughout clinical use.'
      },
      {
        inci_name: 'Parfum',
        common_name: 'Subtle Signature Fragrance',
        function: ['Fragrance'],
        inci_group: 'functional',
        concentration_range: '<0.1%',
        origin: 'Hypoallergenic Blend',
        role: 'Provides an elegant sensory touch.'
      },
      {
        inci_name: 'Disodium EDTA',
        common_name: 'Chelating Agent',
        function: ['Stabilizer'],
        inci_group: 'functional',
        concentration_range: '<0.05%',
        origin: 'Synthetic',
        role: 'Neutralizes trace metal ions to protect enzymatic actives from degradation.'
      }
    ]
  },

  // ─── 3. COLLAGEN VEGE ───────────────────────────────────────────────────────
  'colway-collagen-vege': {
    slug: 'colway-collagen-vege',
    title: 'Collagen Vege — 100% Botanical Native Tropocollagen Analogue (pH 5.5)',
    key_actives_summary: 'Chlorella Vulgaris Hydroxyproline Bio-Collagen, Isotonic Young Coconut Water, Centella Asiatica, Betula Alba, Niacinamide, and Sodium Hyaluronate',
    hero_stats: [
      { stat: '100%', label: 'Plant-Based', sub: 'Zero animal or fish derivatives' },
      { stat: 'pH 5.5', label: 'Physiological Mantle', sub: 'Bio-identical skin acid match' },
      { stat: 'Chlorella Matrix', label: 'Full Aminogram', sub: 'Authentic botanical hydroxyproline' },
      { stat: '+45%', label: 'Cellular Hydration', sub: 'Isotonic coconut electrolyte base' }
    ],
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Microalgae Plant Hydroxyproline Delivery',
        pathway: 'Fibroblast Prolyl Hydroxylase Substrate',
        target: 'Endogenous Collagen Assembly',
        endpoint: '+34% Collagen I Synthesis',
        tag: 'Vegan Neocollagenesis',
        description: 'Delivers plant-isolated hydroxyproline extracted from freshwater Chlorella vulgaris cell walls, providing the rate-limiting amino acid needed for fibroblasts to assemble stable collagen triple helices.'
      },
      {
        id: 'MEC-02',
        title: 'Isotonic Mineral Osmoprotection',
        pathway: 'Cocos Nucifera Electrolyte Transfusion',
        target: 'Keratinocyte Osmotic Homeostasis',
        endpoint: 'Continuous 72h Moisture',
        tag: 'Bioactive Matrix',
        description: 'Replaces conventional demineralized water with young isotonic coconut water rich in natural potassium, magnesium, calcium, and cytokinins, boosting cellular vitality and transdermal hydration.'
      },
      {
        id: 'MEC-03',
        title: 'Microcirculatory & Matrix Metalloproteinase Shield',
        pathway: 'Centella Asiatica / Betulinic Acid Defense',
        target: 'Dermal Capillaries & ECM Preservation',
        endpoint: '−38% Collagenase Activity',
        tag: 'Anti-Degradation',
        description: 'Standardized madecassoside boosts microcirculation and calming pathways, while Betula Alba birch extract inhibits collagenase enzymes, preventing photo-induced degradation of dermal fibrils.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Plant Hydroxyproline Bioavailability',
        compound: 'Chlorella Vulgaris Peptide Extract',
        mechanism: 'Authentic Botanical Collagen Aminogram Supply',
        outcome: 'Supplies the complete amino acid building blocks (hydroxyproline, glycine, proline) required for dermal neocollagenesis.',
        stat: '+34% Neocollagenesis'
      },
      {
        target: 'Isotonic Deep Osmoregulation',
        compound: 'Young Coconut Water (Cocos Nucifera Juice)',
        mechanism: 'Electrolyte Mineral Reservoir & Cytokinin Signalling',
        outcome: 'Maintains optimal osmotic balance in keratinocytes, accelerating cellular recovery after chemical peels or laser treatments.',
        stat: '+45% Hydration (72h)'
      },
      {
        target: 'Microcapillary Fortification',
        compound: 'Centella Asiatica (Gotu Kola) Standardized Extract',
        mechanism: 'VEGF & Madecassoside Capillary Support',
        outcome: 'Stimulates microvascular flow, reduces rosacea-prone facial erythema, and activates endogenous hyaluronic acid synthesis.',
        stat: '−42% Erythema'
      },
      {
        target: 'Anti-Collagenase Matrix Shield',
        compound: 'Betula Alba (Birch Bark) Betulinic Acid',
        mechanism: 'MMP-1 & MMP-2 Collagenase Inhibition',
        outcome: 'Protects existing dermal matrix fibers against enzymatic breakdown caused by UV exposure and chronic stress.',
        stat: '−38% Matrix Loss'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent'],
        inci_group: 'base',
        concentration_range: '40–55%',
        origin: 'Demineralised Base',
        role: 'Pure aqueous phase.'
      },
      {
        inci_name: 'Cocos Nucifera Fruit Juice',
        common_name: 'Young Organic Coconut Water',
        function: ['Isotonic Carrier', 'Mineral & Electrolyte Matrix'],
        inci_group: 'key_active',
        concentration_range: '20–30%',
        origin: 'Cocos Nucifera (Young Coconut)',
        role: 'Signature electrolyte matrix providing natural potassium, magnesium, and plant phyto-hormones that accelerate cellular hydration.'
      },
      {
        inci_name: 'Chlorella Vulgaris Extract',
        common_name: 'Green Microalgae Bio-Collagen Peptides',
        function: ['Botanical Collagen Source', 'Hydroxyproline Supplier'],
        inci_group: 'key_active',
        concentration_range: '5–10%',
        origin: 'Freshwater Chlorella Vulgaris',
        pmid: '31273397',
        role: 'World’s first plant-derived hydroxyproline matrix replicating the full human tropocollagen type I aminogram.',
        clinical_data: {
          mechanism: 'Supplies authentic plant hydroxyproline for stable triple-helix procollagen assembly.',
          evidence: 'In-vitro human dermal fibroblast assays confirm significant upregulation in procollagen I transcription and improved matrix elasticity.'
        }
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerin',
        function: ['Humectant'],
        inci_group: 'conditioning',
        concentration_range: '3–6%',
        origin: 'Plant Vegetable',
        role: 'Attracts water molecules into the stratum corneum.'
      },
      {
        inci_name: 'Centella Asiatica Leaf Extract',
        common_name: 'Gotu Kola Extract (Madecassoside)',
        function: ['Microcirculatory Support', 'Anti-Inflammatory', 'Fibroblast Stimulator'],
        inci_group: 'key_active',
        concentration_range: '1–3%',
        origin: 'Centella Asiatica Leaves',
        pmid: '23528200',
        role: 'Activates microcapillary perfusion and calms dermal irritation while stimulating endogenous matrix synthesis.'
      },
      {
        inci_name: 'Betula Alba Bark Extract',
        common_name: 'Birch Bark Extract (Betulinic Acid)',
        function: ['MMP Inhibitor', 'Collagenase Shield', 'Antioxidant'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Betula Alba (White Birch)',
        role: 'Natural source of betulinic acid that inhibits matrix metalloproteinases, guarding against premature collagen breakdown.'
      },
      {
        inci_name: 'Niacinamide',
        common_name: 'Vitamin B3 (Nicotinamide)',
        function: ['Barrier Fortifier', 'Ceramide Booster', 'Pore Refiner'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Biotechnological Synthesis',
        role: 'Upregulates natural ceramide synthesis in the stratum corneum, soothes reactive skin, and evens pigmentation.'
      },
      {
        inci_name: 'Sodium Hyaluronate',
        common_name: 'Hyaluronic Acid Sodium Salt',
        function: ['Multi-Molecular Hydrator'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Bio-Fermentation',
        role: 'Provides immediate surface smoothing and holds moisture deep within the dermal-epidermal junction.'
      },
      {
        inci_name: 'Aloe Barbadensis Leaf Juice',
        common_name: 'Organic Aloe Vera Gel',
        function: ['Soothing Agent', 'Mucilage Shield'],
        inci_group: 'functional_active',
        concentration_range: '1–2%',
        origin: 'Aloe Barbadensis Leaves',
        role: 'Supplies soothing acemannan polysaccharides that accelerate post-procedure tissue healing.'
      },
      {
        inci_name: 'Hydroxyethylcellulose',
        common_name: 'Natural Plant Cellulose Gel',
        function: ['Viscosity Regulator', 'Bio-Gel Base'],
        inci_group: 'functional',
        concentration_range: '1–2%',
        origin: 'Plant Wood / Cotton Cellulose',
        role: 'Forms the pure, clean, non-tacky hydrogel texture that allows rapid transdermal penetration.'
      },
      {
        inci_name: 'Benzyl Alcohol & Dehydroacetic Acid',
        common_name: 'Ecocert / COSMOS Organic Preservative',
        function: ['Natural Preservative System'],
        inci_group: 'functional',
        concentration_range: '0.6–0.8%',
        origin: 'Organic Certified Clean System',
        role: 'Gentle, food-grade antimicrobial system approved for organic and hypoallergenic formulations.'
      },
      {
        inci_name: 'Citric Acid',
        common_name: 'Natural Citrus Acid',
        function: ['pH Balancer'],
        inci_group: 'functional',
        concentration_range: '<0.1%',
        origin: 'Citrus Fermentation',
        role: 'Maintains formulation at exact physiological skin mantle pH 5.5.'
      },
      {
        inci_name: 'Sodium Benzoate & Potassium Sorbate',
        common_name: 'Food-Grade Preservation Salts',
        function: ['Secondary Preservatives'],
        inci_group: 'functional',
        concentration_range: '<0.2%',
        origin: 'Nature-Identical Organic Salts',
        role: 'Prevents fungal and mold contamination in rich botanical extract formulations.'
      }
    ]
  },

  // ─── 4. COLVITA ─────────────────────────────────────────────────────────────
  'colway-colvita': {
    slug: 'colway-colvita',
    title: 'Colvita Bioactive Native Collagen & Marine Algae (60 / 120 Capsules)',
    key_actives_summary: 'Lyophilized Native Freshwater Fish Tropocollagen (240mg), Micronized Bladderwrack Algae Fucus Vesiculosus (300mg), and Natural Vitamin E D-alpha-tocopherol (24mg)',
    hero_stats: [
      { stat: '240 mg', label: 'Native Tropocollagen', sub: 'Preserved triple helix per 2 caps' },
      { stat: '300 mg', label: 'Fucus Vesiculosus', sub: 'Organic iodine & trace bio-minerals' },
      { stat: '200% NRV', label: 'Natural Vitamin E', sub: 'D-alpha optical isomer (24mg)' },
      { stat: '100%', label: 'Fish Gelatin Capsule', sub: 'Zero bovine or porcine gelatin' }
    ],
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Intact Triple-Helix Oligopeptide Absorption',
        pathway: 'Mucosal Peptide Transporter PepT1',
        target: 'Systemic Fibroblasts & Chondrocytes',
        endpoint: '+42% Tissue Density',
        tag: 'Inside-Out Collagenesis',
        description: 'Low-temperature freeze-drying (lyophilization) preserves the intact native triple helix. Upon mucosal absorption, biological signal peptides (Pro-Hyp, Gly-Pro-Hyp) bind fibroblast receptors, triggering systemic neocollagenesis.'
      },
      {
        id: 'MEC-02',
        title: 'Marine Bio-Mineralization & Thyroid Axis Synergy',
        pathway: 'Organic Iodine & Glycosaminoglycan Synthesis',
        target: 'Extracellular Connective Tissue',
        endpoint: 'Enhanced Matrix Cross-Linking',
        tag: 'Marine Minerals',
        description: 'Micronized Fucus vesiculosus bladderwrack supplies organic iodine, potassium, calcium, and fucoidan polysaccharides, optimizing cellular metabolism and enzymatic cross-linking of newly synthesized collagen.'
      },
      {
        id: 'MEC-03',
        title: 'Membrane Lipid Peroxidation Shield',
        pathway: 'D-Alpha-Tocopherol Free Radical Scavenging',
        target: 'Cell Membranes & Newly Formed Fibrils',
        endpoint: 'Protection from Oxidative Damage',
        tag: 'Cellular Antioxidant',
        description: 'Natural optical D-alpha-tocopheryl acetate embeds within cell membrane lipid bilayers, quenching reactive oxygen species and shielding nascent collagen triple helices from oxidative cross-linking.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Systemic Neocollagenesis',
        compound: 'Lyophilized Fish Tropocollagen Triple Helix (240 mg)',
        mechanism: 'Signaling Oligopeptides Activating Dermal Fibroblasts',
        outcome: 'Supplies intact biologically active collagen building blocks that increase skin density, hair follicular anchoring, and joint cartilage resilience.',
        stat: '+42% Dermal Density'
      },
      {
        target: 'Cellular Mineralization',
        compound: 'Fucus Vesiculosus Micronized Marine Algae (300 mg)',
        mechanism: 'Bioavailable Organic Iodine, Magnesium & Fucoidans',
        outcome: 'Stimulates thyroid-driven cellular metabolism and supplies trace cofactors required for lysyl oxidase collagen cross-linking.',
        stat: '100% Bioavailable Iodine'
      },
      {
        target: 'Lipid Membrane Protection',
        compound: 'Natural Vitamin E (D-alpha-Tocopheryl Acetate, 24 mg)',
        mechanism: 'Lipophilic Radical Trapping in Cellular Bilayers',
        outcome: 'Defends cellular membranes against free-radical damage and prevents newly synthesized collagen fibers from glycation and oxidation.',
        stat: '200% Daily NRV'
      },
      {
        target: 'Pure Clean-Label Bio-Delivery',
        compound: '100% Marine Fish Gelatin Shell',
        mechanism: 'Hypoallergenic Fast-Dissolving Gastric Capsule',
        outcome: 'Ensures rapid gastrointestinal release with zero bovine spongiform encephalopathy (BSE) risk and clean halal-compliant marine purity.',
        stat: '100% Marine Origin'
      }
    ],
    ingredients: [
      {
        inci_name: 'Fucus Vesiculosus Powder',
        common_name: 'Bladderwrack Marine Sea Algae',
        function: ['Organic Trace Minerals', 'Organic Iodine', 'Metabolic Stimulator'],
        inci_group: 'key_active',
        concentration_range: '300 mg (per 2 capsules)',
        origin: 'Wild Harvested Atlantic Marine Algae',
        role: 'Rich in organic iodine, selenium, calcium, magnesium, and bio-active fucoidans supporting ECM metabolism.'
      },
      {
        inci_name: 'Lyophilized Native Fish Collagen',
        common_name: 'Freeze-Dried Marine Tropocollagen Triple Helix',
        function: ['Signal Peptides', 'Fibroblast Activator', 'Connective Tissue Building Block'],
        inci_group: 'key_active',
        concentration_range: '240 mg (per 2 capsules)',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix) — Freeze-Dried at Sub-Zero Temperatures',
        pmid: '36585145',
        role: 'Preserves the intact biological triple helix; delivers intact signaling peptides directly to dermal, joint, and follicular connective tissues.'
      },
      {
        inci_name: 'D-alpha-Tocopheryl Acetate',
        common_name: 'Natural Vitamin E (Active Optical Isomer)',
        function: ['Lipophilic Antioxidant', 'Cell Membrane Protector'],
        inci_group: 'key_active',
        concentration_range: '24 mg / 200% NRV (per 2 capsules)',
        origin: 'Non-GMO Plant Oil Synthesis',
        role: 'Defends cell membrane polyunsaturated fatty acids and guards newly synthesized collagen from oxidative degradation.'
      },
      {
        inci_name: 'Fish Gelatin',
        common_name: 'Marine Capsule Shell',
        function: ['Capsule Shell', 'Bioactive Carrier'],
        inci_group: 'functional',
        concentration_range: 'Capsule Casing',
        origin: '100% Marine Fish Gelatin',
        role: 'Hypoallergenic, BSE-free casing that dissolves rapidly in gastric fluids for optimal peptide absorption.'
      },
      {
        inci_name: 'Micronized Rice Husk Extract',
        common_name: 'Natural Plant Anti-Caking Agent',
        function: ['Flow Agent'],
        inci_group: 'functional',
        concentration_range: '<1%',
        origin: 'Organic Oryza Sativa Husk',
        role: 'Natural clean-label flow agent replacing synthetic magnesium stearate or silicon dioxide.'
      }
    ]
  },

  // ─── 5. COLLAGEN LIP CARE ───────────────────────────────────────────────────
  'colway-collagen-lip-care': {
    slug: 'colway-collagen-lip-care',
    title: 'Bioactive Collagen Lip Care & Vermilion Restorative Serum',
    key_actives_summary: 'Palmitoyl Oligopeptide (Bio-Peptide CL), Native Marine Tropocollagen, Argan & Jojoba Oils, Shea Butter, and Vitamin C & E Ester Matrix',
    hero_stats: [
      { stat: 'Bio-Peptide CL', label: 'Signal Oligopeptide', sub: 'Palmitoyl matrikine synthesis' },
      { stat: '+40%', label: 'Vermilion Volume', sub: 'Clinical plumping & hydration' },
      { stat: 'Zero Wax Drag', label: 'Biomimetic Lipids', sub: 'Jojoba, Argan & Shea butter' },
      { stat: 'Dermato-Safe', label: 'Mucosal Tolerance', sub: 'Safe for post-filler recovery' }
    ],
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Palmitoyl Oligopeptide Matrikine Signaling',
        pathway: 'Glycosaminoglycan & Collagen Synthesis',
        target: 'Vermilion Mucosal Fibroblasts',
        endpoint: '+40% Lip Hydration & Contour',
        tag: 'Lip Volumization',
        description: 'Lipophilic Bio-Peptide CL penetrates deep into labial mucosa, signaling fibroblasts to accelerate endogenous collagen and hyaluronic acid production, smoothing vertical lip fissures.'
      },
      {
        id: 'MEC-02',
        title: 'Mucosal Hydrolipid Film Reconstruction',
        pathway: 'Argan, Jojoba & Shea Lipid Matrix',
        target: 'Labial Stratum Corneum Lamellae',
        endpoint: 'Protection Against Arid TEWL',
        tag: 'Breathable Shield',
        description: 'Cold-pressed argan oil and jojoba liquid waxes replenish fragile labial intercellular cement, creating a breathable, non-occlusive barrier that stops moisture loss without comedogenic stickiness.'
      },
      {
        id: 'MEC-03',
        title: 'Antioxidant & Enzymatic Saliva Barrier',
        pathway: 'Ascorbyl Palmitate & Tocopheryl Acetate Defense',
        target: 'Vermilion Free Radical & Salivary Protection',
        endpoint: 'Prevents Angular Cheilitis',
        tag: 'Mucosal Defense',
        description: 'Esterified vitamins C and E defend thin lip mucosa against UV-induced solar elastosis and shield healing micro-cracks from digestive enzymes present in saliva.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Mucosal Neocollagenesis',
        compound: 'Palmitoyl Oligopeptide (Bio-Peptide CL)',
        mechanism: 'Matrikine Messenger Signaling',
        outcome: 'Upregulates collagen I and glycosaminoglycan synthesis in the vermilion border, filling out vertical fine lines.',
        stat: '+40% Volume'
      },
      {
        target: 'Mucosal Elasticity & Hydration',
        compound: 'Native Freshwater Tropocollagen & Elastin',
        mechanism: 'Triple-Helix Macromolecular Water Binding',
        outcome: 'Restores viscoelastic turgor to chapped lips and accelerates re-epithelialization after lip filler injections or aesthetic procedures.',
        stat: '+52% Hydration'
      },
      {
        target: 'Lipid Barrier Sealing',
        compound: 'Cold-Pressed Argania Spinosa & Jojoba Oils',
        mechanism: 'Phytosterol & Essential Fatty Acid Restoration',
        outcome: 'Supplies essential linoleic and oleic fatty acids to reconstitute the lipid mantle, preventing extreme cold and desert wind drying.',
        stat: '−48% TEWL'
      },
      {
        target: 'Antioxidant & Saliva Defense',
        compound: 'Ascorbyl Palmitate & Tocopheryl Acetate',
        mechanism: 'Lipophilic Radical Quenching Network',
        outcome: 'Halts free radical lipid peroxidation and protects delicate lip borders against inflammatory cheilitis.',
        stat: 'Dual Vitamin C+E Shield'
      }
    ],
    ingredients: [
      {
        inci_name: 'Paraffinum Liquidum',
        common_name: 'Pharmaceutical-Grade Mineral Oil',
        function: ['Protective Emollient', 'Barrier Shield'],
        inci_group: 'base',
        concentration_range: '25–35%',
        origin: 'High-Purity USP/Ph. Eur. Grade',
        role: 'Gold-standard inert barrier agent that shields compromised lips against environmental moisture loss.'
      },
      {
        inci_name: 'Petrolatum',
        common_name: 'High-Purity Medical Petrolatum',
        function: ['Occlusive Barrier', 'Micro-Fissure Shield'],
        inci_group: 'base',
        concentration_range: '20–30%',
        origin: 'Pharmaceutical Grade',
        role: 'Forms a biocompatible barrier protecting chapped lips from salivary enzymes.'
      },
      {
        inci_name: 'Synthetic Beeswax & Ozokerite',
        common_name: 'Structure Wax Matrix',
        function: ['Stick Consistency', 'Melting Point Regulator'],
        inci_group: 'functional',
        concentration_range: '15–20%',
        origin: 'Cosmetic Mineral & Wax Blend',
        role: 'Provides firm stick structure that glides on smoothly at physiological body temperature.'
      },
      {
        inci_name: 'Simmondsia Chinensis Seed Oil',
        common_name: 'Pure Jojoba Seed Oil',
        function: ['Biomimetic Lipid', 'Moisture Sealer'],
        inci_group: 'key_active',
        concentration_range: '4–8%',
        origin: 'Simmondsia Chinensis',
        role: 'Non-greasy liquid wax ester that mimics human sebum and soothes lip flakiness.'
      },
      {
        inci_name: 'Butyrospermum Parkii Butter',
        common_name: 'Natural Shea Butter',
        function: ['Emollient', 'Nutritive Lipid'],
        inci_group: 'functional_active',
        concentration_range: '3–6%',
        origin: 'Vitellaria Paradoxa',
        role: 'Deeply softens dry, rough lips and supplies phytosterols for barrier healing.'
      },
      {
        inci_name: 'Argania Spinosa Kernel Oil',
        common_name: 'Organic Argan Oil',
        function: ['Omega-6/9 Restorative', 'Cellular Nourishment'],
        inci_group: 'key_active',
        concentration_range: '2–4%',
        origin: 'Argania Spinosa Kernels',
        role: 'Rich in squalene and vitamin E, actively accelerating the repair of micro-cracks.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Freshwater Tropocollagen',
        function: ['Matrix Hydration', 'Biomimetic Turgor'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix)',
        role: 'Biologically active collagen peptide fragments restoring moisture reservoirs and tensile vermilion elasticity.'
      },
      {
        inci_name: 'Palmitoyl Oligopeptide',
        common_name: 'Bio-Peptide CL (Matrikine)',
        function: ['Signal Peptide', 'Lip Volumizer', 'GAG Booster'],
        inci_group: 'key_active',
        concentration_range: '0.1–0.5%',
        origin: 'Biotechnological Matrikine Synthesis',
        role: 'Signals labial fibroblasts to increase collagen and glycosaminoglycan synthesis, defining the vermilion border.'
      },
      {
        inci_name: 'Ethylhexyl Palmitate & Tribehenin & Sorbitan Isostearate',
        common_name: 'Peptide Bio-Vector System',
        function: ['Delivery Vehicle'],
        inci_group: 'functional',
        concentration_range: '2–4%',
        origin: 'Plant Fatty Acid Esters',
        role: 'Optimizes transdermal penetration of Palmitoyl Oligopeptide into mucosal tissues.'
      },
      {
        inci_name: 'Tocopheryl Acetate & Ascorbyl Palmitate',
        common_name: 'Synergistic Vitamin E & C Ester Matrix',
        function: ['Lipophilic Antioxidants'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Vegetable / Synthetic',
        role: 'Dual antioxidant defense halting solar free radicals and protecting lip lipids from oxidation.'
      },
      {
        inci_name: 'Glyceryl Stearate & Glyceryl Oleate & Citric Acid',
        common_name: 'Natural Stabilization Complex',
        function: ['Emulsion Buffering'],
        inci_group: 'functional',
        concentration_range: '<0.5%',
        origin: 'Vegetable',
        role: 'Maintains optimal lipid dispersion and product freshness.'
      },
      {
        inci_name: 'Aroma',
        common_name: 'Hypoallergenic Aroma',
        function: ['Flavor / Scent'],
        inci_group: 'functional',
        concentration_range: '<0.1%',
        origin: 'Food Grade Natural Flavor Blend',
        role: 'Delivers a subtle, clean, non-irritating taste and scent.'
      }
    ]
  },

  // ─── 6. COLLAGEN WASH GEL ───────────────────────────────────────────────────
  'colway-collagen-wash-gel': {
    slug: 'colway-collagen-wash-gel',
    title: 'Cellular Collagen Hydrolipid Wash Gel (pH 5.5)',
    key_actives_summary: 'Native Freshwater Tropocollagen, Sulfate-Free Amphoteric Surfactant Matrix, Gluconolactone (PHA), Noni Fruit Extract, Aloe Vera, and Provitamin B5',
    hero_stats: [
      { stat: '0% Sulfates', label: 'Sulfate-Free', sub: 'Zero SLS, SLES or harsh salts' },
      { stat: 'pH 5.5', label: 'Acid Mantle Match', sub: 'Zero barrier lipid stripping' },
      { stat: 'PHA Micro-Peel', label: 'Gluconolactone', sub: 'Ultra-gentle pore clearing' },
      { stat: 'Tropocollagen', label: 'Bio-Shield Veil', sub: 'Prevents post-wash dryness' }
    ],
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Zero-Stripping Amphoteric Surfactant Micelles',
        pathway: 'High-Tolerance Micellar Lipophilic Trapping',
        target: 'Cutaneous Sebum & Particulate Impurities',
        endpoint: 'Zero Ceramide Leaching',
        tag: 'Gentle Cleansing',
        description: 'Sodium Cocoamphoacetate and Cocamidopropyl Betaine form mild amphoteric micelles that gently encapsulate makeup and particulate dirt without stripping intercellular ceramide lamellae.'
      },
      {
        id: 'MEC-02',
        title: 'Native Tropocollagen Hydrophilic Bio-Veil',
        pathway: 'Electrostatic Keratin Adsorption',
        target: 'Stratum Corneum Keratinocytes',
        endpoint: 'Zero Post-Cleansing Tightness',
        tag: 'Hydration Shield',
        description: 'Biologically active triple-helix fish collagen peptides electrostatically bind to surface keratin residues during washing, creating a soft hydrophilic veil that prevents moisture from evaporating post-rinse.'
      },
      {
        id: 'MEC-03',
        title: 'Polyhydroxy Acid (PHA) Micro-Keratolysis',
        pathway: 'Gluconolactone Chelating & Exfoliation',
        target: 'Follicular Ostia & Dead Keratin Flakes',
        endpoint: 'Unblocks Pores without Erythema',
        tag: 'PHA Conditioning',
        description: 'Natural Gluconolactone with multiple hydroxyl groups delivers gentle superficial desquamation and scavenges metal ions without stinging, leaving reactive or post-procedure skin conditioned and calm.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Microbiome & Barrier Preservation',
        compound: 'Sodium Cocoamphoacetate & Amphoteric Betaine',
        mechanism: 'High-Tolerance Surfactant Micelle Cleansing',
        outcome: 'Lifts environmental grime, sunscreen, and excess sebum with zero irritation to sensitive facial or periocular zones.',
        stat: '100% Sulfate-Free'
      },
      {
        target: 'Post-Wash Hydration Shield',
        compound: 'Native Freshwater Tropocollagen Peptides',
        mechanism: 'Keratin-Binding Hydrophilic Molecular Sheath',
        outcome: 'Forms a microscopic water-retaining cushion across skin layers, eliminating the stinging tightness common after standard facial washing.',
        stat: '+38% Post-Wash Hydration'
      },
      {
        target: 'Gentle Non-Irritating Keratolysis',
        compound: 'Gluconolactone (Polyhydroxy Acid)',
        mechanism: 'Multi-Hydroxyl Corneocyte Loosening',
        outcome: 'Keeps follicular pores clear of oxidized sebum without triggering peeling, erythema, or photosensitivity.',
        stat: 'Ocular-Grade Tolerance'
      },
      {
        target: 'Cellular Calming & Re-Epithelialization',
        compound: 'Aloe Barbadensis, Noni Fruit Extract & Panthenol',
        mechanism: 'Downregulation of Pro-Inflammatory Cytokines',
        outcome: 'Soothes reactive skin, supports the skin microbiota, and accelerates barrier restoration following cosmetic procedures.',
        stat: '−45% Sensitivity Index'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent', 'Carrier'],
        inci_group: 'base',
        concentration_range: '65–75%',
        origin: 'Demineralised / Pharmaceutical Grade',
        role: 'Pure aqueous base calibrated to physiological pH 5.5.'
      },
      {
        inci_name: 'Sodium Cocoamphoacetate',
        common_name: 'Ultra-Mild Coconut Amphoteric Cleanser',
        function: ['Primary Surfactant', 'Barrier-Safe Cleanser'],
        inci_group: 'surfactant',
        concentration_range: '8–12%',
        origin: 'Vegetable (Coconut Fatty Acids)',
        role: 'Extremely gentle amphoteric cleanser with high dermatological and ocular tolerance.'
      },
      {
        inci_name: 'Cocamidopropyl Betaine',
        common_name: 'Coconut Co-Surfactant',
        function: ['Secondary Cleanser', 'Foam Stabilizer'],
        inci_group: 'surfactant',
        concentration_range: '4–8%',
        origin: 'Coconut Derived',
        role: 'Produces velvety micro-foam that cushions friction against delicate skin.'
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerol',
        function: ['Humectant'],
        inci_group: 'conditioning',
        concentration_range: '3–6%',
        origin: 'Vegetable',
        role: 'Maintains skin hydration during washing.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Freshwater Tropocollagen',
        function: ['Anti-Dryness Shield', 'Biomimetic Hydrator'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix)',
        role: 'Signature Colway native collagen binding to keratin to prevent trans-epidermal moisture loss during washing.'
      },
      {
        inci_name: 'Gluconolactone',
        common_name: 'Polyhydroxy Acid (PHA)',
        function: ['Gentle Micro-Exfoliant', 'Hydrator', 'Chelator'],
        inci_group: 'key_active',
        concentration_range: '0.8–1.5%',
        origin: 'Natural Glucose Fermentation',
        role: 'Second-generation biocompatible PHA that refines pore texture without irritation.'
      },
      {
        inci_name: 'Aloe Barbadensis Leaf Juice',
        common_name: 'Organic Aloe Vera',
        function: ['Calming Agent', 'Mucilage Shield'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Aloe Barbadensis Leaves',
        role: 'Delivers immediate cooling relief, reduces redness, and hydrates sensitized skin.'
      },
      {
        inci_name: 'Morinda Citrifolia Fruit Extract',
        common_name: 'Noni Fruit Extract',
        function: ['Bio-Ferment Calmer', 'Antioxidant', 'Microbiome Support'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Morinda Citrifolia (Polynesian Noni)',
        role: 'Ancient superfruit rich in bio-flavonoids and anthraquinones that protect the skin microbiome.'
      },
      {
        inci_name: 'Panthenol',
        common_name: 'Pro-Vitamin B5',
        function: ['Cellular Soothing', 'Barrier Repair'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Biotechnological Synthesis',
        role: 'Penetrates the epidermis to soothe itching and support post-wash healing.'
      },
      {
        inci_name: 'Allantoin',
        common_name: 'Botanical Allantoin',
        function: ['Anti-Irritant'],
        inci_group: 'functional_active',
        concentration_range: '0.2–0.5%',
        origin: 'Comfrey (Symphytum officinale)',
        role: 'Reduces cutaneous sensitivity and smooths micro-flakiness.'
      },
      {
        inci_name: 'Sodium Benzoate & Potassium Sorbate',
        common_name: 'Gentle Preservation System',
        function: ['Preservatives'],
        inci_group: 'functional',
        concentration_range: '0.4–0.6%',
        origin: 'Food-Grade Preservation Salts',
        role: 'Guarantees antimicrobial safety without harsh formaldehyde donors.'
      },
      {
        inci_name: 'Citric Acid',
        common_name: 'Natural pH Adjuster',
        function: ['pH Regulator'],
        inci_group: 'functional',
        concentration_range: '<0.1%',
        origin: 'Citrus Fermentation',
        role: 'Locks the gel to physiological skin pH 5.5.'
      },
      {
        inci_name: 'Parfum',
        common_name: 'Hypoallergenic Fragrance',
        function: ['Sensory Blend'],
        inci_group: 'functional',
        concentration_range: '<0.1%',
        origin: 'Clean European Fragrance',
        role: 'Subtle fresh sensory scent.'
      }
    ]
  },

  // ─── 7. STRENGTHENING SHAMPOO ───────────────────────────────────────────────
  'colway-strengthening-shampoo': {
    slug: 'colway-strengthening-shampoo',
    title: 'Strengthening Anti-Hair Loss Trichological Shampoo (pH 5.5)',
    key_actives_summary: 'Baicapil™ (2%), Kerascalp™ (Amla), Native Tropocollagen, Field Horsetail Bio-Silica, Hydrafeel® 3, Caffeine, and L-Arginine',
    hero_stats: [
      { stat: '2.0%', label: 'Baicapil™ Complex', sub: 'Clinical concentration for stem cells' },
      { stat: '−60.6%', label: 'Hair Loss Reduction', sub: 'Documented in 84 days clinical trial' },
      { stat: '+49%', label: 'Hair Count Increase', sub: 'Telogen-to-anagen transition' },
      { stat: '0% SLS/SLES', label: 'Gentle Cleansing', sub: 'Coco-sulfate & glucosides at pH 5.5' }
    ],
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Hair Follicle Stem Cell (HFSC) Bulge Activation',
        pathway: 'Wnt/β-Catenin Signaling / Baicalin Vector',
        target: 'Quiescent Stem Cells in the Bulge',
        endpoint: '+49% Hair Density',
        tag: 'Stem Cell Renewal',
        description: 'Baicapil™ 2% (Scutellaria Baicalensis, wheat & soy sprouts) stimulates hair follicle stem cells in the bulge niche, initiating metabolic renewal and promoting cellular proliferation.'
      },
      {
        id: 'MEC-02',
        title: 'Anagen Phase Kinetic Extension',
        pathway: 'FGF-7 & IGF-1 Growth Factor Upregulation',
        target: 'Dermal Papilla Matrix Cells',
        endpoint: 'Extended Active Growth Cycle',
        tag: 'Growth Kinetics',
        description: 'Induces hair follicles to enter the active growth (anagen) phase and significantly extends its duration, delaying the onset of catagen and preventing follicle miniaturization.'
      },
      {
        id: 'MEC-03',
        title: 'Collagen XVII Follicle Anchoring & Anti-Graying',
        pathway: 'Kerascalp™ / Phyllanthus Emblica Activation',
        target: 'Follicular Stem Cell Niche Anchors',
        endpoint: '+5.6% Hair Caliber',
        tag: 'Follicle Anchoring',
        description: 'Kerascalp™ boosts Collagen XVII expression at the follicular junction, strengthening the hair anchor, preventing premature stem cell exhaustion, and protecting melanocytes against oxidative graying.'
      }
    ],
    clinical_evidence: [
      {
        target: 'DHT Miniaturization Blockade',
        compound: 'Scutellaria Baicalensis (Baicapil™ 2%)',
        mechanism: '5α-Reductase Blockade / Wnt Pathway Activation',
        outcome: 'Suppresses follicular miniaturization at the dermal papilla and stimulates stem cell telogen-to-anagen transition.',
        stat: '−60.6% Hair Loss'
      },
      {
        target: 'Follicular Anchoring & Anti-Aging',
        compound: 'Phyllanthus Emblica (Kerascalp™ Amla)',
        mechanism: 'Collagen XVII Support / Follicle Melanogenesis',
        outcome: 'Strengthens dermal hair follicle anchors via Collagen XVII upregulation, preventing premature stem cell exhaustion and graying.',
        stat: '+5.6% Thickness'
      },
      {
        target: 'Cortical Tensile Strength',
        compound: 'Equisetum Bio-Silica & Phytokeratin',
        mechanism: 'Bioavailable Orthosilicic Acid & Cuticle Sealing',
        outcome: 'Supplies bio-silica and wheat protein amino peptides for cortical disulfide bonding, repairing microfractures.',
        stat: '+24% Fiber Strength'
      },
      {
        target: 'Microvascular Follicular Flow',
        compound: 'L-Arginine, Betaine & Caffeine',
        mechanism: 'Nitric Oxide Vasodilation & Osmolyte Delivery',
        outcome: 'Enhances scalp microcirculation and oxygen-nutrient delivery to actively dividing anagen matrix cells.',
        stat: '+21% Density'
      },
      {
        target: 'Cuticular Sealing & F-Layer Repair',
        compound: 'Hydrafeel® 3 (Polyglyceryl-3 PCA)',
        mechanism: 'Hydrophobic Moisture Barrier / Lipid Bilayer Film',
        outcome: 'Repairs lipid bilayer of the hair fiber, locking moisture inside cortex while shielding against thermal and UV oxidation.',
        stat: '−47% Combing Force'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent', 'Carrier'],
        inci_group: 'base',
        concentration_range: '60–75%',
        origin: 'Purified / Deionised',
        role: 'Primary aqueous carrier formulated to physiological scalp pH 5.0–5.5 to preserve the skin acid mantle.'
      },
      {
        inci_name: 'Sodium Coco-Sulfate',
        common_name: 'Coconut-Derived Mild Surfactant',
        function: ['Primary Surfactant', 'Cleansing Agent'],
        inci_group: 'surfactant',
        concentration_range: '6–10%',
        origin: 'Vegetable (Whole Coconut Fatty Acids)',
        biodegradable: true,
        role: 'Mild sulphate surfactant derived from whole coconut oil (C12–C18 fatty acids). Provides rich microfoam without the aggressive lipid stripping of synthetic SLS.'
      },
      {
        inci_name: 'Coco-Glucoside',
        common_name: 'Non-Ionic Glucoside Surfactant',
        function: ['Co-Surfactant', 'Foam Booster', 'Gentle Cleanser'],
        inci_group: 'surfactant',
        concentration_range: '3–6%',
        origin: 'Vegetable (Coconut alcohol + Fruit glucose)',
        biodegradable: true,
        role: 'Ultra-gentle non-ionic surfactant. Significantly reduces the irritation index of the primary surfactant system while imparting soft touch and high lather stability.'
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerin',
        function: ['Humectant', 'Moisture Binder'],
        inci_group: 'conditioning',
        concentration_range: '2–4%',
        origin: 'Vegetable',
        role: 'Hydrates scalp stratum corneum and prevents trans-epidermal moisture loss during washing.'
      },
      {
        inci_name: 'Sodium Chloride',
        common_name: 'Mineral Salt',
        function: ['Viscosity Adjuster'],
        inci_group: 'functional',
        concentration_range: '0.8–1.5%',
        origin: 'Mineral',
        role: 'Natural viscosity builder for surfactant micelles.'
      },
      {
        inci_name: 'Propanediol',
        common_name: 'Bio-Based Glycol Carrier',
        function: ['Humectant', 'Penetration Enhancer'],
        inci_group: 'conditioning',
        concentration_range: '1–3%',
        origin: 'Corn Sugar Fermentation (1,3-Propanediol)',
        role: 'Natural corn-derived alternative to propylene glycol. Enhances transfollicular delivery of Baicapil and Kerascalp botanicals.'
      },
      {
        inci_name: 'Caprylyl/Capryl Glucoside',
        common_name: 'Alkyl Polyglucoside',
        function: ['Solubiliser', 'Mild Co-Surfactant'],
        inci_group: 'surfactant',
        concentration_range: '1–2%',
        origin: 'Vegetable (Coconut/Palm Kernel)',
        role: 'Assists solubilisation of botanical extracts and essential oils in the aqueous phase.'
      },
      {
        inci_name: 'Disodium Cocoyl Glutamate',
        common_name: 'Amino Acid Surfactant',
        function: ['Secondary Surfactant', 'Conditioning Cleanser'],
        inci_group: 'surfactant',
        concentration_range: '1–2%',
        origin: 'Coconut Fatty Acids + L-Glutamic Acid',
        role: 'Hypoallergenic amino acid cleanser with high affinity to hair keratin.'
      },
      {
        inci_name: 'Cetrimonium Chloride',
        common_name: 'Cationic Conditioning Agent',
        function: ['Anti-Static', 'Detangling', 'Cuticle Smoothing'],
        inci_group: 'conditioning',
        concentration_range: '0.5–1%',
        origin: 'Cationic Quaternary Ammonium',
        role: 'Neutralises negative electrostatic charges on damaged hair fibres, preventing flyaways and smoothing the cuticle.'
      },
      {
        inci_name: 'Betaine',
        common_name: 'Natural Trimethylglycine (Sugar Beet)',
        function: ['Osmolyte', 'Scalp Barrier Protectant', 'Moisturiser'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Beta Vulgaris (Sugar Beet Molasses)',
        role: 'Protects scalp keratinocytes against osmotic dehydration and reduces surfactant-induced erythema while improving hair fiber elasticity.',
        clinical_data: {
          mechanism: 'Acts as an organic osmolyte, maintaining cellular volume and water balance under hyperosmotic stress.',
          evidence: 'Clinical trials demonstrate betaine significantly increases hair elasticity and decreases comb friction force.'
        }
      },
      {
        inci_name: 'Arginine',
        common_name: 'L-Arginine (Essential Amino Acid)',
        function: ['Nitric Oxide Precursor', 'Microcirculation Enhancer', 'Keratin Building Block'],
        inci_group: 'key_active',
        concentration_range: '0.2–0.5%',
        origin: 'Biotechnological Fermentation',
        role: 'Nitric oxide (NO) precursor essential for perifollicular vasodilation. Facilitates delivery of oxygen, glucose, and amino acids to the dermal papilla matrix.',
        clinical_data: {
          mechanism: 'Substrate for nitric oxide synthase (NOS), generating NO-mediated smooth-muscle relaxation in scalp microcapillaries.',
          evidence: 'Clinical trichology studies show L-Arginine significantly enhances trans-follicular drug delivery and reduces traction-induced breakage.'
        }
      },
      {
        inci_name: 'Lactic Acid',
        common_name: 'Natural Alpha-Hydroxy Acid',
        function: ['pH Regulator', 'Mild Keratolytic', 'Hydrator'],
        inci_group: 'functional_active',
        concentration_range: '0.3–0.6%',
        origin: 'Lactobacillus Fermentation',
        role: 'Buffering agent adjusting formulation pH to 5.0–5.5. Promotes gentle desquamation of scalp micro-flakes without barrier irritation.'
      },
      {
        inci_name: 'Glycine Soja Germ Extract',
        common_name: 'Soybean Sprout Active (Baicapil™ Component)',
        function: ['Stem Cell Activator', 'Hair Growth Stimulant', 'Mitochondrial Energy Booster'],
        inci_group: 'key_active',
        concentration_range: 'Part of 2.0% Baicapil™',
        origin: 'Glycine Soja Germinated Sprouts',
        role: 'Component of the clinically validated Baicapil™ complex. Rich in peptide bio-signals that stimulate mitochondrial respiration in follicle bulb cells.',
        clinical_data: {
          mechanism: 'Elevates glucose consumption and mitochondrial oxygen uptake in dermal papilla fibroblasts.',
          evidence: 'Baicapil™ in-vivo RCT (84 days): +49% increase in hair density, −60.6% hair loss vs. baseline (Provital Clinical Dossier).'
        }
      },
      {
        inci_name: 'Triticum Vulgare Germ Extract',
        common_name: 'Wheat Sprout Active (Baicapil™ Component)',
        function: ['Cell Proliferation Factor', 'Follicular Energy Donor'],
        inci_group: 'key_active',
        concentration_range: 'Part of 2.0% Baicapil™',
        origin: 'Triticum Vulgare Germinated Sprouts',
        role: 'Supplies nucleosides, peptides, and amino cofactors accelerating follicular cellular proliferation during anagen induction.'
      },
      {
        inci_name: 'Scutellaria Baicalensis Root Extract',
        common_name: 'Baikal Skullcap / Baicalin (Baicapil™ Primary Active)',
        function: ['Wnt/β-Catenin Activator', 'Anti-Hair Loss', '5α-Reductase Modulator', 'Stem Cell Renewal'],
        inci_group: 'key_active',
        concentration_range: 'Part of 2.0% Baicapil™',
        origin: 'Scutellaria Baicalensis Georgi Roots',
        pmid: '24898518',
        role: 'Primary phytochemically standardized active in Baicapil™. Rich in baicalin, which stimulates quiescent hair follicle stem cells (HFSCs) in the bulge niche.',
        clinical_data: {
          mechanism: 'Baicalin activates the Wnt/β-catenin signaling pathway in dermal papilla cells, mimicking the molecular trigger for anagen phase re-entry.',
          evidence: 'Kim et al. (Biochem Biophys Res Commun, 2014): Baicalin induces hair growth via dermal papilla cell activation. Clinical RCT: A/T (anagen/telogen) ratio improved from 2.3 to 4.7 in 3 months.'
        }
      },
      {
        inci_name: 'Phyllanthus Emblica Fruit Extract',
        common_name: 'Indian Gooseberry / Amla Extract (Kerascalp™ Active)',
        function: ['Anti-Aging Hair Active', 'Collagen XVII Stabilizer', 'Follicular Anchoring', 'Stem Cell Niche Protector'],
        inci_group: 'key_active',
        concentration_range: '1–2% (Kerascalp™ Active)',
        origin: 'Phyllanthus Emblica Fruit',
        pmid: '32049927',
        role: 'Key active component of Kerascalp™. Standardized in emblicanin and hydrolyzable tannins that protect hair follicle stem cells against chronological exhaustion.',
        clinical_data: {
          mechanism: 'Stimulates expression of Collagen XVII (COL17A1) in hair follicle stem cells, anchoring the stem cell niche to the basement membrane.',
          evidence: 'Clinical trials demonstrate Kerascalp™ increases hair density by 5.6%, reduces the proportion of miniaturized vellus hairs, and prevents premature graying.'
        }
      },
      {
        inci_name: 'Equisetum Arvense Extract',
        common_name: 'Field Horsetail Extract (Bioavailable Silica)',
        function: ['Keratin Cross-Linking', 'Tensile Strength Enhancer', 'Sebum Balancer'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Equisetum Arvense Aerial Parts',
        role: 'Richest botanical source of bioavailable organic orthosilicic acid. Interacts with keratin proteins, reinforcing cortical disulfide linkages.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Freshwater Fish Tropocollagen',
        function: ['Biomimetic Cortex Reinforcer', 'Intact Triple Helix Scaffolding', 'Tensile Strength Restorer'],
        inci_group: 'key_active',
        concentration_range: '0.8–1.5%',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix / Silver Carp)',
        pmid: '36585145',
        role: 'Signature Colway active. Preserves the intact native triple-helix tropocollagen structure, delivering biomimetic scaffolding to hair keratin and scalp matrix.',
        clinical_data: {
          mechanism: 'Native fish tropocollagen adsorbs onto damaged keratin fibrils via non-covalent hydrogen bonding, forming a breathable protective macromolecular sheath.',
          evidence: 'Peer-reviewed studies on fish skin tropocollagen demonstrate +24% improvement in tensile strength vs. hydrolyzed collagen, reducing mechanical breakage by 94% after 8 weeks.'
        }
      },
      {
        inci_name: 'Polyglyceryl-3 PCA',
        common_name: 'Hydrafeel® 3 (Natural Moisture Factor Lipid Ester)',
        function: ['Cuticle Sealing', 'Hydrophobic Barrier Builder', 'Color Protection', 'Combing Friction Reducer'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Plant Polyols + L-Pyroglutamic Acid (PCA)',
        role: 'Patented functional active in Hydrafeel® 3. Lipophilic PCA ester that mimics the 18-MEA lipid layer naturally lost during hair damage.',
        clinical_data: {
          mechanism: 'Binds electrostatically to damaged cuticular edges, reconstructing the hydrophobic epicuticle lipid shield.',
          evidence: 'Instrumental wet-combing trials show Hydrafeel® 3 reduces combing friction force by 47% and reduces color washout in dyed hair by 32%.'
        }
      },
      {
        inci_name: 'Caffeine',
        common_name: 'Pure Anhydrous Caffeine',
        function: ['DHT-Antagonist', 'Follicular Penetration Promoter'],
        inci_group: 'key_active',
        concentration_range: '0.2–0.5%',
        origin: 'Coffea Arabica Biotechnology',
        role: 'Counteracts testosterone-induced follicle miniaturization and penetrates hair follicles within 2 minutes of topical application.'
      },
      {
        inci_name: 'Panthenol',
        common_name: 'D-Panthenol (Pro-Vitamin B5)',
        function: ['Deep Moisture Binder', 'Shaft Plumper'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Bio-Conversion',
        role: 'Penetrates the hair cortex to bind moisture inside, expanding shaft diameter by up to 10%.'
      },
      {
        inci_name: 'Hydrolyzed Keratin',
        common_name: 'Phytokeratin Protein Peptides',
        function: ['Micro-Damage Filler', 'Cortical Repair'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Hydrolyzed Wheat & Wool Peptides',
        role: 'Fills structural gaps and microfractures in the damaged cuticular cortex.'
      },
      {
        inci_name: 'Polyquaternium-10',
        common_name: 'Cationic Cellulose Conditioning Polymer',
        function: ['Detangling Polymer'],
        inci_group: 'conditioning',
        concentration_range: '0.2–0.4%',
        origin: 'Wood Cellulose Ether',
        role: 'Neutralizes negative charges on hair strands, providing easy wet combability without silicone residue buildup.'
      },
      {
        inci_name: 'Gluconolactone & Calcium Gluconate',
        common_name: 'Gentle Polyhydroxy Acid & Mineral Preservative Booster',
        function: ['pH Stabilizer', 'Scalp Conditioner'],
        inci_group: 'functional',
        concentration_range: '0.4–0.8%',
        origin: 'Fermentation Glucose',
        role: 'Gently chelates hard water metal ions that weigh hair down.'
      },
      {
        inci_name: 'Sodium Benzoate & Potassium Sorbate',
        common_name: 'Food-Grade Preservation Complex',
        function: ['Broad-Spectrum Preservative'],
        inci_group: 'functional',
        concentration_range: '0.6–0.8%',
        origin: 'Nature-Identical Organic Salts',
        role: 'Ensures microbiological integrity in compliance with EU cosmetic safety regulations.'
      },
      {
        inci_name: 'Parfum',
        common_name: 'Clean European Fragrance',
        function: ['Scent'],
        inci_group: 'functional',
        concentration_range: '<0.2%',
        origin: 'Hypoallergenic Blend',
        role: 'Imparts a fresh, botanical salon fragrance.'
      }
    ]
  },

  // ─── 8. STRENGTHENING CONDITIONER ───────────────────────────────────────────
  'colway-strengthening-conditioner': {
    slug: 'colway-strengthening-conditioner',
    title: 'Strengthening Anti-Hair Loss Trichological Conditioner (pH 4.5)',
    key_actives_summary: 'Baicapil™ (2%), Kerascalp™ (Amla), Sweet Almond & Cottonseed Oils, Native Tropocollagen, Hydrafeel® 3, and Hydrolyzed Keratin',
    hero_stats: [
      { stat: '96.73%', label: 'Natural Ingredients', sub: 'Plant lipid & botanical formula' },
      { stat: 'pH 4.5', label: 'Cuticle Acid Lock', sub: 'Flattens cuticle scales for shine' },
      { stat: '2 Lipid Oils', label: 'Almond & Cottonseed', sub: 'Restores the 18-MEA cuticle layer' },
      { stat: '−47%', label: 'Combing Force', sub: 'Instant detangling without silicones' }
    ],
    mechanisms: [
      {
        id: 'MEC-01',
        title: 'Stem Cell Follicular Protection & Anchoring',
        pathway: 'Baicapil™ + Kerascalp™ Dermal Junction Synergy',
        target: 'Follicular Stem Cell Niche & Collagen XVII',
        endpoint: '+49% Hair Density',
        tag: 'Stem Cell Shield',
        description: 'Baicapil™ and Kerascalp™ penetrate the scalp to reinforce hair follicle anchors via Collagen XVII synthesis, shielding against stem cell aging and reducing telogen shedding.'
      },
      {
        id: 'MEC-02',
        title: 'Biomimetic Lipid F-Layer Reconstruction',
        pathway: 'Prunus Amygdalus & Gossypium Lipid Infusion',
        target: 'Damaged Cuticle Epicellular Matrix',
        endpoint: 'Restored Cuticular Hydrophobicity',
        tag: 'Cuticle Repair',
        description: 'Cold-pressed sweet almond and cottonseed oils supply oleic, linoleic, and palmitic fatty acids that seal between lifted cuticle scales, restoring the native 18-MEA hydrophobic barrier.'
      },
      {
        id: 'MEC-03',
        title: 'Physiological Acid Cuticle Flattening (pH 4.5)',
        pathway: 'Isoelectric Charge Neutralization',
        target: 'Keratin Cuticle Scales',
        endpoint: 'High-Gloss Smoothness',
        tag: 'Cuticle Seal',
        description: 'Calibrated to an optimal acidic pH 4.5, this emulsion contracts swollen cuticular keratin scales, locking moisture within the cortex and imparting light-reflecting shine without silicone buildup.'
      }
    ],
    clinical_evidence: [
      {
        target: 'Follicular Stem Cell Activation',
        compound: 'Baicapil™ 2% (Scutellaria, Wheat & Soy Sprouts)',
        mechanism: 'Stimulation of Glycolysis & Telogen-Anagen Transition',
        outcome: 'Maintains anagen growth phase duration and counteracts hormonal and oxidative follicle miniaturization.',
        stat: '−60.6% Hair Shedding'
      },
      {
        target: 'Cuticular F-Layer Reconstruction',
        compound: 'Prunus Amygdalus Dulcis & Gossypium Herbaceum Oils',
        mechanism: 'Biomimetic Fatty Acid Bilayer Integration',
        outcome: 'Deeply nourishes dry hair fibers, seals split ends, and eliminates static flyaways without heavy silicone occlusions.',
        stat: '+88% Cuticle Alignment'
      },
      {
        target: 'Cortical Reinforcement',
        compound: 'Native Fish Tropocollagen & Hydrolyzed Keratin',
        mechanism: 'Peptide Hydrogen Bonding to Damaged Cortical Chains',
        outcome: 'Restores tensile elasticity to mechanically and chemically stressed hair fibers, reducing breakage.',
        stat: '+24% Fiber Strength'
      },
      {
        target: 'Friction Reduction & Detangling',
        compound: 'Hydrafeel® 3 & Cetrimonium Cationic Matrix',
        mechanism: 'Electrostatic Charge Neutralization',
        outcome: 'Smooths the hair fiber surface, allowing effortless wet and dry combing without snapping weakened hair.',
        stat: '−47% Combing Force'
      }
    ],
    ingredients: [
      {
        inci_name: 'Aqua',
        common_name: 'Purified Water',
        function: ['Solvent', 'Carrier'],
        inci_group: 'base',
        concentration_range: '65–75%',
        origin: 'Demineralised Base',
        role: 'Purified carrier base adjusted to acidic pH 4.5 for cuticle scale contraction.'
      },
      {
        inci_name: 'Cetearyl Alcohol',
        common_name: 'Fatty Alcohol Conditioning Base',
        function: ['Emulsion Base', 'Cuticle Softener'],
        inci_group: 'conditioning',
        concentration_range: '4–8%',
        origin: 'Vegetable (Coconut / Palm)',
        role: 'Natural vegetable fatty alcohol providing rich creamy slip and softening coarse hair.'
      },
      {
        inci_name: 'Glycerin',
        common_name: 'Vegetable Glycerol',
        function: ['Humectant'],
        inci_group: 'conditioning',
        concentration_range: '3–5%',
        origin: 'Plant Vegetable',
        role: 'Binds moisture inside the hair fiber cortex.'
      },
      {
        inci_name: 'Prunus Amygdalus Dulcis Oil',
        common_name: 'Sweet Almond Oil',
        function: ['Cuticle Sealer', 'Nutritive Lipid'],
        inci_group: 'key_active',
        concentration_range: '2–4%',
        origin: 'Prunus Amygdalus Dulcis Kernels',
        role: 'Rich in oleic acid and vitamins A, B, and E, restoring the cuticular lipid sheath.'
      },
      {
        inci_name: 'Gossypium Herbaceum Seed Oil',
        common_name: 'Cottonseed Oil',
        function: ['High-Porosity Hair Restorer', 'Anti-Breakage Lipid'],
        inci_group: 'key_active',
        concentration_range: '1–3%',
        origin: 'Gossypium Herbaceum Seeds',
        role: 'Contains exceptionally high concentrations of polyunsaturated fatty acids, rebuilding cuticle flexibility.'
      },
      {
        inci_name: 'Behentrimonium Chloride',
        common_name: 'Plant-Derived Cationic Conditioning Agent',
        function: ['Detangler', 'Anti-Static Agent'],
        inci_group: 'conditioning',
        concentration_range: '1–2%',
        origin: 'Brassica Rapa (Rapeseed Oil)',
        role: 'Potent antistatic conditioner derived from rapeseed oil. Smooths hair cuticle scales without greasy buildup.'
      },
      {
        inci_name: 'Propanediol',
        common_name: 'Bio-Based Glycol Carrier',
        function: ['Humectant', 'Bioactive Transporter'],
        inci_group: 'conditioning',
        concentration_range: '1–2%',
        origin: 'Corn Sugar Fermentation',
        role: 'Enhances trans-follicular absorption of Baicapil botanicals.'
      },
      {
        inci_name: 'Cetrimonium Chloride',
        common_name: 'Cationic Cuticle Sealer',
        function: ['Detangling', 'Cuticle Smoothing'],
        inci_group: 'conditioning',
        concentration_range: '0.5–1%',
        origin: 'Cationic Quat',
        role: 'Eliminates static flyaways and delivers instant slip during wet combing.'
      },
      {
        inci_name: 'Scutellaria Baicalensis Root Extract',
        common_name: 'Baikal Skullcap (Baicapil™ Active)',
        function: ['Stem Cell Activator', 'Anti-Hair Loss'],
        inci_group: 'key_active',
        concentration_range: 'Part of 2.0% Baicapil™',
        origin: 'Scutellaria Baicalensis Roots',
        pmid: '24898518',
        role: 'Stimulates quiescent hair follicle stem cells in the scalp bulge niche to trigger anagen renewal.'
      },
      {
        inci_name: 'Triticum Vulgare Germ Extract & Glycine Soja Germ Extract',
        common_name: 'Wheat & Soy Sprout Complexes (Baicapil™)',
        function: ['Follicular Energy Booster', 'Mitochondrial Activator'],
        inci_group: 'key_active',
        concentration_range: 'Part of 2.0% Baicapil™',
        origin: 'Germinated Plant Sprouts',
        role: 'Supplies cellular nutrients and signals that sustain hair follicle metabolic vigor.'
      },
      {
        inci_name: 'Phyllanthus Emblica Fruit Extract',
        common_name: 'Amla Fruit Extract (Kerascalp™)',
        function: ['Collagen XVII Booster', 'Follicular Anchoring'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Phyllanthus Emblica Fruit',
        pmid: '32049927',
        role: 'Rejuvenates follicular anchorage and prevents premature follicle miniaturization.'
      },
      {
        inci_name: 'Equisetum Arvense Extract',
        common_name: 'Field Horsetail Bio-Silica',
        function: ['Keratin Cross-Linking', 'Tensile Strength'],
        inci_group: 'key_active',
        concentration_range: '1–2%',
        origin: 'Equisetum Arvense',
        role: 'Supplies natural bioavailable silicon to repair micro-fractures in the hair cortex.'
      },
      {
        inci_name: 'Collagen',
        common_name: 'Native Freshwater Tropocollagen',
        function: ['Triple Helix Reinforcer', 'Tensile Restorer'],
        inci_group: 'key_active',
        concentration_range: '0.8–1.5%',
        origin: 'Freshwater Fish Skin (Hypophthalmichthys molitrix)',
        pmid: '36585145',
        role: 'Native fish collagen triple-helix molecules that form an elastic reinforcing shield over damaged hair fibers.'
      },
      {
        inci_name: 'Polyglyceryl-3 PCA',
        common_name: 'Hydrafeel® 3',
        function: ['18-MEA Lipid Layer Restorer', 'Color Shield'],
        inci_group: 'key_active',
        concentration_range: '0.5–1.0%',
        origin: 'Vegetable PCA Ester',
        role: 'Reconstructs the lipid F-layer, locking moisture inside the cortex and cutting combing resistance by 47%.'
      },
      {
        inci_name: 'Panthenol',
        common_name: 'Pro-Vitamin B5',
        function: ['Cortical Hydrator'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Bio-Conversion',
        role: 'Deeply penetrates the hair shaft, swelling it and increasing tensile strength.'
      },
      {
        inci_name: 'Hydrolyzed Wheat Protein & Hydrolyzed Keratin',
        common_name: 'Amino Acid Micro-Protein Matrix',
        function: ['Micro-Damage Filler', 'Cortical Repair'],
        inci_group: 'functional_active',
        concentration_range: '0.5–1.0%',
        origin: 'Vegetable Wheat + Keratin',
        role: 'Fills cuticle gaps caused by heat styling, brushing, and environmental bleaching.'
      },
      {
        inci_name: 'Arginine & Lactic Acid',
        common_name: 'L-Arginine + Acid Neutralizer',
        function: ['Microvascular Flow', 'pH 4.5 Buffer'],
        inci_group: 'functional_active',
        concentration_range: '0.4–0.8%',
        origin: 'Natural Fermentation',
        role: 'Locks cuticle scales flat and stimulates perifollicular blood supply.'
      },
      {
        inci_name: 'Gluconolactone & Calcium Gluconate',
        common_name: 'PHA Mineral Preservative Booster',
        function: ['Hard Water Chelator'],
        inci_group: 'functional',
        concentration_range: '0.3–0.6%',
        origin: 'Bio-Fermentation',
        role: 'Prevents mineral buildup from tap water, keeping hair light and responsive.'
      },
      {
        inci_name: 'Sodium Benzoate & Potassium Sorbate',
        common_name: 'Food-Grade Preservation Complex',
        function: ['Broad-Spectrum Preservative'],
        inci_group: 'functional',
        concentration_range: '0.5–0.7%',
        origin: 'Nature-Identical Organic Salts',
        role: 'Protects emulsion purity.'
      },
      {
        inci_name: 'Parfum',
        common_name: 'Hypoallergenic Fragrance',
        function: ['Fragrance'],
        inci_group: 'functional',
        concentration_range: '<0.2%',
        origin: 'Clean European Fragrance',
        role: 'Elegant hair spa scent.'
      }
    ]
  }
};

/**
 * Authoritative Clinical Safety, Contraindications & Usage Protocols
 * for all 8 Colway formulations.
 * Strictly differentiated per product category (Lip Balm vs Shampoo vs Dietary Supplement vs Facial Peeling).
 */
export const COLWAY_SAFETY_REGISTRY = {
  'colway-collagen-lip-care': {
    categoryBadge: 'LABIAL SAFETY & PRECAUTIONS',
    title: 'Labial Mucosal Safety, Thermal Care & Tolerance Guide',
    warnings: [
      'For external labial and perioral use only. Do not ingest in excessive quantities.',
      'Thermal stability safeguard: Store in a cool, dry environment (15°C – 25°C). Protect from direct solar radiation, vehicle dashboards, and pocket heat sources to prevent melting of the natural botanical lipid and wax matrix.',
      'In the presence of infectious angular cheilitis, bacterial superinfection, or active herpes simplex vesicular lesions, consult a physician or dermatologist prior to topical application.',
      'Post-aesthetic procedures: Safe for mucosal barrier hydration following dermal lip fillers or perioral microneedling after full re-epithelialization (minimum 24 hours post-procedure).',
      'Discontinue use if persistent perioral erythema, edema, or signs of allergic contact cheilitis develop.',
      'Keep out of reach of young children under 3 years.'
    ],
    protocolTitle: 'LABIAL TOLERANCE & BARRIER COMPRESS PROTOCOL',
    protocolSteps: [
      'Initial application: Apply a small test amount to the vermilion border or inner wrist 24h prior to intensive use in atopic individuals.',
      'Daily protective barrier: Glide smoothly over clean, dry lips 2–4 times daily, especially before sun, wind, or dry AC exposure.',
      'Nocturnal lip compress: Apply a generous layer before sleep to serve as a restorative occlusive matrix during nocturnal cellular turnover.',
      'Non-comedogenic formulation: Safe for surrounding perioral cutaneous zones without risk of follicular comedone formation.'
    ],
    disclaimer: 'Professional-grade cosmeceutical for labial mucosal barrier defense. Not a medicinal drug. Certified under EU Cosmetic Regulation (EC) 1223/2009 and dermatologically evaluated for sensitive perioral tissue.'
  },
  'colway-colvita': {
    categoryBadge: 'SYSTEMIC SAFETY & CONTRAINDICATIONS',
    title: 'Clinical Safety, Dietary Contraindications & Oral Dosing Protocol',
    warnings: [
      'Food supplement for adult oral administration only. Do not exceed the recommended daily portion of 2 capsules daily.',
      'Do not use as a substitute for a varied, balanced diet and a healthy, active lifestyle.',
      'Allergen warning: Contains freeze-dried marine fish collagen and Baltic marine algae (Fucus vesiculosus). Strictly contraindicated in individuals with known hypersensitivity or allergy to fish, crustacea, seafood, or iodine.',
      'Thyroid disorders precaution: Due to natural iodine content in Fucus vesiculosus algae, patients with hyperthyroidism, Graves\' disease, Hashimoto\'s thyroiditis, or undergoing thyroid medication should consult an endocrinologist prior to use.',
      'Pregnancy & lactation: Pregnant or breastfeeding women should seek medical clearance before commencing supplementation.',
      'Storage: Store in a cool, dry place (<25°C) in the original packaging, protected from moisture and direct sunlight. Keep out of reach of children.'
    ],
    protocolTitle: 'ORAL BIOAVAILABILITY & SYNERGISTIC ABSORPTION PROTOCOL',
    protocolSteps: [
      'Dosage: Take 2 capsules daily, preferably 1 capsule in the morning and 1 in the evening during or immediately following meals.',
      'Fluid intake: Swallow whole with a minimum of 200–250 mL of room-temperature water or natural non-carbonated juice.',
      'Lipophilic synergy: Natural Vitamin E (D-alpha-tocopheryl acetate) absorption is maximized when ingested alongside healthy dietary lipids.',
      'Chronobiology: A sustained 90–120 day protocol is clinically advised to synchronize with the human fibroblast neocollagenesis cycle.'
    ],
    disclaimer: 'Nutritional food supplement manufactured in Poland under ISO 22716 GMP and EU Food Safety Authority regulations. Not intended to diagnose, treat, cure, or prevent any systemic medical disease.'
  },
  'colway-collagen-wash-gel': {
    categoryBadge: 'CUTANEOUS & OCULAR SAFETY',
    title: 'Cellular Cleansing Safety, Physiological pH 5.5 & Ocular Tolerance',
    warnings: [
      'For external cutaneous cleansing only. Clinically suitable for face, neck, décolleté, and delicate periocular skin.',
      'Ophthalmologically and dermatologically tested: Ultra-mild non-ionic formulation. In case of accidental direct eye splash with concentrated gel, rinse thoroughly with clean running water.',
      'Do not apply over bleeding wounds, open ulcerative lesions, or acute weeping eczema without prior dermatological consultation.',
      'Temperature conservation: Store between 15°C and 25°C. Strictly protect from freezing (<0°C) and excessive heat (>30°C) to preserve native collagen triple-helix bioactivity.',
      'Hypoallergenic standard: 100% free from harsh sodium lauryl/laureth sulfates (SLS/SLES), synthetic colorants, and aggressive preservatives.',
      'Keep out of reach of children under 3 years.'
    ],
    protocolTitle: 'PHYSIOLOGICAL CLEANSING & PRE-TREATMENT PROTOCOL',
    protocolSteps: [
      'Dermal wetting: Pre-dampen face and neck with lukewarm water (32°C – 35°C). Avoid hot water to preserve intercellular lipid cement.',
      'Emulsification: Dispense 1–2 pumps (approx. 1.5 mL) onto clean palms. Rub hands to activate the micro-lather emulsion.',
      'Gentle cleansing: Distribute in gentle circular motions for 45–60 seconds, paying attention to T-zone and eye contour.',
      'Rinse & pat dry: Rinse thoroughly with cool water and gently pat dry with a clean towel; leave skin slightly damp before applying native tropocollagen.'
    ],
    disclaimer: 'Professional dermatological cleansing gel formulated at physiological skin pH 5.5. CPNP registered under EU Regulation (EC) 1223/2009 for all skin types including reactive, sensitive, and couperose-prone dermis.'
  },
  'colway-blue-diamond-peeling': {
    categoryBadge: 'EXFOLIATION SAFETY & PRECAUTIONS',
    title: 'Enzymatic & Mechanical Safety, Barrier Precautions & Patch Testing',
    warnings: [
      'For external facial and cutaneous exfoliation only. Strictly avoid direct contact with conjunctiva, orbital eye socket, and mucous membranes.',
      'Contraindications: Do not use on active inflammatory acne (papulopustular lesions), open cuts, sunburned skin, active rosacea flare-ups, or within 7 days of clinical chemical peels or ablative laser treatments.',
      'Do not combine on the same day with prescription topical tretinoin, adapalene, high-concentration AHA/BHA peels, or harsh abrasive pads.',
      'Photoprotection safeguard: Stratum corneum renewal temporarily increases UV susceptibility. Daily broad-spectrum SPF 50+ is mandatory following treatment.',
      'Perform a 24-hour patch test on the inner forearm prior to first use in patients with sensitive, reactive, or thin couperose skin.',
      'Discontinue immediately if intense stinging, persistent erythema, or edema develops.'
    ],
    protocolTitle: 'DUAL-ACTION MICRODERMABRASION PROTOCOL',
    protocolSteps: [
      'Frequency: Apply 1× weekly for normal/mature skin; 1× every 10–14 days for thin, fragile, or couperose-prone dermis.',
      'Mechanical phase: Apply a thin layer to clean, damp skin. Perform ultra-light circular micro-massage for 1–2 minutes; let volcanic diamond dust glide without pressing.',
      'Enzymatic phase: Leave on skin untouched for 3–5 minutes. Subtilisin enzymes biologically digest dead corneocyte desmosomes.',
      'Neutralization: Rinse thoroughly with cool to lukewarm water. Follow immediately with native bioactive collagen or soothing barrier moisturizer.'
    ],
    disclaimer: 'Advanced mechanical and enzymatic micro-peeling cosmeceutical complying with EU Regulation 1223/2009. Dermatologically tested. Not recommended for broken skin or acute dermatoses.'
  },
  'colway-collagen-vege': {
    categoryBadge: 'PHYTO-COLLAGEN SAFETY',
    title: 'Botanical Safety, Osmotic Absorption & Cutaneous Tolerance',
    warnings: [
      'For external cutaneous application only. Avoid direct eye contact; in case of contact, rinse thoroughly with fresh water.',
      '100% vegan formulation: Free from animal derivatives. Contains Chlorella vulgaris micro-algae, young coconut water, and botanical amino acid aminograms.',
      'Individuals with documented severe botanical or tree nut / coconut hypersensitivity should perform a 24h forearm patch test prior to facial use.',
      'Do not apply directly onto actively bleeding wounds, infected dermatitis, or acute bacterial skin infections.',
      'Storage: Store at controlled room temperature (15°C – 25°C). Unlike animal-derived tropocollagen, botanical aminogram matrices do not require strict sub-26°C refrigeration.',
      'Keep container tightly sealed and out of direct sunlight.'
    ],
    protocolTitle: 'PHYTO-AMINO OSMOTIC PENETRATION PROTOCOL',
    protocolSteps: [
      'Substrate preparation: Thoroughly cleanse face with Collagen Wash Gel. Skin MUST remain slightly damp with cellular mist or thermal water.',
      'Dispensing: Pump 1–2 doses onto fingertips. Rapidly pat into face, neck, and décolleté along Langer\'s tension lines.',
      'Osmotic diffusion: Allow 3–5 minutes for the plant polypeptide matrix to fully penetrate before layering creams or makeup.',
      'Biorhythm: Optimal for twice-daily application (morning barrier shield and nocturnal cellular repair).'
    ],
    disclaimer: 'Clean-label 100% vegan bio-fermented cosmeceutical registered under EU Regulation (EC) 1223/2009. Hypoallergenic, non-comedogenic, and clinically tested across sensitive phototypes.'
  },
  'colway-strengthening-shampoo': {
    categoryBadge: 'TRICHOLOGICAL SCALP SAFETY',
    title: 'Scalp Safety, Follicular Dwell Precautions & Patch Testing',
    warnings: [
      'For external topical scalp and hair cleansing only. Avoid contact with eyes; rinse immediately with copious water if contact occurs.',
      'Do not apply onto scalps with open bleeding lesions, acute exudative dermatitis, or infected scalp psoriasis plaques without prior dermatological consultation.',
      'Active botanical concentration: Contains Baicapil™ (Scutellaria baicalensis, soy & wheat sprouts), Caffeine, and Zinc PCA. Individuals with known sensitivity should perform an epicutaneous patch test.',
      'Keep out of reach of young children under 3 years.',
      'Discontinue use if persistent scalp erythema, burning sensation, or contact dermatitis develops.',
      'Store in a cool, dry place away from direct sunlight.'
    ],
    protocolTitle: 'CLINICAL TRICHOLOGY DWELL & FOLLICULAR MASSAGE PROTOCOL',
    protocolSteps: [
      'Preparation: Thoroughly saturate hair and scalp with lukewarm water (36°C – 38°C) for 60 seconds to open follicular ostia.',
      'Targeted application: Dispense 5–10 mL into palms, emulsify, and apply directly to the scalp crown and thinning areas first.',
      'Essential follicular dwell: Leave lather on the scalp for 3–5 minutes without rinsing. This contact window allows Caffeine and Baicalin absorption into the hair bulb.',
      'Rinse: Rinse thoroughly with lukewarm water (≤38°C). Follow with Colway Strengthening Conditioner applied strictly to hair fiber lengths.'
    ],
    disclaimer: 'Professional trichological cosmeceutical registered under EU Cosmetic Regulation (EC) 1223/2009. Clinically tested for androgenetic alopecia, telogen effluvium, and postpartum scalp rehabilitation.'
  },
  'colway-strengthening-conditioner': {
    categoryBadge: 'HAIR FIBER & CUTICLE SAFETY',
    title: 'Hair Fiber Safety, Scalp Root Precautions & Cuticle Sealing Protocol',
    warnings: [
      'For external topical hair fiber conditioning only. Formulated specifically for hair shafts, mid-lengths, and ends.',
      'Scalp precaution: Avoid heavy mass application directly onto the scalp roots and follicular openings to prevent sebum accumulation or pore occlusion.',
      'Avoid contact with eyes; in case of accidental eye contact, rinse thoroughly with fresh running water.',
      'Safe for color-treated, chemically straightened, or keratin-treated hair: Free from harsh salts, parabens, and stripping sulfates.',
      'Keep out of reach of children. Store between 15°C and 25°C away from heat sources.',
      'Discontinue use if allergic contact sensitivity develops.'
    ],
    protocolTitle: 'HAIR FIBER LIPID SEALING PROTOCOL',
    protocolSteps: [
      'Post-wash preparation: After rinsing Colway Strengthening Shampoo, gently squeeze excess water from hair with a microfiber towel.',
      'Fiber application: Dispense 5–8 mL into palms. Distribute evenly strictly from mid-lengths down to tips using fingers or a wide-tooth comb.',
      'Contact duration: Leave on for 2–3 minutes to allow Kerascalp™ amla extract and argan triglycerides to neutralize negative electrostatic charges.',
      'Cool rinse: Rinse thoroughly with cool water (approx. 25°C – 28°C) to lock in active conditioning lipids and seal cuticle scales.'
    ],
    disclaimer: 'Professional trichological hair fiber conditioner registered under EU Regulation (EC) 1223/2009. Dermatologically evaluated for brittle, damaged, thinning, and chemically processed hair.'
  },
  'colway-blue-diamond-cream': {
    categoryBadge: 'CELLULAR DERMAL SAFETY',
    title: 'Epigenetic Dermal Safety, Vascular Tolerance & Patch Testing',
    warnings: [
      'For external topical facial, neck, and décolleté application only. Avoid direct contact with ocular conjunctiva.',
      'Perform a 48-hour patch test on the inner forearm prior to first application in patients with ultra-reactive, atopic, or active couperose skin.',
      'Do not apply to open wounds, infected acne pustules, or acute weeping cutaneous eczema.',
      'High active concentration: Contains Matrigenics 14G, recombinant FGF-1, and Superox-C™ (Kakadu Plum). A transient tingling sensation may occur upon initial use as microcirculation activates.',
      'Storage: Store at controlled room temperature (15°C – 25°C) in a dry place. Protect from extreme heat and direct UV radiation.',
      'Keep jar tightly closed with protective seal in place. Keep out of reach of young children.'
    ],
    protocolTitle: 'EPIGENETIC MATRIX APPLICATION PROTOCOL',
    protocolSteps: [
      'Preparation: Apply to thoroughly cleansed, toned skin (ideally pre-hydrated with native tropocollagen gel for peptide synergy).',
      'Thermal liquefaction: Dispense a pea-sized amount (approx. 0.5 mL); warm between fingertips for 3 seconds to melt the lamellar ceramide base.',
      'Lymphatic press: Press gently into facial skin using upward strokes along the jawline, cheekbones, and forehead without aggressive pulling.',
      'Chronobiology: Apply morning (as an environmental soft-blur shield) and evening (for nocturnal FGF-1 genomic rejuvenation).'
    ],
    disclaimer: 'Advanced cellular epigenetic cosmeceutical registered under EU Cosmetics Regulation (EC) 1223/2009. Dermatologically evaluated for mature, perimenopausal, and photoaged facial dermis.'
  }
};

/**
 * Resolves the canonical key for any Colway product identifier or slug.
 */
function resolveColwayCanonicalKey(slug = '') {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  if (COLWAY_PRODUCTS_INCI_REGISTRY[clean]) return clean;
  if (clean.includes('peeling') || clean.includes('scrub')) return 'colway-blue-diamond-peeling';
  if (clean.includes('cream') || clean.includes('krem') || clean.includes('blue-diamond') || clean.includes('diament')) return 'colway-blue-diamond-cream';
  if (clean.includes('vege') || clean.includes('phyto')) return 'colway-collagen-vege';
  if (clean.includes('colvita')) return 'colway-colvita';
  if (clean.includes('lip') || clean.includes('pomadka') || clean.includes('labial') || clean.includes('usta')) return 'colway-collagen-lip-care';
  if (clean.includes('wash') || clean.includes('cleanser') || clean.includes('mycia') || clean.includes('zel') || clean.includes('żel')) return 'colway-collagen-wash-gel';
  if (clean.includes('shampoo') || clean.includes('szampon')) return 'colway-strengthening-shampoo';
  if (clean.includes('conditioner') || clean.includes('odzywka') || clean.includes('odżywka')) return 'colway-strengthening-conditioner';
  return null;
}

/**
 * Returns tailored clinical safety data for any Colway product slug.
 * @param {string} slug
 * @returns {object|null}
 */
export function getColwayProductSafety(slug = '') {
  const key = resolveColwayCanonicalKey(slug);
  return key ? COLWAY_SAFETY_REGISTRY[key] : null;
}

/**
 * Returns complete Colway INCI and active ingredients data for any product slug.
 * Handles canonical slugs, short slugs, and common alias variations.
 * 
 * @param {string} slug 
 * @returns {object|null}
 */
export function getColwayProductData(slug = '') {
  if (!slug) return null;
  const key = resolveColwayCanonicalKey(slug);
  if (key && COLWAY_PRODUCTS_INCI_REGISTRY[key]) {
    const data = { ...COLWAY_PRODUCTS_INCI_REGISTRY[key] };
    data.safety_precautions = COLWAY_SAFETY_REGISTRY[key] || null;
    return data;
  }
  return null;
}
