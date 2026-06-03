const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { gmailUser, gmailAppPass } = require("../config");

exports.weeklyCompetitorDigest = onSchedule({
  schedule: "0 8 * * 1", // Every Monday at 8:00 AM
  timeZone: "Asia/Dubai",
  timeoutSeconds: 300,
  secrets: [gmailUser, gmailAppPass]
}, async (event) => {
  console.log("[weeklyCompetitorDigest] Starting weekly digest generation...");
  const db = getFirestore();
  
  try {
    const cacheDoc = await db.collection("settings").doc("competitor_cache").get();
    if (!cacheDoc.exists) {
      console.log("[weeklyCompetitorDigest] No competitor cache found, aborting.");
      return;
    }
    
    const cacheData = cacheDoc.data();
    const matches = cacheData.matches || [];
    
    // We will analyze the "retail" tier by default for the email summary
    let cheaperCount = 0;
    let expensiveCount = 0;
    let totalMatches = matches.length;
    let topPriceDropsHtml = "";
    let alertsHtml = "";
    
    const drops = [];

    matches.forEach(match => {
      const myPPM = match.myPPMs ? match.myPPMs["retail"] : null;
      let isOverallCheaper = true;
      let isOverallExpensive = true;
      
      if (myPPM) {
        match.competitors.forEach(comp => {
          const compPPM = comp.ppm;
          if (compPPM) {
            const diff = myPPM - compPPM;
            if (diff > 0.05) isOverallCheaper = false; // We are more expensive
            if (diff < -0.05) isOverallExpensive = false; // We are cheaper
          }
          
          if (comp.trend === 'down' && comp.price_diff_vs_yesterday < 0) {
             drops.push(`<li><strong>${comp.competitor_name}</strong> bajó el precio de <strong>${comp.product_name}</strong> en $${Math.abs(comp.price_diff_vs_yesterday).toFixed(2)}</li>`);
          }
        });

        if (isOverallCheaper && !isOverallExpensive) cheaperCount++;
        if (isOverallExpensive && !isOverallCheaper) expensiveCount++;
      }
    });

    if (drops.length > 0) {
      topPriceDropsHtml = drops.slice(0, 10).join("");
    } else {
      topPriceDropsHtml = "<li>No se han detectado bajadas de precio importantes en el mercado esta semana.</li>";
    }

    if (expensiveCount > 0) {
      alertsHtml = `<div style="background: #fdf2f2; padding: 15px 30px; border-radius: 8px; border: 1px solid #fee2e2; margin-top: 20px;">
        <p style="margin-top: 0; font-weight: bold; color: #b91c1c;">⚠️ Atención de Pricing</p>
        <p style="margin: 0; color: #b91c1c;">Tienes <strong>${expensiveCount} productos</strong> cuyo precio Retail está menos competitivo que el promedio del mercado. Te recomendamos revisar el panel de Competitors de Atlas AI para ajustar tus precios de venta o revisar costos de producción.</p>
      </div>`;
    }

    const user = gmailUser.value();
    const pass = gmailAppPass.value();
    
    if (!user || !pass) {
      console.warn("[weeklyCompetitorDigest] Gmail credentials missing.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    const baseUrl = 'https://med-peptides-app-27a3a.web.app';
    const logoUrl = `${baseUrl}/logo.png`; 

    const html = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6; background-color: #ffffff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 20px; margin-bottom: 20px;">
          <img src="${logoUrl}" alt="Mediluxe Logo" style="max-height: 60px; margin-bottom: 10px;" onerror="this.src='https://ui-avatars.com/api/?name=Mediluxe&background=0D8ABC&color=fff&size=100'"/>
          <h2 style="color: #2c3e50; margin: 0;">Resumen Semanal de Competencia</h2>
        </div>
        
        <p>Hola José,</p>
        <p>Aquí tienes el análisis semanal del mercado de Viales y Péptidos generado por tu herramienta Atlas AI.</p>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #3b82f6; display: flex; align-items: center; justify-content: space-between;">
            <span>📊 Métricas Globales (Retail)</span>
          </h3>
          <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
            <li>Productos emparejados con la competencia: <strong>${totalMatches}</strong></li>
            <li>Productos Altamente Competitivos (Tú eres el más barato): <strong style="color: #10b981;">${cheaperCount}</strong></li>
            <li>Productos Menos Competitivos (Tú eres el más caro): <strong style="color: #ef4444;">${expensiveCount}</strong></li>
          </ul>
        </div>
        
        ${alertsHtml}

        <div style="margin-bottom: 25px; margin-top: 25px;">
          <h3 style="color: #f59e0b; display: flex; align-items: center; justify-content: space-between;">
            <span>📉 Movimientos de Mercado</span>
          </h3>
          <ul style="background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
            ${topPriceDropsHtml}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${baseUrl}/admin?tab=competitors" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; letter-spacing: 0.5px;">Ver Panel de Competencia en Atlas</a>
        </div>

        <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px;">
          Este es un mensaje generado automáticamente por Mediluxe System Administration.<br/>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Mediluxe Admin" <${user}>`,
      to: "jose@mediluxeme.com",
      subject: `Resumen Semanal de Competencia - Atlas AI`,
      html: html
    });
    
    console.log(`[weeklyCompetitorDigest] Email digest sent successfully.`);
  } catch (err) {
    console.error("[weeklyCompetitorDigest] Error generating digest:", err);
  }
});
