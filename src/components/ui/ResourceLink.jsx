"use client";
import React from 'react';
import { User, Pill, FileText, Package, CheckCircle, ChevronRight, Stethoscope } from 'lucide-react';
import { useDrawer } from '../../context/DrawerContext';

const ICONS = {
  patient: User,
  product: Pill,
  prescription: FileText,
  order: Package,
  doctor: Stethoscope
};

export default function ResourceLink({ type, id, label, icon: CustomIcon, className = '', style = {} }) {
  const { openDrawer } = useDrawer();

  const handleOpen = (e) => {
    e.stopPropagation(); // prevent row click events
    openDrawer(type, id);
  };

  const IconComponent = CustomIcon || ICONS[type] || ChevronRight;

  return (
    <button
      onClick={handleOpen}
      className={`resource-link-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.15rem 0.5rem',
        backgroundColor: 'var(--bg-secondary, #f1f5f9)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '16px',
        fontSize: '0.85rem',
        color: 'var(--color-primary, #003666)',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style
      }}
      title={`View ${type} details`}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #e0f2fe)';
        e.currentTarget.style.borderColor = 'var(--color-primary, #003666)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #f1f5f9)';
        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
      }}
    >
      <IconComponent size={12} style={{ opacity: 0.7 }} />
      <span>{label || id}</span>
    </button>
  );
}
