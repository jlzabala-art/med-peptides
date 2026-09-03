/**
 * queryKeys.js
 * 
 * Centralized, type-safe query key factory for TanStack React Query.
 * Eliminates magic strings and ensures coherent cache invalidation across the app.
 */

export const queryKeys = {
  // Products & Catalog
  products: {
    all: ['products'],
    lists: () => [...queryKeys.products.all, 'list'],
    list: (filters) => [...queryKeys.products.lists(), filters],
    details: () => [...queryKeys.products.all, 'detail'],
    detail: (id) => [...queryKeys.products.details(), id],
    featured: () => [...queryKeys.products.all, 'featured'],
  },

  // Protocols
  protocols: {
    all: ['protocols'],
    lists: () => [...queryKeys.protocols.all, 'list'],
    list: (filters) => [...queryKeys.protocols.lists(), filters],
    details: () => [...queryKeys.protocols.all, 'detail'],
    detail: (id) => [...queryKeys.protocols.details(), id],
  },

  // Prescriptions
  prescriptions: {
    all: ['prescriptions'],
    lists: () => [...queryKeys.prescriptions.all, 'list'],
    list: (filters) => [...queryKeys.prescriptions.lists(), filters],
    byDoctor: (doctorId) => [...queryKeys.prescriptions.all, 'doctor', doctorId],
    byPatient: (patientId) => [...queryKeys.prescriptions.all, 'patient', patientId],
    detail: (id) => [...queryKeys.prescriptions.all, 'detail', id],
  },

  // Patients
  patients: {
    all: ['patients'],
    lists: () => [...queryKeys.patients.all, 'list'],
    list: (filters) => [...queryKeys.patients.lists(), filters],
    byDoctor: (doctorId) => [...queryKeys.patients.all, 'doctor', doctorId],
    detail: (id) => [...queryKeys.patients.all, 'detail', id],
  },

  // Orders & POs
  orders: {
    all: ['orders'],
    lists: () => [...queryKeys.orders.all, 'list'],
    list: (filters) => [...queryKeys.orders.lists(), filters],
    byUser: (userId) => [...queryKeys.orders.all, 'user', userId],
    bySupplier: (supplierId) => [...queryKeys.orders.all, 'supplier', supplierId],
    byWholesaler: (id) => [...queryKeys.orders.all, 'wholesaler', id],
    detail: (id) => [...queryKeys.orders.all, 'detail', id],
  },

  // Quotations
  quotations: {
    all: ['quotations'],
    list: (filters) => [...queryKeys.quotations.all, 'list', filters],
    detail: (id) => [...queryKeys.quotations.all, 'detail', id],
  },

  // ─── B2B / Wholesaler ────────────────────────────────────────────────────
  wholesaler: {
    all: ['wholesaler'],
    // Clients attributed to a tenant
    clients: (tenantId, filters) => ['wholesaler', 'clients', tenantId, filters],
    // KPI stats for an account manager
    stats: (managerId) => ['wholesaler', 'stats', managerId],
    // Invitations created by a manager
    invitations: (managerId) => ['wholesaler', 'invitations', managerId],
    // Bulk purchase orders
    bulkOrders: (wholesalerId, filters) => ['wholesaler', 'bulkOrders', wholesalerId, filters],
    // Orders placed through a wholesaler tenant
    orders: (wholesalerId, filters) => ['wholesaler', 'orders', wholesalerId, filters],
  },

  // Catalogs (B2B catalog builder)
  catalogs: {
    all: ['catalogs'],
    lists: () => [...queryKeys.catalogs.all, 'list'],
    byOwner: (ownerId, ownerType) => ['catalogs', 'owner', ownerId, ownerType],
    public: () => ['catalogs', 'public'],
    detail: (id) => ['catalogs', 'detail', id],
    leads: (catalogId) => ['catalogs', 'leads', catalogId],
    leadsForOwner: (ownerId) => ['catalogs', 'leadsOwner', ownerId],
  },

  // Invitations (standalone, for ManagerInvitationsTab)
  invitations: {
    all: ['invitations'],
    byManager: (managerId) => ['invitations', 'manager', managerId],
  },

  // ─── Suppliers ───────────────────────────────────────────────────────────────
  suppliers: {
    all: ['suppliers'],
    detail: (id) => ['suppliers', 'detail', id],
    profile: (uid) => ['suppliers', 'profile', uid],
    // Products catalogued by a supplier
    products: (supplierId, filters) => ['suppliers', 'products', supplierId, filters],
    // Orders assigned to a supplier
    orders: (supplierId, filters) => ['suppliers', 'orders', supplierId, filters],
  },

  // ─── RFQs (Purchase Requests) ─────────────────────────────────────────────
  rfqs: {
    all: ['rfqs'],
    bySupplier: (supplierId, filters) => ['rfqs', 'supplier', supplierId, filters],
    byAdmin: (filters) => ['rfqs', 'admin', filters],
    detail: (id) => ['rfqs', 'detail', id],
  },
};

