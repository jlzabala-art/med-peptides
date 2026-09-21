"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, ExternalLink, RefreshCw, Eye, Clock, Building2, FileText, ArrowUpRight } from '@/lib/icons';
import notifier from '../../../services/NotificationService';
import CopyableId from '../../ui/CopyableId';

/**
 * CustomerSharedLinksCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console style full-width expandable sub-table for customers.
 * Represents shared documents, digital catalogs, quotes, and tracking telemetry
 * in a single, spacious column with dedicated fields:
 * - Documento
 * - Tipo
 * - Fecha
 * - Margen
 * - Estado / Telemetría
 * - Acciones
 */
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
      const res = await fetch(`/api/catalog/shares?recipientId=${encodeURIComponent(customerId)}&limit=25`);
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
      notifier.success('Enlace público copiado al portapapeles');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      notifier.error('Error al copiar el enlace');
    }
  };

  const customerName = customer?.name || customer?.companyName || customer?.legalName || 'Cliente';
  const paymentTerms = customer?.paymentTerms || 'Net 30';
  const creditLimit = Number(customer?.creditLimit || 50000).toLocaleString();
  const accountManager = customer?.manager || customer?.accountManager || 'Commercial Desk';

  return (
    <div
      className="gcp-shared-links-container"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        width: '100%'
      }}
    >
      {/* ── GCP HEADER & TOOLBAR (Single Full-Width Row) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        {/* Left: Title & Compact Metadata Pills (No redundant address info) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
                flexShrink: 0
              }}
            >
              <FileText size={16} />
            </div>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                Documentos y Catálogos Compartidos
              </span>
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}
              >
                {shares.length} {shares.length === 1 ? 'documento' : 'documentos'}
              </span>
            </div>
          </div>

          {/* Compact Commercial Context Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#64748b' }}>
              Condiciones: <strong style={{ color: '#334155' }}>{paymentTerms}</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#64748b' }}>
              Límite: <strong style={{ color: '#15803d' }}>${creditLimit}</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#64748b' }}>
              Gestor: <strong style={{ color: '#334155' }}>{accountManager}</strong>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={loadShares}
            className="gcp-btn-secondary"
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '6px'
            }}
            title="Recargar telemetría y documentos"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refrescar</span>
          </button>

          <button
            type="button"
            onClick={onOpenShareModal}
            className="gcp-btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px'
            }}
          >
            <Share2 size={13} /> + Compartir Documento
          </button>

          {onOpenWorkspace && (
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="gcp-btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
                color: '#334155'
              }}
              title="Abrir vista detallada 360°"
            >
              <Building2 size={13} /> Perfil 360°
            </button>
          )}
        </div>
      </div>

      {/* ── FULL-WIDTH TABLE (Google Cloud Style) ── */}
      {loading ? (
        <div style={{ padding: '28px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          <RefreshCw size={16} className="spin" style={{ display: 'inline', marginRight: '8px' }} />
          Cargando documentos compartidos y telemetría...
        </div>
      ) : shares.length === 0 ? (
        <div
          style={{
            padding: '28px 20px',
            textAlign: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto'
            }}
          >
            <Share2 size={20} />
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
            No hay documentos ni catálogos compartidos aún con {customerName}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px', marginBottom: '14px' }}>
            Genera un enlace público B2B con margen personalizado y catálogo pre-filtrado para registrar telemetría de visitas y cotizaciones.
          </div>
          <button
            type="button"
            onClick={onOpenShareModal}
            className="gcp-btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.80rem', fontWeight: 600, borderRadius: '6px' }}
          >
            <Share2 size={13} style={{ marginRight: '6px' }} /> Generar Primer Catálogo Compartido
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.82rem'
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                <th style={{ padding: '10px 16px', width: '32%' }}>Documento</th>
                <th style={{ padding: '10px 14px', width: '16%' }}>Tipo</th>
                <th style={{ padding: '10px 14px', width: '18%' }}>Fecha</th>
                <th style={{ padding: '10px 14px', width: '12%' }}>Margen</th>
                <th style={{ padding: '10px 14px', width: '14%' }}>Estado</th>
                <th style={{ padding: '10px 16px', width: '8%', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share, idx) => {
                const visits = share.visitsCount || 0;
                const isOpened = visits > 0 || share.interactions?.webOpened;
                const shareUrl = share.shareableUrl || `${window.location.origin}/c/${share.catalogCode || share.catalogId}`;
                const rawDate = share.issuedAt || share.createdAt || share.timestamp;
                const formattedDate = rawDate
                  ? new Date(rawDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Reciente';

                const docTitle = share.catalogTitle || share.title || 'Catálogo B2B de Productos';
                const docType = share.documentType || (share.quoteId ? 'Cotización B2B' : 'Catálogo Digital');
                const marginVal = Number(share.margin ?? share.markup ?? 20);
                const supplier = share.supplierLabel || share.supplierId || 'Lotusland';

                return (
                  <tr
                    key={share.id || idx}
                    style={{
                      borderBottom: idx === shares.length - 1 ? 'none' : '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* 1. DOCUMENTO */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📋</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {docTitle}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                              {supplier}
                            </span>
                            {share.catalogCode && (
                              <span style={{ color: '#94a3b8' }}>
                                Ref: <code>{share.catalogCode}</code>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. TIPO */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          border: '1px solid #dbeafe'
                        }}
                      >
                        {docType}
                      </span>
                    </td>

                    {/* 3. FECHA */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '0.76rem' }}>
                        <Clock size={12} color="#94a3b8" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    {/* 4. MARGEN */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: marginVal > 0 ? '#f0fdf4' : '#f8fafc',
                          color: marginVal > 0 ? '#15803d' : '#64748b',
                          border: marginVal > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          fontSize: '0.76rem',
                          fontWeight: 700
                        }}
                      >
                        +{marginVal}%
                      </span>
                    </td>

                    {/* 5. ESTADO / TELEMETRÍA */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {isOpened ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          <Eye size={12} /> {visits > 1 ? `Abierto (${visits}x)` : 'Abierto ✓'}
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            border: '1px solid #fde68a'
                          }}
                        >
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* 6. ACCIONES */}
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(share)}
                          className="gcp-btn-secondary"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Copiar enlace directo"
                        >
                          {copiedId === share.id ? (
                            <Check size={12} color="#16a34a" />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span className="hide-mobile">Copiar</span>
                        </button>

                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="gcp-btn-secondary"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#0284c7',
                            textDecoration: 'none'
                          }}
                          title="Abrir enlace en pestaña nueva"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
