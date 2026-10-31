# Quest tracker (top left HUD): persistent next step, progress pips, quest log with check marks, new-step flash.
# Shots: tools/shots/quest-*.png.   Usage: python3 tools/quest_test.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def shot(pg,n): pg.screenshot(path=os.path.join(SHOTS,f'quest-{n}.png'))
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip_intro(pg,n=500):
    for i in range(n):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return False
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(5); }"); pg.wait_for_timeout(2500)
    skip_intro(pg); pg.wait_for_timeout(1500); skip_intro(pg)
    # baseline: a goal with three parts, nothing done yet
    pg.evaluate("()=>{ STORY.flags={}; STORY.flags.goal='clear the Art room, the Music room and the Gym (top). After each, set its hallway clock to 7:00.'; STORY.flags.goalCh=5; STORY.flags.goalLog=[{c:5,t:'Long Island Elementary, through the gate at the east end of the Square.'},{c:5,t:'into the school (the front doors, at the top).'}]; }"); pg.wait_for_timeout(700)
    t=lambda s: pg.evaluate("(s)=>document.querySelector(s).textContent",s)
    check('tracker shows chapter',t('#qt-eyebrow').startswith('CH 5'))
    check('tracker shows next step, capitalised, first sentence only',t('#qt-text')=='Clear the Art room, the Music room and the Gym (top).')
    check('three empty pips and 0/3',pg.evaluate("()=>document.querySelectorAll('#qt-pips i').length===3&&document.querySelectorAll('#qt-pips i.on').length===0&&document.querySelector('#qt-pips b').textContent==='0/3'"))
    check('old location label is hidden',pg.evaluate("()=>document.getElementById('area-name').hidden&&document.getElementById('eyebrow').hidden"))
    shot(pg,'1-collapsed')
    # finish one part: pip fills
    pg.evaluate("()=>setFlag('ch5-art',true)"); pg.wait_for_timeout(700)
    check('one pip filled, 1/3',pg.evaluate("()=>document.querySelectorAll('#qt-pips i.on').length===1&&document.querySelector('#qt-pips b').textContent==='1/3'"))
    shot(pg,'2-pip')
    # open the log
    pg.click('#hud .brand'); pg.wait_for_timeout(300)
    check('log open with checklist and completed list',pg.evaluate("()=>!document.getElementById('objective').hidden&&document.querySelectorAll('.q-subs li').length===3&&document.querySelectorAll('.q-subs li.done').length===1&&document.querySelectorAll('.q-done li').length===2"))
    check('completed list newest first',pg.evaluate("()=>document.querySelector('.q-done li:first-child span:last-child').textContent.startsWith('Into the school')"))
    shot(pg,'3-open')
    pg.click('#hud .brand'); pg.wait_for_timeout(300)
    check('tap again closes',pg.evaluate("()=>document.getElementById('objective').hidden"))
    # a new goal arrives from a scene: done flash, then the new step, pulse, old goal moves to the log
    pg.evaluate("()=>{ const prev=flag('goal'); const L=flag('goalLog').slice(); L.push({c:5,t:prev}); setFlag('goalLog',L); setFlag('goal','the Cafetorium, at the east end of the hall.'); }"); pg.wait_for_timeout(500)
    check('done flash shows the finished step with a check',pg.evaluate("()=>document.getElementById('qt-text').textContent.startsWith('✓ Clear the Art room')"))
    shot(pg,'4-flash')
    pg.wait_for_timeout(1700)
    check('then the new step, pulsing',t('#qt-text')=='The Cafetorium, at the east end of the hall.' and pg.evaluate("()=>document.querySelector('#hud .brand').classList.contains('obj-new')"))
    check('no pips on a single step',pg.evaluate("()=>document.querySelectorAll('#qt-pips i').length===0"))
    shot(pg,'5-new')
    pg.click('#hud .brand'); pg.wait_for_timeout(300)
    check('opening clears the pulse; three completed',pg.evaluate("()=>!document.querySelector('#hud .brand').classList.contains('obj-new')&&document.querySelectorAll('.q-done li').length===3"))
    shot(pg,'6-open2')
    # chapter complete state
    pg.click('#hud .brand'); pg.evaluate("()=>{ setFlag('ch5-done',true); }"); pg.wait_for_timeout(2200)
    check('chapter complete shows in tracker',t('#qt-text')=='Chapter complete')
    # a real scene toast logs the previous goal
    pg.evaluate("()=>{ setFlag('ch5-done',false); STORY.flags.goal='A'; STORY.flags.goalCh=5; STORY.flags.goalLog=[]; playScene([{toast:'Goal: B step.'}]); }"); pg.wait_for_timeout(600)
    check('scene toast moves old goal into the log',pg.evaluate("()=>flag('goal')==='B step.'&&flag('goalLog').length===1&&flag('goalLog')[0].t==='A'&&flag('goalLog')[0].c===5"))
    check('log survives JSON (save format)',pg.evaluate("()=>JSON.parse(JSON.stringify(STORY.flags)).goalLog.length===1"))
    # landscape
    pg.evaluate("()=>{ setFlag('ch5-done',false); STORY.flags.goal='clear the Art room, the Music room and the Gym (top).'; setFlag('ch5-art',true); setFlag('ch5-music',true); }"); pg.wait_for_timeout(700)
    pg.evaluate("()=>document.documentElement.classList.add('landscape')"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    shot(pg,'7-landscape'); pg.click('#hud .brand'); pg.wait_for_timeout(300); shot(pg,'8-landscape-open')
    br.close()
real=[e for e in errs if 'favicon' not in e and 'Failed to load resource' not in e]
check('no page errors',not real)
if real: print(real[:5])
print('FAILS:',fails) if fails else print('ALL PASS')
