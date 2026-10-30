'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Stethoscope, 
  MessageCircle, 
  Phone, 
  Lock, 
  FileText, 
  ExternalLink 
} from '@/lib/icons';

export default function PrescriptionPendingValidationView({
  rx,
  rxId,
  patientName = 'Patient',
  doctorName = 'Treating Physician',
  clinicName = 'Medical Practice',
  doctorPhone = '+97143498800',
  isEs = false
}) {
  const cleanPhone = String(doctorPhone || '+97143498800').replace(/[^0-9+]/g, '');
  const cleanCode = rx?.prescriptionNumber || rx?.code || rxId || 'RX-PENDING';
  
  const whatsappText = encodeURIComponent(
    isEs
      ? `Hola, me pongo en contacto con ${clinicName} sobre mi prescripción médica #${cleanCode} a nombre de ${patientName}. ¿Podrían indicarme el estado de mi pauta clínica? Gracias.`
      : `Hello, I am contacting ${clinicName} regarding my prescription #${cleanCode} for ${patientName}. Could you please advise on the clinical review status? Thank you.`
  );

  const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappText}`;

  return (
    <div style={{
      maxWidth: '720px',
      margin: '40px auto',
      padding: '0 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Top Clinical Header Strip */}
        <div style={{
          background: '#003666',
          padding: '16px 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                {clinicName || 'Atlas Clinical Services'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                {isEs ? 'Portal de Prescripción y Farmacopea EU GMP' : 'Digital Prescription & EU GMP Compounding Portal'}
              </div>
            </div>
          </div>

          <span style={{
            fontSize: '0.70rem',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            #{cleanCode}
          </span>
        </div>

        {/* Central Attention Notice */}
        <div style={{ padding: '36px 32px', textAlign: 'center' }}>
          
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef3c7',
            color: '#d97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 0 0 8px #fffbeb'
          }}>
            <Clock size={32} />
          </div>

          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '10px'
          }}>
            {isEs 
              ? 'Expediente en Calibración y Firma Facultativa' 
              : 'Prescription Dossier Under Physician Review'}
          </h1>

          <p style={{
            fontSize: '0.88rem',
            color: '#475569',
            lineHeight: 1.55,
            maxWidth: '520px',
            margin: '0 auto 24px'
          }}>
            {isEs ? (
              <>
                Estimado/a <strong>{patientName}</strong>: su prescripción médica está siendo calibrada y validada actualmente por <strong>{doctorName}</strong>. 
                Por rigurosidad clínica y seguridad farmacológica, su pauta posológica completa y dispensación quedarán disponibles de manera inmediata en este enlace tras la firma de su médico.
              </>
            ) : (
              <>
                Dear <strong>{patientName}</strong>: your personalized compounded prescription is currently being reviewed and calibrated by <strong>{doctorName}</strong>. 
                In compliance with clinical safety standards, your complete posology regimen and formulation details will activate automatically upon physician sign-off.
              </>
            )}
          </p>

          {/* Clinical Reference Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 18px',
            maxWidth: '460px',
            margin: '0 auto 28px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#64748b' }}>{isEs ? 'Paciente:' : 'Patient:'}</span>
              <strong style={{ color: '#1e293b' }}>{patientName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#64748b' }}>{isEs ? 'Código de Referencia:' : 'Reference Code:'}</span>
              <strong style={{ color: '#1e293b' }}>#{cleanCode}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#64748b' }}>{isEs ? 'Médico Prescriptor:' : 'Prescribing Physician:'}</span>
              <strong style={{ color: '#1e293b' }}>{doctorName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#64748b' }}>{isEs ? 'Estado:' : 'Current Status:'}</span>
              <span style={{
                color: '#d97706',
                fontWeight: 600,
                background: '#fef3c7',
                padding: '1px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem'
              }}>
                ⏳ {isEs ? 'En revisión facultativa' : 'Pending doctor sign-off'}
              </span>
            </div>
          </div>

          {/* Action CTAs: Direct Communication with Clinic */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#25D366',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.84rem',
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(37, 211, 102, 0.25)',
                transition: 'opacity 0.15s ease'
              }}
            >
              <MessageCircle size={18} />
              <span>{isEs ? 'Contactar con la Clínica por WhatsApp' : 'Contact Clinic via WhatsApp'}</span>
            </a>

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: '#f1f5f9',
                  color: '#334155',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  border: '1px solid #cbd5e1'
                }}
              >
                <Phone size={16} />
                <span>{cleanPhone}</span>
              </a>
            )}
          </div>

        </div>

        {/* Footer Guarantee */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.72rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span>{isEs ? 'Sistema Seguro de Farmacia Magistral · Trazabilidad y Calidad Farmacopea EU' : 'Certified Magistral Compounding · EU Pharmacopoeia Traceability'}</span>
        </div>
      </div>
    </div>
  );
}
