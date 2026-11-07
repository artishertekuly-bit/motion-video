#!/usr/bin/env node
// ElevenLabs sound effects.  node scripts/sfx.mjs <sfx.json> <outDir>
// sfx.json: [{ "id": "sfx-key", "text": "...", "duration": 2.5, "loop": false, "influence": 0.5 }]
// Existing files are skipped. Key from Motion/.env, never printed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = readFileSync(resolve(ROOT, "..", "..", ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
const [file, outArg] = process.argv.slice(2);
const items = JSON.parse(readFileSync(file, "utf8"));
const out = resolve(outArg);
mkdirSync(out, { recursive: true });
const credits = async () => (await (await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": KEY } })).json()).character_count;
const before = await credits();
for (const s of items) {
  const p = join(out, `${s.id}.mp3`);
  if (existsSync(p)) { console.log(`skip ${s.id}`); continue; }
  const r = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: s.text, duration_seconds: s.duration, prompt_influence: s.influence ?? 0.5, loop: !!s.loop, model_id: "eleven_text_to_sound_v2" }),
  });
  if (!r.ok) { console.error(`✗ ${s.id}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`); continue; }
  writeFileSync(p, Buffer.from(await r.arrayBuffer()));
  console.log(`✓ ${s.id}`);
}
console.log(`credits spent: ${(await credits()) - before}`);
