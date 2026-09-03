"use client";

import React, { useState } from 'react';
import { usePatientBiomarkers } from '../../../hooks/data/usePatientBiomarkers';
import { patientRepository } from '../../../repositories/patientRepository';
import notifier from '../../../services/NotificationService';
import { logger } from '../../../utils/logger';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend
} from 'recharts';
import { Activity, Plus, FlaskConical } from 'lucide-react';

const MARKER_CONFIG = {
  testosterone: { label: 'Testosterone (Free)', unit: 'pg/mL', color: '#0ea5e9', normal: [8, 25] },
  hba1c: { label: 'HbA1c', unit: '%', color: '#10b981', normal: [4.5, 5.7] },
  igf1: { label: 'IGF-1', unit: 'ng/mL', color: '#f59e0b', normal: [100, 300] },
  cortisol: { label: 'Cortisol', unit: 'μg/dL', color: '#8b5cf6', normal: [10, 20] },
  bmi: { label: 'BMI', unit: 'kg/m²', color: '#ef4444', normal: [18.5, 24.9] },
};

const ADD_SCHEMA = [
  { name: 'marker', label: 'Biomarker', type: 'select', required: true, options: Object.entries(MARKER_CONFIG).map(([v, c]) => ({ value: v, label: c.label })) },
  { name: 'value', label: 'Value', type: 'number', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
];

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

export default function BiomarkersPanel({ patientId, patientName, prescriptions = [] }) {
  const { byMarker, loading } = usePatientBiomarkers(patientId);
  const [activeMarker, setActiveMarker] = useState('testosterone');
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ marker: 'testosterone', value: '', date: new Date().toISOString().split('T')[0] });

  const markerKeys = Object.keys(MARKER_CONFIG);
  const series = byMarker[activeMarker] || [];
  const config = MARKER_CONFIG[activeMarker];

  // Create reference areas for protocol periods
  const protocolBands = prescriptions
    .filter(rx => rx.createdAt)
    .map(rx => {
      const start = rx.createdAt.toDate ? rx.createdAt.toDate() : new Date(rx.createdAt);
      const end = new Date(start);
      end.setDate(end.getDate() + (rx.durationDays || 90));
      return { start, end, name: rx.protocolName || 'Protocol' };
    })
    .slice(0, 3); // max 3 overlays

  const chartData = series.map(pt => ({
    date: formatDate(pt.date),
    value: Number(pt.value),
    timestamp: pt.date?.getTime?.() || 0,
  }));

  async function handleAddBiomarker(e) {
    e.preventDefault();
    if (!formData.value || !formData.date) return;
    try {
      await patientRepository.addBiomarkerEntry(patientId, {
        marker: formData.marker,
        value: Number(formData.value),
        unit: MARKER_CONFIG[formData.marker]?.unit || '',
        date: new Date(formData.date),
      });
      notifier.success('Biomarker entry saved');
      setShowAdd(false);
      setFormData({ marker: 'testosterone', value: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      notifier.error('Failed to save biomarker');
      logger.error('Failed to save biomarker in BiomarkersPanel', { error: err.message });
    }
  }


  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={18} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Biomarkers & Digital Twin</h3>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.85rem', backgroundColor: showAdd ? '#fee2e2' : 'var(--primary)', color: showAdd ? '#dc2626' : 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
        >
          <Plus size={13} /> {showAdd ? 'Cancel' : 'Log Result'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAddBiomarker} style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Biomarker</label>
            <select value={formData.marker} onChange={e => setFormData(p => ({ ...p, marker: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
              {Object.entries(MARKER_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Value ({MARKER_CONFIG[formData.marker]?.unit})</label>
            <input type="number" value={formData.value} onChange={e => setFormData(p => ({ ...p, value: e.target.value }))} step="any" required style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.6rem', width: '100px', fontSize: '0.85rem' }} placeholder="e.g. 14.2" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
          </div>
          <button type="submit" style={{ padding: '0.45rem 1rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Save</button>
        </form>
      )}

      {/* Marker selector tabs */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {markerKeys.map(k => (
          <button
            key={k}
            onClick={() => setActiveMarker(k)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              border: `1.5px solid ${activeMarker === k ? MARKER_CONFIG[k].color : 'var(--border)'}`,
              backgroundColor: activeMarker === k ? MARKER_CONFIG[k].color : 'transparent',
              color: activeMarker === k ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {MARKER_CONFIG[k].label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem' }}>Loading biomarkers...</div>
        ) : chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <Activity size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No {config.label} results logged yet.</p>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Click "Log Result" to add bloodwork data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit={config.unit} width={60} />
              <Tooltip
                contentStyle={{ fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                formatter={(val) => [`${val} ${config.unit}`, config.label]}
              />
              {/* Normal range references */}
              {config.normal && (
                <>
                  <ReferenceLine y={config.normal[1]} stroke="#16a34a" strokeDasharray="4 2" label={{ value: 'Max', fontSize: 10, fill: '#16a34a' }} />
                  <ReferenceLine y={config.normal[0]} stroke="#dc2626" strokeDasharray="4 2" label={{ value: 'Min', fontSize: 10, fill: '#dc2626' }} />
                </>
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2.5}
                dot={{ r: 4, fill: config.color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Protocol overlay legend */}
        {protocolBands.length > 0 && chartData.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {protocolBands.map((pb, i) => (
              <span key={i} style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#f5f3ff', color: '#7c3aed', borderRadius: '12px', fontWeight: 600 }}>
                📋 {pb.name}: {formatDate(pb.start)} – {formatDate(pb.end)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
