/**
 * emailCampaignRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Data-access layer for Atlas Health catalog campaigns, templates, and events.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { validateEmailCampaign, validateEmailTemplate, validateEmailEvent } from '../schemas/emailCampaignSchema';

const campaignsCol = () => collection(db, 'catalogEmailCampaigns');
const templatesCol = () => collection(db, 'catalogEmailTemplates');
const eventsCol = () => collection(db, 'catalogEmailEvents');

export const emailCampaignRepository = {
  /**
   * Campaigns
   */
  async getCampaignById(id) {
    const snap = await getDoc(doc(db, 'catalogEmailCampaigns', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async saveCampaign(campaignData) {
    const campaignId = campaignData.campaignId || doc(campaignsCol()).id;
    const cleanData = { ...campaignData, campaignId, updatedAt: new Date().toISOString() };
    
    const validation = validateEmailCampaign(cleanData);
    if (!validation.ok) {
      throw new Error(`Campaign validation error: ${validation.errors.join(', ')}`);
    }

    await setDoc(doc(db, 'catalogEmailCampaigns', campaignId), cleanData);
    return cleanData;
  },

  async getCampaignsByOwner(ownerId) {
    const q = query(campaignsCol(), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      // Fallback if index isn't created yet
      const fallbackQuery = query(campaignsCol(), where('ownerId', '==', ownerId));
      const snap = await getDocs(fallbackQuery);
      return snap.docs.map(d => d.data());
    }
  },

  async getAllCampaigns() {
    const snap = await getDocs(campaignsCol());
    return snap.docs.map(d => d.data());
  },

  /**
   * Reusable Templates
   */
  async getTemplateById(id) {
    const snap = await getDoc(doc(db, 'catalogEmailTemplates', id));
    return snap.exists() ? snap.data() : null;
  },

  async saveTemplate(templateData) {
    const templateId = templateData.templateId || doc(templatesCol()).id;
    const cleanData = { ...templateData, templateId, updatedAt: new Date().toISOString() };
    
    const validation = validateEmailTemplate(cleanData);
    if (!validation.ok) {
      throw new Error(`Template validation error: ${validation.errors.join(', ')}`);
    }

    await setDoc(doc(db, 'catalogEmailTemplates', templateId), cleanData);
    return cleanData;
  },

  async getTemplatesByOwner(ownerId) {
    const q = query(templatesCol(), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },

  /**
   * Event Logging & Redirection Routing
   */
  async logEvent(campaignId, eventType, metadata = {}) {
    const eventId = doc(eventsCol()).id;
    const event = {
      eventId,
      campaignId,
      eventType,
      metadata,
      createdAt: new Date().toISOString()
    };

    const validation = validateEmailEvent(event);
    if (!validation.ok) {
      throw new Error(`Event validation error: ${validation.errors.join(', ')}`);
    }

    await setDoc(doc(db, 'catalogEmailEvents', eventId), event);

    // Update campaign counters in background
    const campaignRef = doc(db, 'catalogEmailCampaigns', campaignId);
    if (eventType === 'open') {
      await updateDoc(campaignRef, {
        'tracking.opened': true,
        'tracking.openCount': increment(1)
      }).catch(e => console.error('Error incrementing open stats:', e));
    } else if (eventType === 'click') {
      await updateDoc(campaignRef, {
        'tracking.clicked': true,
        'tracking.clickCount': increment(1)
      }).catch(e => console.error('Error incrementing click stats:', e));
    }

    return event;
  }
};
