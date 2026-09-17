"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Percent, RefreshCw, Save, AlertCircle, Info, MapPin, Phone, Mail } from 'lucide-react';
import { getRecentEntitiesFast, updateRecipientDefaultMarkup } from '@/repositories/workspaceSearchRepository';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import notifier from '@/services/NotificationService';

export default function WorkspaceRecipientAccordion({
  isExpanded,
  onToggleExpand,
  activeWs,
  onSetIntent,
  onSetTargetEntity,
  onSetSelectedTargetType,
  isAdmin = false,
  isDoctor = false,
  isWholesaler = false,
  isPatient = false,
  stepperMode = false,
}) {
  const selectedTargetType = isDoctor ? 'patient' : (activeWs?.selectedTargetType || 'clinic');
  const targetEntity = activeWs?.targetEntity || null;
  const isBuy = !isDoctor && activeWs?.intent === 'buy';

  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingDefault, setIsSavingDefault] = useState(false);

  const recalculateWorkspacePrices = useWorkspaceStore((s) => s.recalculateWorkspacePrices);
  const setWorkspaceMarkup = useWorkspaceStore((s) => s.setWorkspaceMarkup);

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
    return (ent.name || ent.companyName || ent.fullName || '').toLowerCase().includes(q) ||
      (ent.city || '').toLowerCase().includes(q) ||
      (ent.email || '').toLowerCase().includes(q);
  });

  // Calculate current products effective margin in Workspace
  const workspaceProductsMargin = useMemo(() => {
    if (activeWs?.appliedMarkupPercent != null) {
      return Number(activeWs.appliedMarkupPercent);
    }
    const items = activeWs?.items || [];
    if (items.length === 0) {
      return activeWs?.pricingTier === 'wholesale' ? 25 : activeWs?.pricingTier === 'retail' ? 100 : activeWs?.pricingTier === 'cost' ? 0 : 50;
    }

    // Check if items have an explicit appliedMarkup
    const firstWithMarkup = items.find(it => it.appliedMarkup != null);
    if (firstWithMarkup) return Number(firstWithMarkup.appliedMarkup);

    // Calculate from first item with supplierCost and unitPrice
    const sample = items.find(it => it.supplierCost > 0 && it.unitPrice > 0);
    if (sample) {
      const calc = ((sample.unitPrice - sample.supplierCost) / sample.supplierCost) * 100;
      return Number(calc.toFixed(1));
    }

    return activeWs?.pricingTier === 'wholesale' ? 25 : activeWs?.pricingTier === 'retail' ? 100 : activeWs?.pricingTier === 'cost' ? 0 : 50;
  }, [activeWs?.appliedMarkupPercent, activeWs?.items, activeWs?.pricingTier]);

  // Target entity default markup
  const targetEntityDefaultMarkup = useMemo(() => {
    if (!targetEntity) return 50;
    if (targetEntity.priceMarkupPercent != null) return Number(targetEntity.priceMarkupPercent);
    if (targetEntity.markupPercent != null) return Number(targetEntity.markupPercent);
    if (targetEntity.type === 'wholeseller') return 25;
    if (targetEntity.type === 'patient') return 100;
    if (targetEntity.type === 'supplier') return 0;
    return 50;
  }, [targetEntity]);

  // Local active markup for the current workspace
  const [activeMarkupInput, setActiveMarkupInput] = useState(() => {
    return activeWs?.appliedMarkupPercent != null ? Number(activeWs.appliedMarkupPercent) : targetEntityDefaultMarkup;
  });

  useEffect(() => {
    if (targetEntity) {
      const current = activeWs?.appliedMarkupPercent != null ? Number(activeWs.appliedMarkupPercent) : targetEntityDefaultMarkup;
      setActiveMarkupInput(current);
    }
  }, [targetEntity?.id, targetEntityDefaultMarkup, activeWs?.appliedMarkupPercent]);

  // Discrepancy check: Workspace products margin vs target entity active markup
  const hasProducts = (activeWs?.items || []).length > 0;
  const hasMarginDiscrepancy = hasProducts && workspaceProductsMargin !== activeMarkupInput;
  const isModifiedFromDefault = targetEntity && activeMarkupInput !== targetEntityDefaultMarkup;

  const handleApplyRecalculate = (customVal = null) => {
    const val = customVal != null ? customVal : activeMarkupInput;
    if (val == null || isNaN(val)) return;
    const num = Number(val);
    setWorkspaceMarkup(num, activeWs.id, true);
    notifier.success(`✓ Precios de los productos recalculados con margen del +${num}% sobre coste`);
  };

  const handleSaveAsNewDefault = async () => {
    if (!targetEntity?.id) return;
    setIsSavingDefault(true);
    try {
      const success = await updateRecipientDefaultMarkup(targetEntity.id, targetEntity.type || selectedTargetType, activeMarkupInput);
      if (success) {
        onSetTargetEntity({
          ...targetEntity,
          priceMarkupPercent: activeMarkupInput,
          markupPercent: activeMarkupInput,
        });
        notifier.success(`✓ Margen del +${activeMarkupInput}% guardado como nuevo valor por defecto para ${targetEntity.name}`);
      } else {
        notifier.error('No se pudo guardar el nuevo margen por defecto');
      }
    } catch (e) {
      notifier.error('Error al guardar: ' + e.message);
    } finally {
      setIsSavingDefault(false);
    }
  };

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
              ✓ {targetEntity.name} {isAdmin && activeMarkupInput != null ? `(+${activeMarkupInput}%)` : ''}
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

          {/* 1. Products Margin Banner Status (Admin only) */}
          {isAdmin && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Percent size={14} style={{ color: '#0369a1' }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                  Margen actual en Workspace:
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#0369a1',
                    backgroundColor: '#e0f2fe',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    border: '1px solid #bae6fd',
                  }}
                >
                  +{workspaceProductsMargin}% sobre coste
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {(activeWs?.items || []).length} compound{(activeWs?.items || []).length === 1 ? '' : 's'}
              </span>
            </div>
          )}

          {/* Intent Toggle (Admin only) */}
          {isAdmin && (
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

          {/* Type Selector (when SELL intent in Commercial mode - Admin only) */}
          {isAdmin && !isBuy && (
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

          {/* 2. Selected Entity Card OR Search List */}
          {targetEntity ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '9px',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Users size={18} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        {targetEntity.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          textTransform: 'uppercase',
                        }}
                      >
                        {targetEntity.type}
                      </span>
                    </div>

                    {/* Contact & Logistics Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                      {(targetEntity.address || targetEntity.city) && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} style={{ flexShrink: 0, color: '#64748b' }} />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {targetEntity.address || `${targetEntity.city}, ${targetEntity.state || ''} ${targetEntity.zip || ''}`}
                          </span>
                        </div>
                      )}
                      {targetEntity.phone && (
                        <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} style={{ flexShrink: 0, color: '#64748b' }} />
                          <span>{targetEntity.phone}</span>
                        </div>
                      )}
                      {targetEntity.deliveryNotes && (
                        <div style={{ fontSize: '0.7rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '3px 6px', borderRadius: '4px', marginTop: '3px', lineHeight: 1.2 }}>
                          📦 {targetEntity.deliveryNotes}
                        </div>
                      )}
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
                    flexShrink: 0,
                  }}
                  title="Unassign recipient"
                >
                  ✕ Clear
                </button>
              </div>

              {/* Commercial Margin Configuration Panel for this Recipient (Admin only) */}
              {isAdmin && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #bae6fd',
                    borderRadius: '9px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      Margen Comercial para este Workspace
                    </div>
                    <div style={{ fontSize: '0.71rem', color: '#64748b' }}>
                      Por defecto del cliente: <strong>+{targetEntityDefaultMarkup}% sobre coste</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>+</span>
                    <input
                      type="number"
                      value={activeMarkupInput}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setActiveMarkupInput(val);
                      }}
                      style={{
                        width: '65px',
                        padding: '4px 6px',
                        fontSize: '0.86rem',
                        fontWeight: 900,
                        textAlign: 'center',
                        borderRadius: '6px',
                        border: '1.5px solid #0284c7',
                        outline: 'none',
                        color: '#003666',
                        backgroundColor: '#f0f9ff',
                      }}
                    />
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>%</span>

                    <button
                      type="button"
                      onClick={() => handleApplyRecalculate()}
                      style={{
                        marginLeft: '4px',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="Recalcular precios con este margen"
                    >
                      <RefreshCw size={11} /> Aplicar
                    </button>
                  </div>
                </div>

                {/* Discrepancy Alert & Fast Recalculate CTA */}
                {hasMarginDiscrepancy && (
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '7px',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#92400e', fontWeight: 700 }}>
                      <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                      <span>Los productos tienen tarifa previa (+{workspaceProductsMargin}%). ¿Deseas recalcularlos al +{activeMarkupInput}%?</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyRecalculate()}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ⚡ Recalcular productos (+{activeMarkupInput}%)
                    </button>
                  </div>
                )}

                {/* Save as New Default for this Recipient */}
                {isModifiedFromDefault && (
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '7px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ fontSize: '0.73rem', color: '#166534', fontWeight: 600 }}>
                      Has ajustado el margen a <strong>+{activeMarkupInput}%</strong> (antes +{targetEntityDefaultMarkup}%).
                    </div>

                    <button
                      type="button"
                      disabled={isSavingDefault}
                      onClick={handleSaveAsNewDefault}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '5px',
                        border: '1px solid #86efac',
                        backgroundColor: '#ffffff',
                        color: '#15803d',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: isSavingDefault ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Save size={11} /> {isSavingDefault ? 'Guardando...' : `Guardar por defecto`}
                    </button>
                  </div>
                )}
              </div>
              )}
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

              {/* Entity Results with Explicit Default Margin Badges */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {loading ? (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.74rem', color: '#64748b' }}>Loading records...</div>
                ) : filteredEntities.length === 0 ? (
                  <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>No entities found</div>
                ) : (
                  filteredEntities.map(ent => {
                    const entDefaultMarkup = ent.priceMarkupPercent ?? ent.markupPercent ?? (
                      ent.type === 'wholeseller' ? 25 :
                      ent.type === 'patient' ? 100 :
                      ent.type === 'supplier' ? 0 : 50
                    );

                    return (
                      <div
                        key={ent.id}
                        onClick={() => {
                          const markupToUse = entDefaultMarkup;
                          onSetTargetEntity({
                            id: ent.id,
                            name: ent.name || ent.companyName || ent.fullName || ent.displayName,
                            type: ent.type || (isBuy ? 'supplier' : selectedTargetType),
                            address: ent.address || ent.shippingAddress || '',
                            shippingAddress: ent.shippingAddress || ent.address || '',
                            city: ent.city || '',
                            state: ent.state || '',
                            zip: ent.zip || '',
                            email: ent.email || '',
                            phone: ent.phone || ent.mobile || '',
                            deliveryNotes: ent.deliveryNotes || ent.shippingNotes || '',
                            priceMarkupPercent: markupToUse,
                            markupPercent: markupToUse,
                            pricingTier: ent.pricingTier || (ent.type === 'wholeseller' ? 'wholesale' : ent.type === 'patient' ? 'retail' : 'clinic'),
                          });

                          // If workspace already has products and user selects a recipient, trigger auto recalculation or sync
                          if (hasProducts && workspaceProductsMargin !== markupToUse) {
                            handleApplyRecalculate(markupToUse);
                          }

                          setSearchQuery('');
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '7px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                              {ent.name || ent.companyName || ent.fullName || ent.displayName}
                            </span>
                            {ent.city && (
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                ({ent.city})
                              </span>
                            )}
                          </div>

                          {/* Default Commercial Margin Badge (Admin only) or Entity Type Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: ent.type === 'wholeseller' ? '#ffedd5' : ent.type === 'patient' ? '#f5f3ff' : '#ecfdf5',
                                color: ent.type === 'wholeseller' ? '#9a3412' : ent.type === 'patient' ? '#6b21a8' : '#047857',
                                border: `1px solid ${ent.type === 'wholeseller' ? '#fed7aa' : ent.type === 'patient' ? '#e9d5ff' : '#a7f3d0'}`,
                              }}
                            >
                              {isAdmin ? (
                                <>🏷️ Margen por defecto: +{entDefaultMarkup}% sobre coste</>
                              ) : (
                                <>{ent.type === 'wholeseller' ? 'Wholesaler' : ent.type === 'patient' ? 'Patient' : 'Clinic'}</>
                              )}
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800, flexShrink: 0 }}>
                          Select →
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
