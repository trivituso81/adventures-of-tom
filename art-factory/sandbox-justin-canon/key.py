#!/usr/bin/env python3
"""Local keying (no Bria): green-dominance matte, tight thresholds, despill. Reads raw.mp4, writes justin-bb-basic-alpha.webm. Usage: key.py START SECONDS"""
import sys, subprocess, numpy as np, os
H = os.path.dirname(os.path.abspath(__file__)); t0, dur = sys.argv[1], sys.argv[2]
W, Hh = 1904, 1088
dec = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-ss', t0, '-t', dur, '-i', H + '/raw.mp4', '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '%dx%d' % (W, Hh), '-r', '24', '-i', '-', '-c:v', 'libvpx-vp9',
                        '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '26', '-auto-alt-ref', '0', H + '/justin-bb-basic-alpha.webm'], stdin=subprocess.PIPE)
n = 0; FS = W * Hh * 3
while True:
    b = dec.stdout.read(FS)
    if len(b) < FS: break
    f = np.frombuffer(b, np.uint8).reshape(Hh, W, 3).astype(np.int32)
    r, g, bl = f[..., 0], f[..., 1], f[..., 2]
    dom = g - np.maximum(r, bl)                      # background is strongly green dominant; skin, cloth, denim, brown and yellow props are not
    a = np.clip((70 - dom) * 255 // 30, 0, 255)      # fully clear at dominance >= 70, fully opaque at <= 40
    g2 = np.minimum(g, np.maximum(r, bl) + 6)        # despill: pull stray green out of edge pixels
    out = np.dstack([r, g2, bl, a]).astype(np.uint8)
    enc.stdin.write(out.tobytes()); n += 1
enc.stdin.close(); enc.wait(); print('frames', n)
