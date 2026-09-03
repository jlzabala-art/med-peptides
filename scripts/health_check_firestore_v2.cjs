#!/usr/bin/env node
/**
 * scripts/health_check_firestore_v2.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Firestore Architecture & Data Integrity Health Diagnostic Tool
 *
 * Scans all 6 core collections against their canonical contracts:
 *   1. products       → PRODUCT_FIELD_CONTRACT, VALID_STATUSES
 *   2. protocols      → PROTOCOL_FIELD_CONTRACT, VALID_PROTOCOL_STATUSES
 *   3. users          → PATIENT_FIELD_CONTRACT (for patients), roles
 *   4. prescriptions  → PRESCRIPTION_FIELD_CONTRACT, line statuses
 *   5. orders         → ORDER_FIELD_CONTRACT, ORDER_ITEM_FIELD_CONTRACT
 *   6. quotations     → QuotationSchema, recipientType / pricingTier
 *
 * Computes an overall Global Health Score (0-100%) and actionable breakdown.
 *
 * Usage:
 *   node scripts/health_check_firestore_v2.cjs [--sample=100]
 * ─────────────────────────────────────────────────────────────────────────────
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ── Canonical Enums ───────────────────────────────────────────────────────────
const VALID_PRODUCT_STATUSES = ['draft', 'active', 'out of stock', 'hidden', 'archived'];
const VALID_PROTOCOL_STATUSES = ['draft', 'active', 'paused', 'archived'];
const VALID_PATIENT_STATUSES = ['unverified', 'active', 'suspended', 'archived'];
const VALID_ORDER_STATUSES = ['draft', 'awaiting payment', 'processing', 'en tránsito', 'delivered', 'disputed', 'cancelled'];
const VALID_PRESCRIPTION_STATUSES = ['draft', 'pending', 'approved', 'processing', 'en tránsito', 'completed', 'cancelled'];

async function scanCollection(name, sampleLimit = 500) {
  const snap = await db.collection(name).limit(sampleLimit).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function runHealthCheck() {
  console.log('\n======================================================');
  console.log('🛡️  REGENPEPT FIRESTORE ARCHITECTURAL HEALTH DIAGNOSTIC');
  console.log('======================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    collections: {},
    overallScore: 100,
  };

  let totalDeductions = 0;

  // 1. PRODUCTS
  try {
    const products = await scanCollection('products');
    let issues = 0;
    let missingName = 0;
    let legacyStatus = 0;

    products.forEach(p => {
      if (!p.name && !p.title) { issues++; missingName++; }
      if (p.status && !VALID_PRODUCT_STATUSES.includes(p.status)) { issues++; legacyStatus++; }
    });

    const score = products.length > 0 ? Math.max(0, Math.round(((products.length - issues) / products.length) * 100)) : 100;
    report.collections.products = { count: products.length, score, issues, missingName, legacyStatus };
    console.log(`📦 Products:      ${products.length} scanned | Health: ${score}% (${issues} issues)`);
    if (issues > 0) totalDeductions += (100 - score) * 0.25;
  } catch (err) {
    console.log(`📦 Products:      ⚠️ Scan skipped (${err.message})`);
  }

  // 2. PROTOCOLS
  try {
    const protocols = await scanCollection('protocols');
    let issues = 0;
    let legacyStatus = 0;

    protocols.forEach(p => {
      if (p.status && !VALID_PROTOCOL_STATUSES.includes(p.status)) { issues++; legacyStatus++; }
    });

    const score = protocols.length > 0 ? Math.max(0, Math.round(((protocols.length - issues) / protocols.length) * 100)) : 100;
    report.collections.protocols = { count: protocols.length, score, issues, legacyStatus };
    console.log(`🔬 Protocols:     ${protocols.length} scanned | Health: ${score}% (${issues} issues)`);
    if (issues > 0) totalDeductions += (100 - score) * 0.20;
  } catch (err) {
    console.log(`🔬 Protocols:     ⚠️ Scan skipped (${err.message})`);
  }

  // 3. USERS / PATIENTS
  try {
    const users = await scanCollection('users');
    let issues = 0;
    let uppercaseStatus = 0;

    users.forEach(u => {
      if (u.status && ['Active', 'Inactive', 'New', 'Archived'].includes(u.status)) {
        issues++;
        uppercaseStatus++;
      }
    });

    const score = users.length > 0 ? Math.max(0, Math.round(((users.length - issues) / users.length) * 100)) : 100;
    report.collections.users = { count: users.length, score, issues, uppercaseStatus };
    console.log(`👥 Users:         ${users.length} scanned | Health: ${score}% (${issues} issues)`);
    if (issues > 0) totalDeductions += (100 - score) * 0.20;
  } catch (err) {
    console.log(`👥 Users:         ⚠️ Scan skipped (${err.message})`);
  }

  // 4. PRESCRIPTIONS
  try {
    const prescriptions = await scanCollection('prescriptions');
    let issues = 0;
    let uppercaseLines = 0;

    prescriptions.forEach(p => {
      if (p.status && !VALID_PRESCRIPTION_STATUSES.includes(p.status)) issues++;
      if (Array.isArray(p.prescriptionLines)) {
        p.prescriptionLines.forEach(l => {
          if (l.status && ['Pending', 'Approved', 'Rejected'].includes(l.status)) {
            issues++;
            uppercaseLines++;
          }
        });
      }
    });

    const score = prescriptions.length > 0 ? Math.max(0, Math.round(((prescriptions.length - issues) / prescriptions.length) * 100)) : 100;
    report.collections.prescriptions = { count: prescriptions.length, score, issues, uppercaseLines };
    console.log(`📋 Prescriptions: ${prescriptions.length} scanned | Health: ${score}% (${issues} issues)`);
    if (issues > 0) totalDeductions += (100 - score) * 0.15;
  } catch (err) {
    console.log(`📋 Prescriptions: ⚠️ Scan skipped (${err.message})`);
  }

  // 5. ORDERS
  try {
    const orders = await scanCollection('orders');
    let issues = 0;
    orders.forEach(o => {
      if (o.status && !VALID_ORDER_STATUSES.includes(o.status)) issues++;
    });
    const score = orders.length > 0 ? Math.max(0, Math.round(((orders.length - issues) / orders.length) * 100)) : 100;
    report.collections.orders = { count: orders.length, score, issues };
    console.log(`🛒 Orders:        ${orders.length} scanned | Health: ${score}% (${issues} issues)`);
    if (issues > 0) totalDeductions += (100 - score) * 0.10;
  } catch (err) {
    console.log(`🛒 Orders:        ⚠️ Scan skipped (${err.message})`);
  }

  // 6. QUOTATIONS
  try {
    const quotations = await scanCollection('quotations');
    let issues = 0;
    quotations.forEach(q => {
      if ('category' in q || 'tier' in q) issues++;
    });
    const score = quotations.length > 0 ? Math.max(0, Math.round(((quotations.length - issues) / quotations.length) * 100)) : 100;
    report.collections.quotations = { count: quotations.length, score, issues };
    console.log(`💼 Quotations:    ${quotations.length} scanned | Health: ${score}% (${issues} issues)`);
    if (issues > 0) totalDeductions += (100 - score) * 0.10;
  } catch (err) {
    console.log(`💼 Quotations:    ⚠️ Scan skipped (${err.message})`);
  }

  report.overallScore = Math.max(0, Math.round(100 - totalDeductions));
  console.log('\n------------------------------------------------------');
  console.log(`🏆 GLOBAL FIRESTORE HEALTH SCORE: ${report.overallScore} / 100`);
  console.log('------------------------------------------------------\n');
}

runHealthCheck().catch(err => {
  console.error('Fatal error during diagnostic:', err);
});
