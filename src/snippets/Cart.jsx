import { useEffect } from 'react';
import { X, Globe, MessageCircle, Mail } from 'lucide-react';
import { lockScroll, unlockScroll } from '../utils/scrollLock';


export default function Cart({ isOpen, onClose, cart, cartMetadata = {}, updateCart, region, isProfessional, EXCHANGE_RATES, onCheckout, products }) {
  useEffect(() => {
    if (isOpen) {
      const lockId = lockScroll();
      return () => unlockScroll(lockId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cartItems = Object.entries(cart);
  const totalItems = cartItems.reduce((acc, [_, qty]) => acc + qty, 0);

  // Calculate order total with tiered pricing
  const calculateTotal = () => {
    let totalUSD = 0;
    let totalSavingsUSD = 0;
    cartItems.forEach(([itemKey, qty]) => {
      // Find the product by checking name or if name (dosage) matches
      // Extract name from key e.g. "Tirzepatide (10mg)" -> "Tirzepatide"
      let namePart = itemKey;
      let dosagePart = null;
      if (itemKey.includes('(')) {
        const match = itemKey.match(/(.+) \((.+)\)/);
        if (match) {
          namePart = match[1];
          dosagePart = match[2];
        }
      }

      const product = products.find(p => p.name === namePart && (!dosagePart || p.dosage === dosagePart));
      
      if (product) {
        const productGuestVial = parseFloat(product.guestVialPrice || product.perVialPriceUSD || 0);
        const productProVial = parseFloat(product.proVialPrice || (product.perVialPriceUSD * 0.85).toFixed(2) || 0);
        const productGuestKit = parseFloat(product.guestKitPrice || product.kitPriceUSD || 0);
        const productProKit = parseFloat(product.proKitPrice || (product.kitPriceUSD * 0.85).toFixed(2) || 0);

        if (isProfessional && product.category !== "Research Supplies") {
          const kits = Math.floor(qty / 10);
          const individuals = qty % 10;
          
          const standardCost = qty * productProVial; // Base for calculation
          const discountedCost = (kits * productProKit) + (individuals * productProVial);
          
          totalUSD += discountedCost;
          totalSavingsUSD += (standardCost - discountedCost);
        } else if (isProfessional) {
          totalUSD += qty * productProVial;
        } else {
          totalUSD += qty * productGuestVial;
        }
      }
    });

    const formatValue = (val) => {
      if (isNaN(val)) return '0';
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return {
      display: `$${formatValue(totalUSD.toFixed(0))}`,
      savings: totalSavingsUSD > 0 ? `$${formatValue(totalSavingsUSD.toFixed(0))}` : null,
      subtext: 'Final logistics and tax calculations are applied at checkout'
    };
  };
   // Unified checkout totals to USD regardless of region.

  const { display, savings, subtext } = calculateTotal();

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1999,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'white',
        zIndex: 2000,
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>Your Research List</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{totalItems} units selected</p>
        </div>
        <button 
          onClick={onClose}
          style={{ 
            background: 'var(--background)', 
            border: '1px solid var(--border)', 
            cursor: 'pointer', 
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--border)' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)' }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
            <Globe size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Your research list is empty.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map(([itemKey, qty]) => {
                let namePart = itemKey;
                let dosagePart = null;
                if (itemKey.includes('(')) {
                  const match = itemKey.match(/(.+) \((.+)\)/);
                  if (match) {
                    namePart = match[1];
                    dosagePart = match[2];
                  }
                }
                const meta = cartMetadata[itemKey];
                
                return (
                  <div key={itemKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>{itemKey}</div>
                          {meta && meta.protocolRequest && (
                            <div style={{ 
                              display: 'inline-block',
                              marginTop: '0.4rem',
                              padding: '0.15rem 0.5rem', 
                              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                              color: '#10b981', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              fontWeight: 600 
                            }}>
                              Generated: {meta.protocolName}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => updateCart(itemKey, -qty)}
                          title="Remove item"
                          style={{ 
                            padding: '0.2rem', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            borderRadius: '4px'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        {isProfessional && qty >= 10 
                          ? `${Math.floor(qty / 10)} Kit(s) + ${qty % 10} Unit(s)` 
                          : `${qty} Unit(s)`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', marginTop: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                          <button 
                             onClick={() => updateCart(itemKey, -1)}
                             style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                          >-</button>
                          <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{qty % 10}</span>
                          <button 
                             onClick={() => updateCart(itemKey, 1)}
                             style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                          >+</button>
                        </div>
                      </div>
                      
                      {isProfessional && product && product.category !== "Research Supplies" && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kits:</span>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0,163,224,0.05)' }}>
                            <button 
                               onClick={() => updateCart(itemKey, -10)}
                               style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}
                            >-</button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{Math.floor(qty / 10)}</span>
                            <button 
                               onClick={() => updateCart(itemKey, 10)}
                               style={{ padding: '0.2rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}
                            >+</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
        {savings && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>Kit Savings Applied</span>
            <span>-{savings}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Total Estimate</span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
            {display || '---'}
          </span>
        </div>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          *{subtext}.
        </p>

        <button 
          onClick={onCheckout}
          className="btn btn-primary"
          disabled={totalItems === 0}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            fontWeight: 700, 
            fontSize: '1rem',
            backgroundColor: totalItems === 0 ? '#94a3b8' : 'var(--primary)',
            borderColor: totalItems === 0 ? '#94a3b8' : 'var(--primary)',
            cursor: totalItems === 0 ? 'not-allowed' : 'pointer',
            opacity: totalItems === 0 ? 0.6 : 1
          }}
        >
          Request Quotation
        </button>
        
        <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Total limit: 20 units per research inquiry.
        </p>
      </div>
    </div>
  </>
);
}
