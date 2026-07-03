import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import History from 'lucide-react/dist/esm/icons/history';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';

import ProtocolDocuments from './ProtocolDocuments';
import ProtocolHistory from './ProtocolHistory';

// ── Collapsible Section ───────────────────────────────────────────────────────
function RecordsSection({ icon: Icon, title, subtitle, color = 'var(--primary)', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '14px',
      overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none',
          padding: '1rem 1.25rem',
          background: open ? `color-mix(in srgb, ${color} 8%, var(--surface))` : 'var(--surface)',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: open ? color : 'var(--text-main)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{subtitle}</div>}
        </div>
        {open
          ? <ChevronUp size={18} color="var(--text-muted)" />
          : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compliance status strip ───────────────────────────────────────────────────
function ComplianceStrip({ protocol }) {
  const docs   = protocol?.documents || [];
  const logs   = protocol?.audit_log || [];

  const checks = [
    {
      label: 'Consent Form',
      done: docs.some(d => d.type === 'consent'),
      action: 'Add consent form',
    },
    {
      label: 'Scientific Reference',
      done: docs.some(d => d.type === 'reference'),
      action: 'Add PubMed reference',
    },
    {
      label: 'Protocol PDF',
      done: docs.some(d => d.type === 'protocol'),
      action: 'Upload protocol PDF',
    },
    {
      label: 'Audit Trail',
      done: logs.length > 0 || !!protocol?.createdAt,
      action: 'Changes will appear automatically',
    },
  ];

  const pct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
  const color = pct === 100 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

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
        {checks.map(c => (
          <div key={c.label} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem', borderRadius: '8px',
            background: c.done ? '#f0fdf4' : 'var(--surface-raised, #f8fafc)',
            border: `1px solid ${c.done ? '#bbf7d0' : 'var(--border)'}`,
          }}>
            <span style={{ fontSize: '0.9rem' }}>{c.done ? '✅' : '⚪'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: c.done ? '#15803d' : 'var(--text-main)' }}>{c.label}</div>
              {!c.done && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.action}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolRecordsTab({ protocol, onUpdate }) {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      {/* Compliance strip */}
      <ComplianceStrip protocol={protocol} />

      {/* 1 — Documents */}
      <RecordsSection
        icon={FileText}
        title="Documents & References"
        subtitle="Consent forms, scientific literature, protocol PDFs, and regulatory files"
        color="#3b82f6"
        defaultOpen
      >
        <ProtocolDocuments protocol={protocol} onUpdate={onUpdate} />
      </RecordsSection>

      {/* 2 — History */}
      <RecordsSection
        icon={History}
        title="Audit Log & Version History"
        subtitle="Every modification, publication, duplication, and prescription generation"
        color="#64748b"
      >
        <ProtocolHistory protocol={protocol} onUpdate={onUpdate} />
      </RecordsSection>

    </div>
  );
}
