import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import User from "lucide-react/dist/esm/icons/user";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import ShieldPlus from "lucide-react/dist/esm/icons/shield-plus";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Check from "lucide-react/dist/esm/icons/check";
import React, { useState, useEffect } from 'react';









import { Card } from '../../ui';

const STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Contact', icon: MapPin },
  { id: 3, title: 'Assignment', icon: Building2 },
  { id: 4, title: 'Program', icon: ShieldPlus },
];

export default function PatientOnboardingWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPatient, setNewPatient] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isQuickMode, setIsQuickMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '', dob: '', gender: '',
    email: '', phone: '', country: '',
    clinicId: '', physicianId: '', managerId: '',
    program: ''
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (isQuickMode && step === 1) {
      handleSubmit();
    } else {
      setStep(s => Math.min(s + 1, STEPS.length));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 600));
      const pData = {
        id: `pat_${Math.floor(Math.random()*1000)}`,
        ...formData,
        status: 'New',
        lastActivity: new Date().toISOString().split('T')[0],
        revenue: 0,
        riskScore: 'Pending',
        clinic: formData.clinicId || 'Unassigned Clinic',
        physician: formData.physicianId || 'Unassigned Physician',
      };
      setNewPatient(pData);
      setSuccess(true);
      if (onComplete) onComplete(pData);
    } catch (e) {
      alert('Error creating patient');
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
            <p style={{ color: 'var(--text-muted)' }}>{newPatient.name} has been added to the system.</p>
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
          <span style={{ fontWeight: 600 }}>Create Patient</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={isQuickMode} onChange={e => setIsQuickMode(e.target.checked)} />
            Quick Add Mode
          </label>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.5rem 1rem' : '2.5rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Stepper */}
          {!isQuickMode && (
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
          )}

          {/* Step 1: Identity */}
          {(step === 1 || isQuickMode) && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>Identity {isQuickMode && '& Contact'}</h2>
              <div>
                <label className="gcp-label">Full Name *</label>
                <input type="text" className="gcp-input" value={formData.name} onChange={e => updateForm('name', e.target.value)} placeholder="Jane Doe" autoFocus />
              </div>
              {isQuickMode && (
                <div>
                  <label className="gcp-label">Email *</label>
                  <input type="email" className="gcp-input" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="jane@example.com" />
                </div>
              )}

              {!isQuickMode && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="gcp-label">Date of Birth</label>
                    <input type="date" className="gcp-input" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} />
                  </div>
                  <div>
                    <label className="gcp-label">Gender</label>
                    <select className="gcp-input" value={formData.gender} onChange={e => updateForm('gender', e.target.value)}>
                      <option value="">Select...</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && !isQuickMode && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Contact Details</h2>
              <div>
                <label className="gcp-label">Email Address *</label>
                <input type="email" className="gcp-input" value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="jane@example.com" autoFocus />
              </div>
              <div>
                <label className="gcp-label">Phone Number</label>
                <input type="tel" className="gcp-input" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+1 555-0100" />
              </div>
              <div>
                <label className="gcp-label">Country</label>
                <select className="gcp-input" value={formData.country} onChange={e => updateForm('country', e.target.value)}>
                  <option value="">Select country...</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Spain">Spain</option>
                  <option value="UAE">UAE</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Assignment */}
          {step === 3 && !isQuickMode && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Relationship Assignment</h2>
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
            </div>
          )}

          {/* Step 4: Program */}
          {step === 4 && !isQuickMode && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Initial Program</h2>
              <div>
                <label className="gcp-label">Assign Longevity Program</label>
                <select className="gcp-input" value={formData.program} onChange={e => updateForm('program', e.target.value)}>
                  <option value="">No Program Yet</option>
                  <option value="Metabolic Optimization">Metabolic Optimization</option>
                  <option value="Hormone Therapy">Hormone Therapy</option>
                  <option value="Peptide Protocol Baseline">Peptide Protocol Baseline</option>
                </select>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Stethoscope size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#0369a1', fontSize: '0.85rem' }}>Automated Assessment</div>
                  <div style={{ fontSize: '0.8rem', color: '#0c4a6e', marginTop: '0.25rem' }}>
                    Assigning a program will automatically trigger an intake assessment email to the patient.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-text" onClick={onClose} style={{ color: 'var(--text-muted)' }}>Cancel</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {step > 1 && !isQuickMode && (
            <button className="gcp-btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < STEPS.length && !isQuickMode ? (
            <button className="gcp-btn-primary" onClick={handleNext}>Next Step</button>
          ) : (
            <button className="gcp-btn-primary" onClick={handleSubmit} disabled={loading || !formData.name}>
              {loading ? 'Creating...' : 'Create Patient'}
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