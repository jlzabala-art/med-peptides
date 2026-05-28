const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

async function testDirect() {
  try {
    const projectId = "med-peptides-app";
    const locations = [
      "global", "us", "eu", 
      "us-central1", "us-east1", "us-west1",
      "europe-west1", "europe-west2", "europe-west3", "europe-west9",
      "asia-northeast1", "australia-southeast1"
    ];
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
      
      try {
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

        console.log(`Region: ${locationId} -> Status: ${response.status}`);
        const text = await response.text();
        if (response.status !== 404) {
          console.log(`  -> Response: ${text.slice(0, 300)}`);
        }
      } catch (err) {
        console.error(`Region: ${locationId} -> Failed to fetch:`, err.message);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testDirect();
