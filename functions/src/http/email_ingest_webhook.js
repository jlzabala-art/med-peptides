"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { GoogleGenAI } = require('@google/genai');
const { executeUniversalParse } = require("./universal_parser_core");
const { parseCOADocument } = require("./parse_coa_document");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.emailIngestWebhook = onRequest(
  { secrets: [GEMINI_API_KEY_SECRET], timeoutSeconds: 300, memory: "1GiB" },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed. Use POST.");
    }

    const db = getFirestore();
    const bucket = getStorage().bucket();
    const apiKey = GEMINI_API_KEY_SECRET.value();
    const ai = new GoogleGenAI({ apiKey });

    const fields = {};
    const attachments = [];
    
    let busboy;
    try {
      busboy = Busboy({ headers: req.headers });
    } catch (e) {
      console.error("[Email Ingest] Busboy initialization error:", e);
      return res.status(400).send("Invalid multipart request");
    }

    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on("file", (fieldname, fileStream, info) => {
      const { filename, mimeType } = info;
      const filepath = path.join(os.tmpdir(), `${Date.now()}_${filename}`);
      const writeStream = fs.createWriteStream(filepath);
      
      fileStream.pipe(writeStream);
      
      attachments.push(new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve({ filepath, filename, mimeType }));
        writeStream.on("error", reject);
      }));
    });

    busboy.on("finish", async () => {
      try {
        const resolvedAttachments = await Promise.all(attachments);
        
        const fromEmail = parseSenderEmail(fields["from"]);
        const toEmail = fields["to"] || "";
        
        console.log(`[Email Ingest] Email received from: ${fromEmail} to: ${toEmail}`);

        if (!fromEmail) {
           return res.status(400).send("Missing from email");
        }

        const userQuery = await db.collection("users").where("email", "==", fromEmail).limit(1).get();
        if (userQuery.empty) {
          console.warn(`[Email Ingest] Sender ${fromEmail} is not a registered user.`);
          return res.status(401).send("Unauthorized sender.");
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        for (const attachment of resolvedAttachments) {
          const fileExtension = path.extname(attachment.filename).toLowerCase();
          
          if (![".pdf", ".png", ".jpg", ".jpeg", ".webp"].includes(fileExtension)) {
            console.warn(`[Email Ingest] Skipping unsupported file type: ${attachment.filename}`);
            if(fs.existsSync(attachment.filepath)) fs.unlinkSync(attachment.filepath);
            continue;
          }

          const tempStoragePath = `temp_imports/${userId}/${Date.now()}_${attachment.filename}`;
          await bucket.upload(attachment.filepath, {
            destination: tempStoragePath,
            metadata: { contentType: attachment.mimeType }
          });

          console.log(`[Email Ingest] Uploaded to temp storage: ${tempStoragePath}`);

          const docType = await classifyDocumentWithAI(attachment.filepath, attachment.mimeType, ai);
          console.log(`[Email Ingest] Document classified as: ${docType}`);

          await processClassifiedDocument(attachment.filepath, tempStoragePath, attachment.mimeType, docType, userId, db, apiKey);

          if(fs.existsSync(attachment.filepath)) fs.unlinkSync(attachment.filepath);
        }

        return res.status(200).json({ success: true, message: "Email processed successfully." });

      } catch (err) {
        console.error("[Email Ingest] Error processing email inbound:", err);
        return res.status(500).send("Internal Server Error: " + err.message);
      }
    });

    // If req.rawBody exists use it (Firebase typical), else req.pipe
    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  }
);

function parseSenderEmail(fromField) {
  if (!fromField) return "";
  const match = fromField.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase().trim() : fromField.toLowerCase().trim();
}

async function classifyDocumentWithAI(localFilePath, mimeType, aiInstance) {
  const systemPrompt = `Analiza el documento adjunto y clasifícalo estrictamente en una de las siguientes categorías en base a su contenido:
1. "COA": Certificate of Analysis, análisis de lote, pureza química de péptidos o reportes de HPLC/MS.
2. "RFQ": Request for Quote, cotización, lista de pedido, solicitud de precios de un cliente o compra.
3. "PriceList": Catálogo de precios de un laboratorio, lista de precios de péptidos en lote con cantidades mínimas (MOQ) y costos unitarios.
4. "Invoice": Factura de proveedor, recibo de pago o invoice comercial para conciliación.
5. "Unknown": Si el documento no encaja en ninguna de las anteriores.

Devuelve únicamente un JSON string con la clave "document_type". Ejemplo: {"document_type": "COA"}`;

  let uploadedFile;
  try {
    uploadedFile = await aiInstance.files.upload({
      file: localFilePath,
      config: { mimeType }
    });

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          fileData: {
            fileUri: uploadedFile.uri,
            mimeType: uploadedFile.mimeType
          }
        },
        { text: "Clasifica el documento adjunto." }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return result.document_type || "Unknown";

  } catch (err) {
    console.error("[Email Ingest] Error in Gemini Classification:", err);
    return "Unknown";
  } finally {
    if (uploadedFile && uploadedFile.name) {
      await aiInstance.files.delete({ name: uploadedFile.name }).catch(() => {});
    }
  }
}

async function processClassifiedDocument(localFilePath, tempStoragePath, mimeType, docType, userId, db, apiKey) {
  if (docType === "Unknown") {
    await db.collection("email_ingest_failures").add({
      userId,
      storagePath: tempStoragePath,
      reason: "Could not identify document type.",
      createdAt: FieldValue.serverTimestamp()
    });
    return;
  }

  const docRef = db.collection("uploaded_documents").doc();
  const docId = docRef.id;

  await docRef.set({
    userId,
    storagePath: tempStoragePath,
    mimeType,
    fileName: path.basename(tempStoragePath),
    documentType: docType,
    status: "processing",
    source: "email_inbound",
    createdAt: FieldValue.serverTimestamp()
  });

  try {
    if (docType === "COA") {
      await parseCOADocument.run({
        data: { docId, storagePath: tempStoragePath },
        auth: { uid: userId }
      });
    } else if (docType === "RFQ" || docType === "PriceList") {
      const parsedItems = await executeUniversalParse(localFilePath, mimeType, docType, "", apiKey);
      
      if (docType === "RFQ") {
        await db.collection("leads").add({
          userId,
          items: parsedItems,
          status: "pending_catalog_match",
          source: "email_inbound",
          createdAt: FieldValue.serverTimestamp()
        });
      } else {
        await db.collection("imported_price_lists").add({
          userId,
          items: parsedItems,
          createdAt: FieldValue.serverTimestamp()
        });
      }

      await docRef.update({
        status: "processed",
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error(`[Email Ingest] Error processing document ${docId}:`, error);
    await docRef.update({
      status: "error",
      error: error.message,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}
