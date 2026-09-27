"use client";

import React, { useState } from 'react';
import {
  User,
  Package,
  Sparkles,
  ExternalLink,
  Layers
} from '@/lib/icons';
import { CopyableId, StatusBadge } from '../../ui';
import { openSupplierAI } from '../../../utils/openModuleAI';
import { useFirestoreDocument } from '../../../hooks/data/useFirestoreDocument';
import notifier from '../../../services/NotificationService';

/**
 * SupplierMasterDetailCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Master-Detail expandable row for the Suppliers directory (Rule #4 & #23).
 * Connects the supplier record with the authoritative `users` master table,
 * exposing user identity, roles, B2B/B2C status controls, lead times, and categories.
 */
export default function SupplierMasterDetailCard({
  supplier,
  allCategories = [],
  onUpdateField,
  onOpenProfile,
  onViewCatalog,
}) {
  const [b2bStatus, setB2bStatus] = useState(supplier?.statusB2B || 'active');
  const [b2cStatus, setB2cStatus] = useState(supplier?.statusB2C || 'inactive');
  const [isUpdating, setIsUpdating] = useState(false);

  const supplierId = supplier?.id;
  const linkedUserId = supplier?.userId || supplier?.uid || supplierId;

  // Query master user from 'users' collection using authoritative hook (Golden Rule #2)
  const { data: masterUser } = useFirestoreDocument('users', linkedUserId, { realtime: false });

  const handleStatusChange = async (channel, val) => {
    setIsUpdating(true);
    try {
      if (channel === 'B2B') {
        setB2bStatus(val);
        await onUpdateField?.(supplierId, 'statusB2B', val);
        notifier.success(`B2B status updated to ${val}`);
      } else {
        setB2cStatus(val);
        await onUpdateField?.(supplierId, 'statusB2C', val);
        notifier.success(`B2C status updated to ${val}`);
      }
    } catch {
      notifier.error('Failed to update channel status');
    } finally {
      setIsUpdating(false);
    }
  };

  const roles = masterUser?.roles || (masterUser?.role ? [masterUser.role] : ['supplier']);
  const managerName = supplier?.accountManager || supplier?.manager || masterUser?.accountManager || 'Unassigned Desk';
  const leadTimeDays = supplier?.leadTime || 14;
  const minOrderUnits = supplier?.minOrder || 50;

  // Categories helper
  const supplierCategoryIds = supplier?.categoryIds || (supplier?.categoryId ? [supplier.categoryId] : []);
  const resolvedCategoryNames = supplierCategoryIds.map(catId => {
    const found = allCategories.find(c => c.id === catId);
    return found ? (found.labelEn || found.label || catId) : catId.replace(/_/g, ' ');
  });

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '1rem',
        margin: '0.25rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* ── TOP SECTION: MASTER IDENTITY, CHANNELS & PARAMETERS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          alignItems: 'start'
        }}
      >
        {/* Box 1: Master `users` Account & Roles */}
        <div
          style={{
            background: '#ffffff',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Master User Account (SSOT)
            </span>
            <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
              users / {linkedUserId ? 'linked' : 'standalone'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={15} style={{ color: 'var(--color-primary, #003666)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {masterUser?.displayName || masterUser?.email || supplier?.contactEmail || supplier?.email || 'No primary user bound'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>UID:</span>
            <CopyableId value={linkedUserId} />
          </div>

          {/* User Roles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Roles:</span>
            {roles.map(r => (
              <span
                key={r}
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: r === 'supplier' ? '#f0fdf4' : '#f5f3ff',
                  color: r === 'supplier' ? '#16a34a' : '#7c3aed',
                  border: `1px solid ${r === 'supplier' ? '#bbf7d0' : '#ddd6fe'}`,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {r}
              </span>
            ))}
            {roles.length > 1 && (
              <span style={{ fontSize: '0.65rem', color: '#d97706', fontWeight: 700 }}>
                (Multi-Role)
              </span>
            )}
          </div>
        </div>

        {/* Box 2: Channel Status Controls (B2B & B2C) */}
        <div
          style={{
            background: '#ffffff',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Commercial Distribution Channels
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>B2B Channel:</span>
              <StatusBadge status={b2bStatus} />
            </div>
            <select
              value={b2bStatus}
              onChange={(e) => handleStatusChange('B2B', e.target.value)}
              disabled={isUpdating}
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="active">Active (Enabled)</option>
              <option value="inactive">Inactive (Suspended)</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>B2C Channel:</span>
              <StatusBadge status={b2cStatus} />
            </div>
            <select
              value={b2cStatus}
              onChange={(e) => handleStatusChange('B2C', e.target.value)}
              disabled={isUpdating}
              style={{
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="active">Active (Enabled)</option>
              <option value="inactive">Inactive (Suspended)</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Account Manager: <strong style={{ color: 'var(--text-main)' }}>{managerName}</strong>
          </div>
        </div>

        {/* Box 3: Procurement Parameters & Category Scope */}
        <div
          style={{
            background: '#ffffff',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Procurement & Categories
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Estimated Lead Time:</span>
            <strong style={{ color: 'var(--text-main)' }}>{leadTimeDays} days</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Min Order Quantity:</span>
            <strong style={{ color: 'var(--text-main)' }}>{minOrderUnits} units</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
            <Layers size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Categories:</span>
            {resolvedCategoryNames.length === 0 ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>None assigned</span>
            ) : (
              resolvedCategoryNames.map(name => (
                <span
                  key={name}
                  style={{
                    fontSize: '0.68rem',
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 500
                  }}
                >
                  {name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ACTIONS ROW ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          flexWrap: 'wrap',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '0.75rem'
        }}
      >
        <button
          type="button"
          onClick={() => openSupplierAI(supplier)}
          className="gcp-btn-secondary"
          style={{
            fontSize: '0.78rem',
            padding: '4px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Sparkles size={13} style={{ color: '#8b5cf6' }} />
          AI Intelligence
        </button>

        {onViewCatalog && (
          <button
            type="button"
            onClick={onViewCatalog}
            className="gcp-btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Package size={13} />
            View Products & Variants
          </button>
        )}

        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            style={{
              fontSize: '0.78rem',
              padding: '4px 12px',
              borderRadius: '6px',
              background: 'var(--color-primary, #003666)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <ExternalLink size={13} />
            Full Supplier Profile (360°)
          </button>
        )}
      </div>
    </div>
  );
}
