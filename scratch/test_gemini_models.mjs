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

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello! Reply with 'OK' and nothing else." }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 5
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log(`✅ Success for ${modelName}! Response: "${text}"`);
      return true;
    } else {
      console.log(`❌ Failed for ${modelName}: Status ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(text);
      return false;
    }
  } catch (err) {
    console.log(`❌ Error for ${modelName}:`, err.message);
    return false;
  }
}

async function main() {
  if (!apiKey) {
    console.error("No API key found.");
    process.exit(1);
  }

  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  for (const model of models) {
    await testModel(model);
    console.log("------------------------");
  }
}

main().catch(console.error);
