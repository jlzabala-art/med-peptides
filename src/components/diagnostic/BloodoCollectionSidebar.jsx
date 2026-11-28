'use client';

import React from 'react';
import { Award, ShieldCheck, Microscope, Lock } from '@/lib/icons';
import GcpFilterRail from '@/components/ui/GcpFilterRail';

export default function BloodoCollectionSidebar({ lang = 'en', onOpenInquiry = null, onOpenAi = null }) {
  const isEs = lang === 'es';
  const canonicalUrl = 'https://www.atlashealth-services.com/collection/bloodo';

  const credentials = [
    {
      icon: ShieldCheck,
      label: 'ISO 15189',
      detail: isEs ? 'Acreditación médica LC-MS/MS y UHPLC' : 'Medical LC-MS/MS & UHPLC quantification',
    },
    {
      icon: Microscope,
      label: 'CE-IVDR',
      detail: isEs ? 'Reglamento (UE) 2017/746' : 'EU IVDR 2017/746 compliant diagnostics',
    },
    {
      icon: Lock,
      label: 'Whatman® 903',
      detail: isEs ? 'Tarjeta capilar seca validada' : 'Validated capillary DBS matrix',
    },
  ];

  const steps = [
    {
      num: '01',
      title: isEs ? 'Punción capilar indolora' : 'Painless finger-prick',
      desc: isEs ? 'Lanceta retráctil estéril incluida en cada kit.' : 'Sterile single-use micro-lancet included.',
    },
    {
      num: '02',
      title: isEs ? 'Llenar 4 círculos DBS' : 'Fill 4 Whatman® spots',
      desc: isEs ? 'Gotas de sangre sobre la tarjeta Whatman® 903.' : 'Saturate printed circles until outer boundary.',
    },
    {
      num: '03',
      title: isEs ? 'Secado al aire 15 min' : 'Air dry 15 minutes',
      desc: isEs ? 'Secado a temperatura ambiente sin luz solar.' : 'Allow to dry naturally before packaging.',
    },
    {
      num: '04',
      title: isEs ? 'Envío prepagado al laboratorio' : 'Prepaid courier return',
      desc: isEs ? 'Bolsa con desecante y sobre de retorno europeo.' : 'Seal in desiccant pouch and drop in mail.',
    },
  ];

  const actions = {
    copyUrl: canonicalUrl,
    copyLabel: isEs ? 'Copiar Enlace Bloodo' : 'Copy Bloodo Link',
    copiedLabel: isEs ? 'Enlace Copiado' : 'Link Copied',
    ...(onOpenInquiry
      ? {
          primaryCta: {
            label: isEs ? 'Solicitar Kits / Cotización' : 'Request Diagnostic Kits',
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
        title="LifeLab1 Central Diagnostic Lab"
        subtitle="Vilnius, Lithuania · License 4864"
        badge="ISO 15189"
        credentials={credentials}
        stepsTitle={isEs ? 'Protocolo de Toma DBS' : 'DBS Sample Collection'}
        steps={steps}
        actions={actions}
      />
    </aside>
  );
}
