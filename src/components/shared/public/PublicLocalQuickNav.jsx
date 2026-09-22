"use client";

import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * PublicLocalQuickNav
 * Standardized Google Cloud Console-inspired local sub-navigation.
 * Single unified, touch-momentum horizontal pill strip with auto-centering,
 * active section tracking, and subtle edge fade. Eliminates redundant dropdowns.
 */
export default function PublicLocalQuickNav({
  items = [],
  lang = 'en',
  activeId: controlledActiveId = null,
  className = '',
  style = {}
}) {
  const [activeId, setActiveId] = useState(controlledActiveId || items[0]?.href?.replace('#', '') || '');
  const pillsRef = useRef(null);

  useEffect(() => {
    if (controlledActiveId) {
      setActiveId(controlledActiveId);
    }
  }, [controlledActiveId]);

  // Active section tracker via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const id = entry.target.id;
            setActiveId(id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: [0.25, 0.5]
      }
    );

    items.forEach((it) => {
      const id = it.href?.replace('#', '');
      const el = id ? document.getElementById(id) : null;
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  // Auto-center the active pill in the horizontal scroll container
  useEffect(() => {
    if (!pillsRef.current || !activeId) return;
    const activeEl = pillsRef.current.querySelector(`.is-active`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeId]);

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
      <div className="proto-quick-nav-pills" role="tablist" ref={pillsRef}>
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
              {Icon && <Icon size={13} style={{ marginRight: '5px', flexShrink: 0 }} />}
              <span>{nav.label}</span>
              {isActive && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#38bdf8',
                    marginLeft: '6px'
                  }}
                />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
