'use client';

import React, { useState, useEffect } from 'react';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import X from 'lucide-react/dist/esm/icons/x';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Pill from 'lucide-react/dist/esm/icons/pill';
import notifier from '../../services/NotificationService';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';

/**
 * GcpActiveRecommender
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-inspired Active Assist & Proactive Recommender.
 * Surfaces actionable clinical, pharmacological, or commercial insights
 * at the top of main views without waiting for operator prompts.
 *
 * @param {string} category - 'clinical' | 'cost' | 'adherence' | 'logistics' | 'security'
 * @param {string} title - Main recommendation headline
 * @param {string} description - Clinical or operational context
 * @param {string} impact - 'High Clinical Impact' | 'Cost Saving' | 'Refill Due' | 'Synergy'
 * @param {Object} action - { label: string, onClick?: Function, payload?: Object, type?: 'add-to-workspace'|'navigate'|'custom' }
 * @param {string} dismissKey - Key for localStorage persistence to not nag user if dismissed
 */
export default function GcpActiveRecommender({
  category = 'clinical',
  title,
  description,
  impact = 'Optimal Clinical Synergy',
  action,
  dismissKey,
  onDismiss,
  customIcon: CustomIcon,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { addItem, activeWorkspaceId } = useWorkspaceStore();

  useEffect(() => {
    if (dismissKey && typeof window !== 'undefined') {
      try {
        if (localStorage.getItem(`gcp_rec_dismissed_${dismissKey}`) === 'true') {
          setDismissed(true);
        }
      } catch (e) {}
    }
  }, [dismissKey]);

  if (dismissed || !title) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (dismissKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`gcp_rec_dismissed_${dismissKey}`, 'true');
      } catch (e) {}
    }
    onDismiss?.();
  };

  const handleAction = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    try {
      if (action?.type === 'add-to-workspace' && action.payload) {
        addItem(
          {
            id: `rec-${Date.now()}`,
            canonicalName: action.payload.name || 'Recommended Compound',
            dosage: action.payload.dosage || 'Standard',
            format: action.payload.format || 'Lyophilized Vial',
            quantity: action.payload.quantity || 1,
            unitPrice: action.payload.price || 0,
          },
          activeWorkspaceId,
          { openDrawer: true }
        );
        notifier.success(`Added "${action.payload.name}" to active Workspace!`);
      } else if (action?.onClick) {
        await action.onClick();
      }
    } catch (err) {
      console.error('Recommender action error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const themeConfig = {
    clinical: {
      bg: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
      border: '#99f6e4',
      accent: '#0d9488',
      iconBg: '#ccfbf1',
      badgeBg: '#e6fffa',
      badgeColor: '#0f766e',
      Icon: Pill,
    },
    cost: {
      bg: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
      border: '#bfdbfe',
      accent: '#2563eb',
      iconBg: '#dbeafe',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      Icon: TrendingUp,
    },
    adherence: {
      bg: 'linear-gradient(135deg, #fffbeb 0%, #f8fafc 100%)',
      border: '#fde68a',
      accent: '#d97706',
      iconBg: '#fef3c7',
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      Icon: AlertTriangle,
    },
  }[category] || {
    bg: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    border: '#cbd5e1',
    accent: '#003666',
    iconBg: '#e2e8f0',
    badgeBg: '#f1f5f9',
    badgeColor: '#334155',
    Icon: Sparkles,
  };

  const IconComponent = CustomIcon || themeConfig.Icon;

  return (
    <div
      className="gcp-active-recommender"
      style={{
        background: themeConfig.bg,
        border: `1px solid ${themeConfig.border}`,
        borderRadius: '10px',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 2px 6px rgba(0, 54, 102, 0.04)',
        flexWrap: 'wrap',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: themeConfig.iconBg,
            color: themeConfig.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <IconComponent size={18} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: themeConfig.badgeBg,
                color: themeConfig.badgeColor,
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${themeConfig.border}`,
              }}
            >
              GCP Active Assist • {impact}
            </span>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800 }}>
              {title}
            </strong>
          </div>

          {description && (
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              {description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {action && (
          <button
            type="button"
            onClick={handleAction}
            disabled={isExecuting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              minHeight: '36px',
              borderRadius: '7px',
              backgroundColor: themeConfig.accent,
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: isExecuting ? 'wait' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'opacity 0.15s ease',
              opacity: isExecuting ? 0.7 : 1,
            }}
          >
            <span>{isExecuting ? 'Applying...' : (action.label || 'Apply')}</span>
            <ChevronRight size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss recommendation"
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
