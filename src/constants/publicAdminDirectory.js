/**
 * publicAdminDirectory.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Admin-only quick-navigation directory for the public search bar /
 * Command Palette (⌘K), plus shared registries for the 4 Unified Portals
 * (Block 2) and the 4 Pharmacy & Rx Tools (Block 3).
 */

export const FOUR_UNIFIED_PORTALS = [
  {
    id: 'doctor',
    labelEn: 'Doctors Portal',
    labelEs: 'Portal de Médicos',
    href: '/doctor',
    tag: '/doctor · /dr',
    audience: 'specialist',
    keywords: 'doctor medicos portal physician workstation dr',
  },
  {
    id: 'patient',
    labelEn: 'Patients Portal',
    labelEs: 'Portal de Pacientes',
    href: '/patient',
    tag: '/patient',
    audience: 'patient',
    keywords: 'patient pacientes portal orders prescriptions',
  },
  {
    id: 'dna-patient',
    labelEn: 'DNA Portal · Patient View',
    labelEs: 'Portal ADN · Vista Paciente',
    href: '/patient/dna-report?patient=Mr.%20Hossam&sample=G000943554',
    tag: 'DNA Patient',
    audience: 'patient',
    keywords: 'hossam dna report paciente patient 24genetics G000943554',
  },
  {
    id: 'dna-nutritionist',
    labelEn: 'DNA Portal · Nutritionist View',
    labelEs: 'Portal ADN · Vista Nutricionista',
    href: '/patient/dna-report?patient=Mr.%20Hossam&sample=G000943554&view=nutritionist&nt=b54e80a0936c1a4f',
    tag: 'DNA Specialist',
    audience: 'specialist',
    keywords: 'hossam dna report nutricionista nutritionist specialist 24genetics',
  },
];

export const PHARMACY_OPS_TOOLS = [
  {
    id: 'labels',
    labelEn: 'Labels Studio & Rx',
    labelEs: 'Labels Studio y Recetas',
    href: '/labels',
    tag: '/labels · GMP',
    keywords: 'labels etiquetas rx prescriptions recetas studio',
  },
  {
    id: 'intake',
    labelEn: 'New Rx Intake',
    labelEs: 'Nuevo Intake Receta',
    href: '/rx/intake',
    tag: '/rx/intake',
    keywords: 'intake nueva receta prescription e-rx import',
  },
  {
    id: 'compounding',
    labelEn: 'Compounding Lab',
    labelEs: 'Compounding Magistral',
    href: '/compounding',
    tag: '/compounding',
    keywords: 'compounding formulacion magistral capsules',
  },
  {
    id: 'calculator',
    labelEn: 'Reconstitution Calculator',
    labelEs: 'Calculadora Reconstitución',
    href: '/calculator',
    tag: '/calculator',
    keywords: 'calculator calculadora reconstitution vials',
  },
];

export const ADMIN_DIRECTORY_GROUPS = [
  {
    id: 'catalogs',
    titleEn: '1. Main Catalogs & Collections',
    titleEs: '1. Catálogos Principales y Colecciones',
    items: [
      {
        labelEn: 'Peptides Catalog',
        labelEs: 'Catálogo de Péptidos',
        href: '/collection/peptides',
        tag: 'Peptides · Vials',
        keywords: 'peptides peptidos viales lyophilized bpc tb500 ghk',
      },
      {
        labelEn: 'Protocols Catalog',
        labelEs: 'Catálogo de Protocolos',
        href: '/proto',
        tag: 'Protocols',
        keywords: 'protocols protocolos finder pathways Longevity',
      },
      {
        labelEn: 'Fillers & Aesthetic Injectables',
        labelEs: 'Catálogo de Fillers e Inyectables',
        href: '/collection/fillers',
        tag: 'Fillers · 40 SKUs',
        keywords: 'fillers injectables inyectables esteticos juvederm teoxane restylane sculptra radiesse',
      },
      {
        labelEn: '24Genomics / 24Genetics Catalog',
        labelEs: 'Catálogo de 24Genomics / 24Genetics',
        href: '/pricing/24genetics',
        tag: 'DNA Panels',
        keywords: '24genomics 24genetics adn dna nutrigenomics ancestry',
      },
      {
        labelEn: 'Colway® Collagen & Trichology',
        labelEs: 'Catálogo de Colway® (Colágeno y Capilar)',
        href: '/collection/colway',
        tag: 'Colway · Derma',
        keywords: 'colway collagen colageno derma hair trichology',
      },
      {
        labelEn: 'Bloodo™ Capillary Diagnostics (DBS)',
        labelEs: 'Catálogo de Bloodo™ (Diagnóstico Capilar)',
        href: '/collection/bloodo',
        tag: 'Bloodo · DBS',
        keywords: 'bloodo dbs capillary blood nad cortisol hba1c testosterone',
      },
      {
        labelEn: 'Hair Treatments & Trichology',
        labelEs: 'Tratamientos Capilares y Tricología',
        href: '/collection/hair-treatments',
        tag: 'Hair · Baicapil',
        keywords: 'hair capilar alopecia trichotest mcg colway',
      },
      {
        labelEn: 'Hormones & TRT (Norma®)',
        labelEs: 'Catálogo de Hormonas y TRT',
        href: '/collection/hormones',
        tag: 'TRT · BHRT',
        keywords: 'hormones hormonas trt bhrt testosterone norma nplabs',
      },
      {
        labelEn: 'TeleTest® Lab Diagnostics',
        labelEs: 'Catálogo TeleTest® Laboratorio',
        href: '/collection/teletest',
        tag: 'HLA & HTMA',
        keywords: 'teletest hla htma mineral heavy metals',
      },
      {
        labelEn: 'ETERNA® Multi-Omics & UltraPerson™',
        labelEs: 'Catálogo ETERNA® y UltraPerson™',
        href: '/collection/eterna',
        tag: 'Multi-Omics',
        keywords: 'eterna ultraperson longevity proteomics supplements',
      },
    ],
  },
  {
    id: 'portals',
    titleEn: '2. The 4 Unified Portals',
    titleEs: '2. Los 4 Portales Unificados',
    items: FOUR_UNIFIED_PORTALS,
  },
  {
    id: 'ops',
    titleEn: '3. Pharmacy, Prescriptions & Tools',
    titleEs: '3. Farmacia, Recetas (Rx) y Herramientas',
    items: PHARMACY_OPS_TOOLS,
  },
  {
    id: 'pricing',
    titleEn: '4. Official B2B Price Schedules',
    titleEs: '4. Tarifarios Oficiales B2B',
    items: [
      {
        labelEn: 'B2B Price Schedules Hub',
        labelEs: 'Hub Central de Tarifas B2B',
        href: '/pricing',
        tag: '/pricing',
        keywords: 'pricing tarifas precios b2b hub',
      },
      {
        labelEn: '24Genomics Qatar Price List',
        labelEs: 'Tarifario 24Genomics Qatar',
        href: '/pricing/24genomics-qatar',
        tag: 'QAR · GCC',
        keywords: 'qatar 24genomics pricing tarifas',
      },
      {
        labelEn: 'Peptides Official Price Schedule',
        labelEs: 'Tarifario Oficial de Péptidos',
        href: '/pricing/peptides',
        tag: 'EUR · Peptides',
        keywords: 'peptides pricing tarifa peptidos',
      },
      {
        labelEn: 'Colway Qatar & Hormones Pricing',
        labelEs: 'Tarifas Colway Qatar y Hormonas',
        href: '/pricing/colway-qatar',
        tag: 'Colway · TRT',
        keywords: 'colway qatar hormones nplab pricing',
      },
    ],
  },
  {
    id: 'admin',
    titleEn: '5. Administration Console',
    titleEs: '5. Consola de Administración',
    items: [
      {
        labelEn: 'Admin Console (Catalog, Rx, Finance)',
        labelEs: 'Panel Admin (Catálogo, Recetas, Finanzas)',
        href: '/admin',
        tag: '/admin · GCP',
        keywords: 'admin console panel catalogo clientes finanzas',
      },
    ],
  },
];

export function filterAdminDirectoryGroups(query = '') {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return ADMIN_DIRECTORY_GROUPS;
  return ADMIN_DIRECTORY_GROUPS.map((group) => {
    const matchedItems = group.items.filter(
      (item) =>
        item.labelEn.toLowerCase().includes(q) ||
        item.labelEs.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
    );
    return { ...group, items: matchedItems };
  }).filter((group) => group.items.length > 0);
}
