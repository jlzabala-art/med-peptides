'use client';

import React, { useMemo } from 'react';
import { Award, ShieldCheck, Zap, FlaskConical, Mail } from '@/lib/icons';
import GcpFilterRail from '@/components/ui/GcpFilterRail';

export default function UltraPersonCollectionSidebar({
  lang = 'en',
  categories = [],
  selectedCategory = 'all',
  onSelectCategory = () => {},
  totalCount = 0,
  onOpenInquiry = null,
  onOpenAi = null,
}) {
  const isEs = lang === 'es';
  const canonicalUrl = 'https://www.atlashealth-services.com/collection/ultraperson';

  const credentials = [
    {
      icon: ShieldCheck,
      label: isEs ? 'Cápsula HPMC Vegana' : 'Vegan HPMC Delayed-Release',
      detail: isEs ? 'Liberación entérica controlada' : '100% plant-derived enteric capsule',
    },
    {
      icon: Award,
      label: '500 mg / Day',
      detail: isEs ? 'Activos clínicos estandarizados' : 'Standardized pharmaceutical-grade cofactors',
    },
    {
      icon: Zap,
      label: isEs ? 'Sinergia Peptídica' : 'Peptide Protocol Synergy',
      detail: isEs ? 'Alineación circadiana y metabólica' : 'Circadian & mitochondrial pairing',
    },
  ];

  const sections = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return [
      {
        id: 'ultraperson-cats',
        title: isEs ? 'Categorías Clínicas' : 'Clinical Categories',
        totalLabel: `${totalCount} Total`,
        defaultOpen: true,
        items: categories.map((cat) => ({
          id: cat.id,
          label: cat.label,
          count: cat.count > 0 ? cat.count : undefined,
          active: selectedCategory === cat.id,
          onClick: () => onSelectCategory(cat.id),
        })),
      },
    ];
  }, [categories, isEs, onSelectCategory, selectedCategory, totalCount]);

  const steps = [
    { num: '01', title: isEs ? 'Evaluación Biomarcadores' : 'Biomarker Evaluation', desc: isEs ? 'Base con Bloodo o ETERNA' : 'Baseline test with Bloodo or ETERNA' },
    { num: '02', title: isEs ? 'Selección de Fórmula' : 'Formula Selection', desc: isEs ? 'Cofactores diurno/nocturno' : 'Targeted circadian or metabolic cofactors' },
    { num: '03', title: isEs ? 'Pauta 90 Días' : '90-Day Protocol', desc: isEs ? 'Administración continua oral' : 'Standardized daily oral administration' },
    { num: '04', title: isEs ? 'Reevaluación Analítica' : 'Outcome Reassessment', desc: isEs ? 'Control longitudinal en Atlas' : 'Longitudinal telemetric tracking' },
  ];

  const actions = {
    copyUrl: canonicalUrl,
    copyLabel: isEs ? 'Copiar Enlace Colección' : 'Copy Collection Link',
    copiedLabel: isEs ? 'Enlace Copiado' : 'Link Copied',
    primaryCta: {
      label: isEs ? 'Laboratorio Formulación Magistral' : 'Request Custom Formulation',
      href: '/compounding',
      icon: FlaskConical,
    },
    ...(onOpenInquiry
      ? {
          secondaryCta: {
            label: isEs ? 'Consulta Clínica Directa' : 'Clinical Nutraceuticals Inquiry',
            onClick: onOpenInquiry,
            icon: Mail,
          },
        }
      : {}),
    ...(onOpenAi
      ? {
          onOpenAi,
          aiLabel: isEs ? 'Consultar con Atlas AI' : 'Consult Atlas AI Copilot',
        }
      : {}),
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'sticky', top: '84px' }}>
      <GcpFilterRail
        asRailContainer={false}
        title="UltraPerson™ Clinical Formulas"
        subtitle="Atlas Compounding Network · EU GMP"
        credentials={credentials}
        sections={sections}
        stepsTitle={isEs ? 'Pauta de Integración' : 'Clinical Integration'}
        steps={steps}
        actions={actions}
      />
    </aside>
  );
}
