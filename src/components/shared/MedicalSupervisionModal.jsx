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
      className="msm-backdrop"
      onClick={onClose}
    >
      <div 
        className="msm-sheet"
        onClick={e => e.stopPropagation()}
      >
        <div className="msm-drag-handle" />
        <button
          onClick={onClose}
          className="msm-close-btn"
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
              className="msm-btn-done"
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
                  className="msm-input"
                />
              </div>

              <div className="msm-grid-2col">
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
                    className="msm-input"
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
                    className="msm-input"
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
                  className="msm-input"
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
                  className="msm-input msm-textarea"
                />
              </div>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="msm-btn-submit"
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

      <style jsx>{`
        .msm-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(2, 14, 28, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }
        .msm-sheet {
          background: var(--surface, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 24px;
          max-width: 520px;
          width: 100%;
          padding: 2rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .msm-drag-handle {
          display: none;
        }
        .msm-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted, #64748b);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .msm-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        .msm-input {
          width: 100%;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          border: 1px solid var(--border, #cbd5e1);
          background: var(--background, #f8fafc);
          color: var(--text-main, #0f172a);
          font-size: 0.92rem;
          min-height: 44px;
          outline: none;
          box-sizing: border-box;
        }
        .msm-textarea {
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }
        .msm-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .msm-btn-submit {
          width: 100%;
          min-height: 48px;
          border-radius: 999px;
          background: var(--primary, #003666);
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(0, 54, 102, 0.15);
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .msm-btn-submit:active {
          transform: scale(0.98);
        }
        .msm-btn-done {
          padding: 0.75rem 2rem;
          border-radius: 999px;
          background: var(--primary, #003666);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 54, 102, 0.15);
        }

        @media (max-width: 768px) {
          .msm-backdrop {
            align-items: flex-end;
            padding: 0;
          }
          .msm-sheet {
            border-radius: 24px 24px 0 0;
            max-width: 100%;
            max-height: 88vh;
            padding: 1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
            animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .msm-drag-handle {
            display: block;
            width: 36px;
            height: 4px;
            border-radius: 2px;
            background: #cbd5e1;
            margin: 0 auto 1.25rem auto;
          }
          .msm-grid-2col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
