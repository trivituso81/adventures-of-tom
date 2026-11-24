import json
import os
import shutil
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
import fal_client
from google import genai
from google.genai import types
from PIL import Image
from art_director_agent import ANTI_RING_NEG, IDLE_NEG, build_prompt, describe_child_geometry, get_character, load_manifest, resolve_move_prompts
from qa_judge_agent import judge_candidate

def load_queue(path):
    p = Path(path)
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return {"updated_at": "", "items": []}

def save_queue(path, data):
    data["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2) + chr(10), encoding="utf-8")

def download_file(url, dest):
    r = requests.get(url, timeout=180)
    r.raise_for_status()
    Path(dest).write_bytes(r.content)

def strip_audio_if_present(video_path):
    p = Path(video_path)
    tmp = p.with_name(p.stem + "_silent" + p.suffix)
    try:
        r = subprocess.run(
            ["ffmpeg", "-y", "-i", str(p), "-c:v", "copy", "-an", str(tmp)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if r.returncode == 0 and tmp.exists() and tmp.stat().st_size > 0:
            tmp.replace(p)
            print(f"[video] stripped audio track -> {p.name}", flush=True)
        elif tmp.exists():
            tmp.unlink()
    except Exception as exc:
        print(f"[video] ffmpeg audio strip skipped: {exc}", flush=True)

def build_ref_contents(prompt, char, cfg):
    contents = []
    style_p = Path(cfg["style_key_path"])
    tom_p = Path(cfg["tom_hero_path"])
    char_p = Path(cfg["refs_dir"]) / f"{char['id']}.png"
    if style_p.exists():
        contents.append("GAME STYLE REFERENCE (replicate this EXACT hand-painted art style: bold dark ink contour lines, chunky brushed shading in clear tones, warm golden top-left light, rich saturated colors, large gentle simplified eyes, and ~4-heads-tall storybook proportions. Ignore its magenta background; use flat #808080 mid-grey):")
        contents.append(Image.open(style_p))
    if tom_p.exists() and (not style_p.exists() or tom_p.read_bytes() != style_p.read_bytes()):
        contents.append("PROPORTION ANCHOR CHARACTER (match head scale and painted finish; do NOT copy face, hair, clothes, or background color):")
        contents.append(Image.open(tom_p))
    if char_p.exists():
        contents.append("SUBJECT PHOTO OF THE PERSON TO PAINT (extract only facial likeness, hair, and age; translate into the exact bold-outline chunky painted style above, and follow the specified outfit):")
        contents.append(Image.open(char_p))
    contents.append(prompt)
    return contents

def generate_still(client, prompt, model, size_label, char, cfg):
    contents = build_ref_contents(prompt, char, cfg)
    try:
        resp = client.models.generate_content(
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(response_modalities=["IMAGE"], image_config=types.ImageConfig(image_size=size_label))
        )
        for part in resp.candidates[0].content.parts:
            if getattr(part, "inline_data", None) and part.inline_data.data:
                return part.inline_data.data, "gemini"
        raise RuntimeError("Gemini returned no image bytes")
    except Exception as exc:
        if not char.get("child_bridge"):
            raise
        ref_photo = Path(cfg["refs_dir"]) / f"{char['id']}.png"
        geom = describe_child_geometry(client, ref_photo, cfg["models"]["flash_bridge"]) if ref_photo.exists() else ""
        flux_prompt = f"{prompt} {geom}".strip()
        out = fal_client.subscribe(cfg["models"]["flux_fallback"], arguments={"prompt": flux_prompt, "image_size": "square_hd"})
        url = out["images"][0]["url"]
        return requests.get(url, timeout=120).content, f"flux_bridge ({type(exc).__name__})"

def cutout_still(raw_path, rgba_path, cfg):
    up_url = fal_client.upload_file(str(raw_path))
    res = fal_client.subscribe(cfg["models"]["cutout_still"], arguments={"image_url": up_url})
    img_url = res.get("image", {}).get("url") or res.get("url")
    download_file(img_url, rgba_path)

def prep_video_source(src_path, out_dir, cfg):
    rgba_p = out_dir / "source_rgba.png"
    cutout_still(src_path, rgba_p, cfg)
    fg = Image.open(rgba_p).convert("RGBA")
    pad_x = max(48, int(fg.width * 0.25))
    pad_top = max(32, int(fg.height * 0.12))
    pad_bot = max(24, int(fg.height * 0.08))
    canvas = Image.new("RGBA", (fg.width + pad_x * 2, fg.height + pad_top + pad_bot), (128, 128, 128, 255))
    canvas.alpha_composite(fg, (pad_x, pad_top))
    clean_p = out_dir / "source_grey.png"
    canvas.convert("RGB").save(clean_p)
    return clean_p

def resolve_hero_source(char, cfg, allow_fallback=True):
    approved = Path(cfg["output_dir"]) / char["id"] / "hero" / "approved_rgba.png"
    if approved.exists():
        return approved
    if char["id"] == "tom" and Path(cfg["tom_hero_path"]).exists():
        return Path(cfg["tom_hero_path"])
    ref_p = Path(cfg["refs_dir"]) / f"{char['id']}.png"
    if ref_p.exists():
        return ref_p
    staged = Path(cfg["staging_dir"]) / char["id"] / "hero" / "cand_0_rgba.png"
    if staged.exists():
        return staged
    if allow_fallback:
        return Path(cfg["tom_hero_path"])
    return None

def run_stills(stage, char, cfg, feedback, queue):
    count = 8 if stage == "hero" else 1
    size_label = "2K" if stage == "hero" else "4K"
    out_dir = Path(cfg["staging_dir"]) / char["id"] / stage
    out_dir.mkdir(parents=True, exist_ok=True)
    tom_face_px = None
    for it in queue["items"]:
        if it.get("character_id") == "tom" and it.get("metrics", {}).get("face_h_px"):
            tom_face_px = it["metrics"]["face_h_px"]
    def make_one(idx):
        client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        hint = ""
        for attempt in range(1, cfg["max_self_heal_retries"] + 1):
            prompt = build_prompt(stage, char, cfg, feedback=feedback, extra_hint=hint)
            raw_p = out_dir / f"cand_{idx}_raw.png"
            rgba_p = out_dir / f"cand_{idx}_rgba.png"
            img_bytes, engine = generate_still(client, prompt, cfg["models"]["stills"], size_label, char, cfg)
            raw_p.write_bytes(img_bytes)
            cutout_still(raw_p, rgba_p, cfg)
            ok, metrics, repair = judge_candidate(raw_p, rgba_p, char, cfg, tom_face_px, client)
            print(f"[cand {idx} attempt {attempt}] ok={ok} metrics={metrics}", flush=True)
            if ok or attempt == cfg["max_self_heal_retries"]:
                return {
                    "id": f"{char['id']}_{stage}_{idx}",
                    "character_id": char["id"],
                    "stage": stage,
                    "candidate_index": idx,
                    "engine": engine,
                    "qa_passed": ok,
                    "attempts": attempt,
                    "metrics": metrics,
                    "raw_path": str(raw_p),
                    "rgba_path": str(rgba_p),
                    "status": "review"
                }
            hint = repair
    with ThreadPoolExecutor(max_workers=min(4, count)) as ex:
        survivors = list(ex.map(make_one, range(count)))
    queue["items"] = [i for i in queue["items"] if not (i["character_id"] == char["id"] and i["stage"] == stage)] + survivors
    save_queue(cfg["queue_path"], queue)

def generate_video_item(stage, char, cfg, move_id, feedback, hero_src):
    slug = f"{stage}_{move_id}" if move_id else stage
    out_dir = Path(cfg["staging_dir"]) / char["id"] / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"[video:{char['id']}] source hero={hero_src}", flush=True)
    clean_src = prep_video_source(hero_src, out_dir, cfg)
    img_url = fal_client.upload_file(str(clean_src))
    if stage == "battle_idle":
        prompt = build_prompt(stage, char, cfg, move_id=move_id, feedback=feedback)
        print(f"[video:{char['id']}] calling {cfg['models']['video_idle']} (4s, audio off)", flush=True)
        try:
            res = fal_client.subscribe(cfg["models"]["video_idle"], arguments={"prompt": prompt, "negative_prompt": IDLE_NEG, "start_image_url": img_url, "end_image_url": img_url, "duration": "4", "generate_audio": False})
        except Exception as e1:
            print(f"[video:{char['id']}] kling start/end retry: {e1}", flush=True)
            res = fal_client.subscribe(cfg["models"]["video_idle"], arguments={"prompt": prompt, "negative_prompt": IDLE_NEG, "start_image_url": img_url, "duration": "4", "generate_audio": False})
    else:
        res_tag = "480p" if stage == "battle_move_draft" else "1080p"
        prompt, neg_prompt = resolve_move_prompts(stage, char, cfg, move_id=move_id, feedback=feedback)
        print(f"[video:{char['id']}] calling {cfg['models']['video_move']} ({res_tag}, move={move_id or 'custom'})", flush=True)
        try:
            res = fal_client.subscribe(cfg["models"]["video_move"], arguments={"prompt": prompt, "negative_prompt": neg_prompt, "start_image_url": img_url, "resolution": res_tag})
        except Exception as e1:
            print(f"[video:{char['id']}] wan image_url retry: {e1}", flush=True)
            res = fal_client.subscribe(cfg["models"]["video_move"], arguments={"prompt": prompt, "negative_prompt": neg_prompt, "image_url": img_url, "resolution": res_tag})
    vid_url = res.get("video", {}).get("url") or res.get("url")
    print(f"[video:{char['id']}] generated raw video={vid_url}", flush=True)
    try:
        bg_res = fal_client.subscribe(cfg["models"]["cutout_video"], arguments={"video_url": vid_url, "background_color": "Transparent", "output_container_and_codec": "webm_vp9"})
    except Exception as e2:
        print(f"[video:{char['id']}] bria fallback: {e2}", flush=True)
        bg_res = fal_client.subscribe(cfg["models"]["cutout_video_fallback"], arguments={"video_url": vid_url})
    alpha_url = bg_res.get("video", {}).get("url") or bg_res.get("url")
    print(f"[video:{char['id']}] alpha video={alpha_url}", flush=True)
    raw_vid = out_dir / "raw_alpha.webm"
    download_file(alpha_url, raw_vid)
    strip_audio_if_present(raw_vid)
    return {
        "id": f"{char['id']}_{slug}",
        "character_id": char["id"],
        "stage": stage,
        "move_id": move_id,
        "raw_video_path": str(raw_vid),
        "needs_encode": True,
        "status": "encoding"
    }

def run_video(stage, char, cfg, move_id, feedback, queue):
    hero_src = resolve_hero_source(char, cfg, allow_fallback=True)
    item = generate_video_item(stage, char, cfg, move_id, feedback, hero_src)
    queue["items"] = [i for i in queue["items"] if i["id"] != item["id"]] + [item]
    save_queue(cfg["queue_path"], queue)

def run_batch_video(stage, manifest, cfg, move_id, feedback, queue):
    slug = f"{stage}_{move_id}" if move_id else stage
    targets = []
    for c in manifest["cast"]:
        if c["id"] in ("all_uploaded", "npcs", "dogs"):
            continue
        approved_vid = Path(cfg["output_dir"]) / c["id"] / slug / "approved.webm"
        if approved_vid.exists():
            print(f"[batch] skipping {c['id']} (already approved)", flush=True)
            continue
        hero_src = resolve_hero_source(c, cfg, allow_fallback=False)
        if not hero_src:
            print(f"[batch] skipping {c['id']} (no Hero PNG in art-factory/refs/{c['id']}.png)", flush=True)
            continue
        targets.append((c, hero_src))
    if not targets:
        print("[batch] no unapproved characters with uploaded Hero PNGs found.", flush=True)
        return
    print(f"[batch] starting {stage} for {len(targets)} character(s): {[c['id'] for c, _ in targets]}", flush=True)
    def worker(pair):
        c, src = pair
        try:
            return generate_video_item(stage, c, cfg, move_id, feedback, src)
        except Exception as exc:
            print(f"[batch] FAILED {c['id']}: {exc}", flush=True)
            return None
    with ThreadPoolExecutor(max_workers=min(3, len(targets))) as ex:
        results = [r for r in ex.map(worker, targets) if r is not None]
    for item in results:
        queue["items"] = [i for i in queue["items"] if i["id"] != item["id"]] + [item]
    save_queue(cfg["queue_path"], queue)
    print(f"[batch] queued {len(results)}/{len(targets)} character(s) for Safari/WebM alpha encoding.", flush=True)

def run_approve(char_id, cand_idx, feedback, cfg, queue):
    target_stage = feedback.strip() or "hero"
    matches = [i for i in queue["items"] if i["character_id"] == char_id and i["stage"] == target_stage and str(i.get("candidate_index", 0)) == str(cand_idx)]
    if not matches:
        matches = [i for i in queue["items"] if i["character_id"] == char_id and i["id"].endswith(target_stage)]
    if not matches:
        raise RuntimeError(f"No queued candidate for {char_id}/{target_stage} idx={cand_idx}")
    it = matches[0]
    slug = f"{it['stage']}_{it['move_id']}" if it.get("move_id") else it["stage"]
    dst_dir = Path(cfg["output_dir"]) / char_id / slug
    dst_dir.mkdir(parents=True, exist_ok=True)
    for k, name in [("rgba_path", "approved_rgba.png"), ("raw_path", "approved_raw.png"), ("webm_path", "approved.webm"), ("safari_mp4_path", "approved_safari_hvc1.mp4")]:
        if it.get(k) and Path(it[k]).exists():
            shutil.copy2(it[k], dst_dir / name)
    it["status"] = "approved"
    save_queue(cfg["queue_path"], queue)

def main():
    manifest = load_manifest()
    cfg = manifest["config"]
    stage = os.environ["STAGE"]
    char_id = os.environ["CHARACTER_ID"]
    move_id = os.environ.get("MOVE_ID", "")
    feedback = os.environ.get("FEEDBACK", "")
    cand_idx = os.environ.get("CANDIDATE_INDEX", "0")
    queue = load_queue(cfg["queue_path"])
    if stage == "approve":
        run_approve(char_id, cand_idx, feedback, cfg, queue)
        return
    if char_id == "all_uploaded":
        if stage in ("battle_idle", "battle_move_draft", "battle_move_final"):
            run_batch_video(stage, manifest, cfg, move_id, feedback, queue)
            return
        raise RuntimeError("Batch mode supports video stages only (battle_idle, battle_move_draft, battle_move_final).")
    char = get_character(manifest, char_id)
    if stage == "revise":
        stage = "hero"
    if stage in ("hero", "turnaround", "sheets"):
        run_stills(stage, char, cfg, feedback, queue)
    elif stage in ("battle_idle", "battle_move_draft", "battle_move_final"):
        run_video(stage, char, cfg, move_id, feedback, queue)

if __name__ == "__main__":
    main()
