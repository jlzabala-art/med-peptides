/**
 * Generates an array of lowercased prefix tokens for indexing in Firestore.
 * E.g., "Retatrutide" => ["r", "re", "ret", "reta", "retat", ...]
 */
export function generateSearchTokens(...fields) {
  const tokens = new Set();
  
  fields.forEach(field => {
    if (!field || typeof field !== 'string') return;
    
    // Clean and split into words
    const words = field.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/[\s-]+/).filter(Boolean);
    
    words.forEach(word => {
      // Generate prefixes starting at length 2
      for (let i = 2; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    });
  });
  
  return Array.from(tokens);
}
