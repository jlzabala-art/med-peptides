const path = require("path");
const express = require("express");

// Set env variables for local run
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, "../serviceAccountKey.json");
process.env.VERTEX_PROJECT_ID = "med-peptides-app";
process.env.VERTEX_AGENT_ID = "agent_1779649883481";
process.env.VERTEX_LOCATION_ID = "global";
process.env.GEMINI_API_KEY = "AIzaSyDBW_pCEweLrtZm2rxwT06nOUbyyik5rmw";

// Override logger before importing handler
const utils = require("../functions/src/http/ai_utils.js");
utils.structuredLogger.error = (msg, err, extra) => {
  console.error("LOGGER ERROR MSG:", msg);
  if (err) {
    console.error("LOGGER ERROR STACK:", err.stack || err);
  }
  if (extra) {
    console.error("LOGGER ERROR EXTRA:", extra);
  }
};

// Import through index.js which initializes Firebase Admin!
const { clinicalAiAssistant: handler } = require("../functions/index.js");

const app = express();
app.use(express.json());
app.post('/test', handler);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server listening on port ${port}`);
  try {
    const res = await fetch(`http://localhost:${port}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "I want to explore longevity and anti-aging protocols.",
        sessionId: "test-session-123"
      })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error("Fetch request failed:", err);
  } finally {
    server.close();
  }
});
