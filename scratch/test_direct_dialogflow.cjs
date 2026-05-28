const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

async function testDirect() {
  try {
    const projectId = "med-peptides-app";
    const locations = ["global", "us-central1", "us", "eu", "europe-west3"];
    const agentId = "agent_1779649883481";

    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    for (const locationId of locations) {
      let domain = "dialogflow.googleapis.com";
      if (locationId !== "global") {
        domain = `${locationId}-dialogflow.googleapis.com`;
      }
      const url = `https://${domain}/v3/projects/${projectId}/locations/${locationId}/agents/${agentId}/sessions/test-session:detectIntent`;
      console.log(`Checking location: ${locationId} at ${url}`);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: "hello"
            },
            languageCode: "en"
          }
        })
      });

      console.log(`  -> Status: ${response.status}`);
      const text = await response.text();
      console.log(`  -> Response: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testDirect();
