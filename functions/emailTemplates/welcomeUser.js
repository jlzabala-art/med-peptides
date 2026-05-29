/**
 * Builds the HTML for a welcome email when a new user registers.
 * @param {Object} userData - Data of the new user.
 * @returns {Object} - Subject and HTML content.
 */
function buildWelcomeEmail(userData) {
  const name = userData.firstName || "Researcher";
  
  const subject = `Welcome to Atlas Health, ${name}!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #003666; color: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0071bd; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        h1 { margin: 0; font-size: 24px; }
        p { margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Atlas Health</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for registering with Atlas Health. Your account has been successfully created and is currently <strong>pending professional verification</strong>.</p>
          <p>As a registered member, you can now:</p>
          <ul>
            <li>Track your research inquiries and orders.</li>
            <li>Access professional pricing (once verified).</li>
            <li>Manage your delivery information.</li>
          </ul>
          <p>We are committed to supporting your research with the highest quality peptides and logistical excellence.</p>
          <a href="https://med-peptides-app-27a3a.web.app/login" class="button">Access Your Dashboard</a>
          <p>If you have any questions, feel free to reply to this email or contact us via WhatsApp.</p>
          <p>Best regards,<br>The Atlas Health Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Atlas Health. For research use only.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

module.exports = { buildWelcomeEmail };
