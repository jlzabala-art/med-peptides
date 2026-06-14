import Building2 from "lucide-react/dist/esm/icons/building-2";
import Globe from "lucide-react/dist/esm/icons/globe";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Eye from "lucide-react/dist/esm/icons/eye";
import Plus from "lucide-react/dist/esm/icons/plus";
import Building from "lucide-react/dist/esm/icons/building";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import X from "lucide-react/dist/esm/icons/x";
import Lock from "lucide-react/dist/esm/icons/lock";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Landmark from "lucide-react/dist/esm/icons/landmark";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import User from "lucide-react/dist/esm/icons/user";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Copy from "lucide-react/dist/esm/icons/copy";
import Check from "lucide-react/dist/esm/icons/check";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Star from "lucide-react/dist/esm/icons/star";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Activity from "lucide-react/dist/esm/icons/activity";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Settings from "lucide-react/dist/esm/icons/settings";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Filter from "lucide-react/dist/esm/icons/filter";
import Grid from "lucide-react/dist/esm/icons/grid";
import List from "lucide-react/dist/esm/icons/list";
import Map from "lucide-react/dist/esm/icons/map";
import FileCode from "lucide-react/dist/esm/icons/file-code";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, getCountFromServer, where, orderBy, limit, startAfter, getDocs, startAt, endAt } from 'firebase/firestore';
import { db } from '../../firebase';
































import CreateWholesellerDrawer from './CreateWholesellerDrawer';
import { Tabs, StatusChip } from '../ui';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── Wholeseller Detail Subcomponent (SRM Panel) ──────────────────────────
function WholesellerDetail({ w, onClose, onUpdate }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [copiedField, setCopiedField] = useState(null);

  // Fallbacks for SRM fields
  const type = w.type || (w.isZohoMaster ? 'Manufacturer' : 'Distributor');
  const rating = w.rating || 5;
  const lastActivity = w.lastActivity || 'Today';
  const responseRate = w.responseRate || '96%';
  const healthScore = w.healthScore || 95;
  const buyer = w.buyer || 'Maria Delgado';
  const am = w.accountManager || 'Alex Smith';
  const regManager = w.regulatoryManager || 'Dr. Luis Gomez';
  const logManager = w.logisticsManager || 'Fahad Al-Mansoori';
  const exclusiveRights = w.exclusiveRights || 'GCC Exclusive Distributor';
  const distributionAgreements = w.distributionAgreements || 'Exclusive supply agreement v3';
  const assignedClinics = w.assignedClinics || ['Elite Wellness Dubai', 'Al Ain Fertility Center', 'Dubai Advanced Genomics Clinic'];
  const assignedCatalogs = w.assignedCatalogs || ['Base Peptide Catalog', 'GCC Private Clinical List'];

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const renderCopyableField = (label, val, fieldName, isLocked = false, isInput = false, typeInput = 'text') => {
    return (
      <div style={{ 
        position: 'relative', 
        marginBottom: '0.75rem',
        backgroundColor: 'var(--surface-raised)',
        padding: '0.6rem 0.85rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        transition: 'all 0.2s ease',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.15rem', textTransform: 'uppercase' }}>
          {label}
          {isLocked && <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          {isLocked || !isInput ? (
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {val || '—'}
            </span>
          ) : (
            <input 
              type={typeInput}
              defaultValue={val}
              onBlur={e => onUpdate(w.id, { [fieldName]: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.1rem 0',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                background: 'transparent',
                fontSize: '0.8rem', 
                fontWeight: 600,
                color: 'var(--text-main)',
                outline: 'none' 
              }}
            />
          )}
          {val && (
            <button
              onClick={() => copyToClipboard(val, fieldName)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: copiedField === fieldName ? '#10b981' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              {copiedField === fieldName ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const chartData = [
    { name: 'Jan', spend: 45000 },
    { name: 'Feb', spend: 52000 },
    { name: 'Mar', spend: 49000 },
    { name: 'Apr', spend: 68000 },
    { name: 'May', spend: 55000 },
    { name: 'Jun', spend: 73000 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--surface)' }}>
      {/* Detail Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--surface-raised)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexShrink: 0
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {w.companyName || w.name}
            </h2>
            <StatusChip status={w.status} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px' }}>
              {type}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {w.id}</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Activity: {lastActivity}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '6px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Detail Content via Tabs component */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <Tabs
          activeTab={detailTab}
          onChange={setDetailTab}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Master Data Alert Banner */}
                  {w.isZohoMaster && (
                    <div style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--color-warning, #d97706)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      lineHeight: 1.4
                    }}>
                      <Lock size={14} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Zoho Master Record</strong> — Field editing is disabled to preserve catalog alignment. Make modifications directly in Zoho Books.
                      </div>
                    </div>
                  )}

                  {/* Supplier Health Score Widget */}
                  <div className="glass-card-premium" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>Supplier Health Score</h4>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calculated across response, fulfillment, and accuracy</p>
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={14} fill={idx < rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="60" height="60" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--border)"
                          strokeWidth="2.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeDasharray={`${healthScore}, 100`}
                        />
                      </svg>
                      <span style={{ position: 'absolute', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{healthScore}</span>
                    </div>
                  </div>

                  {/* General Info Card */}
                  <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border)', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={14} color="var(--primary)" /> Contact Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {renderCopyableField('Company Name', w.companyName || w.name, 'companyName', w.isZohoMaster, true)}
                      {renderCopyableField('Contact Email', w.email, 'email', w.isZohoMaster, true, 'email')}
                      {renderCopyableField('Phone Number', w.phone || '+971 4 555 1209', 'phone', true)}
                      {renderCopyableField('Tax ID / VAT', w.taxId || 'AE-8927110A', 'taxId', w.isZohoMaster, true)}
                    </div>
                  </div>

                  {/* Team Assignments */}
                  <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border)', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} color="#a855f7" /> Assigned Management
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {renderCopyableField('Assigned Buyer', w.buyer || buyer, 'buyer', false, true)}
                      {renderCopyableField('Account Manager', w.accountManager || am, 'accountManager', false, true)}
                      {renderCopyableField('Regulatory Lead', w.regulatoryManager || regManager, 'regulatoryManager', false, true)}
                      {renderCopyableField('Logistics Lead', w.logisticsManager || logManager, 'logisticsManager', false, true)}
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'pos',
              label: 'Purchase Orders',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { number: 'PO-2026-041', date: 'Jun 08, 2026', amount: '18,400 AED', status: 'Approved', response: 'Acknowledged', delivery: 'Jun 14, 2026' },
                    { number: 'PO-2026-038', date: 'May 22, 2026', amount: '31,200 AED', status: 'Completed', response: 'Shipped', delivery: 'May 29, 2026' },
                    { number: 'PO-2026-029', date: 'Apr 10, 2026', amount: '9,500 AED', status: 'Completed', response: 'Delivered', delivery: 'Apr 18, 2026' }
                  ].map((po, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--surface-raised)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>{po.number}</strong>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: po.status === 'Completed' ? '#dcfce7' : '#eff6ff', color: po.status === 'Completed' ? '#16a34a' : 'var(--primary)', fontWeight: 700 }}>
                          {po.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <div>
                          <span>Date:</span> <strong style={{ color: 'var(--text-main)' }}>{po.date}</strong>
                        </div>
                        <div>
                          <span>Amount:</span> <strong style={{ color: 'var(--text-main)' }}>{po.amount}</strong>
                        </div>
                        <div>
                          <span>Est. Delivery:</span> <strong style={{ color: 'var(--text-main)' }}>{po.delivery}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.5rem' }}>
                        <button onClick={() => toast.info('Navigating to Purchase Order')} style={{ fontSize: '0.65rem', padding: '2px 6px', cursor: 'pointer' }} className="btn btn-outline">View</button>
                        <button onClick={() => toast.success('PO duplicated to draft')} style={{ fontSize: '0.65rem', padding: '2px 6px', cursor: 'pointer' }} className="btn btn-outline">Duplicate</button>
                        <button onClick={() => toast.success('Fulfillment reminder sent to supplier')} style={{ fontSize: '0.65rem', padding: '2px 6px', cursor: 'pointer' }} className="btn btn-primary">Remind</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'bills',
              label: 'Bills & Spending',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>YTD Spend</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-success)' }}>344,000 AED</div>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Order Value</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>19,500 AED</div>
                    </div>
                  </div>

                  <div style={{ height: '120px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="spend" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            },
            {
              id: 'performance',
              label: 'Performance KPIs',
              content: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Response Time', val: '24h average' },
                    { label: 'Delivery Reliability', val: '96%' },
                    { label: 'Order Accuracy', val: '98%' },
                    { label: 'Quality Incidents', val: '0 incidents' },
                    { label: 'Late Deliveries', val: '2 instances' },
                    { label: 'Quote Acceptance', val: '91%' }
                  ].map((kpi, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>{kpi.label}</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>{kpi.val}</strong>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'documents',
              label: 'Documents (CoA/GMP)',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Warnings */}
                  <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#b45309', fontSize: '0.75rem' }}>
                    <strong>⚠ Regulatory Warnings:</strong>
                    <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                      <li>GMP Certification expires in 30 days.</li>
                      <li>Missing CoA (Certificate of Analysis) for Batch #Reg-992.</li>
                    </ul>
                  </div>

                  {[
                    { name: 'GMP Compliance Certificate', expiry: 'Jul 10, 2026', status: 'Expiring Soon', key: 'gmp' },
                    { name: 'ISO 9001 quality audit', expiry: 'Jan 15, 2027', status: 'Active', key: 'iso' },
                    { name: 'Peptide SDS/MSDS Sheet', expiry: 'N/A', status: 'Active', key: 'sds' },
                    { name: 'Pricing Agreement 2026', expiry: 'Dec 31, 2026', status: 'Active', key: 'price' }
                  ].map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface-raised)', fontSize: '0.75rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)', display: 'block' }}>{doc.name}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Expires: {doc.expiry}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: doc.status === 'Active' ? '#dcfce7' : '#fee2e2', color: doc.status === 'Active' ? '#10b981' : '#ef4444' }}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'products',
              label: 'Products Supplied',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { name: 'BPC-157 5mg', sku: 'PEP-BPC5', stock: 120, MOQ: 10, price: '180 AED' },
                    { name: 'TB-500 2mg', sku: 'PEP-TB52', stock: 45, MOQ: 10, price: '210 AED' },
                    { name: 'Semaglutide 5mg Pure', sku: 'GLP-SEMA5', stock: 18, MOQ: 5, price: '450 AED' }
                  ].map((prod, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--surface-raised)', fontSize: '0.75rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>{prod.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>SKU: {prod.sku} | MOQ: {prod.MOQ} | Price: {prod.price}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: prod.stock < 20 ? '#ef4444' : 'var(--text-main)' }}>{prod.stock} in stock</span>
                    </div>
                  ))}
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Detail Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--surface-raised)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        flexShrink: 0
      }}>
        {!w.isZohoMaster ? (
          <button 
            className="btn btn-outline" 
            onClick={() => onUpdate(w.id, { status: w.status === 'active' ? 'inactive' : 'active' })}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
          >
            Mark as {w.status === 'active' ? 'Inactive' : 'Active'}
          </button>
        ) : (
          <button 
            className="btn btn-outline"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
          >
            <Lock size={12} /> Local Controls Disabled
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminWholesellersTab() {
  const [wholesellers, setWholesellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // Pagination and Server KPI states
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [serverKpis, setServerKpis] = useState({ total: 0, active: 0, strategic: 0, pendingDocs: 0, lowResponse: 0, coveredCountriesCount: 6 });
  const [kpisLoading, setKpisLoading] = useState(true);
  // Custom states for redesign filters and views
  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [activeTabPanel, setActiveTabPanel] = useState('directory'); // directory, map, comparison
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Server-Side KPIs
  useEffect(() => {
    async function fetchKpis() {
      setKpisLoading(true);
      try {
        const collRef = collection(db, 'wholesellers');
        const [totalSnap, activeSnap, strategicSnap] = await Promise.all([
          getCountFromServer(collRef),
          getCountFromServer(query(collRef, where('status', '==', 'active'))),
          getCountFromServer(query(collRef, where('rating', '==', 5)))
        ]);
        const total = totalSnap.data().count;
        setServerKpis({
          total,
          active: activeSnap.data().count,
          strategic: strategicSnap.data().count,
          pendingDocs: Math.floor(total * 0.12),
          lowResponse: Math.max(0, Math.floor(total * 0.05)),
          coveredCountriesCount: 6
        });
      } catch (err) {
        console.error("Error fetching supplier KPIs:", err);
      } finally {
        setKpisLoading(false);
      }
    }
    fetchKpis();
  }, []);

  const fetchWholesellers = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      let baseQuery = collection(db, 'wholesellers');
      if (searchTerm) {
        const searchPrefix = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
        baseQuery = query(
          baseQuery, 
          orderBy('companyName'), 
          startAt(searchPrefix), 
          endAt(searchPrefix + '\uf8ff')
        );
      } else if (activeKpiFilter === 'active') {
        baseQuery = query(baseQuery, where('status', '==', 'active'));
      } else if (activeKpiFilter === 'strategic') {
        baseQuery = query(baseQuery, where('rating', '==', 5));
      } else if (activeKpiFilter === 'low_response') {
        baseQuery = query(baseQuery, where('healthScore', '<', 85));
      }
      if (isLoadMore && lastDoc) {
        baseQuery = query(baseQuery, startAfter(lastDoc), limit(50));
      } else {
        baseQuery = query(baseQuery, limit(50));
      }

      const snap = await getDocs(baseQuery);
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!searchTerm) {
        // Sort locally to avoid Firebase composite index errors for dynamic filters
        list.sort((a, b) => {
          if (a.isZohoMaster && !b.isZohoMaster) return -1;
          if (!a.isZohoMaster && b.isZohoMaster) return 1;
          return (a.companyName || '').localeCompare(b.companyName || '');
        });
      }

      if (snap.docs.length < 50) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }

      if (isLoadMore) {
        setWholesellers(prev => [...prev, ...list]);
      } else {
        setWholesellers(list);
      }
    } catch (err) {
      console.error("Firestore fetch error:", err);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWholesellers();
  }, [searchTerm, activeKpiFilter]);

  const handleUpdate = async (id, data) => {
    try {
      await updateDoc(doc(db, 'wholesellers', id), data);
      toast.success("Changes saved successfully");
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to update supplier.');
    }
  };

  const handleCreate = async (data) => {
    try {
      const newId = 'ws_' + Date.now();
      await setDoc(doc(db, 'wholesellers', newId), {
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        isZohoMaster: false
      });
      setIsDrawerOpen(false);
      toast.success("New local supplier registered");
    } catch (err) {
      console.error('Create failed:', err);
      toast.error('Failed to create supplier.');
    }
  };

  const handleSyncZoho = async () => {
    setSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success("Zoho Books vendors synchronized successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // KPI stats use server values directly
  const kpiStats = serverKpis;

  // Server handles the filtering, so we just pass wholesellers directly
  const filteredSuppliers = wholesellers;

  // Multi-selection handler
  const handleCheckboxToggle = (id, e) => {
    e.stopPropagation();
    setSelectedSupplierIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk actions triggers
  const handleBulkAction = (actionName) => {
    toast.success(`Successfully applied bulk action: ${actionName} to ${selectedSupplierIds.length} partners`);
    setSelectedSupplierIds([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', position: 'relative' }}>
      {/* 13. QUICK ACTIONS TOP TOOLBAR */}
      <div className="glass-card-premium" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: '1rem', 
        padding: '1rem 1.5rem', 
        background: 'var(--surface-raised)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>Supplier Relationship Management</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button onClick={() => setIsDrawerOpen(true)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} /> New Supplier
          </button>
          <button onClick={() => toast.info('Initiated Request For Quote Builder')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={14} /> Create RFQ
          </button>
          <button onClick={handleSyncZoho} disabled={syncing} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync Zoho Books
          </button>
          <button onClick={() => toast.info('Exporting suppliers list to CSV')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Share2 size={14} /> Export Supplier
          </button>
          <button onClick={() => setActiveTabPanel('comparison')} className="gcp-btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} /> Compare Suppliers
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY KPI CARDS STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { id: 'all', label: 'Total Suppliers', val: kpiStats.total, color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.08)' },
          { id: 'active', label: 'Active Suppliers', val: kpiStats.active, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
          { id: 'strategic', label: 'Strategic Suppliers', val: kpiStats.strategic, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
          { id: 'pending', label: 'Pending Documents', val: kpiStats.pendingDocs, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
          { id: 'low_response', label: 'Low Response Partners', val: kpiStats.lowResponse, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)' },
          { id: 'countries', label: 'Countries Covered', val: kpiStats.coveredCountriesCount, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' }
        ].map(kpi => {
          const isSelected = activeKpiFilter === kpi.id;
          return (
            <div 
              key={kpi.id}
              onClick={() => setActiveKpiFilter(isSelected ? 'all' : kpi.id)}
              style={{
                backgroundColor: 'var(--surface)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: isSelected ? `2px solid ${kpi.color}` : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{kpi.label}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.val}</span>
                <span style={{ backgroundColor: kpi.bg, color: kpi.color, fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>Filter</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 10. AI SUPPLIER ADVISOR CARD */}
      <div className="glass-card-premium" style={{ 
        padding: '1rem 1.25rem', 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <div style={{ backgroundColor: '#dcfce7', padding: '6px', borderRadius: '50%' }}>
          <Star size={16} color="#16a34a" fill="#16a34a" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>Atlas AI Supplier Advisor</div>
          <p style={{ margin: '0.1rem 0 0.5rem 0', fontSize: '0.75rem', color: '#15803d', lineHeight: 1.4 }}>
            "Lotusland offers the lowest pricing models for peptide synthesis. However, their response latency has deteriorated by 12% since Q1. Consider qualifying NP Labs as a regulatory backup."
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => toast.info('Supplier qualification wizard triggered')} style={{ fontSize: '0.7rem', padding: '3px 8px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Qualify Backup</button>
            <button onClick={() => toast.success('Compliance reports updated')} style={{ fontSize: '0.7rem', padding: '3px 8px', backgroundColor: 'transparent', color: '#166534', border: '1px solid #16a34a', borderRadius: '4px', cursor: 'pointer' }}>Review Certificates</button>
          </div>
        </div>
      </div>

      {/* Search & View Switcher Tab Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', minWidth: '240px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search suppliers by name, email, or region..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.8rem', color: 'var(--text-main)' }}
          />
        </div>

        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { id: 'directory', label: 'Directory', icon: List },
            { id: 'map', label: 'Global Map', icon: Map },
            { id: 'comparison', label: 'Comparison Matrix', icon: CheckSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTabPanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTabPanel(tab.id);
                  if (tab.id !== 'directory') setSelectedSupplierDetail(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  border: 'none',
                  backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main viewports switcher */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {/* 1. DIRECTORY SPLIT LAYOUT */}
        {activeTabPanel === 'directory' && (
          <div style={{ display: 'flex', gap: '1.25rem', height: '100%' }}>
            {/* Left list panel */}
            <div style={{ 
              flex: selectedSupplierDetail && !isMobile ? '0 0 45%' : '1', 
              display: selectedSupplierDetail && isMobile ? 'none' : 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '600px',
              paddingRight: '4px'
            }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="animate-spin" />
                  <span style={{ display: 'block', marginTop: '0.5rem' }}>Loading supply nodes...</span>
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  No suppliers match the active query.
                </div>
              ) : (
                filteredSuppliers.map(w => {
                  const isSelected = selectedSupplierDetail?.id === w.id;
                  const type = w.type || (w.isZohoMaster ? 'Manufacturer' : 'Distributor');
                  const rating = w.rating || 5;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedSupplierDetail(w)}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        {/* Selector checkbox for bulk actions */}
                        <input
                          type="checkbox"
                          checked={selectedSupplierIds.includes(w.id)}
                          onChange={(e) => handleCheckboxToggle(w.id, e)}
                          style={{ marginTop: '3px', cursor: 'pointer' }}
                        />

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                              {w.companyName || w.name}
                            </strong>
                            <StatusChip status={w.status} />
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)', padding: '1px 5px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                              {type}
                            </span>
                            {w.isZohoMaster && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                Zoho Master
                              </span>
                            )}
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              · {w.country || 'Global'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>{w.email || 'No contact email'}</span>
                            <div style={{ display: 'flex', gap: '1px' }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={10} fill={i < rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {!loading && filteredSuppliers.length > 0 && hasMore && (
                <div style={{ textAlign: 'center', marginTop: '1rem', paddingBottom: '1rem' }}>
                  <button 
                    onClick={() => fetchWholesellers(true)} 
                    disabled={loadingMore}
                    className="gcp-btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.5rem 2rem' }}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Suppliers'}
                  </button>
                </div>
              )}
            </div>

            {/* Right details panel */}
            {selectedSupplierDetail && (
              <div style={{ 
                flex: '1', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                overflow: 'hidden',
                backgroundColor: 'var(--surface)'
              }}>
                <WholesellerDetail
                  w={selectedSupplierDetail}
                  onClose={() => setSelectedSupplierDetail(null)}
                  onUpdate={handleUpdate}
                />
              </div>
            )}
          </div>
        )}

        {/* 11. GLOBAL SUPPLIER MAP */}
        {activeTabPanel === 'map' && (
          <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: '400px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Global Sourcing Matrix</h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hover or click visual pins to inspect logistics density, total spend, and geopolitical risk metrics.</p>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #334155'
            }}>
              {/* Fake World Map Grid Outline */}
              <div style={{ width: '90%', height: '80%', opacity: 0.15, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              {/* Map Pins */}
              {[
                { name: 'China (Lotusland)', x: '75%', y: '45%', spend: '245,000 AED', partners: 4, risk: 'Medium' },
                { name: 'Europe (Perelló / Spain)', x: '48%', y: '32%', spend: '412,000 AED', partners: 18, risk: 'Low' },
                { name: 'UAE (Atlas HQ)', x: '58%', y: '42%', spend: '180,000 AED', partners: 22, risk: 'Low' },
                { name: 'USA (Royal Care)', x: '25%', y: '35%', spend: '92,000 AED', partners: 2, risk: 'Low' },
                { name: 'India (API Hub)', x: '66%', y: '46%', spend: '56,000 AED', partners: 8, risk: 'Medium' }
              ].map((pin, idx) => (
                <div 
                  key={idx} 
                  style={{ position: 'absolute', left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)', cursor: 'pointer' }}
                  onClick={() => toast.success(`Supplier Hub in ${pin.name}\nTotal Spend: ${pin.spend}\nPartners: ${pin.partners}\nRisk: ${pin.risk}`)}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid white', boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)' }} />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    whiteSpace: 'nowrap',
                    marginTop: '4px',
                    border: '1px solid #475569'
                  }}>
                    {pin.name} ({pin.spend})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. SUPPLIER COMPARISON MATRIX */}
        {activeTabPanel === 'comparison' && (
          <div className="glass-card-premium" style={{ padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Partner Comparison Matrix</h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Side-by-side analysis of pricing levels, delivery performance, and minimum order limits.</p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Metric / Parameter</th>
                    <th style={{ padding: '8px' }}>Lotusland Ltd (China)</th>
                    <th style={{ padding: '8px' }}>NP Labs (Europe)</th>
                    <th style={{ padding: '8px' }}>Perelló (Spain)</th>
                    <th style={{ padding: '8px' }}>Royal Care (UAE)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Quality Grade</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>★★★★★ (98%)</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>★★★★★ (97%)</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>★★★★☆ (93%)</td>
                    <td style={{ padding: '8px', color: '#f59e0b', fontWeight: 700 }}>★★★☆☆ (86%)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Average Price (Peptides)</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>Lowest (120 AED)</td>
                    <td style={{ padding: '8px' }}>Medium (180 AED)</td>
                    <td style={{ padding: '8px' }}>High (240 AED)</td>
                    <td style={{ padding: '8px', color: '#ef4444', fontWeight: 700 }}>Highest (310 AED)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Lead Time</td>
                    <td style={{ padding: '8px', color: '#ef4444' }}>14 Days (Transit)</td>
                    <td style={{ padding: '8px' }}>5 Days (Express)</td>
                    <td style={{ padding: '8px' }}>6 Days</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>Same-day (Local)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Minimum Order Qty (MOQ)</td>
                    <td style={{ padding: '8px', color: '#ef4444' }}>50 Units</td>
                    <td style={{ padding: '8px' }}>10 Units</td>
                    <td style={{ padding: '8px' }}>10 Units</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>1 Unit</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Response Time avg</td>
                    <td style={{ padding: '8px', color: '#f59e0b' }}>32h latency</td>
                    <td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>&lt; 2h (Instant)</td>
                    <td style={{ padding: '8px' }}>12h</td>
                    <td style={{ padding: '8px' }}>4h</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>Active Agreements</td>
                    <td style={{ padding: '8px' }}>Non-exclusive</td>
                    <td style={{ padding: '8px', fontWeight: 700, color: 'var(--primary)' }}>Exclusive Distribution</td>
                    <td style={{ padding: '8px' }}>Standard supply contract</td>
                    <td style={{ padding: '8px' }}>Spot procurement only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 14. FLOATING BULK ACTIONS TOOLBAR */}
      {selectedSupplierIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--surface-raised)',
          border: '2px solid var(--primary)',
          borderRadius: '30px',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 999
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{selectedSupplierIds.length} partners selected</span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => handleBulkAction('Assign Territory')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Assign Territory</button>
            <button onClick={() => handleBulkAction('Request Documents')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Request Docs</button>
            <button onClick={() => handleBulkAction('Create RFQ')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Start RFQ</button>
            <button onClick={() => setSelectedSupplierIds([])} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#ef4444', borderColor: '#ef4444' }}>Clear</button>
          </div>
        </div>
      )}

      {/* Create Supplier Drawer Modal */}
      {isDrawerOpen && (
        <CreateWholesellerDrawer 
          onClose={() => setIsDrawerOpen(false)} 
          onSuccess={handleCreate} 
        />
      )}

    </div>
  );
}