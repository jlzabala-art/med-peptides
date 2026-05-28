/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Simple fuzzy search helper (case‑insensitive includes)
const fuzzyMatch = (query, text) => text.toLowerCase().includes(query.toLowerCase());

// Admin routes for the palette – keep in sync with ADMIN_NAV
const ADMIN_ROUTES = [
  { label: 'Admin Dashboard', path: '/admin' },
  { label: 'Active Users', path: '/admin?s=operations&t=users' },
  { label: 'Manage Products', path: '/admin?s=operations&t=products' },
  { label: 'Pricing Matrix', path: '/admin?s=operations&t=prices' },
  { label: 'Orders & Billing', path: '/admin?s=operations&t=orders' },
  { label: 'Commissions', path: '/admin?s=operations&t=commissions' },
  { label: 'Access Levels', path: '/admin?s=architecture&t=access-levels' },
  { label: 'Clinical AI Config', path: '/admin?s=architecture&t=clinical-ai' },
  { label: 'Global Settings', path: '/admin?s=architecture&t=settings' },
  { label: 'Deploy & Hosting', path: '/admin?s=architecture&t=deploy' },
  { label: 'System Analytics', path: '/admin?s=intelligence&t=analytics' },
  { label: 'AI Logs', path: '/admin?s=intelligence&t=ai-logs' },
  { label: 'Growth Signals', path: '/admin?s=intelligence&t=growth' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const filtered = ADMIN_ROUTES.filter(r => fuzzyMatch(query, r.label));

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-modal" onClick={e => e.stopPropagation()}>
        <div className="command-palette-header">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search admin commands…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="command-palette-input"
          />
          <button className="command-palette-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <ul className="command-palette-list">
          {filtered.map(item => (
            <li key={item.path} className="command-palette-item" onClick={() => handleSelect(item.path)}>
              {item.label}
            </li>
          ))}
          {filtered.length === 0 && <li className="command-palette-noresult">No matches</li>}
        </ul>
      </div>
    </div>
  );
}
