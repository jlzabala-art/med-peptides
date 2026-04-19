const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function test(productName, semanticKeywords = '', tags = []) {
    const baseName = productName.replace(/\s*\d+(mg|mcg|ml|g|iu|ui)\b/gi, '').replace(/\/?\s?vial\b/gi, '').trim();

    const keywords = [baseName];
    if (semanticKeywords) {
      const sem = semanticKeywords.split(',').map(s => s.trim());
      keywords.push(...sem);
    }
    if (tags && Array.isArray(tags)) {
      keywords.push(...tags);
    }
    
    // Test base search
    let searchQuery = baseName;
    console.log('Query Principal:', searchQuery);
    let searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();
    let ids = searchData.esearchresult?.idlist || [];
    console.log('Resultados Query Principal:', ids.length);
}

test('AOD-9604', 'weight loss', ['peptide']);
