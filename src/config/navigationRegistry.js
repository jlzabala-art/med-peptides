import {
  LayoutDashboard, Inbox, MessageSquare, Calendar, Bell,
  Users, Stethoscope, HeartPulse, FileText, Activity, Dna, FlaskConical, Bot,
  Package, Search, Eye, TrendingUp, Tags, ShieldCheck, Database, ShoppingBag,
  Building, MapPin, Receipt, CreditCard, Gift, Users2, LineChart, Anchor,
  Truck, ThermometerSnowflake, Navigation, ClipboardList,
  Mail, Newspaper, Share2, Ticket, SplitSquareHorizontal, PieChart,
  BrainCircuit, Sparkles, TerminalSquare, ActivitySquare, LayoutTemplate,
  ShieldAlert, Fingerprint, Settings, LayoutGrid, UploadCloud, DownloadCloud,
  CheckCircle, Factory, CheckSquare
} from 'lucide-react';

// Helper to provide missing icons safely
const HandshakeIcon = Users2;
const ShoppingCartIcon = ShoppingBag;
const BookOpenIcon = Database;

// Utility to define full access
const ALL_INTERNAL = ['admin', 'ceo', 'medical_director', 'doctor', 'clinic_manager', 'pharmacist', 'sales', 'operations', 'finance'];

export const NAVIGATION_REGISTRY = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [...ALL_INTERNAL, 'patient'],
    items: [
      { id: '/', label: 'Overview', icon: Activity, roles: ALL_INTERNAL },
      { id: '/command-center', label: 'Command Center', icon: ActivitySquare, roles: ['admin', 'ceo'] },
      { id: '/my-dashboard', label: 'My Dashboard', icon: LayoutDashboard, roles: ['admin', 'patient'] },
      { id: '/inbox', label: 'Inbox', icon: Inbox, roles: ['admin'] },
      { id: '/messages', label: 'Messages', icon: MessageSquare, roles: ['admin', 'doctor', 'clinic_manager', 'sales', 'supplier', 'patient'] },
      { id: '/calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'doctor', 'clinic_manager', 'sales'] },
      { id: '/my-calendar', label: 'My Calendar', icon: Calendar, roles: ['admin', 'patient'] },
      { id: '/notifications', label: 'Notifications', icon: Bell, roles: ALL_INTERNAL },
    ]
  },
  {
    id: 'clinical',
    label: 'Clinical',
    icon: Stethoscope,
    roles: ['admin', 'medical_director', 'doctor', 'clinic_manager'],
    items: [
      { id: '/patients', label: 'Patients', icon: Users, roles: ['admin', 'medical_director', 'doctor', 'clinic_manager'] },
      { id: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin', 'medical_director', 'clinic_manager', 'sales'] },
      { id: '/protocols', label: 'Protocols', icon: ClipboardList, roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
      { id: '/prescriptions', label: 'Prescriptions', icon: FileText, roles: ['admin', 'medical_director', 'doctor', 'pharmacist'] },
      { id: '/treatments', label: 'Treatments', icon: HeartPulse, roles: ['admin', 'medical_director', 'doctor'] },
      { id: '/my-treatments', label: 'My Treatments', icon: HeartPulse, roles: ['admin', 'patient'] },
      { id: '/appointments', label: 'Appointments', icon: Calendar, roles: ['admin'] },
      { id: '/timeline', label: 'Clinical Timeline', icon: Activity, roles: ['admin', 'medical_director', 'doctor'] },
      { id: '/follow-up', label: 'Follow-up', icon: ActivitySquare, roles: ['admin', 'sales'] },
      { id: '/lab-reports', label: 'Lab Reports', icon: FlaskConical, roles: ['admin', 'medical_director', 'doctor'] },
      { id: '/genomics', label: 'Genomics', icon: Dna, roles: ['admin', 'medical_director', 'doctor'] },
      { id: '/blood-reports', label: 'Blood Reports', icon: Activity, roles: ['admin', 'medical_director', 'doctor'] },
      { id: '/clinical-ai', label: 'AI Recommendations', icon: Bot, roles: ['admin', 'medical_director'] },
      { id: '/quality-review', label: 'Quality Review', icon: CheckCircle, roles: ['admin', 'medical_director'] },
    ]
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: Package,
    roles: ['admin', 'pharmacist'],
    items: [
      { id: '/items', label: 'Items', icon: Package, roles: ['admin', 'pharmacist'] },
      { id: '/catalog', label: 'Product Catalog', icon: Search, roles: ['admin'] },
      { id: '/pricing-visibility', label: 'Pricing Visibility', icon: Eye, roles: ['admin'] },
      { id: '/competitors', label: 'Competitor Analysis', icon: TrendingUp, roles: ['admin'] },
      { id: '/catalog-builder', label: 'Catalog Builder', icon: LayoutTemplate, roles: ['admin'] },
      { id: '/catalog-enrichment', label: 'Catalog Enrichment', icon: Sparkles, roles: ['admin'] },
      { id: '/certificates', label: 'Certificates', icon: ShieldCheck, roles: ['admin', 'pharmacist', 'supplier'] },
      { id: '/coas', label: 'COAs', icon: FileText, roles: ['admin', 'pharmacist'] },
      { id: '/alternatives', label: 'Alternative Products', icon: SplitSquareHorizontal, roles: ['admin'] },
      { id: '/inventory', label: 'Inventory Availability', icon: Database, roles: ['admin', 'pharmacist', 'operations'] },
    ]
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingBag,
    roles: ['admin', 'ceo', 'clinic_manager', 'sales', 'operations'],
    items: [
      { id: '/leads', label: 'Leads', icon: Users2, roles: ['admin', 'sales'] },
      { id: '/clinics', label: 'Clinics', icon: Building, roles: ['admin', 'clinic_manager', 'sales'] },
      { id: '/quotations', label: 'Quotations', icon: FileText, roles: ['admin', 'doctor', 'clinic_manager', 'sales'] },
      { id: '/patient-orders', label: 'Patient Orders', icon: ShoppingBag, roles: ['admin', 'clinic_manager', 'pharmacist', 'sales', 'operations'] },
      { id: '/my-orders', label: 'My Orders', icon: ShoppingBag, roles: ['admin', 'patient'] },
      { id: '/sales-orders', label: 'Sales Orders', icon: ShoppingBag, roles: ['admin', 'sales', 'operations'] },
      { id: '/invoices', label: 'Invoices', icon: Receipt, roles: ['admin', 'clinic_manager', 'finance'] },
      { id: '/my-invoices', label: 'My Invoices', icon: Receipt, roles: ['admin', 'patient'] },
      { id: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'clinic_manager'] },
      { id: '/my-payments', label: 'My Payments', icon: CreditCard, roles: ['admin', 'patient'] },
      { id: '/agency-deals', label: 'Agency Deals', icon: HandshakeIcon, roles: ['admin'] },
      { id: '/discounts', label: 'Discounts', icon: Tags, roles: ['admin'] },
      { id: '/shared-catalogs', label: 'Shared Catalogs', icon: Share2, roles: ['admin', 'sales'] },
      { id: '/referrals', label: 'Referral Tracking', icon: Anchor, roles: ['admin'] },
      { id: '/revenue', label: 'Revenue', icon: LineChart, roles: ['admin', 'ceo'] },
    ]
  },
  {
    id: 'purchasing',
    label: 'Purchasing',
    icon: ShoppingCartIcon,
    roles: ['admin', 'pharmacist', 'operations', 'supplier'],
    items: [
      { id: '/suppliers', label: 'Suppliers', icon: Building, roles: ['admin', 'pharmacist'] },
      { id: '/rfqs', label: 'RFQs', icon: FileText, roles: ['admin', 'supplier'] },
      { id: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingBag, roles: ['admin', 'pharmacist', 'operations', 'supplier'] },
      { id: '/supplier-bills', label: 'Supplier Bills', icon: Receipt, roles: ['admin', 'finance', 'supplier'] },
      { id: '/payments-made', label: 'Payments Made', icon: CreditCard, roles: ['admin', 'finance'] },
      { id: '/warehouses', label: 'Warehouses', icon: Building, roles: ['admin', 'pharmacist', 'operations'] },
      { id: '/procurement-analytics', label: 'Procurement Analytics', icon: LineChart, roles: ['admin'] },
      { id: '/production-queue', label: 'Production Queue', icon: Factory, roles: ['admin', 'pharmacist'] },
    ]
  },
  {
    id: 'logistics',
    label: 'Logistics',
    icon: Truck,
    roles: ['admin', 'operations', 'pharmacist', 'supplier'],
    items: [
      { id: '/shipping', label: 'Shipping', icon: Truck, roles: ['admin'] },
      { id: '/shipping-network', label: 'Shipping Network', icon: MapPin, roles: ['admin', 'operations'] },
      { id: '/logistics-tracker', label: 'Logistics Tracker', icon: Navigation, roles: ['admin', 'operations'] },
      { id: '/cold-chain', label: 'Cold Chain', icon: ThermometerSnowflake, roles: ['admin', 'operations'] },
      { id: '/import-docs', label: 'Import Documentation', icon: FileText, roles: ['admin', 'operations'] },
      { id: '/tracking', label: 'Tracking', icon: Navigation, roles: ['admin', 'operations'] },
      { id: '/shipment-status', label: 'Shipment Status', icon: Truck, roles: ['admin', 'supplier'] },
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    roles: ['admin', 'ceo', 'finance'],
    items: [
      { id: '/payments-received', label: 'Payments Received', icon: CreditCard, roles: ['admin', 'finance'] },
      { id: '/budgets', label: 'Budgets', icon: LineChart, roles: ['admin', 'finance'] },
      { id: '/unit-economics', label: 'Unit Economics', icon: PieChart, roles: ['admin', 'finance'] },
      { id: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'ceo', 'clinic_manager', 'finance'] },
      { id: '/my-reports', label: 'My Reports', icon: FileText, roles: ['admin', 'patient'] },
      { id: '/finance-kpis', label: 'Finance KPIs', icon: Activity, roles: ['admin', 'ceo'] },
      { id: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['admin', 'ceo', 'medical_director', 'finance'] },
      { id: '/zoho-books', label: 'Zoho Books', icon: Database, roles: ['admin', 'finance'] },
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Mail,
    roles: ['admin'],
    items: [
      { id: '/email-campaigns', label: 'Email Campaigns', icon: Mail, roles: ['admin'] },
      { id: '/newsletter', label: 'Newsletter', icon: Newspaper, roles: ['admin'] },
      { id: '/social-media', label: 'Social Media', icon: Share2, roles: ['admin'] },
      { id: '/templates', label: 'Templates', icon: LayoutTemplate, roles: ['admin'] },
      { id: '/automation-campaigns', label: 'Automation Campaigns', icon: Bot, roles: ['admin'] },
      { id: '/coupons', label: 'Coupons', icon: Ticket, roles: ['admin'] },
      { id: '/co-branding', label: 'Co-Branding', icon: Users2, roles: ['admin'] },
      { id: '/segmentation', label: 'Customer Segmentation', icon: PieChart, roles: ['admin'] },
    ]
  },
  {
    id: 'ai',
    label: 'AI',
    icon: BrainCircuit,
    roles: ['admin', 'ceo', 'doctor', 'sales', 'patient'],
    items: [
      { id: '/atlas-ai', label: 'Atlas AI', icon: Sparkles, roles: ['admin', 'doctor', 'sales'] },
      { id: '/my-assistant', label: 'Atlas AI Assistant', icon: Bot, roles: ['admin', 'patient'] },
      { id: '/ai-insights', label: 'AI Insights', icon: LineChart, roles: ['admin', 'ceo'] },
      { id: '/ai-agents', label: 'AI Agents', icon: Bot, roles: ['admin'] },
      { id: '/prescription-agent', label: 'Prescription Agent', icon: FileText, roles: ['admin'] },
      { id: '/ai-analytics', label: 'AI Analytics', icon: LineChart, roles: ['admin'] },
      { id: '/ai-semantics', label: 'AI Semantics', icon: Database, roles: ['admin'] },
      { id: '/automation-workflows', label: 'Automation Workflows', icon: ActivitySquare, roles: ['admin'] },
      { id: '/prompt-library', label: 'Prompt Library', icon: BookOpenIcon, roles: ['admin'] },
      { id: '/ai-logs', label: 'AI Logs', icon: TerminalSquare, roles: ['admin'] },
      { id: '/ai-monitoring', label: 'AI Monitoring', icon: Activity, roles: ['admin'] },
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    roles: ['admin', 'supplier', 'patient'],
    items: [
      { id: '/documents', label: 'Documents', icon: FileText, roles: ['admin', 'supplier', 'patient'] },
      { id: '/users', label: 'Users', icon: Users, roles: ['admin'] },
      { id: '/roles', label: 'Roles', icon: ShieldCheck, roles: ['admin'] },
      { id: '/permissions', label: 'Permissions', icon: Fingerprint, roles: ['admin'] },
      { id: '/territories', label: 'Territories', icon: MapPin, roles: ['admin'] },
      { id: '/access-levels', label: 'Access Levels', icon: ShieldAlert, roles: ['admin'] },
      { id: '/invitations', label: 'Invitations', icon: Mail, roles: ['admin'] },
      { id: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
      { id: '/views', label: 'Views', icon: Eye, roles: ['admin'] },
      { id: '/layouts', label: 'Layouts', icon: LayoutGrid, roles: ['admin'] },
      { id: '/audit-logs', label: 'Audit Logs', icon: TerminalSquare, roles: ['admin'] },
      { id: '/deploy', label: 'Deploy', icon: UploadCloud, roles: ['admin'] },
      { id: '/hosting', label: 'Hosting', icon: Database, roles: ['admin'] },
      { id: '/imports', label: 'Imports', icon: DownloadCloud, roles: ['admin'] },
      { id: '/exports', label: 'Exports', icon: UploadCloud, roles: ['admin'] },
    ]
  }
];

export const getNavigationForRole = (role) => {
  if (!role || role === 'admin') return NAVIGATION_REGISTRY;
  
  return NAVIGATION_REGISTRY.map(group => {
    // Check if the group is allowed for this role
    if (!group.roles.includes(role)) {
      return null;
    }

    // Filter items within the group
    const filteredItems = group.items.filter(item => item.roles.includes(role));

    if (filteredItems.length === 0) {
      return null;
    }

    return {
      ...group,
      items: filteredItems
    };
  }).filter(Boolean);
};
