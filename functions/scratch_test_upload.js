const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

async function run() {
  const ai = new GoogleGenAI({ apiKey: 'dummy' });
  fs.writeFileSync('test.txt', 'hello world');
  try {
    await ai.files.upload({ file: 'test.txt', config: { mimeType: 'text/plain' } });
  } catch (e) {
    console.error(e.message);
  }
}
run();
