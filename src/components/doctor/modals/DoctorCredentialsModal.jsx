"use client";

import React, { useState } from 'react';
import {
  User,
  Stethoscope,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  X,
  Loader2,
  Check,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import { COUNTRIES } from '@/data/countries';

export default function DoctorCredentialsModal({
  isOpen,
  onClose,
  doctor,
  slug,
  onDoctorUpdated
}) {
  const [editingDoctorField, setEditingDoctorField] = useState(null);
  const [tempFieldValue, setTempFieldValue] = useState('');
  const [tempDialCode, setTempDialCode] = useState('+971');
  const [isSavingDoctorField, setIsSavingDoctorField] = useState(false);

  if (!isOpen || !doctor) return null;

  const startEditingField = (fieldKey, currentValue) => {
    triggerHaptic('light');
    setEditingDoctorField(fieldKey);
    if (fieldKey === 'mobile') {
      const match = (currentValue || '').match(/^(\+\d{1,4})\s*(.*)$/);
      if (match) {
        setTempDialCode(match[1]);
        setTempFieldValue(match[2]);
      } else {
        setTempDialCode('+971');
        setTempFieldValue(currentValue || '');
      }
    } else {
      setTempFieldValue(currentValue || '');
    }
  };

  const handleSaveField = async (fieldKey) => {
    try {
      setIsSavingDoctorField(true);
      triggerHaptic('medium');

      let finalValue = tempFieldValue.trim();

      if (fieldKey === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(finalValue)) {
          toast.error('Please enter a valid RFC-compliant email address (e.g. doctor@clinic.com)');
          setIsSavingDoctorField(false);
          return;
        }
      }

      if (fieldKey === 'mobile') {
        finalValue = `${tempDialCode} ${tempFieldValue.replace(/[^\d\s-]/g, '').trim()}`.trim();
      }

      const updates = { [fieldKey]: finalValue };
      if (fieldKey === 'mobile') updates.phone = finalValue;
      if (fieldKey === 'name') updates.displayName = finalValue;
      if (fieldKey === 'license') updates.licenseNumber = finalValue;
      if (fieldKey === 'clinic') updates.clinicName = finalValue;

      const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update field');
      }

      if (onDoctorUpdated) {
        onDoctorUpdated(updates, json.doctor || {});
      }

      setEditingDoctorField(null);
      toast.success('Physician details updated successfully ✓');
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      toast.error(err.message || 'Error updating physician credentials');
    } finally {
      setIsSavingDoctorField(false);
    }
  };

  const doctorFields = [
    {
      key: 'name',
      label: 'Physician Name',
      value: doctor.name || '',
      placeholder: 'e.g. Dr. Jane Doe, MD',
      icon: User,
      type: 'text'
    },
    {
      key: 'specialty',
      label: 'Medical Specialty',
      value: doctor.specialty || '',
      placeholder: 'e.g. Anti-Aging & Regenerative Medicine',
      icon: Stethoscope,
      type: 'text'
    },
    {
      key: 'clinic',
      label: 'Practice / Clinic',
      value: doctor.clinic || '',
      placeholder: 'e.g. Lotusland Bio-Regenerative Center',
      icon: MapPin,
      type: 'text'
    },
    {
      key: 'license',
      label: 'Medical License (DHA)',
      value: doctor.license || '',
      placeholder: 'e.g. DHA-P-0089241',
      icon: ShieldCheck,
      type: 'text',
      isMonospace: true
    },
    {
      key: 'mobile',
      label: 'Direct Mobile / WhatsApp',
      value: doctor.mobile || doctor.phone || '',
      placeholder: '50 123 4567',
      icon: Phone,
      type: 'mobile'
    },
    {
      key: 'email',
      label: 'Physician Email',
      value: doctor.email || '',
      placeholder: 'doctor@clinic.com',
      icon: Mail,
      type: 'email'
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(60,64,67,0.22), 0 0 0 1px #dadce0',
          padding: '24px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close credentials dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#5f6368',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Doctor Identity Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingRight: '36px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#1a73e8',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.30rem',
              fontWeight: 600,
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(60,64,67,0.20)',
              position: 'relative'
            }}
          >
            {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#1e8e3e',
                border: '2px solid #ffffff'
              }}
              title="DHA Verified Active Practice"
            />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#202124', margin: 0, letterSpacing: '-0.01em' }}>
                Physician Profile & Credentials
              </h2>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', padding: '1px 7px', borderRadius: '4px' }}>
                DHA Verified
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#5f6368', lineHeight: 1.4 }}>
              DHA-licensed practitioner profile settings and clinical contact parameters.
            </p>
          </div>
        </div>

        {/* GCP Properties Grid with Inline Editing */}
        <div
          style={{
            border: '1px solid #dadce0',
            borderRadius: '6px',
            overflow: 'hidden',
            background: '#ffffff'
          }}
        >
          {doctorFields.map((field, idx) => {
            const FieldIcon = field.icon;
            const isEditing = editingDoctorField === field.key;

            return (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: idx < doctorFields.length - 1 ? '1px solid #f1f3f4' : 'none',
                  background: isEditing ? '#f8fafd' : '#ffffff',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Left: Field Label */}
                <div
                  style={{
                    width: '160px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#5f6368',
                    fontSize: '0.80rem',
                    fontWeight: 600
                  }}
                >
                  <FieldIcon size={14} style={{ color: '#5f6368', flexShrink: 0 }} />
                  <span>{field.label}</span>
                </div>

                {/* Right: Field Value / Inline Editor */}
                <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                      {field.type === 'mobile' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '200px' }}>
                          <select
                            value={tempDialCode}
                            onChange={(e) => setTempDialCode(e.target.value)}
                            disabled={isSavingDoctorField}
                            style={{
                              height: '34px',
                              padding: '0 6px',
                              borderRadius: '4px',
                              border: '1px solid #dadce0',
                              background: '#ffffff',
                              fontSize: '0.80rem',
                              color: '#202124',
                              cursor: 'pointer',
                              maxWidth: '125px'
                            }}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={`${c.code}-${c.dial_code}`} value={c.dial_code}>
                                {c.dial_code} ({c.name})
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={tempFieldValue}
                            onChange={(e) => setTempFieldValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveField('mobile');
                              if (e.key === 'Escape') setEditingDoctorField(null);
                            }}
                            placeholder={field.placeholder}
                            disabled={isSavingDoctorField}
                            autoFocus
                            style={{
                              flex: 1,
                              height: '34px',
                              padding: '0 10px',
                              borderRadius: '4px',
                              border: '1px solid #1a73e8',
                              fontSize: '0.84rem',
                              color: '#202124',
                              outline: 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <input
                          type={field.type === 'email' ? 'email' : 'text'}
                          value={tempFieldValue}
                          onChange={(e) => setTempFieldValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveField(field.key);
                            if (e.key === 'Escape') setEditingDoctorField(null);
                          }}
                          placeholder={field.placeholder}
                          disabled={isSavingDoctorField}
                          autoFocus
                          style={{
                            flex: 1,
                            height: '34px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #1a73e8',
                            fontSize: '0.84rem',
                            color: '#202124',
                            fontFamily: field.isMonospace ? 'monospace' : 'inherit',
                            outline: 'none'
                          }}
                        />
                      )}

                      {/* Explicit Save and Cancel buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleSaveField(field.key)}
                          disabled={isSavingDoctorField}
                          title="Save changes (Enter)"
                          style={{
                            height: '32px',
                            padding: '0 10px',
                            borderRadius: '4px',
                            border: '1px solid #1a73e8',
                            background: '#1a73e8',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: isSavingDoctorField ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSavingDoctorField ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDoctorField(null)}
                          disabled={isSavingDoctorField}
                          title="Cancel (Esc)"
                          style={{
                            height: '32px',
                            padding: '0 8px',
                            borderRadius: '4px',
                            border: '1px solid #dadce0',
                            background: '#ffffff',
                            color: '#5f6368',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={14} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditingField(field.key, field.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        transition: 'background 0.1s ease'
                      }}
                      title="Click to edit"
                    >
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: field.value ? '#202124' : '#9aa0a6',
                          fontWeight: field.value ? 500 : 400,
                          fontFamily: field.isMonospace ? 'monospace' : 'inherit',
                          fontStyle: field.value ? 'normal' : 'italic',
                          wordBreak: 'break-all'
                        }}
                      >
                        {field.value || 'Not configured'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#1a73e8',
                          opacity: 0.6,
                          fontSize: '0.74rem',
                          fontWeight: 500,
                          flexShrink: 0,
                          marginLeft: '8px'
                        }}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid #e8eaed',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#5f6368' }}>
            <CheckCircle2 size={14} style={{ color: '#137333' }} />
            <span>Changes synchronize automatically across prescriptions and doctor portal.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              height: '36px',
              padding: '0 20px',
              borderRadius: '4px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
