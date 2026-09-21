"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, ExternalLink, RefreshCw, Eye, ShoppingCart, Clock, Building2 } from '@/lib/icons';
import notifier from '../../../services/NotificationService';
import StatusBadge from '../../ui/StatusBadge';

export default function CustomerSharedLinksCard({
  customer,
  customerType = 'wholesaler',
  onOpenShareModal,
  onOpenWorkspace
}) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const customerId = customer?.id;

  const loadShares = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog/shares?recipientId=${encodeURIComponent(customerId)}&limit=15`);
      const data = await res.json();
      if (res.ok && data.items) {
        setShares(data.items);
      }
    } catch (err) {
      console.warn('Could not fetch customer shared pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, [customerId]);

  const handleCopyLink = async (share) => {
    const url = share.shareableUrl || `${window.location.origin}/c/${share.catalogCode || share.catalogId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(share.id);
      notifier.success('Public page link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notifier.error('Failed to copy link.');
    }
  };

  const customerName = customer?.name || customer?.companyName || customer?.legalName || 'Customer';

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '16px' }}>
        
        {/* Left: Marketing & Shared Pages Intelligence */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Share2 size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Marketing & Shared Pages Intelligence
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Public links sent to {customerName} and visit interaction logs
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={loadShares}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}
                title="Refresh telemetry logs"
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
              </button>
              <button
                type="button"
                onClick={onOpenShareModal}
                className="gcp-btn-primary"
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <Share2 size={13} /> + Share Page
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
              Loading shared pages telemetry...
            </div>
          ) : shares.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🔗</div>
              <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#475569' }}>
                No public pages shared with this customer yet
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', marginBottom: '10px' }}>
                Generate a link with custom margin and Lotusland supplier to track opens and interactions.
              </div>
              <button
                type="button"
                onClick={onOpenShareModal}
                className="gcp-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.76rem', fontWeight: 600, borderRadius: '6px' }}
              >
                Generate First Shared Page
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shares.map(share => {
                const visits = share.visitsCount || 0;
                const isOpened = visits > 0 || share.interactions?.webOpened;
                const shareUrl = share.shareableUrl || `${window.location.origin}/c/${share.catalogCode || share.catalogId}`;
                const formattedDate = share.issuedAt ? new Date(share.issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

                return (
                  <div
                    key={share.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.80rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {share.catalogTitle || 'B2B Product Catalog'}
                        </span>
                        {share.margin > 0 && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb', padding: '1px 5px', borderRadius: '4px' }}>
                            +{share.margin}%
                          </span>
                        )}
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          ({share.supplierLabel || 'Lotusland'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> {formattedDate}
                        </span>
                        <span>•</span>
                        <span>Channel: <strong style={{ textTransform: 'capitalize' }}>{share.channel || 'web'}</strong></span>
                      </div>
                    </div>

                    {/* Telemetry Badges & Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {isOpened ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          border: '1px solid #bbf7d0'
                        }}>
                          <Eye size={12} /> {visits > 1 ? `Opened ${visits}x` : 'Opened ✓'}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          backgroundColor: '#fffbeb',
                          color: '#b45309',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          border: '1px solid #fde68a'
                        }}>
                          Awaiting open
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyLink(share)}
                        className="gcp-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.74rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        title="Copy public link"
                      >
                        {copiedId === share.id ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      </button>

                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', padding: '4px' }}
                        title="Open link in new tab"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Commercial Context & Workspace Access */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
              Institutional Profile & Commercial Terms
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem' }}>
              <div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact & Address:</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {customer.registeredAddress || customer.address || customer.city || 'Address registered on corporate file'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {customer.contactEmail || customer.email || '—'} · {customer.contactPhone || customer.phone || '—'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Account Manager:</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {customer.manager || customer.accountManager || 'Commercial Desk (Auto-assigned)'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Commercial Terms:</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', color: '#475569' }}>
                    {customer.paymentTerms || 'Net 30'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '2px 7px', borderRadius: '4px', color: '#15803d' }}>
                    Limit: ${Number(customer.creditLimit || 50000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="gcp-btn-primary"
              style={{ width: '100%', padding: '8px 14px', borderRadius: '6px', fontSize: '0.80rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <Building2 size={14} /> Open 360° Profile Workspace
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
