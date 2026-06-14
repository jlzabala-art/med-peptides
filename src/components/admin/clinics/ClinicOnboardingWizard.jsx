import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Check from "lucide-react/dist/esm/icons/check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Save from "lucide-react/dist/esm/icons/save";
import React, { useState, useEffect } from 'react';












import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Card } from '../../ui';
import DraftBanner from '../../ui/DraftBanner';
import notifier from '../../../services/NotificationService';

const STEPS = [
  { id: 1, title: 'Identity', icon: Building2 },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Business Info', icon: Briefcase },
  { id: 4, title: 'Management', icon: Users },
];

const CLINIC_TYPES = [
  'Longevity Clinic', 'Functional Medicine', 'Medical Center', 
  'Anti-Aging Clinic', 'Aesthetic Clinic', 'Pharmacy', 
  'Wellness Center', 'Hospital'
];

export default function ClinicOnboardingWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newClinic, setNewClinic] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    name: '', legalName: '', type: '', tier: 'Bronze',
    country: '', city: '', territory: '', address: '',
    taxId: '', licenseNumber: '', website: '', email: '', phone: '',
    accountManager: '', salesRep: '', region: ''
  });

  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const draft = localStorage.getItem('clinic_onboarding_draft');
    if (draft) {
      try {
        setPendingDraft(JSON.parse(draft));
      } catch (e) {}
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResumeDraft = () => {
    if (pendingDraft) {
      setFormData(pendingDraft);
      setPendingDraft(null);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('clinic_onboarding_draft');
    setPendingDraft(null);
  };

  useEffect(() => {
    if (!success) {
      localStorage.setItem('clinic_onboarding_draft', JSON.stringify(formData));
      setLastSaved(new Date());
    }
  }, [formData, success]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Required";
      if (!formData.type) newErrors.type = "Required";
    } else if (currentStep === 2) {
      if (!formData.country) newErrors.country = "Required";
      if (!formData.city.trim()) newErrors.city = "Required";
    } else if (currentStep === 3) {
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email required";
    } else if (currentStep === 4) {
      if (!formData.accountManager) newErrors.accountManager = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, STEPS.length));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const clinicData = {
        ...formData,
        status: 'onboarding',
        createdAt: serverTimestamp(),
        physicians: 0,
        patients: 0,
        monthlyVolume: 0
      };
      const docRef = await addDoc(collection(db, 'clinics'), clinicData);
      setNewClinic({ id: docRef.id, ...clinicData });
      setSuccess(true);
      localStorage.removeItem('clinic_onboarding_draft');
      if (onComplete) onComplete({ id: docRef.id, ...clinicData });
    } catch (e) {
      console.error(e);
      notifier.error('Error creating clinic.');
    } finally {
      setLoading(false);
    }
  };

  if (success && newClinic) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', position: 'absolute', inset: 0, zIndex: 50 }}>
        <Card style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={40} color="var(--color-success)" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Clinic Created Successfully</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {newClinic.name} has been added. You can now add physicians and start placing orders.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <button className="gcp-btn-primary" style={{ justifyContent: 'center' }} onClick={onClose}>
              Go to Clinic Profile
            </button>
            <button className="btn btn-text" style={{ justifyContent: 'center', color: 'var(--primary)' }} onClick={() => {
              setSuccess(false);
              setStep(1);
              setFormData({
                name: '', legalName: '', type: '', tier: 'Bronze', country: '', city: '', territory: '', address: '',
                taxId: '', licenseNumber: '', website: '', email: '', phone: '', accountManager: '', salesRep: '', region: ''
              });
            }}>
              Add Another Clinic
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-surface)' }}>
      {/* Top Nav */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            Add New Clinic
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Save size={14} /> {lastSaved ? 'Draft Auto-saved' : 'Not saved'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.5rem 1rem' : '2rem' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {pendingDraft && (
              <DraftBanner 
                title="Resume previous unsaved draft?"
                onResume={handleResumeDraft}
                onDiscard={handleDiscardDraft}
              />
            )}

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {step === 1 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Clinic Identity</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Clinic Name *</label>
                      <input type="text" className={`gcp-input ${errors.name ? 'error' : ''}`} value={formData.name} onChange={e => updateForm('name', e.target.value)} placeholder="Atlas Longevity Center" />
                    </div>
                    <div>
                      <label className="gcp-label">Legal Name</label>
                      <input type="text" className="gcp-input" value={formData.legalName} onChange={e => updateForm('legalName', e.target.value)} placeholder="Atlas Healthcare LLC" />
                    </div>
                    <div>
                      <label className="gcp-label">Clinic Type *</label>
                      <select className={`gcp-input ${errors.type ? 'error' : ''}`} value={formData.type} onChange={e => updateForm('type', e.target.value)}>
                        <option value="">Select type...</option>
                        {CLINIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Location</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Country *</label>
                      <select className={`gcp-input ${errors.country ? 'error' : ''}`} value={formData.country} onChange={e => updateForm('country', e.target.value)}>
                        <option value="">Select country...</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="UAE">UAE</option>
                        <option value="Spain">Spain</option>
                      </select>
                    </div>
                    <div>
                      <label className="gcp-label">City *</label>
                      <input type="text" className={`gcp-input ${errors.city ? 'error' : ''}`} value={formData.city} onChange={e => updateForm('city', e.target.value)} placeholder="e.g. Dubai" />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="gcp-label">Full Address</label>
                    <input type="text" className="gcp-input" value={formData.address} onChange={e => updateForm('address', e.target.value)} placeholder="123 Wellness Blvd..." />
                  </div>
                  <div>
                    <label className="gcp-label">Territory</label>
                    <input type="text" className="gcp-input" value={formData.territory} onChange={e => updateForm('territory', e.target.value)} placeholder="e.g. NA-West" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Business Information</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Main Email *</label>
                      <input type="email" className={`gcp-input ${errors.email ? 'error' : ''}`} value={formData.email} onChange={e => updateForm('email', e.target.value)} placeholder="contact@clinic.com" />
                    </div>
                    <div>
                      <label className="gcp-label">Main Phone</label>
                      <input type="tel" className="gcp-input" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+1 555..." />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Tax ID</label>
                      <input type="text" className="gcp-input" value={formData.taxId} onChange={e => updateForm('taxId', e.target.value)} />
                    </div>
                    <div>
                      <label className="gcp-label">License Number</label>
                      <input type="text" className="gcp-input" value={formData.licenseNumber} onChange={e => updateForm('licenseNumber', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="gcp-label">Website</label>
                    <input type="url" className="gcp-input" value={formData.website} onChange={e => updateForm('website', e.target.value)} placeholder="https://" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Clinic Management</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Account Manager *</label>
                      <select className={`gcp-input ${errors.accountManager ? 'error' : ''}`} value={formData.accountManager} onChange={e => updateForm('accountManager', e.target.value)}>
                        <option value="">Select AM...</option>
                        <option value="Sarah Jenkins">Sarah Jenkins</option>
                        <option value="Carlos Silva">Carlos Silva</option>
                        <option value="Mike O'Connor">Mike O'Connor</option>
                      </select>
                    </div>
                    <div>
                      <label className="gcp-label">Sales Representative</label>
                      <input type="text" className="gcp-input" value={formData.salesRep} onChange={e => updateForm('salesRep', e.target.value)} placeholder="Search..." />
                    </div>
                  </div>
                  <div>
                    <label className="gcp-label">Region Assignment</label>
                    <input type="text" className="gcp-input" value={formData.region} onChange={e => updateForm('region', e.target.value)} placeholder="e.g. EMEA" />
                  </div>
                </div>
              )}
            </div>
          </div>
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
            <button className="gcp-btn-primary" onClick={handleNext}>Next Step</button>
          ) : (
            <button className="gcp-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Clinic'}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .error { border-color: var(--color-danger) !important; background-color: rgba(239, 68, 68, 0.05); }
      `}</style>
    </div>
  );
}