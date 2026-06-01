import React, { useState, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../templates/AdminDashboard';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

// ── All tab components are lazy-loaded for optimal code splitting ──────────────
const DocumentUploadModule = React.lazy(() => import('../components/admin/DocumentUploadModule'));
const AdminLeadsTab = React.lazy(() => import('../components/admin/AdminLeadsTab'));
const UserProfileTab = React.lazy(() => import('../components/shared/UserProfileTab'));

// ── Lazy tab components ────────────────────────────────────────────────────────
const CalendarPage = React.lazy(() => import('../components/calendar/CalendarPage'));
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
const AdminDeployHostingTab= React.lazy(() => import('../components/admin/AdminDeployHostingTab'));
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
const CouponsManager = React.lazy(() => import('../components/marketing/CouponsManager'));
const ReferralTracking = React.lazy(() => import('../components/marketing/ReferralTracking'));
const CoBranding = React.lazy(() => import('../components/marketing/CoBranding'));
const DripMarketing = React.lazy(() => import('../components/marketing/DripMarketing'));
const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const AdminCatalogEnrichmentTab = React.lazy(() => import('../components/admin/AdminCatalogEnrichmentTab'));
const AdminAgencyDealsTab = React.lazy(() => import('../components/admin/AdminAgencyDealsTab'));
const AdminRFQTab = React.lazy(() => import('../components/admin/AdminRFQTab'));
const ImportPriceListsTab = React.lazy(() => import('../components/admin/imports/ImportPriceListsTab'));
const ImportCoATab = React.lazy(() => import('../components/admin/imports/ImportCoATab'));
const ImportCatalogsTab = React.lazy(() => import('../components/admin/imports/ImportCatalogsTab'));
const ImportRFQTab = React.lazy(() => import('../components/admin/imports/ImportRFQTab'));
const ShippingTrackerTab = React.lazy(() => import('../components/supplier/ShippingTrackerTab'));
// ── Premium loading skeleton for lazy-loaded admin tabs ────────────────────────
const AdminTabSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div className="skeleton" style={{ height: 32, width: 220, marginBottom: '1.5rem' }} />
    <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: '1rem' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
      <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
    </div>
    <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
  </div>
);

export default function AdminRoutes() {
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  return (
    <Suspense fallback={<AdminTabSkeleton />}>
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
        <Route path="rfq" element={<AdminTabErrorBoundary tabId="rfq" tabLabel="RFQ"><AdminRFQTab /></AdminTabErrorBoundary>} />
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
        <Route path="stock" element={<AdminTabErrorBoundary tabId="stock" tabLabel="Stock & Inventory"><AdminVariantsTab /></AdminTabErrorBoundary>} />
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
        <Route path="messages" element={<AdminTabErrorBoundary tabId="messages" tabLabel="Messages"><MessagingWidget role="admin" ownerId="admin" /></AdminTabErrorBoundary>} />
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
        <Route path="deploy" element={<AdminTabErrorBoundary tabId="deploy" tabLabel="Deploy"><AdminDeployHostingTab /></AdminTabErrorBoundary>} />
        <Route path="calendar" element={<AdminTabErrorBoundary tabId="calendar" tabLabel="Calendar"><CalendarPage /></AdminTabErrorBoundary>} />
        <Route path="uploads" element={<AdminTabErrorBoundary tabId="uploads" tabLabel="Uploads"><DocumentUploadModule /></AdminTabErrorBoundary>} />
        <Route path="ai-agents" element={<AdminTabErrorBoundary tabId="ai-agents" tabLabel="AI Agents"><AdminAIAgentsTab /></AdminTabErrorBoundary>} />
        <Route path="enrichment" element={<AdminTabErrorBoundary tabId="enrichment" tabLabel="Enrichment"><AdminCatalogEnrichmentTab /></AdminTabErrorBoundary>} />
        <Route path="agency-deals" element={<AdminTabErrorBoundary tabId="agency-deals" tabLabel="Agency Deals"><AdminAgencyDealsTab /></AdminTabErrorBoundary>} />
        <Route path="shipping" element={<AdminTabErrorBoundary tabId="shipping" tabLabel="Shipping Tracker"><ShippingTrackerTab /></AdminTabErrorBoundary>} />
        <Route path="finance" element={<AdminTabErrorBoundary tabId="finance" tabLabel="Financial Dashboard"><AdminFinanceTab /></AdminTabErrorBoundary>} />
        <Route path="my-profile" element={<AdminTabErrorBoundary tabId="my-profile" tabLabel="My Profile"><UserProfileTab /></AdminTabErrorBoundary>} />
        
        {/* Import Data Routes */}
        <Route path="import-catalogs" element={<AdminTabErrorBoundary tabId="import-catalogs" tabLabel="Import Catalogs"><ImportCatalogsTab /></AdminTabErrorBoundary>} />
        <Route path="import-prices" element={<AdminTabErrorBoundary tabId="import-prices" tabLabel="Import Prices"><ImportPriceListsTab /></AdminTabErrorBoundary>} />
        <Route path="import-coa" element={<AdminTabErrorBoundary tabId="import-coa" tabLabel="Import CoAs"><ImportCoATab /></AdminTabErrorBoundary>} />
        <Route path="import-rfq" element={<AdminTabErrorBoundary tabId="import-rfq" tabLabel="Import RFQ"><ImportRFQTab /></AdminTabErrorBoundary>} />
        <Route path="import-prescriptions" element={<AdminTabErrorBoundary tabId="import-prescriptions" tabLabel="Import Prescriptions"><AdminPlaceholderTab title="Import Prescriptions" description="Upload patient prescriptions and doctor notes." tags={['Medical', 'Imports']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="import-bloodworks" element={<AdminTabErrorBoundary tabId="import-bloodworks" tabLabel="Import Bloodworks"><AdminPlaceholderTab title="Import Bloodworks" description="Upload lab results and blood panels." tags={['Labs', 'Imports']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        
        
      </Route>
      <Route path="price-drafts" element={<AdminTabErrorBoundary tabId="price-drafts" tabLabel="Price Drafts"><AdminPricesTab /></AdminTabErrorBoundary>} />
    </Routes>
    </Suspense>
  );
}
