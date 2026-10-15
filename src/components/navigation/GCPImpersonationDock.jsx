"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sliders,
  ExternalLink,
  User,
  Stethoscope,
  FlaskConical,
  Globe,
  ChevronDown,
  X,
  Search,
  Zap,
  ArrowRight,
  ShieldCheck,
  Minimize2,
  Maximize2
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';

export default function GCPImpersonationDock() {
  const pathname = usePathname();
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Activate AM session if visiting /account-manager or /tools, or if stored in sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (pathname?.startsWith('/account-manager') || pathname?.startsWith('/tools')) {
      sessionStorage.setItem('atlas_am_session', 'active');
      setIsActive(true);
    } else {
      const stored = sessionStorage.getItem('atlas_am_session');
      if (stored === 'active') {
        setIsActive(true);
      }
    }
  }, [pathname]);

  if (!isActive) return null;

  // Detect current context
  let currentContext = 'Public View';
  let contextColor = '#1a73e8';
  if (pathname?.startsWith('/dr/')) {
    const slug = pathname.replace('/dr/', '').split('/')[0];
    currentContext = `Doctor Portal: Dr. ${slug.replace(/-/g, ' ')}`;
    contextColor = '#137333';
  } else if (pathname?.startsWith('/doctor')) {
    currentContext = 'Clinical Workspace';
    contextColor = '#137333';
  } else if (pathname?.startsWith('/rx/')) {
    const code = pathname.replace('/rx/', '').split('/')[0];
    currentContext = `Patient Rx: ${code}`;
    contextColor = '#7c3aed';
  } else if (pathname?.startsWith('/lab/')) {
    const code = pathname.replace('/lab/', '').split('/')[0];
    currentContext = `Patient Lab: ${code}`;
    contextColor = '#7c3aed';
  } else if (pathname?.startsWith('/p/')) {
    const slug = pathname.replace('/p/', '').split('/')[0];
    currentContext = `Monograph: ${slug.toUpperCase()}`;
    contextColor = '#b06000';
  } else if (pathname?.startsWith('/account-manager') || pathname?.startsWith('/tools')) {
    currentContext = 'Account Manager Operations Hub';
    contextColor = '#1a73e8';
  }

  const handleOpenSearch = (initialFilter = '') => {
    triggerHaptic('selection');
    window.dispatchEvent(new CustomEvent('open-gcp-command-palette', { detail: { filter: initialFilter } }));
  };

  const handleExitAMMode = () => {
    triggerHaptic('impact');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('atlas_am_session');
    }
    setIsActive(false);
  };

  const hasSidebar = pathname?.startsWith('/account-manager') || pathname?.startsWith('/tools') || pathname?.startsWith('/admin');

  // Minimized Floating Pill (Google Cloud UX)
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '20px',
          zIndex: 99990,
          background: '#ffffff',
          color: '#202124',
          borderRadius: '24px',
          padding: '7px 14px',
          boxShadow: '0 4px 14px rgba(60,64,67,0.2)',
          border: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        onClick={() => { triggerHaptic('selection'); setIsMinimized(false); }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#137333', boxShadow: '0 0 6px #137333' }} />
        <span>Account Manager Bar</span>
        <Maximize2 size={13} style={{ color: '#5f6368' }} />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .gcp-dock-wrapper {
          position: fixed;
          bottom: 16px;
          z-index: 99990;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 10px;
          padding: 8px 14px;
          color: #202124;
          box-shadow: 0 4px 20px rgba(60, 64, 67, 0.18), 0 1px 3px rgba(60, 64, 67, 0.12);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: all 0.2s ease;
        }

        /* When on desktop with a sidebar: MUST ONLY SIT IN THE MAIN AREA WITHOUT OVERLAPPING THE SIDEBAR */
        @media (min-width: 900px) {
          .gcp-dock-wrapper.has-sidebar {
            left: calc(260px + 2rem);
            right: 2rem;
            max-width: 1100px;
            transform: none;
            width: auto;
          }
          .gcp-dock-wrapper:not(.has-sidebar) {
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 32px);
            max-width: 1060px;
          }
        }

        /* Mobile View */
        @media (max-width: 899px) {
          .gcp-dock-wrapper {
            left: 12px;
            right: 12px;
            transform: none;
            width: auto;
            padding: 6px 10px;
          }
          .gcp-dock-context {
            display: none !important;
          }
        }
      `}</style>

      <aside
        aria-label="Google Cloud Account Manager Bar"
        className={`gcp-dock-wrapper ${hasSidebar ? 'has-sidebar' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          
          {/* Left: GCP Status Badge & Live Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#137333', boxShadow: '0 0 6px #137333' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#137333' }}>
                Account Manager
              </span>
            </div>

            <div style={{ width: 1, height: 16, background: '#e0e0e0' }} />

            <div className="gcp-dock-context" style={{ fontSize: '0.78rem', fontWeight: 650, color: '#3c4043', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: contextColor, fontSize: '0.7rem' }}>●</span>
              <span style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentContext}
              </span>
            </div>
          </div>

          {/* Center: Simplified Search Launcher (Algolia Integrated for Patients, Doctors, Products) */}
          <div
            onClick={() => handleOpenSearch()}
            style={{
              flex: 1,
              minWidth: '220px',
              maxWidth: '440px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#f1f3f4',
              border: '1px solid #dadce0',
              color: '#5f6368',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e8eaed'; e.currentTarget.style.borderColor = '#1a73e8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f3f4'; e.currentTarget.style.borderColor = '#dadce0'; }}
            title="Search patients, doctors, and products across Algolia"
          >
            <Search size={14} style={{ color: '#1a73e8', flexShrink: 0 }} />
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Search patients, doctors, or products...
            </span>
            <kbd style={{ fontSize: '0.66rem', padding: '1px 6px', borderRadius: '4px', background: '#ffffff', border: '1px solid #dadce0', color: '#3c4043', fontFamily: 'monospace', fontWeight: 700 }}>
              ⌘K
            </kbd>
          </div>

          {/* Right: Quick Direct Navigation Chips & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <Link
              href="/account-manager"
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1a73e8',
                fontSize: '0.74rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Open Account Manager Hub"
            >
              <Sliders size={12} />
              <span>Hub Console</span>
            </Link>

            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setIsMinimized(true); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5f6368',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Minimize bar"
            >
              <Minimize2 size={13} />
            </button>

            <button
              type="button"
              onClick={handleExitAMMode}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#d93025',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
              title="Exit Account Manager Mode"
            >
              <X size={14} />
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
