import X from "lucide-react/dist/esm/icons/x";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import User from "lucide-react/dist/esm/icons/user";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Lock from "lucide-react/dist/esm/icons/lock";
import Upload from "lucide-react/dist/esm/icons/upload";
import Info from "lucide-react/dist/esm/icons/info";
import Check from "lucide-react/dist/esm/icons/check";
import ImageIcon from "lucide-react/dist/esm/icons/image";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Wand2 from "lucide-react/dist/esm/icons/wand-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Copy from "lucide-react/dist/esm/icons/copy";
import Send from "lucide-react/dist/esm/icons/send";
import React, { useState, useEffect, useRef } from 'react';




















import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import { Card } from '../../ui';
import DraftBanner from '../../ui/DraftBanner';
import notifier from '../../../services/NotificationService';

const STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Professional', icon: Stethoscope },
  { id: 3, title: 'Clinic', icon: Briefcase },
  { id: 4, title: 'Permissions', icon: Lock },
];

const SPECIALTIES = [
  'Functional Medicine', 'Longevity', 'Anti-Aging', 'Endocrinology', 
  'Aesthetics', 'Sports Medicine', 'Integrative Medicine', 'General Practice'
];

const PERMISSION_ROLES = {
  basic: { portalAccess: true, catalogAccess: false, prescriptionPermissions: false },
  standard: { portalAccess: true, catalogAccess: true, prescriptionPermissions: false },
  senior: { portalAccess: true, catalogAccess: true, prescriptionPermissions: true }
};

export default function PhysicianOnboardingWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newPhysician, setNewPhysician] = useState(null);
  // Modes
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    specialty: '', licenseNumber: '', yearsExperience: '',
    clinicName: '', website: '', country: '', city: '', address: '',
    portalAccess: true, catalogAccess: true, prescriptionPermissions: true,
    avatarUrl: ''
  });

  const [roleTemplate, setRoleTemplate] = useState('senior');
  const [pasteData, setPasteData] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Validation state per step
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({ email: false, phone: false });
  const [pendingDraft, setPendingDraft] = useState(null);

  // Load Draft on mount
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const draft = localStorage.getItem('physician_onboarding_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setPendingDraft(parsed);
      } catch (e) {}
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResumeDraft = () => {
    if (pendingDraft) {
      setFormData(pendingDraft);
      setLastSaved(new Date());
      setPendingDraft(null);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('physician_onboarding_draft');
    setPendingDraft(null);
  };

  // Save Draft on change
  useEffect(() => {
    if (!success) {
      localStorage.setItem('physician_onboarding_draft', JSON.stringify(formData));
      setLastSaved(new Date());
    }
  }, [formData, success]);

  // Handle Role Template selection
  useEffect(() => {
    setFormData(prev => ({ ...prev, ...PERMISSION_ROLES[roleTemplate] }));
  }, [roleTemplate]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));

    // Real-time validation
    if (key === 'email') {
      const isValid = /^\S+@\S+\.\S+$/.test(value);
      setValidFields(prev => ({ ...prev, email: isValid }));
    }
    if (key === 'phone') {
      const isValid = value.length > 6;
      setValidFields(prev => ({ ...prev, phone: isValid }));
    }
  };

  const handlePasteParse = () => {
    if (!pasteData.trim()) return;
    const lines = pasteData.split('\n').map(l => l.trim()).filter(Boolean);
    const updates = { ...formData };
    // Naive local regex parsing
    lines.forEach(line => {
      if (line.includes('@')) updates.email = line;
      else if (/^\+?[0-9\s\-\(\)]+$/.test(line) && line.length > 7) updates.phone = line;
      else if (line.toLowerCase().includes('dr.') || line.toLowerCase().includes('dr ')) {
        const nameParts = line.replace(/dr\.?\s*/i, '').split(' ');
        updates.firstName = nameParts[0];
        updates.lastName = nameParts.slice(1).join(' ');
      }
      else if (SPECIALTIES.some(s => line.toLowerCase().includes(s.toLowerCase()))) updates.specialty = line;
      else if (line.toLowerCase().includes('clinic') || line.toLowerCase().includes('center')) updates.clinicName = line;
    });

    setFormData(updates);
    setPasteData('');
    if (updates.email) setValidFields(prev => ({ ...prev, email: true }));
    if (updates.phone) setValidFields(prev => ({ ...prev, phone: true }));
  };

  const checkDuplicates = async () => {
    if (!formData.email && !formData.phone) return;
    try {
      let q1, q2;
      const promises = [];
      if (formData.email) promises.push(getDocs(query(collection(db, 'users'), where('email', '==', formData.email))));
      if (formData.phone) promises.push(getDocs(query(collection(db, 'users'), where('phone', '==', formData.phone))));
      const results = await Promise.all(promises);
      const isDuplicate = results.some(snap => !snap.empty);
      if (isDuplicate) {
        setDuplicateWarning('A physician with this email or phone already exists.');
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      console.error('Duplicate check error', e);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      updateForm('avatarUrl', downloadUrl);
    } catch (err) {
      console.error("Error uploading avatar", err);
      notifier.error("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const generateInitials = () => {
    const { firstName, lastName } = formData;
    if (!firstName && !lastName) return 'DR';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "Required";
      if (!formData.lastName.trim()) newErrors.lastName = "Required";
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email required";
    } else if (currentStep === 2 && !isQuickAdd) {
      if (!formData.specialty.trim()) newErrors.specialty = "Required";
    } else if (currentStep === 3 && !isQuickAdd) {
      if (!formData.clinicName.trim()) newErrors.clinicName = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, STEPS.length));
  };

  const handleSubmit = async () => {
    const processSubmit = async () => {
      if (!validateStep(step) && !isQuickAdd) return;

      setLoading(true);
      try {
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          specialty: formData.specialty,
          licenseNumber: formData.licenseNumber,
          yearsExperience: formData.yearsExperience,
          clinicName: formData.clinicName,
          website: formData.website,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          avatarUrl: formData.avatarUrl,
          permissions: {
            portalAccess: formData.portalAccess,
            catalogAccess: formData.catalogAccess,
            prescriptionPermissions: formData.prescriptionPermissions
          },
          role: 'doctor',
          roles: ['doctor'],
          status: 'active',
          createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'users'), userData);
        setNewPhysician({ id: docRef.id, ...userData });
        setSuccess(true);
        localStorage.removeItem('physician_onboarding_draft');
        if (onComplete) onComplete({ id: docRef.id, ...userData });
      } catch (e) {
        console.error(e);
        notifier.error('Error creating physician.');
      } finally {
        setLoading(false);
      }
    };

    if (duplicateWarning) {
      notifier.confirmCritical("A duplicate was detected. Create anyway?", async () => {
        await processSubmit();
      });
    } else {
      await processSubmit();
    }
  };

  // --- Success View ---
  if (success && newPhysician) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
        <Card style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={40} color="var(--color-success)" />
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Physician Created Successfully</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Dr. {newPhysician.lastName} has been added. Send an invitation to grant portal access.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <button className="gcp-btn-primary" style={{ justifyContent: 'center' }} onClick={() => notifier.success('Invite sent!')}>
              <Mail size={16} style={{ marginRight: '0.5rem' }} /> Email Invite
            </button>
            <button className="gcp-btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigator.clipboard.writeText('https://regenpept.com/invite/123')}>
              <Copy size={16} style={{ marginRight: '0.5rem' }} /> Copy Link
            </button>
            <button className="gcp-btn-secondary" style={{ justifyContent: 'center' }} onClick={() => window.open(`https://wa.me/${newPhysician.phone}?text=Welcome`)}>
              <Send size={16} style={{ marginRight: '0.5rem' }} /> WhatsApp
            </button>
            <button className="gcp-btn-secondary" style={{ justifyContent: 'center' }} onClick={onClose}>
              Done
            </button>
          </div>
          <button 
            className="btn btn-text" 
            style={{ width: '100%', justifyContent: 'center', color: 'var(--primary)', marginTop: '0.5rem' }}
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setFormData({
                firstName: '', lastName: '', email: '', phone: '', specialty: '', licenseNumber: '', yearsExperience: '',
                clinicName: '', website: '', country: '', city: '', address: '', portalAccess: true, catalogAccess: true, prescriptionPermissions: true, avatarUrl: ''
              });
            }}
          >
            Add Another Physician
          </button>
        </Card>
      </div>
    );
  }

  // --- Main Form ---
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-surface)', overflow: 'hidden' }}>
      {/* Top Nav */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }}></div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            {isQuickAdd ? 'Quick Add Physician' : 'Full Registration'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={isQuickAdd} onChange={e => setIsQuickAdd(e.target.checked)} /> Quick Add Mode
          </label>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.5rem 1rem' : '2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {pendingDraft && (
              <DraftBanner 
                title="Resume previous unsaved draft?"
                onResume={handleResumeDraft}
                onDiscard={handleDiscardDraft}
              />
            )}

            {/* Stepper (Desktop/Mobile adapted) */}
            {!isQuickAdd && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', top: '14px', left: 0, width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 0, transition: 'width 0.3s ease' }}></div>
                {STEPS.map((s) => {
                  const isCompleted = step > s.id;
                  const isCurrent = step === s.id;
                  if (isMobile && !isCurrent) return null; // Mobile shows only current step in full, or we can show small dots. For now, keep it full width but maybe hide text.
                  return (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        width: '30px', height: '30px', borderRadius: '50%', 
                        backgroundColor: isCompleted || isCurrent ? 'var(--primary)' : 'var(--background)',
                        border: `2px solid ${isCompleted || isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                        color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        {isCompleted ? <Check size={16} strokeWidth={3} /> : <s.icon size={14} />}
                      </div>
                      {!isMobile && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{s.title}</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Paste Assist */}
            {step === 1 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-bg-hover)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <Wand2 size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      placeholder="Paste physician details here (Name, Email, Clinic...) to auto-fill" 
                      value={pasteData}
                      onChange={e => setPasteData(e.target.value)}
                      onBlur={handlePasteParse}
                      style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {duplicateWarning && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={18} /> {duplicateWarning}
              </div>
            )}

            {/* Content Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(step === 1 || isQuickAdd) && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Identity & Contact</h2>
                  {/* Circular Avatar inline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: 70, height: 70, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, overflow: 'hidden' }}>
                      {uploadingAvatar ? <div className="spin"><ImageIcon size={20} /></div> :
                       formData.avatarUrl ? <img src={formData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                       generateInitials()}
                    </div>
                    <div>
                      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                      <button className="gcp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} style={{ marginRight: '0.5rem' }} /> Upload Photo
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">First Name *</label>
                      <input type="text" className={`gcp-input ${errors.firstName ? 'error' : ''}`} value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} placeholder="Jane" />
                    </div>
                    <div>
                      <label className="gcp-label">Last Name *</label>
                      <input type="text" className={`gcp-input ${errors.lastName ? 'error' : ''}`} value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                      <label className="gcp-label">Email Address *</label>
                      <input type="email" className={`gcp-input ${errors.email ? 'error' : ''}`} value={formData.email} onChange={e => updateForm('email', e.target.value)} onBlur={checkDuplicates} placeholder="jane@clinic.com" style={{ paddingRight: '2rem' }} />
                      {validFields.email && <CheckCircle size={16} color="var(--color-success)" style={{ position: 'absolute', right: '10px', top: '34px' }} />}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <label className="gcp-label">Phone Number</label>
                      <input type="tel" className="gcp-input" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} onBlur={checkDuplicates} placeholder="+1 555 000 0000" style={{ paddingRight: '2rem' }} />
                      {validFields.phone && <CheckCircle size={16} color="var(--color-success)" style={{ position: 'absolute', right: '10px', top: '34px' }} />}
                    </div>
                  </div>
                </div>
              )}

              {(step === 2 && !isQuickAdd) && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Professional Credentials</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Specialty *</label>
                      <select className={`gcp-input ${errors.specialty ? 'error' : ''}`} value={formData.specialty} onChange={e => updateForm('specialty', e.target.value)}>
                        <option value="">Select specialty...</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="gcp-label">License Number</label>
                      <input type="text" className="gcp-input" value={formData.licenseNumber} onChange={e => updateForm('licenseNumber', e.target.value)} placeholder="MD-XXXXXX" />
                    </div>
                  </div>
                </div>
              )}

              {(step === 3 && !isQuickAdd) && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Clinic Operations</h2>
                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <label className="gcp-label">Clinic Search (Simulated) *</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                      <input type="text" className={`gcp-input ${errors.clinicName ? 'error' : ''}`} style={{ paddingLeft: '2.5rem' }} value={formData.clinicName} onChange={e => updateForm('clinicName', e.target.value)} placeholder="Search existing clinics or enter new..." />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="gcp-label">Country</label>
                      <select className="gcp-input" value={formData.country} onChange={e => updateForm('country', e.target.value)}>
                        <option value="">Select...</option>
                        <option value="United Arab Emirates">UAE</option>
                        <option value="United States">USA</option>
                        <option value="United Kingdom">UK</option>
                      </select>
                    </div>
                    <div>
                      <label className="gcp-label">City</label>
                      <input type="text" className="gcp-input" value={formData.city} onChange={e => updateForm('city', e.target.value)} placeholder="Dubai" />
                    </div>
                  </div>
                </div>
              )}

              {(step === 4 && !isQuickAdd) && (
                <div className="fade-in">
                  <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>Platform Permissions</h2>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="gcp-label">Role Template</label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {Object.keys(PERMISSION_ROLES).map(role => (
                        <button key={role} className={`gcp-btn-secondary ${roleTemplate === role ? 'active-role' : ''}`} onClick={() => setRoleTemplate(role)} style={{ flex: 1, textTransform: 'capitalize', border: roleTemplate === role ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input type="checkbox" checked={formData.portalAccess} onChange={e => updateForm('portalAccess', e.target.checked)} />
                      <span>Portal Access (Login, view records)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input type="checkbox" checked={formData.catalogAccess} onChange={e => updateForm('catalogAccess', e.target.checked)} />
                      <span>Catalog & Ordering</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input type="checkbox" checked={formData.prescriptionPermissions} onChange={e => updateForm('prescriptionPermissions', e.target.checked)} />
                      <span>Prescription Issuance (Sign, Prescribe)</span>
                    </label>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Desktop Summary Panel */}
        {!isMobile && (
          <div style={{ width: '320px', borderLeft: '1px solid var(--border)', backgroundColor: 'var(--background)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}>Live Profile</h3>
            <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, overflow: 'hidden' }}>
                  {formData.avatarUrl ? <img src={formData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : generateInitials()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formData.firstName || formData.lastName ? `Dr. ${formData.firstName} ${formData.lastName}` : 'Dr. Name'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.specialty || 'Specialty'}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}><Briefcase size={14} /> {formData.clinicName || 'Clinic'}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}><MapPin size={14} /> {[formData.city, formData.country].filter(Boolean).join(', ') || 'Location'}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}><Mail size={14} /> {formData.email || 'Email'}</div>
              </div>
            </Card>
            <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {lastSaved ? `Draft auto-saved at ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Unsaved changes'}
            </div>
          </div>
        )}

      </div>



      {/* Mobile Profile Bottom Sheet */}
      {isMobile && showMobilePreview && (
        <div style={{ position: 'absolute', bottom: '70px', left: 0, right: 0, backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', padding: '1.5rem', zIndex: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', animation: 'slideUp 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Live Profile</h3>
            <X size={18} onClick={() => setShowMobilePreview(false)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{generateInitials()}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{formData.firstName || formData.lastName ? `Dr. ${formData.firstName} ${formData.lastName}` : 'Dr. Name'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formData.specialty || 'Specialty'}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}><Briefcase size={14} /> {formData.clinicName || 'Clinic'}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}><Mail size={14} /> {formData.email || 'Email'}</div>
          </div>
        </div>
      )}

      {/* Sticky Action Footer */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        {!isMobile && (
          <button className="gcp-btn-secondary" onClick={onClose} style={{ border: 'none' }}>Cancel</button>
        )}
        <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
          {step > 1 && !isQuickAdd && (
            <button className="gcp-btn-secondary" onClick={() => setStep(s => s - 1)} style={{ flex: isMobile ? 1 : 'none', justifyContent: 'center' }}>Back</button>
          )}

          {step < STEPS.length && !isQuickAdd ? (
            <button className="gcp-btn-primary" onClick={handleNext} style={{ flex: isMobile ? 2 : 'none', justifyContent: 'center' }}>Next</button>
          ) : (
            <button className="gcp-btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: isMobile ? 2 : 'none', justifyContent: 'center' }}>
              {loading ? 'Creating...' : (isQuickAdd ? 'Create Instantly' : 'Complete')}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .error { border-color: var(--color-danger) !important; background-color: rgba(239, 68, 68, 0.05); }
      `}</style>
    </div>
  );
}