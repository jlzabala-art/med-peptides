import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES } from '../data/countries';
import { 
  ShieldCheck, User, Building2, Mail, Save, ArrowLeft, 
  CheckCircle2, AlertCircle, ChevronDown,
  Truck, Landmark
} from 'lucide-react';

export default function UserSettings({ onBack }) {
  const { user, userProfile, updateProfileData, isProfessional } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Full country list imported from data/countries.js (240+ entries)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    phone: '',
    // Shipping Address
    shippingStreet: '',
    shippingCity: '',
    shippingZip: '',
    shippingCountry: '',
    // Billing Address
    billingStreet: '',
    billingCity: '',
    billingZip: '',
    billingCountry: '',
    taxId: ''
  });

  const [activeAccordion, setActiveAccordion] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (userProfile && !isInitialized) {
      setFormData({
        fullName: userProfile.fullName || user?.displayName || '',
        email: userProfile.email || user?.email || '',
        institution: userProfile.institution || '',
        phone: userProfile.phone || '',
        shippingStreet: userProfile.shippingStreet || '',
        shippingCity: userProfile.shippingCity || '',
        shippingZip: userProfile.shippingZip || '',
        shippingCountry: userProfile.shippingCountry || '',
        billingStreet: userProfile.billingStreet || '',
        billingCity: userProfile.billingCity || '',
        billingZip: userProfile.billingZip || '',
        billingCountry: userProfile.billingCountry || '',
        taxId: userProfile.taxId || ''
      });
      setIsInitialized(true);
    }
  }, [user, userProfile, isInitialized]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateProfileData(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const AccordionItem = ({ id, title, icon: Icon, children }) => {
    const isOpen = activeAccordion === id;
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        marginBottom: '1rem',
        border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: isOpen ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
      }}>
        <button 
          type="button"
          onClick={() => setActiveAccordion(isOpen ? null : id)}
          style={{
            width: '100%', padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: isOpen ? 'rgba(0, 54, 102, 0.02)' : 'none',
            border: 'none', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: isOpen ? 'var(--primary)' : 'var(--background)',
              color: isOpen ? 'white' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}>
              <Icon size={20} strokeWidth={1.2} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{title}</span>
          </div>
          <ChevronDown 
            size={20}
            strokeWidth={1.2}
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
              transition: 'transform 0.3s ease',
              color: 'var(--text-muted)'
            }} 
          />
        </button>
        <div style={{ 
          maxHeight: isOpen ? '1000px' : 0, 
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.35s ease, opacity 0.25s ease'
        }}>
          <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'grid', gap: '1.25rem' }}>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '0.5rem' }} />
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="template-root" style={{ 
      paddingTop: 'clamp(5rem, 10vw, 8rem)', 
      minHeight: '100vh', 
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)'
    }}>
      <div className="container" style={{ maxWidth: '800px', paddingBottom: '6rem' }}>
        
        {/* Uniform Header */}
        <div style={{ marginBottom: '3rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, 
              padding: '0.5rem 1rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          >
            <ArrowLeft size={16} strokeWidth={1.2} /> DASHBOARD
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Account Settings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                Manage your institutional identity and shipping logistics.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.75rem 1.25rem', background: isProfessional ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,54,102,0.05)',
              borderRadius: '16px', border: `1px solid ${isProfessional ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`
            }}>
              <ShieldCheck size={20} strokeWidth={1.2} color={isProfessional ? 'var(--success)' : 'var(--primary)'} />
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isProfessional ? 'var(--success)' : 'var(--primary)', textTransform: 'uppercase' }}>
                {isProfessional ? 'Verified Professional' : 'Standard Access'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section: Personal Info */}
          <AccordionItem id="personal" title="Personal Information" icon={User}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">FULL NAME</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="premium-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">PHONE NUMBER</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="premium-input" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">EMAIL ADDRESS (PRIMARY)</label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={formData.email} className="premium-input" disabled style={{ background: 'var(--background)', cursor: 'not-allowed', paddingLeft: '2.75rem' }} />
                <Mail size={16} strokeWidth={1.2} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              </div>
            </div>
          </AccordionItem>

          {/* Section: Institution */}
          <AccordionItem id="institution" title="Institutional Details" icon={Building2}>
            <div className="form-group">
              <label className="form-label">INSTITUTION / CLINIC NAME</label>
              <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="premium-input" placeholder="Medical Research Center" />
            </div>
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Verification status is tied to your institution details. Changing this may trigger a re-validation process for Professional pricing.
              </p>
            </div>
          </AccordionItem>

          {/* Section: Shipping */}
          <AccordionItem id="shipping" title="Shipping Address" icon={Truck}>
            <div className="form-group">
              <label className="form-label">STREET ADDRESS</label>
              <input type="text" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} className="premium-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">CITY</label>
                <input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleChange} className="premium-input" />
              </div>
              <div className="form-group">
                <label className="form-label">POSTAL / ZIP</label>
                <input type="text" name="shippingZip" value={formData.shippingZip} onChange={handleChange} className="premium-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">COUNTRY / REGION</label>
              <div style={{ position: 'relative' }}>
                <select 
                  name="shippingCountry" 
                  value={formData.shippingCountry} 
                  onChange={handleChange} 
                  className="premium-input"
                  style={{ 
                    appearance: 'none', WebkitAppearance: 'none', 
                    paddingRight: '2.5rem',
                    backgroundImage: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a country...</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                </select>
                <ChevronDown size={16} strokeWidth={1.2} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </AccordionItem>

          {/* Section: Billing */}
          <AccordionItem id="billing" title="Billing & Tax Data" icon={Landmark}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  billingStreet: prev.shippingStreet, 
                  billingCity: prev.shippingCity, 
                  billingZip: prev.shippingZip, 
                  billingCountry: prev.shippingCountry 
                }))}
                style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Copy from shipping
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">BILLING STREET ADDRESS</label>
              <input type="text" name="billingStreet" value={formData.billingStreet} onChange={handleChange} className="premium-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">CITY</label>
                <input type="text" name="billingCity" value={formData.billingCity} onChange={handleChange} className="premium-input" />
              </div>
              <div className="form-group">
                <label className="form-label">POSTAL / ZIP</label>
                <input type="text" name="billingZip" value={formData.billingZip} onChange={handleChange} className="premium-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">TAX ID / VAT NUMBER</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="premium-input" placeholder="Optional for institutional invoicing" />
            </div>
            <div className="form-group">
              <label className="form-label">COUNTRY / REGION</label>
              <div style={{ position: 'relative' }}>
                <select 
                  name="billingCountry" 
                  value={formData.billingCountry} 
                  onChange={handleChange} 
                  className="premium-input"
                  style={{ 
                    appearance: 'none', WebkitAppearance: 'none', 
                    paddingRight: '2.5rem',
                    backgroundImage: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a country...</option>
                  {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                </select>
                <ChevronDown size={16} strokeWidth={1.2} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </AccordionItem>

          <div style={{ position: 'sticky', bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))', marginTop: '3rem', zIndex: 10 }}>
            <div style={{ 
              background: 'white', padding: '1.25rem 2rem', borderRadius: '24px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                {saveStatus === 'success' && (
                  <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700 }}>
                    <CheckCircle2 size={18} strokeWidth={1.2} /> Profile updated
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontWeight: 700 }}>
                    <AlertCircle size={18} strokeWidth={1.2} /> Error saving changes
                  </div>
                )}
                {!saveStatus && !isSaving && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Unsaved changes in profile</p>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSaving}
                style={{ padding: '0.85rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0, 54, 102, 0.2)' }}
              >
                {isSaving ? <span className="spinner" style={{ width: '16px', height: '16px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : <Save size={18} strokeWidth={1.2} />}
                {isSaving ? 'Processing...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
