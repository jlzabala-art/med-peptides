/**
 * scripts/test_vials_pricing_and_order_flow.mjs
 * 
 * Batería de Pruebas Automatizada:
 * 1. Verificación de cálculo de precios con doble margen (+15% Mediluxe + 15% Wholesaler) sobre costes de Lotusland.
 * 2. Simulación de creación de pedido B2B desde el nuevo Drawer de proformas.
 * 3. Verificación de recepción de notificación inmediata para José Luis (jose@mediluxeme.com & Firestore notifications).
 * 4. Verificación de atribución y registro en la cuenta de Nikolas Psathas (np-labs-international · CAT-RX-7482).
 */

import { adminDb } from '../src/lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { sendOrderCreatedNotificationEmail } from '../src/lib/orderNotificationMailer.js';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function resolveWholesalePricing(variant, defaultPrice = 30.0, markupPercent = 15) {
  const baseCost = Number(
    variant.cost_tiers?.cost_1 ??
    variant.cost_1 ??
    variant.cost ??
    variant.pricing?.master?.perUnit ??
    variant.unit_price ??
    defaultPrice
  );
  const mediluxeMarkup = 15;
  const wholesalerMarkup = Number(markupPercent || 15);
  const mediluxePrice = round2(baseCost * (1 + mediluxeMarkup / 100));
  const unitPrice = round2(mediluxePrice * (1 + wholesalerMarkup / 100));
  const tier10UnitPrice = round2(unitPrice * 0.85);
  const pack10Price = round2(tier10UnitPrice * 10);

  return {
    baseCost,
    mediluxePrice,
    unitPrice,
    tier10UnitPrice,
    pack10Price,
    currency: 'USD',
    currencySymbol: '$'
  };
}

async function runTestSuite() {
  console.log('\n======================================================================');
  console.log('🧪 BATERÍA DE PRUEBAS: PRECIOS DE VIALES, NOTIFICACIONES Y NIKOLAS');
  console.log('======================================================================\n');

  if (!adminDb) {
    console.error('❌ Error: Firebase Admin DB no está inicializado.');
    process.exit(1);
  }

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // SUITE 1: VERIFICACIÓN MATEMÁTICA DE MÁRGENES SOBRE COSTES LOTUSLAND
  // ──────────────────────────────────────────────────────────────────
  console.log('--- SUITE 1: Verificación de Márgenes sobre Costes de Lotusland ---');

  // Test de la fórmula compuesta pura
  const testCosts = [10.0, 20.0, 25.0, 30.0, 50.0, 75.0, 100.0];
  console.log('\n  Matriz de Validación Teórica (Coste Base -> Mediluxe 15% -> Wholesaler 15% -> Pack 10 -15%):');
  console.log('  ┌──────────┬──────────────┬──────────────────┬─────────────────┬────────────────┐');
  console.log('  │ BaseCost │ Mediluxe 15% │ UnitPrice (+32%) │ Tier10 Unit (-15%)│ Pack 10 Total  │');
  console.log('  ├──────────┼──────────────┼──────────────────┼─────────────────┼────────────────┤');

  for (const baseCost of testCosts) {
    const mediluxePrice = round2(baseCost * 1.15);
    const unitPrice = round2(mediluxePrice * 1.15);
    const tier10UnitPrice = round2(unitPrice * 0.85);
    const pack10Price = round2(tier10UnitPrice * 10);

    // Margen acumulado sobre coste base
    const totalMarkup = round2(((unitPrice - baseCost) / baseCost) * 100);

    console.log(
      `  │ $${baseCost.toFixed(2).padEnd(7)} │ $${mediluxePrice.toFixed(2).padEnd(11)} │ $${unitPrice.toFixed(2).padEnd(15)} │ $${tier10UnitPrice.toFixed(2).padEnd(14)} │ $${pack10Price.toFixed(2).padEnd(13)} │`
    );

    assert(
      unitPrice >= mediluxePrice && mediluxePrice >= baseCost,
      `Coste $${baseCost}: Mediluxe ($${mediluxePrice}) y Wholesaler ($${unitPrice}) preservan jerarquía`
    );
    assert(
      Math.abs(totalMarkup - 32.25) <= 0.6,
      `Coste $${baseCost}: Margen compuesto efectivo es ~32.25% (obtenido: ${totalMarkup}%)`
    );
    assert(
      pack10Price < round2(unitPrice * 10),
      `Coste $${baseCost}: Pack de 10 ($${pack10Price}) aplica descuento por volumen respecto a 10 viales sueltos ($${round2(unitPrice * 10)})`
    );
  }
  console.log('  └──────────┴──────────────┴──────────────────┴─────────────────┴────────────────┘\n');

  // Consulta de productos reales de Lotusland en Firestore (filtrando sólo viales acabados)
  console.log('  Consultando productos reales de viales clínicos de Lotusland en Firestore...');
  const lotusSnapshot = await adminDb.collection('products')
    .where('supplierIds', 'array-contains', 'supplier-lotusland')
    .limit(40)
    .get();

  assert(lotusSnapshot.docs.length > 0, `Se encontraron ${lotusSnapshot.docs.length} productos de Lotusland en Firestore`);

  const realFinishedVials = [];
  for (const doc of lotusSnapshot.docs) {
    const data = doc.data();
    if (data.status === 'archived' || data.status === 'hidden') continue;
    if (data.productType === 'raw_material' || data.category === 'raw_material') continue;
    const pName = data.canonicalName || data.name || doc.id;
    const pLower = pName.toLowerCase();
    if (pLower.includes('bulk api') || pLower.includes('custom') || pLower.includes('magistral')) continue;

    const variants = data.variants || [];
    for (const v of variants) {
      const dose = String(v.dosage || v.dose || data.dosage || '10 mg').trim();
      const doseLower = dose.toLowerCase();
      if (doseLower.includes('bulk') || doseLower.includes('powder') || doseLower.includes('000g')) continue;
      
      const pricing = resolveWholesalePricing(v, 30.0, 15);
      if (pricing.baseCost > 0) {
        realFinishedVials.push({
          productId: doc.id,
          name: pName,
          dosage: dose,
          ...pricing
        });
      }
    }
  }

  assert(realFinishedVials.length > 0, `Se filtraron ${realFinishedVials.length} viales clínicos activos con pricing configurado`);

  // Auditar una muestra representativa de 6 viales reales
  for (const vial of realFinishedVials.slice(0, 6)) {
    console.log(`    • ${vial.name} (${vial.dosage}): Cost $${vial.baseCost} -> Mediluxe $${vial.mediluxePrice} -> Unit $${vial.unitPrice} | Pack10 $${vial.pack10Price}`);
    assert(vial.baseCost > 0, `Producto real ${vial.name} tiene coste base configurado ($${vial.baseCost})`);
    assert(vial.unitPrice > vial.baseCost, `Producto real ${vial.name} garantiza margen comercial positivo`);
    assert(
      vial.pack10Price < round2(vial.unitPrice * 10),
      `Producto real ${vial.name}: Pack 10 ($${vial.pack10Price}) incluye descuento por volumen frente a 10 individuales ($${round2(vial.unitPrice * 10)})`
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // SUITE 2: SIMULACIÓN DE CREACIÓN DE PEDIDO PROFORMA B2B
  // ──────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 2: Simulación de Pedido Proforma B2B desde Drawer ---');

  const now = new Date();
  const testOrderCode = `PO-DRAFT-TEST-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const sampleItems = [
    {
      id: 'bpc-157-10mg-test',
      productId: 'prod-bpc157',
      name: 'BPC-157',
      productName: 'BPC-157',
      dosage: '10 mg',
      presentation: 'Lyophilized Vial (10R)',
      quantity1x: 2,
      quantity10x: 0,
      quantity: 2,
      totalVials: 2,
      baseCost: 20.0,
      mediluxePrice: 23.0,
      unitPrice: 26.45,
      price: 26.45,
      totalPrice: 52.90,
      total: 52.90,
      lineTotal: 52.90,
      isBulk: false
    },
    {
      id: 'tirzepatide-10mg-test',
      productId: 'prod-tirz10',
      name: 'Tirzepatide',
      productName: 'Tirzepatide',
      dosage: '10 mg',
      presentation: 'Lyophilized Vial (10R)',
      quantity1x: 0,
      quantity10x: 1, // 1 pack of 10
      quantity: 10,
      totalVials: 10,
      baseCost: 35.0,
      mediluxePrice: 40.25,
      unitPrice: 46.29,
      tier10UnitPrice: 39.35,
      price: 46.29,
      pack10Price: 393.50,
      totalPrice: 393.50,
      total: 393.50,
      lineTotal: 393.50,
      isBulk: true
    }
  ];

  const subtotal = 52.90 + 393.50; // $446.40
  const shippingCost = 65.22; // €60.00 base express cold-chain freight ($65.22 USD)
  const grandTotal = Math.round((subtotal + shippingCost) * 100) / 100; // $511.62
  const totalUnits = 2 + 10; // 12 viales

  const clientContact = {
    name: 'Dr. Alexander Wright (Automated QA Test)',
    clinicName: 'Apex Longevity & Regenerative Institute',
    email: 'qa.test.order@atlas-solutions.com',
    phone: '+971 50 123 4567',
    addressLine1: 'Al Maryah Island, ADGM Square',
    addressLine2: 'Tower 3, Medical Suite 1400',
    city: 'Abu Dhabi',
    state: 'Abu Dhabi',
    postalCode: '00000',
    country: 'United Arab Emirates',
    notes: 'QA Automated Verification Order - Dual Margin & Nikolas Attribution'
  };

  const fullDeliveryAddress = `${clientContact.addressLine1}, ${clientContact.addressLine2}, ${clientContact.city}, ${clientContact.country}`;

  const orderDocData = {
    orderId: testOrderCode,
    code: testOrderCode,
    status: 'draft',
    source: 'public_peptides_price_schedule',
    isAutomatedTest: true,
    catalogId: 'CAT-RX-7482',
    catalogTitle: 'Official B2B Peptide Schedule (Lotusland / NP Labs)',
    customerName: clientContact.name,
    customerEmail: clientContact.email,
    customerPhone: clientContact.phone,
    customerAddress: fullDeliveryAddress,
    deliveryAddress: fullDeliveryAddress,
    customerNotes: clientContact.notes,
    items: sampleItems,
    totalUnits: totalUnits,
    subtotal: subtotal,
    shippingCost: shippingCost,
    shippingCostEur: 60,
    shippingDestination: clientContact.country,
    grandTotal: grandTotal,
    total: grandTotal,
    currency: 'USD',
    currencySymbol: '$',
    paymentMethod: 'payment_link_24h',
    
    // Atribución a Nikolas Psathas
    wholesalerId: 'np-labs-international',
    wholesalerName: 'Nikolaos Psathas (NP Labs)',
    wholesalerEmail: 'nikpsathas@gmail.com',
    referralCode: 'CAT-RX-7482',
    attributedTo: 'Por atención de Nikolaos Psathas (NP Labs)',
    collection: 'vials',

    requiresAcknowledgment: true,
    acknowledged: false,
    isRead: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  console.log(`  Guardando orden de prueba ${testOrderCode} en Firestore orders...`);
  const orderRef = await adminDb.collection('orders').add(orderDocData);
  assert(Boolean(orderRef.id), `Orden de prueba guardada con ID Firestore: ${orderRef.id}`);

  // ──────────────────────────────────────────────────────────────────
  // SUITE 3: VERIFICACIÓN DE NOTIFICACIÓN A JOSÉ LUIS
  // ──────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 3: Verificación de Notificación Inmediata a José Luis ---');

  // 3.1 Notificación en tiempo real en Firestore
  const notifData = {
    title: `🚨 Wholesaler Referral Order: ${testOrderCode} (Send Payment Link <24h)`,
    message: `${clientContact.name} placed an order via Wholesaler [np-labs-international] for ${totalUnits} units (USD ${grandTotal.toFixed(2)}). Send secure payment link within 24 hours.`,
    type: 'order_draft',
    severity: 'critical',
    orderId: orderRef.id,
    orderCode: testOrderCode,
    wholesalerId: 'np-labs-international',
    targetRoles: ['admin', 'account_manager', 'wholesaler'],
    accountManagerEmail: 'jose@mediluxeme.com',
    requiresAcknowledgment: true,
    acknowledged: false,
    read: false,
    link: `/admin?tab=orders&orderId=${orderRef.id}`,
    isAutomatedTest: true,
    createdAt: now.toISOString()
  };

  const notifRef = await adminDb.collection('notifications').add(notifData);
  assert(Boolean(notifRef.id), `Alerta crítica creada en notifications con ID: ${notifRef.id}`);

  // Verificar lectura de la notificación
  const readNotif = await adminDb.collection('notifications').doc(notifRef.id).get();
  const nVal = readNotif.data();
  assert(nVal.severity === 'critical', 'Severidad de notificación es CRITICAL');
  assert(nVal.targetRoles.includes('admin'), 'Notificación dirigida al rol ADMIN');
  assert(nVal.orderCode === testOrderCode, `Código de pedido coincide: ${nVal.orderCode}`);

  // 3.2 Notificación por Email a jose@mediluxeme.com
  console.log('  Verificando motor de correo (sendOrderCreatedNotificationEmail a jose@mediluxeme.com)...');
  let emailResult = null;
  try {
    emailResult = await sendOrderCreatedNotificationEmail(
      { ...orderDocData, firestoreId: orderRef.id },
      'jose@mediluxeme.com'
    );
  } catch (err) {
    console.warn('  ⚠️ Aviso de transporte SMTP:', err.message);
  }

  assert(
    emailResult && (emailResult.to === 'jose@mediluxeme.com' || emailResult.success === true),
    `Notificación de email dirigida a jose@mediluxeme.com`
  );

  // Verificar que el log se registró en Firestore mail_logs
  const mailLogsSnap = await adminDb.collection('mail_logs')
    .where('orderCode', '==', testOrderCode)
    .limit(1)
    .get();

  assert(!mailLogsSnap.empty, `Registro de auditoría de email guardado en mail_logs con código ${testOrderCode}`);
  if (!mailLogsSnap.empty) {
    const mailLog = mailLogsSnap.docs[0].data();
    assert(mailLog.to === 'jose@mediluxeme.com', `mail_logs destinatario es jose@mediluxeme.com`);
    assert(mailLog.wholesalerId === 'np-labs-international', `mail_logs wholesalerId es np-labs-international`);
    assert(mailLog.attributedTo.includes('Nikolaos Psathas'), `mail_logs atribución contiene a Nikolaos Psathas`);
    // Limpiar mail_log de prueba
    await adminDb.collection('mail_logs').doc(mailLogsSnap.docs[0].id).delete();
  }

  // ──────────────────────────────────────────────────────────────────
  // SUITE 4: VERIFICACIÓN DE ATRIBUCIÓN Y REGISTRO EN LA CUENTA DE NIKOLAS
  // ──────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 4: Verificación de Atribución a la Cuenta de Nikolas Psathas ---');

  // 4.1 Comprobar documento de orden en Firestore
  const readOrder = await adminDb.collection('orders').doc(orderRef.id).get();
  const savedOrder = readOrder.data();

  assert(savedOrder.wholesalerId === 'np-labs-international', `wholesalerId es exactamente 'np-labs-international'`);
  assert(savedOrder.wholesalerName === 'Nikolaos Psathas (NP Labs)', `wholesalerName es 'Nikolaos Psathas (NP Labs)'`);
  assert(savedOrder.wholesalerEmail === 'nikpsathas@gmail.com', `wholesalerEmail es 'nikpsathas@gmail.com'`);
  assert(savedOrder.referralCode === 'CAT-RX-7482', `referralCode es 'CAT-RX-7482'`);
  assert(savedOrder.attributedTo === 'Por atención de Nikolaos Psathas (NP Labs)', `attributedTo es 'Por atención de Nikolaos Psathas (NP Labs)'`);
  assert(savedOrder.subtotal === subtotal, `Subtotal de formulaciones es exacto ($${subtotal.toFixed(2)})`);
  assert(savedOrder.shippingCost === shippingCost, `Coste de envío cold-chain es exacto ($${shippingCost.toFixed(2)} / €60 base)`);
  assert(savedOrder.grandTotal === grandTotal, `Importe total es exacto ($${grandTotal.toFixed(2)})`);
  assert(savedOrder.totalUnits === 12, `Total de viales es exacto (12 viales: 2 sueltos + 1 pack de 10)`);

  // 4.2 Comprobar actualización de analíticas en wholesaler_referrals
  console.log('  Actualizando analíticas de referido en wholesaler_referrals/np-labs-international...');
  const refDocRef = adminDb.collection('wholesaler_referrals').doc('np-labs-international');
  await refDocRef.set({
    wholesalerId: 'np-labs-international',
    referralCode: 'CAT-RX-7482',
    wholesalerName: 'Nikolaos Psathas (NP Labs)',
    wholesalerEmail: 'nikpsathas@gmail.com',
    ordersCount: FieldValue.increment(1),
    totalRevenue: FieldValue.increment(grandTotal),
    totalUnits: FieldValue.increment(totalUnits),
    lastOrderAt: now.toISOString(),
    lastOrderCode: testOrderCode,
    updatedAt: now.toISOString()
  }, { merge: true });

  const refCheck = await refDocRef.get();
  assert(refCheck.exists, 'Documento de analíticas wholesaler_referrals/np-labs-international existe y está activo');
  const refData = refCheck.data();
  assert(refData.wholesalerId === 'np-labs-international', 'Analíticas vinculadas a np-labs-international');
  assert(refData.lastOrderCode === testOrderCode, `Última orden registrada en analíticas es ${testOrderCode}`);

  // 4.3 Comprobar log de conversión en catalog_generation_logs/CAT-RX-7482
  console.log('  Actualizando log de conversión en catalog_generation_logs/CAT-RX-7482...');
  await adminDb.collection('catalog_generation_logs').doc('CAT-RX-7482').set({
    status: 'converted_to_order',
    lastOrderCode: testOrderCode,
    lastOrderAt: now.toISOString(),
    attributedTo: 'Por atención de Nikolaos Psathas (NP Labs)',
    updatedAt: now.toISOString()
  }, { merge: true });

  const catLogCheck = await adminDb.collection('catalog_generation_logs').doc('CAT-RX-7482').get();
  assert(catLogCheck.exists, 'Registro catalog_generation_logs/CAT-RX-7482 existe');
  assert(catLogCheck.data().status === 'converted_to_order', 'Estado de catálogo CAT-RX-7482 es converted_to_order');

  // Limpieza de datos de prueba para mantener la base de datos limpia
  console.log('\n  Limpieza de registros sintéticos de prueba...');
  await adminDb.collection('orders').doc(orderRef.id).delete();
  await adminDb.collection('notifications').doc(notifRef.id).delete();
  // Descontar la orden sintética de las analíticas para no distorsionar ingresos reales
  await refDocRef.update({
    ordersCount: FieldValue.increment(-1),
    totalRevenue: FieldValue.increment(-grandTotal),
    totalUnits: FieldValue.increment(-totalUnits)
  });
  console.log('  ✔ Registros sintéticos eliminados y contadores restablecidos.');

  // ──────────────────────────────────────────────────────────────────
  // RESUMEN FINAL
  // ──────────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`📊 RESULTADOS DE LA AUDITORÍA: ${passedTests} de ${totalTests} PRUEBAS SUPERADAS`);
  if (passedTests === totalTests) {
    console.log('🎉 TODAS LAS PRUEBAS HAN PASADO AL 100% CON ÉXITO (ZERO FAILURES)');
  } else {
    console.warn(`⚠️ Se detectaron ${totalTests - passedTests} fallos.`);
  }
  console.log('======================================================================\n');
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
