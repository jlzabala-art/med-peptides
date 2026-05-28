const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

async function listAllAgents() {
  try {
    const projectId = "med-peptides-app";
    const locations = [
      "global", "us", "eu", 
      "us-central1", "us-east1", "us-west1",
      "europe-west1", "europe-west2", "europe-west3", "europe-west9",
      "asia-northeast1", "australia-southeast1"
    ];

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
      const url = `https://${domain}/v3/projects/${projectId}/locations/${locationId}/agents`;
      
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          if (data.agents && data.agents.length > 0) {
            console.log(`[FOUND AGENTS] Region: ${locationId}`);
            console.log(JSON.stringify(data.agents, null, 2));
          }
        } else {
          // console.log(`Region: ${locationId} -> Status: ${response.status}`);
        }
      } catch (err) {
        console.error(`Region: ${locationId} -> Failed:`, err.message);
      }
    }
    console.log("Search complete.");
  } catch (err) {
    console.error("Error:", err);
  }
}

listAllAgents();
