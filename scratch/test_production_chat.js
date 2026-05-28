const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

async function testStandardChat() {
  const payload = {
    message: "Tirzepatide vs Retatrutide",
    sessionId: "test-chat-session-999"
  };

  console.log(`Sending standard chat query to: ${ENDPOINT}`);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`HTTP Status: ${response.status}`);
    const text = await response.text();
    if (!response.ok) {
      console.error(`Error details: ${text}`);
      return;
    }

    console.log("Success! Response:", text);
  } catch (err) {
    console.error("Fetch request failed:", err);
  }
}

testStandardChat();
