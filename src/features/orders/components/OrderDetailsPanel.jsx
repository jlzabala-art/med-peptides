import React from 'react';
import Image from 'next/image';
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Users from "lucide-react/dist/esm/icons/users";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Receipt from "lucide-react/dist/esm/icons/receipt";
import Package from "lucide-react/dist/esm/icons/package";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import CopyableId from '../../../components/ui/CopyableId';
import { WarehouseOriginBadge, ColdChainBadge } from '../../../components/ui/WarehouseOriginBadge';
import orderRepository from '../../../repositories/orderRepository';

export default function OrderDetailsPanel({ order: o }) {
  if (!o) return null;

  function resolveItemConstituents(item, orderDoc) {
    if (Array.isArray(item.apiItems) && item.apiItems.length > 0) return item.apiItems;
    if (Array.isArray(item.apis) && item.apis.length > 0) return item.apis;
    if (Array.isArray(item.constituents) && item.constituents.length > 0) return item.constituents;
    if (Array.isArray(orderDoc?.apiItems) && orderDoc.apiItems.length > 0) return orderDoc.apiItems;

    const fullStr = `${item.productName || ''} ${item.name || ''} ${item.title || ''} ${item.description || ''} ${item.variant || ''}`.toLowerCase();
    const isCompounded = /magistral|formula|compounding|latanoprost|estradiol|alfatradiol|igrantine|trichosol|minoxidil|finasteride|dutasteride|spironolactone|bpc-157|ghk-cu/i.test(fullStr);
    if (!isCompounded) return null;

    const list = [];
    const qty = Number(item.quantity || 1);
    const isMultiPack = /3x|n3|3-month|3 bottles/i.test(fullStr);
    const packFactor = isMultiPack ? 3 : 1;

    if (/latanoprost/i.test(fullStr)) {
      list.push({
        name: 'Latanoprost Fagron',
        genericName: 'Latanoprost Pure API',
        concentration: '0.005% (50 mcg/ml)',
        role: 'Prostaglandin F2α Analogue (Anagen Phase Induction)',
        totalBatchMass: `${5 * packFactor * qty} mg`,
        grade: 'Ph.Eur / USP Micronized'
      });
    }

    if (/estradiol|alfatradiol/i.test(fullStr)) {
      list.push({
        name: '17-α-Estradiol',
        genericName: 'Alfatradiol (Fagron)',
        concentration: '0.05% (500 mcg/ml)',
        role: 'Estrogen Receptor Modulator (Aromatase Activator & 5AR Inhibition)',
        totalBatchMass: `${50 * packFactor * qty} mg`,
        grade: 'Ph.Eur Micronized'
      });
    }

    if (/igrantine/i.test(fullStr)) {
      list.push({
        name: 'IGrantine-F1™',
        genericName: 'Bioactive Decapeptide Complex',
        concentration: '0.50% (5 mg/ml)',
        role: 'Wnt/β-Catenin Signaling & Dermal Papilla Proliferation',
        totalBatchMass: `${(500 * packFactor * qty).toLocaleString()} mg`,
        grade: 'Biotech Synthetic >98%'
      });
    }

    if (/minoxidil/i.test(fullStr)) {
      list.push({
        name: 'Minoxidil Fagron',
        genericName: 'Minoxidil Micronized',
        concentration: '5.0% (50 mg/ml)',
        role: 'Vasodilator & Follicular Microcirculation',
        totalBatchMass: `${5 * packFactor * qty} g`,
        grade: 'USP Micronized'
      });
    }

    if (/finasteride/i.test(fullStr)) {
      list.push({
        name: 'Finasteride Fagron',
        genericName: 'Finasteride USP',
        concentration: '0.10% (1 mg/ml)',
        role: 'Type II 5α-Reductase Inhibitor',
        totalBatchMass: `${100 * packFactor * qty} mg`,
        grade: 'USP Micronized'
      });
    }

    if (/trichosol|vehicle/i.test(fullStr) || list.length > 0) {
      list.push({
        name: 'TrichoSol™ Scalp Carrier',
        genericName: 'TrichoSol Compounding Solution',
        concentration: 'q.s. 100 ml',
        role: 'Patented Phyto-Lipidic Scalp Vehicle (Ethanol & PPG-free)',
        totalBatchMass: `${100 * packFactor * qty} ml (${packFactor * qty}x 100ml)`,
        grade: 'Fagron TrichoTech Standard'
      });
    }

    return list.length > 0 ? list : null;
  }

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
            {o.items.map((item, idx) => {
              const constituents = resolveItemConstituents(item, o);
              return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--color-bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

                {/* Structured APIs & Constituents Breakdown (Drawer Parity) */}
                {constituents && constituents.length > 0 && (
                  <div style={{ marginTop: '4px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        <FlaskConical size={13} color="#003666" />
                        <span>Active Pharmaceutical Ingredients (APIs) & Constituents ({constituents.length} Components)</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '1px 7px', borderRadius: '10px' }}>
                        Magistral Compounding
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.75rem' }}>
                      {constituents.map((c, cIdx) => (
                        <div key={cIdx} style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontWeight: 700, color: '#003666' }}>• {c.name}</div>
                          <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{c.role}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 600, fontSize: '0.70rem', color: '#0284c7' }}>
                            <span>Conc: {c.concentration}</span>
                            <span style={{ color: '#1e293b' }}>Mass: {c.totalBatchMass}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', fontSize: '0.70rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>Posology:</strong> 1.0 ml once daily application to dry scalp</span>
                      <span><strong>Compounding Standard:</strong> Ph.Eur / Fagron TrichoTech</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
