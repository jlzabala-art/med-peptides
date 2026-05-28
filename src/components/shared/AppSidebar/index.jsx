import React, { useState, useEffect, useCallback } from 'react';
import { Menu, ChevronDown, LogOut, GripVertical, Star } from 'lucide-react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './AppSidebar.css';

// ─── Sortable Group Wrapper ────────────────────────────────────────────────
function SortableSidebarGroup({ group, isOpen, expanded, toggleGroup, activeId, handleItemClick, isEditing, isMobile, onToggleFavorite, isFavoritesGroup }) {
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
  const maxH = isOpen ? `${items.length * 40 + 8}px` : '0px';

  return (
    <div ref={setNodeRef} style={style} className="sb-group">
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
              padding: '1px 5px', borderRadius: '3px',
              backgroundColor: group.badgeColor || '#0071bd',
              color: 'white', marginRight: '4px',
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
              isFavorite={isFavoritesGroup}
            />
          ))}
        </SortableContext>
        
        {/* Drop zone placeholder for empty groups */}
        {isEditing && items.length === 0 && (
          <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
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
          style={{ cursor: 'grab', padding: '0 8px', color: 'var(--text-muted)' }}
        >
          <GripVertical size={14} />
        </div>
      )}
      <button
        className={`sb-item${isActive ? ' active' : ''}`}
        onClick={() => !isEditing && handleItemClick(item.id)}
        data-tooltip={!expanded ? item.label : undefined}
        title={!expanded ? item.label : undefined}
        aria-current={isActive ? 'page' : undefined}
        style={{ flex: 1, pointerEvents: isEditing ? 'none' : 'auto', paddingLeft: isEditing ? '4px' : '16px' }}
      >
        <span className="sb-item-icon">
          {Icon && <Icon size={16} />}
        </span>
        <span className="sb-item-label">{item.label}</span>
        {!!item.badge && (
          <span className="sb-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
        )}
      </button>
      
      {/* Pin to Favorites Button */}
      {onToggleFavorite && (isEditing || expanded) && (
        <button
          className="sb-item-pin-btn"
          onClick={(e) => onToggleFavorite(item.id, e)}
          title={isFavorite ? "Remove from Favorites" : "Pin to Favorites"}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: isFavorite ? '#f59e0b' : 'var(--text-muted)',
            opacity: isEditing || isFavorite ? 1 : 0,
            transition: 'opacity 0.2s, transform 0.2s, color 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = isFavorite ? '#f59e0b' : 'var(--text-muted)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Star size={14} fill={isFavorite ? '#f59e0b' : 'none'} />
        </button>
      )}
    </div>
  );
}

// ─── Main AppSidebar ────────────────────────────────────────────────────────
export default function AppSidebar({
  storageKey = 'app-sidebar',
  groups = [],
  activeId,
  onNavigate,
  accentColor = '#0071bd',
  header = {},
  footer,
  isOpen,
  onClose,
  isMobile,
  isEditing = false, // Injected by SidebarGadget wrapper
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
    return new Set(groups.map(g => g.id));
  });

  useEffect(() => {
    localStorage.setItem(`${storageKey}:expanded`, JSON.stringify(expanded));
  }, [expanded, storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:openGroups`, JSON.stringify([...openGroups]));
  }, [openGroups, storageKey]);

  useEffect(() => {
    if (isEditing) {
      setOpenGroups(new Set(groups.map(g => g.id))); // Open all when editing
      if (!expanded) setExpanded(true); // Must be expanded to edit properly
    } else {
      const activeGroup = groups.find(g => g.items?.some(i => i.id === activeId));
      if (activeGroup) {
        setOpenGroups(prev => { const next = new Set(prev); next.add(activeGroup.id); return next; });
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
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  }, []);

  const handleItemClick = useCallback((itemId) => {
    onNavigate?.(itemId);
    if (isMobile) onClose?.();
  }, [onNavigate, isMobile, onClose]);

  const sidebarClasses = [
    'app-sidebar',
    !expanded && !isMobile ? 'collapsed' : '',
    isOpen && isMobile ? 'mobile-open' : '',
    isEditing ? 'editing-mode' : ''
  ].filter(Boolean).join(' ');

  const sidebarStyle = { '--sb-active-border': accentColor, '--sb-active-bg': `${accentColor}25` };

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
          <div className="sb-brand">
            {header.title && <span className="sb-brand-title">{header.title}</span>}
            {header.subtitle && <span className="sb-brand-sub">{header.subtitle}</span>}
          </div>
        </div>

        <nav className="sb-scroll" role="navigation">
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
                />
                {gi < groups.length - 1 && <div className="sb-divider" />}
              </React.Fragment>
            ))}
          </SortableContext>
        </nav>

        {footer && (
          <div className="sb-footer">
            <button
              className="sb-item"
              onClick={footer.onClick}
              data-tooltip={!expanded ? footer.label : undefined}
              style={{ color: isEditing ? 'var(--primary)' : 'var(--text-tertiary)', fontWeight: isEditing ? 600 : 400, justifyContent: 'center' }}
            >
              <span className="sb-item-icon">
                {footer.icon ? <footer.icon size={16} /> : <LogOut size={16} />}
              </span>
              {(expanded || isEditing) && <span className="sb-item-label">{footer.label}</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
