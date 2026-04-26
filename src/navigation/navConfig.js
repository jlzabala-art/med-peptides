/**
 * navConfig.js
 *
 * Single source of truth for all static navigation structures.
 * Dynamic catalog data is loaded separately via navigationRepository.js.
 *
 * Structure:
 *   CATALOG_BROWSE  — static browse links (col 1 of supermenu)
 *   ACADEMIA_MENU   — tools, learning, support columns
 *   RESOURCES_MENU  — company, legal, professional columns
 *   WORKPLACE_MENU  — role-based (guest | professional | admin)
 *   USER_MENU       — role-based (guest | professional | admin)
 */

// ── Catalog — Browse column (static) ─────────────────────────────────────────
export const CATALOG_BROWSE = [
  { label: 'Browse All Catalog',  path: '/catalog' },
  { label: 'Browse Protocols',    path: '/protocols' },
  { label: 'Browse Peptides',     path: '/peptides' },
];

// ── Academia ──────────────────────────────────────────────────────────────────
export const ACADEMIA_MENU = [
  { label: 'Calculator',            path: '/calculator' },
  { label: 'Peptides Education',    path: '/academy',   soon: true },
  { label: 'Reconstitution Guides', path: '/faq/reconstitution', soon: true },
  { label: 'FAQ',                   path: '/faq' },
];


// ── Resources ─────────────────────────────────────────────────────────────────
export const RESOURCES_MENU = [
  { label: 'About',          path: '/about' },
  { label: 'Contact',        path: '/contact' },
  { label: 'Legal Notice',   path: '/legal' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Use',   path: '/terms' },
];

// ── Workplace (role-based) ────────────────────────────────────────────────────
export const WORKPLACE_MENU = {
  guest: [
    { label: 'Cart',        path: '/cart' },
    { label: 'Saved Items', path: '/saved' },
  ],
  professional: [
    { label: 'Cart',             path: '/cart' },
    { label: 'Saved Protocols',  path: '/saved/protocols' },
    { label: 'Saved Products',   path: '/saved/products' },
    { label: 'Orders',           path: '/orders' },
    { label: 'Order History',    path: '/orders/history' },
  ],
  admin: [
    { label: 'Cart',             path: '/cart' },
    { label: 'Orders',           path: '/orders' },
    { label: 'Order Management', path: '/admin/orders' },
  ],
};

// ── User Menu (role-based) ────────────────────────────────────────────────────
export const USER_MENU = {
  guest: [
    { label: 'Login',    path: '/login' },
    { label: 'Register', path: '/login?tab=register' },
  ],
  professional: [
    { label: 'Dashboard',   path: '/dashboard' },
    { label: 'My Protocols', path: '/my-protocols' },
    { label: 'Saved Items',  path: '/saved' },
    { label: 'Orders',       path: '/orders' },
    { label: 'Settings',     path: '/settings' },
    // logout is injected at runtime (not a path)
  ],
  admin: [
    { label: 'Dashboard',  path: '/dashboard' },
    { label: 'Admin Board', path: '/admin' },
    // --- admin tools ---
    { label: 'Protocol Management', path: '/admin/protocols', section: 'admin' },
    { label: 'Product Management',  path: '/admin/products',  section: 'admin' },
    { label: 'User Management',     path: '/admin/users',     section: 'admin' },
    { label: 'System Settings',     path: '/admin/settings',  section: 'admin' },
    // logout injected at runtime
  ],
};

// ── Top-level nav items (center bar) ─────────────────────────────────────────
export const TOP_NAV = [
  { label: 'Home',      path: '/',   dropdown: null },
  { label: 'Academia',  path: null,  dropdown: 'academia' },
  { label: 'Resources', path: null,  dropdown: 'resources' },
];
