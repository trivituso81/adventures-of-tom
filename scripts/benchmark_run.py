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

BENCH_PROMPT = ("Static locked camera, zero zoom, zero scale drift. Standing in place on a flat #808080 mid-grey background and remaining in three-quarters-left profile "
                "the entire clip with calm deadpan focus, the tall hand-drawn character coils slightly, delivers one crisp forward-left tap into empty air with the claw hammer "
                "held in his front hand, and settles smoothly back into his exact starting ready stance.")
BENCH_NEGATIVE = ("turning toward camera, facing right, body rotation, hitting own body or props, duplicate hammer, belt drawing, prop morphing, floating rings, target reticles, "
                  "laser beams, sparks, floor circle, shouting, angry open mouth, camera pan, zoom, 3D CGI, photorealistic, airbrushed shading")

WAN = "alibaba/wan-3.0/image-to-video"
KLING = "fal-ai/kling-video/v3/pro/image-to-video"
RATES = {WAN: 0.10, KLING: 0.112}          # dollars per output second, published (Wan 720p, Kling with audio off)
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

    def matte(self, trimmed, out_path):
        import matte_winner
        return matte_winner.matte_remote(trimmed, out_path, self.fal, self.cfg["models"])

    def judge(self):
        return self.client


def load_lock():
    return json.loads(LOCK_PATH.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------------------------------------------- start frame (Gate 1)

START_PROMPT = (
    "Redraw the character in the reference image exactly: same face, spiky brown hair, short beard, cream henley shirt, blue jeans, brown leather tool belt and work boots, "
    "in the same fine dark-brown ink contours, visible colored-pencil hatching and grain and warm highlights, about three heads tall caricature proportions. "
    "Full body from hair to boots, fully visible, standing in place facing three-quarters to the left (body and face turned toward the left of the frame), "
    "calm deadpan focused expression with a closed mouth and no smile. "
    "One steel claw hammer is gripped in his front hand (the hand toward the left of the frame), held low and forward at hip height. "
    "One bright-yellow electronic stud finder is clipped, stationary, to the belt at the chest-belt line. There is no other hammer anywhere: the belt pouch holds no hammer. "
    "Flat solid #808080 mid-grey background, no floor shadow, no scenery, no text. The reference's magenta background must not appear."
)
GATE1_BOOLS = ("matches_hero_ink_pencil_style", "three_quarter_left_profile", "calm_deadpan_closed_mouth", "stud_finder_clipped_stationary_at_chest_belt",
               "single_claw_hammer_in_front_hand", "zero_duplicate_belt_hammer", "full_body_unclipped")


def compose_start(rgba_path, out_path, size=(1344, 768), fig_frac=0.86):
    """The cut-out figure scaled to fig_frac of the frame height, centred on an EXACT #808080 canvas."""
    from PIL import Image
    fg = Image.open(rgba_path).convert("RGBA")
    box = fg.getchannel("A").point(lambda v: 255 if v > 128 else 0).getbbox()
    fg = fg.crop(box)
    h = int(size[1] * fig_frac)
    w = max(1, int(fg.width * h / fg.height))
    fg = fg.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", size, (128, 128, 128, 255))
    canvas.alpha_composite(fg, ((size[0] - w) // 2, int(size[1] * 0.07)))
    canvas.convert("RGB").save(out_path)
    return out_path


def gate1_measured(path):
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
    ok = exact >= 0.9999 and fg.any() and ys.min() > b and ys.max() < h - b and xs.min() > b and xs.max() < w - b and fig_h >= 0.70
    return {"border_exact_808080_fraction": round(exact, 6), "figure_height_fraction": round(fig_h, 3), "passed": bool(ok)}


def gate1_vision(client, model, hero, start):
    import re
    from PIL import Image
    prompt = ("You are a strict QA judge. IMAGE 1 is the HERO PNG (the style and likeness authority; ignore its magenta background). IMAGE 2 is a candidate START FRAME for a battle animation. "
              "Answer ONLY with strict JSON with exactly these keys, each a boolean: "
              + ", ".join(f'"{k}"' for k in GATE1_BOOLS) + ', and "failure_reason" a string. '
              "matches_hero_ink_pencil_style: same fine dark-brown ink contours, colored-pencil hatching and grain, warm highlights, about three heads tall, same face and outfit as IMAGE 1. "
              "three_quarter_left_profile: body and face turned three-quarters toward the left of the frame. "
              "calm_deadpan_closed_mouth: neutral focused face, mouth closed, no smile, no shouting. "
              "stud_finder_clipped_stationary_at_chest_belt: exactly one bright-yellow stud finder clipped to the belt at chest-belt level, not held. "
              "single_claw_hammer_in_front_hand: exactly one claw hammer, gripped in the hand toward screen-left. "
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


def make_start_frame(svc, ledger, hero, run_dir, judge_model):
    notes = []
    for attempt in range(1, STILL_ATTEMPTS + 1):
        try:
            ledger.reserve(f"start frame attempt {attempt}: Gemini image + 3 judge calls", GEMINI_IMAGE_EST + 3 * JUDGE_CALL_EST, service="google")
            ledger.reserve(f"start frame attempt {attempt}: fal cutout", CUTOUT_EST, service="fal")
        except CapExceeded as exc:
            notes.append(str(exc))
            break
        raw, rgba, start = run_dir / f"start_raw_{attempt}.png", run_dir / f"start_rgba_{attempt}.png", run_dir / "start_frame.png"
        svc.gen_still(START_PROMPT, [("HERO PNG (sole style and likeness authority; ignore its magenta background):", hero)], raw)
        svc.cutout_still(raw, rgba)
        compose_start(rgba, start)
        g1m = gate1_measured(start)
        g1v = gate1_vision(svc.judge(), judge_model, hero, start) if g1m["passed"] else {"passed": False, "failure_reason": "measured gate failed"}
        rep = {"attempt": attempt, "measured": g1m, "vision": g1v, "passed": bool(g1m["passed"] and g1v["passed"])}
        notes.append(rep)
        (run_dir / "gate1.json").write_text(json.dumps({"attempts": notes, "passed": rep["passed"]}, indent=2) + "\n")
        say(f"[start frame] attempt {attempt}: measured={g1m['passed']} vision={g1v.get('passed')} {g1v.get('failure_reason', '')}")
        if rep["passed"]:
            return start, notes
    return None, notes


# ------------------------------------------------------------------------------------------------------------------------- seeds

def seed_jobs(lock):
    n = int(lock["seeds_per_move"])
    wan_seeds = [101, 202, 303, 404, 505][:n]
    jobs = []
    for i in range(n):
        jobs.append({"id": f"wan3_s{i + 1}", "model": "wan-3.0", "endpoint": WAN, "seed": wan_seeds[i]})
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
        start, g1 = make_start_frame(svc, ledger, hero, run_dir, judge_model)
        if not start:
            why = "Gate 1 never passed on the start frame: " + json.dumps(g1[-1] if g1 else {})[:600]
        else:
            ledger.reserve("Stage B judge calls: 6 seeds x 3 runs", 18 * JUDGE_CALL_EST, service="google")
            img_url = svc.upload(start)
            duration = float(lock["raw_duration_sec"])
            jobs = seed_jobs(lock)
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
                ledger.reserve(f"matte winner {winner['id']}: {secs:.1f} s at ${MATTE_RATE}/s", MATTE_RATE * secs)
                import matte_winner
                alpha_raw = run_dir / "winner_matte_raw.webm"
                _, used = svc.matte(trimmed, alpha_raw)
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
