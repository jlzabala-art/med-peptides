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
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Atlas AI: Reporte de Sincronización Nocturna</h2>
      <p>Hola José,</p>
      <p>El proceso automático de emparejamiento de catálogos (Firebase ↔ Zoho Books) ha finalizado con éxito esta madrugada.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #3b82f6;">Resumen de Resultados</h3>
        <ul style="font-size: 16px; line-height: 1.5;">
          <li><strong>Total Emparejados:</strong> ${result.matched}</li>
          <li><strong style="color: #10b981;">Confirmados Automáticamente (Confianza > 90%):</strong> ${result.auto_confirmed}</li>
          <li><strong style="color: #f59e0b;">Pendientes de Revisión (Confianza 60-89%):</strong> ${result.needs_review}</li>
        </ul>
      </div>

      <p>Por favor, accede al panel de administración de la plataforma (Sección <strong>Settings > Integrations > Zoho Books</strong>) para revisar y aprobar los emparejamientos pendientes en la pestaña de <strong>SKU Sync</strong>.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Este es un mensaje automático generado por Atlas AI.<br>
        Mediluxe System Administration
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Atlas AI" <${user}>`,
    to: "jose@mediluxeme.com",
    subject: "Atlas AI: Nuevos productos emparejados (Firebase ↔ Zoho)",
    html: html
  });
  
  console.log("[nightlySkuDiscovery] Email report sent to jose@mediluxeme.com");
}
