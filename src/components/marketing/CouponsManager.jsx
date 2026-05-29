import React, { useState } from 'react';
import { Tag, Plus, Search, Trash2, Edit2, Copy, CheckCircle } from 'lucide-react';

export default function CouponsManager({ ownerId, ownerType }) {
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'DRGARCIA20', discount: '20%', type: 'percentage', usageCount: 5, maxUses: 100, active: true },
    { id: '2', code: 'WELCOME50', discount: '$50', type: 'fixed', usageCount: 12, maxUses: 50, active: false }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Tag size={24} color="var(--primary)" />
            Coupons & Discounts
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage discount codes to incentivize your clinics and partners.
          </p>
        </div>
        <button className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {coupons.map(coupon => (
          <div key={coupon.id} style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: `1px solid ${coupon.active ? 'var(--primary-light)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            position: 'relative',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: coupon.active ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
              color: coupon.active ? 'var(--color-success)' : 'var(--text-muted)'
            }}>
              {coupon.active ? 'Active' : 'Inactive'}
            </div>

            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {coupon.code}
              <button 
                onClick={() => handleCopy(coupon.code)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
              >
                {copiedCode === coupon.code ? <CheckCircle size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discount</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>{coupon.discount}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usage</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{coupon.usageCount} / {coupon.maxUses}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="secondary-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit2 size={14} /> Edit
              </button>
              <button style={{ 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.8rem', 
                backgroundColor: 'transparent', 
                border: '1px solid var(--border)', 
                borderRadius: '4px',
                color: 'var(--error)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
