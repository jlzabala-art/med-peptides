import { LayoutDashboard, Inbox, MessageSquare, Calendar, Bell, Users, Stethoscope, HeartPulse, FileText, Activity, Dna, FlaskConical, Bot, Package, Search, Eye, TrendingUp, Tags, ShieldCheck, Database, ShoppingBag, Building, MapPin, Receipt, CreditCard, Gift, Users2, LineChart, Anchor, Truck, ThermometerSnowflake, Navigation, ClipboardList, Mail, Newspaper, Share2, Ticket, SplitSquareHorizontal, PieChart, BrainCircuit, Sparkles, TerminalSquare, ActivitySquare, LayoutTemplate, ShieldAlert, Settings, LayoutGrid, UploadCloud, DownloadCloud, CheckCircle, Factory, CheckSquare } from '@/lib/icons';

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
 */
export const NAVIGATION_REGISTRY = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [...ALL_INTERNAL, 'patient'],
    items: [
      { id: '',             label: 'Overview',      icon: LayoutDashboard, roles: [...ALL_INTERNAL, 'patient'] },
      // Messages covers both Inbox and messaging
      { id: 'messages',     label: 'Messages',      icon: MessageSquare,   roles: ['admin', 'doctor', 'medical_director', 'clinic_manager', 'sales', 'supplier', 'patient'] },
      { id: 'calendar',     label: 'Calendar',      icon: Calendar,        roles: ['admin', 'doctor', 'medical_director', 'clinic_manager', 'sales', 'patient'] },
      { id: 'notifications',label: 'Notifications', icon: Bell,            roles: ALL_INTERNAL },
    ]
  },
  {
    id: 'clinical',
    label: 'Clinical',
    icon: Stethoscope,
    roles: ['admin', 'medical_director', 'doctor', 'clinic_manager', 'pharmacist'],
    items: [
      { id: 'patients',       label: 'Patients',           icon: Users,          roles: ['admin', 'medical_director', 'doctor', 'clinic_manager'] },
      { id: 'doctors',        label: 'Doctors',            icon: Stethoscope,    roles: ['admin', 'medical_director', 'clinic_manager'] },
      { id: 'protocols',      label: 'Protocols',          icon: ClipboardList,  roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
      { id: 'prescriptions',  label: 'Prescriptions',      icon: FileText,       roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
      { id: 'treatments',     label: 'Treatments',         icon: HeartPulse,     roles: ['admin', 'medical_director', 'doctor', 'patient'] },
      { id: 'appointments',   label: 'Appointments',       icon: Calendar,       roles: ['admin', 'medical_director'] },
    ]
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: Package,
    roles: ['admin', 'pharmacist', 'medical_director', 'doctor', 'sales', 'operations'],
    items: [
      { id: 'catalog',            label: 'Master Catalog',      icon: Search,               roles: ['admin', 'pharmacist', 'medical_director', 'sales', 'operations'] },
      { id: 'pricing-visibility', label: 'Pricing Visibility',  icon: Eye,                  roles: ['admin', 'sales'] },
      { id: 'competitors',        label: 'Competitor Analysis', icon: TrendingUp,            roles: ['admin', 'sales'] },
      { id: 'catalog-enrichment', label: 'Catalog Enrichment',  icon: Sparkles,             roles: ['admin'] },
      { id: 'certificates',       label: 'Certificates & COAs', icon: ShieldCheck,          roles: ['admin', 'pharmacist', 'operations'] },
      { id: 'alternatives',       label: 'Alternatives',        icon: SplitSquareHorizontal,roles: ['admin', 'medical_director'] },
      { id: 'inventory',          label: 'Inventory',           icon: Database,             roles: ['admin', 'pharmacist', 'operations'] },
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingBag,
    roles: ['admin', 'ceo', 'sales', 'operations', 'finance'],
    items: [
      { id: 'leads',          label: 'Leads',          icon: Users2,        roles: ['admin', 'sales'] },
      { id: 'clinics',        label: 'Clinics',        icon: Building,      roles: ['admin', 'sales'] },
      { id: 'quotations',     label: 'Quotations',     icon: FileText,      roles: ['admin', 'sales'] },
      { id: 'sales-orders',   label: 'Sales Orders',   icon: ShoppingBag,   roles: ['admin', 'sales', 'operations', 'finance'] },
      { id: 'patient-orders', label: 'Patient Orders', icon: ShoppingBag,   roles: ['admin', 'sales', 'operations', 'finance'] },
      { id: 'my-orders',      label: 'My Orders',      icon: ShoppingBag,   roles: ['patient'] },
      { id: 'agency-deals',   label: 'Agency Deals',   icon: HandshakeIcon, roles: ['admin', 'sales'] },
      { id: 'discounts',      label: 'Discounts',      icon: Tags,          roles: ['admin', 'sales', 'finance'] },
      { id: 'revenue',        label: 'Revenue',        icon: LineChart,     roles: ['admin', 'ceo', 'sales', 'finance'] },
    ]
  },
  {
    id: 'purchasing',
    label: 'Purchasing',
    icon: ShoppingCartIcon,
    roles: ['admin', 'pharmacist', 'operations', 'supplier', 'finance'],
    items: [
      { id: 'suppliers',        label: 'Suppliers',        icon: Building,   roles: ['admin', 'operations', 'pharmacist'] },
      { id: 'rfqs',             label: 'RFQs',             icon: FileText,   roles: ['admin', 'operations', 'supplier'] },
      { id: 'purchase-orders',  label: 'Purchase Orders',  icon: ShoppingBag,roles: ['admin', 'operations', 'pharmacist', 'supplier'] },
      { id: 'supplier-bills',   label: 'Supplier Bills',   icon: Receipt,    roles: ['admin', 'finance', 'operations', 'supplier'] },
      { id: 'production-queue', label: 'Production Queue', icon: Factory,    roles: ['admin', 'operations', 'pharmacist'] },
    ]
  },
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
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    roles: ['admin', 'ceo', 'finance'],
    items: [
      { id: 'invoices',       label: 'Invoices',       icon: Receipt,    roles: ['admin', 'finance', 'patient'] },
      { id: 'payments',       label: 'Payments',       icon: CreditCard, roles: ['admin', 'finance'] },
      { id: 'budgets',        label: 'Budgets',        icon: LineChart,  roles: ['admin', 'finance'] },
      { id: 'unit-economics', label: 'Unit Economics', icon: PieChart,   roles: ['admin', 'finance'] },
      { id: 'reports',        label: 'Reports',        icon: FileText,   roles: ['admin', 'ceo', 'finance'] },
      { id: 'approvals',      label: 'Approvals',      icon: CheckSquare,roles: ['admin', 'ceo', 'finance'] },
      { id: 'zoho-books',     label: 'Zoho Books',     icon: Database,   roles: ['admin', 'finance'] },
    ]
  },
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
      { id: 'ai-logs',        label: 'AI Logs',        icon: TerminalSquare,roles: ['admin'] },
    ]
  },
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
