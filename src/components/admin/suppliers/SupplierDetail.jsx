import React, { useState } from 'react';
import { Lock, Check, Copy, X, Star, Building, User } from 'lucide-react';
import { Tabs, StatusChip } from '../../ui';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
            },
            ...(w.supplierVariants && w.supplierVariants.length > 1 ? [{
              id: 'variants',
              label: 'Currency Variants',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#1d4ed8', fontSize: '0.75rem' }}>
                    This supplier has multiple records for different currencies in Zoho. They have been unified here.
                  </div>
                  {w.supplierVariants.map((v, idx) => {
                    const match = (v.companyName || v.name || '').match(/(EUR|USD|AED|R\$)$/i);
                    const currency = match ? match[1].toUpperCase() : 'Default';
                    return (
                      <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{v.companyName || v.name}</strong>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                            {currency}
                          </span>
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ID: {v.id} | SKU: {v.sku || v.zohoVendorNumber_EUR || v.zohoVendorNumber_USD || ('SUP-' + v.id.slice(-6).toUpperCase())}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }] : [])
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

export default WholesellerDetail;
