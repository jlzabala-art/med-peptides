import React, { useState, useEffect, useCallback } from 'react';
import { Menu, ChevronDown, LogOut, GripVertical, Star } from 'lucide-react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './AppSidebar.css';

// ─── Sortable Group Wrapper ────────────────────────────────────────────────
function SortableSidebarGroup({ group, isOpen, expanded, toggleGroup, activeId, handleItemClick, isEditing, isMobile, onToggleFavorite, isFavoritesGroup, favoritesSet }) {
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
    <div ref={setNodeRef} style={style} className="sb-group">
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {isEditing && (
          <div style={{ padding: '4px 4px 4px 12px', width: '28px' }} />
        )}
        <button
          className="sb-group-header"
          onClick={() => !isEditing && toggleGroup(group.id)}
          aria-expanded={isOpen}
          data-tooltip={!expanded ? group.label : undefined}
          title={!expanded ? group.label : undefined}
          style={{ flex: 1, pointerEvents: isEditing ? 'none' : 'auto' }}
        >
          <span className="sb-group-emoji" aria-hidden="true">{group.emoji}</span>
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
      >
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
        data-tooltip={!expanded ? item.label : undefined}
        title={!expanded ? item.label : undefined}
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
          <span className="sb-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
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
  const [expanded, setExpanded] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${storageKey}:expanded`) ?? 'true'); }
    catch { return true; }
  });

  const [openGroups, setOpenGroups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`${storageKey}:openGroups`) ?? 'null');
      if (saved) return new Set(saved);
    } catch {}
    
    const activeGroup = groups.find(g => g.items?.some(i => i.id === activeId));
    return activeGroup ? new Set([activeGroup.id]) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(`${storageKey}:expanded`, JSON.stringify(expanded));
  }, [expanded, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:openGroups`, JSON.stringify([...openGroups]));
  }, [openGroups, storageKey]);

  useEffect(() => {
    if (isEditing) {
      setOpenGroups(new Set(groups.map(g => g.id)));
      if (!expanded) setExpanded(true);
    } else {
      const activeGroup = groups.find(g => g.items?.some(i => i.id === activeId));
      if (activeGroup) {
        setOpenGroups(new Set([activeGroup.id]));
      }
    }
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
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.clear(); // Enforce accordion behavior globally
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleItemClick = useCallback((itemId) => {
    onNavigate?.(itemId);
    if (isMobile) onClose?.();
  }, [onNavigate, isMobile, onClose]);

  const favoritesSet = React.useMemo(() => {
    return new Set(groups.find(g => g.id === 'favorites')?.items?.map(i => i.id) || []);
  }, [groups]);

  const sidebarClasses = [
    'app-sidebar',
    !expanded && !isMobile ? 'collapsed' : '',
    isOpen && isMobile ? 'mobile-open' : '',
    isEditing ? 'editing-mode' : ''
  ].filter(Boolean).join(' ');

  const sidebarStyle = {
    '--sb-active-color': accentColor,
    '--sb-active-bg': `${accentColor}18`,
  };

  return (
    <>
      {isOpen && isMobile && (
        <div className="sb-overlay" onClick={onClose} />
      )}

      <aside className={sidebarClasses} style={sidebarStyle} aria-label="Main navigation">
        <div className="sb-header">
          {!isMobile && (
            <button
              className="sb-hamburger"
              onClick={() => !isEditing && setExpanded(e => !e)}
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
              style={{ visibility: isEditing ? 'hidden' : 'visible' }}
            >
              <Menu size={18} />
            </button>
          )}
          <div className="sb-brand" style={{ display: 'flex', alignItems: 'center' }}>
            {header.title && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: 'var(--color-primary, #0071bd)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="sb-brand-title">{header.title}</span>
                  {header.subtitle && <span className="sb-brand-sub">{header.subtitle}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

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
                    title={!expanded ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sb-item-icon">
                      {Icon && <Icon size={16} />}
                    </span>
                    <span className="sb-item-label">{item.label}</span>
                    {!!item.badge && (
                      <span className="sb-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </button>
                );
              })}
              <div className="sb-divider" />
            </div>
          )}

          {/* ── Accordion groups ── */}
          <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
            {groups.map((group, gi) => (
              <React.Fragment key={group.id}>
                <SortableSidebarGroup 
                  group={group}
                  isOpen={openGroups.has(group.id) || isEditing}
                  expanded={expanded}
                  toggleGroup={toggleGroup}
                  activeId={activeId}
                  handleItemClick={handleItemClick}
                  isEditing={isEditing}
                  isMobile={isMobile}
                  onToggleFavorite={onToggleFavorite}
                  isFavoritesGroup={group.id === 'favorites'}
                  favoritesSet={favoritesSet}
                />
                {gi < groups.length - 1 && <div className="sb-divider" />}
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
          </div>
        )}
      </aside>
    </>
  );
}
