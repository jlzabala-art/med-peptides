import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { generateCanonicalId } from '../../../../lib/canonicalId';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product') || '';
    
    if (!product) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const canonicalId = generateCanonicalId(product);

    // Fetch from product_usage materialized view
    const usageDoc = await adminDb.collection('product_usage').doc(canonicalId).get();
    
    let protocolIds = [];
    let prescriptionIds = [];

    if (usageDoc.exists) {
      const usageData = usageDoc.data();
      protocolIds = usageData.protocols || [];
      prescriptionIds = usageData.prescriptions || [];
    }
    
    // Fetch specific protocol documents by ID
    const protocols = [];
    if (protocolIds.length > 0) {
      const protocolRefs = protocolIds.map(id => adminDb.collection('protocols').doc(id));
      const pSnaps = await adminDb.getAll(...protocolRefs);
      pSnaps.forEach(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data.status && ['archived', 'draft', 'inactive'].includes(data.status)) return;
          protocols.push({
            id: doc.id,
            name: data.protocol_name || data.protocol_title || data.name || null,
            primary_goal: data.primary_goal || data.goal || null,
            ...data
          });
        }
      });
    }

    // Fetch specific prescription documents by ID
    const prescriptions = [];
    if (prescriptionIds.length > 0) {
      const prescriptionRefs = prescriptionIds.map(id => adminDb.collection('prescriptions').doc(id));
      const pSnaps = await adminDb.getAll(...prescriptionRefs);
      pSnaps.forEach(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data.status && ['archived', 'draft', 'cancelled'].includes(data.status)) return;
          prescriptions.push({
            id: doc.id,
            patientName: data.patientName || data.patient_name || data.patient || null,
            doctorName: data.doctorName || data.doctor || null,
            status: data.status || 'active',
            createdAt: data.createdAt || data.date || null,
            ...data
          });
        }
      });
    }

    // Fetch recent customer/clinic orders matching product
    const orders = [];
    try {
      const ordersSnap = await adminDb.collection('orders').limit(50).get();
      ordersSnap.forEach(doc => {
        const data = doc.data();
        const items = data.items || data.line_items || [];
        const isMatch = items.some(item => {
          const itemName = (item.name || item.product_name || item.title || '').toLowerCase();
          return itemName.includes(product.toLowerCase()) || itemName.includes(canonicalId);
        });

        if (isMatch) {
          orders.push({
            id: doc.id,
            orderNumber: data.orderNumber || data.number || doc.id,
            customerName: data.customerName || data.customer?.name || data.clinicName || 'Clinic Partner',
            totalAmount: data.total || data.totalAmount || data.price || 0,
            status: data.status || 'processing',
            createdAt: data.createdAt || data.date || null
          });
        }
      });
    } catch (e) {
      console.warn('Orders lookup note:', e.message);
    }

    return NextResponse.json({
      protocols,
      prescriptions,
      orders,
      protocolCount: protocols.length,
      prescriptionCount: prescriptions.length,
      orderCount: orders.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
    
  } catch (error) {
    console.error('API /catalog/product-usage error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
