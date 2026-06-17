import { 
  FiHome, FiUsers, FiBox, FiActivity, FiSettings, FiFileText, FiShield, 
  FiTruck, FiDatabase, FiCpu, FiMessageSquare, FiCalendar, FiDollarSign, 
  FiTrendingUp, FiLayers, FiCreditCard
} from 'react-icons/fi';

/**
 * Standardized portal navigation configuration.
 * Grouped logically into streamlined workflows.
 */
export const PORTAL_CONFIG = {
  admin: [
    { id: 'operations-inbox', label: 'Operations Inbox', icon: FiMessageSquare, path: '/admin/operations-inbox' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/admin/messages' },
    { id: 'calendar', label: 'Calendar', icon: FiCalendar, path: '/admin/calendar' },
    
    // Dashboard & Insights
    { id: 'overview', label: 'Overview', icon: FiHome, path: '/admin', category: 'Dashboard & Analytics' },
    { id: 'analytics', label: 'Platform Analytics', icon: FiActivity, path: '/admin/analytics', category: 'Dashboard & Analytics' },
    
    // Commercial CRM
    { id: 'leads', label: 'CRM & Leads', icon: FiUsers, path: '/admin/leads', category: 'Commercial CRM' },
    { id: 'users', label: 'User Directory', icon: FiUsers, path: '/admin/users', category: 'Commercial CRM' },
    
    // Supply Chain & Sourcing
    { id: 'wholesellers', label: 'Sourcing & SRM', icon: FiLayers, path: '/admin/wholesellers', category: 'Supply Chain' },
    { id: 'purchase-rfqs', label: 'Purchase RFQs', icon: FiFileText, path: '/admin/purchase-rfqs', category: 'Supply Chain' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FiTruck, path: '/admin/purchase-orders', category: 'Supply Chain' },
    { id: 'purchase-bills', label: 'Supplier Bills (AP)', icon: FiCreditCard, path: '/admin/purchase-bills', category: 'Supply Chain' },
    
    // Inventory & Sales
    { id: 'products', label: 'Products Catalog', icon: FiBox, path: '/admin/products', category: 'Inventory & Sales' },
    { id: 'orders', label: 'Patient Orders', icon: FiBox, path: '/admin/orders', category: 'Inventory & Sales' },
    { id: 'quotations', label: 'Quotations', icon: FiFileText, path: '/admin/quotations', category: 'Inventory & Sales' },
    
    // Operations Setup
    { id: 'protocols', label: 'Medical Protocols', icon: FiActivity, path: '/admin/protocols', category: 'Operations Setup' },
    { id: 'ai-agents', label: 'AI Agents', icon: FiCpu, path: '/admin/ai-agents', category: 'Operations Setup' },
    { id: 'settings', label: 'System Settings', icon: FiSettings, path: '/admin/settings', category: 'Operations Setup' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/doctor', category: 'Clinical' },
    { id: 'patients', label: 'My Patients', icon: FiUsers, path: '/doctor/patients', category: 'Clinical' },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar, path: '/doctor/appointments', category: 'Clinical' },
    { id: 'lab-results', label: 'Lab Results', icon: FiActivity, path: '/doctor/lab-results', category: 'Clinical' },
    { id: 'research', label: 'Research Library', icon: FiFileText, path: '/doctor/research', category: 'Clinical' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/doctor/settings', category: 'System & Setup' },
  ],
  supplier: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/supplier-dashboard', category: 'Dashboard' },
    { id: 'catalog', label: 'Mass Catalog / APIs', icon: FiBox, path: '/supplier-dashboard/catalog', category: 'Commerce' },
    { id: 'orders', label: 'Wholesale Orders', icon: FiFileText, path: '/supplier-dashboard/orders', category: 'Commerce' },
    { id: 'shipments', label: 'Shipping Tracker', icon: FiTruck, path: '/supplier-dashboard/shipments', category: 'Commerce' },
    { id: 'clients', label: 'B2B Clients', icon: FiUsers, path: '/supplier-dashboard/clients', category: 'CRM & Users' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/supplier-dashboard/messages', category: 'CRM & Users' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/supplier-dashboard/settings', category: 'System & Setup' },
  ],
  wholesaler: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/wholesaler', category: 'Dashboard' },
    { id: 'catalogs', label: 'Bulk Catalogs', icon: FiBox, path: '/wholesaler/catalogs', category: 'Commerce' },
    { id: 'bulk-orders', label: 'Bulk Orders', icon: FiFileText, path: '/wholesaler/bulk-orders', category: 'Commerce' },
    { id: 'rx-inbox', label: 'Rx Inbox', icon: FiDatabase, path: '/wholesaler/rx-inbox', category: 'Commerce' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/wholesaler/messages', category: 'CRM & Users' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/wholesaler/settings', category: 'System & Setup' },
  ],
  patient: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/patient', category: 'Health' },
    { id: 'prescriptions', label: 'Prescriptions', icon: FiFileText, path: '/patient/prescriptions', category: 'Health' },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar, path: '/patient/appointments', category: 'Health' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/patient/messages', category: 'Health' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/patient/settings', category: 'System & Setup' },
  ]
};

// Fallback for roles like 'clinic', 'pharmacy', 'account_manager' that map closely to others
PORTAL_CONFIG.clinic = PORTAL_CONFIG.wholesaler;
PORTAL_CONFIG.pharmacy = PORTAL_CONFIG.wholesaler;
PORTAL_CONFIG.account_manager = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/account-manager' },
  { id: 'clients', label: 'My Accounts', icon: FiUsers, path: '/account-manager/clients' },
  { id: 'orders', label: 'Client Orders', icon: FiFileText, path: '/account-manager/orders' },
  { id: 'settings', label: 'Settings', icon: FiSettings, path: '/account-manager/settings' },
];

export const getPortalTabs = (role) => {
  return PORTAL_CONFIG[role] || [];
};
