/* eslint-disable react-hooks/set-state-in-effect, no-undef, no-unused-vars */
import fs from 'fs';
import path from 'path';

const filePath = '/Users/joseluiszabala/Documents/Antigravity/regenpept-web/functions/src/http/ai.js';
let content = fs.readFileSync(filePath, 'utf8');

// The replacement template
const replacement = `      if (isMuscleGoal || isFatGoal || isCognitiveGoal || isLongevityGoal || isHormonalGoal || isSkinGoal || isImmuneGoal) {
        let reply = "";
        let suggestions = [];
        
        if (isMuscleGoal) {
          reply = [
            \`# 🏃 Clinical Pathway: Muscle Growth & Recovery\`,
            \`This biological pathway focuses on accelerating protein synthesis, promoting localized angiogenesis, and modulating inflammatory cascades to optimize tissue regeneration and hypertrophy.\`,
            "",
            \`**GOAL:** Accelerate tissue repair, increase skeletal muscle protein synthesis, and optimize recovery cycles.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **BPC-157:** Promotes tendon, ligament, and muscle tissue healing by upregulating VEGFR expression.\`,
            \`- **TB-500:** Upregulates cellular migration and systemic tissue repair via G-actin sequestering.\`,
            \`- **Ipamorelin & CJC-1295:** Synergistic growth hormone secretagogues promoting endogenous GH release for cellular repair.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **Tissue Restoration Protocol:** Combined evaluation of BPC-157 (250mcg BID) and TB-500 (2.5mg twice weekly).\`,
            \`- **Growth Secretagogue Protocol:** Combined administration of Ipamorelin and CJC-1295 (No DAC) targeting deep sleep recovery phase.\`,
            "",
            \`**SUPPLEMENTS:**\`,
            \`- **Creatine Monohydrate:** Increases intracellular phosphocreatine pools to accelerate ATP replenishment.\`,
            \`- **L-Carnitine L-Tartrato:** Enhances androgen receptor density and mitigates exercise-induced muscle damage.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: BPC-157 VEGFR Pathway", action: "MESSAGE", payload: "Tell me more about how BPC-157 promotes VEGFR receptor activation and cellular migration." },
            { label: "🔬 Deep-Dive: Secretagogue Synergy", action: "MESSAGE", payload: "Can you explain the synergistic growth hormone release mechanism of CJC-1295 and Ipamorelin?" },
            { label: "🧮 Reconstitute BPC-157", action: "MESSAGE", payload: "How do I reconstitute a 5mg vial of BPC-157?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }
        else if (isFatGoal) {
          reply = [
            \`# ⚡ Clinical Pathway: Fat Loss & Metabolic Health\`,
            \`This pathway focuses on insulin sensitivity, appetite signaling networks, and cell-level lipolysis to optimize adipose tissue mobilization and mitochondrial efficiency.\`,
            "",
            \`**GOAL:** Enhance lipolysis, optimize glycemic control, regulate appetite networks, and support thyroid & mitochondrial health.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **Retatrutide / Tirzepatide / Semaglutide:** Multi-receptor agonists (GLP-1/GIP/Glucagon) regulating glycemic control and satiety cascades.\`,
            \`- **AOD-9604:** Growth Hormone C-terminal lipolytic fragment stimulating cellular lipid breakdown without elevation of blood glucose.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **Metabolic Optimization Protocol:** Evaluation of receptor signaling dynamics using low-dose GLP-1 agonist pathways.\`,
            \`- **Targeted Lipolysis Protocol:** Dedicated schedule for AOD-9604 evaluation in focused adipose mobilization models.\`,
            "",
            \`**SUPPLEMENTS:**\`,
            \`- **Berberine HCL:** Activates AMPK molecular pathways to improve peripheral glucose disposal.\`,
            \`- **Green Tea Extract (EGCG):** Enhances basal thermogenesis and stimulates fatty acid oxidation.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: GLP-1/GIP Mechanism", action: "MESSAGE", payload: "Explain the metabolic mechanisms of GLP-1, GIP, and Glucagon receptor pathways for fat loss." },
            { label: "🔬 Deep-Dive: AOD-9604 Fragment", action: "MESSAGE", payload: "Tell me about AOD-9604 lipolysis fragment and why it does not affect insulin levels." },
            { label: "🧮 Reconstitute AOD-9604", action: "MESSAGE", payload: "How do I reconstitute a 2mg vial of AOD-9604?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }
        else if (isCognitiveGoal) {
          reply = [
            \`# 🧠 Clinical Pathway: Cognitive Performance & Focus\`,
            \`This pathway targets synaptic plasticity, neurotransmitter balance, and brain-derived neurotrophic factor (BDNF) pathways to support executive focus, memory encoding, and cellular brain health.\`,
            "",
            \`**GOAL:** Optimize neurogenesis, enhance synaptic plasticity, balance neurotransmitters, and support cognitive stamina.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **Semax:** Synthetic neuroactive peptide regulating melanocortin receptors and stimulating BDNF/NGF synthesis.\`,
            \`- **Selank:** Tuftsin analog modulating GABAergic pathways to reduce research-model anxiety metrics without sedation.\`,
            \`- **Epitalon:** Pineal gland ultra-short peptide studied for neural cellular protection and circadian rhythm balance.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **Neuro-Focus Protocol:** Structured evaluation of Semax for acute neurotrophic support.\`,
            \`- **Synaptic Clarity Stack:** Co-administration models of Semax and Selank to achieve focused attention with optimized stress resilience.\`,
            "",
            \`**SUPPLEMENTS:**\`,
            \`- **Alpha-GPC:** High-availability acetylcholine precursor supporting cognitive speed and memory pathways.\`,
            \`- **Lion's Mane Mushroom:** Functional nootropic promoting endogenous Nerve Growth Factor (NGF) synthesis.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: Semax & BDNF", action: "MESSAGE", payload: "Tell me more about Semax and how it modulates BDNF and NGF expression in brain cells." },
            { label: "🔬 Deep-Dive: Selank GABA Pathway", action: "MESSAGE", payload: "How does Selank regulate GABA activity to promote calmness without sedation?" },
            { label: "🧮 Reconstitute Semax", action: "MESSAGE", payload: "How do I reconstitute a 10mg vial of Semax?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }
        else if (isLongevityGoal) {
          reply = [
            \`# 🧬 Clinical Pathway: Longevity & Biological Repair\`,
            \`This pathway addresses telomerase activity, DNA repair mechanisms, cellular autophagy, and mitochondrial NAD+ maintenance to mitigate markers of cellular senescence.\`,
            "",
            \`**GOAL:** Stimulate telomerase activity, repair DNA, promote cellular autophagy, and protect mitochondrial integrity.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **Epitalon:** Stimulates telomerase enzyme activity to restore cellular telomere length in research models.\`,
            \`- **GHK-Cu:** Copper tripeptide regulating global gene expression to upregulate extracellular matrix remodeling.\`,
            \`- **MOTS-c:** Mitochondrial-derived peptide regulating cellular metabolic homeostasis and exercise mimetic cascades.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **Cellular Rejuvenation Protocol:** Cyclical evaluation of Epitalon targeted at DNA defense.\`,
            \`- **Mitochondrial Revitalization Stack:** Synergistic co-administration of MOTS-c and cellular NAD+ precursors.\`,
            "",
            \`**SUPPLEMENTS:**\`,
            \`- **NMN (Nicotinamide Mononucleotide):** Premium NAD+ precursor supporting sirtuin pathway activation.\`,
            \`- **Coenzyme Q10 (Ubiquinol):** Essential antioxidant cofactor for cellular ATP generation.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: Epitalon & Telomeres", action: "MESSAGE", payload: "How does Epitalon stimulate the telomerase enzyme to restore telomere length?" },
            { label: "🔬 Deep-Dive: MOTS-c & Mitochondria", action: "MESSAGE", payload: "Explain how MOTS-c regulates metabolic homeostasis and supports cellular mitochondrial health." },
            { label: "🧮 Reconstitute Epitalon", action: "MESSAGE", payload: "How do I reconstitute a 10mg vial of Epitalon?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }
        else if (isHormonalGoal) {
          reply = [
            \`# ⚖️ Clinical Pathway: Hormonal Vitality & Balance\`,
            \`This pathway targets endocrine signaling dynamics, physiological Growth Hormone (GH) pulse amplification, and hypothalamic-pituitary axis homeostasis.\`,
            "",
            \`**GOAL:** Support natural growth hormone secretion, optimize thyroid & endocrine health, and regulate metabolic vitality.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **Ipamorelin:** Highly selective ghrelin receptor agonist elevating GH pulsatility without disrupting cortisol or prolactin levels.\`,
            \`- **CJC-1295 DAC:** Long half-life GHRH analog evaluated for steady, baseline elevation of systemic IGF-1 levels.\`,
            \`- **Kisspeptin-10:** Master hypothalamic hormone trigger studied for endogenous gonadotropin (LH/FSH) pulsatility regulation.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **IGF-1 Modulation Protocol:** Evaluative models of synergistic Ipamorelin and CJC-1295 co-administration.\`,
            \`- **HPG Axis Regulation Protocol:** Targeted Kisspeptin-10 schedule exploring luteinizing hormone trigger mechanics.\`,
            "",
            \`**SUPPLEMENTS:**\`,
            \`- **Ashwagandha KSM-66:** Clinical adaptogen reducing cortisol and promoting healthy testosterone-to-cortisol ratios.\`,
            \`- **Zinc & Magnesium (ZMA):** Key mineral cofactors supporting steroid hormone production pathways.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: Ipamorelin & GH", action: "MESSAGE", payload: "Explain how Ipamorelin stimulates GH release safely without elevating cortisol or prolactin." },
            { label: "🔬 Deep-Dive: CJC-1295 DAC vs No DAC", action: "MESSAGE", payload: "What is the difference between CJC-1295 with DAC and CJC-1295 without DAC?" },
            { label: "🧮 Reconstitute CJC-1295", action: "MESSAGE", payload: "How do I reconstitute a 2mg vial of CJC-1295?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }
        else if (isSkinGoal) {
          reply = [
            \`# 🧬 Clinical Pathway: Skin, Hair & Cellular Health\`,
            \`This pathway targets collagen gene transcription, extracellular matrix (ECM) structural components, and epidermal barrier defense to optimize skin remodeling and hair follicle health.\`,
            "",
            \`**GOAL:** Stimulate collagen synthesis, repair the extracellular matrix, protect dermal cells, and activate follicle cycles.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **GHK-Cu (Copper Peptide):** Master extracellular matrix repair signal, stimulating collagen, elastin, and glycosaminoglycan synthesis.\`,
            \`- **TB-500:** Cellular actin-migration trigger studied for hair follicle activation and localized micro-circulation.\`,
            \`- **Epitalon:** Senescence mitigation regulator protecting dermal cells against oxidative damage.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **Extracellular Matrix Restoration Protocol:** Focused GHK-Cu evaluation scheduling for tissue repair and dermal density.\`,
            \`- **Dermal Renewal Stack:** Combined evaluation of GHK-Cu and localized cellular protection peptides.\`,
            "",
            `**SUPPLEMENTS:**`,
            \`- **Hydrolyzed Collagen Peptides:** Supplies bioactive amino acid blocks (glycine-proline-hydroxyproline) for fiber construction.\`,
            \`- **Biotin & Hyaluronic Acid:** Essential cofactors for keratin matrix integrity and tissue water retention.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: GHK-Cu DNA Repair", action: "MESSAGE", payload: "Explain how GHK-Cu copper peptide regulates DNA gene expression to restore collagen synthesis." },
            { label: "🔬 Deep-Dive: TB-500 Hair Follicles", action: "MESSAGE", payload: "Tell me about TB-500 and how actin sequestering stimulates hair follicle cell migration." },
            { label: "🧮 Reconstitute GHK-Cu", action: "MESSAGE", payload: "How do I reconstitute a 50mg vial of GHK-Cu?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }
        else if (isImmuneGoal) {
          reply = [
            \`# 🛡️ Clinical Pathway: Immune Function & Defense\`,
            \`This pathway regulates T-cell differentiation, modulates cytokine transcription cascades, and supports physical mucosal barrier integrity.\`,
            "",
            \`**GOAL:** Upregulate immune responsiveness, support mucosal barriers, regulate cytokine cascades, and optimize host defense.\`,
            "",
            \`**COMPOUNDS:**\`,
            \`- **Thymosin Alpha-1 (TA1):** Potent immunomodulator studied for its ability to regulate adaptive helper T-cell maturation and innate immune coordination.\`,
            \`- **BPC-157:** Promotes cell-level cytoprotection and stabilizes mucosal immunological homeostasis.\`,
            \`- **LL-37:** Cathelicidin-derived host defense peptide investigated for broad-spectrum antimicrobial and tissue-remodeling cascades.\`,
            "",
            \`**PROTOCOL:**\`,
            \`- **Host Resilience Protocol:** Upregulating immune responsiveness, support mucosal barriers, regulate cytokine cascades, and optimize host defense.\`,
            \`- **Mucosal Homeostasis Stack:** Synergistic co-evaluation of BPC-157 and Thymosin Alpha-1 in gut barrier defense models.\`,
            "",
            \`**SUPPLEMENTS:**\`,
            \`- **Vitamin D3 + K2:** Essential systemic hormone complex regulating antimicrobial peptide gene expression.\`,
            \`- **Zinc Picolinate:** Vital mineral cofactor supporting thymic endocrine function and white blood cell activity.\`,
            "",
            \`**NEXT STEPS:** Use the interactive follow-up chips below to query in deeper detail or access tools directly within the Assistant.\`,
            \`\\nAlways review the full safety profile before commencing research.\`
          ].join("\\n");
          suggestions = [
            { label: "🔬 Deep-Dive: TA1 T-Cell Maturation", action: "MESSAGE", payload: "How does Thymosin Alpha-1 TA1 regulate helper T-cell maturation and immune defense?" },
            { label: "🔬 Deep-Dive: LL-37 Host Defense", action: "MESSAGE", payload: "Explain the antimicrobial and tissue remodeling cascades of LL-37 host defense peptide." },
            { label: "🧮 Reconstitute TA1", action: "MESSAGE", payload: "How do I reconstitute a 10mg vial of Thymosin Alpha-1?" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }`;

// Find the beginning and the end of the lifestyle goal query block
const startMarker = 'if (isMuscleGoal || isFatGoal || isCognitiveGoal || isLongevityGoal || isHormonalGoal || isSkinGoal || isImmuneGoal)';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error("❌ Could not find start of block!");
  process.exit(1);
}

// Find the matching close braces
let openBraces = 0;
let endIndex = -1;

for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') {
    openBraces++;
  } else if (content[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

if (endIndex === -1) {
  console.error("❌ Could not find closing brace of the block!");
  process.exit(1);
}

const before = content.slice(0, startIndex);
const after = content.slice(endIndex);

content = before + replacement + '\n      }\n' + after;
fs.writeFileSync(filePath, content, 'utf8');
console.log("✅ Successfully replaced lifestyle goal query responses in functions/src/http/ai.js!");
