"use client";

import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * PublicLocalQuickNav
 * In-page quick navigation strip for hopping between clinical sections.
 * Clean segmented pills on desktop with smooth horizontal scroll and dropdown on mobile.
 */
export default function PublicLocalQuickNav({
  items = [],
  lang = 'en',
  activeId: controlledActiveId = null,
  className = '',
  style = {}
}) {
  const [activeId, setActiveId] = useState(controlledActiveId || items[0]?.href?.replace('#', '') || '');

  useEffect(() => {
    if (controlledActiveId) {
      setActiveId(controlledActiveId);
    }
  }, [controlledActiveId]);

  const handleNavClick = (e, targetHref) => {
    if (!targetHref) return;
    const targetId = targetHref.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      triggerHaptic('selection');
      setActiveId(targetId);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', targetHref);
      }
    }
  };

  return (
    <nav className={`proto-quick-nav ${className}`} aria-label="Local section jumps" style={style}>
      {/* Mobile section jump dropdown */}
      <div className="proto-mobile-section-wrapper">
        <select
          className="proto-mobile-section-select"
          aria-label={lang === 'es' ? 'Saltar a sección' : 'Jump to section'}
          value={items.find(i => i.href?.replace('#', '') === activeId)?.href || ''}
          onChange={(e) => {
            if (e.target.value) {
              const target = document.querySelector(e.target.value);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(e.target.value.replace('#', ''));
              }
            }
          }}
        >
          <option value="" disabled>
            {lang === 'es' ? '📑 Saltar a sección...' : '📑 Jump to section...'}
          </option>
          {items.map((nav, i) => (
            <option key={i} value={nav.href}>
              {nav.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop / tablet scrollable pills */}
      <div className="proto-quick-nav-pills" role="tablist">
        {items.map((nav, i) => {
          const targetId = nav.href?.replace('#', '');
          const isActive = activeId === targetId;
          const Icon = nav.icon;
          return (
            <a
              key={i}
              href={nav.href}
              className={`proto-quick-nav-pill ${isActive ? 'is-active' : ''}`}
              onClick={(e) => handleNavClick(e, nav.href)}
              role="tab"
              aria-selected={isActive}
            >
              {Icon && <Icon size={13} style={{ marginRight: '5px' }} />}
              <span>{nav.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
