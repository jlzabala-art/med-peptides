 
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { COUNTRIES } from '../data/countries';
import { 
  ShieldCheck, User, Building2, Mail, Save, ArrowLeft, 
  CheckCircle2, AlertCircle, ChevronDown, Search,
  Truck, Landmark, Package, Loader2, X
} from 'lucide-react';

// ─── Searchable Country Picker ────────────────────────────────────────────────
// ... rest of CountryPicker ...

function CountryPicker({ name, value, onChange, placeholder = 'Search country…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Derive display label from current value
  const selected = useMemo(() => COUNTRIES.find(c => c.name === value), [value]);

  // Filter countries by search query
  const filtered = useMemo(() => {
    if (!query) return COUNTRIES;
    const q = query.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (country) => {
    onChange({ target: { name, value: country.name } });
    setQuery('');
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    setQuery('');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setTimeout(() => ref.current?.querySelector('input')?.focus(), 50); }}
        className="premium-input"
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer',
          textAlign: 'left', padding: '0.875rem 1rem',
          background: 'white'
        }}
      >
        <span style={{ color: selected ? 'var(--text-main)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {selected ? <>{selected.flag} {selected.name}</> : placeholder}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {selected && (
            <span onClick={clear} style={{ padding: '2px', borderRadius: '4px', display: 'flex', color: 'var(--text-muted)', lineHeight: 1 }}>
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} strokeWidth={1.2} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'white', borderRadius: '14px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          zIndex: 999, overflow: 'hidden'
        }}>
          {/* Search input */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={15} strokeWidth={1.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              style={{
                border: 'none', outline: 'none', width: '100%',
                fontSize: '0.95rem', color: 'var(--text-main)',
                background: 'transparent', fontFamily: 'inherit'
              }}
            />
          </div>
          {/* Options list */}
          <ul style={{ maxHeight: '220px', overflowY: 'auto', margin: 0, padding: '0.4rem 0', listStyle: 'none' }}>
            {filtered.length === 0 ? (
              <li style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No countries found</li>
            ) : filtered.map(c => (
              <li
                key={c.code}
                onClick={() => pick(c)}
                style={{
                  padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: value === c.name ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: value === c.name ? 700 : 400,
                  background: value === c.name ? 'rgba(0,54,102,0.05)' : 'transparent',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => { if (value !== c.name) e.currentTarget.style.background = 'var(--background)'; }}
                onMouseLeave={e => { if (value !== c.name) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{c.flag}</span> {c.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Order status helpers ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed:    { color: 'var(--success)', label: 'Completed' },
  delivered:    { color: 'var(--success)', label: 'Delivered' },
  shipped:      { color: 'var(--primary)', label: 'Shipped' },
  'in transit': { color: 'var(--primary)', label: 'In Transit' },
  pending:      { color: '#f59e0b',        label: 'Pending' },
  processing:   { color: '#f59e0b',        label: 'Processing' },
  cancelled:    { color: 'var(--error)',   label: 'Cancelled' },
};
const getStatus = (s) => STATUS_CONFIG[s?.toLowerCase()] ?? { color: 'var(--text-muted)', label: s || 'Pending' };

// ─── AccordionItem fuera del componente padre para evitar remounts ───
function AccordionItem({ id, title, icon: Icon, openSections, setOpenSections, children }) {
  const isOpen = openSections.has(id);
  const toggle = () => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '20px', 
      marginBottom: '1rem',
      border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border)'}`,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: isOpen ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
    }}>
      <button 
        type="button"
        onClick={toggle}
        style={{
          width: '100%', padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isOpen ? 'rgba(0, 54, 102, 0.02)' : 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: isOpen ? 'var(--primary)' : 'var(--background)',
            color: isOpen ? 'white' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>
            <Icon size={20} strokeWidth={1.2} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{title}</span>
        </div>
        <ChevronDown 
          size={20}
          strokeWidth={1.2}
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
            transition: 'transform 0.3s ease',
            color: 'var(--text-muted)'
          }} 
        />
      </button>
      {isOpen && (
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'grid', gap: '1.25rem' }}>
          <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '0.5rem' }} />
          {children}
        </div>
      )}
    </div>
  );
}

export default function UserSettings({ onBack }) {
  const { user, userProfile, updateProfileData, isProfessional, activeRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect professional users if accessing global /settings route directly
  useEffect(() => {
    if (activeRole && activeRole !== 'patient' && activeRole !== 'professional' && location.pathname === '/settings') {
      if (activeRole === 'admin') navigate('/admin/settings', { replace: true });
      else if (activeRole === 'doctor') navigate('/doctor/settings', { replace: true });
      else if (activeRole === 'wholesaler' || activeRole === 'clinic' || activeRole === 'pharmacy') navigate('/wholesaler/settings', { replace: true });
      else if (activeRole === 'supplier') navigate('/supplier-dashboard/settings', { replace: true });
      else if (activeRole === 'account_manager') navigate('/account-manager/settings', { replace: true });
    }
  }, [activeRole, location.pathname, navigate]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // Fallback dynamic back path based on activeRole
    if (activeRole === 'admin') navigate('/admin');
    else if (activeRole === 'doctor') navigate('/doctor');
    else if (activeRole === 'wholesaler' || activeRole === 'clinic' || activeRole === 'pharmacy') navigate('/wholesaler');
    else if (activeRole === 'supplier') navigate('/supplier-dashboard');
    else if (activeRole === 'account_manager') navigate('/account-manager');
    else navigate('/patient');
  };

  // ── Orders listener ──────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) { setOrdersLoading(false); return; }
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setOrdersLoading(false);
    }, () => setOrdersLoading(false));
    return unsub;
  }, [user]);

  const sortedOrders = useMemo(() =>
    [...orders].sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
    [orders]
  );
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Full country list imported from data/countries.js (240+ entries)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    phone: '',
    specialty: '',
    licenseId: '',
    // Shipping Address
    shippingStreet: '',
    shippingCity: '',
    shippingZip: '',
    shippingCountry: '',
    // Billing Address
    billingStreet: '',
    billingCity: '',
    billingZip: '',
    billingCountry: '',
    taxId: ''
  });

  // All sections open by default — users can collapse what they don't need
  const [openSections, setOpenSections] = useState(new Set(['personal', 'institution', 'shipping', 'billing', 'orders']));
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (userProfile && !isInitialized) {
      // Back-compat: if old profile has fullName but not firstName, split it
      const legacyFirst = userProfile.firstName || (userProfile.fullName || user?.displayName || '').split(' ')[0] || '';
      const legacyLast = userProfile.lastName || (userProfile.fullName || user?.displayName || '').split(' ').slice(1).join(' ') || '';
      setFormData({
        firstName: legacyFirst,
        lastName: legacyLast,
        email: userProfile.email || user?.email || '',
        institution: userProfile.institution || '',
        phone: userProfile.phone || '',
        specialty: userProfile.specialty || '',
        licenseId: userProfile.licenseId || '',
        shippingStreet: userProfile.shippingStreet || '',
        shippingCity: userProfile.shippingCity || '',
        shippingZip: userProfile.shippingZip || '',
        shippingCountry: userProfile.shippingCountry || '',
        billingStreet: userProfile.billingStreet || '',
        billingCity: userProfile.billingCity || '',
        billingZip: userProfile.billingZip || '',
        billingCountry: userProfile.billingCountry || '',
        taxId: userProfile.taxId || ''
      });
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateProfileData(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="template-root" style={{ 
      paddingTop: 'clamp(5rem, 10vw, 8rem)', 
      minHeight: '100vh', 
      backgroundColor: 'var(--surface)',
      backgroundImage: 'radial-gradient(circle at top right, rgba(0, 54, 102, 0.03), transparent 400px)'
    }}>
      <div className="container" style={{ maxWidth: '800px', paddingBottom: '6rem' }}>
        
        {/* Uniform Header */}
        <div style={{ marginBottom: '3rem' }}>
          <button 
            onClick={handleBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(0,0,0,0.03)', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, 
              padding: '0.5rem 1rem', borderRadius: '12px',
              marginBottom: '2rem', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          >
            <ArrowLeft size={16} strokeWidth={1.2} /> DASHBOARD
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Account Settings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                Manage your institutional identity and shipping logistics.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.75rem 1.25rem', background: isProfessional ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,54,102,0.05)',
              borderRadius: '16px', border: `1px solid ${isProfessional ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`
            }}>
              <ShieldCheck size={20} strokeWidth={1.2} color={isProfessional ? 'var(--success)' : 'var(--primary)'} />
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isProfessional ? 'var(--success)' : 'var(--primary)', textTransform: 'uppercase' }}>
                {isProfessional ? 'Verified Professional' : 'Standard Access'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section: Shipping — placed first for intuitive geographic context */}
          <AccordionItem id="shipping" title="Shipping Address" icon={Truck} openSections={openSections} setOpenSections={setOpenSections}>
            <div className="form-group">
              <label className="form-label">COUNTRY / REGION</label>
              <CountryPicker name="shippingCountry" value={formData.shippingCountry} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">STREET ADDRESS</label>
              <input type="text" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} className="premium-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">CITY</label>
                <input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleChange} className="premium-input" />
              </div>
              <div className="form-group">
                <label className="form-label">POSTAL / ZIP</label>
                <input type="text" name="shippingZip" value={formData.shippingZip} onChange={handleChange} className="premium-input" />
              </div>
            </div>
          </AccordionItem>

          {/* Section: Personal Info */}
          <AccordionItem id="personal" title="Personal Information" icon={User} openSections={openSections} setOpenSections={setOpenSections}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">FIRST NAME</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="premium-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">LAST NAME</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="premium-input" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">PHONE NUMBER</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="premium-input" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">EMAIL ADDRESS (PRIMARY)</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" value={formData.email} className="premium-input" disabled style={{ background: 'var(--background)', cursor: 'not-allowed', paddingLeft: '2.75rem' }} />
                  <Mail size={16} strokeWidth={1.2} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
              </div>
            </div>
          </AccordionItem>

          {/* Section: Institution */}
          <AccordionItem id="institution" title="Institutional Details" icon={Building2} openSections={openSections} setOpenSections={setOpenSections}>
            <div className="form-group">
              <label className="form-label">INSTITUTION / CLINIC NAME</label>
              <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="premium-input" placeholder="Medical Research Center" />
            </div>
            {isProfessional && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">SPECIALTY / AREA OF EXPERTISE</label>
                  <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="premium-input" placeholder="Endocrinology, Sports Medicine, etc." />
                </div>
                <div className="form-group">
                  <label className="form-label">MEDICAL LICENSE ID</label>
                  <input type="text" name="licenseId" value={formData.licenseId} onChange={handleChange} className="premium-input" placeholder="LIC-1234567890" />
                </div>
              </div>
            )}
            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Verification status is tied to your institution details. Changing this may trigger a re-validation process for Professional pricing.
              </p>
            </div>
          </AccordionItem>

          {/* Section: Billing */}
          <AccordionItem id="billing" title="Billing & Tax Data" icon={Landmark} openSections={openSections} setOpenSections={setOpenSections}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  billingStreet: prev.shippingStreet, 
                  billingCity: prev.shippingCity, 
                  billingZip: prev.shippingZip, 
                  billingCountry: prev.shippingCountry 
                }))}
                style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Copy from shipping
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">COUNTRY / REGION</label>
              <CountryPicker name="billingCountry" value={formData.billingCountry} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">BILLING STREET ADDRESS</label>
              <input type="text" name="billingStreet" value={formData.billingStreet} onChange={handleChange} className="premium-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">CITY</label>
                <input type="text" name="billingCity" value={formData.billingCity} onChange={handleChange} className="premium-input" />
              </div>
              <div className="form-group">
                <label className="form-label">POSTAL / ZIP</label>
                <input type="text" name="billingZip" value={formData.billingZip} onChange={handleChange} className="premium-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">TAX ID / VAT NUMBER</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="premium-input" placeholder="Optional for institutional invoicing" />
            </div>
          </AccordionItem>

          {/* Section: Order History */}
          <AccordionItem id="orders" title="Order History" icon={Package} openSections={openSections} setOpenSections={setOpenSections}>
            {ordersLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
                <Loader2 size={18} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                Loading orders…
              </div>
            ) : sortedOrders.length === 0 ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.25 }}>📦</div>
                <p style={{ margin: 0, fontWeight: 600 }}>No orders yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {sortedOrders.map(order => {
                  const { color, label } = getStatus(order.status);
                  return (
                    <div key={order.id} style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}>
                      {/* Order header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>ORDER #{order.orderId}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                        <span style={{
                          padding: '0.3rem 0.85rem', borderRadius: '99px',
                          fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em',
                          color, border: `1.5px solid ${color}`, backgroundColor: 'white',
                          textTransform: 'uppercase'
                        }}>{label}</span>
                      </div>

                      {/* Items */}
                      {order.items?.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem 0', display: 'grid', gap: '0.3rem' }}>
                          {order.items.map((item, i) => (
                            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{item.name}{item.variant ? ` — ${item.variant}` : ''}</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>×{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Total */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>{order.totalDisplay || '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionItem>

          <div style={{ position: 'sticky', bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))', marginTop: '3rem', zIndex: 10 }}>
            <div style={{ 
              background: 'white', padding: '1.25rem 2rem', borderRadius: '24px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                {saveStatus === 'success' && (
                  <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700 }}>
                    <CheckCircle2 size={18} strokeWidth={1.2} /> Profile updated
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontWeight: 700 }}>
                    <AlertCircle size={18} strokeWidth={1.2} /> Error saving changes
                  </div>
                )}
                {!saveStatus && !isSaving && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Unsaved changes in profile</p>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSaving}
                style={{ padding: '0.85rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0, 54, 102, 0.2)' }}
              >
                {isSaving ? <span className="spinner" style={{ width: '16px', height: '16px', borderColor: 'white', borderTopColor: 'transparent' }}></span> : <Save size={18} strokeWidth={1.2} />}
                {isSaving ? 'Processing...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
