'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  DollarSign,
  Building2,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import DoctorAiMessageRenderer from '@/components/doctor/DoctorAiMessageRenderer';
import { getLotuslandProcurementReport } from '@/services/lotuslandProcurementService';

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
  const reportData = useMemo(() => getLotuslandProcurementReport(), []);
  const { summary, apis, invoices } = reportData;

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `### Lotusland Limited Procurement Ledger

Hello, I am **Atlas AI Procurement Intelligence**. I have real-time audit access to the entire **Lotusland Limited** sourcing repository:

• **Reconciled Commercial Releases:** **${invoices.length} Signed Invoices** (**$${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD** total capital)
• **Active Principle Portfolio:** **${summary.uniqueApisCount} APIs** (${summary.totalGramsProcured.toLocaleString('en-US')} g pure lyophilized bulk mass)
• **Magenta Transfer Corridor:** **+6.00% Max Cap** over net audited acquisition cost
• **US Client Spot Allocation (Nov 2026):** **-37.1%** reduction incorporated into net unit prices

How can I assist your sourcing, price trajectory audit, or margin reconciliation today?`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const buildApiTrajectoryResponse = (apiRecord) => {
    const chronological = [...(apiRecord.receipts || [])].sort((a, b) => a.date.localeCompare(b.date));
    const firstUnit = chronological[0]?.unitCostUSD || apiRecord.weightedAvgCost;
    const latestUnit = chronological[chronological.length - 1]?.unitCostUSD || apiRecord.latestCost;
    const deltaPct = firstUnit > 0 ? (((latestUnit - firstUnit) / firstUnit) * 100).toFixed(1) : '0.0';

    const tableRows = chronological.map((r) => {
      const origNote = r.originalCurrency === 'EUR' ? ` *(€${r.originalUnitCost.toFixed(2)}/g)*` : '';
      return `| \`${r.invoiceNumber}\` | ${r.date} | ${r.quantityGrams.toLocaleString('en-US')} g | **$${r.unitCostUSD.toFixed(2)}/g**${origNote} | $${r.lineTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} |`;
    });

    return `### ${apiRecord.name} — Price & Procurement Trajectory

**${apiRecord.name}** (CAS: \`${apiRecord.casNumber || 'N/A'}\` · ${apiRecord.grade}) has been procured across **${apiRecord.invoiceCount} commercial ${apiRecord.invoiceCount === 1 ? 'release' : 'purchase orders'} (${apiRecord.totalGrams.toLocaleString('en-US')} g total)**:

| Release Invoice # | Release Date | Volume | Net Cost / g | Line Total (USD) |
|---|---|---|---|---|
${tableRows.join('\n')}

**Executive Valuation & Corridor Metrics:**
• **Total Lifetime Spend:** **$${apiRecord.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD** across ${apiRecord.totalGrams.toLocaleString('en-US')} g
• **Weighted Average Net Cost:** **$${apiRecord.weightedAvgCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} / g** (Lotusland Audited Cost)
• **Latest Procurement Cost:** **$${apiRecord.latestCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} / g** ${Number(deltaPct) < 0 ? `(**${deltaPct}%** vs. initial batch)` : '(Single release rate)'}
• **Magenta Transfer Price (+6% Cap):** **$${apiRecord.catalogPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} / g** (Avg) · **$${(apiRecord.latestCost * 1.06).toLocaleString('en-US', { minimumFractionDigits: 2 })} / g** (Latest)`;
  };

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

      if (q.includes('spot') || (q.includes('5-amino') && q.includes('prostamax'))) {
        reply = `### Official Spot Offer Analysis (Lotusland US Client Allocation)

Darlan Dallacosta confirmed a dedicated spot allocation from pre-assigned US client stock (` + '`OF-LOTUS-20261104-US`' + `) with **net unit prices already discounted**:

| Active Principle (API) | Volume | Lotusland Net / g | Magenta (+6%) / g | Magenta Line Total | Previous / g | Savings |
|---|---|---|---|---|---|---|
| **5-Amino-1MQ** | 50 g | **$15.00/g** | **$15.90/g** | $795.00 | $23.85/g | **-37.1%** |
| **Prostamax** | 10 g | **$1,625.00/g** | **$1,722.50/g** | $17,225.00 | $2,583.75/g | **-37.1%** |
| **Pinealon** | 10 g | **$1,537.50/g** | **$1,629.75/g** | $16,297.50 | $2,444.63/g | **-37.1%** |
| **IGF-1 LR3** | 0.2 g *(200 mg)* | **$13,500.00/g** | **$14,310.00/g** | $2,862.00 | $21,262.50/g | **-36.5%** |

**Key Commercial Takeaways:**
• **Net Purchase Cost (Lotusland):** **$35,075.00 USD**
• **Mediluxe Corridor Margin (+6.00%):** **+$2,104.50 USD**
• **Total Invoiced to Magenta:** **$37,179.50 USD**
• **Audit Traceability:** All prior invoices remain intact in the chronological ledger for full historical comparison.`;
      } else if (q.includes('tirzepatide') || q.includes('evolution') || q.includes('trajectory')) {
        const tirz = apis.find(a => a.name.toLowerCase().includes('tirzepatide'));
        if (tirz) {
          reply = buildApiTrajectoryResponse(tirz);
        }
      } else if (q.includes('margin') || q.includes('6%') || q.includes('cap') || q.includes('contractual')) {
        reply = `### Contractual +6.00% Transfer Cap Policy

The B2B sourcing corridor between **Lotusland Limited**, **Mediluxe Health Solutions FZE**, and **Magenta Pharma Medicine Trading LLC** operates under a strict institutional agreement:

• **Zero Retail Markup:** Bulk APIs are transferred to Magenta at **Net Audited Cost + 6.00%** contractual handling cap.
• **Dual Valuation Transparency:** In the main table you can toggle between **Net Audited Cost (Lotusland)** (e.g., **$242.62/g** weighted average for Tirzepatide) and **Magenta Transfer (+6% Cap)** (**$257.18/g**).
• **Analytical Verification:** Every release is accompanied by cGMP batch documentation and HPLC assay (**≥98.5% to ≥99.5%** purity).`;
      } else if (q.includes('hong kong') || q.includes('uae') || q.includes('entity') || q.includes('divided') || q.includes('settlement')) {
        reply = `### Settlement Split: Direct USD vs. Mediluxe EUR Corridor

Across the **${invoices.length} reconciled commercial releases ($${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)**:

| Settlement Corridor | Receiving Entity | Billing Currency | Invoices | Reconciled Capital (USD) |
|---|---|---|---|---|
| **Direct UAE Compounding** | Magenta Pharma Medicine Trading LLC | USD ($) | 8 Releases | $421,496.56 |
| **Mediluxe FZE Corridor** | Mediluxe Health Solutions FZE | EUR (€ → 1.08 FX) | 3 Releases | $278,453.40 |

• **Beneficiary Bank:** **Citibank N.A., Hong Kong Branch** (Account \`395710448\` · SWIFT \`CITIHKHX\`)
• **Audit Conversion Standard:** EUR commercial releases (\`MY20260309021Y\`, \`MY20260406021Y\`, \`MY20260414098Y\`) are normalized at the institutional audit rate of **1.08 USD/EUR**.`;
      } else {
        // Check if query matches any specific API in the 43 APIs list
        const matchedApi = apis.find(a => {
          const cleanName = a.name.toLowerCase().replace(/\s*bulk\s*api\s*/g, '').trim();
          return q.includes(cleanName) || (a.casNumber && q.includes(a.casNumber.toLowerCase()));
        });

        if (matchedApi) {
          reply = buildApiTrajectoryResponse(matchedApi);
        } else {
          reply = `### Sourcing Intelligence Synthesis

Regarding **"${query}"**:
The Atlas procurement repository contains complete line-item traceability for **${summary.uniqueApisCount} APIs** and **${invoices.length} reconciled releases** totaling **$${summary.totalSpendUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD**.

• **Top Procured APIs by Capital:** **Tirzepatide Bulk API** ($252,326.00), **Tesamorelin** ($52,852.50), **IGF-1 LR3** ($45,225.00), **5-Amino-1MQ** ($24,600.00), and **Retatrutide Bulk API** ($24,300.00).
• **Instant API Lookup:** Ask me about any specific compound (e.g., *"Show BPC-157 orders"*, *"IGF-1 LR3 history"*, *"Retatrutide cost"*) to view its full purchase order table and weighted average cost.`;
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 350);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '580px',
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
              maxWidth: m.sender === 'user' ? '88%' : '97%'
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
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <Bot size={15} />
              </div>
            )}
            <div style={{
              backgroundColor: m.sender === 'user' ? '#003666' : '#ffffff',
              color: m.sender === 'user' ? '#ffffff' : '#0f172a',
              border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              flex: 1,
              minWidth: 0
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

        {/* Suggested Inquiries */}
        {messages.length <= 2 && (
          <div style={{ marginTop: '0.25rem' }}>
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
            placeholder="Ask about any API (e.g. Tirzepatide, IGF-1 LR3), margins, or spot offers..."
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
              cursor: inputVal.trim() && !isTyping ? 'pointer' : 'not-allowed',
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
