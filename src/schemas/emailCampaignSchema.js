/**
 * emailCampaignSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation schemas and builders for Catalog Email Campaigns.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CAMPAIGN_STATUS = Object.freeze({
  DRAFT: 'draft',
  SENT: 'sent',
  ARCHIVED: 'archived',
});

export const TEMPLATE_TYPE = Object.freeze({
  SHARE: 'share',
  ONBOARDING: 'onboarding',
  WHOLESALER: 'wholesaler',
  CONFERENCE: 'conference',
  RECOMMENDATION: 'recommendation',
  FOLLOW_UP: 'follow_up',
  QUOTE: 'quote',
});

export const EVENT_TYPE = Object.freeze({
  OPEN: 'open',
  CLICK: 'click',
  SHARE: 'share',
  DOWNLOAD: 'download',
  CONVERSION: 'conversion',
});

export function validateEmailCampaign(c) {
  if (!c || typeof c !== 'object') {
    return { ok: false, errors: ['campaign is null or not an object'] };
  }
  const errors = [];
  const required = ['campaignId', 'catalogId', 'recipient', 'subject', 'status', 'createdAt'];

  for (const field of required) {
    if (!c[field]) {
      errors.push(`Missing field: "${field}"`);
    }
  }

  if (c.recipient && (!c.recipient.email || !c.recipient.name)) {
    errors.push('Recipient must contain both name and email.');
  }

  if (c.status && !Object.values(CAMPAIGN_STATUS).includes(c.status)) {
    errors.push(`Invalid campaign status: "${c.status}"`);
  }

  const ok = errors.length === 0;
  return { ok, errors };
}

export function validateEmailTemplate(t) {
  if (!t || typeof t !== 'object') {
    return { ok: false, errors: ['template is null or not an object'] };
  }
  const errors = [];
  const required = ['templateId', 'name', 'subjectTemplate', 'bodyTemplate', 'type'];

  for (const field of required) {
    if (!t[field]) {
      errors.push(`Missing template field: "${field}"`);
    }
  }

  if (t.type && !Object.values(TEMPLATE_TYPE).includes(t.type)) {
    errors.push(`Invalid template type: "${t.type}"`);
  }

  const ok = errors.length === 0;
  return { ok, errors };
}

export function validateEmailEvent(e) {
  if (!e || typeof e !== 'object') {
    return { ok: false, errors: ['event is null or not an object'] };
  }
  const errors = [];
  const required = ['eventId', 'campaignId', 'eventType', 'createdAt'];

  for (const field of required) {
    if (!e[field]) {
      errors.push(`Missing event field: "${field}"`);
    }
  }

  if (e.eventType && !Object.values(EVENT_TYPE).includes(e.eventType)) {
    errors.push(`Invalid eventType: "${e.eventType}"`);
  }

  const ok = errors.length === 0;
  return { ok, errors };
}

export function emptyCampaign(overrides = {}) {
  const now = new Date().toISOString();
  return {
    campaignId: '',
    catalogId: '',
    tenantId: '',
    ownerId: '',
    subject: '',
    status: CAMPAIGN_STATUS.DRAFT,
    recipient: {
      name: '',
      email: '',
      clinic: ''
    },
    personalization: {
      goal: '',
      introMessage: '',
      audience: 'doctors'
    },
    tracking: {
      opened: false,
      clicked: false,
      replied: false,
      openCount: 0,
      clickCount: 0
    },
    createdAt: now,
    sentAt: null,
    ...overrides
  };
}
