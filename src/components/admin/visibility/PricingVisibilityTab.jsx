import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalogSelectionStore } from '../../../stores/useCatalogSelectionStore';
import VisibilityOverviewTab from './VisibilityOverviewTab';
import RegionalAccessTab from './RegionalAccessTab';
import CustomerAccessTab from './CustomerAccessTab';
import RegulatoryAccessTab from './RegulatoryAccessTab';
import ZohoPublishingTab from './ZohoPublishingTab';
import SelectedItemsVisibilityWorkflow from './SelectedItemsVisibilityWorkflow';
import ContextTooltip from '../../shared/widgets/ContextTooltip';

export default function PricingVisibilityTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const selectedItemIds = useCatalogSelectionStore(state => state.selectedIds);
  const clearSelection = useCatalogSelectionStore(state => state.clearSelection);

  const handleClearSelection = () => {
    clearSelection();
    navigate('/admin/pricing-visibility', { replace: true, state: {} });
  };

  if (selectedItemIds.length > 0) {
    return (
      <SelectedItemsVisibilityWorkflow 
        selectedItemIds={selectedItemIds} 
        onClearSelection={handleClearSelection}
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Control Tower' },
    { id: 'regional', label: 'Regional Limits' },
    { id: 'customer', label: 'Customer Segmentation' },
    { id: 'regulatory', label: 'Regulatory Gate' },
    { id: 'zoho', label: 'Zoho Propagation' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center' }}>
          Pricing & Catalog Visibility
          <ContextTooltip 
            content="Manage which products are visible in specific regions, to specific customers, based on regulatory approvals and stock availability." 
            copilotPrompt="How does the Pricing Visibility control tower work?"
          />
        </h2>
        <p style={{ margin: 0, color: '#64748b' }}>Orchestrate B2B product access, regional compliance blocks, and automated sync to Zoho.</p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px', background: activeTab === tab.id ? '#0f172a' : '#f8fafc',
              color: activeTab === tab.id ? '#fff' : '#64748b', border: '1px solid',
              borderColor: activeTab === tab.id ? '#0f172a' : '#e2e8f0', borderRadius: '6px',
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, minHeight: '500px' }}>
        {activeTab === 'overview' && <VisibilityOverviewTab />}
        {activeTab === 'regional' && <RegionalAccessTab />}
        {activeTab === 'customer' && <CustomerAccessTab />}
        {activeTab === 'regulatory' && <RegulatoryAccessTab />}
        {activeTab === 'zoho' && <ZohoPublishingTab />}
      </div>
    </div>
  );
}
