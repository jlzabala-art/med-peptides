'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PageHeroCard from '@/components/ui/PageHeroCard';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';

/**
 * ToolWorkspaceLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout tipo estudio / espacio de trabajo a pantalla completa para herramientas:
 *  - /labels, /pharmacy/labels, /rx/[code]/labels
 *  - /calculator, /protocol-finder, /atlas, /tools
 */
export default function ToolWorkspaceLayout({
  title = '',
  subtitle = '',
  icon: Icon = null,
  toolbarActions = null,
  inspector = null, // Panel lateral derecho opcional (propiedades / preview / resumen)
  inspectorWidth = '340px',
  showPublicHeader = true,
  showPublicFooter = true,
  whiteLabel = false,
  lang = 'en',
  onLangChange,
  children,
}) {
  return (
    <div
      className="atlas-page-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {showPublicHeader && (
        <PublicUnifiedHeader
          whiteLabel={whiteLabel}
          lang={lang}
          onLangChange={onLangChange}
        />
      )}

      <div className="atlas-page-shell" style={{ flex: 1 }}>
        {(title || subtitle || toolbarActions) && (
          <PageHeroCard
            brandLeft="ATLAS HEALTH"
            brandRight="CLINICAL WORKSPACE"
            title={title}
            subtitle={subtitle}
            actions={toolbarActions}
          />
        )}

        {/* Área de trabajo principal + Inspector lateral */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'stretch',
          }}
        >
          <SectionErrorBoundary sectionName={title || 'Tool Canvas'}>
            <main
              className="atlas-card"
              style={{
                flex: '999 1 600px',
                minWidth: 0,
                padding: 'clamp(1rem, 2vw, 1.5rem)',
              }}
            >
              {children}
            </main>
          </SectionErrorBoundary>

          {inspector && (
            <SectionErrorBoundary sectionName="Tool Inspector">
              <aside
                className="atlas-card"
                style={{
                  flex: `1 1 ${inspectorWidth}`,
                  padding: '1rem 1.25rem',
                }}
              >
                {inspector}
              </aside>
            </SectionErrorBoundary>
          )}
        </div>
      </div>

      {showPublicFooter && (
        <div style={{ paddingBottom: '76px' }}>
          <PublicUnifiedFooter />
        </div>
      )}
    </div>
  );
}
