"""scripts/video_metrics.py: the measuring helpers shared by auto_trim.py and qa_gate_v2.py. Works on RAW mp4 files (no alpha): the figure mask is
every pixel that differs from the frame's own flat background colour. Spends nothing."""
import json
import subprocess

import cv2
import numpy as np

FG_DIST = 38          # RGB distance from the frame's own background colour that counts as figure
MIN_COMPONENT = 0.01  # connected specks below 1% of the figure area are matting noise


def probe(path):
    """{duration, fps, width, height, frames} of a video via ffprobe (duration is the container's, in seconds)."""
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
                          "stream=width,height,r_frame_rate,nb_read_frames,duration:format=duration", "-of", "json", str(path)],
                         capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    s = j["streams"][0]
    num, den = (s.get("r_frame_rate") or "24/1").split("/")
    fps = float(num) / float(den or 1)
    frames = int(s.get("nb_read_frames") or 0)
    dur = float(s.get("duration") or j.get("format", {}).get("duration") or (frames / fps if fps else 0))
    return {"duration": dur, "fps": fps, "width": int(s["width"]), "height": int(s["height"]), "frames": frames}


def load_frames(path, max_w=None):
    """Every frame as a BGR uint8 array (optionally shrunk to max_w wide for measuring) and the fps."""
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        if max_w and f.shape[1] > max_w:
            f = cv2.resize(f, (max_w, int(round(f.shape[0] * max_w / f.shape[1]))), interpolation=cv2.INTER_AREA)
        frames.append(f)
    cap.release()
    return frames, fps


def bg_estimate(frame):
    """The frame's own background colour: the median of the top, left and right border strips (feet and floor shadow are at the bottom, so it is left out)."""
    h, w = frame.shape[:2]
    top, side = max(2, int(h * 0.06)), max(2, int(w * 0.04))
    px = np.concatenate([frame[:top].reshape(-1, 3), frame[:, :side].reshape(-1, 3), frame[:, -side:].reshape(-1, 3)])
    return np.median(px, axis=0)


def fg_mask(frame, bg=None, dist=FG_DIST):
    bg = bg_estimate(frame) if bg is None else bg
    d = np.linalg.norm(frame.astype(np.int16) - bg.astype(np.int16), axis=2)
    m = (d > dist).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    if n > 2:
        total = int(m.sum())
        keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] >= MIN_COMPONENT * total]
        m = np.isin(lab, keep).astype(np.uint8)
    return m.astype(bool)


def iou(a, b):
    union = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / union) if union else 1.0


def flow_series(frames, width=160):
    """Mean optical-flow magnitude between each frame and the one before it (Farneback); index 0 is 0."""
    gray = []
    for f in frames:
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        g = cv2.resize(g, (width, int(round(g.shape[0] * width / g.shape[1]))), interpolation=cv2.INTER_AREA)
        gray.append(g)
    out = [0.0]
    for a, b in zip(gray[:-1], gray[1:]):
        fl = cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        out.append(float(np.linalg.norm(fl, axis=2).mean()))
    return out
