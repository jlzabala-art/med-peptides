"use client";

import React from 'react';
import { useDrawer } from '../../context/DrawerContext';
import { ExternalLink, User, FileText, Stethoscope, FlaskConical } from 'lucide-react';

const TYPE_CONFIG = {
  doctor: {
    icon: Stethoscope,
    color: '#0d9488',
    bg: '#f0fdfa',
    drawerType: 'physician',
    label: 'Doctor'
  },
  physician: {
    icon: Stethoscope,
    color: '#0d9488',
    bg: '#f0fdfa',
    drawerType: 'physician',
    label: 'Doctor'
  },
  prescription: {
    icon: FileText,
    color: '#2563eb',
    bg: '#eff6ff',
    drawerType: 'prescription',
    label: 'Prescription'
  },
  protocol: {
    icon: FlaskConical,
    color: '#7c3aed',
    bg: '#f5f3ff',
    drawerType: 'protocol',
    label: 'Protocol'
  },
  patient: {
    icon: User,
    color: '#0369a1',
    bg: '#f0f9ff',
    drawerType: 'patient',
    label: 'Patient'
  }
};

/**
 * EntityLink
 * Universal component that renders a styled badge linking to another entity
 * profile. Clicking opens the entity's drawer without leaving context.
 * 
 * Usage:
 *   <EntityLink type="doctor" id={physicianId} label={physicianName} />
 *   <EntityLink type="prescription" id={rx.id} label={rx.protocolName} />
 */
export default function EntityLink({ type, id, label, size = 'sm' }) {
  const { openDrawer } = useDrawer();
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.patient;
  const Icon = config.icon;

  if (!id) return null;

  const displayLabel = label || config.label;

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    openDrawer(config.drawerType, id);
  };

  const isSm = size === 'sm';

  return (
    <button
      onClick={handleClick}
      title={`Open ${config.label} Profile`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSm ? '2px 8px' : '4px 12px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}30`,
        borderRadius: '20px',
        fontSize: isSm ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        textDecoration: 'none',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        maxWidth: '200px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = config.color;
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = config.bg;
        e.currentTarget.style.color = config.color;
      }}
    >
      <Icon size={isSm ? 10 : 12} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {displayLabel}
      </span>
      <ExternalLink size={isSm ? 9 : 10} style={{ opacity: 0.7, flexShrink: 0 }} />
    </button>
  );
}
