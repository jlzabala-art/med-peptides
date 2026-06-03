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
      ? data.topDoctors.map((doc, idx) => `<li>${idx+1}. Dr. ${doc.name}: <strong>${doc.minutes} min</strong></li>`).join("")
      : "<li>No hubo actividad de doctores registrada.</li>";
      
    const lowStockHtml = data.lowStockItems.length > 0
      ? data.lowStockItems.slice(0, 5).map(item => `<li>${item.name} (SKU: ${item.sku}) - Stock: <strong style="color:red;">${item.stock_on_hand}</strong></li>`).join("")
      : "<li>Todo el stock está en niveles óptimos.</li>";

    const html = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6; background-color: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 20px; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Mediluxe Logo" style="max-height: 60px; margin-bottom: 10px;" onerror="this.src='https://ui-avatars.com/api/?name=Mediluxe&background=0D8ABC&color=fff&size=100'"/>
          <h2 style="color: #2c3e50; margin: 0;">Admin Daily Digest</h2>
        </div>
        
        <p>Hola José,</p>
        <p>Aquí tienes el resumen de actividad de la plataforma correspondiente al <strong>${data.yesterdayStr}</strong>.</p>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #3b82f6; display: flex; align-items: center; justify-content: space-between;">
            <span>💰 Resumen Financiero</span>
            <a href="${baseUrl}/admin?tab=finance" style="font-size: 12px; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 12px; text-decoration: none;">Ver Dashboard</a>
          </h3>
          <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
            <li>Nuevas facturas emitidas: <strong>${data.invoicesCount}</strong></li>
            <li>Volumen facturado: <strong>${totalInvoicedFormatted}</strong></li>
            <li>Balance de Caja (Estimado): <strong>Ver detalles en App</strong></li>
          </ul>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #10b981; display: flex; align-items: center; justify-content: space-between;">
            <span>👨‍⚕️ Top Doctores Conectados</span>
            <a href="${baseUrl}/admin?tab=users" style="font-size: 12px; background: #10b981; color: white; padding: 4px 10px; border-radius: 12px; text-decoration: none;">Gestionar Usuarios</a>
          </h3>
          <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
            ${topDoctorsHtml}
          </ul>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #f59e0b; display: flex; align-items: center; justify-content: space-between;">
            <span>📋 Tareas Pendientes</span>
            <a href="${baseUrl}/admin?tab=users" style="font-size: 12px; background: #f59e0b; color: white; padding: 4px 10px; border-radius: 12px; text-decoration: none;">Revisar Solicitudes</a>
          </h3>
          <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
            <li>Pacientes esperando aprobación: <strong>${data.pendingPatients}</strong></li>
            <li>Tickets de soporte abiertos: <strong>Ver en App</strong></li>
          </ul>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #ef4444; display: flex; align-items: center; justify-content: space-between;">
            <span>⚠️ Alertas Médicas (Stock Bajo)</span>
            <a href="${baseUrl}/admin?tab=products" style="font-size: 12px; background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; text-decoration: none;">Ver Inventario</a>
          </h3>
          <div style="background: #fdf2f2; padding: 15px 30px; border-radius: 8px; border: 1px solid #fee2e2;">
            <p style="margin-top: 0; font-weight: bold; color: #b91c1c;">Productos con menos de 10 unidades en inventario:</p>
            <ul>
              ${lowStockHtml}
              ${data.lowStockItems.length > 5 ? `<li>... y ${data.lowStockItems.length - 5} más (Ver App)</li>` : ""}
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${baseUrl}/admin" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; letter-spacing: 0.5px;">Abrir Panel de Administración</a>
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px;">
          Este es un mensaje generado automáticamente por Mediluxe System Administration.<br/>
          Si no deseas recibir estos correos, puedes ajustar tus preferencias en tu perfil.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Mediluxe Admin" <${user}>`,
      to: "jose@mediluxeme.com",
      subject: `Mediluxe Admin Daily Digest: ${data.yesterdayStr}`,
      html: html
    });
    
    console.log(`[adminDailyDigest] Email digest sent for ${data.yesterdayStr}.`);
  } catch (error) {
    console.error("[adminDailyDigest] Failed to construct/send email:", error);
  }
}
