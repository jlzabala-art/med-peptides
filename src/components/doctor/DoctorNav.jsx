import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Save, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DoctorNav.module.css';

// Header navigation items for doctor view
const menuItems = [
  { to: 'dashboard', label: 'Dashboard', icon: Home },
  { to: 'my-protocols', label: 'My Protocols', icon: FileText },
  { to: 'saved-items', label: 'Saved Items', icon: Save },
  { to: 'orders', label: 'Orders', icon: ShoppingCart },
];

export default function DoctorNav() {
  const { user } = useAuth();
  const displayName = user?.displayName || 'Jose Luis Zabala';
  return (
    <header className="doctor-nav-header" style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{displayName}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>VIEW: DOCTOR (CONTEXT)</span>
      </div>
      <nav style={{ display: 'flex', gap: '1.5rem' }} aria-label="Doctor navigation">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={`/doctor/${to}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
