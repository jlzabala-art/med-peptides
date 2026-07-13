const STOP_WORDS = new Set([
  "i", "want", "need", "looking", "for", "find", "give", "me", "the", "a", "an",
  "quiero", "necesito", "busco", "dame", "para", "algo", "que", "ayude", "con", "de", "del", "en", "como", "esta", "este", "estos", "estas",
  "my", "mi", "el", "la", "los", "las", "is", "are", "and", "or", "to", "mí", "ti", "su",
  "help", "best", "good", "something", "recommend", "recommendation", "which", "what", "ayuda", "mejor", "bueno", "alguno", "una", "un", "unas", "unos"
]);

const CANONICAL_GOALS_7 = [
  "cognitive_mood",
  "hormonal_optimization",
  "immune_support",
  "longevity_anti_aging",
  "metabolic_weight",
  "recovery_repair",
  "sleep_circadian",
];

const INTENT_MAP = [
  {
    phrases: [
      "weight loss", "fat loss", "perder peso", "adelgazar", "lose weight",
      "obesity", "obesidad", "diet", "dieta", "slim", "delgado",
      "fat burning", "lipolysis", "lipólisis", "body composition", "composicion corporal",
      "appetite", "apetito", "appetite suppression", "blood sugar", "azucar en sangre",
      "glucose", "glucosa", "insulin", "insulina", "diabetes",
      "metabolic", "metabolismo", "metabolism", "energy", "energía",
      "glp", "semaglutide", "tirzepatide", "retatrutide", "cagrilintide",
      "fatigue", "fatiga", "mitochondria", "mitocondria", "atp", "nad", "nad+",
    ],
    goals: ["metabolic_weight"],
    boost: 8,
  },
  {
    phrases: [
      "heal", "curar", "repair", "reparar", "recovery", "recuperacion",
      "injury", "herida", "lesion", "tendon", "ligament", "joint", "articulacion",
      "tissue repair", "tissue_repair", "inflammation", "inflamacion",
      "anti-inflammatory", "angiogenesis", "skin repair", "wound",
      "bpc", "bpc-157", "tb-500", "tb500", "ara-290", "ara290",
      "collagen", "colageno", "ghk", "ghk-cu",
      "pain", "dolor", "musculoskeletal", "post-injury", "nerve",
    ],
    goals: ["recovery_repair"],
    boost: 8,
  },
  {
    phrases: [
      "longevity", "longevidad", "anti-aging", "anti aging", "antiaging",
      "envejecimiento", "lifespan", "aging", "age", "younger", "rejuven",
      "telomere", "telomero", "epigenetic", "epithalon", "epitalon",
      "cellular aging", "senescence", "mots-c", "ss-31",
      "skin", "piel", "complexion", "radiance", "glow", "collagen", "colageno",
      "wrinkle", "arrugas", "fine lines", "anti-wrinkle",
    ],
    goals: ["longevity_anti_aging"],
    boost: 7,
  },
  {
    phrases: [
      "brain", "cerebro", "memory", "memoria", "focus", "concentracion",
      "cognitive", "cognitivo", "mental clarity", "claridad mental", "mental fog",
      "neuroprotection", "neuroprotecci", "mood", "animo", "estado de animo",
      "anxiety", "ansiedad", "stress", "estres", "depression", "depresion",
      "semax", "selank", "pinealon", "dsip", "nootropic",
    ],
    goals: ["cognitive_mood"],
    boost: 8,
  },
  {
    phrases: [
      "sleep", "sueno", "insomnia", "insomnio", "rest", "descanso",
      "circadian", "sleep quality", "calidad de sueno", "deep sleep",
      "dsip", "epithalon", "epitalon", "sleep architecture",
      "sleep disturbance", "melatonin",
    ],
    goals: ["sleep_circadian"],
    boost: 8,
  },
  {
    phrases: [
      "immune", "inmune", "immunity", "inmunidad", "autoimmune", "autoinmune",
      "antiviral", "t-cell", "t cell", "thymosin", "thymulin", "thymagen",
      "immune modulation", "inflammation", "inflamacion",
      "oxidative stress", "kpv", "bpc", "recovery",
    ],
    goals: ["immune_support"],
    boost: 7,
  },
  {
    phrases: [
      "hormone", "hormona", "hormonal", "growth hormone", "gh", "ghrh",
      "ipamorelin", "tesamorelin", "cjc", "ghrp", "sermorelin",
      "testosterone", "testosterona", "libido", "sexual health",
      "fertility", "fertilidad", "estrogen", "estrogeno",
      "body composition", "lean mass", "muscle", "musculo", "anabolic",
      "anabolico", "muscle growth", "muscle_growth", "gh optimization",
      "follistatin", "fst", "myostatin",
    ],
    goals: ["hormonal_optimization"],
    boost: 7,
  },
  {
    phrases: [
      "dosage", "dosis", "reconstitution", "reconstitucion",
      "how to use", "como usar", "inject", "inyectar", "dose",
    ],
    goals: ["dosage"],
    boost: 5,
  },
];

const META_INTENT_MAP = [
  { 
    phrases: ["idiomas", "hablar", "languages", "speak", "english", "spanish", "español", "ingles"], 
    id: "languages",
    reply: "I communicate exclusively in **English** to ensure technical precision in clinical research. You can perform your inquiries in any language, but I will respond in English."
  },
  {
    phrases: ["quien eres", "eres una ia", "who are you", "are you ai", "what are you", "que eres"],
    id: "identity",
    reply: "I am the **Atlas Health Clinical Intelligence Assistant**. My purpose is to help you navigate our peptide and supplement catalog, technical protocols, and FAQ database."
  },
  {
    phrases: ["que puedes hacer", "ayuda", "help", "what can you do", "funcionalidades", "features"],
    id: "capabilities",
    reply: "I can help you find specific peptides by research goal (weight loss, recovery, etc.), explain reconstitution protocols, resolve shipping questions, and provide technical data from our academy."
  }
];

const BEGINNER_SIGNALS = ["what is", "how does", "i'm new", "new to", "explain", "beginning", "start", "basics", "novice"];
const PROFESSIONAL_SIGNALS = [
  "bpc-157", "bpc157", "tb-500", "tb500", "cjc-1295", "ipamorelin", "semax", "selank",
  "tesamorelin", "sermorelin", "epithalon", "retatrutide", "tirzepatide", "semaglutide",
  "ghrp", "ghrh", "ghk-cu", "mots-c", "ss-31", "ara-290", "pinealon", "dsip",
  "mcg", "iu", "subcutaneous", "intramuscular", "subcutaneo", "intramuscula",
  "titration", "titulacion", "protocol phase", "cycling", "pulsatile",
];

const ES_EN_SYNONYMS = {
  "peptido": "peptide", "peptidos": "peptides", "como usar": "how to use",
  "reconstitucion": "reconstitution", "dosis": "dosage", "dosis diaria": "dosage",
  "cabello": "hair", "pelo": "hair", "caida de cabello": "hair loss",
  "caida de pelo": "hair loss", "crecimiento capilar": "hair growth",
  "calvicie": "baldness", "alopecia": "hair loss",
  "piel": "skin", "cara": "face", "rostro": "face",
  "arrugas": "wrinkles", "lineas de expresion": "fine lines",
  "acne": "acne", "inflamacion": "inflammation", "dolor": "pain",
  "cicatrizacion": "healing", "herida": "injury", "tendones": "tendon",
  "articulacion": "joint", "recuperacion": "recovery",
  "perder peso": "weight loss", "adelgazar": "fat loss",
  "metabolismo": "metabolism", "azucar en sangre": "blood sugar",
  "insulina": "insulin", "glucosa": "glucose",
  "musculo": "muscle", "musculos": "muscle", "fuerza": "strength",
  "masa muscular": "lean mass", "anabolico": "anabolic",
  "sueno": "sleep", "insomnio": "insomnia", "descanso": "rest",
  "cerebro": "brain", "memoria": "memory", "concentracion": "focus",
  "cognitivo": "cognitive", "claridad mental": "mental clarity",
  "longevidad": "longevity", "envejecimiento": "aging",
  "energia": "energy", "fatiga": "fatigue", "mitocondria": "mitochondria",
  "inmune": "immune", "autoinmune": "autoimmune",
  "estado de animo": "mood", "ansiedad": "anxiety",
};

module.exports = {
  STOP_WORDS,
  CANONICAL_GOALS_7,
  INTENT_MAP,
  META_INTENT_MAP,
  BEGINNER_SIGNALS,
  PROFESSIONAL_SIGNALS,
  ES_EN_SYNONYMS
};
