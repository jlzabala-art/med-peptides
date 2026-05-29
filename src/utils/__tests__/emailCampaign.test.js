import { describe, test, expect } from 'vitest';
import { validateEmailCampaign, validateEmailTemplate, emptyCampaign } from '../../schemas/emailCampaignSchema';
import { renderCatalogEmailHtml } from '../emailHtmlRenderer';

describe('Catalog Email Delivery System Schemas & Compiler', () => {
  test('emptyCampaign creates valid default campaign state', () => {
    const campaign = emptyCampaign({ subject: 'Longevity Program', ownerId: 'ws-77' });
    expect(campaign.subject).toBe('Longevity Program');
    expect(campaign.ownerId).toBe('ws-77');
    expect(campaign.status).toBe('draft');
    expect(campaign.tracking.opened).toBe(false);
  });

  test('validateEmailCampaign reports missing fields', () => {
    const invalidCampaign = {
      subject: 'Invalid'
      // missing campaignId, catalogId, recipient, status, etc.
    };
    const result = validateEmailCampaign(invalidCampaign);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validateEmailCampaign passes with fully formed campaigns', () => {
    const validCampaign = emptyCampaign({
      campaignId: 'camp-123',
      catalogId: 'cat-longevity',
      recipient: {
        name: 'Dr. Jane Watson',
        email: 'jane.watson@clinic.com',
        clinic: 'Watson Family Practice'
      },
      subject: 'Custom Portfolio Selection'
    });

    const result = validateEmailCampaign(validCampaign);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('renderCatalogEmailHtml produces valid HTML matching GCP themes', () => {
    const mockCatalog = {
      heroTitle: 'Longevity Compounds',
      sections: [
        { title: 'Rejuvenation Pathways', description: 'Selected repair peptides.' }
      ],
      branding: {
        primaryColor: '#1a73e8',
        companyName: 'Apex Health'
      }
    };
    const mockCampaign = {
      subject: 'Personalized Clinical Selection',
      recipient: { name: 'Dr. Watson', clinic: 'Watson Clinic' },
      personalization: { introMessage: 'Curated based on practice details.' }
    };
    
    const html = renderCatalogEmailHtml({
      catalog: mockCatalog,
      campaign: mockCampaign,
      trackingUrl: 'https://atlas-health.com/catalog/track/camp-123'
    });

    expect(html).toContain('Longevity Compounds');
    expect(html).toContain('Personalized Clinical Selection');
    expect(html).toContain('Dr. Watson');
    expect(html).toContain('https://atlas-health.com/catalog/track/camp-123');
    expect(html).toContain('#1a73e8'); // GCP blue variable check
  });
});
