"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePortalNavigation } from '../../hooks/ui/usePortalNavigation';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut } from '@/lib/icons';




export default function PortalSidebar() {
  const { navGroups } = usePortalNavigation();
  const { userProfile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'none' // Handled by CSS media queries usually
        }}
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`portal-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: '280px',
          background: 'white',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          transform: isOpen ? 'translateX(0)' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header / Logo */}
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              RegenPept
            </h2>
          </Link>
          <button 
            className="mobile-close-btn"
            onClick={toggleSidebar} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
          {navGroups.map((group) => (
            <div key={group.id} style={{ marginBottom: '2rem' }}>
              <div style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--text-muted)', 
                fontWeight: 800,
                marginBottom: '0.75rem',
                paddingLeft: '0.5rem'
              }}>
                {group.label}
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link 
                      href={item.path} 
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: item.active ? 'var(--primary)' : 'var(--text-main)',
                        background: item.active ? 'var(--primary-light, #eff6ff)' : 'transparent',
                        fontWeight: item.active ? 700 : 500,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout at Bottom */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'var(--primary)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800 
            }}>
              {userProfile?.firstName?.[0] || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {userProfile?.firstName} {userProfile?.lastName}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {userProfile?.role}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              logout?.();
              window.location.href = '/';
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-sidebar-toggle {
            display: flex !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .portal-sidebar {
            position: fixed !important;
            transform: translateX(-100%) !important;
          }
          .portal-sidebar.open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
