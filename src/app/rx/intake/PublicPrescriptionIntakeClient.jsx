'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Tags, FileText, Upload, ShieldCheck, Sparkles, Database } from 'lucide-react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PharmacyOpsWorkspaceBar from '@/components/shared/PharmacyOpsWorkspaceBar';
import ImportPrescriptionModal from '@/features/prescriptions/components/ImportPrescriptionModal';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import '@/styles/publicDesignSystem.css';

/**
 * PublicPrescriptionIntakeClient (/rx/intake)
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified with /labels (`ImportPrescriptionModal`): uses the exact same AI
 * extraction, galenic readiness validation, Algolia ingredient matching, and
 * 3-option duplicate detection (Create New / Update Refill / Use Existing #RX).
 */
export default function PublicPrescriptionIntakeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refDoctor = (searchParams?.get('refDoctor') || searchParams?.get('doc') || '').trim();
  const [lang, setLang] = useState('en');
  const isEs = lang === 'es';
  const [importedRecords, setImportedRecords] = useState([]);
  const [modalKey, setModalKey] = useState(0);

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'rx-intake',
        name: 'Prescription Intake & Import',
      },
      bottomBar: {
        summaryTitle: isEs ? 'Nuevo Intake de Receta' : 'New Prescription Intake',
        summarySubtitle: isEs
          ? 'Mismo motor e interfaz que Labels Studio · PDF, Imagen o Excel'
          : 'Unified Labels Studio Import Engine · PDF, Image or Excel',
        badge: 'E-Rx / GMP',
        atlasAiLabel: 'Ask Atlas AI',
        primaryAction: {
          label: isEs ? 'Ir a Labels Studio' : 'Open Labels Studio',
          onClick: () => router.push('/labels'),
        },
      },
    },
    [isEs, router]
  );

  const primaryImported = importedRecords[0] || null;
  const importedCode = primaryImported?.code || primaryImported?.id || '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={setLang}
        hideCurrencySelector={true}
        breadcrumbs={[
          { label: isEs ? 'Inicio' : 'Home', href: '/' },
          { label: isEs ? 'Labels Studio' : 'Labels Studio', href: '/labels' },
          { label: isEs ? 'Nuevo Intake de Receta' : 'New Prescription Intake', href: '/rx/intake' },
        ]}
      />

      <PharmacyOpsWorkspaceBar lang={lang} />

      <main style={{ flex: 1, maxWidth: '1040px', width: '100%', margin: '0 auto', padding: '16px 16px 64px' }}>
        {/* 4 Compact GCP KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
              <Upload size={13} color="#1a73e8" />
              <span>{isEs ? 'Formatos Aceptados' : 'Supported Formats'}</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124', marginTop: '3px' }}>
              PDF · JPG/PNG · XLSX
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
              <Sparkles size={13} color="#0d9488" />
              <span>{isEs ? 'Motor de Extracción' : 'Extraction Engine'}</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124', marginTop: '3px' }}>
              {isEs ? 'IA + Validación Galénica' : 'AI + Galenic Validation'}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
              <Database size={13} color="#1a73e8" />
              <span>{isEs ? 'Control de Duplicados' : 'Duplicate Detection'}</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124', marginTop: '3px' }}>
              {isEs ? 'Crear / Actualizar / Existente' : 'New / Refill / Use Existing'}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase' }}>
              <ShieldCheck size={13} color="#16a34a" />
              <span>{isEs ? 'Sincronización' : 'Direct Sync'}</span>
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#202124', marginTop: '3px' }}>
              Firestore + Labels Studio
            </div>
          </div>
        </div>

        {/* Post-Import Action Banner when a prescription was just imported */}
        {importedCode && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#16a34a" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#166534' }}>
                  {isEs
                    ? `Prescripción #${importedCode} lista en el sistema`
                    : `Prescription #${importedCode} ready in system`}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#15803d' }}>
                  {primaryImported?.patientName || ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => router.push(`/labels?rx=${encodeURIComponent(importedCode)}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Tags size={14} />
                <span>{isEs ? 'Abrir en Labels Studio' : 'Open in Labels Studio'}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push(`/rx/${encodeURIComponent(importedCode)}`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#202124',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <FileText size={14} />
                <span>{isEs ? 'Ver Ficha /rx/' : 'View Rx Sheet'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportedRecords([]);
                  setModalKey((k) => k + 1);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#5f6368',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>{isEs ? 'Subir otra receta' : 'Import Another'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Unified Import Engine (Exact same UI & logic as /labels) */}
        <ImportPrescriptionModal
          key={modalKey}
          isOpen={true}
          embeddedPage={true}
          onClose={() => router.push('/labels')}
          context={refDoctor ? { doctorName: refDoctor } : {}}
          title={isEs ? 'Nuevo Intake e Importación de Receta' : 'New Prescription Intake & Import'}
          persistEndpoint="/api/labels/import"
          note={
            isEs
              ? 'Sube una receta en PDF, foto o Excel. Utiliza exactamente el mismo validador galénico, detector de duplicados y generador de etiquetas que Labels Studio.'
              : 'Upload a PDF, photo, or Excel prescription. Uses the exact same galenic validator, duplicate detector, and label engine as Labels Studio.'
          }
          onImported={(created) => {
            const list = Array.isArray(created) ? created : created ? [created] : [];
            setImportedRecords(list);
          }}
        />
      </main>

      <PublicUnifiedFooter lang={lang} minimal={true} />
    </div>
  );
}
