export const searchIndex = [
  // ── OPERATIONS ──
  {
    id: 'op-users',
    title: 'User Management',
    description: 'Manage patients, doctors, and staff accounts',
    category: 'Operations',
    path: '/admin?s=operations&t=users',
    iconName: 'users',
    roles: ['admin', 'staff']
  },
  {
    id: 'op-products',
    title: 'Product Catalog',
    description: 'Manage peptides, supplements, and inventory',
    category: 'Operations',
    path: '/admin?s=operations&t=products',
    iconName: 'package',
    roles: ['admin', 'staff', 'wholesaler']
  },
  {
    id: 'op-pricing',
    title: 'Pricing Engine',
    description: 'Configure retail, wholesale, and clinic pricing',
    category: 'Operations',
    path: '/admin?s=operations&t=pricing',
    iconName: 'globe',
    roles: ['admin']
  },
  
  // ── INTELLIGENCE ──
  {
    id: 'int-analytics',
    title: 'Financial Analytics',
    description: 'Revenue, profit margins, and sales metrics',
    category: 'Intelligence',
    path: '/admin?s=intelligence&t=analytics',
    iconName: 'bar-chart',
    roles: ['admin']
  },
  {
    id: 'int-clinical',
    title: 'Clinical Logs',
    description: 'Monitor protocol effectiveness and patient outcomes',
    category: 'Intelligence',
    path: '/admin?s=intelligence&t=clinical-logs',
    iconName: 'activity',
    roles: ['admin', 'clinic', 'doctor']
  },
  
  // ── ARCHITECTURE ──
  {
    id: 'arch-ai',
    title: 'Clinical AI Configuration',
    description: 'Train and configure the medical AI agents',
    category: 'Architecture',
    path: '/admin?s=architecture&t=clinical-ai',
    iconName: 'brain',
    roles: ['admin']
  },
  {
    id: 'arch-layout',
    title: 'Home Layout Designer',
    description: 'Customize the storefront layout',
    category: 'Architecture',
    path: '/admin?s=architecture&t=home-layout',
    iconName: 'layout',
    roles: ['admin']
  },
  {
    id: 'arch-settings',
    title: 'System Settings',
    description: 'Global configurations, API keys, and integrations',
    category: 'Architecture',
    path: '/admin?s=architecture&t=settings',
    iconName: 'settings',
    roles: ['admin']
  },
  
  // ── DOCTOR / CLINIC PORTAL ──
  {
    id: 'clinic-patients',
    title: 'My Patients',
    description: 'View and manage your assigned patients',
    category: 'Clinical',
    path: '/admin?s=operations&t=users', // Or specific clinic route
    iconName: 'users',
    roles: ['clinic', 'doctor']
  },
  {
    id: 'clinic-protocols',
    title: 'Protocol Library',
    description: 'Browse available protocols to prescribe',
    category: 'Clinical',
    path: '/protocols',
    iconName: 'flask',
    roles: ['clinic', 'doctor']
  },
  
  // ── PATIENT PORTAL ──
  {
    id: 'portal-dashboard',
    title: 'Patient Dashboard',
    description: 'Overview of active protocols and next steps',
    category: 'Portal',
    path: '/paciente',
    iconName: 'layout-dashboard',
    roles: ['patient', 'guest']
  },
  {
    id: 'portal-protocols',
    title: 'My Protocols',
    description: 'View your prescribed peptide protocols',
    category: 'Portal',
    path: '/my-protocols',
    iconName: 'flask',
    roles: ['patient']
  },
  {
    id: 'portal-orders',
    title: 'My Orders',
    description: 'Track your recent shipments',
    category: 'Portal',
    path: '/orders',
    iconName: 'package',
    roles: ['patient']
  },
  
  // ── DYNAMIC EXAMPLES (Mocks) ──
  {
    id: 'mock-protocol-1',
    title: 'Longevity Protocol (BPC-157)',
    description: 'Standard protocol for tissue repair and anti-aging',
    category: 'Protocols',
    path: '/protocol/longevity',
    iconName: 'file-text',
    roles: ['admin', 'clinic', 'doctor', 'patient', 'guest']
  },
  {
    id: 'mock-patient-1',
    title: 'Doe, John',
    description: 'Patient ID: PT-00129 • Active: Longevity',
    category: 'Patients',
    path: '/admin/patient/PT-00129',
    iconName: 'user',
    roles: ['admin', 'clinic', 'doctor']
  }
];
