# Battle sound settings test: the gear button in a fight (Battle Lab style, cfg.lab) opens the MUSIC / VOICE panel;
# taps, keys and the controller path change the levels, they persist, and the audio buses follow.
# Usage (repo root): python3 tools/battle_sound_test.py     Env: CHROMIUM = chromium binary
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(name,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+name+(' '+str(info) if info!='' else ''))
    if not ok: fails.append(name)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1200)
    pg.evaluate("""()=>{ const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true;
      L.b2Start({lab:true,party:['tom','grace','rose','amy'],level:30,foes:[['mudling','front']],bag:[],heart:100,infinite:true,allSkills:true}); }""")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'",timeout=40000)
    pg.mouse.click(215,430); pg.wait_for_timeout(200)   # first tap unlocks audio like a real player
    pg.evaluate("()=>audio()")
    vis=lambda sel: pg.evaluate("(s)=>{ const e=document.querySelector(s); if(!e||e.hidden) return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; }",sel)
    check('gear button visible in Battle Lab fight',vis('#b7-set-btn'))
    check('EXIT also visible (lab)',vis('#b7-exit'))
    pg.screenshot(path=os.path.join(SHOTS,'sound-battle-closed.png'))
    pg.click('#b7-set-btn'); pg.wait_for_timeout(250)
    check('panel opens',vis('#b7-set-box'))
    pg.screenshot(path=os.path.join(SHOTS,'sound-panel-portrait.png'))
    v=lambda: pg.evaluate("()=>({m:sound.vol.music,v:sound.vol.voice,f:sound.vol.fx,mg:sound.musicBus.gain.value,vg:sound.voiceBus.gain.value,fg:sound.master.gain.value})")
    s0=v(); print(s0)
    # taps: music pip 5, voice minus twice
    pg.locator('#b7-set-box .b7-srow').nth(0).locator('.b7-vpip').nth(4).click(); pg.wait_for_timeout(200)
    check('music pip tap sets 5',v()['m']==5,v())
    pg.locator('#b7-set-box .b7-srow').nth(1).locator('.b7-sbtn').first.click(); pg.wait_for_timeout(100)
    pg.locator('#b7-set-box .b7-srow').nth(1).locator('.b7-sbtn').first.click(); pg.wait_for_timeout(300)
    s=v(); check('voice minus twice lowers voice by 2',s['v']==s0['v']-2,s)
    check('music bus gain follows',abs(s['mg']-.315*(5/10)**1.7)<.01,s['mg'])
    check('voice bus gain follows',abs(s['vg']-.45*((s0['v']-2)/10)**1.7)<.01,s['vg'])
    check('effects level untouched',s['f']==s0['f'])
    st=pg.evaluate("()=>[localStorage.getItem('le-vol-music'),localStorage.getItem('le-vol-voice')]")
    check('levels saved',st==['5',str(s0['v']-2)],st)
    # keys: Down selects voice row, Right raises, Escape closes; fight must not act behind the panel
    before=pg.evaluate("()=>[window.__LE.B2.ui,window.__LE.B2.sel]")
    pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(200)
    # the last tap left the voice row selected, so Down wraps to MUSIC
    check('key Down then Right raises music',v()['m']==6 and v()['v']==8,v())
    pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(100)
    check('key Up then Left lowers voice',v()['v']==7 and v()['m']==6,v())
    after=pg.evaluate("()=>[window.__LE.B2.ui,window.__LE.B2.sel]")
    check('battle menu not moved by panel keys',before==after,[before,after])
    pg.screenshot(path=os.path.join(SHOTS,'sound-panel-keys.png'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    check('Escape closes panel',not vis('#b7-set-box'))
    pg.keyboard.press('KeyO'); pg.wait_for_timeout(200)
    check('O reopens panel',vis('#b7-set-box'))
    # controller path
    pg.evaluate("()=>{ b2Pad('right',true,false,false); }"); pg.wait_for_timeout(100)
    pg.evaluate("()=>{ b2Pad(null,false,false,true); }"); pg.wait_for_timeout(200)
    check('pad B closes panel',not vis('#b7-set-box'))
    # backdrop tap closes
    pg.click('#b7-set-btn'); pg.wait_for_timeout(150); pg.mouse.click(5,5); pg.wait_for_timeout(200)
    check('backdrop tap closes',not vis('#b7-set-box'))
    # landscape (forced rotation)
    pg.click('#b7-set-btn'); pg.wait_for_timeout(150)
    pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800)
    check('panel visible in landscape',vis('#b7-set-box'))
    pg.screenshot(path=os.path.join(SHOTS,'sound-panel-landscape.png'))
    pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(500)
    pg.keyboard.press('Escape')
    # options ride along in saves
    o=pg.evaluate("()=>b7Opts()"); check('saves carry voice level','volVoice' in o,o)
    # leaving the lab closes everything
    pg.evaluate("()=>{ b7SetOpen(); }"); pg.wait_for_timeout(100)
    pg.evaluate("()=>b2LabExit()"); pg.wait_for_timeout(1500)
    check('panel gone after leaving fight',not vis('#b7-set-box'))
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    check('no page errors',not real,real[:4])
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
