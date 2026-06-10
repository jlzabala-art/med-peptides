import React, { useState } from 'react';
import { X, Save, AlertTriangle, Users, Globe, DollarSign, Cpu, Layers } from 'lucide-react';

export default function RoleEditorModal({ role, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('modules');
  
  // Dummy local state for editing
  const [editedRole, setEditedRole] = useState({ ...role });

  const tabs = [
    { id: 'modules', label: 'Modules & Actions', icon: Layers },
    { id: 'territories', label: 'Territories', icon: Globe },
    { id: 'pricing', label: 'Pricing Visibility', icon: DollarSign },
    { id: 'ai', label: 'AI Tools', icon: Cpu },
    { id: 'zoho', label: 'Zoho Integration', icon: Layers },
  ];

  const handleSave = () => {
    // Show impact analysis before actually saving
    if (window.confirm(`This change affects:\n\n- ${role.userCount || 0} users\n- 120 products visibility\n\nProceed to save?`)) {
      onSave(editedRole);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        width: '100%',
        maxWidth: '850px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
        
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-surface)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: role.color || 'var(--primary)' }} />
              Edit Role: {role.name}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {role.description}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Sidebar Tabs */}
          <div style={{ width: '250px', borderRight: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)', padding: '1rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--color-bg-surface)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  marginBottom: '0.25rem',
                  boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            {activeTab === 'modules' && (
              <div>
                <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Module Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Define granular access for each system module.</p>
                
                {['Inventory', 'Sales', 'CRM', 'Finance'].map(mod => (
                  <div key={mod} style={{ marginBottom: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>{mod}</div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {['View', 'Create', 'Edit', 'Approve', 'Delete'].map(action => (
                        <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked={Math.random() > 0.5} style={{ cursor: 'pointer' }} />
                          {action}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'territories' && (
              <div>
                <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Territory Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Restrict visibility to specific geographical areas.</p>
                {['Global', 'UAE', 'KSA', 'Qatar', 'EU', 'US'].map(terr => (
                  <label key={terr} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <input type="checkbox" defaultChecked={terr === 'UAE'} style={{ cursor: 'pointer' }} />
                    {terr} Access
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div>
                <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Pricing Visibility</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Control what pricing tiers this role can see.</p>
                {['Cost', 'Margin', 'Retail Price', 'Clinic Price', 'Wholesaler Price'].map(price => (
                  <label key={price} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <input type="checkbox" defaultChecked={price.includes('Price')} style={{ cursor: 'pointer' }} />
                    Can See {price}
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'ai' && (
              <div>
                <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>AI Tools Access</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Enable or disable specific Atlas AI capabilities.</p>
                {['Atlas Chat', 'Protocol Builder', 'Pricing Intelligence', 'Financial Intelligence', 'Catalog Enrichment'].map(aiTool => (
                  <label key={aiTool} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <input type="checkbox" defaultChecked={aiTool === 'Atlas Chat'} style={{ cursor: 'pointer' }} />
                    {aiTool}
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'zoho' && (
              <div>
                <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Zoho Integration</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Control what data from Zoho this role can view or manipulate.</p>
                {['View Customers', 'View Invoices', 'View Bills', 'Approve Bills', 'Create Purchase Orders', 'Sync Products', 'View Profitability'].map(zohoMod => (
                  <label key={zohoMod} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <input type="checkbox" defaultChecked={zohoMod.includes('View')} style={{ cursor: 'pointer' }} />
                    Can {zohoMod}
                  </label>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Footer with Impact Analysis & Actions */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#d97706',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={18} />
            <div>
              <span style={{ fontWeight: 600 }}>Impact Analysis:</span> This change will affect <strong>{role.userCount || 0} users</strong> immediately upon saving.
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onClose} className="gcp-btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              Cancel
            </button>
            <button onClick={handleSave} className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
