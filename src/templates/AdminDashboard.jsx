import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Users from 'lucide-react/dist/esm/icons/users';
import Database from 'lucide-react/dist/esm/icons/database';
import Layers from 'lucide-react/dist/esm/icons/layers';
import PackageSearch from 'lucide-react/dist/esm/icons/package-search';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Bot from 'lucide-react/dist/esm/icons/bot';
import Link2 from 'lucide-react/dist/esm/icons/link-2';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Receipt from 'lucide-react/dist/esm/icons/receipt';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import Box from 'lucide-react/dist/esm/icons/box';
import Tag from 'lucide-react/dist/esm/icons/tag';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Activity from 'lucide-react/dist/esm/icons/activity';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Cpu from 'lucide-react/dist/esm/icons/cpu';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Search from 'lucide-react/dist/esm/icons/search';
import Building from 'lucide-react/dist/esm/icons/building';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import HeartPulse from 'lucide-react/dist/esm/icons/heart-pulse';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import LayoutTemplate from 'lucide-react/dist/esm/icons/layout-template';
import Network from 'lucide-react/dist/esm/icons/network';
import ScrollText from 'lucide-react/dist/esm/icons/scroll-text';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import Settings2 from 'lucide-react/dist/esm/icons/settings-2';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import PieChart from 'lucide-react/dist/esm/icons/pie-chart';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Pill from 'lucide-react/dist/esm/icons/pill';
import FilePlus from 'lucide-react/dist/esm/icons/file-plus';
import ArrowLeftRight from 'lucide-react/dist/esm/icons/arrow-left-right';
import UserCog from 'lucide-react/dist/esm/icons/user-cog';
import BarChart4 from 'lucide-react/dist/esm/icons/bar-chart-4';
import Workflow from 'lucide-react/dist/esm/icons/workflow';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import Package from 'lucide-react/dist/esm/icons/package';
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import RefillReminderBanner from '../components/shared/RefillReminderBanner';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

import PortalLayout from '../components/ui/PortalLayout';
import PageTransition from '../components/PageTransition';
import Omnibar from '../components/admin/Omnibar';

import GlobalNotificationCenter from '../components/shared/widgets/GlobalNotificationCenter';
import MarketIntelligenceHub from '../components/admin/market/MarketIntelligenceHub';

// ── Lazy tab components ────────────────────────────────────────────────────────
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminPhysiciansTab from '../components/admin/physicians/AdminPhysiciansTab';
import AtlasCommandCenter from '../components/admin/AtlasCommandCenter';
import AdminWholesellersTab from '../components/admin/AdminWholesellersTab';
import AdminAccountManagersTab from '../components/admin/AdminAccountManagersTab';
import AdminWorkflowsTab from '../components/admin/AdminWorkflowsTab';
import AdminLogisticsTab from '../components/admin/AdminLogisticsTab';
import ImportCatalogsTab from '../components/admin/imports/ImportCatalogsTab';
import ImportPriceListsTab from '../components/admin/imports/ImportPriceListsTab';
import ImportCoATab from '../components/admin/imports/ImportCoATab';
import ImportRFQTab from '../components/admin/imports/ImportRFQTab';
import AdminImportHistoryTab from '../components/admin/imports/AdminImportHistoryTab';
import CatalogIntelligenceHub from '../components/admin/catalog/CatalogIntelligenceHub';
import AdminCompetitorsTab from '../components/admin/AdminCompetitorsTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminInvitationsTab from '../components/admin/AdminInvitationsTab';
import AdminCostsTab from '../components/admin/AdminCostsTab';
import AdminRelationshipsTab from '../components/admin/AdminRelationshipsTab';
import AdminSemanticTab from '../components/admin/AdminSemanticTab';
const B2BQuotationsHub = lazy(() => import('../features/quotations/B2BQuotationsHub'));
const InvoiceIntelligenceHub = lazy(() => import('../features/invoices/InvoiceIntelligenceHub'));
import AdminPricesTab from '../components/admin/AdminPricesTab';
import AdminViewsConfigTab from '../components/admin/AdminViewsConfigTab';
import AdminVariantsTab from '../components/admin/AdminVariantsTab';
import AdminProtocolsTab from '../components/admin/AdminProtocolsTab';
import AdminProgramsTab from '../components/admin/AdminProgramsTab';
import AdminMetricsDashboard from '../components/admin/AdminMetricsDashboard';
import OrdersTab from '../components/admin/OrdersTab';
import AdminAccessLevelsTab from '../components/admin/AdminAccessLevelsTab';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminClinicalLogsTab from '../components/admin/AdminClinicalLogsTab';
import AdminHomeLayoutTab from '../components/admin/AdminHomeLayoutTab';
import AdminPlaceholderTab from '../components/admin/AdminPlaceholderTab';
import AdminAIAgentsTab from '../components/admin/AdminAIAgentsTab';
import AdminAuditLogsTab from '../components/admin/AdminAuditLogsTab';
import AtlasMessagesHub from '../features/messages/AtlasMessagesHub';
import AdminStorageTab from '../components/admin/AdminStorageTab';
import AdminAIToolsTab from '../components/admin/AdminAIToolsTab';
import AdminSkuMappingTab from '../components/admin/SkuMappingTab/AdminSkuMappingTab';
import AdminZohoCRMWidget from '../components/admin/gadgets/AdminZohoCRMWidget';
import AdminBulkOrdersTab from '../components/admin/AdminBulkOrdersTab';
import AdminFinanceWidget from '../components/admin/gadgets/AdminFinanceWidget';
import AdminEmailTemplatesTab from '../components/admin/AdminEmailTemplatesTab';
import AdminProductSyncWidget from '../components/admin/gadgets/AdminProductSyncWidget';
import AdminGadgetRepositoryTab from '../components/admin/AdminGadgetRepositoryTab';
import CatalogList from '../components/wholesaler/CatalogList';
import CatalogCreatorFlow from '../components/wholesaler/CatalogCreatorFlow';
import EmailCampaignBuilder from '../components/wholesaler/EmailCampaignBuilder';
import AdminFinanceTab from '../components/admin/AdminFinanceTab';
import AdminRFQTab from '../components/admin/AdminRFQTab';
import AdminPOTab from '../components/admin/AdminPOTab';
import AdminBillsTab from '../components/admin/AdminBillsTab';
import AdminPaymentsMadeTab from '../components/admin/AdminPaymentsMadeTab';
import AdminPaymentsReceivedTab from '../components/admin/AdminPaymentsReceivedTab';

// icon alias (lucide doesn't export MailPlus2 — must be before NAV_GROUPS)
function MailPlus2(props) {
  return <UserPlus {...props} />;
}

// ── Always-visible pinned items (not inside accordion groups) ─────────────────
const PINNED_ITEMS = [
  { id: 'dashboard', label: 'Dashboard KPIs', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useUnreadMessagesCount() {
  const { user, isAdmin, userRole } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const effectiveRole = userRole;
    const effectiveId = user.uid;
    const q =
      effectiveRole === 'admin' || isAdmin
        ? query(collection(db, 'conversations'))
        : query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', effectiveId)
          );
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach((doc) => {
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
    id: 'core-workspace',
    label: 'Workspace',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
    ],
  },
  {
    id: 'sales-operations',
    label: 'Sales (O2C)',
    icon: TrendingUp,
    items: [
      { id: 'quotations', label: 'Quotations', icon: FileText },
      { id: 'sales-orders', label: 'Sales Orders', icon: Box },
      { id: 'invoices', label: 'Invoices', icon: DollarSign },
      { id: 'payments-received', label: 'Payments Received', icon: DollarSign },
      { id: 'orders', label: 'B2C Orders', icon: PackageSearch },
      { id: 'bulk-orders', label: 'Bulk Orders', icon: Box },
      { id: 'agency-deals', label: 'Agency Deals', icon: Briefcase },
      { id: 'logistics', label: 'Logistics Tracker', icon: Truck },
      { id: 'shipping', label: 'Shipping Network', icon: Globe },
    ],
  },
  {
    id: 'purchasing-operations',
    label: 'Purchases (P2P)',
    icon: ShoppingCart,
    items: [
      { id: 'wholesellers', label: 'Suppliers/Wholesalers', icon: Building2 },
      { id: 'purchase-rfqs', label: 'Requests for Quotation', icon: FileText },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
      { id: 'purchase-bills', label: 'Supplier Bills', icon: Receipt },
      { id: 'payments-made', label: 'Payments Made', icon: DollarSign },
    ],
  },
  {
    id: 'catalog-pim',
    label: 'Items & Catalog',
    icon: Box,
    items: [
      { id: 'products', label: 'Items', icon: Box },
      { id: 'variants', label: 'Variants', icon: Layers },
      { id: 'pricing-visibility', label: 'Pricing Visibility', icon: EyeOff },
      { id: 'protocols', label: 'Protocols', icon: ClipboardList },
      { id: 'competitors', label: 'Competitor Analysis', icon: Activity },
      { id: 'enrichment', label: 'Catalog Enrichment', icon: Database },
      { id: 'lab-tests', label: 'Lab Tests & COAs', icon: ScrollText },
      { id: 'catalog-builder', label: 'Catalog Builder', icon: Wrench },
    ],
  },
  {
    id: 'crm-users',
    label: 'CRM & Users',
    icon: Users,
    items: [
      { id: 'leads', label: 'Leads', icon: Users },
      { id: 'clinics', label: 'Clinics', icon: Building },
      { id: 'doctors', label: 'Doctors', icon: Stethoscope },
      { id: 'patients', label: 'Patients', icon: HeartPulse },
      { id: 'account-managers', label: 'Account Managers', icon: ShieldCheck },
      { id: 'command-center', label: 'Command Center', icon: Activity },
      { id: 'territory-rules', label: 'Territory Rules', icon: ShieldCheck },
      { id: 'access-levels', label: 'Access Levels', icon: Lock },
      { id: 'invitations', label: 'Invitations', icon: UserPlus },
    ],
  },
  {
    id: 'finance-management',
    label: 'Finance & Accounting',
    icon: DollarSign,
    items: [
      { id: 'finance-budget', label: 'Budgets & Variances', icon: PieChart },
      { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
      { id: 'finance-payables', label: 'Payables & Payouts', icon: CreditCard },
      { id: 'finance-approvals', label: 'Control & Approvals', icon: ShieldAlert },
      { id: 'finance-economics', label: 'Unit Economics', icon: TrendingUp },
      { id: 'finance-reporting', label: 'Reporting & Data Room', icon: FileText },
    ],
  },
  {
    id: 'marketing-integrations',
    label: 'Marketing & External',
    icon: Globe,
    items: [
      { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
      { id: 'marketing', label: 'Content / Social', icon: Globe },
      { id: 'newsletter', label: 'Newsletter Signups', icon: Mail },
      { id: 'email-templates', label: 'Email Templates', icon: FileText },
      { id: 'drip-marketing', label: 'Drip Sequences', icon: Zap },
      { id: 'catalogs', label: 'Shared Catalogs', icon: BookOpen },
      { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
      { id: 'referrals', label: 'Referral Tracking', icon: Users },
      { id: 'co-branding', label: 'Co-Branding', icon: Eye },
      { id: 'sku-sync', label: 'Zoho Books', icon: Link2 },
      { id: 'crm-intelligence', label: 'Zoho Bigin', icon: Briefcase },
    ],
  },
  {
    id: 'system-ai',
    label: 'System & AI',
    icon: Settings2,
    badge: 'LIVE',
    badgeColor: 'var(--color-success)',
    items: [
      { id: 'ai-agents', label: 'AI Agents Hub', icon: Network },
      { id: 'prescription-agent', label: 'Prescription Agent', icon: Zap },
      { id: 'clinical-ai', label: 'Atlas AI', icon: Bot },
      { id: 'workflows', label: 'Automation Workflows', icon: Settings2 },
      { id: 'semantic', label: 'AI Semantics', icon: Cpu },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'ai-logs', label: 'AI Logs', icon: ScrollText },
      { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
      { id: 'relationships', label: 'Relationships', icon: Network },
      { id: 'views', label: 'Views', icon: Layers },
      { id: 'home-layout', label: 'Home Layout', icon: LayoutTemplate },
      { id: 'gadget-repository', label: 'Gadget Repository', icon: Layers },
      { id: 'settings', label: 'General Settings', icon: Settings },
      { id: 'deploy', label: 'Deploy & Hosting', icon: Globe },
    ],
  },
  {
    id: 'import-data',
    label: 'Import Data',
    icon: UploadCloud,
    items: [
      { id: 'import-catalogs', label: 'Import Catalogs', icon: BookOpen },
      { id: 'import-prices', label: 'Import Price Lists', icon: Tag },
      { id: 'import-coa', label: 'Import Certificates', icon: CheckCircle },
      { id: 'import-rfq', label: 'Import RFQs', icon: FileText },
      { id: 'import-prescriptions', label: 'Import Prescriptions', icon: ClipboardList },
      { id: 'import-bloodworks', label: 'Import Bloodworks', icon: Activity },
      { id: 'import-history', label: 'Import History', icon: Database },
    ],
  },
];

// Tab→group lookup
const TAB_TO_GROUP = {};
for (const g of NAV_GROUPS) for (const item of g.items) TAB_TO_GROUP[item.id] = g.id;

// ── Loading spinner ────────────────────────────────────────────────────────────
function AdminLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(0,54,102,0.1)',
          borderTopColor: 'var(--primary)',
          animation: 'adminSpin 1s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
        Loading module...
      </span>
      <style>{`@keyframes adminSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
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
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOmnibarOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dynamicPinnedItems = React.useMemo(() => {
    return PINNED_ITEMS.map((item) => {
      if (item.id === 'messages') {
        return {
          ...item,
          badge: unreadMessages > 0 ? unreadMessages : null,
          badgeColor: '#25D366', // WhatsApp green
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
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => group.id === 'core-workspace' || userProfile.allowedAdminTabs.includes(item.id)
      ),
    })).filter((group) => group.items.length > 0);
  }, [userProfile, isAdmin]);

  // Derive active tab from the URL path instead of query params.
  // E.g., /admin/users -> 'users', /admin -> 'dashboard'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  React.useEffect(() => {
    if (isAdmin || userProfile?.role === 'admin') return; // Admins bypass restrictions
    if (userProfile?.allowedAdminTabs && userProfile.allowedAdminTabs.length > 0) {
      if (
        !userProfile.allowedAdminTabs.includes(activeTab) &&
        activeTab !== 'dashboard' &&
        activeTab !== 'my-profile'
      ) {
        // Not allowed to access this tab
        navigate(`/admin/${userProfile.allowedAdminTabs[0]}`);
      } else if (activeTab === 'dashboard' && !userProfile.allowedAdminTabs.includes('dashboard')) {
        // They requested the root dashboard, but it's not explicitly allowed. Redirect.
        navigate(`/admin/${userProfile.allowedAdminTabs[0]}`);
      }
    }
  }, [userProfile?.allowedAdminTabs, activeTab, navigate, isAdmin, userProfile?.role]);

  const navToTab = useCallback(
    (tabId) => {
      if (tabId === 'b2c-shop') {
        navigate('/');
        return;
      }
      navigate(`/admin/${tabId === 'dashboard' ? '' : tabId}`);
    },
    [navigate]
  );

  const handleLogout = () => {
    if (logout) logout();
    window.location.href = '/';
  };

  const currentGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeTab));
  const currentItem =
    currentGroup?.items.find((i) => i.id === activeTab) ??
    PINNED_ITEMS.find((i) => i.id === activeTab);

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
        group: currentGroup?.label || 'Overview',
      }}
      headerActions={
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '4px',
            }}
            title="Logout"
          >
            <LogOut size={18} color="var(--color-text-secondary)" />
          </button>
        </div>
      }
    >
      <div style={{ padding: '1rem' }}>
        <React.Suspense fallback={<AdminLoadingFallback />}>
          <PageTransition locationKey={location.pathname}>
            <Outlet />
          </PageTransition>
        </React.Suspense>
      </div>
      <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} />
    </PortalLayout>
  );
}
