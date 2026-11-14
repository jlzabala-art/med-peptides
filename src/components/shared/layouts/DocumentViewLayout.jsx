'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import MetricCard from '@/components/ui/MetricCard';
import DataTable from '@/components/ui/DataTable';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';

/**
 * DocumentViewLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout estándar para documentos transaccionales y de verificación por token/código:
 *  - Cotizaciones (/quotation/[token], /shared/quote/[token])
 *  - Solicitudes RFQ (/rfq/[token])
 *  - Cuentas por pagar (/b2b/payables/[token])
 *  - Prescripciones, Resultados Lab y Verificación (/rx/[code], /lab/[code], /verify/[code])
 */
export default function DocumentViewLayout({
  whiteLabel = false,
  partnerName = '',
  breadcrumbs = [],
  // Membrete del documento
  documentType = 'Institutional Document',
  title = '',
  subtitle = '',
  documentCode = '',
  status = '',
  issuedDate = '',
  validUntil = '',
  // Acciones de cabecera (PDF, Imprimir, Aprobar, Compartir)
  headerActions = null,
  // Bloques de metadatos (Emisor / Receptor / Referencia)
  metadataCards = [], // [{ label, title, lines: [string], badge? }]
  // KPIs / Totales rápidos
  summaryMetrics = [], // props de MetricCard
  // Tabla de líneas estandarizada (usa DataTable, nunca <table> cruda)
  lineItems = [],
  lineColumns = [],
  loadingItems = false,
  itemsEmptyState = {},
  // Bloque inferior de totales o firma
  totalsSection = null,
  // Barra de acciones sticky en móvil/escritorio
  stickyActionBar = null,
  // Contenido adicional
  children,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
      }}
    >
      <PublicUnifiedHeader whiteLabel={whiteLabel} partnerName={partnerName} />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          padding: 'clamp(1rem, 2.5vw, 1.75rem) clamp(1rem, 3vw, 2rem) 4rem',
        }}
      >
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* 1. Membrete Institucional */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#475569',
                  }}
                >
                  {documentType}
                </span>
                {status && <StatusBadge status={status} />}
                {documentCode && <CopyableId value={documentCode} />}
              </div>

              {title && (
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  style={{
                    margin: '0.35rem 0 0',
                    fontSize: '0.92rem',
                    color: '#64748b',
                  }}
                >
                  {subtitle}
                </p>
              )}

              {(issuedDate || validUntil) && (
                <div
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    flexWrap: 'wrap',
                    marginTop: '0.75rem',
                    fontSize: '0.82rem',
                    color: '#64748b',
                  }}
                >
                  {issuedDate && <span>Issued: <strong>{issuedDate}</strong></span>}
                  {validUntil && <span>Valid until: <strong>{validUntil}</strong></span>}
                </div>
              )}
            </div>

            {headerActions && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {headerActions}
              </div>
            )}
          </div>
        </section>

        {/* 2. Metadatos Emisor / Receptor */}
        {Array.isArray(metadataCards) && metadataCards.length > 0 && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            {metadataCards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748b',
                    marginBottom: '0.4rem',
                  }}
                >
                  {card.label}
                </div>
                {card.title && (
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {card.title}
                  </div>
                )}
                {Array.isArray(card.lines) &&
                  card.lines.filter(Boolean).map((line, i) => (
                    <div key={i} style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.45 }}>
                      {line}
                    </div>
                  ))}
              </div>
            ))}
          </section>
        )}

        {/* 3. Resumen Métrico / Totales Clave */}
        {Array.isArray(summaryMetrics) && summaryMetrics.length > 0 && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {summaryMetrics.map((m, idx) => (
              <MetricCard key={m.id || idx} {...m} />
            ))}
          </section>
        )}

        {/* 4. Tabla de Líneas Estandarizada (DataTable) */}
        {Array.isArray(lineColumns) && lineColumns.length > 0 && (
          <SectionErrorBoundary sectionName="Document Line Items">
            <section
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <DataTable
                data={lineItems}
                columns={lineColumns}
                loading={loadingItems}
                emptyState={itemsEmptyState}
              />
            </section>
          </SectionErrorBoundary>
        )}

        {/* 5. Totales / Notas / Contenido específico */}
        {totalsSection && (
          <section style={{ marginBottom: '1.25rem' }}>{totalsSection}</section>
        )}

        {children}
      </main>

      {stickyActionBar}

      <PublicUnifiedFooter whiteLabel={whiteLabel} />
    </div>
  );
}
