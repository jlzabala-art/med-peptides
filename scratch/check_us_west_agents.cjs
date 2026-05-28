const { GoogleAuth } = require("google-auth-library");
const path = require("path");

async function checkAgents() {
  try {
    const projectId = "med-peptides-app";
    const locationId = "us-west1";
    const agentIds = ["8356297167190622208", "5868058373068423168"];
    
    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    for (const agentId of agentIds) {
      const url = `https://us-west1-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${locationId}/agents/${agentId}`;
      console.log(`Checking agent at: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      console.log(`  -> Status: ${response.status}`);
      const text = await response.text();
      console.log(`  -> Response: ${text.slice(0, 500)}`);
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

checkAgents();
