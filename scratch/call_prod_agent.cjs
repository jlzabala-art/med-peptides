// Use global fetch

const AGENT_URL = "https://europe-west1-med-peptides-app.cloudfunctions.net/skuSyncAgent";

async function run() {
  try {
    const payload = {
      mode: "status",
      userProfile: {
        role: "admin",
        uid: "jvaUivJ4EDRYsm56FYUJiw31akI3"
      }
    };
    
    console.log(`Calling production agent URL: ${AGENT_URL}...`);
    const resp = await fetch(AGENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`HTTP Status: ${resp.status}`);
    const data = await resp.json();
    console.log(`Response keys:`, Object.keys(data));
    console.log(`Response reply:`, data.reply);
    console.log(`Response extras:`, JSON.stringify(data.extras, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
