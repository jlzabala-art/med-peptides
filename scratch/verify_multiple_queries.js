const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

async function testMultipleQueries() {
  const sessionId = "test-session-multi-" + Date.now();
  console.log(`Starting multi-query test with session: ${sessionId}`);

  for (let i = 1; i <= 12; i++) {
    const payload = {
      message: `Test query number ${i}: Tell me about Semax neuroprotective benefits in simple terms.`,
      sessionId: sessionId,
      query_type: "general"
    };

    console.log(`Sending query ${i}...`);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log(`Query ${i} status: ${response.status}`);
      if (!response.ok) {
        const text = await response.text();
        console.error(`Query ${i} failed: ${text}`);
        break;
      }

      const data = await response.json();
      if (data.rateLimited) {
        console.error(`❌ Hit rate limit on query ${i}!`);
        break;
      } else {
        console.log(`✅ Query ${i} response length: ${data.reply?.length || 0}`);
      }
    } catch (err) {
      console.error(`Fetch query ${i} failed:`, err);
      break;
    }
  }
}

testMultipleQueries();
