/**
 * dataHealthSentinel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Autonomous Data Integrity & Health Sentinel Engine.
 * Audits Firestore collections against schema rules, taxonomy (Rule #28),
 * and relational references, providing a 0–100% Health Score and self-healing tools.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { VALID_CATEGORIES } from '../schemas/firestoreProductSchema.js';
import { TRANSACTION_TAXONOMY } from '../schemas/transactionalStateMachine.js';

/**
 * Runs a comprehensive health assessment across products, orders, and quotations.
 * @returns {Promise<Object>} Diagnostic report with score and issues.
 */
export async function runDataHealthAssessment() {
  const issues = [];
  let totalChecked = 0;
  let totalValid = 0;

  // 1. Audit Products & Categories
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    for (const docSnap of productsSnap.docs) {
      totalChecked++;
      const p = docSnap.data();
      const cat = p.categoryId || p.category;

      if (!cat) {
        issues.push({
          level: 'warning',
          collection: 'products',
          docId: docSnap.id,
          title: 'Missing categoryId',
          detail: `Product "${p.name || docSnap.id}" has no categoryId assigned.`,
          fixType: 'assign_default_category'
        });
      } else if (!VALID_CATEGORIES.includes(cat)) {
        issues.push({
          level: 'warning',
          collection: 'products',
          docId: docSnap.id,
          title: 'Non-canonical category',
          detail: `Category "${cat}" is not in VALID_CATEGORIES taxonomy.`,
          fixType: 'normalize_category'
        });
      } else {
        totalValid++;
      }
    }
  } catch (err) {
    console.error('[dataHealthSentinel] Product check error:', err);
  }

  // 2. Audit Orders Status Taxonomy
  try {
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const validOrderStates = TRANSACTION_TAXONOMY.sales_order.states;

    for (const docSnap of ordersSnap.docs) {
      totalChecked++;
      const o = docSnap.data();
      const st = String(o.status || '').toLowerCase().trim();

      if (!st || !validOrderStates.includes(st)) {
        issues.push({
          level: 'error',
          collection: 'orders',
          docId: docSnap.id,
          title: 'Invalid Order Status',
          detail: `Order status "${st || 'undefined'}" violates canonical state taxonomy.`,
          fixType: 'heal_order_status'
        });
      } else {
        totalValid++;
      }
    }
  } catch (err) {
    console.error('[dataHealthSentinel] Order check error:', err);
  }

  // 3. Audit Quotations
  try {
    const quotesSnap = await getDocs(collection(db, 'quotations'));
    const validQuoteStates = TRANSACTION_TAXONOMY.quotation.states;

    for (const docSnap of quotesSnap.docs) {
      totalChecked++;
      const q = docSnap.data();
      const st = String(q.status || '').toLowerCase().trim();

      if (!st || !validQuoteStates.includes(st)) {
        issues.push({
          level: 'warning',
          collection: 'quotations',
          docId: docSnap.id,
          title: 'Invalid Quotation Status',
          detail: `Quotation status "${st}" not in valid taxonomy.`,
          fixType: 'heal_quotation_status'
        });
      } else {
        totalValid++;
      }
    }
  } catch (err) {
    console.error('[dataHealthSentinel] Quotations check error:', err);
  }

  const score = totalChecked > 0 ? Math.round((totalValid / totalChecked) * 100) : 100;

  return {
    score,
    totalChecked,
    validRecords: totalValid,
    issueCount: issues.length,
    issues,
    timestamp: new Date().toISOString(),
    status: score >= 90 ? 'OPTIMAL' : score >= 75 ? 'GOOD' : 'REQUIRES_ATTENTION'
  };
}
