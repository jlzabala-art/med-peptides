import X from "lucide-react/dist/esm/icons/x";
import Star from "lucide-react/dist/esm/icons/star";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
import React, { useEffect, useRef } from 'react';







/**
 * FilterDrawer — Bottom Sheet en móvil, sidebar en desktop (no usado en desktop).
 * Contiene los filtros de Status y Favorites, liberando espacio vertical en la barra superior.
 *
 * Props:
 *   isOpen         {boolean}
 *   onClose        {Function}
 *   statusFilter   {string}
 *   onStatusChange {Function}
 *   filterFavorite {boolean}
 *   onFavoriteToggle {Function}
 *   onClear        {Function}
 *   hasActiveFilters {boolean}
 */
export default function FilterDrawer({
  isOpen,
  onClose,
  statusFilter,
  onStatusChange,
  filterFavorite,
  onFavoriteToggle,
  onClear,
  hasActiveFilters,
}) {
  const drawerRef = useRef(null);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Foco en el drawer al abrir (accesibilidad)
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  const STATUS_OPTIONS = [
    { value: 'all',       label: 'All Statuses',  icon: null },
    { value: 'pass',      label: 'Validated',      icon: <CheckCircle2 size={16} color="var(--color-success)" /> },
    { value: 'warning',   label: 'With Warning',   icon: <AlertTriangle size={16} color="#f59e0b" /> },
    { value: 'blocked',   label: 'Rejected',       icon: <XCircle size={16} color="var(--color-danger)" /> },
    { value: 'generated', label: 'Generated',      icon: <SlidersHorizontal size={16} color="#6b7280" /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fd-backdrop${isOpen ? ' fd-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fd-drawer${isOpen ? ' fd-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter protocols"
        tabIndex={-1}
      >
        {/* Handle bar (visual affordance de swipe) */}
        <div className="fd-handle" aria-hidden="true" />

        {/* Header */}
        <div className="fd-header">
          <h2 className="fd-title">Filters</h2>
          <button
            className="fd-close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status section */}
        <section className="fd-section">
          <h3 className="fd-section__label">Status</h3>
          <div className="fd-status-grid">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`fd-status-btn${statusFilter === opt.value ? ' is-active' : ''}`}
                onClick={() => onStatusChange(opt.value)}
                aria-pressed={statusFilter === opt.value}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Favorites section */}
        <section className="fd-section">
          <h3 className="fd-section__label">Show only</h3>
          <button
            className={`fd-fav-toggle${filterFavorite ? ' is-active' : ''}`}
            onClick={onFavoriteToggle}
            aria-pressed={filterFavorite}
          >
            <Star
              size={18}
              fill={filterFavorite ? 'currentColor' : 'transparent'}
            />
            Favorites only
          </button>
        </section>

        {/* Footer actions */}
        <div className="fd-footer">
          {hasActiveFilters && (
            <button className="fd-clear-btn" onClick={() => { onClear(); onClose(); }}>
              Clear all filters
            </button>
          )}
          <button className="fd-apply-btn btn btn-primary" onClick={onClose}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
}