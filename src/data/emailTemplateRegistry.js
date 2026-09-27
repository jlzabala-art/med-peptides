/**
 * emailTemplateRegistry.js
 * ─────────────────────────
 * Canonical registry of all transactional email templates used by Atlas Health.
 * Each entry has a unique TPL-XXX identifier for reference and support.
 *
 * Templates rendered here use sample data for preview purposes.
 */

import { getApprovalEmailHtml, getInvitationEmailHtml } from './emailTemplate.js';

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

function buildNewsletterPeptidesHtml({ firstName = 'Researcher' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#003666,#0284c7);color:#fff;padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#0284c7;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;}
    .card{background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0284c7;border-radius:6px;padding:16px;margin:18px 0;}
    .btn{display:inline-block;padding:12px 24px;background:#003666;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:16px;}
    h1{margin:0;font-size:22px;font-weight:700;}
  </style></head><body>
  <div class="container">
    <div class="header">
      <div class="badge">Research Intelligence</div>
      <h1>Atlas Peptide Research Compendium</h1>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">Reconstitution Calculations, Purity (HPLC >99%) & Cold-Chain Protocol</p>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Thank you for subscribing via the Atlas Health Peptide Monograph portal. Here is your comprehensive guide to laboratory reconstitution and stability protocols.</p>
      <div class="card">
        <h3 style="margin:0 0 8px;font-size:14px;color:#003666;">Included in this Compendium:</h3>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#475569;">
          <li>Bacteriostatic Water (BAC) titration formulas and vial dilution math.</li>
          <li>Cold-chain storage standards (-20°C lyophilized vs 2-8°C reconstituted).</li>
          <li>Batch-level HPLC analytical testing and mass spectrometry verification.</li>
          <li>Synergistic cellular signaling research notes (BPC-157, TB-500, GHK-Cu).</li>
        </ul>
      </div>
      <p style="font-size:13px;color:#64748b;">You will receive periodic peer-reviewed synthesis summaries and compound updates directly in your inbox.</p>
      <a href="https://atlas-health.com/catalog" class="btn">Access Monograph Library →</a>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Atlas Health. Research Peptides & Life Sciences.</p></div>
  </div></body></html>`;
}

function buildNewsletterColwayHtml({ firstName = 'Specialist' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#047857,#059669);color:#fff;padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#10b981;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;}
    .card{background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #10b981;border-radius:6px;padding:16px;margin:18px 0;}
    .btn{display:inline-block;padding:12px 24px;background:#047857;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:16px;}
    h1{margin:0;font-size:22px;font-weight:700;}
  </style></head><body>
  <div class="container">
    <div class="header">
      <div class="badge">Trichology & Cellular Cosmeceuticals</div>
      <h1>Colway Clinical Dossier & Follicular Protocols</h1>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">Native Tropocollagen, Baicapil™ 2% & Kerascalp™ Collagen XVII</p>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Thank you for requesting clinical data on Colway advanced cellular care. Below is the clinical summary of our biologically active native transdermal collagen formulas.</p>
      <div class="card">
        <h3 style="margin:0 0 8px;font-size:14px;color:#047857;">Clinical Evidence Highlights:</h3>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#334155;">
          <li><strong>Baicapil™ 2%:</strong> Clinically proven to stimulate anagen hair growth and reduce telogen shedding by up to 60.6% after 3 months.</li>
          <li><strong>Kerascalp™ (Phyllanthus Emblica):</strong> Prevents follicular miniaturization via Collagen XVII preservation.</li>
          <li><strong>Native Tropocollagen:</strong> Retains triple helix conformation at room temperature.</li>
        </ul>
      </div>
      <a href="https://atlas-health.com/p/colway-collagen-scalp-treatment" class="btn">View Scalp Treatment Datasheet →</a>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Colway Clinical Distribution · Atlas Health Partner.</p></div>
  </div></body></html>`;
}

function buildNewsletterBloodoHtml({ firstName = 'Member' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#a855f7;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;}
    .card{background:#faf5ff;border:1px solid #e9d5ff;border-left:4px solid #9333ea;border-radius:6px;padding:16px;margin:18px 0;}
    .btn{display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:16px;}
    h1{margin:0;font-size:22px;font-weight:700;}
  </style></head><body>
  <div class="container">
    <div class="header">
      <div class="badge">Diagnostic Intelligence</div>
      <h1>Bloodo CE-IVDR Capillary Biomarkers Requisition Guide</h1>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">At-Home Blood Collection, Fasting Guidelines & Longevity Tracking</p>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Welcome to Bloodo at-home diagnostics. Before taking your capillary sample, review our certified laboratory preparation checklist.</p>
      <div class="card">
        <h3 style="margin:0 0 8px;font-size:14px;color:#7c3aed;">Sample Collection Best Practices:</h3>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#334155;">
          <li>Collect in the morning after a strict 10–12 hour overnight fast.</li>
          <li>Hydrate with 500 mL of water 30 minutes prior to collection.</li>
          <li>Warm your hands under water for 2 minutes to optimize capillary microcirculation.</li>
          <li>Mail prepaid envelope on Monday–Thursday to ensure fresh transit to our accredited lab.</li>
        </ul>
      </div>
      <a href="https://atlas-health.com/p/bloodo-at-home-blood-test" class="btn">View Full Diagnostic Panel →</a>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Bloodo Diagnostics · CE-IVDR Certified Lab Partners.</p></div>
  </div></body></html>`;
}

function buildNewsletterMediLuxeHtml({ firstName = 'Partner' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#003666,#1e293b);color:#fff;padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#38bdf8;color:#0f172a;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;}
    .card{background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #003666;border-radius:6px;padding:16px;margin:18px 0;}
    .btn{display:inline-block;padding:12px 24px;background:#003666;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:16px;}
    h1{margin:0;font-size:22px;font-weight:700;}
  </style></head><body>
  <div class="container">
    <div class="header">
      <div class="badge">GCC Compounding Concierge</div>
      <h1>MediLuxe Middle East Executive Brief</h1>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">Dubai & Abu Dhabi Licensed Telemedicine & Compounding Infrastructure</p>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>Thank you for inquiring about MediLuxe institutional compounding and clinic partnerships in the United Arab Emirates and GCC region.</p>
      <div class="card">
        <h3 style="margin:0 0 8px;font-size:14px;color:#003666;">Corporate Partnership Capabilities:</h3>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#334155;">
          <li>MOHAP and DOH compliant custom peptide and hormone formulation.</li>
          <li>Validated 24–48h cold-chain pharmaceutical delivery across UAE.</li>
          <li>Doctor portal for electronic prescribing, titration logs and direct patient fulfillment.</li>
        </ul>
      </div>
      <a href="https://atlas-health.com/mediluxe" class="btn">Explore Concierge Portal →</a>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} MediLuxe Healthcare Concierge · Dubai & Abu Dhabi, UAE.</p></div>
  </div></body></html>`;
}

function buildNewsletterProtocolsHtml({ firstName = 'Clinician' } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#334155;margin:0;padding:0;}
    .container{max-width:600px;margin:0 auto;padding:20px;}
    .header{background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;}
    .content{background:#fff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;}
    .footer{text-align:center;padding:20px;font-size:12px;color:#94a3b8;}
    .badge{display:inline-block;background:#14b8a6;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px;}
    .card{background:#f0fdfa;border:1px solid #ccfbf1;border-left:4px solid #0d9488;border-radius:6px;padding:16px;margin:18px 0;}
    .btn{display:inline-block;padding:12px 24px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;margin-top:16px;}
    h1{margin:0;font-size:22px;font-weight:700;}
  </style></head><body>
  <div class="container">
    <div class="header">
      <div class="badge">Clinical Pathways Compendium</div>
      <h1>Standardized Clinical Protocols Blueprint</h1>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">78 Evidence-Based Pathways · Multi-Compound Synergies · Safety Checkpoints</p>
    </div>
    <div class="content">
      <p>Hello <strong>${firstName}</strong>,</p>
      <p>You have unlocked the Atlas Health Clinical Protocols Directory Blueprint. Below is the framework used by longevity and functional medicine practitioners.</p>
      <div class="card">
        <h3 style="margin:0 0 8px;font-size:14px;color:#0f766e;">Directory Architecture:</h3>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#334155;">
          <li><strong>10 Therapeutic Goals:</strong> Tissue Repair, Neuroprotection, Metabolic Health, Longevity, and more.</li>
          <li><strong>Multi-Compound Synergies:</strong> Complementary peptide mechanisms (e.g. BPC-157 + TB-500, CJC-1295 + Ipamorelin).</li>
          <li><strong>Surveillance Checkpoints:</strong> DEXA intervals, CBC/CMP baseline schedules, and IGF-1 titration targets.</li>
        </ul>
      </div>
      <a href="https://atlas-health.com/proto" class="btn">Explore All 78 Protocols →</a>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Atlas Health Clinical Advisory Board.</p></div>
  </div></body></html>`;
}

// ── REGISTRY ──────────────────────────────────────────────────────────────────
export const EMAIL_TEMPLATE_REGISTRY = [
  {
    id: 'TPL-001',
    name: 'Welcome — Customer / Patient',
    category: 'Onboarding',
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
    category: 'Onboarding',
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
    category: 'Orders',
    description: 'Sent to the customer immediately after they submit an order. Includes order ID, items, totals, and payment next steps.',
    trigger: 'Firestore: orders/{orderId} created → Cloud Function onNewOrder',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/clientConfirmation.js',
    tags: ['order', 'auto'],
    getHtml: () => {
      return buildOrderNotificationHtml(SAMPLE_ORDER).replace('🛒 New Order — Admin', '✅ Order Received — Customer');
    },
  },
  {
    id: 'TPL-004',
    name: 'New Order — Admin Notification',
    category: 'Orders',
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
    category: 'Access Control',
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
    category: 'Access Control',
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
    category: 'Clinical / B2B',
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
  {
    id: 'TPL-008',
    name: 'Public Newsletter — Peptide Research & Reconstitution Compendium',
    category: 'Public Newsletters',
    description: 'Sent automatically when a visitor subscribes from any Peptide Monograph inquiry drawer (/p/[slug]). Delivers reconstitution calculations, cold-chain guidelines, and HPLC purity standards.',
    trigger: 'Firestore: inquiries/{id} created (type: newsletter, context: peptide_monograph)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/newsletterPeptides.js',
    tags: ['newsletter', 'auto'],
    getHtml: () => buildNewsletterPeptidesHtml({ firstName: 'Dr. Sarah' }),
  },
  {
    id: 'TPL-009',
    name: 'Public Newsletter — Colway Cellular Cosmeceuticals & Hair Follicle Dossier',
    category: 'Public Newsletters',
    description: 'Sent automatically when a visitor subscribes from the Colway AteloCollagen or Hair Scalp Treatment drawer. Delivers clinical trial data on Baicapil 2% and Collagen XVII preservation.',
    trigger: 'Firestore: inquiries/{id} created (type: newsletter, context: colway_product)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/newsletterColway.js',
    tags: ['newsletter', 'auto'],
    getHtml: () => buildNewsletterColwayHtml({ firstName: 'Dr. Elena' }),
  },
  {
    id: 'TPL-010',
    name: 'Public Newsletter — Bloodo At-Home Capillary Biomarkers Requisition Guide',
    category: 'Public Newsletters',
    description: 'Sent automatically when a visitor inquires from the Bloodo diagnostic testing drawer. Delivers the CE-IVDR sample collection protocol, fasting guidelines, and biomarker reference ranges.',
    trigger: 'Firestore: inquiries/{id} created (type: newsletter, context: bloodo_diagnostic)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/newsletterBloodo.js',
    tags: ['newsletter', 'auto'],
    getHtml: () => buildNewsletterBloodoHtml({ firstName: 'Marc' }),
  },
  {
    id: 'TPL-011',
    name: 'Public Newsletter — MediLuxe GCC Compounding Concierge Executive Brief',
    category: 'Public Newsletters',
    description: 'Sent automatically when a clinic or corporate partner requests partnership information via /mediluxe. Delivers UAE pharmacy licensing, MOHAP compounding frameworks, and turnaround SLAs.',
    trigger: 'Firestore: inquiries/{id} created (type: inquiry, context: mediluxe_corporate)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/newsletterMediLuxe.js',
    tags: ['newsletter', 'b2b', 'auto'],
    getHtml: () => buildNewsletterMediLuxeHtml({ firstName: 'Dr. Al-Mansoor' }),
  },
  {
    id: 'TPL-012',
    name: 'Public Newsletter — Clinical Protocols Directory Blueprints',
    category: 'Public Newsletters',
    description: 'Sent automatically when a visitor or physician requests clinical blueprints from the Clinical Protocols Directory (/proto). Delivers the 78 evidence-based titration pathways and safety checklists.',
    trigger: 'Firestore: inquiries/{id} created (type: newsletter, context: protocols_directory)',
    channel: 'Cloud Function → Nodemailer (Gmail)',
    sourceFile: 'functions/emailTemplates/newsletterProtocols.js',
    tags: ['newsletter', 'clinical', 'auto'],
    getHtml: () => buildNewsletterProtocolsHtml({ firstName: 'Dr. Vega' }),
  },
];

export const getTemplateById = (id) => EMAIL_TEMPLATE_REGISTRY.find(t => t.id === id);
