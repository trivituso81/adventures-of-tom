#!/usr/bin/env python3
"""Tests for scripts/benchmark_run.py with a stand-in for the network: the spend cap, and the blocker path (no video is paid for
when the start frame never passes Gate 1, and a BLOCKER_REPORT is written)."""
import json, os, sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import benchmark_run as B
fails = []
def check(name, ok, extra=""):
    print(("PASS " if ok else "FAIL ") + name, extra)
    if not ok: fails.append(name)

# 1. the ledger refuses a call that would pass the cap
L = B.Ledger(5.00, Path(tempfile.mkdtemp()) / "l.json")
L.reserve("a", 4.00)
try:
    L.reserve("b", 1.50); check("ledger refuses a reserve past the cap", False)
except B.CapExceeded:
    check("ledger refuses a reserve past the cap", True, f"total {L.total}")
check("ledger total stays under the cap", L.total <= 5.00)

# 2. seed jobs are 3 Wan and 3 Kling, 5.0 s, native speed
lock = B.load_lock(); jobs = B.seed_jobs(lock)
eps = [j["endpoint"] for j in jobs]
check("3 Wan 3.0 and 3 Kling v3 Pro seeds", sum("wan-3.0" in e for e in eps) == 3 and sum("kling-video/v3/pro" in e for e in eps) == 3, str(eps))
check("lock says 1.0x and a $5.00 cap", lock["playback_speed"] == 1.0 and lock["active_spend_cap_usd"] == 5.00)

# 2b. direct-Hero lock: a "redrawn" edit that changes the face is thrown away outside the hand band, and the head gate measures it
import numpy as np
from PIL import Image
tmp = Path(tempfile.mkdtemp())
hero = Image.open(ROOT / "art-factory" / "refs" / "justin.png").convert("RGB")
a = np.asarray(hero).astype(int)
key = (a[..., 0] > 200) & (a[..., 2] > 200) & (a[..., 1] < 110)
rgba = np.dstack([a, np.where(key, 0, 255)]).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(tmp / "h.png")
_, box = B.compose_start(tmp / "h.png", tmp / "comp.png")
comp = np.asarray(Image.open(tmp / "comp.png").convert("RGB")).copy()
bad = comp.copy(); bad[:, :, 0] = np.clip(bad[:, :, 0].astype(int) + 60, 0, 255)      # a model that tinted and redrew everything, face included
Image.fromarray(bad).save(tmp / "bad.png")
B.lock_hero_pixels(tmp / "comp.png", tmp / "bad.png", box, tmp / "final.png")
fin = np.asarray(Image.open(tmp / "final.png").convert("RGB")).astype(int)
x0, y0, x1, y1 = box; yb = y0 + int((y1 - y0) * B.HEAD_BAND)
check("head area of the final frame is the Hero's own pixels", np.abs(fin[y0:yb] - comp[y0:yb].astype(int)).max() == 0)
g = B.gate1_measured(tmp / "final.png", tmp / "comp.png", box)
check("gate 1 head difference is 0 after the lock", g["head_mean_abs_diff_vs_hero"] == 0.0, str(g))
Image.fromarray(bad).save(tmp / "raw_bad.png")
g2 = B.gate1_measured(tmp / "raw_bad.png", tmp / "comp.png", box)
check("gate 1 rejects an unlocked redraw of the face", g2["passed"] is False and g2["head_mean_abs_diff_vs_hero"] > 0.5, str(g2["head_mean_abs_diff_vs_hero"]))
check("wan-only run has 3 seeds and no Kling", len(B.seed_jobs(lock, ("wan",))) == 3 and all("kling" not in j["endpoint"] for j in B.seed_jobs(lock, ("wan",))))
check("prompt has no style or proportion words", not any(w in B.BENCH_PROMPT.lower() for w in ("hand-drawn", "heads", "caricature", "tall", "pencil", "ink")))

# 3. blocker path: a start frame that is never on #808080 stops the run before any video call
class Fake:
    videos = 0
    def judge(self):
        class C:
            class models:
                @staticmethod
                def get(model): raise RuntimeError("no such model")
        return C
    def live_price(self, e): return None
    def gen_still(self, prompt, refs, out):
        from PIL import Image
        Image.new("RGB", (1344, 768), (200, 30, 30)).save(out); return out
    def cutout_still(self, src, dst):
        from PIL import Image
        Image.new("RGBA", (1344, 768), (200, 30, 30, 255)).save(dst); return dst
    def upload(self, p): return "u"
    def video(self, e, a): Fake.videos += 1; return "x"
    def download(self, u, d): raise RuntimeError("no")
    def matte(self, t, o): raise RuntimeError("no")
root = Path(tempfile.mkdtemp())
try:
    rc = B.run(svc=Fake(), trigger={"run_id": "t1", "move_id": "justin-bb-basic"}, run_dir_root=root)
except Exception as exc:
    rc = None; print("run raised", exc)
d = root / "t1"
check("run exits 2 on a blocker", rc == 2, str(rc))
check("no video was paid for", Fake.videos == 0, str(Fake.videos))
check("BLOCKER_REPORT.md written", (d / "BLOCKER_REPORT.md").exists())
st = json.loads((d / "status.json").read_text()) if (d / "status.json").exists() else {}
check("status is blocked", st.get("state") == "blocked", str(st.get("state")))
print("FAILS:", fails); sys.exit(1 if fails else 0)
