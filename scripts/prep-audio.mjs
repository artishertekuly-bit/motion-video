#!/usr/bin/env node
// Готовит звук ролика «Құпия сөз»: обработка голосов (скорость диктора, «телефонный» фильтр для дипфейка),
// гудки вызова, громкость по кадрам (RMS, 30 к/с) и тайминги слов → src/deepfake/audio-data.json
//   node scripts/prep-audio.mjs
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const VOICE = join(PUB, "deepfake", "voice");
const SFX = join(PUB, "deepfake", "sfx");
const OUT = join(PUB, "deepfake", "audio");
mkdirSync(OUT, { recursive: true });

const FPS = 30;
const NARR_SPEED = 1.1;
const PHONE = "highpass=f=320,lowpass=f=3600,volume=1.25";
const ROOM = "aecho=0.8:0.5:28:0.08";

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "buffer", maxBuffer: 512 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
};
const duration = (file) =>
  +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout.trim();

const rmsOf = (file) => {
  const pcm = ff(["-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]);
  const n = pcm.length / 2;
  const per = 16000 / FPS;
  const out = [];
  for (let s = 0; s < n; s += per) {
    let acc = 0;
    let c = 0;
    for (let i = Math.floor(s); i < Math.min(n, Math.floor(s + per)); i++) {
      const v = pcm.readInt16LE(i * 2) / 32768;
      acc += v * v;
      c++;
    }
    out.push(+Math.sqrt(acc / Math.max(1, c)).toFixed(4));
  }
  return out;
};

const readWords = (id) => {
  const p = join(VOICE, `${id}.words.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")).filter((w) => !w.word.startsWith("["));
};

// Тексты-заглушки для реплик мамы, пока голос не выбран (оценка длительности)
const PLACEHOLDER = {
  m2: { text: "Тез мына нөмірге ақша сал! Болмаса — СМС-кодты жібер!", dur: 3.6 },
  m3: { text: "Балам, мен келдім!", dur: 1.7 },
  m4: { text: "Қазір гүлге уақыт жоқ! Ақшаны жібер!", dur: 2.8 },
};

const data = {};
const add = (id, file, words) => {
  const dur = duration(file);
  data[id] = { file: `deepfake/audio/${id}.mp3`, duration: +dur.toFixed(3), words: words ?? [], rms: rmsOf(file) };
  console.log(`✓ ${id.padEnd(5)} ${dur.toFixed(2)} s  ${words ? words.length + " words" : ""}`);
};

// Диктор: ускорение 1.1 (тон сохраняется)
for (let i = 1; i <= 10; i++) {
  const id = `n${i}`;
  const out = join(OUT, `${id}.mp3`);
  ff(["-i", join(VOICE, `${id}.mp3`), "-filter:a", `atempo=${NARR_SPEED}`, "-b:a", "160k", out]);
  const words = readWords(id).map((w) => ({ word: w.word, start: +(w.start / NARR_SPEED).toFixed(3), end: +(w.end / NARR_SPEED).toFixed(3) }));
  add(id, out, words);
}

// Мама: m1, m2, m4 — дипфейк (телефонный фильтр); m3 — настоящая мама (чистый голос, комната)
for (const id of ["m1", "m2", "m3", "m4"]) {
  const src = join(VOICE, `${id}.mp3`);
  if (!existsSync(src)) {
    const ph = PLACEHOLDER[id];
    const toks = ph.text.split(/\s+/);
    data[id] = {
      file: null,
      duration: ph.dur,
      words: toks.map((w, k) => ({ word: w, start: +((k / toks.length) * ph.dur).toFixed(3), end: +(((k + 0.9) / toks.length) * ph.dur).toFixed(3) })),
      rms: Array.from({ length: Math.ceil(ph.dur * FPS) }, (_, k) => +(0.08 + 0.06 * Math.abs(Math.sin(k * 0.7))).toFixed(4)),
      placeholder: true,
    };
    console.log(`… ${id.padEnd(5)} placeholder ${ph.dur} s`);
    continue;
  }
  const out = join(OUT, `${id}.mp3`);
  ff(["-i", src, "-filter:a", id === "m3" ? ROOM : PHONE, "-b:a", "160k", out]);
  add(id, out, readWords(id));
}

// Гудки: два длинных (425 Гц) + три тона «абонент недоступен»
{
  const out = join(OUT, "ring.mp3");
  const beep = (f, d) => `sine=f=${f}:d=${d}:sample_rate=44100`;
  ff([
    "-f", "lavfi", "-i", beep(425, 0.8),
    "-f", "lavfi", "-i", beep(425, 0.8),
    "-f", "lavfi", "-i", beep(950, 0.28),
    "-f", "lavfi", "-i", beep(1400, 0.28),
    "-f", "lavfi", "-i", beep(1800, 0.36),
    "-filter_complex",
    [
      "[0]afade=t=in:d=0.02,afade=t=out:st=0.76:d=0.04,volume=0.35,adelay=0|0[a]",
      "[1]afade=t=in:d=0.02,afade=t=out:st=0.76:d=0.04,volume=0.35,adelay=1400|1400[b]",
      "[2]afade=t=out:st=0.25:d=0.03,volume=0.25,adelay=2700|2700[c]",
      "[3]afade=t=out:st=0.25:d=0.03,volume=0.25,adelay=2990|2990[d]",
      "[4]afade=t=out:st=0.3:d=0.06,volume=0.25,adelay=3280|3280[e]",
      "[a][b][c][d][e]amix=inputs=5:normalize=0,apad=pad_dur=0.2,lowpass=f=3400",
    ].join(";"),
    "-ac", "2", "-b:a", "160k", out,
  ]);
  add("ring", out, null);
}

// Звуки, по которым строится монтаж
for (const id of ["key", "door"]) {
  const out = join(OUT, `${id}.mp3`);
  ff(["-i", join(SFX, `sfx-${id}.mp3`), "-c", "copy", out]);
  add(id, out, null);
}

writeFileSync(join(ROOT, "src", "deepfake", "audio-data.json"), JSON.stringify(data));
console.log("→ src/deepfake/audio-data.json");
