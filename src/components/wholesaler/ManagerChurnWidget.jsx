import React, { useState, useEffect } from 'react';
import { getChurnPredictions } from '../../services/accountManagerAiService';
import Bot from "lucide-react/dist/esm/icons/bot";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";

export default function ManagerChurnWidget({ managerId }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      try {
        const data = await getChurnPredictions(managerId);
        setPredictions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPredictions();
  }, [managerId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1.5rem', animation: 'pulse 2s infinite' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bot size={20} color="var(--color-text-tertiary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Analyzing Portfolio Risk...</h2>
        </div>
        <div style={{ height: '80px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: '4px' }}></div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={24} color="#8b5cf6" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>AI Churn Prediction</h2>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#fff', backgroundColor: '#8b5cf6', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
          ACTION REQUIRED
        </span>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Our predictive model has identified clients with a high probability of churn based on recent activity patterns.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {predictions.map((client) => (
          <div key={client.clientId} style={{ backgroundColor: 'var(--color-bg-elevated)', padding: '1rem', borderRadius: '6px', borderLeft: `4px solid ${client.churnRisk === 'High' ? '#ef4444' : '#f59e0b'}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{client.clientName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: client.churnRisk === 'High' ? '#ef4444' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                <AlertTriangle size={16} />
                {client.churnRisk} Risk ({client.riskScore}%)
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <strong>Reason:</strong> {client.reason}
            </div>
            <div style={{ marginTop: '0.5rem', backgroundColor: '#8b5cf615', padding: '0.75rem', borderRadius: '4px', border: '1px solid #8b5cf630' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <CheckCircle size={16} color="#8b5cf6" />
                <strong style={{ color: '#8b5cf6', fontSize: '0.85rem' }}>Next Best Action:</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{client.nextBestAction}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
