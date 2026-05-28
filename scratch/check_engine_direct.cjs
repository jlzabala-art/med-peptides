const { GoogleAuth } = require("google-auth-library");
const path = require("path");

async function checkEngine() {
  try {
    const projectId = "med-peptides-app";
    const locationId = "global";
    const collectionId = "default_collection";
    const engineId = "agent_1779649883481";
    
    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    const url = `https://discoveryengine.googleapis.com/v1alpha/projects/${projectId}/locations/${locationId}/collections/${collectionId}/engines/${engineId}`;
    console.log(`Checking engine directly: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error("Failed:", err);
  }
}

checkEngine();
