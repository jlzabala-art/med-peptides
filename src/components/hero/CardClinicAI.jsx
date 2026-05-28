import React, { useState } from 'react';
import { Bot, ArrowRight } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';
import '../../styles/hero_card.css';

const AI_SUGGESTIONS = [
  'Build a recovery protocol',
  'Compare BPC-157 and TB-500',
  'Protocol for sleep and cognitive focus'
];

export default function CardClinicAI({ onAsk }) {
  const [query, setQuery] = useState('');
  const isMobile = useResponsive('(max-width: 768px)');

  const handleSubmit = (val = query) => {
    if (!val.trim()) return;
    if (onAsk) {
      onAsk(val);
    } else {
      // Fallback custom event trigger
      sessionStorage.setItem('ai_seed_query', val);
      window.dispatchEvent(
        new CustomEvent('open-clinical-ai', {
          detail: { query: val, autoSend: true }
        })
      );
    }
    setQuery('');
  };

  return (
    <div className="hero-card card-clinicai">
      <div className="icon-box"><Bot size={24} /></div>
      <h3 className="card-title">Help me choose</h3>
      <p className="card-desc">Describe your objective and let ClinicAI guide you.</p>
      
      <div className="card-input-wrapper">
        <input
          className="card-input"
          type="text"
          placeholder="Describe your goal"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <button className="card-cta" onClick={() => handleSubmit()}>
        Ask <ArrowRight size={16} />
      </button>
      <small className="card-helper">Personalized guidance</small>

      {!isMobile && (
        <div className="suggestions-list">
          {AI_SUGGESTIONS.map(prompt => (
            <button
              key={prompt}
              className="suggestion-item"
              onClick={() => handleSubmit(prompt)}
            >
              <Bot size={12} style={{ marginRight: '4px' }} />
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
