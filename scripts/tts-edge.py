import asyncio
import json
import os
import re
import sys
import subprocess
import edge_tts

# python scripts/tts-edge.py <dialog.json> <outDir>
def clean_token(s):
    return re.sub(r'^[^\w]+|[^\w]+$', '', s)

async def generate_segment(s, out_dir):
    seg_id = s["id"]
    text = s["text"]
    out_mp3 = os.path.join(out_dir, f"{seg_id}.mp3")
    out_words = os.path.join(out_dir, f"{seg_id}.words.json")

    # Determine voice and prosody
    # 'u' is student (Nurlybek) -> pitch +35Hz, rate +16%
    # 't' / 'n' is teacher (Barys agai) -> pitch +0Hz, rate +8%
    is_student = seg_id.startswith("u")
    voice = "kk-KZ-DauletNeural"
    pitch = "+32Hz" if is_student else "+0Hz"
    rate = "+16%" if is_student else "+8%"

    comm = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)
    audio_chunks = []
    boundaries = []

    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            boundaries.append(chunk)

    with open(out_mp3, "wb") as f:
        f.write(b"".join(audio_chunks))

    # Calculate word timestamps
    # Get total actual duration from ffprobe
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out_mp3],
        capture_output=True, text=True
    )
    total_dur = float(r.stdout.strip()) if r.stdout.strip() else 0.0

    all_words = []
    if boundaries:
        for b in boundaries:
            s_offset = b["offset"] / 10_000_000.0
            s_dur = b["duration"] / 10_000_000.0
            s_text = b["text"].strip()
            tokens = s_text.split()
            if not tokens:
                continue

            weights = [max(1, len(clean_token(t))) for t in tokens]
            tot_w = sum(weights)

            cur_t = s_offset
            for tok, w in zip(tokens, weights):
                tok_dur = s_dur * (w / tot_w)
                # Word end is slightly before next word start for clean speech gap
                w_start = round(cur_t, 3)
                w_end = round(cur_t + tok_dur * 0.94, 3)
                all_words.append({
                    "word": tok,
                    "start": w_start,
                    "end": min(w_end, round(cur_t + tok_dur, 3))
                })
                cur_t += tok_dur
    else:
        # Fallback if no boundaries
        tokens = text.split()
        weights = [max(1, len(clean_token(t))) for t in tokens]
        tot_w = sum(weights)
        cur_t = 0.05
        speech_dur = max(0.1, total_dur - 0.1)
        for tok, w in zip(tokens, weights):
            tok_dur = speech_dur * (w / tot_w)
            w_start = round(cur_t, 3)
            w_end = round(cur_t + tok_dur * 0.94, 3)
            all_words.append({
                "word": tok,
                "start": w_start,
                "end": round(cur_t + tok_dur, 3)
            })
            cur_t += tok_dur

    with open(out_words, "w", encoding="utf-8") as f:
        json.dump(all_words, f, ensure_ascii=False, indent=2)

    print(f"✓ {seg_id}: {total_dur:.2f}s, {len(all_words)} words -> {out_mp3}")

async def main():
    if len(sys.argv) < 3:
        print("Usage: python tts-edge.py <dialog.json> <outDir>")
        sys.exit(1)

    dialog_file = sys.argv[1]
    out_dir = sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)

    with open(dialog_file, "r", encoding="utf-8") as f:
        segments = json.load(f)

    for s in segments:
        await generate_segment(s, out_dir)

if __name__ == "__main__":
    asyncio.run(main())
