import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fb from '../firebase';
const db = fb?.db;

export default function useAdminNotifications(roleContext) {
  return useQuery({
    queryKey: ['admin-notifications', roleContext],
    queryFn: async () => {
      if (!db) return [];
      const promises = [];

      // ── DOCTOR ROLE NOTIFICATIONS ─────────────────────────────────────────
      if (roleContext === 'doctor') {
        // Pending prescriptions requiring doctor signature/review
        promises.push(
          getDocs(query(collection(db, 'prescriptions'), where('status', 'in', ['pending', 'draft']), limit(10)))
            .then(snap => snap.docs.map(d => ({
              id: d.id,
              type: 'PRESCRIPTION',
              title: `Prescription Awaiting Review: #${d.id.slice(0, 6)}`,
              description: `Patient: ${d.data().patient?.name || d.data().patientName || 'Patient'}. Sign-off required.`,
              severity: 'warning',
              timeLabel: 'Pending',
              actionPath: 'prescriptions'
            })))
            .catch(() => [])
        );

        // Lab results or follow-ups
        promises.push(
          getDocs(query(collection(db, 'leads'), where('status', '==', 'new'), limit(5)))
            .then(snap => snap.docs.map(d => ({
              id: d.id,
              type: 'CONSULTATION',
              title: `New Intake: ${d.data().name || d.data().fullName || 'New Patient'}`,
              description: 'Patient consultation intake submitted.',
              severity: 'info',
              timeLabel: 'Today',
              actionPath: 'patients'
            })))
            .catch(() => [])
        );

        const results = await Promise.all(promises);
        return results.flat();
      }

      // ── PATIENT ROLE NOTIFICATIONS ────────────────────────────────────────
      if (roleContext === 'patient') {
        promises.push(
          getDocs(query(collection(db, 'orders'), where('status', 'in', ['processing', 'shipped', 'en tránsito']), limit(5)))
            .then(snap => snap.docs.map(d => ({
              id: d.id,
              type: 'ORDER',
              title: `Order Shipment #${d.id.slice(0, 6)}`,
              description: `Status: ${d.data().status}. Tracking updated.`,
              severity: 'info',
              timeLabel: 'Active',
              actionPath: 'orders'
            })))
            .catch(() => [])
        );

        const results = await Promise.all(promises);
        return results.flat();
      }

      // ── WHOLESALER & SUPPLIER ROLE NOTIFICATIONS ──────────────────────────
      if (roleContext === 'wholesaler' || roleContext === 'supplier') {
        promises.push(
          getDocs(query(collection(db, 'agency_rfqs'), where('status', 'in', ['NEW', 'PENDING_REVIEW']), limit(10)))
            .then(snap => snap.docs.map(d => ({
              id: d.id,
              type: 'RFQ',
              title: `New B2B RFQ Inquiry: #${d.id.slice(0, 6)}`,
              description: 'Commercial quotation request awaiting review.',
              severity: 'critical',
              timeLabel: 'Action Required',
              actionPath: 'orders'
            })))
            .catch(() => [])
        );

        promises.push(
          getDocs(query(collection(db, 'bulk_orders'), where('status', '==', 'pending_admin_approval'), limit(5)))
            .then(snap => snap.docs.map(d => ({
              id: d.id,
              type: 'BULK',
              title: `Bulk Order Awaiting Approval: #${d.id.slice(0, 6)}`,
              description: 'Volume discount order pending verification.',
              severity: 'warning',
              timeLabel: 'Review',
              actionPath: 'orders'
            })))
            .catch(() => [])
        );

        const results = await Promise.all(promises);
        return results.flat();
      }

      // ── ADMIN ROLE NOTIFICATIONS (Default) ────────────────────────────────
      // 1. Doctors pending verification
      promises.push(
        getDocs(query(collection(db, 'users'), where('role', '==', 'doctor'), where('approved', '==', false), limit(15)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'VERIFICATION', 
            title: `Doctor Verification Required: ${d.data().fullName || 'Medical Professional'}`, 
            description: 'Medical license credentials require review.', 
            severity: 'critical', 
            timeLabel: 'Pending',
            actionPath: `doctors?search=${encodeURIComponent(d.data().fullName || d.id)}` 
          })))
          .catch(() => [])
      );

      // 2. Orders pending dispatch
      promises.push(
        getDocs(query(collection(db, 'orders'), where('status', '==', 'pending'), limit(15)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'ORDER', 
            title: `Order Awaiting Dispatch: #${d.id.slice(0, 6)}`, 
            description: 'Order paid, awaiting fulfillment and tracking ID.', 
            severity: 'warning', 
            timeLabel: 'Pending',
            actionPath: `orders?orderId=${d.id}` 
          })))
          .catch(() => [])
      );

      // 3. Low stock products
      promises.push(
        getDocs(query(collection(db, 'products'), where('status', '==', 'active'), limit(25)))
          .then(snap => {
            const lowStock = [];
            snap.docs.forEach(doc => {
              const data = doc.data();
              (Array.isArray(data.variants) ? data.variants : []).forEach((v, index) => {
                if ((v?.stock ?? v?.quantity ?? 100) <= 10) {
                  lowStock.push({ 
                    id: `${doc.id}_${index}`, type: 'STOCK', 
                    title: `Low Stock Alert: ${data.displayName || data.name}`, 
                    description: `Only ${v?.stock ?? v?.quantity ?? 0} units remaining in inventory.`, 
                    severity: 'critical', 
                    timeLabel: 'Low Stock',
                    actionPath: `catalog?search=${encodeURIComponent(data.displayName || data.name || '')}` 
                  });
                }
              });
            });
            return lowStock.slice(0, 5);
          })
          .catch(() => [])
      );

      // 4. Leads new
      promises.push(
        getDocs(query(collection(db, 'leads'), where('status', '==', 'new'), limit(10)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'LEAD', 
            title: `New Inbound Lead: ${d.data().name || d.data().email || d.id}`, 
            description: 'Inbound patient or clinic lead awaiting initial contact.', 
            severity: 'warning', 
            timeLabel: 'New',
            actionPath: `leads?search=${d.id}` 
          })))
          .catch(() => [])
      );

      // 5. Invitations pending
      promises.push(
        getDocs(query(collection(db, 'invitations'), where('status', '==', 'pending'), limit(10)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'INVITE', 
            title: `Pending Invitation: ${d.data().email}`, 
            description: 'User invitation unaccepted after 48 hours.', 
            severity: 'info', 
            timeLabel: 'Sent',
            actionPath: `invitations?search=${encodeURIComponent(d.data().email || '')}` 
          })))
          .catch(() => [])
      );

      // 6. Agency RFQs
      promises.push(
        getDocs(query(collection(db, 'agency_rfqs'), where('status', 'in', ['NEW', 'PENDING_REVIEW']), limit(10)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'RFQ', 
            title: `New B2B Agency RFQ: #${d.id.slice(0, 6)}`, 
            description: 'High-volume wholesale RFQ awaiting review.', 
            severity: 'critical', 
            timeLabel: 'RFQ',
            actionPath: `agency-deals?rfqId=${d.id}` 
          })))
          .catch(() => [])
      );

      // 7. Bulk orders pending
      promises.push(
        getDocs(query(collection(db, 'bulk_orders'), where('status', '==', 'pending_admin_approval'), limit(10)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'BULK', 
            title: `Bulk Order Awaiting Approval: #${d.id.slice(0, 6)}`, 
            description: 'Volume discount requires administrative sign-off.', 
            severity: 'warning', 
            timeLabel: 'Review',
            actionPath: `bulk-orders?search=${d.id}` 
          })))
          .catch(() => [])
      );

      // 8. Wholesalers pending approval
      promises.push(
        getDocs(query(collection(db, 'users'), where('role', '==', 'wholesaler'), where('approved', '==', false), limit(10)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'WHOLESALER', 
            title: `Wholesaler Verification: ${d.data().fullName || 'Partner'}`, 
            description: 'B2B reseller credentials require administrative approval.', 
            severity: 'critical', 
            timeLabel: 'Pending',
            actionPath: `wholesellers?search=${encodeURIComponent(d.data().fullName || d.id)}` 
          })))
          .catch(() => [])
      );

      // 9. Failed payments
      promises.push(
        getDocs(query(collection(db, 'orders'), where('status', '==', 'payment_failed'), limit(10)))
          .then(snap => snap.docs.map(d => ({ 
            id: d.id, type: 'PAYMENT', 
            title: `Payment Failed: #${d.id.slice(0, 6)}`, 
            description: 'Card declined or payment intent cancelled.', 
            severity: 'critical', 
            timeLabel: 'Failed',
            actionPath: `orders?orderId=${d.id}` 
          })))
          .catch(() => [])
      );

      // Resolve all and flatten
      const resultsArray = await Promise.all(promises);
      return resultsArray.flat();
    },
    // Refetch every 60 seconds (polling) instead of keeping websockets open
    refetchInterval: 60000, 
    staleTime: 30000,
  });
}
