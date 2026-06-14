import Users from "lucide-react/dist/esm/icons/users";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';





export default function ManagerOverviewTab() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ clients: 0, pendingOrders: 0, completedOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchStats = async () => {
      try {
        // Count clients (doctors and patients)
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('assignedAccountManagerId', '==', currentUser.uid));
        const usersSnap = await getDocs(qUsers);
        // Count orders
        const ordersRef = collection(db, 'orders');
        const qOrders = query(ordersRef, where('assignedAccountManagerId', '==', currentUser.uid));
        const ordersSnap = await getDocs(qOrders);

        let pending = 0;
        let completed = 0;
        ordersSnap.forEach(doc => {
          const status = doc.data().status;
          if (status === 'pending' || status === 'processing') pending++;
          else if (status === 'completed' || status === 'delivered') completed++;
        });

        setStats({
          clients: usersSnap.size,
          pendingOrders: pending,
          completedOrders: completed
        });
      } catch (e) {
        console.error("Error fetching manager stats", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ backgroundColor: color + '20', padding: '1rem', borderRadius: '50%' }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{loading ? '...' : value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Welcome back, {currentUser?.displayName || 'Manager'}</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Here's an overview of your assigned portfolio.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="My Clients" value={stats.clients} icon={Users} color="var(--color-primary)" />
        <StatCard title="Action Required (Orders)" value={stats.pendingOrders} icon={AlertCircle} color="#f59e0b" />
        <StatCard title="Completed Orders" value={stats.completedOrders} icon={ShoppingBag} color="var(--color-success)" />
        <StatCard title="Performance Score" value="98%" icon={TrendingUp} color="#8b5cf6" />
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Recent Activity</h2>
        {loading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading activity...</div>
        ) : (
          <div style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            No recent alerts. Use the Messages tab to communicate with your clients, or Orders to process pending requests.
          </div>
        )}
      </div>
    </div>
  );
}