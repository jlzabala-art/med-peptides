import React from 'react';
import { Minus, Plus, Package, Activity } from 'lucide-react';

const OrderSummary = ({
  enrichedCartItems,
  cartMetadata,
  protocolGroups,
  checkoutTotals,
  updateCart
}) => {
  const individualItems = enrichedCartItems.filter(i => {
    const meta = cartMetadata[i.itemKey];
    return !meta?.isProtocol && !meta?.protocolId;
  });

  const protocolGroupsList = Object.values(protocolGroups);

  return (
    <>
      {/* ── Individual Peptides (Not in a bundle) ── */}
      {individualItems.length > 0 && individualItems.map(({ itemKey, qty, namePart, dosagePart, unitPrice, lineTotal }) => (
        <div key={itemKey} className="co-item-row" style={{ position: 'relative', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="co-item-name">{namePart}</div>
            {dosagePart && <div className="co-item-variant">{dosagePart}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
              <div className="co-item-qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', padding: '2px' }}>
                <button 
                  type="button"
                  onClick={() => updateCart(itemKey, -1)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                >
                  <Minus size={12} strokeWidth={3} />
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '1.2rem', textAlign: 'center', color: '#0f172a' }}>{qty}</span>
                <button 
                  type="button"
                  onClick={() => updateCart(itemKey, 1)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                >
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
              <div className="co-item-qty" style={{ margin: 0 }}>× ${unitPrice.toFixed(2)}</div>
            </div>
          </div>
          <div className="co-item-price" style={{ fontWeight: 800, color: '#0f172a' }}>${lineTotal.toFixed(2)}</div>
        </div>
      ))}

      {/* ── Protocol Bundles (Grouped) ── */}
      {protocolGroupsList.map(group => (
        <div key={group.name} className="co-item-row co-bundle-row" style={{ 
          background: 'rgba(0,163,224,0.04)', 
          margin: '0.5rem -1.5rem', 
          padding: '1.25rem 1.5rem',
          borderLeft: '5px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <div className="co-item-name" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>{group.name}</div>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 900, 
                  backgroundColor: 'var(--primary)', 
                  color: 'var(--color-bg-surface)', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Bundle</span>
              </div>
              {group.goal && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{group.goal}</div>}
            </div>
            <div className="co-item-price" style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.1rem' }}>
              ${(group.bundleTotal || 0).toFixed(0)}
            </div>
          </div>

          {/* List of included items in this specific bundle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(255,255,255,0.5)', padding: '0.75rem', borderRadius: '8px' }}>
             {/* Use group.products (from cartMetadata.protocolBundles) if available, otherwise fallback to group.items */}
             {(group.products?.length > 0 ? group.products : group.items).map((i, idx) => {
               const name = typeof i === 'string' ? i : (i.name || i.itemKey);
               const qty = typeof i === 'string' ? null : i.qty;
               const isAcc = i.isAccessory || name.toLowerCase().includes('water') || name.toLowerCase().includes('syringe') || name.toLowerCase().includes('pad');
               return (
                 <div key={`${name}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-primary)' }}>
                   {isAcc ? <Package size={12} color="var(--color-text-tertiary)" /> : <Activity size={12} color="var(--primary)" />}
                   <span style={{ fontWeight: 600 }}>{name}</span>
                   {qty > 0 && <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}>(x{qty})</span>}
                   <span style={{ marginLeft: 'auto', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.7rem' }}>INCLUDED</span>
                 </div>
               );
             })}
          </div>
        </div>
      ))}

      <div className="co-total-row" style={{ marginTop: '1.5rem' }}>
        <div>
          <div className="co-total-label">Estimated Total</div>
          {checkoutTotals.subtext && <div className="co-total-sub">*{checkoutTotals.subtext}</div>}
        </div>
        <div className="co-total-amount">{checkoutTotals.display}</div>
      </div>
    </>
  );
};

export default OrderSummary;
