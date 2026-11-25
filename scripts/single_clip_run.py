"""Single-clip 480p Art Factory run, started by a push to art-factory/single-clip-trigger.json (never @claude).

Reads the trigger {"run_id", "move_ids", "resolution", "duration_multiplier", "max_retries"} and, for ONLY those moves:
  render (battle_move_draft, 480p) -> two-stage gate (battle_move_gate.py) -> on a fail one more render with a short director note
  (max_retries is clamped to 1, so at most 2 renders) -> on a pass bake the clip into its Pass-1 Draft Review slot at the given
  duration multiplier (tools/clip-bake/bake_factory.py, which also re-wires the kit row). Other clips are never touched.
A move id may be the packet id (justin-bb-basic) or the clip id (pf-justin-bb-basic).
Writes art-factory/qa-single-clip-<run_id>.json and merges the gate into queue.json, move-packets-pass1.json and qa-report-pass1-drafts.json.
Exit 0 on a baked clip, 2 when every attempt failed the gate (the workflow still commits the report)."""
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools", "clip-bake"))

TRIGGER = Path("art-factory/single-clip-trigger.json")
PACKETS = Path("art-factory/move-packets-pass1.json")
REPORT = Path("art-factory/qa-report-pass1-drafts.json")
HARD_MAX_RETRIES = 1          # cost lock: at most 2 renders per move
ALLOWED_RESOLUTION = "480p"   # the battle_move_draft stage renders 480p only; finals are a separate stage


def packet_id(move_id):
    return move_id[3:] if move_id.startswith("pf-") else move_id


def read_trigger(path=TRIGGER):
    t = json.loads(Path(path).read_text(encoding="utf-8"))
    ids = [packet_id(str(m)) for m in t.get("move_ids", [])]
    if not ids:
        raise SystemExit("single-clip-trigger.json has no move_ids")
    if t.get("resolution", ALLOWED_RESOLUTION) != ALLOWED_RESOLUTION:
        raise SystemExit(f"cost lock: only {ALLOWED_RESOLUTION} runs from this trigger")
    mult = float(t.get("duration_multiplier", 1.5))
    if not 0.5 <= mult <= 3:
        raise SystemExit("duration_multiplier must be between 0.5 and 3")
    retries = max(0, min(int(t.get("max_retries", HARD_MAX_RETRIES)), HARD_MAX_RETRIES))
    return {"run_id": str(t.get("run_id") or time.strftime("run-%Y%m%d%H%M%S")), "move_ids": ids, "duration_multiplier": mult, "max_retries": retries}


def merge_json_list(items, new, key="id"):
    return [i for i in items if i.get(key) != new.get(key)] + [new]


def main():
    from google import genai
    import bake_factory
    from art_director_agent import get_character, load_manifest
    from battle_move_gate import retry_feedback, run_gate
    from qa_videos import QA_MODEL
    from run_stage import generate_video_item, load_queue, resolve_hero_source, save_queue

    trig = read_trigger()
    for pid in trig["move_ids"]:
        if pid not in bake_factory.PREVIEW:
            raise SystemExit(f"{pid} has no Pass-1 Draft Review slot (bake_factory.PREVIEW); refusing to run")
    manifest = load_manifest()
    cfg = manifest["config"]
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    queue = load_queue(cfg["queue_path"])
    packets = json.loads(PACKETS.read_text(encoding="utf-8"))
    moves = {m["id"]: m for m in packets["moves"]}   # the Pass-1 packets only: other manifests reuse these ids without a character_id
    report_all = json.loads(REPORT.read_text(encoding="utf-8")) if REPORT.exists() else {"results": []}
    run_report = {"run_id": trig["run_id"], "resolution": ALLOWED_RESOLUTION, "duration_multiplier": trig["duration_multiplier"],
                  "max_retries": trig["max_retries"], "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "moves": []}
    exit_code = 0

    for pid in trig["move_ids"]:
        meta = moves[pid]
        char = get_character(manifest, meta["character_id"])
        hero_src = resolve_hero_source(char, cfg, allow_fallback=True)
        feedback, attempts, winner, item = "", [], None, None
        for attempt in range(1, trig["max_retries"] + 2):
            print(f"[single-clip] {pid} render {attempt}/{trig['max_retries'] + 1}", flush=True)
            item = generate_video_item("battle_move_draft", char, cfg, pid, feedback, hero_src)
            video = Path(item["raw_video_path"])
            keep = video.with_name(f"attempt_{attempt}_raw_alpha.webm")
            shutil.copy2(video, keep)
            gate = run_gate(video, meta, client, QA_MODEL, sheet_path=video.with_name(f"attempt_{attempt}_contact_sheet_200px.png"))
            print(f"[single-clip] {pid} attempt {attempt}: passed={gate['passed']} {gate['failure_reason']} stage1={gate['stage1']}", flush=True)
            attempts.append({"attempt": attempt, "feedback": feedback, "video": str(keep), "gate": gate})
            if gate["passed"]:
                winner = gate
                break
            feedback = retry_feedback(gate)

        final = winner or attempts[-1]["gate"]
        item.update(qa_passed=bool(winner), qa_gate=final, qa_failure_tags=final["failure_tags"], qa_notes=final["failure_reason"],
                    status="qa_passed" if winner else "qa_failed", needs_encode=True)
        queue["items"] = merge_json_list(queue["items"], item)
        for m in packets["moves"]:
            if m.get("id") == pid:
                m["failure_tags"] = final["failure_tags"]
                m["lifecycle_state"] = "DRAFT_REVIEW" if winner else "ANCHORED"
                m["qa_gate"] = final
        entry = {"id": item["id"], "character_id": char["id"], "move_id": pid, "used_prop_start_frame": item.get("used_prop_start_frame", False),
                 "passed": bool(winner), "gate": final, "attempts": len(attempts)}
        report_all["results"] = merge_json_list(report_all.get("results", []), entry)
        baked = ""
        if winner:
            env = dict(os.environ, PASS1_DURATION_MULT=str(trig["duration_multiplier"]), PASS1_CLIP_TAG=re.sub(r"[^A-Za-z0-9]", "", trig["run_id"]) or "single")
            r = subprocess.run([sys.executable, "tools/clip-bake/bake_factory.py", pid], env=env, capture_output=True, text=True)
            print(r.stdout[-1500:], r.stderr[-1500:], flush=True)
            if r.returncode:
                exit_code = 3
                baked = "bake_failed"
            else:
                baked = "pf-" + pid
        else:
            exit_code = exit_code or 2
        run_report["moves"].append({"move_id": pid, "clip_id": "pf-" + pid, "passed": bool(winner), "renders": len(attempts),
                                    "baked": baked, "attempts": attempts})

    run_report["finished_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    save_queue(cfg["queue_path"], queue)
    PACKETS.write_text(json.dumps(packets, indent=2) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report_all, indent=2) + "\n", encoding="utf-8")
    Path(f"art-factory/qa-single-clip-{trig['run_id']}.json").write_text(json.dumps(run_report, indent=2) + "\n", encoding="utf-8")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
