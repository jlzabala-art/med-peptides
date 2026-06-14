import Activity from "lucide-react/dist/esm/icons/activity";
import Clock from "lucide-react/dist/esm/icons/clock";
import Package from "lucide-react/dist/esm/icons/package";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';





export default function ActivePrescriptionsTracker() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'recommendations'), 
      where('doctorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPrescriptions(list);
    });

    return () => unsub();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)', border: '#fde68a', icon: Clock };
      case 'processing': return { bg: '#eff6ff', text: 'var(--color-primary)', border: '#bfdbfe', icon: Package };
      case 'active': return { bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: '#bbf7d0', icon: CheckCircle2 };
      default: return { bg: 'var(--color-bg-app)', text: 'var(--color-text-secondary)', border: 'var(--color-border)', icon: Activity };
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', flex: 1, minHeight: '350px' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} color="var(--color-success)" /> Supply Tracking
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {prescriptions.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.9rem', fontWeight: 600 }}>
            No recent prescriptions.
          </div>
        ) : (
          prescriptions.map(p => {
            const style = getStatusColor(p.status);
            const Icon = style.icon;
            const dateStr = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : 'Just now';

            return (
              <div key={p.id} style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', 
                borderRadius: '16px', border: `1px solid ${style.border}`, 
                background: style.bg, cursor: 'pointer', transition: 'transform 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ color: style.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{p.patientName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                    {p.productName || 'Compound Formula'} • {dateStr}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: style.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {p.status}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}