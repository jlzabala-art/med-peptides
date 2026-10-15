"use client";

import React from 'react';
import { X, ShieldCheck, Copy, Eye, Share2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorMobileSidebarDrawer({
  isOpen,
  onClose,
  doctor,
  sidebarNavGroups = [],
  activeAnchor,
  onNavigate,
  onOpenCredentials,
  onCopyIntakeLink,
  onOpenIntake
}) {
  if (!isOpen || !doctor) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        background: 'rgba(32, 33, 36, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '320px',
          maxWidth: '85vw',
          height: '100dvh',
          maxHeight: '100dvh',
          background: '#ffffff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            flexShrink: 0,
            padding: '16px 20px',
            borderBottom: '1px solid #dadce0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0
              }}
            >
              {doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {doctor.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Clinical Operations</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '12px 0'
          }}
        >
          {sidebarNavGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '14px' }}>
              <div
                style={{
                  padding: '6px 20px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#5f6368',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                {group.groupTitle || group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeAnchor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate(item.id);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #1a73e8' : '3px solid transparent',
                      background: isActive ? '#e8f0fe' : 'transparent',
                      color: isActive ? '#1a73e8' : '#3c4043',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={18} style={{ color: isActive ? '#1a73e8' : '#5f6368' }} />
                      <span>{item.label}</span>
                    </div>
                    {typeof item.badge === 'number' && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isActive ? '#1a73e8' : '#e8eaed',
                          color: isActive ? '#ffffff' : '#3c4043'
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile Drawer Fixed Footer */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid #dadce0',
            background: '#f8fafc',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {doctor.license && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} style={{ color: '#0d9488' }} />
                <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>DHA:</span>
                <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{doctor.license}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  navigator.clipboard?.writeText(doctor.license);
                  toast.success('DHA License copied ✓');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                title="Copy DHA license"
              >
                <Copy size={13} />
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCredentials) onOpenCredentials();
              }}
              style={{
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Eye size={13} />
              <span>Full Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onCopyIntakeLink) onCopyIntakeLink();
              }}
              style={{
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Share2 size={13} />
              <span>Share Intake</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenIntake) onOpenIntake();
            }}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '6px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
            }}
          >
            <Sparkles size={16} />
            <span>New Prescription Intake</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              height: '34px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#5f6368',
              fontSize: '0.80rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
            <span>Close Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
