import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

/**
 * GET /api/og?topic=pellets&lang=es&cur=EUR
 *
 * Dynamic bilingual PNG OG image generator (1200×630) using next/og ImageResponse.
 * Outputs real image/png for 100% compatibility with WhatsApp, LinkedIn, X, and iMessage.
 */

const TOPIC_CONFIG = {
  pellets: {
    accent: '#0d9488',
    accentSoft: '#14b8a6',
    en: {
      badge: 'EU GMP · SUBCUTANEOUS BHRT',
      title1: 'Bioidentical Hormone',
      title2: 'Pellets & Trocar Kits',
      subtitle: '3.5–6 Month Zero-Order Release · ≥99.5% USP/EP',
      pills: ['17β-Estradiol', 'Testosterone', 'Trocar 3.2 / 4.5 mm', 'Pack ×10 Savings'],
      cardTitle: 'Subcutaneous Implantation',
      cardLines: [
        { k: 'Formulation', v: 'Fused Crystalline Pellets' },
        { k: 'Kinetics', v: 'Zero-Order Steady Release' },
        { k: 'Trocars', v: '3.2 mm (F) · 4.5 mm (M)' },
        { k: 'Sterility', v: 'Single-Dose Blister · EU GMP' },
      ],
    },
    es: {
      badge: 'EU GMP · BHRT SUBCUTÁNEA',
      title1: 'Pellets Hormonales',
      title2: 'Bioidénticos y Kits Trócar',
      subtitle: 'Liberación orden cero 3,5–6 meses · ≥99,5% USP/EP',
      pills: ['17β-Estradiol', 'Testosterona', 'Trócar 3,2 / 4,5 mm', 'Ahorro Pack ×10'],
      cardTitle: 'Implantación Subcutánea',
      cardLines: [
        { k: 'Formulación', v: 'Pellets Cristalinos Fundidos' },
        { k: 'Cinética', v: 'Liberación Continua Orden 0' },
        { k: 'Trócares', v: '3,2 mm (M) · 4,5 mm (H)' },
        { k: 'Esterilidad', v: 'Blíster Monodosis · EU GMP' },
      ],
    },
  },
  'pellet-guide': {
    accent: '#0d9488',
    accentSoft: '#2dd4bf',
    en: {
      badge: 'CLINICAL GUIDE · BHRT',
      title1: 'Pellet Implantation',
      title2: 'Trocar Procedure Guide',
      subtitle: 'Surgical Technique · Titration Matrix · Post-Implant Care',
      pills: ['Trocar Technique', 'Dosing Calculator', 'Anatomy Mapping', '4–6 Wk Labs'],
      cardTitle: 'Clinical Protocol',
      cardLines: [
        { k: 'Anesthesia', v: 'Buffered Lidocaine pH 7.2' },
        { k: 'Geometry', v: 'Radial Fanning · Subdermal' },
        { k: 'Instruments', v: '3.2 mm & 4.5 mm Sterile Kits' },
        { k: 'Follow-up', v: 'Serum Panel at 4–6 Weeks' },
      ],
    },
    es: {
      badge: 'GUÍA CLÍNICA · BHRT',
      title1: 'Implantación de Pellets',
      title2: 'Guía Clínica y Trócar',
      subtitle: 'Técnica Quirúrgica · Calculadora de Titulación · Post-Implante',
      pills: ['Técnica Trócar', 'Calculadora Dosis', 'Mapa Anatómico', 'Analítica 4–6 Sem'],
      cardTitle: 'Protocolo Clínico',
      cardLines: [
        { k: 'Anestesia', v: 'Lidocaína Tamponada pH 7,2' },
        { k: 'Geometría', v: 'Abanico Radial Subdérmico' },
        { k: 'Instrumental', v: 'Kits Estériles 3,2 y 4,5 mm' },
        { k: 'Control', v: 'Analítica Pico 4–6 Semanas' },
      ],
    },
  },
  peptides: {
    accent: '#7c3aed',
    accentSoft: '#a78bfa',
    en: {
      badge: 'cGMP · LYOPHILIZED VIALS',
      title1: 'Clinical Peptides',
      title2: '10R Sterile Vials',
      subtitle: 'HPLC ≥99.0% Purity · Cold-Chain Certified',
      pills: ['BPC-157 / TB-500', 'Semaglutide / Tirze', 'MOTS-c / SS-31', 'Pack ×10 Volume'],
      cardTitle: 'Analytical Standard',
      cardLines: [
        { k: 'Purity', v: 'RP-HPLC ≥ 99.0% Verified' },
        { k: 'Identity', v: 'Dual ESI-MS Confirmed' },
        { k: 'Format', v: '10R Lyophilized Sterile Vial' },
        { k: 'Volume', v: 'Unit & Pack ×10 Tiering' },
      ],
    },
    es: {
      badge: 'cGMP · VIALES LIOFILIZADOS',
      title1: 'Péptidos Clínicos',
      title2: 'Viales Estériles 10R',
      subtitle: 'Pureza HPLC ≥99,0% · Cadena de Frío Certificada',
      pills: ['BPC-157 / TB-500', 'Semaglutida / Tirze', 'MOTS-c / SS-31', 'Volumen Pack ×10'],
      cardTitle: 'Estándar Analítico',
      cardLines: [
        { k: 'Pureza', v: 'RP-HPLC ≥ 99,0% Verificada' },
        { k: 'Identidad', v: 'Confirmación Dual ESI-MS' },
        { k: 'Formato', v: 'Vial Estéril Liofilizado 10R' },
        { k: 'Volumen', v: 'Tarifa Unidad y Pack ×10' },
      ],
    },
  },
  fillers: {
    accent: '#db2777',
    accentSoft: '#f472b6',
    en: {
      badge: 'CE-MARKED · 8 BRANDS',
      title1: 'Dermal Fillers &',
      title2: 'Skin Boosters',
      subtitle: 'Juvéderm · Restylane · Belotero · Profhilo · Sculptra',
      pills: ['Hyaluronic Acid', 'Biostimulators', 'Lipolysis', 'Direct B2B'],
      cardTitle: 'Aesthetics Supply',
      cardLines: [
        { k: 'Brands', v: '8 Leading CE-Marked Lines' },
        { k: 'Catalog', v: '40 Original References' },
        { k: 'Dispatch', v: 'Local Stock & Cold Chain' },
        { k: 'Export', v: 'Live B2B PDF & Quote' },
      ],
    },
    es: {
      badge: 'MARCADO CE · 8 MARCAS',
      title1: 'Fillers Dérmicos y',
      title2: 'Skin Boosters',
      subtitle: 'Juvéderm · Restylane · Belotero · Profhilo · Sculptra',
      pills: ['Ácido Hialurónico', 'Bioestimuladores', 'Lipólisis', 'Precio Directo'],
      cardTitle: 'Suministro Estético',
      cardLines: [
        { k: 'Marcas', v: '8 Líneas Líderes Marcado CE' },
        { k: 'Catálogo', v: '40 Referencias Originales' },
        { k: 'Envío', v: 'Stock Local y Cadena Frío' },
        { k: 'Export', v: 'PDF B2B y Cotización' },
      ],
    },
  },
  pens: {
    accent: '#0284c7',
    accentSoft: '#38bdf8',
    en: {
      badge: 'PRE-FILLED · 3 ML MULTI-DOSE',
      title1: 'Peptide Pens',
      title2: 'Click-Dial Dosing',
      subtitle: 'HPLC ≥99.2% · Ready-to-Use · No Reconstitution',
      pills: ['BPC-157 Pen', 'Semaglutide Pen', 'NAD+ 750 mg', 'MOTS-c 30 mg'],
      cardTitle: 'Precision Delivery',
      cardLines: [
        { k: 'Format', v: '3 mL Pre-Filled Cartridge' },
        { k: 'Dosing', v: 'Click-Dial Micro-Titration' },
        { k: 'Purity', v: 'HPLC ≥ 99.2% Verified' },
        { k: 'Protocol', v: 'Integrated Dosing Matrix' },
      ],
    },
    es: {
      badge: 'PRECARGADAS · 3 ML MULTIDOSIS',
      title1: 'Plumas de Péptidos',
      title2: 'Dosificación Click-Dial',
      subtitle: 'HPLC ≥99,2% · Listas para Usar · Sin Reconstitución',
      pills: ['Pluma BPC-157', 'Pluma Semaglutida', 'NAD+ 750 mg', 'MOTS-c 30 mg'],
      cardTitle: 'Administración Precisa',
      cardLines: [
        { k: 'Formato', v: 'Cartucho Precargado 3 mL' },
        { k: 'Dosis', v: 'Micro-Titulación Click-Dial' },
        { k: 'Pureza', v: 'HPLC ≥ 99,2% Verificada' },
        { k: 'Protocolo', v: 'Matriz Clínica Integrada' },
      ],
    },
  },
  bhrt: {
    accent: '#16a34a',
    accentSoft: '#4ade80',
    en: {
      badge: 'EU GMP · COMPOUNDED BHRT',
      title1: 'Bioidentical HRT',
      title2: 'Creams, Capsules & Pellets',
      subtitle: 'Topi-CLICK · Oral Micronized · Vaginal · Subcutaneous',
      pills: ['Progesterone', 'Estradiol / Bi-Est', 'DHEA / Pregnenolone', 'Testosterone'],
      cardTitle: 'EU GMP Formulary',
      cardLines: [
        { k: 'Transdermal', v: 'Topi-CLICK Metered Creams' },
        { k: 'Oral', v: 'Micronized Capsules' },
        { k: 'Subdermal', v: 'Fused Hormone Pellets' },
        { k: 'Batch', v: 'Single & Bulk MOQ Pricing' },
      ],
    },
    es: {
      badge: 'EU GMP · BHRT MAGISTRAL',
      title1: 'HRT Bioidéntica',
      title2: 'Cremas, Cápsulas y Pellets',
      subtitle: 'Topi-CLICK · Oral Micronizada · Vaginal · Subcutánea',
      pills: ['Progesterona', 'Estradiol / Bi-Est', 'DHEA / Pregnenolona', 'Testosterona'],
      cardTitle: 'Formulario EU GMP',
      cardLines: [
        { k: 'Transdérmica', v: 'Cremas Dosificadas Topi-CLICK' },
        { k: 'Oral', v: 'Cápsulas Micronizadas' },
        { k: 'Subdérmica', v: 'Pellets Hormonales Fundidos' },
        { k: 'Lotes', v: 'Tarifa Unidad y Lote MOQ' },
      ],
    },
  },
  hormones: {
    accent: '#16a34a',
    accentSoft: '#4ade80',
    en: {
      badge: 'EU GMP · COMPOUNDED HORMONES',
      title1: 'Compounded Hormones',
      title2: 'TRT & BHRT Schedule',
      subtitle: 'Injectables · Transdermal Creams · Capsules · Pellets',
      pills: ['Testosterone', 'Progesterone', 'Estradiol', 'Thyroid / DHEA'],
      cardTitle: 'Endocrinology Supply',
      cardLines: [
        { k: 'TRT', v: 'Cypionate / Enanthate / Cream' },
        { k: 'Female BHRT', v: 'Bi-Est · Progesterone · DHEA' },
        { k: 'Quality', v: 'EU GMP Sterile & Oral' },
        { k: 'Access', v: 'Official B2B Tariff' },
      ],
    },
    es: {
      badge: 'EU GMP · HORMONAS MAGISTRALES',
      title1: 'Hormonas Magistrales',
      title2: 'Tarifa TRT y BHRT',
      subtitle: 'Inyectables · Cremas Transdérmicas · Cápsulas · Pellets',
      pills: ['Testosterona', 'Progesterona', 'Estradiol', 'Tiroides / DHEA'],
      cardTitle: 'Suministro Endocrinología',
      cardLines: [
        { k: 'TRT', v: 'Cipionato / Enantato / Crema' },
        { k: 'BHRT Mujer', v: 'Bi-Est · Progesterona · DHEA' },
        { k: 'Calidad', v: 'EU GMP Estéril y Oral' },
        { k: 'Acceso', v: 'Tarifa Oficial B2B' },
      ],
    },
  },
  colway: {
    accent: '#9333ea',
    accentSoft: '#c084fc',
    en: {
      badge: 'MEDICAL GRADE · COLLAGEN',
      title1: 'Colway Medical',
      title2: 'Cellular Derma',
      subtitle: 'Native Fish Tropocollagen · Transdermal Delivery',
      pills: ['Native Collagen', 'Colvita Capsules', 'Stem Cell Cream', 'B2B Pricing'],
      cardTitle: 'Cellular Regeneration',
      cardLines: [
        { k: 'Active', v: 'Triple-Helix Tropocollagen' },
        { k: 'Systemic', v: 'Colvita Lyophilized Caps' },
        { k: 'Topical', v: 'Transdermal Bio-Peptides' },
        { k: 'Supply', v: 'Official UAE / EU Tariff' },
      ],
    },
    es: {
      badge: 'GRADO MÉDICO · COLÁGENO',
      title1: 'Colway Medical',
      title2: 'Derma Celular',
      subtitle: 'Tropocolágeno Nativo Marino · Vía Transdérmica',
      pills: ['Colágeno Nativo', 'Cápsulas Colvita', 'Crema Stem Cell', 'Tarifa B2B'],
      cardTitle: 'Regeneración Celular',
      cardLines: [
        { k: 'Activo', v: 'Tropocolágeno Triple Hélice' },
        { k: 'Sistémico', v: 'Colvita Liofilizado Oral' },
        { k: 'Tópico', v: 'Biopéptidos Transdérmicos' },
        { k: 'Suministro', v: 'Tarifa Oficial EAU / UE' },
      ],
    },
  },
  'colway-hair': {
    accent: '#9333ea',
    accentSoft: '#c084fc',
    en: {
      badge: 'TRICHOLOGY · CLINICAL HAIR',
      title1: 'Colway Hair Care',
      title2: 'Trichology Line',
      subtitle: 'Baicapil™ 2% · Native Tropocollagen · Micronized Diosmin',
      pills: ['Anti-Hair Loss', 'Scalp Micro-Flow', 'Post-FUE Care', 'B2B Pricing'],
      cardTitle: 'Follicular Anchoring',
      cardLines: [
        { k: 'Complex', v: 'Baicapil™ 2% + Tropocollagen' },
        { k: 'Vascular', v: 'Micronized Diosmin + Caffeine' },
        { k: 'Protocol', v: 'Pre & Post-FUE Maintenance' },
        { k: 'pH', v: 'Scalp-Balanced pH 5.5' },
      ],
    },
    es: {
      badge: 'TRICOLOGÍA · CAPILAR CLÍNICO',
      title1: 'Colway Capilar',
      title2: 'Línea Tricológica',
      subtitle: 'Baicapil™ 2% · Tropocolágeno Nativo · Diosmina Micronizada',
      pills: ['Anticaída', 'Microcirculación', 'Cuidado Post-FUE', 'Tarifa B2B'],
      cardTitle: 'Anclaje Folicular',
      cardLines: [
        { k: 'Complejo', v: 'Baicapil™ 2% + Tropocolágeno' },
        { k: 'Vascular', v: 'Diosmina + Cafeína + Zinc' },
        { k: 'Protocolo', v: 'Mantenimiento Pre/Post-FUE' },
        { k: 'pH', v: 'Equilibrado Cuero Cabelludo 5,5' },
      ],
    },
  },
  bloodo: {
    accent: '#dc2626',
    accentSoft: '#f87171',
    en: {
      badge: 'CE-IVDR · CAPILLARY DBS',
      title1: 'Bloodo™ Diagnostics',
      title2: 'Capillary Blood Panels',
      subtitle: 'NAD+ Intracellular · Testosterone+ · Cortisol · HbA1c · Omega',
      pills: ['NAD+ Panel', 'Hormone+ Panel', 'Diurnal Cortisol', '48–72h Results'],
      cardTitle: 'Dried Blood Spot (DBS)',
      cardLines: [
        { k: 'Sample', v: 'Painless Finger-Prick DBS' },
        { k: 'Turnaround', v: '48–72 Hours Lab Report' },
        { k: 'Cert', v: 'CE-IVDR Accredited Lab' },
        { k: 'Integration', v: 'Direct Physician Portal' },
      ],
    },
    es: {
      badge: 'CE-IVDR · SANGRE CAPILAR DBS',
      title1: 'Diagnóstico Bloodo™',
      title2: 'Paneles en Sangre Capilar',
      subtitle: 'NAD+ Intracelular · Testosterona+ · Cortisol · HbA1c · Omega',
      pills: ['Panel NAD+', 'Panel Hormonal+', 'Cortisol Diurno', 'Resultados 48–72h'],
      cardTitle: 'Gota Seca Capilar (DBS)',
      cardLines: [
        { k: 'Muestra', v: 'Punción Capilar Indolora' },
        { k: 'Plazo', v: 'Informe Clínico 48–72 Horas' },
        { k: 'Certificado', v: 'Laboratorio Acreditado CE-IVDR' },
        { k: 'Integración', v: 'Portal Médico Directo' },
      ],
    },
  },
  genomics: {
    accent: '#2563eb',
    accentSoft: '#60a5fa',
    en: {
      badge: 'CE-IVD · SALIVA DNA',
      title1: 'Clinical DNA Panels',
      title2: 'Precision Genomics',
      subtitle: '+700,000 SNPs · Pharmacogenetics · Nutrigenetics',
      pills: ['All-in-One 7-in-1', 'Pharmacogenetics', 'Nutrigenetics', 'Health + Sport'],
      cardTitle: 'Genomic Intelligence',
      cardLines: [
        { k: 'Array', v: 'Illumina GSA +700,000 SNPs' },
        { k: 'Sample', v: 'Non-Invasive Buccal Swab' },
        { k: 'Reports', v: '7 Clinical & Wellness Modules' },
        { k: 'Synergy', v: 'Custom Compounding Calibration' },
      ],
    },
    es: {
      badge: 'CE-IVD · ADN EN SALIVA',
      title1: 'Paneles Genómicos',
      title2: 'Genómica de Precisión',
      subtitle: '+700.000 SNPs · Farmacogenética · Nutrigenética',
      pills: ['All-in-One 7-en-1', 'Farmacogenética', 'Nutrigenética', 'Salud + Deporte'],
      cardTitle: 'Inteligencia Genómica',
      cardLines: [
        { k: 'Array', v: 'Illumina GSA +700.000 SNPs' },
        { k: 'Muestra', v: 'Hisopo Bucal No Invasivo' },
        { k: 'Informes', v: '7 Módulos Clínicos Completos' },
        { k: 'Sinergia', v: 'Calibración Magistral a Medida' },
      ],
    },
  },
  pricing: {
    accent: '#003666',
    accentSoft: '#3b82f6',
    en: {
      badge: 'INSTITUTIONAL B2B PLATFORM',
      title1: 'Atlas Health Services',
      title2: 'Unified Price Hub',
      subtitle: 'Peptides · Pellets · Fillers · Pens · Genomics · BHRT',
      pills: ['Official B2B Tariffs', 'EUR / USD / AED', 'Pack ×10 Savings', 'Live PDF Export'],
      cardTitle: 'Clinical Supply Hub',
      cardLines: [
        { k: 'Catalog', v: 'Peptides · Pellets · Fillers' },
        { k: 'Diagnostics', v: '24Genetics · Bloodo™ DBS' },
        { k: 'Compliance', v: 'EU GMP & cGMP Verified' },
        { k: 'Ordering', v: 'Direct RFQ & WhatsApp Sync' },
      ],
    },
    es: {
      badge: 'PLATAFORMA INSTITUCIONAL B2B',
      title1: 'Atlas Health Services',
      title2: 'Hub Unificado de Tarifas',
      subtitle: 'Péptidos · Pellets · Fillers · Plumas · Genómica · BHRT',
      pills: ['Tarifas Oficiales B2B', 'EUR / USD / AED', 'Ahorro Pack ×10', 'Exportación PDF'],
      cardTitle: 'Hub de Suministro Clínico',
      cardLines: [
        { k: 'Catálogo', v: 'Péptidos · Pellets · Fillers' },
        { k: 'Diagnóstico', v: '24Genetics · Bloodo™ DBS' },
        { k: 'Calidad', v: 'Estándar EU GMP y cGMP' },
        { k: 'Pedidos', v: 'Solicitud Directa y PDF B2B' },
      ],
    },
  },
  'recon-guide': {
    accent: '#7c3aed',
    accentSoft: '#a78bfa',
    en: {
      badge: 'CLINICAL REFERENCE',
      title1: 'Peptide Reconstitution',
      title2: '& Dosing Guide',
      subtitle: 'U-100 Syringe Math · Click-Dial Pens · 28-Day Stability',
      pills: ['BAC Water Mixing', 'U-100 Units', 'Pen Click Dosing', 'Cold Chain'],
      cardTitle: 'Dosing Precision',
      cardLines: [
        { k: 'Diluent', v: '1.0 – 3.0 mL BAC Water' },
        { k: 'Syringe', v: 'U-100 Unit Conversion Table' },
        { k: 'Pens', v: '3 mL Click-Dial Equivalents' },
        { k: 'Storage', v: '2–8 °C · 28-Day Stability' },
      ],
    },
    es: {
      badge: 'REFERENCIA CLÍNICA',
      title1: 'Reconstitución de Péptidos',
      title2: 'y Guía de Dosificación',
      subtitle: 'Cálculo Jeringa U-100 · Plumas Click-Dial · Estabilidad 28 días',
      pills: ['Agua BAC', 'Unidades U-100', 'Dosis por Clics', 'Cadena de Frío'],
      cardTitle: 'Precisión de Dosificación',
      cardLines: [
        { k: 'Diluyente', v: '1,0 – 3,0 mL Agua Bacteriostática' },
        { k: 'Jeringa', v: 'Tabla de Unidades U-100' },
        { k: 'Plumas', v: 'Equivalencias Click-Dial 3 mL' },
        { k: 'Conservación', v: '2–8 °C · Estabilidad 28 Días' },
      ],
    },
  },
  'compare-guide': {
    accent: '#d97706',
    accentSoft: '#fbbf24',
    en: {
      badge: 'CLINICAL COMPARISON',
      title1: 'Peptide Protocols',
      title2: 'Head-to-Head Analysis',
      subtitle: 'BPC-157 vs TB-500 · Tirzepatide vs Retatrutide · MOTS-c vs SS-31',
      pills: ['Tissue Repair', 'GLP-1 / GIP', 'Mitochondrial', 'Vials vs Pens'],
      cardTitle: 'Comparative Matrix',
      cardLines: [
        { k: 'Repair', v: 'BPC-157 vs TB-500 Synergy' },
        { k: 'Metabolic', v: 'Sema vs Tirze vs Retatrutide' },
        { k: 'Longevity', v: 'MOTS-c vs SS-31 Pathways' },
        { k: 'Format', v: '10R Vials vs 3 mL Pens' },
      ],
    },
    es: {
      badge: 'COMPARATIVA CLÍNICA',
      title1: 'Protocolos de Péptidos',
      title2: 'Análisis Comparativo',
      subtitle: 'BPC-157 vs TB-500 · Tirzepatida vs Retatrutida · MOTS-c vs SS-31',
      pills: ['Reparación Tisular', 'GLP-1 / GIP', 'Mitocondrial', 'Viales vs Plumas'],
      cardTitle: 'Matriz Comparativa',
      cardLines: [
        { k: 'Reparación', v: 'Sinergia BPC-157 vs TB-500' },
        { k: 'Metabólico', v: 'Sema vs Tirze vs Retatrutida' },
        { k: 'Longevidad', v: 'Vías MOTS-c vs SS-31' },
        { k: 'Formato', v: 'Viales 10R vs Plumas 3 mL' },
      ],
    },
  },
  suppliers: {
    accent: '#003666',
    accentSoft: '#38bdf8',
    en: {
      badge: 'SUPPLIER & MANUFACTURER PARTNER HUB',
      title1: 'Scale Your Clinical Line',
      title2: 'Across Europe & GCC',
      subtitle: 'Consolidated POs · EU GMP & MOH Traceability · Zero Channel Leakage',
      pills: ['Consolidated B2B POs', 'EUR · USD · AED', '72h Onboarding', 'Refill QR Loop'],
      cardTitle: 'Partner Infrastructure',
      cardLines: [
        { k: 'Corridors', v: 'Europe (EU) · UAE / GCC' },
        { k: 'Protection', v: 'Role-Gated Pricing · No Leaks' },
        { k: 'Demand', v: 'Clinical Guides + Atlas AI' },
        { k: 'Compliance', v: 'Batch · CoA · Import Control' },
      ],
    },
    es: {
      badge: 'PORTAL PARA FABRICANTES Y SUPPLIERS',
      title1: 'Escala tu Línea Clínica',
      title2: 'en Europa y Oriente Medio',
      subtitle: 'POs Consolidadas · Trazabilidad EU GMP / MOH · Protección de Canal',
      pills: ['POs Consolidadas', 'EUR · USD · AED', 'Onboarding 72h', 'Recompra vía QR'],
      cardTitle: 'Infraestructura Partner',
      cardLines: [
        { k: 'Corredores', v: 'Europa (UE) · EAU / GCC' },
        { k: 'Protección', v: 'Precios por Rol · Sin Fugas' },
        { k: 'Demanda', v: 'Guías Clínicas + Atlas AI' },
        { k: 'Cumplimiento', v: 'Lotes · CoA · Import Control' },
      ],
    },
  },
  doctors: {
    accent: '#0d9488',
    accentSoft: '#2dd4bf',
    en: {
      badge: 'PHYSICIAN & CLINIC PARTNER HUB',
      title1: 'Precision Longevity & BHRT',
      title2: 'Clinical Operating System',
      subtitle: 'EU GMP Formularies · Interactive Guides · Private Patient QR & BUD Reminders',
      pills: ['16+ Clinical Schedules', 'Trocar & Dosing Guides', 'Patient QR Refills', 'Atlas AI + PubMed'],
      cardTitle: 'Clinic Enablement',
      cardLines: [
        { k: 'Formulary', v: 'Pellets · Peptides · BHRT · DNA' },
        { k: 'Patient UX', v: 'Private QR Guide · Zero Prices' },
        { k: 'Retention', v: 'Automated BUD Refill Alerts' },
        { k: 'Activation', v: 'Clinic Live in 15 Minutes' },
      ],
    },
    es: {
      badge: 'PORTAL PARA MÉDICOS Y CLÍNICAS',
      title1: 'Longevidad y BHRT',
      title2: 'Sistema Clínico Unificado',
      subtitle: 'Formularios EU GMP · Guías Interactivas · QR Privado de Paciente y Avisos BUD',
      pills: ['16+ Tarifas Clínicas', 'Guías Trócar y Dosis', 'Recompra QR Paciente', 'Atlas AI + PubMed'],
      cardTitle: 'Valor en Consulta',
      cardLines: [
        { k: 'Formulario', v: 'Pellets · Péptidos · BHRT · ADN' },
        { k: 'Paciente', v: 'Guía QR Privada · Sin Precios' },
        { k: 'Retención', v: 'Avisos Automáticos BUD' },
        { k: 'Activación', v: 'Clínica Activa en 15 Minutos' },
      ],
    },
  },
  rx: {
    accent: '#003666',
    accentSoft: '#38bdf8',
    en: {
      badge: 'CLINICAL PRESCRIPTION DOSSIER',
      title1: 'Verified Formulation',
      title2: '& Posology Monograph',
      subtitle: 'Exact Dosing Protocol · Storage & Stability · Private Patient QR Ready',
      pills: ['Exact Dose Card', 'Storage & BUD', 'EU GMP Compounding', 'Zero PII Preview'],
      cardTitle: 'Clinical Verification',
      cardLines: [
        { k: 'Format', v: 'Verified Clinical Monograph' },
        { k: 'Privacy', v: 'HIPAA / DHA De-Identified' },
        { k: 'Patient UX', v: '1-Click Private QR Guide' },
        { k: 'Compliance', v: 'Batch & Stability Tracked' },
      ],
    },
    es: {
      badge: 'EXPEDIENTE DE PRESCRIPCIÓN CLÍNICA',
      title1: 'Formulación Verificada',
      title2: 'y Monografía Posológica',
      subtitle: 'Protocolo de Dosis Exacta · Conservación y BUD · Guía QR Privada',
      pills: ['Guía Dosis Exacta', 'Conservación y BUD', 'Formulación EU GMP', 'Sin PII en Preview'],
      cardTitle: 'Verificación Clínica',
      cardLines: [
        { k: 'Formato', v: 'Monografía Clínica Verificada' },
        { k: 'Privacidad', v: 'Sin Datos Personales (PII)' },
        { k: 'Paciente', v: 'Guía QR Privada en 1 Clic' },
        { k: 'Calidad', v: 'Trazabilidad de Lote y BUD' },
      ],
    },
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'pricing';
  const lang = (searchParams.get('lang') || 'en').toLowerCase() === 'es' ? 'es' : 'en';
  const cur = (searchParams.get('cur') || searchParams.get('currency') || 'EUR').toUpperCase();
  const validCur = ['EUR', 'USD', 'AED'].includes(cur) ? cur : 'EUR';
  const showCurrency = !topic.endsWith('-guide');

  const cfg = TOPIC_CONFIG[topic] || TOPIC_CONFIG.pricing;
  const copy = cfg[lang] || cfg.en;
  const accent = cfg.accent || '#003666';
  const accentSoft = cfg.accentSoft || '#38bdf8';

  const footerText = lang === 'es'
    ? 'atlashealth-services.com · Suministro Clínico Verificado'
    : 'atlashealth-services.com · Verified Clinical Supply';
  const tariffText = lang === 'es'
    ? (showCurrency ? `Tarifa Oficial B2B · ${validCur}` : 'Guía Clínica Oficial')
    : (showCurrency ? `Official B2B Tariff · ${validCur}` : 'Official Clinical Guide');

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          background: 'linear-gradient(135deg, #061121 0%, #0b1f3a 55%, #07172d 100%)',
          padding: '44px 48px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Left Accent Stripe */}
        <div
          style={{
            width: '8px',
            height: '542px',
            borderRadius: '4px',
            backgroundColor: accent,
            marginRight: '32px',
            flexShrink: 0,
            display: 'flex',
          }}
        />

        {/* Left Content Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            paddingRight: '32px',
          }}
        >
          {/* Top Brand & Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#061121',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 900,
                  }}
                >
                  A
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em', color: '#f8fafc' }}>
                    Atlas Health Services
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8' }}>
                    INSTITUTIONAL B2B PLATFORM
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#e2e8f0',
                }}
              >
                {lang === 'es' ? 'ES · Español' : 'EN · English'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: accent,
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#ffffff',
                }}
              >
                {copy.badge}
              </div>
              {showCurrency && (
                <div
                  style={{
                    display: 'flex',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    backgroundColor: '#1e3a5f',
                    border: `1px solid ${accentSoft}`,
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  {validCur}
                </div>
              )}
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#ffffff', display: 'flex' }}>
              {copy.title1}
            </div>
            <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: accentSoft, display: 'flex' }}>
              {copy.title2}
            </div>
            <div style={{ fontSize: '19px', fontWeight: 500, color: '#cbd5e1', marginTop: '6px', display: 'flex' }}>
              {copy.subtitle}
            </div>
          </div>

          {/* Pills & Footer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {copy.pills.map((pill) => (
                <div
                  key={pill}
                  style={{
                    display: 'flex',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(15, 35, 62, 0.9)',
                    border: '1px solid #234268',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#e2e8f0',
                  }}
                >
                  {pill}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                paddingTop: '14px',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>{tariffText}</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>{footerText}</span>
            </div>
          </div>
        </div>

        {/* Right Clinical Spec Card (replaces inaccurate static diagrams) */}
        <div
          style={{
            width: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 32, 56, 0.92)',
            borderRadius: '22px',
            border: '1px solid #1e3a5f',
            padding: '28px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
                paddingBottom: '14px',
              }}
            >
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>{copy.cardTitle}</span>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '6px',
                  backgroundColor: accentSoft,
                  display: 'flex',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {copy.cardLines.map((row) => (
                <div
                  key={row.k}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(6, 17, 33, 0.65)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentSoft }}>
                    {row.k}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Pellet / Clinical Graphic Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(13, 148, 136, 0.12)',
              border: `1px solid ${accent}`,
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 700, color: accentSoft }}>
              {lang === 'es' ? '✓ Verificado Clínico B2B' : '✓ Verified B2B Clinical'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
              {showCurrency ? validCur : '2026'}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  );
}
