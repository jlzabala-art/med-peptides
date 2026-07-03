import React, { useState } from 'react';
import { useQuotationsUIStore } from '../../stores/quotationsUIStore';
import StandardDrawer from '../ui/StandardDrawer';
import StandardDrawerTabs from '../common/StandardDrawerTabs';

import OverviewTab from './tabs/OverviewTab';
import ItemsTab from './tabs/ItemsTab';
import PricingTab from './tabs/PricingTab';
import ShippingTab from './tabs/ShippingTab';
import DocumentsTab from './tabs/DocumentsTab';
import HistoryTab from './tabs/HistoryTab';
import InternalNotesTab from './tabs/InternalNotesTab';

const QUOTATION_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'items', label: 'Items & Products' },
  { id: 'pricing', label: 'Pricing & Margins' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'documents', label: 'Documents' },
  { id: 'history', label: 'History' },
  { id: 'internal', label: 'Internal Notes' },
];

export default function QuotationDetailDrawer() {
  const { activeQuotationId, closeQuotationDrawer } = useQuotationsUIStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!activeQuotationId) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab quotationId={activeQuotationId} />;
      case 'items': return <ItemsTab quotationId={activeQuotationId} />;
      case 'pricing': return <PricingTab quotationId={activeQuotationId} />;
      case 'shipping': return <ShippingTab quotationId={activeQuotationId} />;
      case 'documents': return <DocumentsTab quotationId={activeQuotationId} />;
      case 'history': return <HistoryTab quotationId={activeQuotationId} />;
      case 'internal': return <InternalNotesTab quotationId={activeQuotationId} />;
      default: return null;
    }
  };

  return (
    <StandardDrawer
      isOpen={!!activeQuotationId}
      onClose={closeQuotationDrawer}
      title={`Quotation #${activeQuotationId}`}
      subtitle="Pending Client Approval"
    >
      <StandardDrawerTabs
        tabs={QUOTATION_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderTabContent()}
      </div>
    </StandardDrawer>
  );
}
