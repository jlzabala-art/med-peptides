import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import Package from 'lucide-react/dist/esm/icons/package';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

import ProtocolProducts from './ProtocolProducts';
import ProtocolCostLogistics from './ProtocolCostLogistics';

// ── Collapsible Section (same pattern as ClinicalTab) ────────────────────────
function OpsSection({ icon: Icon, title, subtitle, color = 'var(--primary)', defaultOpen = false, children }) {
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

// ── Operations summary KPIs ───────────────────────────────────────────────────
function OperationsSummary({ protocol }) {
  const products   = protocol?.products || [];
  const totalCost  = protocol?.estimated_cost_eur ?? (products.reduce((s, p) => s + (p.unit_cost || 0) * (p.quantity || 1), 0));
  const hasMargin  = protocol?.b2c_price && totalCost;
  const margin     = hasMargin ? Math.round(((protocol.b2c_price - totalCost) / protocol.b2c_price) * 100) : null;

  const kpis = [
    { label: 'Products',      value: products.length || '—', sub: 'in protocol' },
    { label: 'Est. Cost',     value: totalCost ? `€${totalCost.toFixed(0)}` : '—', sub: 'per patient' },
    { label: 'B2C Margin',    value: margin !== null ? `${margin}%` : '—', sub: 'approx.' },
    { label: 'Supplier Lead', value: protocol?.lead_time_days ? `${protocol.lead_time_days}d` : '—', sub: 'avg lead time' },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem',
      padding: '0.85rem 0',
    }}>
      {kpis.map(({ label, value, sub }) => (
        <div key={label} style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
          padding: '0.75rem 1rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>{value}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>{label}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolOperationsTab({ protocol, onUpdate }) {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

      {/* Atlas AI tip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
        padding: '0.75rem 1rem', borderRadius: '10px',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
      }}>
        <Sparkles size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '0.8rem', color: '#15803d', lineHeight: 1.5 }}>
          <strong>Atlas AI:</strong> Based on the clinical design, the estimated product set and cost simulation are pre-calculated below. Review and adjust before generating prescriptions.
        </span>
      </div>

      {/* Summary KPIs */}
      <OperationsSummary protocol={protocol} />

      {/* 1 — Products */}
      <OpsSection
        icon={Package}
        title="Products & Vial Requirements"
        subtitle="Compound list by phase, quantities, supplier, and kit breakdown"
        color="#7c3aed"
        defaultOpen
      >
        <ProtocolProducts protocol={protocol} onUpdate={onUpdate} />
      </OpsSection>

      {/* 2 — Cost & Logistics */}
      <OpsSection
        icon={DollarSign}
        title="Cost Simulation & Logistics"
        subtitle="B2B / B2C pricing, margins, inventory impact, and supplier lead times"
        color="#059669"
      >
        <ProtocolCostLogistics protocol={protocol} onUpdate={onUpdate} />
      </OpsSection>

    </div>
  );
}
