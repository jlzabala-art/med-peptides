const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount-target.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  // 1. Create client
  const clientRef = await db.collection('users').add({
    name: 'CEI El Atelier',
    email: 'teresa@cei-el-atelier.es', // placeholder
    phone: '+34 695 262 424',
    role: 'clinic',
    status: 'active',
    address: 'Calle Félix Esteban Guerrero 8, Bajo',
    city: 'Murcia',
    country: 'Spain',
    zipCode: '30007',
    contactPerson: 'Teresa',
    deliveryHours: 'Monday to Friday, 07:30–15:00',
    deliveryNotes: 'Please ask the courier to contact Teresa before delivery if any assistance or confirmation is required.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'corporate'
  });
  console.log('Created Client:', clientRef.id);

  // 2. Create order from client
  const orderRef = await db.collection('orders').add({
    userId: clientRef.id,
    customerName: 'CEI El Atelier',
    status: 'pending',
    paymentStatus: 'pending',
    type: 'b2b',
    items: [
      {
        productId: 'retatrutide',
        name: 'Retatrutide 10 mg (kit of 10 vials)',
        quantity: 1,
        price: 580,
        total: 580
      },
      {
        productId: 'bacteriostatic-water',
        name: 'Bacteriostatic Water (kit of 10 vials)',
        quantity: 1,
        price: 30,
        total: 30
      }
    ],
    shippingFee: 70,
    subtotal: 610,
    total: 680,
    currency: 'USD',
    shippingAddress: {
      address: 'Calle Félix Esteban Guerrero 8, Bajo',
      city: 'Murcia',
      country: 'Spain',
      zipCode: '30007',
      contactName: 'Teresa',
      phone: '+34 695 262 424',
      instructions: 'Monday to Friday, 07:30–15:00. Please ask the courier to contact Teresa before delivery if any assistance or confirmation is required.'
    },
    notes: 'We will proceed with the payment this Friday.',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('Created Order:', orderRef.id);

  // 3. Create purchase order to Lotusland
  const poRef = await db.collection('purchase_orders').add({
    supplierId: 'OLlBbQjgrj6tY7GmM2Jo', // Lotusland Limited
    supplierName: 'Lotusland Limited',
    status: 'open',
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    items: [
      {
        productId: 'retatrutide',
        itemName: 'Retatrutide 10 mg (kit of 10 vials)',
        quantity: 1,
        unit: 'box',
        unitPrice: 0 // to be filled later or we can put an estimated cost
      },
      {
        productId: 'bacteriostatic-water',
        itemName: 'Bacteriostatic Water (kit of 10 vials)',
        quantity: 1,
        unit: 'box',
        unitPrice: 0
      }
    ],
    linkedOrderId: orderRef.id,
    deliveryAddress: {
      name: 'CEI El Atelier (c/o Teresa)',
      address: 'Calle Félix Esteban Guerrero 8, Bajo',
      city: 'Murcia',
      country: 'Spain',
      zipCode: '30007',
      phone: '+34 695 262 424'
    },
    notes: 'Direct delivery to client in Spain.',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('Created Purchase Order:', poRef.id);
}

run().catch(console.error).finally(() => process.exit(0));
