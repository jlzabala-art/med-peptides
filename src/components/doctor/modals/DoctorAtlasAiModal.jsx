"use client";

import React, { useState } from 'react';
import { Bot, X, ShieldCheck, Loader2, MessageCircle, Send } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorAtlasAiModal({
  isOpen,
  onClose,
  doctor,
  prescriptions = [],
  tasks = [],
  aiUsesRemaining = 5,
  onDecrementUses,
  onContactWhatsApp
}) {
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);

  if (!isOpen) return null;

  const handleSendQuery = (queryText) => {
    const text = (queryText || aiInput).trim();
    if (!text) return;
    if (aiUsesRemaining <= 0) {
      if (onContactWhatsApp) onContactWhatsApp('Atlas AI Quota Extended Consultation');
      return;
    }

    triggerHaptic('light');
    if (onDecrementUses) onDecrementUses();

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    setTimeout(() => {
      let response = '';
      const lower = text.toLowerCase();
      const patientCount = doctor?.patients?.length || new Set(prescriptions.map(p => p.patientName || p.patientId)).size;
      const rxCount = prescriptions.length;
      const pendingCount = tasks.length;

      if (lower.includes('patient') || lower.includes('paciente') || lower.includes('summarize') || lower.includes('resumen')) {
        const topPatients = prescriptions.slice(0, 5).map(p => `• **${p.patientName || 'Patient'}** (${p.id}): ${p.treatmentTitle || 'Compounded Treatment'} — Status: *${p.status || 'Active'}*`).join('\n');
        response = `**Clinical Summary for ${doctor?.name || 'Physician'}:**\n\nYou currently have **${patientCount} registered patients** and **${rxCount} active prescription records** in your dispensary view.\n\n**Recent Patient Regimens:**\n${topPatients}\n\n*All formulas are compounded in accordance with EU GMP standards.*`;
      } else if (lower.includes('dose') || lower.includes('dosis') || lower.includes('api') || lower.includes('active') || lower.includes('formula') || lower.includes('part') || lower.includes('ingrediente')) {
        const apiMap = new Map();
        prescriptions.forEach(p => {
          (p.items || []).forEach(it => {
            const n = it.name || it.drugName || it.activeIngredient;
            if (n && !apiMap.has(n)) apiMap.set(n, it.dose || it.concentration || 'Compounded Standard');
          });
        });
        const apiList = Array.from(apiMap.entries()).slice(0, 6).map(([name, dose]) => `• **${name}**: ${dose}`).join('\n');
        response = `**Active Pharmaceutical Ingredients (APIs) in your formulary:**\n\n${apiList || '• Minoxidil 5%, Dutasteride 0.1%, Melatonin 0.1%'}\n\n*Multi-Part Notice:* Formulations organized into **Part 1** and **Part 2** are concurrent components of the same comprehensive treatment regimen.`;
      } else if (lower.includes('sign') || lower.includes('pend') || lower.includes('task') || lower.includes('tarea') || lower.includes('revis')) {
        response = `**Physician Task Status:**\n\nYou have **${pendingCount} pending task(s)** requiring physician sign-off or clinical verification.\n\nOnce reviewed, prescriptions transition to *Active / Dispensary Processing*. You can approve them directly from the table or inspection drawer.`;
      } else {
        response = `**Clinical Analysis for ${doctor?.name || 'Physician'}:**\n\nBased on your **${rxCount} prescriptions** and patient registry, your active regimens focus on targeted trichology and regenerative formulations (e.g., dual-part liposomal solutions with TrichoSol™/TrichoOil™ vehicles).\n\nIf you require custom active ingredient titration, vehicle stabilization certificates, or batch logistics, you can also request dedicated liaison support with **Atlas Clinical Support on WhatsApp**.`;
      }

      const assistantMsg = {
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, assistantMsg]);
      setAiLoading(false);
    }, 550);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 70,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '640px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  Atlas AI — Clinical Copilot
                </h3>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: aiUsesRemaining > 2 ? '#10b981' : aiUsesRemaining > 0 ? '#f59e0b' : '#ef4444',
                  color: '#ffffff'
                }}>
                  {aiUsesRemaining}/5 uses left
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '2px' }}>
                Personalized for {doctor?.name || 'Physician'} · {prescriptions.length} Prescriptions Indexed
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Privacy Guarantee Banner */}
        <div style={{
          padding: '8px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.72rem',
          color: '#475569'
        }}>
          <ShieldCheck size={14} color="#6366f1" />
          <span>
            <strong>Isolated Session:</strong> Reads only your active patients & compounding formulas. No queries or history are retained or shared across users.
          </span>
        </div>

        {/* Message Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#fdfdfe',
          maxHeight: '360px'
        }}>
          {/* Welcome Assistant Message */}
          <div style={{
            alignSelf: 'flex-start',
            maxWidth: '88%',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '0.70rem', color: '#6366f1', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bot size={12} /> Atlas Clinical Intelligence
            </div>
            <div style={{ fontSize: '0.80rem', color: '#1e293b', lineHeight: 1.5 }}>
              Hello {doctor?.name || 'Doctor'}. I am initialized with your current clinical context: <strong>{doctor?.patients?.length || prescriptions.length} patients</strong> and <strong>{prescriptions.length} compounded prescriptions</strong>.
              <br /><br />
              You have <strong>{aiUsesRemaining} query credits</strong> in this session. Ask me to summarize patient regimens, verify API concentrations, or check multi-part compounding protocols.
            </div>
          </div>

          {/* Chat Thread */}
          {aiMessages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: msg.role === 'user' ? '#4f46e5' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{
                fontSize: '0.68rem',
                color: msg.role === 'user' ? '#e0e7ff' : '#6366f1',
                fontWeight: 700,
                marginBottom: '4px'
              }}>
                {msg.role === 'user' ? 'You' : 'Atlas Assistant'} · {msg.time}
              </div>
              <div style={{
                fontSize: '0.80rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-line'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {aiLoading && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '10px 14px',
              background: '#f1f5f9',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#475569'
            }}>
              <Loader2 size={14} className="animate-spin" />
              <span>Synthesizing patient & API formulation data...</span>
            </div>
          )}

          {aiUsesRemaining === 0 && (
            <div style={{
              padding: '12px 14px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: '#92400e',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div>
                <strong>Session Quota Reached (5/5):</strong> You have utilized all 5 free clinical intelligence queries allocated to this browser session.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onContactWhatsApp) onContactWhatsApp('Atlas AI Quota Extended Consultation');
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={13} />
                  <span>Contact Atlas on WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {aiUsesRemaining > 0 && (
          <div style={{
            padding: '10px 16px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto'
          }}>
            {[
              'Summarize active patients',
              'Verify dosages & APIs',
              'Pending sign-off tasks',
              'Multi-part formulations'
            ].map((chip, cIdx) => (
              <button
                key={cIdx}
                type="button"
                onClick={() => handleSendQuery(chip)}
                disabled={aiLoading}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '5px 10px',
                  borderRadius: '9999px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder={aiUsesRemaining > 0 ? "Ask Atlas AI about your patients, APIs, or formulas..." : "Session limit reached. Contact Atlas Support on WhatsApp."}
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendQuery();
              }
            }}
            disabled={aiLoading || aiUsesRemaining <= 0}
            style={{
              flex: 1,
              height: '40px',
              padding: '0 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: aiUsesRemaining <= 0 ? '#f8fafc' : '#ffffff'
            }}
          />
          <button
            type="button"
            onClick={() => handleSendQuery()}
            disabled={!aiInput.trim() || aiLoading || aiUsesRemaining <= 0}
            style={{
              height: '40px',
              padding: '0 18px',
              borderRadius: '8px',
              border: 'none',
              background: !aiInput.trim() || aiLoading || aiUsesRemaining <= 0 ? '#cbd5e1' : '#4f46e5',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 600,
              cursor: !aiInput.trim() || aiLoading || aiUsesRemaining <= 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
}
