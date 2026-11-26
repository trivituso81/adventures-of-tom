import json
import os
import re
import subprocess
import tempfile
import time
from pathlib import Path
from google import genai
from PIL import Image
from battle_move_gate import run_gate

QUEUE_PATH = Path("art-factory/queue.json")
PACKETS_PATH = Path("art-factory/move-packets-pass1.json")
REPORT_PATH = Path("art-factory/qa-report-pass1-drafts.json")
QA_MODEL = "gemini-2.5-flash"
PASS_THRESHOLD = 7.5

def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default

def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

def extract_key_frames(video_path, tmp_dir):
    out_pattern = str(Path(tmp_dir) / "frame_%03d.png")
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(video_path), "-vf", "fps=2", out_pattern],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    frames = sorted(Path(tmp_dir).glob("frame_*.png"))
    if not frames:
        return []
    if len(frames) <= 3:
        return frames
    return [frames[0], frames[len(frames) // 2], frames[-1]]

def build_move_lookup(packets):
    lookup = {}
    for m in packets.get("moves", []):
        mid = m.get("id")
        if mid:
            lookup[mid] = m
        counter = m.get("reactiveCounterClip")
        if isinstance(counter, dict) and counter.get("id"):
            lookup[counter["id"]] = {
                "id": counter["id"],
                "character": m.get("character"),
                "name": f"{m.get('name')} (Counter)",
                "held_props": counter.get("held_props", []),
                "positivePrompt": counter.get("positivePrompt", ""),
            }
    return lookup

def parse_json_response(text):
    cleaned = (text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)

def grade_video(client, model, item, move_meta):
    vid_str = item.get("webm_path") or item.get("raw_video_path") or ""
    vid_path = Path(vid_str)
    if not vid_str or not vid_path.exists() or vid_path.stat().st_size == 0:
        return {
            "passed": False,
            "overall": 0.0,
            "scores": {"likeness": 0, "prop_integrity": 0, "motion_fluidity": 0, "staging_cleanliness": 0},
            "failure_tags": ["missing_or_empty_video"],
            "notes": f"Video file missing: {vid_str}",
        }
    # Two-stage gate first: Stage 1 is free, Stage 2 is one vision call. Cutout or likeness cleanliness alone never passes a clip.
    gate = run_gate(vid_path, move_meta, client, model, sheet_path=vid_path.with_name("contact_sheet_200px.png"))
    if not gate["passed"]:
        return {
            "passed": False,
            "overall": 0.0,
            "scores": {"likeness": 0, "prop_integrity": 0, "motion_fluidity": 0, "staging_cleanliness": 0},
            "failure_tags": gate["failure_tags"],
            "notes": gate["failure_reason"],
            "gate": gate,
        }
    with tempfile.TemporaryDirectory() as tmp_dir:
        frame_paths = extract_key_frames(vid_path, tmp_dir)
        if not frame_paths:
            return {
                "passed": False,
                "overall": 0.0,
                "scores": {"likeness": 0, "prop_integrity": 0, "motion_fluidity": 0, "staging_cleanliness": 0},
                "failure_tags": ["ffmpeg_decode_failed"],
                "notes": "Could not extract frames from video.",
            }
        imgs = [Image.open(p).convert("RGB") for p in frame_paths]
        props = move_meta.get("held_props", [])
        prompt_text = (
            "You are an automated QA judge for 2D hand-painted JRPG battle animations. "
            f"Character: {item.get('character_id')}. Move: {item.get('move_id')}. "
            f"Expected held props: {props}. "
            "Inspect these 3 frames (start, middle, end) and return ONLY valid JSON with keys: "
            "likeness (1-10), prop_integrity (1-10), motion_fluidity (1-10), staging_cleanliness (1-10), "
            "failure_tags (list of short snake_case strings, empty if clean), notes (one short sentence). "
            "Penalize extra characters, background scenery, morphed/missing props, or broken anatomy."
        )
        try:
            resp = client.models.generate_content(model=model, contents=[prompt_text] + imgs)
            data = parse_json_response(resp.text)
            s_like = float(data.get("likeness", 0))
            s_prop = float(data.get("prop_integrity", 0))
            s_mot = float(data.get("motion_fluidity", 0))
            s_stg = float(data.get("staging_cleanliness", 0))
            overall = round((s_like + s_prop + s_mot + s_stg) / 4.0, 2)
            tags = data.get("failure_tags", [])
            passed = overall >= PASS_THRESHOLD
            return {
                "passed": passed,
                "overall": overall,
                "scores": {
                    "likeness": s_like,
                    "prop_integrity": s_prop,
                    "motion_fluidity": s_mot,
                    "staging_cleanliness": s_stg,
                },
                "failure_tags": tags,
                "notes": data.get("notes", ""),
                "gate": gate,
            }
        except Exception as exc:
            print(f"[qa_videos] API ERROR on {item.get('character_id')}/{item.get('move_id')}: {exc}", flush=True)
            return {
                "passed": False,
                "overall": 0.0,
                "scores": {"likeness": 0, "prop_integrity": 0, "motion_fluidity": 0, "staging_cleanliness": 0},
                "failure_tags": ["qa_api_error"],
                "notes": str(exc),
            }

def main():
    queue = load_json(QUEUE_PATH, {"updated_at": "", "items": []})
    packets = load_json(PACKETS_PATH, {"moves": []})
    move_lookup = build_move_lookup(packets)
    pass1_ids = set(move_lookup.keys())
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    drafts = [
        i for i in queue.get("items", [])
        if i.get("stage") == "battle_move_draft" and i.get("move_id") in pass1_ids
    ]
    print(f"[qa_videos] auditing {len(drafts)} Pass-1 battle_move_draft item(s) with {QA_MODEL}", flush=True)

    results = []
    passed_count = 0
    failed_ids = []

    for item in drafts:
        mid = item.get("move_id", "")
        meta = move_lookup.get(mid, {})
        grade = grade_video(client, QA_MODEL, item, meta)
        item["qa_passed"] = grade["passed"]
        item["qa_overall"] = grade["overall"]
        item["qa_scores"] = grade["scores"]
        item["qa_failure_tags"] = grade["failure_tags"]
        item["qa_notes"] = grade["notes"]
        item["qa_gate"] = grade.get("gate")
        item["status"] = "qa_passed" if grade["passed"] else "qa_failed"

        if grade["passed"]:
            passed_count += 1
        else:
            failed_ids.append(f"{item.get('character_id')}/{mid} ({grade['overall']})")

        for m in packets.get("moves", []):
            if m.get("id") == mid:
                m["qa_scores"] = {**grade["scores"], "overall": grade["overall"]}
                m["failure_tags"] = grade["failure_tags"]
                m["lifecycle_state"] = "DRAFT_REVIEW" if grade["passed"] else "ANCHORED"

        results.append({
            "id": item.get("id"),
            "character_id": item.get("character_id"),
            "move_id": mid,
            "used_prop_start_frame": item.get("used_prop_start_frame", False),
            **grade,
        })
        print(f"[qa_videos] {item.get('character_id')}/{mid}: passed={grade['passed']} overall={grade['overall']} tags={grade['failure_tags']}", flush=True)

    queue["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    save_json(QUEUE_PATH, queue)
    save_json(PACKETS_PATH, packets)
    save_json(REPORT_PATH, {
        "generated_at": queue["updated_at"],
        "total_audited": len(drafts),
        "passed": passed_count,
        "failed": len(drafts) - passed_count,
        "failed_list": failed_ids,
        "results": results,
    })
    print(f"[qa_videos] DONE: {passed_count}/{len(drafts)} passed. Failed: {failed_ids}", flush=True)

if __name__ == "__main__":
    main()
