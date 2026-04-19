/**
 * getApprovalEmailHtml
 * ---------------------
 * Antigravity Email Engine — v2.0
 * Phases: [1] Universal Compatibility | [2] Mobile + Dark Mode | [3] Brand & CTA
 *
 * @param {Object} config
 * @param {string} config.fullName   — Recipient full name
 * @param {string} config.clinicName — Clinic / institution name (optional)
 * @param {string} config.loginUrl   — CTA login / catalog URL
 */
export const getApprovalEmailHtml = ({
  fullName = 'Researcher',
  clinicName = '',
  loginUrl = 'https://med-peptides-app-27a3a.web.app/',
} = {}) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="format-detection" content="telephone=no">
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <title>Your Professional Account is Active — Med-Peptides</title>
  <style type="text/css">
    /* ─── RESET ──────────────────────────────────────────────── */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* ─── BASE ───────────────────────────────────────────────── */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f0f4f8;
    }

    /* ─── PHASE 2: MOBILE ────────────────────────────────────── */
    @media only screen and (max-width: 600px) {
      .email-wrapper { width: 100% !important; }
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 28px 20px !important; }
      .header-padding { padding: 24px 20px !important; }
      .footer-padding { padding: 18px 20px !important; }
      .btn-full { display: block !important; width: auto !important; text-align: center !important; }
      .btn-td { text-align: center !important; }
    }

    /* ─── PHASE 2: DARK MODE ─────────────────────────────────── */
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #0d1117 !important; }
      .email-container { background-color: #161b22 !important; }
      .header-cell { background-color: #001f3f !important; }
      .content-heading { color: #e2e8f0 !important; }
      .content-text { color: #94a3b8 !important; }
      .feature-block { background-color: #1e2a38 !important; border-left-color: #00a3e0 !important; }
      .feature-label { color: #e2e8f0 !important; }
      .feature-item { color: #94a3b8 !important; }
      .footer-cell { background-color: #0d1117 !important; border-top-color: #21262d !important; }
      .footer-text { color: #8b949e !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;" class="email-bg">

  <!-- ─── PHASE 1: PREHEADER (hidden, ~100 chars) ─────────────── -->
  <div style="display:none;font-size:1px;color:#f0f4f8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Your Med-Peptides professional account is now active — access exclusive research catalogs, bulk pricing &amp; priority support.
  </div>

  <!-- ─── PHASE 1: OUTER WRAPPER TABLE (Outlook safe) ─────────── -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    class="email-wrapper"
    style="background-color:#f0f4f8;width:100%;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- ─── INNER CONTAINER ──────────────────────────────── -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          class="email-container"
          style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- ══ HEADER ═══════════════════════════════════════ -->
          <tr>
            <td class="header-cell header-padding"
              style="background-color:#003666;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">
                MED-PEPTIDES
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:#90c8f0;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">
                Professional Research Platform
              </p>
            </td>
          </tr>

          <!-- ══ CONTENT ═══════════════════════════════════════ -->
          <tr>
            <td class="content-padding"
              style="padding:40px 40px 28px;background-color:#ffffff;">

              <!-- Title -->
              <h2 class="content-heading"
                style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#0f172a;">
                Professional Account Activated ✓
              </h2>

              <!-- Greeting -->
              <p class="content-text"
                style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#475569;">
                Dear <strong style="color:#003666;">${fullName}</strong>${clinicName ? ` from <strong style="color:#003666;">${clinicName}</strong>` : ''},
              </p>

              <!-- Body -->
              <p class="content-text"
                style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#475569;">
                We are pleased to inform you that your professional account with <strong>Med-Peptides</strong> has been successfully verified and activated by our team. You now have full institutional access.
              </p>

              <!-- ─── PHASE 3: FEATURE LIST WITH CHECK ICONS ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                class="feature-block"
                style="background-color:#f1f5f9;border-left:4px solid #00a3e0;border-radius:0 8px 8px 0;margin:0 0 28px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p class="feature-label"
                      style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;">
                      Your Full Access Includes:
                    </p>
                    <!-- Item -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;color:#00a3e0;font-size:16px;font-weight:700;line-height:1.5;">✓</td>
                        <td class="feature-item" style="font-size:14px;line-height:1.6;color:#334155;">Volume acquisition tiers <span style="color:#00a3e0;font-weight:600;">(10-vial Research Kits)</span></td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;color:#00a3e0;font-size:16px;font-weight:700;line-height:1.5;">✓</td>
                        <td class="feature-item" style="font-size:14px;line-height:1.6;color:#334155;">Institutional and bulk pricing structures</td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;color:#00a3e0;font-size:16px;font-weight:700;line-height:1.5;">✓</td>
                        <td class="feature-item" style="font-size:14px;line-height:1.6;color:#334155;">Access to custom synthesis pathways</td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:10px;color:#00a3e0;font-size:16px;font-weight:700;line-height:1.5;">✓</td>
                        <td class="feature-item" style="font-size:14px;line-height:1.6;color:#334155;">Priority support for research inquiries</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA text -->
              <p class="content-text"
                style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#475569;">
                Please log in to your account to view updated catalogs and begin utilizing your new research capabilities.
              </p>

              <!-- ─── PHASE 3: CTA BUTTON ──────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="btn-td" align="center" style="text-align:center;padding-bottom:8px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                      href="${loginUrl}"
                      style="height:48px;v-text-anchor:middle;width:220px;" arcsize="13%" stroke="f" fillcolor="#00a3e0">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:700;">Access Catalog</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${loginUrl}" class="btn-full"
                      style="display:inline-block;background-color:#00a3e0;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">
                      Access Your Catalog →
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ DIVIDER ════════════════════════════════════════ -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ PHASE 3: PROFESSIONAL FOOTER ══════════════════ -->
          <tr>
            <td class="footer-cell footer-padding"
              style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">

              <!-- Brand -->
              <p class="footer-text"
                style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:#003666;letter-spacing:1px;text-transform:uppercase;">
                Med-Peptides
              </p>
              <p class="footer-text"
                style="margin:0 0 12px;font-size:12px;color:#64748b;">
                Premium Research Peptides for Professional &amp; Institutional Use
              </p>

              <!-- Legal disclaimer -->
              <p class="footer-text"
                style="margin:0 0 10px;font-size:11px;line-height:1.6;color:#94a3b8;">
                This email is intended exclusively for licensed professional, institutional, or academic researchers.
              </p>

              <!-- Support link — CAN-SPAM / GDPR -->
              <p class="footer-text"
                style="margin:0 0 8px;font-size:11px;color:#94a3b8;">
                Questions? Contact
                <a href="mailto:support@med-peptides.com"
                  style="color:#00a3e0;text-decoration:none;font-weight:600;">
                  Technical Support
                </a>
              </p>

              <!-- Physical address (CAN-SPAM required) -->
              <p class="footer-text"
                style="margin:0 0 10px;font-size:11px;color:#94a3b8;line-height:1.5;">
                Med-Peptides Research Division<br>
                123 Research Blvd, Suite 400<br>
                Miami, FL 33101 · United States
              </p>

              <!-- Unsubscribe -->
              <p class="footer-text"
                style="margin:0;font-size:10px;color:#b0bec5;">
                You received this email because your account was verified.
                <a href="${loginUrl}/unsubscribe"
                  style="color:#94a3b8;text-decoration:underline;">
                  Unsubscribe
                </a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /email-container -->

      </td>
    </tr>
  </table>
  <!-- /email-wrapper -->

</body>
</html>
`;
