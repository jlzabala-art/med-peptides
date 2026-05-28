const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

async function listEngines() {
  try {
    const projectId = "med-peptides-app";
    const locations = ["global", "us-central1", "us", "eu", "europe-west3"];

    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    for (const locationId of locations) {
      const url = `https://discoveryengine.googleapis.com/v1alpha/projects/${projectId}/locations/${locationId}/collections/default_collection/engines`;
      console.log(`Listing engines in ${locationId} at ${url}`);

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          if (data.engines && data.engines.length > 0) {
            console.log(`  -> Found in ${locationId}:`, JSON.stringify(data.engines, null, 2));
          } else {
            console.log(`  -> Empty in ${locationId}`);
          }
        } else {
          console.log(`  -> Status: ${response.status}`);
        }
      } catch (err) {
        console.error(`  -> Failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("Failed to list engines:", err);
  }
}

listEngines();
