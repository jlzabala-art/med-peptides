const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');

// Ensure firebase app is initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.processInboundEmail = onRequest({ secrets: ['GEMINI_API_KEY'], memory: '1GiB' }, async (req, res) => {
  // Postmark sends a POST request with JSON
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const emailData = req.body;
    
    // 1. Basic Validation
    if (!emailData || !emailData.From) {
      return res.status(400).send('Invalid payload');
    }

    const { From, To, Subject, TextBody, HtmlBody, MessageID, Attachments } = emailData;

    // 1.5 Process Attachments
    const attachmentRefs = [];
    if (Attachments && Array.isArray(Attachments) && Attachments.length > 0) {
      try {
        const bucket = admin.storage().bucket();
        for (const att of Attachments) {
          try {
            const buffer = Buffer.from(att.Content, 'base64');
            const safeName = att.Name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filePath = `inbound_attachments/${MessageID}/${safeName}`;
            const file = bucket.file(filePath);
            await file.save(buffer, { contentType: att.ContentType });
            attachmentRefs.push({
              name: att.Name,
              contentType: att.ContentType,
              path: filePath,
              size: att.ContentLength || buffer.length
            });
          } catch (attErr) {
            console.error("Failed to upload attachment:", att.Name, attErr);
          }
        }
      } catch (bucketErr) {
        console.error("Firebase Storage bucket might not be configured. Attachments skipped.", bucketErr);
      }
    }

    // 1. Guardar el email original crudo en Firestore para auditoría
    const inboundRef = admin.firestore().collection('inbound_emails').doc(MessageID);
    await inboundRef.set({
      from: From,
      to: To,
      subject: Subject,
      textBody: TextBody,
      htmlBody: HtmlBody,
      attachments: attachmentRefs,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending_ai', // AI hasn't processed it yet
      source: 'postmark'
    });

    // 1.5. GUARANTEE VISIBILITY: Crear el documento en operations_queue inmediatamente
    const queueRef = admin.firestore().collection('operations_queue').doc(MessageID);
    await queueRef.set({
      id: MessageID,
      subject: Subject || 'No Subject',
      senderName: From || 'Unknown Sender',
      senderEmail: From || 'Unknown',
      detectedIntent: 'PROCESSING',
      status: 'AI Processing',
      outcome: 'Pending AI Analysis...',
      linkedRecord: null,
      owner: 'System',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: 'other',
      content: TextBody || 'No Content',
      attachments: attachmentRefs.map(a => ({ name: a.name, path: a.path, contentType: a.contentType })),
      extraction: [],
      workflowRecommendation: { action: 'Analyzing...', reasons: [], preview: { type: 'PROCESSING', products: [] } },
      activityLog: [{ id: 1, action: 'Email Received in Server', time: new Date().toLocaleTimeString(), actor: 'System' }]
    });

    // 3. Enqueue to Cloud Tasks and Return 200 OK immediately so Postmark doesn't timeout!
    const queue = getFunctions().taskQueue('triggerAiOnEmailWorker');
    await queue.enqueue({ messageId: MessageID });

    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error processing inbound email:', error);
    return res.status(500).send('Internal Server Error');
  }
});

const { Type, Schema } = require('@google/genai');
const { onTaskDispatched } = require('firebase-functions/v2/tasks');
const { getFunctions } = require('firebase-admin/functions');

exports.triggerAiOnEmailWorker = onTaskDispatched({ 
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 60
  },
  rateLimits: {
    maxConcurrentDispatches: 5
  },
  memory: '1GiB', 
  timeoutSeconds: 300, 
  secrets: ['GEMINI_API_KEY'] 
}, async (req) => {
  const { messageId } = req.data;
  if (!messageId) return;

  const docRef = admin.firestore().collection('inbound_emails').doc(messageId);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return;
  const data = snapshot.data();
  
  if (data.status !== 'pending_ai') return;
  
  const { subject: Subject, from: From, textBody: TextBody } = data;

  try {
    await processEmailWorkflow(messageId, TextBody, Subject, From);
  } catch (err) {
      console.error("AI Processing failed in background worker for:", messageId, err);
      try {
        await docRef.update({
          status: 'ai_failed',
          aiErrorMessage: err.message || 'Unknown AI Error',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          needsHumanReview: true
        });

        await admin.firestore().collection('operations_queue').doc(messageId).set({
          id: messageId,
          subject: Subject || 'No Subject',
          senderName: From || 'Unknown Sender',
          senderEmail: From || 'Unknown',
          detectedIntent: 'UNKNOWN',
          status: 'Failed',
          outcome: 'AI Parsing Failed',
          linkedRecord: null,
          owner: 'Procurement',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          category: 'other',
          content: TextBody || 'No Content',
          extraction: [],
          customerDetection: { name: From, relationship: 'Unknown', lastOrders: 0, totalRevenue: '$0', openRfqs: 0 },
          workflowRecommendation: { action: 'Manual Review', reasons: ['AI Parsing Error'], preview: { type: 'ERROR', products: [] } },
          activityLog: [{ id: 1, action: 'AI Processing Failed', time: new Date().toLocaleTimeString(), actor: 'System' }]
        });
      } catch (updateErr) {
        console.error("Failed to update status to ai_failed:", updateErr);
      }
      throw err; // Rethrow to let Cloud Tasks retry
  }
});

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
exports.enqueueManualUpload = onDocumentCreated({ document: 'inbound_emails/{docId}' }, async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const data = snapshot.data();
  // Only enqueue if it's from manual_upload (webhook handles its own)
  if (data.source === 'manual_upload' && data.status === 'pending_ai') {
    const queue = getFunctions().taskQueue('triggerAiOnEmailWorker');
    await queue.enqueue({ messageId: snapshot.id });
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(ai, prompt, emailSchema, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: emailSchema
        }
      });
      return response;
    } catch (error) {
      console.warn(`Gemini attempt ${attempt} failed. Error: ${error.message}`);
      const isTransient = error.status === 503 || error.status === 429 || error.message?.includes('503') || error.message?.includes('429') || error.message?.includes('fetch failed');
      
      if (attempt < maxRetries && isTransient) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      } else if (attempt === maxRetries) {
        console.log("Max retries reached on flash. Falling back to gemini-1.5-pro...");
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-1.5-pro',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: emailSchema
          }
        });
        return fallbackResponse;
      } else {
        throw error;
      }
    }
  }
}


async function processEmailWorkflow(messageId, textBody, subject, fromEmail, additionalContext = "") {
  const db = admin.firestore();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 0. Fetch Customer Context (RAG)
  let customerContext = "No past context available.";
  if (fromEmail) {
    try {
      // Look up previous completed operations for this email
      const pastOpsRef = db.collection('operations_queue');
      const snapshot = await pastOpsRef
        .where('senderEmail', '==', fromEmail)
        .where('status', '==', 'Completed')
        .limit(3)
        .get();

      if (!snapshot.empty) {
        const pastProducts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.workflowRecommendation?.preview?.products) {
            pastProducts.push(...data.workflowRecommendation.preview.products.map(p => p.name));
          }
        });
        const uniqueProducts = [...new Set(pastProducts)].filter(Boolean);
        if (uniqueProducts.length > 0) {
          customerContext = `The sender (${fromEmail}) has previously ordered: ${uniqueProducts.join(', ')}. Use this to resolve ambiguity if they ask for "the usual" or omit details.`;
        }
      }
    } catch (ctxErr) {
      console.warn("Failed to fetch customer context:", ctxErr);
    }
  }

  const additionalContextBlock = additionalContext ? `USER PROVIDED MANUAL INSTRUCTIONS: "${additionalContext}" (FOLLOW THESE CAREFULLY!)` : '';

  // 1. Intent Recognition and Data Extraction via Gemini
  const prompt = `
    You are Atlas Health AI, an operational pharmaceutical assistant.
    Analyze the following email text AND any attached documents/images (if provided) to extract structured data.
    Classify the intent into ONE of these: CUSTOMER_RFQ, SUPPLIER_QUOTATION, PRICE_LIST, PRESCRIPTION, COA, INQUIRY, PURCHASE_ORDER, LOGISTICS, REGULATORY.

    CRITICAL CLASSIFICATION RULES:
    - "CUSTOMER_RFQ": A potential CUSTOMER is asking YOU for pricing or availability (e.g. "Can you quote me...", "Do you have stock...").
    - "SUPPLIER_QUOTATION": A VENDOR/SUPPLIER is sending YOU their prices for a specific request.
    - "PRICE_LIST": A VENDOR/SUPPLIER is sending their general catalog or price list.
    - "PRESCRIPTION": A medical prescription.
    - "COA": A Certificate of Analysis or lab test result.
    - "INQUIRY": A general question, support request, or info gathering.

    CRITICAL EXTRACTION RULES:
    - Even if the email only contains a subject (like "Cagrilintide Inquiry"), ALWAYS extract the product name (e.g. "Cagrilintide").
    - If quantity or concentration are not specified, just leave them as empty strings or "Not specified", BUT STILL EXTRACT THE PRODUCT NAME! Do not omit a product just because you don't know the quantity.
    - If it's a PRESCRIPTION, extract as much detail as possible (dates, doctor, patient info, duration, formula) and put it inside the prescriptionDetails object.
    - If there are MULTIPLE distinct prescriptions or PDF files attached, extract each one as a separate object within the "prescriptions" array. Each object should have its own prescriptionDetails and products.
    - If it is a FAGRON REPORT (e.g., TrichoTest, NutriGen) or a similar genetic/personalized medicine report, classify it as a PRESCRIPTION. Carefully extract the recommended personalized formulas, active ingredients, and dosages as products, and fully extract the patient and doctor details.
    - If it's a SUPPLIER_QUOTATION or PRICE_LIST, extract unit prices and total prices for products, and overall financial details (discounts, commissions, grand total) into the financialDetails object.

    PAST CONTEXT:
    ${customerContext}

    ${additionalContextBlock}

    Email Subject: ${subject}
    Email Body:
    ${textBody}


    Return ONLY a JSON object with this exact structure (no markdown tags):
    {
      "intent": "...",
      "confidenceScore": 95,
      "extractedData": {
        "supplierOrCustomer": "...",
        "requestDate": "...",
        "requestedBy": "...",
        "requestedTo": "...",
        "products": [
          { "name": "...", "quantity": "...", "concentration": "...", "unitPrice": "...", "totalPrice": "..." }
        ],
        "deliveryLocation": "...",
        "urgency": "Urgent/Normal/Low",
        "financialDetails": {
          "subtotal": "...",
          "discount": "...",
          "commission": "...",
          "grandTotal": "..."
        },
        "prescriptions": [
          {
            "prescriptionDetails": {
              "date": "...",
              "doctorName": "...",
              "patientName": "...",
              "duration": "...",
              "formulaType": "..."
            },
            "products": [
              { "name": "...", "quantity": "...", "concentration": "..." }
            ]
          }
        ],
        "prescriptionDetails": {
          "date": "...",
          "doctorName": "...",
          "patientName": "...",
          "duration": "...",
          "formulaType": "..."
        }
      }
    }
  `;

  const emailSchema = {
    type: Type.OBJECT,
    properties: {
      intent: { type: Type.STRING, enum: ["CUSTOMER_RFQ", "SUPPLIER_QUOTATION", "PRICE_LIST", "PRESCRIPTION", "COA", "INQUIRY", "PURCHASE_ORDER", "LOGISTICS", "REGULATORY"] },
      confidenceScore: { type: Type.NUMBER },
      extractedData: {
        type: Type.OBJECT,
        properties: {
          supplierOrCustomer: { type: Type.STRING },
          requestDate: { type: Type.STRING },
          requestedBy: { type: Type.STRING },
          requestedTo: { type: Type.STRING },
          deliveryLocation: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ["Urgent", "Normal", "Low"] },
          prescriptionDetails: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              doctorName: { type: Type.STRING },
              doctorContact: { type: Type.STRING },
              patientName: { type: Type.STRING },
              patientDOB: { type: Type.STRING },
              patientGender: { type: Type.STRING },
              patientAge: { type: Type.STRING },
              duration: { type: Type.STRING },
              formulaType: { type: Type.STRING },
              diagnosis: { type: Type.STRING }
            }
          },
          products: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                concentration: { type: Type.STRING },
                unitPrice: { type: Type.STRING },
                totalPrice: { type: Type.STRING }
              }
            }
          },
          prescriptions: {
            type: Type.ARRAY,
            description: "If multiple distinct prescriptions or patients are found in the documents, list each one here. Each should contain its own prescriptionDetails and products.",
            items: {
              type: Type.OBJECT,
              properties: {
                prescriptionDetails: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    doctorName: { type: Type.STRING },
                    doctorContact: { type: Type.STRING },
                    patientName: { type: Type.STRING },
                    patientDOB: { type: Type.STRING },
                    patientGender: { type: Type.STRING },
                    patientAge: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    formulaType: { type: Type.STRING },
                    diagnosis: { type: Type.STRING }
                  }
                },
                products: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      concentration: { type: Type.STRING },
                      unitPrice: { type: Type.STRING },
                      totalPrice: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          financialDetails: {
            type: Type.OBJECT,
            properties: {
              subtotal: { type: Type.STRING },
              discount: { type: Type.STRING },
              commission: { type: Type.STRING },
              grandTotal: { type: Type.STRING }
            }
          }
        }
      }
    },
    required: ["intent", "confidenceScore", "extractedData"]
  };

  let aiResultJson = {};
  
  try {
    // Check if we have attachments to process
    const inboundDoc = await db.collection('inbound_emails').doc(messageId).get();
    const attachments = inboundDoc.exists ? (inboundDoc.data().attachments || []) : [];

    const aiContents = [ prompt ];

    if (attachments.length > 0) {
      try {
        const bucket = admin.storage().bucket();
        for (const att of attachments) {
          // Gemini inline data supports PDF and images natively.
          if (att.contentType === 'application/pdf' || att.contentType.startsWith('image/')) {
            try {
              const file = bucket.file(att.path);
              const [buffer] = await file.download();
              aiContents.push({
                inlineData: {
                  data: buffer.toString('base64'),
                  mimeType: att.contentType
                }
              });
            } catch (dlErr) {
              console.warn(`Failed to download attachment ${att.name} for AI processing:`, dlErr);
            }
          }
        }
      } catch (bucketErr) {
        console.warn("Storage not configured. Cannot process attachments for AI.");
      }
    }

    const response = await callGeminiWithRetry(ai, aiContents, emailSchema);
    const aiResultText = response.text;
    aiResultJson = JSON.parse(aiResultText);
  } catch (e) {
    console.error("Failed to call Gemini or parse JSON after all retries:", e);
    throw e;
  }

  // 2. Product Matching Engine & Queue Creation (Phase 4)
  const prescriptionsData = aiResultJson.extractedData?.prescriptions || [];
  
  let processingItems = [];
  if (prescriptionsData.length > 0) {
    processingItems = prescriptionsData;
  } else {
    // Single item fallback
    processingItems = [{
      prescriptionDetails: aiResultJson.extractedData?.prescriptionDetails || null,
      products: aiResultJson.extractedData?.products || [],
      financialDetails: aiResultJson.extractedData?.financialDetails || null
    }];
  }

  // 3. Update Firestore with the AI result & Matched Products
  await db.collection('inbound_emails').doc(messageId).update({
    status: 'ai_processed',
    aiInterpretation: aiResultJson,
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    needsHumanReview: true // Always true for Phase 6 (Nothing is sent automatically)
  });

  // Init Algolia
  const algoliasearch = require("algoliasearch");
  const APP_ID = process.env.ALGOLIA_APP_ID;
  const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
  const algoliaClient = (APP_ID && ADMIN_KEY) ? algoliasearch(APP_ID, ADMIN_KEY) : null;
  const productsIndex = algoliaClient ? algoliaClient.initIndex("products") : null;

  // 4. Create Operations Queue Item(s)
  let index = 0;
  for (const item of processingItems) {
    let proposedProducts = [];
    if (Array.isArray(item.products)) {
      for (const prod of item.products) {
        if (!prod.name) continue;
        
        let matchStatus = 'NOT_FOUND';
        let confidence = 0;
        let matchedProductId = null;
        let matchedProductName = null;
        
        try {
          if (productsIndex) {
            const { hits } = await productsIndex.search(prod.name, { hitsPerPage: 1 });
            if (hits.length > 0) {
              matchedProductId = hits[0].objectID;
              matchedProductName = hits[0].name;
              matchStatus = 'FOUND';
              confidence = 98; // Fuzzy matched
            }
          } else {
            // Fallback to Firestore prefix search
            const searchName = prod.name.toLowerCase().trim();
            const snapshot = await db.collection('products')
              .where('name_lower', '>=', searchName)
              .where('name_lower', '<=', searchName + '\uf8ff')
              .limit(1).get();
            if (!snapshot.empty) {
              matchedProductId = snapshot.docs[0].id;
              matchedProductName = snapshot.docs[0].data().name;
              matchStatus = 'FOUND';
              confidence = 98;
            }
          }
        } catch (searchErr) {
          console.error("Error matching product:", searchErr);
        }

        proposedProducts.push({
          extractedName: prod.name,
          quantity: prod.quantity,
          concentration: prod.concentration,
          matchStatus,
          confidence,
          matchedProductId,
          matchedProductName,
          proposalStatus: matchStatus === 'NOT_FOUND' ? 'needs_new_product_proposal' : null
        });
      }
    }

    const docId = processingItems.length > 1 ? `${messageId}_${index}` : messageId;

    const queueDoc = {
      id: docId,
      originalMessageId: messageId,
      subject: subject || 'No Subject',
      senderName: aiResultJson.extractedData?.supplierOrCustomer || 'Unknown Sender',
      senderEmail: 'unknown@example.com', // Will be enriched later if needed
      detectedIntent: aiResultJson.intent || 'UNKNOWN',
      status: 'New',
      outcome: 'Pending Review',
      linkedRecord: null,
      owner: 'Procurement',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: aiResultJson.intent === 'CUSTOMER_RFQ' ? 'rfqs' : 'other',
      content: textBody || 'No Content',
      prescriptionDetails: item.prescriptionDetails || null,
      extraction: [
        ...proposedProducts.map(p => ({
          field: 'Product',
          value: p.extractedName + (p.quantity ? ` (Qty: ${p.quantity})` : ''),
          source: 'Email',
          confidence: p.confidence
        })),
        ...(aiResultJson.extractedData?.requestDate ? [{ field: 'Request Date', value: aiResultJson.extractedData.requestDate, source: 'Email', confidence: 95 }] : []),
        ...(aiResultJson.extractedData?.requestedBy ? [{ field: 'Requested By', value: aiResultJson.extractedData.requestedBy, source: 'Email', confidence: 95 }] : []),
        ...(aiResultJson.extractedData?.requestedTo ? [{ field: 'Requested To', value: aiResultJson.extractedData.requestedTo, source: 'Email', confidence: 95 }] : []),
        ...(aiResultJson.intent === 'PRESCRIPTION' && item.prescriptionDetails ? 
            Object.entries(item.prescriptionDetails)
              .filter(([_, v]) => !!v)
              .map(([k, v]) => ({
                field: k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                value: String(v),
                source: 'Prescription Doc',
                confidence: 95
              })) 
            : []),
        ...(item.financialDetails ? 
            Object.entries(item.financialDetails)
              .filter(([_, v]) => !!v)
              .map(([k, v]) => ({
                field: k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                value: String(v),
                source: 'Quotation/Invoice',
                confidence: 95
              }))
            : [])
      ],
      customerDetection: {
        name: aiResultJson.extractedData?.supplierOrCustomer || 'Unknown',
        relationship: 'Unknown',
        lastOrders: 0,
        totalRevenue: '$0',
        openRfqs: 0
      },
      workflowRecommendation: {
        action: `Create ${aiResultJson.intent}`,
        reasons: ['Intent Detected'],
        preview: {
          type: aiResultJson.intent,
          products: proposedProducts.map(p => ({ name: p.extractedName, qty: p.quantity }))
        }
      },
      activityLog: [
        { id: 1, action: 'Email Received & AI Processed', time: new Date().toLocaleTimeString(), actor: 'System' }
      ]
    };
    
    await db.collection('operations_queue').doc(docId).set(queueDoc);
    index++;
  }
}

exports.processEmailWorkflow = processEmailWorkflow;
