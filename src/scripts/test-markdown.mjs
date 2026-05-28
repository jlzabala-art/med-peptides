const CLINICAL_GLOSSARY = { "peptide": "A peptide", "retatrutide": "Retatrutide details" };

function inlineFormat(text) {
  if (!text) return null;
  
  const glossaryTerms = Object.keys(CLINICAL_GLOSSARY).sort((a, b) => b.length - a.length);
  const glossaryRegex = new RegExp(`\\b(${glossaryTerms.join('|')})\\b`, 'gi');

  const parts = text.split(/(\[(?:[^\]]+)\]\((?:[^)]+)\)|\[REF:\d+\]|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  console.log("Parts:", parts);
  const result = [];
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (!part) { i++; continue; }

    if (part.startsWith('**') && part.endsWith('**')) {
      result.push({ type: 'bold', content: part.slice(2, -2) });
    } else {
      result.push({ type: 'text', content: part });
    }
    i++;
  }
  return result;
}

console.log(inlineFormat("**PRIMARY RESEARCH GOAL**"));
