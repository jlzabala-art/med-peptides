/**
 * repositories/wholesalerRepository.js
 *
 * Data-access layer for wholesaler-related Firestore collections:
 *   - `prescriptions` (assigned to a wholesaler)
 *   - `bulk_orders`
 *   - `orders` (by wholesaler/tenant)
 *   - `users` (clients by tenant)
 *   - `invitations` (manager invitations)
 *
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { productRepository } from './productRepository';
import { protocolRepository } from './protocolRepository';

/**
 * Suscribe a las prescripciones asignadas a un mayorista.
 * @param {string} wholesalerId
 * @param {number} limitCount
 * @param {function} onData
 * @param {function} onError
 * @returns {function} unsubscribe
 */
export function subscribeToPrescriptions(wholesalerId, limitCount = 50, onData, onError) {
  const q = query(
    collection(db, 'prescriptions'),
    where('wholesalerId', '==', wholesalerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError ?? (() => {})
  );
}

/**
 * Suscribe a los pedidos masivos de un mayorista (real-time).
 * @param {string} wholesalerId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToBulkOrders(wholesalerId, onData) {
  const q = query(
    collection(db, 'bulk_orders'),
    where('wholesalerId', '==', wholesalerId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
}

/**
 * Carga catálogo de productos y protocolos para el Rx Inbox builder.
 * @returns {Promise<{ products: object[], protocols: object[] }>}
 */
export async function getCatalogForRxInbox() {
  const [products, protocols] = await Promise.all([
    productRepository.getCatalog(),
    protocolRepository.getAllProtocols().catch(() => []),
  ]);
  return { products, protocols };
}

// ─── FUNCIONES B2B ───────────────────────────────────────────────────────────

/**
 * Obtiene los clientes (usuarios) atribuidos a un tenant con paginación.
 * Reemplaza el getDocs directo de ClientsTab.jsx.
 *
 * @param {string} tenantId
 * @param {{ limitCount?: number, lastDoc?: object, role?: string }} opts
 * @returns {Promise<{ clients: object[], lastDoc: object|null }>}
 */
export async function getClientsByTenant(tenantId, { limitCount = 50, lastDoc = null, role } = {}) {
  if (!tenantId) return { clients: [], lastDoc: null };

  const constraints = [
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (role) constraints.unshift(where('role', '==', role));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, 'users'), ...constraints);
  const snap = await getDocs(q);
  const clients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { clients, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

/**
 * Obtiene las estadísticas KPI de un account manager.
 * Reemplaza el useEffect + getDocs de ManagerOverviewTab.jsx.
 *
 * @param {string} managerId — UID del account manager
 * @returns {Promise<{ clients: number, pendingOrders: number, completedOrders: number }>}
 */
export async function getManagerStats(managerId) {
  if (!managerId) return { clients: 0, pendingOrders: 0, completedOrders: 0 };

  const [usersSnap, ordersSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), where('assignedAccountManagerId', '==', managerId))),
    getDocs(query(collection(db, 'orders'), where('assignedAccountManagerId', '==', managerId))),
  ]);

  let pendingOrders = 0;
  let completedOrders = 0;
  ordersSnap.forEach((d) => {
    const status = d.data().status;
    if (status === 'pending' || status === 'processing') pendingOrders++;
    else if (status === 'completed' || status === 'delivered') completedOrders++;
  });

  return { clients: usersSnap.size, pendingOrders, completedOrders };
}

/**
 * Obtiene las invitaciones creadas por un manager, ordenadas por fecha.
 * Reemplaza el queryFn inline de ManagerInvitationsTab.jsx.
 *
 * @param {string} managerId
 * @returns {Promise<object[]>}
 */
export async function getInvitationsByManager(managerId) {
  if (!managerId) return [];
  try {
    const q = query(
      collection(db, 'invitations'),
      where('createdBy', '==', managerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    // Fallback sin orderBy si el índice aún está construyendo
    const q = query(collection(db, 'invitations'), where('createdBy', '==', managerId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
  }
}

/**
 * Crea una nueva invitación de cliente.
 * Reemplaza el mutationFn inline de ManagerInvitationsTab.jsx.
 *
 * @param {{ name: string, email: string, role: string, createdBy: string, tenantId?: string }} data
 * @returns {Promise<string>} ID de la nueva invitación
 */
export async function createInvitation(data) {
  const ref = await addDoc(collection(db, 'invitations'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Obtiene pedidos paginados de un wholesaler/tenant.
 *
 * @param {string} wholesalerId
 * @param {{ limitCount?: number, lastDoc?: object, status?: string }} opts
 * @returns {Promise<{ orders: object[], lastDoc: object|null }>}
 */
export async function getOrdersByWholesaler(wholesalerId, { limitCount = 50, lastDoc = null, status } = {}) {
  if (!wholesalerId) return { orders: [], lastDoc: null };

  const constraints = [
    where('tenantId', '==', wholesalerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (status) constraints.unshift(where('status', '==', status));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, 'orders'), ...constraints);
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { orders, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

/**
 * Obtiene bulk orders paginados para un wholesaler.
 * Reemplaza el useFirestoreCollection genérico de useBulkOrders.js.
 *
 * @param {string} wholesalerId
 * @param {{ limitCount?: number, lastDoc?: object }} opts
 * @returns {Promise<{ orders: object[], hasMore: boolean, lastDoc: object|null }>}
 */
export async function getBulkOrdersPaginated(wholesalerId, { limitCount = 50, lastDoc = null } = {}) {
  if (!wholesalerId) return { orders: [], hasMore: false, lastDoc: null };

  const constraints = [
    where('wholesalerId', '==', wholesalerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, 'bulk_orders'), ...constraints);
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { orders, hasMore: snap.docs.length === limitCount, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

/**
 * Obtiene la configuración de dominio de un tenant/wholesaler.
 * @param {string} tenantId
 * @returns {Promise<object|null>}
 */
export async function getTenantDomainConfig(tenantId) {
  if (!tenantId) return null;
  const tenantRef = doc(db, 'tenants', tenantId);
  const snap = await getDoc(tenantRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Actualiza la configuración de dominio de un tenant/wholesaler.
 * @param {string} tenantId
 * @param {object} domainData
 * @returns {Promise<void>}
 */
export async function updateTenantDomainConfig(tenantId, domainData) {
  if (!tenantId) throw new Error('tenantId is required');
  const tenantRef = doc(db, 'tenants', tenantId);
  await updateDoc(tenantRef, {
    'domain.customDomain': domainData.customDomain,
    'domain.customDomainStatus': domainData.customDomainStatus,
    'domain.updatedAt': serverTimestamp(),
  });
}

/**
 * Obtiene la lista de mayoristas/wholesalers.
 * @param {number} limitCount
 * @returns {Promise<Array<object>>}
 */
export async function getWholesalers(limitCount = 50) {
  try {
    const q = query(collection(db, 'wholesellers'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    return [];
  }
}

import { setDoc } from 'firebase/firestore';
import { logger } from '../utils/logger';

/**
 * Obtiene la configuración de branding de un tenant.
 * @param {string} tenantId
 * @returns {Promise<object|null>}
 */
export async function getTenantBranding(tenantId) {
  if (!tenantId) return null;
  try {
    const snap = await getDoc(doc(db, 'tenants', tenantId));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    logger.error('[wholesalerRepository] getTenantBranding failed', { tenantId, error: err.message });
    throw err;
  }
}

/**
 * Actualiza la configuración de branding de un tenant y escribe el audit log.
 * @param {string} tenantId
 * @param {object} branding
 * @param {string} [userId]
 * @returns {Promise<void>}
 */
export async function updateTenantBranding(tenantId, branding, userId = 'unknown') {
  if (!tenantId) throw new Error('tenantId is required');
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      name: branding.displayName,
      'branding.logoUrl': branding.logoUrl,
      'branding.primaryColor': branding.primaryColor,
      'branding.secondaryColor': branding.secondaryColor,
      'branding.fontFamily': branding.fontFamily,
      'branding.supportEmail': branding.supportEmail,
      'branding.supportWhatsapp': branding.supportWhatsapp,
      'branding.footerText': branding.footerText,
      'branding.defaultCTA': branding.defaultCTA,
      updatedAt: serverTimestamp(),
    });

    try {
      const auditRef = doc(db, 'tenantAuditLogs', `${tenantId}_${Date.now()}`);
      await setDoc(auditRef, {
        tenantId,
        timestamp: new Date().toISOString(),
        action: 'update_branding',
        userId,
        details: { updatedFields: Object.keys(branding) },
      });
    } catch (e) {
      logger.warn('[wholesalerRepository] Audit log write failed', { error: e.message });
    }
  } catch (err) {
    logger.error('[wholesalerRepository] updateTenantBranding failed', { tenantId, error: err.message });
    throw err;
  }
}

/**
 * Obtiene las áreas y reglas comerciales de un tenant.
 * @param {string} tenantId
 * @returns {Promise<object|null>}
 */
export async function getTenantGeography(tenantId) {
  if (!tenantId) return null;
  try {
    const snap = await getDoc(doc(db, 'tenants', tenantId));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    logger.error('[wholesalerRepository] getTenantGeography failed', { tenantId, error: err.message });
    throw err;
  }
}

/**
 * Actualiza las reglas geográficas y comerciales de un tenant.
 * @param {string} tenantId
 * @param {object} rules
 * @param {string} [userId]
 * @returns {Promise<void>}
 */
export async function updateTenantGeography(tenantId, rules, userId = 'unknown') {
  if (!tenantId) throw new Error('tenantId is required');
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, {
      'commercialRules.peptideVialsVisibility': rules.peptideVialsVisibility,
      'commercialRules.supplementsVisibility': rules.supplementsVisibility,
      'commercialRules.compoundedVisibility': rules.compoundedVisibility,
      'commercialRules.hidePricesForGuests': rules.hidePricesForGuests,
      'commercialRules.allowCheckout': rules.allowCheckout,
      updatedAt: serverTimestamp(),
    });

    try {
      const auditRef = doc(db, 'tenantAuditLogs', `${tenantId}_${Date.now()}`);
      await setDoc(auditRef, {
        tenantId,
        timestamp: new Date().toISOString(),
        action: 'update_geography_rules',
        userId,
        details: { commercialRules: rules },
      });
    } catch (e) {
      logger.warn('[wholesalerRepository] Geography audit log write failed', { error: e.message });
    }
  } catch (err) {
    logger.error('[wholesalerRepository] updateTenantGeography failed', { tenantId, error: err.message });
    throw err;
  }
}

export const wholesalerRepository = {
  subscribeToPrescriptions,
  subscribeToBulkOrders,
  getCatalogForRxInbox,
  // B2B operations
  getClientsByTenant,
  getManagerStats,
  getInvitationsByManager,
  createInvitation,
  getOrdersByWholesaler,
  getBulkOrdersPaginated,
  getTenantDomainConfig,
  updateTenantDomainConfig,
  getWholesalers,
  getTenantBranding,
  updateTenantBranding,
  getTenantGeography,
  updateTenantGeography,
};

export default wholesalerRepository;


