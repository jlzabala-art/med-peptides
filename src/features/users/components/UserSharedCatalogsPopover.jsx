'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Clock, Check, Copy, ExternalLink, RefreshCw, Plus, Eye, X, BookOpen, Package } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';

export default function UserSharedCatalogsPopover({ user, onOpenShareDrawer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const popoverRef = useRef(null);

  // Fetch sent catalogs lazily when popover opens
  useEffect(() => {
    if (!isOpen || !user?.id) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/catalog/shares?recipientId=${user.id}&limit=20`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setShares(data.items || []);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('[UserSharedCatalogsPopover] Error fetching shares:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopyLink = (url, id, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(url);
    triggerHaptic('light');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const userName = user?.fullName || user?.name || user?.email || 'User';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        title="View shared catalogs for this user"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: '6px',
          background: isOpen ? '#e0f2fe' : '#f8fafc',
          color: isOpen ? '#0369a1' : '#475569',
          border: isOpen ? '1px solid #7dd3fc' : '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <Share2 size={12} style={{ color: isOpen ? '#0284c7' : '#64748b' }} />
        <span>Catalogs</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '340px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Popover Header */}
          <div style={{
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
                Shared Catalogs
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                {userName}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Popover Body */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '0.65rem 0.85rem' }}>
            {isLoading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                Loading share history...
              </div>
            ) : shares.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                <BookOpen size={24} style={{ color: '#cbd5e1', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
                  No catalogs recorded
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                  No catalog links have been shared with this user yet.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {shares.map((item) => {
                  const isProto = item.catalogType === 'protocols';
                  const dateStr = item.issuedAt
                    ? new Date(item.issuedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Unknown date';
                  const shortUrl = item.shortUrl || `https://med-peptides.com/c/${item.catalogId}`;
                  const isCopied = copiedId === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.6rem 0.75rem',
                        fontSize: '0.74rem'
                      }}
                    >
                      {/* Item Top: Type Badge & Status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: isProto ? '#faf5ff' : '#eff6ff',
                          color: isProto ? '#7c3aed' : '#0284c7',
                          border: isProto ? '1px solid #e9d5ff' : '1px solid #bfdbfe'
                        }}>
                          {isProto ? <BookOpen size={10} /> : <Package size={10} />}
                          <span>{isProto ? 'Protocols' : 'Products'}</span>
                        </span>

                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          color: item.webOpened || item.visitsCount > 0 ? '#16a34a' : '#d97706',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          {item.webOpened || item.visitsCount > 0 ? (
                            <>
                              <Eye size={10} />
                              <span>Viewed ({item.visitsCount || 1})</span>
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              <span>Sent</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem', lineHeight: 1.2 }}>
                        {item.catalogTitle}
                      </div>

                      {/* Date & Channel */}
                      <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                        <Clock size={10} />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{item.channel}</span>
                      </div>

                      {/* Short Link Action Strip */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9'
                      }}>
                        <span style={{
                          fontSize: '0.67rem',
                          color: '#0284c7',
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '180px'
                        }}>
                          {shortUrl.replace('https://', '')}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(shortUrl, item.id, e)}
                            title="Copy short link"
                            style={{
                              background: isCopied ? '#f0fdf4' : '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              color: isCopied ? '#16a34a' : '#475569',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            {isCopied ? <Check size={11} /> : <Copy size={11} />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>

                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open link"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 4px',
                              color: '#64748b'
                            }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Popover Footer: Quick Send Action */}
          <div style={{
            padding: '0.65rem 1rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                if (typeof onOpenShareDrawer === 'function') {
                  onOpenShareDrawer(user);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <Plus size={13} />
              <span>Share New Catalog with this User</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
