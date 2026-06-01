import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card } from '../ui';
import { PackageSearch, FileCheck, Truck, Clock, CheckCircle } from 'lucide-react';

export default function AdminLogisticsTab() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async (loadMore = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'agency_rfqs'), 
        where('status', 'in', ['RECONCILED', 'SHIPPED', 'DELIVERED']),
        limit(5)
      );

      if (loadMore && lastVisible) {
        q = query(
          collection(db, 'agency_rfqs'), 
          where('status', 'in', ['RECONCILED', 'SHIPPED', 'DELIVERED']),
          startAfter(lastVisible),
          limit(5)
        );
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (loadMore) {
        setShipments(prev => {
          const updated = [...prev, ...data];
          window.dispatchEvent(new CustomEvent('admin-context-update', {
            detail: {
              page: 'logistics',
              shipmentCount: updated.length,
              shipments: updated.slice(0, 10).map(s => ({
                id: s.id,
                status: s.status,
                clientName: s.clientName || s.supplierName || 'Unknown',
                createdAt: s.createdAt,
                items: s.items?.length || 0
              })),
              summary: `Logistics tracker: ${updated.length} shipments loaded. Statuses: ${[...new Set(updated.map(s => s.status))].join(', ')}.`
            }
          }));
          return updated;
        });
      } else {
        setShipments(data);
        window.dispatchEvent(new CustomEvent('admin-context-update', {
          detail: {
            page: 'logistics',
            shipmentCount: data.length,
            shipments: data.slice(0, 10).map(s => ({
              id: s.id,
              status: s.status,
              clientName: s.clientName || s.supplierName || 'Unknown',
              createdAt: s.createdAt,
              items: s.items?.length || 0
            })),
            summary: `Logistics tracker: ${data.length} shipments loaded. Statuses: ${[...new Set(data.map(s => s.status))].join(', ')}.`
          }
        }));
      }

      if (snap.docs.length > 0) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }
      setHasMore(snap.docs.length === 5);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const markAsDelivered = async (id) => {
    try {
      await updateDoc(doc(db, 'agency_rfqs', id), {
        status: 'DELIVERED',
        deliveredAt: new Date()
      });
      loadShipments();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && shipments.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading shipments...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
          <Truck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Logistics & Tracking</h1>
          <p className="text-gray-400">Track shipments, verify COAs, and map SKUs.</p>
        </div>
      </div>

      {shipments.length === 0 ? (
        <Card className="p-12 text-center text-gray-400 border-dashed border-gray-800 bg-transparent">
          <PackageSearch size={48} className="mx-auto mb-4 opacity-20" />
          <p>No active shipments to track.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {shipments.map(shipment => (
            <Card key={shipment.id} className="p-6 bg-gray-900 border-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Shipment #{shipment.id.slice(0, 8).toUpperCase()}
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      shipment.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                      shipment.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {shipment.status}
                    </span>
                  </h3>
                  <div className="text-sm text-gray-400 mt-1 flex gap-4">
                    <span><strong>Carrier:</strong> {shipment.shippingData?.carrier || 'Pending'}</span>
                    <span><strong>AWB:</strong> {shipment.shippingData?.awb || 'Pending'}</span>
                    <span><strong>ETA:</strong> {shipment.shippingData?.eta || 'Pending'}</span>
                  </div>
                </div>
                {shipment.status === 'SHIPPED' && (
                  <button 
                    onClick={() => markAsDelivered(shipment.id)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    <CheckCircle size={16} /> Mark Delivered
                  </button>
                )}
              </div>

              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Qty</th>
                    <th className="pb-3 font-semibold">Internal SKU</th>
                    <th className="pb-3 font-semibold">COA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {shipment.items?.map((item, idx) => (
                    <tr key={idx} className="text-gray-300">
                      <td className="py-3 font-medium text-white">{item.clientItemName || item.supplierItemName}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">
                        <input 
                          type="text" 
                          placeholder="Map SKU..." 
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-32 focus:border-blue-500 outline-none text-white"
                          defaultValue={item.mappedSku || ''}
                          readOnly
                        />
                      </td>
                      <td className="py-3">
                        {item.coaUrl ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                            <FileCheck size={14} /> Uploaded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-400 text-xs font-bold">
                            <Clock size={14} /> Pending Supplier
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => loadShipments(true)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Shipments'}
          </button>
        </div>
      )}
    </div>
  );
}
