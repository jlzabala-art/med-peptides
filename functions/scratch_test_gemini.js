const { GoogleGenAI } = require('@google/genai');

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const fs = require('fs');
  const filePath = require('path').join(require('os').tmpdir(), 'test.txt');
  fs.writeFileSync(filePath, "Hello world this is a test RFQ");
  
  let uploadedFile = await ai.files.upload({
    file: filePath,
    config: { mimeType: 'text/plain' }
  });
  
  console.log("Uploaded URI:", uploadedFile.uri);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        uploadedFile,
        "Extract the data"
      ]
    });
    console.log("Response with object:", response.text);
  } catch(e) {
    console.error("Error with uploadedFile:", e.message);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          fileData: {
            fileUri: uploadedFile.uri,
            mimeType: uploadedFile.mimeType
          }
        },
        { text: "Extract the data" }
      ]
    });
    console.log("Response with fileData:", response.text);
  } catch(e) {
    console.error("Error with fileData:", e.message);
  }
}
test();
