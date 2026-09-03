import React, { Suspense } from 'react';
export const dynamic = 'force-dynamic';

import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';
import AdminPlaceholderTab from '../../../components/admin/AdminPlaceholderTab';
import { TabSkeleton } from '../../../components/ui';

// ─── Dynamic Server Component Registry ─────────────────────────────────────────
// Using native async import() in a Server Component instead of next/dynamic.
// This supports BOTH async Server Components and Client Components perfectly,
// while still strictly code-splitting so only the active tab's JS is sent to the client.
const getTabComponent = async (tabId) => {
  switch (tabId) {
    // Dashboard
    case 'dashboard':          return (await import('../../../components/admin/AdminMetricsDashboard')).default;
    case 'analytics':          return (await import('../../../components/admin/AdminAnalyticsTab')).default;
    case 'inbox':
    case 'messages':           return (await import('../../../components/admin/AdminMessagesTab')).default;
    case 'calendar':           return (await import('../../../components/calendar/CalendarPage')).default;
    case 'notifications':      return (await import('../../../components/admin/AdminNotificationsTab')).default;

    // Clinical
    case 'patients':           return (await import('../../../components/admin/AdminPatientsTab')).default;
    case 'fagron-import':      return (await import('../../../components/admin/imports/AdminFagronBulkImportTab')).default;

    case 'doctors':
    case 'physicians':         return (await import('../../../components/admin/physicians/AdminPhysiciansTab')).default;
    case 'protocols':          return (await import('../../../components/admin/AdminProtocolsTab')).default;
    case 'prescriptions':      return (await import('../../../components/admin/prescriptions/AdminPrescriptionsTab')).default;
    case 'prescription-intake':return (await import('../../../components/admin/AdminPrescriptionIntakeTab')).default;
    case 'treatments':
    case 'my-treatments':      return (await import('../../../components/admin/AdminProgramsTab')).default;
    case 'appointments':
    case 'lab-reports':        return (await import('../../../components/admin/AdminClinicalLogsTab')).default;
    case 'timeline':           return (await import('../../../components/admin/AdminTimelineTab')).default;
    case 'follow-up':          return (await import('../../../components/admin/AdminSupervisionTab')).default;
    case 'genomics':
    case 'clinical-ai':        return (await import('../../../components/admin/AdminAIToolsTab')).default;
    case 'quality-review':     return (await import('../../../components/admin/AdminApprovalsTab')).default;

    // Catalog
    case 'iv-drips':
    case 'iv-drip-catalog':    return (await import('../../../features/iv-drips/IvDripCatalogPage')).default;
    case 'products':
    case 'catalog':
    case 'catalog-builder':
    case 'alternatives':       return (await import('../../../components/admin/AdminProductsTab')).default;
    case 'pricing-engine':     return (await import('../../../components/admin/AdminPricingEngineTab')).default;
    case 'prices':
    case 'pricing-visibility': return (await import('../../../components/admin/AdminPricesTab')).default;
    case 'competitors':        return (await import('../../../components/admin/AdminCompetitorsTab')).default;
    case 'import-prices':      return (await import('../../../components/admin/AdminImportPricesTab')).default;
    case 'catalog-enrichment': return (await import('../../../components/admin/AdminCatalogEnrichmentTab')).default;
    case 'inventory':          return (await import('../../../components/admin/AdminPlaceholderTab')).default;
    case 'knowledge-base':     return (await import('../../../components/admin/AdminStorageTab')).default;

    // Sales
    case 'crm':                return (await import('../../../components/admin/AdminCrmTab')).default;
    case 'leads':              return (await import('../../../components/admin/AdminLeadsTabWrapper')).default;
    case 'clinics':            return (await import('../../../components/admin/AdminClinicsTabWrapper')).default;
    case 'account-managers':   return (await import('../../../components/admin/AdminAccountManagersTab')).default;
    case 'quotations':         return (await import('../../../components/admin/quotations/AdminQuotationsTab')).default;
    case 'patient-orders':
    case 'sales-orders':
    case 'my-orders':
    case 'orders':             return (await import('../../../components/admin/OrdersTab')).default;
    case 'agency-deals':       return (await import('../../../components/admin/AdminAgencyDealsTab')).default;
    case 'revenue':            return (await import('../../../components/admin/AdminFinanceTab')).default;

    // Purchasing
    case 'procurement':        return (await import('../../../components/admin/AdminProcurementTab')).default;
    case 'suppliers':          return (await import('../../../components/admin/AdminSuppliersTab')).default;
    case 'wholesellers':       return (await import('../../../components/admin/AdminWholesellersTab')).default;
    case 'rfqs':               return (await import('../../../components/admin/AdminRFQTab')).default;
    case 'purchase-orders':    return (await import('../../../components/admin/AdminBulkOrdersTab')).default;

    // Logistics
    case 'shipping':
    case 'logistics-tracker':  return (await import('../../../components/admin/AdminLogisticsTab')).default;

    // Finance
    case 'transactions':
    case 'invoices':
    case 'my-invoices':
    case 'payments':
    case 'payments-received':  return (await import('../../../components/admin/AdminTransactionsTab')).default;
    case 'approvals':          return (await import('../../../components/admin/AdminApprovalsTab')).default;

    // Marketing
    case 'email-campaigns':
    case 'newsletter':
    case 'templates':          return (await import('../../../components/admin/AdminEmailTemplatesTab')).default;
    case 'social-media':       return (await import('../../../components/admin/AdminMarketingTab')).default;

    // AI
    case 'atlas-ai':
    case 'my-assistant':
    case 'ai-agents':          return (await import('../../../components/admin/AdminAIAgentsTab')).default;
    case 'ai-insights':        return (await import('../../../components/admin/AdminAnalyticsTab')).default;
    case 'ai-logs':            return (await import('../../../components/admin/AdminAuditLogsTab')).default;

    // Hubs
    case 'system':             return (await import('../../../components/admin/AdminSystemHub')).default;
    case 'clinical':           return (await import('../../../components/admin/AdminClinicalHub')).default;
    case 'data-hub':           return (await import('../../../components/admin/AdminDataHub')).default;

    // Administration (Legacy individual links, eventually redirect or remove)
    case 'users':              return (await import('../../../components/admin/AdminUsersTab')).default;
    case 'invitations':        return (await import('../../../components/admin/AdminInvitationsTab')).default;
    case 'settings':           return (await import('../../../components/admin/AdminSettingsTab')).default;
    case 'views':              return (await import('../../../components/admin/AdminViewsConfigTab')).default;
    case 'audit-logs':         return (await import('../../../components/admin/AdminAuditLogsTab')).default;
    case 'relationships':      return (await import('../../../components/admin/AdminRelationshipsTab')).default;
    case 'semantic':           return (await import('../../../components/admin/AdminSemanticTab')).default;

    default:
      return null;
  }
};

export default async function AdminPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || ['dashboard'];
  const tabId = slug[0];

  const Component = await getTabComponent(tabId);

  return (
    <AdminTabErrorBoundary tabId={tabId} tabLabel={tabId}>
      <Suspense fallback={<TabSkeleton />}>
        {Component ? <Component /> : (
          <AdminPlaceholderTab
            title={(tabId || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            description={`The ${tabId} module is currently under development or integration.`}
          />
        )}
      </Suspense>
    </AdminTabErrorBoundary>
  );
}
