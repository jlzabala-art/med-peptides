import { LayoutDashboard, Activity, MessageSquare, Calendar, Bell, Users, Stethoscope, HeartPulse, FileText, Bot, Package, Search, Eye, TrendingUp, Tags, ShieldCheck, Database, ShoppingBag, Building, MapPin, Receipt, CreditCard, Users2, LineChart, Truck, ThermometerSnowflake, Navigation, ClipboardList, Mail, Newspaper, Share2, Ticket, PieChart, BrainCircuit, Sparkles, TerminalSquare, LayoutTemplate, ShieldAlert, Settings, Factory, CheckSquare, FileSpreadsheet } from '@/lib/icons';

// Helper icons
const HandshakeIcon = Users2;
const ShoppingCartIcon = ShoppingBag;
const BookOpenIcon = Database;

// All internal roles
const ALL_INTERNAL = ['admin', 'ceo', 'medical_director', 'doctor', 'clinic_manager', 'pharmacist', 'sales', 'operations', 'finance'];

/**
 * NAVIGATION_REGISTRY
 * IDs are SHORT slugs without leading slash (e.g. 'patients', 'messages').
 * AdminDashboard.jsx builds the final URL as /admin/<id>.
 * AppSidebar also uses these IDs and receives an onNavigate that handles the prefix.
 *
 * ── CONSOLIDATION (July 2026) ──────────────────────────────────────────────────
 * Catalog:   7 items → 2  (Master Catalog + Inventory & Supply)
 * Sales:     9 items → 4  (Orders, CRM & Accounts, Quotes & Pricing, Revenue)
 * Purchasing:5 items → 3  (Suppliers, Procurement, Production)
 * Finance:   7 items → 4  (Transactions, Analytics, Approvals, Zoho Books)
 * ──────────────────────────────────────────────────────────────────────────────
 */
export const NAVIGATION_REGISTRY = [
  // ── 1. CLINICAL ────────────────────────────────────────────────────────────
  {
    id: 'clinical',
    label: 'Clinical',
    icon: Stethoscope,
    roles: ['admin', 'medical_director', 'doctor', 'clinic_manager', 'pharmacist', 'account_manager'],
    items: [
      { id: 'prescriptions', label: 'Prescriptions', icon: FileText,      roles: ['admin', 'medical_director', 'doctor', 'pharmacist', 'account_manager'] },
      { id: 'patients',      label: 'Patients',      icon: Users,         roles: ['admin', 'medical_director', 'doctor', 'clinic_manager'] },
      { id: 'doctors',       label: 'Doctors',       icon: Stethoscope,   roles: ['admin', 'medical_director', 'clinic_manager'] },
      { id: 'protocols',     label: 'Protocols',     icon: ClipboardList, roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
    ]
  },

  // ── 2. CATALOG & PRICING ───────────────────────────────────────────────────
  {
    id: 'catalog',
    label: 'Catalog & Pricing',
    icon: Package,
    roles: ['admin', 'pharmacist', 'medical_director', 'doctor', 'sales', 'operations'],
    items: [
      { id: 'catalog',         label: 'Product Catalog', icon: Search,          roles: ['admin', 'pharmacist', 'medical_director', 'sales', 'operations'] },
      { id: 'price-schedules', label: 'Price Schedules', icon: FileSpreadsheet, roles: ['admin', 'pharmacist', 'medical_director', 'doctor', 'sales', 'operations'] },
      { id: 'inventory',       label: 'Inventory',       icon: Database,        roles: ['admin', 'pharmacist', 'operations'] },
    ]
  },

  // ── 3. OPERATIONS & LOGISTICS ──────────────────────────────────────────────
  {
    id: 'logistics',
    label: 'Operations & Logistics',
    icon: Truck,
    roles: ['admin', 'operations', 'supplier', 'pharmacist', 'sales'],
    items: [
      { id: 'shipping',    label: 'Shipping & Tracking',  icon: Truck,    roles: ['admin', 'operations', 'supplier', 'pharmacist', 'sales'] },
      { id: 'labels',      label: 'Label Studio',         icon: Tags,     roles: ['admin', 'operations', 'supplier', 'pharmacist', 'sales'] },
      { id: 'procurement', label: 'Suppliers & Orders',   icon: Building, roles: ['admin', 'operations', 'pharmacist', 'supplier'] },
    ]
  },

  // ── 4. SALES & CRM ─────────────────────────────────────────────────────────
  {
    id: 'sales',
    label: 'Sales & CRM',
    icon: ShoppingBag,
    roles: ['admin', 'ceo', 'sales', 'operations', 'finance', 'patient'],
    items: [
      { id: 'customers',  label: 'Customers (CRM)', icon: Users2,      roles: ['admin', 'sales'] },
      { id: 'orders',     label: 'Orders',          icon: ShoppingBag, roles: ['admin', 'sales', 'operations', 'finance', 'patient'] },
      { id: 'quotations', label: 'Quotations',       icon: FileText,    roles: ['admin', 'sales', 'finance'] },
    ]
  },

  // ── 5. FINANCE ─────────────────────────────────────────────────────────────
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    roles: ['admin', 'ceo', 'finance', 'patient'],
    items: [
      { id: 'transactions', label: 'Invoices & Ledger', icon: Receipt,   roles: ['admin', 'finance', 'patient'] },
      { id: 'analytics',    label: 'Finance & Metrics', icon: LineChart, roles: ['admin', 'ceo', 'finance'] },
    ]
  },

  // ── 6. SYSTEM & AI ─────────────────────────────────────────────────────────
  {
    id: 'administration',
    label: 'System & AI',
    icon: Settings,
    roles: ['admin', 'supplier', 'patient'],
    items: [
      { id: 'atlas-ai', label: 'Atlas AI',       icon: Sparkles,    roles: ['admin', 'medical_director', 'sales'] },
      { id: 'users',    label: 'Users & Access', icon: ShieldCheck, roles: ['admin'] },
      { id: 'settings', label: 'Settings',       icon: Settings,    roles: ['admin'] },
    ]
  }
];

export const getNavigationForRole = (role) => {
  if (!role || role === 'admin') return NAVIGATION_REGISTRY;

  return NAVIGATION_REGISTRY.map(group => {
    if (!group.roles.includes(role)) return null;
    const filteredItems = group.items.filter(item => item.roles.includes(role));
    if (filteredItems.length === 0) return null;
    return { ...group, items: filteredItems };
  }).filter(Boolean);
};

/**
 * Legacy route aliases — maps old slugs to new unified views.
 * Used by AdminDashboard to redirect stale bookmarks without 404s.
 */
export const ROUTE_ALIASES = {
  // Navigation Group Roots
  'sales':               'orders',
  'purchasing':          'procurement',
  'logistics':           'shipping',
  'operations':          'shipping',
  'finance':             'transactions',
  'marketing':           'analytics',
  'ai':                  'atlas-ai',
  'administration':      'settings',
  'system':              'settings',

  // Clinical
  'treatments':          'protocols',
  'my-treatments':       'protocols',
  'appointments':        'patients',
  'timeline':            'patients',
  'follow-up':           'patients',
  'prescription-intake': 'prescriptions',
  'physicians':          'doctors',
  'quality-review':      'prescriptions',

  // Catalog & Pricing
  'pricing':             'price-schedules',
  'b2b-prices':          'price-schedules',
  'pricing-schedules':   'price-schedules',
  'pricing-visibility':  'catalog',
  'alternatives':        'catalog',
  'competitors':         'price-schedules',
  'import-prices':       'price-schedules',
  'certificates':        'inventory',
  'catalog-enrichment':  'inventory',

  // Logistics & Operations
  'shipping-network':    'shipping',
  'logistics-tracker':   'shipping',
  'cold-chain':          'shipping',
  'shipment-status':     'shipping',
  'compounding-labels':  'labels',
  'shipping-labels':     'labels',
  'etiquetas':           'labels',
  'suppliers':           'procurement',
  'production-queue':    'procurement',
  'rfqs':                'procurement',
  'purchase-orders':     'procurement',
  'wholesellers':        'customers',

  // Sales & CRM
  'sales-orders':        'orders',
  'patient-orders':      'orders',
  'my-orders':           'orders',
  'shopify':             'orders',
  'leads':               'customers',
  'clinics':             'customers',
  'crm':                 'customers',
  'account-managers':    'customers',
  'agency-deals':        'customers',
  'discounts':           'quotations',
  'coupons':             'quotations',
  'revenue':             'analytics',

  // Finance
  'invoices':            'transactions',
  'my-invoices':         'transactions',
  'payments':            'transactions',
  'payments-received':   'transactions',
  'supplier-bills':      'transactions',
  'zoho-books':          'transactions',
  'approvals':           'transactions',
  'budgets':             'analytics',
  'unit-economics':      'analytics',
  'reports':             'analytics',

  // Marketing
  'marketing-intelligence': 'analytics',
  'email-campaigns':        'customers',
  'newsletter':             'customers',
  'social-media':           'customers',
  'templates':              'settings',
  'automation-campaigns':   'atlas-ai',
  'segmentation':           'customers',

  // AI
  'my-assistant':        'atlas-ai',
  'ai-insights':         'atlas-ai',
  'ai-agents':           'atlas-ai',
  'prompt-library':      'atlas-ai',
  'knowledge-base':      'atlas-ai',
  'ai-logs':             'atlas-ai',

  // Administration & IAM
  'access-levels':       'users',
  'invitations':         'users',
  'documents':           'settings',
  'views':               'settings',
  'audit-logs':          'settings',
  'my-profile':          'settings',
  'profile':             'settings',
};
