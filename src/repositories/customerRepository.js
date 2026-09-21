/**
 * repositories/customerRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Customer Data Access Layer (SSOT) — Atlas Health Platform
 *
 * Implements:
 *   - Party/Counterparty Pattern: Single Source of Truth for all customers
 *     (Clinics, Wholesalers, Doctors, and Patients).
 *   - Specialized projection views:
 *       • getPatientsView()
 *       • getDoctorsView()
 *       • getClinicsView()
 *       • getWholesalersView()
 *   - Golden Rule #1: Mandatory limits and cursor pagination (O(1)).
 *   - Golden Rule #2: Multi-layer caching (RAM -> LocalStorage -> Firestore)
 *     with explicit invalidation.
 *   - Zod runtime validation via CustomerBaseSchema & role schemas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getCache, setCache, invalidateCache, DEFAULT_TTL_MS } from '../lib/cache';
import { withRetry } from './_resilience';
import { logger } from '../utils/logger';
import {
  CustomerBaseSchema,
  PatientCustomerSchema,
  DoctorCustomerSchema,
  ClinicCustomerSchema,
  WholesalerCustomerSchema,
} from '../schemas/customerSchema.zod';

const CUSTOMERS_COLLECTION = 'customers';

export const customerRepository = {
  /**
   * Fetch a single customer by ID.
   * @param {string} customerId
   * @param {object} [opts]
   * @param {boolean} [opts.forceRefresh]
   * @returns {Promise<object|null>}
   */
  async getCustomerById(customerId, { forceRefresh = false } = {}) {
    if (!customerId) return null;
    const cacheKey = `customers/${customerId}`;

    if (!forceRefresh) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const customerDoc = await withRetry(
        () => getDoc(doc(db, CUSTOMERS_COLLECTION, customerId)),
        { entityName: `Customers:getById:${customerId}` }
      );

      if (!customerDoc.exists()) return null;

      const data = { id: customerDoc.id, ...customerDoc.data() };
      setCache(cacheKey, data, DEFAULT_TTL_MS);
      return data;
    } catch (err) {
      logger.error(`[customerRepository.getCustomerById] failed for ${customerId}:`, err);
      return null;
    }
  },

  /**
   * Universal customer query with filtering and pagination.
   * @param {object} params
   * @param {string} [params.customerType] - 'patient' | 'doctor' | 'clinic' | 'wholesaler'
   * @param {string} [params.status]
   * @param {string} [params.pricingTier]
   * @param {number} [params.limitCount=50] - Golden Rule #1
   * @param {object} [params.startAfterDoc]
   * @param {boolean} [params.forceRefresh=false]
   */
  async getCustomers({
    customerType = null,
    status = null,
    pricingTier = null,
    limitCount = 50,
    startAfterDoc = null,
    forceRefresh = false,
  } = {}) {
    const cacheKey = `customers:list:${customerType || 'all'}:${status || 'all'}:${pricingTier || 'all'}:${limitCount}:${startAfterDoc ? startAfterDoc.id : 'start'}`;

    if (!forceRefresh && !startAfterDoc) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const constraints = [];

      if (customerType) {
        constraints.push(where('customerType', '==', customerType));
      }
      if (status) {
        constraints.push(where('status', '==', status));
      }
      if (pricingTier) {
        constraints.push(where('pricingTier', '==', pricingTier));
      }

      constraints.push(orderBy('updatedAt', 'desc'));

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }

      // Golden Rule #1: Enforce mandatory pagination limit
      constraints.push(limit(Math.min(limitCount, 100)));

      const q = query(collection(db, CUSTOMERS_COLLECTION), ...constraints);
      const snapshot = await withRetry(() => getDocs(q), { entityName: 'Customers:getCustomers' });

      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const result = {
        items,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === limitCount,
      };

      if (!startAfterDoc) {
        setCache(cacheKey, result, DEFAULT_TTL_MS);
      }
      return result;
    } catch (err) {
      logger.error('[customerRepository.getCustomers] query failed:', err);
      return { items: [], lastDoc: null, hasMore: false };
    }
  },

  /**
   * Specialized Projection: Patient Medical View
   * Queries customers where customerType == 'patient'.
   */
  async getPatientsView({ doctorId = null, clinicId = null, limitCount = 50, startAfterDoc = null, forceRefresh = false } = {}) {
    const result = await this.getCustomers({
      customerType: 'patient',
      limitCount,
      startAfterDoc,
      forceRefresh,
    });

    // In-memory filter for doctor/clinic if relational index is used
    if (doctorId || clinicId) {
      result.items = result.items.filter(item => {
        const profile = item.patientProfile || {};
        if (doctorId && profile.assignedDoctorId !== doctorId) return false;
        if (clinicId && profile.assignedClinicId !== clinicId) return false;
        return true;
      });
    }

    return result;
  },

  /**
   * Specialized Projection: Doctor Medical Professional View
   * Queries customers where customerType == 'doctor'.
   */
  async getDoctorsView({ clinicId = null, limitCount = 50, startAfterDoc = null, forceRefresh = false } = {}) {
    const result = await this.getCustomers({
      customerType: 'doctor',
      limitCount,
      startAfterDoc,
      forceRefresh,
    });

    if (clinicId) {
      result.items = result.items.filter(item => {
        const profile = item.doctorProfile || {};
        return (profile.affiliatedClinicIds || []).includes(clinicId);
      });
    }

    return result;
  },

  /**
   * Specialized Projection: Clinic Facilities View
   * Queries customers where customerType == 'clinic'.
   */
  async getClinicsView({ territory = null, limitCount = 50, startAfterDoc = null, forceRefresh = false } = {}) {
    const result = await this.getCustomers({
      customerType: 'clinic',
      limitCount,
      startAfterDoc,
      forceRefresh,
    });

    if (territory && territory !== 'All' && territory !== 'Global') {
      result.items = result.items.filter(item => {
        const profile = item.clinicProfile || {};
        return profile.territory === territory || item.country === territory;
      });
    }

    return result;
  },

  /**
   * Specialized Projection: Wholesalers View
   * Queries customers where customerType == 'wholesaler'.
   */
  async getWholesalersView({ tier = null, limitCount = 50, startAfterDoc = null, forceRefresh = false } = {}) {
    return this.getCustomers({
      customerType: 'wholesaler',
      pricingTier: tier,
      limitCount,
      startAfterDoc,
      forceRefresh,
    });
  },

  /**
   * Upsert a customer record (Creates or merges into customers collection).
   * @param {string} customerId
   * @param {object} data
   * @returns {Promise<object>}
   */
  async upsertCustomer(customerId, data) {
    if (!customerId) throw new Error('Customer ID is required for upsert.');

    const now = new Date().toISOString();
    const payload = {
      ...data,
      id: customerId,
      updatedAt: now,
    };

    if (!payload.createdAt) {
      payload.createdAt = now;
    }

    // Validate payload against base schema or role schema
    const validated = CustomerBaseSchema.safeParse(payload);
    if (!validated.success) {
      logger.warn('[customerRepository.upsertCustomer] Validation warning (saving with partial fields):', validated.error.issues);
    }

    await withRetry(
      () => setDoc(doc(db, CUSTOMERS_COLLECTION, customerId), payload, { merge: true }),
      { entityName: `Customers:upsert:${customerId}` }
    );

    this.invalidateCustomerCache(customerId);
    return payload;
  },

  /**
   * Updates partial fields of a customer.
   * @param {string} customerId
   * @param {object} partialData
   */
  async updateCustomer(customerId, partialData) {
    if (!customerId) throw new Error('Customer ID is required.');

    const updatePayload = {
      ...partialData,
      updatedAt: new Date().toISOString(),
    };

    await withRetry(
      () => updateDoc(doc(db, CUSTOMERS_COLLECTION, customerId), updatePayload),
      { entityName: `Customers:update:${customerId}` }
    );

    this.invalidateCustomerCache(customerId);
    return updatePayload;
  },

  /**
   * Invalidate RAM and multi-tier cache for a specific customer or all customers.
   * @param {string} [customerId]
   */
  invalidateCustomerCache(customerId = null) {
    if (customerId) {
      invalidateCache(`customers/${customerId}`);
    }
    // Also invalidate list caches
    invalidateCache('customers:list');
  },
};
