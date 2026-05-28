 
import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

/**
 * DiscoverySearchBar — enhanced semantic search input with suggestions.
 * Calls onSearch(query) on submit or as user types (debounced).
 */
export default function DiscoverySearchBar({ onSearch, placeholder, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const suggestions = [
    'How do I choose a peptide?',
    'Metabolism and weight management',
    'Compare Semaglutide vs Tirzepatide',
    'Recovery and tissue repair',
    'Cognitive support peptides',
    'Storage and reconstitution',
    'Professional access',
  ];

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 320);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    onSearch?.(query);
    inputRef.current?.blur();
    setIsFocused(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleSuggestion = (s) => {
    setQuery(s);
    onSearch?.(s);
    setIsFocused(false);
  };

  return (
    <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '999px',
            border: `2px solid ${isFocused ? 'var(--primary)' : 'var(--border)'}`,
            boxShadow: isFocused
              ? '0 0 0 4px rgba(0,43,77,0.08)'
              : '0 4px 16px rgba(0,0,0,0.08)',
            padding: '0.5rem 0.75rem 0.5rem 1.25rem',
            transition: 'all 0.25s ease',
            gap: '0.5rem',
          }}
        >
          <Search
            size={20}
            style={{
              color: isFocused ? 'var(--primary)' : 'var(--text-muted)',
              flexShrink: 0,
              transition: 'color 0.25s',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder || 'Search peptides, goals, or questions…'}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              background: 'transparent',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem',
                borderRadius: '50%',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              padding: '0.55rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              flexShrink: 0,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick suggestions */}
      {isFocused && !query && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            zIndex: 100,
            padding: '0.75rem',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              margin: '0 0 0.5rem 0.5rem',
            }}
          >
            <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Suggested searches
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => handleSuggestion(s)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                background: 'none',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                transition: 'background 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,43,77,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
