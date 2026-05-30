/* eslint-disable no-unused-vars, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, ArrowLeft, Settings, Search, Globe, Users, Database, Layers, PackageSearch, MailPlus, LayoutDashboard, ShoppingCart, Activity, FlaskConical, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppPortalLayout from '../layout/AppPortalLayout';

const AdminUsersTab = React.lazy(() => import('../components/admin/AdminUsersTab'));
const AdminProductsTab = React.lazy(() => import('../components/admin/AdminProductsTab'));
const AdminSettingsTab = React.lazy(() => import('../components/admin/AdminSettingsTab'));
const AdminInvitationsTab = React.lazy(() => import('../components/admin/AdminInvitationsTab'));
const AdminCostsTab = React.lazy(() => import('../components/admin/AdminCostsTab'));
const AdminRelationshipsTab = React.lazy(() => import('../components/admin/AdminRelationshipsTab'));
const AdminSemanticTab = React.lazy(() => import('../components/admin/AdminSemanticTab'));
const AdminPricesTab = React.lazy(() => import('../components/admin/AdminPricesTab'));
const AdminVariantsTab = React.lazy(() => import('../components/admin/AdminVariantsTab'));
const AdminProtocolsTab = React.lazy(() => import('../components/admin/AdminProtocolsTab'));
const AdminBlueprintsTab = React.lazy(() => import('../components/admin/AdminBlueprintsTab'));

// New B2B Modules
const DoctorPatientsTab = React.lazy(() => import('../components/doctor/DoctorPatientsTab'));
const DoctorProtocolsTab = React.lazy(() => import('../components/doctor/DoctorProtocolsTab'));
const OrdersTab = React.lazy(() => import('../components/admin/OrdersTab'));

// Premium loading fallback for workplace modules
function WorkplaceLoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      background: 'white',
      borderRadius: '24px',
      border: '1px solid var(--border)',
      padding: '3rem',
      gap: '1.25rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="workplace-pulse-loader" style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)',
        animation: 'workplace-pulse 1.6s ease-in-out infinite',
      }} />
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Inicializando Módulo de Trabajo...
      </span>
      <style>{`
        @keyframes workplace-pulse {
          0% { transform: scale(0.92); opacity: 0.7; box-shadow: 0 0 0 0 rgba(0, 54, 102, 0.3); }
          50% { transform: scale(1.06); opacity: 1; box-shadow: 0 0 0 12px rgba(0, 54, 102, 0); }
          100% { transform: scale(0.92); opacity: 0.7; box-shadow: 0 0 0 0 rgba(0, 54, 102, 0); }
        }
      `}</style>
    </div>
  );
}

export default function RoleDashboard({ onBack }) {
  const { isProfessional, loading: authLoading, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [viewConfig, setViewConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const roleKey = userProfile?.role?.toLowerCase() || 'guest';

  // Map of ALL possible tabs and their components/icons
  const TAB_REGISTRY = {
    users: { component: AdminUsersTab, label: 'Users', icon: Users },
    products: { component: AdminProductsTab, label: 'Products', icon: PackageSearch },
    costs: { component: AdminCostsTab, label: 'Costs', icon: Database },
    prices: { component: AdminPricesTab, label: 'Prices', icon: Globe },
    relationships: { component: AdminRelationshipsTab, label: 'Relations', icon: Layers },
    semantic: { component: AdminSemanticTab, label: 'Semantic', icon: Search },
    settings: { component: AdminSettingsTab, label: 'Settings', icon: Settings },
    invitations: { component: AdminInvitationsTab, label: 'Invites', icon: MailPlus },
    orders: { component: OrdersTab, label: 'Orders', icon: ShoppingCart },
    patients: { component: DoctorPatientsTab, label: 'Patients', icon: Activity },
    doctor_protocols: { component: DoctorProtocolsTab, label: 'My Protocols', icon: FlaskConical },
    blueprints: { component: AdminBlueprintsTab, label: 'Blueprints', icon: LayoutDashboard },
    variants: { component: AdminVariantsTab, label: 'Variants', icon: Layers },
  };

  async function fetchViewConfig(currentRoleKey) {
    try {
      setConfigLoading(true);
      
      let searchKey = currentRoleKey;
      if (searchKey.endsWith('_pending')) {
         searchKey = searchKey.replace('_pending', ''); 
      }

      const docRef = doc(db, 'viewConfigs', searchKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const configData = docSnap.data();
        setViewConfig(configData);
        // Set first available tab as active
        const availableTabs = Object.keys(configData.tabs || {});
        if (availableTabs.length > 0) {
          setActiveTab(availableTabs[0]);
        }
      } else {
        console.warn(`No viewConfig found for roleKey: ${searchKey}`);
        setViewConfig({ tabs: {} });
      }
    } catch (err) {
      console.error("Error fetching viewConfig:", err);
      setViewConfig({ tabs: {} });
    } finally {
      setConfigLoading(false);
    }
  }

  useEffect(() => {
    if (user && roleKey !== 'guest') {
      fetchViewConfig(roleKey);
    }
  }, [user, roleKey]);

  if (authLoading || configLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <ShieldCheck size={48} className="animate-pulse" color="var(--primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading Workplace...</p>
      </div>
    );
  }

  if (!isProfessional && roleKey === 'guest') {
    return (
      <div style={{ textAlign: 'center', padding: '15vh 2rem', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <ShieldCheck size={64} color="var(--error)" style={{ marginBottom: '1rem' }} />
        <h1>Access Denied</h1>
        <p>You do not have access to a professional workplace view.</p>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '2rem' }}>Return to Home</button>
      </div>
    );
  }

  const enabledTabsKeys = viewConfig?.tabs ? Object.keys(viewConfig.tabs) : [];

  const sidebarNavGroups = [
    {
      id: 'workplace-modules',
      label: 'Workplace Modules',
      items: enabledTabsKeys.map(tabKey => {
        const tabReg = TAB_REGISTRY[tabKey];
        if (!tabReg) return null;
        return {
          id: tabKey,
          label: tabReg.label,
          icon: tabReg.icon
        }
      }).filter(Boolean)
    }
  ];

  return (
    <AppPortalLayout allowedRoles={['admin', 'manager', 'wholesaler', 'supplier', 'clinic', 'compounding_pharmacy', 'patient', 'doctor']}>
      <div style={{ padding: '2rem' }}>
        <React.Suspense fallback={<WorkplaceLoadingFallback />}>
          {enabledTabsKeys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <ShieldCheck size={48} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3>No Modules Assigned</h3>
                <p style={{ color: 'var(--text-muted)' }}>Your profile currently has no active modules assigned. Please contact the administrator.</p>
            </div>
          ) : (
            (() => {
              const tabConfig = viewConfig.tabs[activeTab];
              const tabReg = TAB_REGISTRY[activeTab];
              if (!tabReg || !tabConfig) return null;
              
              const Component = tabReg.component;
              return (
                <Component 
                  {...tabConfig} 
                  userId={user.uid} 
                  doctorId={user.uid}
                />
              );
            })()
          )}
        </React.Suspense>
      </div>
    </AppPortalLayout>
  );
}
