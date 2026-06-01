import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, navGroups = [], pinnedItems = [], onNavigate, onAskAI }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten all navigable items
  const allItems = [
    ...pinnedItems,
    ...navGroups.flatMap(group => group.items)
  ];

  // Filter items based on query
  const filteredNavItems = allItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.id.toLowerCase().includes(query.toLowerCase())
  );

  // Add AI Actions as an option
  const isAskAI = query.toLowerCase().startsWith('/ask') || query.length > 5;
  const aiAction = isAskAI ? [{
    type: 'ai',
    id: 'ai-action',
    label: `Ask Atlas AI: "${query}"`,
    icon: Command
  }] : [];

  const results = [...filteredNavItems, ...aiAction];

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeAction(results[selectedIndex]);
    }
  };

  const executeAction = (item) => {
    if (!item) return;
    if (item.type === 'ai') {
      onClose();
      if (onAskAI) {
        const prompt = query.startsWith('/ask ') ? query.replace('/ask ', '') : query;
        onAskAI(prompt);
      }
    } else {
      onNavigate(item.id);
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #eee' }}>
          <Search size={20} color="#888" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. 'products' or '/ask summarize today')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              padding: '18px 16px',
              fontSize: '1.1rem',
              outline: 'none',
              backgroundColor: 'transparent'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#aaa', border: '1px solid #eee', padding: '2px 6px', borderRadius: '4px' }}>
            ESC to close
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
          {results.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
              No results found for "{query}"
            </div>
          )}
          
          {results.map((item, index) => {
            const isSelected = index === selectedIndex;
            const Icon = item.icon || ArrowRight;
            return (
              <div
                key={item.id}
                onClick={() => executeAction(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'var(--color-accent-light, #eef2ff)' : 'transparent',
                  color: isSelected ? 'var(--color-accent-dark, #3b82f6)' : '#333',
                  transition: 'all 0.1s'
                }}
              >
                <Icon size={18} style={{ marginRight: '12px', opacity: isSelected ? 1 : 0.6 }} />
                <span style={{ fontWeight: isSelected ? 600 : 400 }}>{item.label}</span>
                {item.type === 'ai' && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                    Atlas AI
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
