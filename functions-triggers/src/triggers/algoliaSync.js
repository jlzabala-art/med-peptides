const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { algoliasearch } = require("algoliasearch");

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

// Initialize Algolia client only if keys are present (algoliasearch v5)
const client = (APP_ID && ADMIN_KEY) ? algoliasearch(APP_ID, ADMIN_KEY) : null;

// Index name constants — v5 removed initIndex(), pass indexName per-request
const PRODUCTS_INDEX    = "products";
const PROTOCOLS_INDEX   = "protocols";
const PATIENTS_INDEX    = "atlas_patients";
const CLINICS_INDEX     = "atlas_clinics";
const PHYSICIANS_INDEX  = "atlas_physicians";
const PRESCRIPTIONS_INDEX = "prescriptions";
const ORDERS_INDEX      = "orders";

exports.syncProductToAlgolia = onDocumentWritten("products/{productId}", async (event) => {
    if (!client) {
        console.warn("Algolia credentials missing. Skipping product sync.");
        return;
    }

    const snapshot = event.data;
    const productId = event.params.productId;

    // Handle delete
    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: PRODUCTS_INDEX, objectID: productId });
        return;
    }

    const data = snapshot.after.data();

    // Index ALL products for Admin search capability
    const algoliaRecord = {
        objectID: productId,
        name: data.name || '',
        category: data.category || '',
        tier: data.tier || '',
        tags: data.tags || [],
        description_short: data.description ? data.description.substring(0, 100) : '',
        slug: data.slug || '',
        // Additional fields for Admin filtering/search:
        sku: data.sku || '',
        supplier: data.supplier || '',
        dosage: data.dosage || '',
        warehouse: data.warehouse || '',
        isActive: data.isActive !== undefined ? data.isActive : (data.active !== undefined ? data.active : true),
        stock: data.stock || 0
    };

    try {
        await client.saveObject({ indexName: PRODUCTS_INDEX, body: algoliaRecord });
    } catch (error) {
        console.error("Error syncing product to Algolia:", error);
    }
});

exports.syncProtocolToAlgolia = onDocumentWritten("protocols/{protocolId}", async (event) => {
    if (!client) {
        console.warn("Algolia credentials missing. Skipping protocol sync.");
        return;
    }

    const snapshot = event.data;
    const protocolId = event.params.protocolId;

    // Handle delete
    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: PROTOCOLS_INDEX, objectID: protocolId });
        return;
    }

    const data = snapshot.after.data();

    // Index ALL protocols (admin needs full search coverage regardless of status/visibility)
    const algoliaRecord = {
        objectID:    protocolId,
        name:        data.protocol_name || '',
        category:    data.therapeutic_category || '',
        status:      data.status || 'draft',
        goals:       Array.isArray(data.goals) ? data.goals.join(', ') : (data.goals || ''),
        tags:        Array.isArray(data.tags) ? data.tags : [],
        description: data.description ? data.description.substring(0, 200) : '',
        phaseCount:  Array.isArray(data.phases) ? data.phases.length : 0,
        slug:        data.slug || data.protocol_slug || '',
        version:     data.version || 1,
    };

    try {
        await client.saveObject({ indexName: PROTOCOLS_INDEX, body: algoliaRecord });
    } catch (error) {
        console.error("Error syncing protocol to Algolia:", error);
    }
});


// --- Phase 4: Healthcare Graph Indices ---

exports.syncPatientToAlgolia = onDocumentWritten("patients/{patientId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const patientId = event.params.patientId;

    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: PATIENTS_INDEX, objectID: patientId });
        return;
    }

    const data = snapshot.after.data();
    try {
        await client.saveObject({ indexName: PATIENTS_INDEX, body: { objectID: patientId, ...data } });
    } catch (error) {
        console.error("Error syncing patient to Algolia:", error);
    }
});

exports.syncClinicToAlgolia = onDocumentWritten("clinics/{clinicId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const clinicId = event.params.clinicId;

    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: CLINICS_INDEX, objectID: clinicId });
        return;
    }

    const data = snapshot.after.data();
    try {
        await client.saveObject({ indexName: CLINICS_INDEX, body: { objectID: clinicId, ...data } });
    } catch (error) {
        console.error("Error syncing clinic to Algolia:", error);
    }
});

exports.syncPhysicianToAlgolia = onDocumentWritten("physicians/{physicianId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const physicianId = event.params.physicianId;

    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: PHYSICIANS_INDEX, objectID: physicianId });
        return;
    }

    const data = snapshot.after.data();
    try {
        await client.saveObject({ indexName: PHYSICIANS_INDEX, body: { objectID: physicianId, ...data } });
    } catch (error) {
        console.error("Error syncing physician to Algolia:", error);
    }
});

exports.syncPrescriptionToAlgolia = onDocumentWritten("prescriptions/{prescriptionId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const prescriptionId = event.params.prescriptionId;

    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: PRESCRIPTIONS_INDEX, objectID: prescriptionId });
        return;
    }

    const data = snapshot.after.data();
    
    // Build search record
    const algoliaRecord = {
        objectID: prescriptionId,
        patientName: data.patient?.name || data.patientName || '',
        doctorName: data.doctor?.name || data.doctorName || '',
        protocolName: typeof data.protocol === 'object' ? (data.protocol?.name || '') : (data.protocol || ''),
        status: data.status || 'draft',
        source: data.source || data.type || '',
        createdAt_ts: data.createdAt ? new Date(data.createdAt).getTime() : Date.now()
    };

    try {
        await client.saveObject({ indexName: PRESCRIPTIONS_INDEX, body: algoliaRecord });
    } catch (error) {
        console.error("Error syncing prescription to Algolia:", error);
    }
});

// --- Phase 6: Order Sync ---
exports.syncOrderToAlgolia = onDocumentWritten("orders/{orderId}", async (event) => {
    if (!client) {
        console.warn("Algolia credentials missing. Skipping order sync.");
        return;
    }

    const snapshot = event.data;
    const orderId = event.params.orderId;

    // Handle delete
    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: ORDERS_INDEX, objectID: orderId });
        return;
    }

    const data = snapshot.after.data();

    const algoliaRecord = {
        objectID: orderId,
        orderId: data.orderId || orderId,
        status: data.status || 'pending',
        total: data.total || 0,
        source: data.source || '',
        customerType: data.customerType || '',
        
        // Customer details for searching
        customerName: data.customer?.fullName || data.customer?.firstName || '',
        customerEmail: data.customer?.email || '',
        customerPhone: data.customer?.phone || '',
        
        // Wholesaler details for searching (Bulk Orders)
        wholesalerName: data.wholesalerName || '',
        wholesalerEmail: data.wholesalerEmail || '',
        wholesalerId: data.wholesalerId || '',
        
        // Item details (array of names for text search)
        items: Array.isArray(data.items) ? data.items.map(i => i.name || i.productName) : [],
        
        createdAt: data.createdAt ? (data.createdAt.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt).getTime()) : Date.now(),
    };

    try {
        await client.saveObject({ indexName: ORDERS_INDEX, body: algoliaRecord });
    } catch (error) {
        console.error("Error syncing order to Algolia:", error);
    }
});

exports.syncBulkOrderToAlgolia = onDocumentWritten("bulk_orders/{orderId}", async (event) => {
    if (!client) {
        return;
    }

    const snapshot = event.data;
    const orderId = event.params.orderId;

    if (!snapshot.after.exists) {
        await client.deleteObject({ indexName: ORDERS_INDEX, objectID: orderId });
        return;
    }

    const data = snapshot.after.data();

    const algoliaRecord = {
        objectID: orderId,
        orderId: data.orderId || orderId,
        type: 'bulk_order',
        status: data.status || 'pending',
        total: data.total || data.totalValue || 0,
        
        // Wholesaler details
        wholesalerName: data.wholesalerName || data.userName || '',
        wholesalerEmail: data.wholesalerEmail || data.userEmail || '',
        wholesalerId: data.wholesalerId || data.userId || '',
        
        createdAt: data.createdAt ? (data.createdAt.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt).getTime()) : Date.now(),
    };

    try {
        await client.saveObject({ indexName: ORDERS_INDEX, body: algoliaRecord });
    } catch (error) {
        console.error("Error syncing bulk order to Algolia:", error);
    }
});
