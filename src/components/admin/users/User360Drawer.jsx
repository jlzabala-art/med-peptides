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
import { updateUserRoleAction } from '@/actions/usersActions';

export default function User360Drawer({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onImpersonate,
  initialTab = 'profile'
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Shared Catalogs State
  const [sharedLinks, setSharedLinks] = useState([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isSharingLotus, setIsSharingLotus] = useState(false);
  const [lotusMarkup, setLotusMarkup] = useState(15);
  const [selectedCatalogCollection, setSelectedCatalogCollection] = useState('peptides');
  const [shareCurrency, setShareCurrency] = useState('USD');
  const [shareLang, setShareLang] = useState('en');
  const [sharePriceTier, setSharePriceTier] = useState('clinic');

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
      const links = [];
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
      const isPt = user.role === 'patient';
      setLotusMarkup(Number(user.customDiscountPct || user.priceMarkupPercent || (isWs ? 15 : 30)));

      // Auto-detect currency from user profile or country/phone
      const userCurr = user.currency || (user.country === 'ES' || user.country === 'GR' ? 'EUR' : user.country === 'GB' ? 'GBP' : user.country === 'AE' ? 'AED' : user.country === 'SA' ? 'SAR' : 'USD');
      setShareCurrency(userCurr);

      // Auto-detect language (Spanish if phone has Spanish/LatAm prefix or user.language === 'es')
      const phone = String(user.phone || user.phoneNumber || '');
      const isSpanishPhone = phone.startsWith('+34') || phone.startsWith('0034') || phone.startsWith('+52') || phone.startsWith('+54') || phone.startsWith('+57') || phone.startsWith('+56') || phone.startsWith('+51');
      const userLang = (user.language === 'es' || user.lang === 'es' || user.country === 'ES' || isSpanishPhone) ? 'es' : 'en';
      setShareLang(userLang);

      // Auto-detect price tier
      const defaultTier = isWs ? 'wholeseller' : isPt ? 'retail' : 'clinic';
      setSharePriceTier(user.pricingChannel || user.priceTier || defaultTier);
    }
  }, [activeTab, user]);

  const CATALOG_COLLECTIONS = [
    { id: 'peptides', title: 'Lotusland Peptides', subtitle: 'Sterile Lyophilized Peptide Vials (10R)', label: 'Lotusland Peptides', supplierId: 'supplier-lotusland', catalogueFilter: 'peptides', icon: '🧪' },
    { id: 'ultraperson', title: 'UltraPerson™', subtitle: 'Clinical-Grade Precision Nutraceuticals', label: 'UltraPerson™', supplierId: 'supplier-pharmapolis', catalogueFilter: 'ultraperson', icon: '🌿' },
    { id: 'colway', title: 'Colway® Tropocollagen', subtitle: 'Native Bioactive Transdermal Collagen', label: 'Colway® Tropocollagen', supplierId: 'supplier-colway', catalogueFilter: 'colway', icon: '✨' },
    { id: 'bloodo', title: 'Bloodo™ Diagnostics', subtitle: 'CE-IVDR Certified Capillary Testing', label: 'Bloodo™ Diagnostics', supplierId: 'supplier-bloodo', catalogueFilter: 'bloodo', icon: '🩸' },
    { id: 'eterna', title: 'ETERNA® Longevity', subtitle: 'Multi-Omics & Epigenetic Aging Clocks', label: 'ETERNA® Longevity', supplierId: 'supplier-eternadx', catalogueFilter: 'eterna', icon: '🧬' },
    { id: 'compounding', title: 'Magenta Compounding', subtitle: 'Lipoderm Transdermals & Compounded APIs', label: 'Magenta Compounding', supplierId: 'supplier-magenta', catalogueFilter: 'compounding', icon: '⚗️' },
    { id: 'all', title: 'Master Portfolio', subtitle: 'All Clinical B2B Product Lines Combined', label: 'Master Portfolio', supplierId: null, catalogueFilter: 'all', icon: '🏛️' }
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
          catalogTitle: colConfig.title,
          catalogSubtitle: colConfig.subtitle,
          title: colConfig.title,
          portfolioType: colConfig.id,
          supplierLabel: colConfig.label,
          recipientUserId: userId,
          recipientName: fullName,
          recipientPhone: phone,
          recipientEmail: email,
          recipientType: isWs ? 'wholesaler' : (formData.role || 'clinic'),
          priceSource: sharePriceTier || (isWs ? 'wholeseller' : 'clinic'),
          priceMarkupPercent: effectiveMarkup,
          currency: shareCurrency || 'USD',
          lang: shareLang || 'en',
          language: shareLang || 'en',
          channel: actionType === 'whatsapp' ? 'whatsapp' : 'clipboard',
          sentBy: 'Atlas Commercial Desk'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate link');

      const baseShortUrl = data.shortUrl || data.shareableUrl;
      const separator = baseShortUrl.includes('?') ? '&' : '?';
      const shortUrl = `${baseShortUrl}${separator}lang=${shareLang}`;
      const cleanPhone = phone.replace(/[^\d]/g, '');

      // Contextual bilingual message
      const isSpanish = shareLang === 'es';
      const message = isSpanish
        ? `Hola ${fullName}, le comparto su catálogo oficial de ${colConfig.label} de Atlas Health Services con las condiciones comerciales acordadas (+${effectiveMarkup}%) en ${shareCurrency}:\n\n🔗 ${shortUrl}\n\nQuedo a su disposición para cualquier consulta o pedido.`
        : `Hello ${fullName}, here is your customized ${colConfig.label} B2B catalog from Atlas Health Services with configured practice margins (+${effectiveMarkup}%) in ${shareCurrency}:\n\n🔗 ${shortUrl}\n\nPlease let me know if you need any adjustments or bulk orders.`;

      if (actionType === 'copy') {
        await navigator.clipboard.writeText(shortUrl);
        notifier.success(`Catalog link copied (+${effectiveMarkup}% margin · ${shareCurrency} · ${shareLang.toUpperCase()}): ${shortUrl}`);
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

      // Synchronize Firebase Auth custom claims and authoritative server doc
      try {
        await updateUserRoleAction({ userId, role: formData.role });
      } catch (roleErr) {
        console.warn('[User360Drawer] updateUserRoleAction warning:', roleErr.message);
      }

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
      width="640px"
      actions={
        onImpersonate && (
          <button
            type="button"
            onClick={() => {
              onImpersonate(user);
              onClose();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={`Sign in as ${formData.displayName || 'this user'} to inspect the portal exactly as seen by them`}
          >
            <Eye size={13} color="#64748b" />
            <span>View Portal as {formData.displayName?.split(' ')[0] || 'User'}</span>
          </button>
        )
      }
      footer={
        activeTab === 'catalogs' ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.1rem',
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
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                backgroundColor: 'var(--primary, #003666)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={15} />
              <span>{isSaving ? 'Saving...' : 'Save User 360°'}</span>
            </button>
          </div>
        )
      }
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

        {/* Tab 5: Shared Catalogs & Client Activity (Google Cloud Console Standard) */}
        {activeTab === 'catalogs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Card: Portfolio Selection & Direct Action */}
            <div style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #dadce0',
              boxShadow: '0 1px 3px rgba(60,64,67,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} color="#1a73e8" />
                  <span>Select B2B Catalog to Share</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Choose the commercial line to share with <strong>{formData.displayName || 'this partner'}</strong> with automatic referral attribution and configured practice margin.
                </div>
              </div>

              {/* Multi-Catalog Cards Grid (Google Cloud Card Grid Standard) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                {CATALOG_COLLECTIONS.map(col => {
                  const isSelected = selectedCatalogCollection === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedCatalogCollection(col.id)}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        border: isSelected ? '2px solid #1a73e8' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        position: 'relative',
                        boxShadow: isSelected ? '0 1px 4px rgba(26,115,232,0.15)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{col.icon}</span>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: isSelected ? '18px' : '0' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                          {col.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isSelected ? '#2563eb' : '#64748b', marginTop: '2px', lineHeight: 1.25 }}>
                          {col.subtitle}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#1a73e8',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Commercial Issuance Parameters Bar (Google Cloud Standard) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px',
                padding: '0.75rem 0.95rem',
                backgroundColor: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px'
              }}>
                {/* 1. Price Source / Role Tier */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Target Role / Price Tier
                  </label>
                  <select
                    value={sharePriceTier}
                    onChange={(e) => setSharePriceTier(e.target.value)}
                    style={{
                      width: '100%',
                      height: '32px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#202124',
                      padding: '0 8px',
                      background: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="wholeseller">Wholesale B2B (Wholesaler)</option>
                    <option value="clinic">Doctor / Clinic Formulary</option>
                    <option value="retail">Patient MSRP (Retail)</option>
                  </select>
                </div>

                {/* 2. Target Currency */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Issuance Currency
                  </label>
                  <select
                    value={shareCurrency}
                    onChange={(e) => setShareCurrency(e.target.value)}
                    style={{
                      width: '100%',
                      height: '32px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#202124',
                      padding: '0 8px',
                      background: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="USD">USD ($) — Global Standard</option>
                    <option value="EUR">EUR (€) — Eurozone</option>
                    <option value="GBP">GBP (£) — United Kingdom</option>
                    <option value="AED">AED (د.إ) — UAE / GCC</option>
                    <option value="SAR">SAR (﷼) — Saudi Arabia</option>
                  </select>
                </div>

                {/* 3. Target Language */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Portal & WhatsApp Language
                  </label>
                  <select
                    value={shareLang}
                    onChange={(e) => setShareLang(e.target.value)}
                    style={{
                      width: '100%',
                      height: '32px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#202124',
                      padding: '0 8px',
                      background: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="es">🇪🇸 Español (es)</option>
                    <option value="en">🇬🇧 English (en)</option>
                  </select>
                </div>
              </div>

              {/* Direct Action Box: Ready Link & 1-Click Sharing (Google Cloud Standard) */}
              <div style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                    Active: <strong style={{ color: '#0f172a' }}>{CATALOG_COLLECTIONS.find(c => c.id === selectedCatalogCollection)?.title || 'Lotusland Peptides'}</strong>
                  </span>
                  <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
                    {shareCurrency} · {shareLang.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
                    +{Math.round(((1 + Number(formData.atlasMarkupPct || 35) / 100) * (1 + Number(formData.wholesalerMarginPct || 25) / 100) - 1) * 100)}% Margin
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleShareCatalog('copy')}
                    disabled={isSharingLotus}
                    style={{
                      padding: '0.55rem 1rem',
                      backgroundColor: '#ffffff',
                      color: '#1a73e8',
                      border: '1.5px solid #1a73e8',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: isSharingLotus ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Copy size={14} />
                    <span>{isSharingLotus ? 'Generating...' : 'Copy Shareable Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareCatalog('whatsapp')}
                    disabled={isSharingLotus}
                    style={{
                      padding: '0.55rem 1.15rem',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: isSharingLotus ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(22,163,74,0.3)'
                    }}
                  >
                    <Send size={14} />
                    <span>{isSharingLotus ? 'Generating...' : 'Send via WhatsApp'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#202124' }}>{sharedLinks.length}</div>
                <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>Shared Links</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#137333' }}>
                  {sharedLinks.reduce((acc, curr) => acc + (curr.visitsCount || 0), 0)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>Link Views</div>
              </div>
              <div style={{ padding: '0.65rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a73e8' }}>
                  {sharedLinks.filter(l => l.status === 'engaged' || l.status === 'converted' || l.cartItemsCount > 0).length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>Active Engagements</div>
              </div>
            </div>

            {/* Shared Links History List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3c4043' }}>
                  Link Sharing History & Telemetry:
                </div>
                <button
                  type="button"
                  onClick={fetchSharedLinks}
                  disabled={isLoadingLinks}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#5f6368',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              {isLoadingLinks ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                  Loading telemetry...
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
                  No shared links found for this user yet. Select a portfolio above and click <strong>Share via WhatsApp</strong> or <strong>Copy Link</strong>.
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
                                ? `Datasheet: ${link.productName || 'Compound'} ${link.dose || ''}`.trim()
                                : link.assetType === 'protocol' || link.catalogType === 'protocols'
                                ? `Protocol: ${link.assetTitle || link.catalogId}`
                                : `Catalog: ${link.catalogueFilter || (link.supplierId ? link.supplierId.replace(/^supplier-/, '') : 'General')}`}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {(link.visitsCount > 0 || link.readStatus === 'read' || link.status === 'read' || link.status === 'viewed') ? (
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                color: '#137333',
                                backgroundColor: '#e6f4ea',
                                border: '1px solid #ceead6',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <Check size={10} color="#137333" /> Read ({link.visitsCount || 1})
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.66rem',
                                fontWeight: 600,
                                color: '#b06000',
                                backgroundColor: '#fef7e0',
                                border: '1px solid #feefc3',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                Pending
                              </span>
                            )}
                            <StatusBadge status={link.status || 'sent'} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Sent: {createdDate} ({link.channel || 'whatsapp'})
                          </div>
                          <div>
                            <strong>{link.visitsCount || 0} views</strong>
                            {lastVisited && <span style={{ marginLeft: '0.3rem' }}>(last: {lastVisited})</span>}
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
                            Active Selection: {link.cartSummary}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(shortUrl);
                              notifier.success('Short link copied: ' + shortUrl);
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
                            <Copy size={12} /> Copy Link
                          </button>

                          {formData.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                const cleanPhone = formData.phone.replace(/[^\d]/g, '');
                                const docLabel = (link.assetType === 'variant_datasheet' || link.catalogType === 'variant_datasheet')
                                  ? `datasheet for ${link.productName || 'this compound'}`
                                  : (link.assetType === 'protocol' || link.catalogType === 'protocols')
                                  ? `clinical protocol requested`
                                  : `official catalog`;
                                const msg = `Hello ${formData.displayName || 'Doctor / Partner'}, here is the link to the ${docLabel}:\n\n🔗 ${shortUrl}\n\nPlease let us know if you need any assistance.`;
                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              style={{
                                padding: '0.3rem 0.6rem',
                                backgroundColor: '#e6f4ea',
                                border: '1px solid #ceead6',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                color: '#137333',
                                fontWeight: 600
                              }}
                            >
                              <Send size={11} /> Resend WhatsApp
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
                              color: '#1a73e8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontWeight: 600
                            }}
                          >
                            <ExternalLink size={12} />
                            {(link.assetType === 'variant_datasheet' || link.catalogType === 'variant_datasheet')
                              ? 'View Datasheet'
                              : (link.assetType === 'protocol' || link.catalogType === 'protocols')
                              ? 'View Protocol'
                              : 'View Catalog'}
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
      </div>
    </StandardDrawer>
  );
}
