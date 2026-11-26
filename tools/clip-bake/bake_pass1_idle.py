#!/usr/bin/env python3
"""tools/clip-bake/bake_pass1_idle.py: bake Justin's existing battle_idle video (art-factory/staging/justin/battle_idle/raw_alpha.webm, Art Factory run 18)
into the loop clip pf-justin-idle, his resting picture in the Battle Lab PASS-1 DRAFT REVIEW. No paid call. The loop plays forward then backward.
  python3 tools/clip-bake/bake_pass1_idle.py <tag>"""
import os, sys, subprocess, tempfile, shutil, re
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bake_factory as bf
ROOT = bf.ROOT
tag = sys.argv[1] if len(sys.argv) > 1 else 'idle1'
webm = os.path.join(ROOT, 'art-factory', 'staging', 'justin', 'battle_idle', 'raw_alpha.webm')
tmp = tempfile.mkdtemp()
try:
    fs = bf.frames(webm, tmp); n = len(fs)
    mkv = bf.magenta(fs, tmp)
    last = ((n - 1) // bf.STEP) * bf.STEP
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'clip-bake', 'bake_clip.py'), mkv, 'pf-justin-idle', 'justin', '--kind', 'loop',
                        '--first', '0', '--last', str(last), '--step', str(bf.STEP), '--fig-rows', str(bf.FIG['justin']), '--speed', '1', '--fps', str(bf.FPS),
                        '--stamp', 'Justin battle_idle video art-factory/staging/justin/battle_idle/raw_alpha.webm frames 0-%d' % last, '--tag', tag], cwd=ROOT, capture_output=True, text=True)
    print((r.stdout + r.stderr)[-500:])
    if r.returncode: sys.exit(1)
    ix = os.path.join(ROOT, 'index.html'); html = open(ix, encoding='utf-8').read(); t = 'data/clips/pf-justin-idle.js'
    if t in html: html = re.sub(re.escape(t) + r'\?v=[A-Za-z0-9_.-]+', t + '?v=' + tag, html)
    else:
        a = 'data/clips/pf-justin-bb-basic.js'; m = re.search(r'<script src="' + re.escape(a) + r'[^"]*"></script>\n', html)
        html = html.replace(m.group(0), m.group(0) + '<script src="%s?v=%s"></script>\n' % (t, tag), 1)
    open(ix, 'w', encoding='utf-8').write(html)
finally:
    shutil.rmtree(tmp, ignore_errors=True)
