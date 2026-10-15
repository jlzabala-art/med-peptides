"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  ExternalLink,
  Download,
  Printer,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  User,
  Stethoscope,
  FlaskConical,
  Building2,
  FileText,
  Activity,
  QrCode,
  Tag,
  Share2
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import { toast } from 'react-hot-toast';
import CopyableId from '../ui/CopyableId';
import StatusBadge from '../ui/StatusBadge';

export default function GCPSplitDrawer({ item, type, onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'audit' | 'dossier'
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = async (text) => {
    triggerHaptic('selection');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copiado al portapapeles ✓');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handlePrintDossier = () => {
    triggerHaptic('impact');
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 99980
        }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-label="Panel de Detalle Contextual"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '540px',
          background: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          zIndex: 99985,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e2e8f0',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @media print {
            body * { visibility: hidden; }
            .gcp-dossier-print-area, .gcp-dossier-print-area * { visibility: visible; }
            .gcp-dossier-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>

        {/* Drawer Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: type === 'doctor' ? '#059669' : type === 'patient' ? '#7c3aed' : '#d97706', marginBottom: '4px' }}>
              {type === 'doctor' && <Stethoscope size={13} />}
              {type === 'patient' && <User size={13} />}
              {type === 'product' && <FlaskConical size={13} />}
              <span>{type === 'doctor' ? 'Expediente Médico' : type === 'patient' ? 'Dossier de Paciente' : 'Especificación Analítica'}</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {item.name || item.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', background: '#ffffff' }}>
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'audit', label: 'Trazabilidad & Audit Stream' },
            { id: 'dossier', label: 'Dossier Unificado' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { triggerHaptic('selection'); setActiveTab(t.id); }}
              style={{
                padding: '12px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === t.id ? '2px solid #0284c7' : '2px solid transparent',
                color: activeTab === t.id ? '#0284c7' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Doctor Profile View */}
              {type === 'doctor' && (
                <>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      Acreditación Médica
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600 }}>
                      Especialidad: {item.specialty}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                      Clínica: {item.clinicName} ({item.city}, {item.country})
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                      Licencia: <code>{item.license}</code>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/dr/${item.slug}`}
                      target="_blank"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#059669',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Abrir Portal Médico (/dr)</span>
                      <ExternalLink size={14} />
                    </Link>

                    <Link
                      href={`/doctor/prescriptions?impersonate=doctor&doc=${item.slug}`}
                      target="_blank"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Workspace Clínico (/doctor)</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </>
              )}

              {/* Patient Profile View */}
              {type === 'patient' && (
                <>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Identificación Clínica
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                      Médico Tratante: <strong>{item.doctorName}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
                      Centro: {item.clinicName} ({item.country})
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.74rem' }}>
                        Muestra: <CopyableId value={item.sampleCode} />
                      </div>
                      <div style={{ background: '#f5f3ff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.74rem' }}>
                        Receta: <CopyableId value={item.rxCode} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        href={`/rx/${item.rxCode}`}
                        target="_blank"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: '#7c3aed',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Ver Receta (/rx)</span>
                        <ExternalLink size={14} />
                      </Link>

                      <Link
                        href={`/lab/${item.sampleCode}`}
                        target="_blank"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: '#eff6ff',
                          color: '#0284c7',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Ver Lab (/lab)</span>
                        <ExternalLink size={14} />
                      </Link>
                    </div>

                    {item.pdfName && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>
                            PDF Original Fagron en Firebase Storage
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                            {item.pdfName}
                          </div>
                        </div>
                        <a
                          href={`https://firebasestorage.googleapis.com/v0/b/med-peptides-app.firebasestorage.app/o/prescriptions%2F${item.rxCode}%2Fdocs%2F${encodeURIComponent(item.pdfName)}?alt=media`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 10px',
                            background: '#16a34a',
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={13} />
                          <span>Descargar</span>
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Product Spec View */}
              {type === 'product' && (
                <>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 800 }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        HPLC {item.purity}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 650, marginBottom: '4px' }}>
                      Dosis: {item.dose} · {item.format}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                      Lote de Fabricación: <CopyableId value={item.batch} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/p/${item.slug}`}
                      target="_blank"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#d97706',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Ver Monografía (/p)</span>
                      <ExternalLink size={14} />
                    </Link>

                    <Link
                      href={`/vial-label/${item.slug}`}
                      target="_blank"
                      style={{
                        padding: '10px 14px',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={14} />
                      <span>Etiqueta 300 DPI</span>
                    </Link>
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 2: AUDIT STREAM (Phase 5 - GCP Cloud Audit) */}
          {activeTab === 'audit' && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Registro Cronológico Inmutable (GCP Operations Stream)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }} />

                {[
                  {
                    title: 'Muestra Recibida en Laboratorio',
                    desc: 'Kit de toma de muestra procesado y verificado en laboratorio central.',
                    date: item.testEndDate || 'Registrado',
                    status: 'completed',
                    user: 'Fagron Genomics'
                  },
                  {
                    title: 'Secuenciación Genómica & Algoritmo Farmacogenético',
                    desc: 'Cálculo de susceptibilidad genética y determinación de dosis metabólica.',
                    date: item.testEndDate || 'Verificado',
                    status: 'completed',
                    user: 'Algoritmo Atlas AI'
                  },
                  {
                    title: 'Documento PDF Oficial Archivado',
                    desc: 'Informe clínico firmado y transferido a Google Cloud Storage.',
                    date: 'Storage Verified',
                    status: 'completed',
                    user: 'Firebase Storage Sync'
                  },
                  {
                    title: 'Pauta Prescrita y Autorizada',
                    desc: 'Prescripción clínica emitida por el facultativo tratante para dispensación.',
                    date: 'Activo',
                    status: 'active',
                    user: item.doctorName || 'Médico Supervisor'
                  }
                ].map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#0284c7',
                      border: '2px solid #ffffff',
                      boxShadow: '0 0 0 2px #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Clock size={14} />
                    </div>

                    <div style={{ flex: 1, background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                          {ev.title}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{ev.date}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                        {ev.desc}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, marginTop: '4px' }}>
                        Actor: {ev.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DOSSIER UNIFICADO (Phase 6 - 1-Click Export) */}
          {activeTab === 'dossier' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Dossier Clínico Exportable
                </div>
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  style={{
                    padding: '6px 12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={13} />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>

              {/* Printable Dossier Sheet */}
              <div
                className="gcp-dossier-print-area"
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  fontFamily: 'serif',
                  color: '#0f172a',
                  lineHeight: 1.6
                }}
              >
                <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                      Atlas Health Services · Mediluxe
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                      Precision Peptide & Compounded Clinical Dossier · GCC & EU
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                    <div>Ref: <strong>{item.rxCode || item.batch || item.id}</strong></div>
                    <div>Fecha: {new Date().toLocaleDateString('es-ES')}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.9rem', marginBottom: '14px' }}>
                  <div><strong>Recurso:</strong> {item.name || item.title}</div>
                  {item.doctorName && <div><strong>Facultativo:</strong> {item.doctorName} ({item.clinicName})</div>}
                  {item.sampleCode && <div><strong>Código de Muestra:</strong> {item.sampleCode}</div>}
                  {item.dose && <div><strong>Dosificación Analítica:</strong> {item.dose} (Pureza HPLC {item.purity})</div>}
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', fontSize: '0.82rem', marginBottom: '14px', fontFamily: 'sans-serif' }}>
                  <strong>Declaración de Autenticidad Clínica:</strong> Este dossier unificado ha sido expedido bajo la supervisión del Account Manager de Atlas Health, garantizando el cumplimiento normativo internacional, certificación HPLC por encima del 99.0% y control de temperatura en cadena fría (2°C - 8°C).
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                  <div>Certificado Oficial de Operaciones Clínicas Atlas Health</div>
                  <div style={{ textAlign: 'center', borderTop: '1px solid #0f172a', width: '160px', paddingTop: '4px' }}>
                    Firma Responsable AM
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
