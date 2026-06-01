const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ui/PortalLayout.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
content = content.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../../context/AuthContext';\nimport { doc, updateDoc, arrayUnion } from 'firebase/firestore';"
);

// 2. Add useAuth
content = content.replace(
  "const routerNavigate = useNavigate();",
  "const routerNavigate = useNavigate();\n  const { user, userProfile } = useAuth();"
);

// 3. Replace useEffect
const oldEffect = `  // Fetch real-time attention alerts (doctors pending, orders pending, low stock products)
  useEffect(() => {
    if (roleContext !== 'admin') return;

    // 1. Doctors pending verification
    const qDocs = query(collection(db, 'users'), where('role', '==', 'doctor'), where('approved', '==', false));
    const unsubscribeDocs = onSnapshot(qDocs, (snap) => {
      const docsPending = snap.docs.map(doc => ({
        id: doc.id,
        type: 'VERIFICATION',
        title: \`Médico pendiente: \${doc.data().fullName || doc.data().displayName || 'Profesional'}\`,
        description: 'Requiere revisión de credenciales y aprobación de cuenta.',
        severity: 'critical',
        timeLabel: 'Nuevo',
        actionPath: 'doctors'
      }));

      // 2. Orders pending dispatch
      const qOrders = query(collection(db, 'orders'), where('status', '==', 'pending'));
      const unsubscribeOrders = onSnapshot(qOrders, (snapOrders) => {
        const ordersPending = snapOrders.docs.map(doc => ({
          id: doc.id,
          type: 'ORDER',
          title: \`Pedido Pendiente #\${doc.id.slice(0, 6)}\`,
          description: \`Total: $\${doc.data().total || doc.data().amount || 0} - En espera de validación de pago.\`,
          severity: 'warning',
          timeLabel: '24h',
          actionPath: \`orders?orderId=\${doc.id}\`
        }));

        // 3. Low stock products (e.g. less than 10 vials/units)
        const qProducts = query(collection(db, 'products'), where('status', '==', 'active'));
        const unsubscribeProducts = onSnapshot(qProducts, (snapProducts) => {
          const lowStock = [];
          snapProducts.docs.forEach(doc => {
            const data = doc.data();
            const variants = Array.isArray(data.variants) ? data.variants : [];
            variants.forEach((v, index) => {
              const stock = v?.stock ?? v?.quantity ?? 100;
              if (stock <= 10) {
                lowStock.push({
                  id: \`\${doc.id}_\${index}\`,
                  type: 'STOCK',
                  title: \`Stock Bajo: \${data.displayName || data.name}\`,
                  description: \`Quedan solo \${stock} unidades de este producto en inventario.\`,
                  severity: 'critical',
                  timeLabel: 'Urgente',
                  actionPath: 'products'
                });
              }
            });
          });

          // Merge all attention alerts
          setNotifications([...docsPending, ...ordersPending, ...lowStock]);
        });

        return () => unsubscribeProducts();
      });

      return () => unsubscribeOrders();
    });

    return () => {
      unsubscribeDocs();
    };
  }, [roleContext]);`;

const newEffect = `  // Fetch real-time attention alerts (all 10 sources)
  useEffect(() => {
    if (roleContext !== 'admin') return;

    const unsubscribes = [];
    const stateMap = new Map();

    const updateState = (type, items) => {
      stateMap.set(type, items);
      const allItems = Array.from(stateMap.values()).flat();
      setNotifications(allItems);
    };

    // 1. Doctors pending verification
    unsubscribes.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'doctor'), where('approved', '==', false)), (snap) => {
      updateState('VERIFICATION', snap.docs.map(d => ({ id: d.id, type: 'VERIFICATION', title: \`Médico pendiente: \${d.data().fullName || 'Profesional'}\`, description: 'Requiere revisión.', severity: 'critical', actionPath: \`doctors?search=\${encodeURIComponent(d.data().fullName || d.id)}\` })));
    }));

    // 2. Orders pending dispatch
    unsubscribes.push(onSnapshot(query(collection(db, 'orders'), where('status', '==', 'pending')), (snap) => {
      updateState('ORDER', snap.docs.map(d => ({ id: d.id, type: 'ORDER', title: \`Pedido #\${d.id.slice(0, 6)}\`, description: \`Esperando validación.\`, severity: 'warning', actionPath: \`orders?orderId=\${d.id}\` })));
    }));

    // 3. Low stock products
    unsubscribes.push(onSnapshot(query(collection(db, 'products'), where('status', '==', 'active')), (snap) => {
      const lowStock = [];
      snap.docs.forEach(doc => {
        const data = doc.data();
        (Array.isArray(data.variants) ? data.variants : []).forEach((v, index) => {
          if ((v?.stock ?? v?.quantity ?? 100) <= 10) {
            lowStock.push({ id: \`\${doc.id}_\${index}\`, type: 'STOCK', title: \`Stock Bajo: \${data.displayName || data.name}\`, description: \`Quedan \${v?.stock ?? v?.quantity ?? 0} unidades.\`, severity: 'critical', actionPath: \`stock?search=\${encodeURIComponent(data.displayName || data.name || '')}\` });
          }
        });
      });
      updateState('STOCK', lowStock);
    }));

    // 4. Leads new
    unsubscribes.push(onSnapshot(query(collection(db, 'leads'), where('status', '==', 'new')), (snap) => {
      updateState('LEAD', snap.docs.map(d => ({ id: d.id, type: 'LEAD', title: \`Nuevo Lead: \${d.data().name || d.data().email || d.id}\`, description: 'Lead sin contactar.', severity: 'warning', actionPath: \`leads?search=\${d.id}\` })));
    }));

    // 5. Invitations pending
    unsubscribes.push(onSnapshot(query(collection(db, 'invitations'), where('status', '==', 'pending')), (snap) => {
      updateState('INVITE', snap.docs.map(d => ({ id: d.id, type: 'INVITE', title: \`Invitación Pdte: \${d.data().email}\`, description: 'Sin aceptar aún.', severity: 'info', actionPath: \`invitations?search=\${encodeURIComponent(d.data().email || '')}\` })));
    }));

    // 6. Agency RFQs
    unsubscribes.push(onSnapshot(query(collection(db, 'agency_rfqs'), where('status', 'in', ['NEW', 'PENDING_REVIEW'])), (snap) => {
      updateState('RFQ', snap.docs.map(d => ({ id: d.id, type: 'RFQ', title: \`Nuevo RFQ B2B\`, description: \`RFQ de agencia pendiente.\`, severity: 'critical', actionPath: \`agency-deals?rfqId=\${d.id}\` })));
    }));

    // 7. Bulk orders pending
    unsubscribes.push(onSnapshot(query(collection(db, 'bulk_orders'), where('status', '==', 'pending_admin_approval')), (snap) => {
      updateState('BULK', snap.docs.map(d => ({ id: d.id, type: 'BULK', title: \`Pedido B2B: \${d.id.slice(0,6)}\`, description: 'Requiere aprobación.', severity: 'warning', actionPath: \`bulk-orders?search=\${d.id}\` })));
    }));

    // 8. SKU Mappings pending
    unsubscribes.push(onSnapshot(query(collection(db, 'sku_mappings'), where('status', '==', 'pending')), (snap) => {
      updateState('SKU', snap.docs.map(d => ({ id: d.id, type: 'SKU', title: \`SKU Sync: \${d.data().firebase_sku}\`, description: 'Mapeo pendiente.', severity: 'info', actionPath: \`sku-sync?search=\${encodeURIComponent(d.data().firebase_sku || '')}\` })));
    }));

    // 9. Wholesalers pending
    unsubscribes.push(onSnapshot(query(collection(db, 'users'), where('role', '==', 'wholesaler'), where('approved', '==', false)), (snap) => {
      updateState('WHOLESALER', snap.docs.map(d => ({ id: d.id, type: 'WHOLESALER', title: \`Mayorista Pdte: \${d.data().fullName || 'Usuario'}\`, description: 'Requiere aprobación.', severity: 'critical', actionPath: \`wholesellers?search=\${encodeURIComponent(d.data().fullName || d.id)}\` })));
    }));

    // 10. Failed payments
    unsubscribes.push(onSnapshot(query(collection(db, 'orders'), where('status', '==', 'payment_failed')), (snap) => {
      updateState('PAYMENT', snap.docs.map(d => ({ id: d.id, type: 'PAYMENT', title: \`Pago Fallido: #\${d.id.slice(0,6)}\`, description: 'Revisar orden.', severity: 'critical', actionPath: \`orders?orderId=\${d.id}\` })));
    }));

    return () => unsubscribes.forEach(unsub => unsub());
  }, [roleContext]);

  // Derived state: Filter out read notifications and sort
  const readIds = userProfile?.read_notifications || [];
  const visibleNotifications = notifications
    .filter(n => !readIds.includes(n.id))
    .sort((a, b) => {
      const severityScore = { critical: 3, warning: 2, info: 1 };
      return (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
    });

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(id)
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    if (!user || visibleNotifications.length === 0) return;
    try {
      const allIds = visibleNotifications.map(n => n.id);
      await updateDoc(doc(db, 'users', user.uid), {
        read_notifications: arrayUnion(...allIds)
      });
      setNotificationsOpen(false);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };`;

content = content.replace(oldEffect, newEffect);

// 4. Update JSX logic
content = content.replace(
  "notifications.length > 0",
  "visibleNotifications.length > 0"
);
content = content.replace(
  "notifications.length > 0",
  "visibleNotifications.length > 0"
);
content = content.replace(
  "{notifications.length}",
  "{visibleNotifications.length}"
);
content = content.replace(
  "{notifications.length} pending",
  "{visibleNotifications.length} pending"
);
content = content.replace(
  "notifications.length === 0",
  "visibleNotifications.length === 0"
);

// 5. Change the mapped items
const oldMapStart = `notifications.map((n, idx) => (`;
const newMapStart = `visibleNotifications.slice(0, 15).map((n, idx) => (`;
content = content.replace(oldMapStart, newMapStart);

content = content.replace(
  "idx < notifications.length - 1",
  "idx < Math.min(visibleNotifications.length, 15) - 1"
);

// 6. Add "Mark all as read" button
const oldHeader = `<div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Attention Items</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>{visibleNotifications.length} pending</span>
                </div>`;
const newHeader = `<div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Attention Items</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>{visibleNotifications.length} pending</span>
                    {visibleNotifications.length > 0 && (
                      <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Mark all read</button>
                    )}
                  </div>
                </div>`;
content = content.replace(oldHeader, newHeader);

// 7. Add individual "Mark as read" button
const oldItemInner = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: n.severity === 'critical' ? '#ef4444' : '#f59e0b',
                            backgroundColor: n.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {n.type}
                          </span>`;
const newItemInner = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: n.severity === 'critical' ? '#ef4444' : '#f59e0b',
                            backgroundColor: n.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {n.type}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{n.timeLabel || 'Now'}</span>
                            <button onClick={(e) => handleMarkAsRead(n.id, e)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }} title="Dismiss">
                              <X size={12} />
                            </button>
                          </div>`;
content = content.replace(oldItemInner, newItemInner);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated PortalLayout.jsx');
