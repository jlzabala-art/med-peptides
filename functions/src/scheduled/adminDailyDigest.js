const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { gmailUser, gmailAppPass } = require("../config");
const { listInvoices, listAllItems } = require("../lib/zoho_client");

/**
 * Runs every day at 07:00 AM (Asia/Dubai time).
 * Gathers platform metrics and sends a daily digest email to the super admin.
 */
exports.adminDailyDigest = onSchedule({
  schedule: "0 7 * * *",
  timeZone: "Asia/Dubai",
  timeoutSeconds: 300,
  secrets: [gmailUser, gmailAppPass, "ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN"]
}, async (event) => {
  console.log("[adminDailyDigest] Starting daily digest generation...");
  const db = getFirestore();
  
  try {
    // 1. Calculate "Yesterday" Date (YYYY-MM-DD)
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // 2. Fetch Zoho Financials (Invoices from yesterday)
    let invoicesYesterday = [];
    try {
      invoicesYesterday = await listInvoices({
        date_start: yesterdayStr,
        date_end: yesterdayStr
      });
    } catch (e) {
      console.error("[adminDailyDigest] Failed to fetch invoices:", e);
    }
    const totalInvoiced = invoicesYesterday.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // 3. Fetch Zoho Inventory Alerts
    let lowStockItems = [];
    try {
      const allItems = await listAllItems({ filter_by: "Status.Active" });
      lowStockItems = allItems.filter(item => item.stock_on_hand !== null && item.stock_on_hand < 10);
    } catch (e) {
      console.error("[adminDailyDigest] Failed to fetch inventory:", e);
    }

    // 4. Fetch Firebase Pending Patients
    let pendingPatients = 0;
    try {
      const patientsSnap = await db.collection("users")
        .where("role", "==", "patient")
        .where("status", "==", "pending")
        .get();
      pendingPatients = patientsSnap.size;
    } catch (e) {
      console.error("[adminDailyDigest] Failed to fetch patients:", e);
    }

    // 5. Fetch Top 3 Connected Doctors Yesterday
    let topDoctors = [];
    try {
      const sessionsSnap = await db.collection("user_sessions")
        .where("date", "==", yesterdayStr)
        .where("role", "==", "doctor")
        .orderBy("total_seconds", "desc")
        .limit(3)
        .get();
        
      sessionsSnap.forEach(doc => {
        const data = doc.data();
        const mins = Math.floor((data.total_seconds || 0) / 60);
        topDoctors.push({ name: data.displayName, minutes: mins });
      });
    } catch (e) {
      console.error("[adminDailyDigest] Failed to fetch sessions:", e);
    }

    // 6. Send Email
    await sendDigestEmail({
      yesterdayStr,
      invoicesCount: invoicesYesterday.length,
      totalInvoiced,
      lowStockItems,
      pendingPatients,
      topDoctors
    });
    
  } catch (err) {
    console.error("[adminDailyDigest] Error generating digest:", err);
  }
});

async function sendDigestEmail(data) {
  const user = gmailUser.value();
  const pass = gmailAppPass.value();
  
  if (!user || !pass) {
    console.warn("[adminDailyDigest] Gmail credentials missing.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  const formatter = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' });
  const totalInvoicedFormatted = formatter.format(data.totalInvoiced);

    const baseUrl = 'https://med-peptides-app-27a3a.web.app';
    const logoUrl = `${baseUrl}/logo.png`; // assuming logo.png is the main logo

    const topDoctorsHtml = data.topDoctors.length > 0
      ? data.topDoctors.map((doc, idx) => `<li style="padding: 4px 0;">${idx+1}. Dr. ${doc.name}: <strong style="color:#10b981;">${doc.minutes} min</strong></li>`).join("")
      : "<li style='padding: 4px 0;'>No doctor activity recorded.</li>";
      
    const lowStockHtml = data.lowStockItems.length > 0
      ? data.lowStockItems.slice(0, 5).map(item => `<li style="padding: 4px 0;">${item.name} (SKU: ${item.sku}) - Stock: <strong style="color:red;">${item.stock_on_hand}</strong></li>`).join("")
      : "<li style='padding: 4px 0;'>All stock levels are optimal.</li>";

    const html = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; line-height: 1.6; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ATLAS HEALTH</h1>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Admin Daily Digest</p>
        </div>
        
        <p style="font-size: 16px;">Hi José,</p>
        <p style="font-size: 16px;">Here is your platform activity digest for <strong>${data.yesterdayStr}</strong>.</p>
        
        <div style="margin-bottom: 28px;">
          <h3 style="color: #3b82f6; display: flex; align-items: center; justify-content: space-between; font-size: 18px; margin-bottom: 12px;">
            <span>💰 Financial Overview</span>
            <a href="${baseUrl}/admin/finance-overview" style="font-size: 12px; background: #eff6ff; color: #3b82f6; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 600; border: 1px solid #bfdbfe;">View Dashboard</a>
          </h3>
          <ul style="background: #f8fafc; padding: 16px 20px 16px 36px; border-radius: 8px; margin: 0; border: 1px solid #f1f5f9; list-style-type: disc;">
            <li style="padding: 4px 0;">New invoices issued: <strong>${data.invoicesCount}</strong></li>
            <li style="padding: 4px 0;">Invoiced volume: <strong>${totalInvoicedFormatted}</strong></li>
            <li style="padding: 4px 0;">Cash Balance (Est.): <strong>View details in App</strong></li>
          </ul>
        </div>

        <div style="margin-bottom: 28px;">
          <h3 style="color: #10b981; display: flex; align-items: center; justify-content: space-between; font-size: 18px; margin-bottom: 12px;">
            <span>👨‍⚕️ Top Connected Doctors</span>
            <a href="${baseUrl}/admin/doctors" style="font-size: 12px; background: #ecfdf5; color: #10b981; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 600; border: 1px solid #a7f3d0;">Manage Users</a>
          </h3>
          <ul style="background: #f8fafc; padding: 16px 20px 16px 36px; border-radius: 8px; margin: 0; border: 1px solid #f1f5f9;">
            ${topDoctorsHtml}
          </ul>
        </div>

        <div style="margin-bottom: 28px;">
          <h3 style="color: #f59e0b; display: flex; align-items: center; justify-content: space-between; font-size: 18px; margin-bottom: 12px;">
            <span>📋 Pending Tasks</span>
            <a href="${baseUrl}/admin/patients" style="font-size: 12px; background: #fffbeb; color: #f59e0b; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 600; border: 1px solid #fde68a;">Review Requests</a>
          </h3>
          <ul style="background: #f8fafc; padding: 16px 20px 16px 36px; border-radius: 8px; margin: 0; border: 1px solid #f1f5f9; list-style-type: disc;">
            <li style="padding: 4px 0;">Patients awaiting approval: <strong>${data.pendingPatients}</strong></li>
            <li style="padding: 4px 0;">Open support tickets: <strong>View in App</strong></li>
          </ul>
        </div>

        <div style="margin-bottom: 28px;">
          <h3 style="color: #ef4444; display: flex; align-items: center; justify-content: space-between; font-size: 18px; margin-bottom: 12px;">
            <span>⚠️ Inventory Alerts (Low Stock)</span>
            <a href="${baseUrl}/admin/stock" style="font-size: 12px; background: #fef2f2; color: #ef4444; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 600; border: 1px solid #fecaca;">View Inventory</a>
          </h3>
          <div style="background: #fef2f2; padding: 16px 20px 16px 20px; border-radius: 8px; border: 1px solid #fecaca;">
            <p style="margin: 0 0 10px 0; font-weight: 700; color: #b91c1c;">Products with fewer than 10 units in stock:</p>
            <ul style="margin: 0; padding-left: 16px;">
              ${lowStockHtml}
              ${data.lowStockItems.length > 5 ? `<li style="padding: 4px 0; font-style: italic; color: #7f1d1d;">... and ${data.lowStockItems.length - 5} more (View App)</li>` : ""}
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; margin-bottom: 10px;">
          <a href="${baseUrl}/admin" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Open Admin Dashboard</a>
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px; line-height: 1.5;">
          This is an automatically generated message from the Atlas Health System Administration.<br/>
          If you no longer wish to receive these emails, you can adjust your preferences in your profile.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Atlas Health Admin" <${user}>`,
      to: "jose@mediluxeme.com",
      subject: `Atlas Health Admin Daily Digest: ${data.yesterdayStr}`,
      html: html
    });
    
    console.log(`[adminDailyDigest] Email digest sent for ${data.yesterdayStr}.`);
  } catch (error) {
    console.error("[adminDailyDigest] Failed to construct/send email:", error);
  }
}
