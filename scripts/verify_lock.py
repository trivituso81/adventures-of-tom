#!/usr/bin/env python3
"""scripts/verify_lock.py: Step 1 of .github/workflows/art-factory.yml. Aborts (exit 1) any run that

  1. alters art-factory/PIPELINE_LOCK.json (it must equal LOCK below, and must not differ from the previous commit's copy),
  2. weakens a threshold in scripts/qa_gate_v2.py (LOCKED_THRESHOLDS must be at least as strict as GATE_FLOOR below),
  3. introduces a disallowed string, a pose-stitching chain, a start==end image on a combat move, or a playback multiplier other than 1.0
     in a pipeline file (CLAUDE.md "Battle Animation Pipeline Lock").

Spends nothing. Run from the repo root:  python3 scripts/verify_lock.py
This file lists the disallowed strings, so it is the one pipeline file the scan skips. Changing LOCK or GATE_FLOOR is Tom's decision, in his words."""
import ast
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCK_PATH = "art-factory/PIPELINE_LOCK.json"
LOCK = {
    "default_bg_hex": "#808080",
    "grey_prop_bg_hex": "#5B6E8C",
    "seeds_per_move": 3,
    "raw_duration_sec": 5.0,
    "playback_speed": 1.0,
    "active_spend_cap_usd": 5.00,
}
# the strictest values qa_gate_v2.py may NOT go below (minimums) or above (maximums)
GATE_FLOOR = {
    "min_raw_duration_sec": 4.5,
    "min_peak_mask_churn": 0.22,
    "min_left_reach_ratio": 0.12,
    "max_foot_retreat_ratio": 0.15,
    "min_end_to_start_iou": 0.72,
}
STAGE_B_BOOLS = ("matches_hero_ink_pencil_style", "locked_3q_left_facing", "single_prop_integrity",
                 "zero_baked_vfx_or_rings", "clean_strike_and_idle_return", "strict_quadruped")
SCAN = ["scripts/*.py", "art-factory/characters.json", "art-factory/move-packets-pass1.json", LOCK_PATH,
        ".github/workflows/art-factory.yml", "tools/clip-bake/bake_factory.py"]
SKIP = {"scripts/verify_lock.py"}
DISALLOWED = ["#00FF00", "chromakey", "Veo 3.1 Lite", "1.5x", "4 heads tall", "gouache", "bobblehead", "sprite"]
SPEED_NAMES = r"(?:duration_multiplier|playback_speed|speed_multiplier|PLAYBACK_SPEED|PASS1_DURATION_MULT|SLOW)"


def files():
    seen = []
    for pat in SCAN:
        for p in sorted(ROOT.glob(pat)):
            rel = p.relative_to(ROOT).as_posix()
            if rel not in SKIP and p.is_file() and rel not in seen:
                seen.append(rel)
    return seen


def check_lock(errors):
    p = ROOT / LOCK_PATH
    if not p.exists():
        errors.append(f"{LOCK_PATH} is missing")
        return
    try:
        cur = json.loads(p.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{LOCK_PATH} does not parse: {exc}")
        return
    if cur != LOCK:
        errors.append(f"{LOCK_PATH} differs from the locked values: {cur} (locked: {LOCK})")
    prev = subprocess.run(["git", "-C", str(ROOT), "show", f"HEAD~1:{LOCK_PATH}"], capture_output=True, text=True)
    if prev.returncode == 0:
        try:
            if json.loads(prev.stdout) != cur:
                errors.append(f"{LOCK_PATH} was changed by the latest commit")
        except Exception:
            errors.append(f"the previous {LOCK_PATH} did not parse")


def check_gate(errors):
    p = ROOT / "scripts" / "qa_gate_v2.py"
    if not p.exists():
        errors.append("scripts/qa_gate_v2.py is missing")
        return
    tree = ast.parse(p.read_text(encoding="utf-8"))
    found = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            if node.targets[0].id in ("LOCKED_THRESHOLDS", "STAGE_B_BOOLS"):
                try:
                    found[node.targets[0].id] = ast.literal_eval(node.value)
                except Exception:
                    errors.append(f"qa_gate_v2.py {node.targets[0].id} is not a literal")
    th = found.get("LOCKED_THRESHOLDS")
    if not isinstance(th, dict):
        errors.append("qa_gate_v2.py has no LOCKED_THRESHOLDS literal")
    else:
        for k, floor in GATE_FLOOR.items():
            v = th.get(k)
            if v is None:
                errors.append(f"qa_gate_v2.py threshold {k} is missing")
            elif k.startswith("min_") and v < floor:
                errors.append(f"qa_gate_v2.py weakens {k}: {v} is below {floor}")
            elif k.startswith("max_") and v > floor:
                errors.append(f"qa_gate_v2.py weakens {k}: {v} is above {floor}")
    bools = found.get("STAGE_B_BOOLS")
    if not isinstance(bools, (tuple, list)) or not set(STAGE_B_BOOLS) <= set(bools):
        errors.append("qa_gate_v2.py STAGE_B_BOOLS must contain every locked Stage B boolean")


def check_text(errors):
    for rel in files():
        text = (ROOT / rel).read_text(encoding="utf-8", errors="replace")
        low = text.lower()
        for bad in DISALLOWED:
            if bad.lower() in low:
                line = next((i + 1 for i, l in enumerate(text.splitlines()) if bad.lower() in l.lower()), 0)
                errors.append(f"{rel}:{line} contains the disallowed string {bad!r}")
        if re.search(r"\b([A-Z])\s*(?:->|→)\s*[A-Z]\s*(?:->|→)\s*[A-Z]\s*(?:->|→)\s*\1\b", text):
            errors.append(f"{rel} contains a multi-keyframe pose chain (A->B->C->A)")
        if re.search(r"keyframe", low) and re.search(r"stitch", low):
            errors.append(f"{rel} mentions keyframe pose stitching")
        for i, l in enumerate(text.splitlines(), 1):
            if re.search(r"end_image_url[\"']?\s*[:=]\s*(?:img_url|start_url|start_image_url)\b", l) and "lock-allow: idle" not in l:
                errors.append(f"{rel}:{i} sets the end image equal to the start image (only an idle loop may, marked lock-allow: idle)")
            for m in re.finditer(SPEED_NAMES + r"[\"']?\s*(?:[:=]|or)\s*(?:float\(\s*)?(?:os\.environ\.get\([^)]*\)\s*or\s*)?[\"']?([0-9]+(?:\.[0-9]+)?)", l):
                if float(m.group(1)) != 1.0:
                    errors.append(f"{rel}:{i} sets a playback multiplier of {m.group(1)} (only 1.0 is allowed)")
        if rel.endswith("bake_factory.py"):
            m = re.search(r"PREVIEW\s*=\s*\{(.*?)\n\}", text, re.S)
            for sp in re.findall(r",\s*([0-9.]+)\),?\s*$", m.group(1), re.M) if m else []:
                if float(sp) != 1.0:
                    errors.append(f"{rel} PREVIEW plays a clip at {sp}x (only 1.0 is allowed)")


def main():
    errors = []
    check_lock(errors)
    check_gate(errors)
    check_text(errors)
    if errors:
        print("verify_lock: ABORT, the Battle Animation Pipeline Lock is broken:")
        for e in errors:
            print("  -", e)
        return 1
    print(f"verify_lock: ok ({len(files())} pipeline files scanned, lock and gate thresholds intact)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
