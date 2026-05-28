const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
if (fs.existsSync("./serviceAccountKey.json")) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccountKey.json")),
    projectId: "med-peptides-app"
  });
} else {
  admin.initializeApp({
    projectId: "med-peptides-app"
  });
}

async function testDirect() {
  try {
    const projectId = "med-peptides-app";
    const locationId = "global";
    const agentId = "agent_1779649883481";
    const cleanSessionId = "test-direct-session";
    const url = `https://dialogflow.googleapis.com/v3/projects/${projectId}/locations/${locationId}/agents/${agentId}/sessions/${cleanSessionId}:detectIntent`;

    // Get OAuth token from Firebase Admin credential
    const tokenObj = await admin.app().options.credential.getAccessToken();
    const token = tokenObj.accessToken;

    console.log("Obtained OAuth token. Expiry:", tokenObj.expirationTime);
    console.log(`Calling direct Dialogflow URL: ${url}`);

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
    const resText = await response.text();
    console.log("Response text:", resText.slice(0, 500));
  } catch (err) {
    console.error("Failed directly:", err);
  }
}

testDirect();
