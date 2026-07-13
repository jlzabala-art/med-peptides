const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const { discover } = require("../http/ai_sku_sync");
const nodemailer = require("nodemailer");
const { gmailUser, gmailAppPass } = require("../config");

/**
 * Runs every night at 3:00 AM Europe/Madrid time.
 * Automatically runs the AI Discovery agent to find matches between Firebase and Zoho Books.
 * Sends an email report to jose@mediluxeme.com with the results.
 */
exports.nightlySkuDiscovery = onSchedule({
  schedule: "*/30 * * * *",
  timeZone: "Europe/Madrid",
  timeoutSeconds: 540, // 9 minutes, AI can take some time
  secrets: [gmailUser, gmailAppPass, "GEMINI_API_KEY", "ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN"]
}, async (event) => {
  console.log("[nightlySkuDiscovery] Starting scheduled AI SKU Discovery...");
  const db = getFirestore();
  
  try {
    // Run the same discover logic as the HTTP agent, using an AED rate of 3.67
    const result = await discover(db, 3.67, true);
    
    console.log(`[nightlySkuDiscovery] Discovery complete. Matched: ${result.matched}, Auto-confirmed: ${result.auto_confirmed}, Needs Review: ${result.needs_review}`);

    // If there is anything found, send an email
    if (result.matched > 0) {
      await sendEmailReport(result);
    } else {
      console.log("[nightlySkuDiscovery] No matches found, no email sent.");
    }
    
  } catch (err) {
    console.error("[nightlySkuDiscovery] Error during scheduled discovery:", err);
  }
});

async function sendEmailReport(result) {
  const user = gmailUser.value();
  const pass = gmailAppPass.value();
  
  if (!user || !pass) {
    console.warn("[nightlySkuDiscovery] Gmail credentials not found. Skipping email report.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; line-height: 1.6; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
      <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ATLAS HEALTH</h1>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Nightly Sync Report</p>
      </div>
      
      <p style="font-size: 16px;">Hi José,</p>
      <p style="font-size: 16px;">The automatic catalog matching process (Firebase ↔ Zoho Books) has successfully completed tonight.</p>
      
      <div style="margin-bottom: 28px;">
        <h3 style="color: #3b82f6; display: flex; align-items: center; justify-content: space-between; font-size: 18px; margin-bottom: 12px;">
          <span>📋 Results Summary</span>
        </h3>
        <ul style="background: #f8fafc; padding: 16px 20px 16px 36px; border-radius: 8px; margin: 0; border: 1px solid #f1f5f9; list-style-type: disc;">
          <li style="padding: 4px 0;"><strong>Total Matched:</strong> ${result.matched}</li>
          <li style="padding: 4px 0;"><strong style="color: #10b981;">Auto-Confirmed (>90% confidence):</strong> ${result.auto_confirmed}</li>
          <li style="padding: 4px 0;"><strong style="color: #f59e0b;">Needs Review (60-89% confidence):</strong> ${result.needs_review}</li>
        </ul>
      </div>

      <p style="font-size: 16px;">Please access the platform admin panel (<strong>System & AI > Zoho Books</strong>) to review and approve pending matches in the <strong>SKU Sync</strong> tab.</p>
      
      <div style="text-align: center; margin-top: 40px; margin-bottom: 10px;">
        <a href="https://platform.regenpept.com/admin/sku-sync" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Review Products</a>
      </div>
      
      <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px; line-height: 1.5;">
        This is an automatically generated message by Atlas Health AI.<br/>
        Atlas Health System Administration
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Atlas Health AI" <${user}>`,
    to: "jose@mediluxeme.com",
    subject: "Atlas Health: New Products Matched (Firebase ↔ Zoho)",
    html: html
  });
  
  console.log("[nightlySkuDiscovery] Email report sent to jose@mediluxeme.com");
}
