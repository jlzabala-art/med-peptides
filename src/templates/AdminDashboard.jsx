/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Settings, Users, Database, Layers,
  PackageSearch, LayoutDashboard, Bot, Link2, BarChart3,
  ChevronRight, ChevronDown, ClipboardList, Zap, Globe, Wrench,
  FlaskConical, Box, Tag, DollarSign, FileText, Eye, Mail,
  Activity, BookOpen, Cpu, LogOut, Menu, X, Building2, TrendingUp
} from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';

// ── Lazy tab components ────────────────────────────────────────────────────────
const AdminUsersTab        = React.lazy(() => import('../components/admin/AdminUsersTab'));
const AdminProductsTab     = React.lazy(() => import('../components/admin/AdminProductsTab'));
const AdminSettingsTab     = React.lazy(() => import('../components/admin/AdminSettingsTab'));
const AdminInvitationsTab  = React.lazy(() => import('../components/admin/AdminInvitationsTab'));
const AdminCostsTab        = React.lazy(() => import('../components/admin/AdminCostsTab'));
const AdminRelationshipsTab= React.lazy(() => import('../components/admin/AdminRelationshipsTab'));
const AdminSemanticTab     = React.lazy(() => import('../components/admin/AdminSemanticTab'));
const AdminPricesTab       = React.lazy(() => import('../components/admin/AdminPricesTab'));
const AdminViewsConfigTab  = React.lazy(() => import('../components/admin/AdminViewsConfigTab'));
const AdminVariantsTab     = React.lazy(() => import('../components/admin/AdminVariantsTab'));
const AdminProtocolsTab    = React.lazy(() => import('../components/admin/AdminProtocolsTab'));
const AdminBlueprintsTab   = React.lazy(() => import('../components/admin/AdminBlueprintsTab'));
const AdminMetricsDashboard= React.lazy(() => import('../components/admin/AdminMetricsDashboard'));
const OrdersTab            = React.lazy(() => import('../components/admin/OrdersTab'));
const AdminAccessLevelsTab = React.lazy(() => import('../components/admin/AdminAccessLevelsTab'));
const AdminClinicalAITab   = React.lazy(() => import('../components/admin/AdminClinicalAITab'));
const AdminAnalyticsTab    = React.lazy(() => import('../components/admin/AdminAnalyticsTab'));
const AdminClinicalLogsTab = React.lazy(() => import('../components/admin/AdminClinicalLogsTab'));
const AdminHomeLayoutTab   = React.lazy(() => import('../components/admin/AdminHomeLayoutTab'));
const AdminPlaceholderTab  = React.lazy(() => import('../components/admin/AdminPlaceholderTab'));
const AdminAIAgentsTab     = React.lazy(() => import('../components/admin/AdminAIAgentsTab'));
const AdminStorageTab      = React.lazy(() => import('../components/admin/AdminStorageTab'));
const AdminAIToolsTab      = React.lazy(() => import('../components/admin/AdminAIToolsTab'));
const AdminSkuMappingTab   = React.lazy(() => import('../components/admin/SkuMappingTab/AdminSkuMappingTab'));
const AdminZohoCRMWidget   = React.lazy(() => import('../components/admin/gadgets/AdminZohoCRMWidget'));
const AdminBulkOrdersTab   = React.lazy(() => import('../components/admin/AdminBulkOrdersTab'));
const AdminFinanceWidget   = React.lazy(() => import('../components/admin/gadgets/AdminFinanceWidget'));
const AdminEmailTemplatesTab = React.lazy(() => import('../components/admin/AdminEmailTemplatesTab'));
const AdminProductSyncWidget = React.lazy(() => import('../components/admin/gadgets/AdminProductSyncWidget'));
const CatalogList = React.lazy(() => import('../components/wholesaler/CatalogList'));
const CatalogCreatorFlow = React.lazy(() => import('../components/wholesaler/CatalogCreatorFlow'));
const EmailCampaignBuilder = React.lazy(() => import('../components/wholesaler/EmailCampaignBuilder'));

// icon alias (lucide doesn't export MailPlus2 — must be before NAV_GROUPS)
function MailPlus2(props) { return <Users {...props} />; }

// ── Intent-based navigation groups ────────────────────────────────────────────
const NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard KPIs', icon: LayoutDashboard },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    items: [
      { id: 'patients',     label: 'Patients',             icon: Users },
      { id: 'wholesalers',  label: 'Wholesalers',          icon: Building2 },
      { id: 'doctors',      label: 'Physicians & Clinics', icon: Users },
      { id: 'invitations',  label: 'Invitations',          icon: MailPlus2 },
      { id: 'access-levels',label: 'Access Levels',        icon: ShieldCheck },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      { id: 'products', label: 'Products',  icon: Box },
      { id: 'variants', label: 'Variants',  icon: FlaskConical },
      { id: 'prices',   label: 'Prices',   icon: Tag },
      { id: 'costs',    label: 'Costs',    icon: DollarSign },
      { id: 'protocols',label: 'Protocols', icon: FileText },
      { id: 'catalogs', label: 'Catalogs',   icon: FileText },
      { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    items: [
      { id: 'orders',       label: 'Order Queue',    icon: ClipboardList },
      { id: 'bulk-orders',  label: 'Bulk Orders B2B', icon: Layers },
    ],
  },
  {
    id: 'agents',
    label: 'AI Agents',
    badge: 'LIVE',
    badgeColor: 'var(--color-success)',
    items: [
      { id: 'ai-agents',   label: 'Cloud Agents',    icon: Bot },
      { id: 'ai-tools',    label: 'Toolkit & Skills', icon: Wrench },
      { id: 'clinical-ai', label: 'Clinical AI',     icon: Zap },
      { id: 'cloud-storage', label: 'Knowledge Base', icon: Database },
      { id: 'ai-logs',     label: 'AI History',      icon: BookOpen },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    badge: 'NEW',
    badgeColor: '#6366f1',
    items: [
      { id: 'sku-sync',         label: 'Zoho Books',       icon: Link2 },
      { id: 'crm-intelligence', label: 'Zoho Bigin',       icon: Building2 },
      { id: 'zoho-campaigns',   label: 'Zoho Campaigns',   icon: Mail },
    ],
  },
  {
    id: 'config',
    label: 'Configuration',
    items: [
      { id: 'settings',        label: 'General Settings',  icon: Settings },
      { id: 'semantic',        label: 'AI Semantics',      icon: Cpu },
      { id: 'relationships',   label: 'Relationships',     icon: Globe },
      { id: 'home-layout',     label: 'Home Layout',       icon: Eye },
      { id: 'views',           label: 'Views',             icon: Layers },
      { id: 'blueprints',      label: 'Blueprints',        icon: Database },
      { id: 'email-templates', label: 'Email Templates',   icon: Mail },
      { id: 'deploy',          label: 'Deploy & Hosting',  icon: Globe },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'analytics',   label: 'Growth Metrics',       icon: BarChart3 },
      { id: 'growth',      label: 'Growth Signals',       icon: TrendingUp },
      { id: 'commissions', label: 'Commissions & Payouts', icon: DollarSign },
    ],
  },
];

// Tab→group lookup
const TAB_TO_GROUP = {};
for (const g of NAV_GROUPS) for (const item of g.items) TAB_TO_GROUP[item.id] = g.id;

// ── Loading spinner ────────────────────────────────────────────────────────────
function AdminLoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', minHeight: '400px', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(0,54,102,0.1)', borderTopColor: 'var(--primary)',
        animation: 'adminSpin 1s linear infinite' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
        Loading module...
      </span>
      <style>{`@keyframes adminSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Tab renderer ───────────────────────────────────────────────────────────────
function TabContent({ tab, catalogToEdit, setCatalogToEdit, setActiveTab }) {
  const tabLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === tab)?.label || tab;
  return (
    <AdminTabErrorBoundary tabId={tab} tabLabel={tabLabel}>
    <React.Suspense fallback={<AdminLoadingFallback />}>
      {tab === 'dashboard' && (
        <AdminMetricsDashboard />
      )}
      {tab === 'wholesalers'   && <AdminUsersTab defaultRole="wholesaler" readOnly={false} canApprove={true} />}
      {tab === 'doctors'       && <AdminUsersTab defaultRole="doctor" readOnly={false} canApprove={true} />}
      {tab === 'patients'      && <AdminUsersTab defaultRole="patient" readOnly={false} canApprove={true} />}
      {tab === 'users'         && <AdminUsersTab readOnly={false} canApprove={true} />}
      {tab === 'products'      && <AdminProductsTab readOnly={false} hideCosts={false} allowedCategories={['All']} />}
      {tab === 'costs'         && <AdminCostsTab readOnly={false} />}
      {tab === 'prices'        && <AdminPricesTab />}
      {tab === 'relationships' && <AdminRelationshipsTab readOnly={false} />}
      {tab === 'semantic'      && <AdminSemanticTab readOnly={false} />}
      {tab === 'settings'      && <AdminSettingsTab readOnly={false} />}
      {tab === 'invitations'   && <AdminInvitationsTab readOnly={false} />}
      {tab === 'views'         && <AdminViewsConfigTab />}
      {tab === 'orders'        && <OrdersTab readOnly={false} />}
      {tab === 'bulk-orders'   && <AdminBulkOrdersTab />}
      {tab === 'access-levels' && <AdminAccessLevelsTab />}
      {tab === 'clinical-ai'   && <AdminClinicalAITab />}
      { tab === 'analytics'     && <AdminAnalyticsTab /> }
      { tab === 'ai-logs'       && <AdminClinicalLogsTab /> }
      { tab === 'ai-agents'     && <AdminAIAgentsTab /> }
      { tab === 'ai-tools'      && <AdminAIToolsTab /> }
      { tab === 'cloud-storage' && <AdminStorageTab /> }
      {tab === 'home-layout'   && <AdminHomeLayoutTab />}
      {tab === 'protocols'     && <AdminProtocolsTab />}
      {tab === 'blueprints'    && <AdminBlueprintsTab />}
      {tab === 'variants'         && <AdminVariantsTab />}
      {tab === 'catalogs'         && <CatalogList ownerId="admin" ownerType="admin" onOpenBuilder={() => { setCatalogToEdit(null); setActiveTab('catalog-builder'); }} onSelectCatalogToEdit={(cat) => { setCatalogToEdit(cat); setActiveTab('catalog-builder'); }} />}
      {tab === 'catalog-builder'  && <CatalogCreatorFlow ownerId="admin" ownerType="admin" editingCatalog={catalogToEdit} onBack={() => { setCatalogToEdit(null); setActiveTab('catalogs'); }} />}
      {tab === 'email-campaigns'  && <EmailCampaignBuilder ownerId="admin" ownerType="admin" onBack={() => setActiveTab('catalogs')} />}
      {tab === 'email-templates'   && <AdminEmailTemplatesTab />}
      {tab === 'sku-sync'           && <AdminSkuMappingTab />}
      {tab === 'crm-intelligence'   && (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminZohoCRMWidget fullHeight={false} />
        </div>
      )}
      {tab === 'zoho-campaigns'     && (
        <AdminPlaceholderTab
          title="Zoho Campaigns"
          description="Design, monitor, and automate email campaigns, clinical newsletters, and patient retention workflows synced with Zoho Books and Bigin segments."
          features={[
            'Bi-directional contact list synchronization',
            'Campaign performance dashboard',
            'Clinical newsletter automations',
            'Segmentation based on user order history'
          ]}
          tags={['Integrations', 'Marketing', 'E-mail']}
          color="var(--color-primary)"
          priority="soon"
        />
      )}
      {tab === 'commissions'   && (
        <AdminPlaceholderTab title="Commissions & Payouts"
          description="Configure sales representative credentials, commission rules, and track payout logs."
          features={['Automated payout calculations', 'Commission rules editor', 'Sales rep assignment', 'Historical payout logs']}
          tags={['B2B Operations', 'Sales Rules', 'Payouts']} color="var(--color-primary)" priority="soon" />
      )}
      {tab === 'growth' && (
        <AdminPlaceholderTab title="Growth Signals"
          description="Analyze onboarding velocity, wholesale client pipelines, conversion funnels, and churn alerts."
          features={['Wholesale pipeline health', 'Patient onboarding speed', 'Revenue forecasting', 'Churn risk flags']}
          tags={['Analytics', 'Growth', 'Signals']} color="var(--color-primary)" priority="soon" />
      )}
      {tab === 'deploy' && (
        <AdminPlaceholderTab title="Deploy & Hosting"
          description="Monitor application deployments, environment variables, hosting status, and trigger builds."
          features={['GitHub CI/CD triggers', 'Environment variable manager', 'Real-time build log streaming', 'Domain SSL configurations']}
          tags={['Infrastructure', 'Hosting', 'Cloud']} color="var(--color-primary)" priority="soon" />
      )}
    </React.Suspense>
    </AdminTabErrorBoundary>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ onBack, initialTab }) {
  const { isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('t') || initialTab || 'dashboard';

  const navToTab = useCallback((tabId) => {
    navigate(`?t=${tabId}`);
  }, [navigate]);

  const handleLogout = () => { if (logout) logout(); window.location.href = '/'; };

  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab));
  const currentItem  = currentGroup?.items.find(i => i.id === activeTab);

  const sidebarProps = {
    storageKey: "admin-sidebar",
    groups: NAV_GROUPS,
    activeId: activeTab,
    onNavigate: navToTab,
    accentColor: "#0071bd",
    header: { title: 'Control Center', subtitle: 'Admin Portal' },
    footer: { label: 'Logout', icon: LogOut, onClick: handleLogout }
  };

  const headerProps = {
    title: currentItem?.label || 'Dashboard',
    subtitle: currentGroup && currentGroup.label !== currentItem?.label 
      ? currentGroup.label 
      : undefined,
    onSearchClick: () => { console.log('Global search clicked'); }
  };

  return (
    <PortalLayout 
      sidebarNavGroups={NAV_GROUPS}
      activeNavId={activeTab}
      onNavigate={navToTab}
      portalTitle="Control Center"
      roleContext="admin"
      pageContext={{
        activeTab: activeTab,
        label: currentItem?.label || 'Dashboard',
        group: currentGroup?.label || 'Overview'
      }}
      headerActions={
        <button 
          onClick={handleLogout} 
          style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Logout"
        >
          <LogOut size={18} color="var(--color-text-secondary)" />
        </button>
      }
    >
      <div style={{ padding: '1rem' }}>
        <TabContent 
          tab={activeTab} 
          catalogToEdit={catalogToEdit} 
          setCatalogToEdit={setCatalogToEdit} 
          setActiveTab={navToTab} 
        />
      </div>
    </PortalLayout>
  );
}
