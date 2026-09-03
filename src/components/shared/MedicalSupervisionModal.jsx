"use client";
import React, { useState } from 'react';
import { X, ShieldCheck, Stethoscope, CheckCircle, ArrowRight } from '@/lib/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function MedicalSupervisionModal({ isOpen, onClose, itemName, itemType = 'protocol' }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !fullName) {
      setErrorMsg('Please provide your name and email address.');
      return;
    }
    setErrorMsg('');
    setStatus('submitting');

    try {
      if (db) {
        await addDoc(collection(db, 'doctor_leads'), {
          fullName,
          email,
          phone,
          cityCountry,
          notes,
          sourceItemName: itemName || 'General Consultation',
          sourceItemType: itemType,
          status: 'new',
          assignedDoctorId: null,
          assignedClinicId: null,
          createdAt: serverTimestamp()
        });
      }

      setStatus('success');
    } catch (err) {
      console.error('[DoctorLead] Error submitting lead:', err);
      setStatus('error');
      setErrorMsg('Could not submit your request. Please try again or contact support.');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 14, 28, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted, #64748b)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: 56, height: 56,
              background: 'rgba(34, 197, 94, 0.12)',
              borderRadius: '50%',
              color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
              Request Received
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Your inquiry regarding <strong>{itemName}</strong> has been routed to our clinical coordination network. An affiliated physician will contact you within 24–48 hours.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '999px',
                background: 'var(--primary, #003666)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 54, 102, 0.15)'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                background: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Stethoscope size={12} /> CLINICAL NETWORK
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Request Medical Supervision
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.45 }}>
              Connect with a licensed clinician specialized in peptide therapy for {itemName ? <strong>{itemName}</strong> : 'your protocol'}.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Carlos Mendez / Jane Doe"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border, #cbd5e1)',
                    background: 'var(--background)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border, #cbd5e1)',
                      background: 'var(--background)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border, #cbd5e1)',
                      background: 'var(--background)',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  City & Country
                </label>
                <input
                  type="text"
                  value={cityCountry}
                  onChange={e => setCityCountry(e.target.value)}
                  placeholder="e.g. Madrid, Spain / Miami, USA"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border, #cbd5e1)',
                    background: 'var(--background)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Clinical Goals / Questions
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Briefly describe your objectives or questions for the doctor..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border, #cbd5e1)',
                    background: 'var(--background)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.8rem' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '999px',
                  background: 'var(--primary, #003666)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0, 54, 102, 0.15)',
                  transition: 'all 0.2s'
                }}
              >
                {status === 'submitting' ? 'Submitting...' : 'Connect with Doctor →'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                <ShieldCheck size={13} color="#16a34a" />
                <span>Strict HIPAA / GDPR data privacy. No commitment required.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
