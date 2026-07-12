"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Stethoscope, Settings, ClipboardList, FileText, User, Loader } from '@/lib/icons';
import { useProtocolManager } from './hooks/useProtocolManager';
import { useToast } from '../../../hooks/useToast';

// ── Lazy-load each tab so only the active one loads its JS bundle ──────────────
const ProtocolClinicalTab  = dynamic(() => import('./tabs/ProtocolClinicalTab'));
const ProtocolOperationsTab = dynamic(() => import('./tabs/ProtocolOperationsTab'));
const ProtocolRecordsTab   = dynamic(() => import('./tabs/ProtocolRecordsTab'));

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

function TabFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ marginLeft: '0.5rem' }}>Loading…</span>
    </div>
  );
}

export default function ProtocolHubDashboard({ protocol, onSave, onClose, hideHeader = false, onChange }) {
  const { toast } = useToast();
  const {
    activeTab,
    setActiveTab,
    editedProtocol,
    isMobile,
    handleUpdate,
    handleSaveAll,
    handleClose,
  } = useProtocolManager({ initialProtocol: protocol, onSave, onClose, onChange });

  const [pdfLoading, setPdfLoading] = useState(null); // 'doctor' | 'patient' | null

  const handleDoctorPdf = useCallback(async () => {
    setPdfLoading('doctor');
    try {
      const { generateDoctorPdf } = await import('../../../utils/doctorPdfGenerator');
      generateDoctorPdf(editedProtocol);
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to generate Doctor PDF');
    } finally {
      setPdfLoading(null);
    }
  }, [editedProtocol, toast]);

  const handlePatientPdf = useCallback(async () => {
    setPdfLoading('patient');
    try {
      const { generatePatientGuide } = await import('../../../services/pdfService');
      await generatePatientGuide(editedProtocol, {});
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to generate Patient Guide PDF');
    } finally {
      setPdfLoading(null);
    }
  }, [editedProtocol, toast]);

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
      {!hideHeader && (
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
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{editedProtocol.protocol_name || editedProtocol.protocol_title || 'Unnamed Protocol'}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {editedProtocol.therapeutic_category || 'Uncategorized'} • v{editedProtocol.version_number || editedProtocol.protocol_version || '1.0'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {!isMobile && (
              <>
                <button 
                  onClick={handleDoctorPdf}
                  disabled={pdfLoading === 'doctor'}
                  className="gcp-btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px', fontSize: '0.85rem' }}
                >
                  {pdfLoading === 'doctor' ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={16} />} 
                  Doctor PDF
                </button>
                <button 
                  onClick={handlePatientPdf}
                  disabled={pdfLoading === 'patient'}
                  className="gcp-btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px', fontSize: '0.85rem' }}
                >
                  {pdfLoading === 'patient' ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <User size={16} />} 
                  Patient Guide
                </button>
                <button 
                  onClick={handleSaveAll}
                  className="gcp-btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </>
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
      )}

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
            <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="has-view-transition">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Suspense fallback={<TabFallback />}>
                    {renderTabContent(activeTab)}
                  </Suspense>
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
                        transition={{ duration: 0.2 }}
                      >
                        <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <Suspense fallback={<TabFallback />}>
                            {renderTabContent(tab.id)}
                          </Suspense>
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
