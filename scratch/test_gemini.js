async function testGemini() {
  const key = "AIzaSyDBW_pCEweLrtZm2rxwT06nOUbyyik5rmw";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const payload = {
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log(`Gemini status: ${response.status}`);
    const text = await response.text();
    console.log(`Gemini reply: ${text}`);
  } catch (err) {
    console.error("Gemini call failed:", err);
  }
}

testGemini();
