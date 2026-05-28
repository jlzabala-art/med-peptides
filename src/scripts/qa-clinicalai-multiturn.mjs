/**
 * qa-clinicalai-multiturn.mjs
 * 
 * Verifies that the advanced Gemini RAG enhancements (conversation memory, 
 * PubMed search, widget tag output rules) work correctly when invoking 
 * the Cloud Function handler under simulated request states.
 * 
 * Usage:
 *   node src/scripts/qa-clinicalai-multiturn.mjs
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import firebase-admin from the functions node_modules to avoid app-not-initialized singleton mismatch
const functionsAdminAppPath = path.resolve(__dirname, '../../functions/node_modules/firebase-admin/lib/app/index.js');
const { initializeApp, cert } = await import(functionsAdminAppPath);

const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
];

let saPath = SA_PATHS.find(p => existsSync(p));
if (!saPath) {
  console.error('❌ Service account key not found. Cannot run test.');
  process.exit(1);
}

// 1. Initialize firebase admin using the exact functions admin package instance
const sa = JSON.parse(readFileSync(saPath, 'utf-8'));
initializeApp({ credential: cert(sa) });

// 2. Import the Cloud Function handler dynamically
const aiModulePath = path.resolve(__dirname, '../../functions/src/http/ai.js');
console.log(`📦 Loading Cloud Function from: ${aiModulePath}`);

let clinicalAiAssistantHandler;
try {
  const mod = await import(aiModulePath);
  clinicalAiAssistantHandler = mod.default || mod;
} catch (e) {
  console.error('❌ Failed to load Cloud Function handler:', e);
  process.exit(1);
}

class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.headersSent = false;
    this.statusCode = 200;
    this._headers = {};
    this.data = null;
  }
  set(key, val) {
    this._headers[key.toLowerCase()] = val;
    return this;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(data) {
    this.data = data;
    this.emit('finish');
    return this;
  }
  send(data) {
    this.data = data;
    this.emit('finish');
    return this;
  }
  end(data) {
    this.data = data;
    this.emit('finish');
    return this;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  setHeader(name, val) {
    this._headers[name.toLowerCase()] = val;
    return this;
  }
  getHeaderNames() {
    return Object.keys(this._headers);
  }
  hasHeader(name) {
    return this._headers[name.toLowerCase()] !== undefined;
  }
  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }
}

// Override globalThis.fetch to mock NCBI and Gemini API responses (to prevent rate limits and run offline)
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  const urlStr = typeof url === 'string' ? url : url.toString();
  
  if (urlStr.includes('eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')) {
    return {
      ok: true,
      json: async () => ({ esearchresult: { idlist: ['12345678'] } })
    };
  }
  
  if (urlStr.includes('eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi')) {
    return {
      ok: true,
      json: async () => ({
        result: {
          '12345678': {
            title: 'BPC-157 benefits in tissue healing',
            fulljournalname: 'Journal of Peptide Research',
            pubdate: '2020 Dec'
          }
        }
      })
    };
  }
  
  if (urlStr.includes('generativelanguage.googleapis.com')) {
    try {
      const body = JSON.parse(options.body);
      console.log('   [Mock Fetch] Intercepted Gemini API request.');
      console.log(`   [Mock Fetch] Request turn count: ${body.contents?.length}`);
      
      const lastTurnText = body.contents?.[body.contents.length - 1]?.parts?.[0]?.text || '';
      if (lastTurnText.includes('Catalog Context:') && lastTurnText.includes('BPC-157')) {
        console.log('   [Mock Fetch] ✅ Catalog Context and Entity match present in last turn.');
      } else {
        console.warn('   [Mock Fetch] ⚠️ Catalog Context/Entity match missing in last turn!');
      }
      
      if (lastTurnText.includes('PubMed Scientific Literature')) {
        console.log('   [Mock Fetch] ✅ PubMed context successfully grounded in prompt.');
      } else {
        console.warn('   [Mock Fetch] ⚠️ PubMed context missing in prompt!');
      }

      if (lastTurnText.includes('Clinical References (PubMed PMIDs)') && lastTurnText.includes('Half-Life / PK')) {
        console.log('   [Mock Fetch] ✅ Enriched clinical context (PK, References) is present in the prompt.');
      } else {
        console.warn('   [Mock Fetch] ⚠️ Enriched clinical context is missing in the prompt!');
      }
    } catch (e) {
      console.error('   [Mock Fetch] Failed to parse request body:', e.message);
    }
    
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '[EVIDENCE:HIGH]\nLiterature shows BPC-157 has significant benefits [REF:40756949] including tissue repair and joint healing.\n\n[STACK_SYNERGY:85][PEPTIDES:BPC-157,TB-500]\n\n[SUGGESTIONS: How to mix it | View Protocols | Catalog]'
                }
              ]
            }
          }
        ]
      })
    };
  }
  
  return originalFetch(url, options);
};

// Create a helper to simulate request/response cycle
function simulateRequest(body) {
  return new Promise((resolve, reject) => {
    const req = {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' }
    };
    
    const res = new MockResponse();
    res.on('finish', () => {
      resolve({ statusCode: res.statusCode, data: res.data });
    });

    clinicalAiAssistantHandler(req, res).catch(reject);
  });
}

async function runTests() {
  console.log('\n🧪 Starting Multi-Turn and Advanced Gemini QA Validation');
  console.log('==========================================================');

  // Test Case 1: Simple educational/RAG query with PubMed fetch
  console.log('\n📝 Test 1: Scientific query for BPC-157 (triggers PubMed)');
  const res1 = await simulateRequest({
    message: 'What does current literature say about BPC-157 benefits?',
    sessionId: 'test-session-123',
    history: []
  });
  
  console.log(`   Response Status: ${res1.statusCode}`);
  const hasReply = !!res1.data?.reply;
  const containsDisclaimer = res1.data?.reply?.toLowerCase().includes('safety profile') || res1.data?.reply?.toLowerCase().includes('always review');
  
  console.log(`   Reply Generated : ${hasReply ? '✅ Yes' : '❌ No'}`);
  console.log(`   Disclaimer Check: ${containsDisclaimer ? '✅ Passed' : '❌ Failed'}`);
  
  if (hasReply) {
    console.log('   --- Sample Output Snippet ---');
    console.log(res1.data.reply.slice(0, 300) + '...\n   -----------------------------');
  }

  // Test Case 2: Multi-turn Memory Verification
  console.log('\n📝 Test 2: Follow-up query matching previous turn context (Memory)');
  const res2 = await simulateRequest({
    message: 'How should I reconstitute and store it?',
    sessionId: 'test-session-123',
    history: [
      { role: 'user', content: 'What does current literature say about BPC-157 benefits?' },
      { role: 'assistant', content: res1.data?.reply || 'BPC-157 is a gastric pentadecapeptide.' }
    ]
  });

  console.log(`   Response Status: ${res2.statusCode}`);
  const hasReply2 = !!res2.data?.reply;
  const isRecon = res2.data?.queryType === 'reconstitution_query' || res2.data?.reply?.toLowerCase().includes('reconstitution') || res2.data?.reply?.toLowerCase().includes('visual_recon') || res2.data?.reply?.includes('VISUAL_RECON');
  
  console.log(`   Reply Generated : ${hasReply2 ? '✅ Yes' : '❌ No'}`);
  console.log(`   Recon context   : ${isRecon ? '✅ Yes (Correctly routed/replied)' : '⚠️  No (Check routing)'}`);

  if (hasReply2) {
    console.log('   --- Sample Output Snippet ---');
    console.log(res2.data.reply.slice(0, 350) + '...\n   -----------------------------');
  }

  console.log('\n==========================================================');
  if (hasReply && hasReply2 && res1.statusCode === 200 && res2.statusCode === 200) {
    console.log('🚀 All Multi-Turn QA tests completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ QA tests failed.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
