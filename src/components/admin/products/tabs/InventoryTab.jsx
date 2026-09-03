import React from 'react';
import { Card, StatusChip, Button } from '../../../ui';
import { Box, PackageOpen, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, Building, Truck, Globe, ExternalLink, RefreshCw, Layers } from '@/lib/icons';

export default function InventoryTab({ form = {}, setForm }) {
  const stock = Number(form.stock || 0);
  const reservedStock = Number(form.reservedStock || 0);
  const availableStock = Math.max(0, stock - reservedStock);

  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Current Stock</span>
            <input
              type="number"
              value={form.stock}
              onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})}
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #334155', outline: 'none' }}
            />
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Reserved</span>
            <input
              type="number"
              value={form.reservedStock}
              onChange={e => setForm({...form, reservedStock: parseInt(e.target.value) || 0})}
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', backgroundColor: 'transparent', border: 'none', outline: 'none' }}
              disabled
            />
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Incoming</span>
            <input
              type="number"
              value={form.incomingStock}
              onChange={e => setForm({...form, incomingStock: parseInt(e.target.value) || 0})}
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #334155', outline: 'none' }}
            />
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #374151', borderRadius: '8px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Available</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: availableStock > 0 ? '#10b981' : '#ef4444' }}>
              {availableStock}
            </div>
          </div>
        </div>

        {/* Reorder point and limit details */}
        <Card padding="md" style={{ backgroundColor: '#0f172a', borderColor: '#e2e8f0' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Reorder Safety Limits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Reorder Point (Threshold)</label>
              <input type="number" value={form.reorderPoint} onChange={e => setForm({...form, reorderPoint: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Safety Stock Level</label>
              <input type="number" value={form.safetyStock} onChange={e => setForm({...form, safetyStock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Logistics Warehouse Center</label>
              <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#0f172a', color: '#0f172a' }}>
                <option value="Poland">Poland Logistics Center</option>
                <option value="UAE-Dubai">Dubai FreeZone Center</option>
                <option value="USA-Delaware">USA East Logistics</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 9. Forecast Panel (with mini graph) */}
        <Card padding="md" style={{ border: '1px solid #3b82f644', backgroundColor: '#1e3a8a15' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={16} color="#60a5fa" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>AI Inventory Forecast Panel</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', fontSize: '0.8rem', color: '#475569' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Average Monthly Sales:</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{form.avgMonthlySales} units</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Lead Time:</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{form.supplierLeadTime} Days</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Days Remaining (Run-Out):</span>
              <strong style={{ fontSize: '1rem', color: form.stock < form.reorderPoint ? '#ef4444' : '#10b981' }}>
                {Math.round((form.stock / (form.avgMonthlySales || 1)) * 30)} Days
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Next Estimated Stockout:</span>
              <strong style={{ fontSize: '1rem', color: '#f59e0b' }}>July 14, 2026</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Suggested Reorder Date:</span>
              <strong style={{ fontSize: '1rem', color: '#60a5fa' }}>June 30, 2026</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '3px' }}>Suggested Quantity (EOQ):</span>
              <strong style={{ fontSize: '1rem', color: '#10b981' }}>250 units</strong>
            </div>
          </div>

          {/* Mini Graph/Sparkline Simulation */}
          <div style={{ marginTop: '1.5rem', height: '60px', borderTop: '1px solid #1e293b', paddingTop: '1rem', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', width: '60px' }}>Sales Trend:</span>
            {[34, 45, 52, 40, 48, 55, 62, 59, 70, 68, 75, 82].map((val, idx) => (
              <div key={idx} style={{
                flex: 1,
                height: `${(val / 100) * 100}%`,
                backgroundColor: idx === 11 ? '#60a5fa' : '#3b82f644',
                borderRadius: '2px 2px 0 0',
                position: 'relative'
              }} title={`Month ${idx+1}: ${val} units`}>
                <div style={{ display: 'none', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#000', color: '#0f172a', fontSize: '8px', padding: '2px 4px', borderRadius: '2px' }}>{val}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
}
