import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import FileWarning from "lucide-react/dist/esm/icons/file-warning";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Search from "lucide-react/dist/esm/icons/search";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Activity from "lucide-react/dist/esm/icons/activity";
import Bot from "lucide-react/dist/esm/icons/bot";
import Clock from "lucide-react/dist/esm/icons/clock";
import BellRing from "lucide-react/dist/esm/icons/bell-ring";
import FileSignature from "lucide-react/dist/esm/icons/file-signature";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Download from "lucide-react/dist/esm/icons/download";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React, { useState } from 'react';

export default function RegulatoryTrackerView({ products = [] }) {
  // Generate mock compliance data if products list is empty or lacks compliance fields
  const mockProducts = products.length > 0 ? products : [
    { id: 1, name: 'BPC-157 5mg', supplier: 'BioPeptide Labs', registration: 'Active', coa: 'Valid', gmp: 'Missing', stability: 'Valid', permit: 'Active', risk: 'Amber' },
    { id: 2, name: 'TB-500 10mg', supplier: 'Advanced Syntho', registration: 'Pending', coa: 'Valid', gmp: 'Valid', stability: 'Expired', permit: 'Active', risk: 'Amber' },
    { id: 3, name: 'CJC-1295 2mg', supplier: 'EuroPeptides', registration: 'Active', coa: 'Valid', gmp: 'Valid', stability: 'Valid', permit: 'Active', risk: 'Green' },
    { id: 4, name: 'Ipamorelin 5mg', supplier: 'BioPeptide Labs', registration: 'Expired', coa: 'Missing', gmp: 'Valid', stability: 'Valid', permit: 'Expired', risk: 'Red' },
    { id: 5, name: 'Semaglutide 5mg', supplier: 'Alpha Sciences', registration: 'Active', coa: 'Valid', gmp: 'Valid', stability: 'Valid', permit: 'Active', risk: 'Green' },
  ];

  const metrics = {
    registered: mockProducts.filter(p => p.registration === 'Active').length,
    pending: mockProducts.filter(p => p.registration === 'Pending').length,
    missingCOA: mockProducts.filter(p => p.coa === 'Missing').length,
    missingGMP: mockProducts.filter(p => p.gmp === 'Missing').length,
    missingStability: mockProducts.filter(p => p.stability === 'Missing' || p.stability === 'Expired').length,
    score: 82,
  };

  const [aiQuery, setAiQuery] = useState('');

  const renderRiskBadge = (risk) => {
    switch(risk) {
      case 'Green': return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}><CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Low Risk</span>;
      case 'Amber': return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}><AlertTriangle size={12} style={{ marginRight: '4px' }} /> Med Risk</span>;
      case 'Red': return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, backgroundColor: '#ffe4e6', color: '#9f1239', border: '1px solid #fecdd3' }}><XCircle size={12} style={{ marginRight: '4px' }} /> High Risk</span>;
      default: return null;
    }
  };

  const renderStatusIcon = (status) => {
    if (status === 'Valid' || status === 'Active') return <CheckCircle2 size={16} color="#10b981" style={{ margin: '0 auto' }} />;
    if (status === 'Missing') return <XCircle size={16} color="#f43f5e" style={{ margin: '0 auto' }} />;
    if (status === 'Pending') return <Clock size={16} color="#f59e0b" style={{ margin: '0 auto' }} />;
    if (status === 'Expired') return <AlertTriangle size={16} color="#f43f5e" style={{ margin: '0 auto' }} />;
    return <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{status}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ShieldCheck size={28} color="#4f46e5" />
            Regulatory & Compliance
          </h2>
          <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Monitor product registrations, certifications, and compliance risks.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #e5e7eb', backgroundColor: '#fff', padding: '8px 16px', color: '#374151', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <Download size={16} style={{ marginRight: '8px' }} />
            Export Audit Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Compliance Score', value: `${metrics.score}%`, icon: Activity, color: '#4f46e5', bg: '#e0e7ff', trend: '+2%' },
          { label: 'Registered', value: metrics.registered, icon: ShieldCheck, color: '#059669', bg: '#d1fae5' },
          { label: 'Pending Reg.', value: metrics.pending, icon: Clock, color: '#d97706', bg: '#fef3c7' },
          { label: 'Missing COA', value: metrics.missingCOA, icon: FileWarning, color: '#e11d48', bg: '#ffe4e6' },
          { label: 'Missing GMP', value: metrics.missingGMP, icon: AlertTriangle, color: '#e11d48', bg: '#ffe4e6' },
          { label: 'Stability Issues', value: metrics.missingStability, icon: TrendingUp, color: '#d97706', bg: '#fef3c7' },
        ].map((metric, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px', opacity: 0.1, color: metric.color }}>
              <metric.icon size={48} style={{ marginTop: '-16px', marginRight: '-16px' }} />
            </div>
            <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '8px', backgroundColor: metric.bg, color: metric.color, marginBottom: '12px' }}>
              <metric.icon size={20} />
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', margin: 0 }}>{metric.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{metric.value}</h3>
              {metric.trend && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>{metric.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Main Content Area */}
        <div style={{ gridColumn: 'span 2 / span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI Compliance Assistant */}
          <div style={{ background: 'linear-gradient(to right, #312e81, #0f172a)', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#fff', border: '1px solid #3730a3', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
              <div style={{ flexShrink: 0, backgroundColor: 'rgba(99, 102, 241, 0.2)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Bot size={32} color="#a5b4fc" />
              </div>
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff', margin: 0 }}>Atlas Compliance Assistant</h3>
                  <p style={{ color: '#c7d2fe', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Ask me about regulatory statuses, missing documents, or risk profiles.</p>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    <Search size={16} color="#a5b4fc" />
                  </div>
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g., 'Show products missing COA' or 'Which products are at high risk?'"
                    style={{ display: 'block', width: '100%', padding: '10px 12px 10px 36px', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#e0e7ff', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                  <button onClick={() => setAiQuery('Show products missing COA')} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#c7d2fe', cursor: 'pointer' }}>Missing COAs</button>
                  <button onClick={() => setAiQuery('Show suppliers with missing GMP')} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#c7d2fe', cursor: 'pointer' }}>GMP Issues</button>
                  <button onClick={() => setAiQuery('Which products are at regulatory risk?')} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#c7d2fe', cursor: 'pointer' }}>High Risk</button>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Table/Cards */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', backgroundColor: '#f9fafb' }}>
              <h3 style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FileSignature size={20} color="#6b7280" />
                Product Compliance Matrix
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                  <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input type="text" placeholder="Search matrix..." style={{ padding: '8px 16px 8px 36px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', width: '100%', outline: 'none' }} />
                </div>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Product / Supplier</th>
                    <th style={{ padding: '12px 12px', fontWeight: 500, textAlign: 'center' }}>Registration</th>
                    <th style={{ padding: '12px 12px', fontWeight: 500, textAlign: 'center' }}>COA</th>
                    <th style={{ padding: '12px 12px', fontWeight: 500, textAlign: 'center' }}>GMP</th>
                    <th style={{ padding: '12px 12px', fontWeight: 500, textAlign: 'center' }}>Stability</th>
                    <th style={{ padding: '12px 12px', fontWeight: 500, textAlign: 'center' }}>Import Permit</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{product.supplier}</div>
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'center' }}>{renderStatusIcon(product.registration)}</td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'center' }}>{renderStatusIcon(product.coa)}</td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'center' }}>{renderStatusIcon(product.gmp)}</td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'center' }}>{renderStatusIcon(product.stability)}</td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap', textAlign: 'center' }}>{renderStatusIcon(product.permit)}</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>{renderRiskBadge(product.risk)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', textAlign: 'center' }}>
              <button style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: 500, display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                View full matrix <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Regulatory Alerts */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <BellRing size={20} color="#f43f5e" />
                Action Required
              </h3>
              <span style={{ backgroundColor: '#ffe4e6', color: '#be123c', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>3</span>
            </div>
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ backgroundColor: '#ffe4e6', padding: '6px', borderRadius: '6px', marginTop: '2px' }}><Clock size={16} color="#e11d48" /></div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0 }}>Registration expiring soon</h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0 0' }}><span style={{ fontWeight: 600 }}>Ipamorelin 5mg</span> expires in 12 days.</p>
                  <button style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 500, marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Renew Now</button>
                </div>
              </div>
              <div style={{ padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ backgroundColor: '#fef3c7', padding: '6px', borderRadius: '6px', marginTop: '2px' }}><FileWarning size={16} color="#d97706" /></div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0 }}>Missing GMP Certificate</h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0 0' }}><span style={{ fontWeight: 600 }}>BioPeptide Labs</span> is missing current GMP.</p>
                  <button style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 500, marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Request Document</button>
                </div>
              </div>
              <div style={{ padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ backgroundColor: '#ffe4e6', padding: '6px', borderRadius: '6px', marginTop: '2px' }}><AlertCircle size={16} color="#e11d48" /></div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', margin: 0 }}>Missing COA (Batch #492)</h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0 0' }}><span style={{ fontWeight: 600 }}>TB-500 10mg</span> shipment arrived without COA.</p>
                  <button style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 500, marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Resolve Issue</button>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Calendar */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Calendar size={20} color="#6366f1" />
                Compliance Calendar
              </h3>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #fbbf24' }}>
                <div style={{ position: 'absolute', left: '-6px', top: '6px', width: '10px', height: '10px', backgroundColor: '#fff', border: '2px solid #fbbf24', borderRadius: '50%' }}></div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: '2px' }}>Next Week • Jun 18</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>EuroPeptides GMP Renewal</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Supplier facility certification renewal</div>
              </div>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #fb7185' }}>
                <div style={{ position: 'absolute', left: '-6px', top: '6px', width: '10px', height: '10px', backgroundColor: '#fff', border: '2px solid #fb7185', borderRadius: '50%' }}></div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: '2px' }}>In 2 Weeks • Jun 25</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>Ipamorelin Registration Expiry</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Requires updated stability data submission</div>
              </div>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #d1d5db' }}>
                <div style={{ position: 'absolute', left: '-6px', top: '6px', width: '10px', height: '10px', backgroundColor: '#fff', border: '2px solid #d1d5db', borderRadius: '50%' }}></div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, marginBottom: '2px' }}>Next Month • Jul 12</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>Q3 Internal Audit</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Quarterly compliance document review</div>
              </div>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', textAlign: 'center' }}>
              <button style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: 500, display: 'inline-flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                Open full calendar <Calendar size={16} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}