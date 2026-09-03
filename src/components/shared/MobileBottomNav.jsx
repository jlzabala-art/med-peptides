import React from 'react';
import { Home, Calendar, Package, FileText, User } from '@/lib/icons';
import { useRouter } from 'next/navigation';

export default function MobileBottomNav({ activeId, onNavigate, navGroups = [] }) {
  const router = useRouter();

  const handleNav = (id, path) => {
    if (onNavigate) {
      onNavigate(id);
    } else if (path) {
      router.push(path);
    }
  };

  // Flatten groups to get the first 5 primary items for the bottom nav
  const flatItems = navGroups.reduce((acc, group) => {
    if (group.items) {
      return [...acc, ...group.items];
    }
    return acc;
  }, []);

  // Take top 5 items, fallback to some defaults if none provided
  const displayItems = flatItems.slice(0, 5);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className="mobile-bottom-nav bottom-nav">
      {displayItems.map((item) => {
        const Icon = item.icon || Home;
        return (
          <button
            key={item.id}
            className={`nav-item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => handleNav(item.id, item.path)}
          >
            <Icon size={24} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <style>{`
        .mobile-bottom-nav {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0,0,0,0.05);
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.02);
        }
        .mobile-bottom-nav .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--color-text-secondary, #5f6368);
          font-size: 0.65rem;
          cursor: pointer;
          flex: 1;
          height: 100%;
          transition: color 0.2s;
        }
        .mobile-bottom-nav .nav-item.active {
          color: var(--color-primary, #1a73e8);
          font-weight: 600;
        }
        .mobile-bottom-nav .nav-item svg {
          stroke-width: 2px;
        }
      `}</style>
    </div>
  );
}
