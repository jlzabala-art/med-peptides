import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bot, Package, User, FlaskConical, FileText } from '@/lib/icons';
import useGuestPreferences from '../../hooks/useGuestPreferences';
import { performDatabaseSearch } from '../../services/searchDatabaseService';
import { useAuth } from '../../context/AuthContext';

export default function HybridHeroInput({ onSearch, onOpenAI }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { savePrefs } = useGuestPreferences();
  const { userProfile, isProfessional } = useAuth();
  
  const activeRole = userProfile?.role || (isProfessional ? 'professional' : 'retail');

  // Exact 5 recommendation pills from the mobile UI
  const SUGGESTION_PILLS = [
    'GLP-1 Research',
    'Better Sleep',
    'Muscle Recovery',
    'Tirzepatide vs Retatrutide',
    'Longevity Protocol'
  ];

  const handleSubmit = (val = query) => {
    if (!val?.trim()) return;
    setShowSuggestions(false);
    
    const words = val.trim().split(/\s+/).length;
    const isConversational = words > 3 || /want|need|help|improve|recover|heal|feel|vs|protocol/i.test(val);

    if (isConversational) {
      handleAnalyze(val);
    } else {
      if (onSearch) onSearch(val);
    }
  };

  const handleAnalyze = (input) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const lower = input.toLowerCase();
      let extGoal = 'longevity'; 
      if (lower.match(/recover|heal|injury|joint|pain/)) extGoal = 'recovery';
      else if (lower.match(/brain|focus|cogniti|memory|adhd/)) extGoal = 'cognition';
      else if (lower.match(/weight|fat|metabol|lean|glp/)) extGoal = 'weight-loss';
      else if (lower.match(/muscle|strength|hypertrophy|bulk/)) extGoal = 'muscle';
      else if (lower.match(/sleep|insomnia/)) extGoal = 'sleep';
      
      savePrefs({ goal: extGoal, context: input });
      
      setIsAnalyzing(false);
      setQuery('');
      
      if (onOpenAI) {
        onOpenAI(input, input);
      } else {
        window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
          detail: { query: input, autoSend: true, displayText: input }
        }));
      }
    }, 300);
  };

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await performDatabaseSearch(query, activeRole);
        setSuggestions(results);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, activeRole]);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Floating Search / AI Pill Input */}
      <div style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '999px',
        padding: '0.4rem 0.5rem 0.4rem 0.6rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        border: '1.5px solid #e2e8f0',
        transition: 'all 0.2s ease'
      }}>
        {/* Purple robot icon badge */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAI) onOpenAI();
            else window.dispatchEvent(new CustomEvent('open-clinical-ai', { detail: { query: '' } }));
          }}
          aria-label="Clinical AI Assistant"
          style={{
            background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={20} color="#6366f1" />
        </button>
        
        {/* Input text */}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Search or ask ClinicalAI..."
          disabled={isAnalyzing}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '0.98rem',
            color: '#0f172a',
            outline: 'none',
            fontFamily: 'inherit',
            minWidth: 0,
            fontWeight: 450
          }}
        />

        {/* Prescription document green icon */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAI) onOpenAI('Analyze Prescription');
            else window.dispatchEvent(new CustomEvent('open-clinical-ai', { detail: { query: 'Analyze Prescription' } }));
          }}
          aria-label="Prescription Analysis"
          title="Upload or analyze prescription"
          style={{
            background: 'none',
            border: 'none',
            color: '#10b981',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.35rem',
            flexShrink: 0,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <FileText size={20} />
        </button>
        
        {/* Circular blue search button with magnifying glass */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          aria-label="Search"
          style={{
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.35)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#0369a1'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#0284c7'}
        >
          <Search size={18} />
        </button>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            zIndex: 100,
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            textAlign: 'left'
          }}>
            {suggestions.map((hit) => (
              <a 
                key={hit.id} 
                href={hit.path}
                onClick={() => setShowSuggestions(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: '10px',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  background: '#f1f5f9', 
                  padding: '0.4rem', 
                  borderRadius: '8px',
                  color: '#0284c7'
                }}>
                  {hit.iconName === 'flask' ? <FlaskConical size={18} /> :
                   hit.iconName === 'user' ? <User size={18} /> : 
                   <Package size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>{hit.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{hit.description}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Suggestion Pills Strip with horizontal swipe on mobile */}
      <div 
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          padding: '0.85rem 0.25rem 0.25rem',
          justifyContent: 'flex-start',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {SUGGESTION_PILLS.map(pill => (
          <button
            key={pill}
            type="button"
            onClick={() => handleSubmit(pill)}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#475569',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9';
              e.currentTarget.style.color = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#475569';
            }}
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
