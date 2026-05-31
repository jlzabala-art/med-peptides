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

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  const formatter = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' });
  const totalInvoicedFormatted = formatter.format(data.totalInvoiced);

  const topDoctorsHtml = data.topDoctors.length > 0
    ? data.topDoctors.map((doc, idx) => `<li>${idx+1}. Dr. ${doc.name}: <strong>${doc.minutes} min</strong></li>`).join("")
    : "<li>No hubo actividad de doctores registrada.</li>";
    
  const lowStockHtml = data.lowStockItems.length > 0
    ? data.lowStockItems.slice(0, 5).map(item => `<li>${item.name} (SKU: ${item.sku}) - Stock: <strong style="color:red;">${item.stock_on_hand}</strong></li>`).join("")
    : "<li>Todo el stock está en niveles óptimos.</li>";

  const html = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">☀️ Admin Daily Digest</h2>
      <p>Hola José,</p>
      <p>Aquí tienes el resumen de actividad de la plataforma correspondiente al <strong>${data.yesterdayStr}</strong>.</p>
      
      <h3 style="color: #3b82f6;">💰 Resumen Financiero (Zoho Books)</h3>
      <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
        <li>Nuevas facturas emitidas: <strong>${data.invoicesCount}</strong></li>
        <li>Volumen facturado: <strong>${totalInvoicedFormatted}</strong></li>
      </ul>

      <h3 style="color: #10b981;">👨‍⚕️ Top Doctores Conectados</h3>
      <p>Los especialistas que pasaron más tiempo en la plataforma ayer:</p>
      <ul>
        ${topDoctorsHtml}
      </ul>

      <h3 style="color: #f59e0b;">📋 Tareas Pendientes</h3>
      <ul>
        <li>Pacientes esperando aprobación: <strong>${data.pendingPatients}</strong></li>
      </ul>

      <h3 style="color: #ef4444;">⚠️ Alertas Médicas (Stock Bajo)</h3>
      <p>Productos con menos de 10 unidades en inventario:</p>
      <ul>
        ${lowStockHtml}
        ${data.lowStockItems.length > 5 ? `<li>... y ${data.lowStockItems.length - 5} más (Ver Zoho)</li>` : ""}
      </ul>

      <p style="margin-top: 40px; font-size: 12px; color: #888;">
        Este es un mensaje generado automáticamente por Mediluxe System Administration.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Mediluxe Admin" <${user}>`,
    to: "jose@mediluxeme.com",
    subject: `☀️ Admin Daily Digest: ${data.yesterdayStr}`,
    html: html
  });
  
  console.log(`[adminDailyDigest] Email digest sent for ${data.yesterdayStr}.`);
}
