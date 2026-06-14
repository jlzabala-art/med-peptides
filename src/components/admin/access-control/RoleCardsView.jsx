import Users from "lucide-react/dist/esm/icons/users";
import Shield from "lucide-react/dist/esm/icons/shield";
import Globe from "lucide-react/dist/esm/icons/globe";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Cpu from "lucide-react/dist/esm/icons/cpu";
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Copy from "lucide-react/dist/esm/icons/copy";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import React from 'react';









export default function RoleCardsView({ roles, onEditRole, onCloneRole, onDeleteRole }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {roles.map((role) => (
        <div key={role.id} style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Shield size={16} color={role.color || 'var(--primary)'} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{role.name}</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onEditRole(role.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Edit Role"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onCloneRole(role.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                title="Clone Role"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Users size={14} />
                <span>Users</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{role.userCount || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Shield size={14} />
                <span>Permissions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }}>
                  <div style={{ width: `${role.accessPercentage || 0}%`, height: '100%', backgroundColor: role.color || 'var(--primary)', borderRadius: '2px' }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{role.accessPercentage || 0}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Globe size={14} />
                <span>Countries</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{role.territories || 'All'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <DollarSign size={14} />
                <span>Pricing</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{role.pricingLevel || 'None'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Cpu size={14} />
                <span>AI</span>
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{role.aiAccess || 'None'}</span>
            </div>

          </div>

          {/* Footer */}
          <div style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--background)',
            borderTop: '1px solid var(--border)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Last Modified: {role.lastModified || 'Unknown'}</span>
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => onEditRole(role.id)}>Edit</span>
          </div>

        </div>
      ))}
    </div>
  );
}