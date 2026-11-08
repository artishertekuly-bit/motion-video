#!/usr/bin/env node
// «Шпаргалка»: голос → −14,5 LUFS, тайминги слов без тегов, эффекты → src/shpor/audio-data.json
//   node scripts/prep-shpor.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
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

const data = {};
mkdirSync(join(PUB, "shpor", "audio"), { recursive: true });
for (const id of ["n1", "n2", "n3", "t1", "n4", "b1", "n5", "b2", "n6", "t2", "n7"]) {
  const src = join(PUB, "shpor", "voice", `${id}.mp3`);
  const dst = join(PUB, "shpor", "audio", `${id}.mp3`);
  ff(["-i", src, "-af", "loudnorm=I=-14.5:TP=-1.5:LRA=7", "-ar", "44100", "-b:a", "192k", dst]);
  const words = cleanWords(JSON.parse(readFileSync(join(PUB, "shpor", "voice", `${id}.words.json`), "utf8")));
  data[id] = { file: `shpor/audio/${id}.mp3`, duration: +duration(dst).toFixed(3), words };
  console.log(`voice ${id}  ${data[id].duration.toFixed(2)} s  ${words.length} words`);
}

// эффекты: свои + из прошлых роликов
const SRC = {
  "s-tick": "shpor/sfx/s-tick.mp3",
  "s-scribble": "shpor/sfx/s-scribble.mp3",
  "s-ping": "shpor/sfx/s-ping.mp3",
  "s-boing": "shpor/sfx/s-boing.mp3",
  "s-pop": "shpor/sfx/s-pop.mp3",
  "s-music": "shpor/sfx/s-music.mp3",
  "s-heart": "deepfake/sfx/sfx-heartbeat.mp3",
  "s-stamp": "deepfake/sfx/sfx-stamp.mp3",
  "s-riser": "deepfake/sfx/sfx-riser.mp3",
  "s-whoosh": "qagaz/sfx/q-whoosh.mp3",
  "s-bell": "qagaz/sfx/q-bell.mp3",
  "s-door": "qagaz/sfx/q-door-close.mp3",
  "s-steps": "qagaz/sfx/q-steps-calm.mp3",
  "s-room": "qagaz/sfx/q-room.mp3",
  "s-paper": "qagaz/sfx/q-gather.mp3",
};
const LEVEL = { "s-music": -28, "s-room": -31, "s-tick": -26, "s-heart": -23 };
const sfx = {};
mkdirSync(join(PUB, "shpor", "sfx-n"), { recursive: true });
for (const [id, rel] of Object.entries(SRC)) {
  const src = join(PUB, rel);
  if (!existsSync(src)) {
    console.log(`skip ${id} (no ${rel})`);
    continue;
  }
  const dst = join(PUB, "shpor", "sfx-n", `${id}.mp3`);
  ff(["-i", src, "-af", `loudnorm=I=${LEVEL[id] ?? -21.5}:TP=-3:LRA=11`, "-ar", "44100", "-b:a", "160k", dst]);
  sfx[id] = { file: `shpor/sfx-n/${id}.mp3`, duration: +duration(dst).toFixed(3) };
}
console.log(`sfx: ${Object.keys(sfx).join(", ")}`);
data._sfx = sfx;
mkdirSync(join(ROOT, "src", "shpor"), { recursive: true });
writeFileSync(join(ROOT, "src", "shpor", "audio-data.json"), JSON.stringify(data, null, 1));
console.log("→ src/shpor/audio-data.json");
