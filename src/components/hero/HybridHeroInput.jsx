"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Search, ArrowRight, Bot, Package, User, FlaskConical } from '@/lib/icons';
import useGuestPreferences from '../../hooks/useGuestPreferences';
import { performDatabaseSearch } from '../../services/searchDatabaseService';
import { useAuth } from '../../context/AuthContext';

export default function HybridHeroInput({ onSearch }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { savePrefs } = useGuestPreferences();
  const { userProfile, isProfessional } = useAuth();
  
  const activeRole = userProfile?.role || (isProfessional ? 'professional' : 'retail');

  const EXPLORE_CHIPS = [
    'Longevity', 'Recovery', 'Cognitive', 'Sleep', 'Metabolic', 'Athletic'
  ];

  const handleSubmit = (val = query) => {
    if (!val?.trim()) return;
    setShowSuggestions(false);
    
    // Simple heuristic: if query is less than 3 words and doesn't contain verbs like 'want', 'need', 'help', 'improve'
    // treat it as a direct search
    const words = val.trim().split(/\s+/).length;
    const isConversational = words > 3 || /want|need|help|improve|recover|heal|feel/i.test(val);

    if (isConversational) {
      handleAnalyze(val);
    } else {
      if (onSearch) onSearch(val);
    }
  };

  const handleAnalyze = (input) => {
    setIsAnalyzing(true);
    
    // Tiny delay for UI feedback (shows the spinning bot icon briefly)
    setTimeout(() => {
      // Very basic categorization for preferences
      const lower = input.toLowerCase();
      let extGoal = 'longevity'; 
      if (lower.match(/recover|heal|injury|joint|pain/)) extGoal = 'recovery';
      else if (lower.match(/brain|focus|cogniti|memory|adhd/)) extGoal = 'cognition';
      else if (lower.match(/weight|fat|metabol|lean/)) extGoal = 'weight-loss';
      else if (lower.match(/muscle|strength|hypertrophy|bulk/)) extGoal = 'muscle';
      else if (lower.match(/sleep|insomnia/)) extGoal = 'sleep';
      
      // Save basic context so other parts of the site can adapt
      savePrefs({ goal: extGoal, context: input });
      
      setIsAnalyzing(false);
      setQuery('');
      
      // Invoke Semantic Search / AI Assistant Modal directly
      if (onOpenAI) {
        onOpenAI(input, input);
      } else {
        window.dispatchEvent(new CustomEvent('open-clinical-ai', { 
          detail: { query: input, autoSend: true, displayText: input }
        }));
      }
    }, 400);
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
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{
        position: 'relative',
        background: 'var(--color-bg-surface)',
        borderRadius: '16px',
        padding: '0.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        border: `2px solid ${isAnalyzing ? '#1a73e8' : 'transparent'}`,
        transition: 'all 0.3s ease'
      }}>
        {isAnalyzing ? (
          <Bot size={24} color="#1a73e8" className="spin-slow" style={{ marginLeft: '0.5rem' }} />
        ) : (
          <Sparkles size={24} color="#1a73e8" style={{ marginLeft: '0.5rem' }} />
        )}
        
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
          placeholder={t('hero.hybrid.placeholder', "Describe your health goals or search for a compound...")}
          disabled={isAnalyzing}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '1.1rem',
            color: 'var(--text-main)',
            outline: 'none',
            fontFamily: 'inherit',
            opacity: isAnalyzing ? 0.7 : 1
          }}
        />
        
        <button
          onClick={() => handleSubmit()}
          disabled={isAnalyzing || !query.trim()}
          style={{
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.8rem 1.5rem',
            cursor: query.trim() && !isAnalyzing ? 'pointer' : 'default',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: query.trim() && !isAnalyzing ? 1 : 0.5,
            transition: 'opacity 0.2s'
          }}
        >
          {t('hero.hybrid.btn', 'Analyze')} <ArrowRight size={18} />
        </button>
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-slow {
            animation: spin 3s linear infinite;
          }
        `}</style>

        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            background: 'var(--surface, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            zIndex: 100,
            padding: '0.5rem',
            border: '1px solid var(--border, #e5e7eb)'
          }}>
            {suggestions.map((hit) => (
              <a 
                key={hit.id} 
                href={hit.path}
                onClick={(e) => {
                  // Allow default navigation
                  setShowSuggestions(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: '12px',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 115, 232, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ 
                  background: 'rgba(26, 115, 232, 0.1)', 
                  padding: '0.5rem', 
                  borderRadius: '50%',
                  color: 'var(--primary, #1a73e8)'
                }}>
                  {hit.iconName === 'flask' ? <FlaskConical size={20} /> :
                   hit.iconName === 'user' ? <User size={20} /> : 
                   <Package size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{hit.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)' }}>{hit.description}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        marginTop: '1.5rem'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', alignSelf: 'center', marginRight: '0.5rem' }}>
          {t('hero.hybrid.try', 'Or try:')}
        </span>
        {EXPLORE_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => handleSubmit(`I want to improve my ${chip.toLowerCase()}`)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '20px',
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(4px)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
