"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { Briefcase, Plus, Check, ChevronDown, Layers, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkspaceAddPopover({ item, children, buttonStyle = {}, className = '' }) {
  const {
    workspaces,
    activeWorkspaceId,
    addItem,
    createWorkspace,
    setActiveWorkspace,
    setDrawerOpen
  } = useWorkspaceStore();

  const [isOpen, setIsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef(null);

  const wsList = Object.values(workspaces || {});

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [isOpen]);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    // If only 1 workspace exists, add directly to active workspace
    if (wsList.length <= 1) {
      const activeWs = wsList[0];
      addItem(item, activeWs?.id);
      toast.success(
        (t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Added to <b>{activeWs?.name || 'Workspace 1'}</b></span>
            <button
              onClick={() => {
                setDrawerOpen(true);
                toast.dismiss(t.id);
              }}
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                background: '#003666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Open
            </button>
          </div>
        ),
        { id: `ws-add-${item.id || Date.now()}` }
      );
      return;
    }

    // Multiple workspaces -> toggle selection menu
    setIsOpen((prev) => !prev);
  };

  const handleSelectWorkspace = (wsId, wsName) => {
    addItem(item, wsId);
    setActiveWorkspace(wsId);
    setIsOpen(false);
    toast.success(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Added to <b>{wsName}</b></span>
          <button
            onClick={() => {
              setDrawerOpen(true);
              toast.dismiss(t.id);
            }}
            style={{
              marginLeft: '8px',
              padding: '2px 8px',
              background: '#003666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            View
          </button>
        </div>
      ),
      { id: `ws-add-${item.id || Date.now()}` }
    );
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const newId = createWorkspace(newWsName.trim());
    addItem(item, newId);
    setNewWsName('');
    setIsCreating(false);
    setIsOpen(false);
    toast.success(`Created "${newWsName}" and added product.`);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
        {children || (
          <button
            type="button"
            className={className || 'gcp-btn-secondary'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '6px 12px',
              ...buttonStyle,
            }}
          >
            <Briefcase size={14} />
            Add to Workspace
            {wsList.length > 1 && <ChevronDown size={12} style={{ opacity: 0.7 }} />}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            right: 0,
            width: '260px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            animation: 'fadeIn 0.15s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.96); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>

          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Select Workspace
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {wsList.length} open
            </span>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 0' }}>
            {wsList.map((ws) => {
              const count = (ws.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
              const isActive = ws.id === activeWorkspaceId;

              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleSelectWorkspace(ws.id, ws.name)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive ? '#f0fdf4' : 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.9rem' }}>{ws.intent === 'buy' ? '🏭' : '💼'}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ws.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '99px', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 600 }}>
                      {count}
                    </span>
                    {isActive && <Check size={14} color="#16a34a" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            {isCreating ? (
              <form onSubmit={handleCreateNew} style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  placeholder="Workspace name..."
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    fontSize: '0.78rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newWsName.trim()}
                  style={{
                    padding: '4px 8px',
                    background: '#003666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: newWsName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Add
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                style={{
                  width: '100%',
                  padding: '4px 0',
                  background: 'none',
                  border: 'none',
                  color: '#003666',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Create New Workspace...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
