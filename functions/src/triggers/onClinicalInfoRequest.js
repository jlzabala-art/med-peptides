const { onDocumentCreated } = require("firebase-functions/v2/firestore");

module.exports = (gmailUser, gmailAppPass) => onDocumentCreated(
  {
    document: "catalog_generation_logs/{logId}",
    secrets: [gmailUser, gmailAppPass],
    region: "europe-west1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    if (data.docType !== "info_request") {
      return; // Only process clinical info requests
    }

    const recipient = data.recipient || {};
    const items = data.items || [];
    const topic = items[0]?.topic || "Clinical Literature / Mechanism";
    const notes = items[0]?.notes || "";
    const productName = data.productName || data.productSlug || "Target Compound";

    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: gmailUser.value(),
          pass: gmailAppPass.value(),
        },
      });

      const fromAddress = `"Atlas Health Operations" <${gmailUser.value()}>`;

      await transporter.sendMail({
        from: fromAddress,
        to: "jose@mediluxeme.com",
        subject: `📬 [Clinical Request] ${productName} — Dr. ${recipient.name || "Physician"}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
              <span style="font-size: 20px;">🔬</span>
              <h2 style="margin: 0; font-size: 18px; color: #0f172a;">New Clinical Documentation Request</h2>
            </div>
            <p style="color: #475569; font-size: 14px; margin-top: 0;">A practitioner submitted a clinical information request from a shared catalog.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
            
            <table style="width: 100%; font-size: 13px; color: #334155; line-height: 1.6;">
              <tr>
                <td style="font-weight: 700; width: 130px; padding: 4px 0;">Compound:</td>
                <td style="color: #2563eb; font-weight: 800;">${productName}</td>
              </tr>
              <tr>
                <td style="font-weight: 700; padding: 4px 0;">Doctor / Clinic:</td>
                <td>${recipient.name || "Unspecified"}</td>
              </tr>
              <tr>
                <td style="font-weight: 700; padding: 4px 0;">Professional Email:</td>
                <td><a href="mailto:${recipient.email || ""}" style="color: #2563eb;">${recipient.email || "No email"}</a></td>
              </tr>
              <tr>
                <td style="font-weight: 700; padding: 4px 0;">Topic of Interest:</td>
                <td><strong>${topic}</strong></td>
              </tr>
            </table>

            ${notes ? `
              <div style="margin-top: 16px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 700; font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Clinical Context / Inquirer Notes:</div>
                <div style="font-size: 13px; color: #1e293b;">${notes}</div>
              </div>
            ` : ""}

            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${recipient.email || ""}?subject=Clinical%20Documentation:%20${encodeURIComponent(productName)}&body=Dear%20${encodeURIComponent(recipient.name || "Doctor")},%0A%0AThank%20you%20for%20your%20inquiry%20regarding%20${encodeURIComponent(productName)}.%0A%0A" 
                 style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">
                Reply Directly to Physician
              </a>
            </div>
          </div>
        `,
      });
      console.log(`[onClinicalInfoRequest] Sent alert to jose@mediluxeme.com for log ${event.params.logId}`);
    } catch (err) {
      console.error("[onClinicalInfoRequest] Error sending email alert:", err);
    }
  }
);
