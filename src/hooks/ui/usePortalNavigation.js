import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Globe, History, Settings, MessageSquare, Truck, Users, ClipboardList, Brain, Calendar, Activity, ShieldAlert } from '@/lib/icons';


/**
 * Shared hook to determine the portal navigation layout for the current user and path.
 */
export function usePortalNavigation() {
  const { userProfile } = useAuth();
  const pathname = usePathname();

  return useMemo(() => {
    const role = userProfile?.role || 'patient';
    let navGroups = [];

    // Helper to determine if a path is currently active
    const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

    // ==========================================
    // 1. SUPPLIER / MANUFACTURER
    // ==========================================
    const supplierGroups = [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/supplier', active: pathname === '/supplier' },
          { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/supplier/messages', active: isActive('/supplier/messages') },
        ],
      },
      {
        id: 'operations',
        label: 'B2B Sales Operations',
        items: [
          { id: 'catalog', label: 'Mass Catalog', icon: Package, path: '/supplier/catalog', active: isActive('/supplier/catalog') },
          { id: 'orders', label: 'Wholesale Orders', icon: ShoppingBag, path: '/supplier/orders', active: isActive('/supplier/orders') },
          { id: 'rfqs', label: 'Quotation Requests', icon: ClipboardList, path: '/supplier/rfqs', active: isActive('/supplier/rfqs') },
          { id: 'shipments', label: 'Shipping Tracker', icon: Truck, path: '/supplier/shipments', active: isActive('/supplier/shipments') },
        ],
      },
      {
        id: 'account',
        label: 'Account',
        items: [
          { id: 'settings', label: 'Settings', icon: Settings, path: '/supplier/settings', active: isActive('/supplier/settings') },
        ],
      }
    ];

    // ==========================================
    // 2. WHOLESALER
    // ==========================================
    const wholesalerGroups = [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/wholesaler', active: pathname === '/wholesaler' },
          { id: 'messages', label: 'Support', icon: MessageSquare, path: '/wholesaler/support', active: isActive('/wholesaler/support') },
        ],
      },
      {
        id: 'sourcing',
        label: 'Sourcing & Branding',
        items: [
          { id: 'catalog', label: 'Sourcing Catalog', icon: Package, path: '/wholesaler/catalog', active: isActive('/wholesaler/catalog') },
          { id: 'purchases', label: 'My Purchases', icon: History, path: '/wholesaler/purchases', active: isActive('/wholesaler/purchases') },
          { id: 'branding', label: 'White Label', icon: Globe, path: '/wholesaler/branding', active: isActive('/wholesaler/branding') },
        ],
      }
    ];

    // ==========================================
    // 3. MEDICAL / DOCTOR
    // ==========================================
    const medicalGroups = [
      {
        id: 'clinical',
        label: 'Clinical Practice',
        items: [
          { id: 'patients', label: 'Patients (CRM)', icon: Users, path: '/medical/patients', active: isActive('/medical/patients') },
          { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList, path: '/medical/prescriptions', active: isActive('/medical/prescriptions') },
          { id: 'atlas', label: 'Clinical AI (Atlas)', icon: Brain, path: '/medical/atlas', active: isActive('/medical/atlas') },
          { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/medical/calendar', active: isActive('/medical/calendar') },
        ],
      },
      {
        id: 'clinic',
        label: 'Clinic Management',
        items: [
          { id: 'settings', label: 'My Clinic', icon: Settings, path: '/medical/settings', active: isActive('/medical/settings') },
        ],
      }
    ];

    // ==========================================
    // 4. PATIENT
    // ==========================================
    const patientGroups = [
      {
        id: 'health',
        label: 'My Health',
        items: [
          { id: 'treatments', label: 'Treatments', icon: Activity, path: '/patient/treatments', active: isActive('/patient/treatments') },
          { id: 'records', label: 'Medical Records', icon: ClipboardList, path: '/patient/records', active: isActive('/patient/records') },
        ],
      },
      {
        id: 'pharmacy',
        label: 'Pharmacy',
        items: [
          { id: 'store', label: 'Shop Supplements', icon: ShoppingBag, path: '/patient/store', active: isActive('/patient/store') },
          { id: 'orders', label: 'My Orders', icon: Package, path: '/patient/orders', active: isActive('/patient/orders') },
        ],
      },
      {
        id: 'support',
        label: 'Support',
        items: [
          { id: 'chat', label: 'Message Doctor', icon: MessageSquare, path: '/patient/chat', active: isActive('/patient/chat') },
        ],
      }
    ];

    // ==========================================
    // 5. ADMIN (Master)
    // ==========================================
    const adminExclusiveGroups = [
      {
        id: 'admin_core',
        label: 'System Administration',
        items: [
          { id: 'admin_dash', label: 'Admin Dashboard', icon: ShieldAlert, path: '/admin', active: pathname === '/admin' },
          { id: 'users', label: 'User Management', icon: Users, path: '/admin/users', active: isActive('/admin/users') },
          { id: 'approvals', label: 'Approvals', icon: ClipboardList, path: '/admin/approvals', active: isActive('/admin/approvals') },
        ],
      }
    ];

    // Routing Logic based on Path & Role
    if (pathname.startsWith('/admin') && role === 'admin') {
      navGroups = adminExclusiveGroups;
    } else if (pathname.startsWith('/supplier')) {
      navGroups = supplierGroups;
    } else if (pathname.startsWith('/wholesaler')) {
      navGroups = wholesalerGroups;
    } else if (pathname.startsWith('/medical')) {
      navGroups = medicalGroups;
    } else {
      // Default fallback
      if (role === 'supplier') navGroups = supplierGroups;
      else if (role === 'wholesaler') navGroups = wholesalerGroups;
      else if (role === 'doctor') navGroups = medicalGroups;
      else navGroups = patientGroups;
    }

    return { navGroups };
  }, [userProfile?.role, pathname]);
}
