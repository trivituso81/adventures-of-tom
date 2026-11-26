#!/usr/bin/env python3
"""scripts/auto_trim.py: cut a raw 5.0 s clip after the strike, where the figure has settled.

The cut frame is searched only inside 2.6 s to 4.0 s and only AFTER the frame of the biggest silhouette change (the strike). Inside that window it is
the frame where optical flow is lowest and the Frame 0 silhouette IoU is highest (score = iou - 0.5 * flow / max flow). The cut is a hard cut: no
crossfade, no fade out, the kept frames are the raw frames 0..cut, untouched. Spends nothing.

  python3 scripts/auto_trim.py raw.mp4 trimmed.mp4 [--json report.json]"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from video_metrics import bg_estimate, fg_mask, flow_series, iou, load_frames

WINDOW_SEC = (2.6, 4.0)
FLOW_WEIGHT = 0.5


def find_cut(frames, fps):
    """frames: small BGR frames of the raw clip. Returns the report dict (cut_frame is the LAST kept frame index)."""
    n = len(frames)
    masks = [fg_mask(f) for f in frames]
    iou0 = [iou(m, masks[0]) for m in masks]
    flow = flow_series(frames)
    k = np.ones(5) / 5.0
    smooth = np.convolve(np.pad(flow, 2, mode="edge"), k, mode="valid")
    ref = max(float(max(smooth)), 1e-9)
    lo, hi = int(round(WINDOW_SEC[0] * fps)), min(int(round(WINDOW_SEC[1] * fps)), n - 1)
    if hi < lo:                                   # a clip shorter than the window: the last 40 percent
        lo = max(1, int(0.6 * (n - 1)))
        hi = n - 1
    peak = int(np.argmax([1.0 - v for v in iou0[:hi + 1]]))
    cands = [t for t in range(lo, hi + 1) if t > peak] or list(range(lo, hi + 1))
    score = {t: iou0[t] - FLOW_WEIGHT * float(smooth[t]) / ref for t in cands}
    cut = max(cands, key=lambda t: (score[t], t))
    return {"cut_frame": int(cut), "kept_frames": int(cut + 1), "cut_sec": round((cut + 1) / fps, 3), "peak_frame": peak,
            "window_frames": [lo, hi], "iou_at_cut": round(iou0[cut], 4), "flow_at_cut": round(float(smooth[cut]), 4),
            "score": round(score[cut], 4), "frames_in": n, "fps": fps, "crossfade": False}


def hard_cut(src, dst, kept_frames):
    """The first kept_frames raw frames, re-encoded near-losslessly (no filters, no fades)."""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-frames:v", str(kept_frames), "-an", "-c:v", "libx264", "-preset", "veryfast",
                    "-crf", "12", "-pix_fmt", "yuv420p", str(dst)], check=True)


def auto_trim(src, dst):
    frames, fps = load_frames(src, max_w=480)
    rep = find_cut(frames, fps)
    hard_cut(src, dst, rep["kept_frames"])
    return rep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--json")
    a = ap.parse_args()
    rep = auto_trim(a.src, a.dst)
    print(json.dumps(rep))
    if a.json:
        Path(a.json).write_text(json.dumps(rep, indent=2) + "\n")


if __name__ == "__main__":
    main()
