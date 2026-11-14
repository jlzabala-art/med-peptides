'use client';

import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import MetricCard from '@/components/ui/MetricCard';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';

/**
 * PortalOverviewLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout estándar para pantallas de Dashboard, Hubs con sub-tabs y Configuración/Perfil
 * dentro de PanelShell (Categoría 3).
 */
export default function PortalOverviewLayout({
  title,
  subtitle,
  icon,
  panel = 'admin',
  breadcrumbs,
  actions,
  viewSelector,
  helpTopic,
  showAiAssistant = false,
  kpis = [],
  maxWidth = '1360px',
  children,
}) {
  return (
    <div style={{ maxWidth, margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        panel={panel}
        breadcrumbs={breadcrumbs}
        actions={actions}
        viewSelector={viewSelector}
        helpTopic={helpTopic}
        showAiAssistant={showAiAssistant}
      />

      {Array.isArray(kpis) && kpis.length > 0 && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          {kpis.map((kpi, idx) => (
            <MetricCard key={kpi.id || idx} {...kpi} />
          ))}
        </section>
      )}

      <SectionErrorBoundary sectionName={title || 'Portal Overview'}>
        {children}
      </SectionErrorBoundary>
    </div>
  );
}
