'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Clock, ShieldCheck, Tag, RotateCcw, AlertCircle } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

export const STATUS_TAXONOMY_GROUPS = [
  {
    groupKey: 'pre_dispensed',
    groupTitleEn: 'Pre-Dispensing Lifecycle (Quotation Flow)',
    groupTitleEs: 'Estados Previos (Flujo de Cotización)',
    badgeColor: '#1d4ed8',
    badgeBg: '#eff6ff',
    items: [
      { 
        id: 'draft', 
        labelEn: 'Draft', 
        labelEs: 'Borrador', 
        color: '#64748b', 
        bg: '#f1f5f9', 
        border: '#cbd5e1', 
        descEn: 'Initial prescription draft. Patient can request quotation.',
        descEs: 'Borrador inicial. El paciente solicita cotización.' 
      },
      { 
        id: 'pending', 
        labelEn: 'Pending Review', 
        labelEs: 'Pendiente', 
        color: '#d97706', 
        bg: '#fffbeb', 
        border: '#fde68a', 
        descEn: 'Awaiting clinical clearance or physician review.',
        descEs: 'Pendiente de validación médica facultativa.' 
      },
      { 
        id: 'prescribed', 
        labelEn: 'Prescribed', 
        labelEs: 'Prescrita', 
        color: '#0284c7', 
        bg: '#f0f9ff', 
        border: '#bae6fd', 
        descEn: 'Formally signed by treating physician.',
        descEs: 'Firmada formalmente por el médico prescriptor.' 
      },
      { 
        id: 'approved', 
        labelEn: 'Approved', 
        labelEs: 'Aprobada', 
        color: '#16a34a', 
        bg: '#f0fdf4', 
        border: '#bbf7d0', 
        descEn: 'Medically cleared for pharmacy compounding.',
        descEs: 'Aprobada para formulación en farmacia.' 
      },
      { 
        id: 'awaiting payment', 
        labelEn: 'Awaiting Payment', 
        labelEs: 'Esperando Pago', 
        color: '#ea580c', 
        bg: '#fff7ed', 
        border: '#ffedd5', 
        descEn: 'Quotation sent, pending patient settlement.',
        descEs: 'Presupuesto emitido, pendiente de liquidación.' 
      },
      { 
        id: 'processing', 
        labelEn: 'Processing / Lab', 
        labelEs: 'En Preparación', 
        color: '#8b5cf6', 
        bg: '#f5f3ff', 
        border: '#ddd6fe', 
        descEn: 'In active compounding laboratory preparation.',
        descEs: 'En formulación activa en laboratorio.' 
      }
    ]
  },
  {
    groupKey: 'dispensed',
    groupTitleEn: 'Dispensed & Supplied Lifecycle (Refill Flow)',
    groupTitleEs: 'Estados Dispensada / Suministrada (Flujo de Renovación)',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    items: [
      { 
        id: 'dispensed', 
        labelEn: 'Dispensed', 
        labelEs: 'Dispensada', 
        color: '#059669', 
        bg: '#ecfdf5', 
        border: '#a7f3d0', 
        descEn: 'Released by dispensary. Shows refill prompt & past price.',
        descEs: 'Dispensada por farmacia. Activa renovación y precio previo.' 
      },
      { 
        id: 'delivered', 
        labelEn: 'Delivered', 
        labelEs: 'Entregada', 
        color: '#0d9488', 
        bg: '#f0fdfa', 
        border: '#99f6e4', 
        descEn: 'Received by patient / clinic for active administration.',
        descEs: 'Entregada en clínica o domicilio del paciente.' 
      },
      { 
        id: 'active', 
        labelEn: 'Active Treatment', 
        labelEs: 'Tratamiento Activo', 
        color: '#16a34a', 
        bg: '#f0fdf4', 
        border: '#86efac', 
        descEn: 'Currently under active clinical administration.',
        descEs: 'En pauta de administración activa.' 
      },
      { 
        id: 'completed', 
        labelEn: 'Completed Cycle', 
        labelEs: 'Ciclo Completado', 
        color: '#0284c7', 
        bg: '#f0f9ff', 
        border: '#93c5fd', 
        descEn: 'Full 3-month posology cycle finished. Ready for new cycle.',
        descEs: 'Ciclo completo finalizado. Listo para renovar pauta.' 
      }
    ]
  }
];

export default function PrescriptionStatusQuickAction({
  status = 'approved',
  prescriptionId,
  prescriptionNumber,
  onStatusChange,
  isEs = false,
  readOnly = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const containerRef = useRef(null);

  const normalizedStatus = String(status || 'approved').toLowerCase().trim();

  // Find meta for current status
  const currentMeta = React.useMemo(() => {
    for (const group of STATUS_TAXONOMY_GROUPS) {
      const found = group.items.find(i => i.id === normalizedStatus);
      if (found) return found;
    }
    return {
      id: normalizedStatus,
      labelEn: normalizedStatus.toUpperCase(),
      labelEs: normalizedStatus.toUpperCase(),
      color: '#475569',
      bg: '#f1f5f9',
      border: '#cbd5e1',
      descEn: 'Prescription lifecycle status',
      descEs: 'Estado del ciclo de prescripción'
    };
  }, [normalizedStatus]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectStatus = async (newStatusId) => {
    if (newStatusId === normalizedStatus) {
      setIsOpen(false);
      return;
    }

    triggerHaptic('selection');
    setIsOpen(false);
    setIsUpdating(true);

    // Call optimistic update in parent
    if (onStatusChange) {
      onStatusChange(newStatusId);
    }

    try {
      const res = await fetch('/api/prescriptions/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: prescriptionId || prescriptionNumber,
          prescriptionNumber: prescriptionNumber || prescriptionId,
          newStatus: newStatusId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update prescription status');
      }

      toast.success(
        isEs 
          ? `Estado actualizado a "${newStatusId}" ✓` 
          : `Prescription status updated to "${newStatusId}" ✓`,
        { icon: '📋' }
      );
    } catch (err) {
      console.error('[PrescriptionStatusQuickAction] Error:', err);
      toast.error(err.message || 'Error updating status');
      // Revert in parent
      if (onStatusChange) {
        onStatusChange(normalizedStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button: Google Cloud Console Semantic Pill */}
      <button
        type="button"
        onClick={() => !readOnly && setIsOpen(prev => !prev)}
        disabled={isUpdating || readOnly}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 9px',
          borderRadius: '4px',
          background: currentMeta.bg,
          color: currentMeta.color,
          border: `1px solid ${currentMeta.border}`,
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: readOnly ? 'default' : 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1.3,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'all 0.15s ease',
          opacity: isUpdating ? 0.7 : 1
        }}
        title={readOnly ? undefined : (isEs ? 'Haga clic para cambiar el estado manualmente' : 'Click to manually change prescription status')}
      >
        <span 
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: currentMeta.color,
            flexShrink: 0
          }} 
        />
        <span>{isEs ? currentMeta.labelEs : currentMeta.labelEn}</span>
        {!readOnly && (
          <ChevronDown 
            size={12} 
            style={{ 
              color: currentMeta.color, 
              transform: isOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.15s ease',
              flexShrink: 0
            }} 
          />
        )}
      </button>

      {/* Floating High-Density GCP Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(0,0,0,0.08)',
            padding: '10px',
            width: '320px',
            maxWidth: '90vw',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '8px',
            marginBottom: '8px',
            borderBottom: '1px solid #e8eaed'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#202124' }}>
                {isEs ? 'Evaluación del Estado Clínico' : 'Prescription Lifecycle Status'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                {isEs ? 'Quick Action Manual · Sincronizado con Firestore' : 'Manual Quick Action · Synced with Firestore'}
              </div>
            </div>
            <span style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              background: '#e8f0fe',
              color: '#1a73e8',
              border: '1px solid #d2e3fc'
            }}>
              GCP
            </span>
          </div>

          {/* Group 1: Estados Previos */}
          {STATUS_TAXONOMY_GROUPS.map((group) => (
            <div key={group.groupKey} style={{ marginBottom: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.66rem',
                fontWeight: 800,
                color: group.badgeColor,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '4px',
                padding: '2px 4px',
                background: group.badgeBg,
                borderRadius: '4px'
              }}>
                <span>{isEs ? group.groupTitleEs : group.groupTitleEn}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {group.items.map((item) => {
                  const isSelected = item.id === normalizedStatus;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectStatus(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: isSelected ? '#f1f5f9' : 'transparent',
                        border: isSelected ? '1px solid #cbd5e1' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: item.color,
                          marginTop: '4px',
                          flexShrink: 0
                        }} />
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b' }}>
                            {isEs ? item.labelEs : item.labelEn}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.25 }}>
                            {isEs ? item.descEs : item.descEn}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check size={14} style={{ color: item.color, flexShrink: 0, marginLeft: '6px' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Footer Note */}
          <div style={{
            paddingTop: '6px',
            borderTop: '1px solid #e8eaed',
            fontSize: '0.64rem',
            color: '#94a3b8',
            textAlign: 'center'
          }}>
            {isEs 
              ? 'Los estados dispensados activan el flujo de renovación y precio anterior en el portal del paciente.' 
              : 'Dispensed states automatically activate the refill prompt & previous price on patient view.'}
          </div>
        </div>
      )}
    </div>
  );
}
