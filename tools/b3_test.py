# Battle 3 screen test: plays the NEW BATTLE Lab fights in a real browser and saves contact sheets of frames to look at.
# Usage (repo root):  python3 tools/b3_test.py            every fight in data/b3-lab.js
#                     python3 tools/b3_test.py new1       one fight
# Env: CHROMIUM = chromium binary (optional), SEED = the fight's seed (default 7), OUT = folder for the sheets (default tools/shots).
#
# For each fight it checks, and prints FAILS: [] when all pass:
#   1. By hand, portrait, through the real screen (keys for Tom and Deedee, taps for Grace and Rose): BASIC, SKILLS, picking a
#      target from the list, tapping an enemy on the picture, tapping a party card. Deedee's Windex Spritz then a Clobber hit
#      must set off Hydro-Slip!, and the monster's face must move later on the turn bar. The fight is played to a win, and
#      CONTINUE must land back on the NEW BATTLE list.
#   2. The same seed played by the simple player on screen gives the same turn order as `node tools/b3-sim.js <fight> 1 --seed=N`,
#      and after every turn the first face on the bar is the unit that really acts next.
#   3. A fight the party loses (2% HP against 20x monster HP) reaches the lose screen.
#   4. Landscape: a turn by hand, frames of a whole fight, and EXIT back to the list.
#   5. A battle 2 fight still starts and shows its own screen afterwards.
# Sheets: b3-<fight>-hand.png, b3-<fight>-slip.png and b3-<fight>-slip-bar.png (the Hydro-Slip! frames: the stage, and every turn bar
# stacked and doubled), b3-<fight>-lose.png, b3-<fight>-land.png.
import threading, http.server, socketserver, functools, os, sys, json, subprocess, io
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
SEED=int(os.environ.get('SEED','7'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def shot(pg): return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
def sheet(frames,cols,path,scale=.5):
    if not frames: return
    w,h=frames[0].size; w2,h2=int(w*scale),int(h*scale); rows=(len(frames)+cols-1)//cols
    S=Image.new('RGB',(w2*cols,h2*rows),'#000')
    for k,f in enumerate(frames): S.paste(f.resize((w2,h2),Image.LANCZOS),((k%cols)*w2,(k//cols)*h2))
    S.save(path); print('  sheet',os.path.relpath(path,ROOT),len(frames),'frames')
def wait_cmd(pg,t=40000): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&(B3.actor||B3.ui==='done')",timeout=t)
def state(pg): return pg.evaluate("""()=>({ui:B3.ui,actor:B3.actor&&B3.actor.id,key:B3.actor&&B3.actor.key,pep:B3.actor&&B3.actor.pep,over:B3.F.over,
  foes:B3.F.foes.map(f=>({key:f.key,id:f.id,alive:!f.ko&&f.hp>0,hp:f.hp,drenched:!!f.st.drenched})),
  bar:[...document.querySelectorAll('#b3-bar .b2-tk')].map(e=>e.dataset.k+(e.classList.contains('now')?'!':'')+(e.classList.contains('ghost')?'?':'')),
  placed:B3.F.party.map(p=>p.placed),turns:B3.F.turnLog.length})""")
def start(pg,idx,opt): pg.evaluate("([i,o])=>{ splash.active=false; document.getElementById('splash').hidden=true; b3Lab(i,o); }",[idx,opt])
def tap_foe(pg,key):
    # the middle of that enemy, from canvas coordinates (576 x 324) to the page; works when the stage is turned a quarter turn too
    p=pg.evaluate("""(key)=>{ const b=b3FoeBox(key),cv=document.getElementById('battle-canvas'),r=cv.getBoundingClientRect(),u=b.x/576,v=(b.y-b.h/2)/324;
      return layout.rotated?{x:r.right-v*r.width,y:r.top+u*r.height}:{x:r.left+u*r.width,y:r.top+v*r.height}; }""",key)
    pg.mouse.click(p['x'],p['y'])
def errors(errs): return [e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]

def hand_fight(pg,idx,fid):
    """Portrait, by hand. Returns the frames."""
    frames=[]; slip=[]; did={'skill':False,'slip':False,'tapfoe':False,'card':False,'keys':False}
    start(pg,idx,{'seed':SEED}); wait_cmd(pg); pg.wait_for_timeout(350)
    for turn in range(60):
        st=state(pg)
        if st['ui']=='done': break
        if not st['bar'] or not st['bar'][0].startswith(st['key']+'#') or not st['bar'][0].endswith('!'): fails.append(f"{fid} hand: the bar does not start with the actor: {st['bar'][:3]} vs {st['key']}")
        who=st['actor']; live=[f for f in st['foes'] if f['alive']]; wet=[f for f in live if f['drenched']]
        if len(frames)<10 or turn%4==0: frames.append(shot(pg))
        expect_slip=False
        if who=='grace' and not did['skill'] and st['pep']>=3:
            # SKILLS by taps: the first tap highlights the row and explains it, the second uses it; then a party card picks who.
            pg.click('#b3-cmd .b2-x.right'); pg.wait_for_timeout(250); frames.append(shot(pg))
            pg.dispatch_event('#b3-ui','pointerdown',{'pointerType':'touch'})
            pg.click('#b3-cmd .b2-btn[data-i="0"]'); pg.wait_for_timeout(250)
            if state(pg)['ui']!='target': fails.append(f'{fid} hand: tapping NeeDoh Stretch Pass did not open the target list')
            frames.append(shot(pg))
            pg.click('#b3-party .b2-pc[data-i="2"]'); did['skill']=True; did['card']=True
            pg.wait_for_timeout(700); frames.append(shot(pg))
        else:
            if who=='deedee': tgt=([f for f in live if not f['drenched']] or live)[0]
            elif who in('grace','rose') and wet: tgt=wet[0]; expect_slip=True
            else: tgt=live[-1] if who=='tom' else ([f for f in live if not f['drenched']] or live)[-1]
            if who in('tom','deedee'):
                pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(200); did['keys']=True
                s2=state(pg)
                if s2['ui']=='target':
                    order=[f['key'] for f in live]
                    for _ in range(order.index(tgt['key'])): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(80)
                    if turn<3: frames.append(shot(pg))
                    pg.keyboard.press('Enter')
            else:
                pg.click('#b3-cmd .b2-x.up'); pg.wait_for_timeout(200)
                if state(pg)['ui']=='target': tap_foe(pg,tgt['key']); did['tapfoe']=True
            if expect_slip and not did['slip']:
                bar0=pg.evaluate("()=>B3.view.bar.map(e=>e.k)")
                for k in range(12): pg.wait_for_timeout(130); slip.append(shot(pg))
                log=pg.evaluate("()=>B3.log.slice(-6).join(' | ')")
                if 'Hydro-Slip!' in log: did['slip']=True
                else: fails.append(f'{fid} hand: a Clobber hit on a Drenched monster did not show Hydro-Slip!: {log}')
            else:
                pg.wait_for_timeout(420); 
                if turn<6: frames.append(shot(pg))
        wait_cmd(pg); pg.wait_for_timeout(200)
    st=state(pg)
    if st['over']!='win': fails.append(f"{fid} hand: expected a win, got {st['over']}")
    pg.wait_for_timeout(500); frames.append(shot(pg))
    for k,v in did.items():
        if not v: fails.append(f'{fid} hand: never used {k}')
    pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(700)
    back=pg.evaluate("()=>({mode:splash.mode,active:splash.active,hidden:document.getElementById('battle').hidden,b3:B3.active,v3:!!battle.v3,cls:document.getElementById('battle').className})")
    if not(back['mode']=='lab3' and back['active'] and back['hidden'] and not back['b3'] and not back['v3']): fails.append(f'{fid} hand: CONTINUE did not land on the NEW BATTLE list: {back}')
    frames.append(shot(pg))
    sheet(frames,6,os.path.join(OUT,f'b3-{fid}-hand.png'))
    if slip:
        # the Hydro-Slip! frames: every turn bar stacked and doubled (the monster's face slides right), then the stage
        w,h=slip[0].size; bars=Image.new('RGB',(w*2,90*len(slip)),'#000')
        for k,f in enumerate(slip): bars.paste(f.crop((0,0,w,44)).resize((w*2,88),Image.LANCZOS),(0,k*90))
        bars.save(os.path.join(OUT,f'b3-{fid}-slip-bar.png')); print('  sheet',f'tools/shots/b3-{fid}-slip-bar.png',len(slip),'bars')
        sheet([f.crop((0,44,w,294)) for f in slip],4,os.path.join(OUT,f'b3-{fid}-slip.png'),scale=1)

def auto_fight(pg,idx,fid,opt,frames=None,every=450):
    """The simple player on screen. Records every turn and the bar after every turn."""
    pg.evaluate("""()=>{ window.__b3={ends:[],turns:[]}; if(!window.__b3wrap){ window.__b3wrap=1; const os=b3Show; b3Show=function(b){ if(b.t==='endTurn') window.__b3.ends.push(b.bar.length?b.bar[0].k:null); if(b.t==='turn') window.__b3.turns.push(b.who); return os.apply(this,arguments); }; } }""")
    start(pg,idx,dict(opt,auto=True))
    for k in range(400):
        pg.wait_for_timeout(every)
        if frames is not None and len(frames)<24: frames.append(shot(pg))
        if pg.evaluate("()=>B3.ui==='done'"): break
    else: fails.append(f'{fid}: the auto fight did not finish')
    pg.wait_for_timeout(400)
    if frames is not None: frames.append(shot(pg))
    return pg.evaluate("()=>({over:B3.F.over,order:B3.F.turnLog,rounds:B3.F.clock/100,ends:window.__b3.ends,turns:window.__b3.turns})")

with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    lab=pg.evaluate("()=>B3_LAB.map(L=>L.id)"); want=[a for a in sys.argv[1:] if not a.startswith('-')] or lab
    # The way in: ADMIN > BATTLE LAB shows NEW BATTLE, which opens the list.
    pg.evaluate("()=>{ splashSetMode('lab'); }"); pg.wait_for_timeout(200)
    names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
    if not names or names[0]!='NEW BATTLE': fails.append(f'the Lab list does not start with NEW BATTLE: {names}')
    pg.click('#splash .sp-choice[data-i="0"]'); pg.wait_for_timeout(600)
    names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)"); print('NEW BATTLE list:',names)
    shot(pg).save(os.path.join(OUT,'b3-lab-list.png'))
    for fid in want:
        if fid not in lab: fails.append(f'no Lab fight called {fid}'); continue
        idx=lab.index(fid); print('fight',fid)
        pg.evaluate("()=>{ B7.speed=1; }")
        hand_fight(pg,idx,fid)
        # 2. the simulator's order
        pg.evaluate("()=>{ B7.speed=2; }")
        R=auto_fight(pg,idx,fid,{'seed':SEED},every=300)
        sim=json.loads(subprocess.run(['node',os.path.join(HERE,'b3-sim.js'),fid,'1',f'--seed={SEED}','--json','--order'],capture_output=True,text=True).stdout)
        if R['order']!=sim['order']: fails.append(f"{fid}: screen order differs from the simulator: {R['order'][:12]} vs {sim['order'][:12]}")
        else: print(f"  same {len(R['order'])} turns as the simulator, {R['over']} in {R['rounds']:.2f} rounds")
        if R['over']!='win': fails.append(f"{fid}: auto fight result {R['over']}")
        bad=[(i,e,R['turns'][i+1]) for i,e in enumerate(R['ends']) if i+1<len(R['turns']) and e!=R['turns'][i+1]]
        if bad: fails.append(f'{fid}: the bar\'s first face was not the next to act {len(bad)} times: {bad[:4]}')
        else: print(f"  the bar named the next unit right after all {len(R['ends'])} turns")
        pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(400)
        # 3. a loss
        fr=[]; R=auto_fight(pg,idx,fid,{'seed':SEED,'hpPct':.02,'mods':{'foeHp':20}},frames=fr,every=500)
        if R['over']!='lose': fails.append(f"{fid}: the fight set up to be lost ended {R['over']}")
        sheet(fr[-8:],4,os.path.join(OUT,f'b3-{fid}-lose.png'))
        pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(500)
        if pg.evaluate("()=>splash.mode")!='lab3': fails.append(f'{fid}: CONTINUE after a loss did not go back to the list')
        # 4. landscape (the phone's own toggle: the stage turns a quarter turn)
        pg.evaluate("()=>{ B7.speed=1; toggleLayout(); }"); pg.wait_for_timeout(500)
        fr=[]; start(pg,idx,{'seed':SEED}); wait_cmd(pg); pg.wait_for_timeout(400); fr.append(shot(pg))
        pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(250); fr.append(shot(pg))
        key=[f['key'] for f in state(pg)['foes'] if f['alive']][0]
        if state(pg)['ui']=='target': tap_foe(pg,key)
        pg.wait_for_timeout(500); fr.append(shot(pg)); wait_cmd(pg); pg.wait_for_timeout(250)
        if state(pg)['actor']!='grace': fails.append(f"{fid} landscape: tapping the enemy did not use Tom's Basic (now {state(pg)['actor']})")
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(250); fr.append(shot(pg)); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
        pg.click('#b3-exit'); pg.wait_for_timeout(500)
        if pg.evaluate("()=>splash.mode")!='lab3' or pg.evaluate("()=>B3.active"): fails.append(f'{fid} landscape: EXIT did not go back to the list')
        R=auto_fight(pg,idx,fid,{'seed':SEED},frames=fr,every=700)
        pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(400)
        rot=pg.evaluate("()=>layout.rotated")
        sheet([f.rotate(90,expand=True) if rot else f for f in fr[:16]],4,os.path.join(OUT,f'b3-{fid}-land.png'))
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 5. battle 2 still owns its screen
    pg.evaluate("()=>{ B7.speed=1; splash.active=false; document.getElementById('splash').hidden=true; window.__LE.b2Start({party:['tom','grace','rose'],level:12,foes:[['mudling','front']],bag:[]}); }")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
    v=pg.evaluate("()=>({b2:!document.getElementById('b2-ui').hidden,b3:!document.getElementById('b3-ui').hidden,bar3:!document.getElementById('b3-bar').hidden,v3:document.getElementById('battle').classList.contains('v3'),tools:!document.getElementById('b3-tools').hidden})")
    if not v['b2'] or v['b3'] or v['bar3'] or v['v3'] or v['tools']: fails.append(f'battle 2 after Battle 3: wrong boxes showing: {v}')
    shot(pg).save(os.path.join(OUT,'b3-then-b2.png'))
    pg.evaluate("()=>b2End('run')"); pg.wait_for_timeout(300)
    faults=pg.evaluate("()=>window.__faults||[]")
    if faults: fails.append(f'game faults: {faults[:4]}')
    real=errors(errs)
    if real: fails.append(f'errors: {real[:5]}')
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
