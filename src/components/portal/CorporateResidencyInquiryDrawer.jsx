import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Briefcase, Globe, Users, Building2, Calendar, Phone, Mail, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CorporateResidencyInquiryDrawer({
  isOpen = false,
  onClose,
  initialEntity = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';

  // Form state
  const [applicantStructure, setApplicantStructure] = useState('single'); // 'single' | 'team' | 'family'
  const [primaryObjective, setPrimaryObjective] = useState('residency_sl'); // 'residency_sl' | 'schengen_hub' | 'golden_alt'
  const [citizenship, setCitizenship] = useState('');
  const [currentResidence, setCurrentResidence] = useState('');
  const [capitalHorizon, setCapitalHorizon] = useState('50k-100k'); // '25k-50k' | '50k-100k' | '100k+'
  const [targetSector, setTargetSector] = useState('tech'); // 'tech' | 'trade' | 'holding' | 'consulting'
  const [timeline, setTimeline] = useState('immediate'); // 'immediate' | '1-3m' | 'exploring'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle escape key & lock background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error(isEs ? 'Por favor ingrese su nombre y correo electrónico.' : 'Please enter your name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const summaryMessage = [
        `=== VISA & CORPORATE ACQUISITION DIAGNOSTIC ===`,
        `Applicant Structure: ${applicantStructure}`,
        `Primary Objective: ${primaryObjective}`,
        `Citizenship: ${citizenship || 'Not specified'}`,
        `Current Tax Residence: ${currentResidence || 'Not specified'}`,
        `Capital Horizon: ${capitalHorizon}`,
        `Target Sector: ${targetSector}`,
        `Execution Timeline: ${timeline}`,
        `Company / Current Entity: ${companyName || 'N/A'}`,
        `Direct WhatsApp / Phone: ${phone || 'Not specified'}`,
        notes ? `Specific Notes: ${notes}` : ''
      ].filter(Boolean).join('\n');

      const res = await fetch('/api/portal/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          organization: companyName.trim() || 'Corporate Investor',
          phone: phone.trim(),
          topic: 'spain_corporate_visa_application',
          message: summaryMessage,
          contextType: 'corporate_residency',
          attachedEntity: initialEntity || {
            name: 'Spanish Corporate Acquisition & Residence Program (Law 14/2013)',
            slug: 'spain-company-acquisition-residency',
            category: 'Corporate Services'
          },
          sourceUrl: typeof window !== 'undefined' ? window.location.href : ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success(
          isEs
            ? 'Expediente confidencial remitido al despacho legal en Madrid.'
            : 'Confidential file transmitted to corporate counsel in Madrid.'
        );
      } else {
        throw new Error(data.error || 'Submission error');
      }
    } catch (err) {
      console.warn('Inquiry submission fallback:', err);
      // Fallback mailto
      const mailtoSubject = encodeURIComponent(`Confidential Visa & Corporate Review: ${fullName}`);
      const mailtoBody = encodeURIComponent(`Applicant: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nStructure: ${applicantStructure}\nCapital: ${capitalHorizon}\nTimeline: ${timeline}`);
      window.location.href = `mailto:business@med-peptides.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 3000,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-12px 0 40px rgba(0, 34, 68, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #002244 0%, #003666 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}
            >
              🇪🇸
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                {isEs ? 'Evaluación Confidencial de Residencia' : 'Confidential Visa & Corporate Review'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{isEs ? 'Ley 14/2013 · Unidad de Grandes Empresas (UGE-CE)' : 'Spanish Law 14/2013 · Fast-Track UGE-CE'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.85
            }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  margin: '0 auto 1.25rem'
                }}
              >
                <Check size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {isEs ? 'Expediente Diagnóstico Recibido' : 'Diagnostic File Received'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                {isEs
                  ? 'Su consulta ha sido asignada a nuestro equipo legal y mercantil en Madrid. Un abogado especialista evaluará la disponibilidad de la S.L. objetivo y le contactará en menos de 24 horas laborables.'
                  : 'Your dossier has been routed to our corporate and immigration legal counsel in Madrid. A designated attorney will verify target company availability and respond within 24 business hours.'}
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  color: '#334155',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6
                }}
              >
                <div style={{ fontWeight: 800, color: '#003666', marginBottom: '8px' }}>
                  {isEs ? '📋 Resumen del Perfil Registrado:' : '📋 Registered Profile Summary:'}
                </div>
                <div><strong>{isEs ? 'Inversor:' : 'Applicant:'}</strong> {fullName} ({email})</div>
                <div><strong>{isEs ? 'Estructura:' : 'Structure:'}</strong> {applicantStructure.toUpperCase()}</div>
                <div><strong>{isEs ? 'Horizonte Capital:' : 'Capital:'}</strong> {capitalHorizon}</div>
                <div><strong>{isEs ? 'Sector S.L.:' : 'Sector:'}</strong> {targetSector.toUpperCase()}</div>
                <div><strong>{isEs ? 'Plazo:' : 'Timeline:'}</strong> {timeline.toUpperCase()}</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Entendido / Cerrar' : 'Done / Close Window'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Highlight Badge */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <ShieldCheck size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                  <strong>{isEs ? 'Protocolo Confidencial Ley 14/2013:' : 'Law 14/2013 Statutory Protocol:'}</strong>{' '}
                  {isEs
                    ? 'Adquisición del 100% de Sociedad Limitada con historial, NIF/CIF activo y resolución de residencia en 20 días hábiles ante la UGE-CE con movilidad Schengen.'
                    : '100% turnkey acquisition of debt-free Spanish S.L. with active CIF and expedited 20-day UGE-CE resolution granting 3-year residency and Schengen mobility.'}
                </div>
              </div>

              {/* 1. Applicant Structure */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                  1. {isEs ? 'Estructura del Solicitante / Inversor' : 'Applicant & Investor Structure'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'single', label: isEs ? 'Individual' : 'Single', sub: isEs ? '1 Emprendedor' : '1 Founder' },
                    { id: 'team', label: isEs ? 'Socios' : 'Co-Founders', sub: isEs ? '2-4 Socios' : '2-4 Partners' },
                    { id: 'family', label: isEs ? 'Familiar' : 'Family Unit', sub: isEs ? 'Cónyuge + Hijos' : 'Spouse + Kids' },
                  ].map((opt) => {
                    const active = applicantStructure === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setApplicantStructure(opt.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          background: active ? '#003666' : '#f8fafc',
                          color: active ? '#ffffff' : '#334155',
                          border: `1.5px solid ${active ? '#003666' : '#e2e8f0'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.68rem', opacity: active ? 0.9 : 0.65 }}>{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Capital Allocation Horizon */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                  2. {isEs ? 'Capital / Inversión Prevista (Presupuesto Global)' : 'Planned Capital Allocation Horizon'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: '25k-50k', label: '€25k – €50k', sub: isEs ? 'Entrada Ágil' : 'Agile Setup' },
                    { id: '50k-100k', label: '€50k – €100k', sub: isEs ? 'Recomendado' : 'Standard Hub' },
                    { id: '100k+', label: '€100k+', sub: isEs ? 'Inversión VIP' : 'Substantial' }
                  ].map((opt) => {
                    const active = capitalHorizon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCapitalHorizon(opt.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          background: active ? '#0284c7' : '#f8fafc',
                          color: active ? '#ffffff' : '#334155',
                          border: `1.5px solid ${active ? '#0284c7' : '#e2e8f0'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.68rem', opacity: active ? 0.9 : 0.65 }}>{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Target Sector & Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    3. {isEs ? 'Sector de la S.L.' : 'Target Sector'}
                  </label>
                  <select
                    value={targetSector}
                    onChange={(e) => setTargetSector(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                  >
                    <option value="tech">Technology & AI</option>
                    <option value="biotech">Health & Biotech</option>
                    <option value="trade">International Trade / Goods</option>
                    <option value="holding">Holding & Real Estate</option>
                    <option value="consulting">Management Consulting</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    4. {isEs ? 'Plazo de Ejecución' : 'Target Timeline'}
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                  >
                    <option value="immediate">{isEs ? 'Inmediato (<30 días)' : 'Immediate (<30 days)'}</option>
                    <option value="1-3m">{isEs ? '1 a 3 meses' : '1 to 3 months'}</option>
                    <option value="exploring">{isEs ? 'Fase exploratoria' : 'Strategic exploration'}</option>
                  </select>
                </div>
              </div>

              {/* 4. Citizenship & Current Residence */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    {isEs ? 'Nacionalidad Actual' : 'Current Citizenship'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEs ? 'ej. USA, Reino Unido, México' : 'e.g. USA, UK, Canada'}
                    value={citizenship}
                    onChange={(e) => setCitizenship(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    {isEs ? 'País de Residencia Actual' : 'Current Residence Country'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEs ? 'ej. Emiratos, Singapur, USA' : 'e.g. UAE, Singapore, USA'}
                    value={currentResidence}
                    onChange={(e) => setCurrentResidence(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 5. Contact Info */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  5. {isEs ? 'Datos del Inversor o Representante' : 'Applicant & Contact Credentials'}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '2px' }}>
                    {isEs ? 'Nombre Completo *' : 'Full Legal Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '2px' }}>
                      {isEs ? 'Email Corporativo *' : 'Professional Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alexander@holdings.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '2px' }}>
                      {isEs ? 'WhatsApp / Teléfono Directo' : 'Direct WhatsApp / Phone'}
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', marginBottom: '2px' }}>
                    {isEs ? 'Requerimientos Específicos o Comentarios' : 'Specific Requirements / Case Brief'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isEs ? 'Indique si requiere poder notarial consular para firma remota o número de dependientes...' : 'Specify if remote consular Power of Attorney is required, number of dependents, etc.'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.9rem 1.25rem',
                  background: 'linear-gradient(135deg, #003666 0%, #002244 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 54, 102, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{isSubmitting ? (isEs ? 'Enviando Expediente...' : 'Submitting Dossier...') : (isEs ? 'Solicitar Revisión Diagnóstica Confidencial' : 'Request Confidential Diagnostic Review')}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>
                🔒 {isEs ? 'Protegido bajo estricto secreto profesional. Los datos se transmiten directamente al equipo jurídico asignado.' : 'Protected under strict professional secrecy. Transmitted directly to assigned legal counsel.'}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
