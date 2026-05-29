import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../templates/AdminDashboard';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import AdminLeadsTab from '../components/admin/AdminLeadsTab';

// ── Lazy tab components ────────────────────────────────────────────────────────
const AdminUsersTab        = React.lazy(() => import('../components/admin/AdminUsersTab'));
const AdminWholesellersTab = React.lazy(() => import('../components/admin/AdminWholesellersTab'));
const AdminAccountManagersTab = React.lazy(() => import('../components/admin/AdminAccountManagersTab'));
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
const ClinicalAIWidget   = React.lazy(() => import('../components/admin/ClinicalAIWidget'));
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
const AdminGadgetRepositoryTab = React.lazy(() => import('../components/admin/AdminGadgetRepositoryTab'));
const CatalogList = React.lazy(() => import('../components/wholesaler/CatalogList'));
const CatalogCreatorFlow = React.lazy(() => import('../components/wholesaler/CatalogCreatorFlow'));
const EmailCampaignBuilder = React.lazy(() => import('../components/wholesaler/EmailCampaignBuilder'));
const CouponsManager = React.lazy(() => import('../components/marketing/CouponsManager'));
const ReferralTracking = React.lazy(() => import('../components/marketing/ReferralTracking'));
const CoBranding = React.lazy(() => import('../components/marketing/CoBranding'));
const DripMarketing = React.lazy(() => import('../components/marketing/DripMarketing'));
const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));

export default function AdminRoutes() {
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  return (
    <Routes>
      <Route element={<AdminDashboard />}>
        <Route index element={
          <AdminTabErrorBoundary tabId="dashboard" tabLabel="Dashboard">
            <AdminMetricsDashboard />
          </AdminTabErrorBoundary>
        } />
        <Route path="wholesellers" element={<AdminTabErrorBoundary tabId="wholesellers" tabLabel="Wholesellers"><AdminWholesellersTab /></AdminTabErrorBoundary>} />
        <Route path="account-managers" element={<AdminTabErrorBoundary tabId="account-managers" tabLabel="Account Managers"><AdminAccountManagersTab /></AdminTabErrorBoundary>} />
        <Route path="clinics" element={<AdminTabErrorBoundary tabId="clinics" tabLabel="Clinics"><AdminPlaceholderTab title="Clinics" description="Manage physical clinic locations and metadata." tags={['Network', 'Clinics']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="doctors" element={<AdminTabErrorBoundary tabId="doctors" tabLabel="Doctors"><AdminUsersTab defaultRole="doctor" readOnly={false} canApprove={true} /></AdminTabErrorBoundary>} />
        <Route path="patients" element={<AdminTabErrorBoundary tabId="patients" tabLabel="Patients"><AdminUsersTab defaultRole="patient" readOnly={false} canApprove={true} /></AdminTabErrorBoundary>} />
        <Route path="users" element={<AdminTabErrorBoundary tabId="users" tabLabel="Users"><AdminUsersTab readOnly={false} canApprove={true} /></AdminTabErrorBoundary>} />
        <Route path="products" element={<AdminTabErrorBoundary tabId="products" tabLabel="Products"><AdminProductsTab readOnly={false} hideCosts={false} allowedCategories={['All']} /></AdminTabErrorBoundary>} />
        <Route path="costs" element={<AdminTabErrorBoundary tabId="costs" tabLabel="Costs"><AdminCostsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="prices" element={<AdminTabErrorBoundary tabId="prices" tabLabel="Prices"><AdminPricesTab /></AdminTabErrorBoundary>} />
        <Route path="relationships" element={<AdminTabErrorBoundary tabId="relationships" tabLabel="Relationships"><AdminRelationshipsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="semantic" element={<AdminTabErrorBoundary tabId="semantic" tabLabel="Semantic"><AdminSemanticTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="settings" element={<AdminTabErrorBoundary tabId="settings" tabLabel="Settings"><AdminSettingsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="invitations" element={<AdminTabErrorBoundary tabId="invitations" tabLabel="Invitations"><AdminInvitationsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="views" element={<AdminTabErrorBoundary tabId="views" tabLabel="Views"><AdminViewsConfigTab /></AdminTabErrorBoundary>} />
        <Route path="orders" element={<AdminTabErrorBoundary tabId="orders" tabLabel="Orders"><OrdersTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="bulk-orders" element={<AdminTabErrorBoundary tabId="bulk-orders" tabLabel="Bulk Orders"><AdminBulkOrdersTab /></AdminTabErrorBoundary>} />
        <Route path="access-levels" element={<AdminTabErrorBoundary tabId="access-levels" tabLabel="Access Levels"><AdminAccessLevelsTab /></AdminTabErrorBoundary>} />
        <Route path="clinical-ai" element={<AdminTabErrorBoundary tabId="clinical-ai" tabLabel="Clinical AI"><ClinicalAIWidget /></AdminTabErrorBoundary>} />
        <Route path="prescription-agent" element={<AdminTabErrorBoundary tabId="prescription-agent" tabLabel="Prescription Agent"><AdminPlaceholderTab title="Prescription Agent" description="Manage logic for AI prescription recommendations." tags={['AI', 'Medical']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="analytics" element={<AdminTabErrorBoundary tabId="analytics" tabLabel="Analytics"><AdminAnalyticsTab /></AdminTabErrorBoundary>} />
        <Route path="ai-logs" element={<AdminTabErrorBoundary tabId="ai-logs" tabLabel="AI Logs"><AdminClinicalLogsTab /></AdminTabErrorBoundary>} />
        <Route path="geography-areas" element={<AdminTabErrorBoundary tabId="geography-areas" tabLabel="Geography Areas"><AdminPlaceholderTab title="Geography Areas" description="Manage international deployment areas and borders." tags={['Regions', 'Geography']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="territory-rules" element={<AdminTabErrorBoundary tabId="territory-rules" tabLabel="Territory Rules"><AdminPlaceholderTab title="Territory Rules" description="Configure exclusivity rules and protected categories." tags={['Rules', 'Protection']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="co-branding" element={<AdminTabErrorBoundary tabId="co-branding" tabLabel="Co-Branding"><CoBranding ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="coupons" element={<AdminTabErrorBoundary tabId="coupons" tabLabel="Coupons"><CouponsManager ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="referrals" element={<AdminTabErrorBoundary tabId="referrals" tabLabel="Referrals"><ReferralTracking ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="drip-marketing" element={<AdminTabErrorBoundary tabId="drip-marketing" tabLabel="Drip Marketing"><DripMarketing ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="pricing-visibility" element={<AdminTabErrorBoundary tabId="pricing-visibility" tabLabel="Pricing Visibility"><AdminPlaceholderTab title="Pricing Visibility" description="Configure regional pricing walls and product visibility." tags={['Pricing', 'Access']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="leads" element={<AdminTabErrorBoundary tabId="leads" tabLabel="Leads"><AdminLeadsTab /></AdminTabErrorBoundary>} />
        <Route path="messages" element={<AdminTabErrorBoundary tabId="messages" tabLabel="Mensajes"><MessagingWidget role="admin" ownerId="admin" /></AdminTabErrorBoundary>} />
        <Route path="home-layout" element={<AdminTabErrorBoundary tabId="home-layout" tabLabel="Home Layout"><AdminHomeLayoutTab /></AdminTabErrorBoundary>} />
        <Route path="protocols" element={<AdminTabErrorBoundary tabId="protocols" tabLabel="Protocols"><AdminProtocolsTab /></AdminTabErrorBoundary>} />
        <Route path="blueprints" element={<AdminTabErrorBoundary tabId="blueprints" tabLabel="Blueprints"><AdminBlueprintsTab /></AdminTabErrorBoundary>} />
        <Route path="variants" element={<AdminTabErrorBoundary tabId="variants" tabLabel="Variants"><AdminVariantsTab /></AdminTabErrorBoundary>} />
        <Route path="catalogs" element={
          <AdminTabErrorBoundary tabId="catalogs" tabLabel="Catalogs">
            <CatalogList 
              ownerId="admin" 
              ownerType="admin" 
              onOpenBuilder={() => { setCatalogToEdit(null); window.history.pushState(null, '', '/admin/catalog-builder'); window.dispatchEvent(new PopStateEvent('popstate')); }} 
              onSelectCatalogToEdit={(cat) => { setCatalogToEdit(cat); window.history.pushState(null, '', '/admin/catalog-builder'); window.dispatchEvent(new PopStateEvent('popstate')); }} 
            />
          </AdminTabErrorBoundary>
        } />
        <Route path="catalog-builder" element={
          <AdminTabErrorBoundary tabId="catalog-builder" tabLabel="Catalog Builder">
            <CatalogCreatorFlow 
              ownerId="admin" 
              ownerType="admin" 
              editingCatalog={catalogToEdit} 
              onBack={() => { setCatalogToEdit(null); window.history.pushState(null, '', '/admin/catalogs'); window.dispatchEvent(new PopStateEvent('popstate')); }} 
            />
          </AdminTabErrorBoundary>
        } />
        <Route path="email-campaigns" element={
          <AdminTabErrorBoundary tabId="email-campaigns" tabLabel="Email Campaigns">
            <EmailCampaignBuilder 
              ownerId="admin" 
              ownerType="admin" 
              onBack={() => { window.history.pushState(null, '', '/admin/catalogs'); window.dispatchEvent(new PopStateEvent('popstate')); }} 
            />
          </AdminTabErrorBoundary>
        } />
        <Route path="email-templates" element={<AdminTabErrorBoundary tabId="email-templates" tabLabel="Email Templates"><AdminEmailTemplatesTab /></AdminTabErrorBoundary>} />
        <Route path="gadget-repository" element={<AdminTabErrorBoundary tabId="gadget-repository" tabLabel="Gadget Repository"><AdminGadgetRepositoryTab /></AdminTabErrorBoundary>} />
        <Route path="sku-sync" element={<AdminTabErrorBoundary tabId="sku-sync" tabLabel="SKU Sync"><AdminSkuMappingTab /></AdminTabErrorBoundary>} />
        <Route path="crm-intelligence" element={
          <AdminTabErrorBoundary tabId="crm-intelligence" tabLabel="CRM Intelligence">
            <div style={{ padding: '0.5rem 0' }}>
              <AdminZohoCRMWidget fullHeight={false} />
            </div>
          </AdminTabErrorBoundary>
        } />
        <Route path="deploy" element={<AdminTabErrorBoundary tabId="deploy" tabLabel="Deploy"><AdminPlaceholderTab title="Deploy & Hosting" description="Monitor application deployments, environment variables, hosting status, and trigger builds." features={['GitHub CI/CD triggers', 'Environment variable manager', 'Real-time build log streaming', 'Domain SSL configurations']} tags={['Infrastructure', 'Hosting', 'Cloud']} color="var(--color-primary)" priority="soon" /></AdminTabErrorBoundary>} />
      </Route>
    </Routes>
  );
}
