"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, X, AlertCircle, CheckCircle2, User, Building2, Stethoscope, FileText, Check } from 'lucide-react';
import { createPatient } from '../../../services/patientLinkService';
import { checkDuplicatePatientEmailAction } from '../../../actions/patientsActions';
import { useToast } from '../../../hooks/useToast';
import ClinicPicker from './ClinicPicker';
import PhysicianPicker from './PhysicianPicker';
import InternationalPhoneInput from '../../ui/InternationalPhoneInput';

export default function PatientFormDrawer({ isOpen, onClose, onComplete }) {
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'AE',
    dateOfBirth: '',
    gender: '',
    clinicId: '',
    clinicName: '',
    physicianId: '',
    physicianName: '',
    program: '',
    tags: [],
    status: 'active',
    externalRef: '',
    notes: '',
  });

  // UI States
  const [aiText, setAiText] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiExtractedBanner, setAiExtractedBanner] = useState(null);

  // Email Validation & Duplicate Warning
  const [emailError, setEmailError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'AE',
        dateOfBirth: '',
        gender: '',
        clinicId: '',
        clinicName: '',
        physicianId: '',
        physicianName: '',
        program: '',
        tags: [],
        status: 'active',
        externalRef: '',
        notes: '',
      });
      setAiText('');
      setAiExtractedBanner(null);
      setEmailError('');
      setDuplicateWarning(null);
    }
  }, [isOpen]);

  // Validate Email Structure & Check Duplicate
  const handleEmailBlur = async () => {
    const rawEmail = formData.email.trim().toLowerCase();
    if (!rawEmail) {
      setEmailError('');
      setDuplicateWarning(null);
      return;
    }

    // Basic structure check (RFC 5322 pattern)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(rawEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@domain.com)');
      setDuplicateWarning(null);
      return;
    }

    setEmailError('');
    setIsCheckingEmail(true);
    try {
      const dup = await checkDuplicatePatientEmailAction(rawEmail);
      if (dup?.exists) {
        setDuplicateWarning(
          `A patient with this email already exists: "${dup.name}"${dup.clinic ? ` at ${dup.clinic}` : ''}`
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.warn('Duplicate email check failed:', err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // AI Extraction via Real Gemini 2.5 Flash
  const handleExtractAI = async () => {
    if (!aiText.trim()) return;
    setIsExtracting(true);
    setAiExtractedBanner(null);

    try {
      const res = await fetch('/api/ai-extract-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extract patient info');
      }

      const data = await res.json();
      const ext = data.extracted || {};

      setFormData(prev => ({
        ...prev,
        firstName: ext.firstName || prev.firstName,
        lastName: ext.lastName || prev.lastName,
        email: ext.email ? ext.email.toLowerCase().trim() : prev.email,
        phone: ext.phone || prev.phone,
        country: ext.country || prev.country,
        dateOfBirth: ext.dateOfBirth || prev.dateOfBirth,
        gender: ext.gender || prev.gender,
        clinicId: data.matchedClinic?.id || prev.clinicId,
        clinicName: data.matchedClinic?.name || ext.clinicName || prev.clinicName,
        physicianId: data.matchedDoctor?.id || prev.physicianId,
        physicianName: data.matchedDoctor?.name || ext.physicianName || prev.physicianName,
        program: ext.program || prev.program,
        notes: ext.notes ? (prev.notes ? `${prev.notes}\n${ext.notes}` : ext.notes) : prev.notes,
      }));

      setAiExtractedBanner({
        confidence: ext.confidence || 90,
        matchedClinic: data.matchedClinic?.name,
        matchedDoctor: data.matchedDoctor?.name,
      });

      toast.success('Patient data extracted with AI!');
    } catch (err) {
      console.error('AI extraction error:', err);
      toast.error(err.message || 'Error running AI extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  // Submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First and last name are required.');
      return;
    }

    if (formData.email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(formData.email.trim())) {
        toast.error('Please provide a valid email format.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const cleanEmail = formData.email.trim().toLowerCase();

      const { id, linkedUserId } = await createPatient({
        name: fullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        country: formData.country,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        clinicId: formData.clinicId || null,
        clinic: formData.clinicName || null,
        physicianId: formData.physicianId || null,
        physician: formData.physicianName || null,
        program: formData.program || null,
        tags: formData.program ? [formData.program] : [],
        status: formData.status || 'active',
        externalRef: formData.externalRef || null,
        notes: formData.notes || '',
        revenue: 0,
        prescriptionCount: 0,
        lastActivity: new Date().toISOString().split('T')[0],
      });

      const newPatientDoc = {
        id,
        name: fullName,
        email: cleanEmail,
        phone: formData.phone,
        clinic: formData.clinicName,
        physician: formData.physicianName,
        status: formData.status || 'active',
        linkedUserId
      };

      toast.success(`Patient "${fullName}" created successfully.`);
      if (onComplete) onComplete(newPatientDoc);
      onClose();
    } catch (err) {
      console.error('Error creating patient:', err);
      toast.error('Error saving patient: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      justifyContent: 'flex-end',
      transition: 'opacity 0.2s ease-in-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Sticky Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface, #ffffff)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--color-primary-light, #eff6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #003666)'
            }}>
              <User size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                Create New Patient
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                Register a clinical patient profile and link relationship records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem',
              borderRadius: '6px', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: '#f8fafc'
        }}>
          
          {/* ── CARD 0: AI Quick Intake (Gemini 2.5) ── */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: isAiOpen ? '0.75rem' : 0 }}
              onClick={() => setIsAiOpen(!isAiOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={15} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    AI Intake Auto-Fill
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', background: '#dcfce7', color: '#166534', borderRadius: 4, fontWeight: 700 }}>
                      Gemini 2.5 Flash
                    </span>
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                {isAiOpen ? 'Hide ▲' : 'Paste Referral ▼'}
              </span>
            </div>

            {isAiOpen && (
              <div>
                <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                  Paste unstructured clinical text, WhatsApp referrals, or intake emails to automatically populate the patient profile:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <textarea
                    rows={2}
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    placeholder="e.g. Register Fatima Al Mansoori (fatima.m@example.ae, +971 50 889 1234, DOB 1988-04-12) at Roya Medical Center under Dr Valentina..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #86efac',
                      background: '#ffffff',
                      fontSize: '0.82rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    disabled={isExtracting}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setAiText("Please register Dr. Valentina's patient: Sarah Al Maktoum (sarah.maktoum@example.ae, +971 50 334 5678, Female, DOB 1991-06-15) at Roya Medical Center LLC for Longevity protocol.")}
                      style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Fill sample intake
                    </button>
                    <button
                      type="button"
                      onClick={handleExtractAI}
                      disabled={isExtracting || !aiText.trim()}
                      style={{
                        padding: '0.45rem 1rem',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: aiText.trim() && !isExtracting ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        opacity: isExtracting || !aiText.trim() ? 0.6 : 1,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                      }}
                    >
                      {isExtracting ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
                      {isExtracting ? 'Extracting with Gemini…' : 'Extract & Fill Form'}
                    </button>
                  </div>
                </div>

                {aiExtractedBanner && (
                  <div style={{
                    marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: '#dcfce7',
                    borderRadius: '8px', border: '1px solid #86efac', fontSize: '0.78rem', color: '#166534'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span>Fields populated ({aiExtractedBanner.confidence}% confidence). Review before saving.</span>
                    </div>
                    {aiExtractedBanner.matchedClinic && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.74rem' }}>🏥 Matched Clinic: <strong>{aiExtractedBanner.matchedClinic}</strong></div>
                    )}
                    {aiExtractedBanner.matchedDoctor && (
                      <div style={{ marginTop: '0.15rem', fontSize: '0.74rem' }}>👨‍⚕️ Matched Doctor: <strong>{aiExtractedBanner.matchedDoctor}</strong></div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── CARD 1: Basic Identity & Demographics ── */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <User size={15} color="var(--color-primary, #003666)" />
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Patient Identity & Demographics
              </h3>
            </div>

            {/* First & Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.85rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.85rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (emailError) setEmailError('');
                  }}
                  onBlur={handleEmailBlur}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.85rem', borderRadius: '8px',
                    border: emailError ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
                {isCheckingEmail && (
                  <Loader2 size={15} className="spin" color="#94a3b8" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>
              {emailError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#ef4444' }}>
                  <AlertCircle size={13} />
                  <span>{emailError}</span>
                </div>
              )}
              {duplicateWarning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#d97706', background: '#fffbeb', padding: '5px 10px', borderRadius: 6, border: '1px solid #fde68a' }}>
                  <AlertCircle size={13} color="#d97706" />
                  <span>{duplicateWarning}</span>
                </div>
              )}
            </div>

            {/* International Phone */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Phone Number (International)
              </label>
              <InternationalPhoneInput
                value={formData.phone}
                countryHint={formData.country}
                onChange={(normalizedPhone) => setFormData({ ...formData, phone: normalizedPhone })}
              />
            </div>

            {/* Country, DOB, Gender in 3-col Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.75rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', boxSizing: 'border-box', outline: 'none'
                  }}
                >
                  <option value="AE">United Arab Emirates</option>
                  <option value="ES">Spain</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="QA">Qatar</option>
                  <option value="KW">Kuwait</option>
                  <option value="OM">Oman</option>
                  <option value="BH">Bahrain</option>
                  <option value="MX">Mexico</option>
                  <option value="CO">Colombia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.65rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.82rem', boxSizing: 'border-box', outline: 'none', background: '#ffffff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.75rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#ffffff', boxSizing: 'border-box', outline: 'none'
                  }}
                >
                  <option value="">Select...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Clinical Affiliations & Programs ── */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <Building2 size={15} color="var(--color-primary, #003666)" />
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Clinical Affiliations & Program
              </h3>
            </div>

            {/* Clinic Picker */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Assigned Clinic
              </label>
              <ClinicPicker
                value={formData.clinicId}
                clinicName={formData.clinicName}
                onChange={({ clinicId, clinicName }) => setFormData({ ...formData, clinicId, clinicName })}
              />
            </div>

            {/* Physician Picker */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Assigned Physician / Supervising Doctor
              </label>
              <PhysicianPicker
                value={formData.physicianId}
                physicianName={formData.physicianName}
                clinicId={formData.clinicId}
                onChange={({ doctorId, doctorName }) => setFormData({ ...formData, physicianId: doctorId, physicianName: doctorName })}
              />
            </div>

            {/* Program / Segment Tag */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Clinical Program / Segment Focus
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                style={{
                  width: '100%', height: '40px', padding: '0 0.85rem', borderRadius: '8px',
                  border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', boxSizing: 'border-box', outline: 'none'
                }}
              >
                <option value="">None / Standard Intake</option>
                <option value="Longevity">Longevity & Biological Age Optimization</option>
                <option value="Weight Loss">Metabolic & Weight Management (GLP-1 / GIP)</option>
                <option value="Performance">Athletic Performance & Injury Recovery</option>
                <option value="Cognitive">Cognitive & Neuro-enhancement</option>
                <option value="Hormonal">Hormonal & GH-Axis Optimization</option>
                <option value="VIP">VIP Executive Patient</option>
              </select>
            </div>
          </div>

          {/* ── CARD 3: Administrative & Clinical Notes ── */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <FileText size={15} color="var(--color-primary, #003666)" />
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. Administrative Status & Clinical Notes
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Initial Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.85rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', boxSizing: 'border-box', outline: 'none'
                  }}
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="unverified">Unverified Intake</option>
                  <option value="suspended">Suspended</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  External Patient Ref / MRN
                </label>
                <input
                  type="text"
                  placeholder="e.g. MRN-9921"
                  value={formData.externalRef}
                  onChange={(e) => setFormData({ ...formData, externalRef: e.target.value })}
                  style={{
                    width: '100%', height: '40px', padding: '0 0.85rem', borderRadius: '8px',
                    border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Clinical Intake Notes & Medical History
              </label>
              <textarea
                rows={3}
                placeholder="Enter baseline biomarkers, allergies, peptide experience, or physician instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
                  border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

        </div>

        {/* Sticky Bottom Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border, #e2e8f0)',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.85rem',
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#475569',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !formData.firstName.trim() || !formData.lastName.trim()}
            style={{
              padding: '0.65rem 1.75rem',
              background: 'var(--color-primary, #003666)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: isSaving || !formData.firstName.trim() || !formData.lastName.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isSaving || !formData.firstName.trim() || !formData.lastName.trim() ? 0.6 : 1,
              boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)',
              transition: 'transform 0.1s, opacity 0.15s'
            }}
          >
            {isSaving && <Loader2 size={15} className="spin" />}
            {isSaving ? 'Creating Patient…' : 'Create Patient Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}