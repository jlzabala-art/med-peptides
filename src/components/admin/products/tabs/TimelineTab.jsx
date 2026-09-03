import React from 'react';
import { Card, StatusChip, Button } from '../../../ui';
import { Box, PackageOpen, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, Building, Truck, Globe, ExternalLink, RefreshCw, Layers } from '@/lib/icons';

export default function TimelineTab({ timelineEvents }) {
    return (
      <Card padding="md" style={{ backgroundColor: '#0f172a', borderColor: '#e2e8f0' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>Product Audit Activity Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem' }}>
          {/* Vertical line connector */}
          <div style={{
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            left: '3.5px',
            width: '2px',
            backgroundColor: '#e2e8f0'
          }} />

          {timelineEvents.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                <div style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: event.color,
                  border: '2px solid #111827',
                  position: 'absolute',
                  left: '-16.5px',
                  top: '4px',
                  zIndex: 2
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon size={12} style={{ color: event.color }} /> {event.event}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{event.date}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Triggered by: <strong>{event.user}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
}
