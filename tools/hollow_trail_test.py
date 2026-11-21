#!/usr/bin/env python3
"""Grump Hollow muffin wrapper trail (hollowtrail1). Two parts:

BAKE  for each stage, a stand-in for the generator's picture (the Hollow painting with nine cream wrappers painted along that leg, softened,
      shifted and squeezed onto a square canvas) goes through tools/sprite-bake/bake_hollow_trail.py into a temp folder. Checks: it lines up,
      every wrapper lands where it was painted, everything outside the leg's strip is the live plate pixel for pixel, data/hollow-trail.js
      lists the stage.
GAME  in the browser: the trail stage follows the flags (0 before the Mudling fight, 1 to 4 as the trail monsters fall, 4 once ch1-spot plays,
      0 after chapter 1); the plate shows the stage painting when one is installed and the base painting when not; beating a trail monster
      sets its flag and the next goal; every Hollow monster starts west of the fence and none steps into it; the Mudling scene leaves the
      trail on and draws no wrapper prop.
Usage: python3 tools/hollow_trail_test.py   (shots: tools/shots/hollow-trail-*.png)
"""
import functools, http.server, os, shutil, socketserver, subprocess, sys, tempfile, threading
import numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
sys.path.insert(0, os.path.join(HERE, 'sprite-bake'))
import bake_hollow_trail as B
fails = []
def check(name, ok):
    print(('ok   ' if ok else 'FAIL ') + name)
    if not ok: fails.append(name)

# ---------------- BAKE ----------------
src0 = Image.open(os.path.join(ROOT, 'art/raw/areas/area-hollow-v4.png')).convert('RGB')
SW, SH = src0.size; kx, ky = SW / B.PW, SH / B.PH
base = np.array(Image.open(os.path.join(ROOT, 'art/hollow.webp')).convert('RGB'))
for n in ((1, 2, 3, 4) if not os.environ.get("SKIP_BAKE") else ()):
    pts = np.array(B.ROUTES[n]) * B.TILE
    seg = np.cumsum([0] + [np.hypot(*(pts[i + 1] - pts[i])) for i in range(len(pts) - 1)])
    spots = []
    for t in np.linspace(0, seg[-1], 9):   # nine wrappers spread along the leg
        i = min(np.searchsorted(seg, t, 'right') - 1, len(pts) - 2); f = (t - seg[i]) / max(1e-6, seg[i + 1] - seg[i])
        spots.append(pts[i] + f * (pts[i + 1] - pts[i]))
    pic = np.array(src0).copy()
    for x, y in spots:
        c = (int(x * kx), int(y * ky))
        cv2.ellipse(pic, c, (22, 13), 0, 0, 360, (236, 222, 184), -1); cv2.ellipse(pic, c, (22, 13), 0, 0, 360, (150, 120, 80), 2)
    pic = cv2.GaussianBlur(pic, (0, 0), .8)
    pic = np.clip(pic.astype(int) + 4, 0, 255).astype(np.uint8)
    pic = cv2.resize(pic, (1024, 1024), interpolation=cv2.INTER_AREA)   # squeezed onto a square canvas
    M = cv2.getRotationMatrix2D((512, 512), .6, 1.0); M[:, 2] += (7, -5)   # and nudged
    pic = cv2.warpAffine(pic, M, (1024, 1024), borderMode=cv2.BORDER_REFLECT)
    tmp = tempfile.mkdtemp(); sp = os.path.join(tmp, 'in.png'); Image.fromarray(pic).save(sp)
    r = subprocess.run([sys.executable, os.path.join(HERE, 'sprite-bake', 'bake_hollow_trail.py'), str(n)], capture_output=True, text=True,
                       env=dict(os.environ, HOLLOW_TRAIL_OUT=tmp, HOLLOW_TRAIL_SRC=sp))
    print('   ', r.stdout.strip()[-200:], r.stderr.strip()[-300:])
    check(f'bake {n}: installed', r.returncode == 0 and os.path.exists(os.path.join(tmp, 'art', f'hollow-trail{n}.webp')))
    if r.returncode: continue
    out = np.array(Image.open(os.path.join(tmp, 'art', f'hollow-trail{n}.webp')).convert('RGB')).astype(int)
    strip = B.corridor(n)
    outside = np.abs(out - base.astype(int)).max(2)[~strip]
    check(f'bake {n}: outside the strip is the live plate (max diff {outside.max()}, webp)', np.percentile(outside, 99.5) <= 12)
    hit = 0
    for x, y in spots:
        x, y = int(x), int(y); px = out[y - 3:y + 4, x - 3:x + 4].reshape(-1, 3).mean(0)
        hit += int(px[0] > 200 and px[1] > 190 and px[2] > 150)
    check(f'bake {n}: {hit} of 9 wrappers land where they were painted', hit >= 8)
    idx = open(os.path.join(tmp, 'data', 'hollow-trail.js')).read()
    check(f'bake {n}: data/hollow-trail.js lists stage {n}', f"{n}:'art/hollow-trail{n}.webp?v=ht" in idx)
    shutil.copy(os.path.join(tmp, 'tools', 'shots', f'hollow-trail{n}-check.png'), os.path.join(SHOTS, f'hollow-trail-bake{n}.png'))
    shutil.rmtree(tmp)

# ---------------- GAME ----------------
from playwright.sync_api import sync_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
errs = []
with sync_playwright() as pw:
    br = pw.chromium.launch(args=['--headless=new', '--no-proxy-server'])
    pg = br.new_page(viewport={'width': 430, 'height': 860})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    ev = pg.evaluate
    for i in range(600):   # the chapter's opening scenes
        if ev("()=>!intro.active&&!dialog.active"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(60)
    check('chapter 1', ev("()=>STORY.chapter===1&&STORY.mode==='full'&&!intro.active"))
    check('no wrapper prop kind left', ev("()=>typeof SPK==='undefined'||!SPK.papers"))
    # the Mudling scene: walk in after the theft, win the fight, the trail switches on
    ev("()=>{ setFlag('ch1-theft'); for(const f of ['ch1-t1','ch1-trail','ch1-tuts']) setFlag(f,false); __LE.go('hollow'); }"); pg.wait_for_timeout(1200)
    ev("()=>{ player.x=6; player.y=19; player.move=null; }")
    for i in range(500):
        if ev("()=>flag('ch1-tuts')===true&&!intro.active&&!dialog.active"): break
        if ev("()=>battle.active"): ev("()=>{ if(battle.active&&typeof b2End==='function'&&!battle.ending) { battle.ending=true; b2End('win'); } }"); pg.wait_for_timeout(600); continue
        pg.keyboard.press('Enter'); pg.wait_for_timeout(90)
    check('Mudling scene played to the end', ev("()=>flag('ch1-tuts')===true"))
    check('trail on: stage 1', ev("()=>flag('ch1-trail')===true&&hollowTrailStage()===1"))
    check('goal names the wrappers', ev("()=>/muffin wrappers/.test(flag('goal')||'')"))
    check('no stage painting installed yet: base plate', ev("()=>PLATE_VARIANT.hollow()===null&&/art\\/hollow\\.webp/.test(PLATES.hollow.src)"))
    pg.screenshot(path=os.path.join(SHOTS, 'hollow-trail-stage1-portrait.png'))
    # fence and spots
    check('every ordinary Hollow monster starts west of the fence (x<13)', ev("()=>currentMap.npcs.concat(currentMap.fallen||[]).filter(n=>n.monster&&!b7IsBoss(n)).every(n=>(n.home||n).x<13)"))
    check('Hollow has a monster fence over the boss trigger', ev("()=>JSON.stringify(currentMap.monsterFence)==='[13,0,23,21]'"))
    check('fence blocks a step at x 13, not at x 12', ev("()=>b7Fenced(13,11)&&!b7Fenced(12,11)"))
    ev("()=>{ player.x=12; player.y=11; player.move=null; }")   # bait the Log toward the boss side and run the monsters for a while
    pg.wait_for_timeout(6000)
    check('no monster stepped into the fence while chasing', ev("()=>currentMap.npcs.filter(n=>n.monster&&!b7IsBoss(n)).every(n=>n.x<13&&(!n.move||n.move.tx<13))"))
    # stages follow beaten monsters, out of order too
    def beat(m): ev(f"()=>{{ const n=currentMap.npcs.find(x=>x.monster==='{m}'); if(n) monsterFall(n); else storyMonsterFell({{monster:'{m}'}}); }}")
    beat('log'); check('Log first: still stage 1 (the trail goes in order)', ev("()=>hollowTrailStage()===1&&flag('ch1-beat:log')===true"))
    beat('skeeter'); check('Skeeter beaten: stage 2', ev("()=>hollowTrailStage()===2"))
    check('goal moved to the top left corner', ev("()=>/top left corner/.test(flag('goal')||'')"))
    beat('grump'); check('Grump alone: still stage 2', ev("()=>hollowTrailStage()===2"))
    beat('toad'); check('Toad too: Log already down, so stage 4', ev("()=>hollowTrailStage()===4"))
    check('goal moved east to the fishing spot', ev("()=>/fishing spot/.test(flag('goal')||'')"))
    ev("()=>setFlag('ch1-beat:log',false)"); check('without the Log: stage 3', ev("()=>hollowTrailStage()===3"))
    ev("()=>setFlag('ch1-spot')"); check('boss scene started: stage 4 whatever is left', ev("()=>hollowTrailStage()===4"))
    ev("()=>setFlag('ch1-spot',false)")
    # an installed stage painting is shown, swapped in with no blank frame; a broken one falls back to the base
    ev("()=>{ HOLLOW_TRAIL[3]='art/hollow.webp?v=trailswaptest'; }"); pg.wait_for_timeout(1500)
    check('stage 3 painting shown once loaded', ev("()=>PLATES.hollow.src==='art/hollow.webp?v=trailswaptest'&&PLATES.hollow.ready&&!!PLATES.hollow.img"))
    ev("()=>{ HOLLOW_TRAIL[3]='art/no-such-trail.webp'; }"); pg.wait_for_timeout(1500)
    check('a painting that fails to load leaves a painting up', ev("()=>PLATES.hollow.ready&&!!PLATES.hollow.img&&PLATES.hollow.src!=='art/no-such-trail.webp'"))
    ev("()=>{ delete HOLLOW_TRAIL[3]; }"); pg.wait_for_timeout(1200)
    check('no painting for the stage: back to the base plate', ev("()=>PLATES.hollow.src===PLATES.hollow.baseSrc"))
    ev("()=>{ STORY.chapter=2; }"); check('after chapter 1: no trail', ev("()=>hollowTrailStage()===0")); ev("()=>{ STORY.chapter=1; }")
    pg.set_viewport_size({'width': 860, 'height': 430}); pg.wait_for_timeout(800)
    pg.screenshot(path=os.path.join(SHOTS, 'hollow-trail-landscape.png'))
    br.close()
bad = [e for e in errs if 'no-such-trail' not in e]
check('no page errors (%s)' % (bad[:2],), not bad)
print('hollow_trail_test:', 'FAIL ' + str(fails) if fails else 'all passed')
sys.exit(1 if fails else 0)
