"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Globe, Shield, AlertTriangle, ArrowRight } from '@/lib/icons';
import PortalOverviewLayout from '../shared/layouts/PortalOverviewLayout';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { wholesalerRepository } from '@/repositories/wholesalerRepository';

const DOMAIN_STATUS_MAP = {
  active: 'active',
  ssl_generating: 'processing',
  pending_dns: 'pending',
  none: 'inactive',
};

const DOMAIN_STATUS_LABEL = {
  active: 'Active & Secured',
  ssl_generating: 'Generating SSL Cert',
  pending_dns: 'Pending DNS Setup',
  none: 'Not Configured',
};

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
    customDomainStatus: 'none',
  });

  useEffect(() => {
    if (!tenantId) return;

    let active = true;
    async function loadTenantDomain() {
      setLoading(true);
      try {
        const data = await wholesalerRepository.getTenantDomainConfig(tenantId);
        if (data && active) {
          setDomainInfo({
            subdomainUrl: data.domain?.url || `${data.slug || tenantId}.atlas-health.com`,
            customDomain: data.domain?.customDomain || '',
            customDomainStatus: data.domain?.customDomainStatus || (data.domain?.customDomain ? 'pending_dns' : 'none'),
          });
        }
      } catch (err) {
        console.error('Failed to load domains:', err);
        if (active) setError('Could not load domain configurations.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTenantDomain();
    return () => {
      active = false;
    };
  }, [tenantId]);

  const handleRequestDomain = async (e) => {
    e.preventDefault();
    if (!tenantId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const isRemoving = !domainInfo.customDomain.trim();
      const newCustomDomain = isRemoving ? null : domainInfo.customDomain.trim().toLowerCase();
      const newStatus = isRemoving ? 'none' : 'pending_dns';

      await wholesalerRepository.updateTenantDomainConfig(tenantId, {
        customDomain: newCustomDomain,
        customDomainStatus: newStatus,
      });

      setDomainInfo((prev) => ({
        ...prev,
        customDomainStatus: newStatus,
      }));

      setSuccess(true);
    } catch (err) {
      console.error('Failed to update domain:', err);
      setError('Failed to submit custom domain request.');
    } finally {
      setSaving(false);
    }
  };

  if (!tenantId) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No Franchise Tenant Assigned"
        subtitle="Please contact Atlas Health support to link your account."
      />
    );
  }

  return (
    <PortalOverviewLayout
      title="Domain Settings"
      subtitle="Link custom domains or configure path/subdomain structures for your regional portal."
      icon={Globe}
      panel="wholesaler"
      maxWidth="900px"
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.75rem' }}>1. Platform Subdomain (Included)</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Your portal is always accessible at this default URL. All requests made here are automatically attributed to your wholesaler profile.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
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

          <form onSubmit={handleRequestDomain} style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>2. Custom White-Label Domain</h3>
              <StatusBadge
                status={DOMAIN_STATUS_MAP[domainInfo.customDomainStatus] || 'inactive'}
                label={DOMAIN_STATUS_LABEL[domainInfo.customDomainStatus] || 'Not Configured'}
              />
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={domainInfo.customDomain}
                onChange={(e) => setDomainInfo((prev) => ({ ...prev, customDomain: e.target.value }))}
                style={{ flex: '1 1 260px', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                placeholder="e.g. wholesale.magenta.ae"
              />
              <button
                type="submit"
                disabled={saving}
                style={{ minHeight: '42px', padding: '0.625rem 1.25rem', background: 'var(--color-primary)', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
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
                <DataTable
                  data={[
                    {
                      id: '1',
                      type: 'CNAME',
                      host: domainInfo.customDomain.includes('.') ? domainInfo.customDomain.split('.')[0] : '@',
                      target: 'cname.atlas-health.com.',
                      ttl: 'Automatic (3600)',
                    },
                  ]}
                  columns={[
                    {
                      key: 'type',
                      header: 'Type',
                      width: '15%',
                      render: (row) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.type}</span>,
                    },
                    {
                      key: 'host',
                      header: 'Host (Name)',
                      width: '25%',
                      render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.host}</span>,
                    },
                    {
                      key: 'target',
                      header: 'Target (Value)',
                      width: '35%',
                      render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.target}</span>,
                    },
                    {
                      key: 'ttl',
                      header: 'TTL',
                      width: '25%',
                      render: (row) => row.ttl,
                    },
                  ]}
                  keyField="id"
                />

                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                  * DNS changes can take up to 24–48 hours to propagate worldwide. Once detected, SSL is generated automatically.
                </p>
              </div>
            )}
          </form>
        </>
      )}
    </PortalOverviewLayout>
  );
}
