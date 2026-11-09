#!/usr/bin/env node
// «30 КҮН: ЕРАСЫЛ ҰБТ-ға», 2-күн (3D): голос (рассказчик ×1.08, как в TikTok-сериалах) → −14,5 LUFS,
// тайминги слов без тегов (с учётом ускорения), эффекты → src/ubt/audio-data.json
//   node scripts/prep-ubt2.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const EP = "ubt2";
const OUT = join(ROOT, "src", "videos", "ubt2", "audio-data.json");
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

const LINES = ["n1", "n2b", "n3b", "n3", "n4", "n5", "n6", "n7", "n8", "a1", "e1", "l1", "n9", "a2", "n10", "a3", "e2", "n11b", "n12b"];
// кітапханашы: Lily (анасының дауысы) — сәл төмен әрі баяу, анасына ұқсамасын
const PITCH = { l1: 0.93 };
const data = {};
mkdirSync(join(PUB, EP, "audio"), { recursive: true });
for (const id of LINES) {
  const src = join(PUB, EP, "voice", `${id}.mp3`);
  const dst = join(PUB, EP, "audio", `${id}.mp3`);
  const pr = PITCH[id] ?? 1;
  const sp = id.startsWith("n") ? NARR_SPEED : pr !== 1 ? 1.04 : 1;
  const k = pr * sp; // итоговая скорость (тайминги делятся на неё)
  const af = `${pr !== 1 ? `asetrate=44100*${pr},aresample=44100,` : ""}${sp !== 1 ? `atempo=${sp},` : ""}loudnorm=I=-14.5:TP=-1.5:LRA=7`;
  ff(["-i", src, "-af", af, "-ar", "44100", "-b:a", "192k", dst]);
  const words = cleanWords(JSON.parse(readFileSync(join(PUB, EP, "voice", `${id}.words.json`), "utf8"))).map((w) => ({
    word: w.word,
    start: +(w.start / k).toFixed(3),
    end: +(w.end / k).toFixed(3),
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
  "s-stamp": "deepfake/sfx/sfx-stamp.mp3",
  "s-notify": "deepfake/sfx/sfx-notify.mp3",
  "s-typing": "deepfake/sfx/sfx-typing.mp3",
  "s-whoosh": "qagaz/sfx/q-whoosh.mp3",
  "s-door": "qagaz/sfx/q-door-close.mp3",
  "s-steps": "qagaz/sfx/q-steps-calm.mp3",
  "s-paper": "qagaz/sfx/q-gather.mp3",
  "u-slam": "ubt1/sfx/u-slam.mp3",
  "u-creak": "ubt1/sfx/u-creak.mp3",
  "v-freezer": `${EP}/sfx/v-freezer.mp3`,
  "v-squeak": `${EP}/sfx/v-squeak.mp3`,
  "v-thud": `${EP}/sfx/v-thud.mp3`,
  "v-sparkle": `${EP}/sfx/v-sparkle.mp3`,
  "v-alarm": `${EP}/sfx/v-alarm.mp3`,
};
const LEVEL = { "s-music": -28, "s-tick": -27 };
const sfx = {};
mkdirSync(join(PUB, EP, "sfx-n"), { recursive: true });
for (const [id, rel] of Object.entries(SRC)) {
  const src = join(PUB, rel);
  if (!existsSync(src)) {
    console.log(`skip ${id}`);
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
