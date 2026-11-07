import raw from "./audio-data.json";

export const FPS = 30;

export type Word = { word: string; start: number; end: number };
type Cue = { file: string | null; duration: number; words: Word[]; rms: number[]; placeholder?: boolean };
export const AUDIO = raw as unknown as Record<string, Cue>;

// ---------- монтаж: когда звучит каждая реплика (секунды) ----------
const S: Record<string, number> = {};
let t = 0;
const put = (id: string, pre: number) => {
  S[id] = t + pre;
  t = S[id] + AUDIO[id].duration;
};

put("m1", 0.3); // S1 — крючок: «Балам!…»
put("n1", 0.45); // S2 — 21:30, дома одна/один, голос мамы 100%
put("m2", 0.5); // S3 — «Тез ақша сал!…»
put("n2", 0.25);
put("n3", 0.45); // S4 — главная ошибка
put("n4", 0.45); // S5 — правильный шаг
put("ring", 0.15);
put("n5", 0.1);
put("n6", 0.45); // S6 — вопрос + ключ
t += 0.9; // «…жазып жатыр…» — тишина
put("key", 0);
S.n7 = S.key + 0.75; // шёпот поверх звука ключа
t = Math.max(t, S.n7 + AUDIO.n7.duration);
put("door", 0.1); // S7 — мама входит
S.m3 = S.door + 0.85;
t = S.m3 + AUDIO.m3.duration;
put("n8", 0.3);
put("m4", 0.3);
put("n9", 0.55); // S8 — вывод и вопрос
put("n10", 0.4);
const END_CARD = t + 0.45;
export const TOTAL_SEC = END_CARD + 3.0;

export const START = S;
export const sec = (s: number) => Math.round(s * FPS);
export const DURATION = sec(TOTAL_SEC);

/** Кадр начала реплики */
export const cs = (id: string) => sec(S[id]);
/** Кадр конца реплики */
export const ce = (id: string) => sec(S[id] + AUDIO[id].duration);
/** Кадр начала слова i реплики id */
export const ws = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].start);
/** Кадр конца слова i реплики id */
export const we = (id: string, i: number) => sec(S[id] + AUDIO[id].words[i].end);
/** Громкость реплики в кадре f (0…1, нормировано по максимуму реплики) */
export const rmsAt = (id: string, f: number) => {
  const c = AUDIO[id];
  const k = f - cs(id);
  if (k < 0 || k >= c.rms.length) return 0;
  const max = Math.max(...c.rms, 0.0001);
  return c.rms[k] / max;
};

// ---------- сцены: [начало, конец) в кадрах ----------
export const SCENES = {
  s1: [0, sec(S.n1 - 0.15)],
  s2: [sec(S.n1 - 0.15), sec(S.m2 - 0.3)],
  s3: [sec(S.m2 - 0.3), sec(S.n3 - 0.15)],
  s4: [sec(S.n3 - 0.15), sec(S.n4 - 0.15)],
  s5: [sec(S.n4 - 0.15), sec(S.n6 - 0.2)],
  s6: [sec(S.n6 - 0.2), sec(S.door + 0.1)],
  s7: [sec(S.door + 0.1), sec(S.n9 - 0.2)],
  s8: [sec(S.n9 - 0.2), sec(TOTAL_SEC)],
} as const;
export type SceneId = keyof typeof SCENES;
export const END_CARD_F = sec(END_CARD);
export const CUTS = Object.values(SCENES)
  .map((s) => s[0])
  .filter((x) => x > 0);
