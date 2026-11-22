# Battle 3 deck layout test (battleux1, plan claude/battleux-plan.md 3.4).
# Plays the first turns of three Battle Lab fights at the six screen sizes of plan 3.4 (plus the game's own rotated-stage mode on
# an upright iPhone), with DETAILS off and on, and FAILS when:
#   - the highlighted move is not fully on screen (inside the deck's box and inside the battle screen), for the move the turn starts
#     on, the last move and the move with the longest name;
#   - a move's name is cut (the text does not fit its box, or it is clipped by an ellipsis or a box that is too short);
#   - the tray's text overflows its box (the tray scrolls or is clipped), or the tray, the bar, the party strip or the deck stick out
#     of the battle screen;
#   - the scene (canvas) is smaller than 3.4 allows, or the page itself scrolls.
# b3look (claude/b3look-plan.md) adds, at every size and turn:
#   - DETAILS off: no part marked as a detail (class dx) shows in the strip, the party or the tray, and the scene draws no monster status
#     (plan table c);
#   - no fact from the plan's remove and merge rows shows twice: the highlighted move's name, price, flavor or kind in the tray, a Pet Peeve,
#     pushes, the next turn, Composure, HP, a wind-up or a Mark as a tray chip, Pep on the card of whoever is up, MARKED, NEXT TARGET or the
#     turn arrow over a family member on the scene; and at the end, "The family wins" in the tray (the scene says YOU WIN!) or moves left in the deck.
# Usage (repo root):  python3 tools/b3_layout_test.py          all sizes
#                     python3 tools/b3_layout_test.py 393x852  one size
# Env: OUT = folder for the screenshots (default tools/shots), SEED (default 7). Prints FAILS: [] when all pass.
import threading, http.server, socketserver, functools, os, sys, json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.environ.get('OUT',os.path.join(ROOT,'tools','shots')); os.makedirs(OUT,exist_ok=True)
SEED=int(os.environ.get('SEED','7'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); PORT=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
# name, width, height, rotated (the game's own quarter-turn on an upright phone), moves that must fit without scrolling, smallest scene width
SIZES=[('duo-unfolded',951,648,False,5,700),('desktop',1440,900,False,7,1000),('duo-folded-up',466,657,False,6,440),
       ('duo-folded-side',678,445,False,4,440),('iphone-up',393,852,False,7,380),('iphone-side',852,393,False,4,500),
       ('iphone-rotated',393,852,True,4,500)]
FIGHTS=[0,5,9]   # two Mudlings (Basic and the first Vibes), The Big One, Boppy joins (long names)
fails=[]; shots=[]
CHECK="""()=>{
  const out={bad:[],n:0}; const bat=document.getElementById('battle').getBoundingClientRect();
  const inside=(r,b,slack)=>r.left>=b.left-slack&&r.right<=b.right+slack&&r.top>=b.top-slack&&r.bottom<=b.bottom+slack;
  const box=document.getElementById('b3-deck'),rows=document.getElementById('b3-rows'),tray=document.getElementById('b3-tray');
  const vis=e=>{ const c=getComputedStyle(e); return c.display!=='none'&&c.visibility!=='hidden'&&e.getBoundingClientRect().width>0; };
  // the deck's scroll box: the element that actually scrolls the rows
  let sc=rows; for(let e=rows;e&&e!==document.body;e=e.parentElement){ if(e.scrollHeight>e.clientHeight+1&&/auto|scroll/.test(getComputedStyle(e).overflowY)){ sc=e; break; } }
  const sb=sc.getBoundingClientRect(),res=[];
  const rowEls=[...document.querySelectorAll('#b3-rows .bx-mv')];
  const names=rowEls.map(r=>{ const n=r.querySelector('.nm'); return n?n.textContent.trim():''; });
  const sel=rowEls.findIndex(r=>r.classList.contains('sel'));
  const nameCut=rowEls.map((r,i)=>{ const n=r.querySelector('.nm'); if(!n) return null; const rg=document.createRange(); rg.selectNodeContents(n); const t=rg.getBoundingClientRect(),b=n.getBoundingClientRect();
    return t.right>b.right+1||t.bottom>b.bottom+1||n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1?names[i]:null; });
  const trayText=tray?(tray.scrollHeight>tray.clientHeight+1||tray.scrollWidth>tray.clientWidth+1):false;
  const parts={};
  for(const id of ['b3-bar','b3-tray','b3-side','b3-party']){ const e=document.getElementById(id); if(e&&vis(e)){ const r=e.getBoundingClientRect(); parts[id]=inside(r,bat,1.5); } }
  const cv=document.getElementById('battle-canvas').getBoundingClientRect();
  return {sel,n:rowEls.length,names,nameCut,trayOver:trayText,trayScroll:tray?[tray.scrollHeight,tray.clientHeight]:null,parts,
    scene:[0,Math.round(layout.rotated?cv.height:cv.width),Math.round(layout.rotated?cv.width:cv.height)],   // a rotated stage reports its boxes turned: swap them back
    selRect:sel>=0?(()=>{ const r=rowEls[sel].getBoundingClientRect(); return {inScroll:r.top>=sb.top-1&&r.bottom<=sb.bottom+1&&r.left>=sb.left-1&&r.right<=sb.right+1,inBattle:inside(r,bat,1)}; })():null,
    rowsInView:rowEls.filter(r=>{ const q=r.getBoundingClientRect(); return q.top>=sb.top-1&&q.bottom<=sb.bottom+1; }).length,
    pageScroll:document.documentElement.scrollHeight>window.innerHeight+1||document.documentElement.scrollWidth>window.innerWidth+1,
    longest:names.reduce((a,n,i)=>n.length>(names[a]||'').length?i:a,0)};
}"""
LOOK="""(det)=>{
  const bad=[],app=document.getElementById('b3-app'),tray=document.getElementById('b3-tray'),e=b3Entry();
  const shown=el=>{ const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden') return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
  if(app.classList.contains('det')!==!!det) bad.push('the screen does not follow the DETAILS setting');
  if(!det) for(const el of document.querySelectorAll('#b3-side .dx,#b3-tray .dx')) if(shown(el)) bad.push('DETAILS off shows a detail: '+(el.className+' '+el.textContent).slice(0,60));
  const tt=tray.innerText;
  if(e&&!tray.classList.contains('log')) {
    if(tt.includes(e.name)) bad.push('the tray repeats the move name '+e.name);
    if(tray.querySelector('.act .bx-chip')) bad.push('the tray repeats the move flavor or kind as a chip');
    if(tray.querySelector('.bx-hp')) bad.push('the tray repeats an HP bar');
  }
  for(const c of tray.querySelectorAll('.bx-chip')) { const t=c.textContent.trim();
    if(/^Pet Peeve( |$)|turn bar|next turn|^\\d+ of \\d+ Composure|^HP |Winding up|^Marked$|^Pocket/i.test(t)) bad.push('a tray chip repeats a fact shown elsewhere: '+t); }
  if(/next turn: /i.test(tt)) bad.push('the tray repeats the next turn in words');
  const up=document.querySelector('#b3-party .bx-pc.up'); if(up&&up.querySelector('.pp')) bad.push('the up member\u2019s card repeats the Pep of the deck header');
  // the scene: record what is written on the canvas for a few frames
  const W=window.__bxDrawn||[]; window.__bxDrawn=null;
  for(const w of W) { if(/^(MARKED|NEXT TARGET)$/.test(w)) bad.push('the scene writes '+w+' over a family member (their card says it)');
    if(!det&&B3.F.foes.some(f=>b3ViewIcons(f.key).some(id=>B3_STATUS[id].short===w&&id!=='flustered'))) bad.push('DETAILS off: the scene writes the status '+w); }
  // battleux3: every live monster with a Pet Peeve shows one badge per Pet Peeve under it (the words are the flavors' names), badges are drawn
  // whatever DETAILS says, and the tray never says the target's Pet Peeves again.
  const B=window.__bxBadges||{};
  for(const f of B3.F.foes) if(f.hp>0) { const want=b3Peeves(f).map(k=>B3_FLAVORS[k].name).join(','),got=(B[f.key]||[]).join(',');
    if(want!==got) bad.push('the scene shows badges ['+got+'] for '+f.name+', its Pet Peeves are ['+want+']'); }
  if(tray.querySelector('.tgt .lab')&&!tray.querySelector('.tgt.look')) bad.push('the tray says Pet Peeves again');
  // Rose Mode (b3p): the rows carry pictures, with the recommended move starred (set by the test on turn 0 of the first fight)
  if(window.__bxRose) { const rows=[...document.querySelectorAll('#b3-rows .bx-mv')];
    if(rows.some(r=>!r.querySelector('.fl img.bi'))) bad.push('Rose Mode: a move has no picture');
    if(rows.some(r=>!r.classList.contains('ruck')&&!r.querySelector('.sub .dr img'))) bad.push('Rose Mode: a price has no drops');
    if(rows.some(r=>r.classList.contains('rec'))&&!rows.some(r=>r.classList.contains('rec')&&r.querySelector('.tag.rt img'))) bad.push('Rose Mode: the recommended move has no star and word');
    if(det===0) for(const el of document.querySelectorAll('#b3-rows .bx-mv .dx')) if(shown(el)) bad.push('Rose Mode, DETAILS off: a detail shows'); }
  return bad;
}"""
SPY="""()=>{ if(!window.__bxBSpy){ window.__bxBSpy=window.b3PeeveBadges; window.b3PeeveBadges=function(f){ const r=window.__bxBSpy.apply(this,arguments); if(window.__bxBadges) window.__bxBadges[f.key]=r; return r; }; } window.__bxBadges={};
  if(!window.__bxSpy){ window.__bxSpy=window.b3Text; window.b3Text=function(t){ if(window.__bxDrawn) window.__bxDrawn.push(String(t)); return window.__bxSpy.apply(this,arguments); }; } window.__bxDrawn=[]; }"""
def look(pg,det,pt):
    pg.evaluate(SPY); pg.wait_for_timeout(120)
    for b in pg.evaluate(LOOK,det): fails.append(f'{pt}: {b}')
def end_check(pg,name):
    """Finish the fight with a win: the tray adds only what the win paid and Continue, the deck holds no moves."""
    pg.evaluate("()=>{ for(const f of B3.F.foes) f.hp=0; const c={beats:[],g:'end',actor:null,ledger:{}}; b3KoCheck(B3.F,c); b3CheckOver(B3.F); b3Finish(); }"); pg.wait_for_timeout(300)
    v=pg.evaluate("()=>({tray:document.getElementById('b3-tray').innerText,rows:document.querySelectorAll('#b3-rows .bx-mv').length,go:!!document.querySelector('#b3-tray [data-done]')})")
    if 'wins' in v['tray']: fails.append(f'{name} end: the tray repeats the win the scene shows: {v["tray"][:60]}')
    if v['rows']: fails.append(f'{name} end: {v["rows"]} moves are still in the deck')
    if not v['go']: fails.append(f'{name} end: no Continue')
def wait_cmd(pg,t=40000): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&(B3.actor||B3.ui==='done')",timeout=t)
def run_size(br,name,w,h,rot,fit,minscene):
    ctx=br.new_context(viewport={'width':w,'height':h},device_scale_factor=1); pg=ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html'); pg.wait_for_function("()=>window.__LE&&window.__LE.b3Lab",timeout=60000)
    for idx in FIGHTS:
        for det in (0,1):
            pg.evaluate("([i,d])=>{ localStorage.setItem('aot-b3-details',d?'on':'off'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; if(!!layout.rotated!==%s) toggleLayout(); b3Lab(i,{seed:%d}); }"%('true' if rot else 'false',SEED),[idx,det])
            wait_cmd(pg); pg.wait_for_timeout(450)
            for turn in range(4):
                if pg.evaluate("()=>B3.ui")=='done': break
                tag=f'{name} fight {idx} details {det} turn {turn}'
                n=pg.evaluate("()=>B3.deck.length")
                picks=[None,n-1,'longest']
                for pk in picks:
                    if pk is not None:
                        v0=pg.evaluate(CHECK); i=v0['longest'] if pk=='longest' else pk
                        pg.evaluate("(i)=>b3Select(i)",i); pg.wait_for_timeout(260)
                    v=pg.evaluate(CHECK); pt=f'{tag} move {v["sel"]}'
                    look(pg,det,pt)
                    if v['sel']<0: fails.append(f'{pt}: no row is highlighted')
                    elif not v['selRect']['inScroll']: fails.append(f'{pt}: the highlighted move is not fully inside the deck box')
                    elif not v['selRect']['inBattle']: fails.append(f'{pt}: the highlighted move is off the battle screen')
                    cut=[c for c in v['nameCut'] if c]
                    if cut: fails.append(f'{pt}: a move name is cut: {cut}')
                    if v['trayOver']: fails.append(f'{pt}: the tray text overflows its box {v["trayScroll"]}')
                    for k,ok in v['parts'].items():
                        if not ok: fails.append(f'{pt}: {k} sticks out of the battle screen')
                    if v['pageScroll']: fails.append(f'{pt}: the page scrolls')
                    if v['scene'][1]<minscene: fails.append(f'{pt}: the scene is only {v["scene"][1]} wide (wants {minscene})')
                    if det==0 and turn==0 and pk is None:
                        # at the start of a turn the deck must show the moves 3.4 promises without scrolling
                        if v['rowsInView']<min(fit,v['n']): fails.append(f'{pt}: only {v["rowsInView"]} of {v["n"]} moves are in view (3.4 promises {fit})')
                        p=os.path.join(OUT,f'b3-layout-{name}-f{idx}.png'); pg.screenshot(path=p); shots.append(p)
                # play the turn with the Basic so the next member comes up
                pg.evaluate("()=>{ const i=B3.deck.findIndex(e=>e.grp==='basic'); if(i>=0) b3Select(i); }"); pg.wait_for_timeout(150)
                pg.evaluate("()=>b3Use()");
                try: wait_cmd(pg,30000)
                except Exception: break
                pg.wait_for_timeout(300)
            if idx==FIGHTS[0] and det==0 and pg.evaluate("()=>B3.ui")!='done': end_check(pg,name)
    # Rose Mode pass: pictures on, recommended move on; the first fight's first turns at DETAILS off and on
    for det in (0,1):
        pg.evaluate("([d])=>{ localStorage.setItem('aot-b3-details',d?'on':'off'); window.__bxRose=true; window.__bxD0=B7.diff; b7SetDiff('rose'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; b3Lab(0,{seed:%d}); }"%SEED,[det])
        try: wait_cmd(pg)
        except Exception: pass
        pg.wait_for_timeout(450)
        for pk in (None,'last'):
            if pk: pg.evaluate("()=>b3Select(B3.deck.length-1)"); pg.wait_for_timeout(200)
            if not pg.evaluate("()=>bpOn()"): fails.append(f'{name}: Rose Mode did not turn on'); break
            pt=f'{name} rose details {det} {pk}'; look(pg,det,pt)
            v=pg.evaluate(CHECK)
            if v['sel']>=0 and not v['selRect']['inScroll']: fails.append(f'{pt}: the highlighted move is not fully inside the deck box')
            cut=[c for c in v['nameCut'] if c]
            if cut: fails.append(f'{pt}: a move name is cut: {cut}')
        p=os.path.join(OUT,f'b3-layout-{name}-rose{det}.png'); pg.screenshot(path=p); shots.append(p)
    pg.evaluate("()=>{ window.__bxRose=false; b7SetDiff(window.__bxD0||'grace'); }")
    real=[e for e in errs if 'AudioContext' not in e]
    if real: fails.append(f'{name}: page errors {real[:3]}')
    ctx.close()
with sync_playwright() as p:
    br=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    want=sys.argv[1] if len(sys.argv)>1 else None
    for name,w,h,rot,fit,ms in SIZES:
        if want and want!=f'{w}x{h}' and want!=name: continue
        print('size',name,w,h,'rotated' if rot else ''); run_size(br,name,w,h,rot,fit,ms)
    br.close()
print('shots',len(shots))
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
