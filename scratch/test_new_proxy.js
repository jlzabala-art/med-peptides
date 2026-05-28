const AGENT_PROXY_URL = "https://genai-app-clinicaiorchestrationcons-1-17797278350-jtlgnxrofa-uc.a.run.app/api-proxy";
const AGENT_SECRET_KEY = "2NiEYYh88rDIG4tNQh8Tw5a951Uj3psD";
const AGENT_PROXY_HEADER = "d9xn0_vbIkgG72HkHDvjZjo6DSGRmSC5";

async function checkAgent() {
  const projectId = "med-peptides-app";
  const locationId = "global";
  const agentId = "agent_1779649883481"; // The new ClinicAI agent
  const cleanSessionId = "test-verification-session-new-proxy";
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

  console.log(`Sending check to originalUrl: ${originalUrl}`);
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
    console.log("Success! Response JSON:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

checkAgent();
