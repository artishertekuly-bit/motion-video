// «30 КҮН» 7-күн: voice timing -> shot bounds (seconds and frames).
import raw from "./audio-data.json";

export const FPS = 30;
export type Word = { word: string; start: number; end: number };
type Cue = { file: string; duration: number; words: Word[] };
export const AUDIO = raw as unknown as Record<string, Cue>;
export const sec = (s: number) => Math.round(s * FPS);

const S: Record<string, number> = {};
const B: Record<string, number> = {};
const end = (id: string) => S[id] + AUDIO[id].duration;
const w0 = (id: string, i: number) => S[id] + (AUDIO[id].words[i]?.start ?? 0);

S.n1 = 0.3;
B.sh01 = 0; // «24» күнтізбе хук, ҰБТ-ға 24 күн
S.e1 = end("n1") + 0.25;
B.sh02 = S.e1 - 0.1; // Сынып: Ерасыл қателерін талдап болды
S.a1 = end("e1") + 0.2;
B.sh03 = S.a1 - 0.1; // Аружан тексерді: «Тура сексен екі балл! Өз рекордың!»
S.n2 = end("a1") + 0.2;
B.sh04 = S.n2 - 0.1; // Ерасыл қуанады: БАЛЛ 78 -> 82 (+4 балл)
S.a2 = end("n2") + 0.25;
B.sh05 = S.a2 - 0.1; // Аружан: «Мұз айдынына барып серуендейік!»
S.e2 = end("a2") + 0.2;
B.sh06 = S.e2 - 0.1; // Ерасыл: «Мұз айдыны?! Конькиде маған тең келер ешкім жоқ!»
S.n3 = end("e2") + 0.3;
B.sh07 = S.n3 - 0.1; // Тау баурайындағы мұз айдыны (Медеу стилінде)
S.a3 = end("n3") + 0.2;
B.sh08 = S.a3 - 0.1; // Аружан шебер сырғанайды: «Қандай керемет!»
S.e3 = end("a3") + 0.2;
B.sh09 = S.e3 - 0.1; // Ерасыл мұзға шықты: «Қазір саған физика заңын көрсетемін!»
S.e4 = end("e3") + 0.15;
B.sh10 = S.e4 - 0.08; // Ерасыл секірді: «Үйкеліс күші... инерция... секірууу!»
S.n4 = end("e4") + 0.2;
B.sh11 = S.n4 - 0.1; // ДИНАМИКАЛЫҚ ҚҰЛАУ (тайып күмп етеді)
S.e5 = end("n4") + 0.2;
B.sh12 = S.e5 - 0.1; // Ерасыл мұзда жатыр: «Үйкеліс коэффициенті нөлге тең екен...»
S.a4 = end("e5") + 0.25;
B.sh13 = S.a4 - 0.1; // Аружан күлкіден қатып тұр: «Құлаудың үшінші заңы ма?!»
S.n5 = end("a4") + 0.25;
B.sh14 = S.n5 - 0.1; // Аружан қолын созады: жылы романтикалық сезім
S.e6 = end("n5") + 0.2;
B.sh15 = S.e6 - 0.1; // Ерасыл тұрып: «Есеп шығарған сырғанаудан оңай екен...»
S.a5 = end("e6") + 0.2;
B.sh16 = S.a5 - 0.1; // Аружан: «Кел, бірге сырғанаймыз, құламайсың!»
S.n6 = end("a5") + 0.25;
B.sh17 = S.n6 - 0.1; // Екеуі қол ұстасып сырғанап кетеді
S.n7 = end("n6") + 0.35;
B.sh18 = S.n7 - 0.15; // Нәтиже экраны (VsScreen): АРУЖАН ⛸️ vs ЕРАСЫЛ 82 БАЛЛ ❄️
S.n8 = end("n7") + 0.4;
B.sh19 = S.n8 - 0.15; // Дауыс беру карточкасы: «8-КҮН: ДҮЙСЕНБІДЕ ЕРАСЫЛ НЕ ІСТЕЙДІ?»
const END = end("n8") + 2.0;

export const START = S;
export const BOUND = B;
export const TOTAL = sec(END);
export const cs = (id: string) => sec(S[id]);
export const ws = (id: string, i: number) => sec(w0(id, i));
export const we = (id: string, i: number) => sec(S[id] + (AUDIO[id]?.words[i]?.end ?? 0));

export const ORDER = Array.from({ length: 19 }, (_, i) => `sh${String(i + 1).padStart(2, "0")}`);
export type ShotB = { key: string; a: number; b: number };
export const BOUNDS: ShotB[] = ORDER.map((k, i) => ({
  key: k,
  a: sec(B[k]),
  b: i + 1 < ORDER.length ? sec(B[ORDER[i + 1]]) : sec(END),
}));
export const CUTS = BOUNDS.map((s) => s.a).filter((f) => f > 0);
export const shotStart = (k: string) => sec(B[k]);
/** 3D stops here: the results screen and the comment card are DOM only */
export const CARD_AT = sec(B.sh18);

/** is someone speaking line `id` at frame f */
export const talking = (id: string, f: number) => {
  if (!AUDIO[id]) return false;
  const t = f / FPS - S[id];
  for (const w of AUDIO[id].words) {
    if (t >= w.start - 0.02 && t < w.end) return Math.sin((t - w.start) * 2 * Math.PI * 3.6) > -0.2;
  }
  return false;
};
