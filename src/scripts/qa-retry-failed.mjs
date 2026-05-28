/**
 * qa-retry-failed.mjs  — Solo re-testea los 3 tests que fallaron por throttle.
 */

const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';
const SESSION  = `qa-retry-${Date.now()}`;

const C = { reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m' };

const RETRIES = [
  {
    label: '[ES] Pricing Inquiry',
    message: '¿cuánto cuestan los péptidos?',
    assertions: [
      { label: 'Tier language (precio/retail/wholesale)', fn: r => /precio|tier|retail|wholesale|institucional|costo|coste/i.test(r.reply) },
      { label: 'Contact (WhatsApp or email)',             fn: r => /whatsapp|email|correo|\+971/i.test(r.reply) },
      { label: 'No cold-chain',                          fn: r => !/cold.?chain|cadena.?fr[ií]a/i.test(r.reply) },
    ],
  },
  {
    label: '[ES] Shipping & Transit',
    message: '¿cuándo llega mi envío?',
    assertions: [
      { label: 'Shipping info in Spanish (envio/entrega/dias/semana)', fn: r => /env[ií]o|tr[áa]nsito|entrega|d[ií]as|semana|plazo/i.test(r.reply) },
      { label: 'No cold-chain',                                        fn: r => !/cold.?chain|cadena.?fr[ií]a/i.test(r.reply) },
    ],
  },
  {
    label: '[ES] Support Escalation',
    message: '¿cuál es su WhatsApp de soporte?',
    assertions: [
      { label: 'WhatsApp number (+971 56 417 9256)', fn: r => /\+971[\s\-]?56[\s\-]?417[\s\-]?9256|971564179256/.test(r.reply) },
      { label: 'WhatsApp keyword',                  fn: r => /whatsapp/i.test(r.reply) },
    ],
  },
];

async function callAI(message) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: SESSION }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

async function run() {
  console.log(`\n${C.bold}${C.cyan}  ClinicalAI — Retry Battery (3 ES tests)${C.reset}\n`);
  let passed = 0, failed = 0;

  for (const test of RETRIES) {
    console.log(`${C.bold}▶ ${test.label}${C.reset}`);
    console.log(`${C.dim}  Query: "${test.message}"${C.reset}`);
    const res = await callAI(test.message);
    const reply = res.reply || '';
    console.log(`${C.dim}  Reply: ${reply.slice(0, 120).replace(/\n/g,' ')}…${C.reset}`);

    for (const a of test.assertions) {
      const ok = a.fn({ ...res, reply });
      if (ok) { console.log(`${C.green}  ✓ ${a.label}${C.reset}`); passed++; }
      else     { console.log(`${C.red}  ✗ FAIL: ${a.label}${C.reset}`); failed++; }
    }
    console.log('');
    // Small delay between sequential calls to avoid throttle
    await new Promise(r => setTimeout(r, 800));
  }

  const total = passed + failed;
  const pct   = Math.round((passed / total) * 100);
  const color = pct === 100 ? C.green : C.red;
  console.log(`${C.bold}  Retry Results: ${color}${passed}/${total} passed (${pct}%)${C.reset}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
