const AGENT_PROXY_URL = "https://genai-app-med-peptidesassistant-1-1779650614624-jtlgnxrofa-uc.a.run.app/api-proxy";
const AGENT_SECRET_KEY = "SkO6VEOM34QISP5fsfPjQ7wElSHQv0hi";
const AGENT_PROXY_HEADER = "7S8IApLmp3YmOFyZwLDHgQonf-XAZRPu";

async function checkAgent() {
  const projectId = "med-peptides-app";
  const locationId = "global";
  const agentId = "7f3effe5-c4bf-4b8f-b9f4-32d8d6dd09a9"; // Current working agent ID
  const cleanSessionId = "test-verification-session-env";
  const originalUrl = `https://dialogflow.googleapis.com/v3/projects/${projectId}/locations/${locationId}/agents/${agentId}/sessions/${cleanSessionId}:detectIntent`;

  const payload = {
    originalUrl,
    headers: {
      "content-type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      queryInput: {
        text: {
          text: "hello"
        },
        languageCode: "en"
      },
      queryParams: {
        parameters: {
          role: "patient",
          context: {}
        }
      }
    })
  };

  console.log(`Sending check to: ${originalUrl}`);
  try {
    const response = await fetch(AGENT_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Proxy": AGENT_PROXY_HEADER,
        "X-App-Key": AGENT_SECRET_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error details: ${text}`);
      return;
    }

    const data = await response.json();
    console.log("Response JSON:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

checkAgent();
