"use client";

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckSquare, Square, Download, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * PatientGeneticConsentModal (v5.0)
 * ─────────────────────────────────────────────────────────────────────────────
 * Official Digital Informed Consent for Health & Genetic Test Results.
 * In compliance with Atlas Health Solutions (Mediluxe, UAE) and
 * Eterna Diagnostics (STARTQUAKE, S.L., Spain) cross-border framework.
 */
export default function PatientGeneticConsentModal({
  isOpen = false,
  onClose,
  initialPatient = null,
  lang = 'es'
}) {
  const isEs = lang === 'es';

  // Form State
  const [fullName, setFullName] = useState(initialPatient?.name || initialPatient?.fullName || '');
  const [dob, setDob] = useState(initialPatient?.dob || '');
  const [patientId, setPatientId] = useState(initialPatient?.id || initialPatient?.fileNumber || '');
  const [email, setEmail] = useState(initialPatient?.email || '');
  const [country, setCountry] = useState('United Arab Emirates');

  // Selected Tests
  const [selectedTests, setSelectedTests] = useState({
    // Eterna Diagnostics
    eterna_proage: false,
    eterna_progen: false,
    // Fagron Genomics
    fagron_trichotest: true,
    fagron_telotest: false,
    fagron_nutrigen: true,
    // 24Genetics / Other
    twentyfour_nutrition: true,
    tellmegen: false,
    other: false,
    otherName: ''
  });

  // Keep in sync with initialPatient when opening or updated
  useEffect(() => {
    if (initialPatient) {
      const name = initialPatient.name || initialPatient.fullName || '';
      if (name && !fullName) {
        setFullName(name);
        setSignatureName(name);
      }
      if (initialPatient.dob && !dob) setDob(initialPatient.dob);
      if ((initialPatient.id || initialPatient.patientId || initialPatient.fileNumber) && !patientId) {
        setPatientId(initialPatient.id || initialPatient.patientId || initialPatient.fileNumber);
      }
      if (initialPatient.email && !email) setEmail(initialPatient.email);
    }
  }, [initialPatient]);

  // Explicit Consent & Signature
  const [hasExplicitConsent, setHasExplicitConsent] = useState(false);
  const [signatureName, setSignatureName] = useState(initialPatient?.name || '');
  const [signatureDate, setSignatureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSignedSuccess, setIsSignedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleTest = (key) => {
    setSelectedTests(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveConsent = async () => {
    if (!fullName.trim()) {
      toast.error(isEs ? 'Introduce el nombre completo del paciente' : 'Enter patient full name');
      return;
    }
    if (!hasExplicitConsent) {
      toast.error(isEs ? 'Debes marcar la casilla de consentimiento explícito' : 'You must check the explicit consent box');
      return;
    }
    if (!signatureName.trim()) {
      toast.error(isEs ? 'Escribe el nombre del firmante' : 'Signer name required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        patient: {
          fullName,
          dob,
          patientId,
          email,
          country
        },
        authorizedTests: selectedTests,
        consentVersion: 'v5.0',
        signedBy: signatureName,
        signedAt: new Date().toISOString(),
        signatureDate
      };

      const res = await fetch('/api/consent/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setIsSignedSuccess(true);
        toast.success(isEs ? '¡Consentimiento genético v5.0 firmado y guardado!' : 'Genetic consent v5.0 signed and saved!');
      } else {
        throw new Error(data.error || 'Failed to save consent');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving consent');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      // Header Banner
      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ATLAS HEALTH SOLUTIONS  |  ETERNA DIAGNOSTICS', 16, 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Cross-Border Clinical Genetic Data Authorization Framework · v5.0', 16, 18);

      // Document Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PATIENT CONSENT FOR HEALTH & GENETIC TEST RESULTS', 16, 36);

      // Section 1: Patient Details
      doc.setFillColor(241, 245, 249);
      doc.rect(16, 42, 178, 7, 'F');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('1  PATIENT DETAILS', 18, 47);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Full name: ${fullName || '__________________________'}`, 18, 56);
      doc.text(`Date of birth: ${dob || '__________________'}`, 120, 56);
      doc.text(`Patient ID: ${patientId || '_____________________'}`, 18, 63);
      doc.text(`Email: ${email || '________________________'}`, 120, 63);
      doc.text(`Country of residence: ${country || 'Spain / United Arab Emirates / Other'}`, 18, 70);

      // Section 2: Tests
      doc.setFillColor(241, 245, 249);
      doc.rect(16, 76, 178, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('2  SELECT THE TEST RESULTS YOU AUTHORIZE', 18, 81);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Tick each test individually. Only selected tests are covered by this consent.', 18, 88);

      let y = 95;
      doc.setFont('helvetica', 'bold');
      doc.text('ETERNA DIAGNOSTICS', 18, y);
      doc.text('FAGRON GENOMICS', 85, y);
      doc.text('24GENOMICS / OTHER', 145, y);

      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`[${selectedTests.eterna_proage ? 'X' : ' '}] ProAge`, 18, y);
      doc.text(`[${selectedTests.fagron_trichotest ? 'X' : ' '}] TrichoTest`, 85, y);
      doc.text(`[${selectedTests.twentyfour_nutrition ? 'X' : ' '}] Nutrition - 24Genetics`, 145, y);

      y += 6;
      doc.text(`[${selectedTests.eterna_progen ? 'X' : ' '}] Progen`, 18, y);
      doc.text(`[${selectedTests.fagron_telotest ? 'X' : ' '}] TeloTest`, 85, y);
      doc.text(`[${selectedTests.tellmegen ? 'X' : ' '}] tellmeGen`, 145, y);

      y += 6;
      doc.text(`[${selectedTests.fagron_nutrigen ? 'X' : ' '}] NutriGen`, 85, y);
      doc.text(`[${selectedTests.other ? 'X' : ' '}] Other test(s)`, 145, y);

      // Section 3: Authorization
      y += 12;
      doc.setFillColor(241, 245, 249);
      doc.rect(16, y, 178, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('3  WHAT YOU ARE AUTHORIZING', 18, y + 5);

      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const authText = "You explicitly authorize Atlas Health Solutions (a brand of Mediluxe Health Solutions, UAE) to request, receive, securely store, organize and process only the test results selected above, including existing historical reports, where legally permitted. You authorize Atlas / Mediluxe to share these selected records with Eterna Diagnostics (STARTQUAKE, S.L., Spain) for integration into the Eterna platform, longitudinal comparison, personalized reporting and clinician-supported interpretation. Access is limited to authorized personnel and relevant healthcare professionals.";
      const splitAuth = doc.splitTextToSize(authText, 178);
      doc.text(splitAuth, 18, y);

      // Section 4: Privacy & Rights
      y += 24;
      doc.setFillColor(241, 245, 249);
      doc.rect(16, y, 178, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('4  PRIVACY & YOUR RIGHTS', 18, y + 5);

      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const privText = "Health and genetic results are sensitive personal data. They will not be used for unrelated marketing or independent research under this consent. Transfers between the UAE and Spain/EU require applicable legal safeguards and must comply with UAE health-data localization and transfer restrictions. You may withdraw consent at any time without affecting prior lawful processing. Subject to applicable law, you may request access, correction, deletion and other rights.";
      const splitPriv = doc.splitTextToSize(privText, 178);
      doc.text(splitPriv, 18, y);

      // Section 5: Explicit Consent & Signature
      y += 22;
      doc.setFillColor(241, 245, 249);
      doc.rect(16, y, 178, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('5  EXPLICIT CONSENT & SIGNATURE', 18, y + 5);

      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const expText = `[${hasExplicitConsent ? 'X' : ' '}] I GIVE MY EXPLICIT CONSENT to processing and permitted sharing of the tests I individually selected in Section 2, for the purposes described above. I have read the accompanying Privacy Notice and understand that consent is voluntary and may be withdrawn.`;
      doc.text(doc.splitTextToSize(expText, 178), 18, y);

      y += 14;
      doc.text(`Patient / legal guardian name: ${signatureName || fullName || '________________________________________'}`, 18, y);
      y += 8;
      doc.text(`Digital Signature: ${signatureName ? `${signatureName} (Verified Digital Stamp)` : '____________________________________'}`, 18, y);
      doc.text(`Date: ${signatureDate || '__________________'}`, 120, y);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('DRAFT FOR LEGAL REVIEW | v5.0 | Use with full Privacy Notice; validate controller roles and transfers.', 18, 285);

      doc.save(`Consent-Genetic-Results-${patientId || 'patient'}-v5.0.pdf`);
      toast.success(isEs ? 'Consentimiento PDF v5.0 descargado ✓' : 'Consent PDF v5.0 downloaded ✓');
    } catch (err) {
      toast.error('Error generating PDF');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        borderRadius: '14px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header Banner */}
        <div style={{
          background: '#003666',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, fontWeight: 700 }}>
              Atlas Health Solutions | Eterna Diagnostics
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>
              Patient Consent for Health & Genetic Test Results (v5.0)
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignedSuccess ? (
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#166534', fontSize: '1.1rem' }}>
                {isEs ? 'Consentimiento Firmado con Éxito' : 'Consent Form Successfully Signed'}
              </h3>
              <p style={{ margin: '0 0 16px', color: '#15803d', fontSize: '0.84rem' }}>
                {isEs
                  ? `Se ha registrado la autorización de ${fullName} para las pruebas genéticas seleccionadas con sello de tiempo legal.`
                  : `Authorization recorded for ${fullName} covering selected genetic tests with legal timestamp.`}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={15} />
                  <span>{isEs ? 'Descargar Copia PDF (v5.0)' : 'Download PDF Copy (v5.0)'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: 650,
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Cerrar' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Patient Details */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase' }}>
                  1. Patient Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Carlos Méndez"
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Date of birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Patient ID / Record #</label>
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="e.g. PT-00129"
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Country of residence</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    >
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Spain">Spain</option>
                      <option value="European Union / Other">European Union / Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Select Test Results You Authorize */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', textTransform: 'uppercase' }}>
                  2. Select the Test Results You Authorize
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '12px' }}>
                  Tick each test individually. Only selected tests are covered by this consent.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {/* Eterna */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', marginBottom: '8px' }}>ETERNA DIAGNOSTICS</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer', marginBottom: '6px' }}>
                      <input type="checkbox" checked={selectedTests.eterna_proage} onChange={() => toggleTest('eterna_proage')} />
                      <span>ProAge</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedTests.eterna_progen} onChange={() => toggleTest('eterna_progen')} />
                      <span>Progen</span>
                    </label>
                  </div>

                  {/* Fagron Genomics */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', marginBottom: '8px' }}>FAGRON GENOMICS</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer', marginBottom: '6px' }}>
                      <input type="checkbox" checked={selectedTests.fagron_trichotest} onChange={() => toggleTest('fagron_trichotest')} />
                      <span>TrichoTest</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer', marginBottom: '6px' }}>
                      <input type="checkbox" checked={selectedTests.fagron_telotest} onChange={() => toggleTest('fagron_telotest')} />
                      <span>TeloTest</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedTests.fagron_nutrigen} onChange={() => toggleTest('fagron_nutrigen')} />
                      <span>NutriGen</span>
                    </label>
                  </div>

                  {/* 24Genomics / Other */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>24GENOMICS / OTHER</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer', marginBottom: '6px' }}>
                      <input type="checkbox" checked={selectedTests.twentyfour_nutrition} onChange={() => toggleTest('twentyfour_nutrition')} />
                      <span>Nutrition - 24Genetics</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer', marginBottom: '6px' }}>
                      <input type="checkbox" checked={selectedTests.tellmegen} onChange={() => toggleTest('tellmegen')} />
                      <span>tellmeGen - Genetic test results</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={selectedTests.other} onChange={() => toggleTest('other')} />
                      <span>Other test(s)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. What You Are Authorizing */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  3. What You Are Authorizing
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                  You explicitly authorize Atlas Health Solutions (a brand of Mediluxe Health Solutions, UAE) to request, receive, securely store, organize and process only the test results selected above, including existing historical reports, where legally permitted. You authorize Atlas / Mediluxe to share these selected records with Eterna Diagnostics (STARTQUAKE, S.L., Spain) for integration into the Eterna platform, longitudinal comparison, personalized reporting and clinician-supported interpretation. Access is limited to authorized personnel and relevant healthcare professionals.
                </p>
              </div>

              {/* 4. Privacy & Your Rights */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  4. Privacy & Your Rights
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                  Health and genetic results are sensitive personal data. They will not be used for unrelated marketing or independent research under this consent. Transfers between the UAE and Spain/EU require applicable legal safeguards and must comply with UAE health-data localization and transfer restrictions. You may withdraw consent at any time without affecting prior lawful processing.
                </p>
              </div>

              {/* 5. Explicit Consent & Signature */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', background: '#fff' }}>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase' }}>
                  5. Explicit Consent & Signature
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#1e293b', cursor: 'pointer', marginBottom: '14px' }}>
                  <input
                    type="checkbox"
                    checked={hasExplicitConsent}
                    onChange={(e) => setHasExplicitConsent(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <strong>I GIVE MY EXPLICIT CONSENT</strong> to processing and permitted sharing of the tests I individually selected in Section 2, for the purposes described above. I have read the accompanying Privacy Notice and understand that consent is voluntary and may be withdrawn.
                  </span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Patient / legal guardian name</label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Signer name"
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Date</label>
                    <input
                      type="date"
                      value={signatureDate}
                      onChange={(e) => setSignatureDate(e.target.value)}
                      style={{ width: '100%', height: '34px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '10px' }}>
                  DRAFT FOR LEGAL REVIEW | v5.0 | Use with full Privacy Notice; validate controller roles and transfers.
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>{isEs ? 'Vista Previa PDF' : 'Preview PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveConsent}
                  disabled={isSaving}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.80rem',
                    fontWeight: 750,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>{isSaving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Firmar y Registrar Consentimiento' : 'Sign & Record Consent')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
