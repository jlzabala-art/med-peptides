"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Stethoscope, Settings, ClipboardList, FileText, User, Loader, ChevronDown, Plus } from '@/lib/icons';
import { useProtocolManager } from './hooks/useProtocolManager';
import { useToast } from '../../../hooks/useToast';
import StandardDrawerTabs from '../../common/StandardDrawerTabs';
import { useDrawer } from '../../../context/DrawerContext';
import { getProtocolDisplayName } from '../../../utils/protocolHelpers';

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

export default function ProtocolHubDashboard({ protocol, onSave, onClose, hideHeader = false, onChange, onProductClick }) {
  const { toast } = useToast();
  const {
    activeTab,
    setActiveTab,
    editedProtocol,
    isMobile,
    hasUnsavedChanges,
    handleUpdate,
    handleSilentUpdate,
    handleSaveAll,
    handleClose,
  } = useProtocolManager({ initialProtocol: protocol, onSave, onClose, onChange });

  const { openDrawer } = useDrawer();
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
        return <ProtocolClinicalTab protocol={editedProtocol} protocolId={editedProtocol?.id || protocol?.id} onUpdate={handleUpdate} onAiUpdate={handleSilentUpdate} onProductClick={onProductClick} />;
      case 'operations':
        return <ProtocolOperationsTab protocol={editedProtocol} onUpdate={handleUpdate} onProductClick={onProductClick} />;
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
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1400px',
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {getProtocolDisplayName(editedProtocol)}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{editedProtocol.primary_goal || editedProtocol.goal || (Array.isArray(editedProtocol.goals) && editedProtocol.goals[0]) || editedProtocol.therapeutic_category || 'Tissue Repair & Recovery'}</span>
              <span>•</span>
              <span>v{editedProtocol.version_number ? (typeof editedProtocol.version_number === 'number' ? editedProtocol.version_number.toFixed(1) : editedProtocol.version_number) : (editedProtocol.protocol_version || editedProtocol.version || '1.0')}</span>
              {(editedProtocol.authorName || editedProtocol.doctorName) && (
                <>
                  <span>•</span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      const id = editedProtocol.authorId || editedProtocol.doctorId;
                      if (id) window.location.href = `/admin/physicians?id=${id}`;
                    }}
                    style={{ 
                      cursor: (editedProtocol.authorId || editedProtocol.doctorId) ? 'pointer' : 'default',
                      textDecoration: (editedProtocol.authorId || editedProtocol.doctorId) ? 'underline' : 'none',
                      textDecorationStyle: 'dashed',
                      textUnderlineOffset: '2px',
                      color: 'var(--color-primary)',
                      fontWeight: 500
                    }}
                    title="View Physician Profile"
                  >
                    <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    {editedProtocol.authorName || editedProtocol.doctorName}
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            {!isMobile && (
              <>
                <button
                  onClick={() => {
                    const rawItems = (Array.isArray(editedProtocol?.bom) && editedProtocol.bom.length > 0)
                      ? editedProtocol.bom
                      : (editedProtocol?.phases?.flatMap(phase => phase.items || [])?.length > 0)
                        ? editedProtocol.phases.flatMap(phase => phase.items || [])
                        : (Array.isArray(editedProtocol?.peptides) && editedProtocol.peptides.length > 0)
                          ? editedProtocol.peptides
                          : [];

                    if (rawItems.length === 0) {
                      toast?.error?.('No peptides or products found in this protocol to add.');
                      return;
                    }

                    const initialItems = rawItems.map(p => ({
                      id: p.productId || p.product_id || p.id || 'peptide-item',
                      productId: p.productId || p.product_id || p.id,
                      name: p.product_name || p.name || 'Compound',
                      price: p.cost || p.unit_cost || 65,
                      quantity: p.quantity || p.vials || 1,
                      dosage: p.dosage || '',
                      frequency: p.frequency || '',
                    }));

                    openDrawer('rx-builder', 'new', {
                      initialProtocol: editedProtocol,
                      protocolId: editedProtocol.id,
                      protocolName: getProtocolDisplayName(editedProtocol),
                      initialItems,
                      clinicalGoal: editedProtocol.primary_goal,
                      durationWeeks: editedProtocol.durationWeeks || 6,
                      sourceModule: 'protocol-hub',
                    });
                    
                    toast?.success?.(`Added ${initialItems.length} peptide(s) from "${getProtocolDisplayName(editedProtocol)}" to new prescription.`);
                  }}
                  className="gcp-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add to Prescription
                </button>
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setPdfLoading(prev => prev ? null : 'menu')}
                    disabled={pdfLoading === 'doctor' || pdfLoading === 'patient'}
                    className="gcp-btn-secondary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px', fontSize: '0.85rem' }}
                  >
                    {(pdfLoading === 'doctor' || pdfLoading === 'patient') ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={16} />} 
                    Export PDFs
                    <ChevronDown size={14} style={{ marginLeft: '0.25rem' }} />
                  </button>
                  {pdfLoading === 'menu' && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 100,
                      minWidth: '160px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <button 
                        onClick={() => { setPdfLoading(null); handleDoctorPdf(); }}
                        style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', color: 'var(--text-main)' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <FileText size={14} /> Doctor PDF
                      </button>
                      <button 
                        onClick={() => { setPdfLoading(null); handlePatientPdf(); }}
                        style={{ padding: '10px 16px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', color: 'var(--text-main)' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <User size={14} /> Patient Guide
                      </button>
                    </div>
                  )}
                </div>
                {hasUnsavedChanges && (
                  <button 
                    onClick={handleSaveAll}
                    className="gcp-btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}
                  >
                    <Save size={16} /> Save Changes
                  </button>
                )}
              </>
            )}
            <button 
              onClick={handleClose}
              style={{ 
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem', 
                margin: '-0.5rem',
                color: 'var(--text-secondary)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        </div>
      )}
      
      {/* Global Compact Tabs */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: hideHeader ? 0 : '75px', zIndex: 9, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1400px', padding: '0 1.5rem' }}>
          <StandardDrawerTabs 
            tabs={TABS} 
            activeTab={activeTab} 
            onChange={handleTabChange} 
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1400px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <Suspense fallback={<TabFallback />}>
                {renderTabContent(activeTab)}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

          {/* Mobile Sticky Action Bar */}
          {isMobile && hasUnsavedChanges && (
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
          )}
      </div>
    </div>
  );
}
