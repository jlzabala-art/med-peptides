import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Stethoscope, Settings, ClipboardList } from '@/lib/icons';
import ProtocolClinicalTab from './tabs/ProtocolClinicalTab';
import ProtocolOperationsTab from './tabs/ProtocolOperationsTab';
import ProtocolRecordsTab from './tabs/ProtocolRecordsTab';
import { useProtocolManager } from './hooks/useProtocolManager';

const TABS = [
  {
    id: 'clinical',
    label: 'Clinical Design',
    icon: <Stethoscope size={16} />,
    subtitle: 'Overview · Treatment · Dosage · Patient Journey · Monitoring · Labs',
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: <Settings size={16} />,
    subtitle: 'Products · Cost & Logistics',
  },
  {
    id: 'records',
    label: 'Records',
    icon: <ClipboardList size={16} />,
    subtitle: 'Documents · Audit Log',
  },
];

export default function ProtocolHubDashboard({ protocol, onSave, onClose }) {
  const {
    activeTab,
    setActiveTab,
    editedProtocol,
    isMobile,
    handleUpdate,
    handleSaveAll,
    handleClose,
  } = useProtocolManager({ initialProtocol: protocol, onSave, onClose });

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case 'clinical':
        return <ProtocolClinicalTab protocol={editedProtocol} onUpdate={handleUpdate} />;
      case 'operations':
        return <ProtocolOperationsTab protocol={editedProtocol} onUpdate={handleUpdate} />;
      case 'records':
        return <ProtocolRecordsTab protocol={editedProtocol} onUpdate={handleUpdate} />;
      default:
        return null;
    }
  };

  /**
   * handleTabChange
   * Uses View Transitions API (Chrome 111+) for a native cross-fade between tabs.
   * Falls back to a plain state update on browsers that don't support it yet.
   * This replaces framer-motion AnimatePresence for this specific transition.
   */
  const handleTabChange = (tabId) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setActiveTab(tabId));
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem', 
        borderBottom: '1px solid var(--border)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{editedProtocol.protocol_name || 'Unnamed Protocol'}</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {editedProtocol.therapeutic_category || 'Uncategorized'} • v{editedProtocol.version_number || 1}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isMobile && (
            <button 
              onClick={handleSaveAll}
              className="gcp-btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}
            >
              <Save size={16} /> Save Changes
            </button>
          )}
          <button 
            onClick={handleClose}
            className="gcp-btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMobile ? (
        <>
          {/* Desktop Tabs */}
          <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', padding: '0 1rem', gap: '1.5rem', minWidth: 'max-content' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.icon}
                  <span>
                    {tab.label}
                    {tab.subtitle && (
                      <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '1px', letterSpacing: '0.01em' }}>
                        {tab.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Content Area — has-view-transition enables native browser cross-fade */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-main)' }}>
            <div style={{ maxWidth: '1500px', margin: '0 auto' }} className="has-view-transition">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent(activeTab)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </>
      ) : (
        /* Mobile Accordion View */
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--bg-main)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '5rem' }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => handleTabChange(isActive ? null : tab.id)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {tab.icon}
                      {tab.label}
                    </div>
                    {isActive ? <X size={16} /> : <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</div>}
                  </button>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid var(--border-light)' }}>
                          <div style={{ paddingTop: '1rem' }}>
                            {renderTabContent(tab.id)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Mobile Sticky Action Bar */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--surface)',
            padding: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '1rem',
            zIndex: 100,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
          }}>
            <button 
              onClick={handleSaveAll}
              className="gcp-btn-primary" 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> Save Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
