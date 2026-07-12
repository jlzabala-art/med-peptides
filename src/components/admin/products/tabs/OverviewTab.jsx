import React from 'react';
import { Card, StatusChip, Button } from '../../../ui';
import { Box, PackageOpen, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, Building, Truck, Globe, ExternalLink, RefreshCw, Layers } from '@/lib/icons';

export default function OverviewTab({ form, setForm }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* General Info integrated into Overview */}
        <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Product General Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Product Name</label>
              <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Category</label>
              <select value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>Product Type</label>
              <select value={form.product_type || ''} onChange={e => setForm({...form, product_type: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#fff' }}>
                <option value="Peptide">Peptide</option>
                <option value="Supplement">Supplement</option>
                <option value="Diagnostic Kit">Diagnostic Kit</option>
                <option value="Service">Medical Service</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Description</label>
              <button
                onClick={() => triggerAiAction('description')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #8b5cf6',
                  backgroundColor: 'transparent',
                  color: '#c084fc',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={10} /> Auto-Generate
              </button>
            </div>
            <textarea rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', backgroundColor: '#0f172a', color: '#fff' }} />
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Supplier & Origins</span>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Primary: <strong style={{ color: '#fff' }}>{form.supplier || 'N/A'}</strong></div>
              <div>Backup: <strong style={{ color: '#fff' }}>{form.backupSupplier || 'N/A'}</strong></div>
              <div>Lead Time: <strong style={{ color: '#fff' }}>{form.supplierLeadTime || 0} Days</strong></div>
              <div>Warehouse: <strong style={{ color: '#fff' }}>{form.warehouse || 'N/A'}</strong></div>
            </div>
          </Card>

          {/* Pricing Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Cost & Margins</span>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Cost: <strong style={{ color: '#fff' }}>${cost}</strong></div>
              <div>Retail (Margin): <strong style={{ color: getMarginColor(marginRetail) }}>${retail} ({marginRetail.toFixed(0)}%)</strong></div>
              <div>Clinic (Margin): <strong style={{ color: getMarginColor(marginClinic) }}>${clinic} ({marginClinic.toFixed(0)}%)</strong></div>
              <div>Distributor: <strong style={{ color: getMarginColor(marginDistributor) }}>${distributor} ({marginDistributor.toFixed(0)}%)</strong></div>
            </div>
          </Card>

          {/* Inventory Summary Card */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Stock & Supply</span>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Current Stock: <strong style={{ color: '#fff' }}>{form.stock} units</strong></div>
              <div>Available: <strong style={{ color: '#34d399' }}>{availableStock} units</strong></div>
              <div>Reserved: <strong style={{ color: '#f59e0b' }}>{form.reservedStock} units</strong></div>
              <div>Incoming: <strong style={{ color: '#60a5fa' }}>{form.incomingStock} units</strong></div>
            </div>
          </Card>
        </div>

        {/* Global Compliance Status & Zoho Sync Logs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '#f8fafc', fontWeight: 600 }}>Regional Compliance Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
              {[
                { name: 'UAE', status: form.reg_uae },
                { name: 'KSA', status: form.reg_ksa },
                { name: 'Qatar', status: form.reg_qatar },
                { name: 'EU', status: form.reg_eu }
              ].map(c => (
                <div key={c.name} style={{
                  padding: '6px 4px',
                  borderRadius: '4px',
                  backgroundColor: '#1f2937',
                  border: `1px solid ${c.status === 'Approved' ? '#10b98133' : '#f59e0b33'}`
                }}>
                  <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '2px' }}>{c.name}</div>
                  <span style={{ color: c.status === 'Approved' ? '#34d399' : '#f59e0b', fontWeight: 600 }}>{c.status}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', borderTop: '1px solid #1f2937', paddingTop: '0.75rem' }}>
              <div>COA Compliance: <span style={{ color: form.docStatus_coa === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{form.docStatus_coa}</span></div>
              <div>MSDS: <span style={{ color: form.docStatus_msds === 'Approved' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{form.docStatus_msds}</span></div>
              <div>AI Score: <span style={{ color: '#a78bfa', fontWeight: 700 }}>{completionPercent}/100</span></div>
            </div>
          </Card>

          {/* Zoho Status overview */}
          <Card padding="md" style={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '#f8fafc', fontWeight: 600 }}>Zoho Books Connected Status</h4>
              <StatusChip status={form.zohoSyncStatus === 'Synced' ? 'Active' : 'Warning'} label={form.zohoSyncStatus || 'Not Synced'} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Zoho ID:</span>
                <strong>{form.zohoId || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Last Sync Log:</span>
                <strong>{form.zohoLastSync || 'Never'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Inventory Sync:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{form.zohoInventorySync || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Price Sync:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{form.zohoPriceSync || 'N/A'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
}
