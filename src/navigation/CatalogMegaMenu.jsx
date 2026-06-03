 
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNavigationMetadata } from '../repositories/navigationRepository';
import { CATALOG_BROWSE } from './navConfig';
import { useTranslation } from 'react-i18next';
import '../styles/header.css';

// ── Sub-components ────────────────────────────────────────────────────────────

function ColHeader({ title }) {
  return <div className="mega-menu-column-title">{title}</div>;
}

function NavItem({ label, path, highlight = false, onClick }) {
  return (
    <Link
      to={path}
      className={`mega-menu-link ${highlight ? 'mega-menu-link--highlight' : ''}`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function SkeletonColumn({ rows = 5 }) {
  return (
    <div className="skeleton-column">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-item"
          style={{ width: `${60 + Math.random() * 30}%` }}
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
  const { t } = useTranslation();

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

  // colCount for grid
  const colCount = showConditions ? 4 : 3;

  return (
    <>
      {/* Click-outside overlay */}
      <div
        className="dropdown-overlay"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="navigation"
        className="mega-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="mega-menu-grid" 
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
        >
          {/* ── Column 1: Browse (static) ───────────────────────────── */}
          <div className="mega-menu-column">
            <ColHeader title={t('nav.browse', 'Browse')} />
            <div className="mega-menu-links">
              {CATALOG_BROWSE.map((item) => (
                <NavItem
                  key={item.path}
                  label={t(`nav.${item.label.replace(/\\s+/g, '')}`, item.label)}
                  path={item.path}
                  highlight
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          {/* ── Column 2: Categories (dynamic) ─────────────────────── */}
          <div className="mega-menu-column">
            <ColHeader title={t('nav.categories', 'Categories')} />
            <div className="mega-menu-links">
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
          </div>

          {/* ── Column 3: Clinical Goals (dynamic) ─────────────────── */}
          <div className="mega-menu-column">
            <ColHeader title={t('nav.clinicalGoals', 'Clinical Goals')} />
            <div className="mega-menu-links">
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
          </div>

          {/* ── Column 4: Conditions (dynamic, hidden if empty) ─────── */}
          {showConditions && (
            <div className="mega-menu-column">
              <ColHeader title={t('nav.conditions', 'Conditions')} />
              <div className="mega-menu-links">
                {conditions.map((cond) => (
                  <NavItem
                    key={cond.slug}
                    label={cond.label}
                    path={cond.path}
                    onClick={onClose}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer quick-links */}
        <div className="mega-menu-footer">
          <Link
            to="/collection/peptides"
            className="mega-menu-footer-link mega-menu-footer-link--primary"
            onClick={onClose}
          >
            {t('nav.viewFullCatalog', 'View Full Catalog →')}
          </Link>
          <Link
            to="/collection/protocols"
            className="mega-menu-footer-link"
            onClick={onClose}
          >
            {t('nav.allProtocols', 'All Protocols')}
          </Link>
        </div>
      </div>
    </>
  );
}
