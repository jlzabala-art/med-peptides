'use client';
import React from 'react';
import { ALL_ROLES } from '../../stores/useSimulationStore';

export default function RoleBadge({ role, style = {}, className = '' }) {
  if (!role) return null;
  
  const normalizedRole = role.toLowerCase();
  const roleData = ALL_ROLES.find(r => r.id === normalizedRole) || ALL_ROLES.find(r => r.id === 'guest');
  
  const bg = roleData?.bg || '#f1f5f9';
  const color = roleData?.color || '#475569';
  
  return (
    <span 
      className={className}
      style={{ 
        padding: '0.2rem 0.6rem', 
        borderRadius: '16px', 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        background: bg, 
        color: color, 
        border: `1px solid ${color}33`,
        ...style 
      }}
    >
      {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
    </span>
  );
}
