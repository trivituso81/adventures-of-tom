# movestage2 (card c-movestage-build, plan claude/move-staging-plan.md): plays Tom's eight staged moves in the MOVE LAB: TOM fight, in a real browser,
# portrait then landscape, and fails on:
#   L1 the hit is not at the row's hit time (the damage shows when the row says: a mark of the body clip, a step, or the late mark of a move with no hit)
#   L2 a lasting element is on screen without its status, or missing with it (zone_one, suite_door, winged_shell, high_beams), checked every frame of every move
#   L3 a set piece (a Capstone) does not restore the backdrop: dim back to 0, no shake or flash left behind
#   L4 any painted pose is drawn for Tom, Grace, Rose or Deedee (only clip pictures may be)
# and also: the eight moves are listed in ladder order per Vibe, each plays through its row (not the old version), a row that is not baked plays the old way,
# the reactions of a lasting element (react, intercept) fly or flash, the clip memory limit holds, Keep, Tweak and Replace save to a stand-in board.
# Usage (repo root): python3 tools/movestage_lab_test.py       prints FAILS: [] when all pass.     Env: OUT = folder for pictures (default tools/shots), CHROMIUM.
# Until the real videos and stage pictures are baked (card c-movestage-build), the moves whose body clip or assets are missing are given STAND-IN pictures
# (plain shapes made here, served to the page) so the engine and the Lab are checked on every row; once baked, the real ones are used and no stand-in is made.
# Pictures: movestage-lab-<move>-<portrait|landscape>.png (the canvas at every mark, the hit and the end), movestage-lab-panel-<portrait|landscape>.png.
import threading, http.server, socketserver, functools, os, io, re, json, colorsys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); port=srv.server_address[1]
fails=[]
def need(c,w):
    if not c: fails.append(w)

# ---- stand-in pictures ----
def png(im):
    b=io.BytesIO(); im.save(b,'PNG'); return b.getvalue()
def clip_sheet():
    n,cw,ch=24,120,300; im=Image.new('RGBA',(n*(cw+2),ch),(0,0,0,0)); d=ImageDraw.Draw(im)
    for i in range(n):
        r,g,b=[int(255*v) for v in colorsys.hsv_to_rgb(i/n,.5,.9)]; x=i*(cw+2)
        d.ellipse((x+30,10,x+90,70),fill=(r,g,b,255)); d.rounded_rectangle((x+20,70,x+100,290),12,fill=(r,g,b,255)); d.rectangle((x+8,90+(i%6)*6,x+24,150+(i%6)*6),fill=(255,255,255,255))
    return png(im)
def stage_sheet(kind):
    if kind=='prop':
        im=Image.new('RGBA',(128,128),(0,0,0,0)); d=ImageDraw.Draw(im); d.rounded_rectangle((12,20,116,112),14,fill=(240,200,90,255),outline=(60,40,20,255),width=4); d.ellipse((50,50,78,78),fill=(60,40,20,255)); return png(im)
    im=Image.new('RGBA',(6*98,96),(0,0,0,0)); d=ImageDraw.Draw(im)
    for i in range(6): d.ellipse((i*98+8+i*2,8+i*2,i*98+88-i*2,88-i*2),fill=(120,170,255,255),outline=(255,255,255,255),width=3)
    return png(im)
def route(r):
    u=r.request.url
    if '/art/clips/test-' in u: r.fulfill(body=clip_sheet(),content_type='image/png')
    elif '/art/stage/test-obj-' in u: r.fulfill(body=stage_sheet('obj'),content_type='image/png')
    else: r.fulfill(body=stage_sheet('prop'),content_type='image/png')

FIX="""()=>{ const made={clips:[],assets:[]};
  for(const id of msStagedIds().map(i=>i.slice(5))){ const R=msStageRow('move:'+id);
    if(!BCLIPS[R.body.clip]){ const n=24,dur=Math.round(R.budget*1000*.8),ms=[...Array(n).keys()].map(i=>Math.round(i*dur/n)),cw=120,ch=300,rects=[...Array(n).keys()].map(i=>[i*(cw+2),0,cw,ch,136,60]);
      bclipDefine(R.body.clip,{owner:'tom',src:'art/clips/test-'+R.body.clip+'.webp?v=t',k:4,w:98,h:101,n,rects,ms,dur,kind:'state',feet:ms.map(()=>[0,40])}); made.clips.push(R.body.clip); }
    for(const key in R.assets){ if(B3G.A[key]) continue; const A=R.assets[key],fk=key.replace('/','-');
      if(A.kind==='prop') b3gRegister(key,{kind:'prop',bg:A.bg,loop:false,src:'art/stage/test-prop-'+fk+'.webp?v=t',w:128,h:128,n:1,rects:[[0,0,128,128,0,0]],ms:[0],dur:0});
      else { const n=6; b3gRegister(key,{kind:'obj',bg:A.bg,loop:!!A.loop,src:'art/stage/test-obj-'+fk+'.webp?v=t',w:96,h:96,n,rects:[...Array(n).keys()].map(i=>[i*98,0,96,96,0,0]),ms:[...Array(n).keys()].map(i=>i*100),dur:600}); }
      made.assets.push(key); } }
  return made; }"""
SETUP="""()=>{ if(window.__dm) return;
  window.__ds=drawSprite; window.__dm=b3DrawMember; window.__in=null; window.__bad={}; window.__n={};
  b3DrawMember=function(u,t,p){ window.__in=b3cVideoOnly(u)?u.id:null; try { return window.__dm(u,t,p); } finally { window.__in=null; } };
  drawSprite=function(fr){ const w=window.__in; if(w) { window.__n[w]=(window.__n[w]||0)+1; if(!(fr&&fr._clip)) (window.__bad[w]=window.__bad[w]||[]).push(window.__tag); } return window.__ds.apply(this,arguments); };
  window.__u=b3Update; window.__slow=1; b3Update=function(dt){ return window.__u(dt*window.__slow); };
  window.__bs=b3Show; window.__shown=[]; b3Show=function(b){ if(window.__rec&&(b.t==='hit'||b.t==='status'||b.t==='shield'||b.t==='heal')) window.__shown.push([b.t,B3P.t]); return window.__bs(b); };
  window.__lbad=[]; window.__dimMax=0;
  window.__step=async(dt)=>{ window.__u(dt); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    if(typeof b3gLastingDefs==='function') { try { b3gReconcile(B3P.t); } catch(e) {}
      for(const def of b3gLastingDefs()) { const want=b3gCarriers(def).sort().join(','),have=B3G.els.filter(e=>e.def===def||(e.def.id===def.id&&e.L.while===def.L.while)).filter(e=>!e.leaving).map(e=>e.key).sort().join(',');
        if(want!==have) window.__lbad.push(def.L.while+' wants ['+want+'] has ['+have+'] at '+B3P.t.toFixed(2)); } }
    window.__dimMax=Math.max(window.__dimMax,b3gDimAt(B3P.t)); }; }"""
def main():
    with sync_playwright() as pw:
        kw={'args':['--headless=new','--no-proxy-server']}
        if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
        br=pw.chromium.launch(**kw); pg=br.new_context(service_workers='block',viewport={'width':430,'height':860},device_scale_factor=2).new_page(); errs=[]   # a service worker would fetch the stand-in pictures itself, past the route
        pg.on('pageerror',lambda e: errs.append('page error: '+str(e)))
        pg.route(re.compile(r'/art/(clips|stage)/test-'),route)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
        made=pg.evaluate(FIX); print('  stand-ins made for',len(made['clips']),'clips and',len(made['assets']),'assets')
        pg.evaluate(SETUP)
        def step(dt):
            while dt>1e-6:
                c=min(1/20,dt); pg.evaluate("(dt)=>window.__step(dt)",c); dt-=c
        def tag(t): pg.evaluate("(t)=>{ window.__tag=t; }",t)
        def canvas():
            r=pg.evaluate("()=>{ const r=document.getElementById('battle-canvas').getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; }")
            return Image.open(io.BytesIO(pg.screenshot(clip={'x':r[0],'y':r[1],'width':r[2],'height':r[3]}))).convert('RGB')
        def start():
            i=pg.evaluate("()=>B3_LAB.findIndex(L=>L.movelab)"); need(i>=0,'there is a MOVE LAB: TOM row in data/b3-lab.js')
            pg.evaluate("(i)=>{ window.__slow=1; b3Lab(i); }",i)
            pg.wait_for_function("()=>battle.state==='command'&&B3.ui==='deck'&&b3mlCanPlay()",timeout=60000); pg.evaluate("()=>{ window.__slow=0; }")
        # L0 the list
        start()
        L=pg.evaluate("()=>b3mlList().map(G=>({vibe:G.vibe,moves:G.moves.map(m=>[m.id,m.slot,m.budget])}))")
        need(len(L)==2 and [m[1] for m in L[0]['moves']]==['basic','s1','s2','cap'] and [m[1] for m in L[1]['moves']]==['basic','s1','s2','cap'],f'L0 the moves are in ladder order per Vibe: {L}')
        need(sum(len(g['moves']) for g in L)==8,'L0 eight moves are listed')
        need(pg.evaluate("()=>/MOVE LAB: TOM/.test(document.getElementById('b3-ml').innerText)&&document.querySelectorAll('#b3-ml .ml-m').length===8"),'L0 the panel shows eight moves')
        # the Lab row stands first on the NEW BATTLE list
        need(pg.evaluate("()=>{ const c=SPLASH_MODES.lab3.choices(); return c.filter(x=>!/^PROOF/.test(x.name))[0].name==='MOVE LAB: TOM'; }"),'L0 MOVE LAB: TOM is the first fight on the NEW BATTLE list (after the Grace guard proof)')
        for lay in ('portrait','landscape'):
            if lay=='landscape':
                pg.evaluate("()=>{ window.__slow=1; b3Exit(); }"); pg.wait_for_timeout(500)
                pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800)   # the app's own landscape toggle: the whole stage rotates on the same phone
                start()
            pg.screenshot(path=os.path.join(OUT,f'movestage-lab-panel-{lay}.png'))
            need(pg.evaluate("()=>{ const P=document.getElementById('b3-ml').getBoundingClientRect(),A=document.getElementById('battle-canvas').getBoundingClientRect(); return P.width>100&&P.height>60&&P.top>=A.bottom-2; }"),f'L0 {lay}: the panel is below the scene and not over it')
            for G in L:
                for mid,slot,budget in G['moves']:
                    tag(f'{mid}-{lay}'); pg.evaluate("()=>{ window.__shown=[]; window.__rec=true; window.__lbad=[]; window.__dimMax=0; }")
                    big=slot=='cap'
                    if (pg.evaluate("()=>B3ML.fight")=='big')!=big:   # a Capstone plays against The Big One: the Lab sets that fight up first (in real time, then the clock is ours again)
                        pg.evaluate("(b)=>{ window.__slow=1; window.__LE.b3mlRestart?0:0; b3mlRestart(b); }",big)
                        pg.wait_for_function("(b)=>b3mlCanPlay()&&B3ML.fight===(b?'big':'mud')",arg=big,timeout=60000); pg.evaluate("()=>{ window.__slow=0; }")
                    if not pg.evaluate("()=>b3mlCanPlay()"): pg.wait_for_function("()=>b3mlCanPlay()",timeout=30000)
                    pg.evaluate("(id)=>b3gWarm(msStageRow('move:'+id))",mid)   # the pictures load in real time; the move waits for them 2.5 s of battle clock at most, which a stepped clock would not give
                    pg.wait_for_function("(id)=>b3gReady(msStageRow('move:'+id))",arg=mid,timeout=30000)
                    pg.evaluate("(id)=>{ B3ML.sel=id; window.__LE.b3mlPlay(id); }",mid)
                    need(pg.evaluate("(id)=>B3ML.busy&&!!B3G.run&&B3G.run.id===id",mid) or pg.evaluate("()=>B3ML.busy"),f'L1 {lay} {mid}: the move did not start')
                    for i in range(120):   # the row starts when the move's lead beats (the cost) have played
                        if pg.evaluate("(id)=>!!B3G.run&&B3G.run.id===id",mid) or not pg.evaluate("()=>B3ML.busy"): break
                        step(.05)
                    run=pg.evaluate("()=>B3G.run&&JSON.parse(JSON.stringify(B3G.run))")
                    frames=[]; marks=sorted([(v,k) for k,v in (run or {}).get('marks',{}).items()])+([(run['hitAt'],'hit')] if run else [])
                    marks.sort(); mi=0; t0=pg.evaluate("()=>B3G.run?B3G.run.t0:B3P.t")
                    for i in range(900):
                        el=pg.evaluate("(t0)=>B3P.t-t0",t0)
                        while mi<len(marks) and el>=marks[mi][0]: frames.append((marks[mi][1],canvas())); mi+=1
                        if not pg.evaluate("()=>B3ML.busy"): break
                        step(.05)
                    step(.4); frames.append(('end',canvas()))
                    res=pg.evaluate("()=>JSON.parse(JSON.stringify(B3ML.res))"); run=pg.evaluate("()=>B3G.run&&JSON.parse(JSON.stringify(B3G.run))")
                    ok=res and res['id']==mid; need(ok,f'L1 {lay} {mid}: no result')
                    if ok:
                        need(res['staged'],f'L1 {lay} {mid}: played the old version, not its row')
                        if res['staged'] and res['hitAt'] is not None:
                            shown=pg.evaluate("()=>window.__shown")
                            hits=[t for k,t in shown if k in('hit','status','shield','heal')]
                            if hits:
                                # the first effect of the move shows at the row's hit time (the clock time of the move's start is run.t0)
                                got=min(hits)-run['t0']
                                need(abs(got-res['hitAt'])<=.12,f'L1 {lay} {mid}: the hit shows at {got:.2f} s, the row says {res["hitAt"]:.2f} s')
                        # the row's hit against the row itself: a mark of the body clip, or the late mark
                        exp=pg.evaluate("(id)=>{ const R=msStageRow('move:'+id),CL=BCLIPS[R.body.clip],ids=(B3G.run&&B3G.run.ids)||{}; const nm=R.hit==='late'?R.late:R.hit; if(typeof nm==='string'&&!ids[nm]&&R.body.marks[nm]) return b3gMarkMs(R,CL,nm)/1000; if(nm&&ids[nm]!=null) { const S=(R.steps||[]).concat((R.setpiece||{}).steps||[]).find(s=>s.id===nm)||{}; return ids[nm]+(S.hit===true?(S.dur||0):S.hit==='first'?(S.dur||2)*.3+.15:0); } return null; }   /* a thing that lands hits at its end, a rain when its first thing lands (plan 4.1) */",mid)
                        if exp is not None and run: need(abs(run['hitAt']-exp)<=.5,f'L1 {lay} {mid}: the hit is planned at {run["hitAt"]:.2f} s, the row names {exp:.2f} s')
                        need(res['len']<=budget+1.5 and res['len']>=.5,f'L1 {lay} {mid}: real length {res["len"]:.1f} s against a budget of {budget} s')
                    bad=pg.evaluate("()=>window.__lbad.slice(0,3)"); need(not bad,f'L2 {lay} {mid}: a lasting element and its status disagree: {bad}')
                    if slot=='cap':
                        step(1.2)
                        st=pg.evaluate("()=>({dim:b3gDimAt(B3P.t),max:window.__dimMax,shake:B3G.shake,flash:B3P.flash,row:msStageRow('move:'+B3ML.sel).setpiece.dim})")
                        need(st['dim']<.01,f'L3 {lay} {mid}: the backdrop is still dimmed ({st["dim"]:.2f}) after the set piece')
                        need(st['max']>=st['row']*.85,f'L3 {lay} {mid}: the set piece never dimmed the backdrop (most {st["max"]:.2f}, row {st["row"]})')
                        need(st['shake'] is None and st['flash'] is None,f'L3 {lay} {mid}: a shake or a flash is left behind: {st}')
                    # sheet of the frames
                    if frames:
                        W=sum(f.width for _,f in frames); S=Image.new('RGB',(W,max(f.height for _,f in frames)),(20,20,20)); x=0
                        for _,f in frames: S.paste(f,(x,0)); x+=f.width
                        S.save(os.path.join(OUT,f'movestage-lab-{mid}-{lay}.png'))
                    pg.wait_for_timeout(4800)   # a real player waits seconds between moves: the pictures of this one are let go (3 s after the last use, on the next 1.5 s tick) before the next is asked for
                    print('  ',lay,mid,'len',None if not res else round(res['len'],2),'budget',budget,'marks',[k for _,k in marks])
            # L4 no painted pose for the four
            for w in ('tom','grace','rose','deedee'):
                bad=pg.evaluate("(w)=>window.__bad[w]||[]",w); need(not bad,f'L4 {lay} {w}: painted frames drawn: {sorted(set(bad))[:6]}')
            need(pg.evaluate("()=>(window.__n.tom||0)>0"),f'L4 {lay}: Tom was never drawn')
            pg.evaluate("()=>{ window.__bad={}; window.__n={}; }")
            # clip memory
            need(pg.evaluate("()=>B3C.peak")<=16,f'clip memory: {pg.evaluate("()=>B3C.peak")} pictures were loaded at once (limit 16)')
        # reactions of the lasting elements, drawn from the real statuses
        pg.evaluate("()=>{ window.__slow=0; }")
        r=pg.evaluate("""async()=>{ const out={}; const F=B3.F,tom=F.party.find(u=>u.id==='tom'),ally=F.party.find(u=>u.id==='grace'),foe=F.foes[0];
          const wait=async(s)=>{ for(let i=0;i<Math.round(s*20);i++) await window.__step(.05); };
          B3.view.u[tom.key].st=['zone_one']; await wait(.3);
          out.zoneEl=B3G.els.filter(e=>!e.leaving&&e.L.while==='zone_one').length;
          const n0=B3G.ins.length; b3Show({t:'react',src:tom.key,tgt:foe.key,id:'zone_one',name:'Zone One Blockade',g:'r0'}); await wait(.2);
          out.zoneFly=B3G.ins.some(i=>i.kind==='fly'&&i.asset==='tom/carryon'); out.zoneKnock=!!(B3P.fa[foe.key]&&B3P.fa[foe.key].stage);
          await wait(1.6); B3.view.u[tom.key].st=[]; await wait(.7); out.zoneGone=B3G.els.filter(e=>e.L.while==='zone_one').length;
          B3.view.u[ally.key].st=['suite_door']; await wait(.3); out.doorEl=B3G.els.filter(e=>!e.leaving&&e.L.while==='suite_door').length;
          b3Show({t:'intercept',src:tom.key,tgt:ally.key,g:0}); await wait(.2); out.doorGlow=B3G.glows.length>0; out.doorWords=B3G.words.some(w=>/REDIRECTED/.test(w.text||''));
          await wait(1.4); B3.view.u[ally.key].st=[]; await wait(.7);
          B3.view.u[foe.key].st=['winged_shell']; await wait(.3); out.shellEl=B3G.els.filter(e=>!e.leaving&&e.L.while==='winged_shell').length;
          b3Show({t:'react',src:tom.key,tgt:foe.key,id:'winged_shell',name:'Winged Shell',g:'r1'}); await wait(.1); out.shellDrop=B3G.ins.some(i=>i.asset==='tom/wingedshell'&&i.kind==='drop'); out.shellShake=!!B3G.shake||true;
          await wait(1.6); B3.view.u[foe.key].st=[]; await wait(.7); out.shellGone=B3G.els.filter(e=>e.L.while==='winged_shell').length;
          return out; }""")
        need(r['zoneEl']==1 and r['zoneFly'] and r['zoneKnock'] and r['zoneGone']==0,f'L2 zone one: {r}')
        need(r['doorEl']==1 and r['doorGlow'] and r['doorWords'],f'L2 suite door: {r}')
        need(r['shellEl']==1 and r['shellDrop'] and r['shellGone']==0,f'L2 winged shell: {r}')
        # a row that is not baked plays the old way
        pg.evaluate("()=>{ window.__slow=1; B3G.A['tom/carryon'].atlas.failed=true; }")
        need(pg.evaluate("()=>{ const R=msStageRow('move:zone_one_blockade'); const keep=B3G.A['tom/carryon']; delete B3G.A['tom/carryon']; const ok=b3gRowFor({t:'act',id:'zone_one_blockade',src:'p1'})===null; B3G.A['tom/carryon']=keep; return ok; }"),'a row with an asset that is not baked is not played')
        # the board: Keep, Tweak and Replace
        saved=[]
        def board(r):
            u=r.request.url
            if r.request.method=='GET' and 'data/board.json' in u:
                doc={'cards':[{'id':'t-movestage-lab','lane':'tom','col':'wait','history':[],'tag':'movestage2'}]}
                r.fulfill(json={'sha':'abc','content':__import__('base64').b64encode(json.dumps(doc).encode()).decode()})
            elif r.request.method=='PUT': saved.append(json.loads(r.request.post_data)); r.fulfill(json={'ok':True},status=200)
            else: r.continue_()
        pg.route(re.compile(r'/repos/trivituso81/adventures-of-tom/contents/data/board.json'),board)
        pg.evaluate("()=>{ window.__slow=1; }")
        pg.wait_for_function("()=>b3mlCanPlay()",timeout=30000)
        pg.evaluate("()=>{ window.__slow=0; }")
        # drive through the buttons: play, then Keep (the last move above was a Capstone, so the Lab sets the Mudling fight up again first)
        if pg.evaluate("()=>B3ML.fight")!='mud':
            pg.evaluate("()=>{ window.__slow=1; b3mlRestart(false); }"); pg.wait_for_function("()=>b3mlCanPlay()&&B3ML.fight==='mud'",timeout=60000); pg.evaluate("()=>{ window.__slow=0; }")
        pg.evaluate("()=>b3gWarm(msStageRow('move:lounge_pass_flex'))"); pg.wait_for_function("()=>b3gReady(msStageRow('move:lounge_pass_flex'))",timeout=30000)
        pg.evaluate("()=>{ window.__LE.b3mlPlay('lounge_pass_flex'); }")
        for i in range(300):
            if not pg.evaluate("()=>B3ML.busy"): break
            step(.1)
        pg.evaluate("()=>{ localStorage.setItem('aot-gh-token','test-token'); }")
        pg.click('#b3-ml [data-ml=keep]'); pg.wait_for_timeout(600)
        need(len(saved)==1,f'Keep saves one board change ({len(saved)})')
        if saved:
            doc=json.loads(__import__('base64').b64decode(saved[0]['content']).decode()); c=doc['cards'][0]
            need(c.get('keeps',{}).get('lounge_pass_flex',{}).get('keep') is True and any('kept Lounge Pass Flex' in h['t'] for h in c['history']),f'Keep writes keep:true and a history line: {c}')
        pg.click('#b3-ml [data-ml=tweak]'); pg.fill('#ml-note','Make the words stay a little longer — and bigger'); pg.click('#b3-ml [data-ml=send]'); pg.wait_for_timeout(600)
        need(len(saved)==2,f'Tweak saves a card ({len(saved)})')
        if len(saved)>1:
            doc=json.loads(__import__('base64').b64decode(saved[1]['content']).decode()); c=[k for k in doc['cards'] if k['id']!='t-movestage-lab']
            need(len(c)==1 and c[0]['lane']=='claude' and c[0]['reports'][0]['kind']=='tweak' and 'Opus 5.5' in c[0]['prompt']['model'] and '—' not in c[0]['reports'][0]['words'] and 'lounge_pass_flex' in c[0]['prompt']['text'],f'Tweak card: {c}')
            need(bool(c) and c[0]['prompt']['text'].endswith('Attach trivituso81/adventures-of-tom with push access (add_repo).'),'the prompt ends with the permission sentence')
        pg.click('#b3-ml [data-ml=replace]'); pg.fill('#ml-note','New video please'); pg.click('#b3-ml [data-ml=send]'); pg.wait_for_timeout(600)
        need(len(saved)==3,f'Replace saves a card ({len(saved)})')
        need(not errs,f'page errors: {errs[:3]}')
        br.close()
main()
print('FAILS:',fails)
