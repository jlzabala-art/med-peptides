/* eslint-disable no-unused-vars, react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, ArrowLeft, Settings, Search, Globe, Users, Database, Layers, PackageSearch, MailPlus, LayoutDashboard, ShoppingCart, Activity, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchViewConfig(currentRoleKey) {
    try {
      setConfigLoading(true);
      
      // Handle the _pending suffix cleanup if needed, though viewConfigs might map perfectly
      let searchKey = currentRoleKey;
      if (searchKey.endsWith('_pending')) {
         // Optionally you can redirect pending users, but assuming they are allowed in readOnly mode:
         searchKey = searchKey.replace('_pending', ''); 
      }
      // Or map specific frontend roles to the viewConfigs keys manually if they differ:
      // if (searchKey === 'clinic') searchKey = 'clinic_view'; etc. (Ensure panel IDs match)

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

  // If user is not professional and not pending, they shouldn't be here
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

  if (isMobile) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', minHeight: '100vh', textAlign: 'center' }}>
        <ShieldCheck size={48} color="var(--primary)" style={{ margin: '2rem auto 1rem' }} />
        <h2>Desktop Recommended</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Please use a laptop or desktop computer for the best experience in the professional portal.
        </p>
        <button className="btn btn-primary" onClick={onBack}>Return</button>
      </div>
    );
  }

  const enabledTabsKeys = viewConfig?.tabs ? Object.keys(viewConfig.tabs) : [];

  return (
    <div className="template-root" style={{ 
      paddingTop: 'clamp(5rem, 10vw, 8rem)', 
      minHeight: '100vh', 
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '4rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, 
              padding: '0.5rem 1rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          >
            <ArrowLeft size={16} /> EXIT WORKPLACE
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
                <ShieldCheck size={36} /> {viewConfig?.name || 'Professional Workplace'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
                Role: <span style={{ textTransform: 'capitalize' }}>{roleKey.replace('_', ' ')}</span>
              </p>
            </div>
            
            {enabledTabsKeys.length > 0 && (
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'white', 
                padding: '0.4rem', 
                borderRadius: '20px', 
                boxShadow: 'var(--shadow-sm)', 
                border: '1px solid var(--border)',
                maxWidth: '100%',
                overflowX: 'auto'
              }}>
                <nav style={{ display: 'flex', gap: '0.25rem', padding: '0 0.5rem' }}>
                  {enabledTabsKeys.map(tabKey => {
                    const tabReg = TAB_REGISTRY[tabKey];
                    if (!tabReg) return null; // If admin configured a tab that doesn't exist in registry
                    
                    const Icon = tabReg.icon;
                    return (
                      <button 
                        key={tabKey}
                        onClick={() => setActiveTab(tabKey)}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: activeTab === tabKey ? 'var(--primary)' : 'transparent', 
                          color: activeTab === tabKey ? 'white' : 'var(--text-main)', 
                          border: 'none',
                          borderRadius: '14px',
                          padding: '0.6rem 1rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Icon size={16} />
                        {tabReg.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Tab Rendering */}
        <div style={{ minHeight: '500px' }}>
          <React.Suspense fallback={<WorkplaceLoadingFallback />}>
            {enabledTabsKeys.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                 <ShieldCheck size={48} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                 <h3>No Modules Assigned</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Your profile currently has no active modules assigned. Please contact the administrator.</p>
              </div>
            ) : (
              // Render ONLY the active tab, passing its dynamic configuration as props
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

      </div>
    </div>
  );
}
