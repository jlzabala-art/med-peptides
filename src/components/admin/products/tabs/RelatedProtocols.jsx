import React, { useMemo } from 'react';
import { useProtocols } from '../../../../hooks/admin/useProtocols';
import { Card, StatusChip, LinkableId } from '../../../ui';
import EmptyState from '../../../ui/EmptyState';
import { Layers } from '@/lib/icons';

export default function RelatedProtocols({ productId }) {
  const { protocols, loading } = useProtocols({ pageSize: 50 });

  const related = useMemo(() => {
    if (!protocols || !productId) return [];
    return protocols.filter(p => {
      if (!p.phases) return false;
      return p.phases.some(phase => 
        phase.items?.some(i => (i.product_id === productId || i.id === productId))
      );
    });
  }, [protocols, productId]);

  if (loading) {
    return <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Loading related protocols...</div>;
  }

  return (
    <Card padding="md" style={{ backgroundColor: '#0f172a', borderColor: '#e2e8f0', color: '#0f172a', marginTop: '1.25rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={16} color="#a78bfa" />
        Included in Protocols
      </h3>
      {related.length === 0 ? (
        <EmptyState 
          icon={Layers} 
          title="No related protocols" 
          subtitle="This product is not currently included in any active clinical protocols." 
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {related.map(p => (
            <div key={p.id} style={{ 
              padding: '0.75rem', 
              backgroundColor: '#e2e8f0', 
              border: '1px solid #334155', 
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <LinkableId 
                  value={p.id} 
                  displayValue={p.name} 
                  href={`/admin/protocols?id=${p.id}`} 
                  style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}
                />
                <StatusChip status={p.status || 'draft'} />
              </div>
              {p.category && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.category}</div>}
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Duration: {p.durationWeeks || 0} weeks
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
