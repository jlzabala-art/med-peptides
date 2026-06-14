import Shield from "lucide-react/dist/esm/icons/shield";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import User from "lucide-react/dist/esm/icons/user";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';








export default function AdminPortalSwitcher() {
  const { isAdmin, activeRole, switchActiveRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAdmin) return null;

  const portals = [
    { id: 'admin', label: 'Admin Console', icon: Shield, route: '/admin' },
    { id: 'doctor', label: 'Clinical Portal', icon: Stethoscope, route: '/doctor' },
    { id: 'patient', label: 'Patient Portal', icon: User, route: '/patient' },
    { id: 'wholesaler', label: 'Wholesaler Portal', icon: Building2, route: '/wholesaler' },
    { id: 'compounding_pharmacy', label: 'Pharmacy Portal', icon: FlaskConical, route: '/pharmacy-dashboard' },
    { id: 'b2c', label: 'Go to B2C Shop', icon: ShoppingCart, route: '/' }
  ];

  const currentPortal = portals.find(p => p.id === activeRole) || {
    id: activeRole, label: 'Portal Switcher', icon: LayoutDashboard, route: '/'
  };

  const handleSwitch = (portal) => {
    switchActiveRole(portal.id);
    navigate(portal.route);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0, 54, 102, 0.05)',
          border: '1px solid rgba(0, 54, 102, 0.1)',
          padding: '0.5rem 0.8rem',
          borderRadius: '20px',
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontWeight: 600,
          fontSize: '0.85rem',
          height: '100%'
        }}
        title="Switch portal view"
      >
        <style>
          {`
            @media (max-width: 720px) {
              .admin-switcher-label { display: none; }
            }
          `}
        </style>
        {currentPortal.icon && <currentPortal.icon size={16} />}
        <span className="admin-switcher-label">{currentPortal.label}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '0.5rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '1px solid var(--color-border)',
          width: '220px',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Switch Portal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {portals.map(portal => (
              <button
                key={portal.id}
                onClick={() => handleSwitch(portal)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: activeRole === portal.id ? 'rgba(0, 54, 102, 0.05)' : 'white',
                  color: activeRole === portal.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: activeRole === portal.id ? 600 : 400,
                  transition: 'background 0.2s',
                  borderLeft: activeRole === portal.id ? '3px solid var(--color-primary)' : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                   if(activeRole !== portal.id) e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                   if(activeRole !== portal.id) e.currentTarget.style.background = 'white';
                }}
              >
                <portal.icon size={16} />
                {portal.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}