'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft, Command } from 'lucide-react';

/**
 * Quick-actions palette inspired by the Google Cloud console.
 * Opens with Cmd/Ctrl + "/" (Cmd+K stays reserved for the page search bar).
 *
 * commands: [{ id, label, hint?, group?, icon?: LucideIcon, run: () => void }]
 */
export default function DoctorCommandPalette({ commands = [], showLauncher = true }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    let pendingG = false;
    let gTimer = null;
    const isTyping = (el) =>
      el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    const byId = (id) => commands.find((c) => c.id === id);

    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setQuery('');
        setCursor(0);
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      const k = e.key.toLowerCase();
      if (pendingG) {
        pendingG = false;
        clearTimeout(gTimer);
        const map = { p: 'patients', r: 'rx-list', t: 'tasks', c: 'discovery' };
        if (map[k]) {
          e.preventDefault();
          byId(map[k])?.run();
        }
        return;
      }
      if (k === 'g') {
        pendingG = true;
        gTimer = setTimeout(() => {
          pendingG = false;
        }, 1200);
      } else if (k === 'n') {
        e.preventDefault();
        byId('new-rx')?.run();
      } else if (e.key === '?') {
        e.preventDefault();
        setQuery('');
        setCursor(0);
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(gTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, [commands]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint || ''} ${c.group || ''}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const safeCursor = Math.min(cursor, Math.max(results.length - 1, 0));

  const execute = (cmd) => {
    if (!cmd) return;
    setOpen(false);
    cmd.run();
  };

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(Math.min(safeCursor + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(Math.max(safeCursor - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(results[safeCursor]);
    }
  };

  return (
    <>
      {showLauncher && (
        <button
          type="button"
          aria-label="Open quick actions"
          onClick={() => {
            setQuery('');
            setCursor(0);
            setOpen(true);
          }}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 900,
            minHeight: 44,
            minWidth: 44,
            padding: '0 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 22,
            border: '1px solid #dadce0',
            background: '#ffffff',
            color: '#003666',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(60,64,67,0.25)',
            cursor: 'pointer'
          }}
        >
          <Command size={16} />
          <span>Quick actions</span>
          <kbd style={{ fontSize: 11, color: '#5f6368' }}>⌘/</kbd>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick actions"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(32,33,36,0.45)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '10vh 12px 0'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 560,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderBottom: '1px solid #e8eaed'
              }}
            >
              <Search size={18} color="#5f6368" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search actions: new prescription, patients, products…"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  minHeight: 32,
                  background: 'transparent'
                }}
              />
              <kbd style={{ fontSize: 11, color: '#5f6368' }}>Esc</kbd>
            </div>

            <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: 6 }}>
              {results.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#5f6368', fontSize: 14 }}>
                  No actions match “{query}”.
                </div>
              )}
              {results.map((cmd, i) => {
                const Icon = cmd.icon;
                const active = i === safeCursor;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => execute(cmd)}
                    style={{
                      width: '100%',
                      minHeight: 44,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 8,
                      background: active ? '#e8f0fe' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {Icon && <Icon size={18} color={active ? '#003666' : '#5f6368'} />}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#202124' }}>
                        {cmd.label}
                      </span>
                      {cmd.hint && (
                        <span style={{ display: 'block', fontSize: 12, color: '#5f6368' }}>{cmd.hint}</span>
                      )}
                    </span>
                    {active && <CornerDownLeft size={14} color="#5f6368" />}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px 14px',
                padding: '10px 16px',
                borderTop: '1px solid #e8eaed',
                background: '#f8f9fa',
                fontSize: 12,
                color: '#5f6368'
              }}
            >
              <span><kbd>N</kbd> New prescription</span>
              <span><kbd>G</kbd> then <kbd>P</kbd> Patients</span>
              <span><kbd>G</kbd> then <kbd>R</kbd> Prescriptions</span>
              <span><kbd>G</kbd> then <kbd>T</kbd> Tasks</span>
              <span><kbd>G</kbd> then <kbd>C</kbd> Products</span>
              <span><kbd>?</kbd> This help</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
