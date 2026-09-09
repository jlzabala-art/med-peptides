"use client";

import React, { useState, useEffect } from 'react';
import AlertOctagon from "lucide-react/dist/esm/icons/alert-octagon";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import FileCheck2 from "lucide-react/dist/esm/icons/file-check-2";
import { fetchExpiringBatches } from '../../../repositories/inventoryRepository';
import { useAuth } from '../../../context/AuthContext';
import { triggerHaptic } from '../../../utils/haptics';
import notifier from '../../../services/NotificationService';
import { logger } from '../../../utils/logger';

import EmptyState from '../../ui/EmptyState';

export default function BatchExpirationTrackerWidget() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const rawBatches = await fetchExpiringBatches(user.uid, 10);
        if (rawBatches && rawBatches.length > 0) {
          setBatches(rawBatches.map((d) => ({
            id: d.id,
            ...d,
            expiryDate: d.expiryDate?.toDate ? d.expiryDate.toDate() : (d.expiryDate ? new Date(d.expiryDate) : new Date()),
          })));
        } else {
          setBatches([]);
        }
      } catch (err) {
        logger.error('Error fetching batches', { error: err.message });
        setBatches([]);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, [user]);

  const getDaysUntilExpiry = (date) => {
    const diff = date.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (days) => {
    if (days < 30) return '#dc2626'; // Critical Red
    if (days < 90) return '#d97706'; // Amber
    return '#16a34a'; // Green
  };

  const getUrgencyLabel = (days) => {
    if (days < 30) return 'Critical Shelf-Life';
    if (days < 90) return 'Moderate Window';
    return 'Optimal Shelf-Life';
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#003666" /> Batch & Lot Expiration Tracking
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            FEFO inventory fulfillment rules & physical lot quality assurance
          </p>
        </div>
        <div style={{ padding: '0.45rem', background: '#fff1f2', borderRadius: '10px', color: '#e11d48' }}>
          <AlertOctagon size={18} />
        </div>
      </div>

      {/* Batch List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
          </div>
        ) : batches.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No lot batches registered"
            subtitle="All physical inventory lots and batch expiration dates will appear here once logged."
          />
        ) : (
          batches.map((batch, index) => {
            const days = getDaysUntilExpiry(batch.expiryDate);
            const color = getStatusColor(days);
            const isFefoPriority = index === 0;

            return (
              <div 
                key={batch.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.85rem 1rem', 
                  background: isFefoPriority ? '#eff6ff' : '#f8fafc', 
                  borderRadius: '12px', 
                  border: isFefoPriority ? '1.5px solid #93c5fd' : '1px solid #e2e8f0', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{batch.product}</span>
                    {isFefoPriority && (
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          color: '#1d4ed8', 
                          backgroundColor: '#dbeafe', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <ShieldCheck size={12} /> FEFO PRIORITY
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    Lot: {batch.batchId} • Qty: {batch.quantity} units
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: color, textTransform: 'uppercase' }}>
                      {getUrgencyLabel(days)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                      <span style={{ fontWeight: 800, color: color, fontSize: '0.95rem' }}>{days} days left</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      notifier.info(`Retrieving CoA certificate for Lot ${batch.batchId}...`);
                    }}
                    title="View Certificate of Analysis"
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.4rem',
                      cursor: 'pointer',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px',
                    }}
                  >
                    <FileCheck2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CTA (Golden Rule #23: min 44px height) */}
      <button 
        type="button"
        onClick={() => {
          triggerHaptic('tap');
          notifier.info('Opening master warehouse lot & batch registry...');
        }}
        style={{ 
          marginTop: '1rem', 
          width: '100%', 
          minHeight: '44px', 
          padding: '0.65rem', 
          background: '#f8fafc', 
          border: '1px solid #cbd5e1', 
          borderRadius: '10px', 
          color: '#003666', 
          fontWeight: 700, 
          fontSize: '0.82rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.4rem', 
          cursor: 'pointer', 
          transition: 'all 0.15s ease' 
        }}
      >
        <span>View Full Warehouse Batch Register</span> <ArrowRight size={14} />
      </button>
    </div>
  );
}