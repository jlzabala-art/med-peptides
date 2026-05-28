import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Settings,
  GripVertical,
  HelpCircle,
  ArrowRight,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function WholesalerTreeView({ wholesalers = [], onUpdate }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Margin split editor state
  const [editingNode, setEditingNode] = useState(null);
  const [marginShare, setMarginShare] = useState('');
  const [subMarginShare, setSubMarginShare] = useState('');
  const [savingMargin, setSavingMargin] = useState(false);

  // Helper: Cycle loop checker (returns true if targetParentId is a descendant of nodeId)
  const isDescendant = (nodeId, targetParentId) => {
    let currentId = targetParentId;
    while (currentId) {
      if (currentId === nodeId) return true;
      const parent = wholesalers.find((w) => w.id === currentId);
      currentId = parent ? parent.parentWholesalerId : null;
    }
    return false;
  };

  const toggleExpand = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Drag and Drop handlers
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (draggedId === targetId) return;
    if (isDescendant(draggedId, targetId)) return;
    setDragOverId(targetId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e, targetParentId) => {
    e.preventDefault();
    const draggedNodeId = e.dataTransfer.getData('text/plain') || draggedId;
    setDragOverId(null);
    setDraggedId(null);

    if (!draggedNodeId || draggedNodeId === targetParentId) return;
    if (targetParentId && isDescendant(draggedNodeId, targetParentId)) {
      alert('Error: Cannot place a parent wholesaler under its own sub-wholesaler.');
      return;
    }

    try {
      const userRef = doc(db, 'users', draggedNodeId);
      await updateDoc(userRef, {
        parentWholesalerId: targetParentId || null,
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update wholesaler hierarchy:', err);
      alert('Error updating database.');
    }
  };

  // Margin Split save handler
  const handleSaveMargin = async (e) => {
    e.preventDefault();
    if (!editingNode) return;
    setSavingMargin(true);
    try {
      const userRef = doc(db, 'users', editingNode.id);
      await updateDoc(userRef, {
        marginRules: {
          marginShare: parseFloat(marginShare || 0),
          subMarginShare: parseFloat(subMarginShare || 0),
        },
      });
      setEditingNode(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update margin rules:', err);
      alert('Failed to update margin rules.');
    } finally {
      setSavingMargin(false);
    }
  };

  const openMarginEditor = (node) => {
    setEditingNode(node);
    const rules = node.marginRules || {};
    setMarginShare(rules.marginShare !== undefined ? rules.marginShare : '10');
    setSubMarginShare(rules.subMarginShare !== undefined ? rules.subMarginShare : '5');
  };

  // Group wholesalers into parent-child map
  const rootNodes = wholesalers.filter((w) => {
    // If parentWholesalerId is set but matches no existing wholesaler, treat as root
    if (!w.parentWholesalerId) return true;
    return !wholesalers.some((item) => item.id === w.parentWholesalerId);
  });

  const getChildrenOf = (parentId) => {
    return wholesalers.filter((w) => w.parentWholesalerId === parentId);
  };

  // Recursive tree rendering
  const renderTreeNode = (node, depth = 0) => {
    const children = getChildrenOf(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes[node.id] !== false; // Default expanded
    const isDragOver = dragOverId === node.id;
    const isCurrentlyDragged = draggedId === node.id;

    const rules = node.marginRules || {};
    const hasRules = rules.marginShare !== undefined || rules.subMarginShare !== undefined;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Node Card wrapper */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: isCurrentlyDragged ? '#f1f5f9' : 'white',
            border: isDragOver ? '2px dashed #1a73e8' : '1px solid var(--border)',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.2s ease',
            marginLeft: depth > 0 ? `${depth * 24}px` : '0',
            position: 'relative',
            opacity: isCurrentlyDragged ? 0.5 : 1,
            cursor: 'grab',
            marginBottom: '0.5rem',
          }}
        >
          {/* Vertical layout lines */}
          {depth > 0 && (
            <div
              style={{
                position: 'absolute',
                left: `-${12}px`,
                top: '-10px',
                bottom: '50%',
                width: '12px',
                borderLeft: '2px solid var(--border)',
                borderBottom: '2px solid var(--border)',
                borderBottomLeftRadius: '4px',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Grip handle & chevron */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'grab',
              color: 'var(--text-muted)',
            }}
          >
            <GripVertical size={16} />
          </div>

          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div style={{ width: '20px' }} />
          )}

          {/* Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: hasChildren ? 'rgba(26,115,232,0.08)' : 'rgba(148,163,184,0.08)',
              color: hasChildren ? '#1a73e8' : 'var(--text-muted)',
            }}
          >
            <Building2 size={16} />
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {node.fullName || node.displayName || 'Unnamed Wholesaler'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{node.email}</div>
          </div>

          {/* Margin info rules */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: 'rgba(26, 115, 232, 0.05)',
                border: '1px solid rgba(26, 115, 232, 0.2)',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                color: '#1a73e8',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span>
                Keep: <b>{rules.marginShare !== undefined ? rules.marginShare : '10'}%</b>
              </span>
              {hasChildren && (
                <>
                  <ArrowRight size={10} />
                  <span>
                    Pass: <b>{rules.subMarginShare !== undefined ? rules.subMarginShare : '5'}%</b>
                  </span>
                </>
              )}
            </div>

            <button
              onClick={() => openMarginEditor(node)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.25rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s',
              }}
              title="Edit Margin Split"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Render children recursively */}
        {hasChildren && isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Guide line down for children connection */}
            <div
              style={{
                position: 'absolute',
                left: `${(depth + 1) * 24 - 12}px`,
                top: '0',
                bottom: '15px',
                borderLeft: '2px dashed var(--border)',
                pointerEvents: 'none',
              }}
            />
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      {/* Move to Root Drag zone / drop target */}
      <div
        onDragOver={(e) => handleDragOver(e, 'root')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
        style={{
          border: dragOverId === 'root' ? '2px dashed #1a73e8' : '2px dashed var(--border)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center',
          backgroundColor: dragOverId === 'root' ? 'rgba(26, 115, 232, 0.02)' : 'white',
          color: dragOverId === 'root' ? '#1a73e8' : 'var(--text-muted)',
          fontSize: '0.85rem',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          minHeight: '60px',
        }}
      >
        <span>Drag sub-wholesalers here to promote them to Main Wholesalers (Root level)</span>
      </div>

      {/* Hierarchy tree wrapper */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-app)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '1.5rem',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {rootNodes.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            No wholesalers configured. Add some in the database first.
          </div>
        ) : (
          rootNodes.map((node) => renderTreeNode(node, 0))
        )}
      </div>

      {/* Margin Rules Modal Popover */}
      {editingNode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '450px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <style>{`
              @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                  }}
                >
                  Margin Rules Manager
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {editingNode.fullName || editingNode.displayName}
                </span>
              </div>
              <button
                onClick={() => setEditingNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSaveMargin}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Wholesaler Keep Margin (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={marginShare}
                  onChange={(e) => setMarginShare(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: '0.85rem',
                  }}
                  placeholder="e.g. 10"
                />
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                    display: 'block',
                  }}
                >
                  Percentage of profit this wholesaler keeps for themselves on directly mapped
                  orders.
                </span>
              </div>

              {getChildrenOf(editingNode.id).length > 0 && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Sub-Wholesaler Pass Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={subMarginShare}
                    onChange={(e) => setSubMarginShare(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      fontSize: '0.85rem',
                    }}
                    placeholder="e.g. 5"
                  />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem',
                      display: 'block',
                    }}
                  >
                    Percentage of profit passed down to child wholesalers under this wholesaler's
                    branch.
                  </span>
                </div>
              )}

              {/* Warning box */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '6px',
                  color: '#b45309',
                  fontSize: '0.75rem',
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Margin sharing percentages directly impact real-time order payouts and Zoho Books
                  sales summaries calculations.
                </span>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMargin}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: '#1a73e8',
                    color: 'white',
                    fontWeight: 600,
                    minWidth: '80px',
                  }}
                >
                  {savingMargin ? 'Saving...' : 'Save Rules'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
