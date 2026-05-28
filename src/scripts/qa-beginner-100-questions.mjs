/**
 * qa-beginner-100-questions.mjs
 */
import fs from 'fs';

const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';
const REPORT_PATH = '/Users/joseluiszabala/.gemini/antigravity/brain/9809c972-34a7-4d53-88ed-9df5fe8d94fc/clinicalai_beginner_100_qa_report.md';
const SESSION = `qa-beginner-${Date.now()}`;
const DELAY = 300;

const C = { g: '\x1b[32m', r: '\x1b[31m', b: '\x1b[1m', d: '\x1b[2m', reset: '\x1b[0m', cy: '\x1b[36m', y: '\x1b[33m' };

const QUERIES = [
"What are peptides?",
"Where should I start?",
"What is best for recovery?",
"What helps with sleep?",
"What is good for fat loss?",
"Which peptides are beginner friendly?",
"What is best for energy?",
"What helps with focus?",
"What is good for longevity?",
"What is the difference between peptides and supplements?",
"What is a protocol?",
"Which protocol is easiest?",
"What helps with muscle recovery?",
"What is best for anti-aging?",
"Which products help metabolism?",
"What is good for brain fog?",
"Which peptides are most popular?",
"What is MOTS-C?",
"What is BPC-157?",
"What is Tirzepatide?",
"Which products help sleep quality?",
"What is good for inflammation?",
"What helps with appetite control?",
"Which supplements are best for longevity?",
"What is Semax used for?",
"What is Selank used for?",
"Which protocol helps recovery?",
"What is best for healthy aging?",
"What helps with energy and focus?",
"Which products are best for beginners?",
"What helps with stress?",
"Which peptides help cognition?",
"What is good for skin support?",
"What is good for recovery after training?",
"What helps with deep sleep?",
"Which products support mitochondria?",
"What helps with body composition?",
"Which products support vitality?",
"What helps with mental clarity?",
"What is the best starting protocol?",
"Which supplements support recovery?",
"What is GHK-Cu?",
"Which products support metabolism?",
"What helps with healthy recovery?",
"What is a longevity protocol?",
"Which peptides are easiest to understand?",
"What is the difference between protocols?",
"What is best for overall wellness?",
"What helps with tiredness?",
"Which products are most researched?",
"What helps with joint support?",
"What helps with recovery and sleep?",
"Which products support healthy aging?",
"Which protocol should I explore first?",
"What helps with mood support?",
"Which supplements help sleep?",
"What is the most advanced protocol?",
"Which products are most beginner friendly?",
"What helps with performance recovery?",
"What is best for cognitive support?",
"Which products help energy naturally?",
"What helps with inflammation support?",
"Which peptides support recovery?",
"What is best for metabolism?",
"Which products support focus?",
"What is the difference between NMN and NR?",
"Which products help longevity?",
"Which protocol supports energy?",
"What is good for healthy lifestyle support?",
"Which products are easiest to start with?",
"Which supplements support cognition?",
"What helps with recovery after exercise?",
"What is best for beginners in longevity?",
"What helps with wellness optimization?",
"Which products support sleep and recovery?",
"What is the difference between peptides and protocols?",
"What helps with vitality?",
"Which products are commonly combined?",
"What is best for healthy metabolism?",
"Which protocol supports cognition?",
"What is good for everyday wellness?",
"What helps with recovery and energy?",
"Which peptides are most commonly explored?",
"What is a metabolic protocol?",
"Which supplements support healthy aging?",
"What helps with circadian rhythm?",
"Which products support performance?",
"What helps with healthy sleep cycles?",
"What is best for mitochondrial support?",
"Which products support immune health?",
"What is the easiest peptide to understand?",
"Which protocols include supplements?",
"What helps with healthy recovery?",
"Which products support wellness goals?",
"What helps with sleep and cognition?",
"Which products support body recovery?",
"What is the difference between recovery and longevity protocols?",
"Which supplements support energy?",
"What is best for first-time users?",
"Can you recommend something based on my goals?"
];

function scoreResponse(reply) {
  if (!reply) return { score: 0, flag: 'EMPTY' };
  if (/don.*have a direct match|how else can i help/i.test(reply)) return { score: 1, flag: 'FALLBACK' };
  if (reply.length < 80) return { score: 2, flag: 'SHORT' };
  if (/compound|peptide|protocol|research|supplement|biological/i.test(reply)) return { score: 5, flag: null };
  return { score: 3, flag: 'GENERIC' };
}

async function callAI(message) {
  const start = Date.now();
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: SESSION }),
    });
    const elapsed = Date.now() - start;
    if (!r.ok) return { ok: false, status: r.status, error: await r.text(), elapsed };
    const data = await r.json();
    return { ok: true, status: 200, reply: data.reply || '', suggestions: data.suggestions || [], elapsed };
  } catch (e) {
    return { ok: false, status: 0, error: e.message, elapsed: Date.now() - start };
  }
}

async function run() {
  console.log(`\n${C.b}${C.cy}  ClinicalAI — Beginner QA Suite (100 Questions)${C.reset}\n`);

  let pass = 0, fallbacks = 0, errors = 0, totalMs = 0;
  const rows = [];

  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i];
    const n = i + 1;
    await new Promise(r => setTimeout(r, DELAY));
    const res = await callAI(q);
    totalMs += res.elapsed;

    if (!res.ok) {
      errors++;
      console.log(`  ${C.r}[${n}] ✗ ERROR${C.reset} (${res.elapsed}ms) ${C.d}"${q.slice(0,55)}"${C.reset}`);
      rows.push({ n, q, ok: false, elapsed: res.elapsed, flag: 'ERROR', snippet: res.error?.slice(0,80) });
      continue;
    }

    const { score, flag } = scoreResponse(res.reply);
    if (flag === 'FALLBACK') { fallbacks++; console.log(`  ${C.y}[${n}] ⚠ FALLBACK${C.reset} (${res.elapsed}ms) ${C.d}"${q.slice(0,55)}"${C.reset}`); }
    else { pass++; console.log(`  ${C.g}[${n}] ✓${C.reset} (${res.elapsed}ms) ${C.d}"${q.slice(0,55)}"${C.reset}`); }

    rows.push({ n, q, ok: true, elapsed: res.elapsed, flag, snippet: res.reply.slice(0,120).replace(/\n/g,' '), suggestions: res.suggestions });
  }

  const avgMs = Math.round(totalMs / 100);

  let md = `# 📊 ClinicalAI QA Suite — Beginner (100 Questions)\n\n`;
  md += `## 📈 Metrics\n\n`;
  md += `| Metric | Value |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Queries Tested** | 100 |\n`;
  md += `| **HTTP 200 Success** | ${pass + fallbacks} / 100 |\n`;
  md += `| **Quality Responses** | **${pass} / 100** (no fallback) |\n`;
  md += `| **Fallback Responses** | ${fallbacks} / 100 |\n`;
  md += `| **Connection Errors** | ${errors} |\n`;
  md += `| **Average Latency** | **${avgMs}ms** |\n`;
  md += `| **Session ID** | \`${SESSION}\` |\n\n`;
  md += `---\n\n`;
  md += `### 📝 Results\n\n`;
  md += `| # | Query | Status | ms | Suggestions | Snippet |\n`;
  md += `| :-- | :-- | :-- | :-- | :-- | :-- |\n`;

  for (const r of rows) {
    const status = !r.ok ? '🔴 ERR' : r.flag === 'FALLBACK' ? '⚠️ FALLBACK' : r.flag === 'SHORT' ? '🟡 SHORT' : '🟢 PASS';
    const sugg = r.suggestions?.map(s => `\`${s.label}\``).join(', ') || '—';
    md += `| ${r.n} | \`${r.q}\` | ${status} | ${r.elapsed} | ${sugg} | ${(r.snippet||'').replace(/\|/g,'\\|')} |\n`;
  }

  fs.writeFileSync(REPORT_PATH, md, 'utf8');

  console.log(`\n${C.b}${C.cy}══════════════════════════════════════════${C.reset}`);
  console.log(`${C.b}  Beginner 100 Complete | Success: ${C.g}${pass}/100${C.reset} | Fallbacks: ${C.y}${fallbacks}${C.reset} | Avg: ${avgMs}ms`);
  console.log(`  Report → ${REPORT_PATH}`);
  console.log(`${C.b}${C.cy}══════════════════════════════════════════${C.reset}\n`);
  process.exit(errors > 0 ? 1 : 0);
}

run();
