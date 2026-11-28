'use client';

import React from 'react';
import { Award, ShieldCheck, Activity } from '@/lib/icons';
import GcpFilterRail from '@/components/ui/GcpFilterRail';

export default function EternaCollectionSidebar({ lang = 'en', onOpenInquiry = null, onOpenAi = null }) {
  const isEs = lang === 'es';
  const canonicalUrl = 'https://www.atlashealth-services.com/collection/eterna';

  const credentials = [
    {
      icon: ShieldCheck,
      label: 'ISO 15189:2012',
      detail: isEs ? 'Acreditación clínica europea' : 'European clinical laboratory accreditation',
    },
    {
      icon: Award,
      label: 'CAP & CLIA',
      detail: isEs ? 'Estándares internacionales de calidad' : 'Certified multi-omics quality standards',
    },
    {
      icon: Activity,
      label: 'Illumina HTP Infinium',
      detail: isEs ? '+700.000 marcadores SNPs' : '+700,000 SNPs microarray resolution',
    },
  ];

  const steps = [
    {
      num: '01',
      title: isEs ? 'Recepción de Kit Estéril' : 'Sterile Kit Delivery',
      desc: isEs ? 'Tubo estabilizador + tarjeta DBS con código.' : 'Saliva stabilization tube + barcoded DBS card.',
    },
    {
      num: '02',
      title: isEs ? 'Toma Rápida No Invasiva' : 'Non-Invasive Sampling',
      desc: isEs ? 'Saliva y 4 gotas capilares sin extracción venosa.' : 'Saliva & 4 capillary drops, no venipuncture.',
    },
    {
      num: '03',
      title: isEs ? 'Envío DHL Express Directo' : 'Prepaid DHL Express Return',
      desc: isEs ? 'Courier directo al laboratorio genómico en Múnich.' : 'Express courier to Munich genomics center.',
    },
    {
      num: '04',
      title: isEs ? 'Dossier Genómico 700k SNPs' : '700k SNPs Genomic Dossier',
      desc: isEs ? 'Edad biológica por órganos y pautas personalizadas.' : 'Organ biological age & clinical protocols.',
    },
  ];

  const actions = {
    copyUrl: canonicalUrl,
    copyLabel: isEs ? 'Copiar Enlace ETERNA' : 'Copy ETERNA Link',
    copiedLabel: isEs ? 'Enlace Copiado' : 'Link Copied',
    ...(onOpenInquiry
      ? {
          primaryCta: {
            label: isEs ? 'Solicitar Protocolo ETERNA' : 'Request ETERNA Partner Pack',
            onClick: onOpenInquiry,
            icon: Award,
          },
        }
      : {}),
    ...(onOpenAi
      ? {
          onOpenAi,
          aiLabel: isEs ? 'Consultar Atlas AI' : 'Consult Atlas AI',
        }
      : {}),
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'sticky', top: '84px' }}>
      <GcpFilterRail
        asRailContainer={false}
        title="Eurofins Genomics EU"
        subtitle="Ebersberg (Munich) · Germany"
        badge="700k SNPs"
        credentials={credentials}
        stepsTitle={isEs ? 'Protocolo ETERNA en 4 Pasos' : '4-Step ETERNA Protocol'}
        steps={steps}
        actions={actions}
      />
    </aside>
  );
}
