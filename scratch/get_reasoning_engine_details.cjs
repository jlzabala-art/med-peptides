const { GoogleAuth } = require("google-auth-library");
const path = require("path");

async function getEngineDetails() {
  try {
    const projectId = "med-peptides-app";
    const locationId = "us-west1";
    const engineId = "8356297167190622208";
    
    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    const url = `https://us-west1-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${locationId}/reasoningEngines/${engineId}`;
    console.log(`Fetching reasoning engine details from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${JSON.stringify(JSON.parse(text), null, 2)}`);
  } catch (err) {
    console.error("Failed:", err);
  }
}

getEngineDetails();
