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
  const [lotusMarkup, setLotusMarkup] = useState(15);
  const [selectedCatalogCollection, setSelectedCatalogCollection] = useState('peptides');

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'patient',
    status: 'active',
    pricingChannel: 'clinic',
    customDiscountPct: 0,
    atlasMarkupPct: 35,
    wholesalerMarginPct: 25,
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

      const isWs = user.role === 'wholesaler' || user.role === 'wholeseller';

      setFormData({
        displayName: resolvedName,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || user.contactEmail || '',
        role: user.role || (user.roles && user.roles[0]) || 'patient',
        status: user.status || (user.approved ? 'active' : 'pending'),
        pricingChannel: user.pricingChannel || user.priceTier || (isWs ? 'wholesale' : user.role === 'doctor' ? 'clinic' : 'retail'),
        customDiscountPct: user.customDiscountPct || user.discount || 0,
        atlasMarkupPct: user.atlasMarkupPct ?? user.priceMarkupPercent ?? (isWs ? 35 : 40),
        wholesalerMarginPct: user.wholesalerMarginPct ?? user.resellerDiscountPct ?? (isWs ? 25 : 15),
        clinicName: user.clinicName || user.practiceName || user.institution || '',
        phone: user.phone || user.phoneNumber || '',
        zohoContactId: user.zohoContactId || user.zohoId || '',
        permissions: {
          useClinicalAI: user.permissions?.useClinicalAI ?? true,
          canRecommend: user.permissions?.canRecommend ?? true,
          canBulkOrder: user.permissions?.canBulkOrder ?? (isWs || user.role === 'clinic'),
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
    if (user) {
      const isWs = user.role === 'wholesaler' || user.role === 'wholeseller';
      setLotusMarkup(Number(user.customDiscountPct || user.priceMarkupPercent || (isWs ? 15 : 30)));
    }
  }, [activeTab, user]);

  const CATALOG_COLLECTIONS = [
    { id: 'peptides', label: 'Lotusland Peptides (Lyophilized Vials)', supplierId: 'supplier-lotusland', catalogueFilter: 'peptides', icon: '🧪' },
    { id: 'ultraperson', label: 'UltraPerson™ Precision Nutraceuticals', supplierId: 'supplier-pharmapolis', catalogueFilter: 'ultraperson', icon: '🌿' },
    { id: 'colway', label: 'Colway® Bioactive Tropocollagen', supplierId: 'supplier-colway', catalogueFilter: 'colway', icon: '✨' },
    { id: 'bloodo', label: 'Bloodo™ CE-IVDR Capillary Diagnostics', supplierId: 'supplier-bloodo', catalogueFilter: 'bloodo', icon: '🩸' },
    { id: 'eterna', label: 'ETERNA® Multi-Omics Longevity', supplierId: 'supplier-eterna', catalogueFilter: 'eterna', icon: '🧬' },
    { id: 'all', label: 'Master Portfolio (All Clinical Lines)', supplierId: null, catalogueFilter: 'all', icon: '🏛️' }
  ];

  const handleShareCatalog = async (actionType = 'whatsapp') => {
    const userId = user?.id || user?.uid;
    const fullName = formData.displayName || 'Doctor / Partner';
    const phone = formData.phone || '';
    const email = formData.email || '';
    const isWs = formData.role === 'wholesaler' || formData.role === 'wholeseller' || user?.role === 'wholesaler' || user?.role === 'wholeseller';
    
    // Compounded effective double markup: Atlas markup over cost + Wholesaler margin to client
    const atlasMarkup = Number(formData.atlasMarkupPct || 35);
    const wsMargin = Number(formData.wholesalerMarginPct || 25);
    const effectiveMarkup = Math.round(((1 + atlasMarkup / 100) * (1 + wsMargin / 100) - 1) * 100);

    const colConfig = CATALOG_COLLECTIONS.find(c => c.id === selectedCatalogCollection) || CATALOG_COLLECTIONS[0];

    setIsSharingLotus(true);
    try {
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: colConfig.supplierId,
          catalogueFilter: colConfig.catalogueFilter,
          category: colConfig.id,
          recipientUserId: userId,
          recipientName: fullName,
          recipientPhone: phone,
          recipientEmail: email,
          recipientType: isWs ? 'wholesaler' : (formData.role || 'clinic'),
          priceSource: isWs ? 'wholeseller' : (formData.pricingChannel || 'clinic'),
          priceMarkupPercent: effectiveMarkup,
          currency: user?.currency || 'USD',
          channel: actionType === 'whatsapp' ? 'whatsapp' : 'clipboard',
          sentBy: 'Atlas Commercial Desk'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate link');

      const shortUrl = data.shortUrl || data.shareableUrl;
      const cleanPhone = phone.replace(/[^\d]/g, '');
      const message = `Hello ${fullName}, here is your customized ${colConfig.label} B2B wholesale catalog with configured practice margins (+${effectiveMarkup}%):\n\n🔗 ${shortUrl}\n\nPlease let me know if you need any adjustments or bulk orders.`;

      if (actionType === 'copy') {
        await navigator.clipboard.writeText(shortUrl);
        notifier.success(`Catalog link copied (+${effectiveMarkup}% total margin): ${shortUrl}`);
      } else if (actionType === 'whatsapp' && cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
        notifier.success(`WhatsApp link generated and opened: ${shortUrl}`);
      } else {
        await navigator.clipboard.writeText(message);
        notifier.success(`Message and link copied to clipboard: ${shortUrl}`);
      }

      await fetchSharedLinks();
    } catch (err) {
      console.error('Error sharing catalog:', err);
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
        atlasMarkupPct: Number(formData.atlasMarkupPct || 35),
        wholesalerMarginPct: Number(formData.wholesalerMarginPct || 25),
        priceMarkupPercent: Number(formData.atlasMarkupPct || 35),
        customDiscountPct: Number(formData.wholesalerMarginPct || 0),
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
      subtitle={`UID: ${user.id || user.uid || '---'} · Role: ${formData.role.toUpperCase()}${(user.zohoContactId || user.biginContactId || user.zohoSyncStatus === 'synced') ? ' · ⚡ Bigin Synced' : ''}`}
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
            {(user.zohoContactId || user.biginContactId || user.zohoSyncStatus === 'synced') && (
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#16a34a" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                      Sincronizado con Zoho Bigin CRM ✓
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                      Contact ID: <strong>{user.zohoContactId || user.biginContactId}</strong> {user.zohoAccountId ? `· Account ID: ${user.zohoAccountId}` : ''}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d'
                }}>
                  BIDIRECTIONAL SYNC
                </span>
              </div>
            )}
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

        {/* Tab 2: Pricing & Double Margin Engine */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.25rem' }}>
                Double Margin Engine & Pricing Channels (Admin Control)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                Control both the Atlas gross markup over supplier base cost and the practice margin allocated to this partner.
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
                <option value="wholesale">Wholesale B2B Distributor (COGS + Custom Atlas Margin)</option>
                <option value="clinic">Clinic / Doctor (Direct Practice Use)</option>
                <option value="retail">Retail / Patient (Public Reference Price)</option>
                <option value="cost">Acquisition Cost (Cost + 0% — Internal Admin Only)</option>
              </select>
            </div>

            {/* Double Margin Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  1. Atlas Margin over Cost:
                </label>
                <div style={{ fontSize: '0.70rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Gross markup retained by Atlas over supplier COGS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={formData.atlasMarkupPct}
                    onChange={(e) => setFormData(prev => ({ ...prev, atlasMarkupPct: Number(e.target.value) }))}
                    style={{ width: '90px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7' }}>% over COGS</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  2. Wholesaler Reseller Margin:
                </label>
                <div style={{ fontSize: '0.70rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Margin allocated to wholesaler when selling to clinics
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formData.wholesalerMarginPct}
                    onChange={(e) => setFormData(prev => ({ ...prev, wholesalerMarginPct: Number(e.target.value) }))}
                    style={{ width: '90px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>% to clinics</span>
                </div>
              </div>
            </div>

            {/* Live Double Margin Waterfall Simulation */}
            {(() => {
              const sampleCost = 20.00;
              const atlasMarkup = Number(formData.atlasMarkupPct || 35);
              const wsMargin = Number(formData.wholesalerMarginPct || 25);
              const b2bPrice = sampleCost * (1 + atlasMarkup / 100);
              const atlasProfit = b2bPrice - sampleCost;
              const finalClinicPrice = b2bPrice * (1 + wsMargin / 100);
              const wsProfit = finalClinicPrice - b2bPrice;
              const totalChainMarkup = Math.round(((finalClinicPrice / sampleCost) - 1) * 100);

              return (
                <div style={{ padding: '0.9rem 1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>⚡ Live Price Waterfall (Sample €20.00 Reference Item)</span>
                    <span style={{ color: '#0284c7', fontWeight: 700 }}>+{totalChainMarkup}% Combined Margin</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                    <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Supplier Cost (COGS)</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#475569' }}>€{sampleCost.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: '0.5rem', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '0.68rem', color: '#0369a1' }}>Atlas Wholesale B2B</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7' }}>€{b2bPrice.toFixed(2)}</div>
                      <div style={{ fontSize: '0.64rem', color: '#16a34a' }}>+€{atlasProfit.toFixed(2)} Atlas profit</div>
                    </div>
                    <div style={{ padding: '0.5rem', background: '#f0f4f8', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '0.68rem', color: '#166534' }}>Downstream Clinic Price</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#16a34a' }}>€{finalClinicPrice.toFixed(2)}</div>
                      <div style={{ fontSize: '0.64rem', color: '#15803d' }}>+€{wsProfit.toFixed(2)} Wholesaler profit</div>
                    </div>
                  </div>
                </div>
              );
            })()}
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
            {/* Action Banner: Multi-Catalog B2B Sharing */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={16} /> Multi-Portfolio B2B Document Sharing
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    Generate tracked short links (<code style={{ color: '#166534', fontWeight: 700 }}>/c/CAT-...</code>) with tailored wholesale double-margins and automated order attribution.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleShareCatalog('copy')}
                    disabled={isSharingLotus}
                    style={{
                      padding: '0.55rem 0.85rem',
                      backgroundColor: '#ffffff',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: isSharingLotus ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      flexShrink: 0
                    }}
                  >
                    <Copy size={14} /> {isSharingLotus ? 'Generating...' : 'Copy Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareCatalog('whatsapp')}
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
                    <Send size={14} /> {isSharingLotus ? 'Generating...' : 'Share via WhatsApp'}
                  </button>
                </div>
              </div>

              {/* Multi-Catalog Collection Selector */}
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '0.35rem' }}>
                  Select Clinical Portfolio to Share:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {CATALOG_COLLECTIONS.map(col => {
                    const isSelected = selectedCatalogCollection === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedCatalogCollection(col.id)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          border: isSelected ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#16a34a' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{col.icon}</span>
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Double Margin Summary Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.35rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.72rem', color: '#64748b' }}>
                <span>Recipient: <strong>{formData.displayName || 'Valued Partner'}</strong></span>
                <span>Atlas Margin: <strong style={{ color: '#0284c7' }}>+{formData.atlasMarkupPct}%</strong></span>
                <span>Wholesaler Margin: <strong style={{ color: '#16a34a' }}>+{formData.wholesalerMarginPct}%</strong></span>
                <span>Effective Combined: <strong style={{ color: '#166534' }}>+{Math.round(((1 + Number(formData.atlasMarkupPct || 35) / 100) * (1 + Number(formData.wholesalerMarginPct || 25) / 100) - 1) * 100)}%</strong></span>
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
                    const shortUrl = link.shortUrl || `https://www.atlashealth-services.com/c/${link.catalogId}`;
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
                          gap: '0.45rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <CopyableId value={link.catalogId || link.id} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                              {link.assetType === 'variant_datasheet' || link.catalogType === 'variant_datasheet'
                                ? `📄 Ficha: ${link.productName || 'Compound'} ${link.dose || ''}`.trim()
                                : link.assetType === 'protocol' || link.catalogType === 'protocols'
                                ? `🩺 Protocolo: ${link.assetTitle || link.catalogId}`
                                : `📦 Catálogo: ${link.catalogueFilter || (link.supplierId ? link.supplierId.replace(/^supplier-/, '') : 'General')}`}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {(link.visitsCount > 0 || link.readStatus === 'read' || link.status === 'read' || link.status === 'viewed') ? (
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                color: '#166534',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <Check size={10} color="#16a34a" /> Leído ({link.visitsCount || 1})
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: 600,
                                color: '#92400e',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                Pendiente ⏳
                              </span>
                            )}
                            <StatusBadge status={link.status || 'sent'} />
                          </div>
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

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
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

                          {formData.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                const cleanPhone = formData.phone.replace(/[^\d]/g, '');
                                const docLabel = (link.assetType === 'variant_datasheet' || link.catalogType === 'variant_datasheet')
                                  ? `la ficha técnica de ${link.productName || 'este compuesto'}`
                                  : (link.assetType === 'protocol' || link.catalogType === 'protocols')
                                  ? `el protocolo clínico solicitado`
                                  : `el catálogo oficial actualizado`;
                                const msg = `Hola ${formData.displayName || 'Doctor / Partner'}, te comparto el enlace a ${docLabel}:\n\n🔗 ${shortUrl}\n\nQuedo a tu disposición.`;
                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              style={{
                                padding: '0.3rem 0.6rem',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                color: '#166534',
                                fontWeight: 600
                              }}
                            >
                              <Send size={11} /> Reenviar WhatsApp
                            </button>
                          )}

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
                            <ExternalLink size={12} />
                            {(link.assetType === 'variant_datasheet' || link.catalogType === 'variant_datasheet')
                              ? 'Ver Ficha Técnica'
                              : (link.assetType === 'protocol' || link.catalogType === 'protocols')
                              ? 'Ver Protocolo'
                              : 'Ver Catálogo'}
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
