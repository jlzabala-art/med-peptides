'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  FileText,
  DollarSign,
  Building2,
  TrendingDown,
  ShieldCheck,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import DoctorAiMessageRenderer from '@/components/doctor/DoctorAiMessageRenderer';

const LOTUSLAND_SUGGESTED_INQUIRIES = [
  {
    icon: TrendingDown,
    iconColor: '#16a34a',
    iconBg: '#f0fdf4',
    badge: 'Spot Savings',
    title: 'New US Allocation Spot Prices',
    subtitle: 'Analysis of the -37% cost reduction on 5-Amino, Prostamax, Pinealon & IGF-1',
    prompt: 'Analyze the new spot pricing offer from Lotusland (5-Amino-1MQ at $15/g, Prostamax at $1,625/g, Pinealon at $1,537.50/g, and IGF-1 LR3 at $13,500/g) compared to previous invoices and how the Mediluxe 6% margin is applied.'
  },
  {
    icon: DollarSign,
    iconColor: '#0284c7',
    iconBg: '#f0f9ff',
    badge: 'Price Trajectory',
    title: 'Tirzepatide Acquisition Evolution',
    subtitle: 'How Tirzepatide bulk cost evolved from $450/g down to $113.40/g',
    prompt: 'What has been the historical price evolution of Tirzepatide Bulk API across the reconciled Lotusland purchase orders, and what is the weighted average cost?'
  },
  {
    icon: ShieldCheck,
    iconColor: '#7c3aed',
    iconBg: '#faf5ff',
    badge: 'Corridor Rules',
    title: 'Contractual 6% Margin Cap',
    subtitle: 'How Mediluxe Health Solutions bills Magenta Pharma without retail markup',
    prompt: 'Explain the contractual wholesale corridor between Lotusland, Mediluxe Health Solutions FZE, and Magenta Pharma Medicine Trading LLC, and how the +6.00% transfer cap is calculated.'
  },
  {
    icon: Building2,
    iconColor: '#ea580c',
    iconBg: '#fff7ed',
    badge: 'Entity Split',
    title: 'Hong Kong vs UAE Settlement',
    subtitle: 'Reconciliation of direct Magenta invoices vs Mediluxe EUR corridor releases',
    prompt: 'How are commercial invoices divided between direct Magenta Pharma billing in USD and Mediluxe Health Solutions billing in EUR?'
  }
];

export default function AtlasAiLotuslandDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello, I am **Atlas AI Procurement Intelligence**. I have instant access to the entire **Lotusland Limited** sourcing ledger:

• **10 Commercial Releases Reconciled** ($664,874.96 USD total capital)
• **43 Active Principle Compounds (APIs)** in Pure Lyophilized Bulk Mass
• **Contractual Wholesale Transfer Cap (+6.00%)** for the Magenta corridor
• **New US Client Allocation Spot Offer (Nov 2026)** with ~37% discount incorporated

How can I assist your sourcing, audit, or margin reconciliation today?`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('spot') || q.includes('5-amino') || q.includes('prostamax') || q.includes('pinealon') || q.includes('igf')) {
        reply = `### Official Spot Offer Analysis (Lotusland US Client Allocation)

Darlan Dallacosta has confirmed a dedicated spot allocation leveraging pre-assigned US client stock with **zero additional invoice discount (incorporated into net unit prices)**:

| Active Principle (API) | Quantity | Lotusland Cost / g | Mediluxe (+6%) Invoiced / g | Subtotal Magenta | Previous Order / g | Savings Delta |
|---|---|---|---|---|---|---|
| **5-Amino-1MQ** | 50 g | **$15.00** | **$15.90** | $795.00 | $23.85 | **-37.1%** 🟢 |
| **Prostamax** | 10 g | **$1,625.00** | **$1,722.50** | $17,225.00 | $2,583.75 | **-37.1%** 🟢 |
| **Pinealon** | 10 g | **$1,537.50** | **$1,629.75** | $16,297.50 | $2,444.63 | **-37.1%** 🟢 |
| **IGF-1 LR3** | 0.2 g *(200 mg)* | **$13,500.00** | **$14,310.00** | $2,862.00 | $21,262.50 | **-36.5%** 🟢 |

**Key Commercial Takeaways:**
1. **Total Net Purchase Cost (Lotusland):** $35,075.00 USD.
2. **Mediluxe Gross Margin (+6.00%):** +$2,104.50 USD.
3. **Total Invoiced to Magenta:** **$37,179.50 USD**.
4. **Historical Price Protection:** In Atlas, previous purchase history remains untouched in the chronological ledger, allowing full price audit comparison.`;
      } else if (q.includes('tirzepatide') || q.includes('evolution') || q.includes('history')) {
        reply = `### Tirzepatide Bulk API Price Trajectory

Tirzepatide has been procured across **4 commercial purchase orders (1,040 g total)**:

1. **MY20251230039Y (Dec 30, 2025):** 140 g @ **$450.00/g** ($63,000.00)
2. **MY20260204022Y (Feb 04, 2026):** 250 g @ **$440.00/g** ($110,000.00)
3. **MY20260309021Y (Mar 09, 2026):** 400 g @ **€118.00/g** ($127.44/g USD) ($50,976.00)
4. **MY20260406021Y (Apr 06, 2026):** 250 g @ **€105.00/g** ($113.40/g USD) ($28,350.00)

• **Weighted Average Cost:** **$242.62 / g** across the entire 1,040 g volume.
• **Latest Procurement Cost:** **$113.40 / g** (a 74.8% cost decline from initial December 2025 batches).
• **Transfer Price to Magenta:** **$257.18 / g** (Cost + 6% max cap).`;
      } else if (q.includes('margin') || q.includes('6%') || q.includes('cap') || q.includes('contractual')) {
        reply = `### Contractual +6.00% Transfer Cap Policy

The B2B sourcing relationship between **Lotusland Limited**, **Mediluxe Health Solutions FZE**, and **Magenta Pharma Medicine Trading LLC** operates under an exclusive institutional compounding agreement:

• **Zero Retail Markups:** Peptides and APIs are transferred to Magenta at cost + an exact contractual service margin of **6.00%**.
• **Invoiced Cost Rule:** The public price list and official quotation display only the net invoiced unit price (e.g. $15.90/g for 5-Amino-1MQ) without exposing internal margin calculations on the client's commercial invoice.
• **Compliance Standard:** Every line item is verified with cGMP, HPLC analytical assay (≥98.5% to ≥99.5%), and cold-chain temperature verification.`;
      } else {
        reply = `### Sourcing Intelligence Synthesis

Regarding **"${query}"**:
The Atlas procurement repository contains complete traceability for **43 APIs** and **10 reconciled releases** totaling **$664,874.96 USD**. 

All orders are settled under strict bilateral agreements between Lotusland Limited (Hong Kong SAR) and UAE licensed entities (Magenta Pharma Medicine Trading LLC & Mediluxe Health Solutions FZE).

Would you like me to generate a breakdown of quantities, latest batch dates, or margin calculations for a specific compound?`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.18)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        backgroundColor: '#003666',
        color: '#ffffff',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #002244'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>
                Atlas AI Procurement Copilot
              </h3>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                backgroundColor: '#38bdf8',
                color: '#002244',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                PRO
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#cbd5e1' }}>
              Lotusland Limited Procurement & Invoice Intelligence
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '10px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%'
            }}
          >
            {m.sender === 'ai' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={15} />
              </div>
            )}
            <div style={{
              backgroundColor: m.sender === 'user' ? '#003666' : '#ffffff',
              color: m.sender === 'user' ? '#ffffff' : '#0f172a',
              border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              {m.sender === 'ai' ? (
                <DoctorAiMessageRenderer content={m.text} />
              ) : (
                m.text
              )}
            </div>
            {m.sender === 'user' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '0.78rem' }}>
            <Sparkles size={14} color="#0284c7" />
            <span>Analyzing procurement ledger & invoices...</span>
          </div>
        )}

        {/* Suggested Inquiries (Show when conversation is fresh) */}
        {messages.length <= 2 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Suggested Inquiries (1-Click Analysis)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {LOTUSLAND_SUGGESTED_INQUIRIES.map((inq, iIdx) => (
                <button
                  key={iIdx}
                  type="button"
                  onClick={() => handleSend(inq.prompt)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    backgroundColor: inq.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: inq.iconColor,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <inq.icon size={13} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 750, color: '#003666' }}>
                        {inq.title}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: inq.iconColor, background: inq.iconBg, padding: '1px 5px', borderRadius: '3px' }}>
                        {inq.badge}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                      {inq.subtitle}
                    </p>
                  </div>
                  <ArrowRight size={13} color="#94a3b8" style={{ flexShrink: 0, marginTop: '4px' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={{
        padding: '10px 14px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask anything about Lotusland invoices, margins, or spot offers..."
            style={{
              flex: 1,
              padding: '9px 12px',
              border: '1.5px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            style={{
              backgroundColor: '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0 14px',
              cursor: inputVal.trim() && !isTyping ? 'pointer' : 'default',
              opacity: inputVal.trim() && !isTyping ? 1 : 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

