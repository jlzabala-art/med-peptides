import { 
  FiHome, FiUsers, FiBox, FiActivity, FiSettings, FiFileText, FiShield, 
  FiTruck, FiDatabase, FiCpu, FiMessageSquare, FiCalendar
} from 'react-icons/fi';

/**
 * Standardized portal navigation configuration.
 * Maps a user's activeRole to their available sidebar tabs.
 */
export const PORTAL_CONFIG = {
  admin: [
    { id: 'overview', label: 'Overview', icon: FiHome, path: '/admin' },
    { id: 'orders', label: 'Global Orders', icon: FiBox, path: '/admin/orders' },
    { id: 'bulk-orders', label: 'Bulk Orders', icon: FiBox, path: '/admin/bulk-orders' },
    { id: 'products', label: 'Products Catalog', icon: FiBox, path: '/admin/products' },
    { id: 'variants', label: 'Variants', icon: FiBox, path: '/admin/variants' },
    { id: 'leads', label: 'CRM & Leads', icon: FiUsers, path: '/admin/leads' },
    { id: 'users', label: 'User Directory', icon: FiUsers, path: '/admin/users' },
    { id: 'coupons', label: 'Coupons', icon: FiActivity, path: '/admin/coupons' },
    { id: 'co-branding', label: 'Co-Branding', icon: FiActivity, path: '/admin/co-branding' },
    { id: 'access-levels', label: 'Access Levels', icon: FiShield, path: '/admin/access-levels' },
    { id: 'protocols', label: 'Medical Protocols', icon: FiActivity, path: '/admin/protocols' },
    { id: 'analytics', label: 'Platform Analytics', icon: FiActivity, path: '/admin/analytics' },
    { id: 'ai-agents', label: 'AI Agents', icon: FiCpu, path: '/admin/ai-agents' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/admin/settings' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/doctor' },
    { id: 'patients', label: 'My Patients', icon: FiUsers, path: '/doctor/patients' },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar, path: '/doctor/appointments' },
    { id: 'lab-results', label: 'Lab Results', icon: FiActivity, path: '/doctor/lab-results' },
    { id: 'research', label: 'Research Library', icon: FiFileText, path: '/doctor/research' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/doctor/settings' },
  ],
  supplier: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/supplier-dashboard' },
    { id: 'catalog', label: 'Mass Catalog / APIs', icon: FiBox, path: '/supplier-dashboard/catalog' },
    { id: 'orders', label: 'Wholesale Orders', icon: FiFileText, path: '/supplier-dashboard/orders' },
    { id: 'clients', label: 'B2B Clients', icon: FiUsers, path: '/supplier-dashboard/clients' },
    { id: 'shipments', label: 'Shipping Tracker', icon: FiTruck, path: '/supplier-dashboard/shipments' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/supplier-dashboard/messages' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/supplier-dashboard/settings' },
  ],
  wholesaler: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/wholesaler' },
    { id: 'catalogs', label: 'Bulk Catalogs', icon: FiBox, path: '/wholesaler/catalogs' },
    { id: 'bulk-orders', label: 'Bulk Orders', icon: FiFileText, path: '/wholesaler/bulk-orders' },
    { id: 'rx-inbox', label: 'Rx Inbox', icon: FiDatabase, path: '/wholesaler/rx-inbox' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/wholesaler/messages' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/wholesaler/settings' },
  ],
  patient: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/patient' },
    { id: 'prescriptions', label: 'Prescriptions', icon: FiFileText, path: '/patient/prescriptions' },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar, path: '/patient/appointments' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/patient/messages' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/patient/settings' },
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
