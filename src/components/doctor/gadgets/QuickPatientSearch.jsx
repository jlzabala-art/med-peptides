import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickPatientSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={18} color="#0ea5e9" /> Patient Lookup
      </h3>
      
      <div style={{ position: 'relative', flex: 1 }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ID or phone..." 
          style={{ 
            width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', 
            borderRadius: '12px', border: '1.5px solid #e2e8f0', 
            fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
        />
        <Search size={18} color="var(--color-text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      <button 
        onClick={() => navigate('/doctor/patients/new')}
        style={{ 
          marginTop: '1rem', width: '100%', padding: '0.75rem', 
          background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', 
          border: 'none', borderRadius: '10px', fontWeight: 700, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          cursor: 'pointer', transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'}
      >
        <UserPlus size={16} /> Add New Patient
      </button>
    </div>
  );
}
