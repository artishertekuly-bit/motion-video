#!/usr/bin/env node
// Облачный рендер: push → gh workflow run → gh run watch → gh run download.
// Ноутбук ничего не рендерит, только ждёт и скачивает результат.
//
//   node scripts/cloud-render.mjs video  <Comp> --name test-v1 [--frames 0-149] [--scale 0.5] [--concurrency 2]
//   node scripts/cloud-render.mjs stills <Comp> --name keys-v1 --frames 15,45,90 [--scale 0.5]
//   node scripts/cloud-render.mjs final  <Comp> --name rolik-v1 [--no-phone]
//
// Черновики и листы кадров → out/ проекта, готовые MP4 режима final → Motion/final/.
// Существующие файлы не перезаписываются: к имени добавляется id запуска.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "out");
const FINAL_DIR = process.env.MOTION_FINAL_DIR || resolve(ROOT, "..", "..", "final");
const WORKFLOW = "render.yml";

const die = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

// ---------- аргументы ----------
const [mode, comp, ...rest] = process.argv.slice(2);
if (!["video", "stills", "final"].includes(mode) || !comp) {
  die("Usage: node scripts/cloud-render.mjs <video|stills|final> <Composition> --name <name> [--frames ..] [--scale ..] [--concurrency ..] [--gl ..] [--no-phone]");
}
const opts = { frames: "", scale: "1", concurrency: "", gl: "swangle", phone: true, name: "", allowDirty: false };
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a === "--no-phone") opts.phone = false;
  else if (a === "--allow-dirty") opts.allowDirty = true; // other sessions share this checkout: render the pushed HEAD anyway
  else if (a.startsWith("--") && ["frames", "scale", "concurrency", "gl", "name"].includes(a.slice(2))) opts[a.slice(2)] = rest[++i] ?? "";
  else die(`Unknown argument: ${a}`);
}
if (!/^[A-Za-z0-9._-]+$/.test(opts.name)) die("--name is required (letters, digits, . _ -), e.g. --name test-v1");
if (mode === "stills" && !/^\d+(,\d+)*$/.test(opts.frames)) die("stills need --frames like 15,45,90");
if (mode !== "stills" && opts.frames && !/^\d+-\d+$/.test(opts.frames)) die("--frames for video must look like 0-149");

// ---------- инструменты ----------
const findGh = () => {
  for (const c of ["gh", "C:\\Program Files\\GitHub CLI\\gh.exe"]) {
    if (spawnSync(c, ["--version"], { encoding: "utf8" }).status === 0) return c;
  }
  die("GitHub CLI (gh) not found");
};
const GH = findGh();

const run = (cmd, args, { allowFail = false, stdio } = {}) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) die(`${basename(cmd)} ${args.join(" ")}\n${(r.stderr || r.stdout || "").trim()}`);
  return r;
};
const git = (...args) => run("git", args).stdout.trim();
const gh = (...args) => run(GH, args).stdout.trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 1. код на GitHub совпадает с локальным ----------
const dirty = git("status", "--porcelain", "--untracked-files=no"); // other sessions' new files do not change what is pushed
if (dirty && opts.allowDirty) console.log(`! --allow-dirty: rendering the pushed HEAD; local changes are ignored:
${dirty}`);
else if (dirty) die(`Uncommitted changes — commit them first, the server renders what is pushed:\n${dirty}`);
const branch = git("rev-parse", "--abbrev-ref", "HEAD");
const upstream = run("git", ["rev-parse", "--abbrev-ref", "@{u}"], { allowFail: true });
if (upstream.status !== 0) die(`Branch ${branch} has no upstream on GitHub (git push -u origin ${branch})`);
if (Number(git("rev-list", "--count", "@{u}..HEAD")) > 0) {
  console.log(`→ git push (${branch})`);
  run("git", ["push", "--quiet"]);
}
const sha = git("rev-parse", "--short", "HEAD");

// ---------- 2. запуск ----------
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
const rid = `${stamp}-${Math.random().toString(36).slice(2, 6)}`;
const fields = {
  request_id: rid, mode, composition: comp, frames: opts.frames, scale: opts.scale,
  name: opts.name, phone_copy: String(opts.phone), concurrency: opts.concurrency, gl: opts.gl,
};
console.log(`→ gh workflow run ${WORKFLOW}  [${mode} ${comp} ${opts.name}${opts.frames ? " frames " + opts.frames : ""} scale ${opts.scale}] @ ${sha}`);
gh("workflow", "run", WORKFLOW, "--ref", branch, ...Object.entries(fields).flatMap(([k, v]) => ["-f", `${k}=${v}`]));

let runInfo;
for (let t = 0; t < 40 && !runInfo; t++) {
  await sleep(3000);
  const list = JSON.parse(gh("run", "list", "--workflow", WORKFLOW, "--limit", "20", "--json", "databaseId,displayTitle,url"));
  runInfo = list.find((r) => r.displayTitle.includes(rid));
}
if (!runInfo) die(`Run ${rid} did not appear on GitHub within 2 minutes`);
console.log(`→ run ${runInfo.databaseId}: ${runInfo.url}`);

// ---------- 3. ожидание ----------
mkdirSync(join(OUT_DIR, "logs"), { recursive: true });
const t0 = Date.now();
const watch = run(GH, ["run", "watch", String(runInfo.databaseId), "--exit-status", "--compact", "--interval", "20"], { allowFail: true });
writeFileSync(join(OUT_DIR, "logs", `${rid}-watch.log`), (watch.stdout || "") + (watch.stderr || ""));
const minutes = ((Date.now() - t0) / 60000).toFixed(1);
if (watch.status !== 0) {
  const log = run(GH, ["run", "view", String(runInfo.databaseId), "--log-failed"], { allowFail: true }).stdout || "";
  writeFileSync(join(OUT_DIR, "logs", `${rid}-failed.log`), log);
  console.error(log.split("\n").slice(-60).join("\n"));
  die(`Render failed after ${minutes} min: ${runInfo.url}`);
}
console.log(`✓ render finished in ${minutes} min`);

// ---------- 4. скачивание ----------
const tmp = join(OUT_DIR, `.dl-${rid}`);
gh("run", "download", String(runInfo.databaseId), "-n", `render-${rid}`, "-D", tmp);

const saved = [];
for (const f of readdirSync(tmp)) {
  const toFinal = mode === "final" && extname(f) === ".mp4";
  const dir = toFinal ? FINAL_DIR : OUT_DIR;
  mkdirSync(dir, { recursive: true });
  let dest = join(dir, f);
  if (existsSync(dest)) dest = join(dir, `${basename(f, extname(f))}-${rid}${extname(f)}`);
  renameSync(join(tmp, f), dest);
  saved.push(dest);
}
rmSync(tmp, { recursive: true, force: true });

console.log("✓ downloaded:");
for (const p of saved) console.log(`   ${p}  (${(statSync(p).size / 1024 / 1024).toFixed(2)} MB)`);
