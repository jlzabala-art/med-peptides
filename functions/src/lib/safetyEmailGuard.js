/**
 * safetyEmailGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * STRICT TESTING MODE EMAIL SAFETY INTERCEPTOR
 * 
 * DIRECTIVE:
 * Under NO CIRCUMSTANCES send live emails to real doctors, wholesalers, or patients
 * while the system is in testing phase.
 * 
 * Any outbound email targeting an external doctor, wholesaler, or patient:
 * 1. Is completely BLOCKED from reaching the external recipient.
 * 2. Redirected solely to 'jlzabala@gmail.com' (with clear TEST MODE disclaimer banner)
 *    so the administrator can inspect the email without emailing real clients.
 */

const ALLOWED_TEST_RECIPIENTS = new Set([
  'jlzabala@gmail.com',
  'jose@mediluxeme.com'
]);

function isAllowedTestRecipient(email) {
  if (!email || typeof email !== 'string') return false;
  return ALLOWED_TEST_RECIPIENTS.has(email.trim().toLowerCase());
}

/**
 * Sanitizes an email dispatch to guarantee zero leakage to real doctors/wholesalers/patients.
 * @param {Object} mailOptions - standard nodemailer { from, to, subject, html, text }
 * @param {string} recipientRole - 'doctor' | 'wholesaler' | 'patient' | 'customer' | 'admin'
 * @returns {Object} safeMailOptions with redirected recipient and warning header
 */
function sanitizeTestEmail(mailOptions, recipientRole = 'external') {
  const originalTo = (mailOptions.to || '').trim().toLowerCase();

  // If already one of the developer/admin test inboxes, send as is
  if (isAllowedTestRecipient(originalTo)) {
    return mailOptions;
  }

  console.warn(`🛑 [STRICT SAFETY GUARD] Blocked email to ${recipientRole}: <${originalTo}>. Rerouting test copy exclusively to jlzabala@gmail.com.`);

  const testBanner = `
    <div style="background:#fffbeb; border:2px solid #f59e0b; padding:14px; margin-bottom:20px; border-radius:8px; font-family:-apple-system,BlinkMacSystemFont,sans-serif; font-size:13px; color:#92400e; line-height:1.5;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:18px;">🛡️</span>
        <strong style="font-size:14px; color:#b45309; text-transform:uppercase; letter-spacing:0.04em;">Testing Phase Email Guard Active</strong>
      </div>
      <div><strong>Original Intended Recipient (${recipientRole}):</strong> <code>${originalTo}</code></div>
      <div><strong>Safety Status:</strong> Real external emails are strictly suppressed during testing mode. Zero emails were sent to the doctor, wholesaler, or patient. This preview copy was safely redirected to <code>jlzabala@gmail.com</code>.</div>
    </div>
  `;

  return {
    ...mailOptions,
    to: 'jlzabala@gmail.com',
    subject: `[TESTING - Originally for ${recipientRole} ${originalTo}] ${mailOptions.subject || ''}`,
    html: mailOptions.html ? `${testBanner}${mailOptions.html}` : undefined,
    text: mailOptions.text ? `[TESTING GUARD: Originally for ${originalTo}]\n\n${mailOptions.text}` : undefined,
  };
}

module.exports = {
  isAllowedTestRecipient,
  sanitizeTestEmail,
  ALLOWED_TEST_RECIPIENTS,
};
