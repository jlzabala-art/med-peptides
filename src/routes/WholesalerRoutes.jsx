import React, { useState, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import WholesalerHome, {
  WholesalerOverviewTab,
  WholesalerRxInboxTab,
  WholesalerBulkTab,
  PlaceholderTab
} from '../templates/WholesalerHome';
import DashboardEngine from '../engine/DashboardEngine';
import UserSettings from '../templates/UserSettings';

// ── Premium loading skeleton ──────────────────────────────────────────────────
const TabSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem' }} />
    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem' }} />
    <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
  </div>
);

import AdminMetricsDashboard from '../components/admin/AdminMetricsDashboard';
import MessagingWidget from '../components/messaging/MessagingWidget';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
import GeographyAreasTab from '../components/wholesaler/GeographyAreasTab';
import BrandingTab from '../components/wholesaler/BrandingTab';
import DomainsTab from '../components/wholesaler/DomainsTab';
import ClientsTab from '../components/wholesaler/ClientsTab';
import CatalogList from '../components/wholesaler/CatalogList';
import CatalogCreatorFlow from '../components/wholesaler/CatalogCreatorFlow';
import EmailCampaignBuilder from '../components/wholesaler/EmailCampaignBuilder';

export default function WholesalerRoutes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  return (
    <Suspense fallback={<TabSkeleton />}>
    <Routes>
      <Route element={<WholesalerHome />}>
        <Route index element={
          <AdminTabErrorBoundary tabId="overview" tabLabel="Overview">
            <DashboardEngine role="wholesaler" dataContext={{ uid }} />
          </AdminTabErrorBoundary>
        } />
        <Route path="rx-inbox" element={
          <AdminTabErrorBoundary tabId="rx-inbox" tabLabel="Rx Inbox">
            <WholesalerRxInboxTab uid={uid} />
          </AdminTabErrorBoundary>
        } />
        <Route path="bulk-orders" element={
          <AdminTabErrorBoundary tabId="bulk-orders" tabLabel="Bulk Orders">
            <WholesalerBulkTab />
          </AdminTabErrorBoundary>
        } />
        <Route path="messages" element={
          <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
            <MessagingWidget />
          </AdminTabErrorBoundary>
        } />
        <Route path="clinical-ai" element={
          <AdminTabErrorBoundary tabId="clinical-ai" tabLabel="Atlas Health">
            <ClinicalAIWidget />
          </AdminTabErrorBoundary>
        } />
        <Route path="geography" element={
          <AdminTabErrorBoundary tabId="geography" tabLabel="Geography">
            <GeographyAreasTab />
          </AdminTabErrorBoundary>
        } />
        <Route path="branding" element={
          <AdminTabErrorBoundary tabId="branding" tabLabel="Branding">
            <BrandingTab />
          </AdminTabErrorBoundary>
        } />
        <Route path="domains" element={
          <AdminTabErrorBoundary tabId="domains" tabLabel="Domains">
            <DomainsTab />
          </AdminTabErrorBoundary>
        } />
        <Route path="clients" element={
          <AdminTabErrorBoundary tabId="clients" tabLabel="Clients">
            <ClientsTab />
          </AdminTabErrorBoundary>
        } />
        <Route path="catalogs" element={
          <AdminTabErrorBoundary tabId="catalogs" tabLabel="Catalogs">
            <CatalogList 
              ownerId={uid} 
              ownerType="wholesaler" 
              onOpenBuilder={() => { setCatalogToEdit(null); navigate('/wholesaler/catalog-builder'); }} 
              onSelectCatalogToEdit={(cat) => { setCatalogToEdit(cat); navigate('/wholesaler/catalog-builder'); }} 
            />
          </AdminTabErrorBoundary>
        } />
        <Route path="catalog-builder" element={
          <AdminTabErrorBoundary tabId="catalog-builder" tabLabel="Catalog Builder">
            <CatalogCreatorFlow 
              ownerId={uid} 
              ownerType="wholesaler" 
              editingCatalog={catalogToEdit} 
              onBack={() => { setCatalogToEdit(null); navigate('/wholesaler/catalogs'); }} 
            />
          </AdminTabErrorBoundary>
        } />
        <Route path="email-campaigns" element={
          <AdminTabErrorBoundary tabId="email-campaigns" tabLabel="Email Campaigns">
            <EmailCampaignBuilder 
              ownerId={uid} 
              ownerType="wholesaler" 
              onBack={() => navigate('/wholesaler/catalogs')} 
            />
          </AdminTabErrorBoundary>
        } />
        <Route path="inventory" element={
          <AdminTabErrorBoundary tabId="inventory" tabLabel="Inventory">
            <PlaceholderTab title="Inventory Manager" description="Real-time stock view, batch expiry tracking, and restock alerts — coming soon." />
          </AdminTabErrorBoundary>
        } />
        <Route path="settings" element={
          <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
            <UserSettings onBack={() => navigate('/wholesaler')} />
          </AdminTabErrorBoundary>
        } />
      </Route>
    </Routes>
    </Suspense>
  );
}
