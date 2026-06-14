import React, { useState } from 'react';
import Shield from "lucide-react/dist/esm/icons/shield";
import Map from "lucide-react/dist/esm/icons/map";
import User from "lucide-react/dist/esm/icons/user";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import X from "lucide-react/dist/esm/icons/x";
import { TextField, Toggle } from '../ui';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';

export default function AccountManagerWizard({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'account_manager',
    territories: [],
    canModifyTerritories: false,
    canAccessAnalytics: false,
    canManageOrders: true
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleCreate = async () => {
    try {
      setLoading(true);
      const inviteUser = httpsCallable(functions, 'inviteUser');
      await inviteUser({
        email: formData.email,
        displayName: formData.name,
        role: formData.role,
        claims: {
          canModifyTerritories: formData.canModifyTerritories,
          canAccessAnalytics: formData.canAccessAnalytics,
          canManageOrders: formData.canManageOrders
        }
      });
      toast.success('Account Manager invited successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating manager:', error);
      toast.error('Failed to create account manager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Territories', icon: Map },
    { id: 3, label: 'Permissions', icon: Shield },
    { id: 4, label: 'Review', icon: CheckCircle2 }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998 }} 
        onClick={onClose}
      />
      {/* Modal */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Onboard Account Manager</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Wizard Progress */}
        <div style={{ display: 'flex', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', gap: '0.5rem' }}>
          {steps.map((s, idx) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: step >= s.id ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                color: step >= s.id ? '#fff' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.8rem'
              }}>
                <s.icon size={16} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: step >= s.id ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {s.label}
              </div>
              {idx < steps.length - 1 && <div style={{ flex: 1, height: '2px', backgroundColor: step > s.id ? 'var(--color-primary)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: '300px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Personal Information</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Full Name</label>
                <TextField 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Email Address</label>
                <TextField 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="e.g. john@atlashealth.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Phone Number (Optional)</label>
                <TextField 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Assign Territories</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Select the geographical areas this manager will be responsible for. By default, they have global coverage until specific territories are defined.
              </p>
              <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <Map size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 500 }}>Global Coverage Active</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Specific territory assignments will be available in a future update.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Module Permissions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Toggle 
                  label="CRM Access (Default)" 
                  checked={true} 
                  onChange={() => {}} 
                />
                <Toggle 
                  label="Manage Orders & Invoices" 
                  checked={formData.canManageOrders} 
                  onChange={(checked) => setFormData({...formData, canManageOrders: checked})} 
                />
                <Toggle 
                  label="Modify Territory Boundaries" 
                  checked={formData.canModifyTerritories} 
                  onChange={(checked) => setFormData({...formData, canModifyTerritories: checked})} 
                />
                <Toggle 
                  label="Advanced Analytics Access" 
                  checked={formData.canAccessAnalytics} 
                  onChange={(checked) => setFormData({...formData, canAccessAnalytics: checked})} 
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Review & Invite</h3>
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Name:</span>
                  <span style={{ fontWeight: 500 }}>{formData.name || 'Not provided'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email:</span>
                  <span style={{ fontWeight: 500 }}>{formData.email || 'Not provided'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Territories:</span>
                  <span style={{ fontWeight: 500 }}>Global</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Permissions:</span>
                  <span style={{ fontWeight: 500 }}>
                    {[
                      'CRM', 
                      formData.canManageOrders && 'Orders', 
                      formData.canModifyTerritories && 'Territories', 
                      formData.canAccessAnalytics && 'Analytics'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                An invitation email will be sent to <strong>{formData.email}</strong> allowing them to set their password and access the platform.
              </p>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--color-bg-subtle)' }}>
          <button 
            className="btn btn-outline" 
            onClick={step === 1 ? onClose : handlePrev}
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button 
              className="btn btn-primary" 
              onClick={handleNext}
              disabled={step === 1 && (!formData.name || !formData.email)}
            >
              Next Step
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
