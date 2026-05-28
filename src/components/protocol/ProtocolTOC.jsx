import React, { useState, useEffect } from 'react';

export default function ProtocolTOC({ sections }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Offset margins to detect the section when it enters the upper half of the screen
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-10% 0px -60% 0px' }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!sections || sections.length === 0) return null;

  return (
    <div className="protocol-toc glass-panel" style={{
      position: 'sticky',
      top: '100px', // Below the sticky header
      padding: '1.25rem',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
      marginBottom: '2rem'
    }}>
      <h4 style={{ 
        fontSize: '0.75rem', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        letterSpacing: '0.1em', 
        color: 'var(--color-text-secondary)', 
        marginBottom: '1rem',
        paddingLeft: '0.5rem'
      }}>
        Contents
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {sections.map((sec) => (
          <li key={sec.id}>
            <a
              href={`#${sec.id}`}
              onClick={(e) => handleClick(e, sec.id)}
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: activeId === sec.id ? 700 : 500,
                color: activeId === sec.id ? '#0ea5e9' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.25s ease',
                padding: '0.4rem 0.5rem',
                borderRadius: '8px',
                background: activeId === sec.id ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                borderLeft: `3px solid ${activeId === sec.id ? '#0ea5e9' : 'transparent'}`
              }}
              onMouseEnter={(e) => {
                if (activeId !== sec.id) {
                  e.target.style.background = 'rgba(241, 245, 249, 0.8)';
                  e.target.style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeId !== sec.id) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {sec.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
