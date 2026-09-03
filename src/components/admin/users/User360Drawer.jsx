'use client';

import React, { useState, useEffect } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Eye, 
  SlidersHorizontal, 
  CheckCircle,
  FileText
} from '@/lib/icons';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import notifier from '@/services/NotificationService';
import CopyableId from '@/components/ui/CopyableId';

export default function User360Drawer({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onImpersonate
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'patient',
    status: 'active',
    pricingChannel: 'clinic',
    customDiscountPct: 0,
    clinicName: '',
    phone: '',
    zohoContactId: '',
    permissions: {
      useClinicalAI: true,
      canRecommend: true,
      canBulkOrder: false,
      viewCostPrice: false,
      manageStaff: false,
      trackCommission: true
    }
  });

  useEffect(() => {
    if (user) {
      const resolvedName = user.fullName 
        || user.displayName 
        || ([user.firstName, user.lastName].filter(Boolean).join(' ')) 
        || user.name 
        || '';

      setFormData({
        displayName: resolvedName,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || user.contactEmail || '',
        role: user.role || (user.roles && user.roles[0]) || 'patient',
        status: user.status || (user.approved ? 'active' : 'pending'),
        pricingChannel: user.pricingChannel || user.priceTier || (user.role === 'wholesaler' ? 'wholesale' : user.role === 'doctor' ? 'clinic' : 'retail'),
        customDiscountPct: user.customDiscountPct || user.discount || 0,
        clinicName: user.clinicName || user.practiceName || user.institution || '',
        phone: user.phone || user.phoneNumber || '',
        zohoContactId: user.zohoContactId || user.zohoId || '',
        permissions: {
          useClinicalAI: user.permissions?.useClinicalAI ?? true,
          canRecommend: user.permissions?.canRecommend ?? true,
          canBulkOrder: user.permissions?.canBulkOrder ?? (user.role === 'wholesaler' || user.role === 'clinic'),
          viewCostPrice: user.permissions?.viewCostPrice ?? (user.role === 'admin'),
          manageStaff: user.permissions?.manageStaff ?? (user.role === 'clinic' || user.role === 'admin'),
          trackCommission: user.permissions?.trackCommission ?? true
        }
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    if (!user.id && !user.uid) return;
    const userId = user.id || user.uid;

    try {
      setIsSaving(true);
      const userRef = doc(db, 'users', userId);

      const updates = {
        displayName: formData.displayName,
        name: formData.displayName,
        role: formData.role,
        roles: [formData.role],
        status: formData.status,
        pricingChannel: formData.pricingChannel,
        priceTier: formData.pricingChannel,
        customDiscountPct: Number(formData.customDiscountPct || 0),
        clinicName: formData.clinicName,
        phone: formData.phone,
        zohoContactId: formData.zohoContactId,
        permissions: formData.permissions,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updates);
      notifier.success(`User "${formData.displayName || formData.email}" updated successfully!`);

      if (onUserUpdated) {
        onUserUpdated({ ...user, ...updates });
      }
      onClose();
    } catch (err) {
      console.error('[User360Drawer] Save error:', err);
      notifier.error('Failed to save user updates: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePermission = (permKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={formData.displayName || formData.email || 'User Profile 360°'}
      subtitle={`UID: ${user.id || user.uid || '---'} · Role: ${formData.role.toUpperCase()}`}
      width="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem'
        }}>
          {[
            { key: 'profile', label: 'Identity & Profile', icon: User },
            { key: 'pricing', label: 'Pricing & Channels', icon: DollarSign },
            { key: 'permissions', label: 'Atomic RBAC & AI', icon: ShieldCheck },
            { key: 'erp', label: 'Zoho ERP & Billing', icon: Building2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(0,163,224,0.1)' : 'transparent',
                  color: isActive ? 'var(--primary)' : '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile & Identity */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Full Name / Legal Name:
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Email Address:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  System Role:
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="doctor">Practitioner / Physician</option>
                  <option value="clinic">Clinic / Medical Group</option>
                  <option value="wholesaler">Wholesaler / Distributor</option>
                  <option value="patient">Patient / Consumer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Account Status:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="active">Active (Verified)</option>
                  <option value="pending">Pending Verification</option>
                  <option value="suspended">Suspended / On Hold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                Affiliated Clinic / Hospital / Practice:
              </label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                placeholder="e.g. Mediluxe Aesthetics Clinic Dubai"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                Direct Phone / WhatsApp:
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 000 0000"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Account Created:</span>
                <strong>{user.createdAt ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt).toLocaleDateString() : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Unique User ID:</span>
                <CopyableId value={user.id || user.uid} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pricing & Commercial Channels */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.25rem' }}>
                Multi-Channel Pricing Tier Assignment
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                Determines which catalog prices this user sees across all peptide compounds and protocols.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                Commercial Pricing Channel:
              </label>
              <select
                value={formData.pricingChannel}
                onChange={(e) => setFormData(prev => ({ ...prev, pricingChannel: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}
              >
                <option value="wholesale">Wholesale B2B (Cost + 30-35%) — Minimum Order Volumes</option>
                <option value="clinic">Clinic / Doctor (Cost + 50-55%) — Practice Use</option>
                <option value="retail">Retail / Patient (Cost + 80-100%) — Public Price</option>
                <option value="cost">Acquisition Cost (Cost + 0%) — Internal Admin Only</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                Custom Account Discount (% Override):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.customDiscountPct}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDiscountPct: e.target.value }))}
                  style={{ width: '120px', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>% off assigned channel catalog prices</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Atomic RBAC & AI Permissions */}
        {activeTab === 'permissions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Granular feature switches and AI Copilot access for this specific account:
            </div>

            {[
              { key: 'useClinicalAI', title: 'Clinical AI Copilot & AI Scribe', desc: 'Allow automated prescription extraction from voice/notes and clinical synergy detection', icon: Sparkles },
              { key: 'canRecommend', title: 'Patient Protocol Recommendations', desc: 'Allow generating direct recommendation links for patients', icon: CheckCircle },
              { key: 'canBulkOrder', title: 'Bulk Wholesale Orders (POs)', desc: 'Enable multi-pack purchasing and direct supplier purchase orders', icon: DollarSign },
              { key: 'viewCostPrice', title: 'View Supplier Acquisition Costs', desc: 'Display Ex-Works lab acquisition cost and margin waterfall columns', icon: Eye },
              { key: 'manageStaff', title: 'Manage Sub-Practitioners & Staff', desc: 'Allow inviting colleagues and assigning doctor permissions within the clinic', icon: Building2 },
              { key: 'trackCommission', title: 'Affiliate & Commission Tracking', desc: 'Generate referral tracking tokens and track monthly dispensed volume', icon: SlidersHorizontal }
            ].map(perm => {
              const Icon = perm.icon;
              const isChecked = Boolean(formData.permissions[perm.key]);
              return (
                <div
                  key={perm.key}
                  onClick={() => handleTogglePermission(perm.key)}
                  style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    backgroundColor: isChecked ? 'rgba(0,163,224,0.04)' : '#f8fafc',
                    border: `1px solid ${isChecked ? 'rgba(0,163,224,0.3)' : '#e2e8f0'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isChecked ? 'var(--primary)' : '#e2e8f0',
                      color: isChecked ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isChecked ? '#0f172a' : '#64748b' }}>
                        {perm.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {perm.desc}
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: ERP & Zoho Integration */}
        {activeTab === 'erp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '0.25rem' }}>
                Zoho Books & CRM Enterprise Synchronization
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                Linked ERP Contact allows automatic invoice generation and automated payment reconciliation.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                Zoho Contact ID:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={formData.zohoContactId}
                  onChange={(e) => setFormData(prev => ({ ...prev, zohoContactId: e.target.value }))}
                  placeholder="e.g. 662274409000123456"
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                {formData.zohoContactId && (
                  <a
                    href={`https://books.zoho.com/app#/contacts/${formData.zohoContactId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.78rem',
                      color: '#0284c7',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    <ExternalLink size={14} /> Open in Zoho
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              if (onImpersonate) {
                onImpersonate(user);
                onClose();
              }
            }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#c2410c',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Eye size={15} /> Act As This User (Simulate)
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Check size={16} /> {isSaving ? 'Saving...' : 'Save User 360°'}
            </button>
          </div>
        </div>
      </div>
    </StandardDrawer>
  );
}
