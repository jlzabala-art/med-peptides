const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { gmailUser, gmailAppPass } = require("../config");
const { listInvoices, listCustomerPayments } = require("../lib/zoho_client");

/**
 * Runs every day at 07:00 AM (Asia/Dubai time).
 * Gathers authoritative platform metrics (Zoho Books + Firestore)
 * and dispatches a clean, executive daily digest email to the super admin.
 *
 * New Schema Alignment:
 *  - Removed obsolete static warehouse stock levels (sourcing is on-demand / purchase orders).
 *  - Added breakdown of finished peptides vs API raw materials & diagnostic quotations.
 *  - Integrated active Cold Chain (2-8°C) laboratory dispatches and real clinical prescriptions.
 */
exports.adminDailyDigest = onSchedule({
  schedule: "0 7 * * *",
  timeZone: "Asia/Dubai",
  timeoutSeconds: 300,
  secrets: [gmailUser, gmailAppPass, "ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN"]
}, async (event) => {
  console.log("[adminDailyDigest] Starting executive daily digest generation...");
  const db = getFirestore();
  
  try {
    // ── 1. Date Calculation (Yesterday in Asia/Dubai / UTC) ───────────────────
    const now = new Date();
    const yesterdayDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    
    const yesterdayStart = new Date(yesterdayDate);
    yesterdayStart.setUTCHours(0, 0, 0, 0);
    
    const yesterdayEnd = new Date(yesterdayDate);
    yesterdayEnd.setUTCHours(23, 59, 59, 999);

    const formattedDate = yesterdayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // ── 2. Zoho Books Financial Overview (Real Data) ─────────────────────────
    let invoicesYesterday = [];
    let paymentsYesterday = [];
    let totalInvoiced = 0;
    let totalCollected = 0;

    try {
      invoicesYesterday = await listInvoices({
        date_start: yesterdayStr,
        date_end: yesterdayStr
      }).catch(() => []);
      totalInvoiced = invoicesYesterday.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    } catch (e) {
      console.warn("[adminDailyDigest] Zoho Invoices notice:", e.message);
    }

    try {
      if (typeof listCustomerPayments === 'function') {
        paymentsYesterday = await listCustomerPayments({
          date_start: yesterdayStr,
          date_end: yesterdayStr
        }).catch(() => []);
        totalCollected = paymentsYesterday.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      }
    } catch (e) {
      console.warn("[adminDailyDigest] Zoho Payments notice:", e.message);
    }

    // ── 3. Firestore Clinical Prescriptions & Active Doctors (Real Data) ────
    let newPrescriptionsCount = 0;
    let pendingPrescriptionsCount = 0;
    const activeDoctorsMap = new Map();

    try {
      const rxSnap = await db.collection("prescriptions").get().catch(() => ({ docs: [] }));
      rxSnap.docs.forEach(d => {
        const data = d.data();
        const status = String(data.status || '').toLowerCase();
        
        let created = null;
        if (data.createdAt?.toDate) created = data.createdAt.toDate();
        else if (data.createdAt) created = new Date(data.createdAt);

        if (created && created >= yesterdayStart && created <= yesterdayEnd) {
          newPrescriptionsCount++;
          const docName = data.doctorName || data.doctor?.name || "Dr. Medical Specialist";
          activeDoctorsMap.set(docName, (activeDoctorsMap.get(docName) || 0) + 1);
        }

        if (status === 'pending' || status === 'draft' || status === 'awaiting_approval') {
          pendingPrescriptionsCount++;
        }
      });
    } catch (e) {
      console.warn("[adminDailyDigest] Prescriptions fetch notice:", e.message);
    }

    const topPrescribingDoctors = Array.from(activeDoctorsMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    // ── 4. Firestore Commercial Quotations Pipeline (Real Data) ──────────────
    let pendingQuotationsCount = 0;
    let pipelineValue = 0;
    let approvedQuotesCount = 0;
    let newQuotationsCount = 0;

    try {
      const quotesSnap = await db.collection("quotations").get().catch(() => ({ docs: [] }));
      quotesSnap.docs.forEach(d => {
        const data = d.data();
        const status = String(data.status || '').toLowerCase();
        const amount = Number(data.grandTotal || data.totalAmount || data.subtotal || 0);

        let created = null;
        if (data.createdAt?.toDate) created = data.createdAt.toDate();
        else if (data.createdAt) created = new Date(data.createdAt);

        if (created && created >= yesterdayStart && created <= yesterdayEnd) {
          newQuotationsCount++;
        }

        if (status === 'pending' || status === 'viewed' || status === 'draft' || status === 'sent') {
          pendingQuotationsCount++;
          pipelineValue += amount;
        } else if (status === 'approved' || status === 'accepted' || status === 'converted') {
          if (created && created >= yesterdayStart && created <= yesterdayEnd) {
            approvedQuotesCount++;
          }
        }
      });
    } catch (e) {
      console.warn("[adminDailyDigest] Quotations fetch notice:", e.message);
    }

    // ── 5. Firestore Active Cold Chain Logistics & POs (Real Data) ───────────
    let activeColdChainShipments = 0;
    let pendingPurchaseOrders = 0;
    try {
      const poSnap = await db.collection("purchase-orders")
        .where("status", "in", ["po_created", "processing", "in_transit", "awaiting_payment"])
        .get()
        .catch(() => ({ docs: [], size: 0 }));
      
      pendingPurchaseOrders = poSnap.size || 0;
      poSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        if (d.requiresColdChain === true || d.shippingType === 'cold_chain') {
          activeColdChainShipments++;
        }
      });
    } catch (e) {
      console.warn("[adminDailyDigest] Logistics fetch notice:", e.message);
    }

    // ── 6. Dispatch Executive Digest Email ───────────────────────────────────
    await sendDigestEmail({
      yesterdayStr,
      formattedDate,
      invoicesCount: invoicesYesterday.length,
      totalInvoiced,
      totalCollected,
      paymentsCount: paymentsYesterday.length,
      newPrescriptionsCount,
      pendingPrescriptionsCount,
      topPrescribingDoctors,
      newQuotationsCount,
      pendingQuotationsCount,
      pipelineValue,
      approvedQuotesCount,
      activeColdChainShipments,
      pendingPurchaseOrders,
    });
    
  } catch (err) {
    console.error("[adminDailyDigest] Critical error in daily digest:", err);
  }
});

async function sendDigestEmail(data) {
  const user = gmailUser?.value ? gmailUser.value() : process.env.GMAIL_USER;
  const pass = gmailAppPass?.value ? gmailAppPass.value() : process.env.GMAIL_PASS;
  
  if (!user || !pass) {
    console.warn("[adminDailyDigest] Gmail credentials missing in Secret Manager. Skipping SMTP dispatch.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    const formatCurrencyAED = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val || 0);
    const formatCurrencyUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const baseUrl = 'https://regenpept.com';

    const doctorsListHtml = data.topPrescribingDoctors.length > 0
      ? data.topPrescribingDoctors.map((doc) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #0f172a; font-size: 13px;">👨‍⚕️ ${doc.name}</span>
            <span style="background: #f0fdf4; color: #16a34a; font-weight: 800; font-size: 12px; padding: 3px 10px; border-radius: 6px; border: 1px solid #bbf7d0;">
              ${doc.count} ${doc.count === 1 ? 'prescription' : 'prescriptions'}
            </span>
          </div>
        `).join("")
      : `
        <div style="padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
          No medical prescriptions were submitted yesterday.
        </div>
      `;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RegenPept Executive Daily Digest</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0 !important; }
            .kpi-table, .kpi-table tbody, .kpi-table tr, .kpi-table td { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .kpi-table td { margin-bottom: 8px !important; }
            .header-pad { padding: 24px 18px !important; }
            .body-pad { padding: 18px 16px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
          
          {/* Header Banner */}
          <div class="header-pad" style="background: linear-gradient(135deg, #003666 0%, #0284c7 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; margin-bottom: 4px;">
              Enterprise Healthcare Platform
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
              REGENPEPT EXECUTIVE DIGEST
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
              Activity report for <strong>${data.formattedDate}</strong>
            </p>
          </div>

          {/* Intro greeting */}
          <div class="body-pad" style="padding: 24px 24px 12px;">
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
              Good morning <strong>José</strong>, here is your consolidated executive summary of platform invoices, prescriptions, quotes, and cold chain shipments from yesterday:
            </p>

            {/* 4 Executive KPI Cards (2x2 on Desktop, stacked on Mobile) */}
            <table class="kpi-table" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: separate; border-spacing: 8px;">
              <tr>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">💰 Invoiced Volume</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatCurrencyAED(data.totalInvoiced)}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.invoicesCount} invoice${data.invoicesCount !== 1 ? 's' : ''} issued</div>
                </td>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">🩺 Prescriptions</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.newPrescriptionsCount} Issued</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.pendingPrescriptionsCount} pending review</div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">📄 Active Pipeline</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatCurrencyUSD(data.pipelineValue)}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.pendingQuotationsCount} active proposals</div>
                </td>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">❄️ Cold Chain Logistics</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.activeColdChainShipments} Shipments</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.pendingPurchaseOrders} active purchase orders</div>
                </td>
              </tr>
            </table>

            {/* Section 1: Financial Collections & Zoho Books */}
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  💰 Financial Overview & Collections
                </h3>
                <a href="${baseUrl}/admin/finance" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Ledger &rarr;</a>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">Invoices Created Yesterday:</span>
                  <strong style="color: #0f172a;">${data.invoicesCount} (${formatCurrencyAED(data.totalInvoiced)})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
                  <span style="color: #64748b;">Customer Payments Collected:</span>
                  <strong style="color: #16a34a;">${formatCurrencyAED(data.totalCollected)}</strong>
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Prescriptions & Doctors */}
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  🩺 Clinical Prescribing Activity
                </h3>
                <a href="${baseUrl}/admin/prescriptions" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Prescriptions &rarr;</a>
              </div>
              ${doctorsListHtml}
            </div>

            {/* Section 3: Commercial Quotations & Proposals */}
            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  📄 Commercial Quotations & Approvals
                </h3>
                <a href="${baseUrl}/admin/quotations" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Quotations &rarr;</a>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">New Proposals Issued Yesterday:</span>
                  <strong style="color: #0f172a;">${data.newQuotationsCount}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">Proposals Approved / Converted:</span>
                  <strong style="color: #16a34a;">${data.approvedQuotesCount}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 6px;">
                  <span style="color: #64748b;">Total Pipeline Awaiting Client Decision:</span>
                  <strong style="color: #0284c7;">${formatCurrencyUSD(data.pipelineValue)}</strong>
                </div>
              </div>
            </div>

            {/* Section 4: Sourcing & Cold Chain Orders */}
            <div style="margin-bottom: 28px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  ❄️ Compound Sourcing & Cold Chain Logistics
                </h3>
                <a href="${baseUrl}/admin/orders" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Orders &rarr;</a>
              </div>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">Active Cold Chain (2°C – 8°C) Dispatches:</span>
                  <strong style="color: #0284c7;">${data.activeColdChainShipments} shipments</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
                  <span style="color: #64748b;">Active Purchase Orders with Suppliers:</span>
                  <strong style="color: #0f172a;">${data.pendingPurchaseOrders} purchase orders</strong>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div style="text-align: center; margin: 30px 0 14px;">
              <a href="${baseUrl}/admin" style="display: inline-block; background-color: #003666; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(0, 54, 102, 0.2);">
                Open Master Admin Console &rarr;
              </a>
            </div>

          </div>

          {/* Footer */}
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            RegenPept Enterprise Healthcare • On-Demand Compound Sourcing & SCM<br>
            Automated intelligence report dispatched at 07:00 AM (Dubai Time) to platform administrators.
          </div>

        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"RegenPept Admin" <${user}>`,
      to: "jose@mediluxeme.com",
      subject: `RegenPept Daily Digest (${data.formattedDate}): ${formatCurrencyAED(data.totalInvoiced)} Invoiced · ${data.newPrescriptionsCount} RX`,
      html: html
    });
    
    console.log(`[adminDailyDigest] Executive email digest dispatched successfully for ${data.yesterdayStr}.`);
  } catch (error) {
    console.error("[adminDailyDigest] Failed to construct/send email:", error);
  }
}

