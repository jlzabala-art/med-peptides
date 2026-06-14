import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import List from 'lucide-react/dist/esm/icons/list';
import Download from 'lucide-react/dist/esm/icons/download';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Box from 'lucide-react/dist/esm/icons/box';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import LayoutTemplate from 'lucide-react/dist/esm/icons/layout-template';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Tag from 'lucide-react/dist/esm/icons/tag';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Activity from 'lucide-react/dist/esm/icons/activity';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import React, { useState } from 'react';

import CatalogTableView from './CatalogTableView';
import CatalogCardsView from './CatalogCardsView';

const CatalogProductsWorkspace = ({
  products = [],
  variants = [],
  loading = false,
  activeDisplayMode = 'table',
  onDisplayModeChange,
  onAction,
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [matrixViewType, setMatrixViewType] = useState('grouped'); // 'grouped' | 'flat'
  const [contextualTab, setContextualTab] = useState('general'); // 'general' | 'pricing' | 'costs' | 'inventory' | 'regulatory'

  const handleBulkAction = (action) => {
    setShowBulkActions(false);
    if (onAction) onAction(action);
  };

  return (
    <div
      className="catalog-products-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Toolbar */}
      <div
        className="workspace-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="toolbar-left">
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '600' }}>
            Item Command Center
          </h2>
        </div>
        <div
          className="toolbar-right"
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          {/* Hierarchy Toggle (Grouped vs Flat) */}
          <div
            className="hierarchy-toggle"
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setMatrixViewType('grouped')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: matrixViewType === 'grouped' ? '#ffffff' : 'transparent',
                boxShadow: matrixViewType === 'grouped' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: matrixViewType === 'grouped' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              title="Grouped by Product"
            >
              <Layers size={16} /> Grouped
            </button>
            <button
              onClick={() => setMatrixViewType('flat')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: matrixViewType === 'flat' ? '#ffffff' : 'transparent',
                boxShadow: matrixViewType === 'flat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: matrixViewType === 'flat' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              title="Flat Variants"
            >
              <LayoutTemplate size={16} /> Flat Variants
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

          {/* Display Mode Segmented Control */}
          <div
            className="display-mode-control"
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => onDisplayModeChange('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeDisplayMode === 'table' ? '#ffffff' : 'transparent',
                boxShadow: activeDisplayMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: activeDisplayMode === 'table' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s ease-in-out',
              }}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => onDisplayModeChange('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeDisplayMode === 'cards' ? '#ffffff' : 'transparent',
                boxShadow: activeDisplayMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: activeDisplayMode === 'cards' ? '#0f172a' : '#64748b',
                transition: 'all 0.2s ease-in-out',
              }}
              title="Cards View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          {/* Bulk Actions Dropdown */}
          <div className="bulk-actions-dropdown" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Bulk Actions <ChevronDown size={16} />
            </button>
            {showBulkActions && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  minWidth: '180px',
                  zIndex: 9999,
                }}
              >
                <button
                  onClick={() => handleBulkAction('import')}
                  style={dropdownItemStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleLeave}
                >
                  <Upload size={16} color="#64748b" /> Import Products
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  style={dropdownItemStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleLeave}
                >
                  <Download size={16} color="#64748b" /> Export Catalog
                </button>
                <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>
                <button
                  onClick={() => handleBulkAction('bulk_update')}
                  style={dropdownItemStyle}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleLeave}
                >
                  <Edit size={16} color="#64748b" /> Mass Update
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contextual Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          padding: '0 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {[
          { id: 'general', label: 'Items', icon: Box },
          { id: 'pricing', label: 'Pricing Matrix', icon: Tag },
          { id: 'costs', label: 'Costs', icon: DollarSign },
          { id: 'inventory', label: 'Inventory', icon: Activity },
          { id: 'regulatory', label: 'Regulatory', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setContextualTab(tab.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: contextualTab === tab.id ? '#2563eb' : '#64748b',
              borderBottom:
                contextualTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="workspace-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <div
              style={{
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : products.length === 0 ? (
          <div
            className="empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
              padding: '40px 20px',
            }}
          >
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: '24px',
                borderRadius: '50%',
                marginBottom: '24px',
              }}
            >
              <Box size={48} color="#94a3b8" />
            </div>
            <h3
              style={{
                fontSize: '1.5rem',
                color: '#0f172a',
                margin: '0 0 12px 0',
                fontWeight: '600',
              }}
            >
              No Products Here Yet
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                backgroundColor: '#eff6ff',
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                maxWidth: '500px',
                textAlign: 'left',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
              }}
            >
              <Sparkles size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    color: '#1e3a8a',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                  }}
                >
                  Atlas AI Insights
                </p>
                <p style={{ margin: 0, color: '#2563eb', lineHeight: '1.5' }}>
                  Inventory healthy. Atlas AI predicts no stock-outs in the next 30 days. Get
                  started by importing products or running a bulk update to populate your catalog.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="products-view" style={{ height: '100%' }}>
            {activeDisplayMode === 'table' ? (
              <CatalogTableView
                products={products}
                variants={variants}
                onAction={onAction}
                matrixViewType={matrixViewType}
                contextualTab={contextualTab}
              />
            ) : (
              <CatalogCardsView products={products} onAction={onAction} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper styles and functions for dropdown
const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '10px 16px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  color: '#475569',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  fontWeight: '500',
};

const handleHover = (e) => (e.currentTarget.style.backgroundColor = '#f1f5f9');
const handleLeave = (e) => (e.currentTarget.style.backgroundColor = 'transparent');

export default CatalogProductsWorkspace;
