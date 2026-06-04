import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function useAdminNotifications(roleContext) {
  return useQuery({
    queryKey: ['admin-notifications', roleContext],
    queryFn: async () => {
      if (roleContext !== 'admin') return [];

      const promises = [];
      
      // 1. Doctors pending verification
      promises.push(
        getDocs(query(collection(db, 'users'), where('role', '==', 'doctor'), where('approved', '==', false)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'VERIFICATION', 
            title: `Médico pendiente: ${d.data().fullName || 'Profesional'}`, 
            description: 'Requiere revisión.', 
            severity: 'critical', 
            actionPath: `doctors?search=${encodeURIComponent(d.data().fullName || d.id)}` 
          })))
      );

      // 2. Orders pending dispatch
      promises.push(
        getDocs(query(collection(db, 'orders'), where('status', '==', 'pending')))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'ORDER', 
            title: `Pedido #${d.id.slice(0, 6)}`, 
            description: `Esperando validación.`, 
            severity: 'warning', 
            actionPath: `orders?orderId=${d.id}` 
          })))
      );

      // 3. Low stock products
      promises.push(
        getDocs(query(collection(db, 'products'), where('status', '==', 'active')))
          .then(snap => {
            const lowStock = [];
            snap.docs.forEach(doc => {
              const data = doc.data();
              (Array.isArray(data.variants) ? data.variants : []).forEach((v, index) => {
                if ((v?.stock ?? v?.quantity ?? 100) <= 10) {
                  lowStock.push({ 
                    id: `${doc.id}_${index}`, type: 'STOCK', 
                    title: `Stock Bajo: ${data.displayName || data.name}`, 
                    description: `Quedan ${v?.stock ?? v?.quantity ?? 0} unidades.`, 
                    severity: 'critical', 
                    actionPath: `stock?search=${encodeURIComponent(data.displayName || data.name || '')}` 
                  });
                }
              });
            });
            return lowStock;
          })
      );

      // 4. Leads new
      promises.push(
        getDocs(query(collection(db, 'leads'), where('status', '==', 'new')))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'LEAD', 
            title: `Nuevo Lead: ${d.data().name || d.data().email || d.id}`, 
            description: 'Lead sin contactar.', 
            severity: 'warning', 
            actionPath: `leads?search=${d.id}` 
          })))
      );

      // 5. Invitations pending
      promises.push(
        getDocs(query(collection(db, 'invitations'), where('status', '==', 'pending')))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'INVITE', 
            title: `Invitación Pdte: ${d.data().email}`, 
            description: 'Sin aceptar aún.', 
            severity: 'info', 
            actionPath: `invitations?search=${encodeURIComponent(d.data().email || '')}` 
          })))
      );

      // 6. Agency RFQs
      promises.push(
        getDocs(query(collection(db, 'agency_rfqs'), where('status', 'in', ['NEW', 'PENDING_REVIEW'])))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'RFQ', 
            title: `Nuevo RFQ B2B`, 
            description: `RFQ de agencia pendiente.`, 
            severity: 'critical', 
            actionPath: `agency-deals?rfqId=${d.id}` 
          })))
      );

      // 7. Bulk orders pending
      promises.push(
        getDocs(query(collection(db, 'bulk_orders'), where('status', '==', 'pending_admin_approval')))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'BULK', 
            title: `Pedido B2B: ${d.id.slice(0,6)}`, 
            description: 'Requiere aprobación.', 
            severity: 'warning', 
            actionPath: `bulk-orders?search=${d.id}` 
          })))
      );

      // 8. SKU Mappings pending
      promises.push(
        getDocs(query(collection(db, 'sku_mappings'), where('status', '==', 'pending')))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'SKU', 
            title: `SKU Sync: ${d.data().firebase_sku}`, 
            description: 'Mapeo pendiente.', 
            severity: 'info', 
            actionPath: `sku-sync?search=${encodeURIComponent(d.data().firebase_sku || '')}` 
          })))
      );

      // 9. Wholesalers pending
      promises.push(
        getDocs(query(collection(db, 'users'), where('role', '==', 'wholesaler'), where('approved', '==', false)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'WHOLESALER', 
            title: `Mayorista Pdte: ${d.data().fullName || 'Usuario'}`, 
            description: 'Requiere aprobación.', 
            severity: 'critical', 
            actionPath: `wholesellers?search=${encodeURIComponent(d.data().fullName || d.id)}` 
          })))
      );

      // 10. Failed payments
      promises.push(
        getDocs(query(collection(db, 'orders'), where('status', '==', 'payment_failed')))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'PAYMENT', 
            title: `Failed Payment: #${d.id.slice(0,6)}`, 
            description: 'Review order details.', 
            severity: 'critical', 
            actionPath: `orders?orderId=${d.id}` 
          })))
      );

      // 11. High Value Orders (>= 1000)
      promises.push(
        getDocs(query(collection(db, 'orders'), where('status', '==', 'pending'), where('total', '>=', 1000)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'HIGH_VALUE', 
            title: `High Value Order: #${d.id.slice(0,6)}`, 
            description: `Total: $${d.data().total}. Requires attention.`, 
            severity: 'critical', 
            actionPath: `orders?orderId=${d.id}` 
          })))
      );

      // Resolve all and flatten
      const resultsArray = await Promise.all(promises);
      return resultsArray.flat();
    },
    // Refetch every 60 seconds (polling) instead of keeping 11 websockets open
    refetchInterval: 60000, 
    staleTime: 30000,
  });
}
