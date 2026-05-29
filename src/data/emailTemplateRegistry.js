/**
 * emailTemplateRegistry.js
 * ─────────────────────────
 * Canonical registry of all transactional email templates used by Atlas Health.
 * Each entry has a unique TPL-XXX identifier for reference and support.
 *
 * Templates rendered here use sample data for preview purposes.
 */

import { getApprovalEmailHtml, getInvitationEmailHtml } from './emailTemplate';

// ── Sample data for previews ──────────────────────────────────────────────────
const SAMPLE_USER = {
  firstName: 'Ana',
  lastName: 'Martínez',
  email: 'ana.martinez@example.com',
  fullName: 'Ana Martínez',
  role: 'doctor',
};

const SAMPLE_ORDER = {
  id: 'ORD-20250526-DEMO',
  orderId: 'ORD-20250526-DEMO',
  createdAt: new Date().toISOString(),
  customer: { fullName: 'Ana Martínez', email: 'ana.martinez@example.com' },
  shippingAddress: { address: '123 Research Blvd', city: 'Madrid', country: 'Spain', postalCode: '28001' },
  items: [
    { name: 'BPC-157', variant: '5 mg/vial', quantity: 2, unitPrice: 22.5, lineTotal: 45 },
    { name: 'TB-500', variant: '5 mg/vial', quantity: 1, unitPrice: 37.5, lineTotal: 37.5 },
  ],
  subtotal: 82.5,
  shipping: 0,
  total: 82.5,
  currency: 'EUR',
  paymentMethod: 'bank_transfer',
  notes: '',
  isGuest: false,
};

// ── Welcome email HTML builders (inline — mirrors Cloud Function logic) ────────
function buildWelcomeCustomerHtml({ firstName = 'Researcher' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#003666,#005a9c);color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#10b981;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px;}
    .btn{display:inline-block;padding:12px 24px;background:#0071bd;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:20px;}
    h1{margin:0;font-size:24px;}
    p{margin:15px 0;}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>Welcome to Atlas Health</h1></div>
    <div class="content">
      <div class="badge">✅ Account Active</div>
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Your account has been created and is <strong>immediately active</strong>. You can start browsing our catalog and placing orders right away.</p>
      <p>To fully activate your account, please <strong>verify your email address</strong> by clicking the link we have sent you separately from Firebase Authentication.</p>
      <ul>
        <li>Browse our full peptide catalog</li>
        <li>Track your orders from your dashboard</li>
        <li>Manage your delivery and billing information</li>
      </ul>
      <a href="https://atlas-health.com" class="btn">Go to Catalog →</a>
      <p>If you have any questions, reply to this email or contact us via WhatsApp.</p>
      <p>Best regards,<br>The Atlas Health Team</p>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Atlas Health. For research use only.</p></div>
  </div></body></html>`;
}

function buildWelcomeProfessionalHtml({ firstName = 'Researcher', role = 'professional' } = {}) {
  const roleLabel = {
    doctor: 'Physician', wholesaler: 'Wholesaler', clinic: 'Clinic',
    researcher: 'Researcher', sales_agent: 'Sales Agent', staff: 'Staff',
  }[role] || 'Professional';
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#003666,#005a9c);color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#f59e0b;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px;}
    .notice{background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;}
    h1{margin:0;font-size:24px;}
    p{margin:15px 0;}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>Atlas Health</h1><p style="margin:6px 0 0;font-size:13px;opacity:0.8;">Professional Research Platform</p></div>
    <div class="content">
      <div class="badge">⏳ Application Under Review</div>
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Thank you for applying for <strong>${roleLabel}</strong> access to Atlas Health. Your application has been received and is currently <strong>pending review</strong> by our team.</p>
      <div class="notice">
        <p style="margin:0;font-size:14px;"><strong>What happens next:</strong><br>
        Our team will review your application within <strong>1–2 business days</strong>. You will receive a separate email with the outcome — either an approval with full access, or further information if we need to follow up.</p>
      </div>
      <p>If you have any questions in the meantime, feel free to reply to this email.</p>
      <p>Best regards,<br>The Atlas Health Team</p>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Atlas Health. For research use only.</p></div>
  </div></body></html>`;
}

function buildDenialHtml({ firstName = 'Researcher', reason = '' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:#1e293b;color:#fff;padding:30px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#ef4444;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px;}
    .reason-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;}
    h1{margin:0;font-size:24px;}
    p{margin:15px 0;}
  </style></head><body>
  <div class="container">
    <div class="header"><h1>Atlas Health</h1></div>
    <div class="content">
      <div class="badge">Application Update</div>
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Thank you for your interest in Atlas Health. After reviewing your application, we are unable to approve your professional access request at this time.</p>
      ${reason ? `<div class="reason-box"><p style="margin:0;font-size:14px;"><strong>Reason provided:</strong><br>${reason}</p></div>` : ''}
      <p>You are welcome to re-apply in the future or contact our team directly if you believe this decision was made in error.</p>
      <p>We appreciate your understanding.</p>
      <p>Best regards,<br>The Atlas Health Team</p>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Atlas Health.</p></div>
  </div></body></html>`;
}

function buildOrderNotificationHtml(order) {
  const orderId = order.id || order.orderId || '—';
  const name = order.customer?.fullName || order.customer?.name || 'Customer';
  const itemList = (order.items || []).map(i => `<li>${i.name} × ${i.quantity} — €${(i.lineTotal || 0).toFixed(2)}</li>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>body{font-family:Arial,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;padding:20px;}
  .badge{background:#0071bd;color:#fff;padding:8px 16px;border-radius:6px;display:inline-block;font-weight:700;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;}td{padding:8px;border:1px solid #e2e8f0;}
  .btn{display:inline-block;padding:12px 24px;background:#003666;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:16px;}</style></head>
  <body>
  <div class="badge">🛒 New Order — Admin</div>
  <h2>Order #${orderId}</h2>
  <table><tr><td><strong>Customer</strong></td><td>${name}</td></tr>
  <tr><td><strong>Email</strong></td><td>${order.customer?.email || '—'}</td></tr>
  <tr><td><strong>Payment</strong></td><td>${order.paymentMethod || '—'}</td></tr>
  <tr><td><strong>Total</strong></td><td>€${(order.total || 0).toFixed(2)}</td></tr></table>
  <h3>Items</h3><ul>${itemList}</ul>
  <a href="https://atlas-health.com/admin?t=orders&orderId=${orderId}" class="btn">View Order in Admin →</a>
  </body></html>`;
}

// ── REGISTRY ──────────────────────────────────────────────────────────────────
export const EMAIL_TEMPLATE_REGISTRY = [
  {
    id: 'TPL-001',
    name: 'Welcome — Customer / Patient',
    description: 'Sent automatically when a customer or patient registers. Account is immediately active. Prompts email verification.',
    trigger: 'Firestore: users/{userId} created (role: guest | patient)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/welcomeUser.js',
    tags: ['onboarding', 'auto'],
    getHtml: () => buildWelcomeCustomerHtml({ firstName: 'Ana' }),
  },
  {
    id: 'TPL-002',
    name: 'Welcome — Professional Application Received',
    description: 'Sent automatically when a professional account (doctor, wholesaler, clinic…) registers. Informs the applicant that their request is under review.',
    trigger: 'Firestore: users/{userId} created (role: *_pending | professional_pending)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/welcomeUser.js',
    tags: ['onboarding', 'auto'],
    getHtml: () => buildWelcomeProfessionalHtml({ firstName: 'Carlos', role: 'doctor' }),
  },
  {
    id: 'TPL-003',
    name: 'Order Received — Customer Confirmation',
    description: 'Sent to the customer immediately after they submit an order. Includes order ID, items, totals, and payment next steps.',
    trigger: 'Firestore: orders/{orderId} created → Cloud Function onNewOrder',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/clientConfirmation.js',
    tags: ['order', 'auto'],
    getHtml: () => {
      // Inline minimal version for preview
      return buildOrderNotificationHtml(SAMPLE_ORDER).replace('🛒 New Order — Admin', '✅ Order Received — Customer');
    },
  },
  {
    id: 'TPL-004',
    name: 'New Order — Admin Notification',
    description: 'Sent to the admin team when a new order arrives. Includes deep link to the order in the admin dashboard.',
    trigger: 'Firestore: orders/{orderId} created → Cloud Function onNewOrder',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/orderNotification.js',
    tags: ['order', 'admin', 'auto'],
    getHtml: () => buildOrderNotificationHtml(SAMPLE_ORDER),
  },
  {
    id: 'TPL-005',
    name: 'Professional Access Approved',
    description: 'Sent manually by admin from the Users tab when approving a professional account. Contains feature list per role and CTA to access the platform.',
    trigger: 'Manual — Admin: Users tab → Approve button',
    channel: 'EmailJS (browser)',
    sourceFile: 'src/data/emailTemplate.js → getApprovalEmailHtml()',
    tags: ['approval', 'manual'],
    getHtml: () => getApprovalEmailHtml({
      fullName: SAMPLE_USER.fullName,
      role: SAMPLE_USER.role,
      loginUrl: 'https://atlas-health.com',
    }),
  },
  {
    id: 'TPL-006',
    name: 'Professional Access Denied',
    description: 'Sent manually by admin from the Users tab when denying a professional account application. Optionally includes a reason.',
    trigger: 'Manual — Admin: Users tab → Deny button',
    channel: 'EmailJS (browser)',
    sourceFile: 'src/data/emailTemplate.js → getDenialEmailHtml()',
    tags: ['denial', 'manual'],
    getHtml: () => buildDenialHtml({ firstName: SAMPLE_USER.firstName, reason: 'We could not verify the provided professional credentials at this time.' }),
  },
  {
    id: 'TPL-007',
    name: 'Doctor — Patient Invitation',
    description: 'Sent by a physician to invite a patient to join the B2B supervised portal. Includes a referral registration link.',
    trigger: 'Manual — Doctor portal: Invite Patient action',
    channel: 'EmailJS (browser)',
    sourceFile: 'src/data/emailTemplate.js → getInvitationEmailHtml()',
    tags: ['b2b', 'invitation', 'manual'],
    getHtml: () => getInvitationEmailHtml({
      toName: 'Ana Martínez',
      fromName: 'Dr. Carlos Vega',
      customMessage: 'Ana, I have prepared a protocol for you. Please register using this link so we can manage your treatment together.',
      registerUrl: 'https://atlas-health.com/register?ref=doctor123',
    }),
  },
];

export const getTemplateById = (id) => EMAIL_TEMPLATE_REGISTRY.find(t => t.id === id);
