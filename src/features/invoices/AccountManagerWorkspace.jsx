import UserCircle from "lucide-react/dist/esm/icons/user-circle";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import React from 'react';






export default function AccountManagerWorkspace({ invoice }) {
  // Mock data for the account manager view
  return (
    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>Account Manager Workspace</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCircle size={20} color="var(--color-text-secondary)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{invoice.salesPerson || 'Unassigned'}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Account Owner</p>
        </div>
      </div>

      {/* Action Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <CheckSquare size={16} color="#3b82f6" style={{ marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Follow-up Call Required</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Customer promised payment by end of week.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button style={{ flex: 1, padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
          <Phone size={14} /> Log Call
        </button>
        <button style={{ flex: 1, padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
          <Mail size={14} /> Email
        </button>
        <button style={{ flex: 1, padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
          <Calendar size={14} /> Task
        </button>
      </div>
    </div>
  );
}