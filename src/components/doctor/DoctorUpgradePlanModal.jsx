'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  User, 
  FileText, 
  Stethoscope, 
  ArrowRight,
  TrendingUp,
  Award
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import notifier from '../../services/NotificationService';

export default function DoctorUpgradePlanModal({ 
  isOpen, 
  onClose, 
  currentTier = 'basic',
  doctorName = 'Doctor',
  doctorId = '',
  onUpgradeSuccess
}) {
  const [loading, setLoading] = useState(false);
  const isPro = currentTier === 'advanced' || currentTier === 'pro';

  if (!isOpen) return null;

  const handleRequestUpgrade = async () => {
    setLoading(true);
    const toastId = toast.loading('Procesando solicitud de actualización…');
    try {
      // 1. Send notification to admin
      await notifier.send({
        to: ['admin'],
        type: 'user',
        title: '💎 Solicitud de Upgrade a Plan Pro',
        message: `El ${doctorName} (ID: ${doctorId || 'doctor'}) ha solicitado ascender al Plan Avanzado Pro.`,
        data: { doctorId, doctorName, requestedTier: 'advanced' }
      });

      // 2. Open WhatsApp direct channel to admin / conciergerie
      const text = encodeURIComponent(`Hola, soy el ${doctorName}. Deseo activar el Plan Avanzado Pro para mi consulta médica en Med-Peptides / Atlas Health. Por favor, coordinen la activación.`);
      const waUrl = `https://wa.me/34600000000?text=${text}`; // Support line
      
      toast.success('¡Solicitud enviada! Nuestro equipo clínico contactará contigo de inmediato.', { id: toastId });
      
      // Notify parent if simulation callback passed
      if (onUpgradeSuccess) onUpgradeSuccess();
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la solicitud: ' + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const COMPARISON_FEATURES = [
    {
      feature: 'Emisión de Prescripciones',
      basic: 'Manual (producto por producto)',
      pro: 'Ilimitada + Regímenes 1-Tap propios',
      highlight: true
    },
    {
      feature: 'Atlas AI Clinical Scribe',
      basic: '5 consultas / mes',
      pro: 'Ilimitado (lectura de analíticas y genética)',
      highlight: true
    },
    {
      feature: 'Guía del Paciente y Jeringa U-100',
      basic: 'Formato estándar Lotusland',
      pro: 'White-Label (Logotipo y marca de tu clínica)',
      highlight: true
    },
    {
      feature: 'Directorio de Pacientes',
      basic: 'Hasta 30 pacientes activos',
      pro: 'Pacientes Ilimitados + Notas SOAP',
      highlight: false
    },
    {
      feature: 'Alertas de Refill por WhatsApp',
      basic: 'Aviso manual',
      pro: 'Alertas predictivas antes de fin de vial',
      highlight: true
    },
    {
      feature: 'Vademécum Lotusland Precios Clínicos',
      basic: 'Incluido',
      pro: 'Incluido + Comparador de bio-equivalencia',
      highlight: false
    },
    {
      feature: 'Teleconsulta y Calendario Médico',
      basic: 'No disponible',
      pro: 'Gestión integrada de citas clínicas',
      highlight: false
    },
    {
      feature: 'Canal de Soporte Clínico',
      basic: 'Estándar (Email / Ticket)',
      pro: 'Prioritario VIP (WhatsApp Directo 24/7)',
      highlight: true
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #0284c7 100%)',
            color: '#ffffff',
            padding: '2rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Award size={14} /> Membresía Médica Lotusland & Atlas Health
          </div>

          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Eleva tu Práctica Clínica al Nivel Avanzado Pro
          </h2>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#ccfbf1', maxWidth: '650px', lineHeight: 1.5 }}>
            Potencia tu consulta de longevidad y dermatología con inteligencia clínica Atlas AI, personalización de marca para tus pacientes y fidelización recurrente automatizada.
          </p>
        </div>

        {/* Current Plan Indicator Strip */}
        <div
          style={{
            padding: '0.85rem 2rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b' }}>Tu Nivel Actual:</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.78rem',
                backgroundColor: isPro ? '#f0fdfa' : '#f1f5f9',
                color: isPro ? '#0f766e' : '#475569',
                border: isPro ? '1px solid #99f6e4' : '1px solid #cbd5e1',
              }}
            >
              {isPro ? '💎 Avanzado Pro (Activo)' : '🟢 Plan Básico (Clinical Starter)'}
            </span>
          </div>
          <div style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.82rem' }}>
            Doctor: {doctorName}
          </div>
        </div>

        {/* Comparison Table Content */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', width: '38%', fontWeight: 700, color: '#475569' }}>Funcionalidad Clínica</th>
                  <th style={{ padding: '1rem', width: '28%', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>🟢 Plan Básico</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Gratuito • Acceso Esencial</div>
                  </th>
                  <th style={{ padding: '1rem', width: '34%', fontWeight: 800, color: '#0d9488', textAlign: 'center', background: 'rgba(13, 148, 136, 0.06)' }}>
                    <div style={{ fontSize: '0.95rem', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Sparkles size={16} /> 💎 Avanzado Pro
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>Suscripción Mensual Pro</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, idx) => (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                      {row.feature}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      {row.basic}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600, color: '#0f766e', background: 'rgba(13, 148, 136, 0.04)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={16} color="#0d9488" />
                        <span>{row.pro}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Value Prop Callouts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: '#f0fdfa', border: '1px solid #ccfbf1' }}>
              <div style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} /> +40% Retención de Pacientes
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                Los recordatorios inteligentes de refill aseguran que los tratamientos de péptidos se completen sin abandonos.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Marca Propia (White-Label)
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                Entrega pautas de dosificación con el prestigio y logotipo de tu propia clínica privada.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ color: '#7e22ce', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Copiloto Médico Atlas AI
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                Sintetiza biomarcadores y formula dosis exactas de jeringa U-100 en un abrir y cerrar de ojos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Sin permanencia obligatoria • Activación inmediata desde soporte o administración
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>

            {!isPro ? (
              <button
                type="button"
                onClick={handleRequestUpgrade}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'transform 0.15s ease',
                }}
              >
                <Sparkles size={18} />
                Solicitar Upgrade a Plan Pro 💎
              </button>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#f0fdfa',
                  color: '#0f766e',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: '1px solid #99f6e4',
                }}
              >
                <Check size={18} /> Ya disfrutas del Plan Avanzado Pro
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
