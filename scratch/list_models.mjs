import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load GEMINI_API_KEY from environment ─────────────────────────────────────
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  const envPaths = [
    resolve(__dirname, '../.env.local'),
    resolve(__dirname, '../.env'),
    resolve(__dirname, '../../.env.local'),
    resolve(__dirname, '../../.env')
  ];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const lines = readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const parts = line.split('=');
        if (parts[0]?.trim() === 'GEMINI_API_KEY') {
          apiKey = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
    }
    if (apiKey) break;
  }
}

async function main() {
  console.log("Listing available models from Gemini API...");
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ Failed: Status ${response.status} ${response.statusText}`);
      console.error(await response.text());
      process.exit(1);
    }
    const data = await response.json();
    console.log(`Found ${data.models?.length} models:`);
    for (const m of data.models || []) {
      console.log(`- ${m.name} (${m.displayName})`);
      console.log(`  Supported methods: ${m.supportedGenerationMethods?.join(', ')}`);
      console.log(`  Input token limit: ${m.inputTokenLimit}`);
    }
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}

main().catch(console.error);
