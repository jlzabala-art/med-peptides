"use client";

import React, { useState, useMemo } from 'react';
import { Tabs, Toggle, TextField, StatusChip, CopyableId } from '../ui';
import X from "lucide-react/dist/esm/icons/x";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Map from "lucide-react/dist/esm/icons/map";
import Users from "lucide-react/dist/esm/icons/users";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Shield from "lucide-react/dist/esm/icons/shield";
import Activity from "lucide-react/dist/esm/icons/activity";
import Mail from "lucide-react/dist/esm/icons/mail";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Target from "lucide-react/dist/esm/icons/target";
import UserCircle from "lucide-react/dist/esm/icons/user-circle";
import Plus from "lucide-react/dist/esm/icons/plus";
import Eye from "lucide-react/dist/esm/icons/eye";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Star from "lucide-react/dist/esm/icons/star";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Globe from "lucide-react/dist/esm/icons/globe";
import Save from "lucide-react/dist/esm/icons/save";
import toast from 'react-hot-toast';
import { useResponsive } from '../../hooks/useResponsive';

// Flag or territory emoji helper based on region/country name
function getTerritoryFlag(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('dubai') || lower.includes('abu dhabi') || lower.includes('sharjah') || lower.includes('emirates') || lower.includes('uae')) return '🇦🇪';
  if (lower.includes('qatar') || lower.includes('doha')) return '🇶🇦';
  if (lower.includes('saudi') || lower.includes('riyadh')) return '🇸🇦';
  if (lower.includes('kuwait')) return '🇰🇼';
  if (lower.includes('bahrain')) return '🇧🇭';
  if (lower.includes('spain') || lower.includes('madrid') || lower.includes('barcelona')) return '🇪🇸';
  if (lower.includes('uk') || lower.includes('london')) return '🇬🇧';
  if (lower.includes('usa') || lower.includes('florida') || lower.includes('miami')) return '🇺🇸';
  if (lower.includes('latam') || lower.includes('colombia') || lower.includes('mexico')) return '🌎';
  return '📍';
}

// Pre-configured territories for quick 1-click addition
const AVAILABLE_TERRITORIES_CATALOG = [
  { id: 'dubai', name: 'Dubai', region: 'UAE Core', icon: '🇦🇪' },
  { id: 'abu-dhabi', name: 'Abu Dhabi', region: 'UAE Core', icon: '🇦🇪' },
  { id: 'sharjah', name: 'Sharjah', region: 'UAE Core', icon: '🇦🇪' },
  { id: 'northern-emirates', name: 'Northern Emirates', region: 'UAE Core', icon: '🇦🇪' },
  { id: 'doha', name: 'Doha', region: 'GCC', icon: '🇶🇦' },
  { id: 'riyadh', name: 'Riyadh', region: 'GCC', icon: '🇸🇦' },
  { id: 'kuwait-city', name: 'Kuwait City', region: 'GCC', icon: '🇰🇼' },
  { id: 'manama', name: 'Manama', region: 'GCC', icon: '🇧🇭' },
  { id: 'madrid', name: 'Madrid', region: 'Europe', icon: '🇪🇸' },
  { id: 'london', name: 'London', region: 'Europe', icon: '🇬🇧' },
  { id: 'miami', name: 'Miami & Florida', region: 'North America', icon: '🇺🇸' },
];

function normalizeInitialTerritories(raw) {
  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    return [
      { name: 'Dubai', status: 'active', isPrimary: true },
      { name: 'Abu Dhabi', status: 'active', isPrimary: false },
      { name: 'Sharjah', status: 'pending', isPrimary: false },
      { name: 'Northern Emirates', status: 'active', isPrimary: false }
    ];
  }
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          name: item,
          status: 'active',
          isPrimary: idx === 0
        };
      }
      return {
        name: item.name || item.id || 'Territory',
        status: item.status || 'active',
        isPrimary: Boolean(item.isPrimary)
      };
    });
  }
  if (typeof raw === 'string') {
    return [{ name: raw, status: 'active', isPrimary: true }];
  }
  return [];
}

export default function AccountManagerDrawer({ manager, wholesellers = {}, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const isMobile = useResponsive();

  // Local editable form state initialized directly from manager prop
  const [notes, setNotes] = useState(() => manager?.notes || '');
  const [phone, setPhone] = useState(() => manager?.phone || '');
  const [disabled, setDisabled] = useState(() => Boolean(manager?.disabled));
  const [canModifyTerritories, setCanModifyTerritories] = useState(() => Boolean(manager?.canModifyTerritories));
  const [canAccessAnalytics, setCanAccessAnalytics] = useState(() => Boolean(manager?.canAccessAnalytics));
  const [territories, setTerritories] = useState(() => normalizeInitialTerritories(manager?.territories));

  // Territory Management Console Mode
  const [isManagingTerritories, setIsManagingTerritories] = useState(false);
  const [customTerritoryInput, setCustomTerritoryInput] = useState('');

  // Save operation state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate Coverage Health Score
  const coverageMetrics = useMemo(() => {
    const total = territories.length;
    const activeCount = territories.filter((t) => t.status === 'active').length;
    const pendingCount = territories.filter((t) => t.status === 'pending').length;
    const backupCount = territories.filter((t) => t.status === 'backup').length;
    const score = total > 0 ? Math.round((activeCount / total) * 100) : 0;
    return { total, activeCount, pendingCount, backupCount, score };
  }, [territories]);

  // Territories currently not assigned from catalog
  const unassignedCatalog = useMemo(() => {
    const assignedSet = new Set(territories.map((t) => t.name.toLowerCase()));
    return AVAILABLE_TERRITORIES_CATALOG.filter(
      (cat) => !assignedSet.has(cat.name.toLowerCase())
    );
  }, [territories]);

  const workloadPercentage = useMemo(() => {
    if (!manager) return 0;
    return Math.min(100, Math.floor(((manager.assignedClinics || 0) + (manager.assignedDoctors || 0)) / 2));
  }, [manager]);

  if (!manager) return null;

  // Handle Territory Status Toggle (active -> pending -> backup -> active)
  const handleToggleTerritoryStatus = (index) => {
    setTerritories((prev) => {
      const next = [...prev];
      const current = next[index].status;
      const nextStatus = current === 'active' ? 'pending' : current === 'pending' ? 'backup' : 'active';
      next[index] = { ...next[index], status: nextStatus };
      return next;
    });
    setHasChanges(true);
  };

  // Set territory as primary hub
  const handleSetPrimaryTerritory = (index) => {
    setTerritories((prev) =>
      prev.map((t, i) => ({
        ...t,
        isPrimary: i === index
      }))
    );
    setHasChanges(true);
  };

  // Remove territory
  const handleRemoveTerritory = (index) => {
    setTerritories((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Add territory from catalog
  const handleAddTerritory = (name) => {
    if (territories.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error(`"${name}" is already assigned to this manager`);
      return;
    }
    setTerritories((prev) => [
      ...prev,
      { name, status: 'active', isPrimary: prev.length === 0 }
    ]);
    setHasChanges(true);
    toast.success(`Territory "${name}" added`);
  };

  // Add custom territory
  const handleAddCustomTerritory = (e) => {
    e.preventDefault();
    const clean = customTerritoryInput.trim();
    if (!clean) return;
    handleAddTerritory(clean);
    setCustomTerritoryInput('');
  };

  // 1-Click Preset: Assign all 4 Core UAE Emirates
  const handleAssignAllCoreUAE = () => {
    const uaeCore = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Northern Emirates'];
    setTerritories((prev) => {
      const existingNames = new Set(prev.map((t) => t.name.toLowerCase()));
      const additions = uaeCore
        .filter((c) => !existingNames.has(c.toLowerCase()))
        .map((name, idx) => ({
          name,
          status: 'active',
          isPrimary: prev.length === 0 && idx === 0
        }));
      return [...prev, ...additions];
    });
    setHasChanges(true);
    toast.success('Core UAE Emirates assigned');
  };

  // Discard local edits
  const handleDiscard = () => {
    if (manager) {
      setNotes(manager.notes || '');
      setPhone(manager.phone || '');
      setDisabled(Boolean(manager.disabled));
      setCanModifyTerritories(Boolean(manager.canModifyTerritories));
      setCanAccessAnalytics(Boolean(manager.canAccessAnalytics));
      setTerritories(normalizeInitialTerritories(manager.territories));
      setHasChanges(false);
      setIsManagingTerritories(false);
      toast('Changes discarded', { icon: '↩️' });
    }
  };

  // Save changes to Firestore via onUpdate
  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      const payload = {
        notes,
        phone,
        disabled,
        canModifyTerritories,
        canAccessAnalytics,
        territories: territories.map((t) => ({
          name: t.name,
          status: t.status,
          isPrimary: Boolean(t.isPrimary)
        })),
        updatedAt: new Date()
      };

      await onUpdate(manager.id, payload);
      setHasChanges(false);
      toast.success('Account manager profile and territories updated');
    } catch (err) {
      console.error('Failed to save account manager:', err);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: Briefcase,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '1.25rem',
              padding: '1.25rem',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border, #e2e8f0)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Role & Function</span>
              <div style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginTop: '2px' }}>Clinical Account Manager</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Hire / Creation Date</span>
              <div style={{ fontWeight: 500, color: 'var(--text-main, #0f172a)', marginTop: '2px' }}>
                {manager.createdAt?.seconds
                  ? new Date(manager.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'N/A'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Parent Organization</span>
              <div style={{ fontWeight: 500, color: 'var(--text-main, #0f172a)', marginTop: '2px' }}>
                {manager.wholesellerId ? wholesellers[manager.wholesellerId] || 'Assigned Wholesale Partner' : 'Atlas Health Global HQ'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Direct Contact Phone</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="+971 50 000 0000"
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border, #cbd5e1)',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: 'var(--text-main, #0f172a)' }}>Internal Manager Notes</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Visible only to administrators</span>
            </div>
            <TextField
              multiline
              rows={4}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Add internal notes about territory coverage, clinic relationships, performance, or onboarding..."
            />
          </div>
        </div>
      )
    },
    {
      id: 'territories',
      label: `Territories (${territories.length})`,
      icon: Map,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Coverage Health Card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--surface, #ffffff)',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: 'var(--radius-md, 8px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>Coverage Health</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                  {coverageMetrics.activeCount} Active Covered · {coverageMetrics.pendingCount} Pending · {coverageMetrics.backupCount} Backup
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: coverageMetrics.score >= 75 ? '#f0fdf4' : coverageMetrics.score >= 50 ? '#fffbeb' : '#fef2f2',
                  border: `1px solid ${coverageMetrics.score >= 75 ? '#bbf7d0' : coverageMetrics.score >= 50 ? '#fde68a' : '#fecaca'}`,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: coverageMetrics.score >= 75 ? '#16a34a' : coverageMetrics.score >= 50 ? '#d97706' : '#dc2626'
                }}
              >
                <span>{coverageMetrics.score}% Health</span>
              </div>
            </div>

            {/* Health Progress Bar */}
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div
                style={{
                  height: '100%',
                  width: `${coverageMetrics.score}%`,
                  backgroundColor: coverageMetrics.score >= 75 ? '#16a34a' : coverageMetrics.score >= 50 ? '#d97706' : '#dc2626',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            {/* Active Territories List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {territories.map((territory, idx) => {
                const isActive = territory.status === 'active';
                const isPending = territory.status === 'pending';

                const bg = isActive ? '#f0fdf4' : isPending ? '#fffbeb' : '#eff6ff';
                const border = isActive ? '#bbf7d0' : isPending ? '#fde68a' : '#bfdbfe';
                const textColor = isActive ? '#16a34a' : isPending ? '#d97706' : '#2563eb';
                const labelText = isActive ? 'Covered' : isPending ? 'Pending' : 'Backup';

                return (
                  <div
                    key={`${territory.name}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: bg,
                      border: `1px solid ${border}`,
                      borderRadius: 'var(--radius-sm, 6px)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{getTerritoryFlag(territory.name)}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {territory.name}
                          {territory.isPrimary && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Star size={10} fill="#f59e0b" color="#f59e0b" /> Primary Hub
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                          Click status pill to cycle coverage state
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Interactive Status Switcher Pill */}
                      <button
                        type="button"
                        onClick={() => handleToggleTerritoryStatus(idx)}
                        title="Click to toggle: Active Covered ➔ Pending ➔ Backup"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: '#ffffff',
                          border: `1px solid ${border}`,
                          color: textColor,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isActive ? <CheckCircle2 size={12} color="#16a34a" /> : <AlertCircle size={12} color={textColor} />}
                        <span>{labelText}</span>
                      </button>

                      {/* Primary Toggle Star */}
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryTerritory(idx)}
                        title={territory.isPrimary ? 'Primary Territory Hub' : 'Set as Primary Territory'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          color: territory.isPrimary ? '#f59e0b' : '#94a3b8'
                        }}
                      >
                        <Star size={16} fill={territory.isPrimary ? '#f59e0b' : 'none'} />
                      </button>

                      {/* Remove Territory */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTerritory(idx)}
                        title="Unassign territory from this manager"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-muted, #94a3b8)'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {territories.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>
                  No territories assigned yet. Click below to add territories.
                </div>
              )}
            </div>

            {/* Toggle Manage Territories Expandable Panel */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setIsManagingTerritories(!isManagingTerritories)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: isManagingTerritories ? '1px solid var(--primary, #2563eb)' : '1px solid var(--border, #cbd5e1)',
                  backgroundColor: isManagingTerritories ? 'var(--primary-soft, #eff6ff)' : '#ffffff',
                  color: isManagingTerritories ? 'var(--primary, #1d4ed8)' : 'var(--text-main, #0f172a)'
                }}
              >
                <MapPin size={15} />
                <span>{isManagingTerritories ? 'Close Territory Assignment' : 'Manage Territories'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Territory Assignment Console (Expandable) */}
          {isManagingTerritories && (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
                border: '1px solid var(--primary-soft, #bfdbfe)',
                borderRadius: 'var(--radius-md, 8px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                animation: 'fadeIn 0.2s ease-in-out'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main, #0f172a)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={15} color="var(--primary, #2563eb)" /> Quick Assign Regional Hubs
                </h5>
                <button
                  type="button"
                  onClick={handleAssignAllCoreUAE}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary, #1d4ed8)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Assign 4 UAE Core (1-Click)
                </button>
              </div>

              {/* Unassigned Available Catalog Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {unassignedCatalog.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleAddTerritory(cat.name)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border, #cbd5e1)',
                      color: 'var(--text-main, #1e293b)',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary, #2563eb)';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <Plus size={12} color="var(--primary, #2563eb)" />
                  </button>
                ))}

                {unassignedCatalog.length === 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                    All standard catalog hubs are assigned. You can add custom cities below.
                  </div>
                )}
              </div>

              {/* Custom Territory Input Form */}
              <form onSubmit={handleAddCustomTerritory} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  value={customTerritoryInput}
                  onChange={(e) => setCustomTerritoryInput(e.target.value)}
                  placeholder="Add custom city, country, or zone (e.g. Al Ain, Ajman)..."
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #cbd5e1)',
                    backgroundColor: '#ffffff'
                  }}
                />
                <button
                  type="submit"
                  disabled={!customTerritoryInput.trim()}
                  className="gcp-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: customTerritoryInput.trim() ? 'pointer' : 'not-allowed',
                    opacity: customTerritoryInput.trim() ? 1 : 0.6
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              </form>

              {/* Contextual Architecture Guide Note */}
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted, #64748b)',
                  backgroundColor: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px dashed var(--border, #cbd5e1)',
                  lineHeight: '1.4'
                }}
              >
                💡 <strong>Territory Routing SSOT:</strong> Account managers act as the primary operational contact for clinics and practitioners inside their assigned territories. Orders and inquiries dispatch automatically to this queue.
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'assignments',
      label: `Assignments (${(manager.assignedClinics || 0) + (manager.assignedDoctors || 0)})`,
      icon: Users,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Building2 size={16} color="var(--text-muted)" /> Clinics ({manager.assignedClinics || 0})
              </h4>
              <button className="btn btn-icon btn-sm" title="Assign clinic"><Plus size={16} /></button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Elite Wellness Clinic {i + 1}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dubai Healthcare City · UAE</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-icon btn-sm" title="View"><Eye size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Reassign"><Users size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Remove"><X size={14} color="var(--color-danger)" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <UserCircle size={16} color="var(--text-muted)" /> Doctors & Practitioners ({manager.assignedDoctors || 0})
              </h4>
              <button className="btn btn-icon btn-sm" title="Assign doctor"><Plus size={16} /></button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[1, 2].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderBottom: i < 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Dr. Sarah Jenkins {i + 1}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Regenerative & Anti-Aging Medicine</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-icon btn-sm" title="View"><Eye size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Reassign"><Users size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Remove"><X size={14} color="var(--color-danger)" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: TrendingUp,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <DollarSign size={14} /> Revenue Generated
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>
                ${(manager.revenue || 124500).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>↑ 12% vs last month</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Activity size={14} /> Orders Handled
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>34</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>↑ 4% vs last month</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Building2 size={14} /> Active Accounts
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>8</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>100% Retention</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Target size={14} /> Conversion Rate
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>24%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>↓ 2% vs last month</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Toggle
              label="Account Active"
              checked={!disabled}
              onChange={(checked) => {
                setDisabled(!checked);
                setHasChanges(true);
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '3rem' }}>
              Enables or suspends account manager access to the platform console.
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Toggle
              label="Can Modify Territories"
              checked={canModifyTerritories}
              onChange={(checked) => {
                setCanModifyTerritories(checked);
                setHasChanges(true);
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '3rem' }}>
              Allows manager to self-reassign territories and handover leads.
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Toggle
              label="Can Access Analytics & Financials"
              checked={canAccessAnalytics}
              onChange={(checked) => {
                setCanAccessAnalytics(checked);
                setHasChanges(true);
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '3rem' }}>
              Grants visibility into margins, wholesale volume, and commission tiers.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Clock,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { a: 'Logged in to Admin Portal', d: 'Today, 09:41 AM' },
            { a: 'Assigned to Elite Wellness Clinic', d: 'Yesterday, 02:15 PM' },
            { a: 'Updated Territory limits (UAE Core)', d: '3 Days Ago' },
            { a: 'Dispatched wholesale consignment PO-9281', d: '5 Days Ago' }
          ].map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary, #2563eb)', marginTop: '6px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>{log.a}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.d}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <>
      {/* ── BACKDROP (GCP Elevation Standard) ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          zIndex: 998,
          backdropFilter: 'blur(3px)',
          transition: 'opacity 0.2s ease'
        }}
        onClick={onClose}
      />

      {/* ── DRAWER (Google Cloud Side Panel Standard) ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? '100vw' : '640px',
          maxWidth: '100vw',
          backgroundColor: 'var(--surface, #ffffff)',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.16)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* ── STICKY HEADER (GCP Standard) ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            backgroundColor: 'var(--surface, #ffffff)',
            flexShrink: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-soft, #eff6ff)',
                color: 'var(--primary, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Briefcase size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  Account Manager Profile
                </h2>
                <StatusChip status={disabled ? 'disabled' : 'active'} label={disabled ? 'Suspended' : 'Active'} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                <span>ID:</span>
                <CopyableId value={manager.id} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #64748b)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Executive Summary Header */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid var(--border, #cbd5e1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                {manager.photoURL ? (
                  <img src={manager.photoURL} alt={manager.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle size={44} color="var(--text-muted, #94a3b8)" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {manager.displayName || manager.name || 'Unnamed Manager'}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted, #64748b)', fontSize: '0.84rem' }}>
                  <Mail size={13} /> {manager.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted, #64748b)', fontSize: '0.84rem', marginTop: '2px' }}>
                  <MapPin size={13} /> {territories.length ? `${territories.length} Territories (${territories.map((t) => t.name).join(', ')})` : 'Global Coverage'}
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid (4 Balanced GCP Metrics) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Clinics</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{manager.assignedClinics || 0}</div>
              </div>
              <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Doctors</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>{manager.assignedDoctors || 0}</div>
              </div>
              <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Revenue</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-success, #16a34a)' }}>${(manager.revenue || 124500).toLocaleString()}</div>
              </div>
              <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', fontWeight: 600 }}>Last Active</div>
                <div style={{ fontSize: '0.90rem', fontWeight: 600, color: 'var(--text-main, #0f172a)', marginTop: '2px' }}>Today</div>
              </div>
            </div>

            {/* Workload Indicator */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>Workload Capacity</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: workloadPercentage > 80 ? 'var(--color-danger, #dc2626)' : 'var(--text-main, #0f172a)' }}>
                  {workloadPercentage}%
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${workloadPercentage}%`,
                    backgroundColor: workloadPercentage > 80 ? 'var(--color-danger, #dc2626)' : workloadPercentage > 50 ? 'var(--color-warning, #d97706)' : 'var(--color-success, #16a34a)',
                    transition: 'width 0.4s ease-out'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
                Based on active clinics, doctors, leads, and orders managed.
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ padding: '1.25rem 1.5rem 2rem 1.5rem' }}>
            <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
          </div>
        </div>

        {/* ── STICKY FOOTER (Google Cloud Standard Sticky Footer) ── */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
            backgroundColor: 'var(--surface, #ffffff)',
            borderTop: '1px solid var(--border, #e2e8f0)',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)',
            flexShrink: 0
          }}
        >
          {/* Left: Sticker / Status Indicator */}
          <div>
            {hasChanges ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  color: '#d97706',
                  backgroundColor: '#fffbeb',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid #fde68a'
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#d97706' }} />
                Unsaved changes
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted, #64748b)'
                }}
              >
                <CheckCircle2 size={14} color="#16a34a" />
                Synchronized with Firestore SSOT
              </span>
            )}
          </div>

          {/* Right: Functional Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {hasChanges && (
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleDiscard}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={13} />
                <span>Discard</span>
              </button>
            )}

            <button
              type="button"
              className="gcp-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {hasChanges ? 'Cancel' : 'Close'}
            </button>

            <button
              type="button"
              className="gcp-btn-primary"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: hasChanges ? '#1a73e8' : '#e2e8f0',
                color: hasChanges ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: hasChanges && !isSaving ? 'pointer' : 'not-allowed',
                boxShadow: hasChanges ? '0 1px 3px rgba(26, 115, 232, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {isSaving ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
