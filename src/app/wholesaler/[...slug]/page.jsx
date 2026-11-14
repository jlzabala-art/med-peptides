'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import RoleDashboard from '../../../templates/RoleDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

const BrandingTab = dynamic(() => import('../../../components/wholesaler/BrandingTab'), { ssr: false });
const WholesalerBulkTab = dynamic(() => import('../../../templates/WholesalerHome').then((m) => m.WholesalerBulkTab), { ssr: false });
const WholesalerRxInboxTab = dynamic(() => import('../../../templates/WholesalerHome').then((m) => m.WholesalerRxInboxTab), { ssr: false });
const CatalogCreatorFlow = dynamic(() => import('../../../components/wholesaler/CatalogCreatorFlow'), { ssr: false });
const CatalogList = dynamic(() => import('../../../components/wholesaler/CatalogList'), { ssr: false });
const ClientsTab = dynamic(() => import('../../../components/wholesaler/ClientsTab'), { ssr: false });
const ClinicalAIWidget = dynamic(() => import('../../../components/admin/ClinicalAIWidget'), { ssr: false });
const DomainsTab = dynamic(() => import('../../../components/wholesaler/DomainsTab'), { ssr: false });
const EmailCampaignBuilder = dynamic(() => import('../../../components/wholesaler/EmailCampaignBuilder'), { ssr: false });
const GeographyAreasTab = dynamic(() => import('../../../components/wholesaler/GeographyAreasTab'), { ssr: false });
const RealTimeStockManagerWidget = dynamic(() => import('../../../components/wholesaler/gadgets/RealTimeStockManagerWidget'), { ssr: false });
const MessagingWidget = dynamic(() => import('../../../components/messaging/MessagingWidget'), { ssr: false });
const UserSettings = dynamic(() => import('../../../templates/UserSettings'), { ssr: false });
const UserProfileTab = dynamic(() => import('../../../components/shared/UserProfileTab'), { ssr: false });

export default function WholesalerDynamicRoute({ params }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams?.slug || [];
  const path = slug.join('/');
  const tabId = slug[0] || 'bulk-orders';
  const router = useRouter();
  const { user } = useAuth();

  const renderTab = () => {
    switch (tabId) {
      case 'profile':
      case 'my-profile':
        return <UserProfileTab />;
      case 'branding':
        return <BrandingTab />;
      case 'bulk-orders':
        return <WholesalerBulkTab />;
      case 'catalog-builder':
        return (
          <CatalogCreatorFlow
            ownerId={user?.uid}
            ownerType="wholesaler"
            onBack={() => router.push('/wholesaler/catalogs')}
          />
        );
      case 'catalogs':
        return (
          <CatalogList
            ownerId={user?.uid}
            ownerType="wholesaler"
            onOpenBuilder={() => router.push('/wholesaler/catalog-builder')}
            onSelectCatalogToEdit={() => router.push('/wholesaler/catalog-builder')}
          />
        );
      case 'clients':
        return <ClientsTab />;
      case 'clinical-ai':
        return <ClinicalAIWidget />;
      case 'domains':
        return <DomainsTab />;
      case 'email-campaigns':
        return (
          <EmailCampaignBuilder
            ownerId={user?.uid}
            ownerType="wholesaler"
            onBack={() => router.push('/wholesaler/catalogs')}
          />
        );
      case 'geography':
        return <GeographyAreasTab />;
      case 'inventory':
        return (
          <div style={{ padding: '0.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <RealTimeStockManagerWidget />
          </div>
        );
      case 'messages':
        return <MessagingWidget />;
      case 'rx-inbox':
        return <WholesalerRxInboxTab uid={user?.uid} />;
      case 'settings':
        return <UserSettings onBack={() => router.push('/wholesaler')} />;
      default:
        return <RoleDashboard onBack={() => router.push('/')} defaultTab={tabId} />;
    }
  };

  return (
    <AdminTabErrorBoundary tabId={path || tabId} tabLabel={path || tabId}>
      {renderTab()}
    </AdminTabErrorBoundary>
  );
}
