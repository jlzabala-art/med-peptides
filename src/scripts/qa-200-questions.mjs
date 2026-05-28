/**
 * qa-200-questions.mjs  — Questions 101–200 (Categories 11–20)
 */
import fs from 'fs';

const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';
const REPORT_PATH = '/Users/joseluiszabala/.gemini/antigravity/brain/9809c972-34a7-4d53-88ed-9df5fe8d94fc/clinicalai_200_qa_report.md';
const SESSION = `qa-200-${Date.now()}`;
const DELAY = 300;

const C = { g: '\x1b[32m', r: '\x1b[31m', b: '\x1b[1m', d: '\x1b[2m', reset: '\x1b[0m', cy: '\x1b[36m', y: '\x1b[33m' };

const CATEGORIES = [
  {
    name: '11. ADVANCED GOAL DISCOVERY',
    queries: [
      'Which options are most associated with healthy aging and recovery together?',
      'I want support for resilience and physical performance.',
      'What would fit someone interested in sleep and cognition at the same time?',
      'Which biological goal is most connected to mitochondrial health?',
      'I am looking for protocols focused on recovery after surgery research.',
      'Which pathways are most associated with inflammation support?',
      'I want support for vitality and energy optimization.',
      'What products are linked to circadian rhythm research?',
      'Which category is most associated with skin regeneration?',
      'I want protocols related to performance recovery.',
    ]
  },
  {
    name: '12. MULTI-GOAL REASONING',
    queries: [
      'I want better sleep and fat loss together.',
      'Which peptides are commonly explored for cognition and longevity?',
      'I want recovery support but also metabolic optimization.',
      'Which protocols combine hormonal and metabolic support?',
      'What would fit someone interested in anti-aging and immune support?',
      'Which supplements are related to recovery and sleep?',
      'I want protocols that include both mitochondrial and cognitive support.',
      'What are the most versatile peptide categories?',
      'Which compounds are linked to both energy and recovery?',
      'What protocols overlap between longevity and cognition?',
    ]
  },
  {
    name: '13. PROTOCOL STRUCTURE TESTS',
    queries: [
      'How are protocol phases usually organized?',
      'What is the purpose of an initiation phase?',
      'Why do some protocols include stabilization phases?',
      'What happens during optimization phases?',
      'Explain protocol timelines.',
      'What determines protocol duration?',
      'Why are some protocols divided into multiple biological goals?',
      'What are the most common protocol components?',
      'Which protocols include loading phases?',
      'How are peptides scheduled across weeks?',
    ]
  },
  {
    name: '14. ADMINISTRATION & DOSING TESTS',
    queries: [
      'What administration routes are commonly used in peptide research?',
      'Explain subcutaneous administration simply.',
      'Why do some compounds require reconstitution?',
      'What is dose titration?',
      'Why are some protocols cyclical?',
      'How often are recovery peptides typically explored?',
      'Which compounds are usually taken daily?',
      'What determines dosing frequency?',
      'What is peptide cycling?',
      'Why do some protocols include breaks?',
    ]
  },
  {
    name: '15. SUPPLEMENT-SPECIFIC TESTS',
    queries: [
      'Which supplements are most associated with longevity?',
      'What supplements are commonly paired with peptides?',
      'Show supplements related to cognitive support.',
      'Which supplements focus on mitochondrial function?',
      'What is Spermidine usually researched for?',
      'Which supplements are associated with cellular energy?',
      'What categories include adaptogens?',
      'Which supplements are linked to sleep support?',
      'Show metabolic health supplements.',
      'Which supplements are most beginner friendly?',
    ]
  },
  {
    name: '16. PEPTIDE-SPECIFIC TESTS',
    queries: [
      'What are the most researched recovery peptides?',
      'Which peptides are most associated with longevity?',
      'Show peptides related to appetite regulation.',
      'What peptides are connected to mitochondrial optimization?',
      'Which peptides are associated with neuro-support research?',
      'What is AOD-9604 usually explored for?',
      'What peptides are related to tissue healing?',
      'Which peptides are linked to anti-inflammatory pathways?',
      'What compounds are commonly explored for body composition?',
      'Which peptides are commonly associated with sleep quality?',
    ]
  },
  {
    name: '17. CLINICALAI EXPERIENCE TESTS',
    queries: [
      "I don't know where to begin.",
      'Can you guide me based on my goals?',
      'What is the simplest protocol available?',
      'I want something advanced for longevity research.',
      'Explain this platform in simple terms.',
      'How should I explore protocols?',
      'Which section should I visit first?',
      'Help me compare different biological goals.',
      'What would you recommend for a beginner researcher?',
      'Can you explain the difference between peptides and protocols?',
    ]
  },
  {
    name: '18. SEARCH INTENT TESTS',
    queries: [
      'Healing peptides.',
      'Fat metabolism support.',
      'Brain optimization.',
      'Longevity stack.',
      'Better recovery.',
      'Deep sleep support.',
      'Mitochondrial peptides.',
      'Anti-inflammatory support.',
      'Hormonal balance.',
      'Healthy aging support.',
    ]
  },
  {
    name: '19. CATEGORY & FILTER TESTS',
    queries: [
      'Show only metabolic protocols.',
      'Show all recovery supplements.',
      'Which peptides belong to cognitive support?',
      'Filter by longevity.',
      'Show advanced protocols only.',
      'Which products belong to more than one goal?',
      'Show protocols containing BPC-157.',
      'Which supplements are in metabolic categories?',
      'Show products related to circadian support.',
      'Which protocols are shortest in duration?',
    ]
  },
  {
    name: '20. PDF & PREVIEW CONSISTENCY TESTS',
    queries: [
      'Does the protocol preview match the PDF?',
      'Show the monitoring schedule section.',
      'Where is the safety profile located?',
      'What sections are included in the protocol document?',
      'Does the preview include logistics and supplies?',
      'Show the administration guide.',
      'Is the protocol timeline identical in the preview and PDF?',
      'What information is excluded from the PDF preview?',
      'Where is pricing information displayed?',
      'Which protocol sections are clinical versus commercial?',
    ]
  },
];

// Scoring heuristics — flag responses that look like generic fallbacks
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
  console.log(`\n${C.b}${C.cy}  ClinicalAI — 200 QA Suite (Questions 101–200)${C.reset}\n`);

  let n = 100, pass = 0, fallbacks = 0, errors = 0, totalMs = 0;
  const catResults = [];

  for (const cat of CATEGORIES) {
    console.log(`\n${C.b}${C.cy}📁 ${cat.name}${C.reset}`);
    const rows = [];

    for (const q of cat.queries) {
      n++;
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
    catResults.push({ name: cat.name, rows });
  }

  // Generate report
  const avgMs = Math.round(totalMs / 100);
  const qualityRate = Math.round((pass / 100) * 100);

  let md = `# 📊 ClinicalAI QA Suite — Questions 101–200 (Categories 11–20)

## 📈 Metrics

| Metric | Value |
| :--- | :--- |
| **Queries Tested** | 100 (Q101–Q200) |
| **HTTP 200 Success** | ${pass + fallbacks} / 100 |
| **Quality Responses** | **${pass} / 100** (no fallback) |
| **Fallback Responses** | ${fallbacks} / 100 |
| **Connection Errors** | ${errors} |
| **Average Latency** | **${avgMs}ms** |
| **Session ID** | \`${SESSION}\` |

---

`;

  for (const cat of catResults) {
    md += `### 📁 ${cat.name}\n\n`;
    md += `| # | Query | Status | ms | Suggestions | Snippet |\n`;
    md += `| :-- | :-- | :-- | :-- | :-- | :-- |\n`;
    for (const r of cat.rows) {
      const status = !r.ok ? '🔴 ERR' : r.flag === 'FALLBACK' ? '⚠️ FALLBACK' : r.flag === 'SHORT' ? '🟡 SHORT' : '🟢 PASS';
      const sugg = r.suggestions?.map(s => `\`${s.label}\``).join(', ') || '—';
      md += `| ${r.n} | \`${r.q}\` | ${status} | ${r.elapsed} | ${sugg} | ${(r.snippet||'').replace(/\|/g,'\\|')} |\n`;
    }
    md += '\n---\n\n';
  }

  fs.writeFileSync(REPORT_PATH, md, 'utf8');

  console.log(`\n${C.b}${C.cy}══════════════════════════════════════════${C.reset}`);
  console.log(`${C.b}  Q101–200 Complete | Success: ${C.g}${pass}/100${C.reset} | Fallbacks: ${C.y}${fallbacks}${C.reset} | Avg: ${avgMs}ms`);
  console.log(`  Report → ${REPORT_PATH}`);
  console.log(`${C.b}${C.cy}══════════════════════════════════════════${C.reset}\n`);
  process.exit(errors > 0 ? 1 : 0);
}

run();
