import fs from "fs";
const raw = fs.readFileSync("AI Prompts/skin_003.json", "utf8");
try {
  JSON.parse(raw);
  console.log("JSON is valid");
} catch (e) {
  console.error(e.message);
  console.error("Position:", e.at);
  const pos = parseInt(e.message.match(/at position (\d+)/)?.[1]);
  if (pos) {
    console.log("Context around position:", raw.substring(pos - 50, pos + 50));
  }
}
