const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

async function testPrescriptionIntake() {
  const payload = {
    message: "BPC-157 5mg Vial x 3\nThymosin Beta-4 10mg + GHK-Cu 50mg topical cream\nApply thin layer nightly to shoulder.",
    sessionId: "test-verification-session-123",
    query_type: "prescription_intake"
  };

  console.log(`Sending prescription intake test to: ${ENDPOINT}`);
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
    console.log("Success! Response JSON:", JSON.stringify(data, null, 2));

    if (data.catalog && Array.isArray(data.catalog) && data.quotation && Array.isArray(data.quotation)) {
      console.log("✅ Schema structure is valid!");
    } else {
      console.error("❌ Schema structure is invalid!");
    }
  } catch (err) {
    console.error("Fetch request failed:", err);
  }
}

testPrescriptionIntake();
