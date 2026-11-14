'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Pill,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Sliders,
  Clock,
  Building2,
  FileText
} from 'lucide-react';
import CopyableId from '../../ui/CopyableId';
import StatusBadge from '../../ui/StatusBadge';

export default function CompoundedRxCustomizerDrawer({
  isOpen,
  onClose,
  patientData = {},
  doctorData = {},
  initialFormulation = null,
  onSuccess
}) {
  const [formulation, setFormulation] = useState(null);
  const [supplyDays, setSupplyDays] = useState(30);
  const [pharmacyNotes, setPharmacyNotes] = useState('Dispense in vegan acid-resistant HPMC capsules (DRcaps®). Zero artificial excipients or magnesium stearate.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (initialFormulation) {
      // Deep clone to allow interactive editing
      setFormulation(JSON.parse(JSON.stringify(initialFormulation)));
    }
  }, [initialFormulation]);

  if (!isOpen || !formulation) return null;

  const handleToggleBlock = (blockId) => {
    setFormulation(prev => ({
      ...prev,
      formulationBlocks: prev.formulationBlocks.map(b =>
        b.id === blockId ? { ...b, enabled: !b.enabled } : b
      )
    }));
  };

  const handleToggleItem = (blockId, itemIndex) => {
    setFormulation(prev => ({
      ...prev,
      formulationBlocks: prev.formulationBlocks.map(b => {
        if (b.id !== blockId) return b;
        const newItems = [...b.items];
        newItems[itemIndex] = { ...newItems[itemIndex], enabled: !newItems[itemIndex].enabled };
        return { ...b, items: newItems };
      })
    }));
  };

  const handleDoseChange = (blockId, itemIndex, newDose) => {
    setFormulation(prev => ({
      ...prev,
      formulationBlocks: prev.formulationBlocks.map(b => {
        if (b.id !== blockId) return b;
        const newItems = [...b.items];
        newItems[itemIndex] = { ...newItems[itemIndex], dose: newDose };
        return { ...b, items: newItems };
      })
    }));
  };

  const totalActiveCapsulesPerDay = (formulation.formulationBlocks || [])
    .filter(b => b.enabled)
    .length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Filter only enabled blocks and items
    const activeBlocks = (formulation.formulationBlocks || [])
      .filter(b => b.enabled)
      .map(b => ({
        ...b,
        items: b.items.filter(i => i.enabled)
      }));

    if (activeBlocks.length === 0) {
      setSubmitError('At least one capsule block must be active.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        doctorId: doctorData.id || 'dr-sajid-burud',
        doctorName: doctorData.name || 'Dr. Sajid Burud',
        doctorLicense: doctorData.license || 'DHA-00132881',
        clinicName: doctorData.clinic || 'Transcend Healthcare',
        clinicAddress: doctorData.address || 'Jumeirah, Dubai, UAE',
        doctorSpecialty: doctorData.specialty || 'Integrative & Regenerative Medicine',
        patient: {
          name: patientData.name || 'Patient',
          id: patientData.id || `pt-${patientData.sampleId}`,
          dob: patientData.dob || '1988-04-12',
          gender: patientData.gender || 'Female'
        },
        treatmentTitle: formulation.title || 'Personalized Compounded Regimen',
        formulationBlocks: activeBlocks,
        formulaSummary: formulation.summaryRationale || '',
        nutrigenomicProfile: {
          sampleId: patientData.sampleId || '',
          templateId: formulation.templateId || 'three_capsule_precision_nutrigenomics'
        },
        capsuleSize: 'Size 0 (HPMC DRcaps®)',
        capsPerBottle: totalActiveCapsulesPerDay * supplyDays,
        supplyDays: supplyDays,
        pharmacyNotes
      };

      const res = await fetch('/api/prescriptions/create-compounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to issue prescription.');
      }

      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
      onClose();
    } catch (err) {
      console.error('[CompoundedRxCustomizerDrawer] Submission error:', err);
      setSubmitError(err.message || 'An error occurred while creating the prescription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(32, 33, 36, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header (GCP Style) */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #dadce0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#e8f0fe',
                  color: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sliders size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#202124' }}>
                Review &amp; Customize Magistral Formula
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#5f6368' }}>
              Fine-tune active ingredients and milligram doses before signing and sending to dispensary.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5f6368'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Patient & Triangulation Context Strip */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e8eaed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124' }}>
                {patientData.name || 'Ms. Wafa Burud'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem', color: '#5f6368', marginTop: '1px' }}>
                <span>Specimen:</span>
                <CopyableId value={patientData.sampleId || 'G000943568'} iconOnly={false} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status="approved" />
            <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#137333', backgroundColor: '#e6f4ea', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '4px' }}>
              CE-IVD Illumina Infinium
            </span>
          </div>
        </div>

        {/* Clinical Rationale Alert */}
        <div style={{ padding: '12px 24px', backgroundColor: '#e8f0fe', borderBottom: '1px solid #d2e3fc' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Sparkles size={16} color="#1a73e8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#174ea6', lineHeight: 1.45 }}>
              <strong>Genomic &amp; Biomarker Calibration: </strong>
              {formulation.summaryRationale}
            </p>
          </div>
        </div>

        {/* Scrollable Formulations Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {(formulation.formulationBlocks || []).map((block) => (
            <div
              key={block.id}
              style={{
                border: block.enabled ? '1px solid #dadce0' : '1px dashed #dadce0',
                borderRadius: '8px',
                backgroundColor: block.enabled ? '#ffffff' : '#f8f9fa',
                opacity: block.enabled ? 1 : 0.6,
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Block Header with Toggle */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: block.enabled ? '#f8f9fa' : '#f1f3f4',
                  borderBottom: block.enabled ? '1px solid #dadce0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={16} color={block.enabled ? '#1a73e8' : '#80868b'} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#202124' }}>
                      {block.title}
                    </h4>
                    <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>
                      {block.time} · {block.instructions}
                    </span>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={block.enabled}
                    onChange={() => handleToggleBlock(block.id)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span>{block.enabled ? 'Active' : 'Excluded'}</span>
                </label>
              </div>

              {/* Items List */}
              {block.enabled && (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {block.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        backgroundColor: item.enabled ? '#ffffff' : '#f8f9fa',
                        border: '1px solid #e8eaed',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggleItem(block.id, idx)}
                          style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: item.enabled ? '#202124' : '#80868b',
                              textDecoration: item.enabled ? 'none' : 'line-through'
                            }}
                          >
                            {item.name}
                          </span>
                          <span style={{ fontSize: '0.66rem', color: '#5f6368' }}>
                            {item.target}
                          </span>
                        </div>
                      </div>

                      {/* Inline Dose Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          value={item.dose}
                          disabled={!item.enabled}
                          onChange={(e) => handleDoseChange(block.id, idx, e.target.value)}
                          style={{
                            width: '84px',
                            padding: '4px 6px',
                            fontSize: '0.74rem',
                            fontWeight: 650,
                            textAlign: 'right',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            backgroundColor: item.enabled ? '#ffffff' : '#f1f3f4',
                            color: '#202124'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Pharmacy Special Directives */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#3c4043' }}>
              Special Directives for Compounding Pharmacist:
            </label>
            <textarea
              rows={2}
              value={pharmacyNotes}
              onChange={(e) => setPharmacyNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '0.74rem',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                color: '#202124',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Supply Duration Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #dadce0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#5f6368" />
              <span style={{ fontSize: '0.76rem', fontWeight: 650, color: '#202124' }}>
                Treatment Supply Duration:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSupplyDays(days)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 650,
                    borderRadius: '4px',
                    border: supplyDays === days ? '1px solid #1a73e8' : '1px solid #dadce0',
                    backgroundColor: supplyDays === days ? '#e8f0fe' : '#ffffff',
                    color: supplyDays === days ? '#1a73e8' : '#3c4043',
                    cursor: 'pointer'
                  }}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {submitError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fce8e6', borderRadius: '4px', border: '1px solid #fad2cf', color: '#c5221f', fontSize: '0.74rem' }}>
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #dadce0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#202124' }}>
              {totalActiveCapsulesPerDay} Capsules / Day · {totalActiveCapsulesPerDay * supplyDays} Total Units
            </span>
            <span style={{ fontSize: '0.68rem', color: '#5f6368' }}>
              Ph. Eur. Compounded Standard · 48–72h Batch Release
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                backgroundColor: '#ffffff',
                color: '#3c4043',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || totalActiveCapsulesPerDay === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '4px',
                border: '1px solid #1557b0',
                backgroundColor: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: (isSubmitting || totalActiveCapsulesPerDay === 0) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || totalActiveCapsulesPerDay === 0) ? 0.7 : 1,
                boxShadow: '0 1px 2px rgba(60,64,67,0.2)'
              }}
            >
              {isSubmitting ? (
                <span>Issuing Prescription...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>Sign &amp; Issue Prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
