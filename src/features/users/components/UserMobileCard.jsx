'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, ChevronUp, Check, X, MoreVertical, 
  Eye, Sparkles, Stethoscope, Edit, UserCheck, ShieldCheck,
  Building2, Phone, Calendar, Mail, Share2, Pencil, FileText
} from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import CopyableId from '../../../components/ui/CopyableId';
import RoleBadge from '../../../components/ui/RoleBadge';
import UserSharedCatalogsPopover from './UserSharedCatalogsPopover';
import UserPayablesPopover from './UserPayablesPopover';

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

  const getSmartInitials = (fullName) => {
    if (!fullName) return 'U';
    const cleaned = fullName.replace(/^(dr\.|dra\.|doctor|doctora|prof\.|prof|lic\.|lic|mr\.|mrs\.|ms\.)\s+/i, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };
  const initial = getSmartInitials(name);
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
        border: isSelected ? '1.5px solid #1a73e8' : '1px solid #dadce0',
        borderRadius: '8px',
        boxShadow: isSelected ? '0 0 0 2px rgba(26,115,232,0.15)' : '0 1px 2px rgba(60,64,67,0.08)',
        marginBottom: '0.65rem',
        overflow: 'visible',
        transition: 'all 0.15s ease'
      }}
    >
      {/* ── HEADER: Identity & Primary Status (Google Cloud UX) ──────────── */}
      <div
        style={{
          padding: '0.75rem 0.85rem 0.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          cursor: 'pointer'
        }}
        onClick={() => onRowClick?.(u)}
      >
        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: avatarTheme.bg,
            color: avatarTheme.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          {initial}
        </div>

        {/* Identity Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#202124', wordBreak: 'break-word', lineHeight: 1.25 }}>
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
                  borderRadius: '3px',
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  border: '1px solid #ceead6',
                  flexShrink: 0
                }}
              >
                ⚡ Bigin Synced
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', minWidth: 0 }}>
            <span style={{ fontSize: '0.76rem', color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '210px' }}>
              {email}
            </span>
            <CopyableId value={u.id} iconOnly={true} />
          </div>

          {/* Telemetry metadata chips attached to identity (Google Cloud standard) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <UserSharedCatalogsPopover
              user={u}
              onOpenShareDrawer={(targetUser) => {
                setShareDrawerConfig?.({
                  user: targetUser,
                  shareUrl: 'https://www.atlashealth-services.com/catalog',
                  docType: 'catalog'
                });
              }}
            />
            <UserPayablesPopover user={u} />
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
              padding: '4px',
              color: '#5f6368',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
        </div>
      </div>

      {/* ── METADATA GRID: Role & Pricing Channel (Clean Google Cloud Resource Attributes) ── */}
      <div
        style={{
          padding: '0.45rem 0.85rem',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
          gap: '0.75rem',
          borderTop: '1px solid #f1f3f4',
          background: '#ffffff'
        }}
      >
        {/* Role Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, position: 'relative' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Role
          </span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            fontWeight: 500,
            color: '#202124',
            cursor: 'pointer'
          }}>
            <RoleBadge role={role} />
            <ChevronDown size={11} color="#5f6368" style={{ flexShrink: 0 }} />
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

        {/* Pricing Channel Field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, position: 'relative' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pricing Channel
          </span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.76rem',
            fontWeight: 500,
            color: '#1a73e8',
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {channelLabels[currentChannel] || currentChannel}
              {Boolean(u.customDiscountPct || u.priceMarkupPercent) && (
                <strong style={{ marginLeft: '3px', color: '#174ea6' }}>
                  ({u.customDiscountPct || u.priceMarkupPercent}%)
                </strong>
              )}
            </span>
            <ChevronDown size={11} color="#5f6368" style={{ flexShrink: 0 }} />
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
            padding: '0.45rem 0.85rem',
            borderTop: '1px solid #f1f3f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            background: '#ffffff',
            borderRadius: '0 0 8px 8px',
            position: 'relative'
          }}
        >
          {/* Left / Primary Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1 }}>
            {/* If user is Pending Approval -> prominent GCP Approve button */}
            {!u.isArchived && canApprove && !u.approved ? (
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
                  padding: '4px 12px',
                  borderRadius: '4px',
                  background: '#188038',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '32px'
                }}
              >
                <Check size={13} />
                <span>Approve Access</span>
              </button>
            ) : (
              <>
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
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: '#f8f9fa',
                    color: '#1a73e8',
                    border: '1px solid #dadce0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '32px'
                  }}
                >
                  <Sparkles size={12} color="#1a73e8" />
                  <span>AI Outreach</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailsUser?.(u);
                  }}
                  title="View User 360°"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: '#ffffff',
                    color: '#3c4043',
                    border: '1px solid #dadce0',
                    fontSize: '0.74rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    minHeight: '32px'
                  }}
                >
                  <Eye size={13} color="#5f6368" />
                  <span>User 360°</span>
                </button>
              </>
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
                width: '32px',
                height: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: menuOpen ? '#f1f3f4' : '#ffffff',
                color: '#5f6368',
                cursor: 'pointer'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {/* Kebab Action Sheet (Google Cloud Mobile Standard) */}
            {menuOpen && (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 9998
                  }}
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
                    zIndex: 9999,
                    padding: '1.25rem 1rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ width: '36px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', margin: '0 auto 10px auto' }} />
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', padding: '0 4px' }}>
                    Actions for {name}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDetailsUser?.(u);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Edit size={16} style={{ color: '#0284c7' }} />
                    <span>Edit Profile 360°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShareDrawerConfig?.({
                        user: u,
                        shareUrl: 'https://www.atlashealth-services.com/catalog',
                        docType: 'catalog'
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Share2 size={16} style={{ color: '#0284c7' }} />
                    <span>Catálogos B2B & Tracking</span>
                  </button>

                  {Boolean(u.payablesToken || u.payablesSlug || (u.email === 'jia9156@gmail.com' || (u.companyName || '').toLowerCase().includes('health source'))) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        const token = u.payablesToken || (u.email === 'jia9156@gmail.com' || (u.companyName || '').toLowerCase().includes('health source') ? 'HSC-PAY-ZN1TU5Q6' : u.payablesSlug);
                        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
                        const userEmail = (u.email || u.contactEmail || '').toLowerCase().trim();
                        const url = `${origin}/b2b/payables/${token}${userEmail ? `?email=${encodeURIComponent(userEmail)}&quicklink=verified` : ''}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <FileText size={16} style={{ color: '#c2410c' }} />
                      <span>Payables Statement (Bills)</span>
                    </button>
                  )}

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
                        gap: '10px',
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Eye size={16} style={{ color: '#475569' }} />
                      <span>Act As User (Simulate Session)</span>
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
                        gap: '10px',
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Stethoscope size={16} style={{ color: '#0f766e' }} />
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
                        gap: '10px',
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #fed7aa',
                        borderRadius: '8px',
                        background: '#fff7ed',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#c2410c',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <X size={16} style={{ color: '#c2410c' }} />
                      <span>Revoke Access</span>
                    </button>
                  )}

                  {/* Close / Cancel Button */}
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      marginTop: '6px',
                      padding: '11px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
