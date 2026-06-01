import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell, FiCpu } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import AtlasHealthLogo from '../components/brand/AtlasHealthLogo';

export default function PortalHeader({ onToggleAI }) {
  const { userProfile, activeRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Create a simple breadcrumb from the pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0 
    ? pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')
    : 'Dashboard';

  return (
    <header className="portal-header">
      <div className="header-left">
        <AtlasHealthLogo size={24} style={{ marginRight: '1rem', opacity: 0.8 }} />
        <h1 className="header-title">{breadcrumb}</h1>
      </div>

      <div className="header-right">
        {/* Global Search */}
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        {/* Notifications */}
        <button className="icon-btn" aria-label="Notifications">
          <FiBell className="bell-ringing" />
          <span className="badge">3</span>
        </button>

        {/* AI Assistant Trigger */}
        <button 
          className="icon-btn" 
          onClick={onToggleAI}
          title="Open AI Assistant"
          aria-label="Ask AI"
          style={{ color: 'var(--color-primary, #003666)' }}
        >
          <FiCpu />
        </button>

        {/* User Profile */}
        <div className="user-profile" onClick={() => navigate('/profile')} title="Manage Account Settings">
          <div className="avatar">
            {userProfile?.firstName?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
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
      `}</style>
    </header>
  );
}
