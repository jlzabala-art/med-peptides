"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useDrawer } from '../../context/DrawerContext';
import { Layers, ArrowRight, Clock, FlaskConical, Zap, UserPlus, ShoppingCart } from '@/lib/icons';

// Icons








const COMPLEXITY_COLORS = {
  Beginner: { color: 'var(--color-success, #10b981)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  Intermediate: { color: 'var(--color-warning, #f59e0b)', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  Advanced: { color: '#e11d48', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.3)' },
  'Multi-Phase': { color: '#7c3aed', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
};

function ComplexityBadge({ level }) {
  const theme = COMPLEXITY_COLORS[level] || COMPLEXITY_COLORS.Intermediate;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem',
      borderRadius: 99,
      background: theme.bg,
      color: theme.color,
      border: `1px solid ${theme.border}`,
      letterSpacing: '0.03em',
    }}>
      {level || 'Intermediate'}
    </span>
  );
}

export default function UniversalProtocolCard({
  protocol,
  onView,
  onAssign,
  onPurchase
}) {
  const [hovered, setHovered] = useState(false);
  
  const { userProfile, isProfessional } = useAuth();
  const { isTenantMode } = useTenant();
  const { openDrawer } = useDrawer();

  // Determine Role Context
  const role = isTenantMode ? 'wholesaler' 
             : userProfile?.role === 'doctor' ? 'doctor'
             : userProfile?.role === 'patient' ? 'patient'
             : isProfessional ? 'professional' 
             : 'retail';

  // Normalize data
  const gradient = protocol.gradient || 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)';
  const glowColor = protocol.glowColor || 'rgba(14,165,233,0.12)';
  const compounds = protocol.compounds || [];

  // Open the global rx-builder drawer with this protocol pre-loaded
  const openRxBuilder = (e) => {
    e.stopPropagation();
    openDrawer('rx-builder', 'new', {
      initialProtocol: protocol,
      initialProtocolId: protocol.id,
      initialProtocolName: protocol.name || protocol.title,
      sourceModule: 'protocol-card',
    });
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    // Doctor and admin: open the Rx Builder
    if (role === 'doctor' || role === 'admin' || role === 'professional') {
      openRxBuilder(e);
    } else if ((role === 'retail' || role === 'patient') && onPurchase) {
      onPurchase(protocol);
    } else if (onView) {
      onView(protocol.slug || protocol.id);
    }
  };

  const renderCTA = () => {
    if (role === 'doctor' || role === 'admin' || role === 'professional') {
      return (
        <button style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          padding: '0.65rem', borderRadius: 10,
          background: 'var(--primary)', color: 'white', border: 'none',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
        }} onClick={openRxBuilder}>
          New Prescription <UserPlus size={14} />
        </button>
      );
    }
    
    return (
      <button style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        padding: '0.65rem', borderRadius: 10,
        background: hovered ? gradient : 'var(--surface, white)',
        border: hovered ? 'none' : '1px solid var(--border-light, #e2e8f0)',
        color: hovered ? 'white' : 'var(--text-muted)',
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.25s ease'
      }} onClick={handleActionClick}>
        View Full Protocol <ArrowRight size={14} />
      </button>
    );
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface, white)',
        border: '1px solid var(--border-light, #e2e8f0)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 48px ${glowColor}` : '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 4, background: gradient }} />

      <div style={{ padding: '1.25rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', color: 'white'
          }}>
            {protocol.goalIcon || <FlaskConical size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)',
              marginBottom: '0.2rem', lineHeight: 1.25,
            }}>
              {protocol.title}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {protocol.goal}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <ComplexityBadge level={protocol.complexity} />
        </div>

        <p style={{
          fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {protocol.summary || protocol.description}
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        borderTop: '1px solid var(--border-light, #e2e8f0)',
        borderBottom: '1px solid var(--border-light, #e2e8f0)',
      }}>
        {[
          { icon: Clock, label: 'Duration', value: protocol.duration || 'N/A' },
          { icon: Layers, label: 'Compounds', value: `${protocol.compoundCount || compounds.length} items` },
          { icon: Zap, label: 'Commitment', value: protocol.commitment || 'Varies' },
        ].map(({ icon: Icon, label, value }, i) => (
          <div key={label} style={{
            padding: '0.75rem 0.5rem',
            borderRight: i < 2 ? '1px solid var(--border-light, #e2e8f0)' : 'none',
            textAlign: 'center',
          }}>
            <Icon size={13} color="var(--text-muted)" style={{ display: 'block', margin: '0 auto 0.3rem' }} />
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 700, lineHeight: 1.2 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <FlaskConical size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
        {compounds.slice(0, 4).map((c, idx) => (
          <span key={idx} style={{
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
            background: 'var(--bg-app, #f8fafc)', border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: 6, padding: '0.15rem 0.45rem',
          }}>
            {typeof c === 'string' ? c : c.name}
          </span>
        ))}
        {compounds.length > 4 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>+{compounds.length - 4}</span>}
      </div>

      <div style={{ padding: '0 1.25rem 1.25rem', marginTop: 'auto' }}>
        {renderCTA()}
      </div>
    </div>
  );
}
