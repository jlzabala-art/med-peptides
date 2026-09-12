"use client";

import React, { useState, useEffect } from 'react';
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

export default function QuotationDetailDrawer({ quotation: propQuotation, onClose: propOnClose }) {
  const { activeQuotation: storeQuotation, closeQuotationDrawer, openBuilderWizard } = useQuotationsUIStore();
  const [localQuotation, setLocalQuotation] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { createQuotation } = useTransactionManager();

  useEffect(() => {
    const handleOpen = (e) => {
      if (e.detail) {
        setLocalQuotation(e.detail);
      }
    };
    const handleUpdated = (e) => {
      if (e.detail) {
        setLocalQuotation(prev => prev ? { ...prev, ...e.detail } : e.detail);
      }
    };
    window.addEventListener('open-quotation-drawer', handleOpen);
    window.addEventListener('quotation-updated', handleUpdated);
    return () => {
      window.removeEventListener('open-quotation-drawer', handleOpen);
      window.removeEventListener('quotation-updated', handleUpdated);
    };
  }, []);

  const activeQuotation = propQuotation || localQuotation || storeQuotation;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setLocalQuotation(null);
    closeQuotationDrawer();
  };

  if (!activeQuotation) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      case 'items': return <ItemsTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      case 'pricing': return <PricingTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      case 'shipping': return <ShippingTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      case 'documents': return <DocumentsTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      case 'history': return <HistoryTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      case 'internal': return <InternalNotesTab quotation={activeQuotation} quotationId={activeQuotation.id} />;
      default: return null;
    }
  };

  const handleCreateQuotationFromRfq = () => {
    openBuilderWizard({
      type: 'rfq',
      id: activeQuotation.id,
      data: activeQuotation
    });
    handleClose();
  };

  return (
    <StandardDrawer
      isOpen={!!activeQuotation}
      onClose={handleClose}
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
