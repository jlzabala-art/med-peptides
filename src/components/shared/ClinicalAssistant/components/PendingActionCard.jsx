import React, { useState } from 'react';

/**
 * PendingActionCard — Confirmation UI for AdminAI write actions.
 *
 * Displays an amber warning card with the proposed change.
 * The admin must click "Confirm" or "Cancel".
 *
 * Props:
 *  - pendingAction   { fn, args, previewText }
 *  - onConfirm(pendingAction)  → called when admin confirms
 *  - onCancel()
 */
export default function PendingActionCard({ pendingAction, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);

  if (!pendingAction) return null;

  const { previewText, fn, args } = pendingAction;

  // Build a human-readable summary of the change
  const summary = buildSummary(fn, args);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm(pendingAction);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.icon}>⚠️</span>
        <span style={styles.title}>Acción pendiente de confirmación</span>
      </div>

      {/* Preview */}
      <div style={styles.body}>
        <p style={styles.previewText}>{previewText}</p>

        {summary && (
          <div style={styles.detailGrid}>
            {summary.map(({ label, value }) => (
              <React.Fragment key={label}>
                <span style={styles.detailLabel}>{label}</span>
                <span style={styles.detailValue}>{value}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Warning note */}
      <p style={styles.warning}>
        ⚠️ Esta acción modificará datos en Firestore y quedará registrada en el audit log.
      </p>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...styles.cancelBtn }}
          onClick={onCancel}
          disabled={loading}
        >
          ✕ Cancelar
        </button>
        <button
          style={{ ...styles.btn, ...styles.confirmBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? '⏳ Ejecutando…' : '✓ Confirmar y aplicar'}
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSummary(fn, args) {
  if (!fn || !args) return null;
  switch (fn) {
    case 'update_product_price':
      return [
        { label: 'Producto',  value: args.product_id },
        { label: 'Tier',      value: args.tier },
        { label: 'Precio nuevo', value: `$${args.new_price}` },
      ];
    case 'update_product_cost':
      return [
        { label: 'Producto',     value: args.product_id },
        { label: 'Coste nuevo',  value: `$${args.new_cost}` },
      ];
    default:
      return null;
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  card: {
    background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))',
    border: '1.5px solid rgba(251,191,36,0.45)',
    borderRadius: '14px',
    padding: '16px 18px',
    marginTop: '10px',
    boxShadow: '0 4px 20px rgba(251,191,36,0.12)',
    fontFamily: 'Inter, system-ui, sans-serif',
    animation: 'fadeSlideIn 0.25s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  icon: {
    fontSize: '18px',
  },
  title: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#d97706',
    letterSpacing: '0.01em',
  },
  body: {
    marginBottom: '12px',
  },
  previewText: {
    fontSize: '13.5px',
    color: 'var(--text-primary, #f1f5f9)',
    margin: '0 0 10px 0',
    lineHeight: '1.55',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '4px 14px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  detailLabel: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  detailValue: {
    fontSize: '13px',
    color: '#f3f4f6',
    fontWeight: '500',
  },
  warning: {
    fontSize: '11.5px',
    color: '#f59e0b',
    margin: '0 0 14px 0',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  btn: {
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  cancelBtn: {
    background: 'rgba(255,255,255,0.08)',
    color: '#9ca3af',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  confirmBtn: {
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
  },
};
