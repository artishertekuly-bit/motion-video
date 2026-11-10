#!/usr/bin/env node
// «Барыс ағай» 3-сабақ: «Кім кімнен озады? (Абай. 18-қара сөз)» (3D):
// Голос (диктор ×1.12, кейіпкерлер ×1.07, Нұрлыбек pitch 1.1) → −14.5 LUFS,
// тайминги слов, SFX → src/videos/mg3/audio-data.json
//   node scripts/prep-mg3.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const EP = "mg3";
const OUT = join(ROOT, "src", "videos", "mg3", "audio-data.json");
const NARR_SPEED = 1.12;
const CHAR_SPEED = 1.07;
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
  "n1", "u1", "n2", "t1", "u2", "t2", "t3", "t4", "t5",
  "n3", "t6", "n4", "n5", "t7", "t8", "n6", "u3", "t9", "n7"
];
// Нұрлыбек (u1, u2, u3) = күлдіргі бала (pitch 1.1)
const PITCH = { u1: 1.1, u2: 1.1, u3: 1.1 };
const data = {};
mkdirSync(join(PUB, EP, "audio"), { recursive: true });
for (const id of LINES) {
  const src = join(PUB, EP, "voice", `${id}.mp3`);
  const dst = join(PUB, EP, "audio", `${id}.mp3`);
  const pr = PITCH[id] ?? 1;
  const sp = id.startsWith("n") ? NARR_SPEED : pr !== 1 ? 1.05 : CHAR_SPEED;
  const k = pr * sp; // қорытынды жылдамдық коэффициенті
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
  "s-whoosh": "qagaz/sfx/q-whoosh.mp3",
  "v-sparkle": "ubt2/sfx/v-sparkle.mp3",
  "w-correct": "ubt3/sfx/w-correct.mp3",
  "x-chalk": "mg1/sfx/x-chalk.mp3",
  "x-ooh": "mg1/sfx/x-ooh.mp3",
  "x-laugh": "mg1/sfx/x-laugh.mp3",
  "x-tap": "mg1/sfx/x-tap.mp3",
  "x-bell": "mg1/sfx/x-bell.mp3",
  "x-scribble": "mg1/sfx/x-scribble.mp3",
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
