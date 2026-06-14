import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../templates/AdminDashboard';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

// ── All tab components are lazy-loaded for optimal code splitting ──────────────
import DocumentUploadModule from '../components/admin/DocumentUploadModule';
import AdminLeadsTab from '../components/admin/AdminLeadsTab';
import UserProfileTab from '../components/shared/UserProfileTab';

// ── Lazy tab components ────────────────────────────────────────────────────────
const CalendarPage = lazy(() => import('../components/calendar/CalendarPage'));
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminPhysiciansTab from '../components/admin/physicians/AdminPhysiciansTab';
import AdminPatientsTab from '../components/admin/AdminPatientsTab';
import AtlasCommandCenter from '../components/admin/AtlasCommandCenter';
import AdminWholesellersTab from '../components/admin/AdminWholesellersTab';
import AdminAccountManagersTab from '../components/admin/AdminAccountManagersTab';
const CatalogIntelligenceHub = lazy(() => import('../components/admin/catalog/CatalogIntelligenceHub'));
import AdminCompetitorsTab from '../components/admin/AdminCompetitorsTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import AdminInvitationsTab from '../components/admin/AdminInvitationsTab';
import AdminCostsTab from '../components/admin/AdminCostsTab';
import AdminRelationshipsTab from '../components/admin/AdminRelationshipsTab';
import AdminSemanticTab from '../components/admin/AdminSemanticTab';
import AdminPricesTab from '../components/admin/AdminPricesTab';
import AdminViewsConfigTab from '../components/admin/AdminViewsConfigTab';
import PricingVisibilityTab from '../components/admin/visibility/PricingVisibilityTab';
import AdminVariantsTab from '../components/admin/AdminVariantsTab';
const AdminProtocolsTab = lazy(() => import('../components/admin/AdminProtocolsTab'));
import AdminProtocolView from '../components/admin/AdminProtocolView';
const AdminProtocolEdit = lazy(() => import('../components/admin/AdminProtocolEdit'));
const AdminMetricsDashboard = lazy(() => import('../components/admin/AdminMetricsDashboard'));
import OrdersTab from '../components/admin/OrdersTab';
import AdminAccessLevelsTab from '../components/admin/AdminAccessLevelsTab';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminClinicalLogsTab from '../components/admin/AdminClinicalLogsTab';
import AdminHomeLayoutTab from '../components/admin/AdminHomeLayoutTab';
import AdminPlaceholderTab from '../components/admin/AdminPlaceholderTab';
import AdminClinicsTab from '../components/admin/AdminClinicsTab';
import AdminAIAgentsTab from '../components/admin/AdminAIAgentsTab';
import AdminDeployHostingTab from '../components/admin/AdminDeployHostingTab';
import AdminStorageTab from '../components/admin/AdminStorageTab';
import AdminAIToolsTab from '../components/admin/AdminAIToolsTab';
import AdminSkuMappingTab from '../components/admin/SkuMappingTab/AdminSkuMappingTab';
import AdminZohoCRMWidget from '../components/admin/gadgets/AdminZohoCRMWidget';
import AdminBulkOrdersTab from '../components/admin/AdminBulkOrdersTab';
import AdminFinanceWidget from '../components/admin/gadgets/AdminFinanceWidget';
import AdminEmailTemplatesTab from '../components/admin/AdminEmailTemplatesTab';
import AdminProductSyncWidget from '../components/admin/gadgets/AdminProductSyncWidget';
import AdminGadgetRepositoryTab from '../components/admin/AdminGadgetRepositoryTab';
const CatalogList = lazy(() => import('../components/wholesaler/CatalogList'));
const CatalogCreatorFlow = lazy(() => import('../components/wholesaler/CatalogCreatorFlow'));
const EmailCampaignBuilder = lazy(() => import('../components/wholesaler/EmailCampaignBuilder'));
import AdminAgencyDealsTab from '../components/admin/AdminAgencyDealsTab';
import AdminLogisticsTab from '../components/admin/AdminLogisticsTab';
import AdminPaymentsMadeTab from '../components/admin/AdminPaymentsMadeTab';
import AdminPaymentsReceivedTab from '../components/admin/AdminPaymentsReceivedTab';
import AdminFinanceTab from '../components/admin/AdminFinanceTab';
import AdminApprovalsTab from '../components/admin/AdminApprovalsTab';
import CouponsManager from '../components/marketing/CouponsManager';
import ReferralTracking from '../components/marketing/ReferralTracking';
import CoBranding from '../components/marketing/CoBranding';
import DripMarketing from '../components/marketing/DripMarketing';
const MessagingWidget = lazy(() => import('../components/messaging/MessagingWidget'));
import AdminCatalogEnrichmentTab from '../components/admin/AdminCatalogEnrichmentTab';
import AdminRFQTab from '../components/admin/AdminRFQTab';
const PurchaseRFQList = lazy(() => import('../pages/Purchase/RFQList'));
const PurchasePOList = lazy(() => import('../pages/Purchase/POList'));
const PurchaseBillList = lazy(() => import('../pages/Purchase/BillList'));
import ImportPriceListsTab from '../components/admin/imports/ImportPriceListsTab';
import ImportCoATab from '../components/admin/imports/ImportCoATab';
import ImportCatalogsTab from '../components/admin/imports/ImportCatalogsTab';
import ImportRFQTab from '../components/admin/imports/ImportRFQTab';
import AdminPrescriptionIntakeTab from '../components/admin/AdminPrescriptionIntakeTab';
import ShippingTrackerTab from '../components/supplier/ShippingTrackerTab';
import AdminMarketingTab from '../components/admin/AdminMarketingTab';
const B2BQuotationsHub = lazy(() => import('../features/quotations/B2BQuotationsHub'));
const SalesOrdersHub = lazy(() => import('../features/sales-orders/SalesOrdersHub'));
const InvoiceIntelligenceHub = lazy(() => import('../features/invoices/InvoiceIntelligenceHub'));
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
        <Route path="clinics" element={<AdminTabErrorBoundary tabId="clinics" tabLabel="Clinics"><AdminClinicsTab /></AdminTabErrorBoundary>} />
        <Route path="doctors" element={<AdminTabErrorBoundary tabId="doctors" tabLabel="Doctors"><AdminPhysiciansTab /></AdminTabErrorBoundary>} />
        <Route path="patients" element={<AdminTabErrorBoundary tabId="patients" tabLabel="Patients"><AdminPatientsTab /></AdminTabErrorBoundary>} />
        <Route path="rfq" element={<AdminTabErrorBoundary tabId="rfq" tabLabel="RFQ"><AdminRFQTab /></AdminTabErrorBoundary>} />
        <Route path="approvals" element={<AdminTabErrorBoundary tabId="approvals" tabLabel="Approvals"><AdminApprovalsTab /></AdminTabErrorBoundary>} />
        <Route path="users" element={<AdminTabErrorBoundary tabId="users" tabLabel="Users"><AdminUsersTab readOnly={false} canApprove={true} /></AdminTabErrorBoundary>} />
        <Route path="products" element={<AdminTabErrorBoundary tabId="products" tabLabel="Products"><CatalogIntelligenceHub readOnly={false} hideCosts={false} allowedCategories={['All']} /></AdminTabErrorBoundary>} />
        <Route path="competitors" element={<AdminTabErrorBoundary tabId="competitors" tabLabel="Competitor Analysis"><AdminCompetitorsTab /></AdminTabErrorBoundary>} />
        <Route path="costs" element={<AdminTabErrorBoundary tabId="costs" tabLabel="Costs"><AdminCostsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="prices" element={<AdminTabErrorBoundary tabId="prices" tabLabel="Prices"><AdminPricesTab /></AdminTabErrorBoundary>} />
        <Route path="relationships" element={<AdminTabErrorBoundary tabId="relationships" tabLabel="Relationships"><AdminRelationshipsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="semantic" element={<AdminTabErrorBoundary tabId="semantic" tabLabel="Semantic"><AdminSemanticTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="settings" element={<AdminTabErrorBoundary tabId="settings" tabLabel="Settings"><AdminSettingsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="invitations" element={<AdminTabErrorBoundary tabId="invitations" tabLabel="Invitations"><AdminInvitationsTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="views" element={<AdminTabErrorBoundary tabId="views" tabLabel="Views"><AdminViewsConfigTab /></AdminTabErrorBoundary>} />
        <Route path="orders" element={<AdminTabErrorBoundary tabId="orders" tabLabel="B2C Orders"><OrdersTab readOnly={false} /></AdminTabErrorBoundary>} />
        <Route path="quotations" element={<AdminTabErrorBoundary tabId="quotations" tabLabel="Quotations (B2B)"><B2BQuotationsHub /></AdminTabErrorBoundary>} />
        <Route path="sales-orders" element={<AdminTabErrorBoundary tabId="sales-orders" tabLabel="Sales Orders (B2B)"><SalesOrdersHub /></AdminTabErrorBoundary>} />
        <Route path="invoices" element={<AdminTabErrorBoundary tabId="invoices" tabLabel="Invoices (B2B)"><InvoiceIntelligenceHub /></AdminTabErrorBoundary>} />
        <Route path="stock" element={<AdminTabErrorBoundary tabId="stock" tabLabel="Stock & Inventory"><AdminVariantsTab /></AdminTabErrorBoundary>} />
        <Route path="bulk-orders" element={<AdminTabErrorBoundary tabId="bulk-orders" tabLabel="Bulk Orders"><AdminBulkOrdersTab /></AdminTabErrorBoundary>} />
        <Route path="access-levels" element={<AdminTabErrorBoundary tabId="access-levels" tabLabel="Access Levels"><AdminAccessLevelsTab /></AdminTabErrorBoundary>} />
        <Route path="purchase-rfqs" element={<AdminTabErrorBoundary tabId="purchase-rfqs" tabLabel="Requests for Quotation"><PurchaseRFQList /></AdminTabErrorBoundary>} />
        <Route path="purchase-orders" element={<AdminTabErrorBoundary tabId="purchase-orders" tabLabel="Purchase Orders"><PurchasePOList /></AdminTabErrorBoundary>} />
        <Route path="purchase-bills" element={<AdminTabErrorBoundary tabId="purchase-bills" tabLabel="Supplier Bills"><PurchaseBillList /></AdminTabErrorBoundary>} />
        <Route path="clinical-ai" element={<AdminTabErrorBoundary tabId="clinical-ai" tabLabel="Clinical AI"><ClinicalAIWidget /></AdminTabErrorBoundary>} />
        <Route path="prescription-agent" element={<AdminTabErrorBoundary tabId="prescription-agent" tabLabel="Prescription Agent"><AdminPlaceholderTab title="Prescription Agent" description="Manage logic for AI prescription recommendations." tags={['AI', 'Medical']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="analytics" element={<AdminTabErrorBoundary tabId="analytics" tabLabel="Analytics"><AdminAnalyticsTab /></AdminTabErrorBoundary>} />
        <Route path="ai-logs" element={<AdminTabErrorBoundary tabId="ai-logs" tabLabel="AI Logs"><AdminClinicalLogsTab /></AdminTabErrorBoundary>} />
        <Route path="command-center" element={<AdminTabErrorBoundary tabId="command-center" tabLabel="Command Center"><AtlasCommandCenter /></AdminTabErrorBoundary>} />
        <Route path="territory-rules" element={<AdminTabErrorBoundary tabId="territory-rules" tabLabel="Territory Rules"><AdminPlaceholderTab title="Territory Rules" description="Configure exclusivity rules and protected categories." tags={['Rules', 'Protection']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        <Route path="co-branding" element={<AdminTabErrorBoundary tabId="co-branding" tabLabel="Co-Branding"><CoBranding ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="coupons" element={<AdminTabErrorBoundary tabId="coupons" tabLabel="Coupons"><CouponsManager ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="referrals" element={<AdminTabErrorBoundary tabId="referrals" tabLabel="Referrals"><ReferralTracking ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="drip-marketing" element={<AdminTabErrorBoundary tabId="drip-marketing" tabLabel="Drip Marketing"><DripMarketing ownerId="admin" ownerType="admin" /></AdminTabErrorBoundary>} />
        <Route path="payments-made" element={<AdminTabErrorBoundary tabId="payments-made" tabLabel="Payments Made"><AdminPaymentsMadeTab /></AdminTabErrorBoundary>} />
        <Route path="payments-received" element={<AdminTabErrorBoundary tabId="payments-received" tabLabel="Payments Received"><AdminPaymentsReceivedTab /></AdminTabErrorBoundary>} />
        <Route path="pricing-visibility" element={<AdminTabErrorBoundary tabId="pricing-visibility" tabLabel="Pricing Visibility"><PricingVisibilityTab /></AdminTabErrorBoundary>} />
        <Route path="leads" element={<AdminTabErrorBoundary tabId="leads" tabLabel="Leads"><AdminLeadsTab /></AdminTabErrorBoundary>} />
        <Route path="marketing" element={<AdminTabErrorBoundary tabId="marketing" tabLabel="Marketing & Content"><AdminMarketingTab /></AdminTabErrorBoundary>} />
        <Route path="messages" element={<AdminTabErrorBoundary tabId="messages" tabLabel="Messages"><MessagingWidget role="admin" ownerId="admin" /></AdminTabErrorBoundary>} />
        <Route path="home-layout" element={<AdminTabErrorBoundary tabId="home-layout" tabLabel="Home Layout"><AdminHomeLayoutTab /></AdminTabErrorBoundary>} />
        
        {/* Protocols Routing */}
        <Route path="protocols" element={<AdminTabErrorBoundary tabId="protocols" tabLabel="Protocols"><AdminProtocolsTab /></AdminTabErrorBoundary>} />
        <Route path="protocols/new/edit" element={<AdminTabErrorBoundary tabId="protocols-new" tabLabel="New Protocol"><AdminProtocolEdit /></AdminTabErrorBoundary>} />
        <Route path="protocols/:id" element={<AdminTabErrorBoundary tabId="protocol-view" tabLabel="Protocol Details"><AdminProtocolView /></AdminTabErrorBoundary>} />
        <Route path="protocols/:id/edit" element={<AdminTabErrorBoundary tabId="protocol-edit" tabLabel="Edit Protocol"><AdminProtocolEdit /></AdminTabErrorBoundary>} />

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
        <Route path="shipping" element={<AdminTabErrorBoundary tabId="shipping" tabLabel="Admin Logistics"><AdminLogisticsTab /></AdminTabErrorBoundary>} />
        <Route path="finance-overview" element={<AdminTabErrorBoundary tabId="finance-overview" tabLabel="Overview & Projections"><AdminFinanceTab activeSubTab="overview" /></AdminTabErrorBoundary>} />
        <Route path="finance-budget" element={<AdminTabErrorBoundary tabId="finance-budget" tabLabel="Budgets & Variances"><AdminFinanceTab activeSubTab="budget" /></AdminTabErrorBoundary>} />
        <Route path="finance-payables" element={<AdminTabErrorBoundary tabId="finance-payables" tabLabel="Payables & Payouts"><AdminFinanceTab activeSubTab="payables" /></AdminTabErrorBoundary>} />
        <Route path="finance-approvals" element={<AdminTabErrorBoundary tabId="finance-approvals" tabLabel="Control & Approvals"><AdminFinanceTab activeSubTab="approvals" /></AdminTabErrorBoundary>} />
        <Route path="finance-economics" element={<AdminTabErrorBoundary tabId="finance-economics" tabLabel="Unit Economics"><AdminFinanceTab activeSubTab="economics" /></AdminTabErrorBoundary>} />
        <Route path="finance-reporting" element={<AdminTabErrorBoundary tabId="finance-reporting" tabLabel="Reporting & Data Room"><AdminFinanceTab activeSubTab="reporting" /></AdminTabErrorBoundary>} />
        <Route path="my-profile" element={<AdminTabErrorBoundary tabId="my-profile" tabLabel="My Profile"><UserProfileTab /></AdminTabErrorBoundary>} />
        
        {/* Import Data Routes */}
        <Route path="import-catalogs" element={<AdminTabErrorBoundary tabId="import-catalogs" tabLabel="Import Catalogs"><ImportCatalogsTab /></AdminTabErrorBoundary>} />
        <Route path="import-prices" element={<AdminTabErrorBoundary tabId="import-prices" tabLabel="Import Prices"><ImportPriceListsTab /></AdminTabErrorBoundary>} />
        <Route path="import-coa" element={<AdminTabErrorBoundary tabId="import-coa" tabLabel="Import CoAs"><ImportCoATab /></AdminTabErrorBoundary>} />
        <Route path="import-rfq" element={<AdminTabErrorBoundary tabId="import-rfq" tabLabel="Import RFQ"><ImportRFQTab /></AdminTabErrorBoundary>} />
        <Route path="import-prescriptions" element={<AdminTabErrorBoundary tabId="import-prescriptions" tabLabel="Import Prescriptions"><AdminPrescriptionIntakeTab /></AdminTabErrorBoundary>} />
        <Route path="import-bloodworks" element={<AdminTabErrorBoundary tabId="import-bloodworks" tabLabel="Import Bloodworks"><AdminPlaceholderTab title="Import Bloodworks" description="Upload lab results and blood panels." tags={['Labs', 'Imports']} color="var(--color-primary)" /></AdminTabErrorBoundary>} />
        
        
      </Route>
      <Route path="price-drafts" element={<AdminTabErrorBoundary tabId="price-drafts" tabLabel="Price Drafts"><AdminPricesTab /></AdminTabErrorBoundary>} />
    </Routes>
    </Suspense>
  );
}
