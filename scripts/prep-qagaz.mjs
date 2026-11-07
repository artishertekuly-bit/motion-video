#!/usr/bin/env node
// «Қағаз бен абырой»: готовит материалы для Remotion.
//   node scripts/prep-qagaz.mjs
// 1) кадры Flow (materials/generated/qagaz/*.jpg) → public/qagaz/img/<id>.jpg (пережатие, без изменения размера)
// 2) голос (public/qagaz/voice/<id>.mp3) → выравнивание громкости → public/qagaz/audio/<id>.mp3
// 3) тайминги слов без тегов [..] → src/qagaz/audio-data.json
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GEN = resolve(ROOT, "..", "..", "materials", "generated", "qagaz");
const PUB = join(ROOT, "public", "qagaz");
const IMG = join(PUB, "img");
const VOICE = join(PUB, "voice");
const AUD = join(PUB, "audio");
mkdirSync(IMG, { recursive: true });
mkdirSync(AUD, { recursive: true });

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(" ")}\n${r.stderr}`);
};
const duration = (file) =>
  +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim();

// ---------- кадры ----------
const SHOTS = ["01", "02", "03", "04", "05", "06", "06b", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "20", "21", "22", "23", "24", "25"];
for (const id of SHOTS) {
  const src = join(GEN, `qagaz-${id}-v1_2K.jpg`);
  const dst = join(IMG, `${id}.jpg`);
  if (existsSync(dst)) continue;
  ff(["-i", src, "-q:v", "3", dst]);
  console.log(`img ${id}`);
}

// ---------- голос ----------
const LINES = ["s1", "m1", "j1", "m2", "m3", "m4", "m5", "m6", "j2", "m7", "m8", "j3"];
// Без тегов: всё, что внутри [...] (тег может разбиться на несколько «слов»)
const cleanWords = (words) => {
  const out = [];
  let inTag = false;
  for (const w of words) {
    if (w.word.startsWith("[")) inTag = true;
    if (!inTag) out.push(w);
    if (w.word.endsWith("]")) inTag = false;
  }
  return out;
};
const data = {};
for (const id of LINES) {
  const src = join(VOICE, `${id}.mp3`);
  const dst = join(AUD, `${id}.mp3`);
  // Голоса разные по громкости: приводим каждую реплику к −17 LUFS
  ff(["-i", src, "-af", "loudnorm=I=-17:TP=-2:LRA=7", "-ar", "44100", "-b:a", "192k", dst]);
  const words = cleanWords(JSON.parse(readFileSync(join(VOICE, `${id}.words.json`), "utf8")));
  data[id] = { file: `qagaz/audio/${id}.mp3`, duration: +duration(dst).toFixed(3), words };
  console.log(`voice ${id}  ${data[id].duration.toFixed(2)} s  ${words.map((w) => w.word).join(" ")}`);
}
writeFileSync(join(ROOT, "src", "qagaz", "audio-data.json"), JSON.stringify(data, null, 1));
console.log("→ src/qagaz/audio-data.json");
