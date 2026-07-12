import React from 'react';
import { Card, StatusChip, Button } from '../../../ui';
import { Box, PackageOpen, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, Building, Truck, Globe, ExternalLink, RefreshCw, Layers } from '@/lib/icons';

export default function RegulatoryTab({ form, setForm }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Compliance Dashboard Card */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Compliance Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Global Registration Status</label>
              <select value={form.registrationStatus} onChange={e => setForm({...form, registrationStatus: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="Registered">Registered</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Expiry Date of current license</label>
              <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
          </div>

          {/* Regional country matrix flags / badges */}
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Middle East & Global Markets Registration Status</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {[
              { id: 'reg_uae', label: 'UAE Market' },
              { id: 'reg_ksa', label: 'KSA Market' },
              { id: 'reg_qatar', label: 'Qatar Market' },
              { id: 'reg_kuwait', label: 'Kuwait Market' },
              { id: 'reg_bahrain', label: 'Bahrain' },
              { id: 'reg_oman', label: 'Oman' },
              { id: 'reg_eu', label: 'European Union' },
              { id: 'reg_us', label: 'United States' }
            ].map(market => (
              <div key={market.id} style={{
                padding: '10px 8px',
                borderRadius: '6px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{market.label}</span>
                <select
                  value={form[market.id]}
                  onChange={e => setForm({ ...form, [market.id]: e.target.value })}
                  style={{
                    padding: '2px 4px',
                    fontSize: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: form[market.id] === 'Approved' ? '#34d399' : form[market.id] === 'Pending' ? '#f59e0b' : form[market.id] === 'Rejected' ? '#ef4444' : '#64748b',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Registered">Not Reg</option>
                </select>
              </div>
            ))}
          </div>
        </Card>

        {/* Certificate matrices */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Compliance Documents Checklist</h3>
            <button
              onClick={() => triggerAiAction('parse_coa')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px dashed #3b82f6',
                backgroundColor: '#3b82f615',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <UploadCloud size={14} /> Upload & Parse CoA (AI)
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { id: 'docStatus_coa', label: 'CoA (Analysis)' },
              { id: 'docStatus_msds', label: 'MSDS Certificate' },
              { id: 'docStatus_gmp', label: 'GMP Certificate' },
              { id: 'docStatus_iso', label: 'ISO Standards' },
              { id: 'docStatus_stability', label: 'Stability Studies' },
              { id: 'docStatus_shelflife', label: 'Shelf Life Study' }
            ].map(doc => (
              <div key={doc.id} style={{
                padding: '10px 8px',
                borderRadius: '6px',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{doc.label}</span>
                <select
                  value={form[doc.id]}
                  onChange={e => setForm({ ...form, [doc.id]: e.target.value })}
                  style={{
                    padding: '2px 4px',
                    fontSize: '0.75rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: form[doc.id] === 'Approved' ? '#34d399' : form[doc.id] === 'Pending' ? '#f59e0b' : form[doc.id] === 'Expired' ? '#ef4444' : '#94a3b8',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Internal Compliance Notes</label>
            <textarea rows={3} value={form.regulatoryNotes} onChange={e => setForm({...form, regulatoryNotes: e.target.value})} placeholder="Notes regarding inspections, approvals..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff', resize: 'vertical' }} />
          </div>
        </Card>
      </div>
    );
}
