# Gate layer test (gatelayer1, Tom 2026-11-20: "a separate layer for door art and separate art for unlocked and locked doors ... they should never
# overlap the character"). Checks, in the real game:
#   1. registry: every map gate that names `art` names a real site on that map; every closed entrance of an overworld map has art (the one
#      allowed exception is Gate Zero's doors, a building interior drawn as its own object); the site rectangle lies inside the map and on the gate;
#      each state's picture exists (locked) or has its Art Library entry waiting (open); no orphan pictures; Library entries carry the bake line.
#   2. state: locked while the gate's story condition holds, open once it does not (every site, the chapters on both sides of each gate), and the
#      Nine Scoops gates cover every exit tile they guard (they used to miss the pier path and one stair column).
#   3. depth: in one draw() call the gate picture is drawn BEFORE Tom and every follower standing on, or south of, the site rectangle, so it can
#      never cover a character; with the player on every tile of the rectangle and the row below.
#   4. pixels: with the picture in place the frame differs from the same frame without it (the picture really shows), in portrait and landscape,
#      and the player's own pixels are identical with and without the picture (nothing painted over Tom). Frames go to tools/shots/gate-*.png.
# Usage: python3 tools/gate_art_test.py            (all checks, writes tools/shots/gate-<site>-<state>-<portrait|landscape>.png)
#        python3 tools/gate_art_test.py --grid     (also writes tools/shots/gate-grid-<site>.png: the painting around each site with a half-tile grid,
#                                                   to read the rectangle off when a site's picture is placed or resized)
import threading, http.server, socketserver, functools, os, sys, json, base64, io, re, glob
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def check(name, ok):
    if not ok: fails.append(name); print('FAIL ' + name)

# (site, chapter, flags, expected state): both sides of every gate's story condition
STATES = [
    ('town-hollow', 1, {}, 'locked'), ('town-hollow', 1, {'ch1-theft': 1}, 'open'), ('town-hollow', 2, {}, 'open'),
    ('town-school', 1, {}, 'locked'), ('town-school', 5, {}, 'locked'), ('town-school', 5, {'ch5-goal': 1}, 'open'), ('town-school', 6, {}, 'open'),
    ('row-pier', 1, {}, 'locked'), ('row-pier', 3, {}, 'locked'), ('row-pier', 3, {'ch3-boppy': 1}, 'open'), ('row-pier', 4, {}, 'open'),
    ('row-amyhouse', 1, {}, 'locked'), ('row-amyhouse', 2, {}, 'open'),
    ('blvd-trail', 2, {}, 'locked'), ('blvd-trail', 2, {'ch2-source': 1}, 'open'), ('blvd-trail', 3, {}, 'open'),
    ('blvd-studio', 3, {}, 'locked'), ('blvd-studio', 4, {}, 'open'),
    ('jpark-oak', 5, {}, 'locked'), ('jpark-oak', 6, {'ch6-nara': 1}, 'open'), ('jpark-oak', 7, {}, 'open'),
    ('jpark-barn', 7, {}, 'locked'), ('jpark-barn', 8, {'ch8-block': 1}, 'open'), ('jpark-barn', 9, {}, 'open'),
    ('backlot-stage7', 4, {}, 'locked'), ('backlot-stage7', 4, {'ch4-sets': 1}, 'open'), ('backlot-stage7', 5, {}, 'open'),
    ('stage7-catwalk', 4, {}, 'locked'), ('stage7-catwalk', 4, {'ch4-hat': 1}, 'open'),
    # Nine Scoops (chapter 21): the same pictures, on the tiles the exits are on
    ('town-school', 21, {}, 'locked'), ('row-pier', 21, {}, 'locked'),
    ('town-hollow', 21, {'ns-invite': 1}, 'locked'), ('town-hollow', 21, {'ns-fled': 1}, 'locked'),
]
# every exit tile the Nine Scoops gates must close (chapter 21, flags as listed): [map, x, y, flags]
NS_EXITS = [('row', x, 20, {}) for x in (12, 13, 14)] + [('town', x, y, {}) for x in (28, 29) for y in (5, 6)] + \
           [('town', x, y, {'ns-invite': 1}) for x in (7, 8) for y in (2, 3)] + [('town', x, y, {'ns-fled': 1}) for x in (7, 8) for y in (2, 3)]
# closed entrances that are not part of this layer: Gate Zero's doors are inside the terminal (a building interior) and are their own object
NO_ART_OK = {('terminal', 'Gate Zero doors')}

def png(pg):
    return Image.open(io.BytesIO(base64.b64decode(pg.evaluate("()=>ctx.canvas.toDataURL()").split(',')[1]))).convert('RGB')

with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    pg = br.new_page(viewport={'width': 430, 'height': 860}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; if(typeof intro!=='undefined') intro.active=false; }")

    # ---- 1. registry
    reg = pg.evaluate("()=>JSON.stringify({art:GATE_ART,v:GATE_V,worlds:Object.entries(worlds).map(([id,m])=>({id,w:m.w,h:m.h,outside:!!m.outside,plate:!!PLATES[id],exits:(m.spec&&m.spec.exits||[]).map(e=>[e[0],e[1]]),gates:((m.spec&&m.spec.gates)||[]).map(g=>({name:g.name,art:g.art||null,at:g.at,look:g.look||null,dy:g.dy===undefined?null:g.dy}))}))})")
    reg = json.loads(reg); ART = reg['art']; W = {w['id']: w for w in reg['worlds']}
    prompts = {e['id']: e for e in json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json')))['entries']}
    for site, S in ART.items():
        w = W.get(S['map']); check(f'{site}: map {S["map"]} exists', w is not None)
        if not w: continue
        x, y, rw, rh = S['rect']
        check(f'{site}: rectangle {S["rect"]} inside the {w["w"]}x{w["h"]} map', x >= 0 and y >= 0 and x + rw <= w['w'] + .01 and y + rh <= w['h'] + .01)
        gates = [g for g in w['gates'] if g['art'] == site]
        check(f'{site}: a gate on {S["map"]} names it', bool(gates))
        tiles = {(a, b) for g in gates for a, b in g['at']}
        check(f'{site}: the rectangle touches the gate tiles', any(x - 1 <= a < x + rw + 1 and y - 1 <= b < y + rh + 1 for a, b in tiles))
        check(f'{site}: states list has locked', 'locked' in S['states'] and set(S['states']) <= {'locked', 'open'})
        for st in S['states']:
            f = os.path.join(ROOT, 'art', 'gates', f'{site}-{st}.webp')
            e = prompts.get(f'prop-gate-{site}' + ('-open' if st == 'open' else ''))
            check(f'{site} {st}: Library entry exists with the bake line', bool(e) and e.get('bake', {}).get('args') == [site, st] and e['bake'].get('script') == 'bake_gate_art.py')
            if os.path.exists(f): continue
            check(f'{site} {st}: picture is missing although its Library entry is approved', not (e and e.get('status') == 'approved'))
            print(f'  pending: {site} {st} (Art Library entry {e["id"]} waits for Tom)')
    for w in reg['worlds']:
        for g in w['gates']:
            if g['look'] is not None or g['dy'] is not None: check(f'{w["id"]} gate {g["name"]}: old look/dy field is gone', False)
            if not g['art'] and w['plate'] and (w['id'], g['name']) not in NO_ART_OK: check(f'{w["id"]} gate "{g["name"]}" has no art site (closed entrance without a picture)', False)
    sites_on_disk = {re.sub(r'-(locked|open)\.webp$', '', os.path.basename(f)) + '-' + re.search(r'-(locked|open)\.webp$', f).group(1) for f in glob.glob(os.path.join(ROOT, 'art', 'gates', '*.webp'))}
    listed = {f'{s}-{st}' for s, S in ART.items() for st in S['states']}
    have = set(re.search(r"const GATE_HAVE=\[([^\]]*)\]", open(os.path.join(ROOT, 'data', 'gate-art.js'), encoding='utf-8').read()).group(1).replace("'", '').split(','))
    have.discard('')
    check(f'GATE_HAVE lists exactly the pictures in art/gates (extra {sorted(have - sites_on_disk)}, missing {sorted(sites_on_disk - have)})', have == sites_on_disk)
    check(f'no orphan pictures in art/gates: {sorted(sites_on_disk - listed)}', sites_on_disk <= listed)
    story = open(os.path.join(ROOT, 'engine', 'story.js'), encoding='utf-8').read()
    check('engine/story.js no longer draws gates (no code branch, barrier or school gate)', 'schoolgate' not in story and "look==='barrier'" not in story and 'Fallen branch' not in story)
    idx = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    check('index.html loads data/gate-art.js before engine/gate-art.js', 0 < idx.find('data/gate-art.js') < idx.find('engine/gate-art.js'))

    # ---- 2. state
    for site, ch, fl, want in STATES:
        got = pg.evaluate("""([s,ch,fl])=>{ STORY.mode='full'; STORY.chapter=ch; STORY.flags=Object.assign({},fl); currentMap=worlds[GATE_ART[s].map]; return gateState(s); }""", [site, ch, fl])
        exp = want if want in ART[site]['states'] and f'{site}-{want}' in have else None
        check(f'state {site} chapter {ch} {fl}: {got} (expected {exp})', got == exp)
    for m, x, y, fl in NS_EXITS:
        g = pg.evaluate("""([m,x,y,fl])=>{ STORY.mode='full'; STORY.chapter=21; STORY.flags=Object.assign({},fl); return !!storyGate(worlds[m],x,y); }""", [m, x, y, fl])
        check(f'Nine Scoops closes {m} ({x},{y}) {fl}', g)

    # ---- 3. depth: gate drawn before the player and the followers standing on or south of the rectangle
    ORDER_JS = """([s,ch,dx,dy])=>{ STORY.mode='full'; STORY.chapter=ch; STORY.flags={}; const S=GATE_ART[s],m=worlds[S.map]; if(!GATE_HAVE.includes(s+'-locked')) GATE_HAVE.push(s+'-locked'); currentMap=m; const [x,y,w,h]=S.rect;
      const px=Math.min(m.w-1,Math.max(0,Math.floor(x)+dx)), py=Math.min(m.h-1,Math.floor(y+h-1)+dy); player.x=px; player.y=py; player.move=null;
      followers.forEach((f,i)=>{ f.x=Math.min(m.w-1,px+(i%2?1:-1)); f.y=Math.min(m.h-1,py+1+(i>>1)); f.move=null; });
      resize(); camera.snap=true; updateCamera(1);
      const log=[]; const og=drawGateArt, oa=window.drawActorSpaced||null, od=drawActor;
      const who=a=>({n:a===player?'player':(followers.includes(a)?'follower ':'npc ')+(a.name||a.id||'?'),y:position(a).y});
      window.drawGateArt=function(o){ log.push({gate:o.site}); return og(o); };
      if(oa) window.drawActorSpaced=function(a){ log.push(who(a)); return oa(a); };
      window.drawActor=function(a){ log.push(who(a)); return od(a); };
      try { draw(performance.now()/1000); } finally { window.drawGateArt=og; if(oa) window.drawActorSpaced=oa; window.drawActor=od; }
      return {log, ry:S.rect[1], err:null}; }"""
    LOCKED_AT = {'town-hollow': 1, 'town-school': 1, 'row-pier': 1, 'row-amyhouse': 1, 'blvd-trail': 2, 'blvd-studio': 1, 'jpark-oak': 1, 'jpark-barn': 1, 'backlot-stage7': 4, 'stage7-catwalk': 4}
    for site, ch in LOCKED_AT.items():
        S = ART[site]; rw = S['rect'][2]
        pg.evaluate("(m)=>{ currentMap=worlds[m]; }", S['map'])
        pg.wait_for_function("(m)=>!!plateFor(worlds[m])", arg=S['map'], timeout=20000)   # draw() paints no objects until the painted plate has loaded
        for dx in range(0, max(1, int(rw) + 1)):
            for dy in (0, 1, 2):
                r = pg.evaluate(ORDER_JS, [site, ch, dx, dy])
                log = r['log']; gates = [i for i, l in enumerate(log) if l.get('gate') == site]
                check(f'depth {site}: gate drawn once (dx {dx}, dy {dy})', len(gates) == 1)
                if len(gates) != 1: continue
                for i, l in enumerate(log):
                    if 'n' in l and l['y'] >= r['ry'] and i < gates[0]:
                        check(f'depth {site}: {l["n"]} (row {l["y"]:.1f}) drawn BEFORE the gate, so the gate would cover it (dx {dx}, dy {dy})', False)

    # ---- 4. pixels, portrait and landscape. Tom and the two girls stand ON the gate (the hardest case for overlap). Three frames of the same view:
    #   A picture in, characters drawn   B picture out, characters drawn   C picture out, characters hidden
    # The picture shows when A differs from B. Characters are untouched when, at every pixel they cover (B differs from C), A equals B.
    HIDE = """()=>{ window.__oa=window.drawActorSpaced; window.__od=window.drawActor; const hide=a=>a===player||followers.includes(a);
      if(window.__oa) window.drawActorSpaced=function(a){ if(!hide(a)) return window.__oa(a); }; window.drawActor=function(a){ if(!hide(a)) return window.__od(a); }; }"""
    SHOW = "()=>{ if(window.__oa) window.drawActorSpaced=window.__oa; window.drawActor=window.__od; }"
    for orient in ('portrait', 'landscape'):
        if orient == 'landscape':
            pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800)
        for site, ch in LOCKED_AT.items():
            S = ART[site]
            if not os.path.exists(os.path.join(ROOT, 'art', 'gates', f'{site}-locked.webp')): continue   # its picture is still to be made in the Art Library
            pg.evaluate("""([s,ch])=>{ STORY.mode='full'; STORY.chapter=ch; STORY.flags={}; const S=GATE_ART[s],m=worlds[S.map]; currentMap=m; const [x,y,w,h]=S.rect;
              const px=Math.min(m.w-1,Math.floor(x+w/2)), py=Math.min(m.h-1,Math.floor(y+h-1)); player.x=px; player.y=py; player.move=null;
              followers.forEach((f,i)=>{ f.x=Math.max(0,px+(i%2?1:-1)); f.y=py; f.move=null; }); resize(); camera.snap=true; updateCamera(1); }""", [site, ch])
            pg.wait_for_function("(m)=>!!plateFor(worlds[m])", arg=S['map'], timeout=20000)
            pg.wait_for_function("(s)=>gateImage(s,'locked')!==null", arg=site, timeout=15000)
            pg.wait_for_timeout(500)
            pg.screenshot(path=os.path.join(SHOTS, f'gate-{site}-locked-{orient}.png'))   # the real screen (landscape: the stage rotated as on the phone)
            # three frames drawn synchronously with the same clock value, so nothing animates between them
            urls = pg.evaluate("""()=>{ const T0=1.25, grab=()=>ctx.canvas.toDataURL(), out=[];
              const gai=gateArtItems, oa=window.drawActorSpaced, od=drawActor, hide=a=>a===player||followers.includes(a);
              draw(T0); out.push(grab());                                                    // A: picture in, characters drawn
              window.gateArtItems=()=>[]; draw(T0); out.push(grab());                        // B: picture out, characters drawn
              if(oa) window.drawActorSpaced=function(a){ if(!hide(a)) return oa(a); }; window.drawActor=function(a){ if(!hide(a)) return od(a); };
              draw(T0); out.push(grab());                                                    // C: picture out, characters hidden
              window.gateArtItems=gai; if(oa) window.drawActorSpaced=oa; window.drawActor=od;
              window.gateArtItems=()=>gai(currentMap).map(i=>Object.assign({},i,{depth:1e9})); if(oa) window.drawActorSpaced=oa; draw(T0); out.push(grab());   // D: picture drawn LAST (control)
              window.gateArtItems=gai; return out; }""")
            A, B, C, D = (Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in urls)
            a_, b_, c_ = (np.asarray(x).astype(int) for x in (A, B, C))
            shows = np.abs(a_ - b_).sum(axis=2) > 24
            # the body of the characters: pixels they change a lot, not their soft ground shadow (a shadow is the background darkened, the same hue at
            # 25 to 97 percent of its brightness, and it is meant to lie over the picture) and not the antialiased rim (a soft edge shows what is behind it)
            ratio = b_ / np.maximum(c_, 1)
            shadow = (ratio.min(axis=2) > .25) & (ratio.max(axis=2) < .97) & ((ratio.max(axis=2) - ratio.min(axis=2)) < .12)
            people = ndi.binary_erosion((np.abs(b_ - c_).sum(axis=2) > 150) & ~shadow, iterations=3)
            lo = 400 if orient == 'portrait' else 100   # the landscape view is zoomed out: smaller pictures and people
            check(f'pixels {site} {orient}: the picture shows ({int(shows.sum())} px differ)', shows.sum() > lo)
            if people.sum() <= lo: print(f'  note: {site} {orient}: only {int(people.sum())} px of characters in view, overlap not measurable here')
            over = shows & people
            if over.sum() and os.environ.get('GATE_DEBUG'):
                dbg = np.asarray(A).copy(); dbg[over] = (255, 0, 0); ys, xs = np.nonzero(over); Image.fromarray(dbg).crop((max(0, xs.min() - 60), max(0, ys.min() - 60), xs.max() + 60, ys.max() + 60)).resize(((xs.max() - xs.min() + 120) * 3, (ys.max() - ys.min() + 120) * 3)).save(f'/tmp/work/over-{site}-{orient}.png')
            check(f'pixels {site} {orient}: nothing is painted over Tom and the girls ({int(over.sum())} px of {int(people.sum())}; up to 2 stray px of antialiasing at a sole edge are allowed)', over.sum() <= 2)
            if site == 'backlot-stage7':   # control, on the one picture that is wide and tall enough to stand behind all three: drawn over them, the same measure must see it
              over2 = (np.abs(np.asarray(D).astype(int) - b_).sum(axis=2) > 24) & people
              check(f'pixels {site} {orient}: control, a picture drawn over the characters is detected ({int(over2.sum())} px)', over2.sum() > max(60, people.sum() // 10))
        if orient == 'landscape':
            pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(500)
    real = [e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower()]
    check(f'no page errors: {real[:3]}', not real)
    br.close()

if '--grid' in sys.argv:
    for site, S in ART.items():
        w = W[S['map']]; im = Image.open(os.path.join(ROOT, 'art', S['map'] + '.webp')).convert('RGB'); tw = im.width / w['w']; th = im.height / w['h']
        x, y, rw, rh = S['rect']; x0 = max(0, x - 2.5); x1 = min(w['w'], x + rw + 2.5); y0 = max(0, y - 3); y1 = min(w['h'], y + rh + 2.5)
        c = im.crop((int(x0 * tw), int(y0 * th), int(x1 * tw), int(y1 * th))); sc = 2; c = c.resize((c.width * sc, c.height * sc)); d = ImageDraw.Draw(c)
        g = .5; gx = int(x0 / g) * g
        while gx <= x1:
            X = (gx - x0) * tw * sc; d.line([(X, 0), (X, c.height)], fill=(255, 255, 0) if gx % 1 == 0 else (0, 255, 255)); d.text((X + 2, 2), str(gx), fill=(255, 255, 255)); gx += g
        gy = int(y0 / g) * g
        while gy <= y1:
            Y = (gy - y0) * th * sc; d.line([(0, Y), (c.width, Y)], fill=(255, 255, 0) if gy % 1 == 0 else (0, 255, 255)); d.text((2, Y + 2), str(gy), fill=(255, 255, 255)); gy += g
        d.rectangle([(x - x0) * tw * sc, (y - y0) * th * sc, (x + rw - x0) * tw * sc, (y + rh - y0) * th * sc], outline=(255, 0, 0), width=3)
        c.save(os.path.join(SHOTS, f'gate-grid-{site}.png'))
    print('grids written to tools/shots/gate-grid-<site>.png')

print('gate_art_test:', 'ok' if not fails else f'{len(fails)} FAIL')
sys.exit(1 if fails else 0)
