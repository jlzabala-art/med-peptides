const AGENT_PROXY_URL = "https://genai-app-clinicaiorchestrationcons-1-17797278350-jtlgnxrofa-uc.a.run.app/api-proxy";
const AGENT_SECRET_KEY = "2NiEYYh88rDIG4tNQh8Tw5a951Uj3psD";
const AGENT_PROXY_HEADER = "d9xn0_vbIkgG72HkHDvjZjo6DSGRmSC5";

async function testPayload(payloadBody, label) {
  const projectId = "med-peptides-app";
  const locationId = "us-west1";
  const engineId = "8356297167190622208";
  const originalUrl = `https://us-west1-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${locationId}/reasoningEngines/${engineId}:query`;

  const payload = {
    originalUrl,
    headers: {
      "content-type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(payloadBody)
  };

  console.log(`\nTesting format: ${label}`);

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
    const text = await response.text();
    console.log(`Response Text: ${text.slice(0, 500)}`);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

async function run() {
  // Try 1: input as string
  await testPayload({ input: "hello" }, 'input: "hello"');

  // Try 2: input object with query
  await testPayload({ input: { query: "hello" } }, 'input: { query: "hello" }');

  // Try 3: input object with text
  await testPayload({ input: { text: "hello" } }, 'input: { text: "hello" }');

  // Try 4: direct query property
  await testPayload({ query: "hello" }, 'query: "hello"');
}

run();
