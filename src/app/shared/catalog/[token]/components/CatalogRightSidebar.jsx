'use client';

import React, { useState } from 'react';
import { Target, Landmark, ShieldCheck, Check, X, RotateCcw, Sparkles, Filter, ChevronRight, QrCode, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

const GOAL_EMOJIS = {
  weight_loss_glp1: '⚖️',
  fat_loss: '🔥',
  metabolic_health: '⚡',
  anti_aging_longevity: '🧬',
  recovery_healing: '🩹',
  tissue_repair: '🩹',
  cognitive_mood: '🧠',
  cognitive: '🧠',
  hormonal_optimization: '⚖️',
  muscle_growth: '💪',
  performance_muscle: '💪',
  skin_hair_aesthetics: '✨',
  hair_scalp: '💧',
  immune_support: '🛡️',
  general_health: '🌿',
  general_wellness: '🌿'
};

const FDA_STATUS_CONFIG = [
  {
    id: 'all',
    label: 'All Regulatory Profiles',
    badge: 'ALL',
    color: '#003666',
    bg: '#f1f5f9',
    borderColor: '#cbd5e1',
    description: 'Complete evaluated portfolio'
  },
  {
    id: 'fda_approved',
    label: 'FDA Approved APIs',
    badge: 'FDA APPROVED',
    color: '#16a34a',
    bg: '#f0fdf4',
    borderColor: '#bbf7d0',
    description: 'NDA/ANDA approved active ingredients (GLP-1s, etc.)'
  },
  {
    id: 'fda_pcac_503a_recommended',
    label: '503A PCAC Recommended',
    badge: '503A PCAC ✓',
    color: '#0d9488',
    bg: '#f0fdfa',
    borderColor: '#99f6e4',
    description: 'Evaluated by FDA Pharmacy Compounding Advisory Committee'
  },
  {
    id: 'clinical_investigational',
    label: 'Clinical Investigational (IND)',
    badge: 'IND PHASE II/III',
    color: '#2563eb',
    bg: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Active FDA/EMA clinical trial protocols'
  },
  {
    id: 'research_analytical_standard',
    label: 'Analytical Reference Standards',
    badge: 'HPLC ≥99%',
    color: '#64748b',
    bg: '#f8fafc',
    borderColor: '#e2e8f0',
    description: 'High-purity reference materials & reagents'
  }
];

export default function CatalogRightSidebar({
  availableGoals = [],
  selectedGoals = [],
  toggleGoal,
  clearGoals,
  fdaFilter = 'all',
  setFdaFilter,
  fdaStatusCounts = {},
  totalProductsCount = 0,
  displayedCount = 0,
  isOpenMobile = false,
  onCloseMobile = () => {},
  t = (k) => k
}) {
  const activeGoalsCount = selectedGoals.length;
  const isFdaActive = fdaFilter && fdaFilter !== 'all';
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        triggerHaptic('copy');
        setCopiedUrl(true);
        toast.success('Catalog URL copied to clipboard ✓');
        setTimeout(() => setCopiedUrl(false), 2000);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://med-peptides.com/catalog';

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── CARD 1: CLINICAL GOALS & THERAPEUTIC INDICATIONS ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Target size={16} style={{ color: '#003666' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
              CLINICAL GOALS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeGoalsCount > 0 && (
              <>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#1d4ed8',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '1px 6px',
                  borderRadius: '99px'
                }}>
                  {activeGoalsCount}
                </span>
                <button
                  type="button"
                  onClick={clearGoals}
                  title="Reset goal filters"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    color: '#64748b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  <RotateCcw size={10} /> Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Goals List */}
        <div style={{
          padding: '0.6rem 0.5rem',
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          {availableGoals.length === 0 ? (
            <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
              No goal categories available
            </div>
          ) : (
            availableGoals.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              const emoji = GOAL_EMOJIS[goal.id] || '🎯';

              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '7px',
                    border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {/* Checkbox indicator */}
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '4px',
                      border: isSelected ? '1px solid #003666' : '1.5px solid #cbd5e1',
                      background: isSelected ? '#003666' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={11} color="#ffffff" strokeWidth={3} />}
                    </div>

                    <span style={{ fontSize: '0.78rem', color: isSelected ? '#003666' : '#334155', fontWeight: isSelected ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ marginRight: '5px' }}>{emoji}</span>
                      {goal.label}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isSelected ? '#003666' : '#94a3b8',
                    background: isSelected ? '#dbeafe' : '#f1f5f9',
                    padding: '1px 6px',
                    borderRadius: '99px',
                    flexShrink: 0,
                    fontFamily: 'monospace'
                  }}>
                    {goal.count}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── CARD 2: FDA & REGULATORY STATUSES ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Landmark size={16} style={{ color: '#003666' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
              FDA REGULATORY STATUS
            </span>
          </div>

          {isFdaActive && (
            <button
              type="button"
              onClick={() => setFdaFilter('all')}
              title="Reset FDA filter"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              <RotateCcw size={10} /> Reset
            </button>
          )}
        </div>

        {/* FDA Status List */}
        <div style={{
          padding: '0.6rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {FDA_STATUS_CONFIG.map((status) => {
            const isSelected = fdaFilter === status.id;
            const count = status.id === 'all'
              ? (totalProductsCount || availableGoals.reduce((acc, g) => acc + g.count, 0) || 0)
              : (fdaStatusCounts[status.id] || 0);

            return (
              <button
                key={status.id}
                type="button"
                onClick={() => setFdaFilter(status.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isSelected ? `1.5px solid ${status.color}` : '1px solid #f1f5f9',
                  background: isSelected ? status.bg : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#ffffff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                  {/* Radio indicator */}
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: isSelected ? `4px solid ${status.color}` : '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    flexShrink: 0,
                    marginTop: '2px'
                  }} />

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: isSelected ? status.color : '#0f172a', fontWeight: isSelected ? 800 : 600 }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px', lineHeight: 1.35 }}>
                      {status.description}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: isSelected ? status.color : '#64748b',
                  background: isSelected ? '#ffffff' : '#f1f5f9',
                  border: `1px solid ${isSelected ? status.borderColor : '#e2e8f0'}`,
                  padding: '1px 7px',
                  borderRadius: '99px',
                  flexShrink: 0,
                  fontFamily: 'monospace',
                  marginLeft: '6px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CARD 3: INSTITUTIONAL QR & DIRECT VERIFICATION ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.85rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <QrCode size={15} style={{ color: '#003666' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              INSTITUTIONAL QR
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#003666', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
            SSOT 2026
          </span>
        </div>

        <div style={{
          display: 'inline-block',
          padding: '8px',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <QRCodeSVG 
            value={currentUrl}
            size={95}
            level="M"
            includeMargin={false}
          />
        </div>

        <p style={{ margin: '8px 0 10px 0', fontSize: '0.70rem', color: '#64748b', lineHeight: 1.4 }}>
          Scan with mobile device for bedside or pharmacy dispensing access.
        </p>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: copiedUrl ? '#f0fdf4' : '#f8fafc',
            color: copiedUrl ? '#16a34a' : '#334155',
            border: copiedUrl ? '1px solid #86efac' : '1px solid #cbd5e1',
            cursor: 'pointer'
          }}
        >
          {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
          <span>{copiedUrl ? 'Copied ✓' : 'Copy Catalog Link'}</span>
        </button>
      </div>

      {/* Quick Summary Pill */}
      <div style={{
        padding: '0.65rem 0.85rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '0.70rem',
        color: '#64748b',
        lineHeight: 1.5
      }}>
        <strong style={{ color: '#0f172a' }}>Filter Active:</strong> Showing {displayedCount} of {totalProductsCount} catalog formulations.
      </div>

    </div>
  );

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR (Hidden on mobile < 1024px) ── */}
      <aside
        className="catalog-desktop-sidebar"
        style={{
          position: 'sticky',
          top: '84px',
          width: '310px',
          flexShrink: 0,
          alignSelf: 'flex-start'
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── MOBILE SLIDE-OVER DRAWER (Visible when triggered from bottom bar) ── */}
      {isOpenMobile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120 }}>
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              animation: 'fadeIn 0.2s ease'
            }}
          />

          {/* Drawer Panel */}
          <div style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            width: '88vw',
            maxWidth: '380px',
            background: '#f8fafc',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 121,
            animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1rem 1.25rem',
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} style={{ color: '#003666' }} />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  Filter Catalog
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  ({displayedCount} items)
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              {sidebarContent}
            </div>

            {/* Drawer Footer CTA */}
            <div style={{ padding: '1rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={onCloseMobile}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#003666',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 54, 102, 0.25)'
                }}
              >
                Apply Filters ({displayedCount} Matches)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
