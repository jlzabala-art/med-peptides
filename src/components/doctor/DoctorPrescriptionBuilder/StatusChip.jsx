import React from 'react';
import { RX_STATUS_META } from '../../../config/prescriptionConfig';

export default // ── Mini status badge ─────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const m = RX_STATUS_META[status] || RX_STATUS_META.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.65rem', borderRadius: '999px',
      background: m.bg, color: m.color,
      fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.03em',
    }}>
      {m.emoji} {m.label}
    </span>
  );
}
