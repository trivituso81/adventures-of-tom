#!/usr/bin/env python3
"""scripts/benchmark_run.py: Phase 1 benchmark of one move (justin-bb-basic) on GitHub Actions, started by a push to art-factory/benchmark-trigger.json.

  1. ONE start_frame.png on exactly #808080 that matches the character's Hero PNG, checked by Gate 1 (measured border + vision booleans).
  2. THREE seeds on alibaba/wan-3.0/image-to-video and THREE on fal-ai/kling-video/v3/pro/image-to-video, all in parallel, 5.0 s raw, native speed.
  3. Every raw mp4 goes through scripts/qa_gate_v2.py (auto_trim, Stage A measured, Stage B full-resolution vision) BEFORE any matting.
  4. ONLY the #1 passing seed is matted (neural video matting), alpha-clamped, encoded (VP9 webm + Safari hvc1 mp4) and baked into PASS-1 DRAFT REVIEW.
  5. A scorecard (art-factory/benchmark/<run_id>/scorecard.json and .md), the 8-frame alpha checkerboard, and the exact spend. When no seed passes the run stops and
     writes BLOCKER_REPORT.md instead of matting anything.

Spend: a hard cap (PIPELINE_LOCK.json active_spend_cap_usd, $5.00). The Ledger reserves the estimated cost of every paid call BEFORE it is made and refuses the call
if the total would pass the cap. Costs are fal's published per-second rates (the live price is read too and the higher one is booked) times the requested or measured
seconds, plus Gemini image and judge estimates. Exit 0 when a winner was baked, 2 on a blocker."""
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = Path(__file__).resolve().parent.parent
TRIGGER = ROOT / "art-factory" / "benchmark-trigger.json"
LOCK_PATH = ROOT / "art-factory" / "PIPELINE_LOCK.json"
PACKETS = ROOT / "art-factory" / "move-packets-pass1.json"

BENCH_PROMPT = ("Static locked camera, zero zoom, zero scale drift. Remaining in three-quarters-left profile on a flat #808080 mid-grey background with the exact same face and "
                "expression, he lowers his front hand to hold the yellow stud finder completely still at his side, extends his other arm to swing the claw hammer once cleanly into "
                "empty air toward the far left edge of the frame, and returns smoothly to his exact starting stance. Zero visual effects, zero drawn lines, zero flashes.")
BENCH_NEGATIVE = ("hitting own props, hammer touching stud finder, sparks, yellow spark lines, impact lines, comic action lines, motion lines, starburst, flash, glow, turning toward camera, "
                  "facing right, blank stare, angry face, proportion change, realistic human proportions, duplicate hammer, belt drawing, prop morphing, floating rings, target reticles, "
                  "laser beams, floor circle, camera pan, zoom, 3D CGI, photorealistic")

WAN = "alibaba/wan-3.0/image-to-video"
KLING = "fal-ai/kling-video/v3/pro/image-to-video"
RATES = {WAN: 0.10, KLING: 0.112}          # dollars per output second, published (Wan 720p, Kling with audio off)
MATTE_FALLBACK_EST = 0.20                 # fal birefnet v2 video, booked at this estimate when bria does not fit under the cap
MATTE_RATE = 0.14                         # bria video background removal, dollars per second
GEMINI_IMAGE_EST = 0.134                  # one 2K image
JUDGE_CALL_EST = 0.012                    # one vision judge call with three images
CUTOUT_EST = 0.02                         # one birefnet still cutout
BUFFER = 1.05
STILL_ATTEMPTS = 2


def say(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


class CapExceeded(Exception):
    pass


class Ledger:
    """Books every paid call. reserve() runs BEFORE the call and raises CapExceeded when the total would pass the cap."""

    def __init__(self, cap, path=None):
        self.cap, self.path, self.rows, self.lock = float(cap), path, [], threading.Lock()

    @property
    def total(self):
        return round(sum(r["usd"] for r in self.rows), 4)

    def reserve(self, label, usd, service="fal"):
        usd = round(usd * BUFFER, 4)
        with self.lock:
            if self.total + usd > self.cap + 1e-9:
                raise CapExceeded(f"{label}: ${usd:.4f} would take the run from ${self.total:.4f} past the ${self.cap:.2f} cap")
            self.rows.append({"label": label, "usd": usd, "service": service})
            if self.path:
                Path(self.path).write_text(json.dumps({"cap": self.cap, "total": self.total, "rows": self.rows}, indent=2) + "\n")
        return usd

    def by_service(self):
        out = {}
        for r in self.rows:
            out[r["service"]] = round(out.get(r["service"], 0) + r["usd"], 4)
        return out


class Services:
    """Everything that talks to the network. The tests replace this class with a stand-in."""

    def __init__(self, cfg):
        self.cfg = cfg
        import fal_client
        from google import genai
        self.fal = fal_client
        self.genai = genai
        self.client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    def live_price(self, endpoint):
        try:
            import requests
            r = requests.get("https://api.fal.ai/v1/models/pricing", params={"endpoint_id": endpoint}, headers={"Authorization": "Key " + os.environ["FAL_KEY"]}, timeout=30)
            p = (r.json().get("prices") or [None])[0]
            return float(p["unit_price"]) if p else None
        except Exception:
            return None

    def gen_still(self, prompt, ref_paths, out_path):
        from google.genai import types
        from PIL import Image
        contents = []
        for label, p in ref_paths:
            contents += [label, Image.open(p)]
        contents.append(prompt)
        resp = self.client.models.generate_content(model=self.cfg["models"]["stills"], contents=contents,
                                                   config=types.GenerateContentConfig(response_modalities=["IMAGE"], image_config=types.ImageConfig(image_size="2K", aspect_ratio="16:9")))
        for part in resp.candidates[0].content.parts:
            if getattr(part, "inline_data", None) and part.inline_data.data:
                Path(out_path).write_bytes(part.inline_data.data)
                return out_path
        raise RuntimeError("Gemini returned no image bytes")

    def cutout_still(self, src, dst):
        import requests
        url = self.fal.upload_file(str(src))
        res = self.fal.subscribe(self.cfg["models"]["cutout_still"], arguments={"image_url": url})
        u = res.get("image", {}).get("url") or res.get("url")
        Path(dst).write_bytes(requests.get(u, timeout=180).content)
        return dst

    def upload(self, path):
        return self.fal.upload_file(str(path))

    def video(self, endpoint, args):
        res = self.fal.subscribe(endpoint, arguments=args)
        return res.get("video", {}).get("url") or res.get("url")

    def download(self, url, dest):
        import requests
        r = requests.get(url, timeout=300)
        r.raise_for_status()
        Path(dest).write_bytes(r.content)
        return dest

    def matte(self, trimmed, out_path, cheap=False):
        import matte_winner
        models = dict(self.cfg["models"])
        if cheap:
            models["cutout_video"] = models["cutout_video_fallback"]
        return matte_winner.matte_remote(trimmed, out_path, self.fal, models)

    def judge(self):
        return self.client


def load_lock():
    return json.loads(LOCK_PATH.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------------------------------------------- start frame (Gate 1)

# Direct-Hero lock (WO-01E): the start frame is the approved Hero PNG pixels on #808080. Gemini only edits the hands and props, and only the hand band of the
# result is used; everything above it (head, face, expression, shoulders) and below it (legs, boots) is the Hero's own pixels, never regenerated.
START_PROMPT = (
    "Edit this image. Change ONLY the hands and what they hold; every other pixel stays exactly as it is: do not change the face, the expression, the hair, the head size, "
    "the body proportions, the clothes, the colors, the line work or the position of the figure. "
    "Put a flat palm-sized bright-yellow electronic stud finder in his hand on the left side of the image, held low in front of him, and one steel claw hammer in his hand "
    "on the right side of the image, held low at hip height. Remove the hammer from the belt pouch so the only hammer is the one in his hand. "
    "Keep the flat solid grey background exactly as it is, with no shadow, scenery or text."
)
HAND_BAND = (0.34, 1.00)      # the part of the figure's height the edit may own (below the chin: body, arms, hands, props); the edit model moves the arms a little, so a seam inside the
                              # body shows. The seam is at the neck and feathered over FEATHER of the height.
FEATHER = 0.03
HEAD_BAND = 0.32              # the top share of the figure's height that must stay pixel-identical to the Hero
GATE1_BOOLS = ("matches_hero_ink_pencil_style", "three_quarter_left_profile", "same_face_and_expression_as_hero", "stud_finder_held_in_one_hand",
               "single_claw_hammer_in_other_hand", "zero_duplicate_belt_hammer", "full_body_unclipped")


def figure_box(rgba_img):
    return rgba_img.getchannel("A").point(lambda v: 255 if v > 128 else 0).getbbox()


def compose_start(rgba_path, out_path, size=(1344, 768), fig_frac=0.86):
    """The cut-out figure scaled to fig_frac of the frame height, centred on an EXACT #808080 canvas. Returns (path, figure box on the canvas)."""
    from PIL import Image
    fg = Image.open(rgba_path).convert("RGBA")
    fg = fg.crop(figure_box(fg))
    h = int(size[1] * fig_frac)
    w = max(1, int(fg.width * h / fg.height))
    fg = fg.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", size, (128, 128, 128, 255))
    x, y = (size[0] - w) // 2, int(size[1] * 0.07)
    canvas.alpha_composite(fg, (x, y))
    canvas.convert("RGB").save(out_path)
    return out_path, (x, y, x + w, y + h)


def register_edit(hero_comp, edited, box):
    """The edit model returns the figure a little larger or shifted. Find the scale and shift that put the edit's head on the Hero's head (template match of the
    Hero head over scales), and return the edit warped onto the Hero composite's grid, grey filled in."""
    import cv2
    import numpy as np
    from PIL import Image
    h = cv2.cvtColor(np.asarray(Image.open(hero_comp).convert("RGB")), cv2.COLOR_RGB2GRAY)
    e0 = np.asarray(Image.open(edited).convert("RGB"))
    H, W = h.shape
    e0 = cv2.resize(e0, (W, H), interpolation=cv2.INTER_AREA)
    e = cv2.cvtColor(e0, cv2.COLOR_RGB2GRAY)
    x0, y0, x1, y1 = box
    ya, yb = y0, y0 + int((y1 - y0) * 0.30)
    tpl = h[ya:yb, x0 + int((x1 - x0) * 0.2):x1 - int((x1 - x0) * 0.2)]
    best = (-1, 1.0, 0, 0)
    for sc in np.arange(0.90, 1.2001, 0.01):
        big = cv2.resize(e, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        if big.shape[0] < tpl.shape[0] or big.shape[1] < tpl.shape[1]:
            continue
        r = cv2.matchTemplate(big, tpl, cv2.TM_CCOEFF_NORMED)
        _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]:
            best = (mx, sc, loc[0], loc[1])
    score, sc, lx, ly = best
    # edit point (lx,ly)/sc maps to hero point (template origin)
    ox, oy = x0 + int((x1 - x0) * 0.2), ya
    M = np.float32([[1 / sc, 0, ox - lx / sc], [0, 1 / sc, oy - ly / sc]])
    out = cv2.warpAffine(e0, M, (W, H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_CONSTANT, borderValue=(128, 128, 128))
    return out, {"match": round(float(score), 3), "scale": round(float(sc), 3), "dx": round(float(ox - lx / sc), 1), "dy": round(float(oy - ly / sc), 1)}


def lock_hero_pixels(hero_comp, edited, box, out_path, tol=14):
    """Final start frame: the Hero composite everywhere except the hand band; inside the band the edited picture, with its near-grey background snapped to exact #808080."""
    import numpy as np
    from PIL import Image
    base = np.asarray(Image.open(hero_comp).convert("RGB")).copy()
    reg, info = register_edit(hero_comp, edited, box)
    say("[start frame] edit registered to the Hero:", info)
    ed = reg.astype(int)
    x0, y0, x1, y1 = box
    fh = y1 - y0
    by0, by1 = y0 + int(fh * HAND_BAND[0]), y0 + int(fh * HAND_BAND[1])
    band = ed[by0:by1].copy()
    near = (np.abs(band - 128).max(axis=2) <= tol) & ((band.max(axis=2) - band.min(axis=2)) <= tol)
    band[near] = 128
    mag = (band[..., 0] > band[..., 1] + 25) & (band[..., 2] > band[..., 1] + 25)      # magenta fringe left from the grey-edit: pull red and blue down to green
    band[mag, 0] = band[mag, 1]
    band[mag, 2] = band[mag, 1]
    # feather the top of the band into the Hero pixels (only where the Hero has the figure), so the neck seam is soft
    nf = max(1, int(fh * FEATHER))
    w = np.clip(np.arange(by1 - by0) / nf, 0, 1)[:, None, None]
    hero_band = base[by0:by1].astype(float)
    base[by0:by1] = (w * band + (1 - w) * hero_band).astype(np.uint8)
    Image.fromarray(base).save(out_path)
    return out_path


def gate1_measured(path, hero_comp=None, box=None):
    """Exact #808080 border (every pixel of a 6 px frame), figure not touching the edge, figure fills at least 70 percent of the height."""
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    h, w = a.shape[:2]
    b = 6
    border = np.concatenate([a[:b].reshape(-1, 3), a[-b:].reshape(-1, 3), a[:, :b].reshape(-1, 3), a[:, -b:].reshape(-1, 3)])
    exact = float(np.mean(np.all(border == 128, axis=1)))
    fg = np.any(a != 128, axis=2)
    ys, xs = np.where(fg)
    fig_h = (ys.max() - ys.min() + 1) / h if fg.any() else 0.0
    head_diff = None
    if hero_comp is not None and box is not None:
        h0 = np.asarray(Image.open(hero_comp).convert("RGB")).astype(int)
        x0, y0, x1, y1 = box
        yb = y0 + int((y1 - y0) * HEAD_BAND)
        head_diff = float(np.abs(a[y0:yb] - h0[y0:yb]).mean())
    ok = (head_diff is None or head_diff <= 0.5) and exact >= 0.9999 and fg.any() and ys.min() > b and ys.max() < h - b and xs.min() > b and xs.max() < w - b and fig_h >= 0.70
    return {"border_exact_808080_fraction": round(exact, 6), "figure_height_fraction": round(fig_h, 3), "head_mean_abs_diff_vs_hero": head_diff, "passed": bool(ok)}


def gate1_vision(client, model, hero, start):
    import re
    from PIL import Image
    prompt = ("You are a strict QA judge. IMAGE 1 is the HERO PNG (the style and likeness authority; ignore its magenta background). IMAGE 2 is a candidate START FRAME for a battle animation. "
              "Answer ONLY with strict JSON with exactly these keys, each a boolean: "
              + ", ".join(f'"{k}"' for k in GATE1_BOOLS) + ', and "failure_reason" a string. '
              "matches_hero_ink_pencil_style: same fine dark-brown ink contours, colored-pencil hatching and grain, warm highlights, about three heads tall, same outfit as IMAGE 1. "
              "three_quarter_left_profile: body and face turned three-quarters toward the left of the frame. "
              "same_face_and_expression_as_hero: the face, expression, hair, head size and body proportions are identical to IMAGE 1, not redrawn. "
              "stud_finder_held_in_one_hand: exactly one flat palm-sized bright-yellow stud finder held in one hand. "
              "single_claw_hammer_in_other_hand: exactly one claw hammer gripped in the other hand. "
              "zero_duplicate_belt_hammer: no second hammer on the belt or anywhere else. "
              "full_body_unclipped: hair to boots fully visible. Be strict: when unsure answer false.")
    last = ""
    answers = []
    for _ in range(3):
        for _try in range(2):
            try:
                resp = client.models.generate_content(model=model, contents=[prompt, Image.open(hero).convert("RGB"), Image.open(start).convert("RGB")])
                t = re.sub(r"\s*```$", "", re.sub(r"^```(?:json)?\s*", "", (resp.text or "").strip()))
                d = json.loads(t)
                if all(isinstance(d.get(k), bool) for k in GATE1_BOOLS):
                    answers.append(d)
                    break
            except Exception as exc:
                last = f"{type(exc).__name__}: {exc}"
    if len(answers) < 2:
        return {"passed": False, "failure_reason": f"gate1 vision unusable ({last})", "runs": len(answers)}
    need = len(answers) // 2 + 1
    out = {k: sum(1 for a in answers if a[k]) >= need for k in GATE1_BOOLS}
    bad = [k for k in GATE1_BOOLS if not out[k]]
    out.update(passed=not bad, rejected_on=bad, runs=len(answers), judge=model,
               failure_reason="" if not bad else next((a.get("failure_reason") for a in answers if a.get("failure_reason")), ", ".join(bad)))
    return out


def make_start_frame(svc, ledger, hero, run_dir, judge_model, tail_cost=0.0):
    notes = []
    # the Hero cut out once and set on exact #808080: these are the pixels everything else is checked against
    ledger.reserve("hero cutout (birefnet)", CUTOUT_EST, service="fal")
    hero_rgba, hero_comp = run_dir / "hero_rgba.png", run_dir / "hero_on_808080.png"
    svc.cutout_still(hero, hero_rgba)
    _, box = compose_start(hero_rgba, hero_comp)
    for attempt in range(1, STILL_ATTEMPTS + 1):
        cost = GEMINI_IMAGE_EST + 3 * JUDGE_CALL_EST
        if attempt > 1 and ledger.total + cost * BUFFER + tail_cost > ledger.cap:
            notes.append("no budget left for another start frame attempt")
            break
        try:
            ledger.reserve(f"start frame attempt {attempt}: Gemini hand edit + 3 judge calls", cost, service="google")
        except CapExceeded as exc:
            notes.append(str(exc))
            break
        edited, start = run_dir / f"start_edit_{attempt}.png", run_dir / "start_frame.png"
        svc.gen_still(START_PROMPT, [("HERO ON GREY (edit only the hands and what they hold):", hero_comp)], edited)
        lock_hero_pixels(hero_comp, edited, box, start)
        g1m = gate1_measured(start, hero_comp, box)
        g1v = gate1_vision(svc.judge(), judge_model, hero, start) if g1m["passed"] else {"passed": False, "failure_reason": "measured gate failed"}
        rep = {"attempt": attempt, "measured": g1m, "vision": g1v, "passed": bool(g1m["passed"] and g1v["passed"])}
        notes.append(rep)
        (run_dir / "gate1.json").write_text(json.dumps({"attempts": notes, "passed": rep["passed"]}, indent=2) + "\n")
        say(f"[start frame] attempt {attempt}: measured={g1m['passed']} vision={g1v.get('passed')} {g1v.get('failure_reason', '')}")
        if rep["passed"]:
            return start, notes
    return None, notes


# ------------------------------------------------------------------------------------------------------------------------- seeds

def seed_jobs(lock, models=("wan", "kling")):
    n = int(lock["seeds_per_move"])
    wan_seeds = [101, 202, 303, 404, 505][:n]
    jobs = []
    if "wan" in models:
        for i in range(n):
            jobs.append({"id": f"wan3_s{i + 1}", "model": "wan-3.0", "endpoint": WAN, "seed": wan_seeds[i]})
    if "kling" in models:
        for i in range(n):
            jobs.append({"id": f"kling3pro_s{i + 1}", "model": "kling-v3-pro", "endpoint": KLING, "seed": None})
    return jobs


def video_args(job, img_url, duration):
    if job["endpoint"] == WAN:
        return {"start_image_url": img_url, "prompt": BENCH_PROMPT, "negative_prompt": BENCH_NEGATIVE, "resolution": "720p", "duration": int(duration),
                "audio": False, "enable_prompt_expansion": False, "seed": job["seed"]}
    return {"start_image_url": img_url, "prompt": BENCH_PROMPT, "negative_prompt": BENCH_NEGATIVE, "duration": str(int(duration)),
            "generate_audio": False, "cfg_scale": 0.85}


def run_seed(svc, ledger, job, img_url, duration, seeds_dir):
    from video_metrics import probe
    out = {"id": job["id"], "model": job["model"], "endpoint": job["endpoint"], "seed": job["seed"], "requested_duration": duration, "status": "failed"}
    live = svc.live_price(job["endpoint"])
    rate = max(RATES[job["endpoint"]], live or 0.0)
    try:
        out["cost_usd"] = ledger.reserve(f"{job['id']}: {duration:.0f} s at ${rate:.3f}/s", rate * duration)
    except CapExceeded as exc:
        out["error"] = str(exc)
        out["status"] = "skipped_cap"
        return out
    args = video_args(job, img_url, duration)
    try:
        try:
            url = svc.video(job["endpoint"], args)
        except Exception as exc:
            if "negative_prompt" in str(exc) and job["endpoint"] == WAN:      # the Wan schema lists no negative_prompt: retry without (a rejected request is not billed)
                args.pop("negative_prompt")
                out["negative_prompt_sent"] = False
                url = svc.video(job["endpoint"], args)
            else:
                raise
        d = seeds_dir / job["id"]
        d.mkdir(parents=True, exist_ok=True)
        raw = svc.download(url, d / "raw.mp4")
        info = probe(raw)
        out.update(status="made", raw=str(raw), measured_duration=round(info["duration"], 3), fps=info["fps"], size=[info["width"], info["height"]])
    except Exception as exc:
        out["error"] = f"{type(exc).__name__}: {str(exc)[:300]}"
    return out


# ----------------------------------------------------------------------------------------------------------------------------- main

def packet(move_id):
    return next(m for m in json.loads(PACKETS.read_text(encoding="utf-8"))["moves"] if m["id"] == move_id)


def write_scorecard(run_dir, run_id, seeds, winner, ledger, notes):
    def row(model):
        rs = [s for s in seeds if s["model"] == model]
        return {"passes": sum(1 for s in rs if s.get("gate", {}).get("passed")), "of": len(rs),
                "seeds": [{"id": s["id"], "measured_duration": s.get("measured_duration"), "passed": bool(s.get("gate", {}).get("passed")),
                           "failure": s.get("gate", {}).get("failure_reason") or s.get("error", ""), "score": s.get("gate", {}).get("score")} for s in rs]}
    card = {"run_id": run_id, "wan_3_0": row("wan-3.0"), "kling_v3_pro": row("kling-v3-pro"), "winner": None, "spend_usd": ledger.total,
            "spend_by_service": ledger.by_service(), "spend_basis": "fal published per-second rates (live price read, higher booked) x seconds, plus Gemini estimates; the run reserves each cost before the call",
            "notes": notes}
    if winner:
        g = winner["gate"]
        card["winner"] = {"id": winner["id"], "model": winner["model"], "score": g["score"], "stage_a": {k: v for k, v in g["stage_a"].items() if k != "thresholds"},
                          "stage_b": {k: v for k, v in (g["stage_b"] or {}).items() if k not in ("votes",)}}
    (run_dir / "scorecard.json").write_text(json.dumps(card, indent=2) + "\n")
    md = [f"# Benchmark {run_id}", "", f"Wan 3.0: {card['wan_3_0']['passes']}/{card['wan_3_0']['of']} passes. Kling v3 Pro: {card['kling_v3_pro']['passes']}/{card['kling_v3_pro']['of']} passes.",
          f"Spend: ${ledger.total:.2f} of ${ledger.cap:.2f} ({card['spend_by_service']}).", ""]
    for m in ("wan_3_0", "kling_v3_pro"):
        for s in card[m]["seeds"]:
            md.append(f"- {s['id']}: {'PASS' if s['passed'] else 'FAIL'}, {s['measured_duration']} s, {s['failure'] or 'ok'}")
    if card["winner"]:
        md += ["", f"Winner: {card['winner']['id']} (score {card['winner']['score']})", f"Stage A: {json.dumps(card['winner']['stage_a'])}", f"Stage B: {json.dumps(card['winner']['stage_b'])}"]
    (run_dir / "scorecard.md").write_text("\n".join(md) + "\n")
    return card


def write_blocker(run_dir, run_id, seeds, ledger, why):
    lines = [f"BLOCKER_REPORT {run_id}", "", f"Why: {why}", f"Spend: ${ledger.total:.2f} of ${ledger.cap:.2f}", "", "Seeds:"]
    for s in seeds:
        lines.append(f"- {s['id']}: {s.get('status')} {s.get('measured_duration', '')} s | {s.get('gate', {}).get('failure_reason') or s.get('error', '')}")
    lines += ["", "Nothing was matted or baked. The next change should be ONE thing, chosen from the failures above."]
    (run_dir / "BLOCKER_REPORT.md").write_text("\n".join(lines) + "\n")


def bake_winner(run_id, alpha_webm, move_id):
    dst = ROOT / "art-factory" / "staging" / "justin" / f"battle_move_draft_{move_id}"
    dst.mkdir(parents=True, exist_ok=True)
    shutil.copy2(alpha_webm, dst / "raw_alpha.webm")
    env = dict(os.environ, PASS1_DURATION_MULT="1.0", PASS1_CLIP_TAG="".join(c for c in run_id if c.isalnum()) or "bench")
    r = subprocess.run([sys.executable, "tools/clip-bake/bake_factory.py", move_id], env=env, cwd=ROOT, capture_output=True, text=True)
    say((r.stdout + r.stderr)[-800:])
    return r.returncode == 0, (r.stdout + r.stderr)[-400:]


def update_packet(move_id, card, run_id, baked):
    data = json.loads(PACKETS.read_text(encoding="utf-8"))
    for m in data["moves"]:
        if m["id"] == move_id and card["winner"]:
            m["qa_gate"] = {"run_id": run_id, "winner": card["winner"]["id"], "stage_a": card["winner"]["stage_a"], "stage_b": card["winner"]["stage_b"], "passed": True}
            m["lifecycle_state"] = "DRAFT_REVIEW" if baked else "ANCHORED"
            m["failure_tags"] = []
    PACKETS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def log_spend(ledger, run_id):
    try:
        sys.path.insert(0, str(ROOT / "tools"))
        import costlog
        rows = []
        for svc_id, usd in ledger.by_service().items():
            rows.append({"service": svc_id, "amount": usd, "what": f"art-factory benchmark {run_id}: Wan 3.0 x3, Kling v3 Pro x3, start frame, matting of the winner", "source": "art-factory benchmark run"})
        costlog.log_from_env(rows)
    except Exception as exc:
        say("could not log the spend:", exc)


def run(svc=None, trigger=None, run_dir_root=None):
    import qa_gate_v2
    from video_metrics import probe
    lock = load_lock()
    trig = trigger or json.loads(TRIGGER.read_text(encoding="utf-8"))
    run_id = str(trig.get("run_id") or time.strftime("bench-%Y%m%d%H%M%S"))
    move_id = trig.get("move_id", "justin-bb-basic")
    cap = float(lock["active_spend_cap_usd"])
    if float(trig.get("cap_usd", cap)) > cap:
        raise SystemExit("the trigger asks for a cap above PIPELINE_LOCK.json")
    cap = float(trig.get("cap_usd", cap))      # the run's own cap (never above the lock's)
    run_dir = Path(run_dir_root or ROOT / "art-factory" / "benchmark") / run_id
    seeds_dir = run_dir / "seeds"
    seeds_dir.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ROOT / "art-factory" / "characters.json").read_text(encoding="utf-8"))
    cfg = manifest["config"]
    svc = svc or Services(cfg)
    ledger = Ledger(cap, run_dir / "ledger.json")
    meta = packet(move_id)
    hero = ROOT / "art-factory" / "refs" / f"{meta['character_id']}.png"
    notes, seeds, winner = [], [], None
    status = {"run_id": run_id, "move_id": move_id, "started": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "state": "running"}
    (run_dir / "status.json").write_text(json.dumps(status) + "\n")
    why = ""
    try:
        judge_model = qa_gate_v2.pick_judge(svc.judge())
        notes.append(f"vision judge: {judge_model}")
        models = tuple(trig.get("models") or ("wan", "kling"))
        jobs = seed_jobs(lock, models)
        tail = sum(RATES[j["endpoint"]] for j in jobs) * float(lock["raw_duration_sec"]) + 3 * len(jobs) * JUDGE_CALL_EST + MATTE_FALLBACK_EST
        if trig.get("start_frame"):      # WO-01F: reuse a start frame that already passed Gate 1 (no picture is paid for again)
            src = ROOT / trig["start_frame"]
            start = run_dir / "start_frame.png"
            shutil.copy2(src, start)
            g1m = gate1_measured(start)
            g1 = [{"reused_from": trig["start_frame"], "measured": g1m, "passed": bool(g1m["passed"])}]
            (run_dir / "gate1.json").write_text(json.dumps({"attempts": g1, "passed": g1[0]["passed"]}, indent=2) + "\n")
            if not g1m["passed"]:
                start = None
        else:
            start, g1 = make_start_frame(svc, ledger, hero, run_dir, judge_model, tail_cost=tail)
        if not start:
            why = "Gate 1 never passed on the start frame: " + json.dumps(g1[-1] if g1 else {})[:600]
        else:
            ledger.reserve(f"Stage B judge calls: {len(jobs)} seeds x 3 runs", 3 * len(jobs) * JUDGE_CALL_EST, service="google")
            img_url = svc.upload(start)
            duration = float(lock["raw_duration_sec"])
            say(f"[seeds] {len(jobs)} in parallel, {duration} s each")
            with ThreadPoolExecutor(max_workers=len(jobs)) as ex:
                seeds = list(ex.map(lambda j: run_seed(svc, ledger, j, img_url, duration, seeds_dir), jobs))
            for s in seeds:
                if s["status"] != "made":
                    s["gate"] = {"passed": False, "failure_reason": s.get("error", s["status"]), "score": 0.0}
                    continue
                s["gate"] = qa_gate_v2.gate(s["raw"], hero, start, meta, seeds_dir / s["id"] / "gate", svc.judge())
                say(f"[gate] {s['id']}: passed={s['gate']['passed']} {s['gate'].get('failure_reason', '')} score={s['gate'].get('score')}")
            passed = [s for s in seeds if s["gate"]["passed"]]
            if not passed:
                why = "all budgeted seeds failed qa_gate_v2"
            else:
                winner = max(passed, key=lambda s: (s["gate"]["score"], -seeds.index(s)))
                trimmed = winner["gate"]["trimmed"]
                secs = probe(trimmed)["duration"]
                import matte_winner
                alpha_raw = run_dir / "winner_matte_raw.webm"
                if ledger.total + MATTE_RATE * secs * BUFFER <= ledger.cap:
                    ledger.reserve(f"matte winner {winner['id']}: {secs:.1f} s at ${MATTE_RATE}/s", MATTE_RATE * secs)
                    _, used = svc.matte(trimmed, alpha_raw)
                else:     # bria does not fit under this run's cap: the cheaper neural video matte (fal birefnet v2 video), booked at a conservative estimate
                    ledger.reserve(f"matte winner {winner['id']}: birefnet v2 video (estimate)", MATTE_FALLBACK_EST)
                    notes.append("bria matting did not fit under the cap; used birefnet v2 video, cost is an estimate")
                    _, used = svc.matte(trimmed, alpha_raw, cheap=True)
                rep = matte_winner.finish(alpha_raw, run_dir, probe(trimmed)["fps"])
                rep["matte_model"] = used
                (run_dir / "matte.json").write_text(json.dumps(rep, indent=2) + "\n")
                notes.append(f"matted only {winner['id']} with {used}")
    except CapExceeded as exc:
        why = "spend cap: " + str(exc)
    except Exception as exc:
        why = f"{type(exc).__name__}: {str(exc)[:400]}"
    card = write_scorecard(run_dir, run_id, seeds, winner, ledger, notes)
    baked = False
    if winner and not why:
        baked, tail = bake_winner(run_id, run_dir / "winner_alpha.webm", move_id)
        card["baked_into_pass1_draft_review"] = baked
        (run_dir / "scorecard.json").write_text(json.dumps(card, indent=2) + "\n")
        update_packet(move_id, card, run_id, baked)
    if why:
        write_blocker(run_dir, run_id, seeds, ledger, why)
    status.update(state="blocked" if why else "done", finished=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), why=why, spend_usd=ledger.total)
    (run_dir / "status.json").write_text(json.dumps(status, indent=2) + "\n")
    log_spend(ledger, run_id)
    say(json.dumps({"state": status["state"], "spend": ledger.total, "winner": card["winner"] and card["winner"]["id"]}))
    return 2 if why else 0


if __name__ == "__main__":
    sys.exit(run())
