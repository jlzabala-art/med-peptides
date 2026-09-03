"use client";
import React from 'react';
import { Building2, MapPin, Users, DollarSign, Eye } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';

const TIER_COLORS = {
  Platinum: { bg: '#f1f5f9', color: '#1e293b', border: '#cbd5e1' },
  Gold:     { bg: '#fefce8', color: '#92400e', border: '#fde68a' },
  Silver:   { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

function formatVolume(val) {
  if (!val) return '—';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val}`;
}

export default function MobileClinicCard({ row: clinic, onRowClick }) {
  const name = clinic.name || clinic.legalName || 'Unnamed Clinic';
  const typeLabel = clinic.type ? clinic.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Longevity Clinic';
  const location = [clinic.city, clinic.country].filter(Boolean).join(', ') || clinic.streetAddress || 'Location on file';
  const physicians = clinic.assignedPhysiciansCount || (clinic.assignedPhysicianIds && clinic.assignedPhysicianIds.length) || 0;

  const rawStatus = String(clinic.status || 'active').toLowerCase();
  let badgeStatus = 'active';
  if (rawStatus === 'active' || rawStatus === 'approved') badgeStatus = 'active';
  else if (rawStatus === 'onboarding' || rawStatus === 'pending') badgeStatus = 'pending';
  else if (rawStatus === 'inactive' || rawStatus === 'archived') badgeStatus = 'inactive';
  else if (rawStatus === 'suspended') badgeStatus = 'error';

  return (
    <div
      onClick={() => onRowClick && onRowClick(clinic)}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        padding: '12px 14px',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        cursor: 'pointer',
        transition: 'transform 0.12s ease'
      }}
    >
      {/* Header: Name, Type, Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
            <Building2 size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.90rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '1px' }}>
              {typeLabel}
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <StatusBadge status={badgeStatus} label={clinic.status || 'Active'} />
        </div>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#475569' }}>
        <MapPin size={12} color="#64748b" style={{ flexShrink: 0 }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location}</span>
      </div>

      {/* Contact + Actions row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 700 }}>
            👨‍⚕️ {physicians} {physicians === 1 ? 'Physician' : 'Physicians'}
          </span>
          {clinic.phone && (
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              • 📞 {clinic.phone}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRowClick && onRowClick(clinic); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc', fontSize: '0.72rem', fontWeight: 700,
            color: '#003666', cursor: 'pointer'
          }}
        >
          <Eye size={12} />
          Profile
        </button>
      </div>
    </div>
  );
}
