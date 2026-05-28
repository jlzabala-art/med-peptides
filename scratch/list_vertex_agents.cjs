const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

async function listVertexAgents() {
  try {
    const projectId = "med-peptides-app";
    const locations = ["global", "us-central1"];

    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    for (const locationId of locations) {
      let domain = "aiplatform.googleapis.com";
      if (locationId !== "global") {
        domain = `${locationId}-aiplatform.googleapis.com`;
      }
      
      const url = `https://${domain}/v1beta1/projects/${projectId}/locations/${locationId}/agents`;
      console.log(`Listing Vertex AI Platform agents in ${locationId} at ${url}`);
      
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        console.log(`  -> Status: ${response.status}`);
        const text = await response.text();
        if (response.status === 200) {
          const data = JSON.parse(text);
          console.log(`  -> Agents:`, JSON.stringify(data.agents || [], null, 2));
        } else {
          console.log(`  -> Error:`, text.slice(0, 500));
        }
      } catch (err) {
        console.error(`  -> Failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listVertexAgents();
