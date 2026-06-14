import React, { useState } from 'react';
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Package from "lucide-react/dist/esm/icons/package";
import Snowflake from "lucide-react/dist/esm/icons/snowflake";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import History from "lucide-react/dist/esm/icons/history";
import Plus from "lucide-react/dist/esm/icons/plus";
import Save from "lucide-react/dist/esm/icons/save";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

const STAGES = ['Draft', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Converted'];
function getStageIndex(status) { return STAGES.indexOf(status) > -1 ? STAGES.indexOf(status) : 0; }

export default function QuotationWorkspace({ quote }) {
  const [items, setItems] = useState(quote.items || []);
  const currentStageIdx = getStageIndex(quote.status);

  const subTotal = items.reduce((acc, item) => acc + (parseFloat(item.rate || 0) * parseInt(item.quantity || 0)), 0);
  const cogs = items.reduce((acc, item) => acc + ((parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0)), 0);
  const margin = subTotal > 0 ? subTotal - cogs : 0;
  const marginPercent = subTotal > 0 ? (margin / subTotal) * 100 : 0;

  const handleItemChange = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { name: '', quantity: 1, rate: 0, unitCost: 0, unit: 'vial' }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: '#f8fafc' }}>
      
      {/* 1. COMPACT HEADER */}
      <div style={{ padding: '1rem 1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quotation</div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{quote.documentNumber || quote.id.slice(0, 8)}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>CUSTOMER</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{quote.customerName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>STATUS</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: quote.status === 'Accepted' ? '#059669' : '#d97706' }}>{quote.status || 'Draft'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>VALID UNTIL</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>{quote.validUntil?.toDate ? quote.validUntil.toDate().toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>AMOUNT / MARGIN</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{fmtCurrency(subTotal)}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: marginPercent >= 20 ? '#059669' : '#dc2626' }}>{marginPercent.toFixed(1)}%</span>
            </div>
          </div>
          <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 2. PRODUCT GRID (Primary Content) */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Lines</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, boxShadow: '0 1px 0 #e2e8f0' }}>
                <tr style={{ color: '#64748b' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontWeight: 600 }}>Item Description</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 600 }}>Specs</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, width: '100px' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, width: '120px' }}>Rate (EUR)</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1.5rem', fontWeight: 600, width: '120px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const itemTotal = item.quantity * item.rate;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem 1.5rem' }}>
                        <input 
                          value={item.name || item.itemName} 
                          onChange={(e) => handleItemChange(i, 'name', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', border: '1px solid transparent', borderRadius: '4px', fontWeight: 600, color: '#0f172a', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#cbd5e1'}
                          onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                          <span title="Cold Chain Required" style={{ color: '#3b82f6', background: '#eff6ff', padding: '0.2rem', borderRadius: '4px' }}><Snowflake size={14} /></span>
                        </div>
                      </td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', border: '1px solid transparent', borderRadius: '4px', textAlign: 'right', color: '#475569', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#cbd5e1'}
                          onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <input 
                          type="number" 
                          value={item.rate} 
                          onChange={(e) => handleItemChange(i, 'rate', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', border: '1px solid transparent', borderRadius: '4px', textAlign: 'right', color: '#475569', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#cbd5e1'}
                          onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                      </td>
                      <td style={{ padding: '0.5rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {fmtCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button onClick={addRow} style={{ padding: '0.4rem 0.75rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={14} /> Add Row
            </button>
          </div>
        </div>

        {/* 3. FINANCIAL SUMMARY & CUSTOMER INFO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Financial Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}>
                <span>Subtotal</span><span>{fmtCurrency(subTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}>
                <span>Est. COGS</span><span>{fmtCurrency(cogs)}</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                <span>Gross Margin</span>
                <span style={{ color: marginPercent >= 20 ? '#059669' : '#dc2626' }}>
                  {fmtCurrency(margin)} ({marginPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer Details</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{quote.customerName}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>Primary Contact: {quote.contactName || 'N/A'}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>Account ID: {quote.customerId || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PIPELINE */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sales Pipeline</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', height: '2px', background: '#e2e8f0', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '12px', left: '12px', width: `calc(${(currentStageIdx / (STAGES.length - 1)) * 100}% - 24px)`, height: '2px', background: '#2563eb', zIndex: 0, transition: 'width 0.5s' }} />

            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, width: '60px' }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    background: isCompleted ? '#2563eb' : '#fff', 
                    border: isCompleted ? '2px solid #2563eb' : '2px solid #cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 4px #dbeafe' : 'none'
                  }}>
                    {isCompleted && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isCurrent ? '#0f172a' : '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
                    {stage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

