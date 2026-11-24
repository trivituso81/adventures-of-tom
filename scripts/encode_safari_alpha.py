import json
import subprocess
import time
from pathlib import Path

def encode_pair(src_path):
    src = Path(src_path)
    webm_out = src.with_name("battle_alpha.webm")
    mp4_out = src.with_name("battle_alpha_safari_hvc1.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-i", str(src),
        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "2M", "-auto-alt-ref", "0",
        str(webm_out)
    ], check=True)
    subprocess.run([
        "ffmpeg", "-y", "-i", str(src),
        "-c:v", "hevc_videotoolbox", "-alpha_quality", "0.75", "-vtag", "hvc1", "-pix_fmt", "bgra",
        str(mp4_out)
    ], check=True)
    return str(webm_out), str(mp4_out)

def main():
    q_path = Path("art-factory/queue.json")
    if not q_path.exists():
        print("No queue.json found; nothing to encode.")
        return
    queue = json.loads(q_path.read_text(encoding="utf-8"))
    changed = False
    for item in queue.get("items", []):
        if item.get("needs_encode") and item.get("raw_video_path") and Path(item["raw_video_path"]).exists():
            webm_p, mp4_p = encode_pair(item["raw_video_path"])
            item["webm_path"] = webm_p
            item["safari_mp4_path"] = mp4_p
            item["needs_encode"] = False
            item["status"] = "review"
            changed = True
    if changed:
        queue["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        q_path.write_text(json.dumps(queue, indent=2) + chr(10), encoding="utf-8")

if __name__ == "__main__":
    main()
