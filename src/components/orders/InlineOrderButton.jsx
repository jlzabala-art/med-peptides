"use client";

import React, { useState } from 'react';
import { ShoppingBag, Check, Plus, Minus, Lock } from 'lucide-react';
import { useB2BOrder } from '@/hooks/useB2BOrder';
import { useAuth } from '@/context/AuthContext';
import { triggerHaptic } from '@/utils/haptics';

export default function InlineOrderButton({
  product,
  variant = null,
  isEs = true,
  compact = false,
  role = 'clinic',
  brandSlug = 'peptides',
  onUnlockRequest = null
}) {
  const { user } = useAuth();
  const { addItem, items, openDrawer } = useB2BOrder();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Check if unauthenticated
  const isAuthenticated = Boolean(user);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('light');
          if (onUnlockRequest) onUnlockRequest();
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '4px 8px' : '6px 12px',
          borderRadius: '6px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          color: '#003666',
          fontSize: '0.74rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        title={isEs ? 'Iniciar sesión para ver precios y hacer pedidos' : 'Log in to view pricing and place orders'}
      >
        <Lock size={12} color="#0d9488" />
        <span>{isEs ? 'Ver Precios / Pedir' : 'View Pricing / Order'}</span>
      </button>
    );
  }

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product, {
      variant,
      quantity: qty,
      role,
      brandSlug
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const itemKey = `${product.id || product.slug}::${variant?.id || 'standard'}`;
  const existingInOrder = items.find((i) => i.id === itemKey);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mini Qty Selector */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          height: compact ? '28px' : '32px'
        }}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setQty((q) => Math.max(1, q - 1));
          }}
          style={{
            padding: '0 6px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Minus size={11} />
        </button>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 750,
            color: '#0f172a',
            minWidth: '18px',
            textAlign: 'center'
          }}
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setQty((q) => q + 1);
          }}
          style={{
            padding: '0 6px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={handleAdd}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '0 10px' : '0 12px',
          height: compact ? '28px' : '32px',
          borderRadius: '6px',
          background: justAdded ? '#16a34a' : '#003666',
          border: 'none',
          color: '#ffffff',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 2px rgba(0, 54, 102, 0.15)'
        }}
        title={isEs ? 'Añadir unidades a la orden de compra B2B' : 'Add units to B2B purchase order'}
      >
        {justAdded ? (
          <>
            <Check size={12} strokeWidth={3} />
            <span>{isEs ? 'Añadido' : 'Added'}</span>
          </>
        ) : (
          <>
            <ShoppingBag size={12} />
            <span>{isEs ? 'Pedir' : 'Order'}</span>
          </>
        )}
      </button>

      {/* Quick Indicator if already in cart */}
      {existingInOrder && !justAdded && (
        <button
          type="button"
          onClick={openDrawer}
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            borderRadius: '4px',
            padding: '2px 5px',
            fontSize: '0.64rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title={isEs ? 'Ver pedido actual' : 'View active order'}
        >
          {existingInOrder.quantity} en pedido
        </button>
      )}
    </div>
  );
}
