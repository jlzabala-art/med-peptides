const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const { gmailUser, gmailAppPass } = require("../config");
const { listInvoices, listAllItems, listCustomerPayments } = require("../lib/zoho_client");

/**
 * Runs every day at 07:00 AM (Asia/Dubai time).
 * Gathers authoritative platform metrics (Zoho Books + Firestore)
 * and dispatches an executive daily digest email to the super admin.
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

    // ── 2. Zoho Books Financial Overview ────────────────────────────────────
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

    // ── 3. Zoho Inventory Alerts (Low Stock) ─────────────────────────────────
    let lowStockItems = [];
    try {
      const allItems = await listAllItems({ filter_by: "Status.Active" }).catch(() => []);
      lowStockItems = allItems.filter(item => item.stock_on_hand !== null && Number(item.stock_on_hand) < 10);
    } catch (e) {
      console.warn("[adminDailyDigest] Zoho Inventory notice:", e.message);
    }

    // ── 4. Firestore Clinical Prescriptions ─────────────────────────────────
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

        if (status === 'pending' || status === 'draft') {
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

    // ── 5. Firestore Commercial Quotations Pipeline ───────────────────────────
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

    // ── 6. Firestore Active Cold Chain Shipments ─────────────────────────────
    let activeColdChainShipments = 0;
    try {
      const poSnap = await db.collection("purchase-orders")
        .where("requiresColdChain", "==", true)
        .where("status", "in", ["po_created", "processing", "in_transit"])
        .get()
        .catch(() => ({ size: 0 }));
      activeColdChainShipments = poSnap.size || 0;
    } catch (e) {
      console.warn("[adminDailyDigest] Cold chain fetch notice:", e.message);
    }

    // ── 7. Dispatch Executive Digest Email ───────────────────────────────────
    await sendDigestEmail({
      yesterdayStr,
      formattedDate,
      invoicesCount: invoicesYesterday.length,
      totalInvoiced,
      totalCollected,
      paymentsCount: paymentsYesterday.length,
      lowStockItems,
      newPrescriptionsCount,
      pendingPrescriptionsCount,
      topPrescribingDoctors,
      newQuotationsCount,
      pendingQuotationsCount,
      pipelineValue,
      approvedQuotesCount,
      activeColdChainShipments
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
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #0f172a; font-size: 13px;">👨‍⚕️ ${doc.name}</span>
            <span style="background: #f0fdf4; color: #16a34a; font-weight: 800; font-size: 12px; padding: 2px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">
              ${doc.count} ${doc.count === 1 ? 'prescription' : 'prescriptions'}
            </span>
          </div>
        `).join("")
      : `
        <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
          No doctor prescriptions issued yesterday.
        </div>
      `;

    const lowStockHtml = data.lowStockItems.length > 0
      ? data.lowStockItems.slice(0, 5).map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fff; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 6px;">
            <div>
              <div style="font-weight: 700; color: #991b1b; font-size: 13px;">${item.name}</div>
              <div style="font-size: 11px; color: #64748b;">SKU: ${item.sku || 'N/A'}</div>
            </div>
            <span style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 12px; padding: 2px 8px; border-radius: 6px; border: 1px solid #fca5a5;">
              ${item.stock_on_hand} left
            </span>
          </div>
        `).join("")
      : `
        <div style="padding: 12px 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; font-size: 13px; color: #166534; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">✓</span> All compound stock levels are optimal (0 critical alerts).
        </div>
      `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Atlas Health Daily Digest</title>
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="background: linear-gradient(135deg, #003666 0%, #0284c7 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; margin-bottom: 4px;">
              Enterprise Healthcare Platform
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
              ATLAS HEALTH EXECUTIVE DIGEST
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">
              Activity Report for <strong>${data.formattedDate}</strong>
            </p>
          </div>

          <div style="padding: 24px 28px 12px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155;">
              Good morning <strong>José</strong>, here is your executive summary of platform transactions, medical prescriptions, and cold chain logistics for yesterday:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: separate; border-spacing: 8px;">
              <tr>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">💰 Invoiced Volume</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatCurrencyAED(data.totalInvoiced)}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.invoicesCount} new invoices issued</div>
                </td>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase;">🩺 Prescriptions</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.newPrescriptionsCount} Issued</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.pendingPrescriptionsCount} pending review</div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase;">📄 Pipeline Quotes</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatCurrencyUSD(data.pipelineValue)}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.pendingQuotationsCount} active proposals</div>
                </td>
                <td width="50%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; vertical-align: top;">
                  <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;">❄️ Cold Chain (2-8°C)</div>
                  <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.activeColdChainShipments} Active</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Refrigerated laboratory dispatch</div>
                </td>
              </tr>
            </table>

            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  🩺 Clinical Prescribing Activity
                </h3>
                <a href="${baseUrl}/admin/prescriptions" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Prescriptions &rarr;</a>
              </div>
              ${doctorsListHtml}
            </div>

            <div style="margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  📄 Commercial Quotations & Approvals
                </h3>
                <a href="${baseUrl}/admin/quotations" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Quotations &rarr;</a>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">New Proposals Issued Yesterday:</span>
                  <strong style="color: #0f172a;">${data.newQuotationsCount}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #64748b;">Proposals Approved / Converted:</span>
                  <strong style="color: #16a34a;">${data.approvedQuotesCount}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
                  <span style="color: #64748b;">Total Pipeline Value Awaiting Client Decision:</span>
                  <strong style="color: #0284c7;">${formatCurrencyUSD(data.pipelineValue)}</strong>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 28px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #003666; text-transform: uppercase; letter-spacing: 0.5px;">
                  ⚠️ Inventory & Compounding Stock
                </h3>
                <a href="${baseUrl}/admin/catalog" style="font-size: 12px; font-weight: 700; color: #0284c7; text-decoration: none;">View Catalog &rarr;</a>
              </div>
              ${lowStockHtml}
            </div>

            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${baseUrl}/admin" style="display: inline-block; background-color: #003666; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(0, 54, 102, 0.25);">
                Open Master Admin Console &rarr;
              </a>
            </div>

          </div>

          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
            Atlas Health Enterprise • USP 797 & EU GMP Compounding Management<br>
            Automated intelligence report dispatched at 07:00 AM (Dubai Time) to authorized platform administrators.
          </div>

        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Atlas Health Admin" <${user}>`,
      to: "jose@mediluxeme.com",
      subject: `Atlas Health Digest (${data.formattedDate}): ${formatCurrencyAED(data.totalInvoiced)} Invoiced · ${data.newPrescriptionsCount} RX`,
      html: html
    });
    
    console.log(`[adminDailyDigest] Executive email digest dispatched successfully for ${data.yesterdayStr}.`);
  } catch (error) {
    console.error("[adminDailyDigest] Failed to construct/send email:", error);
  }
}
