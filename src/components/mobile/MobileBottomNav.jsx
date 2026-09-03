"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  Package, 
  Sparkles, 
  Menu, 
  User, 
  Activity,
  Layers,
  ShoppingBag
} from '@/lib/icons';

const ROLE_BOTTOM_ITEMS = {
  admin: [
    { id: 'overview', label: 'Overview', path: '/admin', icon: Home },
    { id: 'catalog', label: 'Catalog', path: '/admin/catalog', icon: Layers },
    { id: 'users', label: 'Operations', path: '/admin?s=operations&t=users', icon: Users },
    { id: 'ai', label: 'Atlas AI', action: 'open_ai', icon: Sparkles, isAi: true },
    { id: 'menu', label: 'Menu', action: 'open_sidebar', icon: Menu },
  ],
  doctor: [
    { id: 'patients', label: 'Patients', path: '/doctor/patients', icon: Users },
    { id: 'prescriptions', label: 'Prescriptions', path: '/admin/prescriptions', icon: FileText },
    { id: 'catalog', label: 'Formulary', path: '/admin/catalog', icon: BookOpen },
    { id: 'ai', label: 'Clinical AI', action: 'open_ai', icon: Sparkles, isAi: true },
    { id: 'menu', label: 'More', action: 'open_sidebar', icon: Menu },
  ],
  patient: [
    { id: 'home', label: 'Home', path: '/patient', icon: Home },
    { id: 'protocols', label: 'Protocols', path: '/patient', icon: Activity },
    { id: 'orders', label: 'Orders', path: '/orders', icon: Package },
    { id: 'ai', label: 'Care AI', action: 'open_ai', icon: Sparkles, isAi: true },
    { id: 'profile', label: 'Profile', path: '/patient', icon: User },
  ],
  wholesaler: [
    { id: 'home', label: 'Dashboard', path: '/wholesaler', icon: Home },
    { id: 'catalog', label: 'Wholesale', path: '/admin/catalog', icon: ShoppingBag },
    { id: 'orders', label: 'Orders & RFQ', path: '/orders', icon: Package },
    { id: 'ai', label: 'B2B Copilot', action: 'open_ai', icon: Sparkles, isAi: true },
    { id: 'menu', label: 'Account', action: 'open_sidebar', icon: Menu },
  ],
  supplier: [
    { id: 'home', label: 'Supply Hub', path: '/wholesaler', icon: Home },
    { id: 'catalog', label: 'API Catalog', path: '/admin/catalog', icon: Layers },
    { id: 'orders', label: 'Purchase Orders', path: '/orders', icon: Package },
    { id: 'ai', label: 'Supply AI', action: 'open_ai', icon: Sparkles, isAi: true },
    { id: 'menu', label: 'Menu', action: 'open_sidebar', icon: Menu },
  ],
  guest: [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'catalog', label: 'Catalog', path: '/admin/catalog', icon: BookOpen },
    { id: 'ai', label: 'Atlas AI', action: 'open_ai', icon: Sparkles, isAi: true },
    { id: 'login', label: 'Sign In', path: '/login', icon: User },
  ]
};

export default function MobileBottomNav({ onOpenSidebar, onOpenAi }) {
  const pathname = usePathname() || '';
  const { activeRole } = useAuth();
  const { simulatedRole } = useSimulationStore();
  const effectiveRole = simulatedRole || activeRole || 'guest';

  const items = ROLE_BOTTOM_ITEMS[effectiveRole] || ROLE_BOTTOM_ITEMS.guest;

  const handleAction = (item, e) => {
    if (item.action === 'open_sidebar') {
      e.preventDefault();
      if (onOpenSidebar) onOpenSidebar();
    } else if (item.action === 'open_ai') {
      e.preventDefault();
      if (onOpenAi) {
        onOpenAi();
      } else {
        window.dispatchEvent(new CustomEvent('open-clinical-ai'));
      }
    }
  };

  return (
    <>
      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: calc(56px + env(safe-area-inset-bottom, 8px));
            padding-bottom: env(safe-area-inset-bottom, 8px);
            background: rgba(255, 255, 255, 0.94);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid rgba(0, 0, 0, 0.08);
            z-index: 990;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
            align-items: center;
            justify-content: space-around;
            box-sizing: border-box;
          }
          .mobile-bottom-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            color: #64748b;
            text-decoration: none;
            background: none;
            border: none;
            padding: 4px 0;
            cursor: pointer;
            transition: color 0.15s ease, transform 0.1s ease;
            -webkit-tap-highlight-color: transparent;
          }
          .mobile-bottom-nav-item:active {
            transform: scale(0.92);
          }
          .mobile-bottom-nav-item.active {
            color: var(--color-primary, #003666);
            font-weight: 700;
          }
          .mobile-bottom-nav-item.active .mobile-nav-icon-wrapper {
            background: rgba(0, 54, 102, 0.08);
            color: var(--color-primary, #003666);
          }
          .mobile-nav-icon-wrapper {
            width: 32px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            transition: all 0.2s ease;
          }
          .mobile-nav-icon-wrapper.ai-glow {
            background: linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(124, 58, 237, 0.15));
            color: #4285f4;
            box-shadow: 0 0 10px rgba(66, 133, 244, 0.25);
          }
          .mobile-bottom-nav-label {
            font-size: 0.65rem;
            line-height: 1;
            letter-spacing: -0.01em;
          }
        }
      `}</style>
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.path && (
            item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path)
          );

          if (item.action) {
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-bottom-nav-item ${item.isAi ? 'ai-item' : ''}`}
                onClick={(e) => handleAction(item, e)}
                aria-label={item.label}
              >
                <div className={`mobile-nav-icon-wrapper ${item.isAi ? 'ai-glow' : ''}`}>
                  <Icon size={18} />
                </div>
                <span className="mobile-bottom-nav-label">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
            >
              <div className="mobile-nav-icon-wrapper">
                <Icon size={18} />
              </div>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
