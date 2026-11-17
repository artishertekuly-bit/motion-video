#!/usr/bin/env node
// «Көпір» (9 «Б» сынып, физика + информатика, құжаттық стиль):
// аудио нормализациясы (−14.5 LUFS), сөздер таймингі, эффектілер → src/videos/kopir/audio-data.json
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const EP = "kopir";
const OUT = join(ROOT, "src", "videos", "kopir", "audio-data.json");

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

const LINES = ["g1", "g2", "e1", "g3", "e2", "grp1", "a1", "nar1"];

const data = {};
mkdirSync(join(PUB, EP, "audio"), { recursive: true });
for (const id of LINES) {
  const src = join(PUB, EP, "voice", `${id}.mp3`);
  const dst = join(PUB, EP, "audio", `${id}.mp3`);
  const af = "loudnorm=I=-14.5:TP=-1.5:LRA=7";
  ff(["-i", src, "-af", af, "-ar", "44100", "-b:a", "192k", dst]);
  const words = cleanWords(JSON.parse(readFileSync(join(PUB, EP, "voice", `${id}.words.json`), "utf8"))).map((w) => ({
    word: w.word,
    start: +w.start.toFixed(3),
    end: +w.end.toFixed(3),
  }));
  data[id] = { file: `${EP}/audio/${id}.mp3`, duration: +duration(dst).toFixed(3), words };
  console.log(`voice ${id}  ${data[id].duration.toFixed(2)} s  ${words.length} words`);
}

const SRC = {
  "s-tick": "shpor/sfx/s-tick.mp3",
  "s-pop": "shpor/sfx/s-pop.mp3",
  "s-ping": "shpor/sfx/s-ping.mp3",
  "s-music": "shpor/sfx/s-music.mp3",
  "s-whoosh": "qagaz/sfx/q-whoosh.mp3",
  "u-slam": "ubt1/sfx/u-slam.mp3",
  "w-correct": "ubt3/sfx/w-correct.mp3",
  "v-sparkle": "ubt8/sfx-n/v-sparkle.mp3",
  "x-bell": "ubt5/sfx/x-bell.mp3",
  "x-crash": "ubt8/sfx/x-crash.mp3",
};

data._sfx = {};
mkdirSync(join(PUB, EP, "sfx-n"), { recursive: true });
for (const [id, rel] of Object.entries(SRC)) {
  const s = join(PUB, rel);
  const d = join(PUB, EP, "sfx-n", `${id}.mp3`);
  if (!existsSync(s)) {
    console.warn(`SFX not found: ${s}`);
    continue;
  }
  const af = id === "s-music" ? "loudnorm=I=-22:TP=-2:LRA=11" : "loudnorm=I=-16:TP=-1.5:LRA=7";
  ff(["-i", s, "-af", af, "-ar", "44100", "-b:a", "192k", d]);
  data._sfx[id] = { file: `${EP}/sfx-n/${id}.mp3`, duration: +duration(d).toFixed(3) };
  console.log(`sfx ${id}  ${data._sfx[id].duration.toFixed(2)} s`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(`wrote ${OUT}`);
