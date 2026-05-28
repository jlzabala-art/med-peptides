const aiHandler = require('../functions/src/http/ai.js');

// Mock request and response
const req = {
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
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.jsonData = data;
    console.log('--- Response Status:', this.statusCode || 200);
    console.log('--- Response Body:', JSON.stringify(data, null, 2));
  }
};

// Set environment variables for local test (fake or real GEMINI_API_KEY)
process.env.GEMINI_API_KEY = 'fake-api-key-for-routing-test';

console.log('Running local mock request to ai.js...');
aiHandler(req, res).catch(err => {
  console.error('Execution failed:', err);
});
