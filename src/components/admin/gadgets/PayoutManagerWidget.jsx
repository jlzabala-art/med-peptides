import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

import { Card, CardHeader, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import EmptyState from '../../ui/EmptyState';

const DEMO_PAYOUTS = [
  {
    id: '1',
    doctorId: 'doc1',
    doctorName: 'Dr. Alejandro Gomez',
    amount: 1250.0,
    period: 'Mayo 2026',
    status: 'pending',
  },
  {
    id: '2',
    doctorId: 'doc2',
    doctorName: 'Dra. María Sánchez',
    amount: 3400.5,
    period: 'Mayo 2026',
    status: 'processing',
  },
  {
    id: '3',
    doctorId: 'doc3',
    doctorName: 'Dr. John Doe',
    amount: 890.0,
    period: 'Abril 2026',
    status: 'paid',
  },
];

export default function PayoutManagerWidget({ ownerId = 'admin', activeRoleProp }) {
  const { activeRole: authRole } = useAuth();
  const activeRole = authRole || activeRoleProp;
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayouts() {
      if (activeRole !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'payouts'), orderBy('period', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPayouts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setPayouts(DEMO_PAYOUTS);
        }
      } catch (err) {
        console.error('Error fetching payouts', err);
        setPayouts(DEMO_PAYOUTS);
      } finally {
        setLoading(false);
      }
    }
    fetchPayouts();
  }, [activeRole]);

  const handleApprove = async (id) => {
    const payout = payouts.find(p => p.id === id);
    if (!payout) return;

    if (payout.amount >= 1000) {
      try {
        await addDoc(collection(db, 'financial_approvals'), {
          type: 'payout_auth',
          status: 'pending',
          data: {
            payoutId: id,
            amount: payout.amount,
            recipientName: payout.doctorName
          },
          requestedBy: activeRole || 'Admin',
          createdAt: new Date().toISOString()
        });
        alert('High-value payout routed to CFO for approval.');
        setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p)));
      } catch (err) {
        console.error('Error queueing approval', err);
      }
    } else {
      setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'processing' } : p)));
    }
  };

  if (activeRole !== 'admin') return null;

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }} noPadding>
      <CardHeader 
        icon={DollarSign}
        title="Practitioner Payouts"
        subtitle="Payout and commission management."
      />
      <CardContent style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            Loading payouts...
          </div>
        ) : payouts.length === 0 ? (
          <EmptyState 
            icon={DollarSign}
            title="No pending payouts"
            description="There are currently no payouts waiting for approval."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
            {payouts.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-app)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                      {p.doctorName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Period: {p.period}
                    </div>
                  </div>
                  <div>
                    <Badge 
                      variant={
                        p.status === 'paid' ? 'success' : 
                        p.status === 'processing' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {p.status === 'paid' ? 'Paid' : p.status === 'processing' ? 'Processing' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  {p.status === 'pending' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleApprove(p.id)}
                    >
                      Approve Payout
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}