const { initializeApp } = require('../functions/node_modules/firebase-admin/app');
const { getFirestore } = require('../functions/node_modules/firebase-admin/firestore');

// Initialize admin SDK
initializeApp({
  projectId: 'med-peptides-app'
});

const db = getFirestore();

// Import the handler from the function
const skuSyncAgent = require('../functions/src/http/ai_sku_sync');

// Mock context for createAgent handler
// In createAgent.js:
// const ctx = { req, body, message, sessionId, userProfile, role, uid, traceId, t0, agentName, agentId, model, maxOutputTokens, callModel, db }
const mockCtx = {
  body: { mode: 'status' },
  db: db,
  role: 'admin',
  userProfile: { role: 'admin' }
};

async function run() {
  try {
    console.log("Calling skuSyncAgent handler with mode: status...");
    // Since createAgent wraps the handler and returns a Firebase onRequest handler,
    // we need to access the underlying config or import the file before it's wrapped, 
    // or inspect how it's exported.
    // Wait, let's see how skuSyncAgent is exported in functions/src/http/ai_sku_sync.js.
    // It exports `module.exports = createAgent({ ... handler: async (ctx) => { ... } })`
    // Let's inspect createAgent.js again.
    // In createAgent.js, it returns:
    // return onRequest({ ... }, async (req, res) => { ... })
    // Since it returns a Cloud Function onRequest handler, we can't easily call the inner handler directly 
    // unless we mock req and res!
    // Yes! Mocking req and res is very easy!
    
    const req = {
      method: 'POST',
      body: {
        mode: 'status',
        userProfile: { role: 'admin' }
      }
    };
    
    const res = {
      set: () => {},
      status: (code) => {
        console.log(`HTTP STATUS: ${code}`);
        return {
          json: (data) => console.log('RESPONSE:', JSON.stringify(data, null, 2)),
          send: (data) => console.log('RESPONSE SEND:', data)
        };
      },
      json: (data) => {
        console.log('RESPONSE JSON:', JSON.stringify(data, null, 2));
      }
    };

    // Invoke the cloud function
    await skuSyncAgent(req, res);
  } catch (err) {
    console.error("Error executing handler:", err);
  }
}

run();
