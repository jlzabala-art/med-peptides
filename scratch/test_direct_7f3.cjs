const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

async function testDirect() {
  try {
    const projectId = "med-peptides-app";
    const locationId = "global";
    const agentId = "7f3effe5-c4bf-4b8f-b9f4-32d8d6dd09a9";
    const cleanSessionId = "test-direct-session-7f3";
    const url = `https://dialogflow.googleapis.com/v3/projects/${projectId}/locations/${locationId}/agents/${agentId}/sessions/${cleanSessionId}:detectIntent`;

    const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
    const auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    console.log(`Calling direct Dialogflow for 7f3 at ${url}`);
    
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

    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.slice(0, 1000)}`);
  } catch (err) {
    console.error("Error:", err);
  }
}

testDirect();
