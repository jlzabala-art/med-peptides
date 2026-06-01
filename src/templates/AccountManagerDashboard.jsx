import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShoppingBag, MessageSquare, Blocks, Settings, Activity, UserPlus, LogOut, Bot,
  Mail, Tag, Eye, Zap, Share2
} from 'lucide-react';
import EmailCampaignBuilder from '../components/wholesaler/EmailCampaignBuilder';
import CouponsManager from '../components/marketing/CouponsManager';
import ReferralTracking from '../components/marketing/ReferralTracking';
import CoBranding from '../components/marketing/CoBranding';
import DripMarketing from '../components/marketing/DripMarketing';
import AppPortalLayout from '../layout/AppPortalLayout';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import styles from './AccountManagerDashboard.module.css';
// Tabs
import ManagerOverviewTab from '../components/wholesaler/ManagerOverviewTab';
import ManagerMessagesTab from '../components/wholesaler/ManagerMessagesTab';
import ManagerClientsTab from '../components/wholesaler/ManagerClientsTab';
import ManagerOrdersTab from '../components/wholesaler/ManagerOrdersTab';
import ManagerInvitationsTab from '../components/wholesaler/ManagerInvitationsTab';
import CatalogCreatorFlow from '../components/wholesaler/CatalogCreatorFlow';
import UserSettings from './UserSettings';
import NotificationBell from '../components/ui/NotificationBell';

const NAV_GROUPS = [
  {
    label: 'Main Menu',
    items: [
      { id: 'overview',        label: 'Overview',        icon: LayoutDashboard },
      { id: 'messages',        label: 'Messages',        icon: MessageSquare },
      { id: 'clients',         label: 'My Clients',      icon: Users },
      { id: 'invitations',     label: 'Invitations',     icon: UserPlus },
      { id: 'orders',          label: 'Client Orders',   icon: ShoppingBag },
    ]
  },
  {
    label: 'Marketing & Brand',
    items: [
      { id: 'catalog-builder', label: 'Catalog Builder', icon: Blocks },
      { id: 'email-campaigns', label: 'Email Campaigns', icon: Mail },
      { id: 'drip-marketing',  label: 'Drip Sequences',  icon: Zap },
      { id: 'coupons',         label: 'Coupons',         icon: Tag },
      { id: 'referrals',       label: 'Referrals',       icon: Share2 },
      { id: 'co-branding',     label: 'Co-Branding',     icon: Eye },
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'settings',        label: 'Settings',        icon: Settings }
    ]
  }
];

export default function AccountManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path
  const currentPath = location.pathname.split('/').pop();
  const activeTab = NAV_GROUPS.flatMap(g => g.items).some(item => item.id === currentPath) ? currentPath : 'overview';
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => { if (user) { /* perform logout logic if available */ } window.location.href = '/'; };

  const currentLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Overview';

  return (
    <AppPortalLayout allowedRoles={['manager', 'admin']}>
      <div className={styles.dashboardContent}>
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          
          <Route path="overview" element={<AdminTabErrorBoundary tabId="overview"><ManagerOverviewTab /></AdminTabErrorBoundary>} />
          <Route path="messages" element={<AdminTabErrorBoundary tabId="messages"><ManagerMessagesTab /></AdminTabErrorBoundary>} />
          <Route path="clients" element={<AdminTabErrorBoundary tabId="clients"><ManagerClientsTab /></AdminTabErrorBoundary>} />
          <Route path="invitations" element={<AdminTabErrorBoundary tabId="invitations"><ManagerInvitationsTab /></AdminTabErrorBoundary>} />
          <Route path="orders" element={<AdminTabErrorBoundary tabId="orders"><ManagerOrdersTab /></AdminTabErrorBoundary>} />
          
          <Route path="catalog-builder" element={
            <AdminTabErrorBoundary tabId="catalog-builder">
              <div className={styles.catalogWrapper}>
                <CatalogCreatorFlow ownerId={user.uid} ownerType="wholesaler" />
              </div>
            </AdminTabErrorBoundary>
          } />

          <Route path="email-campaigns" element={
            <AdminTabErrorBoundary tabId="email-campaigns">
              <EmailCampaignBuilder ownerId={user.uid} ownerType="wholesaler" onBack={() => navigate('/account-manager/overview')} />
            </AdminTabErrorBoundary>
          } />
          
          <Route path="drip-marketing" element={<AdminTabErrorBoundary tabId="drip-marketing"><DripMarketing ownerId={user.uid} ownerType="wholesaler" /></AdminTabErrorBoundary>} />
          <Route path="coupons" element={<AdminTabErrorBoundary tabId="coupons"><CouponsManager ownerId={user.uid} ownerType="wholesaler" /></AdminTabErrorBoundary>} />
          <Route path="referrals" element={<AdminTabErrorBoundary tabId="referrals"><ReferralTracking ownerId={user.uid} ownerType="wholesaler" /></AdminTabErrorBoundary>} />
          <Route path="co-branding" element={<AdminTabErrorBoundary tabId="co-branding"><CoBranding ownerId={user.uid} ownerType="wholesaler" /></AdminTabErrorBoundary>} />

          <Route path="settings" element={<AdminTabErrorBoundary tabId="settings"><UserSettings onBack={() => navigate('/account-manager')} /></AdminTabErrorBoundary>} />
        </Routes>
      </div>
    </AppPortalLayout>
  );
}
