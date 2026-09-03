import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { generateCanonicalId } from '@/lib/canonicalId';

export async function POST(request) {
  try {
    console.log('🚀 [Server API] Starting product usage auto-sync...');

    const productsSnap = await adminDb.collection('products').get();
    const usageMap = new Map();

    productsSnap.forEach(doc => {
      const data = doc.data();
      const cId = generateCanonicalId(data.canonicalName || data.name || doc.id);
      if (cId) {
        usageMap.set(cId, {
          productId: doc.id,
          canonicalName: data.canonicalName || data.name || doc.id,
          protocols: new Set(),
          prescriptions: new Set(),
          orders: new Set()
        });
      }
    });

    // 1. Scan Protocols
    const protocolsSnap = await adminDb.collection('protocols').get();
    protocolsSnap.forEach(pDoc => {
      const pData = pDoc.data();
      if (pData.status && ['archived', 'draft', 'inactive'].includes(pData.status)) return;

      const protocolId = pDoc.id;
      const items = [];
      if (Array.isArray(pData.phases)) {
        pData.phases.forEach(ph => {
          if (Array.isArray(ph.items)) items.push(...ph.items);
        });
      }
      if (Array.isArray(pData.phase_blueprints)) {
        pData.phase_blueprints.forEach(pb => {
          const drugs = pb.drugs || pb.drugs_used || pb.items || [];
          if (Array.isArray(drugs)) items.push(...drugs);
        });
      }
      if (Array.isArray(pData.peptides)) items.push(...pData.peptides);
      if (Array.isArray(pData.peptideIds)) items.push(...pData.peptideIds);

      items.forEach(item => {
        const name = typeof item === 'string' ? item : (item.productName || item.name || item.productId || '');
        const cId = generateCanonicalId(name);
        if (cId && usageMap.has(cId)) {
          usageMap.get(cId).protocols.add(protocolId);
        }
      });
    });

    // 2. Scan Prescriptions
    const rxSnap = await adminDb.collection('prescriptions').get();
    rxSnap.forEach(rxDoc => {
      const rxData = rxDoc.data();
      if (rxData.status && ['archived', 'draft', 'cancelled'].includes(rxData.status)) return;

      const rxId = rxDoc.id;
      const items = Array.isArray(rxData.items) ? rxData.items : (Array.isArray(rxData.products) ? rxData.products : []);

      items.forEach(item => {
        const name = typeof item === 'string' ? item : (item.productName || item.name || item.productId || '');
        const cId = generateCanonicalId(name);
        if (cId && usageMap.has(cId)) {
          usageMap.get(cId).prescriptions.add(rxId);
        }
      });
    });

    // 3. Scan Orders
    const ordersSnap = await adminDb.collection('orders').get();
    ordersSnap.forEach(orderDoc => {
      const oData = orderDoc.data();
      const orderId = orderDoc.id;
      const items = Array.isArray(oData.items) ? oData.items : (Array.isArray(oData.line_items) ? oData.line_items : []);

      items.forEach(item => {
        const name = typeof item === 'string' ? item : (item.name || item.product_name || item.title || '');
        const cId = generateCanonicalId(name);
        if (cId && usageMap.has(cId)) {
          usageMap.get(cId).orders.add(orderId);
        }
      });
    });

    // 4. Batch commit
    let updatedCount = 0;
    const batch = adminDb.batch();

    for (const [canonicalId, record] of usageMap.entries()) {
      const protocolList = Array.from(record.protocols);
      const rxList = Array.from(record.prescriptions);
      const orderList = Array.from(record.orders);

      const usageRef = adminDb.collection('product_usage').doc(canonicalId);
      batch.set(usageRef, {
        canonicalId,
        productId: record.productId,
        canonicalName: record.canonicalName,
        protocols: protocolList,
        prescriptions: rxList,
        orders: orderList,
        protocolCount: protocolList.length,
        prescriptionCount: rxList.length,
        orderCount: orderList.length,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const productRef = adminDb.collection('products').doc(record.productId);
      batch.update(productRef, {
        protocolCount: protocolList.length,
        prescriptionCount: rxList.length,
        orderCount: orderList.length
      });

      updatedCount++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${updatedCount} products with protocols, prescriptions & orders`,
      syncedCount: updatedCount
    });

  } catch (error) {
    console.error('Server sync-product-usage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
