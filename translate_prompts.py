import re
import sys

file_path = "/Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/PortalLayout.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """const PAGE_SPECIFIC_PROMPTS = {
  // Admin & Generic Dashboards
  'dashboard': [
    { label: '📈 Today\\'s Sales', prompt: 'Analyze today\\'s sales and highlight the top performing products.' },
    { label: '👥 New Doctors', prompt: 'List all newly registered doctors today and check their verification status.' },
    { label: '⚠️ System Alerts', prompt: 'Summarize any critical system alerts or pending attention items for today.' },
    { label: '📊 Weekly Report', prompt: 'Generate a comprehensive weekly performance report comparing current metrics to last week.' },
  ],
  'overview': [
    { label: '📊 General Overview', prompt: 'Provide a high-level overview of the current system state.' },
    { label: '📈 Analyze Trends', prompt: 'Analyze recent activity and identify any notable upward or downward trends.' },
    { label: '⚠️ Identify Issues', prompt: 'Identify any potential bottlenecks or issues in the current pipeline.' },
    { label: '📋 Activity Report', prompt: 'Generate a detailed activity report for the last 24 hours.' },
  ],
  
  // Users & Communication
  'users': [
    { label: '🔍 Find Inactive Doctors', prompt: 'Search for medical professionals who have not logged in for over 30 days.' },
    { label: '✅ Approve Registrations', prompt: 'Show me all pending doctor registrations that require manual approval.' },
    { label: '📧 Patient Reminders', prompt: 'Draft a friendly email reminder for patients with upcoming appointments.' },
    { label: '🛡️ Audit Permissions', prompt: 'Audit user permissions and highlight anyone with excessive access.' },
  ],
  'clients': [
    { label: '👥 Analyze Segmentation', prompt: 'Analyze our client base and segment them by purchasing behavior.' },
    { label: '⚠️ Inactive Clients', prompt: 'List clients who haven\\'t made a purchase in the last quarter.' },
    { label: '💰 LTV per Client', prompt: 'Calculate the average Lifetime Value (LTV) for our top 20% of clients.' },
    { label: '📧 Retention Campaign', prompt: 'Draft an email campaign designed to re-engage inactive clients.' },
  ],
  'messages': [
    { label: '✉️ Draft Message', prompt: 'Help me draft a professional response to a client inquiry.' },
    { label: '🔍 Unread Priority', prompt: 'Filter my inbox for unread messages marked as high priority.' },
    { label: '🤖 Auto-responder', prompt: 'Generate an AI auto-responder template for out-of-office hours.' },
    { label: '📊 Support Stats', prompt: 'Show me statistics on our average ticket resolution time.' },
  ],
  'invitations': [
    { label: '📨 Invitation Status', prompt: 'Check the status of all sent platform invitations.' },
    { label: '⚠️ Resend Pending', prompt: 'Automatically resend invitations to users who haven\\'t accepted after 7 days.' },
    { label: '📊 Acceptance Rate', prompt: 'Calculate the conversion rate of our invitation emails.' },
    { label: '📋 Mass Links', prompt: 'Generate unique invitation links for a batch of new users.' },
  ],
  'calendar': [
    { label: '📅 Schedule Appointment', prompt: 'Help me find an available slot for a new patient consultation.' },
    { label: '⏰ Send Reminders', prompt: 'Send SMS/Email reminders to everyone on tomorrow\\'s schedule.' },
    { label: '🔄 Suggest Reschedules', prompt: 'Suggest optimal rescheduling times for cancelled appointments.' },
    { label: '📊 Weekly Occupancy', prompt: 'Calculate the clinic\\'s occupancy rate for this week.' },
  ],

  // Catalog & Inventory
  'catalog-inventory': [
    { label: '📦 Total Stock', prompt: 'Provide a summary of total stock value and item count.' },
    { label: '📉 Critical Products', prompt: 'Identify products that are currently below their minimum stock threshold.' },
    { label: '🔄 Inventory Turnover', prompt: 'Analyze inventory turnover rates to find slow-moving items.' },
    { label: '📝 Inventory Report', prompt: 'Generate a comprehensive PDF report of the current inventory state.' },
  ],
  'products': [
    { label: '🛒 Critical Stock', prompt: 'Analyze critical stock levels and suggest reorder quantities.' },
    { label: '💰 Dynamic Pricing', prompt: 'Suggest dynamic pricing adjustments based on current market demand.' },
    { label: '📝 SEO Descriptions', prompt: 'Generate SEO-optimized product descriptions for the selected items.' },
    { label: '🔄 Sync with Zoho', prompt: 'Check for discrepancies between our catalog and Zoho Inventory.' },
  ],
  'stock': [
    { label: '📉 Shortage Alerts', prompt: 'Alert me of any upcoming stock shortages based on current burn rates.' },
    { label: '📦 Suggest Reorder', prompt: 'Create a draft purchase order for out-of-stock items.' },
    { label: '📊 Inventory Cost', prompt: 'Calculate the total capital tied up in current inventory.' },
    { label: '🚚 Delivery Times', prompt: 'Analyze average supplier delivery times for our top 10 items.' },
  ],
  'enrichment': [
    { label: '🧬 AI Data Enrichment', prompt: 'Use AI to automatically enrich missing product descriptions and metadata.' },
    { label: '🔍 Validate Descriptions', prompt: 'Validate medical accuracy of the existing product descriptions.' },
    { label: '📊 Enrichment Progress', prompt: 'Show me the percentage of the catalog that is fully enriched.' },
    { label: '⚠️ Empty Fields', prompt: 'Identify products missing critical fields like ingredients or dosage.' },
  ],
  'catalog-builder': [
    { label: '🏗️ Generate Variant', prompt: 'Create a new product variant based on existing attributes.' },
    { label: '💰 Adjust Margins', prompt: 'Recalculate retail prices to ensure a minimum 40% profit margin.' },
    { label: '🔄 Sync Master Catalog', prompt: 'Synchronize all local catalog changes with the master database.' },
    { label: '📋 Export to CSV', prompt: 'Export the current catalog view to a CSV file for analysis.' },
  ],

  // Clinical & Science
  'lab-tests': [
    { label: '🧪 AI Result Analysis', prompt: 'Analyze these lab results and flag any abnormal biomarkers.' },
    { label: '📈 Biomarker Trends', prompt: 'Plot the historical trends for this patient\\'s key biomarkers.' },
    { label: '⚠️ Abnormal Values', prompt: 'Highlight critical values that require immediate medical attention.' },
    { label: '📋 Medical Report', prompt: 'Generate a comprehensive medical report summarizing these lab findings.' },
  ],
  'protocols': [
    { label: '🔬 Longevity Protocol', prompt: 'Draft a customized longevity protocol based on the patient\\'s profile.' },
    { label: '💊 Drug Interactions', prompt: 'Check the current protocol for any dangerous drug interactions.' },
    { label: '📑 Audit Max Dosages', prompt: 'Audit the prescribed dosages to ensure they do not exceed safe limits.' },
    { label: '⚖️ Legal Compliance', prompt: 'Review this protocol against current FDA compounding regulations.' },
  ],
  'patients': [
    { label: '📋 Patient Progress', prompt: 'Review the recent progress notes for my assigned patients.' },
    { label: '⚠️ Side Effects', prompt: 'Identify any patients who recently reported adverse side effects.' },
    { label: '🗓️ Upcoming Visits', prompt: 'Show my patient schedule for the next 48 hours.' },
    { label: '📝 Draft Eval Note', prompt: 'Draft a SOAP note template for today\\'s evaluations.' },
  ],
  'treatments': [
    { label: '💉 Optimal Dosage', prompt: 'Calculate the optimal dosage based on the patient\\'s weight and history.' },
    { label: '🧬 Clinical Alternatives', prompt: 'Suggest clinical alternatives for patients allergic to standard treatments.' },
    { label: '📈 Treatment Efficacy', prompt: 'Analyze the overall efficacy rate of this specific treatment protocol.' },
    { label: '📘 Review Guidelines', prompt: 'Summarize the latest clinical guidelines for this condition.' },
  ],

  // AI & Automation
  'ai-system': [
    { label: '🤖 Agent Status', prompt: 'Check the health and operational status of all autonomous AI agents.' },
    { label: '⚙️ Global Parameters', prompt: 'Review and suggest optimizations for the global AI temperature and context settings.' },
    { label: '📊 Token Consumption', prompt: 'Analyze API token consumption for the current billing cycle.' },
    { label: '⚠️ Analyze Errors', prompt: 'Analyze recent AI generation errors and suggest system prompts improvements.' },
  ],
  'workflows': [
    { label: '⚡ New Automation', prompt: 'Help me design a new automation workflow for onboarding patients.' },
    { label: '🔍 Audit Triggers', prompt: 'Audit recent workflow executions to find failed triggers.' },
    { label: '📈 Execution Times', prompt: 'Analyze the average execution time of our heaviest workflows.' },
    { label: '🔄 Sync Webhooks', prompt: 'Verify that all external webhooks are responding correctly.' },
  ],
  'prescription-agent': [
    { label: '💊 Suggest Base Rx', prompt: 'Suggest a base prescription tailored to the patient\\'s latest lab work.' },
    { label: '⚖️ Cross Interactions', prompt: 'Validate the proposed prescription against the patient\\'s current medications.' },
    { label: '⚠️ Dosage Alerts', prompt: 'Check for any dosage warnings based on the patient\\'s age and weight.' },
    { label: '📋 Summarize History', prompt: 'Summarize the patient\\'s prescription history over the last 12 months.' },
  ],
  'ai-agents': [
    { label: '🤖 Real-time Activity', prompt: 'Show me the real-time activity logs for the active AI agents.' },
    { label: '⚙️ Adjust Roles', prompt: 'Help me adjust the system prompt for the triage agent to be more empathetic.' },
    { label: '📈 Evaluate Agents', prompt: 'Evaluate the resolution success rate of the customer support agent.' },
    { label: '🛑 Stop Agent', prompt: 'Safely halt any agent that has entered an infinite loop.' },
  ],
  'clinical-ai': [
    { label: '🔬 Review Literature', prompt: 'Search PubMed for recent literature regarding this peptide therapy.' },
    { label: '💊 Complex Interactions', prompt: 'Analyze potential complex metabolic interactions for this polypharmacy stack.' },
    { label: '🧠 Differential Diagnosis', prompt: 'Suggest a differential diagnosis based on these symptoms and lab results.' },
    { label: '📑 Summarize Case', prompt: 'Summarize this clinical case into a concise paragraph for a colleague review.' },
  ],
  'semantic': [
    { label: '🧠 Map Synonyms', prompt: 'Map medical synonyms to improve the search accuracy of the product catalog.' },
    { label: '🔍 Improve Search', prompt: 'Analyze recent failed search queries and suggest semantic improvements.' },
    { label: '📊 Semantic Coverage', prompt: 'Evaluate the semantic coverage of our current medical taxonomy.' },
    { label: '⚙️ Adjust Weights', prompt: 'Adjust the vector search relevance weights to prioritize exact matches.' },
  ],
  'ai-logs': [
    { label: '📜 Recent Transcripts', prompt: 'Fetch the transcripts of the last 5 AI-user conversations.' },
    { label: '⚠️ Filter Errors', prompt: 'Filter the logs to show only interactions that resulted in an AI fallback error.' },
    { label: '📊 Tokens Today', prompt: 'Show me a breakdown of token consumption by feature for today.' },
    { label: '🔍 Search Queries', prompt: 'Search the AI logs for any mentions of "adverse reaction".' },
  ],
  'audit-logs': [
    { label: '🛡️ Unauthorized Access', prompt: 'Scan the audit logs for any unauthorized access attempts.' },
    { label: '⚠️ Security Alerts', prompt: 'Summarize recent security alerts flagged by the system.' },
    { label: '🧑‍💻 User Activity', prompt: 'Trace the activity of a specific user over the last 48 hours.' },
    { label: '📋 Export Audit', prompt: 'Export the security audit log for compliance review.' },
  ],

  // Data Imports
  'data-import': [
    { label: '📥 Start Mass Import', prompt: 'Guide me through the process of starting a mass data import.' },
    { label: '⚠️ Resolve Conflicts', prompt: 'Identify and resolve data conflicts from the latest import batch.' },
    { label: '📊 Import Status', prompt: 'Show the progress and error rate of the currently running import.' },
    { label: '🔄 Undo Last Import', prompt: 'Safely revert the database state to before the last import.' },
  ],
  'import-catalogs': [
    { label: '📦 Smart Mapping', prompt: 'Use AI to intelligently map columns from the uploaded supplier CSV.' },
    { label: '🔍 Validate SKUs', prompt: 'Validate that all imported SKUs conform to our internal naming convention.' },
    { label: '⚠️ Detect Duplicates', prompt: 'Scan the imported catalog for duplicate or near-duplicate items.' },
    { label: '📊 Success Report', prompt: 'Generate a success report detailing items added vs. items skipped.' },
  ],
  'import-prices': [
    { label: '💰 Margin Impact', prompt: 'Analyze how the new imported price list will impact our overall profit margins.' },
    { label: '📈 Avg Change', prompt: 'Calculate the average percentage price increase across the imported list.' },
    { label: '⚠️ Anomalous Prices', prompt: 'Detect any prices that increased or decreased by more than 50%.' },
    { label: '🔄 Sync Price Lists', prompt: 'Synchronize the newly imported prices with the active storefront.' },
  ],
  'import-coa': [
    { label: '📑 Read PDF with AI', prompt: 'Use OCR and AI to extract data from the uploaded Certificate of Analysis (CoA) PDFs.' },
    { label: '⚠️ Validate Expiration', prompt: 'Check the imported CoAs and flag any batches nearing expiration.' },
    { label: '🔬 Extract Purity', prompt: 'Extract the purity percentage from the CoA and update the database.' },
    { label: '📋 Link to Batches', prompt: 'Automatically link the imported certificates to their corresponding inventory batches.' },
  ],
  'import-rfq': [
    { label: '📄 Process RFQ', prompt: 'Process the uploaded Request for Quotation (RFQ) document and extract the requested items.' },
    { label: '💰 Compare Rates', prompt: 'Compare the RFQ requested items against our current standard pricing.' },
    { label: '⚠️ Identify Urgent', prompt: 'Flag any RFQs that have tight deadlines or require expedited shipping.' },
    { label: '📧 Draft Response', prompt: 'Draft a professional email response including our formal quotation.' },
  ],
  'import-prescriptions': [
    { label: '💊 Extract Rx Text', prompt: 'Use AI to read the uploaded prescription image and extract the medication details.' },
    { label: '⚠️ Validate Dosage', prompt: 'Cross-reference the extracted dosage with standard clinical guidelines.' },
    { label: '🧑‍⚕️ Assign Doctor', prompt: 'Identify the prescribing doctor from the document and link the record.' },
    { label: '📋 Generate Order', prompt: 'Convert the validated prescription into an actionable compounding order.' },
  ],
  'import-bloodworks': [
    { label: '🩸 Analyze Lab PDF', prompt: 'Extract biomarker data from the uploaded blood work PDF.' },
    { label: '📈 Extract Biomarkers', prompt: 'Parse the extracted data into a structured format for longitudinal tracking.' },
    { label: '⚠️ Flag Out-of-Range', prompt: 'Highlight any biomarkers that fall outside the standard reference ranges.' },
    { label: '🧠 Suggest Protocol', prompt: 'Suggest a therapeutic protocol based on the out-of-range lab results.' },
  ],
  'import-history': [
    { label: '📜 Failed Imports', prompt: 'List all data imports that failed or partially failed this month.' },
    { label: '🔄 Revert Batch', prompt: 'Provide instructions to revert a specific import batch ID.' },
    { label: '📊 Import Volume', prompt: 'Graph the volume of data imported over the last 6 months.' },
    { label: '🔍 Find File', prompt: 'Search the import history for a specific original filename.' },
  ],

  // Sales & Operations
  'sales-operations': [
    { label: '💰 Pipeline Analysis', prompt: 'Analyze the current sales pipeline and identify deals stuck in negotiation.' },
    { label: '📈 Sales Prediction', prompt: 'Predict next month\\'s revenue based on current pipeline momentum.' },
    { label: '⚠️ Bottlenecks', prompt: 'Identify operational bottlenecks delaying order fulfillment.' },
    { label: '📋 Weekly Report', prompt: 'Generate the weekly commercial report for stakeholders.' },
  ],
  'leads': [
    { label: '🧑‍💼 Qualify Lead', prompt: 'Use AI to score the probability of closing this lead based on their profile.' },
    { label: '📧 Follow-up Email', prompt: 'Draft a personalized follow-up email for leads that haven\\'t responded in 3 days.' },
    { label: '📊 Conversion Rate', prompt: 'Calculate the lead-to-close conversion rate for this quarter.' },
    { label: '⏰ Reminders', prompt: 'Set automated reminders for leads requiring follow-up tomorrow.' },
  ],
  'orders': [
    { label: '📦 Track Order', prompt: 'Get the real-time shipping status of the selected order.' },
    { label: '💰 Validate Payment', prompt: 'Verify if the payment for this order has cleared the bank.' },
    { label: '⚠️ Shipping Issue', prompt: 'Draft a message to the logistics provider regarding this delayed shipment.' },
    { label: '📊 Avg Ticket', prompt: 'Calculate the average order value (AOV) for this week.' },
  ],
  'bulk-orders': [
    { label: '🏭 Wholesale Margin', prompt: 'Calculate the profit margin for this bulk order assuming a 20% discount.' },
    { label: '📦 Validate Inventory', prompt: 'Check if we have sufficient inventory across all warehouses to fulfill this bulk order.' },
    { label: '🚚 Shipping Costs', prompt: 'Estimate the freight shipping costs for this palletized order.' },
    { label: '📑 Proforma Invoice', prompt: 'Generate a proforma invoice for the client\\'s approval.' },
  ],
  'agency-deals': [
    { label: '🤝 Commission Structure', prompt: 'Review the commission structure for our top-tier agency partners.' },
    { label: '📊 Agency Performance', prompt: 'Rank our agencies based on total revenue generated this year.' },
    { label: '⚠️ Expiring Contracts', prompt: 'List all agency contracts that are due to expire in the next 60 days.' },
    { label: '📋 Partner Report', prompt: 'Generate a quarterly performance report to share with agency partners.' },
  ],
  'logistics': [
    { label: '📦 Delayed Shipments', prompt: 'Identify all shipments that have exceeded their estimated delivery date.' },
    { label: '🚚 Contact Provider', prompt: 'Draft an inquiry email to our main logistics provider regarding recent delays.' },
    { label: '📑 Pending CoAs', prompt: 'List orders that cannot ship because they are waiting for CoA validation.' },
    { label: '🏭 Delivery Times', prompt: 'Calculate the average delivery time categorized by region.' },
  ],
  'analytics': [
    { label: '📈 Main Insights', prompt: 'Provide 3 key actionable insights based on this month\\'s analytics data.' },
    { label: '💰 Profitability', prompt: 'Perform a profitability analysis highlighting our most lucrative product categories.' },
    { label: '📉 Retention Leaks', prompt: 'Identify at what stage in the user journey we are losing the most clients.' },
    { label: '📋 Export Dashboard', prompt: 'Compile the current analytics dashboard into an executive PDF.' },
  ],
  'account-managers': [
    { label: '🧑‍💼 KAM Performance', prompt: 'Evaluate the performance of Key Account Managers against their quarterly KPIs.' },
    { label: '💰 Accrued Commissions', prompt: 'Calculate the accrued commissions for the sales team this month.' },
    { label: '⚠️ At-Risk Clients', prompt: 'Identify high-value clients whose engagement has dropped significantly.' },
    { label: '📊 Workload Balance', prompt: 'Analyze the distribution of accounts among managers to ensure balanced workloads.' },
  ],

  // Marketing & Finance
  'marketing-brand': [
    { label: '📢 Campaign Ideas', prompt: 'Brainstorm 5 innovative marketing campaign ideas for our new longevity peptide.' },
    { label: '📈 General ROI', prompt: 'Analyze the Return on Investment for all marketing channels used last month.' },
    { label: '📧 Impactful Copy', prompt: 'Suggest 3 variations of high-converting ad copy for our current promotion.' },
    { label: '🎨 Brand Consistency', prompt: 'Review recent marketing assets to ensure they align with our brand guidelines.' },
  ],
  'email-campaigns': [
    { label: '📧 Draft Email Body', prompt: 'Draft the body of an email campaign announcing our new product line.' },
    { label: '📈 Click-through Rate', prompt: 'Analyze the click-through rates (CTR) of our last 3 campaigns to find patterns.' },
    { label: '⚠️ Filter Bounces', prompt: 'Identify and remove hard-bounced email addresses from the active subscriber list.' },
    { label: '👥 Suggest Segment', prompt: 'Suggest a highly targeted audience segment for our upcoming anti-aging campaign.' },
  ],
  'newsletter': [
    { label: '📰 Write Newsletter', prompt: 'Draft the content for this week\\'s newsletter focusing on regenerative medicine.' },
    { label: '📊 New Subscribers', prompt: 'Show the growth trend of new newsletter subscribers over the last 30 days.' },
    { label: '🎯 Trending Topics', prompt: 'Identify the most clicked topics from our past newsletters.' },
    { label: '📈 Engagement Level', prompt: 'Analyze subscriber engagement and identify the best day of the week to send.' },
  ],
  'email-templates': [
    { label: '🎨 Design Template', prompt: 'Suggest an HTML structure for a modern, responsive transactional email template.' },
    { label: '📝 High Open Subjects', prompt: 'Generate 10 catchy email subject lines designed to maximize open rates.' },
    { label: '🔍 Spam Validation', prompt: 'Analyze the current email copy and flag any words that might trigger spam filters.' },
    { label: '🔄 Prepare A/B Test', prompt: 'Help me set up an A/B test comparing two different calls-to-action (CTAs).' },
  ],
  'drip-marketing': [
    { label: '💧 Sequence Steps', prompt: 'Design a 5-step email drip sequence for onboarding new doctors.' },
    { label: '📈 Funnel Conversion', prompt: 'Analyze the drop-off rates between each step of our main drip funnel.' },
    { label: '⚠️ Stuck Users', prompt: 'Identify users who have been stuck at step 3 of the drip campaign for over a week.' },
    { label: '⚙️ Adjust Timings', prompt: 'Suggest optimal delay timings between emails to maximize engagement without annoying users.' },
  ],
  'coupons': [
    { label: '🎫 Generate Batch', prompt: 'Generate a batch of 50 unique, single-use 15% off discount codes.' },
    { label: '💰 Discount ROI', prompt: 'Analyze the net profitability of orders that used the "SUMMER20" coupon.' },
    { label: '⚠️ Fraud Detection', prompt: 'Scan coupon usage logs for any suspicious patterns or abuse.' },
    { label: '📊 Top Campaigns', prompt: 'Rank our historical promotional campaigns by total revenue generated.' },
  ],
  'referrals': [
    { label: '🤝 Manage Network', prompt: 'Provide an overview of our referral network\\'s growth this quarter.' },
    { label: '💰 Reward Balance', prompt: 'Calculate the outstanding reward balances owed to our affiliates.' },
    { label: '📈 Top Ambassadors', prompt: 'Identify the top 5 ambassadors who have driven the most new signups.' },
    { label: '📧 Invite Message', prompt: 'Draft an enticing message that our current users can send to refer their colleagues.' },
  ],
  'co-branding': [
    { label: '🎨 Visual Proposal', prompt: 'Outline a co-branding visual strategy for our upcoming partnership.' },
    { label: '🤝 Commercial Terms', prompt: 'Draft a summary of standard commercial terms for a revenue-sharing partnership.' },
    { label: '📊 Impact Projection', prompt: 'Project the potential reach and financial impact of partnering with this influencer.' },
    { label: '📋 Generate NDA', prompt: 'Draft a standard Non-Disclosure Agreement (NDA) template for preliminary partnership discussions.' },
  ],
  'finance': [
    { label: '💰 Real-time Revenue', prompt: 'Calculate the total revenue generated so far today across all portals.' },
    { label: '📉 Analyze Expenses', prompt: 'Categorize and analyze our major operational expenses for this month.' },
    { label: '⚠️ Pending Collections', prompt: 'List all accounts receivable that are past due by more than 30 days.' },
    { label: '📊 Cash Flow Projection', prompt: 'Generate a cash flow projection for the next quarter based on current run rates.' },
  ],

  // System & Misc
  'gadget-repository': [
    { label: '🔌 Install Gadget', prompt: 'Provide instructions on how to install and configure a new UI gadget.' },
    { label: '🔄 Sync with Firebase', prompt: 'Synchronize the local gadget definitions with the Firebase repository.' },
    { label: '📊 Usage Stats', prompt: 'Show me analytics on which dashboard gadgets are used most frequently by users.' },
    { label: '🔧 Diagnose Conflict', prompt: 'Help me diagnose a rendering conflict between two specific gadgets.' },
  ],
  'blueprints': [
    { label: '🏗️ Analyze Structure', prompt: 'Analyze the architectural structure of the selected system blueprint.' },
    { label: '⚠️ Validate Dependencies', prompt: 'Check the blueprint for any outdated or circular dependencies.' },
    { label: '📋 Document Architecture', prompt: 'Generate markdown documentation explaining this module\\'s architecture.' },
    { label: '🔄 Sync Modules', prompt: 'Ensure all sub-modules are synchronized with the latest blueprint version.' },
  ],
  'settings': [
    { label: '⚙️ Audit Settings', prompt: 'Audit the global system settings and flag any suboptimal configurations.' },
    { label: '🛡️ Access Policy', prompt: 'Review the current Role-Based Access Control (RBAC) policy for security flaws.' },
    { label: '🔄 Clear System Cache', prompt: 'Provide the command or process to safely clear the global system cache.' },
    { label: '⚠️ Config Alerts', prompt: 'Show any active warnings related to system misconfigurations.' },
  ],
};"""

generic_fallback = """  // Generic 4-function proposal if the page has no specific mapping
  if (pageId) {
    return [
      { label: `🔍 Analyze ${pageId} data`, prompt: `Analyze the data currently displayed on the ${pageId} page and provide insights.` },
      { label: `📊 Generate ${pageId} report`, prompt: `Generate a comprehensive summary report based on the ${pageId} context.` },
      { label: `❓ Quick help on ${pageId}`, prompt: `Explain how the ${pageId} section works and what actions I can take here.` },
      { label: `🛠️ Optimize ${pageId}`, prompt: `Suggest ways to optimize the workflow or data within the ${pageId} module.` },
    ];
  }"""

# Replace PAGE_SPECIFIC_PROMPTS
content = re.sub(r'const PAGE_SPECIFIC_PROMPTS = \{.*?\n\};\n', replacement + '\n', content, flags=re.DOTALL)

# Replace the fallback generic functions
old_generic = r"""  // Generic 4-function proposal if the page has no specific mapping
  if \(pageId\) \{
    return \[
      \{ label: `🔍 Analizar datos de \$\{pageId\}` \},
      \{ label: `📊 Generar reporte de \$\{pageId\}` \},
      \{ label: `❓ Ayuda rápida sobre \$\{pageId\}` \},
      \{ label: `🛠️ Optimizar procesos aquí` \},
    \];
  \}"""

content = re.sub(old_generic, generic_fallback, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement successful")
