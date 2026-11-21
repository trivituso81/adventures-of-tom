#!/usr/bin/env python3
"""Grump Hollow muffin wrapper trail (hollowtrail1; the bake remade in fix-gatelayer-pics). Two parts:

BAKE  tools/sprite-bake/bake_hollow_trail.py into a temp folder. Checks: nine wrappers in all (the story's nine), stage n shows only the
      wrappers of legs n to 4 (9, 6, 4, 2), each wrapper is small (WIDE, well under a child's height) and lands on its spot, everything away
      from the wrappers is the live plate, data/hollow-trail.js lists the four stages, the baked files in art/ match a fresh bake.
GAME  in the browser: the trail stage follows the flags (0 before the Mudling fight, 1 to 4 as the trail monsters fall, 4 once ch1-spot plays,
      0 after chapter 1); the plate shows the stage painting; beating a trail monster sets its flag and the next goal (which counts the
      wrappers Grace picked up); every Hollow monster starts west of the fence and none steps into it; the Mudling scene leaves the trail on
      and draws no wrapper prop.
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
base = np.array(Image.open(os.path.join(ROOT, 'art/hollow.webp')).convert('RGB')).astype(int)
check('nine wrappers in all', len(B.WRAPPERS) == 9)
check('legs hold 3, 2, 2, 2 wrappers in trail order', [sum(1 for w in B.WRAPPERS if w[0] == n) for n in (1, 2, 3, 4)] == [3, 2, 2, 2]
      and [w[0] for w in B.WRAPPERS] == sorted(w[0] for w in B.WRAPPERS))
check('a wrapper is small: about half a tile, under half of Tom\'s height (84 plate px)', B.WIDE <= 36)
tmp = tempfile.mkdtemp()
r = subprocess.run([sys.executable, os.path.join(HERE, 'sprite-bake', 'bake_hollow_trail.py')], capture_output=True, text=True,
                   env=dict(os.environ, HOLLOW_TRAIL_OUT=tmp))
print('   ', r.stdout.strip()[-200:], r.stderr.strip()[-300:])
check('bake ran', r.returncode == 0)
for n in (1, 2, 3, 4):
    f = os.path.join(tmp, 'art', f'hollow-trail{n}.webp')
    if not os.path.exists(f): check(f'stage {n} written', False); continue
    out = np.array(Image.open(f).convert('RGB')).astype(int); d = np.abs(out - base).max(2) > 40
    cnt, lab = cv2.connectedComponents(cv2.dilate(d.astype(np.uint8), np.ones((9, 9), np.uint8)))
    want = [(x, y) for leg, x, y in B.WRAPPERS if leg >= n]
    blobs = [np.argwhere(lab == i) for i in range(1, cnt)]; blobs = [b for b in blobs if len(b) > 30]
    check(f'stage {n}: {len(blobs)} wrappers on the ground (want {len(want)})', len(blobs) == len(want))
    widths = [b[:, 1].max() - b[:, 1].min() for b in blobs]
    check(f'stage {n}: each wrapper under 50 plate px wide (widest {max(widths) if widths else 0})', widths and max(widths) < 50)
    near = sum(any(abs(b[:, 1].mean() - x * B.TILE) < 24 and abs(b[:, 0].mean() - y * B.TILE) < 24 for b in blobs) for x, y in want)
    check(f'stage {n}: every wrapper on its spot ({near} of {len(want)})', near == len(want))
    far = np.ones(d.shape, bool)
    for x, y in [(x, y) for _, x, y in B.WRAPPERS]: far[int(y * B.TILE) - 40:int(y * B.TILE) + 40, int(x * B.TILE) - 40:int(x * B.TILE) + 40] = False
    diff = np.abs(out - base).max(2)[far]
    check(f'stage {n}: away from the wrappers it is the live plate (99.5th pct diff {np.percentile(diff, 99.5):.0f}, webp)', np.percentile(diff, 99.5) <= 12)
    live = os.path.join(ROOT, 'art', f'hollow-trail{n}.webp')
    check(f'stage {n}: art/hollow-trail{n}.webp matches a fresh bake', os.path.exists(live) and open(live, 'rb').read() == open(f, 'rb').read())
idx = open(os.path.join(tmp, 'data', 'hollow-trail.js')).read() if os.path.exists(os.path.join(tmp, 'data', 'hollow-trail.js')) else ''
check('data/hollow-trail.js lists the four stages', all(f"{n}:'art/hollow-trail{n}.webp?v=ht" in idx for n in (1, 2, 3, 4)))
check('data/hollow-trail.js in the repo matches the fresh bake', open(os.path.join(ROOT, 'data', 'hollow-trail.js')).read() == idx)
if os.path.exists(os.path.join(tmp, 'tools', 'shots', 'hollow-trail-check.png')):
    shutil.copy(os.path.join(tmp, 'tools', 'shots', 'hollow-trail-check.png'), os.path.join(SHOTS, 'hollow-trail-bake.png'))
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
    pg.wait_for_timeout(1200)
    check('stage 1 painting shown (all nine wrappers)', ev("()=>PLATE_VARIANT.hollow()===HOLLOW_TRAIL[1]&&PLATES.hollow.src===HOLLOW_TRAIL[1]"))
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
    check('goal moved to the top left corner and counts the wrappers picked up', ev("()=>/picked up 3 wrappers.*top left corner/.test(flag('goal')||'')"))
    beat('grump'); check('Grump alone: still stage 2', ev("()=>hollowTrailStage()===2"))
    beat('toad'); check('Toad too: Log already down, so stage 4', ev("()=>hollowTrailStage()===4"))
    check('goal moved east to the fishing spot', ev("()=>/fishing spot/.test(flag('goal')||'')"))
    ev("()=>setFlag('ch1-beat:log',false)"); check('without the Log: stage 3', ev("()=>hollowTrailStage()===3"))
    ev("()=>setFlag('ch1-spot')"); check('boss scene started: stage 4 whatever is left', ev("()=>hollowTrailStage()===4"))
    ev("()=>setFlag('ch1-spot',false)")
    # an installed stage painting is shown, swapped in with no blank frame; a broken one falls back to the base
    ev("()=>{ window.__ht3=HOLLOW_TRAIL[3]; HOLLOW_TRAIL[3]='art/hollow.webp?v=trailswaptest'; }"); pg.wait_for_timeout(1500)
    check('stage 3 painting shown once loaded', ev("()=>PLATES.hollow.src==='art/hollow.webp?v=trailswaptest'&&PLATES.hollow.ready&&!!PLATES.hollow.img"))
    ev("()=>{ HOLLOW_TRAIL[3]='art/no-such-trail.webp'; }"); pg.wait_for_timeout(1500)
    check('a painting that fails to load leaves a painting up', ev("()=>PLATES.hollow.ready&&!!PLATES.hollow.img&&PLATES.hollow.src!=='art/no-such-trail.webp'"))
    ev("()=>{ delete HOLLOW_TRAIL[3]; }"); pg.wait_for_timeout(1200)
    check('no painting for the stage: back to the base plate', ev("()=>PLATES.hollow.src===PLATES.hollow.baseSrc"))
    ev("()=>{ HOLLOW_TRAIL[3]=window.__ht3; }"); pg.wait_for_timeout(1200)
    check('stage 3 painting (four wrappers left) shown', ev("()=>PLATES.hollow.src===HOLLOW_TRAIL[3]"))
    pg.screenshot(path=os.path.join(SHOTS, 'hollow-trail-stage3-portrait.png'))
    ev("()=>{ STORY.chapter=2; }"); check('after chapter 1: no trail', ev("()=>hollowTrailStage()===0")); ev("()=>{ STORY.chapter=1; }")
    pg.set_viewport_size({'width': 860, 'height': 430}); pg.wait_for_timeout(800)
    pg.screenshot(path=os.path.join(SHOTS, 'hollow-trail-landscape.png'))
    br.close()
bad = [e for e in errs if 'no-such-trail' not in e]
check('no page errors (%s)' % (bad[:2],), not bad)
print('hollow_trail_test:', 'FAIL ' + str(fails) if fails else 'all passed')
sys.exit(1 if fails else 0)
