#!/usr/bin/env node
// «Түнде мектеп»: голоса → −14,5 LUFS (ата — ниже на тон, Дамир — чуть моложе), тайминги слов без тегов,
// эффекты (все новые, public/tunde/sfx) → нормировка, удары шагов → src/tunde/audio-data.json
//   node scripts/prep-tunde.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const EP = "tunde";
const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(" ")}\n${r.stderr}`);
  return r;
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

const LINES = ["h1", "n1", "n2", "m1", "n3", "n4", "n5", "d1", "a1", "n6", "a2", "n7", "t1", "n8"];
const FX = {
  a1: "rubberband=pitch=0.9,lowpass=f=7000,",
  a2: "rubberband=pitch=0.9,lowpass=f=7000,aecho=0.8:0.6:40:0.12,",
  h1: "rubberband=pitch=1.05,highpass=f=180,lowpass=f=5200,", // запись с телефона
  d1: "rubberband=pitch=1.05,highpass=f=180,lowpass=f=5200,",
  t1: "aecho=0.8:0.5:24:0.06,",
};
const data = {};
mkdirSync(join(PUB, EP, "audio"), { recursive: true });
for (const id of LINES) {
  const src = join(PUB, EP, "voice", `${id}.mp3`);
  const dst = join(PUB, EP, "audio", `${id}.mp3`);
  ff(["-i", src, "-af", `${FX[id] ?? ""}loudnorm=I=-14.5:TP=-1.5:LRA=7`, "-ar", "44100", "-b:a", "192k", dst]);
  const words = cleanWords(JSON.parse(readFileSync(join(PUB, EP, "voice", `${id}.words.json`), "utf8")));
  data[id] = { file: `${EP}/audio/${id}.mp3`, duration: +duration(dst).toFixed(3), words };
  console.log(`voice ${id}  ${data[id].duration.toFixed(2)} s  ${words.length} words`);
}

const LEVEL = {
  "t-musicbox": -29,
  "t-night": -31,
  "t-morning": -30,
  "t-breath": -24,
  "t-wind": -27,
  "t-bell": -19,
  "t-sting": -18,
  "t-steps": -20,
  "t-static": -24,
};
const sfx = {};
mkdirSync(join(PUB, EP, "sfx-n"), { recursive: true });
for (const id of ["t-bell", "t-musicbox", "t-night", "t-chalk", "t-steps", "t-lock", "t-handle", "t-creak", "t-click", "t-flicker", "t-static", "t-run", "t-breath", "t-morning", "t-sting", "t-wind"]) {
  const src = join(PUB, EP, "sfx", `${id}.mp3`);
  if (!existsSync(src)) {
    console.log(`skip ${id}`);
    continue;
  }
  const dst = join(PUB, EP, "sfx-n", `${id}.mp3`);
  ff(["-i", src, "-af", `loudnorm=I=${LEVEL[id] ?? -22}:TP=-3:LRA=11`, "-ar", "44100", "-b:a", "160k", dst]);
  sfx[id] = { file: `${EP}/sfx-n/${id}.mp3`, duration: +duration(dst).toFixed(3) };
}
// моменты шагов (для пыли с потолка) — начала звуков после тишины
{
  const r = spawnSync("ffmpeg", ["-i", join(PUB, EP, "sfx-n", "t-steps.mp3"), "-af", "silencedetect=n=-38dB:d=0.12", "-f", "null", "-"], { encoding: "utf8" });
  const ends = [...r.stderr.matchAll(/silence_end: ([0-9.]+)/g)].map((m) => +(+m[1]).toFixed(2));
  sfx["t-steps"].hits = ends;
  console.log(`steps hits: ${ends.join(", ")}`);
}
console.log(`sfx: ${Object.keys(sfx).length}`);
data._sfx = sfx;
mkdirSync(join(ROOT, "src", EP), { recursive: true });
writeFileSync(join(ROOT, "src", EP, "audio-data.json"), JSON.stringify(data, null, 1));
console.log(`→ src/${EP}/audio-data.json`);
