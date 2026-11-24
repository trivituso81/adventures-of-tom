import json
import re
from pathlib import Path

ANTI_RING_NEG = "glowing ring, neon halo, aura outline, rim glow, muted desaturated sketch, photorealistic 3D, 16-bit, 32-bit, 8-bit, pixel art, retro, sprite, SNES, Final Fantasy, hurt, knocked out"

def load_manifest(path="art-factory/characters.json"):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def get_character(manifest, char_id):
    for c in manifest["cast"]:
        if c["id"] == char_id:
            return c
    raise ValueError(f"Unknown character_id: {char_id}")

def sanitize_prompt(text, banned_words):
    cleaned = text
    for w in banned_words:
        cleaned = re.sub(re.escape(w), "", cleaned, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", cleaned).strip()

def build_prompt(stage, char, cfg, move_id="", feedback="", extra_hint=""):
    lo, hi = [int(round(x * 100)) for x in char["head_ratio"]]
    base = f"{char['name']} ({char['height_in']} inches tall, head-to-body ratio {lo}%-{hi}%). {char.get('notes', '')} {cfg['style_lock']}"
    if stage == "hero":
        p = (
            f"Paint {base} Translate only the key facial features, hair, and age from the subject photo into the EXACT painted art style of the game style reference. "
            f"Keep the exact bold dark contour lines, chunky brushed shading in clear tones, warm golden top-left lighting, vibrant color saturation, and large gentle simplified eyes of the style reference. "
            f"Use the outfit described above rather than copying casual clothes from the subject photo unless no outfit is specified. "
            f"Pose: full body from top of hair to sturdy shoes with full head visible and unclipped, standing ready facing the viewer, arms loose, both feet on the ground. "
            f"Single character alone on a flat {cfg['bg_hex']} mid-grey studio background with zero glowing halo or rim ring."
        )
    elif stage == "turnaround":
        p = f"4K 4-view orthographic turnaround sheet (front, left profile, back, right profile) of {base} Identical outfit, exact shared baseline, bold dark contour lines and chunky brushed shading matching the style reference, flat {cfg['bg_hex']} background."
    elif stage == "sheets":
        moods = ", ".join(cfg["moods"])
        poses = ", ".join(cfg["talking_poses"])
        p = f"4K character animation sheet for {base} Row 1: 8-frame side walk cycle. Row 2: 8 expression portraits ({moods}). Row 3: 4 talking poses ({poses}). Bold dark contour lines and chunky brushed shading matching the style reference, flat {cfg['bg_hex']} background."
    elif stage == "battle_idle":
        p = (
            f"Silent 2D RPG battle idle loop of {char['name']}. "
            f"Keep the exact starting facial expression and smile completely consistent from start to finish: mouth stays closed and relaxed, no sighing, no pursing lips, no deep inhale, no speaking. "
            f"Complete only one single slow, calm, barely perceptible breath across the entire 5 seconds: very slight chest and shoulder rise over the first 2.5 seconds, then gently settling back to the exact starting pose over the remaining 2.5 seconds. "
            f"One quick, natural eye blink once near the midpoint. "
            f"Both feet stay firmly planted on the ground with a relaxed posture and static locked camera for a seamless loop. {cfg['style_lock']}"
        )
    else:
        pitch_note = f" Move ID: {move_id}." if move_id else ""
        p = f"Expressive turn-based battle animation for {char['name']}.{pitch_note} {cfg['style_lock']} Clean silhouette, no glowing rings or aura halo."
    if feedback:
        p = f"{p} Director notes: {feedback}"
    if extra_hint:
        p = f"{p} Fix required: {extra_hint}"
    return sanitize_prompt(p, cfg["banned_words"])

def describe_child_geometry(genai_client, photo_path, flash_model):
    from PIL import Image
    prompt = (
        "Describe only artistic illustration geometry from this reference photo for a storybook painter: "
        "approximate age group, hair silhouette and color, eye and brow proportions, clothing colors and textures, "
        "and signature plush prop. Avoid personal identity details."
    )
    img = Image.open(photo_path)
    resp = genai_client.models.generate_content(model=flash_model, contents=[prompt, img])
    return (resp.text or "").strip()
