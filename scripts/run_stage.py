import json
import os
import shutil
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests
import fal_client
from google import genai
from google.genai import types
from PIL import Image
from art_director_agent import ANTI_RING_NEG, build_prompt, describe_child_geometry, get_character, load_manifest
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

def run_video(stage, char, cfg, move_id, feedback, queue):
    slug = f"{stage}_{move_id}" if move_id else stage
    out_dir = Path(cfg["staging_dir"]) / char["id"] / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    hero_src = Path(cfg["output_dir"]) / char["id"] / "hero" / "approved_rgba.png"
    if not hero_src.exists():
        if char["id"] == "tom" and Path(cfg["tom_hero_path"]).exists():
            hero_src = Path(cfg["tom_hero_path"])
        elif (Path(cfg["refs_dir"]) / f"{char['id']}.png").exists():
            hero_src = Path(cfg["refs_dir"]) / f"{char['id']}.png"
        elif (Path(cfg["staging_dir"]) / char["id"] / "hero" / "cand_0_rgba.png").exists():
            hero_src = Path(cfg["staging_dir"]) / char["id"] / "hero" / "cand_0_rgba.png"
        else:
            hero_src = Path(cfg["tom_hero_path"])
    print(f"[video] source hero={hero_src}", flush=True)
    clean_src = prep_video_source(hero_src, out_dir, cfg)
    img_url = fal_client.upload_file(str(clean_src))
    prompt = build_prompt(stage, char, cfg, move_id=move_id, feedback=feedback)
    if stage == "battle_idle":
        print(f"[video] calling {cfg['models']['video_idle']} (audio off)", flush=True)
        try:
            res = fal_client.subscribe(cfg["models"]["video_idle"], arguments={"prompt": prompt, "start_image_url": img_url, "end_image_url": img_url, "duration": "5", "generate_audio": False})
        except Exception as e1:
            print(f"[video] kling start/end retry: {e1}", flush=True)
            res = fal_client.subscribe(cfg["models"]["video_idle"], arguments={"prompt": prompt, "start_image_url": img_url, "duration": "5", "generate_audio": False})
    else:
        res_tag = "480p" if stage == "battle_move_draft" else "1080p"
        print(f"[video] calling {cfg['models']['video_move']} ({res_tag})", flush=True)
        res = fal_client.subscribe(cfg["models"]["video_move"], arguments={"prompt": prompt, "negative_prompt": ANTI_RING_NEG, "start_image_url": img_url, "resolution": res_tag})
    vid_url = res.get("video", {}).get("url") or res.get("url")
    print(f"[video] generated raw video={vid_url}", flush=True)
    try:
        bg_res = fal_client.subscribe(cfg["models"]["cutout_video"], arguments={"video_url": vid_url, "background_color": "Transparent", "output_container_and_codec": "webm_vp9"})
    except Exception as e2:
        print(f"[video] bria fallback: {e2}", flush=True)
        bg_res = fal_client.subscribe(cfg["models"]["cutout_video_fallback"], arguments={"video_url": vid_url})
    alpha_url = bg_res.get("video", {}).get("url") or bg_res.get("url")
    print(f"[video] alpha video={alpha_url}", flush=True)
    raw_vid = out_dir / "raw_alpha.webm"
    download_file(alpha_url, raw_vid)
    item = {
        "id": f"{char['id']}_{slug}",
        "character_id": char["id"],
        "stage": stage,
        "move_id": move_id,
        "raw_video_path": str(raw_vid),
        "needs_encode": True,
        "status": "encoding"
    }
    queue["items"] = [i for i in queue["items"] if i["id"] != item["id"]] + [item]
    save_queue(cfg["queue_path"], queue)

def run_approve(char_id, cand_idx, feedback, cfg, queue):
    target_stage = feedback.strip() or "hero"
    matches = [i for i in queue["items"] if i["character_id"] == char_id and i["stage"] == target_stage and str(i.get("candidate_index", 0)) == str(cand_idx)]
    if not matches:
        raise RuntimeError(f"No queued candidate for {char_id}/{target_stage} idx={cand_idx}")
    it = matches[0]
    dst_dir = Path(cfg["output_dir"]) / char_id / target_stage
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
    char = get_character(manifest, char_id)
    if stage == "revise":
        stage = "hero"
    if stage in ("hero", "turnaround", "sheets"):
        run_stills(stage, char, cfg, feedback, queue)
    elif stage in ("battle_idle", "battle_move_draft", "battle_move_final"):
        run_video(stage, char, cfg, move_id, feedback, queue)

if __name__ == "__main__":
    main()
