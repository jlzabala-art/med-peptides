"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Truck,
  X,
  Search,
  Check
} from '@/lib/icons';
import { getRecentEntitiesFast } from '@/repositories/workspaceSearchRepository';

export default function WorkspaceRecipientAccordion({
  isExpanded,
  onToggleExpand,
  activeWs,
  onSetIntent,
  onSetTargetEntity,
  onSetSelectedTargetType,
  isDoctor = false,
  stepperMode = false,
}) {
  const selectedTargetType = isDoctor ? 'patient' : (activeWs?.selectedTargetType || 'clinic');
  const targetEntity = activeWs?.targetEntity || null;
  const isBuy = !isDoctor && activeWs?.intent === 'buy';

  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const typeToFetch = isBuy ? 'supplier' : selectedTargetType;

    getRecentEntitiesFast(typeToFetch)
      .then(res => {
        if (isMounted) {
          setEntities(res || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [isBuy, selectedTargetType]);

  const filteredEntities = entities.filter(ent => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (ent.name || '').toLowerCase().includes(q) ||
      (ent.city || '').toLowerCase().includes(q) ||
      (ent.email || '').toLowerCase().includes(q);
  });

  return (
    <div
      style={{
        backgroundColor: stepperMode ? 'transparent' : '#ffffff',
        border: stepperMode ? 'none' : '1px solid #cbd5e1',
        borderRadius: stepperMode ? '0' : '12px',
        overflow: stepperMode ? 'visible' : 'hidden',
        boxShadow: stepperMode ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        flex: stepperMode ? 1 : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header (Hidden in Stepper Mode) */}
      {!stepperMode && (
        <div
          onClick={onToggleExpand}
          style={{
            padding: '0.85rem 1.1rem',
            backgroundColor: '#ffffff',
            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
            {isExpanded ? (
              <ChevronDown size={18} style={{ color: isDoctor ? '#0d9488' : '#003666', flexShrink: 0 }} />
            ) : (
              <ChevronRight size={18} style={{ color: '#64748b', flexShrink: 0 }} />
            )}
            <Users size={17} style={{ flexShrink: 0, color: isDoctor ? '#0f766e' : '#003666' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isDoctor ? '#0f766e' : '#003666', lineHeight: 1 }}>
              {isDoctor ? 'Target Patient' : 'Operational Routing & Recipient'}
            </span>
          </div>

          {targetEntity ? (
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✓ {targetEntity.name}
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#d97706',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '3px 8px',
                borderRadius: '99px',
              }}
            >
              + Assign {isDoctor ? 'Patient' : ''}
            </span>
          )}
        </div>
      )}

      {/* Body Content */}
      {(isExpanded || stepperMode) && (
        <div style={{
          padding: stepperMode ? '0.25rem 0' : '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backgroundColor: stepperMode ? 'transparent' : '#ffffff',
          flex: stepperMode ? 1 : 'none',
        }}>
          {/* Intent Toggle (Only in Admin/Commercial mode) */}
          {!isDoctor && (
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '9px' }}>
              <button
                type="button"
                onClick={() => onSetIntent('sell')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: !isBuy ? '#003666' : 'transparent',
                  color: !isBuy ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  touchAction: 'manipulation',
                }}
              >
                <DollarSign size={14} /> SELL (Quote / Rx)
              </button>
              <button
                type="button"
                onClick={() => onSetIntent('buy')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: isBuy ? '#c2410c' : 'transparent',
                  color: isBuy ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  touchAction: 'manipulation',
                }}
              >
                <Truck size={14} /> BUY (Supplier PO)
              </button>
            </div>
          )}

          {/* Type Selector (when SELL intent in Commercial mode) */}
          {!isDoctor && !isBuy && (
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              {[
                { type: 'clinic', label: '🏥 Clinic' },
                { type: 'wholeseller', label: '🏢 Wholesaler' },
                { type: 'patient', label: '👤 Patient' },
                { type: 'doctor', label: '🩺 Doctor' },
              ].map(tab => {
                const isCurrent = selectedTargetType === tab.type;
                return (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => onSetSelectedTargetType(tab.type)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      fontSize: '0.72rem',
                      fontWeight: isCurrent ? 800 : 600,
                      backgroundColor: isCurrent ? '#ffffff' : 'transparent',
                      color: isCurrent ? '#003666' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      touchAction: 'manipulation',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Entity Card or Search Input */}
          {targetEntity ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '9px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>
                  {targetEntity.type === 'supplier' ? '🏭' : targetEntity.type === 'clinic' ? '🏥' : targetEntity.type === 'wholeseller' ? '🏢' : '👤'}
                </span>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1e293b' }}>{targetEntity.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
                    {targetEntity.type} {targetEntity.city ? `• ${targetEntity.city}, ${targetEntity.state || ''}` : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSetTargetEntity(null)}
                style={{
                  border: 'none',
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '5px 9px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                ✕ Clear
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={`Search ${isBuy ? 'suppliers' : selectedTargetType + 's'} by name...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>

              <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {loading ? (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.74rem', color: '#64748b' }}>Loading records...</div>
                ) : filteredEntities.length === 0 ? (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>No entities found</div>
                ) : (
                  filteredEntities.map(ent => (
                    <div
                      key={ent.id}
                      onClick={() => {
                        onSetTargetEntity({
                          id: ent.id,
                          name: ent.name || ent.displayName,
                          type: ent.type || (isBuy ? 'supplier' : selectedTargetType),
                          address: ent.address || '',
                          city: ent.city || '',
                          state: ent.state || '',
                          zip: ent.zip || '',
                          email: ent.email || '',
                        });
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        touchAction: 'manipulation',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{ent.name || ent.displayName}</span>
                        {ent.city && <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px' }}>({ent.city})</span>}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>Select →</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
