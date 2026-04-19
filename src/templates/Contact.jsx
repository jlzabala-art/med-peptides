import { useState, useEffect, useMemo } from 'react';
import { Mail, Phone, User, Send, ChevronDown, ArrowLeft, CheckCircle2, Globe, FileText, Users, Clock, MessageSquare, Calendar, CloudUpload, ShieldCheck } from 'lucide-react';
import { COUNTRIES } from '../data/countries';

export default function Contact({ cart, pendingQuote, setPendingQuote, onBack, region }) {
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState('Product Information');
  const [userType, setUserType] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [formData, setLocalFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.trim().length < 3) error = 'Please enter your full name.';
        break;
      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) error = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!value || value.trim().length < 7) error = 'Please enter a valid phone number.';
        break;
      case 'message':
        if (value.trim().length < 10) error = 'Please provide a short description of your request.';
        break;
      case 'topic':
        if (!value) error = 'Please select an inquiry type.';
        break;
      default:
        break;
    }
    return error;
  };

  const isFormValid = useMemo(() => {
    const vErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      message: validateField('message', formData.message),
      topic: validateField('topic', topic)
    };
    return !Object.values(vErrors).some(err => err !== '');
  }, [formData, topic]);

  // Derive region name and flag
  const currentRegionInfo = useMemo(() => {
    if (region === 'eu') return { name: 'Spain', flag: '🇪🇸', currency: 'EUR' };
    if (region === 'ae') return { name: 'UAE', flag: '🇦🇪', currency: 'AED' };
    if (region === 'us') return { name: 'USA', flag: '🇺🇸', currency: 'USD' };
    if (region === 'gb') return { name: 'UK', flag: '🇬🇧', currency: 'GBP' };
    return { name: 'Global', flag: '🌐', currency: 'USD' };
  }, [region]);

  const USER_TYPES = [
    { id: 'clinics', label: 'Clinics', icon: <Users size={16} />, defaultInquiry: 'Clinic Inquiry' },
    { id: 'pharmacies', label: 'Pharmacies', icon: <Globe size={16} />, defaultInquiry: 'Pharmacy Inquiry' },
    { id: 'researchers', label: 'Researchers', icon: <FileText size={16} />, defaultInquiry: 'Research Inquiry' },
    { id: 'distributors', label: 'Distributors', icon: <Globe size={16} />, defaultInquiry: 'Distributor Inquiry' }
  ];

  const INQUIRY_TYPES = [
    'Clinic Inquiry',
    'Pharmacy Inquiry',
    'Research Inquiry',
    'Distributor Inquiry',
    'Product Information',
    'Bulk Order',
    'Custom Synthesis',
    'Clinical Support',
    'Regulatory Documentation',
    'Distributor Partnership'
  ];

  const MESSAGE_PLACEHOLDERS = {
    'clinics': 'Example: "I am a clinic interested in Tirzepatide bulk pricing."',
    'researchers': 'Example: "I need COA documentation for BPC-157."',
    'default': 'Example: "Interested in technical data or bulk pricing for research materials."'
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type.id);
    setTopic(type.defaultInquiry);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // We rely on Formspree for actual email delivery securely without a backend
  // The user specifies they want the email to go to business@med-peptides.com
  // Normally you'd create a specific hash. In this demo setting, we'll use a mailto action or direct form action
  // if they have a formspree/other endpoint. Given no API keys, we'll use a direct mailto as fallback, 
  // OR simulated submission that says "Emails to business@med-peptides.com" since we can't register an endpoint for them automatically.
  // Actually, standard HTML form to formsubmit.co is free and requires no registration.

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all as touched to show errors
    const allTouched = { name: true, email: true, phone: true, message: true, topic: true };
    setTouched(allTouched);

    if (!isFormValid) return;

    const form = e.target;
    const formDataObj = new FormData(form);
    
    // Add metadata
    formDataObj.append('source_page', 'institutional_inquiry');
    formDataObj.append('selected_inquiry_card', userType || 'none');
    formDataObj.append('region', region);
    formDataObj.append('timestamp', new Date().toISOString());

    fetch('https://formsubmit.co/ajax/business@med-peptides.com', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formDataObj
    })
    .then(response => response.json())
    .then(data => {
        setSubmitted(true);
        form.reset();
        setLocalFormData({ name: '', email: '', phone: '', message: '' });
        setUserType(null);
        setErrors({});
        setTouched({});
        
        if (pendingQuote) {
          if (pendingQuote.type === 'WhatsApp') {
            const text = encodeURIComponent(`Hello, I have submitted my details via the form. I would like to request an official quote for: ${pendingQuote.summary}`);
            window.open(`https://wa.me/971553561058?text=${text}`, '_blank');
          } else if (pendingQuote.type === 'Email') {
            const body = encodeURIComponent(`Research Inquiry Summary:\n${pendingQuote.summary}\n\nI have just submitted the contact form with my official details.`);
            window.location.href = `mailto:business@med-peptides.com?subject=Official Quote Request&body=${body}`;
          }
          setPendingQuote(null);
        }

        setTimeout(() => setSubmitted(false), 8000);
    })
    .catch(error => {
        console.error(error);
        setErrors({ general: 'There was an error sending your message. Please try emailing directly.' });
    });
  };

  const TrustIndicator = ({ icon: Icon, text }) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
      <div style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center' }}>
        <Icon size={18} />
      </div>
      <span>{text}</span>
    </div>
  );

  const StepIndicator = ({ text }) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
      <span>{text}</span>
    </div>
  );

  return (
    <div className="template-root" style={{ paddingTop: 'clamp(2rem, 8vw, 6rem)', minHeight: '100vh', backgroundColor: 'var(--surface)', position: 'relative' }}>
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/971553561058"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={30} fill="white" />
      </a>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="grid-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
          {/* Left Panel - Structured Information */}
          <div style={{ order: isMobile ? 1 : 0 }}>
            <div style={{ marginBottom: '3rem' }}>
              <span className="badge" style={{ marginBottom: '1rem' }}>Partner with Med-Peptides</span>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>
                Institutional & <span style={{ color: 'var(--secondary)' }}>Clinical</span> Inquiries
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                Trusted supply for clinics, pharmacies, and research teams worldwide.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--surface-subtle)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Identify your inquiry type
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {USER_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: userType === type.id ? 'var(--secondary)' : 'var(--border)',
                      backgroundColor: userType === type.id ? 'rgba(var(--secondary-rgb), 0.1)' : 'white',
                      color: userType === type.id ? 'var(--secondary)' : 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <TrustIndicator icon={ShieldCheck} text="Verified analytical testing" />
                <TrustIndicator icon={Globe} text="Global shipping capability" />
                <TrustIndicator icon={FileText} text="Regulatory documentation support" />
                <TrustIndicator icon={Users} text="Dedicated account specialists" />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                  After submitting your inquiry:
                </h4>
                <StepIndicator text="Response within 24 hours" />
                <StepIndicator text="Dedicated technical support" />
                <StepIndicator text="Access to documentation" />
                <StepIndicator text="Tailored quotation if required" />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Inquiry</div>
                  <div style={{ fontWeight: 600 }}>business@med-peptides.com</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#25D366' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp Hub</div>
                  <div style={{ fontWeight: 600 }}>+971 55 356 1058</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation</div>
                  <a 
                    href="https://us.bigin.online/org900319019/bookings/mhs" 
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => console.log('booking_cta_clicked', { page: 'institutional_inquiry', region, userType })}
                    style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    Schedule Video Call
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="card" style={{ 
            padding: '3rem', 
            border: pendingQuote ? '2px solid var(--primary)' : '1px solid var(--border)', 
            position: 'relative',
            order: isMobile ? 0 : 1,
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}>
            {pendingQuote && (
              <div style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.9rem', 
                fontWeight: 600,
                marginBottom: '1.5rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                Please finalize your contact details to receive your official {pendingQuote.type} Quote.
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Institutional Inquiry</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-subtle)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>{currentRegionInfo.name} {currentRegionInfo.flag}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{currentRegionInfo.currency}</span>
                </div>
                <button onClick={() => window.dispatchEvent(new CustomEvent('openRegionModal'))} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}>
                  [Change Region]
                </button>
              </div>
            </div>

            {submitted ? (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
                  <Send size={40} style={{ margin: '0 auto' }} />
                </div>
                <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Inquiry Submitted!</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Your inquiry has been submitted successfully. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <input type="hidden" name="_subject" value={`New Inquiry (${topic}) from Med-Peptides Website`} />
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Full Name *</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Required for professional follow-up.</p>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Dr. John Doe"
                      required
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: 'var(--radius-md)', border: touched.name && errors.name ? '1px solid var(--danger)' : '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    />
                  </div>
                  {touched.name && errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="institution@clinic.com"
                      required
                      style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', borderRadius: 'var(--radius-md)', border: touched.email && errors.email ? '1px solid var(--danger)' : '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    />
                  </div>
                  {touched.email && errors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Phone Number</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Includes WhatsApp support indicator.</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '90px' }}>
                      <select 
                        style={{ width: '100%', padding: '0.85rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', appearance: 'none', backgroundColor: 'var(--surface-subtle)' }}
                      >
                        <option>ES +34</option>
                        <option>US +1</option>
                        <option>UK +44</option>
                        <option>AE +971</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#25D366' }}>
                        <MessageSquare size={16} fill="#25D366" />
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="600 000 000"
                        style={{ width: '100%', padding: '0.85rem 2.8rem 0.85rem 1rem', borderRadius: 'var(--radius-md)', border: touched.phone && errors.phone ? '1px solid var(--danger)' : '1px solid var(--border)', fontSize: '1rem', outline: 'none' }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                      />
                    </div>
                  </div>
                  {touched.phone && errors.phone && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.phone}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Inquiry Type *</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                      <ChevronDown size={18} />
                    </div>
                    <select 
                      name="topic"
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        if (touched.topic) {
                          const error = validateField('topic', e.target.value);
                          setErrors(prev => ({ ...prev, topic: error }));
                        }
                      }}
                      onBlur={(e) => {
                        setTouched(prev => ({ ...prev, topic: true }));
                        const error = validateField('topic', e.target.value);
                        setErrors(prev => ({ ...prev, topic: error }));
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '0.85rem 2.8rem 0.85rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        border: touched.topic && errors.topic ? '1px solid var(--danger)' : '1px solid var(--border)', 
                        fontSize: '1rem', 
                        outline: 'none', 
                        appearance: 'none', 
                        backgroundColor: 'white', 
                        color: 'var(--text-main)', 
                        fontFamily: 'var(--font-sans)',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    >
                      <option value="">-- Select inquiry type --</option>
                      {INQUIRY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {touched.topic && errors.topic && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.topic}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Message / Details *</label>
                  <textarea 
                    name="message"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={MESSAGE_PLACEHOLDERS[userType] || MESSAGE_PLACEHOLDERS.default}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-md)', 
                      border: touched.message && errors.message ? '1px solid var(--danger)' : '1px solid var(--border)', 
                      fontSize: '1rem', 
                      outline: 'none', 
                      resize: 'vertical', 
                      fontFamily: 'var(--font-sans)',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  ></textarea>
                  {touched.message && errors.message && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.message}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>Supporting Files (Optional)</label>
                  <div style={{ 
                    border: '1px dashed var(--border)', 
                    padding: '1.5rem', 
                    borderRadius: 'var(--radius-md)', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--surface-subtle)',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => document.getElementById('file-upload').click()}
                  >
                    <CloudUpload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to upload PDF, Excel, or Images</div>
                    <input 
                      type="file" 
                      id="file-upload" 
                      name="attachment" 
                      style={{ display: 'none' }} 
                      multiple
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={!isFormValid}
                    style={{ 
                      width: '100%', 
                      padding: '1rem', 
                      fontSize: '1rem', 
                      fontWeight: 700,
                      boxShadow: isFormValid ? '0 10px 20px rgba(var(--primary-rgb), 0.2)' : 'none',
                      opacity: isFormValid ? 1 : 0.6,
                      cursor: isFormValid ? 'pointer' : 'not-allowed',
                      position: isMobile ? 'sticky' : 'relative',
                      bottom: isMobile ? '1rem' : 'auto',
                      zIndex: 10
                    }}
                  >
                    Submit Inquiry
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Clock size={14} />
                    <span>Response within 24 hours (Business Days)</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
