import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShoppingBag, MessageSquare, Blocks, Settings, Activity, UserPlus, LogOut, Bot
} from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

// Tabs
import ManagerOverviewTab from '../components/wholesaler/ManagerOverviewTab';
import ManagerMessagesTab from '../components/wholesaler/ManagerMessagesTab';
import ManagerClientsTab from '../components/wholesaler/ManagerClientsTab';
import ManagerOrdersTab from '../components/wholesaler/ManagerOrdersTab';
import ManagerInvitationsTab from '../components/wholesaler/ManagerInvitationsTab';
import CatalogCreatorFlow from '../components/wholesaler/CatalogCreatorFlow';
import UserSettings from './UserSettings';
import NotificationBell from '../components/ui/NotificationBell';

const NAV_ITEMS = [
  { id: 'overview',        label: 'Overview',        icon: LayoutDashboard },
  { id: 'messages',        label: 'Messages',        icon: MessageSquare },
  { id: 'clients',         label: 'My Clients',      icon: Users },
  { id: 'invitations',     label: 'Invitations',     icon: UserPlus },
  { id: 'orders',          label: 'Client Orders',   icon: ShoppingBag },
  { id: 'catalog-builder', label: 'Catalog Builder', icon: Blocks },
  { id: 'settings',        label: 'Settings',        icon: Settings }
];

export default function AccountManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path
  const currentPath = location.pathname.split('/').pop();
  const activeTab = NAV_ITEMS.some(item => item.id === currentPath) ? currentPath : 'overview';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => { if (user) { /* perform logout logic if available */ } window.location.href = '/'; };

  const sidebarNavGroups = [
    {
      label: 'Main Menu',
      items: NAV_ITEMS
    }
  ];

  return (
    <PortalLayout 
      sidebarNavGroups={sidebarNavGroups}
      activeNavId={activeTab}
      onNavigate={(id) => navigate(`/account-manager/${id}`)}
      portalTitle="Manager Portal"
      roleContext="manager"
      pageContext={{
        activeTab: activeTab,
        label: NAV_ITEMS.find(i => i.id === activeTab)?.label || 'Overview'
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
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          
          <Route path="overview" element={
            <AdminTabErrorBoundary tabId="overview">
              <ManagerOverviewTab />
            </AdminTabErrorBoundary>
          } />
          
          <Route path="messages" element={
            <AdminTabErrorBoundary tabId="messages">
              <ManagerMessagesTab />
            </AdminTabErrorBoundary>
          } />
          
          <Route path="clients" element={
            <AdminTabErrorBoundary tabId="clients">
              <ManagerClientsTab />
            </AdminTabErrorBoundary>
          } />

          <Route path="invitations" element={
            <AdminTabErrorBoundary tabId="invitations">
              <ManagerInvitationsTab />
            </AdminTabErrorBoundary>
          } />
          
          <Route path="orders" element={
            <AdminTabErrorBoundary tabId="orders">
              <ManagerOrdersTab />
            </AdminTabErrorBoundary>
          } />
          
          <Route path="catalog-builder" element={
            <AdminTabErrorBoundary tabId="catalog-builder">
              <div style={{ padding: '1.5rem' }}>
                <CatalogCreatorFlow ownerId={user.uid} ownerType="wholesaler" />
              </div>
            </AdminTabErrorBoundary>
          } />
          
          <Route path="settings" element={
            <AdminTabErrorBoundary tabId="settings">
              <UserSettings />
            </AdminTabErrorBoundary>
          } />
        </Routes>
      </div>
    </PortalLayout>
  );
}
