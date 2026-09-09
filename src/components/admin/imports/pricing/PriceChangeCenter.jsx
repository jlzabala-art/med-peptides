"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from '@/lib/icons';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import EmptyState from '../../../ui/EmptyState';

export default function PriceChangeCenter({ changes = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!changes);

  useEffect(() => {
    if (changes !== null && Array.isArray(changes)) {
      setItems(changes);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadRecentPriceChanges() {
      try {
        const q = query(collection(db, 'price_updates'), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        if (isMounted) {
          const loaded = snap.docs.map(doc => {
            const d = doc.data();
            const oldPrice = Number(d.oldPrice || 0);
            const newPrice = Number(d.newPrice || 0);
            const diff = oldPrice > 0 ? Number((((newPrice - oldPrice) / oldPrice) * 100).toFixed(1)) : 0;
            const isIncrease = diff > 0;
            return {
              id: doc.id,
              name: d.productName || d.name || 'Catalog Product',
              old: oldPrice,
              new: newPrice,
              diff,
              impact: isIncrease ? 'Margin Risk' : 'Margin Improvement',
              color: isIncrease ? (diff > 10 ? '#ef4444' : '#f59e0b') : '#10b981',
              affectedProtocol: d.affectedProtocol || null,
            };
          });
          setItems(loaded);
        }
      } catch (err) {
        console.error('Error fetching price changes:', err);
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecentPriceChanges();
    return () => { isMounted = false; };
  }, [changes]);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#0f172a" />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Price Change Center</span>
        </div>
      </div>

      <div style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ height: '48px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '48px', borderRadius: '6px' }} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No price changes detected"
            subtitle="Catalog import differentials and supplier wholesale price updates will appear here."
          />
        ) : (
          items.map((item, idx) => (
            <div key={item.id || idx} style={{
              padding: '16px',
              borderBottom: idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{item.name}</span>
                <span style={{ 
                  color: item.color, 
                  fontSize: '12px', 
                  fontWeight: 600,
                  background: `${item.color}15`,
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {item.diff > 0 ? '+' : ''}{item.diff}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ textDecoration: 'line-through' }}>${item.old}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>${item.new}</span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: item.color }}>
                  {item.diff > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  {item.impact}
                </span>
              </div>
              {item.diff > 10 && item.affectedProtocol && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', color: '#991b1b', display: 'flex', gap: '6px' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Impacts <strong>{item.affectedProtocol}</strong> margin. Review wholesale compounding tier.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}