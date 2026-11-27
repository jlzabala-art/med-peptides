/**
 * b2bNavigationGraph.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for B2B navigation domains and contextual "Related
 * Screens" across the entire Atlas / RegenPept platform (Laptop & Mobile).
 */

export const B2B_NAV_DOMAINS = [
  {
    id: 'pharmacy_ops',
    titleEs: 'Operación Farmacia & Rx',
    titleEn: 'Pharmacy & Rx Ops',
    items: [
      { id: 'labels', href: '/labels', labelEs: 'Labels Studio & Rx', labelEn: 'Labels Studio & Rx', badge: 'GMP' },
      { id: 'intake', href: '/rx/intake', labelEs: 'Nuevo Intake Receta', labelEn: 'New Rx Intake', badge: 'AI' },
      { id: 'compounding', href: '/compounding', labelEs: 'Compounding Lab', labelEn: 'Compounding Lab' },
      { id: 'calculator', href: '/calculator', labelEs: 'Calculadora Dosis', labelEn: 'Dosing Calculator' }
    ]
  },
  {
    id: 'b2b_catalogs',
    titleEs: 'Catálogos & Tarifas B2B',
    titleEn: 'B2B Catalogs & Pricing',
    items: [
      { id: 'pricing_hub', href: '/pricing', labelEs: 'Hub Precios B2B', labelEn: 'B2B Price Hub' },
      { id: 'peptides', href: '/pricing/peptides', labelEs: 'Tarifa Péptidos', labelEn: 'Peptides Schedule' },
      { id: 'pellets', href: '/pricing/pellets', labelEs: 'Tarifa Pellets HRT', labelEn: 'Pellets Schedule' },
      { id: 'fillers', href: '/pricing/fillers', labelEs: 'Boosters & Fillers', labelEn: 'Boosters & Fillers' },
      { id: 'vials', href: '/vials?view=patient', labelEs: 'Guías para Pacientes', labelEn: 'Patient Guides' },
      { id: 'bloodo', href: '/pricing/bloodo', labelEs: 'Bloodo™ Diagnóstico', labelEn: 'Bloodo™ Diagnostics' },
      { id: 'genomics', href: '/pricing/24genetics', labelEs: '24Genetics ADN', labelEn: '24Genetics DNA' },
      { id: 'colway', href: '/pricing/colway', labelEs: 'Colway Tricología', labelEn: 'Colway Trichology' }
    ]
  },
  {
    id: 'clinical_protocols',
    titleEs: 'Clínica & Protocolos',
    titleEn: 'Clinical & Protocols',
    items: [
      { id: 'proto', href: '/proto', labelEs: 'Protocolos Clínicos', labelEn: 'Clinical Protocols' },
      { id: 'finder', href: '/protocol-finder', labelEs: 'Buscador Guiado', labelEn: 'Protocol Finder' },
      { id: 'pellet_guide', href: '/guides/hormone-pellets-implantation', labelEs: 'Guía Implante Pellets', labelEn: 'Trocar Pellets Guide' },
      { id: 'catalog_main', href: '/c/CAT-MU9L9GBN', labelEs: 'Catálogo Clínico', labelEn: 'Clinical Catalog' }
    ]
  },
  {
    id: 'portals_admin',
    titleEs: 'Portales & Gestión',
    titleEn: 'Portals & Management',
    items: [
      { id: 'doctor', href: '/doctor', labelEs: 'Portal de Médicos', labelEn: 'Doctors Portal' },
      { id: 'wholesaler', href: '/wholesaler', labelEs: 'Portal Wholesaler', labelEn: 'Wholesaler Portal' },
      { id: 'patient', href: '/patient', labelEs: 'Portal de Pacientes', labelEn: 'Patients Portal' },
      { id: 'admin', href: '/admin', labelEs: 'Admin Console', labelEn: 'Admin Console' }
    ]
  }
];

const FLAT_ITEMS_BY_ID = B2B_NAV_DOMAINS.flatMap((d) => d.items).reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const RELATED_RULES = [
  { match: '/labels', related: ['intake', 'compounding', 'calculator', 'doctor'] },
  { match: '/rx/intake', related: ['labels', 'compounding', 'calculator', 'proto'] },
  { match: '/compounding', related: ['labels', 'calculator', 'peptides', 'intake'] },
  { match: '/calculator', related: ['labels', 'compounding', 'proto', 'vials'] },
  { match: '/pricing/peptides', related: ['proto', 'calculator', 'pellets', 'fillers'] },
  { match: '/pricing/pellets', related: ['pellet_guide', 'peptides', 'fillers', 'pricing_hub'] },
  { match: '/pricing/fillers', related: ['peptides', 'pellets', 'pricing_hub', 'catalog_main'] },
  { match: '/pricing', related: ['peptides', 'pellets', 'fillers', 'genomics'] },
  { match: '/proto', related: ['finder', 'peptides', 'calculator', 'labels'] },
  { match: '/vials', related: ['calculator', 'peptides', 'labels', 'proto'] },
  { match: '/doctor', related: ['labels', 'intake', 'proto', 'pricing_hub'] },
  { match: '/wholesaler', related: ['pricing_hub', 'peptides', 'pellets', 'catalog_main'] }
];

export function getRelatedRoutes(pathname = '/') {
  const norm = String(pathname || '/').toLowerCase();
  const rule = RELATED_RULES.find((r) => norm.startsWith(r.match));
  const ids = rule ? rule.related : ['labels', 'pricing_hub', 'proto', 'calculator'];
  return ids.map((id) => FLAT_ITEMS_BY_ID[id]).filter(Boolean);
}

export function getActiveDomainId(pathname = '/') {
  const norm = String(pathname || '/').toLowerCase();
  for (const domain of B2B_NAV_DOMAINS) {
    if (domain.items.some((item) => item.href !== '/' && norm.startsWith(item.href.toLowerCase()))) {
      return domain.id;
    }
  }
  return 'pharmacy_ops';
}
