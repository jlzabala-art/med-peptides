"use client";

import React, { useState } from 'react';
import {
  FileText,
  X,
  Send,
  CheckCircle2,
  Building2,
  Stethoscope,
  Beaker,
  Mail,
  Phone
} from 'lucide-react';
import { serverCreateAtlasQuotationRequest } from '../../../actions/supplierRfqActions';
import { resolveDoctorProfile } from '../../../services/doctorDirectoryService';
import { toast } from 'react-hot-toast';

export default function RequestAtlasQuotationModal({ rx, isOpen, onClose, onSuccess }) {
  const initialDoctor = rx?.treatingDoctor || rx?.doctor || {};
  const initialName = initialDoctor.name || rx?.doctorName || '';
  const resolvedInitial = initialName ? resolveDoctorProfile(initialName) : null;

  const [requesterName, setRequesterName] = useState(resolvedInitial?.name || initialName || '');
  const [requesterEmail, setRequesterEmail] = useState(initialDoctor.email || resolvedInitial?.email || '');
  const [requesterPhone, setRequesterPhone] = useState(initialDoctor.phone || initialDoctor.mobile || resolvedInitial?.phone || resolvedInitial?.mobile || '');
  const [notes, setNotes] = useState('Please provide compounding quotation.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReq, setSubmittedReq] = useState(null);

  const handleRequesterNameChange = (nameVal) => {
    setRequesterName(nameVal);
    const resolved = resolveDoctorProfile(nameVal);
    if (resolved) {
      if (!requesterEmail && resolved.email) setRequesterEmail(resolved.email);
      if (!requesterPhone && (resolved.phone || resolved.mobile)) setRequesterPhone(resolved.phone || resolved.mobile);
    }
  };

  if (!isOpen || !rx) return null;

  const code = rx.prescriptionCode || rx.fagronDetails?.boxId || rx.id;
  const patient = rx.patient?.name || rx.patientName || 'Patient';
  const formulations = rx.formulationBlocks || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await serverCreateAtlasQuotationRequest({
        rxId: rx.id || code,
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail.trim(),
        requesterPhone: requesterPhone.trim(),
        notes: notes.trim()
      });

      if (res.success) {
        setSubmittedReq(res);
        toast.success(`Quotation request sent to Atlas: ${res.quoteRequestId}`);
        if (onSuccess) onSuccess(res);
      } else {
        toast.error(res.error || 'Failed to submit quotation request');
      }
    } catch (err) {
      toast.error('Error submitting request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #dadce0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e8eaed',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#1a73e8" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#202124', margin: 0 }}>
              Request to Atlas quotation
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {!submittedReq ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Prescription Context Banner */}
              <div style={{
                backgroundColor: '#e8f0fe',
                borderRadius: '8px',
                padding: '12px 16px',
                border: '1px solid #d2e3fc',
                fontSize: '0.84rem',
                color: '#1a73e8'
              }}>
                <div style={{ fontWeight: 700 }}>Prescription: {code}</div>
                <div style={{ color: '#3c4043', marginTop: '2px' }}>Patient: {patient}</div>
                {formulations.length > 0 ? (
                  <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#5f6368' }}>
                    Formula: {formulations.map(f => {
                      if (typeof f === 'string') return f;
                      const vName = typeof f.vehicle === 'object' && f.vehicle !== null ? (f.vehicle.name || f.vehicle.title) : f.vehicle;
                      return f.title || f.name || vName || 'Compounded Formulation';
                    }).filter(Boolean).join(' + ')}
                  </div>
                ) : (
                  (rx.formula || rx.medicationName || rx.title) && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#5f6368' }}>
                      Formula: {rx.formula || rx.medicationName || rx.title}
                    </div>
                  )
                )}
              </div>

              {/* Requester Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Doctor / Clinic Requester Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sezgin Cagatay / Hortman Clinics"
                  value={requesterName}
                  onChange={(e) => handleRequesterNameChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.86rem',
                    color: '#202124',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Contact Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="doctor@clinic.com"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dadce0',
                      fontSize: '0.86rem',
                      color: '#202124',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+971 4 395 5599"
                    value={requesterPhone}
                    onChange={(e) => setRequesterPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dadce0',
                      fontSize: '0.86rem',
                      color: '#202124',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                  Quotation Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.84rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.74rem', color: '#5f6368', lineHeight: 1.4 }}>
                ℹ️ Atlas Health Services will evaluate your formulation specifications and coordinate compounding pricing with authorized certified compounding laboratories.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    backgroundColor: '#ffffff',
                    color: '#3c4043',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={15} />
                  {isSubmitting ? 'Submitting…' : 'Submit Request to Atlas'}
                </button>
              </div>
            </form>
          ) : (
            /* Success confirmation */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: '#e6f4ea',
                color: '#1e8e3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#202124' }}>
                  Quotation Request Sent to Atlas
                </h4>
                <div style={{ fontSize: '0.82rem', color: '#1a73e8', fontFamily: 'monospace', fontWeight: 700 }}>
                  {submittedReq.quoteRequestId}
                </div>
                <p style={{ fontSize: '0.84rem', color: '#5f6368', marginTop: '8px', lineHeight: 1.45 }}>
                  Your request for prescription <strong>{code}</strong> has been received by Atlas Health Services. Our clinical team will process the compounding quotation.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
