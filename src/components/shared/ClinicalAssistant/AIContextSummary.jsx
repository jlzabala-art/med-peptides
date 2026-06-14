import Bot from "lucide-react/dist/esm/icons/bot";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React, { useState } from 'react';



import { useAuth } from '../../../context/AuthContext';
import { API_ENDPOINT } from './constants';

export default function AIContextSummary({ entityType, entityId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userProfile } = useAuth();

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the generic ClinicalAssistant endpoint but inject a command to use the tool
      const body = JSON.stringify({
        message: `Generate a contextual summary for ${entityType} with ID ${entityId}`,
        sessionId: \`summary-\${entityType}-\${entityId}\`,
        query_type: 'admin',
        clinicAIConfig: { agentId: 'gemini-native' },
        context: {
          instructions: `--- ADMIN MODE ACTIVE ---\nYou are AdminAI. Immediately call the generate_contextual_summary tool for entity_type="${entityType}" and entity_id="${entityId}" and output ONLY the markdown result of that tool. Do not add conversational fluff.`,
          user_profile: userProfile ? { uid: userProfile.uid, role: userProfile.role || 'admin' } : null,
        },
        history: [],
      });

      const resp = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!resp.ok) throw new Error('Failed to fetch AI summary');
      const data = await resp.js();
      setSummary(data.reply);
    } catch (err) {
      console.error(err);
      setError('Could not generate summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '1px solid rgba(59, 130, 246, 0.2)',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 600 }}>
          <Bot size={18} /> Atlas AI Summary
        </div>
        {!summary && !loading && (
          <button 
            onClick={fetchSummary}
            style={{ 
              background: '#2563eb', color: 'white', border: 'none', 
              padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Generate
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing context...
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.9rem' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {summary && (
        <div className="prose prose-sm" style={{ fontSize: '0.9rem', color: '#334155' }}>
          <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
}