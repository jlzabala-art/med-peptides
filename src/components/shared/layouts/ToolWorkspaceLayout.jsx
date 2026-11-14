'use client';

import React from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
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
  whiteLabel = false,
  children,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f1f5f9',
        color: '#0f172a',
      }}
    >
      {showPublicHeader && <PublicUnifiedHeader whiteLabel={whiteLabel} />}

      {/* Barra superior compacta de la herramienta */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem clamp(1rem, 2.5vw, 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {Icon && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: 'var(--color-primary, #003666)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </div>
          )}
          <div>
            {title && (
              <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2 }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {toolbarActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {toolbarActions}
          </div>
        )}
      </header>

      {/* Área de trabajo principal + Inspector lateral */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: 'clamp(0.75rem, 2vw, 1.25rem)',
          alignItems: 'stretch',
        }}
      >
        <SectionErrorBoundary sectionName={title || 'Tool Canvas'}>
          <main
            style={{
              flex: '999 1 600px',
              minWidth: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: 'clamp(1rem, 2vw, 1.5rem)',
            }}
          >
            {children}
          </main>
        </SectionErrorBoundary>

        {inspector && (
          <SectionErrorBoundary sectionName="Tool Inspector">
            <aside
              style={{
                flex: `1 1 ${inspectorWidth}`,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
              }}
            >
              {inspector}
            </aside>
          </SectionErrorBoundary>
        )}
      </div>
    </div>
  );
}
