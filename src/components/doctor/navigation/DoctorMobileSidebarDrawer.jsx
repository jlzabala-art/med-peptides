'use client';

import React from 'react';
import { ShieldCheck, Copy, Eye, Share2, Sparkles } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import UnifiedMobileSidebarDrawer from '@/components/shared/public/UnifiedMobileSidebarDrawer';

export default function DoctorMobileSidebarDrawer({
  isOpen,
  onClose,
  doctor,
  sidebarNavGroups = [],
  activeAnchor,
  onNavigate,
  onOpenCredentials,
  onCopyIntakeLink,
  onOpenIntake,
}) {
  if (!isOpen || !doctor) return null;

  const initial = doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D';

  const headerContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#003666',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.9rem',
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#202124',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {doctor.name}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>Clinical Operations</div>
      </div>
    </div>
  );

  return (
    <UnifiedMobileSidebarDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={doctor.name || 'Clinical Operations'}
      headerContent={headerContent}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {sidebarNavGroups.map((group, gIdx) => (
          <div key={group.groupTitle || group.group || gIdx} className="gcp-sb-section">
            <div className="gcp-sb-section-title gcp-sb-section-title--static" style={{ paddingLeft: '0.5rem' }}>
              {group.groupTitle || group.group}
            </div>
            <div className="gcp-sb-items" style={{ paddingRight: 0 }}>
              {(group.items || []).map((item) => {
                const Icon = item.icon;
                const isActive = activeAnchor === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClose?.();
                      onNavigate?.(item.id);
                    }}
                    className={`gcp-sb-item ${isActive ? 'is-active' : ''}`}
                    style={{ minHeight: '42px' }}
                  >
                    <span className="gcp-sb-item-main">
                      {Icon && (
                        <span className="gcp-sb-item-icon">
                          <Icon size={16} />
                        </span>
                      )}
                      <span className="gcp-sb-item-label">{item.label}</span>
                    </span>
                    {typeof item.badge === 'number' && <span className="gcp-sb-count">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Unified Clinical Actions Footer */}
        <div className="gcp-sb-card" style={{ background: '#f8f9fa', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {doctor.license && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                padding: '6px 10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: '#1e8e3e' }} />
                <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600 }}>DHA:</span>
                <span style={{ fontSize: '0.72rem', color: '#202124', fontWeight: 600, fontFamily: 'monospace' }}>
                  {doctor.license}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(doctor.license);
                  }
                  toast.success('DHA License copied');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#5f6368' }}
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
                onClose?.();
                onOpenCredentials?.();
              }}
              className="gcp-btn-secondary"
              style={{ justifyContent: 'center', color: '#3c4043', background: '#ffffff', padding: '0.45rem 0.6rem', fontSize: '0.76rem' }}
            >
              <Eye size={13} />
              <span>Full Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onCopyIntakeLink?.();
              }}
              className="gcp-btn-secondary"
              style={{ justifyContent: 'center', color: '#3c4043', background: '#ffffff', padding: '0.45rem 0.6rem', fontSize: '0.76rem' }}
            >
              <Share2 size={13} />
              <span>Share Intake</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenIntake?.();
            }}
            className="gcp-btn-primary"
            style={{ width: '100%', justifyContent: 'center', minHeight: '42px' }}
          >
            <Sparkles size={15} />
            <span>New Prescription Intake</span>
          </button>
        </div>
      </div>
    </UnifiedMobileSidebarDrawer>
  );
}
