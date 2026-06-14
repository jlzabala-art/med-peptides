const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const algoliasearch = require("algoliasearch");

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

// Initialize Algolia client only if keys are present
const client = (APP_ID && ADMIN_KEY) ? algoliasearch(APP_ID, ADMIN_KEY) : null;

// Initialize indices
const productsIndex = client ? client.initIndex("products") : null;
const protocolsIndex = client ? client.initIndex("protocols") : null;

exports.syncProductToAlgolia = onDocumentWritten("products/{productId}", async (event) => {
    if (!client) {
        console.warn("Algolia credentials missing. Skipping product sync.");
        return;
    }

    const snapshot = event.data;
    const productId = event.params.productId;

    // Handle delete
    if (!snapshot.after.exists) {
        await productsIndex.deleteObject(productId);
        return;
    }

    const data = snapshot.after.data();

    // To save Algolia quota, only index active products
    if (!data.active) {
        // If it was active before and now isn't, remove it from index
        const beforeData = snapshot.before.exists ? snapshot.before.data() : null;
        if (beforeData && beforeData.active) {
            await productsIndex.deleteObject(productId);
        }
        return;
    }

    // Keep payload extremely lightweight to save record size limits and latency
    const algoliaRecord = {
        objectID: productId,
        name: data.name || '',
        category: data.category || '',
        tier: data.tier || '',
        tags: data.tags || [],
        description_short: data.description ? data.description.substring(0, 100) : '',
        slug: data.slug || ''
    };

    try {
        await productsIndex.saveObject(algoliaRecord);
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

    if (!snapshot.after.exists) {
        await protocolsIndex.deleteObject(protocolId);
        return;
    }

    const data = snapshot.after.data();

    // To save Algolia quota, ONLY index public AND active protocols
    const isEligible = data.active === true && data.visibility === 'public';

    if (!isEligible) {
        // Remove if it was previously eligible
        const beforeData = snapshot.before.exists ? snapshot.before.data() : null;
        if (beforeData && beforeData.active === true && beforeData.visibility === 'public') {
            await protocolsIndex.deleteObject(protocolId);
        }
        return;
    }

    // Keep payload lightweight
    const algoliaRecord = {
        objectID: protocolId,
        name: data.protocol_name || '',
        slug: data.protocol_slug || '',
        category: data.category || '',
        theme: data.theme || '',
        description: data.description ? data.description.substring(0, 100) : ''
    };

    try {
        await protocolsIndex.saveObject(algoliaRecord);
    } catch (error) {
        console.error("Error syncing protocol to Algolia:", error);
    }
});

// --- Phase 4: Healthcare Graph Indices ---

const patientsIndex = client ? client.initIndex("atlas_patients") : null;
exports.syncPatientToAlgolia = onDocumentWritten("patients/{patientId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const patientId = event.params.patientId;
    
    if (!snapshot.after.exists) {
        await patientsIndex.deleteObject(patientId);
        return;
    }
    
    const data = snapshot.after.data();
    await patientsIndex.saveObject({
        objectID: patientId,
        ...data
    });
});

const clinicsIndex = client ? client.initIndex("atlas_clinics") : null;
exports.syncClinicToAlgolia = onDocumentWritten("clinics/{clinicId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const clinicId = event.params.clinicId;
    
    if (!snapshot.after.exists) {
        await clinicsIndex.deleteObject(clinicId);
        return;
    }
    
    const data = snapshot.after.data();
    await clinicsIndex.saveObject({
        objectID: clinicId,
        ...data
    });
});

const physiciansIndex = client ? client.initIndex("atlas_physicians") : null;
exports.syncPhysicianToAlgolia = onDocumentWritten("physicians/{physicianId}", async (event) => {
    if (!client) return;
    const snapshot = event.data;
    const physicianId = event.params.physicianId;
    
    if (!snapshot.after.exists) {
        await physiciansIndex.deleteObject(physicianId);
        return;
    }
    
    const data = snapshot.after.data();
    await physiciansIndex.saveObject({
        objectID: physicianId,
        ...data
    });
});
