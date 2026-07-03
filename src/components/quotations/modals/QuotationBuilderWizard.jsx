import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuotationsUIStore } from '../../../stores/quotationsUIStore';
import { X, FileText, ClipboardList, Wand2, Copy, PlusCircle, ArrowRight } from '@/lib/icons';

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
    color: '#10b981'
  },
  {
    id: 'ai',
    title: 'AI Recommendation',
    description: 'Upload lab reports or doctor notes and let Atlas AI build the quote.',
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
    title: 'Manual Creation',
    description: 'Start from scratch and manually select items from the catalog.',
    icon: PlusCircle,
    color: '#64748b'
  }
];

export default function QuotationBuilderWizard() {
  const { isBuilderWizardOpen, closeBuilderWizard } = useQuotationsUIStore();
  const [selectedOption, setSelectedOption] = useState(null);

  if (!isBuilderWizardOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
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
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>Create New Quotation</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Select how you want to start building this commercial proposal.</p>
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
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {CREATION_OPTIONS.map((opt) => {
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
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 10px 15px -3px ${opt.color}20` : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    background: `${opt.color}15`, color: opt.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1e293b' }}>{opt.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                      {opt.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <button onClick={closeBuilderWizard} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}>
            Cancel
          </button>
          
          <button 
            disabled={!selectedOption}
            style={{ 
              background: selectedOption ? 'var(--primary)' : '#cbd5e1', 
              color: 'white', border: 'none', padding: '0.75rem 1.5rem', 
              borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
