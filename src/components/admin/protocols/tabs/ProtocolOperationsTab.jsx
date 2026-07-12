"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ProtocolProducts from './ProtocolProducts';
import ProtocolCostLogistics from './ProtocolCostLogistics';
import { ChevronDown, ChevronUp, Package, DollarSign, Sparkles } from '@/lib/icons';

// ── Collapsible Section (matches ClinicalTab UX) ──────────────────────────────
function OpsSection({ id, icon: Icon, title, subtitle, color = '#7c3aed', defaultOpen = false, open, onToggle, children }) {
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
      {/* Section header */}
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

      {/* Animated content */}
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

// ── Operations summary KPIs ───────────────────────────────────────────────────
function OperationsSummary({ protocol }) {
  // Gather products
  const products = protocol?.phases?.flatMap(phase => phase.items || []) || protocol?.products || [];
  
  // Calculate total cost
  const totalCost = protocol?.estimated_cost_eur ?? (products.reduce((s, p) => s + (p.unit_cost || p.cost || 45) * (p.quantity || 1), 0));
  
  // Margins
  const b2cPrice = protocol?.b2c_price || (totalCost * 2.5);
  const hasMargin = b2cPrice && totalCost;
  const margin = hasMargin ? Math.round(((b2cPrice - totalCost) / b2cPrice) * 100) : 60;

  const kpis = [
    { label: 'Products',      value: products.length || '0', sub: 'in protocol' },
    { label: 'Est. Cost',     value: totalCost ? `€${totalCost.toFixed(0)}` : '€0', sub: 'per patient' },
    { label: 'B2C Margin',    value: `${margin}%`, sub: 'approx.' },
    { label: 'Supplier Lead', value: protocol?.lead_time_days ? `${protocol.lead_time_days}d` : '3-5d', sub: 'avg lead time' },
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
  const [openSection, setOpenSection] = useState('products');

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
        id="products"
        icon={Package}
        title="Products & Vial Requirements"
        subtitle="Compound list by phase, quantities, supplier, and kit breakdown"
        color="#7c3aed"
        open={openSection === 'products'}
        onToggle={(val) => handleToggleSection('products', val)}
      >
        <ProtocolProducts protocol={protocol} onUpdate={onUpdate} />
      </OpsSection>

      {/* 2 — Cost & Logistics */}
      <OpsSection
        id="cost"
        icon={DollarSign}
        title="Cost Simulation & Logistics"
        subtitle="B2B / B2C pricing, margins, inventory impact, and supplier lead times"
        color="#059669"
        open={openSection === 'cost'}
        onToggle={(val) => handleToggleSection('cost', val)}
      >
        <ProtocolCostLogistics protocol={protocol} onUpdate={onUpdate} />
      </OpsSection>

    </div>
  );
}
