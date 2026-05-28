/**
 * qa-clinicalai-battery.mjs
 * ─────────────────────────────────────────────────────────────────
 * Automated QA battery for the clinicalAiAssistant Cloud Function.
 * Tests 4 core scenarios:
 *   1. Pricing inquiry (EN + ES)
 *   2. Shipping & transit (EN + ES)
 *   3. Support escalation / WhatsApp (EN + ES)
 *   4. Lifestyle pathway goals (EN + ES)
 *
 * Usage:  node src/scripts/qa-clinicalai-battery.mjs
 * ─────────────────────────────────────────────────────────────────
 */

const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';
const SESSION  = `qa-battery-${Date.now()}`;

// ── ANSI colours ──────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
};

// ── Test definitions ──────────────────────────────────────────────
const TESTS = [
  // ── 1. PRICING ─────────────────────────────────────────────────
  {
    group: 'Pricing Inquiry',
    message: 'How much does BPC-157 cost?',
    lang: 'EN',
    assertions: [
      { label: 'Contains tier language (Retail/Wholesale/Institutional or pricing)',
        fn: r => /retail|wholesale|institutional|tier|price|pricing|cost|\$/i.test(r.reply) },
      { label: 'Contains contact action (WhatsApp or email)',
        fn: r => /whatsapp|email|contact|\+971/i.test(r.reply) },
      { label: 'No cold-chain mention',
        fn: r => !/cold.?chain/i.test(r.reply) },
    ],
  },
  {
    group: 'Pricing Inquiry',
    message: '¿cuánto cuestan los péptidos?',
    lang: 'ES',
    assertions: [
      { label: 'Contains tier language in Spanish (precio/mayoreo/minoreo/nivel)',
        fn: r => /precio|tier|retail|wholesale|institucional|costo|coste/i.test(r.reply) },
      { label: 'Contains contact (WhatsApp or email)',
        fn: r => /whatsapp|email|correo|\+971/i.test(r.reply) },
      { label: 'No cold-chain mention',
        fn: r => !/cold.?chain|cadena.?fr[ií]a/i.test(r.reply) },
    ],
  },

  // ── 2. SHIPPING & TRANSIT ──────────────────────────────────────
  {
    group: 'Shipping & Transit',
    message: 'How long does delivery take?',
    lang: 'EN',
    assertions: [
      { label: 'Contains shipping/transit/delivery information',
        fn: r => /ship|transit|deliver|days|week|dispatch/i.test(r.reply) },
      { label: 'No cold-chain mention',
        fn: r => !/cold.?chain/i.test(r.reply) },
      { label: 'Contains packaging or purity mention',
        fn: r => /lyophiliz|powder|packag|purity|integr|vial/i.test(r.reply) },
    ],
  },
  {
    group: 'Shipping & Transit',
    message: '¿cuándo llega mi envío?',
    lang: 'ES',
    assertions: [
      { label: 'Contains shipping/transit information in Spanish',
        fn: r => /env[ií]o|tr[áa]nsito|entrega|d[ií]as|semana|plazo/i.test(r.reply) },
      { label: 'No cold-chain mention',
        fn: r => !/cold.?chain|cadena.?fr[ií]a/i.test(r.reply) },
    ],
  },

  // ── 3. SUPPORT ESCALATION ──────────────────────────────────────
  {
    group: 'Support Escalation',
    message: 'Can I talk to a human?',
    lang: 'EN',
    assertions: [
      { label: 'Contains WhatsApp number (+971 56 417 9256)',
        fn: r => /\+971[\s\-]?56[\s\-]?417[\s\-]?9256|971564179256/.test(r.reply) },
      { label: 'Contains email reference',
        fn: r => /email|@/.test(r.reply) },
    ],
  },
  {
    group: 'Support Escalation',
    message: '¿cuál es su WhatsApp de soporte?',
    lang: 'ES',
    assertions: [
      { label: 'Contains WhatsApp number (+971 56 417 9256)',
        fn: r => /\+971[\s\-]?56[\s\-]?417[\s\-]?9256|971564179256/.test(r.reply) },
      { label: 'Contains WhatsApp keyword',
        fn: r => /whatsapp/i.test(r.reply) },
    ],
  },

  // ── 4. LIFESTYLE PATHWAY GOALS ────────────────────────────────
  {
    group: 'Lifestyle Pathway — Muscle',
    message: 'I want to research peptides for Muscle Growth & Recovery',
    lang: 'EN',
    assertions: [
      { label: 'Contains key peptides section',
        fn: r => /BPC.?157|TB.?500|Ipamorelin|CJC|peptid/i.test(r.reply) },
      { label: 'Contains protocol information',
        fn: r => /protocol|stack|dose|dosage|dosing/i.test(r.reply) },
      { label: 'Contains next-step suggestions or action buttons',
        fn: r => r.suggestions?.length > 0 || /next.?step|siguiente|calcul/i.test(r.reply) },
    ],
  },
  {
    group: 'Lifestyle Pathway — Longevity',
    message: 'péptidos para longevidad',
    lang: 'ES',
    assertions: [
      { label: 'Contains key longevity peptides (Epitalon/BPC/NMN/GHK)',
        fn: r => /Epitalon|Epithalon|BPC|NMN|GHK|longevidad|teloM/i.test(r.reply) },
      { label: 'Contains protocol or supplement guidance',
        fn: r => /protocolo|suplemento|dosis|stack/i.test(r.reply) },
    ],
  },
  {
    group: 'Lifestyle Pathway — Fat Loss',
    message: 'fat loss and metabolic health peptides',
    lang: 'EN',
    assertions: [
      { label: 'Contains relevant peptides (Semaglutide/AOD/Tesamorelin/CJC)',
        fn: r => /Semaglutide|AOD|Tesamorelin|CJC|GLP|metabolic/i.test(r.reply) },
    ],
  },
];

// ── HTTP helper ───────────────────────────────────────────────────
async function callAI(message) {
  const start = Date.now();
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: SESSION }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  const elapsed = Date.now() - start;
  return { ...json, _elapsed: elapsed };
}

// ── Runner ────────────────────────────────────────────────────────
async function runBattery() {
  console.log(`\n${C.bold}${C.cyan}══════════════════════════════════════════${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ClinicalAI — Automated QA Battery${C.reset}`);
  console.log(`${C.bold}${C.cyan}  Endpoint: ${C.dim}${ENDPOINT}${C.reset}`);
  console.log(`${C.bold}${C.cyan}══════════════════════════════════════════${C.reset}\n`);

  let passed = 0, failed = 0, errors = 0;
  const results = [];
  let firstTest = true;

  for (const test of TESTS) {
    // Stagger calls by 600ms to avoid hitting Cloud Run per-instance rate limits
    if (!firstTest) await new Promise(r => setTimeout(r, 600));
    firstTest = false;
    const label = `[${test.lang}] ${test.group}`;
    console.log(`${C.bold}▶ ${label}${C.reset}`);
    console.log(`${C.dim}  Query: "${test.message}"${C.reset}`);

    let res;
    try {
      res = await callAI(test.message);
    } catch (err) {
      console.log(`${C.red}  ✗ REQUEST FAILED: ${err.message}${C.reset}\n`);
      errors++;
      results.push({ label, status: 'error', error: err.message });
      continue;
    }

    const reply = res.reply || '';
    console.log(`${C.dim}  Response (${res._elapsed}ms): ${reply.slice(0, 120).replace(/\n/g, ' ')}…${C.reset}`);

    let allPassed = true;
    for (const assertion of test.assertions) {
      const ok = assertion.fn({ ...res, reply });
      if (ok) {
        console.log(`${C.green}  ✓ ${assertion.label}${C.reset}`);
        passed++;
      } else {
        console.log(`${C.red}  ✗ FAIL: ${assertion.label}${C.reset}`);
        failed++;
        allPassed = false;
      }
    }

    results.push({ label, status: allPassed ? 'pass' : 'fail', elapsed: res._elapsed });
    console.log('');
  }

  // ── Summary ───────────────────────────────────────────────────
  const total = passed + failed;
  const pct   = total > 0 ? Math.round((passed / total) * 100) : 0;
  const color = pct === 100 ? C.green : pct >= 75 ? C.yellow : C.red;

  console.log(`${C.bold}${C.cyan}══════════════════════════════════════════${C.reset}`);
  console.log(`${C.bold}  QA Results: ${color}${passed}/${total} assertions passed (${pct}%)${C.reset}`);
  if (errors > 0) {
    console.log(`${C.red}  ${errors} test(s) could not connect — check endpoint availability.${C.reset}`);
  }
  console.log(`${C.bold}${C.cyan}══════════════════════════════════════════${C.reset}\n`);

  // Detail on failures
  const failures = results.filter(r => r.status === 'fail');
  if (failures.length > 0) {
    console.log(`${C.yellow}${C.bold}Failed tests:${C.reset}`);
    failures.forEach(f => console.log(`  ${C.red}✗${C.reset} ${f.label}`));
    console.log('');
  }

  process.exit(failed > 0 || errors > 0 ? 1 : 0);
}

runBattery();
