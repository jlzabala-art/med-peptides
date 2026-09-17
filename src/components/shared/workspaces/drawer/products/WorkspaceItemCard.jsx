import React from 'react';
import { ChevronDown, ChevronUp, Copy, X } from 'lucide-react';
import WorkspaceTransferPopover from './WorkspaceTransferPopover';

/**
 * WorkspaceItemCard
 * Detailed card view for an item in the workspace drawer with touch targets >= 38px,
 * expandable dosage/SKU info, format switcher, and pricing/quantity controls.
 */
export default function WorkspaceItemCard({
  item,
  isDoctor = false,
  isExpanded = false,
  onToggleExpand,
  getItemUnitPrice,
  onUpdateItemPrice,
  onUpdateItemQuantity,
  onUpdateItemFormat,
  onRemoveItem,
  transferItemId,
  setTransferItemId,
  availableWorkspaces = [],
  currentWorkspaceId,
  onTransferItem,
}) {
  const unitRate = getItemUnitPrice ? getItemUnitPrice(item) : (item.price || 0);
  const lineTotal = (item.quantity || 1) * unitRate;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: `1.5px solid ${isExpanded ? (isDoctor ? '#0d9488' : '#003666') : '#e2e8f0'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Item Header */}
      <div
        onClick={() => onToggleExpand && onToggleExpand(item.id)}
        style={{
          padding: '0.75rem 0.85rem',
          backgroundColor: isExpanded ? (isDoctor ? '#f0fdfa' : '#f0f7ff') : '#ffffff',
          borderBottom: isExpanded ? `1px solid ${isDoctor ? '#99f6e4' : '#bfdbfe'}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <button
            type="button"
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              color: isExpanded ? (isDoctor ? '#0d9488' : '#003666') : '#64748b',
              display: 'flex',
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.88rem',
                color: '#0f172a',
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {item.canonicalName || item.name || item.displayName || 'Product Item'}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '3px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600, color: '#334155' }}>{item.dosage || 'Standard'}</span>
              <span>•</span>
              <span style={{ fontWeight: 600, color: '#0284c7' }}>{item.format || 'Vial'}</span>
              <span style={{ margin: '0 2px', color: '#cbd5e1' }}>|</span>
              {isDoctor ? (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#0d9488',
                    backgroundColor: '#f0fdfa',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    border: '1px solid #99f6e4',
                  }}
                  title="Clinic Prescribing Price"
                >
                  ${unitRate.toFixed(2)} / u (Clinic Price)
                </span>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    backgroundColor: unitRate > 0 ? '#f0f9ff' : '#fffbeb',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: `1px solid ${unitRate > 0 ? '#bae6fd' : '#fde68a'}`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: unitRate > 0 ? '#0284c7' : '#d97706' }}>$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={unitRate > 0 ? unitRate.toString() : ''}
                    placeholder="0.00"
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (/^\d*\.?\d*$/.test(raw)) {
                        const parsed = parseFloat(raw) || 0;
                        if (onUpdateItemPrice) onUpdateItemPrice(item.id, parsed);
                      }
                    }}
                    style={{
                      width: '60px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: unitRate > 0 ? '#0369a1' : '#b45309',
                      backgroundColor: '#ffffff',
                      border: `1px solid ${unitRate > 0 ? '#38bdf8' : '#f59e0b'}`,
                      borderRadius: '4px',
                      padding: '2px 4px',
                      outline: 'none',
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: unitRate > 0 ? '#0284c7' : '#d97706' }}>/u</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls: Quantity Buttons with Touch Target >= 38px */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => onUpdateItemQuantity && onUpdateItemQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
              style={{
                width: '38px',
                height: '38px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '1rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
              }}
              title="Decrease quantity"
            >
              -
            </button>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>
              {item.quantity || 1}
            </span>
            <button
              type="button"
              onClick={() => onUpdateItemQuantity && onUpdateItemQuantity(item.id, (item.quantity || 1) + 1)}
              style={{
                width: '38px',
                height: '38px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '1rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
              }}
              title="Increase quantity"
            >
              +
            </button>
          </div>

          <div style={{ fontSize: '0.88rem', fontWeight: 900, color: isDoctor ? '#0d9488' : '#003666', minWidth: '55px', textAlign: 'right' }}>
            ${lineTotal.toFixed(2)}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (setTransferItemId) {
                  setTransferItemId(transferItemId === item.id ? null : item.id);
                }
              }}
              style={{
                width: '36px',
                height: '36px',
                background: transferItemId === item.id ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${transferItemId === item.id ? '#0284c7' : '#cbd5e1'}`,
                color: transferItemId === item.id ? '#0284c7' : '#475569',
                cursor: 'pointer',
                borderRadius: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
              }}
              title="Transfer / Duplicate to another workspace"
            >
              <Copy size={15} />
            </button>

            {transferItemId === item.id && (
              <WorkspaceTransferPopover
                item={item}
                availableWorkspaces={availableWorkspaces}
                currentWorkspaceId={currentWorkspaceId}
                onTransfer={onTransferItem}
                onClose={() => setTransferItemId && setTransferItemId(null)}
              />
            )}

            <button
              type="button"
              onClick={() => onRemoveItem && onRemoveItem(item.id)}
              style={{
                width: '36px',
                height: '36px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                cursor: 'pointer',
                borderRadius: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                touchAction: 'manipulation',
              }}
              title="Remove item"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#ffffff' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px',
              backgroundColor: '#f8fafc',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.74rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Dose & Format:</span>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.dosage || 'Standard'} • {item.format || 'Vial'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>SKU Code:</span>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.sku || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Category:</span>
              <div style={{ fontWeight: 700, color: '#0369a1' }}>{item.category || 'Biologics / Peptides'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Supplier:</span>
              <div style={{ fontWeight: 700, color: '#475569' }}>{item.supplierName || 'Partner Compounder'}</div>
            </div>
          </div>

          {/* Quick Format Switcher */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              backgroundColor: '#f8fafc',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Quick Format Switcher:</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['Vial', 'Single Cartridge', 'Double Cartridge', 'Sublingual', 'Oral Drops'].map((fmtOption) => {
                const isCurrent = (item.format || 'Vial').toLowerCase() === fmtOption.toLowerCase();
                return (
                  <button
                    key={fmtOption}
                    type="button"
                    onClick={() => onUpdateItemFormat && onUpdateItemFormat(item.id, fmtOption)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: '6px',
                      border: `1.5px solid ${isCurrent ? (isDoctor ? '#0d9488' : '#003666') : '#cbd5e1'}`,
                      backgroundColor: isCurrent ? (isDoctor ? '#0d9488' : '#003666') : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#334155',
                      fontSize: '0.72rem',
                      fontWeight: isCurrent ? 800 : 600,
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                    }}
                  >
                    {fmtOption}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
