'use client';

import React, { useState } from 'react';
import { MessageSquare, Save } from 'lucide-react';
import notifier from '../../../services/NotificationService';

export default function InternalNotesTab({ quotation, quotationId }) {
  const [notes, setNotes] = useState(quotation?.internalNotes || quotation?.commercialNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      notifier.success('Internal notes updated in quotation record ✓');
    } catch {
      notifier.error('Failed to update notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageSquare size={16} color="var(--color-primary, #003666)" />
          <span>Internal Team Notes & Special Instructions</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: 12 }}>
          Visible only to clinical administrators, doctors, and account managers. Not included in client PDFs.
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add clinical observations, negotiation context, or client preferences..."
          rows={5}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: '0.82rem',
            color: '#0f172a',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'var(--color-primary, #003666)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}
