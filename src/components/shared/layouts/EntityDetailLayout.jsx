'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';

/**
 * EntityDetailLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout único basado en slots para fichas de detalle de entidad:
 *  - Productos (/p/[slug] y sus variantes clínicas/estéticas/diagnósticas)
 *  - Materias primas / APIs (/raw/[slug])
 *  - Protocolos (/proto/[slug], /shared/protocol/[id])
 *  - Perfiles públicos de profesionales (/dr/[slug], /nutritionist/[slug])
 */
export default function EntityDetailLayout({
  whiteLabel = false,
  partnerName = '',
  breadcrumbs = [],
  // Slots principales
  hero = null,
  main = null,
  sidebar = null,
  bottomSection = null,
  stickyMobileBar = null,
  maxWidth = '1320px',
}) {
  const hasSidebar = Boolean(sidebar);

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
          maxWidth,
          margin: '0 auto',
          padding: 'clamp(1rem, 2.5vw, 1.75rem) clamp(1rem, 3vw, 2rem) 4rem',
        }}
      >
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {hero && (
          <SectionErrorBoundary sectionName="Entity Hero">
            <section style={{ marginBottom: '1.5rem' }}>{hero}</section>
          </SectionErrorBoundary>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'flex-start',
          }}
        >
          <SectionErrorBoundary sectionName="Entity Main Content">
            <div style={{ flex: '999 1 600px', minWidth: 0 }}>{main}</div>
          </SectionErrorBoundary>

          {hasSidebar && (
            <SectionErrorBoundary sectionName="Entity Sidebar">
              <aside
                style={{
                  flex: '1 1 300px',
                  position: 'sticky',
                  top: '5.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {sidebar}
              </aside>
            </SectionErrorBoundary>
          )}
        </div>

        {bottomSection && (
          <SectionErrorBoundary sectionName="Entity Bottom Section">
            <section style={{ marginTop: '2rem' }}>{bottomSection}</section>
          </SectionErrorBoundary>
        )}
      </main>

      {stickyMobileBar}

      <PublicUnifiedFooter whiteLabel={whiteLabel} />
    </div>
  );
}
