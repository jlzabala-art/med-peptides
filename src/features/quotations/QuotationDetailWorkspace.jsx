import X from "lucide-react/dist/esm/icons/x";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Send from "lucide-react/dist/esm/icons/send";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import User from "lucide-react/dist/esm/icons/user";
import Activity from "lucide-react/dist/esm/icons/activity";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Download from "lucide-react/dist/esm/icons/download";
import Copy from "lucide-react/dist/esm/icons/copy";
import Paperclip from "lucide-react/dist/esm/icons/paperclip";
import React, { useState } from 'react';
















export default function QuotationDetailWorkspace({ quote, onClose }) {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, documents, comments

  if (!quote) return null;

  const amount = Number(quote.totalAmount) || Number(quote.grandTotal) || 0;
  // Atlas AI logic
  const marginPercent = quote.margin || 35; 
  const isGoodMargin = marginPercent >= 30;

  return (
    <div style={{ 
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'var(--bg-main, #f8fafc)', zIndex: 100, display: 'flex', flexDirection: 'column' 
    }}>
      {/* Workspace Header */}
      <div style={{ padding: '1rem 1.5rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ background: 'var(--bg-subtle)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='var(--border)'} onMouseOut={e => e.currentTarget.style.background='var(--bg-subtle)'}>
            <X size={18} color="var(--color-text-secondary)" />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{quote.documentNumber || quote.id.slice(0,8)}</h2>
              <span style={{ background: quote.status === 'Accepted' ? '#dcfce7' : '#fef3c7', color: quote.status === 'Accepted' ? '#166534' : '#854d0e', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {quote.status || 'Draft'}
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Created {quote.createdAt ? new Date(quote.createdAt?.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Copy size={16}/> Duplicate</button>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16}/> PDF</button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Send size={16}/> Send Quote</button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#059669', borderColor: '#059669' }}><ShoppingCart size={16}/> Convert to Order</button>
        </div>
      </div>

      {/* Workspace Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Quote Builder / Document View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '3rem' }}>
            {/* Visual representation of the actual PDF/Quote */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>PROPOSAL</h1>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-secondary)' }}>{quote.documentNumber || quote.id.slice(0,8)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0 }}>{quote.customerName || 'Unknown Customer'}</h3>
                <p style={{ margin: '0.25rem 0', color: 'var(--color-text-secondary)' }}>{quote.customerEmail || 'No email provided'}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-text-secondary)' }}>Product</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Qty</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-secondary)' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-secondary)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(quote.lineItems || []).length > 0 ? quote.lineItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{item.name || item.productId || 'Unknown Item'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity || 1}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>${Number(item.price || 0).toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>${((item.quantity || 1) * (item.price || 0)).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No items found in this quote.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                  <span>${(amount * 0.9).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Tax</span>
                  <span>${(amount * 0.1).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '2px solid var(--border)', marginTop: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
                  <span>Total</span>
                  <span>${amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Intelligence & Context Panels */}
        <div style={{ width: '400px', borderLeft: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Customer Panel */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} /> Customer 360
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{quote.customerName || 'Unknown Customer'}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Wellness Clinic</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Lifetime Value</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>$45,200</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Open Quotes</p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>2</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Risk Score</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>Low Risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Sales Assistant */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} /> Atlas AI Assistant
            </h3>
            <div style={{ background: 'linear-gradient(to right, #1e293b, #0f172a)', borderRadius: '12px', padding: '1.25rem', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Margin Analysis</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isGoodMargin ? <TrendingUp size={18} color="#34d399" /> : <AlertTriangle size={18} color="#fbbf24" />}
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: isGoodMargin ? '#34d399' : '#fbbf24' }}>{marginPercent}%</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {isGoodMargin 
                  ? "Pricing looks healthy. Atlas recommends suggesting the 'Longevity Bundle' for a 15% upsell chance."
                  : "Warning: Margins are below the 30% territory threshold. Consider removing discounts."}
              </p>
            </div>
          </div>

          {/* Tabs: Timeline / Documents / Comments */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setActiveTab('timeline')} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'timeline' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'timeline' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}><Activity size={16} style={{ marginBottom: '-3px', marginRight: '4px' }}/> Timeline</button>
            <button onClick={() => setActiveTab('documents')} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'documents' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'documents' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}><Paperclip size={16} style={{ marginBottom: '-3px', marginRight: '4px' }}/> Docs</button>
            <button onClick={() => setActiveTab('comments')} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'comments' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'comments' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 600, cursor: 'pointer' }}><MessageSquare size={16} style={{ marginBottom: '-3px', marginRight: '4px' }}/> Notes</button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '1.5rem', flex: 1 }}>
            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={16} /></div>
                    <div style={{ width: 2, height: 30, background: '#dcfce7', marginTop: 4 }}></div>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Draft Created</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>By {quote.salesPerson || 'System'} • {quote.createdAt ? new Date(quote.createdAt?.seconds * 1000).toLocaleDateString() : 'Today'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: quote.status === 'Sent' || quote.status === 'Accepted' ? '#dcfce7' : '#f1f5f9', color: quote.status === 'Sent' || quote.status === 'Accepted' ? '#166534' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={14} /></div>
                    <div style={{ width: 2, height: 30, background: quote.status === 'Accepted' ? '#dcfce7' : '#f1f5f9', marginTop: 4 }}></div>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: quote.status === 'Sent' || quote.status === 'Accepted' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>Proposal Sent</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: quote.status === 'Accepted' ? '#dcfce7' : '#f1f5f9', color: quote.status === 'Accepted' ? '#166534' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={16} /></div>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: quote.status === 'Accepted' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>Converted to Zoho Books</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'documents' && (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Attached Documents</p>
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '8px' }}><FileText size={24} /></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Proposal_{quote.documentNumber || quote.id.slice(0,8)}.pdf</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Generated automatically</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'comments' && (
              <div>
                <textarea placeholder="Add an internal note..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}></textarea>
                <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Save Note</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}