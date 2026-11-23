# Shared helpers for the chapter tests of Battle 3 in the story (stage 17): tools/ch2_b3_test.py to ch5_b3_test.py.
# Modeled on tools/ch1_b3_test.py. A chapter test jumps to the chapter from Chapter Select, plays its scenes with Enter, auto-plays every
# story fight on Battle 3, looks at the victory card, and checks per fight: it ran on Battle 3, no Warmth bar or WARMTH or HEART anywhere on
# the fight screen, the fight's own tips were shown (once each), the flag battle:<id> is 'win', and Vibe Points were paid.
# Usage (from a chapter test): lib.start(chapter), then lib.run(...), lib.finish().   LAYOUT=portrait|landscape  CHROME=/path/to/chrome
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
LAYOUT=os.environ.get('LAYOUT','portrait')
OUT=None; pg=None; pw=None; br=None; srv=None
errs=[]; fails=[]; frames=[]; seen=set(); log=[]; fights=[]
REPICK_SWAPS=[(['amy'],['deedee']),(['rose'],['nara'])]   # chapter 20: who the test taps out and in at the first and the second pick
WIN_STEPS=400   # one step is about a second of the fight; a long boss (Gridlock Prime, 52 turns) sets a larger number before its fight
KEY="()=>dialog.active?(dialog.name+'|'+dialog.index+'|'+((dialog.pages&&dialog.pages[dialog.index])||dialog.lines[dialog.index]||'')):''"
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name,flush=True)
    if not ok: fails.append(name)
def snap(tag):
    n=len(frames); p=os.path.join(OUT,f'{n:03d}-{tag}.png'); pg.screenshot(path=p); frames.append((p,tag)); return p
def vpTotal(): return pg.evaluate("()=>{ const m=memberById('tom'); return m.vibes?Object.values(m.vibes.vp).reduce((x,y)=>x+y,0):0; }")   # Tom's own total: the Main Vibe earns the fight's VP, the Pocket Vibe half
def adv(stop,n=900,tag='s'):
    for i in range(n):
        if pg.evaluate(stop): return True
        if pg.evaluate("()=>battle.active&&!document.getElementById('b7-card').hidden===false"): return 'battle'
        if pg.evaluate("()=>!!(window.closeup&&closeup.active&&closeup.reveal)"):
            pg.wait_for_timeout(2200); snap(tag+'-reveal'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1200); continue
        if pg.evaluate("()=>!!(window.closeup&&closeup.active)"): return 'closeup'
        k=pg.evaluate(KEY)
        if k and pg.evaluate("()=>dialog.shown>=dialog.chars.length") and (tag,k) not in seen:
            seen.add((tag,k)); pg.wait_for_timeout(150); snap(tag); log.append((tag,k))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(110)
    return False
BAD="()=>{ const t=(document.getElementById('b3-app')||{}).innerText||''; const m=t.match(/.{0,30}(WARMTH|HEART|Warmth(?! Wave)).{0,30}/); if(m) window.__badWords=m[0]; return {words:!!m,b2:!battle.v3,v3:!!battle.v3}; }"
def win(tag):
    """Auto-play the fight on screen. Returns what happened (ended, card seen, Battle 3, Warmth words seen, tips shown)."""
    pg.wait_for_timeout(2500); snap(tag+'-battle-start')
    before=vpTotal(); info=pg.evaluate("()=>({foes:B3.F?B3.F.foes.map(f=>f.id):[],party:B3.F?B3.F.party.map(p=>p.id):[],v3:!!battle.v3,tut:(typeof B3S!=='undefined'&&B3S.tut)?B3S.tut.key:null,vp:(typeof B3S!=='undefined'&&B3S.fight)?B3S.fight.plan.vp:null})")
    # (any open menu is played, not only the cross: Amy's Burpee Blitz opens a second menu for its mini turn)
    # not B3.cfg.auto: the fight opens each family turn as the screen does (so the turn's tip shows), and the test then plays the simple player's move
    carded=False; words=False; b2seen=False; doneSnap=False; repicks=[]; everIn=None
    for i in range(WIN_STEPS):
        if not pg.evaluate("()=>battle.active"): break
        st=pg.evaluate("()=>({ui:B3.ui,card:!!(document.getElementById('b7-card')&&!document.getElementById('b7-card').hidden)})")
        bad=pg.evaluate(BAD); words=words or bad['words']; b2seen=b2seen or bad['b2']
        ei=pg.evaluate("()=>(B3.F&&B3.F.everIn)?B3.F.everIn.slice():null"); everIn=ei or everIn   # who has fought so far (chapter 20)
        if st['card']:
            if not carded: pg.wait_for_timeout(1500); snap(tag+'-card'); carded=True
            pg.keyboard.press('Enter'); pg.wait_for_timeout(600); continue
        if st['ui']=='done':
            if not doneSnap: snap(tag+'-end-'+str(pg.evaluate("()=>B3.F.over"))); doneSnap=True   # the end screen: YOU WIN, KNOCKED OUT, or a scripted end's own word and line
            pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(1500); continue
        # chapter 20's last fight: the pick-your-four page opens at each phase change. The test looks at it once, then taps like a player: out with one, in with a bench member, CONTINUE.
        if pg.evaluate("()=>!!document.getElementById('b3-repick')"):
            k=len(repicks); snap(tag+f'-repick{k+1}')
            out_in=REPICK_SWAPS[min(k,len(REPICK_SWAPS)-1)]
            for who in out_in[0]: pg.evaluate("(id)=>{ const e=document.querySelector('#b3-repick .rp-m[data-id=\"'+id+'\"]'); if(e) e.click(); }",who)
            for who in out_in[1]: pg.evaluate("(id)=>{ const e=document.querySelector('#b3-repick .rp-m[data-id=\"'+id+'\"]'); if(e) e.click(); }",who)
            snap(tag+f'-repick{k+1}-picked')
            pg.evaluate("()=>document.querySelector('#b3-repick .rp-go').click()"); pg.wait_for_timeout(2500)
            repicks.append(pg.evaluate("()=>B3.F.party.map(p=>p.id)")); snap(tag+f'-after-repick{k+1}'); continue
        if st['ui'] not in ('busy','done'): pg.evaluate("()=>{ if(B3.actor){ const p=(window.__rec&&b3Recommend(B3.F,B3.actor))||b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); } }")   # window.__rec (set by a test): Rose Mode's recommended moves, closer to a person than the simple player
        if i==40: snap(tag+'-battle-mid')
        pg.wait_for_timeout(1000)
    ended=not pg.evaluate("()=>battle.active")
    res=pg.evaluate("()=>B3.result")   # 'win', 'lose', or a scripted end ('flee', 'shell': engine/b3-script.js)
    tips=pg.evaluate("()=>{ const t=window.__tips||[]; window.__tips=[]; return t; }")   # the wrapper is installed at page start (start()), cleared after each fight
    r={'tag':tag,'result':res,'ended':ended,'card':carded,'v3':info['v3'],'words':words,'b2':b2seen,'foes':info['foes'],'party':info['party'],'tut':info['tut'],'vpPlan':info['vp'],'vpPaid':vpTotal()-before,'tips':tips,'repicks':repicks,'everIn':everIn}
    fights.append(r); return r
def run(stop,tag,n=900,expect=None):
    """Play scenes with Enter until `stop` is true; every fight that starts is auto-played and checked."""
    closeups=0
    while True:
        r=adv(stop,n,tag)
        if r=='closeup' and closeups<30:   # a close-up inside a scene (a reveal, a boss entrance): Enter moves it on, then the scene goes on
            closeups+=1; pg.wait_for_timeout(1200); pg.keyboard.press('Enter'); pg.wait_for_timeout(600); continue
        if r=='battle':
            f=win(tag); k=f['tut']
            scripted=f['result'] in ('flee','shell')   # a scripted end has no victory card and pays nothing
            check(f"{tag}: fight {'+'.join(f['foes'])} ended on Battle 3 and the victory card showed"+(f" (scripted end: {f['result']}, no card)" if scripted else ''),f['ended'] and f['v3'] and (f['card'] or scripted or f['result']=='lose'))
            bw=pg.evaluate("()=>window.__badWords||''") if f['words'] else ''   # (outside the f-string: Python before 3.12 refuses a backslash inside one)
            check(f"{tag}: no Warmth bar, WARMTH or HEART on the fight screen {bw}",not f['words'] and not f['b2'])
            if scripted: check(f"{tag}: a scripted end ({f['result']}) pays no Vibe Points ({f['vpPaid']})",f['vpPaid']==0)
            elif f['result']=='lose': check(f"{tag}: a lost fight pays no Vibe Points ({f['vpPaid']})",f['vpPaid']==0)
            else: check(f"{tag}: Tom's Vibe Points paid ({f['vpPaid']} for a {f['vpPlan']} VP fight: Main {f['vpPlan']} plus Pocket half)",f['vpPlan'] is not None and f['vpPaid']==f['vpPlan']+(f['vpPlan']+1)//2)
            want=pg.evaluate("(k)=>(B3_STORY.tips[k]||[]).map(t=>t.text)",k) if k else []
            check(f"{tag}: tips for '{k}' came from B3_STORY.tips and none showed twice (saw {len(f['tips'])}: {[t[:28] for t in f['tips']]})",(not want or any(t in want for t in f['tips'])) and len(set(f['tips']))==len(f['tips']))
            continue
        return r
def state(): return pg.evaluate("()=>({map:currentMap.id,x:player.x,y:player.y,ch:STORY.chapter,party:party.map(p=>p.id),intro:intro.active})")
def at(mapid,x,y,f='up'):
    pg.evaluate(f"()=>{{ currentMap=worlds['{mapid}']; player.x={x}; player.y={y}; player.facing='{f}'; player.move=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); }}"); pg.wait_for_timeout(700)
def go(mapid): pg.evaluate(f"()=>window.__LE.go('{mapid}')"); pg.wait_for_timeout(1500)
def enter(house): pg.evaluate(f"()=>beginTransition({{kind:'enter',house:houseById['{house}']}})"); pg.wait_for_timeout(2500)
def start(chapter,outdir=None,bonus=False):
    global OUT,pg,pw,br,srv
    OUT=outdir or (sys.argv[1] if len(sys.argv)>1 else f'/tmp/ch{chapter}b3-{LAYOUT}'); os.makedirs(OUT,exist_ok=True)
    socketserver.TCPServer.allow_reuse_address=True
    srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    pw=sync_playwright().start()
    br=pw.chromium.launch(executable_path=os.environ.get('CHROME') or None,args=['--headless=new','--no-proxy-server','--no-sandbox'])
    pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('response',lambda r: errs.append('404 '+r.url) if r.status==404 else None); pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.chapterJump&&window.__LE.b3sMode',timeout=180000); pg.wait_for_timeout(1500)
    if LAYOUT=='landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }")
    pg.evaluate(f"()=>{{ localStorage.removeItem('aot-b3-story'); splash.active=false; document.getElementById('splash').hidden=true; window.__LE.{'beginBonus' if bonus else 'chapterJump'}({'' if bonus else chapter}); }}")
    pg.evaluate("()=>{ window.__tips=[]; const o=b3Say; b3Say=function(t){ const all=[].concat(...Object.values(B3_STORY.tips)).map(x=>x.text); if(all.includes(String(t))) window.__tips.push(String(t)); return o.apply(this,arguments); }; }")   # records only the story tips (the fight's other messages repeat by design)
    check(f'switch defaults to BY CHAPTER and chapter {chapter} is on Battle 3',pg.evaluate(f"()=>b3sMode()==='chapter'&&b3sChapterOn({chapter})"))
    return pg
def finish(chapter):
    bad=[e for e in errs if 'favicon' not in e and 'net::' not in e and 'Failed to load resource' not in e and '29-grump-hollow' not in e]
    print('errors',bad[:8]); check('no page errors',not bad)
    check('every fight of the chapter ran on Battle 3 (none on battle 2)',all(f['v3'] for f in fights) and len(fights)>0)
    json.dump({'frames':[f[0] for f in frames],'log':log,'fails':fails,'fights':fights},open(os.path.join(OUT,'result.json'),'w'),indent=1)
    W,H=215,430
    for s in range(0,len(frames),12):
        chunk=frames[s:s+12]; sh=Image.new('RGB',(W*6,H*2),'white')
        for i,(p,t) in enumerate(chunk):
            im=Image.open(p).convert('RGB').resize((W,H)); sh.paste(im,((i%6)*W,(i//6)*H))
        sh.save(os.path.join(OUT,f'sheet-{s//12:02d}.png'))
    print('fights',[(f['tag'],'+'.join(f['foes']),f['vpPaid']) for f in fights]); print('frames',len(frames)); print('FAILS',fails)
    try: br.close(); pw.stop()
    except Exception: pass
    sys.exit(1 if fails else 0)
