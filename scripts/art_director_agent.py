import json
import re
from pathlib import Path

ANTI_RING_NEG = "glowing ring, neon halo, aura outline, rim glow, spotlight, stage lighting, light beam, light cone, floor glow, lens flare, muted desaturated sketch, photorealistic 3D, 16-bit, 32-bit, 8-bit, pixel art, retro, sprite, SNES, Final Fantasy, hurt, knocked out"
IDLE_NEG = "frozen start, static pause, motionless opening, delayed animation, repeated blinking, double blink, fluttering eyelids, mouth opening, sighing, pursing lips, speaking, camera movement, blur, distort"

BATTLE_MOVE_DRAFT_NEG = (
    "subtle idle breathing, standing still, motionless, waist fidgeting, looking at the camera, gentle passive gesture, small hand gestures, "
    "pulling a prop from a pocket or belt, prop appearing mid-clip, multi-step choreography, walking, stepping backward, backing away, "
    "wandering off-center, camera pan, camera zoom, camera orbit"
)

def battle_move_draft_rules(move):
    """Staging rules every battle_move_draft prompt carries (one Single Exaggerated Leftward Action, planted feet, props from Frame 1).
    No banned words here: sanitize_prompt strips them (sprite, retro, hurt, ...)."""
    props = "the props named above" if move else "the named props"
    return (
        "STAGING RULES. "
        "1) Planted feet and locked camera: grounded on one fixed floor plane, both feet stay planted for the whole clip, only torso lean, weight shift and arm extension move; "
        "no backing up behind the party, no wandering off-center, zero camera pan, zoom or orbit. "
        f"2) Props in hand from frame 1: {props} are already gripped and clearly visible in the very first frame, drawn slightly oversized so they read at small on-screen battle size; "
        "never pulled from a pocket or belt and never appearing mid-clip. "
        "3) One exaggerated leftward action: exactly one bold anticipation, strike and follow-through arc aimed decisively toward screen-left, toward the enemies; "
        "no multi-step choreography, no waist-level fumbling. "
        "4) Silhouette readability: wide arm extension, clear torso turn, readable negative space around the figure when seen about 200 pixels tall. "
        "5) Forbidden: subtle idle breathing, standing still, waist fidgeting, looking at the camera, gentle passive gestures."
    )

PASS1_MOVES_PATH = Path("art-factory/move-packets-pass1.json")
PASS1_START_FRAMES_PATH = Path("art-factory/start-frame-queue-pass1.json")

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

def normalize_backdrop_for_grey(text, bg_hex="#808080"):
    if not text:
        return ""
    out = re.sub(
        r"solid chroma-key green \(#00FF00\) background",
        f"solid {bg_hex} mid-grey studio background",
        text,
        flags=re.IGNORECASE,
    )
    out = re.sub(r"chroma-key green", f"{bg_hex} mid-grey", out, flags=re.IGNORECASE)
    out = re.sub(r"#00FF00", bg_hex, out, flags=re.IGNORECASE)
    return out

def load_all_move_manifests():
    manifests = []
    art_dir = Path("art-factory")
    if not art_dir.exists():
        return manifests
    skip = {"characters.json", "queue.json", "start-frame-queue-pass1.json"}
    candidates = []
    if PASS1_MOVES_PATH.exists():
        candidates.append(PASS1_MOVES_PATH)
    for p in sorted(art_dir.glob("*.json")):
        if p.name in skip or p == PASS1_MOVES_PATH:
            continue
        candidates.append(p)
    for p in candidates:
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            if isinstance(data, dict) and isinstance(data.get("moves"), list):
                manifests.append(data)
        except Exception:
            continue
    return manifests

def resolve_start_frame_path(move_id, queue_path=PASS1_START_FRAMES_PATH):
    if not move_id:
        return None
    qp = Path(queue_path)
    if not qp.exists():
        return None
    try:
        data = json.loads(qp.read_text(encoding="utf-8"))
    except Exception:
        return None
    for kit in data.get("unique_kits", []):
        if move_id in kit.get("used_by_moves", []):
            p = Path(kit.get("start_frame_path", ""))
            if p.exists():
                return p
    for entry in data.get("flagged_moves", []):
        if entry.get("move_id") == move_id:
            p = Path(entry.get("start_frame_path", ""))
            if p.exists():
                return p
    return None

def list_character_move_ids(char_name, include_universal=True):
    move_ids = []
    seen = set()
    target = (char_name or "").strip().lower()
    for data in load_all_move_manifests():
        for m in data.get("moves", []):
            m_char = (m.get("character") or "").strip().lower()
            m_cid = (m.get("character_id") or "").strip().lower()
            is_match = (m_char == target or m_cid == target)
            is_univ = include_universal and (m_char == "universal" or m_cid == "universal")
            if not is_match and not is_univ:
                continue
            mid = m.get("id")
            if mid and mid not in seen and m.get("wanClip"):
                seen.add(mid)
                move_ids.append(mid)
            counter = m.get("reactiveCounterClip")
            if mid and isinstance(counter, dict):
                cid = counter.get("id") or f"{mid}_counter"
                if cid not in seen:
                    seen.add(cid)
                    move_ids.append(cid)
    return move_ids

def lookup_move_clip(move_id):
    if not move_id:
        return None
    is_counter = move_id.endswith("_counter")
    base_id = move_id[:-8] if is_counter else move_id
    for data in load_all_move_manifests():
        for m in data.get("moves", []):
            if m.get("id") == base_id:
                clip = m.get("reactiveCounterClip") if is_counter else m.get("wanClip")
                if clip:
                    return {
                        "move": m,
                        "clip": clip,
                        "defaults": data.get("wanDefaults", {}),
                    }
    return None

def resolve_move_prompts(stage, char, cfg, move_id="", feedback=""):
    bg_hex = cfg.get("bg_hex", "#808080")
    found = lookup_move_clip(move_id)
    if found:
        clip = found["clip"]
        defaults = found["defaults"]
        pos = clip.get("positivePrompt", "")
        pos = normalize_backdrop_for_grey(pos, bg_hex)
        pos = pos.replace("Acting party member (swap per character reference image)", char["name"])
        pos = pos.replace("Single acting character", char["name"])
        if stage == "battle_move_draft":
            pos = f"{pos} {battle_move_draft_rules(found['move'])}"
        if feedback and feedback.strip() and feedback.strip() not in pos:
            clean_fb = normalize_backdrop_for_grey(feedback.strip(), bg_hex)
            pos = f"{pos} Director notes: {clean_fb}"
        pos = sanitize_prompt(pos, cfg["banned_words"])
        neg_base = clip.get("negativePrompt") or defaults.get("negativePrompt") or ""
        neg = f"{neg_base}, {ANTI_RING_NEG}".strip(", ")
        if stage == "battle_move_draft":
            neg = f"{neg}, {BATTLE_MOVE_DRAFT_NEG}"
        return pos, neg
    clean_fb = normalize_backdrop_for_grey(feedback, bg_hex)
    pos = build_prompt(stage, char, cfg, move_id=move_id, feedback=clean_fb)
    if stage == "battle_move_draft":
        return f"{pos} {battle_move_draft_rules(None)}", f"{ANTI_RING_NEG}, {BATTLE_MOVE_DRAFT_NEG}"
    return pos, ANTI_RING_NEG

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
            f"Seamless 2D RPG battle idle loop of {char['name']}. "
            f"Motion begins immediately on frame one with no static pause: smooth, continuous, relaxed idle cycle where the chest, shoulders, and arms gently rise in one calm breath and smoothly settle back into the exact starting pose. "
            f"Keep the starting smile and facial expression completely steady and consistent throughout with a closed, relaxed mouth. "
            f"Just one single quick natural eye blink during the loop, then eyes stay steadily open. "
            f"Both feet stay firmly planted on the ground, static locked camera. {cfg['style_lock']}"
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
