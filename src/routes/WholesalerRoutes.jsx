import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import WholesalerHome, {
  WholesalerOverviewTab,
  WholesalerRxInboxTab,
  WholesalerBulkTab,
  PlaceholderTab
} from '../templates/WholesalerHome';

const AdminMetricsDashboard = React.lazy(() => import('../components/admin/AdminMetricsDashboard'));
const GeographyAreasTab = React.lazy(() => import('../components/wholesaler/GeographyAreasTab'));
const BrandingTab = React.lazy(() => import('../components/wholesaler/BrandingTab'));
const DomainsTab = React.lazy(() => import('../components/wholesaler/DomainsTab'));
const ClientsTab = React.lazy(() => import('../components/wholesaler/ClientsTab'));
const CatalogList = React.lazy(() => import('../components/wholesaler/CatalogList'));
const CatalogCreatorFlow = React.lazy(() => import('../components/wholesaler/CatalogCreatorFlow'));
const EmailCampaignBuilder = React.lazy(() => import('../components/wholesaler/EmailCampaignBuilder'));

export default function WholesalerRoutes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  return (
    <Routes>
      <Route element={<WholesalerHome />}>
        <Route index element={
          <AdminTabErrorBoundary tabId="overview" tabLabel="Overview">
            <WholesalerOverviewTab uid={uid} onNavigate={(id) => navigate(`/wholesaler/${id === 'overview' ? '' : id}`)} />
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
            <PlaceholderTab title="Account Settings" description="Company details, contacts, and B2B preferences." />
          </AdminTabErrorBoundary>
        } />
      </Route>
    </Routes>
  );
}
