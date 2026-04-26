/**
 * CatalogMegaMenu.jsx
 *
 * 4-column mega menu for the Catalog nav item.
 *
 * Col 1 — Browse       (static)
 * Col 2 — Categories   (dynamic, Firestore)
 * Col 3 — Clinical Goals (dynamic, Firestore)
 * Col 4 — Conditions   (dynamic, Firestore, hidden if empty)
 *
 * Data is loaded ONCE per session via getNavigationMetadata() cache.
 * Never queries on hover.
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNavigationMetadata } from '../repositories/navigationRepository';
import { CATALOG_BROWSE } from './navConfig';

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 149,
    background: 'transparent',
  },
  panel: {
    position: 'absolute',
    top: 'calc(100% + 0.75rem)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(900px, 96vw)',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
    border: '0.5px solid rgba(0,0,0,0.08)',
    zIndex: 150,
    overflow: 'hidden',
    animation: 'megaMenuIn 0.18s ease-out',
  },
  grid: {
    display: 'grid',
    padding: '1.75rem',
    gap: '0.5rem',
  },
  columnHeader: {
    fontSize: '0.65rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '0.6rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--border, #f0f0f0)',
  },
  item: {
    display: 'block',
    padding: '0.42rem 0.6rem',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'var(--text-main)',
    fontSize: '0.855rem',
    fontWeight: 500,
    lineHeight: 1.4,
    transition: 'background 0.13s ease, color 0.13s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemHighlight: {
    fontWeight: 700,
    color: 'var(--primary)',
  },
  skeleton: {
    height: '0.8rem',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    marginBottom: '0.5rem',
  },
  footer: {
    borderTop: '1px solid var(--border, #f0f0f0)',
    padding: '0.85rem 1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--background, #fafafa)',
  },
  footerLink: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--primary)',
    textDecoration: 'none',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid currentColor',
    transition: 'background 0.15s',
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ColHeader({ title }) {
  return <div style={S.columnHeader}>{title}</div>;
}

function NavItem({ label, path, highlight = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={path}
      style={{
        ...S.item,
        ...(highlight ? S.itemHighlight : {}),
        background: hovered ? 'var(--background, #f5f5f5)' : 'transparent',
        color: hovered
          ? 'var(--primary)'
          : highlight
          ? 'var(--primary)'
          : 'var(--text-main)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}

function SkeletonColumn({ rows = 5 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ ...S.skeleton, width: `${60 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CatalogMegaMenu({ onClose }) {
  const [navData, setNavData] = useState(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  // Load metadata on mount (cache hit = instant)
  useEffect(() => {
    let cancelled = false;
    getNavigationMetadata().then((data) => {
      if (!cancelled) {
        setNavData(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Determine visible columns
  const { categories = [], goals = [], conditions = [] } = navData || {};
  const showConditions = !loading && conditions.length > 0;

  // Grid template: always show Browse + Categories + Goals; Conditions if present
  const colCount = showConditions ? 4 : 3;
  const gridCols = `repeat(${colCount}, 1fr)`;

  return (
    <>
      {/* Click-outside overlay */}
      <div
        style={S.overlay}
        aria-hidden="true"
        onClick={onClose}
      />

      <style>{`
        @keyframes megaMenuIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        ref={panelRef}
        role="navigation"
        aria-label="Catalog mega menu"
        style={S.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ ...S.grid, gridTemplateColumns: gridCols }}>

          {/* ── Column 1: Browse (static) ───────────────────────────── */}
          <div>
            <ColHeader title="Browse" />
            {CATALOG_BROWSE.map((item) => (
              <NavItem
                key={item.path}
                label={item.label}
                path={item.path}
                highlight
                onClick={onClose}
              />
            ))}
          </div>

          {/* ── Column 2: Categories (dynamic) ─────────────────────── */}
          <div>
            <ColHeader title="Categories" />
            {loading ? (
              <SkeletonColumn rows={5} />
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <NavItem
                  key={cat.slug}
                  label={cat.label}
                  path={cat.path}
                  onClick={onClose}
                />
              ))
            ) : (
              // Fallback: use goals if no categories
              goals.slice(0, 8).map((g) => (
                <NavItem key={g.slug} label={g.label} path={g.path} onClick={onClose} />
              ))
            )}
          </div>

          {/* ── Column 3: Clinical Goals (dynamic) ─────────────────── */}
          <div>
            <ColHeader title="Clinical Goals" />
            {loading ? (
              <SkeletonColumn rows={5} />
            ) : goals.length > 0 ? (
              goals.map((goal) => (
                <NavItem
                  key={goal.slug}
                  label={goal.label}
                  path={goal.path}
                  onClick={onClose}
                />
              ))
            ) : null}
          </div>

          {/* ── Column 4: Conditions (dynamic, hidden if empty) ─────── */}
          {showConditions && (
            <div>
              <ColHeader title="Conditions" />
              {conditions.map((cond) => (
                <NavItem
                  key={cond.slug}
                  label={cond.label}
                  path={cond.path}
                  onClick={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer quick-links */}
        <div style={S.footer}>
          <Link
            to="/catalog"
            style={S.footerLink}
            onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            View Full Catalog →
          </Link>
          <Link
            to="/protocols"
            style={{ ...S.footerLink, color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--background)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            All Protocols
          </Link>
        </div>
      </div>
    </>
  );
}
