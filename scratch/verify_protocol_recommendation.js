const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

async function testProtocolRecommendation() {
  const payload = {
    message: "I want to research Semax, Selank, and Pinealon together. What protocol do you recommend?",
    sessionId: "test-protocol-reco-" + Date.now(),
    query_type: "protocol_query"
  };

  console.log(`Sending query: "${payload.message}"`);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`HTTP Status: ${response.status}`);
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error details: ${text}`);
      return;
    }

    const data = await response.json();
    console.log("\nResponse Success!");
    console.log("Reply:\n", data.reply);
    
    // Check if the reply includes link to neurocognitive protocol
    const includesLink = data.reply.includes('/protocol/');
    console.log(`\nContains /protocol/ link: ${includesLink ? '✅ YES' : '❌ NO'}`);
  } catch (err) {
    console.error("Fetch request failed:", err);
  }
}

testProtocolRecommendation();
