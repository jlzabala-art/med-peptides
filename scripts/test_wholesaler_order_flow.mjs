import { adminDb } from '../src/lib/firebaseAdmin.js';

async function testOrderFlow() {
  const catalogSnap = await adminDb.collection('shared_catalog_links').doc('CAT-NPLABS-LOTUS-20').get();
  if (!catalogSnap.exists) {
    throw new Error('Catalog not found');
  }
  const catalogData = catalogSnap.data();

  const now = new Date();
  const orderCode = `PO-DRAFT-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderDocData = {
    orderId: orderCode,
    code: orderCode,
    status: 'draft',
    source: 'shared_catalog',
    catalogId: catalogData.catalogId,
    catalogCode: catalogData.batchCode,
    catalogTitle: catalogData.title,
    wholesalerId: 'np-labs-international',
    wholesalerEmail: 'nikpsathas@gmail.com',
    wholesalerName: 'Nikolaos Psathas (NP Labs)',
    customerName: 'NP Labs Client Clinic (Athens)',
    customerEmail: 'clinic@nplabs.online',
    customerPhone: '+30 694 444 5512',
    customerAddress: 'Vasilissis Sofias 102, Athens 11528, Greece',
    deliveryAddress: 'Vasilissis Sofias 102, Athens 11528, Greece',
    customerVat: 'EL998877665',
    customerNotes: 'Wholesale order for specialized compounded peptide protocols.',
    items: [
      {
        id: 'bpc-157-10mg-vial',
        name: 'BPC-157 10mg Lyophilized Sterile Vial',
        dosage: '10mg',
        presentation: 'vial',
        quantity: 20,
        unitPrice: 36.00, // Base wholesale 30 + 20% margin = 36.00 EUR
        lineTotal: 720.00
      },
      {
        id: 'tb-500-10mg-vial',
        name: 'TB-500 10mg Lyophilized Sterile Vial',
        dosage: '10mg',
        presentation: 'vial',
        quantity: 10,
        unitPrice: 42.00, // Base wholesale 35 + 20% margin = 42.00 EUR
        lineTotal: 420.00
      }
    ],
    totalUnits: 30,
    subtotal: 1140.00,
    shippingCost: 50.00,
    shippingDestination: 'European Union (Express DHL/FedEx Pharma Cold-Chain)',
    shippingCode: 'EU',
    grandTotal: 1190.00,
    total: 1190.00,
    currency: 'EUR',
    currencySymbol: '€',
    priceMarkupPercent: 20,
    requiresAcknowledgment: true,
    acknowledged: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const orderRef = await adminDb.collection('orders').add(orderDocData);
  console.log(`Created test order ${orderCode} in orders/${orderRef.id}`);

  // Create notifications
  const notifAdmin = {
    title: `🚨 New B2B Order: ${orderCode}`,
    message: `Wholesaler NP Labs (Nikolaos Psathas) submitted a B2B order of 30 units (€1,190.00).`,
    type: 'order_draft',
    severity: 'critical',
    orderId: orderRef.id,
    orderCode,
    targetRoles: ['admin', 'account_manager'],
    read: false,
    link: `/admin?tab=orders&orderId=${orderRef.id}`,
    createdAt: now.toISOString()
  };

  const notifWholesaler = {
    title: `📦 Order Confirmation: ${orderCode}`,
    message: `Your wholesale order of 30 units (€1,190.00) has been received by Atlas Health fulfillment desk.`,
    type: 'order_confirmed',
    severity: 'info',
    orderId: orderRef.id,
    orderCode,
    targetRoles: ['wholesaler'],
    targetUserEmail: 'nikpsathas@gmail.com',
    targetUserId: 'nikolaos-psathas',
    read: false,
    link: `/wholesaler/orders?orderId=${orderRef.id}`,
    createdAt: now.toISOString()
  };

  await adminDb.collection('notifications').add(notifAdmin);
  await adminDb.collection('notifications').add(notifWholesaler);
  console.log('Created notifications for both Admin and Nikolaos Psathas (Wholesaler).');

  // Update catalog interaction
  await adminDb.collection('shared_catalog_links').doc('CAT-NPLABS-LOTUS-20').update({
    'interactions.orderPlaced': true,
    'interactions.lastInteractionAt': now.toISOString(),
    status: 'converted'
  });
  console.log('Updated catalog link status to converted.');

  process.exit(0);
}

testOrderFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
