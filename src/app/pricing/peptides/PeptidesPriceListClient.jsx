'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Share2,
  Check,
  ShoppingCart,
  ShieldCheck,
  Box,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Lock,
  ArrowRight,
  Eye,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Plus,
  Minus,
  Trash2,
  X,
  MessageCircle,
  Zap,
  BookOpen,
  Brain,
  Activity,
  FlaskConical,
  Droplets,
  Moon,
  Dna,
  Shield,
  Mail,
  Truck,
  Menu,
  SlidersHorizontal,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import Breadcrumb from '@/components/ui/Breadcrumb';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import ClinicalProtocolDrawer from '@/components/pricing/ClinicalProtocolDrawer';
import AtlasAiCopilotDrawer from '@/components/pricing/AtlasAiCopilotDrawer';
import PeptideSpecsDrawer from '@/components/pricing/PeptideSpecsDrawer';
import PeptidePricePdfPreviewModal, { parsePeptideBlendDisplay } from '@/components/pricing/PeptidePricePdfPreviewModal';
import { getFdaPeptideStatus, FDA_STATUS_TYPES } from '@/data/fdaPeptidesRegistry';
import { COUNTRIES } from '@/data/countries';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';
import { getPeptideReferenceDossier } from '@/data/peptideReferenceDossiers';
import '../colway/ColwayPriceList.css';

/**
 * Standardized Clinical Pharmacology & Indication resolver (¿Para qué sirve?)
 * Combines KNOWN_PEPTIDE_DATA, PEPTIDE_REFERENCE_DOSSIERS, and curated therapeutic targets.
 */
function getPeptideClinicalSummary(productName = '', category = '', lang = 'en') {
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
      stack: isEs ? 'TB-500 (Protocolo Wolverine: regeneración 2x)' : 'TB-500 (Wolverine Protocol: dual tissue repair)'
    },
    'tb500': {
      dose: isEs ? '2.0–2.5 mg 2×/semana SubQ (ciclo 4–6 semanas)' : '2.0–2.5 mg 2×/week SubQ (4–6 week cycle)',
      route: 'SubQ / IM',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '80–100 UI (0.8–1.0 mL) = 2.0–2.5 mg' : '80–100 IU (0.8–1.0 mL) = 2.0–2.5 mg',
      stack: isEs ? 'BPC-157 (Reparación sistémica sinérgica)' : 'BPC-157 (Systemic dual tissue repair)'
    },
    'tirzepatide': {
      dose: isEs ? '2.5 mg/semana SubQ (titulación mensual)' : '2.5 mg/week SubQ (monthly titration)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 500 mcg · 50 UI = 2.5 mg' : '10 IU (0.1 mL) = 500 mcg · 50 IU = 2.5 mg',
      stack: isEs ? 'AOD-9604 o CJC-1295 (preservación de masa magra)' : 'AOD-9604 or CJC-1295 (muscle preservation)'
    },
    'semaglutide': {
      dose: isEs ? '0.25 mg/semana SubQ (titular mensualmente)' : '0.25 mg/week SubQ (monthly titration)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg (dosis de inicio)' : '10 IU (0.1 mL) = 250 mcg (starting dose)',
      stack: isEs ? 'BPC-157 (tolerabilidad gastrointestinal)' : 'BPC-157 (GI tolerability and comfort)'
    },
    'retatrutide': {
      dose: isEs ? '1.0–2.0 mg/semana SubQ (titulación escalonada)' : '1.0–2.0 mg/week SubQ (gradual step titration)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '20 UI (0.2 mL) = 1.0 mg · 40 UI = 2.0 mg' : '20 IU (0.2 mL) = 1.0 mg · 40 IU = 2.0 mg',
      stack: isEs ? 'MOTS-c o L-Carnitina (biogénesis mitocondrial)' : 'MOTS-c or L-Carnitine (mitochondrial stamina)'
    },
    'cjc1295': {
      dose: isEs ? '100 mcg SubQ nocturno (con Ipamorelin)' : '100 mcg SubQ at bedtime (with Ipamorelin)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 1.0 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 100 mcg exactos' : '10 IU (0.1 mL) = exactly 100 mcg',
      stack: isEs ? 'Ipamorelin (estimulación somatotropa dual)' : 'Ipamorelin (dual synergistic somatotroph trigger)'
    },
    'ipamorelin': {
      dose: isEs ? '100–200 mcg SubQ nocturno en ayunas' : '100–200 mcg SubQ at bedtime fasted',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 1.0 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 100 mcg · 20 UI = 200 mcg' : '10 IU (0.1 mL) = 100 mcg · 20 IU = 200 mcg',
      stack: isEs ? 'CJC-1295 No-DAC (picos fisiológicos nocturnos de GH)' : 'CJC-1295 No-DAC (physiological nocturnal GH peaks)'
    },
    'epithalon': {
      dose: isEs ? '5–10 mg/día SubQ (ciclo anual de 10–20 días)' : '5–10 mg/day SubQ (annual 10–20 day cycle)',
      route: 'SubQ / IM',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '20 UI (0.2 mL) = 1.0 mg · 100 UI = 5.0 mg' : '20 IU (0.2 mL) = 1.0 mg · 100 IU = 5.0 mg',
      stack: isEs ? 'Thymosin Alpha-1 o NAD+ (inmunorejuvenecimiento)' : 'Thymosin Alpha-1 or NAD+ (immune rejuvenation)'
    },
    'ghkcu': {
      dose: isEs ? '1.0–2.0 mg/día SubQ o formulación dérmica' : '1.0–2.0 mg/day SubQ or dermal formulation',
      route: 'SubQ / Tópica',
      recon: '3.0 mL BAC Water → 16.6 mg/mL (vial 50mg)',
      syringeCalc: isEs ? '6–12 UI (0.06–0.12 mL) = 1.0–2.0 mg' : '6–12 IU (0.06–0.12 mL) = 1.0–2.0 mg',
      stack: isEs ? 'BPC-157 o Epithalon (renovación de matriz dérmica)' : 'BPC-157 or Epithalon (dermal matrix renewal)'
    },
    'motsc': {
      dose: isEs ? '5–10 mg 3×/semana SubQ (L/M/V)' : '5–10 mg 3×/week SubQ (Mon/Wed/Fri)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '100 UI (1.0 mL) = 5.0 mg' : '100 IU (1.0 mL) = 5.0 mg',
      stack: isEs ? 'NAD+ (resistencia metabólica y energía mitocondrial)' : 'NAD+ (metabolic stamina & ATP output)'
    },
    'nad': {
      dose: isEs ? '50–100 mg SubQ / IM 2–3×/semana' : '50–100 mg SubQ / IM 2–3×/week',
      route: 'SubQ / IM',
      recon: '5.0 mL BAC Water → 100 mg/mL (vial 500mg)',
      syringeCalc: isEs ? '50 UI (0.5 mL) = 50 mg · 100 UI = 100 mg' : '50 IU (0.5 mL) = 50 mg · 100 IU = 100 mg',
      stack: isEs ? 'SS-31 o Epithalon (cardiolipina mitocondrial y longevidad)' : 'SS-31 or Epithalon (mitochondrial cardiolipin & longevity)'
    },
    'selank': {
      dose: isEs ? '250–500 mcg/día intranasal o SubQ' : '250–500 mcg/day intranasal or SubQ',
      route: 'Intranasal / SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg · 20 UI = 500 mcg' : '10 IU (0.1 mL) = 250 mcg · 20 IU = 500 mcg',
      stack: isEs ? 'Semax (enfoque ejecutivo sereno y balance GABA)' : 'Semax (calm executive focus and GABA balance)'
    },
    'semax': {
      dose: isEs ? '200–600 mcg/día intranasal o SubQ' : '200–600 mcg/day intranasal or SubQ',
      route: 'Intranasal / SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '10 UI (0.1 mL) = 250 mcg' : '10 IU (0.1 mL) = 250 mcg',
      stack: isEs ? 'Selank (eje neurotrófico BDNF y agudeza mental)' : 'Selank (neurotrophic BDNF axis & mental clarity)'
    },
    'aod9604': {
      dose: isEs ? '300–500 mcg/día SubQ matutino en ayunas' : '300–500 mcg/day SubQ morning fasted',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 2.5 mg/mL',
      syringeCalc: isEs ? '12 UI (0.12 mL) = 300 mcg · 20 UI = 500 mcg' : '12 IU (0.12 mL) = 300 mcg · 20 IU = 500 mcg',
      stack: isEs ? 'Agonistas GLP-1/GIP (lipólisis adipocitaria sinérgica)' : 'GLP-1/GIP agonists (synergistic adipocyte lipolysis)'
    },
    'pt141': {
      dose: isEs ? '1.25–1.75 mg SubQ a demanda (~45 min antes)' : '1.25–1.75 mg SubQ on demand (~45 min prior)',
      route: 'SubQ',
      recon: '2.0 mL BAC Water → 5.0 mg/mL',
      syringeCalc: isEs ? '25 UI (0.25 mL) = 1.25 mg · 35 UI = 1.75 mg' : '25 IU (0.25 mL) = 1.25 mg · 35 IU = 1.75 mg',
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
    stack: dosing?.stack || synergy
  };
}

/**
 * Standardized Google Cloud UX Vector Icons for Clinical Peptide Categories
 */
function getCategoryIcon(key, size = 14) {
  switch (key) {
    case 'repair': return <ShieldCheck size={size} color="#1a73e8" />;
    case 'metabolic': return <Zap size={size} color="#188038" />;
    case 'longevity': return <Sparkles size={size} color="#7c3aed" />;
    case 'neuro': return <Brain size={size} color="#ea580c" />;
    case 'growth_hormone': return <Activity size={size} color="#0d9488" />;
    case 'cosmetic': return <Sparkles size={size} color="#db2777" />;
    case 'supplies': return <Droplets size={size} color="#0284c7" />;
    case 'general_health':
    default:
      return <FlaskConical size={size} color="#5f6368" />;
  }
}

/**
 * Standardized Google Cloud UX Vector Icons for Clinical Protocol Presets
 */
function getPresetIcon(id, size = 15) {
  switch (id) {
    case 'tissue_repair': return <ShieldCheck size={size} color="#1a73e8" />;
    case 'metabolic_glp1': return <Zap size={size} color="#188038" />;
    case 'cellular_longevity': return <Sparkles size={size} color="#7c3aed" />;
    case 'neuro_focus': return <Brain size={size} color="#ea580c" />;
    case 'deep_sleep': return <Moon size={size} color="#4f46e5" />;
    default: return <Activity size={size} color="#5f6368" />;
  }
}

const CATEGORY_MAP = {
  repair: { label: 'Tissue Repair & Healing', labelEn: 'Tissue Repair & Healing', labelEs: 'Reparación Tisular', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: '🩹' },
  metabolic: { label: 'Metabolic & GLP-1', labelEn: 'Metabolic & GLP-1', labelEs: 'Metabolismo & GLP-1', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '⚡' },
  longevity: { label: 'Longevity & Cellular', labelEn: 'Longevity & Cellular', labelEs: 'Longevidad & Celular', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: '🧬' },
  neuro: { label: 'Neuro & Cognitive', labelEn: 'Neuro & Cognitive', labelEs: 'Neuro & Cognitivo', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5', icon: '🧠' },
  growth_hormone: { label: 'GH Secretagogues', labelEn: 'GH Secretagogues', labelEs: 'Secretagogos de GH', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', icon: '🚀' },
  cosmetic: { label: 'Dermal & Follicular', labelEn: 'Dermal & Follicular', labelEs: 'Dérmico & Folicular', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8', icon: '✨' },
  general_health: { label: 'Bioactive Peptide', labelEn: 'Bioactive Peptide', labelEs: 'Péptidos Bioactivos', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: '🧪' },
  supplies: { label: 'Solvents & Supplies', labelEn: 'Solvents & Supplies', labelEs: 'Disolventes & Suministros', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '💧' }
};

export const FDA_FILTERS = [
  { id: 'all', labelEn: 'All Regulatory', labelEs: 'Todos los Estatus', tooltipEn: 'All FDA Regulatory Statuses', tooltipEs: 'Todos los Estados Regulatorios FDA', icon: '🌐' },
  { id: 'fda_503a', labelEn: '503A Discretion', labelEs: '503A Magistral', tooltipEn: 'HHS/FDA 503A Enforcement Discretion', tooltipEs: '503A Discreción de Ejecución Magistral HHS/FDA', icon: '🛡️', color: '#16a34a' },
  { id: 'fda_approved', labelEn: 'FDA Approved', labelEs: 'Aprobados FDA', tooltipEn: 'FDA Approved (NDA / BLA)', tooltipEs: 'Aprobados por FDA (NDA / BLA)', icon: '🏛️', color: '#1a73e8' },
  { id: 'clinical_ind', labelEn: 'Clinical (IND)', labelEs: 'Fase Clínica IND', tooltipEn: 'Clinical Investigational (IND)', tooltipEs: 'En Investigación Clínica Activa (IND)', icon: '🔬', color: '#d97706' },
  { id: 'analytical', labelEn: 'Analytical Grade', labelEs: 'Estándar Analítico', tooltipEn: 'Analytical Reference Standards', tooltipEs: 'Estándar de Referencia Analítica', icon: '🧪', color: '#64748b' }
];

function resolveProductFda(product) {
  const status = getFdaPeptideStatus(product);
  if (status) return status;
  return {
    status: FDA_STATUS_TYPES?.RESEARCH_ANALYTICAL_STANDARD || 'research_analytical_standard',
    badgeLabel: 'Analytical Reference Standard',
    shortBadge: 'Analytical Standard',
    shortCode: 'STANDARD',
    colorScheme: {
      bg: '#f1f5f9',
      border: '#cbd5e1',
      text: '#475569',
      icon: '🧪'
    }
  };
}

function getFdaFilterBucket(product) {
  const fda = getFdaPeptideStatus(product);
  if (!fda) return 'analytical';
  if (
    fda.status === FDA_STATUS_TYPES?.HHS_503A_ENFORCEMENT_DISCRETION ||
    fda.status === FDA_STATUS_TYPES?.FDA_PCAC_503A_RECOMMENDED
  ) {
    return 'fda_503a';
  }
  if (fda.status === FDA_STATUS_TYPES?.FDA_APPROVED) {
    return 'fda_approved';
  }
  if (fda.status === FDA_STATUS_TYPES?.CLINICAL_INVESTIGATIONAL) {
    return 'clinical_ind';
  }
  return 'analytical';
}

const CATEGORY_ORDER = [
  'repair',
  'metabolic',
  'longevity',
  'neuro',
  'growth_hormone',
  'cosmetic',
  'general_health',
  'supplies'
];

const DOSAGE_STRENGTHS = [
  { id: 'all', label: 'All Strengths' },
  { id: '5mg', label: '5 mg' },
  { id: '10mg', label: '10 mg' },
  { id: '20mg_plus', label: '15–20 mg+' }
];

const CLINICAL_PRESETS = [
  {
    id: 'tissue_repair',
    name: 'Tissue Repair Protocol',
    icon: '🩹',
    description: 'BPC-157 (10mg) + TB-500 (10mg)',
    categoryName: 'Musculoskeletal & Tendon Repair',
    accent: '#0284c7',
    accentBg: '#f0f9ff',
    searchTerms: ['bpc-157', 'tb-500'],
    dosageFilter: '10mg',
    cycleDuration: '6 to 8 Consecutive Weeks',
    administration: 'Subcutaneous (SQ) injection near injury site or abdomen',
    posology: 'BPC-157: 250–500 mcg twice daily. TB-500: 2.0–2.5 mg twice weekly.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'BPC-157 accelerates focal neo-angiogenesis via VEGF upregulation and stabilizes granulation tissue. TB-500 acts as a cellular G-actin sequestrant, inducing rapid migration of myoblasts and endothelial progenitor cells into damaged connective tissue matrices.',
    outcomes: [
      'Accelerated collagen Type I & III synthesis in tendon-to-bone junctions',
      'Rapid resolution of micro-vascular inflammation and muscular soreness',
      'Systemic gastro-protective endothelial stabilization'
    ],
    peptides: [
      { name: 'BPC-157', dosage: '10 mg', role: 'Angiogenic Repair & Collagen Synthesis' },
      { name: 'TB-500 (Thymosin Beta-4)', dosage: '10 mg', role: 'Actin Regulation & Fibroblast Migration' }
    ]
  },
  {
    id: 'metabolic_glp1',
    name: 'Metabolic & GLP-1 Protocol',
    icon: '⚡',
    description: 'Tirzepatide (10mg) + Retatrutide (10mg)',
    categoryName: 'Dual/Triple Incretin Synergy',
    accent: '#16a34a',
    accentBg: '#f0fdf4',
    searchTerms: ['tirzepatide', 'retatrutide'],
    dosageFilter: '10mg',
    cycleDuration: '8 to 12 Weeks Titration',
    administration: 'Subcutaneous (SQ) injection once weekly (abdominal rotation)',
    posology: 'Starting titration: 2.5 mg once weekly for 4 weeks, escalating to 5.0 mg – 7.5 mg weekly based on glycemic/adipose response.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Simultaneous GLP-1 (satiety & gastric delay), GIP (adipose lipid buffering & insulinotropic balance), and Glucagon receptor agonism (mitochondrial thermogenesis and resting energy expenditure enhancement).',
    outcomes: [
      'Significant reduction in visceral adipose tissue and waist circumference',
      'Suppression of food noise and restoration of glycemic sensitivity',
      'Hepatic steatosis resolution through glucagon-mediated lipid clearance'
    ],
    peptides: [
      { name: 'Tirzepatide', dosage: '10 mg', role: 'Dual GIP / GLP-1 Receptor Agonist' },
      { name: 'Retatrutide', dosage: '10 mg', role: 'Triple GIP / GLP-1 / Glucagon Agonist' }
    ]
  },
  {
    id: 'cellular_longevity',
    name: 'Longevity & Cellular Protocol',
    icon: '🧬',
    description: 'Epithalon (10mg) + MOTS-c (10mg)',
    categoryName: 'Telomeric & Mitochondrial Health',
    accent: '#7c3aed',
    accentBg: '#faf5ff',
    searchTerms: ['epithalon', 'mots-c'],
    dosageFilter: '10mg',
    cycleDuration: '20 to 60 Days Cyclic Routine',
    administration: 'Subcutaneous (SQ) injection (morning upon waking)',
    posology: 'Epithalon: 5–10 mg daily for 10–20 days (repeat 2x per year). MOTS-c: 5–10 mg 3x weekly for 4–8 weeks.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Epithalon induces telomerase elongation and regulates pineal melatonin/circadian expression. MOTS-c translocates to the cell nucleus upon metabolic stress to trigger AMPK activation and mitochondrial biogenesis.',
    outcomes: [
      'Cellular senescence defense and genomic integrity stabilization',
      'Enhanced insulin sensitivity and systemic metabolic flexibility',
      'Deep circadian rhythm realignment and slow-wave sleep depth'
    ],
    peptides: [
      { name: 'Epithalon', dosage: '10 mg', role: 'Telomerase Induction & Pineal Regulation' },
      { name: 'MOTS-c', dosage: '10 mg', role: 'Mitochondrial-Derived Peptide & AMPK Activator' }
    ]
  },
  {
    id: 'cognitive_neuro',
    name: 'Neuro & Focus Protocol',
    icon: '🧠',
    description: 'Semax (10mg) + Selank (10mg)',
    categoryName: 'Neuropeptide Cognitive Optimization',
    accent: '#ea580c',
    accentBg: '#fff7ed',
    searchTerms: ['semax', 'selank'],
    dosageFilter: '10mg',
    cycleDuration: '4 to 6 Weeks Consecutive Cycle',
    administration: 'Subcutaneous (SQ) or Intranasal reconstitutions',
    posology: 'Semax: 250–500 mcg morning. Selank: 250–500 mcg late afternoon or evening.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'Semax triggers potent BDNF (Brain-Derived Neurotrophic Factor) and TrkB receptor expression in the hippocampus. Selank modulates GABAergic neurotransmission and suppresses enkephalin degradation without sedation.',
    outcomes: [
      'Marked enhancement of executive focus, working memory, and mental stamina',
      'Robust stress resilience and reduction of Generalized Anxiety symptoms',
      'Cerebrovascular neuroprotection and synaptic plasticity enhancement'
    ],
    peptides: [
      { name: 'Semax', dosage: '10 mg', role: 'BDNF/TrkB Upregulation & Executive Function' },
      { name: 'Selank', dosage: '10 mg', role: 'GABA-A Modulation & Stress Reduction' }
    ]
  },
  {
    id: 'gh_secretagogue',
    name: 'GH Secretagogue Axis',
    icon: '🚀',
    description: 'CJC-1295 (5mg) + Ipamorelin (5mg)',
    categoryName: 'Somatotropic Pituitary Pulsatility',
    accent: '#0d9488',
    accentBg: '#f0fdfa',
    searchTerms: ['cjc-1295', 'ipamorelin'],
    dosageFilter: '5mg',
    cycleDuration: '8 to 12 Consecutive Weeks (5 days on / 2 days off)',
    administration: 'Subcutaneous (SQ) pre-bedtime on an empty stomach (2h post-meal)',
    posology: '100–200 mcg CJC-1295 + 100–300 mcg Ipamorelin once daily before sleep.',
    bacWater: '2.0 mL Bacteriostatic Water per vial',
    mechanism: 'CJC-1295 (GHRH analog) amplifies natural growth hormone pulse amplitude, while Ipamorelin (selective GHSR-1a agonist) triggers pituitary release without elevating cortisol, prolactin, or appetite-stimulating ghrelin.',
    outcomes: [
      'Pulsatile nocturnal growth hormone & circulating IGF-1 elevation',
      'Enhanced lean body mass preservation and lipolysis',
      'Accelerated micro-connective tissue repair and deeper stage-4 restorative sleep'
    ],
    peptides: [
      { name: 'CJC-1295 (No DAC)', dosage: '5 mg', role: 'GHRH Secretagogue Pulse Amplifier' },
      { name: 'Ipamorelin', dosage: '5 mg', role: 'Selective Ghrelin/GHSR-1a Receptor Agonist' }
    ]
  }
];

/**
 * Google Cloud UX Dedicated Mobile Card for Peptide Price Schedule
 * (Rule #23: Mobile-First UX Compatibility)
 * Displays each peptide with 44px touch targets, 2-column pricing tiles (Single Vial vs Box ×10),
 * live proforma cart status, and public specs link.
 */
function PeptideMobileCard({ row, handleAddToCart, cartItems = {}, formatPrice, lang = 'en', onOpenSpecs, onOpenAi }) {
  const [isClinicalExpanded, setIsClinicalExpanded] = useState(false);
  const isEs = lang === 'es';
  const p10 = row.pack10Price || (row.unitPrice * 10 * 0.85);
  const perUnit = row.tier10UnitPrice || (row.unitPrice * 0.85);
  const discountPct = Math.max(10, Math.round((1 - (p10 / (row.unitPrice * 10))) * 100));

  const cleanDose = (row.dosage || '').replace(/[\s+]/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  const slug = row.slug || row.productId || row.id;
  const specsUrl = `/p/${slug}?dose=${cleanDose}`;

  const inCart1x = cartItems[row.id]?.quantity1x || 0;
  const inCart10x = cartItems[row.id]?.quantity10x || 0;
  const hasCart = inCart1x > 0 || inCart10x > 0;

  const clinical = getPeptideClinicalSummary(row.productName, row.therapeuticClass || row.category, lang);
  const blendInfo = parsePeptideBlendDisplay(row.productName, row.dosage);

  return (
    <div style={{
      background: '#ffffff',
      border: hasCart ? '1.5px solid #1a73e8' : '1px solid #dadce0',
      borderRadius: '8px',
      padding: '12px 14px',
      marginBottom: '10px',
      boxShadow: hasCart ? '0 2px 8px rgba(26,115,232,0.18)' : '0 1px 3px rgba(60,64,67,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Top Header: Compound Name, Dosage & Specs Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Link
              href={specsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#1a73e8',
                textDecoration: 'none',
                wordBreak: 'break-word'
              }}
            >
              {blendInfo.isBlend ? blendInfo.titleLine : row.productName}
            </Link>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              background: '#e8f0fe',
              color: '#1a73e8',
              border: '1px solid #c2e7ff',
              padding: '2px 7px',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              {blendInfo.isBlend ? blendInfo.dosageMain : row.dosage}
            </span>
          </div>
          {blendInfo.isBlend && blendInfo.compositionLine && (
            <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
              {blendInfo.compositionLine}
            </div>
          )}
          <div style={{ fontSize: '0.70rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginTop: '3px' }}>
            {row?.categoryMeta?.label || row.therapeuticClass || (isEs ? 'Péptido Clínico Certificado' : 'Certified Clinical Peptide')}
          </div>
        </div>

        {/* Specs link button (Golden Rule: Opens public specs page in new tab) */}
        <Link
          href={specsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#1a73e8',
            background: '#ffffff',
            border: '1px solid #c2e7ff',
            padding: '6px 9px',
            borderRadius: '4px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            minHeight: '34px'
          }}
          title={`Open public clinical specs for ${row.productName} (${row.dosage})`}
        >
          <span>📄 {isEs ? 'Ficha' : 'Specs'}</span>
          <span>↗</span>
        </Link>
      </div>

      {/* In-Cart Active Badge */}
      {hasCart && (
        <div style={{
          background: '#e8f0fe',
          border: '1px solid #c2e7ff',
          borderRadius: '4px',
          padding: '5px 9px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#1a73e8',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Check size={12} />
          <span>{isEs ? 'En Proforma:' : 'In Proforma:'} {inCart1x > 0 ? `${inCart1x} vial${inCart1x > 1 ? (isEs ? 'es' : 's') : ''}` : ''}{inCart1x > 0 && inCart10x > 0 ? ' + ' : ''}{inCart10x > 0 ? `${inCart10x} ${isEs ? 'pack' : 'pack'}${inCart10x > 1 ? 's' : ''} (×10)` : ''}</span>
        </div>
      )}

      {/* 2-Column Action Tiles: Single Vial vs Pack of 10 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
      }}>
        {/* Tile 1: Single Vial */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dadce0',
          borderRadius: '6px',
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <div style={{ fontSize: '0.66rem', color: '#5f6368', fontWeight: 600, textTransform: 'uppercase' }}>
              {isEs ? 'Vial Individual (1x)' : 'Single Vial (1x)'}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124', fontFamily: 'monospace', marginTop: '2px' }}>
              {formatPrice ? formatPrice(row.unitPrice) : `$${row.unitPrice}`}
            </div>
            <div style={{ fontSize: '0.64rem', color: '#5f6368' }}>
              {isEs ? 'por vial estéril' : 'per sterile vial'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAddToCart && handleAddToCart(row, '1x')}
            style={{
              width: '100%',
              minHeight: '44px',
              fontSize: '0.80rem',
              fontWeight: 700,
              background: '#ffffff',
              border: '1.5px solid #dadce0',
              borderRadius: '6px',
              color: '#3c4043',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <Plus size={14} />
            <span>1 Vial</span>
          </button>
        </div>

        {/* Tile 2: Pack of 10 */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
              <span style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                {isEs ? 'Pack de 10' : 'Pack of 10'}
              </span>
              <span style={{
                fontSize: '0.60rem',
                fontWeight: 800,
                color: '#15803d',
                background: '#dcfce7',
                border: '1px solid #86efac',
                padding: '1px 4px',
                borderRadius: '3px'
              }}>
                -{discountPct}% Pack
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803d', fontFamily: 'monospace', marginTop: '2px' }}>
              {formatPrice ? formatPrice(p10) : `$${p10.toFixed(2)}`}
            </div>
            <div style={{ fontSize: '0.64rem', color: '#166534', fontFamily: 'monospace' }}>
              ({formatPrice ? formatPrice(perUnit) : `$${perUnit.toFixed(2)}`}/vial)
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAddToCart && handleAddToCart(row, '10x')}
            style={{
              width: '100%',
              minHeight: '44px',
              fontSize: '0.80rem',
              fontWeight: 700,
              background: '#1a73e8',
              border: '1.5px solid #1a73e8',
              borderRadius: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: '0 1px 3px rgba(26,115,232,0.25)'
            }}
          >
            <Box size={14} />
            <span>+Pack ×10</span>
          </button>
        </div>
      </div>

      {/* ── Google Cloud UX Clinical Pharmacology & Dosing Quick-Ref Inspector ── */}
      <div style={{ marginTop: '2px' }}>
        <button
          type="button"
          onClick={() => setIsClinicalExpanded(!isClinicalExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 10px',
            background: isClinicalExpanded ? '#ffffff' : '#f8fafc',
            border: isClinicalExpanded ? '1.5px solid #1a73e8' : '1px solid #dadce0',
            borderRadius: isClinicalExpanded ? '6px 6px 0 0' : '6px',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 750,
            color: isClinicalExpanded ? '#1a73e8' : '#3c4043',
            transition: 'all 0.15s ease',
            boxShadow: isClinicalExpanded ? '0 1px 3px rgba(26,115,232,0.12)' : 'none'
          }}
          aria-expanded={isClinicalExpanded}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="#1a73e8" />
            <span>{isEs ? 'Guía Clínica & Posología B2B' : 'Clinical Pharmacology & Dosing Guide'}</span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              background: isClinicalExpanded ? '#e8f0fe' : '#f1f3f4',
              color: isClinicalExpanded ? '#1a73e8' : '#5f6368',
              padding: '1px 5px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              Quick-Ref
            </span>
          </span>
          {isClinicalExpanded ? <ChevronUp size={14} color="#1a73e8" /> : <ChevronDown size={14} color="#5f6368" />}
        </button>

        {isClinicalExpanded && (
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #1a73e8',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.74rem',
            lineHeight: 1.48,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.15s ease'
          }}>
            {/* GCP Cloud Details Meta Chips Ribbon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#1a73e8',
                background: '#e8f0fe',
                border: '1px solid #c2e7ff',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Activity size={10} />
                <span>{clinical.route || 'SubQ'}</span>
              </span>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 650,
                color: '#475569',
                background: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Clock size={10} color="#d97706" />
                <span>{isEs ? 'T1/2:' : 'Half-life:'} {clinical.halfLife}</span>
              </span>
              {clinical.casNumber && (
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 650,
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>
                  CAS: {clinical.casNumber}
                </span>
              )}
            </div>

            {/* Indication Block */}
            <div>
              <div style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#64748b',
                marginBottom: '2px'
              }}>
                {isEs ? 'Indicación Clínica Primaria' : 'Primary Clinical Indication'}
              </div>
              <p style={{ margin: 0, color: '#1e293b', fontSize: '0.76rem', lineHeight: 1.48 }}>
                {clinical.indication}
              </p>
            </div>

            {/* MoA Block */}
            <div>
              <div style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#64748b',
                marginBottom: '2px'
              }}>
                {isEs ? 'Mecanismo de Acción (MoA)' : 'Mechanism of Action (MoA)'}
              </div>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.73rem', lineHeight: 1.45 }}>
                {clinical.moa}
              </p>
            </div>

            {/* Reconstitution & Syringe Box (GCP Spec Box) */}
            <div style={{
              background: '#f0f7ff',
              border: '1px solid #c2e7ff',
              borderRadius: '6px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Droplets size={11} color="#0284c7" />
                <span>{isEs ? 'Reconstitución & Regla de Jeringa (U-100)' : 'Reconstitution & Syringe Math (U-100)'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 700 }}>
                {clinical.recon}
              </div>
              <div style={{ fontSize: '0.71rem', color: '#0369a1', fontFamily: 'monospace', fontWeight: 650 }}>
                {clinical.syringeCalc}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#334155', marginTop: '1px' }}>
                <strong style={{ color: '#0f172a' }}>{isEs ? 'Pauta estándar:' : 'Standard posology:'}</strong> {clinical.dose}
              </div>
            </div>

            {/* Clinical Synergy / Stack Callout (High-Conversion B2B) */}
            <div style={{
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '6px',
              padding: '7px 9px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Layers size={11} color="#7c3aed" />
                <span>{isEs ? 'Sinergia Clínica Recomendada (Stack)' : 'Recommended Clinical Stack'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#581c87', lineHeight: 1.42 }}>
                {clinical.stack}
              </div>
            </div>

            {/* Action Bar (GCP 32px Buttons) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '6px',
              marginTop: '2px'
            }}>
              <button
                type="button"
                onClick={() => onOpenAi && onOpenAi(row)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(13, 148, 136, 0.12) 100%)',
                  color: '#0284c7',
                  border: '1px solid rgba(2, 132, 199, 0.35)',
                  padding: '7px 10px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  minHeight: '34px'
                }}
              >
                <Sparkles size={12} color="#0284c7" />
                <span>{isEs ? 'Calcular Dosis en AI ✨' : 'Dosing Math with AI ✨'}</span>
              </button>

              <Link
                href={specsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '7px 9px',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  minHeight: '34px'
                }}
              >
                <span>{isEs ? 'Ficha COA' : 'Specs COA'}</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
PeptideMobileCard.displayName = 'PeptideMobileCard';

export const SHIPPING_DESTINATIONS = [
  {
    id: 'EU',
    flag: '🇪🇺',
    labelEn: 'Europe',
    labelEs: 'Europa',
    rateBadge: '€60',
    usdCost: Math.round((60 / 0.92) * 100) / 100, // $65.22 USD
    eurCost: 60,
    defaultCountry: 'Spain',
    defaultPhoneCode: 'es'
  },
  {
    id: 'US',
    flag: '🇺🇸',
    labelEn: 'USA',
    labelEs: 'USA',
    rateBadge: '$25',
    usdCost: 25,
    eurCost: Math.round(25 * 0.92 * 100) / 100, // €23.00 EUR
    defaultCountry: 'United States',
    defaultPhoneCode: 'us'
  },
  {
    id: 'AE',
    flag: '🇦🇪',
    labelEn: 'UAE',
    labelEs: 'UAE',
    rateBadge: '$80',
    usdCost: 80,
    eurCost: Math.round(80 * 0.92 * 100) / 100, // €73.60 EUR
    defaultCountry: 'United Arab Emirates',
    defaultPhoneCode: 'ae'
  }
];

export default function PeptidesPriceListClient({
  initialProducts = [],
  referralCode = 'CAT-RX-7482',
  isDistributor = false,
  initialLang = 'en',
  initialCurrency = 'USD',
  initialDest = 'EU',
  trackingCode = null
}) {
  const [currency, setCurrency] = useState(initialCurrency || 'USD'); // USD, EUR, AED
  const [shippingDest, setShippingDest] = useState(initialDest || 'EU'); // EU (€60), US ($25), AE ($80)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFdaStatus, setSelectedFdaStatus] = useState('all');
  const [selectedStrength, setSelectedStrength] = useState('all'); // 'all' | '5mg' | '10mg' | '20mg_plus'
  const [scopeMode] = useState('filtered'); // Direct active view (no user-facing technical switcher)
  const [copied, setCopied] = useState(false);
  const [hasRestoredCart, setHasRestoredCart] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedSpecsProduct, setSelectedSpecsProduct] = useState(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [inquiryProductContext, setInquiryProductContext] = useState(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isFdaSheetOpen, setIsFdaSheetOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);
  const [trackingCodeState] = useState(trackingCode);

  // Strict English default ('en') unless ?lang=es is explicitly in the URL or selected via top button
  const [lang, setLang] = useState(initialLang || 'en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const pLang = (url.searchParams.get('lang') || '').toLowerCase();
      const resolvedLang = (pLang === 'es' || pLang === 'en') ? pLang : 'en';
      setLang(resolvedLang);

      const pCurr = (url.searchParams.get('currency') || url.searchParams.get('curr') || '').toUpperCase();
      const resolvedCurr = (pCurr === 'USD' || pCurr === 'EUR' || pCurr === 'AED') ? pCurr : 'USD';
      setCurrency(resolvedCurr);

      const pDest = (url.searchParams.get('dest') || url.searchParams.get('region') || '').toUpperCase();
      const resolvedDest = (pDest === 'EU' || pDest === 'US' || pDest === 'AE') ? pDest : 'EU';
      setShippingDest(resolvedDest);

      // Always ensure ?lang= & ?currency= & ?dest= are explicitly visible in the browser URL
      url.searchParams.set('lang', resolvedLang);
      url.searchParams.set('currency', resolvedCurr);
      url.searchParams.set('dest', resolvedDest);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const isEs = lang === 'es';

  const handleLanguageChange = (nextLang) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', nextLang);
        localStorage.setItem('atlas_catalog_lang', nextLang);
        window.dispatchEvent(new CustomEvent('atlas-language-changed', { detail: { lang: nextLang } }));
      } catch (_e) {
        // Ignore storage errors in restricted contexts
      }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      url.searchParams.set('currency', currency);
      url.searchParams.set('dest', shippingDest);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCurrencyChange = (nextCurrency) => {
    setCurrency(nextCurrency);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      url.searchParams.set('currency', nextCurrency);
      url.searchParams.set('dest', shippingDest);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleShippingDestChange = (nextDest) => {
    setShippingDest(nextDest);
    const destObj = SHIPPING_DESTINATIONS.find(d => d.id === nextDest);
    if (destObj) {
      setOrderForm(prev => ({
        ...prev,
        country: destObj.defaultCountry,
        phoneCountryCode: destObj.defaultPhoneCode
      }));
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      url.searchParams.set('currency', currency);
      url.searchParams.set('dest', nextDest);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const onLangChange = (e) => {
      if (e?.detail?.lang && (e.detail.lang === 'en' || e.detail.lang === 'es')) {
        setLang(e.detail.lang);
      }
    };
    window.addEventListener('atlas-language-changed', onLangChange);
    return () => window.removeEventListener('atlas-language-changed', onLangChange);
  }, []);

  // Debounce search query to keep main thread at 60fps on mobile (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Order Drawer State
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true); // Organized by therapeutic categories by default
  const [cartItems, setCartItems] = useState({}); // { [productId]: { quantity1x: 0, quantity10x: 0, product } }
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    phoneCountryCode: 'es',
    country: 'Spain',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    company_fax: '' // Anti-spam Honeypot (hidden from real users)
  });

  // ── Cart & Contact Draft Persistence (Anti-abandonment) ──
  const storageKey = `atlas_peptides_b2b_cart_${referralCode || 'CAT-RX-7482'}`;

  // Persist current tier & referral to localStorage so registration inherits correct pricing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_peptides_tier', isDistributor ? 'distributor' : 'wholesaler');
        localStorage.setItem('atlas_peptides_referral', referralCode || (isDistributor ? 'DISTRIBUTOR-15' : 'WHOLESALER-B2B'));
      } catch (_err) {
        // Ignore localStorage quota or private browsing exceptions
      }
    }
  }, [isDistributor, referralCode]);

  // Hydrate cart & contact on initial mount (asynchronously to avoid cascading renders)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setCartItems(parsed);
            setHasRestoredCart(true);
          }
        }
        const savedContact = localStorage.getItem('atlas_peptides_b2b_contact');
        if (savedContact) {
          const parsedContact = JSON.parse(savedContact);
          if (parsedContact && typeof parsedContact === 'object') {
            setOrderForm(prev => ({ ...prev, ...parsedContact, company_fax: '' }));
          }
        }
      } catch (err) {
        console.warn('Could not restore cached cart:', err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (Object.keys(cartItems).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.warn('Could not save cart:', err);
    }
  }, [cartItems, storageKey]);

  // Sync contact info to localStorage (excluding honeypot)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const toSave = { ...orderForm };
      delete toSave.company_fax;
      localStorage.setItem('atlas_peptides_b2b_contact', JSON.stringify(toSave));
    } catch (err) {
      console.warn('Could not save contact draft:', err);
    }
  }, [orderForm]);

  // Currency conversions (Base USD)
  const fxRate = useMemo(() => {
    if (currency === 'EUR') return 0.92;
    if (currency === 'AED') return 3.6725;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'EUR') return '€';
    if (currency === 'AED') return 'AED ';
    return '$';
  }, [currency]);

  const formatPrice = useCallback((usdAmount) => {
    if (usdAmount == null || isNaN(usdAmount)) return '—';
    const converted = usdAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  // Helper to extract numeric dosage for ascending sort (2mg < 5mg < 10mg < 20mg)
  const parseDoseNum = (str = '') => {
    const match = String(str).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Map, categorize and sort products by Category Priority and Ascending Dose
  const processedProducts = useMemo(() => {
    const mapped = initialProducts.map((p) => {
      const nameLower = (p.productName || '').toLowerCase();
      let categoryKey = p.primaryGoal || 'general_health';

      if (nameLower.includes('bac water') || nameLower.includes('bacteriostatic') || nameLower.includes('water') || nameLower.includes('diluent') || nameLower.includes('solvent') || nameLower.includes('saline')) {
        categoryKey = 'supplies';
      } else if (nameLower.includes('semaglutide') || nameLower.includes('tirzepatide') || nameLower.includes('retatrutide') || nameLower.includes('aod') || nameLower.includes('cagrilintide') || nameLower.includes('survodutide')) {
        categoryKey = 'metabolic';
      } else if (nameLower.includes('bpc') || nameLower.includes('tb-500') || nameLower.includes('kpv') || nameLower.includes('thymosin beta')) {
        categoryKey = 'repair';
      } else if (nameLower.includes('epithalon') || nameLower.includes('mots-c') || nameLower.includes('ss-31') || nameLower.includes('humanin') || nameLower.includes('foxo4') || nameLower.includes('nad')) {
        categoryKey = 'longevity';
      } else if (nameLower.includes('semax') || nameLower.includes('selank') || nameLower.includes('dihexa') || nameLower.includes('oxytocin') || nameLower.includes('pinealon')) {
        categoryKey = 'neuro';
      } else if (nameLower.includes('cjc') || nameLower.includes('ipamorelin') || nameLower.includes('sermorelin') || nameLower.includes('ghrp') || nameLower.includes('hexarelin') || nameLower.includes('tesamorelin')) {
        categoryKey = 'growth_hormone';
      } else if (nameLower.includes('ghk') || nameLower.includes('ahk') || nameLower.includes('snap-8')) {
        categoryKey = 'cosmetic';
      }

      const fdaStatus = resolveProductFda(p);
      const fdaBucket = getFdaFilterBucket(p);
      const meta = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.general_health;

      return {
        ...p,
        categoryKey,
        categoryMeta: {
          ...meta,
          label: isEs ? meta.labelEs : meta.labelEn
        },
        fdaStatus,
        fdaBucket
      };
    });

    // Sort by Category Priority Order, then by Product Name, then by Numerical Dose ascending
    const sorted = [...mapped].sort((a, b) => {
      const catA = CATEGORY_ORDER.indexOf(a.categoryKey) !== -1 ? CATEGORY_ORDER.indexOf(a.categoryKey) : 99;
      const catB = CATEGORY_ORDER.indexOf(b.categoryKey) !== -1 ? CATEGORY_ORDER.indexOf(b.categoryKey) : 99;
      if (catA !== catB) return catA - catB;

      const nameA = (a.productName || '').trim();
      const nameB = (b.productName || '').trim();
      const comp = nameA.localeCompare(nameB);
      if (comp !== 0) return comp;

      return parseDoseNum(a.dosage) - parseDoseNum(b.dosage);
    });

    // Assign sequential item numbers
    return sorted.map((p, idx) => ({
      ...p,
      itemNumber: idx + 1
    }));
  }, [initialProducts, isEs]);

  // Filtering with debounced query (Keeps 60fps responsiveness on mobile devices)
  const filteredProducts = useMemo(() => {
    return processedProducts.filter(p => {
      const q = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.productName || '').toLowerCase().includes(q) ||
        (p.dosage || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.categoryMeta.label || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.categoryKey === selectedCategory;
      const matchesFda = selectedFdaStatus === 'all' || p.fdaBucket === selectedFdaStatus;

      let matchesStrength = true;
      if (selectedStrength !== 'all') {
        const d = (p.dosage || '').toLowerCase();
        if (selectedStrength === '5mg') {
          matchesStrength = d.includes('5 mg') || d.includes('5mg') || d.includes('5.0');
        } else if (selectedStrength === '10mg') {
          matchesStrength = d.includes('10 mg') || d.includes('10mg');
        } else if (selectedStrength === '20mg_plus') {
          matchesStrength = d.includes('15') || d.includes('20') || d.includes('30') || d.includes('50') || d.includes('60') || d.includes('100');
        }
      }

      return matchesSearch && matchesCat && matchesFda && matchesStrength;
    });
  }, [processedProducts, debouncedSearchQuery, selectedCategory, selectedFdaStatus, selectedStrength]);

  // Cart quantity update & removal helpers
  const updateItemQuantity = useCallback((productId, type, delta) => {
    setCartItems(prev => {
      const existing = prev[productId];
      if (!existing) return prev;
      const field = type === '10x' ? 'quantity10x' : 'quantity1x';
      const nextVal = Math.max(0, (existing[field] || 0) + delta);
      const otherField = type === '10x' ? 'quantity1x' : 'quantity10x';
      if (nextVal === 0 && (existing[otherField] || 0) === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...existing,
          [field]: nextVal
        }
      };
    });
  }, []);

  const handlePrintProforma = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please select formulations before printing or saving a PDF proforma.');
      return;
    }
    window.print();
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = useCallback((product, packType) => {
    setCartItems(prev => {
      const current = prev[product.id] || { quantity1x: 0, quantity10x: 0, product };
      const updated = {
        ...current,
        [packType === '10x' ? 'quantity10x' : 'quantity1x']: current[packType === '10x' ? 'quantity10x' : 'quantity1x'] + 1
      };
      return { ...prev, [product.id]: updated };
    });
    toast.success(`Added ${product.productName} (${packType === '10x' ? 'Pack ×10' : '1x Vial'}) to request ✓`);
  }, []);

  const totalCartCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity1x + (item.quantity10x * 10), 0);
  }, [cartItems]);

  const totalCartValueUsd = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const p = item.product;
      const v1x = (item.quantity1x || 0) * (p.unitPrice || 0);
      const v10x = (item.quantity10x || 0) * (p.pack10Price || (p.unitPrice * 10 * 0.85));
      return sum + v1x + v10x;
    }, 0);
  }, [cartItems]);

  // Regional Express Shipping Corridors (Parcels up to 2 kg: EU €60, USA $25, UAE $80)
  const activeShippingCorridor = useMemo(() => {
    return SHIPPING_DESTINATIONS.find(d => d.id === shippingDest) || SHIPPING_DESTINATIONS[0];
  }, [shippingDest]);

  const shippingCostUsd = useMemo(() => {
    return activeShippingCorridor.usdCost;
  }, [activeShippingCorridor]);

  const shippingCostCurrentCurrency = useMemo(() => {
    if (currency === 'EUR') return activeShippingCorridor.eurCost;
    if (currency === 'AED') return Math.round(activeShippingCorridor.usdCost * 3.6725 * 100) / 100;
    return activeShippingCorridor.usdCost;
  }, [currency, activeShippingCorridor]);

  const grandTotalCartValueUsd = useMemo(() => {
    return totalCartCount > 0 ? (totalCartValueUsd + shippingCostUsd) : 0;
  }, [totalCartCount, totalCartValueUsd, shippingCostUsd]);

  // 1-Click Protocol Preset Addition Helper (Mejora #2)
  const handleAddProtocolPreset = useCallback((preset, isPack10 = false) => {
    let addedCount = 0;
    const itemsToAdd = {};

    preset.searchTerms.forEach(term => {
      const cleanTerm = term.toLowerCase().trim();
      // Prioritize pure individual peptide without picking up combo blends (e.g. 'tb-500' shouldn't grab 'bpc-157 + tb-500')
      const match = processedProducts.find(p => {
        const name = (p.productName || '').toLowerCase().trim();
        const dose = (p.dosage || '').toLowerCase();
        const isCleanMatch = (name === cleanTerm || name.startsWith(`${cleanTerm} `) || name.startsWith(`${cleanTerm}(`)) && !name.includes('+');
        return isCleanMatch && (preset.dosageFilter ? dose.includes(preset.dosageFilter) : true);
      }) || processedProducts.find(p => {
        const name = (p.productName || '').toLowerCase().trim();
        const dose = (p.dosage || '').toLowerCase();
        return name.includes(cleanTerm) && (preset.dosageFilter ? dose.includes(preset.dosageFilter) : true);
      }) || processedProducts.find(p => (p.productName || '').toLowerCase().includes(cleanTerm));

      if (match) {
        itemsToAdd[match.id] = match;
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setCartItems(prev => {
        const updated = { ...prev };
        Object.values(itemsToAdd).forEach(prod => {
          const current = updated[prod.id] || { quantity1x: 0, quantity10x: 0, product: prod };
          if (isPack10) {
            updated[prod.id] = {
              ...current,
              quantity10x: current.quantity10x + 1
            };
          } else {
            updated[prod.id] = {
              ...current,
              quantity1x: current.quantity1x + 1
            };
          }
        });
        return updated;
      });
      toast.success(`Added ${preset.name} (${addedCount} formulations${isPack10 ? ' · Pack ×10' : ''}) to request! ✓`);
    } else {
      toast.info(`Could not automatically locate items for ${preset.name}`);
    }
  }, [processedProducts]);

  // Direct Order via WhatsApp Helper (Mejora #4)
  const handleOrderViaWhatsApp = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please add formulations before ordering via WhatsApp');
      return;
    }

    const itemsListText = Object.values(cartItems).map(item => {
      const qty1x = item.quantity1x > 0 ? `${item.quantity1x}x 1x Vial` : null;
      const qty10x = item.quantity10x > 0 ? `${item.quantity10x}x Pack ×10` : null;
      const qtyStr = [qty1x, qty10x].filter(Boolean).join(', ');
      const lineTotal = (item.quantity1x * item.product.unitPrice) + (item.quantity10x * (item.product.pack10Price || item.product.unitPrice * 8.5));
      return `• ${item.product.productName} (${item.product.dosage || 'Lyophilized'}) [${qtyStr}] ── ${currencySymbol}${(lineTotal * fxRate).toFixed(2)}`;
    }).join('\n');

    const totalStr = `${formatPrice(grandTotalCartValueUsd)} (${currency})`;
    const clinicStr = orderForm.clinicName || orderForm.name ? `\nClinic: ${orderForm.clinicName || orderForm.name}` : '';
    const emailStr = orderForm.email ? `\nEmail: ${orderForm.email}` : '';
    const destinationStr = `\nDestination Corridor: ${activeShippingCorridor.flag} ${activeShippingCorridor.labelEn} (${orderForm.city ? `${orderForm.city}, ` : ''}${orderForm.country || activeShippingCorridor.defaultCountry})`;

    const message = `Hello, I would like to place this clinical peptide proforma request (Partner Code: ${referralCode || 'CAT-RX-7482'}):

${itemsListText}

Subtotal: ${formatPrice(totalCartValueUsd)}
Shipping (${activeShippingCorridor.labelEn} · Parcels ≤ 2 kg): ${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)}
Grand Total: ${totalStr}${clinicStr}${emailStr}${destinationStr}

Please coordinate 24-hour proforma confirmation and secure payment link. Thank you!`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  }, [cartItems, currencySymbol, fxRate, formatPrice, grandTotalCartValueUsd, currency, orderForm, referralCode, totalCartValueUsd, shippingCostCurrentCurrency, activeShippingCorridor]);

  const handleShareSchedule = async () => {
    if (typeof window === 'undefined') return;
    const shareUrlObj = new URL(window.location.href);
    shareUrlObj.searchParams.set('lang', lang);
    shareUrlObj.searchParams.set('currency', currency);
    shareUrlObj.searchParams.set('dest', shippingDest);
    if (selectedCategory && selectedCategory !== 'all') {
      shareUrlObj.searchParams.set('category', selectedCategory);
    }
    const shareUrl = shareUrlObj.toString();

    const shareTitle = isEs
      ? `Tarifario Oficial de Viales de Péptidos B2B (${currency}) · Atlas Health Services`
      : `Official Clinical Peptide Vials B2B Schedule (${currency}) · Atlas Health Services`;
    const shareText = isEs
      ? `Consulta el tarifario oficial mayorista y para clínicas de péptidos liofilizados certificados (≥99.0% HPLC) en ${currency} con descuentos en Pack ×10.`
      : `View the official wholesale and clinic price schedule for certified lyophilized peptides (≥99.0% HPLC) in ${currency} with Pack ×10 volume savings.`;

    const isMobileDevice = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');

    if (isMobileDevice && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(
        isEs
          ? `Enlace copiado con idioma (${lang.toUpperCase()}), divisa (${currency}) y destino (${shippingDest}) ✓`
          : `Schedule link copied with language (${lang.toUpperCase()}), currency (${currency}) & destination (${shippingDest}) ✓`
      );
      setTimeout(() => setCopied(false), 2500);
    } catch (_err) {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Could not copy link');
    }
  };

  // Submit B2B Order Request
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.name || !orderForm.email || !orderForm.phone) {
      toast.error('Please enter your name, email and phone number');
      return;
    }
    // Professional email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email.trim())) {
      toast.error('Please enter a valid professional email address.');
      return;
    }
    // International phone digits validation
    const digits = (orderForm.phone || '').replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      toast.error('Please enter a valid international phone number with country code (e.g. +34 600 000 000).');
      return;
    }
    if (!orderForm.addressLine1 || !orderForm.city || !orderForm.postalCode) {
      toast.error('Please provide full shipping address (Street, City, Postal Code)');
      return;
    }
    if (Object.keys(cartItems).length === 0) {
      toast.error('Your order request is empty. Please select products first.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const itemsPayload = Object.values(cartItems).map(item => {
        const totalVials = item.quantity1x + (item.quantity10x * 10);
        const packPrice = item.product.pack10Price || (item.product.unitPrice * 8.5);
        const subtotal = (item.quantity1x * item.product.unitPrice) + (item.quantity10x * packPrice);
        return {
          id: item.product.id,
          productId: item.product.productId,
          name: item.product.productName,
          productName: item.product.productName,
          dosage: item.product.dosage,
          presentation: item.product.presentation || 'Lyophilized Vial (10R)',
          quantity: totalVials,
          quantity1x: item.quantity1x,
          quantity10x: item.quantity10x,
          totalVials,
          unitPrice: item.product.unitPrice,
          unitPriceUsd: item.product.unitPrice,
          tier10UnitPrice: packPrice / 10,
          subtotal,
          subtotalUsd: subtotal
        };
      });

      const fullAddress = [
        orderForm.addressLine1,
        orderForm.addressLine2,
        orderForm.city,
        orderForm.state,
        orderForm.postalCode,
        orderForm.country
      ].filter(Boolean).join(', ');

      const totalUnits = itemsPayload.reduce((acc, i) => acc + i.totalVials, 0);
      const subtotalUsd = totalCartValueUsd;
      const finalShippingUsd = totalUnits > 0 ? shippingCostUsd : 0;
      const finalGrandTotalUsd = subtotalUsd + finalShippingUsd;

      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: itemsPayload,
          items: itemsPayload,
          contact: orderForm,
          customerName: orderForm.name,
          customerEmail: orderForm.email,
          customerPhone: orderForm.phone,
          customerAddress: fullAddress,
          customerNotes: orderForm.notes,
          shippingDestination: orderForm.country || 'International Express Medical Courier',
          referralCode: referralCode || 'CAT-RX-7482',
          trackingCode: trackingCodeState || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || referralCode,
          catalogId: trackingCodeState || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || null,
          source: 'public_peptides_price_schedule',
          collection: 'vials',
          subtotal: subtotalUsd,
          shippingCost: finalShippingUsd,
          shippingCostEur: 60,
          grandTotal: finalGrandTotalUsd,
          totalAmountUsd: finalGrandTotalUsd,
          totalUnits,
          currency: 'USD',
          currencySymbol: '$',
          company_fax: orderForm.company_fax || '' // Honeypot field
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Could not submit order proforma');
      }

      toast.success('Proforma request submitted successfully! Confirmation sent to your email.');
      setCartItems({});
      try {
        localStorage.removeItem(storageKey);
      } catch (storageErr) {
        console.warn('Could not clear storage cart:', storageErr);
      }
      setIsOrderDrawerOpen(false);
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error(err.message || 'Unable to send order. Please try again or contact support.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // DataTable columns (Strict Rule #30: explicit width, no horizontal scroll, Google Cloud UX)
  const columns = useMemo(() => [
    {
      key: 'itemNumber',
      label: '#',
      width: '54px',
      minWidth: '50px',
      nowrap: true,
      align: 'center',
      sortable: true,
      render: (val, row) => (
        <span style={{
          fontFamily: 'monospace',
          fontSize: '0.80rem',
          color: '#5f6368',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          display: 'inline-block',
          letterSpacing: '-0.02em'
        }}>
          {val ?? row?.itemNumber}
        </span>
      )
    },
    {
      key: 'productName',
      label: isEs ? 'Formulación de Péptido & Concentración' : 'Peptide Formulation & Concentration',
      width: '38%',
      align: 'left', // STRICT: Left-aligned for clean price list readability
      sortable: true,
      render: (_, row) => {
        const itemInCart = cartItems[row.id];
        const v1x = itemInCart?.quantity1x || 0;
        const v10x = itemInCart?.quantity10x || 0;
        const hasSelection = v1x > 0 || v10x > 0;

        const targetSlug = row.slug || row.productId || '';
        const cleanDoseParam = (row.dosage || '').replace(/\s+/g, '').toLowerCase();
        const publicPageUrl = `/p/${encodeURIComponent(targetSlug)}${cleanDoseParam ? `?dose=${encodeURIComponent(cleanDoseParam)}` : ''}`;
        const blendInfo = parsePeptideBlendDisplay(row.productName, row.dosage);

        return (
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: '#1a73e8',
                  letterSpacing: '-0.01em',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                title={isEs ? `Abrir ficha clínica oficial y estructura 3D de ${row.productName} en nueva pestaña` : `Open official clinical datasheet & 3D structure for ${row.productName} in new tab`}
              >
                {blendInfo.isBlend ? blendInfo.titleLine : row.productName}
              </a>
              {row.dosage && (
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#1a73e8',
                  background: '#e8f0fe',
                  border: '1px solid #c2e7ff',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap'
                }}>
                  {blendInfo.isBlend ? blendInfo.dosageMain : row.dosage}
                </span>
              )}
              {/* Specs Button: Navigates directly to the comprehensive public peptide datasheet for this exact dosage */}
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#1a73e8',
                  background: '#ffffff',
                  border: '1px solid #c2e7ff',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e8f0fe';
                  e.currentTarget.style.borderColor = '#1a73e8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#c2e7ff';
                }}
                title={isEs ? `Abrir monografía clínica oficial, CAS, reconstitución y estructura 3D de ${row.productName} ${row.dosage || ''}` : `Open official clinical monograph, CAS, reconstitution & 3D structure for ${row.productName} ${row.dosage || ''} in new tab`}
              >
                <FileText size={11} />
                <span>{isEs ? 'Ficha ↗' : 'Specs ↗'}</span>
              </a>

              <span style={{
                fontSize: '0.64rem',
                fontWeight: 600,
                color: row?.categoryMeta?.color,
                background: row?.categoryMeta?.bg,
                border: `1px solid ${row?.categoryMeta?.border}`,
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap'
              }}>
                {row?.categoryMeta?.label}
              </span>

              {/* FDA Regulatory Status Badge */}
              {row.fdaStatus && (
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: row.fdaStatus.colorScheme?.text || '#065f46',
                  background: row.fdaStatus.colorScheme?.bg || '#ecfdf5',
                  border: `1px solid ${row.fdaStatus.colorScheme?.border || '#6ee7b7'}`,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <span>{row.fdaStatus.colorScheme?.icon || '🛡️'}</span>
                  <span>
                    {isEs
                      ? (row.fdaBucket === 'fda_503a'
                          ? '503A Magistral ✓'
                          : row.fdaBucket === 'fda_approved'
                            ? 'Aprobado FDA ✓'
                            : row.fdaBucket === 'clinical_ind'
                              ? 'Fase Clínica IND'
                              : 'Estándar Analítico')
                      : (row.fdaStatus.shortBadge || '503A')}
                  </span>
                </span>
              )}

              {/* Live Preselected Order Indicator */}
              {hasSelection && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#137333',
                  background: '#e6f4ea',
                  border: '1px solid #ceead6',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Check size={10} />
                  <span>{isEs ? 'En Proforma:' : 'In Proforma:'} {v1x > 0 ? `${v1x} vial${v1x > 1 ? (isEs ? 'es' : 's') : ''}` : ''}{v1x > 0 && v10x > 0 ? ' + ' : ''}{v10x > 0 ? `${v10x} pack${v10x > 1 ? 's' : ''} (×10)` : ''}</span>
                </span>
              )}
            </div>
            {blendInfo.isBlend && blendInfo.compositionLine && (
              <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                {blendInfo.compositionLine}
              </div>
            )}
            <div style={{ fontSize: '0.70rem', color: '#5f6368', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{isEs ? 'Vial Liofilizado Estéril (10R)' : 'Sterile Lyophilized Vial (10R)'}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#137333', fontWeight: 600, whiteSpace: 'nowrap' }}>{isEs ? '≥99.0% Pureza HPLC' : '≥99.0% HPLC Purity'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'unitPrice',
      label: isEs ? `Vial Individual (1x) · ${currency}` : `Single Vial (1x) · ${currency}`,
      width: '17%',
      align: 'left',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#202124', fontSize: '0.92rem' }}>
            {formatPrice(val ?? row.unitPrice)}
          </span>
          <span style={{ fontSize: '0.66rem', color: '#5f6368' }}>{isEs ? 'por vial estéril' : 'per sterile vial'}</span>
        </div>
      )
    },
    {
      key: 'pack10Price',
      label: isEs ? `Pack de 10 (Pack ×10) · ${currency}` : `Pack of 10 (Pack ×10) · ${currency}`,
      width: '20%',
      align: 'left',
      sortable: true,
      render: (_, row) => {
        const p10 = row.pack10Price || (row.unitPrice * 10 * 0.85);
        const perUnit = row.tier10UnitPrice || (row.unitPrice * 0.85);
        const discountPct = Math.max(10, Math.round((1 - (p10 / (row.unitPrice * 10))) * 100));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#137333', fontSize: '0.92rem' }}>
                {formatPrice(p10)}
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#137333',
                background: '#e6f4ea',
                border: '1px solid #ceead6',
                padding: '1px 5px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                -{discountPct}% Pack
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: '#137333', fontFamily: 'monospace' }}>
              ({formatPrice(perUnit)} / vial)
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: isEs ? 'Solicitud de Pedido' : 'Order Request',
      width: '175px',
      minWidth: '170px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', flexWrap: 'nowrap', paddingRight: '8px' }}>
          <button
            onClick={() => handleAddToCart(row, '1x')}
            style={{
              padding: '4px 6px',
              fontSize: '0.69rem',
              fontWeight: 600,
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              color: '#3c4043',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            title={isEs ? 'Añadir 1 vial individual a la proforma' : 'Add 1 single vial to proforma'}
          >
            <Plus size={11} />
            <span>1 Vial</span>
          </button>
          <button
            onClick={() => handleAddToCart(row, '10x')}
            style={{
              padding: '4px 7px',
              fontSize: '0.69rem',
              fontWeight: 600,
              background: '#1a73e8',
              border: '1px solid #1a73e8',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
            title={isEs ? 'Añadir pack de 10 viales con descuento por volumen' : 'Add manufacturer pack of 10 vials (-volume discount)'}
          >
            <Box size={11} />
            <span>+Pack ×10</span>
          </button>
        </div>
      )
    }
  ], [formatPrice, handleAddToCart, currency, cartItems, isEs]);

  // Master-Detail Expandable Clinical Summary Row for Desktop DataTable (Google Cloud Console UX - Golden Rule #4 & #11)
  const renderPeptideClinicalDetail = useCallback((row) => {
    const clinical = getPeptideClinicalSummary(row.productName, row.therapeuticClass || row.category, lang);
    const isEs = lang === 'es';

    return (
      <div style={{
        backgroundColor: '#f8fafc',
        borderLeft: '3px solid #1a73e8',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 1.4rem',
        margin: '0'
      }}>
        {/* Google Cloud Console Definition Grid (Progressive Disclosure - 3 Columns, Zero Duplicates) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.4rem',
          alignItems: 'start'
        }}>
          {/* Column 1: Clinical Pharmacology & Indications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Sparkles size={12} color="#1a73e8" />
                <span>{isEs ? 'Indicación Clínica Primaria' : 'Primary Clinical Indication'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#1e293b', lineHeight: 1.52 }}>
                {clinical.indication}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                marginBottom: '3px'
              }}>
                {isEs ? 'Sistema / Vía Diana' : 'Target System / Pathway'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 650 }}>
                {clinical.targetSystem}
              </div>
            </div>
          </div>

          {/* Column 2: Molecular MoA & Identifiers */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderLeft: '1px solid #edf2f7',
            paddingLeft: '1.25rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Activity size={12} color="#059669" />
                <span>{isEs ? 'Mecanismo de Acción (MoA)' : 'Mechanism of Action (MoA)'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.48 }}>
                {clinical.moa}
              </p>
            </div>

            {clinical.casNumber && (
              <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
                <div style={{
                  fontSize: '0.66rem',
                  fontWeight: 750,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  marginBottom: '3px'
                }}>
                  {isEs ? 'Nº Registro CAS' : 'CAS Registry Number'}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <CopyableId value={clinical.casNumber} />
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Pharmacokinetics, Synergies & Monograph Action */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderLeft: '1px solid #edf2f7',
            paddingLeft: '1.25rem'
          }}>
            {/* Reconstitution & Syringe Math Box (GCP Clinical Spec Box) */}
            <div style={{
              background: '#f0f7ff',
              border: '1px solid #c2e7ff',
              borderRadius: '6px',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}>
              <div style={{
                fontSize: '0.64rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Droplets size={11} color="#0284c7" />
                <span>{isEs ? 'Reconstitución & Regla Jeringa (U-100)' : 'Reconstitution & Syringe Math (U-100)'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 700 }}>
                {clinical.recon}
              </div>
              <div style={{ fontSize: '0.71rem', color: '#0369a1', fontFamily: 'monospace', fontWeight: 650 }}>
                {clinical.syringeCalc}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#334155' }}>
                <strong>{isEs ? 'Pauta estándar:' : 'Standard dose:'}</strong> {clinical.dose}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Clock size={12} color="#d97706" />
                <span>{isEs ? 'Farmacocinética & Vía' : 'Pharmacokinetics & Route'}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span><span style={{ color: '#64748b' }}>{isEs ? 'Vida media:' : 'Half-life:'}</span> <strong style={{ color: '#0f172a' }}>{clinical.halfLife}</strong></span>
                <span style={{ fontSize: '0.68rem', background: '#e8f0fe', color: '#1a73e8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {clinical.route || 'SubQ'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '6px' }}>
              <div style={{
                fontSize: '0.66rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748b',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Layers size={12} color="#7c3aed" />
                <span>{isEs ? 'Sinergias & Protocolos' : 'Clinical Synergies & Stacks'}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
                {clinical.synergy}
              </div>
            </div>

            <div style={{ paddingTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAtlasAiOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(13, 148, 136, 0.12) 100%)',
                  color: '#0284c7',
                  border: '1px solid rgba(2, 132, 199, 0.35)',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '0.73rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Consultar dosificación y reconstitución con Atlas AI' : 'Calculate clinical dosing and reconstitution with Atlas AI'}
              >
                <Sparkles size={12} color="#0284c7" />
                <span>{isEs ? 'Calcular Dosis en AI ✨' : 'Dosing Math with AI ✨'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSpecsProduct(row);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ffffff',
                  color: '#1a73e8',
                  border: '1px solid #c2e7ff',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f0fe';
                  e.currentTarget.style.borderColor = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#c2e7ff';
                }}
              >
                <BookOpen size={12} />
                <span>{isEs ? 'Ver Dossier y Posología →' : 'Dossier & Dosing Specs →'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInquiryProductContext(row);
                  setIsInquiryDrawerOpen(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dcfce7';
                  e.currentTarget.style.borderColor = '#15803d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                  e.currentTarget.style.borderColor = '#bbf7d0';
                }}
              >
                <Mail size={12} />
                <span>{isEs ? 'Consultar Info' : 'Inquire Info'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [lang, setSelectedSpecsProduct]);

  return (
    <div className="colway-price-root peptides-b2b-portal">
      {/* ── Screen Navigation Bar (Google Cloud Console AppBar) ── */}
      <header className="screen-nav-bar peptides-screen-nav-bar">
        <div className="nav-container peptides-nav-container">
          <div className="nav-left peptides-nav-left">
            {/* Mobile hamburger menu trigger (visible ≤1024px) */}
            <button
              type="button"
              className="mobile-nav-drawer-trigger"
              onClick={() => setIsNavDrawerOpen(true)}
              aria-label="Open navigation menu"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                color: '#e2e8f0',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Menu size={17} />
            </button>
            <Link href="/" className="nav-brand">
              <Sparkles size={15} className="text-sky-400" />
              <span>MEDILUXE B2B</span>
            </Link>
            <span className="nav-divider mobile-hide">/</span>
            <span className="nav-section mobile-hide">{isEs ? 'Tarifas Oficiales' : 'Price Schedules'}</span>
            <span className="nav-divider mobile-hide">/</span>
            <span className="nav-current mobile-hide">{isEs ? 'Viales de Péptidos Liofilizados' : 'Lyophilized Peptide Vials'}</span>
          </div>

          <div className="nav-actions peptides-nav-actions">
            {/* ── Desktop & Laptop Actions Bar ── */}
            <div className="peptides-nav-utility-group desktop-only-utilities">
              {/* Language selector: EN standard, ES selectable */}
              <div className="language-selector" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div className="pill-group" style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  {[
                    { code: 'en', label: 'EN' },
                    { code: 'es', label: 'ES' }
                  ].map((item) => {
                    const isCurrent = (lang || 'en') === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => handleLanguageChange(item.code)}
                        className={`pill-btn ${isCurrent ? 'pill-active active' : ''}`}
                        style={{
                          border: 'none',
                          background: isCurrent ? '#0284c7' : 'transparent',
                          color: isCurrent ? '#ffffff' : '#cbd5e1',
                          fontWeight: isCurrent ? 800 : 500,
                          fontSize: '0.73rem',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atlas Clinical AI Launcher in Header */}
              <button
                type="button"
                onClick={() => setIsAtlasAiOpen(true)}
                className="peptides-nav-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.35) 0%, rgba(13, 148, 136, 0.35) 100%)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title="Open Atlas Clinical AI Assistant (Dosing Math, Synergies & Reconstitution)"
              >
                <Sparkles size={13} className="text-sky-300" />
                <span>Atlas AI</span>
              </button>

              {/* Inquire Info button in Header */}
              <button
                type="button"
                onClick={() => {
                  setInquiryProductContext(null);
                  setIsInquiryDrawerOpen(true);
                }}
                className="peptides-nav-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Consultar información técnica, COAs o envíos' : 'Institutional Inquiry & Support'}
              >
                <Mail size={13} />
                <span>{isEs ? 'Consultar' : 'Inquire'}</span>
              </button>

              {/* PDF Preview button in Header */}
              <button
                onClick={() => setIsPdfPreviewOpen(true)}
                className="peptides-nav-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Previsualizar y exportar tarifa oficial PDF' : 'Preview and export official PDF price schedule'}
              >
                <Eye size={13} />
                <span>{isEs ? 'PDF' : 'PDF Schedule'}</span>
              </button>

              {/* Share button */}
              <button
                onClick={handleShareSchedule}
                className="peptides-nav-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title={isEs ? 'Copiar enlace verificado de tarifa' : 'Copy verified price list link'}
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                <span className="peptides-share-label">{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
              </button>
            </div>

            {/* Desktop Currency selector with prominent display */}
            <div className="currency-selector peptides-currency-bar desktop-only-currency" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {isEs ? 'Divisa:' : 'Currency:'}
              </span>
              <div className="pill-group peptides-currency-pills" style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                {[
                  { code: 'USD', symbol: '$' },
                  { code: 'EUR', symbol: '€' },
                  { code: 'AED', symbol: 'د.إ' }
                ].map((item) => {
                  const isCurrent = currency === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => handleCurrencyChange(item.code)}
                      className={`pill-btn ${isCurrent ? 'pill-active active' : ''}`}
                      style={{
                        border: 'none',
                        background: isCurrent ? '#1a73e8' : 'transparent',
                        color: isCurrent ? '#ffffff' : '#cbd5e1',
                        fontWeight: isCurrent ? 800 : 500,
                        fontSize: '0.73rem',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: isCurrent ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                        transition: 'all 0.15s ease',
                        letterSpacing: '-0.01em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        flex: 1,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block', flexShrink: 0 }} />}
                      <span>{item.code} ({item.symbol})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Mobile-Only Compact 1-Row Action Group (GCP UX: uniform 32px height, bottom sheet currency) ── */}
            <div className="mobile-only-header-actions" style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
              {/* GCP-style Currency Button — fixed width, opens bottom sheet (no native <select>) */}
              <button
                type="button"
                onClick={() => setIsCurrencySheetOpen(true)}
                aria-label="Select currency"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: '6px',
                  padding: '0 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '32px',
                  minWidth: '72px',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em'
                }}
              >
                <span>{currency === 'AED' ? 'د.إ AED' : currency === 'EUR' ? '€ EUR' : '$ USD'}</span>
                <ChevronDown size={11} color="#94a3b8" />
              </button>

              {/* Atlas AI — solid GCP blue #1a73e8, no gradient, uniform 32px */}
              <button
                type="button"
                onClick={() => setIsAtlasAiOpen(true)}
                aria-label="Open Atlas AI"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#1a73e8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '32px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={13} />
                <span>AI</span>
              </button>

              {/* Mobile "More" Menu Trigger (⋮) */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsMobileMoreMenuOpen(!isMobileMoreMenuOpen)}
                  aria-label="More actions"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isMobileMoreMenuOpen ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu popover for secondary actions */}
                {isMobileMoreMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '38px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                      border: '1px solid #dadce0',
                      padding: '6px',
                      minWidth: '170px',
                      zIndex: 150,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'fadeIn 0.12s ease'
                    }}
                  >
                    {/* PDF Schedule */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMoreMenuOpen(false);
                        setIsPdfPreviewOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Eye size={14} color="#0284c7" />
                      <span>{isEs ? 'Exportar PDF' : 'Export PDF'}</span>
                    </button>

                    {/* Share */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMoreMenuOpen(false);
                        handleShareSchedule();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Share2 size={14} color="#16a34a" />
                      <span>{copied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Compartir' : 'Share')}</span>
                    </button>

                    {/* Inquire */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMoreMenuOpen(false);
                        setInquiryProductContext(null);
                        setIsInquiryDrawerOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Mail size={14} color="#ea580c" />
                      <span>{isEs ? 'Consultar B2B' : 'B2B Inquiry'}</span>
                    </button>

                    {/* Divider */}
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                    {/* Language Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>{isEs ? 'Idioma' : 'Language'}</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => handleLanguageChange('en')}
                          style={{
                            border: 'none',
                            background: lang === 'en' ? '#0284c7' : '#f1f5f9',
                            color: lang === 'en' ? '#ffffff' : '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            cursor: 'pointer'
                          }}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLanguageChange('es')}
                          style={{
                            border: 'none',
                            background: lang === 'es' ? '#0284c7' : '#f1f5f9',
                            color: lang === 'es' ? '#ffffff' : '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            cursor: 'pointer'
                          }}
                        >
                          ES
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── GCP Currency Bottom Sheet (mobile) ── */}
      {isCurrencySheetOpen && (
        <div
          onClick={() => setIsCurrencySheetOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#1e293b',
              borderRadius: '16px 16px 0 0',
              padding: '8px 20px 32px',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.22s ease'
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />
            {/* Title */}
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px', textTransform: 'uppercase' }}>
              {isEs ? 'Selecciona Divisa' : 'Select Currency'}
            </p>
            {/* Options */}
            {[
              { code: 'USD', symbol: '$', label: isEs ? 'Dólar Estadounidense' : 'US Dollar' },
              { code: 'EUR', symbol: '€', label: isEs ? 'Euro' : 'Euro' },
              { code: 'AED', symbol: 'د.إ', label: isEs ? 'Dírham EAU' : 'UAE Dirham' }
            ].map(c => {
              const isActive = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { handleCurrencyChange(c.code); setIsCurrencySheetOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    background: isActive ? 'rgba(26, 115, 232, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    border: isActive ? '1px solid #1a73e8' : '1px solid transparent',
                    color: isActive ? '#60a5fa' : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '28px' }}>{c.symbol}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{c.code}</span>
                  <span style={{ color: '#64748b', fontSize: '0.80rem', marginLeft: '4px' }}>{c.label}</span>
                  {isActive && (
                    <Check size={16} style={{ marginLeft: 'auto', color: '#1a73e8', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <main className="peptides-main-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: totalCartCount > 0 ? '1.25rem 1.25rem 5.5rem 1.25rem' : '1.25rem 1.25rem 2.5rem 1.25rem' }}>
        {/* Page Header */}
        <div className="peptides-page-header" style={{ marginBottom: '1rem' }}>
          <div className="mobile-hide">
            <Breadcrumb items={[
              { label: isEs ? 'Portal B2B' : 'B2B Portal', href: '/' },
              { label: isEs ? 'Tarifas Oficiales' : 'Official Price Schedules', href: '/pricing/peptides' },
              { label: isEs ? 'Viales Clínicos de Péptidos' : 'Clinical Peptide Vials' }
            ]} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              {/* Consolidated GCP Status Strip (Single Row) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  color: isDistributor ? '#137333' : '#1a73e8',
                  background: isDistributor ? '#e6f4ea' : '#e8f0fe',
                  border: isDistributor ? '1px solid #ceead6' : '1px solid #c2e7ff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDistributor ? '#137333' : '#1a73e8', display: 'inline-block' }} />
                  <span>{isDistributor ? (isEs ? 'Tarifa Oficial Distribuidor' : 'Official Distributor Schedule') : (isEs ? 'Tarifa Mayorista' : 'Wholesale Schedule')}</span>
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: '#137333',
                  background: '#e6f4ea',
                  border: '1px solid #ceead6',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={11} />
                  <span>≥99.0% HPLC</span>
                </span>
              </div>
              <h1 className="peptides-hero-title" style={{
                fontSize: 'clamp(1.12rem, 3vw, 1.60rem)',
                fontWeight: 800,
                color: '#202124',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.22,
                textWrap: 'balance',
                maxWidth: '820px'
              }}>
                {isDistributor
                  ? (isEs ? 'Viales Clínicos de Péptidos Certificados • Distribuidor B2B' : 'Certified Clinical Peptide Vials • Distributor B2B')
                  : (isEs ? 'Viales Clínicos de Péptidos Certificados • Mayoristas y Clínicas' : 'Certified Clinical Peptide Vials • Wholesaler & Clinic')
                }
              </h1>
              <p className="peptides-hero-subtitle" style={{ fontSize: '0.84rem', color: '#5f6368', marginTop: '3px', marginBottom: 0, maxWidth: '850px', lineHeight: 1.4 }}>
                {isDistributor
                  ? (isEs
                      ? 'Lista oficial B2B para distribuidores de viales liofilizados certificados (Borosilicato 10R) con pureza verificada y ahorro por volumen.'
                      : 'Official B2B distributor price list for certified lyophilized peptide vials (10R Borosilicate) with verified analytical purity and volume tiers.')
                  : (isEs
                      ? 'Tarifa oficial institucional y mayorista para péptidos bioactivos liofilizados estériles con ahorro por volumen en packs de 10 viales.'
                      : 'Official institutional and wholesale price schedule for sterile lyophilized bioactive peptides with manufacturer 10-pack volume savings.')
                }
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Layout Styles (GCP-Inspired Desktop, Laptop & Mobile UX) */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gcp-pricing-portal-layout {
            display: flex;
            gap: 1.25rem;
            align-items: flex-start;
            width: 100%;
          }
          .gcp-pricing-sidebar {
            width: 240px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            position: sticky;
            top: 72px;
          }
          .gcp-pricing-workspace {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
          }
          .gcp-kpis-summary-block {
            order: 1;
          }
          .gcp-search-and-category-block {
            order: 2;
          }
          .gcp-table-block {
            order: 3;
          }
          .mobile-only-category-selector {
            display: none;
          }
          .mobile-nav-drawer-trigger {
            display: none;
          }
          .mobile-only-filter-selectors {
            display: none;
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .screen-nav-bar.peptides-screen-nav-bar {
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            background: rgba(15, 23, 42, 0.98) !important;
            backdrop-filter: blur(12px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
          }
          .peptides-nav-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .desktop-only-utilities {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .desktop-only-currency {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .mobile-only-header-actions {
            display: none;
          }
          .peptides-kpis-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.85rem;
          }
          @media (max-width: 1024px) {
            .gcp-pricing-portal-layout {
              flex-direction: column;
              gap: 0.85rem;
            }
            .gcp-pricing-sidebar {
              display: none !important;
            }
            .mobile-nav-drawer-trigger {
              display: inline-flex !important;
            }
            .mobile-only-filter-selectors {
              display: grid !important;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .mobile-only-category-selector {
              display: block !important;
            }
            .peptides-kpis-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 0.65rem;
            }
          }
          @media (max-width: 640px) {
            .mobile-only-filter-selectors {
              grid-template-columns: 1fr !important;
              gap: 8px !important;
            }
          }
          @media (max-width: 768px) {
            .mobile-hide {
              display: none !important;
            }
            .desktop-only-utilities {
              display: none !important;
            }
            .desktop-only-currency {
              display: none !important;
            }
            .mobile-only-header-actions {
              display: inline-flex !important;
            }
            /* Ultra-Compact 1-Row Google Cloud Mobile Top AppBar (Sticky, 48px height) */
            .screen-nav-bar.peptides-screen-nav-bar {
              position: sticky !important;
              top: 0 !important;
              z-index: 100 !important;
            }
            .peptides-b2b-portal .peptides-nav-container {
              padding: 6px 12px !important;
              gap: 8px !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              justify-content: space-between !important;
              height: 48px !important;
            }
            .peptides-b2b-portal .peptides-nav-left {
              width: auto !important;
              flex: 1 1 auto !important;
              min-width: 0 !important;
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
            }
            .peptides-b2b-portal .nav-brand span {
              font-size: 0.82rem !important;
              white-space: nowrap !important;
            }
            .peptides-b2b-portal .peptides-nav-actions {
              width: auto !important;
              flex: 0 0 auto !important;
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              justify-content: flex-end !important;
              gap: 6px !important;
            }
            .peptides-main-container {
              padding: 0.5rem 0.65rem 3.5rem 0.65rem !important;
            }
            .peptides-hero-title {
              font-size: 1.05rem !important;
              line-height: 1.2 !important;
            }
            .peptides-hero-subtitle {
              display: none !important; /* Hide verbose 2-paragraph description on mobile */
            }
            .mobile-only-filter-selectors {
              grid-template-columns: 1fr 1fr !important;
              gap: 6px !important;
              margin-top: 6px !important;
            }
            /* Golden Rule #7: Search Bar & Category Selector FIRST Above-the-Fold on Mobile */
            .gcp-search-and-category-block {
              order: 1 !important;
              margin-bottom: 0.75rem !important;
            }
            .gcp-kpis-summary-block {
              order: 2 !important;
              padding: 0.75rem !important;
              margin-bottom: 0.75rem !important;
            }
            .gcp-table-block {
              order: 3 !important;
            }
            .peptides-kpi-card {
              padding: 0.55rem 0.65rem !important;
            }
            .peptides-kpi-val {
              font-size: 1.15rem !important;
            }
          }
          @media (max-width: 390px) {
            .peptides-share-label {
              display: none !important;
            }
          }
        ` }} />

        {/* ── Google Cloud Console 2-Column Portal Layout ── */}
        <div className="gcp-pricing-portal-layout">
          {/* ── Left Navigation Rail / Sidebar ── */}
          <aside className="gcp-pricing-sidebar">
            {/* 1. Peptide Categories Navigation Tree (GCP Left Rail Pattern) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '12px 14px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                {isEs ? 'Categorías de Péptidos' : 'Peptide Categories'}
              </div>
              <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: selectedCategory === 'all' ? '#e8f0fe' : 'transparent',
                    color: selectedCategory === 'all' ? '#1a73e8' : '#3c4043',
                    fontSize: '0.76rem',
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = '#f1f3f4'; }}
                  onMouseLeave={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{isEs ? 'Todas las Formulaciones' : 'All Formulations'}</span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    background: selectedCategory === 'all' ? '#1a73e8' : '#f1f3f4',
                    color: selectedCategory === 'all' ? '#ffffff' : '#5f6368',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {processedProducts.length}
                  </span>
                </button>

                {CATEGORY_ORDER.map(key => {
                  const meta = CATEGORY_MAP[key];
                  if (!meta) return null;
                  const count = processedProducts.filter(p => p.categoryKey === key).length;
                  if (count === 0) return null;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCategory(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        background: isSelected ? meta.bg : 'transparent',
                        color: isSelected ? meta.color : '#3c4043',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>
                          {getCategoryIcon(key, 13)}
                        </span>
                        <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: isSelected ? meta.color : '#f1f3f4',
                        color: isSelected ? '#ffffff' : '#5f6368',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0 10px 0' }} />

              {/* FDA Regulatory Status Filter Rail */}
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                {isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}
              </div>
              <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {FDA_FILTERS.map(f => {
                  const isSelected = selectedFdaStatus === f.id;
                  const count = f.id === 'all'
                    ? processedProducts.length
                    : processedProducts.filter(p => p.fdaBucket === f.id).length;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFdaStatus(f.id)}
                      title={isEs ? (f.tooltipEs || f.labelEs) : (f.tooltipEn || f.labelEn)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        background: isSelected ? (f.id === 'all' ? '#e8f0fe' : (f.id === 'fda_503a' ? '#ecfdf5' : f.id === 'fda_approved' ? '#eff6ff' : f.id === 'clinical_ind' ? '#fffbeb' : '#f1f5f9')) : 'transparent',
                        color: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#3c4043')) : '#3c4043',
                        fontSize: '0.74rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.78rem', flexShrink: 0 }}>{f.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isEs ? f.labelEs : f.labelEn}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        background: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#5f6368')) : '#f1f3f4',
                        color: isSelected ? '#ffffff' : '#5f6368',
                        padding: '1px 6px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Main Data Workspace Area ── */}
          <div className="gcp-pricing-workspace">
            {/* ── 4 KPIs with Scope Switcher (Google Cloud Metric Strip — Compact & Dense) ── */}
            <div className="gcp-kpis-summary-block" style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '8px 12px',
              marginBottom: '0.75rem',
              boxShadow: '0 1px 2px rgba(60,64,67,0.04)'
            }}>
              {/* Scope Indicator & Switcher */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '6px',
                marginBottom: '6px',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {filteredProducts.length === processedProducts.length
                      ? (isEs ? `${processedProducts.length} Formulaciones Disponibles` : `${processedProducts.length} Available Formulations`)
                      : (isEs ? `${filteredProducts.length} de ${processedProducts.length} Formulaciones` : `${filteredProducts.length} of ${processedProducts.length} Formulations`)
                    }
                  </span>
                  {totalCartCount > 0 && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 750,
                      color: '#137333',
                      background: '#e6f4ea',
                      border: '1px solid #ceead6',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={11} />
                      <span>{totalCartCount} {isEs ? 'Viales' : 'Vials'} ({formatPrice(totalCartValueUsd)})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 4 KPIs in a Compact Strip (GCP Style) */}
              <div className="peptides-kpis-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {/* KPI 1: Available Formulations */}
                <div className="peptides-kpi-card" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {isEs ? 'Formulaciones' : 'Formulations'}
                  </div>
                  <div className="peptides-kpi-val" style={{ fontSize: '1.20rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
                    {scopeMode === 'filtered' ? filteredProducts.length : processedProducts.length}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#0284c7', marginTop: '1px' }}>
                    {isEs ? 'Viales Liofilizados' : 'Sterile Vials'}
                  </div>
                </div>

                {/* KPI 2: Pack ×10 Volume Savings */}
                <div className="peptides-kpi-card" style={{
                  padding: '6px 8px',
                  background: totalCartCount > 0 ? '#f0fdf4' : '#f8fafc',
                  borderRadius: '6px',
                  border: totalCartCount > 0 ? '1px solid #bbf7d0' : '1px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: totalCartCount > 0 ? '#15803d' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {totalCartCount > 0 ? (isEs ? 'Proforma' : 'Proforma') : (isEs ? 'Ahorro Pack ×10' : 'Pack ×10 Savings')}
                  </div>
                  <div className="peptides-kpi-val" style={{ fontSize: '1.20rem', fontWeight: 800, color: totalCartCount > 0 ? '#15803d' : '#059669', lineHeight: 1.1, marginTop: '2px' }}>
                    {totalCartCount > 0 ? `${totalCartCount} ${isEs ? 'Viales' : 'Vials'}` : (isEs ? '-15% a -52%' : '-15% to -52%')}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: totalCartCount > 0 ? '#15803d' : '#059669', fontWeight: totalCartCount > 0 ? 700 : 400, marginTop: '1px' }}>
                    {totalCartCount > 0 ? `${formatPrice(totalCartValueUsd)} Subtotal` : (isEs ? 'Nivel Pack 10' : 'Pack ×10 Tier')}
                  </div>
                </div>

                {/* KPI 3: 503A & FDA Approved */}
                <div className="peptides-kpi-card" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {isEs ? '503A & Aprobados' : '503A & Approved'}
                  </div>
                  <div className="peptides-kpi-val" style={{ fontSize: '1.20rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
                    {(scopeMode === 'filtered' ? filteredProducts : processedProducts).filter(p => p.fdaBucket === 'fda_503a' || p.fdaBucket === 'fda_approved').length}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#1a73e8', marginTop: '1px' }}>
                    {isEs ? '20 HHS · 15 NDA' : '20 HHS · 15 NDA'}
                  </div>
                </div>

                {/* KPI 4: Analytical Quality & Purity */}
                <div className="peptides-kpi-card" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {isEs ? 'Pureza y Calidad' : 'Quality & Purity'}
                  </div>
                  <div className="peptides-kpi-val" style={{ fontSize: '1.20rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
                    100% COA
                  </div>
                  <div style={{ fontSize: '0.64rem', color: '#0d9488', marginTop: '1px' }}>
                    {isEs ? '≥99.0% HPLC' : '≥99.0% HPLC'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Search & Category Filter Block (Prioritized Above-the-Fold per Golden Rule #7) ── */}
            <div className="gcp-search-and-category-block" style={{ marginBottom: '0.85rem' }}>
              {/* Global Search & Filters (Golden Rule #7) */}
              <GlobalSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                lang={lang}
                placeholder={isEs
                  ? 'Buscar por nombre de péptido (ej. BPC-157, Semaglutide, Tirzepatide, GHK-Cu, Epithalon)...'
                  : 'Search by peptide name (e.g. BPC-157, Semaglutide, Tirzepatide, GHK-Cu, Epithalon)...'}
                size="lg"
                resultCount={filteredProducts.length}
                filters={
                  <div>
                    {/* Integrated Shipping Corridor Segmented Switcher (Google Cloud Standard) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap',
                      padding: '5px 10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={13} color="#0284c7" />
                        <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#334155' }}>
                          {isEs ? 'Destino y Tarifa de Envío (≤ 2 kg):' : 'Shipping Corridor & Rate (≤ 2 kg):'}
                        </span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ffffff', padding: '2px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        {Object.values(SHIPPING_DESTINATIONS).map(corridor => {
                          const isSel = shippingDest === corridor.id;
                          return (
                            <button
                              key={corridor.id}
                              type="button"
                              onClick={() => handleShippingDestChange(corridor.id)}
                              title={isEs ? corridor.corridorLabelEs : corridor.corridorLabelEn}
                              style={{
                                border: isSel ? '1px solid #0284c7' : '1px solid transparent',
                                background: isSel ? '#e0f2fe' : 'transparent',
                                color: isSel ? '#0369a1' : '#475569',
                                fontWeight: isSel ? 800 : 600,
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{corridor.flag}</span>
                              <span>{isEs ? corridor.labelEs : corridor.labelEn}</span>
                              <span style={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                color: isSel ? '#0284c7' : '#64748b'
                              }}>
                                {corridor.rateBadge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dosage Strength Quick Filter Pills + Category Grouping Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isEs ? 'Concentración:' : 'Filter Strength:'}
                        </span>
                        {DOSAGE_STRENGTHS.map(st => {
                          const isSelected = selectedStrength === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setSelectedStrength(st.id)}
                              style={{
                                padding: '2px 9px',
                                borderRadius: '20px',
                                fontSize: '0.70rem',
                                fontWeight: isSelected ? 750 : 600,
                                border: '1px solid',
                                cursor: 'pointer',
                                background: isSelected ? '#0284c7' : '#ffffff',
                                color: isSelected ? '#ffffff' : '#475569',
                                borderColor: isSelected ? '#0284c7' : '#cbd5e1',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              {st.id === 'all' ? (isEs ? 'Todas las Dosis' : 'All Strengths') : st.label}
                            </button>
                          );
                        })}

                        {(selectedCategory !== 'all' || selectedStrength !== 'all' || searchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory('all');
                              setSelectedStrength('all');
                              setSearchQuery('');
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#dc2626',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isEs ? 'Limpiar Filtros ×' : 'Reset Filters ×'}
                          </button>
                        )}
                      </div>

                      {/* View Organization Switcher: Categories (Default) vs Continuous */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: '#f1f5f9',
                        padding: '2px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        marginLeft: 'auto'
                      }}>
                        <button
                          type="button"
                          onClick={() => setGroupByCategory(true)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: 'none',
                            background: groupByCategory ? '#ffffff' : 'transparent',
                            color: groupByCategory ? '#003666' : '#64748b',
                            fontWeight: groupByCategory ? 800 : 600,
                            fontSize: '0.70rem',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          <Layers size={12} />
                          <span>{isEs ? 'Categorías' : 'Categories'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGroupByCategory(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: 'none',
                            background: !groupByCategory ? '#ffffff' : 'transparent',
                            color: !groupByCategory ? '#003666' : '#64748b',
                            fontWeight: !groupByCategory ? 800 : 600,
                            fontSize: '0.70rem',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: !groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          <span>≡</span>
                          <span>{isEs ? 'Continua' : 'Continuous'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              />

              {/* Dual Mobile Dropdown Selectors (Google Cloud Mobile UX Standard: Category + FDA Status Bottom Sheets) */}
              <div className="mobile-only-filter-selectors">
                {/* 1. Category Bottom Sheet Trigger */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🧬 {isEs ? 'Categoría' : 'Category'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCategorySheetOpen(true)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#1a73e8',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {isEs ? 'Ver lista ▾' : 'View sheet ▾'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCategorySheetOpen(true)}
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      borderRadius: '6px',
                      border: selectedCategory !== 'all' ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                      background: selectedCategory !== 'all' ? '#f0f7ff' : '#ffffff',
                      color: selectedCategory !== 'all' ? '#1a73e8' : '#1e293b',
                      fontSize: '0.80rem',
                      fontWeight: selectedCategory !== 'all' ? 750 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedCategory === 'all'
                        ? (isEs ? `🌐 Todas las Categorías (${processedProducts.length})` : `🌐 All Categories (${processedProducts.length})`)
                        : `${CATEGORY_MAP[selectedCategory]?.icon || '🧬'} ${isEs ? CATEGORY_MAP[selectedCategory]?.labelEs : CATEGORY_MAP[selectedCategory]?.labelEn} (${processedProducts.filter(p => p.categoryKey === selectedCategory).length})`
                      }
                    </span>
                    <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
                  </button>
                </div>

                {/* 2. FDA Regulatory Status Bottom Sheet Trigger */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>⚖️ {isEs ? 'Estatus FDA' : 'FDA Status'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFdaSheetOpen(true)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#1a73e8',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {isEs ? 'Ver lista ▾' : 'View sheet ▾'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFdaSheetOpen(true)}
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      borderRadius: '6px',
                      border: selectedFdaStatus !== 'all' ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                      background: selectedFdaStatus !== 'all' ? '#f0f7ff' : '#ffffff',
                      color: selectedFdaStatus !== 'all' ? '#1a73e8' : '#1e293b',
                      fontSize: '0.80rem',
                      fontWeight: selectedFdaStatus !== 'all' ? 750 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedFdaStatus === 'all'
                        ? (isEs ? `🌐 Toda Regulación (${processedProducts.length})` : `🌐 All Regulatory (${processedProducts.length})`)
                        : `${FDA_FILTERS.find(f => f.id === selectedFdaStatus)?.icon || '⚖️'} ${isEs ? FDA_FILTERS.find(f => f.id === selectedFdaStatus)?.labelEs : FDA_FILTERS.find(f => f.id === selectedFdaStatus)?.labelEn} (${processedProducts.filter(p => p.fdaBucket === selectedFdaStatus).length})`
                      }
                    </span>
                    <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Peptide DataTable (Golden Rule #3) ── */}
            <div className="gcp-table-block" style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem' }}>
                  <EmptyState
                    icon={FileText}
                    title={isEs ? 'No se encontraron formulaciones de péptidos' : 'No peptide formulations found'}
                    subtitle={isEs ? 'Prueba a ajustar tu búsqueda o filtro de categoría para ver las formulaciones disponibles.' : 'Try adjusting your keyword search or category filter to discover available formulations.'}
                    action={{
                      label: isEs ? 'Limpiar Filtros' : 'Clear Filters',
                      onClick: () => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedStrength('all');
                      }
                    }}
                  />
                </div>
              ) : (
                <DataTable
                  data={filteredProducts}
                  columns={columns}
                  keyField="id"
                  pageSize={150}
                  initialRowsPerPage={150}
                  showPagination={true}
                  sortable={true}
                  lang={lang}
                  groupByKey={groupByCategory ? 'categoryKey' : null}
                  renderGroupHeader={(catKey, firstRow, count) => {
                    const meta = CATEGORY_MAP[catKey] || firstRow?.categoryMeta || CATEGORY_MAP.general_health;
                    const title = isEs ? (meta.labelEs || meta.label) : (meta.labelEn || meta.label);
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: '#e8f0fe',
                        borderRadius: '6px',
                        padding: '3px 6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ color: '#003666', display: 'inline-flex', alignItems: 'center' }}>
                            {getCategoryIcon(catKey, 14)}
                          </span>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            color: '#003666',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {title} ({count})
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          color: '#1967d2',
                          background: '#ffffff',
                          border: '1px solid #bfdbfe',
                          padding: '1px 7px',
                          borderRadius: '10px'
                        }}>
                          {count} {isEs ? 'formulaciones' : 'formulations'}
                        </span>
                      </div>
                    );
                  }}
                  expandableRender={renderPeptideClinicalDetail}
                  mobileCardComponent={PeptideMobileCard}
                  mobileCardProps={{
                    handleAddToCart,
                    cartItems,
                    formatPrice,
                    currency,
                    currencySymbol,
                    lang,
                    onOpenSpecs: setSelectedSpecsProduct,
                    onOpenAi: (prod) => setIsAtlasAiOpen(true)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Quick Order Request Drawer ── */}
      {isOrderDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Solicitar Proforma B2B' : 'Request B2B Proforma'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs ? 'Código de Referencia:' : 'Reference Code:'} <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{referralCode}</span>
                </p>
              </div>
              <button
                onClick={() => setIsOrderDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {/* Selected Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Selected Formulations ({totalCartCount} Vials)
                  </h4>
                  {Object.keys(cartItems).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCartItems({});
                        try {
                          localStorage.removeItem(storageKey);
                        } catch (clearErr) {
                          console.warn('Could not clear cart storage:', clearErr);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {hasRestoredCart && Object.keys(cartItems).length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: '#065f46',
                    marginBottom: '8px'
                  }}>
                    <span>Restored previous session draft ✓</span>
                    <button
                      type="button"
                      onClick={() => setHasRestoredCart(false)}
                      style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {Object.keys(cartItems).length === 0 ? (
                  <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#64748b',
                    fontSize: '0.82rem'
                  }}>
                    Your order request is currently empty. Use the "+1 Vial" or "+Pack ×10" buttons in the table to add items.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.values(cartItems).map(item => {
                      const p = item.product;
                      const lineTotal = (item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5));
                      return (
                        <div
                          key={p.id}
                          style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                                {p.productName}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                {p.dosage} • Lyophilized Vial (10R)
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                                {formatPrice(lineTotal)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCartItems(prev => {
                                    const copy = { ...prev };
                                    delete copy[p.id];
                                    return copy;
                                  });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#94a3b8',
                                  cursor: 'pointer',
                                  padding: '2px 4px'
                                }}
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Incremental Controls inside Drawer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                            {/* 1x Single Vial Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>1x Vial:</span>
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '1x', -1)}
                                  disabled={item.quantity1x <= 0}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '3px 6px',
                                    cursor: item.quantity1x <= 0 ? 'not-allowed' : 'pointer',
                                    color: item.quantity1x <= 0 ? '#cbd5e1' : '#334155'
                                  }}
                                >
                                  <Minus size={11} />
                                </button>
                                <span style={{ padding: '0 6px', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700 }}>
                                  {item.quantity1x}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '1x', 1)}
                                  style={{ border: 'none', background: 'transparent', padding: '3px 6px', cursor: 'pointer', color: '#334155' }}
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                            </div>

                            {/* 10x Pack Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.70rem', color: '#047857', fontWeight: 700 }}>Pack ×10:</span>
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #a7f3d0', borderRadius: '4px', background: '#f0fdf4' }}>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '10x', -1)}
                                  disabled={item.quantity10x <= 0}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '3px 6px',
                                    cursor: item.quantity10x <= 0 ? 'not-allowed' : 'pointer',
                                    color: item.quantity10x <= 0 ? '#cbd5e1' : '#047857'
                                  }}
                                >
                                  <Minus size={11} />
                                </button>
                                <span style={{ padding: '0 6px', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                                  {item.quantity10x}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(p.id, '10x', 1)}
                                  style={{ border: 'none', background: 'transparent', padding: '3px 6px', cursor: 'pointer', color: '#047857' }}
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{
                      marginTop: '0.75rem',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: '#475569' }}>
                        <span>{isEs ? `Subtotal Formulaciones (${totalCartCount} viales):` : `Subtotal Formulations (${totalCartCount} vials):`}</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                          {formatPrice(totalCartValueUsd)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: '#0369a1' }}>
                          <span>
                            {activeShippingCorridor.flag}{' '}
                            {isEs
                              ? `Envío Express ${activeShippingCorridor.labelEs} (≤2 kg · ${activeShippingCorridor.rateBadge}):`
                              : `Express Courier ${activeShippingCorridor.labelEn} (≤2 kg · ${activeShippingCorridor.rateBadge}):`}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                            +{currencySymbol}{shippingCostCurrentCurrency.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                            {isEs ? 'Destino (≤2 kg):' : 'Destination (≤2 kg):'}
                          </span>
                          {Object.values(SHIPPING_DESTINATIONS).map(corridor => {
                            const isSel = shippingDest === corridor.id;
                            return (
                              <button
                                key={corridor.id}
                                type="button"
                                onClick={() => handleShippingDestChange(corridor.id)}
                                style={{
                                  border: isSel ? '1px solid #0284c7' : '1px solid #cbd5e1',
                                  background: isSel ? '#e0f2fe' : '#ffffff',
                                  color: isSel ? '#0369a1' : '#475569',
                                  fontWeight: isSel ? 750 : 600,
                                  fontSize: '0.66rem',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <span>{corridor.flag}</span>
                                <span>{isEs ? corridor.labelEs : corridor.labelEn}</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>({corridor.rateBadge})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{
                        paddingTop: '8px',
                        borderTop: '1px solid #cbd5e1',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                          {isEs ? 'Total Estimado:' : 'Estimated Total:'}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.10rem', color: '#0284c7' }}>
                          {formatPrice(grandTotalCartValueUsd)}
                        </span>
                      </div>
                    </div>

                    {/* 1-Click Proforma PDF / Print button */}
                    <button
                      type="button"
                      onClick={handlePrintProforma}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 650,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Generate official printable B2B proforma sheet"
                    >
                      <Printer size={14} />
                      <span>Print / Save PDF Proforma Quote</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmitOrder}>
                {/* ── Anti-Spam Bot Trap (Invisible to humans, catches automated bots) ── */}
                <div style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                  <input
                    type="text"
                    name="company_fax"
                    tabIndex={-1}
                    autoComplete="off"
                    value={orderForm.company_fax || ''}
                    onChange={e => setOrderForm(prev => ({ ...prev, company_fax: e.target.value }))}
                  />
                </div>

                {/* ── Section 1: Contact ── */}
                <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>1.</span> Institutional Contact
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={e => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Dr. Full Name / Procurement Lead"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Practice / Clinic Name
                      </label>
                      <input
                        type="text"
                        value={orderForm.clinicName}
                        onChange={e => setOrderForm(prev => ({ ...prev, clinicName: e.target.value }))}
                        placeholder="Clinic / Lab Name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.email}
                        onChange={e => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="doctor@clinic.com"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Phone / WhatsApp (International) *
                    </label>
                    <InternationalPhoneInput
                      value={orderForm.phone}
                      onChange={(val) => setOrderForm(prev => ({ ...prev, phone: val }))}
                      countryHint={orderForm.phoneCountryCode || 'ES'}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                {/* ── Section 2: Delivery Destination ── */}
                <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>2.</span> Shipping & Delivery Destination
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Destination Country *
                    </label>
                    <select
                      value={orderForm.country}
                      onChange={e => {
                        const selectedName = e.target.value;
                        const match = COUNTRIES.find(c => c.name === selectedName);
                        setOrderForm(prev => ({
                          ...prev,
                          country: selectedName,
                          phoneCountryCode: match?.code || prev.phoneCountryCode
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        backgroundColor: '#ffffff',
                        color: '#0f172a'
                      }}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.dial_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Street Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.addressLine1}
                      onChange={e => setOrderForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                      placeholder="Street address, building number, medical tower..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Suite / Floor / Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderForm.addressLine2}
                      onChange={e => setOrderForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                      placeholder="Suite 400, Floor 3, Clinic Reception..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.city}
                        onChange={e => setOrderForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        value={orderForm.state}
                        onChange={e => setOrderForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State or Region"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Postal Code / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={orderForm.postalCode}
                      onChange={e => setOrderForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="Postal / ZIP code"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                {/* ── Section 3: Notes & Submission ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Order Notes / Compounding Specifications
                    </label>
                    <textarea
                      rows={2}
                      value={orderForm.notes}
                      onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any specific batch, concentration, or delivery notes..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder || Object.keys(cartItems).length === 0}
                    style={{
                      marginTop: '0.5rem',
                      padding: '12px',
                      background: Object.keys(cartItems).length === 0 ? '#94a3b8' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.90rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {submittingOrder ? 'Submitting Proforma Request...' : 'Submit Proforma Request'}
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={handleOrderViaWhatsApp}
                    disabled={Object.keys(cartItems).length === 0}
                    style={{
                      padding: '11px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>Send Order via WhatsApp</span>
                  </button>

                  <p style={{ fontSize: '0.70rem', color: '#94a3b8', textAlign: 'center', margin: '4px 0 0 0' }}>
                    Upon submission, our medical logistics team will issue an official B2B proforma invoice with customs documentation and analytical COA verification.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Contextual Cart Dock (Approved GCP UX: Only visible when cart has items) ── */}
      {totalCartCount > 0 && (
        <aside
          className="gcp-fixed-bottom-dock animate-fadeInUp"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 900,
            background: '#ffffff',
            borderTop: '1px solid #dadce0',
            boxShadow: '0 -4px 20px rgba(60, 64, 67, 0.15)',
            padding: '10px 0',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.98)'
          }}
          aria-label="Bottom Cart & Proforma Action Dock"
        >
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            gap: '12px'
          }}>
            {/* Left: Cart Quantity & Total with Corridor Shipping */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: '#e6f4ea',
                color: '#137333',
                border: '1px solid #ceead6',
                fontSize: '0.80rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}>
                <ShoppingCart size={13} />
                <span>{totalCartCount} {isEs ? 'Viales' : 'Vials'}</span>
              </span>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#202124', fontFamily: 'monospace', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {formatPrice(totalCartValueUsd)}
                </div>
                <div className="mobile-hide" style={{ fontSize: '0.68rem', color: '#5f6368', whiteSpace: 'nowrap' }}>
                  {isEs
                    ? `+${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)} Envío ${activeShippingCorridor.flag} ${activeShippingCorridor.labelEs} (≤2 kg)`
                    : `+${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)} ${activeShippingCorridor.flag} ${activeShippingCorridor.labelEn} Shipping (≤2 kg)`}
                </div>
              </div>
            </div>

            {/* Right: Reset & Review Proforma CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isEs ? '¿Vaciar todos los viales de tu proforma?' : 'Reset all items in your proforma cart?')) {
                    setCartItems({});
                  }
                }}
                className="mobile-hide"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#5f6368',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
                title={isEs ? 'Vaciar proforma' : 'Clear all cart items'}
              >
                {isEs ? 'Vaciar' : 'Reset'}
              </button>

              <button
                type="button"
                onClick={() => setIsOrderDrawerOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1a73e8', // GCP Primary Blue
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 18px',
                  fontWeight: 750,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(26, 115, 232, 0.35)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  minHeight: '40px'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1557b0'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a73e8'}
              >
                <span>{isEs ? `Revisar Proforma (${totalCartCount})` : `Review Proforma (${totalCartCount})`}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Atlas AI Floating Quick-Access (When cart dock is not active) ── */}
      {totalCartCount === 0 && (
        <aside
          style={{
            position: 'fixed',
            bottom: '18px',
            right: '18px',
            zIndex: 890,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          aria-label="Atlas AI Quick Access"
        >
          <button
            type="button"
            onClick={() => setIsAtlasAiOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: '#ffffff',
              border: '1.5px solid #c2e7ff',
              borderRadius: '28px',
              color: '#1a73e8',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26, 115, 232, 0.20)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e8f0fe';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(26, 115, 232, 0.30)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(26, 115, 232, 0.20)';
            }}
            title="Open Atlas Clinical AI Assistant (Dosing Math, Synergies & Reconstitution)"
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a73e8 0%, #0d9488 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(26, 115, 232, 0.3)',
              flexShrink: 0
            }}>
              <Sparkles size={14} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1a73e8', whiteSpace: 'nowrap' }}>
              Atlas AI Copilot
            </span>
          </button>
        </aside>
      )}

      {/* ── Official Printable Proforma Document (@media print) ── */}
      <div className="peptides-printable-proforma" style={{ display: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .peptides-printable-proforma, .peptides-printable-proforma * {
              visibility: visible !important;
            }
            .peptides-printable-proforma {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 2cm !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              font-size: 11pt !important;
            }
            @page {
              size: A4;
              margin: 1.5cm;
            }
          }
        ` }} />

        {/* Proforma Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 800, color: '#0284c7' }}>ATLAS HEALTH SERVICES</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '9pt', color: '#64748b' }}>
              MEDILUXE B2B CLINICAL DIVISION • OFFICIAL PROFORMA QUOTE
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '8.5pt', color: '#64748b' }}>
              Certified Lyophilized Peptides • ≥99.0% HPLC Analytical Purity
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a' }}>
              PROFORMA ESTIMATE
            </div>
            <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '2px' }}>
              Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '8.5pt', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
              Attributed Wholesaler: Nikolaos Psathas (NP Labs)
            </div>
            <div style={{ fontSize: '8pt', fontFamily: 'monospace', color: '#64748b' }}>
              Ref Code: {referralCode || 'CAT-RX-7482'}
            </div>
          </div>
        </div>

        {/* Client & Shipping Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>INSTITUTIONAL CLIENT</div>
            <div style={{ fontSize: '10pt', fontWeight: 700, marginTop: '2px' }}>{orderForm.name || 'Clinical Practitioner'}</div>
            {orderForm.clinicName && <div style={{ fontSize: '9pt', color: '#334155' }}>{orderForm.clinicName}</div>}
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{orderForm.email || 'Email not specified'}</div>
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{orderForm.phone || 'Phone not specified'}</div>
          </div>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>DELIVERY DESTINATION</div>
            <div style={{ fontSize: '9pt', color: '#0f172a', fontWeight: 600 }}>{orderForm.country || 'International'}</div>
            <div style={{ fontSize: '8.5pt', color: '#334155' }}>{orderForm.addressLine1 || 'Pending delivery address'}</div>
            {orderForm.addressLine2 && <div style={{ fontSize: '8.5pt', color: '#334155' }}>{orderForm.addressLine2}</div>}
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
              {[orderForm.city, orderForm.state, orderForm.postalCode].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>

        {/* Selected Items Table */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '9pt' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
              <th style={{ padding: '8px 10px', width: '45%' }}>Formulation & Dosage</th>
              <th style={{ padding: '8px 10px', width: '20%' }}>Packaging & Quantity</th>
              <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Unit / Pack Price</th>
              <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(cartItems).map((item, idx) => {
              const p = item.product;
              const lineTotal = (item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5));
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.productName}</div>
                    <div style={{ fontSize: '8pt', color: '#64748b' }}>{p.dosage} • Lyophilized Vial (10R) • ≥99.0% HPLC</div>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {item.quantity1x > 0 && <div>{item.quantity1x}x Single Vial</div>}
                    {item.quantity10x > 0 && <div style={{ color: '#047857', fontWeight: 600 }}>{item.quantity10x}x Pack ×10 (-15% Vol.)</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {item.quantity1x > 0 && <div>{formatPrice(p.unitPrice)}</div>}
                    {item.quantity10x > 0 && <div style={{ color: '#047857' }}>{formatPrice(p.pack10Price || p.unitPrice * 8.5)}</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatPrice(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #cbd5e1' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 650, fontSize: '9pt', color: '#475569' }}>
                SUBTOTAL FORMULATIONS:
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '9.5pt', color: '#0f172a', fontFamily: 'monospace' }}>
                {formatPrice(totalCartValueUsd)}
              </td>
            </tr>
            <tr style={{ borderTop: '1px solid #f1f5f9' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 650, fontSize: '9pt', color: '#0369a1' }}>
                EXPRESS COURIER LOGISTICS ({activeShippingCorridor.labelEn.toUpperCase()} ≤2 KG · {activeShippingCorridor.rateBadge} BASE):
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '9.5pt', color: '#0284c7', fontFamily: 'monospace' }}>
                +{currencySymbol}{shippingCostCurrentCurrency.toFixed(2)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #0f172a' }}>
              <td colSpan={4} style={{ padding: '10px', textAlign: 'right', fontWeight: 800, fontSize: '10pt', color: '#0f172a' }}>
                ESTIMATED PROFORMA TOTAL:
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, fontSize: '11pt', color: '#0284c7', fontFamily: 'monospace' }}>
                {formatPrice(grandTotalCartValueUsd)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Logistics & Quality Regulatory Terms */}
        <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '8pt', color: '#64748b', lineHeight: 1.5 }}>
          <strong>Logistics & Regulatory Terms:</strong> All peptide vials are manufactured under cGMP standards with certified analytical purity (≥99.0% HPLC). Lyophilized sterile formulations are vacuum-sealed for maximum room-temperature stability and dispatched via express medical courier. Official proforma invoice and analytical COA documentation will be issued upon formal order confirmation.
        </div>
      </div>

      {/* ── Google Cloud Console Navigation Drawer (Left-sliding Navigation & Filters for Mobile/Tablet) ── */}
      {isNavDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            animation: 'fadeIn 0.18s ease'
          }}
          onClick={() => setIsNavDrawerOpen(false)}
        >
          <div
            style={{
              width: '320px',
              maxWidth: '85vw',
              height: '100%',
              background: '#ffffff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInLeft 0.22s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '14px 16px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} className="text-sky-400" />
                <span style={{ fontWeight: 800, fontSize: '0.90rem', letterSpacing: '-0.01em' }}>
                  {isEs ? 'Navegación & Filtros' : 'Navigation & Filters'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNavDrawerOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Reset bar if any filter active */}
            {(selectedCategory !== 'all' || selectedFdaStatus !== 'all' || selectedStrength !== 'all' || searchQuery) && (
              <div style={{
                padding: '8px 16px',
                background: '#fef2f2',
                borderBottom: '1px solid #fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>
                  {isEs ? 'Filtros activos' : 'Active filters'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedFdaStatus('all');
                    setSelectedStrength('all');
                    setSearchQuery('');
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#dc2626',
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Limpiar todo ×' : 'Reset all ×'}
                </button>
              </div>
            )}

            {/* Drawer Body (Scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
              {/* 1. Peptide Categories */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>🧬</span>
                <span>{isEs ? 'Categorías de Péptidos' : 'Peptide Categories'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsNavDrawerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: selectedCategory === 'all' ? '#e8f0fe' : 'transparent',
                    color: selectedCategory === 'all' ? '#1a73e8' : '#3c4043',
                    fontSize: '0.80rem',
                    fontWeight: selectedCategory === 'all' ? 800 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={14} color={selectedCategory === 'all' ? '#1a73e8' : '#5f6368'} />
                    <span>{isEs ? 'Todas las Formulaciones' : 'All Formulations'}</span>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: selectedCategory === 'all' ? '#1a73e8' : '#f1f3f4',
                    color: selectedCategory === 'all' ? '#ffffff' : '#5f6368',
                    padding: '1px 7px',
                    borderRadius: '10px'
                  }}>
                    {processedProducts.length}
                  </span>
                </button>

                {CATEGORY_ORDER.map(key => {
                  const meta = CATEGORY_MAP[key];
                  if (!meta) return null;
                  const count = processedProducts.filter(p => p.categoryKey === key).length;
                  if (count === 0) return null;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(key);
                        setIsNavDrawerOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSelected ? meta.bg : 'transparent',
                        color: isSelected ? meta.color : '#3c4043',
                        fontSize: '0.80rem',
                        fontWeight: isSelected ? 800 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>
                          {getCategoryIcon(key, 14)}
                        </span>
                        <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: isSelected ? meta.color : '#f1f3f4',
                        color: isSelected ? '#ffffff' : '#5f6368',
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

              {/* 2. FDA Regulatory Status */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>⚖️</span>
                <span>{isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px' }}>
                {FDA_FILTERS.map(f => {
                  const isSelected = selectedFdaStatus === f.id;
                  const count = f.id === 'all'
                    ? processedProducts.length
                    : processedProducts.filter(p => p.fdaBucket === f.id).length;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setSelectedFdaStatus(f.id);
                        setIsNavDrawerOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSelected ? (f.id === 'all' ? '#e8f0fe' : (f.id === 'fda_503a' ? '#ecfdf5' : f.id === 'fda_approved' ? '#eff6ff' : f.id === 'clinical_ind' ? '#fffbeb' : '#f1f5f9')) : 'transparent',
                        color: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#3c4043')) : '#3c4043',
                        fontSize: '0.80rem',
                        fontWeight: isSelected ? 800 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.82rem', flexShrink: 0 }}>{f.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isEs ? f.labelEs : f.labelEn}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#5f6368')) : '#f1f3f4',
                        color: isSelected ? '#ffffff' : '#5f6368',
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

              {/* 3. Strength Filter */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}>
                {isEs ? 'Concentración / Dosis' : 'Filter Strength'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {DOSAGE_STRENGTHS.map(st => {
                  const isSelected = selectedStrength === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStrength(st.id);
                        setIsNavDrawerOpen(false);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '16px',
                        fontSize: '0.74rem',
                        fontWeight: isSelected ? 750 : 600,
                        border: '1px solid',
                        cursor: 'pointer',
                        background: isSelected ? '#0284c7' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        borderColor: isSelected ? '#0284c7' : '#cbd5e1'
                      }}
                    >
                      {st.id === 'all' ? (isEs ? 'Todas' : 'All') : st.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Option 1: Mobile Category Selection Bottom Sheet (Google Cloud Console Standard) ── */}
      {isCategorySheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.18s ease'
          }}
          onClick={() => setIsCategorySheetOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div style={{
              padding: '12px 16px 10px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '4px',
                background: '#cbd5e1',
                borderRadius: '2px'
              }} />
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>
                  {isEs ? 'Seleccionar Categoría de Péptidos' : 'Select Peptide Category'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isEs ? 'Filtrar formulaciones por clasificación terapéutica clínica' : 'Filter 109 formulations by clinical therapeutic classification'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Options List */}
            <div style={{ padding: '8px 12px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Option: All Formulations */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setIsCategorySheetOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: selectedCategory === 'all' ? '1.5px solid #1a73e8' : '1px solid #f1f5f9',
                  background: selectedCategory === 'all' ? '#e8f0fe' : '#ffffff',
                  color: selectedCategory === 'all' ? '#1a73e8' : '#1e293b',
                  fontWeight: selectedCategory === 'all' ? 800 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={18} color={selectedCategory === 'all' ? '#1a73e8' : '#64748b'} />
                  <span>{isEs ? 'Todas las Formulaciones' : 'All Formulations'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: selectedCategory === 'all' ? '#1a73e8' : '#f1f5f9',
                    color: selectedCategory === 'all' ? '#ffffff' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {processedProducts.length}
                  </span>
                  {selectedCategory === 'all' && <Check size={16} color="#1a73e8" />}
                </div>
              </button>

              {/* Each category from CATEGORY_ORDER */}
              {CATEGORY_ORDER.map(key => {
                const meta = CATEGORY_MAP[key];
                if (!meta) return null;
                const count = processedProducts.filter(p => p.categoryKey === key).length;
                if (count === 0) return null;
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(key);
                      setIsCategorySheetOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? `1.5px solid ${meta.color}` : '1px solid #f1f5f9',
                      background: isSelected ? meta.bg : '#ffffff',
                      color: isSelected ? meta.color : '#1e293b',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                        {getCategoryIcon(key, 16)}
                      </span>
                      <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isSelected ? meta.color : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {count}
                      </span>
                      {isSelected && <Check size={16} color={meta.color} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile FDA Regulatory Status Bottom Sheet (Google Cloud Console Standard) ── */}
      {isFdaSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.18s ease'
          }}
          onClick={() => setIsFdaSheetOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div style={{
              padding: '12px 16px 10px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '4px',
                background: '#cbd5e1',
                borderRadius: '2px'
              }} />
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>
                  {isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isEs ? 'Filtrar por formulación hospitalaria, aprobado o investigación' : 'Filter by hospital formulary, FDA approved, or IND status'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFdaSheetOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* FDA Options List */}
            <div style={{ padding: '8px 12px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {FDA_FILTERS.map(f => {
                const isSelected = selectedFdaStatus === f.id;
                const count = f.id === 'all'
                  ? processedProducts.length
                  : processedProducts.filter(p => p.fdaBucket === f.id).length;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFdaStatus(f.id);
                      setIsFdaSheetOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #1a73e8' : '1px solid #f1f5f9',
                      background: isSelected ? '#e8f0fe' : '#ffffff',
                      color: isSelected ? '#1a73e8' : '#1e293b',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                      <div>
                        <div>{isEs ? f.labelEs : f.labelEn}</div>
                        <div style={{ fontSize: '0.68rem', color: isSelected ? '#1a73e8' : '#64748b', fontWeight: 500 }}>
                          {isEs ? f.tooltipEs : f.tooltipEn}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isSelected ? '#1a73e8' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>
                        {count}
                      </span>
                      {isSelected && <Check size={16} color="#1a73e8" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Official Institutional Price Schedule PDF Preview Modal ── */}
      <PeptidePricePdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        products={filteredProducts}
        currency={currency}
        currencySymbol={currencySymbol}
        formatPrice={formatPrice}
        isDistributor={isDistributor}
        lang={lang}
      />

      {/* ── Technical Specs & Clinical Monograph Drawer ── */}
      <PeptideSpecsDrawer
        isOpen={!!selectedSpecsProduct}
        onClose={() => setSelectedSpecsProduct(null)}
        product={selectedSpecsProduct}
        onAddToCart={handleAddToCart}
        currency={currency}
        currencySymbol={currencySymbol}
      />

      {/* ── Clinical Protocol Dossier Drawer ── */}
      <ClinicalProtocolDrawer
        isOpen={!!selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
        protocol={selectedProtocol}
        onAddProtocol={handleAddProtocolPreset}
        formatPrice={formatPrice}
        currency={currency}
        currencySymbol={currencySymbol}
        isDistributor={isDistributor}
      />

      {/* ── Atlas AI Clinical Copilot Drawer ── */}
      <AtlasAiCopilotDrawer
        isOpen={isAtlasAiOpen}
        onClose={() => setIsAtlasAiOpen(false)}
        currency={currency}
        currencySymbol={currencySymbol}
        formatPrice={formatPrice}
        products={processedProducts}
        cartItems={cartItems}
        totalCartCount={totalCartCount}
        totalCartValueUsd={totalCartValueUsd}
        isDistributor={isDistributor}
        lang={lang}
        activeCategory={selectedCategory}
        activeCategoryLabel={selectedCategory !== 'all' ? (isEs ? CATEGORY_MAP[selectedCategory]?.labelEs : CATEGORY_MAP[selectedCategory]?.labelEn) : null}
        onAddToCart={handleAddToCart}
        onOpenSpecs={setSelectedSpecsProduct}
      />

      {/* ── Institutional B2B Inquiry Drawer (Inquire Info / Consultar Info) ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => {
          setIsInquiryDrawerOpen(false);
          setInquiryProductContext(null);
        }}
        contextType="peptides_b2b_schedule"
        brandType="peptides_b2b"
        lang={lang}
        initialEntity={
          inquiryProductContext
            ? {
                name: `${inquiryProductContext.productName} ${inquiryProductContext.dosage || ''}`.trim(),
                currency,
                selectedItemsSummary: `${inquiryProductContext.productName} ${inquiryProductContext.dosage || ''} (${formatPrice(inquiryProductContext.unitPrice)} / vial · Pack ×10: ${formatPrice(inquiryProductContext.pack10Price)})`
              }
            : {
                name: selectedCategory !== 'all'
                  ? (isEs ? CATEGORY_MAP[selectedCategory]?.labelEs : CATEGORY_MAP[selectedCategory]?.labelEn)
                  : (isEs ? 'Tarifa Oficial de Péptidos B2B (109 Formulaciones)' : 'Official Peptide B2B Schedule (109 Formulations)'),
                currency,
                selectedItemsSummary: totalCartCount > 0
                  ? Object.values(cartItems)
                      .map(it => `${it.product.productName} ${it.product.dosage} (${it.quantity1x > 0 ? `${it.quantity1x}x Vial` : ''}${it.quantity1x > 0 && it.quantity10x > 0 ? ' + ' : ''}${it.quantity10x > 0 ? `${it.quantity10x}x Pack×10` : ''})`)
                      .join(', ')
                  : ''
              }
        }
      />

      {/* Unified Public Footer (Pointer events disabled in B2B Price Portal to prevent distraction) */}
      <div style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.85 }}>
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}

