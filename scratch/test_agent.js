// Native fetch is available in modern Node.js
const AGENT_PROXY_URL = "https://genai-app-med-peptidesassistant-1-1779650614624-jtlgnxrofa-uc.a.run.app/api-proxy";
const AGENT_SECRET_KEY = "SkO6VEOM34QISP5fsfPjQ7wElSHQv0hi";
const AGENT_PROXY_HEADER = "NOkK7TQ48RqFF7L0nRpDStstWhoyH6w-";

async function checkAgent() {
  const cleanSessionId = "test-verification-session";
  const originalUrl = `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/gemini-2.5-flash:generateContent`;

  const payload = {
    originalUrl,
    headers: {
      "content-type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: "hello" }]
        }
      ],
      generationConfig: {
        temperature: 0.2
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
