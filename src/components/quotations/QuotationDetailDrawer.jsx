"use client";

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
import { useTransactionManager } from '../../hooks/data/useTransactionManager';

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
  const { activeQuotation, closeQuotationDrawer, openBuilderWizard } = useQuotationsUIStore();
  const [activeTab, setActiveTab] = useState('overview');
  const { createQuotation } = useTransactionManager();

  if (!activeQuotation) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab quotationId={activeQuotation.id} />;
      case 'items': return <ItemsTab quotationId={activeQuotation.id} />;
      case 'pricing': return <PricingTab quotationId={activeQuotation.id} />;
      case 'shipping': return <ShippingTab quotationId={activeQuotation.id} />;
      case 'documents': return <DocumentsTab quotationId={activeQuotation.id} />;
      case 'history': return <HistoryTab quotationId={activeQuotation.id} />;
      case 'internal': return <InternalNotesTab quotationId={activeQuotation.id} />;
      default: return null;
    }
  };

  const handleCreateQuotationFromRfq = () => {
    // Open the builder wizard prefilled with RFQ items, or directly call createQuotation
    openBuilderWizard({
      type: 'rfq',
      id: activeQuotation.id,
      data: activeQuotation
    });
    closeQuotationDrawer();
  };

  return (
    <StandardDrawer
      isOpen={!!activeQuotation}
      onClose={closeQuotationDrawer}
      title={activeQuotation.type === 'rfq' ? `RFQ #${activeQuotation.rfqId}` : `Quotation #${activeQuotation.quotationNumber || activeQuotation.id}`}
      subtitle={activeQuotation.type === 'rfq' ? 'Pending Commercial Review' : 'Pending Client Approval'}
    >
      {activeQuotation.type === 'rfq' && (
        <div style={{ padding: '1rem', background: '#e0e7ff', borderBottom: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#3730a3' }}>This is a Request for Quotation (RFQ).</div>
            <div style={{ fontSize: '0.85rem', color: '#4f46e5' }}>Review the requested items and generate a formal quotation for the customer.</div>
          </div>
          <button onClick={handleCreateQuotationFromRfq} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            Create Quotation
          </button>
        </div>
      )}
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
