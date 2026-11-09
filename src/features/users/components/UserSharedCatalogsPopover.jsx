'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Clock,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
  Eye,
  X,
  BookOpen,
  Package,
  Sparkles,
  Truck,
  Globe,
  Coins,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';

export default function UserSharedCatalogsPopover({ user, onOpenShareDrawer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'generate'
  const [shares, setShares] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const popoverRef = useRef(null);

  // Link generation form state
  const [genRef, setGenRef] = useState('distributor'); // 'distributor' | 'clinic'
  const [genCurrency, setGenCurrency] = useState('USD'); // 'USD' | 'EUR' | 'AED'
  const [genDest, setGenDest] = useState('EU'); // 'EU' | 'US' | 'AE'
  const [genLang, setGenLang] = useState('en'); // 'en' | 'es'

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
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(url);
    triggerHaptic('light');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const userName = user?.fullName || user?.name || user?.email || 'User';

  // Handle generating a new unique tracked peptide catalog link
  const handleGenerateLink = async () => {
    if (!user?.id) return;
    setIsGenerating(true);
    triggerHaptic('medium');

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
    const targetUrl = `/pricing/peptides?ref=${genRef}&lang=${genLang}&currency=${genCurrency}&dest=${genDest}&uid=${encodeURIComponent(user.id)}`;
    const tierLabel = genRef === 'distributor' ? 'Distributor (+15%)' : 'Wholesaler (+30%)';

    try {
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: user.id,
          recipientName: userName,
          recipientEmail: user.email || '',
          recipientPhone: user.phone || user.phoneNumber || '',
          recipientType: user.role === 'doctor' ? 'doctor' : 'wholesaler',
          currency: genCurrency,
          targetUrl,
          catalogTitle: `Peptides B2B (${tierLabel} • ${genCurrency} • ${genDest})`,
          priceMarkupPercent: genRef === 'distributor' ? 15 : 30,
          channel: 'whatsapp',
          linkMode: 'order',
          allowPurchasing: true
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate tracked link');

      const fullShortUrl = data.shortUrl || `${origin}/c/${data.catalogId}`;
      navigator.clipboard?.writeText(fullShortUrl);
      setCopiedId(data.catalogId);

      // Prepend to shares list
      const newItem = {
        id: data.catalogId,
        catalogId: data.catalogId,
        catalogCode: data.catalogId,
        catalogTitle: `Peptides B2B (${tierLabel} • ${genCurrency} • ${genDest})`,
        targetUrl,
        shortUrl: fullShortUrl,
        shareableUrl: fullShortUrl,
        currency: genCurrency,
        issuedAt: new Date().toISOString(),
        visitsCount: 0,
        status: 'sent',
        orderPlaced: false,
        channel: 'whatsapp'
      };

      setShares(prev => [newItem, ...prev]);
      setActiveTab('history');
      triggerHaptic('success');
    } catch (err) {
      console.error('[UserSharedCatalogsPopover] Generation error:', err);
      alert(err.message || 'Error generating link');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewTargetUrl = `/pricing/peptides?ref=${genRef}&lang=${genLang}&currency=${genCurrency}&dest=${genDest}&uid=${encodeURIComponent(user?.id || 'uid')}`;

  // Telemetry & Reading State for intelligent micro-badge (Google Cloud UX)
  const isRead = user?.lastAssetReadStatus === 'read' || (user?.lastAssetViewCount || 0) > 0 || shares.some(s => s.webOpened || (s.visitsCount || 0) > 0);
  const totalSharesCount = shares.length > 0 ? shares.length : (user?.catalogSharesCount || (user?.lastCatalogSharedAt || user?.lastAssetViewedAt ? 1 : 0));
  const hasShared = totalSharesCount > 0;
  const readCount = Math.max(user?.lastAssetViewCount || 0, shares.reduce((acc, s) => acc + (s.visitsCount || 0), 0));
  const hasOrder = shares.some(s => s.orderPlaced || s.lastOrderId) || user?.lastAssetOrderPlaced;

  // Derive badge styling
  let badgeBg = isOpen ? '#e0f2fe' : '#f8fafc';
  let badgeBorder = isOpen ? '1px solid #7dd3fc' : '1px solid #e2e8f0';
  let badgeColor = isOpen ? '#0369a1' : '#475569';
  let badgeIcon = <Share2 size={11} style={{ color: isOpen ? '#0284c7' : '#64748b' }} />;
  let badgeText = 'Catalogs';
  let badgeTitle = 'View & generate tracked catalog links for this user';

  if (hasOrder) {
    badgeBg = '#eff6ff';
    badgeBorder = '1px solid #bfdbfe';
    badgeColor = '#1d4ed8';
    badgeIcon = <ShoppingCart size={11} color="#1d4ed8" />;
    badgeText = 'Catalogs · 🛒 Ordered';
    badgeTitle = 'Catalog link converted to a confirmed B2B order! Click to inspect.';
  } else if (isRead) {
    badgeBg = '#f0fdf4';
    badgeBorder = '1px solid #bbf7d0';
    badgeColor = '#15803d';
    badgeIcon = <Eye size={11} color="#16a34a" />;
    badgeText = `Catalogs · 👁️ ${readCount > 1 ? `${readCount} opens` : 'Read'}`;
    badgeTitle = `Catalog opened by ${userName} (${readCount > 1 ? `${readCount} times` : 'verified read'}). Click to view telemetry.`;
  } else if (hasShared) {
    badgeBg = '#fffbeb';
    badgeBorder = '1px solid #fde68a';
    badgeColor = '#b45309';
    badgeIcon = <Clock size={11} color="#b45309" />;
    badgeText = 'Catalogs · ⏳ Sent';
    badgeTitle = 'Catalog shared but not yet opened by user. Click to resend or copy link.';
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popoverRef}>
      {/* Trigger Button — Intelligent GCP Telemetry Micro-Badge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        title={badgeTitle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '6px',
          background: badgeBg,
          color: badgeColor,
          border: badgeBorder,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: isOpen ? '0 0 0 2px rgba(2, 132, 199, 0.2)' : 'none'
        }}
      >
        {badgeIcon}
        <span>{badgeText}</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '360px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #cbd5e1',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Popover Header */}
          <div style={{
            padding: '0.75rem 1rem 0.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Share2 size={13} color="#0284c7" />
                <span>Tracked Catalog Links</span>
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

          {/* Popover Navigation Tabs (GCP Segmented Control) */}
          <div style={{
            display: 'flex',
            padding: '6px 10px',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            gap: '6px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '6px',
                border: activeTab === 'history' ? '1px solid #cbd5e1' : '1px solid transparent',
                background: activeTab === 'history' ? '#ffffff' : 'transparent',
                color: activeTab === 'history' ? '#003666' : '#64748b',
                fontWeight: activeTab === 'history' ? 750 : 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'history' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>History</span>
              <span style={{
                background: activeTab === 'history' ? '#e0f2fe' : '#e2e8f0',
                color: activeTab === 'history' ? '#0369a1' : '#64748b',
                padding: '1px 5px',
                borderRadius: '10px',
                fontSize: '0.65rem',
                fontWeight: 800
              }}>
                {shares.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('generate')}
              style={{
                flex: 1,
                padding: '4px 8px',
                borderRadius: '6px',
                border: activeTab === 'generate' ? '1px solid #cbd5e1' : '1px solid transparent',
                background: activeTab === 'generate' ? '#ffffff' : 'transparent',
                color: activeTab === 'generate' ? '#003666' : '#64748b',
                fontWeight: activeTab === 'generate' ? 750 : 600,
                fontSize: '0.72rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'generate' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={11} color="#0284c7" />
              <span>New Peptides Link</span>
            </button>
          </div>

          {/* Popover Body */}
          {activeTab === 'history' ? (
            <div style={{ maxHeight: '290px', overflowY: 'auto', padding: '0.65rem 0.85rem' }}>
              {isLoading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                  <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  Loading share history...
                </div>
              ) : shares.length === 0 ? (
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                  <BookOpen size={24} style={{ color: '#cbd5e1', margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
                    No tracked links yet
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Generate a unique link to track when this user opens it and places orders.
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('generate')}
                    style={{
                      marginTop: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Create Tracked Link</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {shares.map((item) => {
                    const isProto = item.catalogType === 'protocols';
                    const dateStr = item.issuedAt
                      ? new Date(item.issuedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Recent';
                    const shortUrl = item.shortUrl || `https://www.atlashealth-services.com/c/${item.catalogId}`;
                    const isCopied = copiedId === item.id;
                    const isOpened = item.webOpened || (item.visitsCount > 0);
                    const isOrdered = item.orderPlaced || item.lastOrderId;

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#ffffff',
                          border: isOrdered ? '1.5px solid #86efac' : isOpened ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.6rem 0.75rem',
                          fontSize: '0.74rem'
                        }}
                      >
                        {/* Top Meta Line: Badges & Tracking State */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: isProto ? '#faf5ff' : '#f0fdf4',
                            color: isProto ? '#7c3aed' : '#166534',
                            border: isProto ? '1px solid #e9d5ff' : '1px solid #bbf7d0',
                          }}>
                            <span>{isProto ? '🧬 Protocols' : '🧪 Peptides B2B'}</span>
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {/* Opened Indicator */}
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: isOpened ? '#15803d' : '#94a3b8',
                              background: isOpened ? '#dcfce7' : '#f1f5f9',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Eye size={10} />
                              <span>{isOpened ? `${item.visitsCount || 1} open${(item.visitsCount || 1) > 1 ? 's' : ''}` : 'Unopened'}</span>
                            </span>

                            {/* Order Conversion Indicator */}
                            {isOrdered && (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: '#1d4ed8',
                                background: '#dbeafe',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <ShoppingCart size={10} />
                                <span>Order Placed!</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem', lineHeight: 1.2 }}>
                          {item.catalogTitle}
                        </div>

                        {/* Date */}
                        <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                          <Clock size={10} />
                          <span>{dateStr}</span>
                          {item.currency && (
                            <>
                              <span>•</span>
                              <span>{item.currency}</span>
                            </>
                          )}
                        </div>

                        {/* Conversion detail if order exists */}
                        {isOrdered && (
                          <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            fontSize: '0.66rem',
                            color: '#166534',
                            fontWeight: 650,
                            marginBottom: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>🛒 Order: {item.lastOrderCode || 'Draft Placed'}</span>
                            {item.lastOrderAmount ? (
                              <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                                {item.currency || 'USD'} {Number(item.lastOrderAmount).toFixed(2)}
                              </span>
                            ) : null}
                          </div>
                        )}

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
                            maxWidth: '190px'
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
          ) : (
            /* Tab: Generate New Tracked Link */
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. Schedule Tier */}
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  Pricing Schedule
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setGenRef('distributor')}
                    style={{
                      padding: '5px',
                      borderRadius: '6px',
                      border: genRef === 'distributor' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: genRef === 'distributor' ? '#e0f2fe' : '#ffffff',
                      color: genRef === 'distributor' ? '#0369a1' : '#334155',
                      fontWeight: genRef === 'distributor' ? 800 : 600,
                      fontSize: '0.70rem',
                      cursor: 'pointer'
                    }}
                  >
                    Distributor (+15%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenRef('clinic')}
                    style={{
                      padding: '5px',
                      borderRadius: '6px',
                      border: genRef === 'clinic' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: genRef === 'clinic' ? '#e0f2fe' : '#ffffff',
                      color: genRef === 'clinic' ? '#0369a1' : '#334155',
                      fontWeight: genRef === 'clinic' ? 800 : 600,
                      fontSize: '0.70rem',
                      cursor: 'pointer'
                    }}
                  >
                    Wholesaler (+30%)
                  </button>
                </div>
              </div>

              {/* 2. Currency Selector */}
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  Currency
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {[
                    { id: 'USD', label: '$ USD' },
                    { id: 'EUR', label: '€ EUR' },
                    { id: 'AED', label: 'د.إ AED' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setGenCurrency(c.id)}
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: genCurrency === c.id ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: genCurrency === c.id ? '#e0f2fe' : '#ffffff',
                        color: genCurrency === c.id ? '#0369a1' : '#334155',
                        fontWeight: genCurrency === c.id ? 800 : 600,
                        fontSize: '0.70rem',
                        cursor: 'pointer'
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Destination Corridor Selector */}
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  Shipping Corridor (≤ 2 kg)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {[
                    { id: 'EU', flag: '🇪🇺', label: 'Europe €60' },
                    { id: 'US', flag: '🇺🇸', label: 'USA $25' },
                    { id: 'AE', flag: '🇦🇪', label: 'UAE $80' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setGenDest(d.id)}
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: genDest === d.id ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: genDest === d.id ? '#e0f2fe' : '#ffffff',
                        color: genDest === d.id ? '#0369a1' : '#334155',
                        fontWeight: genDest === d.id ? 800 : 600,
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{d.flag} {d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Language Selector */}
              <div>
                <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  Language
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setGenLang('en')}
                    style={{
                      padding: '4px',
                      borderRadius: '6px',
                      border: genLang === 'en' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: genLang === 'en' ? '#e0f2fe' : '#ffffff',
                      color: genLang === 'en' ? '#0369a1' : '#334155',
                      fontWeight: genLang === 'en' ? 800 : 600,
                      fontSize: '0.70rem',
                      cursor: 'pointer'
                    }}
                  >
                    🇺🇸 English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenLang('es')}
                    style={{
                      padding: '4px',
                      borderRadius: '6px',
                      border: genLang === 'es' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: genLang === 'es' ? '#e0f2fe' : '#ffffff',
                      color: genLang === 'es' ? '#0369a1' : '#334155',
                      fontWeight: genLang === 'es' ? 800 : 600,
                      fontSize: '0.70rem',
                      cursor: 'pointer'
                    }}
                  >
                    🇪🇸 Español (ES)
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '0.66rem',
                color: '#64748b'
              }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '2px' }}>Destination Route:</div>
                <div style={{ fontFamily: 'monospace', color: '#0284c7', wordBreak: 'break-all' }}>
                  {previewTargetUrl}
                </div>
              </div>

              {/* Generate & Copy Action */}
              <button
                type="button"
                onClick={handleGenerateLink}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  cursor: isGenerating ? 'wait' : 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 54, 102, 0.2)'
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Generating Tracked Link...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>⚡ Generate & Copy Tracked Short Link</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Popover Footer: Custom Catalog Builder trigger */}
          <div style={{
            padding: '0.55rem 0.85rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
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
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.70rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={11} />
              <span>Custom Product Subset Builder...</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
