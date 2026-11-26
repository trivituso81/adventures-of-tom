#!/usr/bin/env python3
"""b3_hitstop_test.py (hitstop1, 2026-11-26): hit stop in a real Battle 3 fight (engine/b3-vfx.js b3vUnit, armed by b3PlayMove), in Chrome.
Plays moves by hand from the deck, in portrait and then landscape, with every b3DrawFoe and b3DrawMember call recorded as (battle clock, unit, time the unit was drawn at):
  1. A move whose manifest row has hitStopFrames > 0 and that hits a foe: the member and the foes it hits are drawn at ONE held time for about hitStopFrames / 24 s of the battle clock,
     starting at the hit (not before the hit beat showed), every other unit is drawn at the clock the whole time, and after the hold every unit is at the clock again.
  2. A move with hitStopFrames 0, a move with no manifest row, and a move with no hit hold nobody.
  3. The battle clock and the rules never wait: the hit beat shows at the cue's moment (within 0.15 s) with or without a hold, and the fight reaches the next command.
  4. A fight never breaks: a held draw that throws is dropped (logged once) and the fight goes on; no page errors.
Sheets: tools/shots/b3-hitstop-portrait.png, b3-hitstop-landscape.png (the frame before the hit, a frame inside the hold, the first frame after it).
Run (repo root): python3 tools/b3_hitstop_test.py [fight]   Env: CHROMIUM, OUT, MOVES=n (moves per orientation, default 4)."""
import threading, http.server, socketserver, functools, os, sys, json, io
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
LIMIT=int(os.environ.get('MOVES','4'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def need(ok,what):
    print(('ok   ' if ok else 'FAIL ')+what[:300])
    if not ok: fails.append(what)
def errors(errs): return [e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e and 'Hiccup' not in e and 'fault in' not in e]
def wait_cmd(pg,t=60000): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&(B3.actor||B3.ui==='done')",timeout=t)
def start(pg,fid):
    pg.evaluate("([i])=>{ b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; b3Lab(B3_LAB.findIndex(L=>L.id===i),{seed:7}); }",[fid])
    wait_cmd(pg); pg.wait_for_timeout(300)
    pg.evaluate("()=>{ B7.speed=2; }")
PREP="""()=>{ for(const p of B3.F.party) { p.pep=10; if(!p.ko) p.hp=p.maxHp; } for(const f of B3.F.foes) { f.hp=f.maxHp=99999; if(!f.broken&&!f.flusterTurn) { f.pips=f.maxPips; f.pipLock=false; } } b3RenderParty(); }"""
def canvas(pg,rot):
    r=pg.evaluate("()=>{ const b=document.getElementById('battle-canvas').getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height}; }")
    im=Image.open(io.BytesIO(pg.screenshot(clip=r))).convert('RGB')
    return im.rotate(90,expand=True) if rot else im
def sheet(frames,cols,path,w=420):
    if not frames: return
    frames=[f.resize((w,int(f.height*w/f.width))) for f in frames]; h=max(f.height for f in frames); rows=(len(frames)+cols-1)//cols
    S=Image.new('RGB',(cols*w,rows*h),(20,20,28))
    for i,f in enumerate(frames): S.paste(f,((i%cols)*w,(i//cols)*h))
    S.save(path)
# every draw of a unit is logged with the battle clock and the time it was drawn at; every hold that is armed is logged with the hit moment
INSTR="""()=>{ if(window.__I) return; window.__I=true; window.__L=[]; window.__faults=[]; const L=window.__L,r=x=>Math.round(x*10000)/10000;
  const F=b3DrawFoe,M=b3DrawMember; window.b3DrawFoe=function(f,t,p){ L.push(['d',r(B3P.t),f.key,r(t)]); return F.apply(this,arguments); }; window.b3DrawMember=function(u,t,p){ L.push(['d',r(B3P.t),u.key,r(t)]); return M.apply(this,arguments); };
  const A=b3vArm; window.b3vArm=function(h,c,s,hit){ const n=B3V.holds.length,ret=A(h,c,s,hit),H=B3V.holds.find(q=>q.src===h.src&&q.start===null); L.push(['arm',h.id,r(B3P.t),r(s),!!hit,H?{t0:r(H.t0),dur:r(H.dur),keys:H.keys.slice()}:null]); return ret; };
  const S=b3Show; window.b3Show=function(b){ if(b.t==='act'||b.t==='hit'||b.t==='miss') L.push(['show',b.t,r(B3P.t),b.id||null,b.tgt||null]); return S(b); };
  const G=gameFault; window.gameFault=function(w,e){ window.__faults.push(w); return G.apply(this,arguments); }; }"""
NOHOLD=os.environ.get('NOHOLD')   # A/B: the same fight with no hold armed (to see the frame cadence the fight has without hit stop)
def play(pg,fid,rot,frames,man):
    """Uses moves from the deck, one at a time, as a player does; returns [(who, move, log)] with the canvas captured before, inside and after each hold."""
    start(pg,fid); pg.evaluate(INSTR)
    if NOHOLD: pg.evaluate("()=>{ window.b3vHold=function(){}; }")
    by={m['moveId']:m for m in man['moves'] if m.get('moveId')}; res=[]; done=set()
    for _ in range(80):
        wait_cmd(pg)
        if pg.evaluate("()=>B3.ui==='done'") or len(res)>=LIMIT+2: break
        pg.evaluate(PREP); pg.wait_for_timeout(150)
        who=pg.evaluate("()=>B3.actor.id"); deck=pg.evaluate("()=>B3.deck.map((e,i)=>({i,id:e.id,name:e.name,ruckus:!!e.ruckus}))")
        cand=[e for e in deck if not e['ruckus'] and (who,e['id']) not in done]
        want=[e for e in cand if by.get(e['id'],{}).get('hitStopFrames',0)>0]
        zero=[e for e in cand if e['id'] in by and by[e['id']]['hitStopFrames']==0]
        nrow=[e for e in cand if e['id'] not in by]
        e=(want or zero or nrow or cand or deck)[0]
        # a hit stop move first, then once a move with no hit stop, once one with no row
        if len(res)>=LIMIT: e=(zero or nrow or want or cand or deck)[0]
        done.add((who,e['id']))
        pg.evaluate("()=>{ window.__L.length=0; }")
        pg.mouse.move(2,2)
        if e['i']<9: pg.keyboard.press('Digit'+str(e['i']+1))
        else: pg.evaluate("(i)=>b3Select(i)",e['i'])
        pg.wait_for_timeout(200); pg.keyboard.press('Enter')
        before=None; inside=None; after=None
        for k in range(80):
            st=pg.evaluate("()=>{ const H=B3V.holds.find(h=>h.start!=null&&B3P.t>=h.start&&B3P.t<h.start+h.dur); return {hold:!!H,armed:B3V.holds.length,early:B3V.holds.some(h=>h.start==null&&B3P.t<=h.t0-.4),cmd:window.__LE.battle.state==='command'&&(B3.ui==='deck'||B3.ui==='done')}; }")
            if before is None and st['armed'] and not st['hold'] and st['early']: before=canvas(pg,rot)   # taken well before the hit: a screenshot stalls the page for a moment
            if inside is None and st['hold']: inside=canvas(pg,rot)
            if inside is not None and after is None and not st['hold']: after=canvas(pg,rot)
            if k>8 and st['cmd']: break
            pg.wait_for_timeout(40)
        wait_cmd(pg)
        if inside is not None: frames.extend([x for x in (before,inside,after) if x is not None])
        res.append((who,e,pg.evaluate("()=>window.__L.slice()")))
    return res
def judge(res,man,tag,tol=.12):
    by={m['moveId']:m for m in man['moves'] if m.get('moveId')}; held=0
    for who,e,L in res:
        mid=e['id']; fr=by.get(mid,{}).get('hitStopFrames',0) if mid in by else None
        acts=[r for r in L if r[0]=='show' and r[1]=='act']; arms=[r for r in L if r[0]=='arm']; holds=[r for r in arms if r[5]]
        hits=[r for r in L if r[0]=='show' and r[1] in ('hit','miss') and acts and r[2]>=acts[0][2]]
        d=[r for r in L if r[0]=='d']
        heldfr=[r for r in d if r[3]<r[1]-1e-6]   # drawn at a time before the clock: a unit that is held
        name=f"{tag} {who} {e['name']} ({mid}, manifest {fr})"
        if os.environ.get('DEBUG'):
            cl=sorted({r[1] for r in d}); hh=[r[2] for r in hits[:1]]; print('   CADENCE',name[:60],'hit',hh,'gaps after hit',[round(b-a,3) for a,b in zip(cl,cl[1:]) if hh and hh[0]-.1<=a<=hh[0]+.4])
        if not fr:
            need(not holds and not heldfr,f"{name}: no hit stop in the manifest, nobody is held ({len(holds)} armed, {len(heldfr)} held draws)"); continue
        if not hits:
            need(not heldfr,f"{name}: no hit shows, nobody is held ({len(heldfr)} held draws)"); continue
        need(len(holds)==1,f"{name}: one hold is armed ({len(holds)})")
        if len(holds)!=1: continue
        H=holds[0][5]; dur=fr/24
        need(abs(H['dur']-dur)<1e-6,f"{name}: the hold is {fr}/24 = {dur:.3f} s ({H['dur']})")
        t0=H['t0']; first=hits[0][2]
        need(abs(first-t0)<=.15,f"{name}: the hit beat shows at the hold's moment ({first:.3f} vs {t0:.3f}), the clock did not wait")
        keys=H['keys']; ts=sorted({r[1] for r in heldfr})
        if not ts:
            # no frame was drawn inside the hold: the page itself stalled across it (Grace's dumpling effect costs one 0.2 s frame the first time it draws, with or without a hold). A hold the
            # clock has already passed is dropped, never played late: the stall must be at least as long as the hold.
            cl=sorted({r[1] for r in d}); k=next((i for i,c in enumerate(cl) if c>=t0),None); gap=(cl[k+1]-cl[k]) if k is not None and k+1<len(cl) else 0
            need(gap>=dur-1e-6 and os.environ.get('NOHOLD') is None,f"{name}: a {gap:.3f} s frame stall covered the hold, so it is dropped and not played late"); continue
        need(bool(ts) and all(r[2] in keys for r in heldfr),f"{name}: only {keys} are held ({sorted({r[2] for r in heldfr})})")
        # one held time for the whole hold, at or after the hit beat, lasting about dur of the battle clock
        times={r[3] for r in heldfr}; span=ts[-1]-ts[0]
        need(len(times)==1 and ts[0]>=first-1e-6,f"{name}: every held draw is at one picture time {sorted(times)[:3]}, from the first frame after the hit ({ts[0]:.3f} >= {first:.3f})")
        clocks=sorted({r[1] for r in d}); nxt=next((c for c in clocks if c>ts[0]+dur-1e-9),None)
        need(ts[-1]<ts[0]+dur-1e-9 and nxt is not None and nxt-ts[0]<dur+.3,f"{name}: the hold ends where the battle clock passes {dur:.3f} s: last held frame {ts[-1]-ts[0]:.3f} s in, the next frame {None if nxt is None else round(nxt-ts[0],3)} s in ({len(ts)} frames)")
        # the other units are never held; after the hold every unit is at the clock
        others=[r for r in d if r[2] not in keys and abs(r[3]-r[1])>1e-6]
        need(not others,f"{name}: units that are not in the hold are drawn at the clock the whole time ({len(others)} not)")
        aft=[r for r in d if r[1]>ts[-1]+.06]
        need(aft and all(abs(r[3]-r[1])<1e-6 for r in aft),f"{name}: after the hold every unit is at the clock ({len(aft)} frames)")
        held+=1
    return held
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--no-sandbox']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    elif os.path.exists('/usr/bin/google-chrome'): kw['executable_path']='/usr/bin/google-chrome'
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start&&typeof GT!=="undefined"&&GT.loaded',timeout=180000); pg.wait_for_timeout(1500)
    man=json.load(open(os.path.join(ROOT,'data/guide-manifest.json'),encoding='utf-8'))
    fid=([a for a in sys.argv[1:] if not a.startswith('-')] or ['new1'])[0]
    pf=[]; lf=[]
    res=play(pg,fid,False,pf,man); n=judge(res,man,fid+' portrait'); print(fid,'portrait: played',len(res),'moves,',n,'with a hit stop')
    need(n>=2,f'{fid} portrait: at least two moves with a hit stop were played and held ({n})')
    pg.evaluate("()=>{ b3LabReset(); }"); pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(500)
    res=play(pg,fid,True,lf,man); n=judge(res,man,fid+' landscape'); print(fid,'landscape: played',len(res),'moves,',n,'with a hit stop')
    need(n>=2,f'{fid} landscape: at least two moves with a hit stop were played and held ({n})')
    sheet(pf,3,os.path.join(OUT,'b3-hitstop-portrait.png'),w=380); sheet(lf,3,os.path.join(OUT,'b3-hitstop-landscape.png'),w=380)
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 4. a held draw that throws: the hold is dropped, the fault is logged once, the fight reaches the next command
    start(pg,fid); pg.evaluate(INSTR); pg.evaluate(PREP)
    pg.evaluate("""()=>{ window.__faults.length=0; const M=window.b3DrawMember,real=M; window.__real=real; window.b3DrawMember=function(u,t,p){ if(t<B3P.t-1e-6) throw new Error('held draw boom'); return real.apply(this,arguments); }; }""")
    by={m['moveId']:m for m in man['moves'] if m.get('moveId')}
    deck=pg.evaluate("()=>B3.deck.map((e,i)=>({i,id:e.id,ruckus:!!e.ruckus}))"); e=next((x for x in deck if not x['ruckus'] and by.get(x['id'],{}).get('hitStopFrames',0)>0),deck[0])
    pg.keyboard.press('Digit'+str(e['i']+1)); pg.wait_for_timeout(200); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    wait_cmd(pg)
    st=pg.evaluate("()=>({turns:B3.F.turnLog.length,ui:B3.ui,faults:window.__faults.slice(),holds:B3V.holds.length,fault:B3V.fault})")
    print('throwing held draw:',st)
    need(st['ui'] in ('deck','done') and st['faults'].count('hit stop')==1 and st['holds']==0,f"a held draw that throws is dropped and logged once, and the fight reaches the next command ({st})")
    pg.evaluate("()=>{ window.b3DrawMember=window.__real; }")
    e=errors(errs); need(not e,f'no page errors: {e[:3]}')
    br.close()
print('FAILS:',fails)
sys.exit(1 if fails else 0)
