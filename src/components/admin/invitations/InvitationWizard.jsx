import User from "lucide-react/dist/esm/icons/user";
import Shield from "lucide-react/dist/esm/icons/shield";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Cpu from "lucide-react/dist/esm/icons/cpu";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Send from "lucide-react/dist/esm/icons/send";
import Mail from "lucide-react/dist/esm/icons/mail";
import React, { useState } from 'react';











const STEPS = [
  { id: 'user', label: 'User Profile', icon: User },
  { id: 'access', label: 'Access & Roles', icon: Shield },
  { id: 'territory', label: 'Territories', icon: MapPin },
  { id: 'pricing', label: 'Pricing Visibility', icon: DollarSign },
  { id: 'ai', label: 'AI Access', icon: Cpu },
  { id: 'review', label: 'Review & Send', icon: CheckCircle }
];

const ROLES = [
  { id: 'admin', label: 'Admin', desc: 'Full system access', color: 'var(--color-danger)' },
  { id: 'clinic', label: 'Clinic', desc: 'Manage patients & doctors', color: '#8b5cf6' },
  { id: 'doctor', label: 'Practitioner', desc: 'Can prescribe & view protocols', color: 'var(--color-success)' },
  { id: 'wholesaler', label: 'Wholesaler', desc: 'Can place B2B orders', color: '#f59e0b' },
  { id: 'sales_agent', label: 'Sales Agent', desc: 'Manage clinics & opportunities', color: 'var(--color-primary)' },
  { id: 'patient', label: 'Patient', desc: 'Access own protocols', color: '#ec4899' },
];

const TERRITORIES = ['Global', 'North America', 'EU', 'UAE', 'KSA', 'Qatar', 'LATAM'];
const PRICING_TIERS = ['Retail Pricing', 'Clinic Pricing', 'Wholesale Pricing', 'Distributor Pricing', 'Cost Prices', 'Margins'];
const AI_FEATURES = ['Atlas Assistant', 'Protocol Builder', 'Prescription AI', 'Inventory AI', 'Finance AI', 'Clinical Intelligence'];

export default function InvitationWizard({ onSend, onCancel, isSending }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
    roles: [],
    territories: [],
    pricingVisibility: [],
    aiAccess: {},
    message: ''
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleToggleArray = (field, value) => {
    setFormData(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      };
    });
  };

  const handleToggleAI = (feature) => {
    setFormData(prev => ({
      ...prev,
      aiAccess: { ...prev.aiAccess, [feature]: !prev.aiAccess[feature] }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div>
              <label className="gcp-label">Email Address *</label>
              <input type="email" className="gcp-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. doctor@clinic.com" autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="gcp-label">Full Name</label>
                <input type="text" className="gcp-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. Sarah Miller" />
              </div>
              <div>
                <label className="gcp-label">Organization / Clinic</label>
                <input type="text" className="gcp-input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Wellness Clinic" />
              </div>
            </div>
            <div>
              <label className="gcp-label">Phone Number</label>
              <input type="tel" className="gcp-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 555-0199" />
            </div>
          </div>
        );
      case 1:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
            {ROLES.map(role => {
              const isSelected = formData.roles.includes(role.id);
              return (
                <div 
                  key={role.id}
                  onClick={() => handleToggleArray('roles', role.id)}
                  style={{ 
                    padding: '1.5rem', border: `2px solid ${isSelected ? role.color : 'var(--border)'}`, 
                    borderRadius: '12px', cursor: 'pointer', backgroundColor: isSelected ? `${role.color}08` : 'white',
                    transition: 'all 0.2s', position: 'relative'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    {role.label}
                    {isSelected && <CheckCircle size={18} color={role.color} />}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.desc}</div>
                </div>
              );
            })}
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
            {TERRITORIES.map(t => {
               const isSelected = formData.territories.includes(t);
               return (
                 <div 
                   key={t}
                   onClick={() => handleToggleArray('territories', t)}
                   style={{
                     padding: '0.75rem 1.5rem', borderRadius: '30px', fontWeight: 600, cursor: 'pointer',
                     border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                     backgroundColor: isSelected ? 'var(--primary)' : 'white',
                     color: isSelected ? 'white' : 'var(--text-main)', transition: 'all 0.2s'
                   }}
                 >
                   {t}
                 </div>
               );
            })}
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Define what prices and margins this user is allowed to see.</p>
            {PRICING_TIERS.map(pt => {
               const isSelected = formData.pricingVisibility.includes(pt);
               return (
                 <label key={pt} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: isSelected ? '#f0f9ff' : 'white' }}>
                   <input type="checkbox" checked={isSelected} onChange={() => handleToggleArray('pricingVisibility', pt)} style={{ width: 18, height: 18 }} />
                   <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{pt}</span>
                 </label>
               );
            })}
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Assign AI capabilities to this user.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {AI_FEATURES.map(ai => {
                 const isEnabled = !!formData.aiAccess[ai];
                 return (
                   <div key={ai} onClick={() => handleToggleAI(ai)} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <Cpu size={18} color={isEnabled ? 'var(--primary)' : 'var(--text-muted)'} />
                       <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ai}</span>
                     </div>
                     <div style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: isEnabled ? 'var(--primary)' : '#e2e8f0', position: 'relative', transition: 'all 0.2s' }}>
                       <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: 2, left: isEnabled ? 22 : 2, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : <Mail size={24} />}
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{formData.name || 'Unknown User'}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formData.email || 'No email provided'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Assigned Roles</div>
                   <div style={{ fontWeight: 600 }}>{formData.roles.join(', ') || 'None'}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Organization</div>
                   <div style={{ fontWeight: 600 }}>{formData.company || 'None'}</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Territories</div>
                   <div style={{ fontWeight: 600 }}>{formData.territories.length} assigned</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>AI Features</div>
                   <div style={{ fontWeight: 600 }}>{Object.values(formData.aiAccess).filter(Boolean).length} enabled</div>
                 </div>
              </div>
            </div>
            <div>
              <label className="gcp-label">Custom Welcome Message (Optional)</label>
              <textarea className="gcp-input" rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Add a personal note to the email..." />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      {/* Wizard Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', maxWidth: '100%' }}>
          {STEPS.map((step, idx) => {
             const StepIcon = step.icon;
             const isActive = idx === currentStep;
             const isPast = idx < currentStep;
             return (
               <React.Fragment key={step.id}>
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: isActive || isPast ? 1 : 0.4, minWidth: '80px' }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: isActive ? 'var(--primary)' : isPast ? '#10b981' : '#e2e8f0', color: isActive || isPast ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {isPast ? <CheckCircle size={16} /> : <StepIcon size={16} />}
                   </div>
                   <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary)' : 'var(--text-main)', whiteSpace: 'nowrap' }}>{step.label}</span>
                 </div>
                 {idx < STEPS.length - 1 && (
                   <div style={{ width: '40px', height: '2px', backgroundColor: isPast ? '#10b981' : '#e2e8f0', marginBottom: '20px' }} />
                 )}
               </React.Fragment>
             );
          })}
        </div>
      </div>

      {/* Wizard Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
         <div style={{ maxWidth: '800px', margin: '0 auto' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
             {STEPS[currentStep].label}
           </h2>
           {renderStepContent()}
         </div>
      </div>

      {/* Wizard Footer */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="gcp-btn-secondary" onClick={onCancel} disabled={isSending}>Cancel</button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {currentStep > 0 && (
            <button className="gcp-btn-secondary" onClick={handlePrev} disabled={isSending} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button className="gcp-btn-primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button className="gcp-btn-primary" onClick={() => onSend(formData)} disabled={isSending} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', borderColor: '#10b981' }}>
              {isSending ? 'Sending...' : 'Send Invitation'} <Send size={16} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}