import React from 'react';
import Image from 'next/image';
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Users from "lucide-react/dist/esm/icons/users";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Receipt from "lucide-react/dist/esm/icons/receipt";
import Package from "lucide-react/dist/esm/icons/package";
import CopyableId from '../../../components/ui/CopyableId';
import { WarehouseOriginBadge, ColdChainBadge } from '../../../components/ui/WarehouseOriginBadge';
import orderRepository from '../../../repositories/orderRepository';

export default function OrderDetailsPanel({ order: o }) {
  if (!o) return null;

  return (
    <div
      style={{
        padding: '1rem',
        background: 'var(--color-bg-app)',
        borderTop: '1px solid var(--border)',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <Stethoscope size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Routing / Doctor
          </h5>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {o.doctorName ? o.doctorName : 'Direct B2C Order'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            {o.doctorEmail ? o.doctorEmail : 'No clinic assigned'}
          </div>
        </div>
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Assigned To
          </h5>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {o.accountManagerName || 'System Default'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            {o.accountManagerId ? `ID: ${o.accountManagerId}` : 'Auto-assigned'}
          </div>
        </div>
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Shipping
          </h5>
          {o.shippingAddress ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
              <div>{o.shippingAddress.address || o.shippingAddress.line1}</div>
              {(o.shippingAddress.city || o.shippingAddress.postal_code) && (
                <div>
                  {o.shippingAddress.city}, {o.shippingAddress.state}{' '}
                  {o.shippingAddress.postal_code}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>
              No shipping details provided
            </div>
          )}
        </div>
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <Receipt size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Financials
          </h5>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
            Items: <strong>{o.items?.length || 0}</strong>
            <br />
            Subtotal: <strong>${parseFloat(o.subtotal || o.total || 0).toFixed(2)}</strong>
            <br />
            Total:{' '}
            <strong style={{ color: 'var(--color-primary)' }}>
              ${parseFloat(o.total || 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* ── Order Items List ── */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <h5 style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          <Package size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Order Items
        </h5>
        {o.items && o.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {o.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.image ? (
                    <div style={{ position: 'relative', width: 44, height: 44 }}>
                      <Image src={item.image} alt={item.name || 'Product Image'} fill sizes="44px" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '4px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="var(--color-text-tertiary)" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{item.name || 'Unknown Product'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '2px', flexWrap: 'wrap' }}>
                      <span>Qty: <strong>{item.quantity || 1}</strong></span>
                      <span>•</span>
                      <span>SKU: {item.sku || item.productId || 'N/A'}</span>
                      {item.originWarehouse && <WarehouseOriginBadge origin={item.originWarehouse} size="sm" />}
                      {item.requiresColdChain && <ColdChainBadge required={true} size="sm" />}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                    ${parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                    (${parseFloat(item.price || 0).toFixed(2)} / ea)
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            No item details available in this legacy order.
          </div>
        )}
      </div>

      {/* ── Additional Metadata ── */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Stripe Payment Intent</span>
          <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
            {o.paymentIntentId || 'N/A'}
          </code>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Database Order ID</span>
          <CopyableId value={o.id} />
        </div>
        {(o.quotationId || o.quotationNumber) && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Quotation Origin</span>
            <a 
              href={`/admin/quotations?id=${o.quotationId || o.quotationNumber}`}
              style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}
            >
              📄 {o.quotationNumber || o.quotationId} ↗
            </a>
          </div>
        )}
        {(o.prescriptionId || o.metadata?.prescriptionId) && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Prescription Origin</span>
            <span 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/admin/prescriptions?id=${o.prescriptionId || o.metadata?.prescriptionId}`;
              }}
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '2px' }}
            >
              {o.prescriptionId || o.metadata?.prescriptionId}
            </span>
          </div>
        )}
        {o.trackingNumber && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Tracking Number</span>
            <CopyableId value={o.trackingNumber} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Auto-Refill (Zoho Subscriptions)</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: o.isSubscription ? 'var(--success)' : 'var(--text-muted)' }}>
            <input 
              type="checkbox" 
              checked={!!o.isSubscription} 
              onChange={async (e) => {
                const isSub = e.target.checked;
                try {
                  await orderRepository.updateOrder(o.id, { isSubscription: isSub });
                } catch (err) {
                  console.error('Error toggling subscription:', err);
                }
              }} 
            />
            {o.isSubscription ? 'Enabled (Monthly)' : 'Disabled'}
          </label>
        </div>
      </div>
    </div>
  );
}
