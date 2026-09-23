"use client";

import React from 'react';
import { Copy, X, FileText } from '@/lib/icons';
import WorkspaceTransferPopover from './WorkspaceTransferPopover';

/**
 * WorkspaceCompactRow
 * High-density Excel-like row representation (~34px height) for high volume workspaces.
 */
export default function WorkspaceCompactRow({
  it,
  idx,
  unitRate = 0,
  isAdmin = false,
  isDoctor = false,
  isWholesaler = false,
  isPatient = false,
  transferItemId,
  setTransferItemId,
  activeWs,
  workspacesMap,
  onMoveItem,
  onCopyItem,
  onUpdateItemQuantity,
  onUpdateItemPrice,
  onRemoveItem,
  getItemTierInfo,
  onShareDatasheet,
}) {
  const lineTotal = (it.quantity || 1) * unitRate;
  const tierInfo = getItemTierInfo ? getItemTierInfo(it) : null;

  return (
    <div
      key={it.id || idx}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        minHeight: '34px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.78rem',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
      }}
    >
      {/* Col 1: Name, dosage, format */}
      <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        <span
          style={{
            fontWeight: 700,
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '180px',
          }}
          title={it.canonicalName || it.name || 'Product'}
        >
          {it.canonicalName || it.name || 'Product'}
        </span>
        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 700,
            color: '#0284c7',
            backgroundColor: '#f0f9ff',
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px solid #bae6fd',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {it.dosage || 'Std'}
        </span>
        <span
          style={{
            fontSize: '0.64rem',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '1px 5px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {it.format || 'Vial'}
        </span>
        {it.viewCount > 0 ? (
          <span
            title={`Datasheet opened ${it.viewCount} ${it.viewCount === 1 ? 'time' : 'times'}${it.lastViewedAt ? ` • Last: ${new Date(it.lastViewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`}
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#15803d',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '1px 5px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
            Visto ({it.viewCount})
          </span>
        ) : it.shortUrl ? (
          <span
            title="Enlace generado y enviado, esperando apertura del cliente"
            style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              color: '#64748b',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '1px 5px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Enviado
          </span>
        ) : null}
      </div>

      {/* Col 2: Quantity Controls */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          backgroundColor: '#f1f5f9',
          borderRadius: '6px',
          padding: '1px',
        }}
      >
        <button
          type="button"
          onClick={() => onUpdateItemQuantity(it.id, Math.max(1, (it.quantity || 1) - 1))}
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            background: '#ffffff',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          title="Decrease"
        >
          -
        </button>
        <span style={{ fontSize: '0.76rem', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>
          {it.quantity || 1}
        </span>
        <button
          type="button"
          onClick={() => onUpdateItemQuantity(it.id, (it.quantity || 1) + 1)}
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            background: '#ffffff',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          title="Increase"
        >
          +
        </button>
      </div>

      {/* Col 3: Price / Clinic Price / Wholesale Price */}
      <div style={{ textAlign: 'right', minWidth: '55px' }}>
        {tierInfo?.isTier10Applied && (
          <div style={{ marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '0.60rem',
                fontWeight: 800,
                color: '#15803d',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                padding: '0 4px',
                borderRadius: '3px',
                display: 'inline-block',
              }}
              title={`Tier 10 bulk rate active (${tierInfo.savingsPercent || tierInfo.discountPercent || it.tier_10?.discount_pct || 15}% off)`}
            >
              ⚡ T10 (-{tierInfo.savingsPercent || tierInfo.discountPercent || it.tier_10?.discount_pct || 15}%)
            </span>
          </div>
        )}
        {isDoctor ? (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#0d9488',
              backgroundColor: '#f0fdfa',
              padding: '2px 5px',
              borderRadius: '5px',
              border: '1px solid #99f6e4',
              whiteSpace: 'nowrap',
            }}
            title="Clinic Prescribing Price"
          >
            ${unitRate.toFixed(2)}
          </span>
        ) : isWholesaler ? (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#c2410c',
              backgroundColor: '#fff7ed',
              padding: '2px 5px',
              borderRadius: '5px',
              border: '1px solid #fed7aa',
              whiteSpace: 'nowrap',
            }}
            title="Wholesale Price"
          >
            ${unitRate.toFixed(2)}
          </span>
        ) : isPatient || !isAdmin ? (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#0369a1',
              backgroundColor: '#f0f9ff',
              padding: '2px 5px',
              borderRadius: '5px',
              border: '1px solid #bae6fd',
              whiteSpace: 'nowrap',
            }}
          >
            ${unitRate.toFixed(2)}
          </span>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '1px 3px',
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>$</span>
            <input
              type="text"
              inputMode="decimal"
              value={unitRate > 0 ? unitRate.toString() : ''}
              placeholder="0.00"
              onChange={(e) => {
                const raw = e.target.value;
                if (/^\d*\.?\d*$/.test(raw)) {
                  const parsed = parseFloat(raw) || 0;
                  onUpdateItemPrice(it.id, parsed);
                }
              }}
              style={{
                width: '44px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                textAlign: 'right',
              }}
            />
          </div>
        )}
        {isAdmin && it.supplierCost > 0 && unitRate > 0 && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 4px',
              borderRadius: '3px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              display: 'inline-block',
              marginTop: '2px',
            }}
            title={`Cost: $${Number(it.supplierCost).toFixed(2)} | Markup: +${(((unitRate - it.supplierCost) / it.supplierCost) * 100).toFixed(0)}%`}
          >
            +{(((unitRate - it.supplierCost) / it.supplierCost) * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Col 4: Line total */}
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003666', minWidth: '52px', textAlign: 'right' }}>
        ${lineTotal.toFixed(2)}
      </div>

      {/* Col 5: Transfer & Remove item */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setTransferItemId(transferItemId === it.id ? null : it.id);
          }}
          style={{
            width: '24px',
            height: '24px',
            background: transferItemId === it.id ? '#eff6ff' : 'none',
            border: `1px solid ${transferItemId === it.id ? '#bfdbfe' : 'transparent'}`,
            color: transferItemId === it.id ? '#0284c7' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            padding: 0,
          }}
          title="Transfer compound to another workspace"
        >
          <Copy size={13} />
        </button>

        <WorkspaceTransferPopover
          it={it}
          activeWs={activeWs}
          workspacesMap={workspacesMap}
          isOpen={transferItemId === it.id}
          onClose={() => setTransferItemId(null)}
          onMoveItem={onMoveItem}
          onCopyItem={onCopyItem}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShareDatasheet && onShareDatasheet(it);
          }}
          style={{
            width: '24px',
            height: '24px',
            background: 'none',
            border: '1px solid transparent',
            color: '#0284c7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            padding: 0,
            transition: 'all 0.15s ease',
          }}
          title="Share Unique Datasheet with Client/Wholesaler"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eff6ff';
            e.currentTarget.style.borderColor = '#bfdbfe';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <FileText size={13} />
        </button>

        <button
          type="button"
          onClick={() => onRemoveItem(it.id)}
          style={{
            width: '24px',
            height: '24px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Remove item"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
