const { GoogleAuth } = require("google-auth-library");
const path = require("path");

async function checkEngineDirect() {
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

    const url = `https://us-west1-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${locationId}/reasoningEngines/${engineId}:query`;
    console.log(`Querying reasoning engine directly at: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        input: {
          message: "hello"
        }
      })
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error("Failed:", err);
  }
}

checkEngineDirect();
