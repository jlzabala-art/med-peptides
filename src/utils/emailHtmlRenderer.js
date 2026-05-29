/**
 * emailHtmlRenderer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsive HTML Email compiler for personalized Atlas Health catalog shares.
 * Optimized for rendering across Gmail, Outlook, Apple Mail, and mobile.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function renderCatalogEmailHtml({ catalog, campaign, trackingUrl }) {
  // Brand details
  const primaryColor = catalog?.branding?.primaryColor || '#1a73e8';
  const logoUrl = catalog?.branding?.logoUrl || '';
  const companyName = catalog?.branding?.companyName || 'Atlas Health Partner';
  const emailContact = catalog?.branding?.contactEmail || 'support@med-peptides.com';
  const phoneContact = catalog?.branding?.contactPhone || '';

  // Personalized text blocks
  const introMessage = campaign?.personalization?.introMessage || 
    `Based on your clinic profile, we have curated a clinical catalog highlighting advanced Longevity and Cellular Repair compounds.`;

  const subjectLine = campaign?.subject || 'Exclusively Curated Portfolio';

  // Curated products highlight list
  const sectionsHtml = (catalog?.sections || []).map(section => {
    return `
      <div style="margin-top: 24px; border-top: 1px solid #dadce0; padding-top: 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #202124; text-transform: uppercase; letter-spacing: 0.5px;">
          ${section.title}
        </h4>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #5f6368; line-height: 1.5;">
          ${section.description || ''}
        </p>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subjectLine}</title>
  <style type="text/css">
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #dadce0;
      border-radius: 8px;
    }
    .header {
      padding: 24px 32px;
      border-bottom: 1px solid #f1f3f4;
    }
    .content {
      padding: 32px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      border-top: 1px solid #dadce0;
      text-align: center;
      border-radius: 0 0 8px 8px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${primaryColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 16px;
    }
    .badge {
      display: inline-block;
      background-color: #e8f0fe;
      color: #1a73e8;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #202124;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    h2 {
      font-size: 16px;
      font-weight: 600;
      color: ${primaryColor};
      margin: 0 0 16px 0;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #3c4043;
      margin: 0 0 16px 0;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 24px 0;">
    <tr>
      <td align="center">
        <table class="container" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0">
          <!-- Branded Header -->
          <tr>
            <td class="header" align="left">
              ${logoUrl 
                ? `<img src="${logoUrl}" alt="${companyName}" height="32" style="display: block; border: 0;" />`
                : `<span style="font-weight: 700; font-size: 16px; color: ${primaryColor};">${companyName}</span>`
              }
            </td>
          </tr>

          <!-- Email Content -->
          <tr>
            <td class="content" align="left">
              <div class="badge">Curated clinical portfolio</div>
              <h1>${catalog?.heroTitle || 'Clinical Reference Catalog'}</h1>
              <h2>Exclusive Selection Prepared for ${campaign?.recipient?.name || 'Healthcare Lead'}</h2>
              
              <p>${introMessage}</p>

              <!-- Curated Sections Checklist -->
              ${sectionsHtml}

              <!-- Call to action button -->
              <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
                <a href="${trackingUrl}" class="btn" target="_blank">
                  Access Curated Portfolio →
                </a>
              </div>
              
              <p style="font-size: 12px; color: #5f6368; text-align: center; margin-top: 16px;">
                * Direct route and pricing overrides will be applied automatically when accessing via the link.
              </p>
            </td>
          </tr>

          <!-- Footer contact info -->
          <tr>
            <td class="footer" align="center">
              <p style="font-size: 12px; color: #5f6368; margin: 0 0 8px 0; line-height: 1.4;">
                Prepared specifically for ${campaign?.recipient?.clinic || 'your clinical practice'}.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.4;">
                ${catalog?.disclaimer || 'For clinical research use only. This information has not been evaluated by the FDA.'}
              </p>
              
              <!-- Direct Contact Channels -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="font-size: 12px; color: #5f6368; font-weight: 600;">
                    ${phoneContact ? `<a href="https://wa.me/${phoneContact.replace(/[^0-9]/g, '')}" style="color: #1a73e8; text-decoration: none; margin-right: 16px;">WhatsApp Chat</a>` : ''}
                    <a href="mailto:${emailContact}" style="color: #1a73e8; text-decoration: none;">Email Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
