# Battle Lab exit test: enter a boss lab fight, leave through BAG > EXIT LAB, land back on the lab list; a story boss still blocks RUN.
# Usage (repo root):  python3 tools/lab_exit_test.py     (env CHROMIUM = chromium binary, optional)
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
def wait_cmd(pg): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
def bag_exit(pg,tag):
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(300)           # open the bag
    names=pg.evaluate("()=>[...document.querySelectorAll('#b2-cmd .b2-btn[data-i] span:first-child')].map(e=>e.textContent)")
    pg.screenshot(path=os.path.join(SHOTS,f'labexit-{tag}-bag.png'))
    pg.evaluate("()=>{ B2.sel=b2BagList(B2.actor).length-1; b2Render(); }"); pg.wait_for_timeout(200)
    pg.keyboard.press('Enter')
    return names
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    # find a lab fight that has a no-run boss, and also check the first fight
    for label,pick in (('boss',"(()=>{ for(let i=0;i<B2_LAB.length;i++){ if(B2_LAB[i].foes.some(f=>{ const d=B2_FOES[Array.isArray(f)?f[0]:f.id]; return d&&d.noRun; })) return i; } return 0; })()"),('first','0')):
        idx=pg.evaluate(pick); print(label,'lab index',idx,pg.evaluate(f"()=>B2_LAB[{idx}].name"))
        pg.evaluate(f"()=>{{ splash.active=true; document.getElementById('splash').hidden=false; splashSetMode('lab'); splash.labPage=Math.floor({idx}/SPLASH_LAB_PER); splashLab({idx}); }}")
        wait_cmd(pg)
        hasBoss=pg.evaluate("()=>b2LiveFoes().some(f=>f.D.noRun)"); print(' no-run foe present:',hasBoss)
        if label=='boss' and not hasBoss: fails.append('no no-run boss found in the lab to test with')
        names=bag_exit(pg,label); print(' bag rows:',names)
        if 'EXIT LAB' not in names: fails.append(f'{label}: bag has no EXIT LAB row: {names}')
        if 'RUN' in names: fails.append(f'{label}: lab bag still shows RUN')
        pg.wait_for_function("()=>!window.__LE.B2.active",timeout=15000); pg.wait_for_timeout(700)
        st=pg.evaluate("()=>({splashActive:splash.active,hidden:document.getElementById('splash').hidden,mode:splash.mode,battleHidden:document.getElementById('battle').hidden,labFlags:[B2.labLA,B2.labStudio,B2.labGate].some(Boolean),result:B2.result,tab:document.querySelector('#splash .sp-tab').textContent})")
        print(' after exit:',st)
        if not(st['splashActive'] and not st['hidden'] and st['mode']=='lab'): fails.append(f'{label}: did not land on the lab list: {st}')
        if not st['battleHidden']: fails.append(f'{label}: battle UI still showing')
        if st['result']!='run': fails.append(f'{label}: result {st["result"]}')
        pg.screenshot(path=os.path.join(SHOTS,f'labexit-{label}-after.png'))
    # Story fights are unchanged: RUN from a no-run boss is still blocked.
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    bossId=pg.evaluate("()=>{ for(const k in B2_FOES){ if(B2_FOES[k].noRun) return k; } return null; }")
    pg.evaluate("(id)=>window.__LE.b2Start({party:['tom','grace','rose'],level:20,foes:[[id,'front']],bag:[]})",bossId)
    wait_cmd(pg)
    names=bag_exit(pg,'story'); print('story bag rows:',names)
    pg.wait_for_timeout(2500)
    still=pg.evaluate("()=>window.__LE.B2.active")
    if 'RUN' not in names: fails.append(f'story: bag lost RUN: {names}')
    if not still: fails.append('story boss fight let Tom run')
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    if real: fails.append(f'errors: {real[:5]}')
    br.close()
print('FAILS:',fails)
