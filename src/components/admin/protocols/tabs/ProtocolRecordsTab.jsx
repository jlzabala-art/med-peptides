"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ProtocolDocuments from './ProtocolDocuments';
import ProtocolHistory from './ProtocolHistory';
import { ChevronDown, ChevronUp, FileText, History, ShieldCheck } from '@/lib/icons';

import { AddDocModal } from './ProtocolDocuments';

// ── Collapsible Section ───────────────────────────────────────────────────────
function RecordsSection({ id, icon: Icon, title, subtitle, color = 'var(--primary)', defaultOpen = false, open, onToggle, children }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleToggle = () => {
    if (onToggle) onToggle(!isOpen);
    else setInternalOpen(!isOpen);
  };

  return (
    <div id={`section-${id}`} style={{
      border: open ? `1px solid ${color}33` : '1px solid var(--border)',
      borderRadius: '20px',
      overflow: 'hidden',
      background: 'var(--surface)',
      boxShadow: open ? `0 12px 30px -10px ${color}26` : '0 2px 8px rgba(0,0,0,0.02)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '1rem',
      scrollMarginTop: '100px'
    }}>
      <button
        onClick={handleToggle}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
          padding: '1.5rem',
          background: open ? `linear-gradient(to right, ${color}0a, var(--surface))` : 'var(--surface)',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          transition: 'background 0.3s ease',
        }}
      >
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
          background: open ? `${color}1e` : 'var(--background-alt)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? `0 8px 16px -4px ${color}40` : 'none',
          border: `1px solid ${open ? `${color}4d` : 'var(--border)'}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Icon size={24} color={open ? color : 'var(--text-muted)'} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: open ? color : 'var(--text-main)', transition: 'color 0.2s', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: open ? `${color}1a` : 'var(--background-alt)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s',
          border: `1px solid ${open ? `${color}33` : 'transparent'}`
        }}>
          {open
            ? <ChevronUp size={20} color={color} />
            : <ChevronDown size={20} color="var(--text-muted)" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compliance status strip ───────────────────────────────────────────────────
function ComplianceStrip({ protocol, onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('reference');

  const docs   = protocol?.documents || [];
  const logs   = protocol?.audit_log || [];

  const checks = [
    {
      id: 'consent',
      label: 'Consent Form',
      done: docs.some(d => d.type === 'consent'),
      action: 'Add consent form',
    },
    {
      id: 'reference',
      label: 'Scientific Reference',
      done: docs.some(d => d.type === 'reference'),
      action: 'Add PubMed reference',
    },
    {
      id: 'protocol',
      label: 'Protocol PDF',
      done: docs.some(d => d.type === 'protocol'),
      action: 'Upload protocol PDF',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      done: logs.length > 0 || !!protocol?.createdAt,
      action: 'Changes will appear automatically',
    },
  ];

  const pct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
  const color = pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  const handleActionClick = (id) => {
    if (id === 'audit') return; // Cannot manually add audit log
    setModalType(id);
    setModalOpen(true);
  };

  const handleAddDoc = (newDoc) => {
    const newDocs = [newDoc, ...(protocol?.documents || [])];
    onUpdate({ documents: newDocs });
  };

  return (
    <div style={{
      padding: '1rem 1.25rem',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color={color} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Compliance Checklist</span>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800,
          background: pct === 100 ? '#dcfce7' : pct >= 50 ? '#fef3c7' : '#fee2e2',
          color,
        }}>{pct}% Complete</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
        {checks.map(c => {
          const isClickable = !c.done && c.id !== 'audit';
          return (
            <div 
              key={c.label} 
              onClick={() => isClickable ? handleActionClick(c.id) : null}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: '8px',
                background: c.done ? '#f0fdf4' : 'var(--surface-raised, #f8fafc)',
                border: `1px solid ${c.done ? '#bbf7d0' : 'var(--border)'}`,
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (isClickable) e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { if (isClickable) e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: '0.9rem' }}>{c.done ? '✅' : '⚪'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: c.done ? '#15803d' : 'var(--text-main)' }}>{c.label}</div>
                {!c.done && <div style={{ fontSize: '0.68rem', color: isClickable ? 'var(--primary)' : 'var(--text-muted)' }}>{c.action}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <AddDocModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddDoc}
        defaultType={modalType}
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolRecordsTab({ protocol, onUpdate }) {
  const [openSection, setOpenSection] = useState('documents');

  const handleToggleSection = (id, isOpen) => {
    if (isOpen) {
      setOpenSection(id);
      setTimeout(() => {
        document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else if (openSection === id) {
      setOpenSection(null);
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      {/* Compliance strip */}
      <ComplianceStrip protocol={protocol} onUpdate={onUpdate} />

      {/* 1 — Documents */}
      <RecordsSection
        id="documents"
        icon={FileText}
        title="Documents & References"
        subtitle="Consent forms, scientific literature, protocol PDFs, and regulatory files"
        color="#3b82f6"
        open={openSection === 'documents'}
        onToggle={(val) => handleToggleSection('documents', val)}
      >
        <ProtocolDocuments protocol={protocol} onUpdate={onUpdate} />
      </RecordsSection>

      {/* 2 — History */}
      <RecordsSection
        id="history"
        icon={History}
        title="Audit Log & Version History"
        subtitle="Every modification, publication, duplication, and prescription generation"
        color="#64748b"
        open={openSection === 'history'}
        onToggle={(val) => handleToggleSection('history', val)}
      >
        <ProtocolHistory protocol={protocol} onUpdate={onUpdate} />
      </RecordsSection>

    </div>
  );
}
