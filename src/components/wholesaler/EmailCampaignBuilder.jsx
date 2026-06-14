import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Save from "lucide-react/dist/esm/icons/save";
import Bot from "lucide-react/dist/esm/icons/bot";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Check from "lucide-react/dist/esm/icons/check";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import Mail from "lucide-react/dist/esm/icons/mail";
import Users from "lucide-react/dist/esm/icons/users";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import Eye from "lucide-react/dist/esm/icons/eye";
import Copy from "lucide-react/dist/esm/icons/copy";
import Send from "lucide-react/dist/esm/icons/send";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import React, { useState, useEffect } from 'react';
import { emailCampaignRepository } from '../../repositories/emailCampaignRepository';
import { catalogRepository } from '../../repositories/catalogRepository';
import { askCatalogAssistant } from '../../services/catalogAIService';
import { emptyCampaign, CAMPAIGN_STATUS } from '../../schemas/emailCampaignSchema';
import { renderCatalogEmailHtml } from '../../utils/emailHtmlRenderer';
import EmailPreviewPanel from './EmailPreviewPanel';

















export default function EmailCampaignBuilder({ ownerId, ownerType, onBack }) {
  const [view, setView] = useState('list'); // 'list' | 'builder'
  const [campaigns, setCampaigns] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [campaign, setCampaign] = useState(emptyCampaign({ ownerId }));
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (campaign.recipient?.email) {
      setTestEmail(campaign.recipient.email);
    }
  }, [campaign.recipient?.email]);

  useEffect(() => {
    loadData();
  }, [ownerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignList, catalogList] = await Promise.all([
        emailCampaignRepository.getCampaignsByOwner(ownerId),
        catalogRepository.getCatalogsByOwner(ownerId)
      ]);
      setCampaigns(campaignList);
      setCatalogs(catalogList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCatalog = (catalogId) => {
    const cat = catalogs.find(c => c.id === catalogId);
    setSelectedCatalog(cat);
    setCampaign(prev => ({
      ...prev,
      catalogId,
      subject: prev.subject || `Exclusively Curated Portfolio: ${cat?.title || ''}`
    }));
  };

  // Vertex AI Catalog Assistant: Curates a recipient-specific intro message & subject line
  const handleAiGenerateText = async () => {
    if (!selectedCatalog) {
      alert('Please select a catalog first.');
      return;
    }
    setAiGenerating(true);
    try {
      const prompt = `Write a professional B2B clinical email invitation for a doctor named ${campaign.recipient.name} from ${campaign.recipient.clinic || 'their clinic'}.
The focus of the catalog is: ${campaign.personalization.goal || selectedCatalog.goal}.
The catalog contains products and protocols for this focus.

Return a JSON string matching this format:
{
  "subject": "Exclusively Curated: [Scientific Topic] Portfolio for ${campaign.recipient.name}",
  "introMessage": "A concise, clinically professional introduction message (2-3 sentences) explaining why this selection was curated for them."
}

Do NOT wrap in markdown code blocks. Output raw JSON.`;

      const responseText = await askCatalogAssistant({
        message: prompt,
        catalogContext: {
          title: selectedCatalog.title,
          goal: selectedCatalog.goal,
          sections: selectedCatalog.sections
        }
      });

      // parse JSON safely
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleanJson);

      setCampaign(prev => ({
        ...prev,
        subject: parsed.subject || prev.subject,
        personalization: {
          ...prev.personalization,
          introMessage: parsed.introMessage || prev.personalization.introMessage
        }
      }));
    } catch (e) {
      console.error(e);
      alert('AI Generation failed. Using default template copy.');
      setCampaign(prev => ({
        ...prev,
        personalization: {
          ...prev.personalization,
          introMessage: `We have compiled this professional clinical portfolio showcasing advanced compounds and protocols curated specifically for your practice focus.`
        }
      }));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async (sendNow = false) => {
    setSaving(true);
    try {
      const finalCampaign = {
        ...campaign,
        tenantId: selectedCatalog?.branding?.companyName || 'Atlas Health',
        status: sendNow ? CAMPAIGN_STATUS.SENT : CAMPAIGN_STATUS.DRAFT,
        sentAt: sendNow ? new Date().toISOString() : null
      };

      await emailCampaignRepository.saveCampaign(finalCampaign);
      // If sent, write mock open/click events in next 10 seconds for demo tracking
      if (sendNow) {
        alert('Email campaign sent successfully to queue!');
      } else {
        alert('Campaign saved as draft.');
      }
      setView('list');
      loadData();
    } catch (e) {
      alert(`Error saving campaign: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClone = (clonedCampaign) => {
    setCampaign({
      ...clonedCampaign,
      campaignId: '', // resets for a new save
      status: CAMPAIGN_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      sentAt: null,
      tracking: {
        opened: false,
        clicked: false,
        replied: false,
        openCount: 0,
        clickCount: 0
      }
    });
    const cat = catalogs.find(c => c.id === clonedCampaign.catalogId);
    setSelectedCatalog(cat);
    setActiveStep(1);
    setView('builder');
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      alert('Please enter a test email address.');
      return;
    }
    setSendingTest(true);
    setTestSentSuccess(false);
    try {
      // Simulate real background compilation and send API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      setTestSentSuccess(true);
    } catch (err) {
      alert('Simulation failed.');
    } finally {
      setSendingTest(false);
    }
  };

  // Compile tracking URL point
  const trackingUrl = selectedCatalog 
    ? `${window.location.origin}/catalog/track/${campaign.campaignId || 'mock-id'}?recipient=${encodeURIComponent(campaign.recipient.name)}`
    : '#';

  const compiledHtml = renderCatalogEmailHtml({
    catalog: selectedCatalog,
    campaign,
    trackingUrl
  });

  // Calculate analytics summary indicators
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
  const totalOpens = campaigns.reduce((acc, c) => acc + (c.tracking?.openCount || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.tracking?.clickCount || 0), 0);
  const clickThroughRate = sentCampaigns > 0 ? ((totalClicks / sentCampaigns) * 100).toFixed(1) : '0';

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = 
      (c.recipient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.recipient?.clinic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div style={loadingStyle}>Loading email campaigns...</div>;
  }

  if (view === 'builder') {
    return (
      <div style={splitScreenContainerStyle}>
        {/* LEFT: Parameters Wizard */}
        <div style={builderPanelStyle}>
          <div style={flowHeaderStyle}>
            <button onClick={() => setView('list')} style={backLinkStyle}>
              <ArrowLeft size={16} /> Back to campaigns
            </button>
            <h2 style={flowTitleStyle}>Personalized Email Builder</h2>
          </div>

          <div style={stepperStyle}>
            {[1, 2, 3, 4].map(sNum => (
              <div 
                key={sNum}
                onClick={() => setActiveStep(sNum)}
                style={{
                  ...stepItemStyle,
                  color: activeStep === sNum ? '#1a73e8' : '#5f6368',
                  borderBottom: activeStep === sNum ? '2px solid #1a73e8' : '2px solid transparent'
                }}
              >
                <div style={stepNumStyle}>{sNum}</div>
                <span>
                  {sNum === 1 ? 'Select Catalog' :
                   sNum === 2 ? 'Recipient Details' :
                   sNum === 3 ? 'AI copy generation' :
                   'Review & Send'}
                </span>
              </div>
            ))}
          </div>

          <div style={formBodyStyle}>
            {activeStep === 1 && (
              <div style={stepContentStyle}>
                <h3>Step 1: Choose Catalog to Share</h3>
                <p style={helpTextStyle}>Select one of your published territory catalogs.</p>

                <div style={goalsGridStyle}>
                  {catalogs.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCatalog(cat.id)}
                      style={{
                        ...goalCardStyle,
                        borderColor: campaign.catalogId === cat.id ? '#1a73e8' : '#dadce0',
                        backgroundColor: campaign.catalogId === cat.id ? '#e8f0fe' : 'var(--color-bg-surface)'
                      }}
                    >
                      <Mail size={16} />
                      <strong>{cat.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#5f6368' }}>/{cat.slug}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div style={stepContentStyle}>
                <h3>Step 2: Target Recipient Info</h3>
                <p style={helpTextStyle}>Enter the target clinic details to customize naming parameters.</p>

                <div style={formFieldStyle}>
                  <label style={labelStyle}>Recipient Full Name</label>
                  <input 
                    type="text"
                    value={campaign.recipient.name}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      recipient: { ...prev.recipient, name: e.target.value }
                    }))}
                    placeholder="Dr. Marina"
                    style={inputStyle}
                  />
                </div>

                <div style={formFieldStyle}>
                  <label style={labelStyle}>Recipient Email Address</label>
                  <input 
                    type="email"
                    value={campaign.recipient.email}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      recipient: { ...prev.recipient, email: e.target.value }
                    }))}
                    placeholder="marina@clinic.com"
                    style={inputStyle}
                  />
                </div>

                <div style={formFieldStyle}>
                  <label style={labelStyle}>Recipient Clinic Name</label>
                  <input 
                    type="text"
                    value={campaign.recipient.clinic}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      recipient: { ...prev.recipient, clinic: e.target.value }
                    }))}
                    placeholder="Magenta Clinics"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div style={stepContentStyle}>
                <h3>Step 3: AI Copywriter Wizard</h3>
                <p style={helpTextStyle}>Use Vertex AI Catalog Assistant to write a subject line and clinical intro text tailored specifically to this recipient.</p>

                <div style={formFieldStyle}>
                  <label style={labelStyle}>Primary Focus / Medical Objective</label>
                  <input 
                    type="text"
                    value={campaign.personalization.goal}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      personalization: { ...prev.personalization, goal: e.target.value }
                    }))}
                    placeholder="e.g. cellular repair after injury"
                    style={inputStyle}
                  />
                </div>

                <button 
                  onClick={handleAiGenerateText} 
                  disabled={aiGenerating || !campaign.recipient.name}
                  style={generateButtonStyle}
                >
                  <Sparkles size={14} /> {aiGenerating ? 'Vertex AI Generating Copy...' : 'Generate Copy via Vertex AI'}
                </button>

                <div style={formFieldStyle}>
                  <label style={labelStyle}>Email Subject Line</label>
                  <input 
                    type="text"
                    value={campaign.subject}
                    onChange={(e) => setCampaign(prev => ({ ...prev, subject: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div style={formFieldStyle}>
                  <label style={labelStyle}>Personalized Intro Message</label>
                  <textarea 
                    value={campaign.personalization.introMessage}
                    onChange={(e) => setCampaign(prev => ({
                      ...prev,
                      personalization: { ...prev.personalization, introMessage: e.target.value }
                    }))}
                    style={textareaStyle}
                  />
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div style={stepContentStyle}>
                <h3>Step 4: Review and Send</h3>
                <p style={helpTextStyle}>Verify your personalization variables and trigger sending to the recipient.</p>

                <div style={reviewBlockStyle}>
                  <div><strong>To:</strong> {campaign.recipient.name} ({campaign.recipient.email})</div>
                  <div><strong>Subject:</strong> {campaign.subject}</div>
                  <div><strong>Target Catalog:</strong> {selectedCatalog?.title || 'None Selected'}</div>
                </div>

                {/* WhatsApp Sharing Invite Compiler */}
                <div style={{
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-app)',
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#137333' }}>
                    <MessageSquare size={16} />
                    <span>WhatsApp Invitation Compiler</span>
                  </div>
                  <p style={{ ...helpTextStyle, fontSize: '0.75rem' }}>
                    Compile a customized invitation link for direct chat channels:
                  </p>
                  <textarea
                    readOnly
                    value={`Hello ${campaign.recipient.name || 'Doctor'}, I have prepared a customized clinical catalog for ${campaign.recipient.clinic || 'your clinic'} focusing on "${campaign.personalization.goal || selectedCatalog?.goal || ''}". You can view it here: ${trackingUrl}`}
                    style={{ ...textareaStyle, minHeight: '60px', fontSize: '0.8rem', backgroundColor: '#f1f3f4', cursor: 'default' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        const msg = `Hello ${campaign.recipient.name || 'Doctor'}, I have prepared a customized clinical catalog for ${campaign.recipient.clinic || 'your clinic'} focusing on "${campaign.personalization.goal || selectedCatalog?.goal || ''}". You can view it here: ${trackingUrl}`;
                        navigator.clipboard.writeText(msg);
                        alert('Invitation text copied to clipboard!');
                      }}
                      style={{ ...actionButtonStyle, display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-bg-surface)', color: '#137333', borderColor: '#137333' }}
                    >
                      <Copy size={12} /> Copy Invitation
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hello ${campaign.recipient.name || 'Doctor'}, I have prepared a customized clinical catalog for ${campaign.recipient.clinic || 'your clinic'} focusing on "${campaign.personalization.goal || selectedCatalog?.goal || ''}". You can view it here: ${trackingUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...actionButtonStyle, display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#137333', color: 'var(--color-bg-surface)', textDecoration: 'none' }}
                    >
                      <ExternalLink size={12} /> Open WhatsApp
                    </a>
                  </div>
                </div>

                {/* Simulated Test Email Tool */}
                <div style={{
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-surface)',
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: '#1a73e8' }}>
                    <Send size={16} />
                    <span>Send Test Email (Simulation)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      style={{ ...actionButtonStyle, backgroundColor: sendingTest ? '#f1f3f4' : '#e8f0fe', color: '#1a73e8', borderColor: '#1a73e8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {sendingTest ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                  {testSentSuccess && (
                    <div style={{ fontSize: '0.75rem', color: '#137333', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Check size={14} /> Simulated test email successfully dispatched to {testEmail}!
                    </div>
                  )}
                </div>

                <div style={buttonGroupStyle}>
                  <button 
                    onClick={() => handleSave(false)} 
                    disabled={saving} 
                    style={{ ...actionButtonStyle, backgroundColor: '#5f6368', color: 'var(--color-bg-surface)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Save size={14} /> Save Draft
                  </button>
                  <button 
                    onClick={() => handleSave(true)} 
                    disabled={saving} 
                    style={{ ...actionButtonStyle, backgroundColor: '#1a73e8', color: 'var(--color-bg-surface)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Mail size={14} /> Send Email Now
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={navigationFooterStyle}>
            <button 
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              style={wizardPrevButtonStyle}
            >
              Previous
            </button>
            <button 
              onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
              disabled={activeStep === 4}
              style={wizardNextButtonStyle}
            >
              Next
            </button>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div style={previewPanelStyle}>
          <EmailPreviewPanel htmlContent={compiledHtml} />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={actionsBarStyle}>
        <h2 style={titleStyle}>Email Delivery Campaigns</h2>
        <button onClick={() => { setCampaign(emptyCampaign({ ownerId })); setView('builder'); }} style={createButtonStyle}>
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {campaigns.length > 0 && (
        <>
          {/* Analytics Summary Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #dadce0'
          }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>Total Campaigns</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#202124' }}>{totalCampaigns}</span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>Delivered</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a73e8' }}>{sentCampaigns}</span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>Opens</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#137333' }}>{totalOpens}</span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>Clicks</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b06000' }}>{totalClicks}</span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid #dadce0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase' }}>Click-Through Rate</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#202124' }}>{clickThroughRate}%</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1rem',
            justifyContent: 'space-between'
          }}>
            <input
              type="text"
              placeholder="Search by recipient, clinic or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, flex: 1, maxWidth: '400px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5f6368' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: '130px', cursor: 'pointer' }}
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </>
      )}

      {campaigns.length === 0 ? (
        <div style={emptyStateStyle}>
          <Mail size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No campaigns found</h3>
          <p>Launch your first B2B email campaign Curating catalogs for clinical leads.</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div style={{ ...emptyStateStyle, padding: '2rem' }}>
          <Mail size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No matching campaigns</h3>
          <p>Try refining your search queries or filter selections.</p>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Recipient</th>
                <th style={thStyle}>Subject Line</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Opens</th>
                <th style={thStyle}>Clicks</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(c => (
                <tr key={c.campaignId} style={tbodyRowStyle}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{c.recipient?.name}</td>
                  <td style={tdStyle}>{c.subject}</td>
                  <td style={tdStyle}>
                    <span style={{
                      ...statusBadgeStyle,
                      backgroundColor: c.status === 'sent' ? '#e6f4ea' : '#f1f3f4',
                      color: c.status === 'sent' ? '#137333' : '#5f6368'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{c.tracking?.openCount || 0}</td>
                  <td style={tdStyle}>{c.tracking?.clickCount || 0}</td>
                  <td style={tdStyle}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => handleClone(c)} style={actionButtonStyle}>
                      Clone Setup
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Styles (Google Cloud inspired) ──────────────────────────────────────────
const containerStyle = {
  background: 'var(--color-bg-surface)',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  padding: '1.5rem',
  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
};

const actionsBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const createButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#1a73e8',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 500,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const loadingStyle = {
  padding: '3rem',
  textAlign: 'center',
  color: '#5f6368',
};

const emptyStateStyle = {
  padding: '4rem 2rem',
  textAlign: 'center',
  color: '#5f6368',
};

const tableContainerStyle = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const theadRowStyle = {
  borderBottom: '2px solid #dadce0',
};

const thStyle = {
  textAlign: 'left',
  padding: '12px 8px',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#3c4043',
  textTransform: 'uppercase',
};

const tbodyRowStyle = {
  borderBottom: '1px solid #e0e0e0',
};

const tdStyle = {
  padding: '14px 8px',
  fontSize: '0.85rem',
  color: '#3c4043',
};

const statusBadgeStyle = {
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 600,
};

const actionButtonStyle = {
  background: 'none',
  border: '1px solid #dadce0',
  borderRadius: '4px',
  color: '#1a73e8',
  cursor: 'pointer',
  padding: '4px 8px',
  fontSize: '0.8rem',
  fontWeight: 600,
};

const splitScreenContainerStyle = {
  display: 'flex',
  height: 'calc(100vh - 120px)',
  background: 'var(--color-bg-surface)',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  overflow: 'hidden',
};

const builderPanelStyle = {
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #dadce0',
  background: 'var(--color-bg-surface)',
};

const previewPanelStyle = {
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--color-bg-app)',
};

const flowHeaderStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #dadce0',
};

const backLinkStyle = {
  background: 'none',
  border: 'none',
  color: '#1a73e8',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: 0,
  marginBottom: '0.5rem',
};

const flowTitleStyle = {
  margin: 0,
  fontSize: '1.2rem',
  color: '#202124',
  fontWeight: 600,
};

const stepperStyle = {
  display: 'flex',
  borderBottom: '1px solid #dadce0',
  backgroundColor: 'var(--color-bg-app)',
  overflowX: 'auto',
};

const stepItemStyle = {
  padding: '0.75rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const stepNumStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
};

const formBodyStyle = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
};

const stepContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const helpTextStyle = {
  margin: 0,
  fontSize: '0.8rem',
  color: '#5f6368',
};

const goalsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.75rem',
};

const goalCardStyle = {
  padding: '1rem',
  border: '1px solid #dadce0',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  outline: 'none',
};

const formFieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#3c4043',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
};

const textareaStyle = {
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
  minHeight: '100px',
  resize: 'vertical',
};

const generateButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  backgroundColor: '#137333',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
};

const reviewBlockStyle = {
  backgroundColor: 'var(--color-bg-app)',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: '#3c4043',
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
};

const navigationFooterStyle = {
  padding: '1rem 1.5rem',
  borderTop: '1px solid #dadce0',
  backgroundColor: 'var(--color-bg-app)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const wizardPrevButtonStyle = {
  backgroundColor: 'var(--color-bg-surface)',
  color: '#1a73e8',
  border: '1px solid #dadce0',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const wizardNextButtonStyle = {
  backgroundColor: '#1a73e8',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.25rem',
  color: '#202124',
  fontWeight: 600,
};