import Calendar from "lucide-react/dist/esm/icons/calendar";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Bot from "lucide-react/dist/esm/icons/bot";
import Mail from "lucide-react/dist/esm/icons/mail";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import React from 'react';
import { useAuth } from '../../../context/AuthContext';







import toast from 'react-hot-toast';

export default function IntegrationsSection() {
  const { isProfessional } = useAuth();
  // This would typically come from Firestore or a backend API
  const integrations = [
    { id: 'google-calendar', name: 'Google Calendar', icon: Calendar, description: 'Sync your appointments and availability.', status: 'connected', color: '#ea4335' },
    { id: 'slack', name: 'Slack', icon: MessageSquare, description: 'Get notifications and updates in your channels.', status: 'disconnected', color: '#4a154b' },
    { id: 'stripe', name: 'Stripe', icon: CreditCard, description: 'Process payments and manage billing.', status: isProfessional ? 'connected' : 'disconnected', color: '#635bff' },
    { id: 'openai', name: 'OpenAI (Atlas AI)', icon: Bot, description: 'Power the Atlas AI Assistant with advanced models.', status: 'connected', color: '#10a37f' },
    { id: 'outlook', name: 'Microsoft Outlook', icon: Mail, description: 'Sync emails and calendar events.', status: 'disconnected', color: '#0078d4' },
    { id: 'zoho', name: 'Zoho CRM', icon: Link2, description: 'Two-way sync for patient and customer records.', status: 'disconnected', color: '#19a9e5' },
  ];

  const toggleConnection = (integration) => {
    if (integration.status === 'connected') {
      toast(`${integration.name} disconnected (Mock).`);
    } else {
      toast.success(`${integration.name} connected successfully (Mock).`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Connected Apps & Integrations</h3>
      <p style={{ margin: '0 0 2rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Connect Atlas Health with your favorite tools to streamline your workflow.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {integrations.map(app => (
          <div key={app.id} style={{
            border: `1px solid ${app.status === 'connected' ? 'var(--primary-light)' : 'var(--border)'}`,
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: app.status === 'connected' ? 'rgba(0, 54, 102, 0.02)' : 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${app.color}15`, color: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <app.icon size={20} />
              </div>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                padding: '0.2rem 0.6rem', borderRadius: '99px',
                backgroundColor: app.status === 'connected' ? 'var(--success-light)' : 'var(--background)',
                color: app.status === 'connected' ? 'var(--success)' : 'var(--text-muted)'
              }}>
                {app.status}
              </span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{app.name}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{app.description}</p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => window.open('#', '_blank')}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Learn more <ExternalLink size={12} />
              </button>
              <button 
                onClick={() => toggleConnection(app)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: app.status === 'connected' ? 'white' : 'var(--primary)',
                  color: app.status === 'connected' ? 'var(--error)' : 'white',
                  border: `1px solid ${app.status === 'connected' ? 'var(--error)' : 'var(--primary)'}`
                }}
              >
                {app.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}