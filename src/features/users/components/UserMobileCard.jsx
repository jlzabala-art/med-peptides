'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, Check, X, MoreVertical, 
  Eye, Sparkles, Stethoscope, Edit, UserCheck, ShieldCheck,
  Building2, Phone, Calendar, Mail, Share2, Pencil
} from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import CopyableId from '../../../components/ui/CopyableId';
import RoleBadge from '../../../components/ui/RoleBadge';
import UserSharedCatalogsPopover from './UserSharedCatalogsPopover';

/**
 * UserMobileCard - Google Cloud Console standard mobile resource card
 */
export default function UserMobileCard({
  row: u,
  onRowClick,
  expandableRender,
  isSelected,
  onToggleSelect,
  selectionMode,
  canApprove = true,
  readOnly = false,
  handleToggleApproval,
  handleInlineRoleChange,
  handleInlinePricingChange,
  setShareDrawerConfig,
  setDetailsUser,
  setAiTargetUser,
  impersonateUser,
  setReassignModal,
  getUserFullName
}) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  if (!u) return null;

  const name = getUserFullName ? getUserFullName(u) : (u.fullName || u.name || u.email || 'Unknown User');
  const email = u.email || u.contactEmail || 'No email';
  const role = u.role || (u.roles && u.roles[0]) || 'patient';
  const initial = name.charAt(0).toUpperCase() || 'U';
  const statusStr = u.isArchived ? 'archived' : (u.approved ? 'active' : 'pending');

  const currentChannel = u.pricingChannel || u.priceTier || (role === 'wholesaler' ? 'wholesale' : role === 'doctor' ? 'clinic' : 'retail');
  const channelLabels = {
    wholesale: 'Wholesale B2B',
    clinic: 'Clinic / Doctor',
    retail: 'Retail Public',
    cost: 'Acquisition Cost',
  };

  const getAvatarTheme = (r) => {
    switch (r) {
      case 'doctor': return { bg: '#ccfbf1', color: '#0f766e' };
      case 'wholesaler': return { bg: '#ffedd5', color: '#c2410c' };
      case 'admin': return { bg: '#e0e7ff', color: '#4338ca' };
      case 'clinic': return { bg: '#f3e8ff', color: '#7e22ce' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };
  const avatarTheme = getAvatarTheme(role);

  return (
    <div
      className={`mobile-record-card${isSelected ? ' mobile-record-card--selected' : ''}`}
      style={{
        background: '#ffffff',
        border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: isSelected ? '0 0 0 2px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: '0.65rem',
        overflow: 'visible',
        transition: 'all 0.15s ease'
      }}
    >
      {/* ── HEADER: Identity & Primary Status ──────────────────────────── */}
      <div
        style={{
          padding: '0.85rem 1rem 0.65rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          cursor: 'pointer'
        }}
        onClick={() => onRowClick?.(u)}
      >
        {/* Avatar */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: avatarTheme.bg,
            color: avatarTheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            flexShrink: 0
          }}
        >
          {initial}
        </div>

        {/* Identity Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', wordBreak: 'break-word', lineHeight: 1.25 }}>
              {name}
            </span>
            {(u.zohoContactId || u.biginContactId || u.zohoSyncStatus === 'synced') && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  flexShrink: 0
                }}
              >
                ⚡ Bigin Synced
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem', minWidth: 0 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {email}
            </span>
            <CopyableId value={u.id} iconOnly={true} />
          </div>
        </div>

        {/* Status Badge + Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <StatusBadge status={statusStr} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(prev => !prev);
            }}
            aria-label={expanded ? 'Collapse user details' : 'Expand user details'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: '#64748b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* ── METADATA GRID: Role & Pricing Channel ─────────────────────── */}
      <div
        style={{
          padding: '0.55rem 1rem 0.65rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.65rem',
          borderTop: '1px solid #f1f5f9',
          background: '#fafbfc'
        }}
      >
        {/* Role Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Role
          </span>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#334155',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <RoleBadge role={role} />
              <Pencil size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            </div>
            <select
              value={role}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleInlineRoleChange?.(u.id, e.target.value)}
              title="Change role"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="clinic">Clinic</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="patient">Patient</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>

        {/* Pricing Channel Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pricing Channel
          </span>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#1d4ed8',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {channelLabels[currentChannel] || currentChannel}
                {Boolean(u.customDiscountPct || u.priceMarkupPercent) && (
                  <strong style={{ marginLeft: '3px', color: '#0369a1' }}>
                    ({u.customDiscountPct || u.priceMarkupPercent}%)
                  </strong>
                )}
              </span>
              <Pencil size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            </div>
            <select
              value={currentChannel}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleInlinePricingChange?.(u.id, e.target.value)}
              title="Change pricing channel"
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            >
              <option value="wholesale">Wholesale B2B</option>
              <option value="clinic">Clinic / Doctor</option>
              <option value="retail">Retail Public</option>
              <option value="cost">Acquisition Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── EXPANDABLE DETAIL ACCORDION ───────────────────────────────── */}
      {expanded && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}
        >
          {u.institution && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Building2 size={13} style={{ color: '#64748b', flexShrink: 0 }} />
              <span><strong>Institution:</strong> {u.institution}</span>
            </div>
          )}

          {u.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
              <Phone size={13} style={{ color: '#64748b', flexShrink: 0 }} />
              <span><strong>Phone:</strong> {u.phone}</span>
            </div>
          )}

          {u.createdAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.72rem' }}>
              <Calendar size={13} style={{ flexShrink: 0 }} />
              <span>Registered on {typeof u.createdAt === 'object' && u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('en-US') : String(u.createdAt).slice(0, 10)}</span>
            </div>
          )}

          {expandableRender && (
            <div style={{ marginTop: '0.5rem' }}>
              {expandableRender(u)}
            </div>
          )}
        </div>
      )}

      {/* ── ACTION FOOTER: GCP Standard Actions Ribbon ─────────────────── */}
      {!readOnly && (
        <div
          style={{
            padding: '0.55rem 0.85rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            background: '#ffffff',
            borderRadius: '0 0 12px 12px',
            position: 'relative'
          }}
        >
          {/* Left / Primary Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            {/* If user is Pending Approval -> prominent GCP Approve button */}
            {!u.isArchived && canApprove && !u.approved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleApproval?.(u, false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)',
                  minHeight: '34px'
                }}
              >
                <Check size={13} />
                <span>Approve Access</span>
              </button>
            )}

            {/* Shared Catalogs Popover Action */}
            <UserSharedCatalogsPopover
              user={u}
              onOpenShareDrawer={(targetUser) => {
                setShareDrawerConfig?.({
                  user: targetUser,
                  shareUrl: 'https://med-peptides.com/catalog',
                  docType: 'catalog'
                });
              }}
            />

            {/* AI Outreach Action (visible if active or compact) */}
            {u.approved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAiTargetUser?.(u);
                }}
                title="AI Outreach and Consultation"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#faf5ff',
                  color: '#7c3aed',
                  border: '1px solid #e9d5ff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '34px'
                }}
              >
                <Sparkles size={12} />
                <span>AI Outreach</span>
              </button>
            )}
          </div>

          {/* Right Kebab Menu (Secondary / Admin Actions) */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(prev => !prev);
              }}
              title="More actions"
              style={{
                width: '34px',
                height: '34px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: menuOpen ? '#f1f5f9' : '#ffffff',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {/* Kebab Dropdown Menu */}
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #e2e8f0',
                  minWidth: '190px',
                  zIndex: 200,
                  overflow: 'hidden',
                  padding: '4px 0'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setDetailsUser?.(u);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.78rem',
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Edit size={13} style={{ color: '#0284c7' }} />
                  <span>Edit Profile</span>
                </button>

                {!u.isArchived && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      impersonateUser?.(u);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.78rem',
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Eye size={13} style={{ color: '#475569' }} />
                    <span>Act As User</span>
                  </button>
                )}

                {/* If patient, reassign doctor */}
                {(u.roles?.includes('patient') || u.role === 'patient' || u.linkedPatientId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setReassignModal?.({
                        isOpen: true,
                        patients: [{
                          id: u.linkedPatientId || u.id,
                          name,
                          physician: u.physician || u.doctorName || 'Direct Desk'
                        }]
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.78rem',
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Stethoscope size={13} style={{ color: '#0f766e' }} />
                    <span>Reassign Doctor</span>
                  </button>
                )}

                {/* Revoke access if approved */}
                {!u.isArchived && canApprove && u.approved && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleToggleApproval?.(u, true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.78rem',
                      color: '#d97706',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <X size={13} style={{ color: '#d97706' }} />
                    <span>Revoke Access</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
