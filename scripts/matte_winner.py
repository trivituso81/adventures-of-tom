#!/usr/bin/env python3
"""scripts/matte_winner.py: neural video matting of the ONE winning seed, the alpha clamp, the two encodes and the checkerboard proof.

  matte(trimmed_mp4, out_dir, fal_client, ledger)   bria/video/background-removal (fallback fal-ai/birefnet/v2/video) on the trimmed winner only
  clamp_alpha(frames)                                hole-filled mask eroded inward: the eroded interior is forced to alpha=255 so hands and the yellow prop are 100 percent opaque
  encode(out_dir, fps)                               VP9 yuva420p .webm, and the Safari HEVC hvc1 .mp4 with alpha (macOS VideoToolbox only; skipped elsewhere and said so)
  checkerboard(frames, path)                         8 frames, 4x2, over a grey and white checkerboard so any alpha hole is visible

No chroma key anywhere: the matte is the model's. Used by scripts/benchmark_run.py."""
import glob
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import requests
from PIL import Image
from scipy import ndimage

ERODE_FRAC = 0.006       # interior erosion radius as a share of the frame height (at least 3 px)
YELLOW_RESCUE_DILATE = 4


def decode_rgba(video, tmp):
    """Every frame as RGBA png; the VP9 alpha needs ffmpeg's libvpx decoder."""
    for decoder in (["-c:v", "libvpx-vp9"], []):
        for old in glob.glob(f"{tmp}/a*.png"):
            Path(old).unlink()
        subprocess.run(["ffmpeg", "-v", "error", "-y", *decoder, "-i", str(video), "-pix_fmt", "rgba", f"{tmp}/a%04d.png"], check=False)
        files = sorted(glob.glob(f"{tmp}/a*.png"))
        if files:
            return files
    return []


BLACK_MAX = 14           # the birefnet video fallback returns the cut-out over opaque black: that border-connected black is the background


def ensure_alpha(rgba):
    """A frame whose alpha is fully opaque came from a matte model that painted the background black (birefnet video). Make the
    border-connected near-black region transparent, with a short ramp at its edge, so the cut-out has a real alpha."""
    if rgba[..., 3].min() < 250:
        return rgba, False
    mx = rgba[..., :3].max(2)
    bg = ndimage.binary_dilation(ndimage.label(mx <= BLACK_MAX)[0] > 0, iterations=0)
    lab, _ = ndimage.label(mx <= BLACK_MAX)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = np.bincount(lab.ravel())
    big = {i for i in range(1, len(sizes)) if sizes[i] >= 200}      # a gap between an arm and the body is background too
    bg = np.isin(lab, list(edge | big))
    out = rgba.copy()
    out[..., 3][bg] = 0
    ring = ndimage.binary_dilation(bg, iterations=2) & ~bg
    ramp = np.clip((mx.astype(np.float32) - BLACK_MAX) / 30.0, 0, 1) * 255
    out[..., 3][ring] = np.maximum(ramp[ring], 40).astype(np.uint8)
    return out, True


def clamp_frame(rgba):
    """rgba: HxWx4 uint8. Returns (clamped array, interior pixel count)."""
    a = rgba[..., 3]
    m = ndimage.binary_fill_holes(a > 128)
    r = max(3, int(round(ERODE_FRAC * a.shape[0])))
    interior = ndimage.binary_erosion(m, structure=np.ones((3, 3), bool), iterations=r)
    out = rgba.copy()
    out[..., 3][interior] = 255
    # yellow props: strongly yellow, saturated pixels just inside the figure's own outline stay opaque too
    rgb = rgba[..., :3].astype(np.float32) / 255.0
    mx, mn = rgb.max(2), rgb.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    yellow = (sat > 0.5) & (mx > 0.6) & (rgb[..., 0] > 0.6) & (rgb[..., 1] > 0.5) & (rgb[..., 2] < 0.45)
    near = ndimage.binary_dilation(m, iterations=YELLOW_RESCUE_DILATE) & (a > 8)
    out[..., 3][yellow & near] = 255
    return out, int(interior.sum())


def checkerboard(frames, path, n=8, cols=4, tile_w=384, sq=16):
    idx = [int(round(i)) for i in np.linspace(0, len(frames) - 1, n)]
    ims = [Image.fromarray(frames[i]).convert("RGBA") for i in idx]
    h = int(round(ims[0].height * tile_w / ims[0].width))
    rows = (n + cols - 1) // cols
    sheet = Image.new("RGB", (tile_w * cols, h * rows), (255, 255, 255))
    yy, xx = np.mgrid[0:h, 0:tile_w]
    board = np.where(((yy // sq) + (xx // sq)) % 2 == 0, 200, 255).astype(np.uint8)
    board = Image.fromarray(np.dstack([board] * 3)).convert("RGBA")
    for k, im in enumerate(ims):
        t = im.resize((tile_w, h), Image.LANCZOS)
        tile = board.copy()
        tile.alpha_composite(t)
        sheet.paste(tile.convert("RGB"), ((k % cols) * tile_w, (k // cols) * h))
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path)
    return idx


def encode(frames_dir, out_dir, fps):
    out_dir = Path(out_dir)
    webm, mp4 = out_dir / "winner_alpha.webm", out_dir / "winner_alpha_safari_hvc1.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", f"{frames_dir}/c%04d.png", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
                    "-b:v", "2M", "-auto-alt-ref", "0", str(webm)], check=True)
    note = "ok"
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-i", f"{frames_dir}/c%04d.png", "-c:v", "hevc_videotoolbox", "-alpha_quality", "0.75",
                        "-vtag", "hvc1", "-pix_fmt", "bgra", str(mp4)], capture_output=True, text=True)
    if r.returncode:
        note = "safari hvc1 skipped: " + (r.stderr or "no hevc_videotoolbox")[-160:].replace("\n", " ")
        if mp4.exists():
            mp4.unlink()
    return str(webm), (str(mp4) if mp4.exists() else None), note


def download(url, dest):
    r = requests.get(url, timeout=300)
    r.raise_for_status()
    Path(dest).write_bytes(r.content)


def matte_remote(trimmed_mp4, out_path, fal_client, models):
    """bria first, birefnet video when bria fails. Returns (path, model used)."""
    url = fal_client.upload_file(str(trimmed_mp4))
    try:
        res = fal_client.subscribe(models["cutout_video"], arguments={"video_url": url, "background_color": "Transparent", "output_container_and_codec": "webm_vp9"})
        used = models["cutout_video"]
    except Exception as exc:
        print(f"[matte] {models['cutout_video']} failed ({exc}); trying {models['cutout_video_fallback']}", flush=True)
        res = fal_client.subscribe(models["cutout_video_fallback"], arguments={"video_url": url})
        used = models["cutout_video_fallback"]
    vurl = res.get("video", {}).get("url") or res.get("url")
    download(vurl, out_path)
    return out_path, used


def finish(alpha_webm, out_dir, fps):
    """Clamp every frame, write c%04d.png, encode both containers, write the 8-frame checkerboard. Returns the report."""
    out_dir = Path(out_dir)
    work = out_dir / "_frames"
    work.mkdir(parents=True, exist_ok=True)
    files = decode_rgba(alpha_webm, str(work))
    if not files:
        raise RuntimeError("could not decode the matted video")
    frames, holes_fixed = [], 0
    for i, f in enumerate(files):
        raw = np.asarray(Image.open(f).convert("RGBA"))
        raw, keyed = ensure_alpha(raw)
        cl, _ = clamp_frame(raw)
        holes_fixed += int(((cl[..., 3] == 255) & (raw[..., 3] < 250)).sum())
        Image.fromarray(cl).save(work / f"c{i + 1:04d}.png")
        frames.append(cl)
    webm, mp4, note = encode(work, out_dir, fps)
    board = out_dir / "alpha_checkerboard_8.png"
    idx = checkerboard(frames, board)
    shutil.rmtree(work, ignore_errors=True)
    return {"frames": len(frames), "pixels_made_opaque_by_clamp": holes_fixed, "webm": webm, "safari_mp4": mp4, "safari_note": note,
            "checkerboard": str(board), "checkerboard_frames": idx}


if __name__ == "__main__":
    rep = finish(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 24.0)
    print(json.dumps(rep, indent=2))
