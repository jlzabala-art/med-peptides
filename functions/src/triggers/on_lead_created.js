"use strict";

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");

exports.scoreNewLead = onDocumentCreated("catalogLeadRequests/{leadId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  
  const leadData = snapshot.data();
  const db = getFirestore();

  try {
    // 1. Check if Lead Scoring workflow is enabled
    const configDoc = await db.collection("system_config").doc("workflows").get();
    if (!configDoc.exists) return;
    
    const workflows = configDoc.data();
    if (!workflows.leadScoring || !workflows.leadScoring.enabled) {
      console.log("Lead Scoring is disabled in Automation Engine.");
      return;
    }
    
    const params = workflows.leadScoring.params || {};
    const vipDomains = (params.vip_domains || "mediluxeme.com, clinic.com").split(",").map(s => s.trim().toLowerCase());
    
    // 2. Calculate Score
    let score = 0;
    
    // Email domain check
    if (leadData.email) {
      const domain = leadData.email.split("@")[1]?.toLowerCase();
      if (domain && vipDomains.includes(domain)) {
        score += 50; // VIP Domain bonus
      } else if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
        score += 20; // Professional domain bonus
      }
    }
    
    // Message detail check
    if (leadData.message && leadData.message.length > 50) {
      score += 30; // Detailed request
    }
    
    // Phone number provided check
    if (leadData.phone) {
      score += 10;
    }
    
    // 3. Determine Temperature
    let temperature = "COLD";
    if (score >= 60) temperature = "HOT";
    else if (score >= 30) temperature = "WARM";
    
    // 4. Update the Lead
    await snapshot.ref.update({
      score,
      temperature,
      scoredAt: new Date()
    });
    
    console.log(`Lead ${event.params.leadId} scored: ${score} (${temperature})`);
    
  } catch (err) {
    console.error("Error scoring lead:", err);
  }
});
