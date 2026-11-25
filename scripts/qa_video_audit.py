import json
import math
import os
import time
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw
from google import genai
from google.genai import types

DEFAULT_AUDIT_MODEL = os.environ.get("QA_AUDIT_MODEL", "gemini-4-hydrogen")
SAMPLE_FPS = 4.0
MAX_AUDIT_FRAMES = 32


def _resolve_video_path(item):
    for key in ("webm_path", "raw_video_path", "safari_mp4_path"):
        p = item.get(key)
        if p and Path(p).exists():
            return Path(p)
    return None


def extract_frames_at_fps(video_path, target_fps=SAMPLE_FPS, max_frames=MAX_AUDIT_FRAMES):
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video for QA audit: {video_path}")
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    step = max(1, int(round(src_fps / target_fps)))
    frames = []
    timestamps = []
    idx = 0
    while True:
        ok, bgr = cap.read()
        if not ok:
            break
        if idx % step == 0:
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            frames.append(rgb)
            timestamps.append(round(idx / src_fps, 2))
        idx += 1
    cap.release()
    if len(frames) > max_frames:
        picks = np.linspace(0, len(frames) - 1, max_frames, dtype=int)
        frames = [frames[i] for i in picks]
        timestamps = [timestamps[i] for i in picks]
    meta = {
        "src_fps": round(float(src_fps), 2),
        "total_frames": total_frames,
        "sampled_frames": len(frames),
        "duration_sec": round(total_frames / src_fps, 2) if src_fps else 0.0,
    }
    return frames, timestamps, meta


def run_opencv_checks(frames):
    if len(frames) < 2:
        return {"motion_mean": 0.0, "border_clip_ratio": 1.0, "flags": ["too_few_frames"]}
    diffs = []
    border_hits = 0
    for i in range(1, len(frames)):
        diffs.append(float(np.mean(np.abs(frames[i].astype(np.float32) - frames[i - 1].astype(np.float32)))))
    for rgb in frames:
        h, w, _ = rgb.shape
        bg = np.median(np.concatenate([rgb[0, :, :], rgb[-1, :, :]], axis=0), axis=0)
        dist = np.linalg.norm(rgb.astype(np.float32) - bg.astype(np.float32), axis=2)
        fg = dist > 26.0
        edge = np.concatenate([fg[0, :], fg[-1, :], fg[:, 0], fg[:, -1]])
        if float(np.mean(edge)) > 0.04:
            border_hits += 1
    motion_mean = round(float(np.mean(diffs)), 3)
    border_clip_ratio = round(border_hits / max(1, len(frames)), 3)
    flags = []
    if motion_mean < 1.2:
        flags.append("static_clip")
    if border_clip_ratio > 0.25:
        flags.append("border_clip")
    return {
        "motion_mean": motion_mean,
        "border_clip_ratio": border_clip_ratio,
        "flags": flags,
    }


def build_qa_strip(frames, timestamps, out_path, title, failure_tags):
    if not frames:
        return None
    picks = frames if len(frames) <= 8 else [frames[i] for i in np.linspace(0, len(frames) - 1, 8, dtype=int)]
    t_picks = timestamps if len(timestamps) <= 8 else [timestamps[i] for i in np.linspace(0, len(timestamps) - 1, 8, dtype=int)]
    cols = 4
    rows = math.ceil(len(picks) / cols)
    tw, th = 320, 180
    header = 52
    sheet = Image.new("RGB", (cols * tw, header + rows * th), (18, 22, 32))
    draw = ImageDraw.Draw(sheet)
    tag_str = ", ".join(failure_tags) if failure_tags else "none"
    draw.text((12, 8), f"QA FAIL: {title}", fill=(248, 113, 113))
    draw.text((12, 28), f"Tags: {tag_str}", fill=(250, 204, 21))
    for idx, (rgb, ts) in enumerate(zip(picks, t_picks)):
        im = Image.fromarray(rgb).resize((tw, th), Image.Resampling.LANCZOS)
        x = (idx % cols) * tw
        y = header + (idx // cols) * th
        sheet.paste(im, (x, y))
        draw.rectangle([x + 4, y + 4, x + 76, y + 22], fill=(0, 0, 0))
        draw.text((x + 8, y + 7), f"{ts:.2f}s", fill=(255, 255, 255))
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path)
    return str(out_path)


def _gemini_video_judge(client, frames, timestamps, item, packet, cv_metrics):
    char_id = item.get("character_id", "")
    move_id = item.get("move_id", item.get("stage", ""))
    props = (packet or {}).get("held_props", [])
    pitch = (packet or {}).get("pitch", {})
    dog_rule = "STRICT QUADRUPED LOCK: Nara must stay on all four paws with zero bipedal posture or speaking." if char_id == "nara" else ""
    prompt = (
        f"You are the strict QA Video Auditor for The Adventures of Tom 2D storybook JRPG battle animations.\n"
        f"Audit these frames sampled at {SAMPLE_FPS} FPS for character='{char_id}', move='{move_id}'.\n"
        f"Expected held_props: {props}. Expected 3-beat pitch: {json.dumps(pitch)}. {dog_rule}\n"
        f"OpenCV metrics: {json.dumps(cv_metrics)}.\n"
        f"Return strict JSON with keys: qa_scores (likeness, prop_integrity, motion_fluidity, staging_cleanliness, overall from 0.0 to 5.0), "
        f"failure_tags (list from: static_clip, border_clip, prop_morph, bipedal_dog, halo_ring, camera_drift, face_drift, incomplete_recovery, extra_limbs), "
        f"passed (bool; false if overall < 3.8 or any critical defect), repair_hint (one concise sentence for Wan prompt repair)."
    )
    contents = [prompt]
    for rgb, ts in zip(frames, timestamps):
        contents.append(f"Frame at {ts:.2f}s:")
        contents.append(Image.fromarray(rgb))
    resp = client.models.generate_content(
        model=DEFAULT_AUDIT_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    raw = (resp.text or "{}").strip()
    return json.loads(raw)


def _load_slice_packets(slice_path="art-factory/move-packets-slice.json"):
    p = Path(slice_path)
    if not p.exists():
        return None, {}
    data = json.loads(p.read_text(encoding="utf-8"))
    by_id = {m["id"]: m for m in data.get("moves", []) if "id" in m}
    return data, by_id


def audit_queue_items(queue, char_id="", move_id="", slice_path="art-factory/move-packets-slice.json"):
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    slice_doc, packets_by_id = _load_slice_packets(slice_path)
    slice_dirty = False
    audited = 0
    failed = 0
    for item in queue.get("items", []):
        if item.get("stage") not in ("battle_idle", "battle_move_draft", "battle_move_final", "battle_state_draft", "battle_state_final"):
            continue
        if char_id and char_id != "all_uploaded" and item.get("character_id") != char_id:
            continue
        if move_id and item.get("move_id") != move_id:
            continue
        vid_path = _resolve_video_path(item)
        if not vid_path:
            continue
        frames, timestamps, meta = extract_frames_at_fps(vid_path, SAMPLE_FPS)
        cv_metrics = run_opencv_checks(frames)
        packet = packets_by_id.get(item.get("move_id"))
        verdict = _gemini_video_judge(client, frames, timestamps, item, packet, cv_metrics)
        tags = sorted(set(cv_metrics.get("flags", [])) | set(verdict.get("failure_tags", [])))
        scores = verdict.get("qa_scores", {})
        overall = float(scores.get("overall", 0.0) or 0.0)
        passed = bool(verdict.get("passed", False)) and not cv_metrics.get("flags") and overall >= 3.8
        item["qa_passed"] = passed
        item["qa_scores"] = scores
        item["failure_tags"] = tags
        item["qa_repair_hint"] = verdict.get("repair_hint", "")
        item["qa_meta"] = {**meta, **cv_metrics, "model": DEFAULT_AUDIT_MODEL, "audited_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        item["status"] = "review" if passed else "qa_failed"
        if not passed:
            failed += 1
            strip_path = vid_path.parent / "qa_strip.png"
            item["qa_strip_path"] = build_qa_strip(frames, timestamps, strip_path, item["id"], tags)
        if packet is not None:
            packet["qa_scores"] = scores
            packet["failure_tags"] = tags
            if passed and packet.get("lifecycle_state") in ("IDEA", "PITCH_REVIEW", "ANCHORED"):
                packet["lifecycle_state"] = "DRAFT_REVIEW"
            slice_dirty = True
        audited += 1
        print(f"[qa_audit] {item['id']} passed={passed} overall={overall} tags={tags}", flush=True)
    if slice_dirty and slice_doc is not None:
        Path(slice_path).write_text(json.dumps(slice_doc, indent=2) + "\n", encoding="utf-8")
    print(f"[qa_audit] completed: audited={audited} failed={failed}", flush=True)
    return audited, failed
