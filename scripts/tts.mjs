#!/usr/bin/env node
// ElevenLabs TTS с таймингами слов.
//   node scripts/tts.mjs <segments.json> <outDir>
// segments.json: [{ "id": "n01", "voice": "<voice_id>", "text": "...", "settings": {...}, "prev": "...", "next": "..." }]
// Для каждого сегмента пишет <outDir>/<id>.mp3 и <id>.words.json. Уже существующие файлы пропускает (кредиты не тратит).
// Ключ берётся из Motion/.env (ELEVENLABS_API_KEY) и никогда не печатается.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envText = readFileSync(resolve(ROOT, "..", "..", ".env"), "utf8");
const KEY = envText.match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
if (!KEY) throw new Error("ELEVENLABS_API_KEY not found in Motion/.env");

const [segFile, outDirArg] = process.argv.slice(2);
if (!segFile || !outDirArg) {
  console.error("Usage: node scripts/tts.mjs <segments.json> <outDir>");
  process.exit(1);
}
const segments = JSON.parse(readFileSync(segFile, "utf8"));
const outDir = resolve(outDirArg);
mkdirSync(outDir, { recursive: true });

const credits = async () => {
  const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": KEY } });
  const j = await r.json();
  return j.character_count;
};

const toWords = (al) => {
  const words = [];
  let cur = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { word: "", start: al.character_start_times_seconds[i], end: 0 };
    cur.word += ch;
    cur.end = al.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words.map((w) => ({ word: w.word, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
};

const before = await credits();
for (const s of segments) {
  const mp3 = join(outDir, `${s.id}.mp3`);
  if (existsSync(mp3)) {
    console.log(`skip ${s.id} (exists)`);
    continue;
  }
  const body = {
    text: s.text,
    model_id: s.model ?? "eleven_v4",
    language_code: "kk",
    ...(s.settings ? { voice_settings: s.settings } : {}),
    ...(s.prev ? { previous_text: s.prev } : {}),
    ...(s.next ? { next_text: s.next } : {}),
  };
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${s.voice}/with-timestamps?output_format=mp3_44100_128`,
    { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!r.ok) {
    console.error(`✗ ${s.id}: HTTP ${r.status} ${(await r.text()).slice(0, 400)}`);
    continue;
  }
  const j = await r.json();
  writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
  const words = toWords(j.alignment);
  writeFileSync(join(outDir, `${s.id}.words.json`), JSON.stringify(words, null, 2));
  const dur = words.length ? words[words.length - 1].end : 0;
  console.log(`✓ ${s.id}  ${dur.toFixed(2)} s  ${words.map((w) => w.word).join(" ")}`);
}
const after = await credits();
console.log(`credits spent: ${after - before}  (used ${after})`);
