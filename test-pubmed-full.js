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
    
    const uniqueKeywords = [...new Set(keywords)].filter(Boolean).slice(0, 5);
    let searchQuery = uniqueKeywords.join(' ');
    console.log('Query Principal:', searchQuery);
    
    let searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();
    let ids = searchData.esearchresult?.idlist || [];
    console.log('Resultados Query Principal:', ids.length);
    
    if (ids.length === 0 && uniqueKeywords.length > 1) {
      searchQuery = baseName;
      console.log('Query de Fallback:', searchQuery);
      searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
      searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        searchData = await searchRes.json();
        ids = searchData.esearchresult?.idlist || [];
        console.log('Resultados Fallback:', ids.length);
      }
    }
}

test('AOD-9604', 'weight loss', ['peptide', 'fat burner']);
