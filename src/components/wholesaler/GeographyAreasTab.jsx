import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ShieldAlert, Save, Check, ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react';

export default function GeographyAreasTab() {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [territories, setTerritories] = useState([]);
  const [rules, setRules] = useState({
    peptideVialsVisibility: 'clinic_only', // public, soft_protected, clinic_only, inquiry_only
    supplementsVisibility: 'public',
    compoundedVisibility: 'inquiry_only',
    hidePricesForGuests: true,
    allowCheckout: false,
  });

  useEffect(() => {
    if (!tenantId) return;

    async function loadTenantGeography() {
      setLoading(true);
      try {
        const tenantRef = doc(db, 'tenants', tenantId);
        const snap = await getDoc(tenantRef);
        if (snap.exists()) {
          const data = snap.data();
          setTerritories(data.territories || []);
          setRules({
            peptideVialsVisibility: data.commercialRules?.peptideVialsVisibility || 'clinic_only',
            supplementsVisibility: data.commercialRules?.supplementsVisibility || 'public',
            compoundedVisibility: data.commercialRules?.compoundedVisibility || 'inquiry_only',
            hidePricesForGuests: data.commercialRules?.hidePricesForGuests ?? true,
            allowCheckout: data.commercialRules?.allowCheckout ?? false,
          });
        }
      } catch (err) {
        console.error('Failed to load geography areas:', err);
        setError('Could not load territory configurations.');
      } finally {
        setLoading(false);
      }
    }

    loadTenantGeography();
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
        'commercialRules.peptideVialsVisibility': rules.peptideVialsVisibility,
        'commercialRules.supplementsVisibility': rules.supplementsVisibility,
        'commercialRules.compoundedVisibility': rules.compoundedVisibility,
        'commercialRules.hidePricesForGuests': rules.hidePricesForGuests,
        'commercialRules.allowCheckout': rules.allowCheckout,
      });

      // Write audit log
      try {
        const auditRef = doc(db, 'tenantAuditLogs', `${tenantId}_${Date.now()}`);
        await setDoc(auditRef, {
          tenantId,
          timestamp: new Date().toISOString(),
          action: 'update_geography_rules',
          userId: userProfile?.uid || 'unknown',
          details: { commercialRules: rules }
        });
      } catch (e) {
        console.warn('Audit log write failed:', e);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update geography rules:', err);
      setError('Failed to save territory commercial rules.');
    } finally {
      setSaving(false);
    }
  };

  if (!tenantId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <ShieldAlert size={40} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No Franchise Tenant Assigned</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Please contact Atlas Health support to link your account.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading territory options...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
          <MapPin size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Geography Areas & Category Rules</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Manage pricing visibility, checkout protection, and category restrictions in your assigned territories.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Side: Assigned Territories List */}
        <div>
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>Assigned Territories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {territories.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>No exclusive territories assigned.</p>
              ) : (
                territories.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.toUpperCase()} Exclusive</span>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Territory assignment is locked and managed exclusively by Atlas Health platform administrators.
            </div>
          </div>
        </div>

        {/* Right Side: Category Rules Configuration */}
        <div>
          <form onSubmit={handleSave} style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Commercial Visibility Controls</h3>

            {error && (
              <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ padding: '1rem', background: 'var(--color-success-bg)', border: '1px solid #dcfce7', borderRadius: '8px', color: 'var(--color-success)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Territory category rules updated successfully!
              </div>
            )}

            {/* Category Rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Peptide Vials Visibility</label>
                <select
                  value={rules.peptideVialsVisibility}
                  onChange={e => setRules(prev => ({ ...prev, peptideVialsVisibility: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <option value="public">Public (Everyone can see details)</option>
                  <option value="soft_protected">Soft Protected (Requires login to see prices)</option>
                  <option value="clinic_only">Clinic Only (Only registered clinics see prices/order)</option>
                  <option value="inquiry_only">Inquiry Only (No prices, replace checkout with quote request)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Supplements Visibility</label>
                <select
                  value={rules.supplementsVisibility}
                  onChange={e => setRules(prev => ({ ...prev, supplementsVisibility: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <option value="public">Public (Everyone can see details)</option>
                  <option value="soft_protected">Soft Protected</option>
                  <option value="inquiry_only">Inquiry Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Compounded Formulations Visibility</label>
                <select
                  value={rules.compoundedVisibility}
                  onChange={e => setRules(prev => ({ ...prev, compoundedVisibility: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                >
                  <option value="public">Public</option>
                  <option value="clinic_only">Clinic Only</option>
                  <option value="inquiry_only">Inquiry Only (Recommended for compounding)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rules.hidePricesForGuests}
                  onChange={e => setRules(prev => ({ ...prev, hidePricesForGuests: e.target.checked }))}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Hide Prices for Guest Users</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Force anonymous visitors to log in or register before displaying pricing details.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rules.allowCheckout}
                  onChange={e => setRules(prev => ({ ...prev, allowCheckout: e.target.checked }))}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Allow Direct E-Commerce Checkout</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>If disabled, users must click to inquire / request quotation instead of using direct payment gateway checkout.</span>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#6366f1', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving changes...' : 'Save Category Rules'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
