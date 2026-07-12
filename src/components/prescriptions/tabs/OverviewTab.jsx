import React from 'react';
import { User, ArrowUpRight, Stethoscope } from '@/lib/icons';

export default function OverviewTab({ rx }) {
  const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
  const patEmail = rx.patient?.email || rx.patientEmail || null;
  const patPhone = rx.patient?.phone || rx.patientPhone || null;
  const doctor = rx.doctor?.name || rx.doctorName || null;
  const docEmail = rx.doctor?.email || rx.doctorEmail || null;
  const manager = rx.accountManager || null;
  const diagnosisObj = rx.diagnosis || null;
  const diagnosis = typeof diagnosisObj === 'object' && diagnosisObj !== null ? (diagnosisObj.primary || diagnosisObj.description || '—') : diagnosisObj;
  const protocol = rx.protocol || rx.protocolName || null;
  const notes = rx.clinicalNotes || rx.notes || null;

  const InfoRow = ({ icon: Icon, label, value, color = '#64748b' }) =>
    value ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.6rem 0',
          borderBottom: '1px solid #f8fafc',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={color} />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
          <div
            style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginTop: '0.1rem' }}
          >
            {value}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      {/* Left: Patient & Team */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Patient
          </div>
          <InfoRow icon={User} label="Name" value={patient} color="#6366f1" />
          <InfoRow icon={ArrowUpRight} label="Email" value={patEmail} color="#3b82f6" />
          <InfoRow icon={ArrowUpRight} label="Phone" value={patPhone} color="#3b82f6" />
        </div>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Care Team
          </div>
          <InfoRow icon={Stethoscope} label="Prescribing Doctor" value={doctor} color="#10b981" />
          <InfoRow icon={ArrowUpRight} label="Doctor Email" value={docEmail} color="#10b981" />
          {manager && (
            <InfoRow icon={User} label="Account Manager" value={manager} color="#f59e0b" />
          )}
        </div>
      </div>

      {/* Right: Clinical Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Clinical Information
          </div>
          {diagnosis ? (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Diagnosis
              </div>
              <div
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  fontWeight: 600,
                }}
              >
                {diagnosis}
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                fontStyle: 'italic',
                marginBottom: '0.75rem',
              }}
            >
              No diagnosis specified
            </div>
          )}
          {protocol && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Protocol
              </div>
              <div
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  color: '#6366f1',
                  fontWeight: 700,
                }}
              >
                {protocol}
              </div>
            </div>
          )}
        </div>
        {notes && (
          <div
            style={{
              background: '#fffbeb',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #fde68a',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#92400e',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.5rem',
              }}
            >
              Clinical Notes
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#78350f',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
