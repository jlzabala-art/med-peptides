const admin = require('../functions/node_modules/firebase-admin');
admin.initializeApp({
  projectId: 'med-peptides-app'
});

// Mock the global fetch function to intercept Gemini API calls and print the context
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  if (url.includes('generativelanguage.googleapis.com')) {
    const payload = JSON.parse(options.body);
    console.log('====== Gemini API Call Intercepted ======');
    console.log('System Instruction:');
    console.log(payload.systemInstruction.parts[0].text);
    console.log('----------------------------------------');
    console.log('Contents Payload:');
    console.log(payload.contents[payload.contents.length - 1].parts[0].text);
    console.log('========================================');
    
    // Return a mock response
    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: '[EVIDENCE:HIGH] Mocked response for Epithalon.\n\n[SUGGESTIONS: Reconstitution | Side Effects | Synergies]'
            }]
          }
        }]
      })
    };
  }
  
  // Fallback to original fetch (e.g. for PubMed)
  return originalFetch(url, options);
};

const aiHandler = require('../functions/src/http/ai.js');

// Mock request and response
const req = {
  method: 'POST',
  headers: {
    origin: 'http://localhost:5173'
  },
  body: {
    message: 'I want to explore research options for Epithalon!',
    sessionId: 'test-session',
    history: []
  }
};

const res = {
  headers: {},
  set(name, value) {
    this.headers[name] = value;
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
    return this;
  },
  getHeader(name) {
    return this.headers[name];
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    console.log('--- Response Status:', this.statusCode || 200);
    console.log('--- Response Body:', JSON.stringify(data, null, 2));
  },
  on(event, callback) {
    // Mock event listener
  }
};

// Set environment variables for local test
process.env.GEMINI_API_KEY = 'fake-api-key-for-routing-test';

console.log('Running local mock request to ai.js...');
aiHandler(req, res).catch(err => {
  console.error('Execution failed:', err);
});
