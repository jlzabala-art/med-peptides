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
    
    console.log('--- Productos y Keywords Originales ---');
    console.log('Nombre Original:', productName);
    console.log('Base Name (extraído):', baseName);
    console.log('Query Principal:', searchQuery);

    console.log('--- Buscando en PubMed ---');
    let searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    let searchRes = await fetch(searchUrl);
    let searchData = await searchRes.json();
    let ids = searchData.esearchresult?.idlist || [];
    console.log('Resultados Query Principal:', ids.length);
    
    // 3b. Fallback Search
    if (ids.length === 0 && uniqueKeywords.length > 1) {
      searchQuery = baseName;
      console.log('--- FALLBACK ACTIVADO ---');
      console.log('Query de Fallback:', searchQuery);
      searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
      searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        searchData = await searchRes.json();
        ids = searchData.esearchresult?.idlist || [];
        console.log('Resultados Fallback:', ids.length);
      }
    }

    if (ids.length > 0) {
        console.log('\n--- Artículos Encontrados ---');
        const summaryUrl = `${API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();
        
        ids.forEach(id => {
            console.log(`- ${summaryData.result[id].title}`);
        })
    } else {
        console.log('0 artículos encontrados.');
    }
}

// Simulaciones
async function runTests() {
    console.log('========== PRUEBA 1: SEMAGLUTIDE ==========');
    await test('Semaglutide 5mg', 'weight loss, GLP-1', ['diabetes', 'obesity']);
    
    console.log('\n========== PRUEBA 2: BPC-157 ==========');
    await test('BPC-157 5mg / vial', 'healing, recovery', ['peptide', 'muscle']);
}

runTests();
