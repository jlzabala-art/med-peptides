import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import { getPeptideReferenceDossier } from '@/data/peptideReferenceDossiers';

/**
 * Standardized Clinical Pharmacology & Indication resolver (¿Para qué sirve?)
 * Combines KNOWN_PEPTIDE_DATA, PEPTIDE_REFERENCE_DOSSIERS, and curated therapeutic targets.
 */
export function getPeptideClinicalSummary(productName = '', category = '', lang = 'en') {
  const isEs = lang === 'es';
  const cleanName = (productName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const knownMatch = Object.entries(KNOWN_PEPTIDE_DATA).find(([k]) => {
    const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanName.includes(kClean) || kClean.includes(cleanName);
  });
  const known = knownMatch ? knownMatch[1] : null;

  const dossier = getPeptideReferenceDossier(productName);

  const indicationsMap = {
    'bpc157': {
      indication: isEs ? 'Reparación acelerada de tejidos blandos, regeneración de tendones y ligamentos, citoprotección gástrica y resolución antiinflamatoria sistémica.' : 'Accelerated soft-tissue repair, tendon and ligament regeneration, gastric mucosal cytoprotection, and systemic anti-inflammatory resolution.',
      target: isEs ? 'Eje de Angiogénesis FAK-Paxilina & VEGF' : 'FAK-Paxillin & VEGF Angiogenesis Axis',
      moa: isEs ? 'Activa la fosforilación de la vía FAK-paxilina, sobreexpresa el receptor VEGFR2/EGR-1 y acelera la angiogénesis microvascular y migración de fibroblastos tendinosos.' : 'Activates FAK-paxillin signaling phosphorylation, upregulates VEGFR2/EGR-1 expression, and accelerates microvascular angiogenesis and tendon fibroblast migration.',
      halfLife: isEs ? '~4–6 horas (efecto biológico tisular >24 h)' : '~4–6 hours (prolonged tissue biological activity >24h)'
    },
    'tb500': {
      indication: isEs ? 'Estimulación de migración celular, regulación de actina, citoprotección miocárdica y recuperación acelerada dérmica y muscular.' : 'Cell migration stimulation, actin regulation, myocardial tissue cytoprotection, and accelerated dermal and muscular recovery.',
      target: isEs ? 'Eje Citoesquelético de G-Actina' : 'Actin-Sequestering G-Actin Cytoskeletal Axis',
      moa: isEs ? 'Secuestra monómeros de G-actina promoviendo la polimerización citoesquelética, migración de células progenitoras endoteliales y remodelación de matriz extracelular.' : 'Sequesters G-actin monomers to promote cytoskeletal polymerization, endothelial progenitor cell migration, and extracellular matrix remodeling.',
      halfLife: isEs ? '~2.5 horas plasmática (efecto tisular 7–14 días)' : '~2.5 hours plasma (tissue repair cascade 7–14 days)'
    },
    'tirzepatide': {
      indication: isEs ? 'Co-agonismo dual de incretinas para homeostasis glucémica, control crónico de peso y reducción de adiposidad visceral.' : 'Dual incretin co-agonism for glycemic homeostasis, chronic weight management, and visceral adiposity reduction.',
      target: isEs ? 'Receptores Duales GIP & GLP-1' : 'GIP & GLP-1 Dual Receptors',
      moa: isEs ? 'Agonista dual de receptores GIP y GLP-1 que potencia la secreción de insulina dependiente de glucosa, retrasa el vaciamiento gástrico e induce saciedad hipotalámica.' : 'Dual GIP and GLP-1 receptor co-agonist enhancing glucose-dependent insulin secretion, delaying gastric emptying, and inducing hypothalamic satiety.',
      halfLife: isEs ? '~5 días (120 horas · dosificación semanal)' : '~5 days (120 hours · once-weekly dosing)'
    },
    'semaglutide': {
      indication: isEs ? 'Agonista selectivo de GLP-1 para control glucémico, regulación hipotalámica del apetito y modulación del riesgo cardiovascular.' : 'Selective GLP-1 agonist for glycemic control, hypothalamic appetite regulation, and cardiovascular risk modulation.',
      target: isEs ? 'Receptores Centrales y Pancreáticos GLP-1' : 'GLP-1 Central & Pancreatic Receptors',
      moa: isEs ? 'Se une selectivamente al receptor GLP-1R activando la adenilato ciclasa (cAMP), suprimiendo el glucagón postprandial y modulando los centros hipotalámicos de saciedad.' : 'Selectively binds GLP-1R to activate adenylyl cyclase (cAMP), suppressing postprandial glucagon and modulating hypothalamic satiety centers.',
      halfLife: isEs ? '~7 días (165 horas · unión a albúmina)' : '~7 days (165 hours · albumin-bound kinetics)'
    },
    'retatrutide': {
      indication: isEs ? 'Triple agonismo receptor de nueva generación para movilización lipídica intensiva, incremento de tasa metabólica y control glucémico.' : 'Next-generation triple receptor agonism for intensive lipid mobilization, metabolic rate enhancement, and glycemic control.',
      target: isEs ? 'Tri-Agonista GLP-1 / GIP / Glucagón' : 'GLP-1 / GIP / Glucagon Tri-Agonist',
      moa: isEs ? 'Agonismo sinérgico sobre receptores GLP-1, GIP y Glucagón (GCGR), combinando control del apetito con beta-oxidación lipídica hepática y termogénesis mitocondrial.' : 'Synergistic agonism across GLP-1, GIP, and Glucagon (GCGR) receptors, combining appetite suppression with hepatic lipid beta-oxidation and thermogenesis.',
      halfLife: isEs ? '~6 días (144 horas · dosificación semanal)' : '~6 days (144 hours · once-weekly dosing)'
    },
    'cjc1295': {
      indication: isEs ? 'Secreción pulsátil de hormona de crecimiento, preservación de masa magra, mejora de arquitectura del sueño profundo y síntesis de colágeno.' : 'Pulsatile growth hormone secretion, lean muscle mass preservation, deep sleep architecture enhancement, and collagen synthesis.',
      target: isEs ? 'Receptores Hipofisarios GHRH' : 'GHRH Pituitary Receptors',
      moa: isEs ? 'Tetrasustituido GHRH(1-29) que estimula los receptores somatotropina hipofisarios amplificando los pulsos fisiológicos de GH e IGF-1 sin romper el ritmo circadiano.' : 'Tetrasubstituted GHRH(1-29) analog stimulating pituitary somatotroph receptors to amplify physiological GH and IGF-1 pulses.',
      halfLife: isEs ? '~30–60 min (No-DAC) / ~6–8 días (Con DAC)' : '~30–60 min (No-DAC) / ~6–8 days (With DAC)'
    },
    'ipamorelin': {
      indication: isEs ? 'Secretagogo selectivo de GH que estimula la liberación hipofisaria natural sin elevar prolactina, cortisol ni aldosterona.' : 'Selective GH secretagogue stimulating natural pituitary release without elevating prolactin, cortisol, or aldosterone.',
      target: isEs ? 'Receptores Hipofisarios de Grelina GHSR-1a' : 'GHSR-1a Ghrelin Pituitary Receptors',
      moa: isEs ? 'Pentapéptido agonista selectivo del receptor GHSR-1a que induce liberación pulsátil de GH desde la adenohipófisis con selectividad total frente a ACTH/cortisol.' : 'Selective pentapeptide GHSR-1a agonist inducing pulsatile GH release from the anterior pituitary with zero off-target ACTH/cortisol elevation.',
      halfLife: isEs ? '~2 horas (secretagogo pulsátil selectivo)' : '~2 hours (selective pulsatile secretagogue)'
    },
    'ghkcu': {
      indication: isEs ? 'Complejo peptídico de cobre que promueve la remodelación de la matriz extracelular, síntesis de colágeno I/III y rejuvenecimiento de fibroblastos.' : 'Copper peptide complex promoting extracellular matrix remodeling, collagen I/III synthesis, and skin fibroblast rejuvenation.',
      target: isEs ? 'Expresión Génica de Fibroblastos & Modulación TGF-β' : 'Fibroblast Gene Expression & TGF-β Modulation',
      moa: isEs ? 'Transporta cobre biodisponible (Cu2+) regulando más de 4,000 genes humanos de reparación tisular, síntesis de colágeno/elastina, decorina y metaloproteinasas.' : 'Delivers bioavailable copper (Cu2+) modulating over 4,000 human genes governing tissue repair, collagen/elastin synthesis, decorin, and MMPs.',
      halfLife: isEs ? '~1–2 horas plasmática (actividad dérmica 24–48 h)' : '~1–2 hours plasma (dermal remodeling cascade 24–48h)'
    },
    'epithalon': {
      indication: isEs ? 'Activación de la subunidad catalítica de telomerasa, regulación pineal de melatonina y sincronización circadiana neuroendocrina.' : 'Telomerase catalytic subunit activation, pineal melatonin regulation, and neuroendocrine circadian synchronization.',
      target: isEs ? 'Telomerasa Transcriptasa Inversa (TERT) & Epitálamo' : 'Telomerase Reverse Transcriptase (TERT) & Epithalamus',
      moa: isEs ? 'Tetrapéptido biorregulador (Ala-Glu-Asp-Gly) que induce la expresión de la subunidad hTERT para elongación telomérica y restaura la secreción pineal de melatonina.' : 'Tetrapeptide bioregulator (Ala-Glu-Asp-Gly) inducing hTERT expression for telomere maintenance and restoring pineal melatonin circadian secretion.',
      halfLife: isEs ? 'Biorregulador epigenético (efecto nuclear prolongado)' : 'Epigenetic bioregulator (sustained nuclear transcriptional effect)'
    },
    'nad': {
      indication: isEs ? 'Coenzima mitocondrial esencial para bioenergética de ATP, activación de enzimas de reparación de ADN (PARP) y vías de longevidad de sirtuinas.' : 'Essential mitochondrial cellular coenzyme for ATP bioenergetics, PARP DNA repair enzyme activation, and sirtuin longevity pathways.',
      target: isEs ? 'Cadena Respiratoria Mitocondrial & Sirtuinas (SIRT1-7)' : 'Mitochondrial Respiratory Chain & Sirtuins (SIRT1-7)',
      moa: isEs ? 'Cofactor redox en la fosforilación oxidativa mitocondrial y sustrato directo de desacetilasas SIRT1–SIRT7 y polimerasas de reparación genómica PARP-1.' : 'Redox cofactor in mitochondrial oxidative phosphorylation and direct obligate substrate for SIRT1–SIRT7 deacetylases and PARP-1 DNA repair enzymes.',
      halfLife: isEs ? 'Captación intracelular rápida (~1–2 h · recambio continuo)' : 'Rapid intracellular uptake (~1–2h · continuous redox turnover)'
    },
    'thymosin': {
      indication: isEs ? 'Inmunomodulación, estimulación de células dendríticas y maduración optimizada de linfocitos T para defensa inmunitaria.' : 'Immune modulation, dendritic cell stimulation, and enhanced T-lymphocyte maturation for chronic defense and wellness.',
      target: isEs ? 'Receptores Toll-Like (TLR2/TLR9) & Maduración de Células T' : 'Toll-Like Receptors (TLR2/TLR9) & T-Cell Maturation',
      moa: isEs ? 'Polipéptido tímico de 28 aminoácidos que activa receptores TLR2/TLR9 en células dendríticas, estimulando diferenciación de células T CD4+/CD8+ y NK.' : '28-amino-acid thymic polypeptide activating TLR2/TLR9 on dendritic cells to stimulate CD4+/CD8+ T-cell differentiation and NK cytotoxicity.',
      halfLife: isEs ? '~2 horas (cascada inmunomoduladora de 72 h)' : '~2 hours (72-hour immunomodulatory signaling cascade)'
    },
    'aod9604': {
      indication: isEs ? 'Fragmento lipolítico selectivo que estimula la oxidación adiposa beta-3 adrenérgica sin alterar niveles de insulina ni IGF-1.' : 'Targeted lipolytic fragment stimulating beta-3 adrenergic adipose breakdown without affecting insulin or IGF-1 levels.',
      target: isEs ? 'Lipólisis Beta-3 Adrenérgica Adipocitaria' : 'Adipocyte Beta-3 Adrenergic Lipolysis',
      moa: isEs ? 'Fragmento C-terminal hGH(177-191) que estimula receptores beta-3 adrenérgicos en tejido adiposo activando lipólisis e inhibiendo lipogénesis sin elevar IGF-1.' : 'C-terminal hGH(177-191) fragment stimulating beta-3 adrenergic receptors in adipose tissue to trigger lipolysis and inhibit lipogenesis without raising IGF-1.',
      halfLife: isEs ? '~1–2 horas (acción lipolítica periférica)' : '~1–2 hours (peripheral adipocyte lipolytic action)'
    },
    'motsc': {
      indication: isEs ? 'Péptido derivado mitocondrial que regula la homeostasis metabólica celular, sensibilidad a la insulina y capacidad física muscular.' : 'Mitochondrial-derived peptide regulating cellular metabolic homeostasis, insulin sensitivity, and skeletal muscle exercise capacity.',
      target: isEs ? 'Activación de AMPK & Captación de Glucosa Muscular' : 'AMPK Activation & Skeletal Muscle Glucose Uptake',
      moa: isEs ? 'Péptido codificado en ADN mitocondrial (16 aa) que inhibe el ciclo folato-metionina, acumula AICAR endógeno y activa AMPK mejorando la oxidación de glucosa.' : 'Mitochondrial-encoded 16-aa peptide inhibiting the folate-methionine cycle to accumulate endogenous AICAR and activate AMPK glucose oxidation.',
      halfLife: isEs ? '~2–4 horas (translocación nuclear regulada por estrés)' : '~2–4 hours (stress-regulated nuclear translocation)'
    },
    'selank': {
      indication: isEs ? 'Heptapéptido neuroprotector y nootrópico que modula la neurotransmisión GABAérgica, reduciendo la ansiedad y estabilizando el ánimo.' : 'Neuroprotective and nootropic heptapeptide modulating GABAergic neurotransmission, reducing anxiety and stabilizing mood.',
      target: isEs ? 'Receptores GABA-A & Inhibición de Degradación de Encefalinas' : 'GABA-A Receptors & Enkephalin Degradation Inhibition',
      moa: isEs ? 'Análogo sintético de tuftsina que modula alostéricamente receptores GABA-A e inhibe las encefalinasas séricas sin causar sedación ni dependencia.' : 'Synthetic tuftsin analog allosterically modulating GABA-A receptors and inhibiting serum enkephalinases without sedation or dependence.',
      halfLife: isEs ? 'Efecto neuroquímico funcional de 6–12 horas' : 'Functional neurochemical modulation of 6–12 hours'
    },
    'semax': {
      indication: isEs ? 'Análogo nootrópico del fragmento ACTH que potencia la expresión de neurotrofina BDNF, enfoque cognitivo, memoria y neuroprotección.' : 'Nootropic ACTH fragment analog enhancing BDNF neurotrophin expression, cognitive focus, memory consolidation, and neuroprotection.',
      target: isEs ? 'Receptores BDNF/TrkB & Eje Dopaminérgico/Serotoninérgico' : 'BDNF/TrkB Receptors & Dopaminergic/Serotonergic Axis',
      moa: isEs ? 'Heptapéptido ACTH(4-10) Pro-Gly-Pro que eleva rápidamente la transcripción de BDNF y receptores TrkB en el hipocampo y corteza prefrontal.' : 'ACTH(4-10) Pro-Gly-Pro heptapeptide rapidly elevating hippocampal and prefrontal BDNF transcription and TrkB receptor signaling.',
      halfLife: isEs ? 'Acción neurotrófica sostenida de 12–20 horas' : 'Sustained neurotrophic signaling of 12–20 hours'
    },
    'pt141': {
      indication: isEs ? 'Agonista central de receptores de melanocortina que estimula la libido fisiológica y la respuesta sexual en hombres y mujeres.' : 'Centrally-acting melanocortin receptor agonist stimulating physiological libido and sexual response in both men and women.',
      target: isEs ? 'Receptores Centrales de Melanocortina MC3R & MC4R' : 'Central MC3R & MC4R Melanocortin Receptors',
      moa: isEs ? 'Heptapéptido cíclico agonista de receptores MC4R/MC3R en el hipotálamo que activa las vías dopaminérgicas centrales de excitación y deseo sexual.' : 'Cyclic heptapeptide MC4R/MC3R agonist in the hypothalamus activating central dopaminergic sexual desire and arousal pathways.',
      halfLife: isEs ? '~2.7 horas (ventana clínica de 6–12 horas)' : '~2.7 hours (6–12 hour clinical response window)'
    },
    'melanotan': {
      indication: isEs ? 'Agonista de melanocortina que estimula la síntesis fotoprotectora de melanina (eumelanina) y la defensa cutánea UV.' : 'Non-selective melanocortin agonist stimulating melanin photoprotective synthesis (eumelanin) and UV defense.',
      target: isEs ? 'Receptores Cutáneos de Melanocortina MC1R' : 'MC1R Melanocortin Cutaneous Receptors',
      moa: isEs ? 'Análogo cíclico de α-MSH que activa receptores MC1R en melanocitos epidérmicos induciendo melanogénesis eumelánica fotoprotectora.' : 'Cyclic α-MSH analog activating epidermal melanocyte MC1R receptors to induce photoprotective eumelanin synthesis.',
      halfLife: isEs ? '~1.5–2 horas (acumulación pigmentaria progresiva)' : '~1.5–2 hours (progressive pigmentary accumulation)'
    },
    'ss31': {
      indication: isEs ? 'Antioxidante mitocondrial dirigido a cardiolipina que restaura la integridad de la membrana mitocondrial interna y reduce el estrés oxidativo.' : 'Cardiolipin-targeted mitochondrial antioxidant restoring inner mitochondrial membrane integrity and reducing oxidative stress.',
      target: isEs ? 'Cardiolipina de la Membrana Mitocondrial Interna' : 'Mitochondrial Inner Membrane Cardiolipin',
      moa: isEs ? 'Tetrapéptido aromático-catiónico (Elamipretide) que se une selectivamente a la cardiolipina en las crestas mitocondriales optimizando el transporte de electrones y ATP.' : 'Aromatic-cationic tetrapeptide (Elamipretide) selectively binding cardiolipin on mitochondrial cristae to optimize electron transport and ATP synthesis.',
      halfLife: isEs ? '~2–4 horas (concentración mitocondrial selectiva)' : '~2–4 hours (selective inner mitochondrial concentration)'
    },
    'dsip': {
      indication: isEs ? 'Péptido neuromodulador que promueve el sueño delta profundo reparador y la reducción fisiológica del estrés neuroendocrino.' : 'Neuromodulatory peptide promoting restorative slow-wave delta sleep and physiological neuroendocrine stress reduction.',
      target: isEs ? 'Centros Centrales del Sueño Serotoninérgicos & GABAérgicos' : 'Central Serotonergic & GABAergic Sleep Centers',
      moa: isEs ? 'Nonapéptido neuromodulador que sincroniza los husos de ondas lentas delta en el EEG y atenúa la hiperactividad del eje corticotropo (ACTH/cortisol).' : 'Neuromodulatory nonapeptide synchronizing slow-wave delta EEG spindles and attenuating HPA axis (ACTH/cortisol) hyperarousal.',
      halfLife: isEs ? 'Modulación de arquitectura nocturna del sueño (6–8 h)' : 'Nocturnal sleep architecture modulation (6–8 hours)'
    },
    'sermorelin': {
      indication: isEs ? 'Fragmento sintético GHRH 1-29 que estimula la producción hipofisaria endógena de GH para vitalidad, composición corporal y recuperación.' : 'Synthetic GHRH 1-29 fragment stimulating endogenous pituitary GH production for vitality, body composition, and recovery.',
      target: isEs ? 'Receptores Hipofisarios GHRH-R' : 'Pituitary GHRH-R Receptors',
      moa: isEs ? 'Secuencia bioidéntica N-terminal de 29 aminoácidos de GHRH que estimula la transcripción y liberación pulsátil nocturna de hormona de crecimiento.' : 'Bioidentical N-terminal 29-amino-acid GHRH sequence stimulating pituitary transcription and nocturnal pulsatile GH release.',
      halfLife: isEs ? '~15–20 minutos (dispara pulso fisiológico nocturno de GH)' : '~15–20 minutes (triggers nocturnal physiological GH pulse)'
    },
    'tesamorelin': {
      indication: isEs ? 'Análogo estabilizado de GHRH clínicamente demostrado para la reducción de tejido adiposo visceral y mejora del perfil lipídico.' : 'Stabilized GHRH analog specifically clinically demonstrated for visceral adipose tissue reduction and lipid profile improvement.',
      target: isEs ? 'Eje GHRH Hepático e Hipofisario' : 'Hepatic & Pituitary GHRH Axis',
      moa: isEs ? 'GHRH(1-44) modificado con ácido trans-3-hexenoico resistente a DPP-4 que estimula de forma potente la lipólisis selectiva del tejido adiposo visceral.' : 'Trans-3-hexenoic acid-modified GHRH(1-44) resistant to DPP-4 cleavage, potently stimulating selective visceral adipose tissue lipolysis.',
      halfLife: isEs ? '~30–40 minutos (elevación sostenida de IGF-1 24 h)' : '~30–40 minutes (sustained 24-hour IGF-1 elevation)'
    },
    'kisspeptin': {
      indication: isEs ? 'Neuropéptido hipotalámico que activa la liberación de GnRH, optimizando pulsos de gonadotropinas LH/FSH y fertilidad/testosterona.' : 'Hypothalamic neuropeptide triggering GnRH release, optimizing LH/FSH gonadotropin pulses and physiological fertility/testosterone.',
      target: isEs ? 'Receptores Hipotalámicos GPR54 / KISS1R' : 'GPR54 / KISS1R Hypothalamic Receptors',
      moa: isEs ? 'Decapéptido agonista del receptor KISS1R en neuronas hipotalámicas GnRH que restaura el generador de pulsos de LH y FSH sin inhibición por retroalimentación.' : 'Decapeptide KISS1R agonist on hypothalamic GnRH neurons restoring endogenous LH and FSH pulse generation.',
      halfLife: isEs ? '~30 minutos (disparo pulsátil neuroendocrino)' : '~30 minutes (neuroendocrine pulsatile trigger)'
    },
    'oxytocin': {
      indication: isEs ? 'Hormona neuropeptídica que media el vínculo social, relajación emocional, resiliencia al estrés y modulación neuroendocrina positiva.' : 'Neuropeptide hormone mediating social bonding, emotional relaxation, stress resilience, and positive neuroendocrine modulation.',
      target: isEs ? 'Receptores Neuroendocrinos OXTR' : 'OXTR Neuroendocrine Receptors',
      moa: isEs ? 'Nonapéptido hipotalámico que activa receptores OXTR acoplados a proteína Gq modulando el tono parasimpático vagal y la respuesta amigdalina al estrés.' : 'Hypothalamic nonapeptide activating Gq-coupled OXTR receptors to modulate parasympathetic vagal tone and amygdala stress reactivity.',
      halfLife: isEs ? '~1–6 h central / intranasal (~15 min plasmática)' : '~1–6h central / intranasal (~15 min peripheral plasma)'
    },
    'glutathione': {
      indication: isEs ? 'Antioxidante celular maestro que facilita la detoxificación hepática de fase II, neutralización de radicales libres y luminosidad cutánea.' : 'Master cellular antioxidant facilitating hepatic phase II detoxification, free radical scavenging, and skin radiance.',
      target: isEs ? 'Eje Intracelular Redox Glutatión Peroxidasa' : 'Intracellular Redox Glutathione Peroxidase Axis',
      moa: isEs ? 'Tripéptido tiólico (γ-L-glutamil-L-cisteinil-glicina) que neutraliza especies reactivas de oxígeno (ROS), regenera vitaminas C/E y conjuga toxinas hepáticas.' : 'Thiol tripeptide (γ-L-glutamyl-L-cysteinyl-glycine) neutralizing reactive oxygen species (ROS), regenerating vitamins C/E, and conjugating hepatic toxins.',
      halfLife: isEs ? 'Recambio redox intracelular continuo (ciclo GSH/GSSG)' : 'Continuous intracellular redox cycling (GSH/GSSG pool)'
    }
  };

  const matchedKey = Object.keys(indicationsMap).find(k => cleanName.includes(k));
  const fallbackIndication = matchedKey ? indicationsMap[matchedKey].indication : null;
  const fallbackTarget = matchedKey ? indicationsMap[matchedKey].target : null;
  const fallbackMoa = matchedKey ? indicationsMap[matchedKey].moa : null;
  const fallbackHalfLife = matchedKey ? indicationsMap[matchedKey].halfLife : null;

  const synergyMap = {
    'bpc157': isEs ? 'Co-administrado con TB-500 para remodelación sinérgica de tejidos blandos, tendones y matriz vascular.' : 'Co-administered with TB-500 for enhanced soft tissue, tendon, and vascular matrix remodeling.',
    'tb500': isEs ? 'Actúa en sinergia con BPC-157 para reparación sistémica integral y citoprotección.' : 'Synergizes with BPC-157 for comprehensive systemic repair and cytoprotection.',
    'tirzepatide': isEs ? 'Combinable con AOD-9604 o CJC-1295/Ipamorelin para preservar masa magra durante el déficit metabólico.' : 'Can be stacked with AOD-9604 or CJC-1295/Ipamorelin to preserve lean mass during metabolic deficit.',
    'semaglutide': isEs ? 'Se combina con BPC-157 para mitigar molestias gastrointestinales y preservar la integridad mucosa.' : 'Pairs well with BPC-157 to mitigate gastrointestinal transit discomfort and preserve mucosal integrity.',
    'retatrutide': isEs ? 'Se combina con MOTS-c o L-Carnitina para máxima beta-oxidación mitocondrial y rendimiento energético.' : 'Pairs with MOTS-c or L-Carnitine for maximal mitochondrial beta-oxidation and energy output.',
    'cjc1295': isEs ? 'Sinergia óptima con Ipamorelin para amplificar la liberación pulsátil fisiológica de GH.' : 'Pairs synergistically with Ipamorelin for amplified physiological GH pulsatile release.',
    'ipamorelin': isEs ? 'Se combina con CJC-1295 para secreción amplificada de GH sin elevar cortisol, prolactina ni aldosterona.' : 'Pairs with CJC-1295 for amplified GH secretion without elevating cortisol, prolactin, or aldosterone.',
    'ghkcu': isEs ? 'Se combina con BPC-157 o Epithalon para renovación de matriz extracelular cutánea y antienvejecimiento.' : 'Pairs with BPC-157 or Epithalon for cutaneous extracellular matrix renewal and anti-aging.',
    'epithalon': isEs ? 'Se combina con Thymosin Alpha-1 o NAD+ para longevidad celular multivía y rejuvenecimiento inmune.' : 'Pairs with Thymosin Alpha-1 or NAD+ for multi-pathway cellular longevity and immune rejuvenation.',
    'nad': isEs ? 'Se combina con SS-31 o Epithalon para restauración de membrana mitocondrial interna y producción de ATP.' : 'Pairs with SS-31 or Epithalon for inner mitochondrial membrane restoration and cellular ATP output.',
    'thymosin': isEs ? 'Se combina con BPC-157 o Epithalon para inmunomodulación y recuperación post-infecciosa.' : 'Pairs with BPC-157 or Epithalon for immune modulation and infection recovery.',
    'aod9604': isEs ? 'Se combina con agonistas GLP-1/GIP para lipólisis adipocitaria selectiva sin interferencia glucémica.' : 'Pairs with GLP-1/GIP agonists for targeted adipocyte lipolysis without glycemic interference.',
    'motsc': isEs ? 'Se combina con NAD+ para resistencia metabólica y señalización mimética del ejercicio.' : 'Pairs with NAD+ for metabolic endurance and exercise mimetic signaling.',
    'selank': isEs ? 'Se combina con Semax para enfoque ejecutivo equilibrado, resiliencia al estrés y estabilidad anímica.' : 'Pairs with Semax for balanced executive focus, stress resilience, and mood stabilization.',
    'semax': isEs ? 'Se combina con Selank para neuroplasticidad potenciada por BDNF y claridad cognitiva.' : 'Pairs with Selank for enhanced BDNF neuroplasticity and cognitive clarity.',
    'pt141': isEs ? 'Administración a demanda o combinado con Kisspeptin para soporte del eje neuroendocrino sexual.' : 'Standalone on-demand administration or stacked with Kisspeptin for neuroendocrine sexual axis support.',
    'ss31': isEs ? 'Se combina con MOTS-c y NAD+ para recuperación de cardiolipina en la membrana mitocondrial interna.' : 'Pairs with MOTS-c and NAD+ for inner mitochondrial membrane cardiolipin recovery.',
    'dsip': isEs ? 'Se combina con Epithalon para sueño delta profundo reparador y optimización circadiana.' : 'Pairs with Epithalon for restorative slow-wave delta sleep and circadian optimization.'
  };

  const matchedSynergy = Object.keys(synergyMap).find(k => cleanName.includes(k));
  const synergy = matchedSynergy ? synergyMap[matchedSynergy] : (isEs ? 'Compuesto individual específico o protocolo multipéptido guiado por facultativo.' : 'Targeted standalone compound or physician-guided multi-peptide protocol.');

  const dosingMap = {
    'bpc157': {
      dose: isEs ? '250–500 mcg/día SubQ (1–2× al día)' : '250–500 mcg/day SubQ (1–2× daily)',
      route: 'SubQ / Local',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg en jeringa U-100' : '10 IU (0.1 mL) = 250 mcg on U-100 syringe',
      vialYield: isEs ? '20 dosis de 250 mcg (10–20 días de tratamiento)' : '20 doses @ 250 mcg (10–20 days of treatment)',
      stability: isEs ? '28 días refrigerado (2–8°C) con BAC Water (no congelar)' : '28 days refrigerated (2–8°C) once mixed (do not freeze)',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.5/1.0 mL) · Aguja 31G (8 mm / 5/16")' : 'U-100 Insulin Syringe (0.5/1.0 mL) · 31G Needle (8 mm / 5/16")',
      crossSellName: 'TB-500',
      stack: isEs ? 'TB-500 (Protocolo Wolverine: regeneración 2x)' : 'TB-500 (Wolverine Protocol: dual tissue repair)'
    },
    'tb500': {
      dose: isEs ? '2.0–2.5 mg 2×/semana SubQ (ciclo 4–6 semanas)' : '2.0–2.5 mg 2×/week SubQ (4–6 week cycle)',
      route: 'SubQ / IM',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '80–100 UI (0.8–1.0 mL) = 2.0–2.5 mg' : '80–100 IU (0.8–1.0 mL) = 2.0–2.5 mg',
      vialYield: isEs ? '2 a 4 dosis de 2.0–2.5 mg (1–2 semanas de soporte)' : '2 to 4 doses @ 2.0–2.5 mg (1–2 weeks supply)',
      stability: isEs ? '28 días refrigerado (2–8°C) con BAC Water' : '28 days refrigerated (2–8°C) once reconstituted',
      hardware: isEs ? 'Jeringa Insulina U-100 (1.0 mL) · Aguja 30G–31G' : 'U-100 Insulin Syringe (1.0 mL) · 30G–31G Needle',
      crossSellName: 'BPC-157',
      stack: isEs ? 'BPC-157 (Reparación sistémica sinérgica)' : 'BPC-157 (Systemic dual tissue repair)'
    },
    'tirzepatide': {
      dose: isEs ? '2.5 mg/semana SubQ (titulación mensual)' : '2.5 mg/week SubQ (monthly titration)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 500 mcg · 50 UI = 2.5 mg' : '10 IU (0.1 mL) = 500 mcg · 50 IU = 2.5 mg',
      vialYield: isEs ? '4 dosis semanales de 2.5 mg (1 mes completo de inicio)' : '4 weekly doses @ 2.5 mg (1 full month induction)',
      stability: isEs ? '28 días refrigerado (2–8°C) protegido de la luz' : '28 days refrigerated (2–8°C) light-protected',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.5 mL) · Aguja 31G (8 mm)' : 'U-100 Insulin Syringe (0.5 mL) · 31G Needle (8 mm)',
      crossSellName: 'AOD-9604',
      stack: isEs ? 'AOD-9604 o CJC-1295 (preservación de masa magra)' : 'AOD-9604 or CJC-1295 (muscle preservation)'
    },
    'semaglutide': {
      dose: isEs ? '0.25 mg/semana SubQ (titular mensualmente)' : '0.25 mg/week SubQ (monthly titration)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg (dosis de inicio)' : '10 IU (0.1 mL) = 250 mcg (starting dose)',
      vialYield: isEs ? '4 a 8 dosis según escalado (1 a 2 meses de tratamiento)' : '4 to 8 doses depending on escalation (1–2 months)',
      stability: isEs ? '28–30 días refrigerado (2–8°C)' : '28–30 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.5 mL) · Aguja 31G (8 mm)' : 'U-100 Insulin Syringe (0.5 mL) · 31G Needle (8 mm)',
      crossSellName: 'BPC-157',
      stack: isEs ? 'BPC-157 (tolerabilidad gastrointestinal)' : 'BPC-157 (GI tolerability and comfort)'
    },
    'retatrutide': {
      dose: isEs ? '1.0–2.0 mg/semana SubQ (titulación escalonada)' : '1.0–2.0 mg/week SubQ (gradual step titration)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '20 UI (0.2 mL) = 1.0 mg · 40 UI = 2.0 mg' : '20 IU (0.2 mL) = 1.0 mg · 40 IU = 2.0 mg',
      vialYield: isEs ? '4 a 8 dosis semanales de titulación (1–2 meses)' : '4 to 8 weekly titration doses (1–2 months)',
      stability: isEs ? '28 días refrigerado (2–8°C)' : '28 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 · Aguja 31G (8 mm)' : 'U-100 Insulin Syringe · 31G Needle (8 mm)',
      crossSellName: 'MOTS-c',
      stack: isEs ? 'MOTS-c o L-Carnitina (biogénesis mitocondrial)' : 'MOTS-c or L-Carnitine (mitochondrial stamina)'
    },
    'cjc1295': {
      dose: isEs ? '100 mcg SubQ nocturno (con Ipamorelin)' : '100 mcg SubQ at bedtime (with Ipamorelin)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 1.0 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 100 mcg exactos' : '10 IU (0.1 mL) = exactly 100 mcg',
      vialYield: isEs ? '20 dosis de 100 mcg (ciclo de 20 a 30 días)' : '20 doses @ 100 mcg (20–30 day cycle)',
      stability: isEs ? '21–28 días refrigerado (2–8°C)' : '21–28 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.3/0.5 mL) · Aguja 31G (8 mm)' : 'U-100 Insulin Syringe (0.3/0.5 mL) · 31G Needle (8 mm)',
      crossSellName: 'Ipamorelin',
      stack: isEs ? 'Ipamorelin (estimulación somatotropa dual)' : 'Ipamorelin (dual synergistic somatotroph trigger)'
    },
    'ipamorelin': {
      dose: isEs ? '100–200 mcg SubQ nocturno en ayunas' : '100–200 mcg SubQ at bedtime fasted',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 1.0 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 100 mcg · 20 UI = 200 mcg' : '10 IU (0.1 mL) = 100 mcg · 20 IU = 200 mcg',
      vialYield: isEs ? '20 dosis de 100 mcg o 10 dosis de 200 mcg' : '20 doses @ 100 mcg or 10 doses @ 200 mcg',
      stability: isEs ? '21–28 días refrigerado (2–8°C)' : '21–28 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.3/0.5 mL) · Aguja 31G (8 mm)' : 'U-100 Insulin Syringe (0.3/0.5 mL) · 31G Needle (8 mm)',
      crossSellName: 'CJC-1295',
      stack: isEs ? 'CJC-1295 No-DAC (picos fisiológicos nocturnos de GH)' : 'CJC-1295 No-DAC (physiological nocturnal GH peaks)'
    },
    'epithalon': {
      dose: isEs ? '5–10 mg/día SubQ (ciclo anual de 10–20 días)' : '5–10 mg/day SubQ (annual 10–20 day cycle)',
      route: 'SubQ / IM',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '20 UI (0.2 mL) = 1.0 mg · 100 UI = 5.0 mg' : '20 IU (0.2 mL) = 1.0 mg · 100 IU = 5.0 mg',
      vialYield: isEs ? '10 a 20 dosis para ciclo anual de longevidad' : '10 to 20 doses for full annual cycle',
      stability: isEs ? '28 días refrigerado (2–8°C)' : '28 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (1.0 mL) · Aguja 30G' : 'U-100 Insulin Syringe (1.0 mL) · 30G Needle',
      crossSellName: 'NAD+',
      stack: isEs ? 'Thymosin Alpha-1 o NAD+ (inmunorejuvenecimiento)' : 'Thymosin Alpha-1 or NAD+ (immune rejuvenation)'
    },
    'ghkcu': {
      dose: isEs ? '1.0–2.0 mg/día SubQ o formulación dérmica' : '1.0–2.0 mg/day SubQ or dermal formulation',
      route: 'SubQ / Tópica',
      recon: '3.0 mL BAC Water → 16.6 mg/mL (vial 50mg)',
      syringeCalc: isEs ? '6–12 UI (0.06–0.12 mL) = 1.0–2.0 mg' : '6–12 IU (0.06–0.12 mL) = 1.0–2.0 mg',
      vialYield: isEs ? '25 a 50 dosis según posología dérmica/SubQ' : '25 to 50 doses per dermal/SubQ titration',
      stability: isEs ? '30 días refrigerado (2–8°C)' : '30 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 · Aguja 31G o gotero estéril' : 'U-100 Insulin Syringe · 31G Needle or sterile dropper',
      crossSellName: 'BPC-157',
      stack: isEs ? 'BPC-157 o Epithalon (renovación de matriz dérmica)' : 'BPC-157 or Epithalon (dermal matrix renewal)'
    },
    'motsc': {
      dose: isEs ? '5–10 mg 3×/semana SubQ (L/M/V)' : '5–10 mg 3×/week SubQ (Mon/Wed/Fri)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '100 UI (1.0 mL) = 5.0 mg' : '100 IU (1.0 mL) = 5.0 mg',
      vialYield: isEs ? '2 a 4 dosis intensivas de 5 mg' : '2 to 4 intensive doses @ 5 mg',
      stability: isEs ? '14–21 días refrigerado (2–8°C)' : '14–21 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (1.0 mL) · Aguja 30G–31G' : 'U-100 Insulin Syringe (1.0 mL) · 30G–31G Needle',
      crossSellName: 'NAD+',
      stack: isEs ? 'NAD+ (resistencia metabólica y energía mitocondrial)' : 'NAD+ (metabolic stamina & ATP output)'
    },
    'nad': {
      dose: isEs ? '50–100 mg SubQ / IM 2–3×/semana' : '50–100 mg SubQ / IM 2–3×/week',
      route: 'SubQ / IM',
      recon: '5.0 mL BAC Water → 100 mg/mL (vial 500mg)',
      syringeCalc: isEs ? '50 UI (0.5 mL) = 50 mg · 100 UI = 100 mg' : '50 IU (0.5 mL) = 50 mg · 100 IU = 100 mg',
      vialYield: isEs ? '5 a 10 dosis de 50–100 mg' : '5 to 10 doses @ 50–100 mg',
      stability: isEs ? '28 días refrigerado (2–8°C) protegido de la luz' : '28 days refrigerated (2–8°C) light-protected',
      hardware: isEs ? 'Jeringa 1.0 mL · Aguja 29G–30G SubQ/IM lenta' : '1.0 mL Syringe · 29G–30G Needle SubQ/IM slow',
      crossSellName: 'Epithalon',
      stack: isEs ? 'SS-31 o Epithalon (cardiolipina mitocondrial y longevidad)' : 'SS-31 or Epithalon (mitochondrial cardiolipin & longevity)'
    },
    'selank': {
      dose: isEs ? '250–500 mcg/día intranasal o SubQ' : '250–500 mcg/day intranasal or SubQ',
      route: 'Intranasal / SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg · 20 UI = 500 mcg' : '10 IU (0.1 mL) = 250 mcg · 20 IU = 500 mcg',
      vialYield: isEs ? '20 a 40 aplicaciones (1 mes de soporte)' : '20 to 40 applications (1 month supply)',
      stability: isEs ? '30 días refrigerado (2–8°C)' : '30 days refrigerated (2–8°C)',
      hardware: isEs ? 'Nebulizador nasal estéril o jeringa U-100 31G' : 'Sterile nasal spray or U-100 Syringe 31G',
      crossSellName: 'Semax',
      stack: isEs ? 'Semax (enfoque ejecutivo sereno y balance GABA)' : 'Semax (calm executive focus and GABA balance)'
    },
    'semax': {
      dose: isEs ? '200–600 mcg/día intranasal o SubQ' : '200–600 mcg/day intranasal or SubQ',
      route: 'Intranasal / SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg' : '10 IU (0.1 mL) = 250 mcg',
      vialYield: isEs ? '20 a 40 aplicaciones (1 mes de soporte)' : '20 to 40 applications (1 month supply)',
      stability: isEs ? '30 días refrigerado (2–8°C)' : '30 days refrigerated (2–8°C)',
      hardware: isEs ? 'Nebulizador nasal estéril o jeringa U-100 31G' : 'Sterile nasal spray or U-100 Syringe 31G',
      crossSellName: 'Selank',
      stack: isEs ? 'Selank (eje neurotrófico BDNF y agudeza mental)' : 'Selank (neurotrophic BDNF axis & mental clarity)'
    },
    'aod9604': {
      dose: isEs ? '300–500 mcg/día SubQ matutino en ayunas' : '300–500 mcg/day SubQ morning fasted',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '12 UI (0.12 mL) = 300 mcg · 20 UI = 500 mcg' : '12 IU (0.12 mL) = 300 mcg · 20 IU = 500 mcg',
      vialYield: isEs ? '10 a 16 dosis de 300–500 mcg' : '10 to 16 doses @ 300–500 mcg',
      stability: isEs ? '28 días refrigerado (2–8°C)' : '28 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.5 mL) · Aguja 31G' : 'U-100 Insulin Syringe (0.5 mL) · 31G Needle',
      crossSellName: 'Tirzepatide',
      stack: isEs ? 'Agonistas GLP-1/GIP (lipólisis adipocitaria sinérgica)' : 'GLP-1/GIP agonists (synergistic adipocyte lipolysis)'
    },
    'pt141': {
      dose: isEs ? '1.25–1.75 mg SubQ a demanda (~45 min antes)' : '1.25–1.75 mg SubQ on demand (~45 min prior)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '25 UI (0.25 mL) = 1.25 mg · 35 UI = 1.75 mg' : '25 IU (0.25 mL) = 1.25 mg · 35 IU = 1.75 mg',
      vialYield: isEs ? '6 a 8 aplicaciones a demanda' : '6 to 8 on-demand applications',
      stability: isEs ? '28 días refrigerado (2–8°C)' : '28 days refrigerated (2–8°C)',
      hardware: isEs ? 'Jeringa Insulina U-100 (0.5 mL) · Aguja 31G' : 'U-100 Insulin Syringe (0.5 mL) · 31G Needle',
      crossSellName: 'Kisspeptin',
      stack: isEs ? 'Kisspeptin-10 (soporte integral del eje neuroendocrino)' : 'Kisspeptin-10 (comprehensive neuroendocrine support)'
    }
  };

  const matchedDosing = Object.keys(dosingMap).find(k => cleanName.includes(k));
  const dosing = matchedDosing ? dosingMap[matchedDosing] : null;

  return {
    targetSystem: fallbackTarget || known?.targetSystem || dossier?.pharmacology?.title || (isEs ? `Eje ${category || 'Bioactivo Clínico'}` : `${category || 'Clinical Bioactive'} Axis`),
    indication: fallbackIndication || dossier?.regulatory?.guidance || (isEs ? 'Modulación celular específica, reparación tisular y optimización fisiológica clínica.' : 'Targeted cellular modulation, tissue repair, and clinical physiological optimization.'),
    moa: fallbackMoa || (isEs
      ? (dossier?.pharmacology?.moaEs || 'Agonismo peptídico selectivo sobre receptores celulares diana con activación de cascadas de señalización intracelular (cAMP/MAPK).')
      : (known?.mechanismOfAction || dossier?.pharmacology?.moa || 'Binds to targeted cell-surface receptors activating intracellular secondary messenger cascades for therapeutic response.')),
    halfLife: fallbackHalfLife || known?.halfLife || (isEs ? '~2–6 horas (aclaramiento peptídico fisiológico)' : 'Physiological peptide kinetics (~2–6h clearance)'),
    sequence: known?.sequence || null,
    casNumber: known?.casNumber || dossier?.casNumber || null,
    synergy,
    dose: dosing?.dose || (isEs ? 'Dosificación individualizada según criterio facultativo.' : 'Individualized clinical dosing per physician guidance.'),
    route: dosing?.route || 'SubQ',
    recon: dosing?.recon || '2.0 mL BAC Water',
    syringeCalc: dosing?.syringeCalc || (isEs ? 'Usar jeringa de insulina U-100 para dosificación de precisión.' : 'Use standard U-100 insulin syringe for precision dosing.'),
    vialYield: dosing?.vialYield || (isEs ? '10 a 20 dosis según pauta' : '10 to 20 doses per clinical titration'),
    stability: dosing?.stability || (isEs ? '28 días refrigerado (2–8°C) con agua bacteriostática' : '28 days refrigerated (2–8°C) with bacteriostatic water'),
    hardware: dosing?.hardware || (isEs ? 'Jeringa Insulina U-100 · Aguja 30G–31G (8 mm)' : 'U-100 Insulin Syringe · 30G–31G Needle (8 mm)'),
    crossSellName: dosing?.crossSellName || null,
    stack: dosing?.stack || synergy
  };
}
