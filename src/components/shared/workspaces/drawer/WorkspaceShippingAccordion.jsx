"use client";

import React, { useMemo, useState } from 'react';
import {
  Truck,
  ChevronDown,
  ChevronRight,
  MapPin,
  FileText,
  Package,
  Navigation,
  Zap,
  Check,
  Edit3,
  X,
  Warehouse,
} from '@/lib/icons';
import { estimateWorkspaceLogistics } from '@/utils/logisticsEstimator';

export default function WorkspaceShippingAccordion({
  isExpanded,
  onToggleExpand,
  activeWs,
  onUpdateShipping,
  stepperMode = false,
}) {
  const [isManualMode, setIsManualMode] = useState(false);
  const [customCostInput, setCustomCostInput] = useState('');

  const items = activeWs?.items || [];
  const shippingAddress = activeWs?.shippingAddress || '';
  const shippingNotes = activeWs?.shippingNotes || '';

  // ── Run predictive logistics engine ─────────────────────────────────
  const logistics = useMemo(() => {
    return estimateWorkspaceLogistics(activeWs, items);
  }, [
    activeWs?.targetEntity,
    activeWs?.shippingAddress,
    activeWs?.selectedShippingOptionId,
    activeWs?.selectedWarehouseId,
    activeWs?.shippingCostOverride,
    items.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    items.map((it) => it.supplierName || it.supplier).join(','),
  ]);

  const {
    estimatedCost,
    isManualOverride,
    selectedOption,
    availableOptions,
    originHub,
    activeWarehouse,
    availableWarehouses,
    destinationRegion,
    requiresColdChain,
    routeDescription,
    isMultiOrigin,
  } = logistics;

  const handleSelectOption = (optionId) => {
    onUpdateShipping({ selectedShippingOptionId: optionId, shippingCostOverride: null });
    setIsManualMode(false);
  };

  const handleSelectWarehouse = (warehouseId) => {
    onUpdateShipping({ selectedWarehouseId: warehouseId, selectedShippingOptionId: null, shippingCostOverride: null });
    setIsManualMode(false);
  };

  const handleSetManualCost = (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onUpdateShipping({ shippingCostOverride: num });
    }
  };

  const handleClearManualCost = () => {
    onUpdateShipping({ shippingCostOverride: null });
    setIsManualMode(false);
    setCustomCostInput('');
  };

  const handleFreeShipping = () => {
    onUpdateShipping({ shippingCostOverride: 0 });
    setIsManualMode(false);
  };

  const costDisplay = estimatedCost === 0
    ? 'Free'
    : `$${Number(estimatedCost).toFixed(2)}`;

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
            {isExpanded ? <ChevronDown size={18} style={{ color: '#003666', flexShrink: 0 }} /> : <ChevronRight size={18} style={{ color: '#64748b', flexShrink: 0 }} />}
            <Truck size={17} style={{ flexShrink: 0, color: '#003666' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#003666', lineHeight: 1 }}>
              Logistics & Shipping
            </span>
          </div>

          <span style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: isManualOverride ? '#7c3aed' : '#0284c7',
            backgroundColor: isManualOverride ? '#f5f3ff' : '#f0f9ff',
            border: `1px solid ${isManualOverride ? '#c4b5fd' : '#bae6fd'}`,
            padding: '3px 8px',
            borderRadius: '99px',
          }}>
            {isManualOverride ? '✏️' : '✈️'} {costDisplay}
          </span>
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
          overflowY: 'auto',
        }}>

          {/* Route Summary Badge */}
          <div style={{
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <Navigation size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1' }}>
              {routeDescription}
            </span>
            {requiresColdChain && (
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#0891b2',
                backgroundColor: '#ecfeff',
                border: '1px solid #a5f3fc',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                PHARMA-GRADE
              </span>
            )}
            {isMultiOrigin && (
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: '#d97706',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                MULTI-ORIGIN
              </span>
            )}
          </div>

          {/* Warehouse Selector (only if supplier has multiple) */}
          {availableWarehouses.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>
                <Warehouse size={12} /> Origin Warehouse
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {availableWarehouses.map((wh) => {
                  const isActive = activeWarehouse?.id === wh.id;
                  return (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => handleSelectWarehouse(wh.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isActive ? '#003666' : '#e2e8f0'}`,
                        backgroundColor: isActive ? '#f0f7ff' : '#f8fafc',
                        color: isActive ? '#003666' : '#475569',
                        fontSize: '0.76rem',
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        touchAction: 'manipulation',
                      }}
                    >
                      {isActive && <Check size={12} />}
                      {wh.city}
                      {wh.isDefault && (
                        <span style={{
                          fontSize: '0.62rem',
                          color: '#16a34a',
                          fontWeight: 800,
                        }}>
                          DEFAULT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping Option Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#475569', fontWeight: 700 }}>
              <Package size={12} /> Shipping Service
            </div>
            {availableOptions.map((opt) => {
              const isSel = selectedOption?.id === opt.id && !isManualOverride;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  style={{
                    padding: '8px 11px',
                    borderRadius: '9px',
                    border: `1.5px solid ${isSel ? '#003666' : '#e2e8f0'}`,
                    backgroundColor: isSel ? '#f0f7ff' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    touchAction: 'manipulation',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                      {opt.isCold ? '🧊' : opt.cost === 0 ? '🏥' : '🚚'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: isSel ? '#003666' : '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</span>
                        {opt.isRecommended && (
                          <span style={{
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            color: '#16a34a',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '0 4px',
                            borderRadius: '3px',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}>
                            Recommended
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {opt.courier} • {opt.transitTime}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    color: isSel ? '#003666' : '#475569',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {opt.cost === 0 ? 'Free' : `$${opt.cost}.00`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Override Section */}
          <div style={{
            padding: '8px 10px',
            borderRadius: '9px',
            backgroundColor: isManualOverride ? '#f5f3ff' : '#f8fafc',
            border: `1px solid ${isManualOverride ? '#c4b5fd' : '#e2e8f0'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Edit3 size={13} style={{ color: '#7c3aed', flexShrink: 0 }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                  {isManualOverride ? 'Custom Rate Active' : 'Manual Override'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={handleFreeShipping}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: isManualOverride && estimatedCost === 0 ? '#dcfce7' : '#f0fdf4',
                    color: '#16a34a',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  🎁 Complimentary (Free)
                </button>
                {!isManualMode && !isManualOverride && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualMode(true);
                      setCustomCostInput(String(estimatedCost));
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                    }}
                  >
                    ✏️ Custom
                  </button>
                )}
                {isManualOverride && (
                  <button
                    type="button"
                    onClick={handleClearManualCost}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      touchAction: 'manipulation',
                    }}
                  >
                    <X size={11} /> Reset
                  </button>
                )}
              </div>
            </div>
            {isManualMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customCostInput}
                  onChange={(e) => setCustomCostInput(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #c4b5fd',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleSetManualCost(customCostInput);
                    setIsManualMode(false);
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  ✔️
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualMode(false);
                    setCustomCostInput('');
                  }}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  ❌
                </button>
              </div>
            )}
          </div>

          {/* Recipient Shipping Address & Delivery Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#475569', fontWeight: 700 }}>
              <MapPin size={13} /> Delivery Destination & Instructions
            </div>
            <input
              type="text"
              placeholder="Shipping street address, city, state, zip..."
              value={shippingAddress}
              onChange={(e) => onUpdateShipping({ shippingAddress: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="text"
              placeholder="Delivery notes (e.g. Leave with clinic reception, call upon delivery)..."
              value={shippingNotes}
              onChange={(e) => onUpdateShipping({ shippingNotes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Destination Region Badge */}
          {destinationRegion && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#64748b',
              padding: '2px 0',
            }}>
              <span>{destinationRegion.flag}</span>
              <span>Detected destination: <strong style={{ color: '#0f172a' }}>{destinationRegion.name}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
