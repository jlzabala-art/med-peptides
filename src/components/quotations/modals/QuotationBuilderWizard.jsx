"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuotationsUIStore } from '../../../stores/quotationsUIStore';
import { X, FileText, ClipboardList, Wand2, Copy, PlusCircle, ArrowRight, User, Building2, Globe, Check } from '@/lib/icons';
import notifier from '../../../services/NotificationService';

const RECIPIENT_TYPES = [
  {
    id: 'patient',
    label: 'Patient (B2C)',
    subtitle: 'Personalized treatment protocol & doctor prescription',
    icon: User,
    color: '#0d9488',
    bg: '#f0fdfa'
  },
  {
    id: 'clinic',
    label: 'Clinic (B2B Stock)',
    subtitle: 'In-clinic procedure inventory & facility replenishment',
    icon: Building2,
    color: '#2563eb',
    bg: '#eff6ff'
  },
  {
    id: 'wholesaler',
    label: 'Wholesaler (B2B Bulk)',
    subtitle: 'Master batch distribution, MOQ contracts & distributor tier',
    icon: Globe,
    color: '#ea580c',
    bg: '#fff7ed'
  }
];

const CREATION_OPTIONS = [
  {
    id: 'protocol',
    title: 'From Protocol Blueprint',
    description: 'Create a quotation directly from a standardized clinic protocol.',
    icon: ClipboardList,
    color: '#0ea5e9'
  },
  {
    id: 'prescription',
    title: 'From Active Prescription',
    description: 'Convert a patient\'s medical prescription into a commercial quote.',
    icon: FileText,
    color: '#10b981',
    onlyFor: ['patient']
  },
  {
    id: 'ai',
    title: 'AI Recommendation',
    description: 'Upload lab reports or intake notes and let Atlas AI build the quote.',
    icon: Wand2,
    color: '#8b5cf6'
  },
  {
    id: 'duplicate',
    title: 'Duplicate Existing',
    description: 'Clone a previous quotation and modify it.',
    icon: Copy,
    color: '#f59e0b'
  },
  {
    id: 'manual',
    title: 'Manual Item Selection',
    description: 'Start from scratch and manually select items from the catalog.',
    icon: PlusCircle,
    color: '#64748b'
  }
];

import { useDrawer } from '../../../context/DrawerContext';
import { useOrderBuilderStore } from '../../../stores/orderBuilderStore';

export default function QuotationBuilderWizard() {
  const { isBuilderWizardOpen, closeBuilderWizard } = useQuotationsUIStore();
  const { openDrawer } = useDrawer();
  const [recipientType, setRecipientType] = useState('patient');
  const [selectedOption, setSelectedOption] = useState(null);
  const [wizardPayload, setWizardPayload] = useState(null);

  // Listen to open-quotation-wizard events with pre-filled context
  useEffect(() => {
    const handleOpen = (e) => {
      const detail = e.detail || {};
      if (detail.recipientType || detail.type) {
        setRecipientType(detail.recipientType || detail.type);
      }
      setWizardPayload(detail);
      if (detail.type === 'protocol') setSelectedOption('protocol');
      else if (detail.type === 'prescription') setSelectedOption('prescription');
      else setSelectedOption('manual');
    };

    window.addEventListener('open-quotation-wizard', handleOpen);
    return () => window.removeEventListener('open-quotation-wizard', handleOpen);
  }, []);

  if (!isBuilderWizardOpen) return null;

  const handleContinue = () => {
    notifier.info(`Starting new ${recipientType.toUpperCase()} quotation...`);
    closeBuilderWizard();

    const items = wizardPayload?.items || (wizardPayload?.initialItem ? [wizardPayload.initialItem] : []);

    // Auto-populate OrderBuilder if items exist
    if (items.length > 0) {
      items.forEach(item => {
        try {
          useOrderBuilderStore.getState().addItem(item);
        } catch (e) {}
      });
    }

    // Open Global Rx / Order Builder Drawer
    try {
      openDrawer('rx-builder', 'new', {
        sourceModule: wizardPayload?.source || 'quotations',
        initialPatient: wizardPayload?.patient || wizardPayload?.initialPatient || null,
        initialProtocol: wizardPayload?.protocol || wizardPayload?.initialProtocol || null,
        initialDoctor: wizardPayload?.doctor || wizardPayload?.initialDoctor || null,
        initialItems: items
      });
    } catch (e) {
      console.warn('[QuotationBuilderWizard] openDrawer fallback:', e);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('open-quotation-editor', {
      detail: {
        recipientType,
        sourceOption: selectedOption,
        payload: wizardPayload
      }
    }));
  };

  const visibleOptions = CREATION_OPTIONS.filter(opt => {
    if (!opt.onlyFor) return true;
    return opt.onlyFor.includes(recipientType);
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.75rem 2rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Create Commercial Quotation
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              Choose the commercial channel and creation method for this proposal.
            </p>
          </div>
          <button 
            onClick={closeBuilderWizard}
            style={{ 
              background: '#f8fafc', border: 'none', width: '36px', height: '36px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 1: Channel / Recipient Modality Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              1. Commercial Channel & Target Recipient
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {RECIPIENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = recipientType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setRecipientType(type.id)}
                    style={{
                      border: `2px solid ${isSelected ? type.color : '#e2e8f0'}`,
                      borderRadius: '14px',
                      padding: '1rem',
                      background: isSelected ? type.bg : 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 4px 12px ${type.color}25` : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: isSelected ? type.color : '#f1f5f9', color: isSelected ? 'white' : type.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} />
                      </div>
                      {isSelected && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: type.color, color: 'white', fontWeight: 700 }}>
                          Active
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{type.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>{type.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Creation Source */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              2. Proposal Creation Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {visibleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedOption === opt.id;
                return (
                  <motion.div
                    key={opt.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedOption(opt.id)}
                    style={{
                      background: 'white',
                      border: `2px solid ${isSelected ? opt.color : '#e2e8f0'}`,
                      borderRadius: '14px',
                      padding: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? `0 6px 16px ${opt.color}20` : '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '10px', 
                      background: `${opt.color}15`, color: opt.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>{opt.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                        {opt.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <button onClick={closeBuilderWizard} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
            Cancel
          </button>
          
          <button 
            onClick={handleContinue}
            disabled={!selectedOption}
            style={{ 
              background: selectedOption ? '#0d9488' : '#cbd5e1', 
              color: 'white', border: 'none', padding: '0.65rem 1.5rem', 
              borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
          >
            Continue to Editor
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
