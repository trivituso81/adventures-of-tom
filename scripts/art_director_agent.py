import json
import re
from pathlib import Path

ANTI_RING_NEG = "glowing ring, neon halo, aura outline, rim glow, spotlight, stage lighting, light beam, light cone, floor glow, lens flare, muted desaturated sketch, photorealistic 3D, 16-bit, 32-bit, 8-bit, pixel art, retro, SNES, Final Fantasy, hurt, knocked out"
IDLE_NEG = "frozen start, static pause, motionless opening, delayed animation, repeated blinking, double blink, fluttering eyelids, mouth opening, sighing, pursing lips, speaking, camera movement, blur, distort"


KETTLEBELL_NEG = (
    "turning toward camera, facing right, body rotation, hitting own body or props, duplicate prop, belt drawing, re-tucking a prop, prop morphing, "
    "walking, stepping backward, backing away, wandering off-center, floating rings, target reticles, laser beams, sparks, floor circle, shouting, "
    "angry open mouth, camera pan, zoom, 3D CGI, photorealistic, airbrushed shading"
)
GREY_PROP_WORDS = ("silver", "grey", "gray", "chrome", "pewter", "aluminum", "aluminium")

def bg_for_move(move, cfg):
    """#5B6E8C for a move whose held props are grey or silver, else the default #808080 (PIPELINE_LOCK.json)."""
    props = " ".join((move or {}).get("held_props", [])).lower()
    if any(w in props for w in GREY_PROP_WORDS):
        return cfg.get("grey_prop_bg_hex", "#5B6E8C")
    return cfg.get("bg_hex", "#808080")

def build_kettlebell_prompt(move, char_name, bg_hex="#808080"):
    """The Kettlebell Rule: zero in-video walking, zero belt-draws or re-tucks (the active prop is in the hand on Frame 0), a locked
    three-quarters-left profile, calm deadpan focus, and exactly three beats: coil, one leftward strike, settle to the Frame 0 ready stance."""
    kb = (move or {}).get("kettlebell") or {}
    in_hand = kb.get("in_hand") or "the active prop held in his front hand"
    fixed = kb.get("fixed_prop")
    strike = kb.get("strike") or "one crisp forward-left strike into empty air"
    fixed_txt = f" with {fixed}" if fixed else ""
    return (
        f"Static locked camera, zero zoom, zero scale drift. {char_name} stands in place on a flat {bg_hex} mid-grey background{fixed_txt} and remains in "
        f"three-quarters-left profile the entire clip with calm deadpan focus, no walking, holding {in_hand} from the very first frame. "
        f"He coils slightly, delivers {strike}, and settles smoothly back into his exact starting ready stance."
    )

def battle_move_draft_rules(move):
    """Kept for callers: the Kettlebell Rule as one staging sentence (no walking, no belt-draws, locked profile, three beats)."""
    return (
        "STAGING RULES. Locked camera, one fixed floor plane, zero walking, zero belt-draws or re-tucks: the active prop is already held in the hand on Frame 0. "
        "Locked three-quarters-left profile, calm deadpan focus. Exactly three beats: coil, one single leftward strike, settle back into the Frame 0 ready stance."
    )

BATTLE_MOVE_DRAFT_NEG = KETTLEBELL_NEG

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
        r"solid chroma-key green \(#[0-9A-Fa-f]{6}\) background",
        f"solid {bg_hex} mid-grey studio background",
        text,
        flags=re.IGNORECASE,
    )
    out = re.sub(r"chroma-key green", f"{bg_hex} mid-grey", out, flags=re.IGNORECASE)
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
        if stage in ("battle_move_draft", "battle_move_final"):
            pos = build_kettlebell_prompt(found["move"], char["name"], bg_for_move(found["move"], cfg))
        if feedback and feedback.strip() and feedback.strip() not in pos:
            clean_fb = normalize_backdrop_for_grey(feedback.strip(), bg_hex)
            pos = f"{pos} Director notes: {clean_fb}"
        pos = sanitize_prompt(pos, cfg["banned_words"])
        neg_base = clip.get("negativePrompt") or defaults.get("negativePrompt") or ""
        neg = f"{neg_base}, {ANTI_RING_NEG}".strip(", ")
        if stage in ("battle_move_draft", "battle_move_final"):
            neg = f"{neg}, {KETTLEBELL_NEG}"
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
            f"Paint {base} Translate only the key facial features, hair, and age from the subject photo into the EXACT colored-pencil art style of the game style reference. "
            f"Keep the exact fine dark-brown ink contours, visible colored-pencil hatching and grain, warm highlights and about three heads tall proportions of the style reference. "
            f"Use the outfit described above rather than copying casual clothes from the subject photo unless no outfit is specified. "
            f"Pose: full body from top of hair to sturdy shoes with full head visible and unclipped, standing ready facing the viewer, arms loose, both feet on the ground. "
            f"Single character alone on a flat {cfg['bg_hex']} mid-grey studio background with zero glowing halo or rim ring."
        )
    elif stage == "turnaround":
        p = f"4K 4-view orthographic turnaround sheet (front, left profile, back, right profile) of {base} Identical outfit, exact shared baseline, fine dark-brown ink contours and colored-pencil hatching matching the Hero PNG reference, flat {cfg['bg_hex']} background."
    elif stage == "sheets":
        moods = ", ".join(cfg["moods"])
        poses = ", ".join(cfg["talking_poses"])
        p = f"4K character animation sheet for {base} Row 1: 8-frame side walk cycle. Row 2: 8 expression portraits ({moods}). Row 3: 4 talking poses ({poses}). Fine dark-brown ink contours and colored-pencil hatching matching the Hero PNG reference, flat {cfg['bg_hex']} background."
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
