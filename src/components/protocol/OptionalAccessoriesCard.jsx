/* eslint-disable no-unused-vars */
import React, { memo, useState } from 'react';
import { Droplets, Syringe, Package, ChevronUp, ChevronDown } from 'lucide-react';

const OPTIONAL_ACCESSORIES = [
  { id: 'bac_water_10ml',  label: 'Bacteriostatic Water 10 mL', detail: '1 vial per compound reconstituted', Icon: Droplets,  color: '#0369a1' },
  { id: 'insulin_syringe', label: 'Insulin Syringes 1 mL (x10)',detail: '29–31 gauge, ½" needle recommended', Icon: Syringe,   color: '#7c3aed' },
  { id: 'alcohol_pads',    label: 'Alcohol Prep Pads (x50)',    detail: '70% isopropyl, sterile',            Icon: Package,   color: '#047857' },
];

const OptionalAccessoriesCard = memo(function OptionalAccessoriesCard() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="proto-sidebar-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          color: 'var(--color-text-primary)',
        }}
        aria-expanded={open}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.82rem' }}>
          <Syringe size={15} style={{ color: '#7c3aed' }} />
          Optional Accessories
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-tertiary)',
        }}>
          {open ? 'Hide' : 'Show'} {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.6rem 1rem 0.9rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginBottom: '0.7rem', lineHeight: 1.5 }}>
            Recommended consumables for subcutaneous administration and reconstitution.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {OPTIONAL_ACCESSORIES.map(({ id, label, detail, Icon, color }) => (
              <div key={id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                borderRadius: 8, background: `${color}08`,
                border: `1px solid ${color}22`,
                padding: '0.55rem 0.7rem',
              }}>
                <Icon size={15} style={{ color, flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>{label}</div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '0.63rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem', lineHeight: 1.4,
            borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem',
          }}>
            These items are included in the full bundle calculator above.
          </p>
        </div>
      )}
    </div>
  );
});

export default OptionalAccessoriesCard;
