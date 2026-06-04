import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell, FiCpu } from 'react-icons/fi';
import { Globe, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import AtlasHealthLogo from '../components/brand/AtlasHealthLogo';

export default function PortalHeader({ onToggleAI, onToggleSidebar }) {
  const { userProfile, activeRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Create a simple breadcrumb from the pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0 
    ? pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
    : 'Dashboard';

  return (
    <header className="portal-header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
        <AtlasHealthLogo size={24} style={{ marginRight: '1rem', opacity: 0.8 }} className="hide-on-mobile" />
        <h1 className="header-title">{breadcrumb}</h1>
      </div>

      <div className="header-right">
        {/* Global Search */}
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder={t('header.search') || "Search..."} className="search-input" />
        </div>

        {/* Language Toggle */}
        <button 
          className="icon-btn" 
          aria-label="Toggle Language"
          onClick={toggleLanguage}
          title={t('header.language') || "Language"}
          style={{ position: 'relative' }}
        >
          <Globe size={18} strokeWidth={1.8} />
          <span style={{ 
            fontSize: '8px', 
            position: 'absolute', 
            top: '2px', 
            right: '2px', 
            fontWeight: 'bold', 
            background: 'var(--color-primary, #003666)', 
            color: 'white', 
            padding: '1px 3px', 
            borderRadius: '4px',
            lineHeight: '1'
          }}>
            {i18n.language.toUpperCase()}
          </span>
        </button>

        {/* Notifications */}
        <button className="icon-btn" aria-label="Notifications">
          <FiBell className="bell-ringing" />
          <span className="badge">3</span>
        </button>

        {/* AI Assistant Trigger */}
        <button 
          onClick={onToggleAI}
          aria-label="Open Atlas AI"
          style={{
            background: 'rgba(66, 133, 244, 0.1)',
            border: '1px solid rgba(66, 133, 244, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#4285F4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.4rem 0.6rem',
            transition: 'all 0.2s ease',
            gap: '0.35rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(66, 133, 244, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(66, 133, 244, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#4285F4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Atlas AI</span>
        </button>

        {/* User Profile */}
        <div className="user-profile" onClick={() => navigate('/profile')} title="Manage Account Settings">
          <div className="avatar">
            {(() => {
              const first = userProfile?.firstName || '';
              const last = userProfile?.lastName || '';
              if (first && last) {
                return (first.trim().charAt(0) + last.trim().charAt(0)).toUpperCase();
              }
              const fullName = first || '';
              if (fullName) {
                const parts = fullName.split(' ').filter(p => p.length > 0);
                if (parts.length >= 2) {
                  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                }
                return fullName.slice(0, 2).toUpperCase();
              }
              if (userProfile?.email) {
                return userProfile.email.slice(0, 2).toUpperCase();
              }
              return 'U';
            })()}
          </div>
          <div className="user-info">
            <span className="user-name">{userProfile?.firstName || 'User'}</span>
            <span className="user-role">{activeRole}</span>
          </div>
        </div>
      </div>

      <style>{`
        .portal-header {
          height: 64px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 900;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #4a5568;
          cursor: pointer;
          padding: 0.5rem;
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary, #1a202c);
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #a0aec0;
        }

        .search-input {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          width: 200px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary, #003666);
          width: 280px;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0, 54, 102, 0.1);
        }

        .icon-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #4a5568;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .icon-btn:hover {
          background: rgba(0,0,0,0.05);
        }

        .badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--color-danger, #e53e3e);
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          height: 16px;
          min-width: 16px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1rem;
          border-left: 1px solid rgba(0,0,0,0.1);
          cursor: pointer;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-primary, #003666);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text-primary, #1a202c);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--color-text-secondary, #718096);
          text-transform: capitalize;
        }

        @keyframes ring {
          0% { transform: rotate(0); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }

        .bell-ringing {
          animation: ring 2s infinite ease-in-out;
          transform-origin: top center;
          display: inline-block;
        }
        
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex; }
          .hide-on-mobile { display: none; }
          .portal-header { padding: 0 1rem; }
          .search-bar { display: none; }
          .header-title { font-size: 1rem; }
        }
      `}</style>
    </header>
  );
}
