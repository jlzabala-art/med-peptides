const { initializeApp } = require("firebase-admin/app");
const admin = require("firebase-admin");
const path = require("path");

// Set env variables for local run
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, "../serviceAccountKey.json");
process.env.VERTEX_PROJECT_ID = "med-peptides-app";
process.env.VERTEX_AGENT_ID = "agent_1779649883481";
process.env.VERTEX_LOCATION_ID = "global";

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  initializeApp({
    projectId: "med-peptides-app"
  });
}

const handler = require("../functions/src/http/ai.js");

// We need to extract the raw handler function from the onRequest wrapper if needed,
// but onRequest in firebase-functions v2 is a function that can be called directly or as (req, res).
// Let's inspect what onRequest returns. It is usually a Cloud Function.
// Let's create mock request and response.

const mockReq = {
  method: "POST",
  body: {
    message: "I want to research Semax, Selank, and Pinealon together. What protocol do you recommend?",
    sessionId: "test-local-session-" + Date.now(),
    query_type: "protocol_query",
    history: []
  }
};

const mockRes = {
  headers: {},
  set(key, val) {
    this.headers[key] = val;
    return this;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log("\n--- JSON RESPONSE ---");
    console.log("Status Code:", this.statusCode || 200);
    console.log("Data:", JSON.stringify(data, null, 2));
  },
  send(data) {
    console.log("\n--- SEND RESPONSE ---");
    console.log("Status Code:", this.statusCode || 200);
    console.log("Data:", data);
  }
};

console.log("Calling local handler...");
// In Firebase Functions v2, onRequest returns a function that can handle (req, res) directly
// or via its .__run or similar, but calling it directly as handler(mockReq, mockRes) works in v2.
handler(mockReq, mockRes).catch(err => {
  console.error("Local execution failed with error:", err);
});
