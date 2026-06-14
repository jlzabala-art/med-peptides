import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';


import { getTemplatesByObjective } from '../../repositories/protocolRepository';

const CategoryProtocolNavigator = memo(function CategoryProtocolNavigator({
  currentSlug,
  primaryGoal,
  goalLabel,
  goalGradient,
}) {
  const navigate = useNavigate();
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const scrollContainerRef = React.useRef(null);
  const activePillRef = React.useRef(null);

  useEffect(() => {
    if (!primaryGoal) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    getTemplatesByObjective(primaryGoal)
      .then((list) => {
        if (!active) return;
        // Sort: category_order → protocol_id → title
        const sorted = [...list].sort((a, b) => {
          const oa = a.category_order ?? a.order ?? 999;
          const ob = b.category_order ?? b.order ?? 999;
          if (oa !== ob) return oa - ob;
          const ida = a.protocol_id || a.id || '';
          const idb = b.protocol_id || b.id || '';
          if (ida !== idb) return ida.localeCompare(idb);
          const ta = a.protocol_title || a.name || '';
          const tb = b.protocol_title || b.name || '';
          return ta.localeCompare(tb);
        });
        setSiblings(sorted);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [primaryGoal]);

  if (loading || siblings.length <= 1) return null;

  const currentIdx = siblings.findIndex(
    (p) => {
      const s1 = (p.protocol_id || '').toLowerCase();
      const s2 = (p.id || '').toLowerCase();
      const s3 = (p.protocol_slug || '').toLowerCase();
      const s4 = (p.slug || '').toLowerCase();
      const curr = (currentSlug || '').toLowerCase();
      return s1 === curr || s2 === curr || s3 === curr || s4 === curr;
    }
  );
  const idx = currentIdx === -1 ? 0 : currentIdx;
  const total = siblings.length;
  const prevIdx = (idx - 1 + total) % total;
  const nextIdx = (idx + 1) % total;
  const prevItem = siblings[prevIdx];
  const nextItem = siblings[nextIdx];

  const getSlug = (p) => p.protocol_id || p.id || p.protocol_slug;
  const getTitle = (p) => p.protocol_title || p.name || p.protocol_name || getSlug(p);

  const goTo = (p) => navigate(`/protocol/${getSlug(p)}`);

  const handleNav = (index) => {
    const target = siblings[(index + siblings.length) % siblings.length];
    navigate(`/protocol/${getSlug(target)}`);
  };

  useEffect(() => {
    if (activePillRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const pill = activePillRef.current;
      const scrollLeft = pill.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (pill.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [idx, siblings]);

  return (
    <div
      aria-label={`${goalLabel} protocol navigator`}
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <button
        onClick={() => handleNav(idx - 1)}
        disabled={idx === 0}
        aria-label="Previous protocol"
        style={{
          flexShrink: 0,
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: idx === 0 ? 'not-allowed' : 'pointer',
          opacity: idx === 0 ? 0.3 : 1,
          display: 'flex', alignItems: 'center', padding: '0.25rem',
        }}
      >
        <ChevronLeft size={16} />
      </button>

      <div 
        ref={scrollContainerRef}
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          overflowX: 'auto', 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          padding: '0.25rem 0',
          flexGrow: 1
        }}
      >
        {siblings.map((p, i) => {
          const active = i === idx;
          return (
            <button
              key={getSlug(p)}
              ref={active ? activePillRef : null}
              onClick={() => goTo(p)}
              title={getTitle(p)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.4rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: active ? 700 : 500,
                borderRadius: '999px',
                background: active ? (goalGradient || 'linear-gradient(135deg, #1e293b, #0f172a)') : 'rgba(255,255,255,0.05)',
                color: active ? 'var(--color-bg-surface)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              {getTitle(p)}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handleNav(idx + 1)}
        disabled={idx === total - 1}
        aria-label="Next protocol"
        style={{
          flexShrink: 0,
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: idx === total - 1 ? 'not-allowed' : 'pointer',
          opacity: idx === total - 1 ? 0.3 : 1,
          display: 'flex', alignItems: 'center', padding: '0.25rem',
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
});

export default CategoryProtocolNavigator;