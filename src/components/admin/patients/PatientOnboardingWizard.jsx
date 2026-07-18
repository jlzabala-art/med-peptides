"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui';
import { X, CheckCircle, User, MapPin, Building2, Stethoscope, ShieldPlus, ChevronRight, Check, Search, AlertCircle } from '@/lib/icons';
import { createPatient } from '../../../services/patientLinkService';

const STEPS = [
  { id: 1, title: 'Patient Info & Zoho Check', icon: Search },
  { id: 2, title: 'Assignment', icon: Building2 },
];

const ZOHO_SEARCH_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/searchZohoContact';
const ZOHO_CREATE_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/createZohoEntity';

export default function PatientOnboardingWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPatient, setNewPatient] = useState(null);
  const [isMobile, setIsMobile] = useState(false); 
  
  // Step 1 states
  const [zohoCheckStatus, setZohoCheckStatus] = useState('idle'); // idle, loading, found, not_found, error
  const [zohoContacts, setZohoContacts] = useState([]);
  const [selectedZohoContact, setSelectedZohoContact] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    clinicId: '',
    physicianId: '',
    program: ''
  });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleLookupZoho = async () => {
    if (!formData.email && !formData.firstName && !formData.lastName && !formData.phone) {
      alert("Please enter at least an email, name, or phone number to check Zoho.");
      return;
    }
    setZohoCheckStatus('loading');
    setZohoContacts([]);
    setSelectedZohoContact(null);
    try {
      const res = await fetch(ZOHO_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email.trim(),
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone.trim()
        })
      });
      const data = await res.json();
      if (data.found && data.contacts && data.contacts.length > 0) {
        setZohoContacts(data.contacts);
        setZohoCheckStatus('found');
        if (data.alreadyRegistered) {
          alert("Warning: A similar patient is already registered in the App.");
        }
      } else {
        setZohoCheckStatus('not_found');
      }
    } catch (err) {
      console.error(err);
      setZohoCheckStatus('error');
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        alert("First Name, Last Name, and Email are required.");
        return;
      }
      if (zohoCheckStatus === 'idle') {
        handleLookupZoho();
        return;
      }
    }
    setStep(s => Math.min(s + 1, STEPS.length));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let zohoContactId = null;
      let fullName = `${formData.firstName} ${formData.lastName}`.trim();

      if (selectedZohoContact) {
        zohoContactId = selectedZohoContact.contact_id;
        // User requested: Zoho name always prevails over the app name when linking.
        fullName = selectedZohoContact.name || fullName;
      } else {
        // Create in Zoho first
        const createRes = await fetch(ZOHO_CREATE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact',
            payload: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email.trim(),
              phone: formData.phone
            }
          })
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error("Failed to create in Zoho Books");
        zohoContactId = createData.entity_id;
      }

      // Create in Firebase
      const { id, linkedUserId } = await createPatient({
        name: fullName,
        email: formData.email.trim(),
        phone: formData.phone,
        country: formData.country,
        clinic: formData.clinicId || '',
        physician: formData.physicianId || '',
        program: formData.program || '',
        zohoContactId,
        revenue: 0,
        lastActivity: new Date().toISOString().split('T')[0],
      });
      
      const pData = {
        id,
        name: fullName,
        email: formData.email.trim(),
        linkedUserId,
        status: 'New',
        lastActivity: new Date().toISOString().split('T')[0],
        revenue: 0,
        riskScore: 'Pending',
        clinic: formData.clinicId || 'Unassigned Clinic',
        physician: formData.physicianId || 'Unassigned Physician',
        zohoContactId
      };
      
      setNewPatient(pData);
      setSuccess(true);
      if (onComplete) onComplete(pData);
    } catch (e) {
      alert('Error creating patient: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success && newPatient) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
        <Card style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={40} color="var(--color-success)" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Patient Created</h2>
            <p style={{ color: 'var(--text-muted)' }}>{newPatient.name} has been added to the system and linked to Zoho.</p>
          </div>
          <button className="gcp-btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            Go to Profile
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-surface)' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ fontWeight: 600 }}>Create Patient (Zoho Linked)</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.5rem 1rem' : '2.5rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '14px', left: 0, width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 0, transition: 'width 0.3s ease' }}></div>
            {STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: isCompleted || isCurrent ? 'var(--primary)' : 'var(--background)', border: `2px solid ${isCompleted || isCurrent ? 'var(--primary)' : 'var(--border)'}`, color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <s.icon size={14} />}
                  </div>
                  {!isMobile && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{s.title}</span>}
                </div>
              );
            })}
          </div>

          {/* Step 1: Patient Info & Zoho Lookup */}
          {step === 1 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>Patient Details & Master Data Check</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="gcp-label">First Name *</label>
                  <input type="text" className="gcp-input" value={formData.firstName} onChange={e => { updateForm('firstName', e.target.value); setZohoCheckStatus('idle'); }} placeholder="Jane" />
                </div>
                <div>
                  <label className="gcp-label">Last Name *</label>
                  <input type="text" className="gcp-input" value={formData.lastName} onChange={e => { updateForm('lastName', e.target.value); setZohoCheckStatus('idle'); }} placeholder="Doe" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="gcp-label">Patient Email *</label>
                  <input type="email" className="gcp-input" value={formData.email} onChange={e => { updateForm('email', e.target.value); setZohoCheckStatus('idle'); }} placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="gcp-label">Phone</label>
                  <input type="text" className="gcp-input" value={formData.phone} onChange={e => { updateForm('phone', e.target.value); setZohoCheckStatus('idle'); }} placeholder="+1 555-0100" />
                </div>
              </div>

              <button className="gcp-btn-secondary" onClick={handleLookupZoho} disabled={zohoCheckStatus === 'loading' || (!formData.email && !formData.firstName && !formData.lastName)}>
                {zohoCheckStatus === 'loading' ? 'Checking...' : 'Check if Patient Exists in Zoho'}
              </button>

              {zohoCheckStatus === 'found' && zohoContacts.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Found {zohoContacts.length} matching contact(s) in Zoho:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {zohoContacts.map(contact => (
                      <div 
                        key={contact.contact_id}
                        onClick={() => setSelectedZohoContact(contact)}
                        style={{ 
                          padding: '1rem', 
                          backgroundColor: selectedZohoContact?.contact_id === contact.contact_id ? 'rgba(26,115,232,0.05)' : 'var(--background)', 
                          borderRadius: '8px', 
                          border: `1px solid ${selectedZohoContact?.contact_id === contact.contact_id ? 'var(--primary)' : 'var(--border)'}`, 
                          display: 'flex', 
                          gap: '1rem', 
                          alignItems: 'flex-start',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{contact.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            <strong>Email:</strong> {contact.email || 'N/A'} | <strong>Phone:</strong> {contact.phone || 'N/A'}
                          </div>
                        </div>
                        {selectedZohoContact?.contact_id === contact.contact_id && (
                          <CheckCircle size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                    
                    <div 
                      onClick={() => setSelectedZohoContact(null)}
                      style={{ 
                        padding: '0.8rem', 
                        backgroundColor: selectedZohoContact === null ? 'rgba(26,115,232,0.05)' : 'transparent', 
                        borderRadius: '8px', 
                        border: `1px solid ${selectedZohoContact === null ? 'var(--primary)' : 'transparent'}`, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: selectedZohoContact === null ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      None of these match (Create New in Zoho)
                    </div>
                  </div>
                </div>
              )}

              {zohoCheckStatus === 'not_found' && (
                <div className="fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <AlertCircle size={16} /> No matching contacts found in Zoho. We will create a new contact.
                  </div>
                </div>
              )}
              
              {zohoCheckStatus === 'error' && (
                <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>Error connecting to Zoho. Please try again.</div>
              )}
            </div>
          )}

          {/* Step 2: Assignment */}
          {step === 2 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Assignment & Programs</h2>
              <div>
                <label className="gcp-label">Assign Clinic</label>
                <select className="gcp-input" value={formData.clinicId} onChange={e => updateForm('clinicId', e.target.value)}>
                  <option value="">Search clinics...</option>
                  <option value="Atlas Longevity Center">Atlas Longevity Center</option>
                  <option value="Peak Performance Med">Peak Performance Med</option>
                </select>
              </div>
              <div>
                <label className="gcp-label">Assign Primary Physician</label>
                <select className="gcp-input" value={formData.physicianId} onChange={e => updateForm('physicianId', e.target.value)}>
                  <option value="">Search physicians...</option>
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins</option>
                  <option value="Dr. Robert Silva">Dr. Robert Silva</option>
                </select>
              </div>
              <div>
                <label className="gcp-label">Assign Longevity Program</label>
                <select className="gcp-input" value={formData.program} onChange={e => updateForm('program', e.target.value)}>
                  <option value="">No Program Yet</option>
                  <option value="Metabolic Optimization">Metabolic Optimization</option>
                  <option value="Hormone Therapy">Hormone Therapy</option>
                  <option value="Peptide Protocol Baseline">Peptide Protocol Baseline</option>
                </select>
              </div>
              <div>
                <label className="gcp-label">Country</label>
                <input type="text" className="gcp-input" value={formData.country} onChange={e => updateForm('country', e.target.value)} placeholder="United States" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-text" onClick={onClose} style={{ color: 'var(--text-muted)' }}>Cancel</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {step > 1 && (
            <button className="gcp-btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < STEPS.length ? (
            <button className="gcp-btn-primary" onClick={handleNext} disabled={zohoCheckStatus === 'loading'}>
              Next Step
            </button>
          ) : (
            <button className="gcp-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : (selectedZohoContact ? 'Link & Create' : 'Create in Zoho & Firebase')}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}