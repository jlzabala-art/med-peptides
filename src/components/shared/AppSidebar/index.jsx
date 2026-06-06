import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Menu, ChevronDown, LogOut, GripVertical, Star, Search, PanelLeftClose, PanelLeftOpen, Command } from 'lucide-react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AtlasHealthLogo from '../../brand/AtlasHealthLogo';
import './AppSidebar.css';


// ─── Sortable Group Wrapper ────────────────────────────────────────────────
function SortableSidebarGroup({ group, isOpen, expanded, toggleGroup, activeId, handleItemClick, isEditing, isMobile, onToggleFavorite, isFavoritesGroup, favoritesSet, isFlyoutOpen, onFlyoutEnter, onFlyoutLeave }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: group.id,
    data: { type: 'group', group }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const items = group.items || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sb-group"
      onMouseEnter={!expanded ? () => onFlyoutEnter(group.id) : undefined}
      onMouseLeave={!expanded ? onFlyoutLeave : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {isEditing && (
          <div style={{ padding: '4px 4px 4px 12px', width: '28px' }} />
        )}
        <button
          className="sb-group-header"
          onClick={() => !isEditing && toggleGroup(group.id)}
          aria-expanded={isOpen}
          style={{ flex: 1, pointerEvents: isEditing ? 'none' : 'auto' }}
        >
          <span className="sb-group-emoji" aria-hidden="true">
            {group.icon ? <group.icon size={16} strokeWidth={1.5} /> : group.emoji}
          </span>
          <span className="sb-group-label">{group.label}</span>
          {group.badge && expanded && (
            <span style={{
              fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px',
              padding: '2px 6px', borderRadius: '4px',
              backgroundColor: group.badgeColor || '#0071bd',
              color: 'white', marginRight: '4px',
              lineHeight: 1,
            }}>
              {group.badge}
            </span>
          )}
          {!isEditing && (
            <ChevronDown
              size={13}
              className={`sb-group-chevron${isOpen ? ' open' : ''}`}
            />
          )}
        </button>
      </div>

      <div
        className="sb-group-items"
        style={{ maxHeight: isOpen ? '999px' : '0px', overflow: isEditing ? 'visible' : 'hidden' }}
        data-flyout-open={!expanded && isFlyoutOpen ? 'true' : undefined}
        onMouseEnter={!expanded ? () => onFlyoutEnter(group.id) : undefined}
        onMouseLeave={!expanded ? onFlyoutLeave : undefined}
      >
        {!expanded && (
          <div className="sb-flyout-header">
            {group.label}
          </div>
        )}
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <SortableSidebarItem 
              key={item.id} 
              item={item} 
              isActive={item.id === activeId}
              handleItemClick={handleItemClick}
              expanded={expanded}
              isEditing={isEditing}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoritesSet ? favoritesSet.has(item.id) : isFavoritesGroup}
            />
          ))}
        </SortableContext>
        
        {/* Drop zone placeholder for empty groups */}
        {isEditing && items.length === 0 && (
          <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--sb-muted)', fontStyle: 'italic', textAlign: 'center' }}>
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sortable Item Wrapper ─────────────────────────────────────────────────
function SortableSidebarItem({ item, isActive, handleItemClick, expanded, isEditing, onToggleFavorite, isFavorite }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    data: { type: 'item', item }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  };

  const Icon = item.icon;

  return (
    <div ref={setNodeRef} style={style}>
      {isEditing && (
        <div 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', padding: '0 6px', color: 'var(--sb-muted)' }}
        >
          <GripVertical size={14} />
        </div>
      )}
      <button
        className={`sb-item${isActive ? ' active' : ''}${item.pulse ? ' pulse' : ''}`}
        onClick={() => !isEditing && handleItemClick(item.id)}
        aria-current={isActive ? 'page' : undefined}
        style={{
          flex: 1,
          pointerEvents: isEditing ? 'none' : 'auto',
          paddingLeft: isEditing ? '4px' : undefined,
          paddingRight: onToggleFavorite ? '30px' : undefined,
        }}
      >
        <span className="sb-item-icon">
          {Icon && <Icon size={16} />}
        </span>
        <span className="sb-item-label">{item.label}</span>
        {!!item.badge && (
          <span 
            className="sb-item-badge"
            style={item.badgeColor ? { backgroundColor: item.badgeColor, boxShadow: `0 1px 3px ${item.badgeColor}55` } : {}}
          >
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </button>
      
      {/* Pin to Favorites Button — visible on hover or when editing/pinned */}
      {onToggleFavorite && (isEditing || expanded) && (
        <button
          className="sb-item-pin-btn"
          onClick={(e) => onToggleFavorite(item.id, e)}
          title={isFavorite ? "Remove from Favorites" : "Pin to Favorites"}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: isFavorite ? '#f59e0b' : 'var(--sb-muted)',
            opacity: isEditing || isFavorite ? 1 : 0,
            transition: 'opacity 0.2s, transform 0.2s, color 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = isFavorite ? '#f59e0b' : 'var(--sb-muted)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Star size={13} fill={isFavorite ? '#f59e0b' : 'none'} />
        </button>
      )}
    </div>
  );
}

// ─── Inline Reset Confirmation ──────────────────────────────────────────────
function InlineConfirmReset({ onReset }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '4px', flex: '0 0 auto' }}>
        <button
          className="sb-item"
          onClick={onReset}
          title="Confirm Reset"
          style={{ width: 'auto', padding: '4px 10px', color: '#fff', backgroundColor: '#ef4444', justifyContent: 'center', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}
        >
          Yes
        </button>
        <button
          className="sb-item"
          onClick={() => setConfirming(false)}
          title="Cancel"
          style={{ width: 'auto', padding: '4px 10px', color: 'var(--sb-text)', backgroundColor: 'var(--sb-hover-bg)', justifyContent: 'center', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      className="sb-item"
      onClick={() => setConfirming(true)}
      title="Reset to Default"
      style={{ flex: '0 0 auto', width: 'auto', padding: '4px 12px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', justifyContent: 'center', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}
    >
      Reset
    </button>
  );
}

// ─── Main AppSidebar ────────────────────────────────────────────────────────
export default function AppSidebar({
  storageKey = 'app-sidebar',
  groups = [],
  pinnedItems = [],
  activeId,
  onNavigate,
  accentColor = '#1a73e8',
  header = {},
  footer,
  isOpen,
  onClose,
  isMobile,
  isEditing = false,
  onToggleFavorite
}) {
  // On mobile: always force expanded (full drawer with labels + accordion)
  const [expanded, setExpanded] = useState(() => {
    if (isMobile) return true;
    const saved = localStorage.getItem(`${storageKey}-expanded`);
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Keep mobile always expanded if isMobile changes (e.g. resize)
  useEffect(() => {
    if (isMobile) setExpanded(true);
  }, [isMobile]);
  const [closingFlyout, setClosingFlyout] = useState(false);
  // JS-controlled flyout — tracks which group is hovered in collapsed mode
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const closeTimerRef = useRef(null);

  const openFlyout = useCallback((groupId) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setHoveredGroupId(groupId);
  }, []);

  const closeFlyout = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setHoveredGroupId(null), 150);
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  const [openGroups, setOpenGroups] = useState(() => {
    return new Set(['favorites']);
  });

  // ── Phase 1: Sidebar Search ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  // Fuzzy filter: returns groups with only matching items
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    const q = searchTerm.toLowerCase().trim();
    return groups
      .map(group => ({
        ...group,
        items: (group.items || []).filter(item =>
          item.label?.toLowerCase().includes(q)
        )
      }))
      .filter(group => group.items.length > 0);
  }, [groups, searchTerm]);

  // When searching, force all matching groups open
  const effectiveOpenGroups = useMemo(() => {
    if (searchTerm.trim()) {
      return new Set(filteredGroups.map(g => g.id));
    }
    return openGroups;
  }, [searchTerm, filteredGroups, openGroups]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:expanded`, JSON.stringify(expanded));
  }, [expanded, storageKey]);

  useEffect(() => {
    if (isEditing) {
      setOpenGroups(new Set(groups.map(g => g.id)));
      if (!expanded) setExpanded(true);
    }
    // Removed auto-open logic for activeGroup to satisfy "no debe tener desplegado ninguna categoria" on load
  }, [activeId, groups, isEditing, expanded]);

  useEffect(() => {
    if (!isMobile) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobile, onClose]);

  const toggleGroup = useCallback((groupId) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      
      if (groupId === 'favorites') {
        if (next.has('favorites')) next.delete('favorites');
        else next.add('favorites');
        return next;
      }

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.clear(); // Enforce accordion globally
        if (prev.has('favorites')) next.add('favorites'); // Preserve favorites
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleItemClick = useCallback((itemId) => {
    onNavigate?.(itemId);
    if (isMobile) {
      onClose?.();
    } else if (!expanded) {
      setClosingFlyout(true);
      setTimeout(() => setClosingFlyout(false), 200);
    }
  }, [onNavigate, isMobile, onClose, expanded]);

  const favoritesSet = React.useMemo(() => {
    return new Set(groups.find(g => g.id === 'favorites')?.items?.map(i => i.id) || []);
  }, [groups]);

  return (
    <>
      {isOpen && isMobile && (
        <div className="sb-overlay" onClick={onClose} />
      )}

      <aside 
        className={`app-sidebar ${
          !expanded && !isMobile ? 'collapsed' : ''
        } ${closingFlyout ? 'force-close-flyout' : ''} ${
          isOpen && isMobile ? 'mobile-open' : ''
        } ${isEditing ? 'editing-mode' : ''} ${
          isMobile ? 'mobile-mode' : ''
        }`}
        style={{
          '--sb-bg': accentColor ? `${accentColor}05` : undefined,
          '--sb-active-color': accentColor,
          '--sb-active-bg': `${accentColor}18`,
        }} 
        aria-label="Main navigation"
      >
        <div className="sb-header">
          {/* Desktop: collapse/expand toggle */}
          {!isMobile && (
            <button
              className="sb-hamburger"
              onClick={() => !isEditing && setExpanded(e => !e)}
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={expanded ? 'Collapse menu' : 'Expand menu'}
              style={{ visibility: isEditing ? 'hidden' : 'visible' }}
            >
              {expanded
                ? <PanelLeftClose size={18} />
                : <PanelLeftOpen size={18} />
              }
            </button>
          )}

          {/* Mobile: logo + name row + close button */}
          {isMobile && (
            <div className="sb-mobile-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AtlasHealthLogo size={28} />
                <span className="sb-mobile-title">Atlas Health</span>
              </div>
              <button
                className="sb-mobile-close"
                onClick={onClose}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
          )}

          {/* Desktop: centered logo */}
          {!isMobile && (
            <div className="sb-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: expanded ? '24px 0' : '16px 0', width: '100%', transition: 'margin 0.2s' }}>
              {header.title && (
                <AtlasHealthLogo 
                  size={expanded ? 48 : 32} 
                  style={{ transition: 'width 0.2s, height 0.2s' }} 
                />
              )}
            </div>
          )}
        </div>

        {/* ── Phase 1: Search bar (visible only when expanded & not editing) ── */}
        {expanded && !isEditing && (
          <div className="sb-search-wrap">
            <Search size={14} className="sb-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="sb-search-input"
              placeholder="Filter menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSearchTerm(''); searchInputRef.current?.blur(); }
              }}
              aria-label="Filter sidebar navigation"
            />
            {searchTerm && (
              <button
                className="sb-search-clear"
                onClick={() => { setSearchTerm(''); searchInputRef.current?.focus(); }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        )}

        <nav className="sb-scroll" role="navigation">
          {/* ── Pinned items — always visible ── */}
          {pinnedItems.length > 0 && (
            <div className="sb-pinned-section">
              {pinnedItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    className={`sb-item${isActive ? ' active' : ''}${item.pulse ? ' pulse' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    data-tooltip={!expanded ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sb-item-icon">
                      {Icon && <Icon size={16} />}
                    </span>
                    <span className="sb-item-label">{item.label}</span>
                    {!!item.badge && (
                      <span 
                        className="sb-item-badge"
                        style={item.badgeColor ? { backgroundColor: item.badgeColor, boxShadow: `0 1px 3px ${item.badgeColor}55` } : {}}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="sb-divider" />
            </div>
          )}

          {/* ── Accordion groups (filtered when searching) ── */}
          {searchTerm && filteredGroups.length === 0 && (
            <div className="sb-search-empty">
              <Search size={20} style={{ opacity: 0.3 }} />
              <span>No results for "{searchTerm}"</span>
            </div>
          )}
          <SortableContext items={filteredGroups.map(g => g.id)} strategy={verticalListSortingStrategy}>
            {filteredGroups.map((group, gi) => (
              <React.Fragment key={group.id}>
                <SortableSidebarGroup 
                  group={group}
                  isOpen={effectiveOpenGroups.has(group.id) || isEditing}
                  expanded={expanded}
                  toggleGroup={toggleGroup}
                  activeId={activeId}
                  handleItemClick={handleItemClick}
                  isEditing={isEditing}
                  isMobile={isMobile}
                  onToggleFavorite={onToggleFavorite}
                  isFavoritesGroup={group.id === 'favorites'}
                  favoritesSet={favoritesSet}
                  isFlyoutOpen={!expanded && hoveredGroupId === group.id}
                  onFlyoutEnter={openFlyout}
                  onFlyoutLeave={closeFlyout}
                />
                {gi < filteredGroups.length - 1 && <div className="sb-divider" />}
              </React.Fragment>
            ))}
          </SortableContext>
        </nav>

        {footer && (
          <div className="sb-footer" style={{ display: 'flex', gap: '4px', flexDirection: (expanded || isEditing) ? 'row' : 'column' }}>
            <button
              className="sb-item"
              onClick={footer.onClick}
              data-tooltip={!expanded ? footer.label : undefined}
              style={{
                flex: 1,
                width: 'auto',
                color: isEditing ? 'var(--sb-active-color)' : 'var(--sb-muted)',
                fontWeight: isEditing ? 600 : 400,
                justifyContent: 'center',
              }}
            >
              <span className="sb-item-icon">
                {footer.icon ? <footer.icon size={16} /> : <LogOut size={16} />}
              </span>
              {(expanded || isEditing) && <span className="sb-item-label">{footer.label}</span>}
            </button>
            {footer.onReset && (expanded || isEditing) && (
              <InlineConfirmReset onReset={footer.onReset} />
            )}

            {/* ── Phase 3: ⌘K Command Palette shortcut button ── */}
            {!isEditing && (
              <button
                className="sb-item sb-cmd-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('sidebar:open-palette'))}
                data-tooltip={!expanded ? '⌘K' : undefined}
                title="Open Command Palette (⌘K)"
                style={{
                  flex: expanded ? '0 0 auto' : 1,
                  width: 'auto',
                  color: 'var(--sb-muted)',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span className="sb-item-icon"><Command size={14} /></span>
                {expanded && <span className="sb-item-label" style={{ fontSize: '11px' }}>⌘K</span>}
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
