import json
import numpy as np
from PIL import Image

def _body_bbox_from_alpha(rgba_path):
    arr = np.array(Image.open(rgba_path).convert("RGBA"))
    ys, xs = np.where(arr[:, :, 3] > 20)
    if len(ys) == 0:
        return None, arr
    return (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())), arr

def _detect_face_height_px(rgba_path, genai_client=None, flash_model="gemini-3-flash"):
    try:
        import mediapipe as mp
        rgb = np.array(Image.open(rgba_path).convert("RGB"))
        h, w = rgb.shape[:2]
        with mp.solutions.face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.35) as fd:
            res = fd.process(rgb)
            if res.detections:
                box = res.detections[0].location_data.relative_bounding_box
                return max(1.0, float(box.height * h) * 1.25)
    except Exception:
        pass
    if genai_client is not None:
        try:
            img = Image.open(rgba_path)
            prompt = "Return ONLY JSON {\"head_ratio\": float} giving head height divided by full standing body height (0.15 to 0.40)."
            resp = genai_client.models.generate_content(model=flash_model, contents=[prompt, img])
            data = json.loads(resp.text.strip().strip("`").replace("json", "", 1))
            bbox, _ = _body_bbox_from_alpha(rgba_path)
            if bbox and "head_ratio" in data:
                return float(data["head_ratio"]) * max(1, bbox[3] - bbox[1])
        except Exception:
            pass
    return None

def check_border_and_halo(raw_path, rgba_path):
    raw = np.array(Image.open(raw_path).convert("RGB"), dtype=np.float32)
    border = np.concatenate([raw[0, :], raw[-1, :], raw[:, 0], raw[:, -1]], axis=0)
    bg_err = float(np.mean(np.abs(border - 128.0)))
    rgba = np.array(Image.open(rgba_path).convert("RGBA"), dtype=np.float32)
    alpha = rgba[:, :, 3]
    edge_mask = (alpha > 15) & (alpha < 240)
    halo_score = 0.0
    if np.any(edge_mask):
        edge_rgb = rgba[edge_mask][:, :3]
        maxc = edge_rgb.max(axis=1)
        minc = edge_rgb.min(axis=1)
        sat = (maxc - minc) / np.maximum(maxc, 1.0)
        bright_sat = (maxc > 215.0) & (sat > 0.45)
        halo_score = float(np.mean(bright_sat))
    return {"bg_error": round(bg_err, 2), "halo_score": round(halo_score, 4)}

def judge_candidate(raw_path, rgba_path, char, cfg, tom_face_px=None, genai_client=None):
    bbox, _ = _body_bbox_from_alpha(rgba_path)
    if not bbox:
        return False, {"error": "empty_cutout"}, "Ensure full standing character is visible and centered."
    body_h = max(1, bbox[3] - bbox[1])
    face_px = _detect_face_height_px(rgba_path, genai_client, cfg["models"]["flash_bridge"])
    head_ratio = round(face_px / body_h, 4) if face_px else None
    lo, hi = char["head_ratio"]
    bh = check_border_and_halo(raw_path, rgba_path)
    hints = []
    passed = True
    if head_ratio is not None and not (lo - 0.025 <= head_ratio <= hi + 0.025):
        passed = False
        hints.append(f"Adjust head-to-body ratio into {int(lo*100)}%-{int(hi*100)}% (got {int(head_ratio*100)}%).")
    if char["group"] == "adult" and not char.get("anchor") and tom_face_px and face_px:
        diff = abs(face_px - tom_face_px) / tom_face_px
        if diff > cfg.get("adult_face_height_tolerance", 0.04):
            passed = False
            hints.append(f"Match Tom adult face height within +/-4% (delta {diff*100:.1f}%).")
    if bh["bg_error"] > 32.0:
        passed = False
        hints.append("Keep flat uniform #808080 mid-grey studio background with no gradients or shadows.")
    if bh["halo_score"] > 0.18:
        passed = False
        hints.append("Remove bright glowing outline, neon ring, or rim-light halo around silhouette.")
    metrics = {"body_h_px": body_h, "face_h_px": round(face_px, 1) if face_px else None, "head_ratio": head_ratio, **bh}
    return passed, metrics, " ".join(hints)
