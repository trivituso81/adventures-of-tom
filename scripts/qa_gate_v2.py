#!/usr/bin/env python3
"""scripts/qa_gate_v2.py: the two-stage gate for RAW benchmark mp4s, run in GitHub Actions BEFORE any matting.

Stage A (free, measured on the raw clip and its auto_trim cut):
  raw_duration        >= 4.5 s     the raw file as the model returned it (not the trimmed copy)
  peak_mask_churn     >= 0.22      max over the kept frames of 1 - IoU(mask_t, mask_0)
  left_reach_ratio    >= 0.12      how far the figure's left edge travels left, as a share of the Frame 0 width
  foot_retreat_ratio  <= 0.15      rightward drift of the bottom-15 percent centre, as a share of the Frame 0 width
  end_to_start_iou    >= 0.72      silhouette IoU of the last kept frame against Frame 0 (the settle back into the ready stance)
Stage B (one vision judge, only when Stage A passed; three runs, majority per boolean): the full-resolution Hero PNG, the full-resolution
  start_frame.png and an 8-frame 4x2 contact sheet (every tile at least 512 px wide) are checked; the clip is rejected when ANY boolean is false.
  The judge is gemini-4-neon when the account has it, otherwise the repo's configured Gemini judge (JUDGE_FALLBACK, the model qa_videos.py uses).
  strict_quadruped: a four-legged character must stay on four legs; for a human character it means the body keeps exactly two arms and two legs.

LOCKED_THRESHOLDS and STAGE_B_BOOLS are checked by scripts/verify_lock.py: they may be made stricter, never weaker.

  python3 scripts/qa_gate_v2.py raw.mp4 --hero art-factory/refs/justin.png --start start_frame.png --out report.json [--skip-b]"""
import argparse
import json
import re
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cv2
import numpy as np
from PIL import Image
from video_metrics import fg_mask, iou, load_frames, probe
from auto_trim import auto_trim

LOCKED_THRESHOLDS = {
    "min_raw_duration_sec": 4.5,
    "min_peak_mask_churn": 0.22,
    "min_left_reach_ratio": 0.12,
    "max_foot_retreat_ratio": 0.15,
    "min_end_to_start_iou": 0.72,
}
STAGE_B_BOOLS = ("matches_hero_ink_pencil_style", "locked_3q_left_facing", "single_prop_integrity",
                 "zero_baked_vfx_or_rings", "clean_strike_and_idle_return", "strict_quadruped")
PREFERRED_JUDGE = "gemini-4-neon"
JUDGE_FALLBACK = "gemini-2.5-flash"      # the configured repo judge (scripts/qa_videos.py QA_MODEL)
SHEET_FRAMES, SHEET_COLS, TILE_H, MIN_TILE_W = 8, 4, 768, 512
FOOT_BAND = 0.15
RUNS = 3


def stage_a(raw_mp4, trimmed_mp4, cut):
    """Measured checks. raw_mp4 supplies raw_duration, the trimmed copy (frames 0..cut of the raw) supplies the motion numbers."""
    T = LOCKED_THRESHOLDS
    raw_dur = probe(raw_mp4)["duration"]
    frames, fps = load_frames(trimmed_mp4, max_w=480)
    masks = [fg_mask(f) for f in frames]
    m0 = masks[0]
    out = {"raw_duration_sec": round(raw_dur, 3), "trimmed_sec": cut["cut_sec"], "cut_frame": cut["cut_frame"], "thresholds": T}
    if not m0.any():
        out.update(peak_mask_churn=0.0, left_reach_ratio=0.0, foot_retreat_ratio=1.0, end_to_start_iou=0.0, failures=["empty_mask"], passed=False)
        return out

    def bbox(m):
        ys, xs = np.where(m)
        return int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())

    x0min, x0max, _, _ = bbox(m0)
    w0 = max(1, x0max - x0min + 1)
    churn, mins, feet = [], [], []
    cx0 = None
    for i, m in enumerate(masks):
        if not m.any():
            churn.append(1.0)
            continue
        churn.append(1.0 - iou(m, m0))
        xmin, xmax, ymin, ymax = bbox(m)
        mins.append(xmin)
        band_top = ymax - max(1, int(round((ymax - ymin + 1) * FOOT_BAND))) + 1
        bx = np.where(m[band_top:ymax + 1].any(0))[0]
        cx = (int(bx.min()) + int(bx.max())) / 2.0
        if cx0 is None:
            cx0 = cx
        feet.append(cx - cx0)
    peak = float(max(churn))
    reach = float((x0min - min(mins)) / w0)
    retreat = float(max(0.0, max(feet)) / w0)
    end_iou = float(iou(masks[-1], m0))
    fails = []
    if raw_dur < T["min_raw_duration_sec"]:
        fails.append("raw_too_short")
    if peak < T["min_peak_mask_churn"]:
        fails.append("idle_twitch")
    if reach < T["min_left_reach_ratio"]:
        fails.append("no_left_reach")
    if retreat > T["max_foot_retreat_ratio"]:
        fails.append("foot_retreat")
    if end_iou < T["min_end_to_start_iou"]:
        fails.append("no_return_to_ready_stance")
    out.update(peak_mask_churn=round(peak, 4), left_reach_ratio=round(reach, 4), foot_retreat_ratio=round(retreat, 4),
               end_to_start_iou=round(end_iou, 4), failures=fails, passed=not fails)
    return out


def contact_sheet(trimmed_mp4, out_path, cols=SHEET_COLS, n=SHEET_FRAMES):
    """8 frames at full resolution, cropped around the figure's whole travel, every tile TILE_H tall and at least MIN_TILE_W wide, laid out 4x2."""
    small, _ = load_frames(trimmed_mp4, max_w=480)
    full, _ = load_frames(trimmed_mp4)
    idx = [int(round(i)) for i in np.linspace(0, len(full) - 1, n)]
    scale = full[0].shape[1] / small[0].shape[1]
    boxes = []
    for i in idx:
        m = fg_mask(small[i])
        if m.any():
            ys, xs = np.where(m)
            boxes.append((xs.min(), xs.max(), ys.min(), ys.max()))
    H, W = full[0].shape[:2]
    if boxes:
        x0 = min(b[0] for b in boxes) * scale; x1 = max(b[1] for b in boxes) * scale
        y0 = min(b[2] for b in boxes) * scale; y1 = max(b[3] for b in boxes) * scale
    else:
        x0, x1, y0, y1 = 0, W - 1, 0, H - 1
    pad = 0.05 * max(x1 - x0, y1 - y0)
    x0, x1, y0, y1 = max(0, x0 - pad), min(W, x1 + pad), max(0, y0 - pad), min(H, y1 + pad)
    cw, ch = x1 - x0, y1 - y0
    need = MIN_TILE_W / TILE_H * ch
    if cw < need:                                    # widen around the centre so a tile is at least 512 px wide when scaled to TILE_H tall
        cx = (x0 + x1) / 2
        x0, x1 = max(0, cx - need / 2), min(W, cx + need / 2)
    box = (int(x0), int(y0), int(x1), int(y1))
    tiles = []
    for i in idx:
        im = Image.fromarray(cv2.cvtColor(full[i], cv2.COLOR_BGR2RGB)).crop(box)
        w = max(MIN_TILE_W, int(round(im.width * TILE_H / im.height)))
        tiles.append(im.resize((w, TILE_H), Image.LANCZOS))
    tw = max(t.width for t in tiles)
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (tw * cols, TILE_H * rows), (128, 128, 128))
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % cols) * tw + (tw - t.width) // 2, (k // cols) * TILE_H))
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)
    return sheet, idx


def pick_judge(client):
    """gemini-4-neon when the account has it, else the configured repo judge."""
    try:
        client.models.get(model=PREFERRED_JUDGE)
        return PREFERRED_JUDGE
    except Exception:
        return JUDGE_FALLBACK


def stage_b_prompt(move_meta):
    prop, action = move_meta.get("expected_prop", "the named props"), move_meta.get("expected_action", "the move")
    return (
        "You are a strict QA judge for a hand-drawn colored-pencil battle animation. You get THREE images. "
        "IMAGE 1 is the HERO PNG, the sole style and likeness authority (ignore its magenta background). "
        "IMAGE 2 is START_FRAME, the first frame given to the video model. "
        "IMAGE 3 is a contact sheet of 8 frames of the generated clip in time order: left to right on the top row, then left to right on the bottom row. "
        f"EXPECTED PROPS: {prop}. EXPECTED ACTION: {action}. The enemies are to the LEFT of the screen. "
        "Answer ONLY with strict JSON with exactly these keys: "
        '{"matches_hero_ink_pencil_style": bool, "locked_3q_left_facing": bool, "single_prop_integrity": bool, "zero_baked_vfx_or_rings": bool, '
        '"clean_strike_and_idle_return": bool, "strict_quadruped": bool, "failure_reason": string}. '
        "matches_hero_ink_pencil_style: every tile keeps the Hero PNG look (fine dark-brown ink contours, colored-pencil hatching and grain, about three heads tall) with no airbrushed, 3D, painted or photographic drift. "
        "locked_3q_left_facing: the character stays in three-quarters-left profile in ALL 8 tiles, never turning to the camera or to the right. "
        "single_prop_integrity: exactly ONE of each expected prop in every tile, no duplicated, morphing, vanishing or belt-drawn props, and each prop stays in the hand that held it in IMAGE 2. "
        "zero_baked_vfx_or_rings: no rings, reticles, beams, sparks, glows, speed lines or floor circles drawn into any tile. "
        "clean_strike_and_idle_return: one clear strike toward screen-left, and the last tile shows the same ready stance as IMAGE 2. "
        "strict_quadruped: if the character is a four-legged animal it stays on four legs; for a human character answer true only when the body keeps exactly two arms and two legs in every tile, with no extra or missing limbs. "
        "Be strict: when unsure answer false. failure_reason is empty when everything is true, otherwise one short sentence."
    )


def _parse(text):
    t = re.sub(r"\s*```$", "", re.sub(r"^```(?:json)?\s*", "", (text or "").strip()))
    return json.loads(t)


def _valid(d):
    return isinstance(d, dict) and all(isinstance(d.get(k), bool) for k in STAGE_B_BOOLS) and isinstance(d.get("failure_reason", ""), str)


def stage_b(hero_png, start_png, sheet_path, client, model, move_meta, runs=RUNS):
    images = [Image.open(hero_png).convert("RGB"), Image.open(start_png).convert("RGB"), Image.open(sheet_path).convert("RGB")]
    prompt = stage_b_prompt(move_meta)
    answers, err = [], ""
    for _ in range(runs):
        for _try in range(2):
            try:
                resp = client.models.generate_content(model=model, contents=[prompt, *images])
                d = _parse(resp.text)
                if _valid(d):
                    answers.append(d)
                    break
                err = "invalid_json_shape"
            except Exception as exc:
                err = f"{type(exc).__name__}: {exc}"
    if len(answers) < 2:
        return {"passed": False, "judge": model, "runs": len(answers), "failure_reason": f"stage_b_unusable_response ({err})", "rejected_on": ["invalid_response"]}
    need = len(answers) // 2 + 1
    out = {k: sum(1 for a in answers if a[k]) >= need for k in STAGE_B_BOOLS}
    out["votes"] = {k: [bool(a[k]) for a in answers] for k in STAGE_B_BOOLS}
    bad = [k for k in STAGE_B_BOOLS if not out[k]]
    reasons = [a.get("failure_reason", "") for a in answers if a.get("failure_reason")]
    out.update(judge=model, runs=len(answers), rejected_on=bad, passed=not bad, failure_reason="" if not bad else (reasons[0] if reasons else ", ".join(bad)))
    out["true_votes"] = sum(v for vs in out["votes"].values() for v in vs)
    out["total_votes"] = len(STAGE_B_BOOLS) * len(answers)
    return out


def score(a, b):
    """Ranking of seeds that passed both stages: 0.5 judge agreement, 0.25 strike size, 0.25 return to the ready stance."""
    bf = (b["true_votes"] / b["total_votes"]) if b and b.get("total_votes") else 0.0
    return round(0.5 * bf + 0.25 * min(1.0, a["peak_mask_churn"] / 0.6) + 0.25 * a["end_to_start_iou"], 4)


def gate(raw_mp4, hero_png, start_png, move_meta, out_dir, client=None, skip_b=False):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    trimmed = out_dir / "trimmed.mp4"
    cut = auto_trim(raw_mp4, trimmed)
    a = stage_a(raw_mp4, trimmed, cut)
    rep = {"raw": str(raw_mp4), "trimmed": str(trimmed), "auto_trim": cut, "stage_a": a, "stage_b": None, "passed": False, "score": 0.0}
    if not a["passed"]:
        rep["failure_reason"] = "Stage A: " + ", ".join(a["failures"])
        return rep
    sheet = out_dir / "contact_sheet_4x2.png"
    contact_sheet(trimmed, sheet)
    rep["contact_sheet"] = str(sheet)
    if skip_b or client is None:
        rep["failure_reason"] = "Stage B skipped"
        return rep
    model = pick_judge(client)
    b = stage_b(hero_png, start_png, sheet, client, model, move_meta)
    rep["stage_b"] = b
    rep["passed"] = bool(b["passed"])
    rep["score"] = score(a, b) if rep["passed"] else 0.0
    rep["failure_reason"] = "" if rep["passed"] else "Stage B: " + (b.get("failure_reason") or ", ".join(b.get("rejected_on", [])))
    return rep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raw")
    ap.add_argument("--hero", required=True)
    ap.add_argument("--start", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--packet", default="art-factory/move-packets-pass1.json")
    ap.add_argument("--move", default="justin-bb-basic")
    ap.add_argument("--skip-b", action="store_true")
    a = ap.parse_args()
    meta = next(m for m in json.loads(Path(a.packet).read_text())["moves"] if m["id"] == a.move)
    client = None
    if not a.skip_b:
        import os
        from google import genai
        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    rep = gate(a.raw, a.hero, a.start, meta, Path(a.out).parent / (Path(a.out).stem + "_files"), client, a.skip_b)
    Path(a.out).write_text(json.dumps(rep, indent=2) + "\n")
    print(json.dumps({k: rep[k] for k in ("passed", "score", "failure_reason")}))
    sys.exit(0 if rep["passed"] else 2)


if __name__ == "__main__":
    main()
