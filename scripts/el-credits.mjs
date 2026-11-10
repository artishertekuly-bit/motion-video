#!/usr/bin/env node
// ElevenLabs: how many credits are used / left this month (the key is never printed).
//   node scripts/el-credits.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = readFileSync(resolve(ROOT, "..", "..", ".env"), "utf8").match(/ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)/)?.[1];
const j = await (await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": KEY } })).json();
console.log(`${j.tier}: used ${j.character_count} / ${j.character_limit}, left ${j.character_limit - j.character_count}, reset ${new Date(j.next_character_count_reset_unix * 1000).toISOString().slice(0, 10)}`);
