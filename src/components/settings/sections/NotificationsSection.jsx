import Mail from "lucide-react/dist/esm/icons/mail";
import Smartphone from "lucide-react/dist/esm/icons/smartphone";
import BellRing from "lucide-react/dist/esm/icons/bell-ring";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAutoSave } from '../../../hooks/useAutoSave';





export default function NotificationsSection() {
  const { userProfile, updateProfileData } = useAuth();

  const { data, updateField } = useAutoSave({
    operational: userProfile?.notifications?.operational || { email: true, push: true, inApp: true, whatsapp: false },
    medical: userProfile?.notifications?.medical || { email: true, push: true, inApp: true, whatsapp: false },
    ai: userProfile?.notifications?.ai || { email: false, push: false, inApp: true, whatsapp: false },
    security: userProfile?.notifications?.security || { email: true, push: true, inApp: true, whatsapp: true },
  }, async (changedFields) => {
    const fullPayload = {
      notifications: {
        ...(userProfile?.notifications || {}),
        ...data,
        ...changedFields
      }
    };
    await updateProfileData(fullPayload);
  }, 1000);

  const handleToggle = (category, channel, disabled) => {
    if (disabled) return;
    const updatedCategory = { ...data[category], [channel]: !data[category][channel] };
    updateField(category, updatedCategory);
  };

  const categories = [
    { id: 'operational', title: 'Operational Updates', desc: 'Order status, shipping updates, and billing information.' },
    { id: 'medical', title: 'Medical & Clinical', desc: 'Prescription approvals, lab results, and patient updates.' },
    { id: 'ai', title: 'AI Assistant', desc: 'Smart recommendations, anomalies detected, and daily summaries.' },
    { id: 'security', title: 'Security Alerts', desc: 'New logins, password changes, and sensitive access warnings.' },
  ];

  const channels = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'push', label: 'Push Notifications', icon: Smartphone },
    { id: 'inApp', label: 'In-App', icon: BellRing },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  const ToggleSwitch = ({ checked, disabled, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        width: '40px', height: '24px', borderRadius: '12px',
        backgroundColor: disabled ? 'var(--border)' : (checked ? 'var(--primary)' : 'rgba(0,0,0,0.1)'),
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        backgroundColor: 'white', position: 'absolute', top: '2px',
        left: checked ? '18px' : '2px', transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }} />
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Notification Center</h3>
      <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Choose how and when you want to be notified across different channels.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {categories.map((cat) => (
          <div key={cat.id} style={{ 
            border: '1px solid var(--border)', 
            borderRadius: '12px', 
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{cat.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.desc}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', backgroundColor: 'var(--border)' }}>
              {channels.map((channel) => {
                const isChecked = data[cat.id]?.[channel.id] || false;
                const isDisabled = cat.id === 'security' && (channel.id === 'email' || channel.id === 'inApp') && isChecked;
                return (
                  <div key={channel.id} style={{ 
                    padding: '1rem 1.25rem', backgroundColor: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDisabled ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      <channel.icon size={16} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{channel.label}</span>
                    </div>
                    <ToggleSwitch 
                      checked={isChecked} 
                      disabled={isDisabled} 
                      onClick={() => handleToggle(cat.id, channel.id, isDisabled)} 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}