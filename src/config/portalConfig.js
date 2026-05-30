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
    { id: 'protocols', label: 'Medical Protocols', icon: FiActivity, path: '/admin/protocols' },
    { id: 'users', label: 'User Directory', icon: FiUsers, path: '/admin/users' },
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
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/supplier' },
    { id: 'inventory', label: 'Inventory', icon: FiBox, path: '/supplier/inventory' },
    { id: 'shipping', label: 'Shipping', icon: FiTruck, path: '/supplier/shipping' },
    { id: 'quality', label: 'QC & CoA', icon: FiShield, path: '/supplier/quality' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/supplier/settings' },
  ],
  wholesaler: [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/wholesaler' },
    { id: 'catalog', label: 'Bulk Catalog', icon: FiBox, path: '/wholesaler/catalog' },
    { id: 'orders', label: 'My Orders', icon: FiFileText, path: '/wholesaler/orders' },
    { id: 'invoices', label: 'Invoices', icon: FiDatabase, path: '/wholesaler/invoices' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/wholesaler/settings' },
  ],
  patient: [
    { id: 'dashboard', label: 'My Health', icon: FiHome, path: '/paciente' },
    { id: 'prescriptions', label: 'Prescriptions', icon: FiFileText, path: '/paciente/prescriptions' },
    { id: 'appointments', label: 'Appointments', icon: FiCalendar, path: '/paciente/appointments' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/paciente/messages' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/settings' },
  ]
};

// Fallback for roles like 'clinic', 'pharmacy', 'account_manager' that map closely to others
PORTAL_CONFIG.clinic = PORTAL_CONFIG.wholesaler;
PORTAL_CONFIG.pharmacy = PORTAL_CONFIG.wholesaler;
PORTAL_CONFIG.account_manager = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/account-manager' },
  { id: 'clients', label: 'My Accounts', icon: FiUsers, path: '/account-manager/clients' },
  { id: 'quotes', label: 'Quotes', icon: FiFileText, path: '/account-manager/quotes' },
  { id: 'settings', label: 'Settings', icon: FiSettings, path: '/settings' },
];

export const getPortalTabs = (role) => {
  return PORTAL_CONFIG[role] || [];
};
