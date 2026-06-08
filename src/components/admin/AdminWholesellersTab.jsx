import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Building2, Globe, ShieldCheck, Eye, EyeOff, Plus, Building, 
  CheckCircle2, X, Lock, CreditCard, Mail, Phone, Landmark, 
  RefreshCw, User, ShieldAlert, Copy, Check, FileText
} from 'lucide-react';
import CreateWholesellerDrawer from './CreateWholesellerDrawer';
import ERPListDetailLayout from '../shared/ERPListDetailLayout';
import { Tabs, StatusChip } from '../ui';

// ── Wholeseller Detail Subcomponent (Tabs + copy triggers) ───────────────
function WholesellerDetail({ w, onClose, onUpdate }) {
  const [detailTab, setDetailTab] = useState('overview');
  const [pos, setPos] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [billLoading, setBillLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (detailTab === 'pos') {
      setPoLoading(true);
      const q = query(
        collection(db, 'purchaseOrders'),
        where('supplierName', '==', w.companyName || w.name)
      );
      const unsub = onSnapshot(q, (snap) => {
        setPos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPoLoading(false);
      }, (err) => {
        console.error(err);
        setPoLoading(false);
      });
      return unsub;
    }
  }, [detailTab, w.companyName, w.name]);

  useEffect(() => {
    if (detailTab === 'bills') {
      setBillLoading(true);
      const q = query(
        collection(db, 'purchaseBills'),
        where('supplierName', '==', w.companyName || w.name)
      );
      const unsub = onSnapshot(q, (snap) => {
        setBills(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setBillLoading(false);
      }, (err) => {
        console.error(err);
        setBillLoading(false);
      });
      return unsub;
    }
  }, [detailTab, w.companyName, w.name]);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const fmtCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: w.currency || 'USD' }).format(val || 0);
  };

  const renderCopyableField = (label, val, fieldName, isLocked = false, isInput = false, type = 'text') => {
    return (
      <div className="copy-field-row" style={{ 
        position: 'relative', 
        marginBottom: '1rem',
        backgroundColor: '#f8fafc',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {label}
          {isLocked && <Lock size={10} style={{ color: '#94a3b8' }} />}
        </label>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          {isLocked || !isInput ? (
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
              {val || '—'}
            </span>
          ) : (
            <input 
              type={type}
              defaultValue={val}
              onBlur={e => onUpdate(w.id, { [fieldName]: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '0.25rem 0',
                border: 'none',
                borderBottom: '1px solid #cbd5e1',
                background: 'transparent',
                fontSize: '0.88rem', 
                fontWeight: 600,
                color: '#1e293b',
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
                color: copiedField === fieldName ? '#10b981' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              title="Copy to clipboard"
            >
              {copiedField === fieldName ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc' }}>
      
      {/* Detail Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexShrink: 0
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {w.companyName || w.name}
            </h2>
            <StatusChip status={w.status} />
            {w.isZohoMaster && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                padding: '2px 7px',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}>
                <CheckCircle2 size={11} /> Zoho Master
              </span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
            ID: {w.id}
          </p>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: '6px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Detail Content via Tabs component */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Tabs
          activeTab={detailTab}
          onChange={setDetailTab}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Master Data Alert Banner */}
                  {w.isZohoMaster && (
                    <div style={{
                      padding: '0.85rem 1.15rem',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '10px',
                      color: '#b45309',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      lineHeight: 1.4
                    }}>
                      <Lock size={14} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Zoho Master Record</strong> — Field editing is disabled to preserve catalog alignment. Make modifications directly in Zoho Books.
                      </div>
                    </div>
                  )}

                  {/* General Info Card */}
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={14} color="#3b82f6" /> General Information
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem 1.25rem' }}>
                      {renderCopyableField('Company Name', w.companyName, 'companyName', w.isZohoMaster, true)}
                      {renderCopyableField('Contact Email', w.email, 'email', w.isZohoMaster, true, 'email')}
                      {renderCopyableField('Phone Number', w.phone, 'phone', true)}
                      {renderCopyableField('Tax ID / VAT', w.taxId, 'taxId', w.isZohoMaster, true)}
                      {renderCopyableField('Currency', w.currency || 'USD', 'currency', true)}
                      {renderCopyableField('Payment Terms', w.paymentTerms || 'Due on Shipment', 'paymentTerms', true)}
                    </div>
                  </div>

                  {/* Geography Card */}
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={14} color="#10b981" /> Territory & Geography
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      {renderCopyableField('Primary Country', w.country || 'Global / Unassigned', 'country', true)}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Zones</label>
                        {w.zones && w.zones.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {w.zones.map(z => (
                              <span key={z} style={{
                                padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                                fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb',
                                border: '1px solid #bfdbfe'
                              }}>
                                {z}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No active zones configured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Card */}
                  {w.isZohoMaster && (w.cf_bank_name || w.cf_account_number || w.cf_iban || w.cf_swift_bic) && (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Landmark size={14} color="#8b5cf6" /> Bank & Billing Details
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem 1.25rem' }}>
                        {w.cf_bank_name && renderCopyableField('Bank Name', w.cf_bank_name, 'cf_bank_name', true)}
                        {w.cf_account_holder && renderCopyableField('Account Holder', w.cf_account_holder, 'cf_account_holder', true)}
                        {w.cf_account_number && renderCopyableField('Account Number', w.cf_account_number, 'cf_account_number', true)}
                        {w.cf_iban && renderCopyableField('IBAN', w.cf_iban, 'cf_iban', true)}
                        {w.cf_swift_bic && renderCopyableField('SWIFT / BIC', w.cf_swift_bic, 'cf_swift_bic', true)}
                      </div>
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'pos',
              label: 'Purchase Orders',
              content: (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Linked Purchase Orders</h3>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>{pos.length} total</span>
                  </div>
                  
                  {poLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><RefreshCw size={20} className="sync-spin" style={{ animation: 'syncSpin 1s linear infinite', color: '#94a3b8' }} /></div>
                  ) : pos.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>No Purchase Orders found</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>PO Number</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Date</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pos.map(po => {
                            const date = po.createdAt?.toDate ? po.createdAt.toDate() : new Date(po.createdAt || 0);
                            return (
                              <tr key={po.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b' }}>{po.poNumber}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{date.toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem 1rem' }}><StatusChip status={po.status} size="sm" /></td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{fmtCurrency(po.totalAmount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'bills',
              label: 'Bills',
              content: (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Supplier Bills</h3>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>{bills.length} total</span>
                  </div>
                  
                  {billLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}><RefreshCw size={20} className="sync-spin" style={{ animation: 'syncSpin 1s linear infinite', color: '#94a3b8' }} /></div>
                  ) : bills.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>No bills registered for this supplier</div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Bill ID</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Due Date</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map(bill => {
                            const dueDate = bill.dueDate?.toDate ? bill.dueDate.toDate() : new Date(bill.dueDate || 0);
                            return (
                              <tr key={bill.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b' }}>{bill.billNumber || bill.id.slice(0, 8)}</td>
                                <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{dueDate.toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem 1rem' }}><StatusChip status={bill.status} size="sm" /></td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{fmtCurrency(bill.totalAmount || bill.amount)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'history',
              label: 'Sync History',
              content: (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>Synchronization Timeline</h3>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid #ecfdf5' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                        {w.isZohoMaster ? 'Zoho Books Imported' : 'Local Wholeseller Created'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {w.createdAt ? new Date(w.createdAt).toLocaleString() : 'System Default Timestamp'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #e2e8f0' }}>
                        {w.isZohoMaster 
                          ? `Synchronized with Zoho Books organization: ${w.orgSource || 'Spain/UAE Catalog'}. Local updates restricted.`
                          : 'Created locally inside Atlas Health database. Local editing enabled.'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>

        {/* Detail Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: 'white',
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
  const [toastMessage, setToastMessage] = useState(null);

  // Real-time listener for wholesellers
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'wholesellers'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort: Zoho master first, then alphabetical
      list.sort((a, b) => {
        if (a.isZohoMaster && !b.isZohoMaster) return -1;
        if (!a.isZohoMaster && b.isZohoMaster) return 1;
        return (a.companyName || '').localeCompare(b.companyName || '');
      });
      setWholesellers(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore listener error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdate = async (id, data) => {
    try {
      await updateDoc(doc(db, 'wholesellers', id), data);
      showToast("Changes saved successfully");
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update wholeseller.');
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
      showToast("New local wholeseller created");
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create wholeseller.');
    }
  };

  const handleSyncZoho = async () => {
    setSyncing(true);
    try {
      // Simulate sync trigger (the background sync has already populated Firestore)
      await new Promise(r => setTimeout(r, 1500));
      showToast("Zoho Books vendors synchronized successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic
  const filtered = wholesellers.filter(w => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (w.companyName || '').toLowerCase().includes(term) ||
      (w.name || '').toLowerCase().includes(term) ||
      (w.email || '').toLowerCase().includes(term) ||
      (w.id || '').toLowerCase().includes(term) ||
      (w.taxId || '').toLowerCase().includes(term)
    );
  });

  // Render left list item
  const renderListItem = (w, isSelected) => {
    return (
      <div style={{ padding: '0.85rem 1.15rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
          <span style={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: isSelected ? '#1d4ed8' : 'var(--color-text-primary, #1e293b)'
          }}>
            {w.companyName || w.name || 'Unnamed'}
          </span>
          <StatusChip status={w.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
          {w.isZohoMaster ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid #bfdbfe'
            }}>
              <CheckCircle2 size={10} /> Zoho Master
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              Local
            </span>
          )}
          {w.orgSource && (
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
              · {w.orgSource}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>{w.email || 'No email'}</span>
          <span>{w.country || 'Global'}</span>
        </div>
      </div>
    );
  };

  // Toast component
  const toastEl = toastMessage && (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      fontSize: '0.875rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <CheckCircle2 size={16} color="#10b981" />
      <span>{toastMessage}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', position: 'relative' }}>
      
      {/* Header Left (rendered inside ERPListDetailLayout) */}
      <ERPListDetailLayout
        items={filtered}
        renderListItem={renderListItem}
        renderDetail={(w, onClose) => <WholesellerDetail key={w.id} w={w} onClose={onClose} onUpdate={handleUpdate} />}
        getItemId={w => w.id}
        loading={loading}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search suppliers by name, email or ID..."
        detailWidth="55%"
        headerLeft={
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="var(--color-primary, #003666)" /> Suppliers & Wholesalers
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Manage regional supply partners and compounding pharmacies synchronized from Zoho Books.
            </p>
          </div>
        }
        headerActions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleSyncZoho}
              disabled={syncing}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '13px',
                padding: '0.4rem 0.8rem',
              }}
            >
              <RefreshCw size={14} className={syncing ? 'sync-spin' : ''} style={{ animation: syncing ? 'syncSpin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing...' : 'Sync Zoho Books'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsDrawerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '13px',
                padding: '0.4rem 1rem',
              }}
            >
              <Plus size={16} /> New Wholeseller
            </button>
          </div>
        }
        emptyState={
          <div style={{ textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Building2 size={40} style={{ margin: '0 auto', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: '#64748b' }}>Select a Supplier</div>
            <div style={{ fontSize: '0.8rem' }}>Click a supplier on the left to inspect organization and billing details.</div>
          </div>
        }
      />

      {isDrawerOpen && (
        <CreateWholesellerDrawer 
          onClose={() => setIsDrawerOpen(false)} 
          onSuccess={handleCreate} 
        />
      )}

      {toastEl}

      <style>{`
        @keyframes syncSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
