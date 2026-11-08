'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/common/BrandLogo';
import { Search, X, Printer, Upload, Share2, Check, ChevronDown, User, FileText, Layers, ExternalLink } from '@/lib/icons';
import { useAuth } from '@/context/AuthContext';
import UserDropdown from '@/navigation/UserDropdown';
import { MoreVertical } from 'lucide-react';

export default function LabelsHeader({
  searchBoxRef,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  isEs,
  lang,
  setLang,
  isGeneratingBatchPdf,
  batchPdfProgress,
  patientQueue = [],
  onDownloadA4BatchPdf,
  startOffset = 0,
  setStartOffset = null,
  onOpenImport,
  onShare,
  onShareType,
  copiedShareLink,
  copiedShareType,
  activeCode,
  patientName,
  onKeyDownSearch,
  embedded = false,
  children
}) {
  const { user, userProfile, activeRole, logout, isProfessional, isAdmin } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shareContainerRef = useRef(null);

  // Close share menu on outside click or Escape
  useEffect(() => {
    if (!isShareMenuOpen) return;
    const handleClickOutside = (e) => {
      if (shareContainerRef.current && !shareContainerRef.current.contains(e.target)) {
        setIsShareMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsShareMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShareMenuOpen]);

  // Derived user display details
  const userDisplayName = user?.displayName || (userProfile?.firstName ? `${userProfile.firstName} ${userProfile?.lastName || ''}`.trim() : null) || user?.email?.split('@')[0] || 'User';
  const userInitials = (() => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return (userProfile.firstName.trim().charAt(0) + userProfile.lastName.trim().charAt(0)).toUpperCase();
    }
    if (user?.displayName) {
      const parts = user.displayName.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return user.displayName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  })();

  const rawRole = activeRole || userProfile?.role || 'staff';
  const roleDisplay = rawRole === 'account_manager' ? 'Account Manager'
    : rawRole === 'admin' ? 'Admin'
    : rawRole === 'compounding_pharmacy' ? 'Compounding Pharmacy'
    : rawRole === 'wholesaler' ? 'Wholesaler'
    : rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

  const totalLabelsInBatch = patientQueue.reduce((acc, pItem) => {
    const count = (pItem.selectedPartIndex != null && pItem.selectedPartIndex !== 'all')
      ? 1
      : (Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels.length : 1);
    return acc + count;
  }, 0);

  const progressPercent = batchPdfProgress && batchPdfProgress.total > 0
    ? Math.min(100, Math.round((batchPdfProgress.current / batchPdfProgress.total) * 100))
    : 0;

  return (
    <>
      {/* Non-Blocking Top Progress Bar for Batch Rendering (Rule #25 / Item #7) */}
      {isGeneratingBatchPdf && (
        <div
          className="pls-progress-bar"
          style={{ width: `${progressPercent || 30}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      )}

      <header
        className="pls-header"
        style={embedded ? {
          position: 'sticky',
          top: 0,
          zIndex: 15,
          borderRadius: '10px 10px 0 0',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        } : undefined}
      >
        {/* Brand (Standalone Mode) or B2B Logistics Badge (Embedded Portal Mode) */}
        {!embedded ? (
          <Link href="/labels" className="pls-brand-link" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} title="Atlas Health Services">
            <BrandLogo variant="dark" size="compact" />
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <BrandLogo variant="dark" size="compact" />
          </div>
        )}

        {/* Instant Search Container */}
        <div className="pls-search-container" ref={searchBoxRef}>
          <div className="pls-search-input-wrap">
            <Search size={15} color="#5f6368" />
            <input
              ref={searchInputRef}
              type="text"
              className="pls-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onKeyDownSearch}
              aria-autocomplete="list"
              aria-expanded={searchOpen}
              aria-controls="pls-search-results-listbox"
              placeholder={isEs
                ? "Buscar paciente, receta o nº historia..."
                : "Search patient, prescription or file #..."}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pls-search-clear-query"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <span className="pls-search-badge" title={isEs ? "Selección múltiple disponible" : "Multi-selection enabled"}>
              ⌘K • {isEs ? 'Múltiple' : 'Multi'}
            </span>
          </div>

          {/* Search Dropdown Slot */}
          {searchOpen && children}
        </div>

        {/* Action Buttons: Print Batch A4, Import, Share, Language */}
        <div className="pls-actions-wrap">
          {/* Global Action: Print All Patients in A4 PDF Sheet */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="pls-btn-print-batch"
              onClick={onDownloadA4BatchPdf}
              disabled={isGeneratingBatchPdf || patientQueue.length === 0}
              title={isEs ? 'Imprimir todas las etiquetas del lote en un folio A4 en formato PDF' : 'Print all queued labels onto an A4 PDF sheet'}
              aria-label={isEs ? 'Imprimir Lote en A4 (PDF)' : 'Print Batch in A4 (PDF)'}
            >
              <Printer size={14} />
              <span className="pls-btn-print-label">
                {isGeneratingBatchPdf
                  ? (batchPdfProgress
                      ? `${isEs ? 'Rasterizando' : 'Rendering'} ${batchPdfProgress.current}/${batchPdfProgress.total}...`
                      : (isEs ? 'Generando...' : 'Generating...'))
                  : (isEs ? 'Imprimir Lote A4' : 'Print Batch A4')}
              </span>
              <span className="pls-btn-batch-count">
                {totalLabelsInBatch}
              </span>
            </button>

            {/* Start Offset selector for partially used A4 sheets */}
            {patientQueue.length > 0 && typeof setStartOffset === 'function' && (
              <select
                value={startOffset}
                onChange={(e) => setStartOffset(Number(e.target.value))}
                className="pls-desktop-only-action"
                style={{
                  height: '32px',
                  padding: '0 6px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: startOffset > 0 ? '#c2410c' : '#475569',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                title={isEs ? 'Posición inicial en el pliego A4 (permite saltar huecos ya usados)' : 'Start slot on A4 sheet (skip stickers already used)'}
              >
                <option value={0}>{isEs ? 'Slot #1 (Nuevo)' : 'Slot #1 (Fresh)'}</option>
                <option value={1}>Slot #2</option>
                <option value={2}>Slot #3</option>
                <option value={3}>Slot #4</option>
                <option value={4}>Slot #5</option>
                <option value={5}>Slot #6</option>
                <option value={6}>Slot #7</option>
                <option value={7}>Slot #8</option>
              </select>
            )}
          </div>

          {/* Import Data (Rx & Lab Results) */}
          <button
            type="button"
            id="pls-import-rx-btn"
            className="pls-btn-import pls-desktop-only-action"
            onClick={onOpenImport}
            title={isEs ? 'Importar datos (Rx y Analíticas Lab)' : 'Import Data (Rx & Lab Results)'}
            aria-label={isEs ? 'Importar datos' : 'Import Data'}
          >
            <Upload size={14} />
            <span className="pls-btn-label">{isEs ? 'Importar Datos' : 'Import Data'}</span>
          </button>

          {/* Unified Share Dropdown Button (Google Cloud UX Standards) */}
          <div className="pls-share-container pls-desktop-only-action" ref={shareContainerRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="pls-btn-share"
              onClick={() => setIsShareMenuOpen(prev => !prev)}
              style={{
                borderColor: (copiedShareLink || copiedShareType) ? '#ceead6' : (isShareMenuOpen ? '#1a73e8' : '#dadce0'),
                background: (copiedShareLink || copiedShareType) ? '#e6f4ea' : (isShareMenuOpen ? '#f8fafd' : '#ffffff'),
                color: (copiedShareLink || copiedShareType) ? '#137333' : (isShareMenuOpen ? '#1a73e8' : '#3c4043')
              }}
              title={isEs ? 'Opciones para compartir' : 'Share options'}
              aria-label={isEs ? 'Opciones para compartir' : 'Share options'}
              aria-haspopup="menu"
              aria-expanded={isShareMenuOpen}
            >
              {(copiedShareLink || copiedShareType) ? <Check size={14} color="#137333" /> : <Share2 size={14} />}
              <span className="pls-btn-share-label">
                {(copiedShareLink || copiedShareType)
                  ? (isEs ? 'Copiado ✓' : 'Copied ✓')
                  : (isEs ? 'Compartir' : 'Share')}
              </span>
              <ChevronDown
                size={12}
                style={{
                  transform: isShareMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                  opacity: 0.7
                }}
              />
            </button>

            {/* Dropdown Popover */}
            {isShareMenuOpen && (
              <div className="pls-share-dropdown-menu" role="menu">
                <div className="pls-share-menu-header">
                  {isEs ? 'Compartir Espacio de Trabajo' : 'Share Workspace'}
                </div>

                {/* Option 1: Prescripción Activa */}
                <button
                  type="button"
                  role="menuitem"
                  className="pls-share-menu-item"
                  disabled={!activeCode}
                  onClick={() => {
                    if (onShareType) onShareType('active');
                    else if (onShare) onShare();
                    setIsShareMenuOpen(false);
                  }}
                >
                  <div className="pls-share-item-icon">
                    <FileText size={16} />
                  </div>
                  <div className="pls-share-item-body">
                    <div className="pls-share-item-title-row">
                      <span className="pls-share-item-title">
                        {isEs ? 'Prescripción activa' : 'Active prescription'}
                      </span>
                      {copiedShareType === 'active' && (
                        <span className="pls-share-item-badge copied">
                          <Check size={11} style={{ marginRight: 3 }} />
                          {isEs ? 'Copiado' : 'Copied'}
                        </span>
                      )}
                    </div>
                    <span className="pls-share-item-desc">
                      {activeCode
                        ? `#${activeCode} · ${patientName || (isEs ? 'Paciente' : 'Patient')}`
                        : (isEs ? 'Ninguna receta cargada' : 'No prescription loaded')}
                    </span>
                  </div>
                </button>

                {/* Option 2: Lote Completo en Curso */}
                <button
                  type="button"
                  role="menuitem"
                  className="pls-share-menu-item"
                  disabled={!patientQueue || patientQueue.length === 0}
                  onClick={() => {
                    if (onShareType) onShareType('batch');
                    else if (onShare) onShare();
                    setIsShareMenuOpen(false);
                  }}
                >
                  <div className="pls-share-item-icon" style={{ color: '#0284c7' }}>
                    <Layers size={16} />
                  </div>
                  <div className="pls-share-item-body">
                    <div className="pls-share-item-title-row">
                      <span className="pls-share-item-title">
                        {isEs
                          ? `Lote en curso (${patientQueue.length})`
                          : `Current batch (${patientQueue.length})`}
                      </span>
                      {copiedShareType === 'batch' && (
                        <span className="pls-share-item-badge copied">
                          <Check size={11} style={{ marginRight: 3 }} />
                          {isEs ? 'Copiado' : 'Copied'}
                        </span>
                      )}
                    </div>
                    <span className="pls-share-item-desc">
                      {isEs
                        ? 'Enlace que precarga todas las recetas del lote simultáneamente'
                        : 'Preloads all queued prescriptions simultaneously'}
                    </span>
                  </div>
                </button>

                <div className="pls-share-menu-divider" />

                {/* Option 3: Estudio en Blanco (Limpio) */}
                <button
                  type="button"
                  role="menuitem"
                  className="pls-share-menu-item"
                  onClick={() => {
                    if (onShareType) onShareType('clean');
                    else if (onShare) onShare();
                    setIsShareMenuOpen(false);
                  }}
                >
                  <div className="pls-share-item-icon" style={{ color: '#64748b' }}>
                    <ExternalLink size={16} />
                  </div>
                  <div className="pls-share-item-body">
                    <div className="pls-share-item-title-row">
                      <span className="pls-share-item-title">
                        {isEs ? 'Estudio en blanco (Limpio)' : 'Clean studio workspace'}
                      </span>
                      {copiedShareType === 'clean' && (
                        <span className="pls-share-item-badge copied">
                          <Check size={11} style={{ marginRight: 3 }} />
                          {isEs ? 'Copiado' : 'Copied'}
                        </span>
                      )}
                    </div>
                    <span className="pls-share-item-desc">
                      {isEs
                        ? 'Abre el estudio limpio, sin ninguna receta precargada'
                        : 'Opens the studio clean without preloaded data'}
                    </span>
                  </div>
                </button>

                <div className="pls-share-menu-footer">
                  {isEs
                    ? 'Copia el enlace al portapapeles o activa compartir nativo en móvil.'
                    : 'Copies link to clipboard or triggers mobile system share.'}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="pls-lang-toggle pls-desktop-only-action" role="group" aria-label="Language selection">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`pls-lang-btn ${!isEs ? 'active' : 'inactive'}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`pls-lang-btn ${isEs ? 'active' : 'inactive'}`}
            >
              ES
            </button>
          </div>

          {/* Authenticated Operator Profile (Standalone Kiosk Mode) or Standalone Kiosk Launcher (Embedded B2B Portal Mode) */}
          {embedded ? (
            <Link
              href={activeCode ? `/labels?rx=${encodeURIComponent(activeCode)}&edit=true&lang=${lang}` : '/labels'}
              target="_blank"
              rel="noopener noreferrer"
              title={isEs ? 'Abrir versión de pantalla completa independiente (Modo Quiosco)' : 'Open standalone fullscreen kiosk version (/labels)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#003666',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <ExternalLink size={13} />
              <span>{isEs ? 'Modo Quiosco' : 'Kiosk View'}</span>
            </Link>
          ) : (
            <div className="pls-user-profile-wrap pls-desktop-only-action" style={{ position: 'relative' }}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="pls-user-profile-btn"
                  title={`${userDisplayName} (${roleDisplay})`}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '3px 10px 3px 4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
                      color: '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0, 54, 102, 0.25)'
                    }}
                  >
                    {userInitials}
                  </div>
                  <div className="pls-user-profile-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userDisplayName}
                    </span>
                    <span style={{ fontSize: '0.64rem', fontWeight: 650, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {roleDisplay}
                    </span>
                  </div>
                  <ChevronDown size={13} color="#64748b" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </button>
              ) : (
                <Link
                  href="/login?redirect=/labels"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#003666',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 650,
                    textDecoration: 'none'
                  }}
                >
                  <User size={14} />
                  <span>{isEs ? 'Iniciar Sesión' : 'Sign In'}</span>
                </Link>
              )}

              {isUserMenuOpen && user && (
                <UserDropdown
                  user={user}
                  userProfile={userProfile}
                  isProfessional={isProfessional}
                  isAdmin={isAdmin}
                  onClose={() => setIsUserMenuOpen(false)}
                  onLogout={async () => {
                    setIsUserMenuOpen(false);
                    if (logout) await logout();
                    window.location.href = '/login';
                  }}
                />
              )}
            </div>
          )}
                  {/* Google Cloud Style Mobile More Actions Menu Trigger (⋮) */}
          <div className="pls-mobile-more-wrap" style={{ position: 'relative' }}>
            <button
              type="button"
              className="pls-mobile-more-btn"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="More actions"
              aria-expanded={isMobileMenuOpen}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                background: isMobileMenuOpen ? '#e8f0fe' : '#ffffff',
                border: isMobileMenuOpen ? '1px solid #1a73e8' : '1px solid #dadce0',
                borderRadius: '6px',
                color: isMobileMenuOpen ? '#1a73e8' : '#3c4043',
                cursor: 'pointer'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {isMobileMenuOpen && (
              <div
                className="pls-mobile-more-dropdown"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  padding: '6px',
                  minWidth: '200px',
                  zIndex: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {/* Import */}
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); onOpenImport(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#1e293b',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Upload size={14} color="#0284c7" />
                  <span>{isEs ? 'Importar Datos (Rx)' : 'Import Data (Rx)'}</span>
                </button>

                {/* Share */}
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); if (onShare) onShare(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#1e293b',
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Share2 size={14} color="#16a34a" />
                  <span>{isEs ? 'Compartir Espacio' : 'Share Workspace'}</span>
                </button>

                {/* Divider */}
                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                {/* Language */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>{isEs ? 'Idioma' : 'Language'}</span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      onClick={() => { setLang('en'); setIsMobileMenuOpen(false); }}
                      style={{
                        border: 'none',
                        background: !isEs ? '#1a73e8' : '#f1f5f9',
                        color: !isEs ? '#ffffff' : '#475569',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        cursor: 'pointer'
                      }}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLang('es'); setIsMobileMenuOpen(false); }}
                      style={{
                        border: 'none',
                        background: isEs ? '#1a73e8' : '#f1f5f9',
                        color: isEs ? '#ffffff' : '#475569',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        cursor: 'pointer'
                      }}
                    >
                      ES
                    </button>
                  </div>
                </div>

                {user && (
                  <>
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                    <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#64748b' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{userDisplayName}</div>
                      <div style={{ fontSize: '0.66rem', color: '#0284c7' }}>{roleDisplay}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        background: 'transparent',
                        color: '#dc2626',
                        fontSize: '0.74rem',
                        fontWeight: 650,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
