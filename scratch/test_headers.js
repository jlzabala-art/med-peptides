const AGENT_PROXY_URL = "https://genai-app-med-peptidesassistant-1-1779650614624-jtlgnxrofa-uc.a.run.app/api-proxy";
const AGENT_SECRET_KEY = "SkO6VEOM34QISP5fsfPjQ7wElSHQv0hi";
const AGENT_PROXY_HEADER = "NOkK7TQ48RqFF7L0nRpDStstWhoyH6w-";

async function testHeaders() {
  const projectId = "med-peptides-app";
  const locationId = "global";
  const agentId = "agent_1779649883481";
  const cleanSessionId = "test-session";
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
      }
    })
  };

  const origins = [
    "https://med-peptides-app-27a3a.web.app",
    "https://med-peptides.com",
    "http://localhost:5173",
    "https://genai-app-med-peptidesassistant-1-1779650614624-jtlgnxrofa-uc.a.run.app",
    ""
  ];

  for (const origin of origins) {
    console.log(`Testing origin: "${origin}"`);
    const headers = {
      "Content-Type": "application/json",
      "X-App-Proxy": AGENT_PROXY_HEADER,
      "X-App-Key": AGENT_SECRET_KEY
    };
    if (origin) {
      headers["Origin"] = origin;
      headers["Referer"] = origin + "/";
    }

    try {
      const response = await fetch(AGENT_PROXY_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      console.log(`  -> Status: ${response.status}`);
      const text = await response.text();
      console.log(`  -> Reply: ${text.slice(0, 150)}`);
    } catch (err) {
      console.error(`  -> Failed:`, err);
    }
  }
}

testHeaders();
