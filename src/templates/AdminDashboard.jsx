/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Settings, Users, Database, Layers,
  PackageSearch, LayoutDashboard, Bot, Link2, BarChart3,
  ChevronRight, ChevronDown, ClipboardList, Zap, Globe, Wrench, ShoppingCart, Receipt,
  FlaskConical, Box, Tag, DollarSign, FileText, Eye, EyeOff, Mail,
  Activity, BookOpen, Cpu, LogOut, Menu, X, Building2, TrendingUp, Truck,
  Building, Stethoscope, HeartPulse, UserPlus, Lock, Briefcase, LayoutTemplate, Network, ScrollText, MessageSquare, Calendar, UploadCloud, Settings2, CheckCircle, PieChart, CreditCard, ShieldAlert, Pill, FilePlus, ArrowLeftRight, UserCog, BarChart4, Workflow, GraduationCap, PackageOpen, Package
} from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';
import PageTransition from '../components/PageTransition';

// ── Lazy tab components ────────────────────────────────────────────────────────
const AdminUsersTab        = React.lazy(() => import('../components/admin/AdminUsersTab'));
const AdminWholesellersTab = React.lazy(() => import('../components/admin/AdminWholesellersTab'));
const AdminAccountManagersTab = React.lazy(() => import('../components/admin/AdminAccountManagersTab'));
const AdminWorkflowsTab = React.lazy(() => import('../components/admin/AdminWorkflowsTab'));
const AdminLogisticsTab = React.lazy(() => import('../components/admin/AdminLogisticsTab'));
const ImportCatalogsTab = React.lazy(() => import('../components/admin/imports/ImportCatalogsTab'));
const ImportPriceListsTab = React.lazy(() => import('../components/admin/imports/ImportPriceListsTab'));
const ImportCoATab = React.lazy(() => import('../components/admin/imports/ImportCoATab'));
const ImportRFQTab = React.lazy(() => import('../components/admin/imports/ImportRFQTab'));
const AdminImportHistoryTab = React.lazy(() => import('../components/admin/imports/AdminImportHistoryTab'));
const AdminProductsTab     = React.lazy(() => import('../components/admin/AdminProductsTab'));
const AdminCompetitorsTab  = React.lazy(() => import('../components/admin/AdminCompetitorsTab'));
const AdminSettingsTab     = React.lazy(() => import('../components/admin/AdminSettingsTab'));
const AdminInvitationsTab  = React.lazy(() => import('../components/admin/AdminInvitationsTab'));
const AdminCostsTab        = React.lazy(() => import('../components/admin/AdminCostsTab'));
const AdminRelationshipsTab= React.lazy(() => import('../components/admin/AdminRelationshipsTab'));
const AdminSemanticTab     = React.lazy(() => import('../components/admin/AdminSemanticTab'));
const AdminPricesTab       = React.lazy(() => import('../components/admin/AdminPricesTab'));
const AdminViewsConfigTab  = React.lazy(() => import('../components/admin/AdminViewsConfigTab'));
const AdminVariantsTab     = React.lazy(() => import('../components/admin/AdminVariantsTab'));
const AdminProtocolsTab    = React.lazy(() => import('../components/admin/AdminProtocolsTab'));
const AdminMetricsDashboard= React.lazy(() => import('../components/admin/AdminMetricsDashboard'));
const OrdersTab            = React.lazy(() => import('../components/admin/OrdersTab'));
const AdminAccessLevelsTab = React.lazy(() => import('../components/admin/AdminAccessLevelsTab'));
const ClinicalAIWidget     = React.lazy(() => import('../components/admin/ClinicalAIWidget'));
const AdminAnalyticsTab    = React.lazy(() => import('../components/admin/AdminAnalyticsTab'));
const AdminClinicalLogsTab = React.lazy(() => import('../components/admin/AdminClinicalLogsTab'));
const AdminHomeLayoutTab   = React.lazy(() => import('../components/admin/AdminHomeLayoutTab'));
const AdminPlaceholderTab  = React.lazy(() => import('../components/admin/AdminPlaceholderTab'));
const AdminAIAgentsTab     = React.lazy(() => import('../components/admin/AdminAIAgentsTab'));
const AdminAuditLogsTab    = React.lazy(() => import('../components/admin/AdminAuditLogsTab'));
const AdminStorageTab      = React.lazy(() => import('../components/admin/AdminStorageTab'));
const AdminAIToolsTab      = React.lazy(() => import('../components/admin/AdminAIToolsTab'));
const AdminSkuMappingTab   = React.lazy(() => import('../components/admin/SkuMappingTab/AdminSkuMappingTab'));
const AdminZohoCRMWidget   = React.lazy(() => import('../components/admin/gadgets/AdminZohoCRMWidget'));
const AdminBulkOrdersTab   = React.lazy(() => import('../components/admin/AdminBulkOrdersTab'));
const AdminFinanceWidget   = React.lazy(() => import('../components/admin/gadgets/AdminFinanceWidget'));
const AdminEmailTemplatesTab = React.lazy(() => import('../components/admin/AdminEmailTemplatesTab'));
const AdminProductSyncWidget = React.lazy(() => import('../components/admin/gadgets/AdminProductSyncWidget'));
const AdminGadgetRepositoryTab = React.lazy(() => import('../components/admin/AdminGadgetRepositoryTab'));
const CatalogList = React.lazy(() => import('../components/wholesaler/CatalogList'));
const CatalogCreatorFlow = React.lazy(() => import('../components/wholesaler/CatalogCreatorFlow'));
const EmailCampaignBuilder = React.lazy(() => import('../components/wholesaler/EmailCampaignBuilder'));
const AdminFinanceTab = React.lazy(() => import('../components/admin/AdminFinanceTab'));
const AdminRFQTab = React.lazy(() => import('../components/admin/AdminRFQTab'));
const AdminPOTab = React.lazy(() => import('../components/admin/AdminPOTab'));
const AdminBillsTab = React.lazy(() => import('../components/admin/AdminBillsTab'));
const AdminPaymentsMadeTab = React.lazy(() => import('../components/admin/AdminPaymentsMadeTab'));
const AdminPaymentsReceivedTab = React.lazy(() => import('../components/admin/AdminPaymentsReceivedTab'));

// icon alias (lucide doesn't export MailPlus2 — must be before NAV_GROUPS)
function MailPlus2(props) { return <UserPlus {...props} />; }

// ── Always-visible pinned items (not inside accordion groups) ─────────────────
const PINNED_ITEMS = [
  { id: 'dashboard', label: 'Dashboard KPIs', icon: LayoutDashboard },
  { id: 'messages',  label: 'Messages',        icon: MessageSquare },
  { id: 'calendar',  label: 'Calendar',        icon: Calendar },
];

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useUnreadMessagesCount() {
  const { user, isAdmin, userRole } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const effectiveRole = userRole;
    const effectiveId = user.uid;
    const q = (effectiveRole === 'admin' || isAdmin)
      ? query(collection(db, 'conversations'))
      : query(collection(db, 'conversations'), where('participants', 'array-contains', effectiveId));
      
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount?.[effectiveId] > 0) {
          count++;
        }
      });
      setUnread(count);
    });
    return unsub;
  }, [user, isAdmin, userRole]);

  return unread;
}

// ── Intent-based navigation groups ────────────────────────────────────────────
const NAV_GROUPS = [
  {
    id: 'sales-operations',
    label: 'Sales (O2C)',
    icon: TrendingUp,
    items: [
      { id: 'quotations',       label: 'Quotations',          icon: FileText },
      { id: 'sales-orders',     label: 'Sales Orders',        icon: Box },
      { id: 'invoices',         label: 'Invoices',            icon: DollarSign },
      { id: 'payments-received',label: 'Payments Received',   icon: DollarSign },
      { id: 'orders',           label: 'B2C Orders',          icon: PackageSearch },
      { id: 'bulk-orders',      label: 'Bulk Orders',         icon: Box },
      { id: 'agency-deals',     label: 'Agency Deals',        icon: Briefcase },
      { id: 'logistics',        label: 'Logistics Tracker',   icon: Truck },
      { id: 'shipping',         label: 'Shipping Network',    icon: Globe },
    ],
  },
  {
    id: 'purchasing-operations',
    label: 'Purchases (P2P)',
    icon: ShoppingCart,
    items: [
      { id: 'wholesellers',      label: 'Suppliers/Wholesalers', icon: Building2 },
      { id: 'purchase-rfqs',     label: 'Requests for Quotation',icon: FileText },
      { id: 'purchase-orders',   label: 'Purchase Orders',       icon: ShoppingCart },
      { id: 'purchase-bills',    label: 'Supplier Bills',        icon: Receipt },
      { id: 'payments-made',     label: 'Payments Made',         icon: DollarSign },
    ],
  },
  {
    id: 'catalog-pim',
    label: 'Items & Catalog',
    icon: Box,
    items: [
      { id: 'products',        label: 'Items',           icon: Box },
      { id: 'prices',          label: 'Pricing Matrix',  icon: Tag },
      { id: 'costs',           label: 'Costs',           icon: DollarSign },
      { id: 'pricing-visibility', label: 'Pricing Visibility',  icon: EyeOff },
      { id: 'protocols',       label: 'Protocols',       icon: ClipboardList },
      { id: 'competitors',     label: 'Competitor Analysis', icon: Activity },
      { id: 'enrichment',      label: 'Catalog Enrichment', icon: Database },
      { id: 'lab-tests',       label: 'Lab Tests & COAs',icon: ScrollText },
      { id: 'catalog-builder', label: 'Catalog Builder', icon: Wrench },
    ],
  },
  {
    id: 'crm-users',
    label: 'CRM & Users',
    icon: Users,
    items: [
      { id: 'leads',            label: 'Leads',               icon: Users },
      { id: 'clinics',          label: 'Clinics',             icon: Building },
      { id: 'doctors',          label: 'Doctors',             icon: Stethoscope },
      { id: 'patients',         label: 'Patients',            icon: HeartPulse },
      { id: 'account-managers', label: 'Account Managers',    icon: ShieldCheck },
      { id: 'geography-areas',  label: 'Geography Areas',     icon: Globe },
      { id: 'territory-rules',  label: 'Territory Rules',     icon: ShieldCheck },
      { id: 'access-levels',    label: 'Access Levels',       icon: Lock },
      { id: 'invitations',      label: 'Invitations',         icon: UserPlus },
    ],
  },
  {
    id: 'finance-management',
    label: 'Finance & Accounting',
    icon: DollarSign,
    items: [
      { id: 'finance-budget',     label: 'Budgets & Variances',    icon: PieChart },
      { id: 'approvals',          label: 'Approvals',              icon: ShieldCheck },
      { id: 'finance-payables',   label: 'Payables & Payouts',     icon: CreditCard },
      { id: 'finance-approvals',  label: 'Control & Approvals',    icon: ShieldAlert },
      { id: 'finance-economics',  label: 'Unit Economics',         icon: TrendingUp },
      { id: 'finance-reporting',  label: 'Reporting & Data Room',  icon: FileText }
    ],
  },
  {
    id: 'marketing-integrations',
    label: 'Marketing & External',
    icon: Globe,
    items: [
      { id: 'email-campaigns',  label: 'Email Campaigns',     icon: Mail },
      { id: 'marketing',        label: 'Content / Social',    icon: Globe },
      { id: 'newsletter',       label: 'Newsletter Signups',  icon: Mail },
      { id: 'email-templates',  label: 'Email Templates',     icon: FileText },
      { id: 'drip-marketing',   label: 'Drip Sequences',      icon: Zap },
      { id: 'catalogs',         label: 'Shared Catalogs',     icon: BookOpen },
      { id: 'coupons',          label: 'Coupons & Discounts', icon: Tag },
      { id: 'referrals',        label: 'Referral Tracking',   icon: Users },
      { id: 'co-branding',      label: 'Co-Branding',         icon: Eye },
      { id: 'sku-sync',         label: 'Zoho Books',          icon: Link2 },
      { id: 'crm-intelligence', label: 'Zoho Bigin',          icon: Briefcase },
    ],
  },
  {
    id: 'system-ai',
    label: 'System & AI',
    icon: Settings2,
    badge: 'LIVE',
    badgeColor: 'var(--color-success)',
    items: [
      { id: 'ai-agents',         label: 'AI Agents Hub',       icon: Network },
      { id: 'prescription-agent',label: 'Prescription Agent',  icon: Zap },
      { id: 'clinical-ai',       label: 'Atlas AI',            icon: Bot },
      { id: 'workflows',         label: 'Automation Workflows',icon: Settings2 },
      { id: 'semantic',          label: 'AI Semantics',        icon: Cpu },
      { id: 'analytics',         label: 'Analytics',           icon: BarChart3 },
      { id: 'ai-logs',           label: 'AI Logs',             icon: ScrollText },
      { id: 'audit-logs',        label: 'Audit Logs',          icon: ShieldCheck },
      { id: 'relationships',     label: 'Relationships',       icon: Network },
      { id: 'views',             label: 'Views',               icon: Layers },
      { id: 'home-layout',       label: 'Home Layout',         icon: LayoutTemplate },
      { id: 'gadget-repository', label: 'Gadget Repository',   icon: Layers },
      { id: 'settings',          label: 'General Settings',    icon: Settings },
      { id: 'deploy',            label: 'Deploy & Hosting',    icon: Globe },
    ],
  },
  {
    id: 'import-data',
    label: 'Import Data',
    icon: UploadCloud,
    items: [
      { id: 'import-catalogs',   label: 'Import Catalogs',     icon: BookOpen },
      { id: 'import-prices',     label: 'Import Price Lists',  icon: Tag },
      { id: 'import-coa',        label: 'Import Certificates', icon: CheckCircle },
      { id: 'import-rfq',        label: 'Import RFQs',         icon: FileText },
      { id: 'import-prescriptions', label: 'Import Prescriptions',icon: ClipboardList },
      { id: 'import-bloodworks', label: 'Import Bloodworks',   icon: Activity },
      { id: 'import-history',    label: 'Import History',      icon: Database },
    ]
  }
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
      {tab === 'workflows' && <AdminWorkflowsTab />}
      {tab === 'logistics' && <AdminLogisticsTab />}
      {tab === 'import-catalogs' && <ImportCatalogsTab />}
      {tab === 'import-prices' && <ImportPriceListsTab />}
      {tab === 'import-coa' && <ImportCoATab />}
      {tab === 'import-rfq' && <ImportRFQTab />}
      {tab === 'import-history' && <AdminImportHistoryTab />}
      {tab === 'import-prescriptions' && <AdminPlaceholderTab title="Import Prescriptions" description="Upload patient prescriptions and doctor notes." tags={['Medical', 'Imports']} color="var(--color-primary)" />}
      {tab === 'import-bloodworks' && <AdminPlaceholderTab title="Import Bloodworks" description="Upload lab results and blood panels." tags={['Labs', 'Imports']} color="var(--color-primary)" />}
      {tab === 'wholesellers'  && <AdminWholesellersTab />}
      {tab === 'account-managers' && <AdminAccountManagersTab />}
      {tab === 'clinics'       && <AdminPlaceholderTab title="Clinics" description="Manage physical clinic locations and metadata." tags={['Network', 'Clinics']} color="var(--color-primary)" />}
      {tab === 'doctors'       && <AdminUsersTab defaultRole="doctor" readOnly={false} canApprove={true} />}
      {tab === 'patients'      && <AdminUsersTab defaultRole="patient" readOnly={false} canApprove={true} />}
      {tab === 'users'         && <AdminUsersTab readOnly={false} canApprove={true} />}
      { tab === 'products'      && <AdminProductsTab readOnly={false} hideCosts={false} allowedCategories={['All']} />}
      { tab === 'competitors'   && <AdminCompetitorsTab /> }
      { tab === 'costs'         && <AdminCostsTab readOnly={false} />}
      {tab === 'prices'        && <AdminPricesTab />}
      {tab === 'relationships' && <AdminRelationshipsTab readOnly={false} />}
      {tab === 'semantic'      && <AdminSemanticTab readOnly={false} />}
      {tab === 'settings'      && <AdminSettingsTab readOnly={false} />}
      {tab === 'invitations'   && <AdminInvitationsTab readOnly={false} />}
      {tab === 'views'         && <AdminViewsConfigTab />}
      {tab === 'orders'        && <OrdersTab readOnly={false} />}
      {tab === 'bulk-orders'   && <AdminBulkOrdersTab />}
      {tab === 'access-levels' && <AdminAccessLevelsTab />}
      {tab === 'purchase-rfqs' && <AdminRFQTab />}
      {tab === 'purchase-orders' && <AdminPOTab />}
      {tab === 'purchase-bills' && <AdminBillsTab />}
      {tab === 'payments-made' && <AdminPaymentsMadeTab />}
      {tab === 'payments-received' && <AdminPaymentsReceivedTab />}
      {tab === 'clinical-ai'   && <ClinicalAIWidget />}
      {tab === 'prescription-agent' && <AdminPlaceholderTab title="Prescription Agent" description="Manage logic for AI prescription recommendations." tags={['AI', 'Medical']} color="var(--color-primary)" />}
      {tab === 'analytics'     && <AdminAnalyticsTab /> }
      {tab === 'ai-logs'       && <AdminClinicalLogsTab /> }
      {tab === 'audit-logs'    && <AdminAuditLogsTab /> }
      {tab === 'geography-areas'    && <AdminPlaceholderTab title="Geography Areas" description="Manage international deployment areas and borders." tags={['Regions', 'Geography']} color="var(--color-primary)" />}
      {tab === 'territory-rules'    && <AdminPlaceholderTab title="Territory Rules" description="Configure exclusivity rules and protected categories." tags={['Rules', 'Protection']} color="var(--color-primary)" />}
      {tab === 'branding'           && <AdminPlaceholderTab title="Wholeseller Branding" description="Configure white-label subdomains and assets." tags={['Brand', 'White-label']} color="var(--color-primary)" />}
      {tab === 'pricing-visibility' && <AdminPlaceholderTab title="Pricing Visibility" description="Configure regional pricing walls and product visibility." tags={['Pricing', 'Access']} color="var(--color-primary)" />}
      {tab === 'leads'              && <AdminPlaceholderTab title="Lead Management" description="Global B2B/B2C lead routing and ownership rules." tags={['Sales', 'Leads']} color="var(--color-primary)" />}
      {tab === 'home-layout'   && <AdminHomeLayoutTab />}
      {tab === 'protocols'     && <AdminProtocolsTab />}
      {tab === 'stock'         && <AdminVariantsTab />}
      {tab === 'lab-tests'     && <AdminPlaceholderTab title="Lab Tests & COAs" description="Manage quality control, third-party tests, and Certificates of Analysis for your stock batches." tags={['Quality', 'Testing']} color="var(--color-primary)" />}
      {tab === 'catalogs'         && <CatalogList ownerId="admin" ownerType="admin" onOpenBuilder={() => { setCatalogToEdit(null); setActiveTab('catalog-builder'); }} onSelectCatalogToEdit={(cat) => { setCatalogToEdit(cat); setActiveTab('catalog-builder'); }} />}
      {tab === 'catalog-builder'  && <CatalogCreatorFlow ownerId="admin" ownerType="admin" editingCatalog={catalogToEdit} onBack={() => { setCatalogToEdit(null); setActiveTab('catalogs'); }} />}
      {tab === 'email-campaigns'  && <EmailCampaignBuilder ownerId="admin" ownerType="admin" onBack={() => setActiveTab('catalogs')} />}
      {tab === 'newsletter'       && <AdminPlaceholderTab title="Newsletter Signups" description="View and export B2C newsletter subscribers." tags={['Marketing', 'B2C']} color="var(--color-primary)" />}
      {tab === 'email-templates'   && <AdminEmailTemplatesTab />}
      {tab === 'gadget-repository' && <AdminGadgetRepositoryTab />}
      {tab === 'sku-sync'           && <AdminSkuMappingTab />}
      {tab === 'crm-intelligence'   && (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminZohoCRMWidget fullHeight={false} />
        </div>
      )}
      {tab.startsWith('finance-') && <AdminFinanceTab activeSubTab={tab.replace('finance-', '')} />}
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
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const { isAdmin, loading: authLoading, logout, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadMessages = useUnreadMessagesCount();

  const dynamicPinnedItems = React.useMemo(() => {
    return PINNED_ITEMS.map(item => {
      if (item.id === 'messages') {
        return { 
          ...item, 
          badge: unreadMessages > 0 ? unreadMessages : null,
          badgeColor: '#25D366' // WhatsApp green
        };
      }
      return item;
    });
  }, [unreadMessages]);

  const filteredNavGroups = React.useMemo(() => {
    if (isAdmin || userProfile?.role === 'admin') {
      return NAV_GROUPS;
    }
    if (!userProfile?.allowedAdminTabs || userProfile.allowedAdminTabs.length === 0) {
      return NAV_GROUPS;
    }
    return NAV_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => userProfile.allowedAdminTabs.includes(item.id))
    })).filter(group => group.items.length > 0);
  }, [userProfile?.allowedAdminTabs, isAdmin, userProfile?.role]);

  // Derive active tab from the URL path instead of query params.
  // E.g., /admin/users -> 'users', /admin -> 'dashboard'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  React.useEffect(() => {
    if (isAdmin || userProfile?.role === 'admin') return; // Admins bypass restrictions
    
    if (userProfile?.allowedAdminTabs && userProfile.allowedAdminTabs.length > 0) {
      if (!userProfile.allowedAdminTabs.includes(activeTab) && activeTab !== 'dashboard' && activeTab !== 'my-profile') {
        // Not allowed to access this tab
        navigate(`/admin/${userProfile.allowedAdminTabs[0]}`);
      } else if (activeTab === 'dashboard' && !userProfile.allowedAdminTabs.includes('dashboard')) {
        // They requested the root dashboard, but it's not explicitly allowed. Redirect.
        navigate(`/admin/${userProfile.allowedAdminTabs[0]}`);
      }
    }
  }, [userProfile?.allowedAdminTabs, activeTab, navigate]);

  const navToTab = useCallback((tabId) => {
    navigate(`/admin/${tabId === 'dashboard' ? '' : tabId}`);
  }, [navigate]);

  const handleLogout = () => { if (logout) logout(); window.location.href = '/'; };

  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab));
  const currentItem  = currentGroup?.items.find(i => i.id === activeTab)
                    ?? PINNED_ITEMS.find(i => i.id === activeTab);

  return (
    <PortalLayout 
      sidebarNavGroups={filteredNavGroups}
      sidebarPinnedItems={dynamicPinnedItems}
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
        <React.Suspense fallback={<AdminLoadingFallback />}>
          <PageTransition locationKey={location.pathname}>
            <Outlet />
          </PageTransition>
        </React.Suspense>
      </div>
    </PortalLayout>
  );
}
