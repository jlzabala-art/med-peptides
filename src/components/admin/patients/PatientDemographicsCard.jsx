"use client";

import React, { useState } from 'react';
import InlineEditableCell from '../../ui/InlineEditableCell';
import CopyableId from '../../ui/CopyableId';
import { 
  User, Mail, Phone, Calendar, MapPin, Shield, Activity, 
  AlertTriangle, FileText, Check, MessageCircle, ExternalLink,
  Stethoscope, Building2
} from '@/lib/icons';
import notifier from '../../../services/NotificationService';
import { patientRepository } from '../../../repositories/patientRepository';

export default function PatientDemographicsCard({
  patient,
  onPatientUpdated,
  onOpenReassignDoctor,
}) {
  const [updatingField, setUpdatingField] = useState(null);

  if (!patient) return null;

  const handleFieldSave = async (fieldKey, newValue) => {
    setUpdatingField(fieldKey);
    try {
      const updatePayload = { [fieldKey]: newValue };
      
      // If updating name, also sync firstName/lastName
      if (fieldKey === 'name' && typeof newValue === 'string') {
        const parts = newValue.trim().split(/\s+/);
        updatePayload.firstName = parts[0] || '';
        updatePayload.lastName = parts.slice(1).join(' ') || '';
      }

      await patientRepository.updatePatient(patient.id, updatePayload);
      
      if (onPatientUpdated) {
        onPatientUpdated({ ...patient, ...updatePayload });
      }
      notifier.success(`Updated ${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}`);
    } catch (err) {
      console.error(`Failed to update ${fieldKey}:`, err);
      notifier.error(`Failed to update ${fieldKey}`);
      throw err;
    } finally {
      setUpdatingField(null);
    }
  };

  const cleanPhone = patient.phone ? String(patient.phone).replace(/[^0-9]/g, '') : '';
  const hasPhone = Boolean(patient.phone && patient.phone !== '-');
  const hasEmail = Boolean(patient.email && patient.email !== '-');

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid var(--border, #e2e8f0)',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            color: '#003666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <User size={18} />
          </div>
          <div>
            <h3 style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: 'var(--text-main, #0f172a)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Demographics & Identity
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Click any field to edit directly in place
            </span>
          </div>
        </div>

        {onOpenReassignDoctor && (
          <button
            type="button"
            onClick={onOpenReassignDoctor}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Reassign to another physician or clinical center"
          >
            <Stethoscope size={13} /> Reassign Doctor
          </button>
        )}
      </div>

      {/* Structured 2-Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {/* Full Name */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <User size={12} color="#64748b" /> Full Name
          </span>
          <InlineEditableCell
            value={patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()}
            placeholder="Click to add full name..."
            type="text"
            onSave={(val) => handleFieldSave('name', val)}
          />
        </div>

        {/* Gender */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Gender
          </span>
          <InlineEditableCell
            value={patient.gender || ''}
            placeholder="Select gender..."
            type="select"
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
            onSave={(val) => handleFieldSave('gender', val)}
          />
        </div>

        {/* Email */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Mail size={12} color="#64748b" /> Email Address
            </span>
            {hasEmail && (
              <a
                href={`mailto:${patient.email}`}
                style={{ fontSize: '0.70rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                title="Send email"
              >
                Send ✉️
              </a>
            )}
          </div>
          <InlineEditableCell
            value={patient.email && patient.email !== '-' ? patient.email : ''}
            placeholder="Click to add email..."
            type="email"
            onSave={(val) => handleFieldSave('email', val)}
          />
        </div>

        {/* Phone */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Phone size={12} color="#64748b" /> Phone Number
            </span>
            {hasPhone && cleanPhone && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href={`tel:${patient.phone}`}
                  style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}
                  title="Direct phone call"
                >
                  Call 📞
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.70rem', color: '#15803d', fontWeight: 600, textDecoration: 'none' }}
                  title="WhatsApp"
                >
                  WhatsApp 💬
                </a>
              </div>
            )}
          </div>
          <InlineEditableCell
            value={patient.phone && patient.phone !== '-' ? patient.phone : ''}
            placeholder="Click to add phone..."
            type="tel"
            onSave={(val) => handleFieldSave('phone', val)}
          />
        </div>

        {/* Age / Date of Birth */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Calendar size={12} color="#64748b" /> Age
          </span>
          <InlineEditableCell
            value={patient.age && patient.age !== '-' ? String(patient.age) : ''}
            placeholder="Click to set age..."
            type="text"
            onSave={(val) => handleFieldSave('age', val)}
          />
        </div>

        {/* National ID / Emirates ID */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Shield size={12} color="#64748b" /> Emirates / National ID
            </span>
            {patient.nationalId && <CopyableId value={patient.nationalId} iconOnly={true} />}
          </div>
          <InlineEditableCell
            value={patient.nationalId || ''}
            placeholder="Click to add Emirates ID..."
            type="text"
            onSave={(val) => handleFieldSave('nationalId', val)}
          />
        </div>

        {/* Country / City */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <MapPin size={12} color="#64748b" /> Country / Territory
          </span>
          <InlineEditableCell
            value={patient.country || ''}
            placeholder="Click to add country or city..."
            type="text"
            onSave={(val) => handleFieldSave('country', val)}
          />
        </div>

        {/* Residential Address */}
        <div className="demographics-field" style={{
          backgroundColor: '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            Street Address
          </span>
          <InlineEditableCell
            value={patient.address || ''}
            placeholder="Click to add street address..."
            type="text"
            onSave={(val) => handleFieldSave('address', val)}
          />
        </div>
      </div>

      {/* Clinical Notes & Health Focus Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '0.75rem'
      }}>
        {/* Primary Goal */}
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#15803d',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Activity size={12} color="#16a34a" /> Primary Health Goal
          </span>
          <InlineEditableCell
            value={patient.primaryGoal || (Array.isArray(patient.healthGoals) ? patient.healthGoals.join(', ') : '')}
            placeholder="e.g. Longevity, Hair Restoration, Metabolic Wellness"
            type="text"
            onSave={(val) => handleFieldSave('primaryGoal', val)}
          />
        </div>

        {/* Allergies & Intolerances */}
        <div style={{
          backgroundColor: patient.allergies ? '#fef2f2' : '#f8fafc',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          border: `1px solid ${patient.allergies ? '#fecaca' : '#e2e8f0'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: patient.allergies ? '#dc2626' : '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <AlertTriangle size={12} color={patient.allergies ? '#dc2626' : '#64748b'} /> Allergies & Intolerances
          </span>
          <InlineEditableCell
            value={Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || '')}
            placeholder="None logged (Click to add allergies)..."
            type="text"
            onSave={(val) => handleFieldSave('allergies', val)}
          />
        </div>
      </div>
    </div>
  );
}
