import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Search from "lucide-react/dist/esm/icons/search";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import RefreshCcw from "lucide-react/dist/esm/icons/refresh-ccw";
import Layers from "lucide-react/dist/esm/icons/layers";
import Package from "lucide-react/dist/esm/icons/package";
import Database from "lucide-react/dist/esm/icons/database";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React, { useState } from 'react';















import { Tabs } from '../../ui';

export default function ImportAnalysisPanel({ 
  analysisResults, 
  onApproveAll, 
  isAnalyzing 
}) {
  const [activeTab, setActiveTab] = useState('preview');

  if (isAnalyzing) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', width: 64, height: 64, marginBottom: '1.5rem' }}>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid #f1f5f9', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--primary)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="var(--primary)" />
          </div>
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Atlas AI is analyzing catalog...</h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Comparing prices, projecting margins, and evaluating suppliers.</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!analysisResults) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed var(--border)' }}>
        <Sparkles size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Awaiting Catalog Upload</h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '300px', textAlign: 'center', fontSize: '0.85rem' }}>
          Upload a file on the left to begin AI analysis. The system will automatically detect pricing, compare suppliers, and project margin impacts.
        </p>
      </div>
    );
  }

  const { 
    summary, 
    matchedProducts, 
    newProducts, 
    priceChanges 
  } = analysisResults;

  // Mock data for Supplier Comparison
  const supplierComparisons = [
    { product: 'Tirzepatide 10mg', currSupplier: 'Lotusland', newPrice: 132, altSupplier1: 'SinoPeptides', altPrice1: 140, altSupplier2: 'Apex Labs', altPrice2: 145, best: 'Lotusland', savings: '5.7%' },
    { product: 'BPC-157 5mg', currSupplier: 'Lotusland', newPrice: 39, altSupplier1: 'SinoPeptides', altPrice1: 34, altSupplier2: 'GenBio', altPrice2: 36, best: 'SinoPeptides', savings: '-12.8%' }
  ];

  // Mock data for Protocol Impact
  const protocolImpacts = [
    { protocol: 'Weight Loss Protocol (Tier 1)', affectedProducts: ['Retatrutide 5mg'], currMargin: '51%', newMargin: '46%', monthlyImpact: '-$4,200', risk: 'High' },
    { protocol: 'Recovery Stack (Basic)', affectedProducts: ['BPC-157', 'TB-500'], currMargin: '45%', newMargin: '48%', monthlyImpact: '+$1,100', risk: 'Low' }
  ];

  const tabs = [
    {
      id: 'preview',
      label: 'AI Summary',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
          {/* Top KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Total Rows', val: summary.totalRows, color: '#3b82f6' },
              { label: 'Matched', val: summary.matched, color: '#10b981' },
              { label: 'Price Increases', val: priceChanges.filter(p => p.newPrice > p.oldPrice).length, color: '#ef4444' },
              { label: 'Price Drops', val: priceChanges.filter(p => p.newPrice < p.oldPrice).length, color: '#10b981' },
              { label: 'Potential Savings', val: '$18,450', color: '#10b981' }
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color, marginBottom: '0.25rem' }}>{k.val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Supplier Detection */}
          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} /> Smart Supplier Detection
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              <div><div style={{ fontSize: '0.7rem', color: '#0284c7', textTransform: 'uppercase' }}>Detected Supplier</div><div style={{ fontWeight: 600, color: '#0c4a6e' }}>{summary.detectedSupplier || 'Unknown'}</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#0284c7', textTransform: 'uppercase' }}>Currency</div><div style={{ fontWeight: 600, color: '#0c4a6e' }}>USD</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#0284c7', textTransform: 'uppercase' }}>Country</div><div style={{ fontWeight: 600, color: '#0c4a6e' }}>China</div></div>
              <div><div style={{ fontSize: '0.7rem', color: '#0284c7', textTransform: 'uppercase' }}>Confidence</div><div style={{ fontWeight: 600, color: '#0c4a6e' }}>{summary.confidence}%</div></div>
            </div>
          </div>

          {/* AI Quick Recommendations */}
          <div>
             <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Procurement Recommendations</h4>
             <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
               <AlertTriangle size={16} color="#d97706" style={{ marginTop: '2px' }} />
               <div>
                 <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.85rem' }}>Margin Risk Detected</div>
                 <div style={{ fontSize: '0.8rem', color: '#b45309' }}>Retatrutide costs increased by 14%. Consider switching to SinoPeptides to save $12,400 annually.</div>
               </div>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', gap: '0.5rem' }}>
            <button className="gcp-btn-secondary">Export Audit</button>
            <button className="gcp-btn-primary" onClick={onApproveAll}>
              Approve All & Sync
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'pricing',
      label: 'Price Change Center',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {priceChanges.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pricing changes detected in this upload.</div>
          ) : (
            priceChanges.map((pc, idx) => {
              const isDrop = pc.newPrice < pc.oldPrice;
              const diffPercent = (((pc.newPrice - pc.oldPrice) / pc.oldPrice) * 100).toFixed(1);
              return (
                <div key={idx} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{pc.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Cost: ${pc.oldPrice} → New Cost: ${pc.newPrice}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: isDrop ? '#ecfdf5' : '#fef2f2', color: isDrop ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                      {isDrop ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                      {isDrop ? '' : '+'}{diffPercent}%
                    </div>
                    {isDrop ? (
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, width: '120px', textAlign: 'right' }}>Margin Improvement</div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, width: '120px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                        <ShieldAlert size={12} /> Margin Risk
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )
    },
    {
      id: 'comparison',
      label: 'Supplier Comparison',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {supplierComparisons.map((sc, idx) => (
            <div key={idx} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>{sc.product}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: sc.best === sc.currSupplier ? '#f0fdf4' : 'white' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>This Upload ({sc.currSupplier})</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${sc.newPrice}</div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: sc.best === sc.altSupplier1 ? '#f0fdf4' : 'white' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sc.altSupplier1}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${sc.altPrice1}</div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: sc.best === sc.altSupplier2 ? '#f0fdf4' : 'white' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{sc.altSupplier2}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>${sc.altPrice2}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Best Supplier: <strong>{sc.best}</strong></span>
                <span>Potential Savings vs Upload: <strong style={{ color: sc.savings.includes('-') ? '#10b981' : '#64748b' }}>{sc.savings}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'impact',
      label: 'Protocol Margin Impact',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {protocolImpacts.map((pi, idx) => (
            <div key={idx} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{pi.protocol}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Affected Products: {pi.affectedProducts.join(', ')}</div>
                </div>
                <div style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: pi.risk === 'High' ? '#fef2f2' : '#f0fdf4', color: pi.risk === 'High' ? '#ef4444' : '#10b981' }}>
                  {pi.risk} Risk
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Margin</div>
                  <div style={{ fontWeight: 700 }}>{pi.currMargin}</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projected Margin</div>
                  <div style={{ fontWeight: 700, color: pi.risk === 'High' ? '#ef4444' : '#10b981' }}>{pi.newMargin}</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Monthly Impact</div>
                  <div style={{ fontWeight: 800, color: pi.monthlyImpact.includes('-') ? '#ef4444' : '#10b981' }}>{pi.monthlyImpact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'zoho',
      label: 'Zoho Sync',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
             <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Database size={16} /> Zoho Books Sync Impact
             </h4>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{summary.matched}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purchase Rates to Update</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>3</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Conflicts</div>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>Ready</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sync Status</div>
                </div>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="gcp-btn-secondary">Review Conflicts</button>
            <button className="gcp-btn-primary" onClick={onApproveAll}>Sync to Zoho Now</button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <RefreshCcw size={18} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Procurement Intelligence Center</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
      </div>
    </div>
  );
}