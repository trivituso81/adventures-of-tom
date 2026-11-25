"""Two-stage QA gate for battle_move_draft clips. Cutout or likeness cleanliness alone never passes a clip.

Stage 1 (free, deterministic): 10 evenly spaced frames of the cutout clip, alpha masks only.
  peak_mask_churn   = max over frames of 1 - IoU(mask_t, mask_0)                       reject if < 0.22 (idle twitch)
  left_reach_ratio  = (min_x(frame_0) - min over t of min_x(frame_t)) / bbox_width(0)   reject if < 0.12 (stationary)
  foot_retreat_ratio= rightward drift of the bottom-15% bbox centre / bbox_width(0)      reject if > 0.15 (backward drop)
Stage 2 (one vision call, only when Stage 1 passed): 6-frame contact sheet (0, 20, 40, 60, 80, 100 percent), every
  frame cropped to the figure and scaled to 200 px tall (the in-game battle size), checked against expected_prop and
  expected_action. Strict JSON; ANY of the four booleans false rejects in code, whatever `pass` says.
"""
import glob
import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

STAGE1_FRAMES = 10
MIN_PEAK_CHURN = 0.22
MIN_LEFT_REACH = 0.12
MAX_FOOT_RETREAT = 0.15
FOOT_BAND = 0.15
ALPHA_T = 128
SHEET_PCTS = (0.0, 0.2, 0.4, 0.6, 0.8, 1.0)
SHEET_H = 200
STAGE2_BOOLS = ("prop_visible_frame1", "prop_visible_at_sprite_scale", "action_reads_leftward", "feet_planted")
THRESHOLDS = {"min_peak_mask_churn": MIN_PEAK_CHURN, "min_left_reach_ratio": MIN_LEFT_REACH, "max_foot_retreat_ratio": MAX_FOOT_RETREAT}


def decode_frames(video, tmp):
    """Every frame as RGBA png. The VP9 alpha needs ffmpeg's libvpx decoder (the default decoder drops it)."""
    for decoder in (["-c:v", "libvpx-vp9"], []):
        for old in glob.glob(f"{tmp}/g*.png"):
            Path(old).unlink()
        subprocess.run(["ffmpeg", "-v", "error", "-y", *decoder, "-i", str(video), "-pix_fmt", "rgba", f"{tmp}/g%04d.png"],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        files = sorted(glob.glob(f"{tmp}/g*.png"))
        if files:
            return files
    return []


def clean_mask(alpha):
    """alpha > 128, specks below 1% of the foreground dropped (matting noise)."""
    m = alpha > ALPHA_T
    if not m.any():
        return m
    try:
        import cv2
        n, lab, stats, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), connectivity=8)
        if n > 2:
            keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= 0.01 * m.sum()]
            m = np.isin(lab, keep)
    except Exception:
        pass
    return m


def bbox(m):
    ys, xs = np.where(m)
    return int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())


def stage1_from_masks(masks):
    """masks: the 10 sampled boolean masks, frame 0 first."""
    m0 = masks[0]
    out = {"frames_sampled": len(masks), "thresholds": THRESHOLDS}
    if not m0.any():
        out.update(peak_mask_churn=0.0, left_reach_ratio=0.0, foot_retreat_ratio=0.0, failures=["empty_mask"], passed=False)
        return out
    x0min, x0max, _, _ = bbox(m0)
    w0 = max(1, x0max - x0min + 1)
    churn, mins, feet = [], [], []
    cx0 = None
    for i, m in enumerate(masks):
        if not m.any():
            churn.append(1.0)
            continue
        inter = np.logical_and(m, m0).sum()
        union = np.logical_or(m, m0).sum()
        churn.append(1.0 - (inter / union if union else 1.0))
        xmin, xmax, ymin, ymax = bbox(m)
        mins.append(xmin)
        band_top = ymax - max(1, int(round((ymax - ymin + 1) * FOOT_BAND))) + 1
        bx = np.where(m[band_top:ymax + 1].any(0))[0]
        cx = (int(bx.min()) + int(bx.max())) / 2.0
        if i == 0:
            cx0 = cx
        feet.append(cx - cx0)
    peak = float(max(churn))
    reach = float((x0min - min(mins)) / w0)
    retreat = float(max(0.0, max(feet)) / w0)
    fails = []
    if peak < MIN_PEAK_CHURN:
        fails.append("idle_twitch")
    if reach < MIN_LEFT_REACH:
        fails.append("stationary_no_left_reach")
    if retreat > MAX_FOOT_RETREAT:
        fails.append("foot_retreat")
    out.update(peak_mask_churn=round(peak, 4), left_reach_ratio=round(reach, 4), foot_retreat_ratio=round(retreat, 4),
               failures=fails, passed=not fails)
    return out


def sample_indices(n, k):
    return [int(i) for i in np.linspace(0, n - 1, k).round()]


def build_contact_sheet(files, masks_full, out_path):
    """6 frames at 0..100%, cropped to the shared figure box and scaled to 200 px tall (battle size), on #808080."""
    n = len(files)
    idx = [int(round(p * (n - 1))) for p in SHEET_PCTS]
    boxes = [bbox(masks_full(i)) for i in idx if masks_full(i).any()]
    if not boxes:
        raise RuntimeError("no foreground in contact-sheet frames")
    x0 = min(b[0] for b in boxes); x1 = max(b[1] for b in boxes)
    y0 = min(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    pad = int(0.04 * max(x1 - x0, y1 - y0))
    tiles = []
    for i in idx:
        im = Image.open(files[i]).convert("RGBA")
        box = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad + 1), min(im.height, y1 + pad + 1))
        im = im.crop(box)
        bg = Image.new("RGBA", im.size, (128, 128, 128, 255))
        bg.alpha_composite(im)
        w = max(1, round(bg.width * SHEET_H / bg.height))
        tiles.append(bg.convert("RGB").resize((w, SHEET_H), Image.LANCZOS))
    gap = 4
    sheet = Image.new("RGB", (sum(t.width for t in tiles) + gap * (len(tiles) - 1), SHEET_H), (128, 128, 128))
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        x += t.width + gap
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)
    return sheet, idx


def expectations(move_meta):
    """expected_prop and expected_action of the packet, with a fallback for packets that do not carry them yet."""
    prop = move_meta.get("expected_prop") or ", ".join(move_meta.get("held_props", [])) or "the named prop"
    pitch = move_meta.get("pitch") or {}
    act = move_meta.get("expected_action") or " ".join(pitch.get(k, "") for k in ("windup", "peak", "recovery")).strip() or move_meta.get("name", "the move")
    return prop, act


def parse_json(text):
    t = (text or "").strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    return json.loads(t)


def validate_stage2(data):
    if not isinstance(data, dict):
        return False
    if not all(isinstance(data.get(k), bool) for k in STAGE2_BOOLS + ("pass",)):
        return False
    return isinstance(data.get("failure_reason", ""), str)


def stage2_prompt(prop, action):
    return (
        "You are a strict QA judge for a 2D hand-painted JRPG battle animation. The image is a contact sheet of 6 frames "
        "from one clip, left to right at 0%, 20%, 40%, 60%, 80% and 100% of its length, each shown at true in-game size "
        "(the figure is about 200 pixels tall). The enemies are to the LEFT of the screen. "
        f"EXPECTED PROPS: {prop}. EXPECTED ACTION: {action}. "
        "Answer ONLY with strict JSON with exactly these keys: "
        '{"pass": bool, "prop_visible_frame1": bool, "prop_visible_at_sprite_scale": bool, "action_reads_leftward": bool, '
        '"feet_planted": bool, "failure_reason": string}. '
        "prop_visible_frame1: BOTH expected props are already gripped in the character's hands in the first (leftmost) tile, "
        "not on a belt, in a pocket or appearing later. prop_visible_at_sprite_scale: each prop is still recognizable at this "
        "size in the later tiles. action_reads_leftward: one bold strike clearly aimed toward screen-left. feet_planted: both "
        "feet stay in the same place on the floor in every tile, no walking or backing up. "
        "Be strict: when unsure answer false. failure_reason is empty when everything is true, otherwise one short sentence."
    )


def stage2(sheet, prop, action, client, model):
    from google.genai import types
    prompt = stage2_prompt(prop, action)
    last_err = ""
    for _ in range(2):
        try:
            resp = client.models.generate_content(model=model, contents=[prompt, sheet],
                                                  config=types.GenerateContentConfig(response_mime_type="application/json"))
            data = parse_json(resp.text)
            if validate_stage2(data):
                bad = [k for k in STAGE2_BOOLS if not data[k]]
                data["hard_rejected_on"] = bad
                data["passed"] = (not bad) and data["pass"]
                return data
            last_err = "invalid_json_shape"
        except Exception as exc:
            last_err = f"{type(exc).__name__}: {exc}"
    return {"passed": False, "pass": False, "failure_reason": f"stage2_unusable_response ({last_err})", "hard_rejected_on": ["invalid_response"]}


def run_gate(video, move_meta, client, model, sheet_path=None):
    """Stage 1, then Stage 2 only if Stage 1 passed. Returns {stage1, stage2|None, passed, failure_reason, failure_tags}."""
    prop, action = expectations(move_meta)
    with tempfile.TemporaryDirectory() as tmp:
        files = decode_frames(video, tmp)
        if not files:
            s1 = {"failures": ["decode_failed"], "passed": False, "thresholds": THRESHOLDS}
            return {"stage1": s1, "stage2": None, "passed": False, "failure_reason": "could not decode the video", "failure_tags": ["decode_failed"]}
        cache = {}

        def mask(i):
            if i not in cache:
                cache[i] = clean_mask(np.asarray(Image.open(files[i]).convert("RGBA"))[..., 3])
            return cache[i]

        s1 = stage1_from_masks([mask(i) for i in sample_indices(len(files), STAGE1_FRAMES)])
        if not s1["passed"]:
            return {"stage1": s1, "stage2": None, "passed": False,
                    "failure_reason": "Stage 1 motion gate: " + ", ".join(s1["failures"]),
                    "failure_tags": ["gate1_" + f for f in s1["failures"]]}
        sheet, idx = build_contact_sheet(files, mask, sheet_path or Path(tmp) / "sheet.png")
        s2 = stage2(sheet, prop, action, client, model)
        s2["contact_sheet_frames"] = idx
        s2["contact_sheet"] = str(sheet_path) if sheet_path else None
        ok = bool(s2["passed"])
        tags = [] if ok else ["gate2_" + k for k in s2.get("hard_rejected_on", [])] or ["gate2_pass_false"]
        return {"stage1": s1, "stage2": s2, "passed": ok,
                "failure_reason": "" if ok else "Stage 2 sprite-scale check: " + (s2.get("failure_reason") or ", ".join(s2.get("hard_rejected_on", [])) or "pass was false"),
                "failure_tags": tags}


def retry_feedback(gate):
    """One short, specific director note for the single retry: only what the gate named."""
    s1 = gate.get("stage1") or {}
    notes = []
    f = s1.get("failures", [])
    if "idle_twitch" in f or "stationary_no_left_reach" in f:
        notes.append("Make the single strike much bigger: a deep torso lean and a huge arm swing toward screen-left")
    if "foot_retreat" in f:
        notes.append("Keep both feet exactly where they are in frame 1, no backward drift")
    s2 = gate.get("stage2") or {}
    if s2:
        if "prop_visible_frame1" in s2.get("hard_rejected_on", []):
            notes.append("Both props are already gripped in the hands in frame 1")
        if "prop_visible_at_sprite_scale" in s2.get("hard_rejected_on", []):
            notes.append("Draw the props larger and keep them in view")
        if "action_reads_leftward" in s2.get("hard_rejected_on", []):
            notes.append("Aim the strike clearly toward screen-left")
        if "feet_planted" in s2.get("hard_rejected_on", []):
            notes.append("Both feet stay planted in place")
    return ". ".join(notes) + "." if notes else ""
