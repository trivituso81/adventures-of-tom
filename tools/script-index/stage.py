#!/usr/bin/env python3
"""Script Editor stage pictures (step 2). One picture per scene: the real map at the scene's first spoken line, with a name tag on everyone and a small
arrow for the way they face. Saved as art/script-stage/<sceneId>.webp (script.html shows it at the top of each scene).
Usage (repo root):  python3 tools/script-index/stage.py [sceneId ...]     (no ids = every scene that has a Play recipe; about 10 s per scene, run it in the background)
Uses the same setup as Play (engine/script-edits.js sePlaySetup), so the picture is the map the scene really starts on."""
import os, sys, json, threading, http.server, socketserver, functools, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.path.join(ROOT, 'art', 'script-stage'); os.makedirs(OUT, exist_ok=True)
ix = json.load(open(os.path.join(ROOT, 'data', 'script-index.json'), encoding='utf8'))
ids = sys.argv[1:] or [i for i, s in ix['scenes'].items() if s['recipe'].get('map')]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
HOOK = """()=>{ if(window.__stageHook) return; window.__stageHook=1; const orig=drawSheetActor;
  drawSheetActor=function(a,set){ const r=orig(a,set); try{ const p=position(a),tx=ctx.getTransform(),cx=(p.x+.5)*T,base=(p.y+1)*T-2,sc=canvas.clientWidth/canvas.width,rc=canvas.getBoundingClientRect();
    a._sx=rc.left+(tx.a*cx+tx.c*base+tx.e)*sc; a._sy=rc.top+(tx.b*cx+tx.d*base+tx.f)*sc; a._sh=(a._figH||60)*tx.d*sc; }catch(e){} return r; }; }"""
WHO = """()=>{ const out=[]; const add=(a,name)=>{ if(!a||a.hidden||a._sx==null) return; out.push({n:name,x:a._sx,y:a._sy,h:a._sh,f:a.facing}); };
  add(player,(typeof playerMember==='function'?playerMember():hero).name||'Tom');
  for(const f of followers) add(f,f.member&&f.member.name);
  for(const n of currentMap.npcs) if(!n.monster) add(n,n.name); else add(n,n.name);
  return {people:out,dock:document.getElementById('dialog').getBoundingClientRect().top}; }"""
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception: FONT = ImageFont.load_default()
def tag(im, info):
    d = ImageDraw.Draw(im, 'RGBA')
    for p in info['people']:
        if p['y'] > info['dock'] or p['x'] < 0 or p['x'] > im.width or p['y'] < 0: continue
        name = str(p['n'] or '?'); top = p['y'] - p['h']
        w = d.textlength(name, font=FONT) + 10; x0 = p['x'] - w / 2; y0 = max(2, top - 22)
        d.rounded_rectangle([x0, y0, x0 + w, y0 + 20], 6, fill=(20, 18, 43, 215)); d.text((x0 + 5, y0 + 1), name, font=FONT, fill=(255, 211, 77, 255))
        ax = p['x']; ay = p['y'] - p['h'] * .45; dx = {'left': -1, 'right': 1}.get(p['f'], 0); dy = {'up': -1, 'down': 1}.get(p['f'], 0)
        if dx or dy:
            tx_, ty_ = ax + dx * 26, ay + dy * 26
            d.line([ax, ay, tx_, ty_], fill=(255, 255, 255, 235), width=4); d.ellipse([tx_ - 5, ty_ - 5, tx_ + 5, ty_ + 5], fill=(123, 108, 255, 255))
        else: d.ellipse([ax - 5, ay - 5, ax + 5, ay + 5], outline=(255, 255, 255, 200), width=2)
def main():
    done = 0
    with sync_playwright() as pw:
        kw = {'args': ['--headless=new', '--no-proxy-server']}
        if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
        br = pw.chromium.launch(**kw); pg = None
        for n, sid in enumerate(ids):
            sc = ix['scenes'].get(sid)
            if not sc or not sc['recipe'].get('map'): print('skip', sid); continue
            if pg is None or n % 8 == 0:
                if pg: pg.close()
                pg = br.new_page(viewport={'width': 430, 'height': 860}); pg.goto(f'http://127.0.0.1:{port}/index.html')
                pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=180000); pg.wait_for_timeout(800); pg.evaluate(HOOK)
            try:
                R = dict(sc['recipe']); R['id'] = sid
                pg.evaluate("(R)=>{ saveGame=()=>false; sePlaySetup(R); setTimeout(()=>playScene(R.id),200); }", R)
                for _ in range(120):
                    pg.wait_for_timeout(150)
                    if pg.evaluate("()=>dialog.active&&dialog.shown>=dialog.chars.length"): break
                else: print('no dialogue', sid); pg.evaluate("()=>{ try{ endIntro(); }catch(e){} }"); continue
                pg.wait_for_timeout(500)
                info = pg.evaluate(WHO); png = pg.screenshot(clip={'x': 0, 'y': 0, 'width': 430, 'height': max(300, min(860, info['dock'] - 36))})
                im = Image.open(io.BytesIO(png)).convert('RGB'); tag(im, info)
                im = im.resize((360, int(im.height * 360 / im.width))); im.save(os.path.join(OUT, sid + '.webp'), quality=72, method=6); done += 1
                print('ok', sid, len(info['people']), 'people', flush=True)
                pg.evaluate("()=>{ try{ dialog.active=false; endIntro(); }catch(e){} }")
            except Exception as e:
                print('FAIL', sid, str(e)[:120], flush=True)
                try: pg.close()
                except Exception: pass
                pg = None
        br.close()
    print('pictures', done)
main()
