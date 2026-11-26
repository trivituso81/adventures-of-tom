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
