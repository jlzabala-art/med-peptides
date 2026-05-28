import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Paintbrush, Check, Globe, HelpCircle, Save, AlertCircle } from 'lucide-react';

export default function BrandingTab() {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [branding, setBranding] = useState({
    displayName: '',
    logoUrl: '',
    primaryColor: 'var(--color-primary)',
    secondaryColor: '#00b0f0',
    fontFamily: 'system-ui',
    supportEmail: '',
    supportWhatsapp: '',
    footerText: '',
    defaultCTA: 'Contact your clinic'
  });

  useEffect(() => {
    if (!tenantId) return;

    async function loadTenantBranding() {
      setLoading(true);
      try {
        const tenantRef = doc(db, 'tenants', tenantId);
        const snap = await getDoc(tenantRef);
        if (snap.exists()) {
          const data = snap.data();
          setBranding({
            displayName: data.name || '',
            logoUrl: data.branding?.logoUrl || '',
            primaryColor: data.branding?.primaryColor || 'var(--color-primary)',
            secondaryColor: data.branding?.secondaryColor || '#00b0f0',
            fontFamily: data.branding?.fontFamily || 'system-ui',
            supportEmail: data.branding?.supportEmail || '',
            supportWhatsapp: data.branding?.supportWhatsapp || '',
            footerText: data.branding?.footerText || '',
            defaultCTA: data.branding?.defaultCTA || 'Contact your clinic'
          });
        }
      } catch (err) {
        console.error('Failed to load branding:', err);
        setError('Could not load tenant configurations.');
      } finally {
        setLoading(false);
      }
    }

    loadTenantBranding();
  }, [tenantId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tenantId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      await updateDoc(tenantRef, {
        name: branding.displayName,
        'branding.logoUrl': branding.logoUrl,
        'branding.primaryColor': branding.primaryColor,
        'branding.secondaryColor': branding.secondaryColor,
        'branding.fontFamily': branding.fontFamily,
        'branding.supportEmail': branding.supportEmail,
        'branding.supportWhatsapp': branding.supportWhatsapp,
        'branding.footerText': branding.footerText,
        'branding.defaultCTA': branding.defaultCTA,
      });

      // Write tenant audit log
      try {
        const auditRef = doc(db, 'tenantAuditLogs', `${tenantId}_${Date.now()}`);
        await setDoc(auditRef, {
          tenantId,
          timestamp: new Date().toISOString(),
          action: 'update_branding',
          userId: userProfile?.uid || 'unknown',
          details: { updatedFields: Object.keys(branding) }
        });
      } catch (e) {
        console.warn('Audit log write failed:', e);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update branding:', err);
      setError('Failed to save branding configurations.');
    } finally {
      setSaving(false);
    }
  };

  if (!tenantId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No Franchise Tenant Assigned</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Please contact Med-Peptides support to link your wholesaler account with a white-labeled territory tenant.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '3rem', textAling: 'center', color: 'var(--color-text-secondary)' }}>Loading branding options...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
          <Paintbrush size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>White-Label Branding</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Customize how the platform looks and feels to your clients and clinics.</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        {error && (
          <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: '1rem', background: 'var(--color-success-bg)', border: '1px solid #dcfce7', borderRadius: '8px', color: 'var(--color-success)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem' }}>
            <Check size={16} />
            <span>Branding modifications saved and published successfully! Refreshed users will see the changes.</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Display Business Name</label>
            <input
              type="text"
              value={branding.displayName}
              onChange={e => setBranding(prev => ({ ...prev, displayName: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
              placeholder="e.g. Magenta Wholesalers"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Logo Image URL</label>
            <input
              type="text"
              value={branding.logoUrl}
              onChange={e => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Primary Accent Color</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="color"
                value={branding.primaryColor}
                onChange={e => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={e => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                style={{ flex: 1, padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Secondary Accent Color</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={e => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={e => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                style={{ flex: 1, padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Font Heading Family</label>
            <select
              value={branding.fontFamily}
              onChange={e => setBranding(prev => ({ ...prev, fontFamily: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
            >
              <option value="system-ui">System Default (Sans-Serif)</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Outfit', sans-serif">Outfit</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="serif">Classic Serif</option>
            </select>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Support & Checkout Overrides</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Support Email Address</label>
              <input
                type="email"
                value={branding.supportEmail}
                onChange={e => setBranding(prev => ({ ...prev, supportEmail: e.target.value }))}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                placeholder="support@yourdomain.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>WhatsApp Support Link / Number</label>
              <input
                type="text"
                value={branding.supportWhatsapp}
                onChange={e => setBranding(prev => ({ ...prev, supportWhatsapp: e.target.value }))}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                placeholder="e.g. +971501234567"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Default Button CTA</label>
              <input
                type="text"
                value={branding.defaultCTA}
                onChange={e => setBranding(prev => ({ ...prev, defaultCTA: e.target.value }))}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                placeholder="e.g. Contact your clinic / Ask your doctor"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Footer Copyright Customization</label>
              <input
                type="text"
                value={branding.footerText}
                onChange={e => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                placeholder="e.g. Powered by Magenta, all rights reserved"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving changes...' : 'Save & Publish Branding'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
