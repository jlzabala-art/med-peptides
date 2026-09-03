import { 
  Home, Users, Package, Activity, Settings, FileText, Shield, 
  Truck, Database, Cpu, MessageSquare, Calendar, DollarSign, 
  TrendingUp, Layers, CreditCard
} from '@/lib/icons';

/**
 * Standardized portal navigation configuration.
 * Grouped logically into streamlined workflows.
 */
export const PORTAL_CONFIG = {
  admin: [
    { id: 'operations-inbox', label: 'Operations Inbox', icon: MessageSquare, path: '/admin/operations-inbox' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/admin/calendar' },
    
    // Dashboard & Insights
    { id: 'overview', label: 'Overview', icon: Home, path: '/admin', category: 'Dashboard & Analytics' },
    { id: 'analytics', label: 'Platform Analytics', icon: Activity, path: '/admin/analytics', category: 'Dashboard & Analytics' },
    
    // Commercial CRM
    { id: 'leads', label: 'CRM & Leads', icon: Users, path: '/admin/leads', category: 'Commercial CRM' },
    { id: 'users', label: 'User Directory', icon: Users, path: '/admin/users', category: 'Commercial CRM' },
    
    // Supply Chain & Sourcing
    { id: 'suppliers', label: 'Suppliers', icon: Layers, path: '/admin/suppliers', category: 'Sourcing & Distribution' },
    { id: 'wholesellers', label: 'Wholesellers', icon: Truck, path: '/admin/wholesellers', category: 'Sourcing & Distribution' },
    { id: 'purchase-rfqs', label: 'Purchase RFQs', icon: FileText, path: '/admin/purchase-rfqs', category: 'Sourcing & Distribution' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: Truck, path: '/admin/purchase-orders', category: 'Sourcing & Distribution' },
    { id: 'purchase-bills', label: 'Supplier Bills (AP)', icon: CreditCard, path: '/admin/purchase-bills', category: 'Sourcing & Distribution' },
    
    // Inventory & Sales
    { id: 'products', label: 'Products Catalog', icon: Package, path: '/admin/products', category: 'Inventory & Sales' },
    { id: 'orders', label: 'Patient Orders', icon: Package, path: '/admin/orders', category: 'Inventory & Sales' },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/admin/quotations', category: 'Inventory & Sales' },
    
    // Operations Setup
    { id: 'protocols', label: 'Medical Protocols', icon: Activity, path: '/admin/protocols', category: 'Operations Setup' },
    { id: 'ai-agents', label: 'AI Agents', icon: Cpu, path: '/admin/ai-agents', category: 'Operations Setup' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings', category: 'Operations Setup' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/doctor', category: 'Clinical' },
    { id: 'patients', label: 'My Patients', icon: Users, path: '/doctor/patients', category: 'Clinical' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/doctor/appointments', category: 'Clinical' },
    { id: 'lab-results', label: 'Lab Results', icon: Activity, path: '/doctor/lab-results', category: 'Clinical' },
    { id: 'research', label: 'Research Library', icon: FileText, path: '/doctor/research', category: 'Clinical' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/doctor/settings', category: 'System & Setup' },
  ],
  supplier: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/supplier-dashboard', category: 'Dashboard' },
    { id: 'catalog', label: 'Mass Catalog / APIs', icon: Package, path: '/supplier-dashboard/catalog', category: 'Commerce' },
    { id: 'orders', label: 'Wholesale Orders', icon: FileText, path: '/supplier-dashboard/orders', category: 'Commerce' },
    { id: 'shipments', label: 'Shipping Tracker', icon: Truck, path: '/supplier-dashboard/shipments', category: 'Commerce' },
    { id: 'clients', label: 'B2B Clients', icon: Users, path: '/supplier-dashboard/clients', category: 'CRM & Users' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/supplier-dashboard/messages', category: 'CRM & Users' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/supplier-dashboard/settings', category: 'System & Setup' },
  ],
  wholesaler: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/wholesaler', category: 'Dashboard' },
    { id: 'catalogs', label: 'Bulk Catalogs', icon: Package, path: '/wholesaler/catalogs', category: 'Commerce' },
    { id: 'bulk-orders', label: 'Bulk Orders', icon: FileText, path: '/wholesaler/bulk-orders', category: 'Commerce' },
    { id: 'rx-inbox', label: 'Rx Inbox', icon: Database, path: '/wholesaler/rx-inbox', category: 'Commerce' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/wholesaler/messages', category: 'CRM & Users' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/wholesaler/settings', category: 'System & Setup' },
  ],
  patient: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/patient', category: 'Health' },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions', category: 'Health' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/patient/appointments', category: 'Health' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/patient/messages', category: 'Health' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/patient/settings', category: 'System & Setup' },
  ]
};

// Fallback for roles like 'clinic', 'pharmacy', 'account_manager' that map closely to others
PORTAL_CONFIG.clinic = PORTAL_CONFIG.wholesaler;
PORTAL_CONFIG.pharmacy = PORTAL_CONFIG.wholesaler;
PORTAL_CONFIG.account_manager = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/account-manager' },
  { id: 'clients', label: 'My Accounts', icon: Users, path: '/account-manager/clients' },
  { id: 'orders', label: 'Client Orders', icon: FileText, path: '/account-manager/orders' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/account-manager/settings' },
];

export const getPortalTabs = (role) => {
  return PORTAL_CONFIG[role] || [];
};
