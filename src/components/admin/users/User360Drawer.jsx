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
  FileText,
  Share2,
  Send,
  Clock,
  RefreshCw,
  MessageSquare
} from '@/lib/icons';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import notifier from '@/services/NotificationService';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';

export default function User360Drawer({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onImpersonate
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Shared Catalogs State
  const [sharedLinks, setSharedLinks] = useState([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isSharingLotus, setIsSharingLotus] = useState(false);

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

  // Load shared catalog links for this specific user
  const fetchSharedLinks = async () => {
    if (!user) return;
    const userId = user.id || user.uid;
    setIsLoadingLinks(true);
    try {
      let links = [];
      if (userId) {
        const q = query(
          collection(db, 'shared_catalog_links'),
          where('recipientUserId', '==', userId),
          limit(25)
        );
        const snap = await getDocs(q);
        snap.forEach(d => links.push({ id: d.id, ...d.data() }));
      }
      // Also fallback by phone if available
      const phone = user.phone || user.phoneNumber;
      if (phone && links.length === 0) {
        const qPhone = query(
          collection(db, 'shared_catalog_links'),
          where('recipientPhone', '==', phone),
          limit(25)
        );
        const snapPhone = await getDocs(qPhone);
        snapPhone.forEach(d => {
          if (!links.some(l => l.id === d.id)) links.push({ id: d.id, ...d.data() });
        });
      }
      // Sort newest first
      links.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setSharedLinks(links);
    } catch (err) {
      console.warn('Error loading user shared catalogs:', err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'catalogs' && user) {
      fetchSharedLinks();
    }
  }, [activeTab, user]);

  const handleShareLotusland = async () => {
    const userId = user?.id || user?.uid;
    const fullName = formData.displayName || 'Doctor / Partner';
    const phone = formData.phone || '';
    const email = formData.email || '';

    setIsSharingLotus(true);
    try {
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: 'supplier-lotusland',
          catalogueFilter: 'RegenPept',
          recipientUserId: userId,
          recipientName: fullName,
          recipientPhone: phone,
          recipientEmail: email,
          recipientType: formData.role || 'clinic',
          priceSource: formData.pricingChannel || 'clinic',
          currency: 'USD',
          channel: 'whatsapp',
          sentBy: 'Atlas Commercial Desk'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate link');

      const shortUrl = data.shortUrl || data.shareableUrl;
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const message = `Hola ${fullName}, te comparto el catálogo clínico oficial de formulaciones analíticas de Lotusland / RegenPept:\n\n🔗 ${shortUrl}\n\nQuedo a tu disposición para cualquier cotización o pedido.`;

      if (cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
        notifier.success(`Enlace corto generado y WhatsApp abierto: ${shortUrl}`);
      } else {
        await navigator.clipboard.writeText(message);
        notifier.success(`Enlace corto copiado al portapapeles: ${shortUrl}`);
      }

      await fetchSharedLinks();
    } catch (err) {
      console.error('Error sharing Lotusland catalog:', err);
      notifier.error(err.message || 'Error generating catalog link');
    } finally {
      setIsSharingLotus(false);
    }
  };

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
            { key: 'erp', label: 'Zoho ERP & Billing', icon: Building2 },
            { key: 'catalogs', label: 'Catalogs & Shares', icon: FileText }
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

        {/* Tab 5: Shared Catalogs & Client Activity */}
        {activeTab === 'catalogs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Action Banner: Send Lotusland Catalog */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={16} /> Compartir Catálogo Lotusland
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Genera un enlace corto (<code style={{ color: '#166534', fontWeight: 700 }}>/c/CAT-...</code>) con vista previa de WhatsApp y registra la trazabilidad del cliente.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleShareLotusland}
                  disabled={isSharingLotus}
                  style={{
                    padding: '0.55rem 1rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: isSharingLotus ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 4px rgba(22,163,74,0.3)',
                    flexShrink: 0
                  }}
                >
                  <Send size={14} /> {isSharingLotus ? 'Generando...' : 'Enviar por WhatsApp'}
                </button>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span>Destinatario: <strong>{formData.displayName || 'Valued Partner'}</strong></span>
                <span>Canal: <strong>{formData.pricingChannel.toUpperCase()}</strong></span>
                <span>Teléfono: <strong>{formData.phone || 'No registrado'}</strong></span>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{sharedLinks.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Enlaces Compartidos</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>
                  {sharedLinks.reduce((acc, curr) => acc + (curr.visitsCount || 0), 0)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Aperturas / Visitas</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>
                  {sharedLinks.filter(l => l.status === 'engaged' || l.status === 'converted' || l.cartItemsCount > 0).length}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Con Interacción</div>
              </div>
            </div>

            {/* Shared Links History List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  Historial de Envíos y Telemetría:
                </div>
                <button
                  type="button"
                  onClick={fetchSharedLinks}
                  disabled={isLoadingLinks}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <RefreshCw size={12} /> Actualizar
                </button>
              </div>

              {isLoadingLinks ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  Cargando actividad...
                </div>
              ) : sharedLinks.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  No se han enviado catálogos a este usuario todavía. Haz clic en <strong>Enviar por WhatsApp</strong> para iniciar el contacto.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sharedLinks.map(link => {
                    const shortUrl = link.shortUrl || `https://med-peptides.com/c/${link.catalogId}`;
                    const createdDate = link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'N/A';
                    const lastVisited = link.lastVisitedAt ? new Date(link.lastVisitedAt).toLocaleString() : null;

                    return (
                      <div
                        key={link.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CopyableId value={link.catalogId || link.id} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                              {link.catalogueFilter || (link.supplierId ? link.supplierId.replace(/^supplier-/, '') : 'General')}
                            </span>
                          </div>
                          <StatusBadge status={link.status || 'sent'} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Enviado: {createdDate} ({link.channel || 'whatsapp'})
                          </div>
                          <div>
                            <strong>{link.visitsCount || 0} visitas</strong>
                            {lastVisited && <span style={{ marginLeft: '0.3rem' }}>(última: {lastVisited})</span>}
                          </div>
                        </div>

                        {link.cartSummary && (
                          <div style={{
                            padding: '0.35rem 0.5rem',
                            backgroundColor: '#f5f3ff',
                            borderRadius: '6px',
                            border: '1px solid #ddd6fe',
                            fontSize: '0.72rem',
                            color: '#6d28d9'
                          }}>
                            🛒 Carrito activo: {link.cartSummary}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(shortUrl);
                              notifier.success('Enlace corto copiado: ' + shortUrl);
                            }}
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              color: '#334155'
                            }}
                          >
                            <Copy size={12} /> Copiar Link
                          </button>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              textDecoration: 'none',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontWeight: 600
                            }}
                          >
                            <ExternalLink size={12} /> Ver Catálogo
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
