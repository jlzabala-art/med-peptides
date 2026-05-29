import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Globe, Shield, RefreshCw, Check, AlertTriangle, ArrowRight, Server } from 'lucide-react';

export default function DomainsTab() {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [domainInfo, setDomainInfo] = useState({
    subdomainUrl: '',
    customDomain: '',
    customDomainStatus: 'none', // none, pending_dns, ssl_generating, active
  });

  useEffect(() => {
    if (!tenantId) return;

    async function loadTenantDomain() {
      setLoading(true);
      try {
        const tenantRef = doc(db, 'tenants', tenantId);
        const snap = await getDoc(tenantRef);
        if (snap.exists()) {
          const data = snap.data();
          setDomainInfo({
            subdomainUrl: data.domain?.url || `${data.slug || tenantId}.med-peptides.com`,
            customDomain: data.domain?.customDomain || '',
            customDomainStatus: data.domain?.customDomainStatus || (data.domain?.customDomain ? 'pending_dns' : 'none'),
          });
        }
      } catch (err) {
        console.error('Failed to load domains:', err);
        setError('Could not load domain configurations.');
      } finally {
        setLoading(false);
      }
    }

    loadTenantDomain();
  }, [tenantId]);

  const handleRequestDomain = async (e) => {
    e.preventDefault();
    if (!tenantId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      const isRemoving = !domainInfo.customDomain.trim();

      await updateDoc(tenantRef, {
        'domain.customDomain': isRemoving ? null : domainInfo.customDomain.trim().toLowerCase(),
        'domain.customDomainStatus': isRemoving ? 'none' : 'pending_dns',
      });

      setDomainInfo(prev => ({
        ...prev,
        customDomainStatus: isRemoving ? 'none' : 'pending_dns'
      }));

      // Write audit log
      try {
        const auditRef = doc(db, 'tenantAuditLogs', `${tenantId}_${Date.now()}`);
        await setDoc(auditRef, {
          tenantId,
          timestamp: new Date().toISOString(),
          action: 'update_custom_domain',
          userId: userProfile?.uid || 'unknown',
          details: { customDomain: domainInfo.customDomain }
        });
      } catch (e) {
        console.warn('Audit log write failed:', e);
      }

      setSuccess(true);
    } catch (err) {
      console.error('Failed to update domain:', err);
      setError('Failed to submit custom domain request.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (domainInfo.customDomainStatus) {
      case 'active':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#dcfce7', color: 'var(--color-success)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <Check size={12} /> Active & Secured
          </span>
        );
      case 'ssl_generating':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fef3c7', color: 'var(--color-warning)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <RefreshCw size={12} className="animate-spin" /> Generating SSL Cert
          </span>
        );
      case 'pending_dns':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#dbeafe', color: 'var(--color-primary-hover)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <Server size={12} /> Pending DNS Setup
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.5rem', background: '#f1f5f9', color: 'var(--color-text-secondary)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            Not Configured
          </span>
        );
    }
  };

  if (!tenantId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={40} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No Franchise Tenant Assigned</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Please contact Atlas Health support to link your account.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading domain configurations...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
          <Globe size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Domain Settings</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Link custom domains or configure path/subdomain structures for your regional portal.</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>1. Platform Subdomain (Included)</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Your portal is always accessible at this default URL. All requests made here are automatically attributed to your wholesaler profile.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>https://{domainInfo.subdomainUrl}</span>
          </div>
          <a
            href={`https://${domainInfo.subdomainUrl}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Visit Portal <ArrowRight size={14} />
          </a>
        </div>
      </div>

      <form onSubmit={handleRequestDomain} style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>2. Custom White-Label Domain</h3>
          {getStatusBadge()}
        </div>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Map your own domain or subdomain (e.g., <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>orders.yourbrand.ae</code>) to remove any Atlas Health indicators from your URLs.
        </p>

        {success && (
          <div style={{ padding: '1rem', background: 'var(--color-success-bg)', border: '1px solid #dcfce7', borderRadius: '8px', color: 'var(--color-success)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Domain request submitted successfully! Please follow the DNS setup instructions below.
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={domainInfo.customDomain}
            onChange={e => setDomainInfo(prev => ({ ...prev, customDomain: e.target.value }))}
            style={{ flex: 1, padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
            placeholder="e.g. wholesale.magenta.ae"
          />
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Requesting...' : 'Request Linking'}
          </button>
        </div>

        {domainInfo.customDomainStatus === 'pending_dns' && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={16} style={{ color: 'var(--color-primary-hover)' }} /> DNS Records Setup Required
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
              To complete domain verification and allow our edge network to generate your SSL certificate, please log in to your DNS provider and add the following CNAME record:
            </p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>Type</th>
                  <th style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>Host (Name)</th>
                  <th style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>Target (Value)</th>
                  <th style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>TTL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>CNAME</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>
                    {domainInfo.customDomain.includes('.') ? domainInfo.customDomain.split('.')[0] : '@'}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>cname.med-peptides.com.</td>
                  <td style={{ padding: '10px 12px' }}>Automatic (3600)</td>
                </tr>
              </tbody>
            </table>

            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
              * DNS changes can take up to 24–48 hours to propagate worldwide. Once detected, SSL is generated automatically.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
