 
/**
 * navConfig.js — Single source of truth for all static navigation.
 * Each menu item carries: label, path, icon (lucide name), desc, soon?.
 */

// ── Catalog — Browse column ───────────────────────────────────────────────────
export const CATALOG_BROWSE = [
  { label: 'Browse All Catalog', path: '/collection/all',       icon: 'LayoutGrid',   desc: 'Full product & protocol catalog' },
  { label: 'Browse Protocols',   path: '/collection/protocols', icon: 'ClipboardList',desc: 'Multi-peptide clinical blueprints' },
  { label: 'Browse Peptides',    path: '/collection/peptides',  icon: 'FlaskConical', desc: 'Individual peptides & supplements' },
  { label: 'Browse Supplements', path: '/collection/supplements',icon: 'Leaf',         desc: 'Evidence-based nutraceutical support' },
];

// ── Catalogs nav menu (Knowledge Hub) ─────────────────────────────────────────
export const CATALOGS_MENU = [
  {
    label: 'Peptides',
    path:  '/collection/peptides',
    icon:  'FlaskConical',
    desc:  'Research-grade peptide exploration',
  },
  {
    label: 'Supplements',
    path:  '/collection/supplements',
    icon:  'Leaf',
    desc:  'Evidence-based nutraceutical support',
  },
  {
    label: 'Protocols',
    path:  '/collection/protocols',
    icon:  'ClipboardList',
    desc:  'Structured biological pathways',
  },
  {
    label: 'Research Tools',
    path:  '/collection/all',
    icon:  'LayoutGrid',
    desc:  'Comparisons, sourcing & advanced discovery',
  },
  {
    label: 'Hormone Pellets',
    path:  '/collection/hormone-pellets',
    icon:  'HeartPulse',
    desc:  'Targeted hormone therapy pellets',
  },
];

// ── Academia ──────────────────────────────────────────────────────────────────
export const ACADEMIA_MENU = [
  { label: 'What Are Peptides',     path: '/what-are-peptides',  icon: 'FlaskConical',   desc: 'Science & classification of peptide compounds' },
  { label: 'What Are Protocols',    path: '/what-are-protocols', icon: 'ClipboardList',  desc: 'How clinical peptide protocols are structured' },
  { label: 'Science Blog',          path: '/blog',               icon: 'BookOpen',       desc: 'Latest research, updates & peptide literature' },
  { label: 'Dose Calculator',       path: '/calculator',         icon: 'Calculator',     desc: 'Compute precise dosage & reconstitution' },
  { label: 'Reconstitution Guides', path: '/reconstitution-guide', icon: 'Beaker',         desc: 'Step-by-step mixing protocols' },
  { label: 'FAQ',                   path: '/faq',                icon: 'HelpCircle',     desc: 'Frequently asked questions' },
];

// ── Resources ─────────────────────────────────────────────────────────────────
export const RESOURCES_MENU = [
  { label: 'About',          path: '/about',   icon: 'Info',        desc: 'Our mission and clinical standards' },
  { label: 'Contact',        path: '/contact', icon: 'Mail',        desc: 'Reach our clinical support team' },
  { label: 'Legal Notice',   path: '/legal',   icon: 'Scale',       desc: 'Regulatory and compliance notices' },
  { label: 'Privacy Policy', path: '/privacy', icon: 'ShieldCheck', desc: 'How we protect your data' },
  { label: 'Terms of Use',   path: '/terms',   icon: 'FileText',    desc: 'Terms governing use of this platform' },
];

// ── Workplace (role-based) ────────────────────────────────────────────────────
export const WORKPLACE_MENU = {
  guest: [
    { label: 'Cart',        path: '/cart',  icon: 'ShoppingCart' },
    { label: 'Saved Items', path: '/saved', icon: 'Bookmark' },
  ],
  professional: [
    { label: 'Cart',             path: '/cart',             icon: 'ShoppingCart' },
    { label: 'Saved Protocols',  path: '/saved/protocols',  icon: 'ClipboardList' },
    { label: 'Saved Products',   path: '/saved/products',   icon: 'Bookmark' },
    { label: 'Orders',           path: '/orders',           icon: 'Package' },
    { label: 'Order History',    path: '/orders/history',   icon: 'History' },
  ],
  admin: [
    { label: 'Cart',             path: '/cart',         icon: 'ShoppingCart' },
    { label: 'Orders',           path: '/orders',       icon: 'Package' },
    { label: 'Order Management', path: '/admin/orders', icon: 'Layers' },
  ],
};

// ── User Menu (role-based) ────────────────────────────────────────────────────
// Menu for unauthenticated visitors (not logged in at all)
export const VISITOR_MENU = [
  { label: 'Login',    path: '/login',             icon: 'LogIn' },
  { label: 'Register', path: '/login?tab=register', icon: 'UserPlus' },
];

export const USER_MENU = {
  // Authenticated guest (registered during checkout, no professional verification)
  guest: [
    { label: 'Orders',   path: '/orders',   icon: 'Package' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
  professional: [
    { label: 'Dashboard',    path: '/doctor',     icon: 'LayoutDashboard' },
    { label: 'My Protocols', path: '/my-protocols',  icon: 'ClipboardList' },
    { label: 'Saved Items',  path: '/saved',         icon: 'Bookmark' },
    { label: 'Orders',       path: '/orders',        icon: 'Package' },
    { label: 'Settings',     path: '/settings',      icon: 'Settings' },
  ],
  admin: [
    { label: 'Admin Dashboard',      path: '/admin',                   icon: 'ShieldCheck' },
    // ── Operations ────────────────────────────────────────────
    { label: 'Active Users',         path: '/admin?s=operations&t=users',     icon: 'Users',         section: 'admin', domain: 'Operations' },
    { label: 'Manage Products',      path: '/admin?s=operations&t=products',  icon: 'Package',       section: 'admin', domain: 'Operations' },
    { label: 'Pricing Matrix',       path: '/admin?s=operations&t=prices',    icon: 'Percent',       section: 'admin', domain: 'Operations' },
    { label: 'Cost Management',      path: '/admin?s=operations&t=costs',     icon: 'Tag',           section: 'admin', domain: 'Operations' },
    // ── Architecture ──────────────────────────────────────────
    { label: 'Clinical AI Config',   path: '/admin?s=architecture&t=clinical-ai', icon: 'Brain',     section: 'admin', domain: 'Architecture' },
    { label: 'AI Agents Cloud',       path: '/admin?s=architecture&t=ai-agents',   icon: 'Bot',       section: 'admin', domain: 'Architecture' },
    { label: 'Home Layout',          path: '/admin?s=architecture&t=home-layout', icon: 'LayoutGrid',    section: 'admin', domain: 'Architecture' },
    { label: 'Global Settings',      path: '/admin?s=architecture&t=settings',    icon: 'Settings',  section: 'admin', domain: 'Architecture' },
    // ── Intelligence ──────────────────────────────────────────────
    { label: 'System Analytics',     path: '/admin?s=intelligence&t=analytics',   icon: 'BarChart2', section: 'admin', domain: 'Intelligence' },
    { label: 'Clinical Logs',        path: '/admin?s=intelligence&t=clinical-logs', icon: 'Activity', section: 'admin', domain: 'Intelligence' },
  ],
};

// ── Top-level nav items ───────────────────────────────────────────────────────
export const TOP_NAV = [
  { label: 'Home',     path: '/',   dropdown: null,        icon: 'Home' },
  { label: 'Knowledge Hub', path: null,  dropdown: 'catalog',  icon: 'BookCopy' },
  { label: 'Academia', path: null,  dropdown: 'academia',  icon: 'GraduationCap' },
  { label: 'Resources',path: null,  dropdown: 'resources', icon: 'BookMarked' },
];

export const ROLE_NAV_MENUS = {
  guest: [
    { label: 'Home',          path: '/',                     dropdown: null,        icon: 'Home' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'Academia',      path: null,                    dropdown: 'academia',  icon: 'GraduationCap' },
    { label: 'Resources',     path: null,                    dropdown: 'resources', icon: 'BookMarked' },
  ],
  admin: [
    { label: 'Admin Dashboard',   path: '/admin',                               dropdown: null, icon: 'ShieldCheck' },
    { label: 'Catalog Management',path: null,                                   dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'Clinical AI Config',path: '/admin?s=architecture&t=clinical-ai', dropdown: null, icon: 'Brain' },
    { label: 'AI Agents Cloud',   path: '/admin?s=architecture&t=ai-agents',   dropdown: null, icon: 'Bot' },
    { label: 'Active Users',      path: '/admin?s=operations&t=users',         dropdown: null, icon: 'Users' },
  ],
  doctor: [
    { label: 'Dashboard',     path: '/doctor',               dropdown: null,        icon: 'Home' },
    { label: 'Patients',      path: '/doctor/patients',      dropdown: null,        icon: 'Users' },
    { label: 'Lab Results',   path: '/doctor/lab-results',   dropdown: null,        icon: 'Activity' },
    { label: 'Research',      path: '/doctor/research',      dropdown: null,        icon: 'BookOpen' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
  ],
  clinic: [
    { label: 'Dashboard',     path: '/clinic',               dropdown: null,        icon: 'Home' },
    { label: 'Orders',        path: '/orders',               dropdown: null,        icon: 'Package' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'Resources',     path: null,                    dropdown: 'resources', icon: 'BookMarked' },
  ],
  wholesaler: [
    { label: 'Home',          path: '/wholesaler',           dropdown: null,        icon: 'Home' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'My Orders',     path: '/orders',               dropdown: null,        icon: 'Package' },
    { label: 'Resources',     path: null,                    dropdown: 'resources', icon: 'BookMarked' },
  ],
  patient: [
    { label: 'Dashboard',     path: '/patient',              dropdown: null,        icon: 'Home' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'My Orders',     path: '/orders',               dropdown: null,        icon: 'Package' },
    { label: 'Resources',     path: null,                    dropdown: 'resources', icon: 'BookMarked' },
  ],
  staff: [
    { label: 'Dashboard',     path: '/paciente',            dropdown: null,        icon: 'Home' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'Orders',        path: '/orders',               dropdown: null,        icon: 'Package' },
    { label: 'Resources',     path: null,                    dropdown: 'resources', icon: 'BookMarked' },
  ],
  sales_agent: [
    { label: 'Dashboard',     path: '/paciente',            dropdown: null,        icon: 'Home' },
    { label: 'Knowledge Hub', path: null,                    dropdown: 'catalog',  icon: 'BookCopy' },
    { label: 'Orders',        path: '/orders',               dropdown: null,        icon: 'Package' },
    { label: 'Resources',     path: null,                    dropdown: 'resources', icon: 'BookMarked' },
  ]
};

