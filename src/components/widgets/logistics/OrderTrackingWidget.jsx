import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Package, Truck } from 'lucide-react';
import BaseWidget from '../core/BaseWidget';

export default function OrderTrackingWidget(props) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // role determines what to fetch (e.g., 'admin' fetches all, 'patient' fetches their own, 'doctor' fetches clinic's)
  const { role = 'admin', userId } = props;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // In a real scenario, we'd add `where('userId', '==', userId)` for patients
        const q = query(
          collection(db, 'supplier_shipments'), 
          orderBy('createdAt', 'desc'), 
          limit(5)
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [role, userId]);

  return (
    <BaseWidget 
      title={role === 'patient' ? "Mis Pedidos" : "Rastreo de Logística"} 
      icon={Truck} 
      {...props}
    >
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Package className="w-8 h-8 mb-2 opacity-50" />
          <p>No hay pedidos recientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
              <div>
                <p className="text-white font-medium text-sm">
                  {order.supplierName || 'Pedido #'+order.id.slice(0, 6)}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {order.trackingNumber ? `Guía: ${order.trackingNumber}` : 'Sin guía asignada'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {order.status || 'PENDIENTE'}
              </span>
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
}
