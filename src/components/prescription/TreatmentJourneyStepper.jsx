"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Dna, RefreshCw } from 'lucide-react';
import MobileConnectedStepper from '@/components/ui/MobileConnectedStepper';

/**
 * TreatmentJourneyStepper
 *
 * Clear 4-step patient-facing progress indicator for /rx/[code]
 * ("1. Prescribed -> 2. Lab Compounding -> 3. Ready / Shipped -> 4. Refill Cycle")
 * plus a direct bidirectional link to My DNA Report when genomic data is linked.
 */
export default function TreatmentJourneyStepper({
  rx = {},
  rxId = '',
  currentStatus = 'approved',
  isDispensed = false,
  isEs = false,
  genomicsData = null,
  onRequestRefill = null
}) {
  const st = String(currentStatus || rx?.status || 'approved').toLowerCase();

  let activeStep = 2; // Default: Approved -> Lab Compounding
  if (['draft', 'pending', 'proposal_pending'].includes(st)) {
    activeStep = 1;
  } else if (['processing', 'compounding', 'approved', 'active'].includes(st)) {
    activeStep = isDispensed ? 3 : 2;
  } else if (['en tránsito', 'shipped', 'delivered', 'completed', 'dispensed'].includes(st) || isDispensed) {
    activeStep = rx?.isRefillDue ? 4 : 3;
  }

  const steps = [
    { id: 1, label: isEs ? '1. Prescrito' : '1. Prescribed' },
    { id: 2, label: isEs ? '2. Preparación Lab' : '2. Lab Compounding' },
    { id: 3, label: isEs ? '3. Listo / Enviado' : '3. Ready / Shipped' },
    { id: 4, label: isEs ? '4. Renovación' : '4. Refill Cycle' }
  ];

  const cleanCode = String(rx?.code || rxId || '').toUpperCase();
  const hasDnaLink = Boolean(
    genomicsData ||
    cleanCode.includes('BOX') ||
    String(rx?.sourceType || '').toLowerCase().includes('fagron')
  );
  const patientName = rx?.patientName || rx?.patient?.name || '';
  const dnaHref = `/patient/dna-report?sample=${encodeURIComponent(cleanCode)}&patient=${encodeURIComponent(patientName)}`;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .tjs-desktop-track { display: none !important; }
        }
      `}</style>
      <div style={{ width: '100%', flex: '1 1 100%' }}>
        <MobileConnectedStepper
          steps={steps.map((s) => ({
            id: s.id,
            label: s.label.replace(/^\d+\.\s*/, ''),
            kicker: isEs ? `Estado ${activeStep} de ${steps.length}` : `Stage ${activeStep} of ${steps.length}`,
          }))}
          activeIndex={activeStep - 1}
          isEs={isEs}
          ariaLabel={isEs ? 'Progreso del tratamiento' : 'Treatment journey progress'}
        />
      </div>
      <div
        className="tjs-desktop-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          flex: '1 1 100%',
          maxWidth: '100%',
          paddingBottom: '2px',
        }}
      >
        {steps.map((step, idx) => {
          const isDone = step.id < activeStep;
          const isCurrent = step.id === activeStep;
          return (
            <React.Fragment key={step.id}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.73rem',
                  fontWeight: isCurrent ? 700 : 600,
                  backgroundColor: isCurrent ? '#e8f0fe' : isDone ? '#e6f4ea' : '#f1f3f4',
                  color: isCurrent ? '#1a73e8' : isDone ? '#137333' : '#5f6368',
                  border: isCurrent ? '1px solid #d2e3fc' : '1px solid transparent',
                  whiteSpace: 'nowrap'
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={13} />
                ) : isCurrent ? (
                  <Clock size={13} />
                ) : null}
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span style={{ color: '#bdc1c6', fontSize: '0.78rem' }}>›</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {hasDnaLink && (
          <Link
            href={dnaHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              backgroundColor: '#ffffff',
              color: '#1a73e8',
              fontSize: '0.73rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Dna size={13} />
            <span>{isEs ? 'Ver Informe ADN ↗' : 'My DNA Report ↗'}</span>
          </Link>
        )}

        {onRequestRefill && (
          <button
            type="button"
            onClick={onRequestRefill}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #dadce0',
              backgroundColor: '#ffffff',
              color: '#3c4043',
              fontSize: '0.73rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <RefreshCw size={12} />
            <span>{isEs ? 'Solicitar Refill' : 'Request Refill'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
