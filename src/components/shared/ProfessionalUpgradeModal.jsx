"use client";
import React, { useState } from 'react';
import { X, Building, CheckCircle, ShieldCheck, Upload, FileText } from '@/lib/icons';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function ProfessionalUpgradeModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [clinicName, setClinicName] = useState('');
  const [roleType, setRoleType] = useState('Healthcare Provider'); // Healthcare Provider | Researcher | Compounding Pharmacy | Wholesaler
  const [licenseNumber, setLicenseNumber] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicName || !licenseNumber) {
      setErrorMsg('Please provide your organization name and professional license/registration ID.');
      return;
    }
    setErrorMsg('');
    setStatus('submitting');

    try {
      if (db && user?.uid) {
        // Update user profile status to pending_professional
        await updateDoc(doc(db, 'users', user.uid), {
          pendingRole: roleType,
          organization: clinicName,
          licenseNumber,
          verificationStatus: 'pending_review',
          updatedAt: serverTimestamp()
        });

        // Record verification request
        await addDoc(collection(db, 'user_verifications'), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || clinicName,
          organization: clinicName,
          roleType,
          licenseNumber,
          country,
          website,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }

      setStatus('success');
    } catch (err) {
      console.error('[ProfessionalUpgrade] Error submitting verification:', err);
      setStatus('error');
      setErrorMsg('Could not submit application. Please try again or contact support.');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 14, 28, 0.7)',
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
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
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
            borderRadius: '50%'
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
              Application Submitted
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Your professional credentials have been submitted for priority verification. Our institutional team reviews and approves access within <strong>24 hours</strong>.
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
                cursor: 'pointer'
              }}
            >
              Back to Store
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                background: 'rgba(217, 119, 6, 0.1)',
                color: '#d97706',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Building size={12} /> B2B PROFESSIONAL UPGRADE
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
              Unlock Wholesale &amp; Clinical Access
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.45 }}>
              Gain tier pricing, batch HPLC certificates, ClinicalAI protocol builder, and dedicated cold-chain fulfillment.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Professional Entity Type *
                </label>
                <select
                  value={roleType}
                  onChange={e => setRoleType(e.target.value)}
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
                >
                  <option value="Healthcare Provider">Clinic / Medical Practice</option>
                  <option value="Researcher">Independent Researcher / Laboratory</option>
                  <option value="Compounding Pharmacy">Pharmacy / Compounding Facility</option>
                  <option value="Wholesaler">Distributor / Bulk Buyer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Organization / Clinic Name *
                </label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  placeholder="e.g. Apex Longevity Clinic / Nova BioLabs"
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
                    License / Tax ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="Medical / Research ID"
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
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="e.g. Spain, USA, UAE"
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
                  Institutional Website / Profile (Optional)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://..."
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
                {status === 'submitting' ? 'Submitting Application...' : 'Submit Verification Request →'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
                <ShieldCheck size={13} color="#16a34a" />
                <span>Verified professional access. Zero account downtime.</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
