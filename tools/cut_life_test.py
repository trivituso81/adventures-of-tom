# cutpolish5 test (no breathing: fix-cutpolish5): squash, hop, pips, the wince, the listener turn and the fx column (engine/emotions.js actorLife, emoTurnListeners).
# Usage (repo root, CHROMIUM and PLAYWRIGHT_BROWSERS_PATH set): python3 -I tools/cut_life_test.py   Prints FAILS: [] when every check passes.
import threading, http.server, socketserver, functools, os, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
JS = r"""()=>{ const out={}; splash.active=false; document.getElementById('splash').hidden=true; endIntro();
  const a={name:'x',member:{id:'grace'}},mon={monster:'mudling'},now=lifeNow;
  out.offScene=actorLife(a,'stand'); intro.active=true;
  const real=lifeNow; window.lifeNow=()=>1.6; out.still=actorLife(a,'stand').s; window.lifeNow=()=>3.3; out.still2=actorLife(a,'stand').s; out.noBreathFn=typeof lifeOff;
  window.lifeNow=()=>100; actorLife(a,'stand'); a._sqT=undefined; actorLife(a,'em_happy'); window.lifeNow=()=>100.05; out.squash=actorLife(a,'em_happy').s;   // pose change at t=100
  window.lifeNow=()=>200; emoFx(a,'hop'); window.lifeNow=()=>200.15; out.hop=actorLife(a,'em_happy').lift; window.lifeNow=()=>200.5; out.hopEnd=actorLife(a,'em_happy').lift; out.hopCleared=!a._fx;
  window.lifeNow=()=>300; emoFx(a,'!'); window.lifeNow=()=>300.5; out.pip=actorLife(a,'em_happy').pip;
  window.lifeNow=()=>400; emoFx(a,'wince'); window.lifeNow=()=>401; const w=actorLife(a,'em_happy'); out.wince=[w.s<.97,w.pip];
  window.lifeNow=real;
  out.monster=actorLife(mon,'stand'); const seat={seat:1,member:{id:'rose'}}; out.seat=actorLife(seat,'stand');
  cut.skip=true; out.skip=actorLife(a,'stand'); cut.skip=false; intro.active=false;
  out.fx=Object.values(EMOTION_REACTIONS).flat().filter(r=>r[3]).map(r=>r[3]).sort().filter((v,i,x)=>x.indexOf(v)===i);
  out.ch1Rows=['Rose|It\'s bigger than a BUS! It ate a boat!|1','Grace|Rose licked a muffin.|1'].map(k=>[k,(EMOTION_REACTIONS[k]||null)]);
  return out; }"""
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM'), args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 430, 'height': 860}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:%d/index.html' % port); pg.wait_for_timeout(4000)
    o = pg.evaluate(JS); b.close()
print(json.dumps(o)[:900])
if o['offScene'] is not None: fails.append('life outside a scene')
if o['still'] != 1 or o['still2'] != 1 or o['noBreathFn'] != 'undefined': fails.append('overworld people must not breathe %r' % o)
if not (o['squash'] < 1 and o['squash'] > .93): fails.append('squash %r' % o['squash'])
if not (o['hop'] > 6 and o['hopEnd'] < 1 and o['hopCleared']): fails.append('hop %r %r' % (o['hop'], o['hopEnd']))
if o['pip'] != '!': fails.append('pip')
if not (o['wince'][0] and o['wince'][1] == 'sweat'): fails.append('wince %r' % o['wince'])
if o['monster'] is not None or o['seat'] is not None or o['skip'] is not None: fails.append('exclusions')
if not set(['!', '...', '?', 'hop', 'sweat']) <= set(o['fx']): fails.append('fx column %r' % o['fx'])
if errs: fails.append('page errors %r' % errs[:3])
print('FAILS:', fails)
