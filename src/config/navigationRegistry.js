import { LayoutDashboard, MessageSquare, Calendar, Bell, Users, Stethoscope, HeartPulse, FileText, Bot, Package, Search, Eye, TrendingUp, Tags, ShieldCheck, Database, ShoppingBag, Building, MapPin, Receipt, CreditCard, Users2, LineChart, Truck, ThermometerSnowflake, Navigation, ClipboardList, Mail, Newspaper, Share2, Ticket, PieChart, BrainCircuit, Sparkles, TerminalSquare, LayoutTemplate, ShieldAlert, Settings, Factory, CheckSquare } from '@/lib/icons';

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
  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [...ALL_INTERNAL, 'patient'],
    items: [
      { id: '',              label: 'Overview',       icon: LayoutDashboard, roles: [...ALL_INTERNAL, 'patient'] },
      { id: 'messages',      label: 'Messages',       icon: MessageSquare,   roles: ['admin', 'doctor', 'medical_director', 'clinic_manager', 'sales', 'supplier', 'patient'] },
      { id: 'calendar',      label: 'Calendar',       icon: Calendar,        roles: ['admin', 'doctor', 'medical_director', 'clinic_manager', 'sales', 'patient'] },
      { id: 'notifications', label: 'Notifications',  icon: Bell,            roles: ALL_INTERNAL },
    ]
  },

  // ── CLINICAL ───────────────────────────────────────────────────────────────
  {
    id: 'clinical',
    label: 'Clinical',
    icon: Stethoscope,
    roles: ['admin', 'medical_director', 'doctor', 'clinic_manager', 'pharmacist'],
    items: [
      { id: 'patients',      label: 'Patients',      icon: Users,         roles: ['admin', 'medical_director', 'doctor', 'clinic_manager'] },
      { id: 'doctors',       label: 'Doctors',       icon: Stethoscope,   roles: ['admin', 'medical_director', 'clinic_manager'] },
      { id: 'protocols',     label: 'Protocols',     icon: ClipboardList, roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
      { id: 'prescriptions', label: 'Prescriptions', icon: FileText,      roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
      { id: 'treatments',    label: 'Treatments',    icon: HeartPulse,    roles: ['admin', 'medical_director', 'doctor', 'patient'] },
      { id: 'appointments',  label: 'Appointments',  icon: Calendar,      roles: ['admin', 'medical_director'] },
    ]
  },

  // ── CATALOG (7 → 2) ────────────────────────────────────────────────────────
  // Pricing Visibility, Competitors, Alternatives → tabs inside Master Catalog
  // Certificates & COAs, Catalog Enrichment → tabs inside Inventory & Supply
  {
    id: 'catalog',
    label: 'Catalog',
    icon: Package,
    roles: ['admin', 'pharmacist', 'medical_director', 'doctor', 'sales', 'operations'],
    items: [
      {
        id: 'catalog',
        label: 'Product Catalog',
        icon: Search,
        roles: ['admin', 'pharmacist', 'medical_director', 'sales', 'operations'],
        // Absorbed: pricing-visibility, alternatives (rendered as tabs within the view)
      },
      {
        id: 'competitors',
        label: 'Competitors Intelligence',
        icon: LineChart,
        roles: ['admin', 'sales', 'ceo'],
      },
      {
        id: 'import-prices',
        label: 'Import Price List',
        icon: FileText,
        roles: ['admin', 'pharmacist', 'operations', 'sales'],
      },
      {
        id: 'inventory',
        label: 'Inventory & Supply',
        icon: Database,
        roles: ['admin', 'pharmacist', 'operations'],
        // Absorbed: certificates, catalog-enrichment (rendered as tabs within the view)
      },
    ]
  },

  // ── SALES (9 → 4) ──────────────────────────────────────────────────────────
  // Leads + Clinics + Agency Deals → CRM & Accounts
  // Sales Orders + Patient Orders + My Orders → Orders Hub
  // Quotations + Discounts → Quotes & Pricing
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingBag,
    roles: ['admin', 'ceo', 'sales', 'operations', 'finance', 'patient'],
    items: [
      {
        id: 'orders',
        label: 'Orders',
        icon: ShoppingBag,
        roles: ['admin', 'sales', 'operations', 'finance', 'patient'],
        // Absorbed: sales-orders (B2B), patient-orders (B2C), my-orders (patient)
        // Filter by type in the view
      },
      {
        id: 'crm',
        label: 'CRM & Accounts',
        icon: Users2,
        roles: ['admin', 'sales'],
        // Absorbed: leads, clinics, agency-deals (unified with segment tabs)
      },
      {
        id: 'account-managers',
        label: 'Account Managers',
        icon: HandshakeIcon,
        roles: ['admin', 'sales'],
      },
      {
        id: 'quotations',
        label: 'Quotes & Pricing',
        icon: FileText,
        roles: ['admin', 'sales', 'finance'],
        // Absorbed: quotations + discounts (tabs within the view)
      },
      {
        id: 'revenue',
        label: 'Revenue',
        icon: LineChart,
        roles: ['admin', 'ceo', 'sales', 'finance'],
      },
    ]
  },

  // ── PURCHASING (5 → 3) ─────────────────────────────────────────────────────
  // RFQs + Purchase Orders → Procurement (differentiated by status/type column)
  // Supplier Bills → moved to Finance > Transactions
  {
    id: 'purchasing',
    label: 'Purchasing',
    icon: ShoppingCartIcon,
    roles: ['admin', 'pharmacist', 'operations', 'supplier', 'finance'],
    items: [
      {
        id: 'suppliers',
        label: 'Suppliers',
        icon: Building,
        roles: ['admin', 'operations', 'pharmacist'],
      },
      {
        id: 'wholesellers',
        label: 'Wholesellers',
        icon: Building,
        roles: ['admin', 'operations', 'finance'],
      },
      {
        id: 'procurement',
        label: 'Procurement',
        icon: FileText,
        roles: ['admin', 'operations', 'pharmacist', 'supplier'],
        // Absorbed: rfqs + purchase-orders (type column differentiates; status drives workflow)
      },
      {
        id: 'production-queue',
        label: 'Production Queue',
        icon: Factory,
        roles: ['admin', 'operations', 'pharmacist'],
      },
    ]
  },

  // ── LOGISTICS ──────────────────────────────────────────────────────────────
  {
    id: 'logistics',
    label: 'Logistics',
    icon: Truck,
    roles: ['admin', 'operations', 'supplier'],
    items: [
      { id: 'shipping',          label: 'Shipping',          icon: Truck,               roles: ['admin', 'operations'] },
      { id: 'shipping-network',  label: 'Shipping Network',  icon: MapPin,              roles: ['admin', 'operations'] },
      { id: 'logistics-tracker', label: 'Logistics Tracker', icon: Navigation,          roles: ['admin', 'operations'] },
      { id: 'cold-chain',        label: 'Cold Chain',        icon: ThermometerSnowflake,roles: ['admin', 'operations'] },
      { id: 'shipment-status',   label: 'Shipment Status',   icon: Truck,               roles: ['admin', 'operations', 'supplier'] },
    ]
  },

  // ── FINANCE (7 → 4) ────────────────────────────────────────────────────────
  // Invoices + Payments + Supplier Bills → Transactions ledger
  // Budgets + Unit Economics + Reports → Analytics
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    roles: ['admin', 'ceo', 'finance', 'patient'],
    items: [
      {
        id: 'transactions',
        label: 'Transactions',
        icon: Receipt,
        roles: ['admin', 'finance', 'patient'],
        // Absorbed: invoices, payments, supplier-bills (tabbed ledger)
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: PieChart,
        roles: ['admin', 'ceo', 'finance'],
        // Absorbed: budgets, unit-economics, reports
      },
      {
        id: 'approvals',
        label: 'Approvals',
        icon: CheckSquare,
        roles: ['admin', 'ceo', 'finance'],
      },
      {
        id: 'zoho-books',
        label: 'Zoho Books',
        icon: Database,
        roles: ['admin', 'finance'],
      },
    ]
  },

  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Mail,
    roles: ['admin', 'sales'],
    items: [
      { id: 'email-campaigns',      label: 'Email Campaigns',      icon: Mail,          roles: ['admin', 'sales'] },
      { id: 'newsletter',           label: 'Newsletter',           icon: Newspaper,     roles: ['admin', 'sales'] },
      { id: 'social-media',         label: 'Social Media',         icon: Share2,        roles: ['admin', 'sales'] },
      { id: 'templates',            label: 'Templates',            icon: LayoutTemplate,roles: ['admin'] },
      { id: 'automation-campaigns', label: 'Automation Campaigns', icon: Bot,           roles: ['admin'] },
      { id: 'coupons',              label: 'Coupons',              icon: Ticket,        roles: ['admin', 'sales'] },
      { id: 'segmentation',         label: 'Segmentation',         icon: PieChart,      roles: ['admin', 'sales'] },
    ]
  },

  // ── AI ──────────────────────────────────────────────────────────────────────
  {
    id: 'ai',
    label: 'AI',
    icon: BrainCircuit,
    roles: ['admin', 'ceo', 'medical_director', 'sales', 'patient'],
    items: [
      { id: 'atlas-ai',       label: 'Atlas AI',       icon: Sparkles,      roles: ['admin', 'medical_director', 'sales'] },
      { id: 'my-assistant',   label: 'AI Assistant',   icon: Bot,           roles: ['admin', 'patient'] },
      { id: 'ai-insights',    label: 'AI Insights',    icon: LineChart,     roles: ['admin', 'ceo'] },
      { id: 'ai-agents',      label: 'AI Agents',      icon: Bot,           roles: ['admin'] },
      { id: 'prompt-library', label: 'Prompt Library', icon: BookOpenIcon,  roles: ['admin', 'medical_director'] },
      { id: 'knowledge-base', label: 'Knowledge Base', icon: Database,      roles: ['admin'] },
      { id: 'ai-logs',        label: 'AI Logs',        icon: TerminalSquare,roles: ['admin'] },
    ]
  },

  // ── ADMINISTRATION ─────────────────────────────────────────────────────────
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    roles: ['admin', 'supplier', 'patient'],
    items: [
      { id: 'documents',    label: 'Documents',    icon: FileText,      roles: ['admin', 'supplier', 'patient'] },
      { id: 'users',        label: 'Users',        icon: Users,         roles: ['admin'] },
      { id: 'invitations',  label: 'Invitations',  icon: Mail,          roles: ['admin'] },
      { id: 'settings',     label: 'Settings',     icon: Settings,      roles: ['admin'] },
      { id: 'views',        label: 'Views',        icon: Eye,           roles: ['admin'] },
      { id: 'audit-logs',   label: 'Audit Logs',   icon: TerminalSquare,roles: ['admin'] },
      { id: 'access-levels',label: 'Access Levels',icon: ShieldAlert,   roles: ['admin'] },
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
  // Catalog
  'pricing-visibility':  'catalog',
  'alternatives':        'catalog',
  'certificates':        'inventory',
  'catalog-enrichment':  'inventory',
  // Sales
  'sales-orders':        'orders',
  'patient-orders':      'orders',
  'my-orders':           'orders',
  'leads':               'crm',
  'clinics':             'crm',
  'agency-deals':        'crm',
  'discounts':           'quotations',
  // Purchasing
  'rfqs':                'procurement',
  'purchase-orders':     'procurement',
  'supplier-bills':      'transactions',
  // Finance
  'invoices':            'transactions',
  'payments':            'transactions',
  'budgets':             'analytics',
  'unit-economics':      'analytics',
  'reports':             'analytics',
};
