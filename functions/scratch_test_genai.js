const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'test' });
console.log(ai.files.upload.toString());
