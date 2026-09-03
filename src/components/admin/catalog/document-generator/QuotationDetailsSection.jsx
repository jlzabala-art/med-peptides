'use client';
import React from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { User, Calendar, FileText, Hash } from 'lucide-react';

export default function QuotationDetailsSection({
  clients = [],
  clientsLoading = false,
  clientId,
  setClientId,
  recipientName,
  setRecipientName,
  validUntil,
  setValidUntil,
  commercialNotes,
  setCommercialNotes,
  isMobile,
}) {
  const clientOptions = [
    { value: '', label: '— Custom Recipient (No linked client) —', subLabel: '' },
    ...clients.map(c => ({
      value: c.id,
      label: c.name || c.email || c.id,
      subLabel: [c.email, c.type, c.country].filter(Boolean).join(' · '),
    })),
  ];

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: isMobile ? '14px' : '16px 18px',
      marginBottom: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span>🧾 Quotation & Client Details</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Client Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Linked Client / Account
          </label>
          <SearchableSelect
            options={clientOptions}
            value={clientId}
            onChange={setClientId}
            placeholder={clientsLoading ? 'Loading clients…' : 'Search client by name, email or type…'}
            disabled={clientsLoading}
          />
        </div>

        {/* Custom Recipient Name & Validity Date */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Recipient / Institution Name
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Alex Vance / BioVitality Clinic"
              value={recipientName || ''}
              onChange={e => setRecipientName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Prices Valid Until
            </label>
            <input
              type="date"
              value={validUntil || ''}
              onChange={e => setValidUntil(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Commercial Terms / Notes */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Commercial Notes & Payment Terms
          </label>
          <textarea
            rows={2}
            placeholder="e.g. 50% upfront, 50% upon dispatch. Validity 30 days."
            value={commercialNotes || ''}
            onChange={e => setCommercialNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </div>
  );
}
