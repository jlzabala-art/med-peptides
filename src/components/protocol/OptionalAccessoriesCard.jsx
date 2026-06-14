import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import Package from "lucide-react/dist/esm/icons/package";
import Syringe from "lucide-react/dist/esm/icons/syringe";
import React, { useState, memo } from 'react';




import { motion, AnimatePresence } from 'framer-motion';

const OPTIONAL_ACCESSORIES = [
  { id: 'bac_water_10ml',  label: 'Bacteriostatic Water 10 mL', detail: '1 vial per compound reconstituted', Icon: Droplets,  color: '#0369a1' },
  { id: 'insulin_syringe', label: 'Insulin Syringes 1 mL (x10)',detail: '29–31 gauge, ½" needle recommended', Icon: Syringe,   color: '#7c3aed' },
  { id: 'alcohol_pads',    label: 'Alcohol Prep Pads (x50)',    detail: '70% isopropyl, sterile',            Icon: Package,   color: '#047857' },
];

export const OptionalAccessoriesCard = memo(function OptionalAccessoriesCard() {
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
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Recommended Accessories</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence initial={false}>
      {open && (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
        >
        <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {OPTIONAL_ACCESSORIES.map(acc => (
            <div key={acc.id} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', padding: '0.65rem', background: 'var(--color-bg-app)', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `${acc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <acc.Icon size={13} color={acc.color} />
              </div>
              <div style={{ flex: 1, marginTop: '-2px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.15rem' }}>{acc.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{acc.detail}</div>
              </div>
            </div>
          ))}
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
});

export default OptionalAccessoriesCard;