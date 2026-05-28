const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function testRaw(term) {
  const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=3`;
  try {
    const searchRes = await fetch(searchUrl);
    console.log(`Status for "${term}": ${searchRes.status} ${searchRes.statusText}`);
    const searchData = await searchRes.json();
    console.log(`Data for "${term}":`, JSON.stringify(searchData, null, 2));
  } catch (err) {
    console.error(`Error for "${term}":`, err);
  }
}

async function run() {
  await testRaw("CJC-1295");
  await testRaw("CJC1295");
  await testRaw("Sermorelin");
  await testRaw("BPC-157");
}

run();
