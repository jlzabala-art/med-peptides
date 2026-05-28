"use strict";
/**
 * ai_newsletter.js — AgentNewsletterDigest
 * Migrated to createAgent() factory — v2
 *
 * Generates personalized weekly health research digests.
 * Called by: newsletter_sender.js (Cloud Scheduler) or admin trigger.
 */

const createAgent          = require("../agents/createAgent");
const { callGemini, structuredLogger } = require("./ai_utils");
const nodemailer           = require("nodemailer");
const { gmailUser, gmailAppPass } = require("../config");

const AGENT_ID   = "newsletter-agent-digest";
const AGENT_NAME = "AgentNewsletterDigest";

// ── Goal metadata ──────────────────────────────────────────────────────────────
const GOAL_META = {
  recovery:    { label: "Recovery & Repair",    emoji: "🔬", peptides: ["BPC-157", "TB-500", "GHK-Cu", "KPV"] },
  longevity:   { label: "Longevity",            emoji: "🧬", peptides: ["Epithalon", "MOTS-c", "NMN", "Urolithin A", "Spermidine"] },
  cognitive:   { label: "Cognitive & Mood",     emoji: "🧠", peptides: ["Selank", "Semax", "Dihexa", "NSI-189"] },
  sleep:       { label: "Sleep & Circadian",    emoji: "🌙", peptides: ["DSIP", "Epithalon", "Selank", "KPV"] },
  metabolic:   { label: "Metabolic Health",     emoji: "⚡", peptides: ["Semaglutide", "Tirzepatide", "Retatrutide", "MOTS-c", "AOD-9604"] },
  performance: { label: "Athletic Performance", emoji: "💪", peptides: ["BPC-157", "TB-500", "Ipamorelin", "CJC-1295", "GHK-Cu"] },
  hormonal:    { label: "Hormonal Balance",     emoji: "⚖️", peptides: ["Kisspeptin", "PT-141", "Tesamorelin", "Sermorelin"] },
};

// ── System prompt ──────────────────────────────────────────────────────────────
function buildDigestPrompt(preferences) {
  const goal      = preferences?.goal || "longevity";
  const level     = preferences?.level || "intermediate";
  const areas     = (preferences?.areas || []).join(", ") || "general wellness";
  const meta      = GOAL_META[goal] || GOAL_META.longevity;
  const peptides  = meta.peptides.slice(0, 3).join(", ");

  const levelContext = {
    beginner:     "Use accessible language. Avoid jargon. Explain terms when used.",
    intermediate: "Moderate depth. Assume familiarity with basics. Include mechanism context.",
    advanced:     "High scientific depth. Include mechanistic details, receptor pathways, half-lives.",
  }[level] || "Moderate depth.";

  return `You are AgentNewsletterDigest — an expert medical research content writer for Med-Peptides Research Platform.

SUBSCRIBER PROFILE:
- Research goal: ${meta.label} (${meta.emoji})
- Experience level: ${level}
- Focus areas: ${areas}
- Relevant compounds: ${peptides}

CONTENT GUIDELINES:
- ${levelContext}
- Write a complete weekly research digest (300-450 words)
- Include: 1 compound spotlight, 1 recent research insight, 1 practical protocol tip
- End with an educational question to spark curiosity
- Tone: warm, scientific, trustworthy — like a knowledgeable friend
- Do NOT mention pricing, purchasing, or sales
- Language: English (professional but accessible)
- Do NOT include disclaimers in the body — they will be added in the footer

STRUCTURE (return as JSON):
{
  "subject": "<engaging email subject line — max 60 chars>",
  "preheader": "<preview text — 90 chars max>",
  "compound_spotlight": {
    "name": "<compound>",
    "headline": "<8 words max>",
    "body": "<3-4 sentences on mechanism, research, why it matters for their goal>"
  },
  "research_insight": {
    "title": "<research finding title>",
    "body": "<2-3 sentences summarizing recent findings>"
  },
  "protocol_tip": {
    "title": "<actionable tip title>",
    "body": "<2-3 sentences practical application>"
  },
  "curiosity_question": "<engaging question to prompt exploration>"
}

Return ONLY valid JSON.`;
}

// ── HTML email builder ─────────────────────────────────────────────────────────
function buildDigestHtml(content, preferences, unsubscribeToken) {
  const goal  = preferences?.goal || "longevity";
  const meta  = GOAL_META[goal] || GOAL_META.longevity;
  const unsubUrl = `https://med-peptides.com/unsubscribe?token=${unsubscribeToken}`;
  const GOAL_COLOR = {
    recovery: "#22d3ee", longevity: "#34d399", cognitive: "#f59e0b",
    sleep: "#818cf8", metabolic: "#a78bfa", performance: "#f97316", hormonal: "#ec4899",
  };
  const color = GOAL_COLOR[goal] || "#6366f1";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${content.subject}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:580px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#0f0f1a,#0d1629);padding:24px 32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">${meta.emoji}</span>
        <div>
          <div style="color:#6366f1;font-size:16px;font-weight:700;">Med-Peptides Research</div>
          <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.05em;text-transform:uppercase;">${meta.label} Weekly Digest</div>
        </div>
      </div>
    </div>
    <div style="background:#fff;padding:24px 32px 0;">
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${content.preheader}</p>
    </div>
    <div style="background:#fff;padding:20px 32px;">
      <div style="border-left:3px solid ${color};padding-left:14px;margin-bottom:8px;">
        <div style="font-size:10px;font-weight:700;color:${color};letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">🔬 Compound Spotlight</div>
        <h2 style="margin:0 0 6px;font-size:16px;font-weight:800;color:#0f172a;">${content.compound_spotlight?.name} — ${content.compound_spotlight?.headline}</h2>
        <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">${content.compound_spotlight?.body}</p>
      </div>
    </div>
    <div style="height:1px;background:#f1f5f9;margin:0 32px;"></div>
    <div style="background:#fff;padding:20px 32px;">
      <div style="font-size:10px;font-weight:700;color:#6366f1;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">📊 Research Insight</div>
      <h3 style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0f172a;">${content.research_insight?.title}</h3>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">${content.research_insight?.body}</p>
    </div>
    <div style="height:1px;background:#f1f5f9;margin:0 32px;"></div>
    <div style="background:#fff;padding:20px 32px;">
      <div style="background:#f8fafc;border-radius:10px;padding:16px 18px;border:1px solid #e2e8f0;">
        <div style="font-size:10px;font-weight:700;color:#10b981;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">💡 Protocol Tip</div>
        <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0f172a;">${content.protocol_tip?.title}</h3>
        <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">${content.protocol_tip?.body}</p>
      </div>
    </div>
    <div style="background:#fff;padding:16px 32px 28px;">
      <div style="background:linear-gradient(135deg,${color}10,rgba(99,102,241,0.05));border-radius:10px;padding:14px 18px;border:1px solid ${color}20;text-align:center;">
        <p style="margin:0;color:#334155;font-size:14px;font-style:italic;line-height:1.6;">💭 <em>${content.curiosity_question}</em></p>
      </div>
    </div>
    <div style="background:#fff;padding:0 32px 28px;text-align:center;">
      <a href="https://med-peptides.com" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Explore Research Platform →</a>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.8;">
        Med-Peptides Research Platform · research@med-peptides.com<br>
        For educational and research purposes only. Not medical advice.<br>
        <a href="${unsubUrl}" style="color:#94a3b8;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body></html>`;
}

// ── Agent (factory) ────────────────────────────────────────────────────────────
module.exports = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    null,           // callable by scheduler / internal — no role restriction
  model:           "gemini-2.0-flash",
  maxOutputTokens: 2048,
  timeout:         90,

  handler: async (ctx) => {
    const { body, db } = ctx;
    const { email, preferences = {}, sendEmail = false, subscriberId } = body;

    if (!email) throw new Error("email required");

    // Generate digest
    const systemPrompt = buildDigestPrompt(preferences);
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: "Generate this week's personalized health research digest." }] }],
      systemPrompt, "gemini-2.0-flash", "text/plain", 2048
    );

    let content;
    try {
      content = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim());
    } catch {
      throw new Error("Failed to parse Gemini digest JSON");
    }

    // Get unsubscribeToken
    let unsubToken = "token";
    if (subscriberId) {
      const subDoc = await db.collection("newsletter_subscribers").doc(subscriberId).get();
      if (subDoc.exists) unsubToken = subDoc.data().unsubscribeToken || "token";
    }

    const htmlBody = buildDigestHtml(content, preferences, unsubToken);

    // Optionally send email
    if (sendEmail && email) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailAppPass },
        });
        await transporter.sendMail({
          from: `"Med-Peptides Research" <${gmailUser}>`,
          to: email, subject: content.subject, html: htmlBody,
        });
        if (subscriberId) {
          await db.collection("newsletter_subscribers").doc(subscriberId)
            .update({ lastSentAt: new Date().toISOString() });
        }
      } catch (emailErr) {
        structuredLogger.warn({ event: "digest_email_failed", email, error: emailErr.message });
      }
    }

    return {
      reply: `Digest generated: "${content.subject}"`,
      extras: { subject: content.subject, htmlBody, content },
    };
  },

  // Fallback: return static template digest subject so scheduler doesn't crash
  fallback: async (ctx) => ({
    reply: "Digest generation temporarily unavailable.",
    extras: { subject: "Your Weekly Med-Peptides Research Digest", htmlBody: "", degraded: true },
  }),
});
