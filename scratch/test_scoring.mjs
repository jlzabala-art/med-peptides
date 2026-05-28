import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

const STOP_WORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo',
  'como', 'mas', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'si', 'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre',
  'tambien', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
  'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'que', 'unos', 'otro', 'otras', 'otra', 'él',
  'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo',
  'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos',
  'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras',
  'vuestro', 'vuestra', 'vuestros', 'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'esté',
  'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán', 'estaría', 'estarías',
  'estaríamos', 'estaríais', 'estarían', 'estaba', 'estabas', 'estábamos', 'estabais', 'estaban', 'estuve', 'estuviste', 'estuvo',
  'estuvimos', 'estuvisteis', 'estuvieron', 'estuviera', 'estuvieras', 'estuviéramos', 'estuvierais', 'estuvieran', 'estuviese',
  'estuvieses', 'estuviésemos', 'estuvieseis', 'estuviesen', 'teniendo', 'tenido', 'tenida', 'tenidos', 'tenidas', 'tengo',
  'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen', 'tenga', 'tengas', 'tengamos', 'tengáis', 'tengan', 'tendré', 'tendrás',
  'tendrá', 'tendremos', 'tendréis', 'tendrán', 'tendría', 'tendrías', 'tendríamos', 'tendríais', 'tendrían', 'tenía', 'tenías',
  'teníamos', 'teníais', 'tenían', 'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron', 'tuviera', 'tuvieras',
  'tuviéramos', 'tuvierais', 'tuvieran', 'tuviese', 'tuvieses', 'tuviésemos', 'tuvieseis', 'tuviesen', 'tened',
  'the', 'of', 'and', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i',
  'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when',
  'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other',
  'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time',
  'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people', 'my', 'than', 'first',
  'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'
]);

const ES_EN_SYNONYMS = {
  "perdida de peso": "weight loss",
  "grasa": "fat",
  "sueño": "sleep",
  "musculo": "muscle",
  "crecimiento": "growth",
  "recuperacion": "recovery",
  "lesion": "injury",
  "enfoque": "focus",
  "memoria": "memory",
  "antienvejecimiento": "anti-aging",
  "piel": "skin",
  "articulaciones": "joints"
};

const INTENT_MAP = [
  { phrases: ["muscle", "crecimiento", "growth", "hypertrophy", "fuerza", "strength", "recovery", "recuperacion", "bpc", "tb-500", "tb500", "ipamorelin", "sermorelin"], goals: ["Recovery / Injury", "Muscle Growth & Recovery"], boost: 10 },
  { phrases: ["fat", "weight", "peso", "grasa", "metabolic", "metabolismo", "obesity", "obesidad", "adipose", "tirzepatide", "semaglutide", "retatrutide", "5-amino", "5-amino-1mq"], goals: ["Weight Management / Obesity", "Metabolic Health", "Weight Management / Metabolic Longevity"], boost: 10 },
  { phrases: ["cognitive", "focus", "enfoque", "memory", "memoria", "brain", "cerebro", "semax", "selank", "dihexa", "pinealon"], goals: ["Cognitive Support"], boost: 10 },
  { phrases: ["longevity", "longevidad", "aging", "envejecimiento", "epithalon", "epitalon", "nmn", "nad", "cellular health"], goals: ["Longevity"], boost: 10 },
  { phrases: ["hormon", "vitality", "vitalidad", "libido", "sexual", "testagen", "dhea", "kisspeptin", "pt-141", "pt141"], goals: ["Hormonal Support"], boost: 10 },
  { phrases: ["skin", "piel", "hair", "cabello", "wrinkle", "arruga", "ghk", "ghk-cu", "collagen", "colageno"], goals: ["Skin / Anti-Aging"], boost: 10 },
  { phrases: ["immune", "inmune", "inflammation", "inflamacion", "thymosin", "ta1", "kpv"], goals: ["Immune / Inflammation"], boost: 10 },
  { phrases: ["sleep", "sueño", "insom", "dormir", "dsip", "circadian"], goals: ["Sleep Support"], boost: 10 }
];

async function run() {
  const rawMessage = "I want to explore research options for the compound Advanced Metabolic & Longevity Protocol.";
  const rawQuery = rawMessage.toLowerCase().trim();
  const query = rawQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let expandedQuery = query;
  for (const [es, en] of Object.entries(ES_EN_SYNONYMS)) {
    if (expandedQuery.includes(es)) {
      expandedQuery = expandedQuery.replace(new RegExp(es, "g"), `${es} ${en}`);
    }
  }

  const tokens = expandedQuery.split(/\s+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));
  console.log('Query:', query);
  console.log('Tokens:', tokens);

  const matchedGoals = new Set();
  let maxBoost = 0;
  INTENT_MAP.forEach(({ phrases, goals, boost }) => {
    if (phrases.some(p => query.includes(p.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
      goals.forEach(g => matchedGoals.add(g));
      if (boost > maxBoost) maxBoost = boost;
    }
  });
  console.log('Matched Goals:', Array.from(matchedGoals));
  console.log('Max Boost:', maxBoost);

  const snap = await db.collection('protocols').where('active', '==', true).get();
  const allProtocols = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const scoredProtocols = allProtocols.map(proto => {
    let score = 0;
    const dosingText = [proto.dosing_enrichment?.maintenance_dose, proto.dosing_enrichment?.titration_note, proto.dosing_enrichment?.timing_optimization, proto.dosing_enrichment?.cycling_recommendation].filter(Boolean).join(" ");
    
    const searchable = [
      proto.id,
      proto.protocol_title,
      proto.title,
      proto.protocol_slug,
      proto.metadata?.scientificName,
      proto.metadata?.abbreviatedName,
      ...(proto.metadata?.keywords || []),
      proto.overview_summary,
      proto.category,
      proto.metadata?.primary_goal,
      proto.metadata?.primary_condition,
      dosingText,
      ...(proto.eligibility_rules?.indications || []),
      ...(proto.expected_outcomes?.qualitative || [])
    ].filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const queryInSearchable = searchable.includes(query);
    let tokenMatches = [];
    tokens.forEach(t => {
      if (searchable.includes(t)) {
        score += 3;
        tokenMatches.push(t);
      }
    });

    const cleanProtoTitle = (proto.protocol_title || proto.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (cleanProtoTitle && (query.includes(cleanProtoTitle) || cleanProtoTitle.includes(query))) {
      score += 25;
    }

    if (queryInSearchable) score += 12;
    if (proto.metadata?.primary_goal && matchedGoals.has(proto.metadata.primary_goal)) score += maxBoost;
    if (dosingText && matchedGoals.has("dosage")) score += 8;

    return {
      id: proto.id,
      title: proto.protocol_title,
      score,
      queryInSearchable,
      tokenMatches,
      primaryGoal: proto.metadata?.primary_goal
    };
  }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

  console.log('Scored protocols length:', scoredProtocols.length);
  const wm003 = scoredProtocols.find(p => p.id === 'wm_003');
  console.log('wm_003 score details:', wm003);
  console.log('Top scored protocols:', scoredProtocols.slice(0, 5));
}

run().catch(console.error);
