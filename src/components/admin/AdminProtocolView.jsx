"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import StatusChip from '../ui/StatusChip';

import { ArrowLeft, Edit3, FlaskConical } from '@/lib/icons';


import dynamic from 'next/dynamic';

const ProtocolHeaderCharts = dynamic(() => import('../protocol/ProtocolHeaderCharts'));
const ProtocolGanttChart = dynamic(() => import('../protocol/ProtocolGanttChart'));
const InjectionDoseChart = dynamic(() => import('../protocol/InjectionDoseChart'));
const ProtocolSupplyEngine = dynamic(() => import('../protocol/ProtocolSupplyEngine'));

export default function AdminProtocolView() {
  const { id } = useParams();
  const router = useRouter();
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProtocol = async () => {
      try {
        const docRef = doc(db, 'protocols', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProtocol({ id: snap.id, ...snap.data() });
        } else {
          router.push('/admin/protocols');
        }
      } catch (err) {
        console.error('Error fetching protocol:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProtocol();
  }, [id, navigate]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Protocol Details...</div>;
  if (!protocol) return null;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => router.push('/admin/protocols')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FlaskConical color="#3b82f6" /> {protocol.name || protocol.name || 'Untitled Protocol'}
          </h1>
          <StatusChip status={protocol.status || 'draft'} />
        </div>
        <Link to={`/admin/protocols/${id}/edit`} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#3b82f6', color: 'white', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit3 size={16} /> Edit Protocol
        </Link>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', minHeight: '300px' }}>
            <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>Efficacy Timeline</h3>
            <div className="apv-hero-charts">
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading visualization...</div>}>
                <ProtocolHeaderCharts protocol={protocol} />
              </Suspense>
            </div>
            <div className="apv-hero-gantt" style={{ marginTop: '1.5rem' }}>
              <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Gantt Timeline...</div>}>
                <ProtocolGanttChart phases={protocol.phases || []} durationScale={1} />
              </Suspense>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Description</h3>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{protocol.description || 'No description provided.'}</p>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Syringe & Reconstitution Math</h3>
            {protocol.phases?.map((phase, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6' }}>{phase.label}</h4>
                {phase.items?.map((item, j) => (
                  <div key={j} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', minHeight: '150px' }}>
                    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Math...</div>}>
                      <InjectionDoseChart 
                        item={item}
                        vialSizeMg={protocol.reconstitution?.vialSizeMg || 5}
                        bacWaterMl={protocol.reconstitution?.bacWaterMl || 2}
                      />
                    </Suspense>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>Loading Engine...</div>}>
            <ProtocolSupplyEngine protocol={protocol} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}