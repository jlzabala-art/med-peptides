import React from 'react';
import ClinicalProtocolFinderWizard from '../../components/guided/ClinicalProtocolFinderWizard';

export const metadata = {
  title: 'Asistente de Prescripción & Protocol Finder | Atlas App',
  description: 'Buscador guiado inteligente de protocolos clínicos y péptidos según objetivos terapéuticos.',
};

export default function ProtocolFinderPage() {
  return (
    <div style={{ minHeight: '80vh', padding: '2.5rem 1.5rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003666', margin: '0 0 0.5rem' }}>
          Clinical Discovery & Protocol Finder
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Descubre protocolos regenerativos validados y combinaciones de compuestos según el perfil del paciente.
        </p>
      </div>

      <ClinicalProtocolFinderWizard />
    </div>
  );
}
