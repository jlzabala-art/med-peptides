"use client";

import React, { useState, useEffect } from 'react';
import { usePrescriptions } from '../../../hooks/admin/usePrescriptions';
import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import { FileText, ShoppingCart, MessageSquare, Activity, User, Clock } from '@/lib/icons';

function TimelineItem({ event }) {
  const isPrescription = event.type === 'prescription';
  const isOrder = event.type === 'order';
  const isNote = event.type === 'note';

  let Icon = Activity;
  let iconBg = '#f1f5f9';
  let iconColor = '#64748b';

  if (isPrescription) {
    Icon = FileText;
    iconBg = '#f0fdf4';
    iconColor = '#16a34a';
  } else if (isOrder) {
    Icon = ShoppingCart;
    iconBg = '#eff6ff';
    iconColor = '#2563eb';
  } else if (isNote) {
    Icon = MessageSquare;
    iconBg = '#fef2f2';
    iconColor = '#dc2626';
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', position: 'relative' }}>
      {/* Vertical Line */}
      <div style={{ 
        position: 'absolute', 
        top: '32px', 
        bottom: '-1.5rem', 
        left: '15px', 
        width: '2px', 
        backgroundColor: '#e2e8f0',
        zIndex: 0
      }} />

      {/* Icon Circle */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        flexShrink: 0
      }}>
        <Icon size={16} />
      </div>

      {/* Content Card */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
            {event.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} />
            {new Date(event.timestamp).toLocaleString()}
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
          {event.description}
        </div>

        {event.metadata && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(event.metadata).map(([key, val]) => (
              <span key={key} style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                color: '#64748b'
              }}>
                {key}: <strong>{val}</strong>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClinicalTimeline({ patientId, patientName, patientCreatedAt }) {
  const [filter, setFilter] = useState('all'); // all, prescriptions, orders, notes
  
  const { prescriptions, loading: loadingRx } = usePrescriptions({
    whereConditions: [['patientId', '==', patientId]]
  });

  const { data: orders, isLoading: loadingOrders } = useFirestoreCollection('orders', {
    whereConditions: [['patientId', '==', patientId]]
  });

  // Mock notes for the social feed
  const mockNotes = [
    {
      id: 'note_1',
      type: 'note',
      title: 'Initial Consultation',
      description: `Patient ${patientName || 'completed'} initial onboarding. Reported low energy levels and poor sleep quality. Blood work requested.`,
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      metadata: { Medic: 'Dr. Sarah Jenkins' }
    },
    {
      id: 'note_2',
      type: 'note',
      title: 'Lab Results Reviewed',
      description: 'HbA1c slightly elevated. Testosterone levels lower than baseline. Recommending Tirzepatide and NAD+ protocol.',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      metadata: { Medic: 'Dr. Sarah Jenkins' }
    }
  ];

  const events = [];

  if (prescriptions) {
    prescriptions.forEach(rx => {
      const itemsList = (rx.items || []).map(i => i.name || i.productName).filter(Boolean);
      events.push({
        id: rx.id,
        type: 'prescription',
        title: `Prescription Issued: ${rx.status}`,
        description: itemsList.length > 0 
          ? `Prescribed: ${itemsList.join(', ')}`
          : `Prescribed ${(rx.items || []).length} items.`,
        timestamp: rx.createdAt || rx.date || new Date().toISOString(),
        metadata: { 'Rx ID': rx.id.slice(0, 8), 'Items': (rx.items || []).length }
      });
    });
  }

  if (orders) {
    orders.forEach(order => {
      events.push({
        id: order.id,
        type: 'order',
        title: `Order Placed: ${order.status}`,
        description: `Order processed for $${order.total || order.amount || 0}.`,
        timestamp: order.createdAt || new Date().toISOString(),
        metadata: { 'Order ID': order.id.slice(0, 8), 'Total': `$${order.total || order.amount || 0}` }
      });
    });
  }

  events.push(...mockNotes);

  // Add Patient Registration Baseline Event
  const patientCreationDate = patientCreatedAt 
    ? (typeof patientCreatedAt === 'string' ? patientCreatedAt : (patientCreatedAt.toDate ? patientCreatedAt.toDate().toISOString() : new Date().toISOString()))
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  events.push({
    id: `reg_${patientId}`,
    type: 'note', // treat as a base note
    title: 'Patient Registered',
    description: `Patient profile created for ${patientName || 'this user'}.`,
    timestamp: patientCreationDate,
    metadata: { 'Status': 'Active' }
  });

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter + (filter === 'prescription' ? '' : '')); // Just simple filter

  if (loadingRx || loadingOrders) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading clinical feed...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Feed Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        {['all', 'prescription', 'order', 'note'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === f ? '#0284c7' : '#cbd5e1',
              backgroundColor: filter === f ? '#f0f9ff' : '#ffffff',
              color: filter === f ? '#0369a1' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f === 'all' ? 'All Activity' : f + 's'}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div style={{ paddingLeft: '0.5rem' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No timeline events found for this filter.
          </div>
        ) : (
          filteredEvents.map(event => <TimelineItem key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
