#!/usr/bin/env node
// «30 КҮН: ЕРАСЫЛ ҰБТ-ға», 7-күн (Жексенбі · Мектептегі тест & Мұз айдыны): голос (рассказчик ×1.08) → −14,5 LUFS,
// тайминги слов без тегов (с учётом ускорения), эффекты → src/videos/ubt7/audio-data.json
//   node scripts/prep-ubt7.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const EP = "ubt7";
const OUT = join(ROOT, "src", "videos", "ubt7", "audio-data.json");
const NARR_SPEED = 1.08;
const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(" ")}\n${r.stderr}`);
};
const duration = (file) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim();
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

const LINES = [
  "n1", "e1", "a1", "n2", "a2", "e2", "n3", "a3", "e3", "e4",
  "n4", "e5", "a4", "n5", "e6", "a5", "n6", "n7", "n8"
];

const data = {};
mkdirSync(join(PUB, EP, "audio"), { recursive: true });
for (const id of LINES) {
  const src = join(PUB, EP, "voice", `${id}.mp3`);
  const dst = join(PUB, EP, "audio", `${id}.mp3`);
  const sp = id.startsWith("n") ? NARR_SPEED : 1;
  const af = `${sp !== 1 ? `atempo=${sp},` : ""}loudnorm=I=-14.5:TP=-1.5:LRA=7`;
  ff(["-i", src, "-af", af, "-ar", "44100", "-b:a", "192k", dst]);
  const words = cleanWords(JSON.parse(readFileSync(join(PUB, EP, "voice", `${id}.words.json`), "utf8"))).map((w) => ({
    word: w.word,
    start: +(w.start / sp).toFixed(3),
    end: +(w.end / sp).toFixed(3),
  }));
  data[id] = { file: `${EP}/audio/${id}.mp3`, duration: +duration(dst).toFixed(3), words };
  console.log(`voice ${id}  ${data[id].duration.toFixed(2)} s  ${words.length} words`);
}

const SRC = {
  "s-tick": "shpor/sfx/s-tick.mp3",
  "s-pop": "shpor/sfx/s-pop.mp3",
  "s-boing": "shpor/sfx/s-boing.mp3",
  "s-ping": "shpor/sfx/s-ping.mp3",
  "s-music": "shpor/sfx/s-music.mp3",
  "s-whoosh": "qagaz/sfx/q-whoosh.mp3",
  "u-slam": "ubt1/sfx/u-slam.mp3",
  "v-sparkle": "ubt2/sfx/v-sparkle.mp3",
  "w-wind": "ubt3/sfx/w-wind.mp3",
  "w-correct": "ubt3/sfx/w-correct.mp3",
  "w-switch": "ubt3/sfx/w-switch.mp3",
  "w-vs": "ubt3/sfx/w-vs.mp3",
  "x-romantic": "ubt4/sfx/x-romantic.mp3",
  "x-heartbeat": "ubt5/sfx/x-heartbeat.mp3",
  "x-chime": "ubt6/sfx-n/x-chime.mp3",
  "x-skate": `${EP}/sfx/x-skate.mp3`,
  "x-slip": `${EP}/sfx/x-slip.mp3`,
};
const LEVEL = { "s-music": -28, "s-tick": -27, "x-romantic": -25, "x-slip": -19, "u-slam": -18 };
const sfx = {};
mkdirSync(join(PUB, EP, "sfx-n"), { recursive: true });
for (const [id, rel] of Object.entries(SRC)) {
  const src = join(PUB, rel);
  if (!existsSync(src)) {
    console.log(`skip ${id} (not found: ${src})`);
    continue;
  }
  const dst = join(PUB, EP, "sfx-n", `${id}.mp3`);
  ff(["-i", src, "-af", `loudnorm=I=${LEVEL[id] ?? -21.5}:TP=-3:LRA=11`, "-ar", "44100", "-b:a", "160k", dst]);
  sfx[id] = { file: `${EP}/sfx-n/${id}.mp3`, duration: +duration(dst).toFixed(3) };
}
console.log(`sfx: ${Object.keys(sfx).length}`);
data._sfx = sfx;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log("→ " + OUT);
