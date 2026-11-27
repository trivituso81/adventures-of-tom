# Move Workbench phase 1 test (movebench1, claude/movebench-plan.md section c and the phase 1 row of section g).
# The preview stage is bench.html (the game's own scripts without the baked voice) plus engine/b3-bench.js; the Battle Guide holds the box and the controls.
# FAILS when:
#   - bench.html does not boot, loads 25 MB or more of script, or asks for a voice file;
#   - a family move or monster attack cannot be set up in the stub fight (every one of them is checked, nothing is played for that);
#   - a staged move, a move with only a clip, a move with the default motion, or a monster attack with a wind-up does not play to the end;
#   - more than 16 clips are in memory at once (b3cLoaded, the limit tools/b3_test.py s8 uses);
#   - any page asks for GitHub's dispatch address, fal or xAI, or the game logs a battle fault;
#   - at 466 x 657, 678 x 445, 951 x 648 and 669 x 869 the Guide's box is not fully on screen, is covered, is not 16:9, or a control is cut off or missing;
#   - Pause does not hold the clock, a speed button does not reach the frame, or the frame is not the same one for the next animation;
#   - the frame is still there after leaving the Animations tab.
# Phase 2 (movebench2) adds, and FAILS when:
#   - a replay to the same moment is not the same picture: three moments of each of three moves, drawn after a seek, after going away and back (the run is built again
#     from the start), and after going on from an earlier moment (the run is not built again);
#   - the bar is missing its lanes, its HIT line or its playhead, or dragging it does not stop the preview at that moment, or one picture on / back is not 1/24 s;
#   - a body state (guard up and down with a braced hit, a hit, a dodge, a knock-out, victory, running, a monster's hit and fall), a wind-up alone (the attack must never land)
#     or a move with a monster's answer after it does not play to its end, or the answer is not in the bar;
#   - a move whose body video is not made yet does not show its stage steps and effects over the standing video with the label NO VIDEO YET: SHOWN ON THE STANDING VIDEO,
#     or the game (cfg.bench not set) plays it any other way than before, or anything but engine/b3-bench.js sets cfg.bench;
#   - every body state and wind-up the frame says it can play can be set up in the stub fight (they are checked, nothing is played for that).
# Usage (repo root): python3 -I tools/movebench/preview_test.py [outdir]     Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass.
import threading, http.server, socketserver, functools, os, sys, re, time, json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'tools','shots','movebench'); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); PORT=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{PORT}'
FORBID=re.compile(r'api\.github\.com/.*dispatches|fal\.(ai|run)|queue\.fal|api\.x\.ai|(^|\.)x\.ai/',re.I)
SIZES=[('duo-folded-up',466,657),('duo-folded-side',678,445),('duo-unfolded',951,648),('duo-unfolded-up',669,869)]
fails=[]; notes=[]; seen_urls=set(); frame_voice=[]
def fail(m): fails.append(m); print('FAIL',m,flush=True)
frame_out=[]
def watch(pg):
    def req(r):
        seen_urls.add(r.url)
        try:
            if 'bench.html' in r.frame.url and not r.url.startswith(BASE) and not r.url.startswith('data:') and not r.url.startswith('blob:'): frame_out.append(r.url)
            if 'bench.html' in r.frame.url and re.search(r'/data/voice',r.url): frame_voice.append(r.url)
        except Exception: pass
    pg.on('request',req)
    pg.on('pageerror',lambda e: fail('page error: '+str(e)[:200]))
def boot_bench(br,w=466,h=262):
    pg=br.new_page(viewport={'width':w,'height':h}); watch(pg)
    pg.goto(BASE+'/bench.html')
    pg.wait_for_function('()=>window.__BENCH_BOOT&&(window.__BENCH_BOOT.done||window.__BENCH_BOOT.error)',timeout=120000)
    b=pg.evaluate('()=>window.__BENCH_BOOT')
    if b['error']: fail('bench.html did not boot: '+b['error'])
    pg.evaluate("""()=>{ window.__faults=[]; const g=gameFault; window.gameFault=function(w,e){ window.__faults.push(w+': '+(e&&e.message||e)); return g.apply(this,arguments); };"""+"""
      window.__staged=[]; const sp=b3gPlay; window.b3gPlay=function(R,o){ window.__staged.push(o&&o.head&&o.head.id); return sp.apply(this,arguments); }; }""")
    return pg,b
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    # ---------- 1. boot and size ----------
    pg,b=boot_bench(br)
    notes.append('boot: %d scripts, %.1f MB, %d ms'%(b['scripts'],b['bytes']/1e6,b['ms']))
    if b['bytes']>=25e6: fail('bench.html loaded %.1f MB of script (limit 25 MB)'%(b['bytes']/1e6))
    if frame_voice: fail('bench.html asked for a voice file: %s'%frame_voice[:2])
    # ---------- 2. every move and attack can be set up ----------
    r=pg.evaluate("""()=>{ const out={moves:0,acts:0,bad:[]};
      for(const S of Object.values(B3_SKILLS)){ if(!S.vibe||!B3_VIBES[S.vibe]) continue; out.moves++; const w=B3BENCH.preflight('move:'+S.id); if(w) out.bad.push(['move:'+S.id,w]); }
      for(const f of Object.values(B3_FOES)) for(const a of f.acts){ if(a.hits==='attacker') continue; out.acts++; const w=B3BENCH.preflight('act:'+f.id+':'+a.id); if(w) out.bad.push(['act:'+f.id+':'+a.id,w]); }
      return out; }""")
    notes.append('set up in the stub fight: %d family moves, %d monster attacks, %d that cannot'%(r['moves'],r['acts'],len(r['bad'])))
    for x in r['bad']: fail('cannot be set up: %s (%s)'%tuple(x))
    if r['moves']<100 or r['acts']<300: fail('far fewer animations than expected: %s moves, %s attacks'%(r['moves'],r['acts']))
    # ---------- 3. samples play to the end ----------
    S=pg.evaluate("""()=>{ const sk=Object.values(B3_SKILLS).filter(S=>S.vibe&&B3_VIBES[S.vibe]);
      const staged=sk.find(S=>msStageRow('move:'+S.id)&&b3gDefined(msStageRow('move:'+S.id))&&S.slot!=='cap'),clip=sk.find(S=>!(msStageRow('move:'+S.id)&&b3gDefined(msStageRow('move:'+S.id)))&&msClipOf('move:'+S.id)),def=sk.find(S=>S.slot!=='cap'&&!(msStageRow('move:'+S.id)&&b3gDefined(msStageRow('move:'+S.id)))&&!msClipOf('move:'+S.id));
      let wind=null; for(const f of Object.values(B3_FOES)) for(const a of f.acts) if(!wind&&msWindClip(f.id,a.id)&&a.hits!=='attacker') wind=f.id+':'+a.id;
      const cap=sk.find(S=>S.slot==='cap');
      return {staged:'move:'+staged.id,clip:'move:'+clip.id,default:'move:'+def.id,wind:'act:'+wind,capstone:'move:'+cap.id}; }""")
    notes.append('samples: '+json.dumps(S))
    peak=0
    for kind,id in S.items():
        pg.evaluate("(id)=>{ const N=B3BENCH.BN; N.loop=false; N.turbo=4; B3C.peak=0; B3BENCH.go(id); }",id)
        t=time.time(); st=None; sawStage=False; shot=False; maxc=0
        while time.time()-t<90:
            st=pg.evaluate("()=>{ const s=B3BENCH.status(); s.stage=typeof B3G!=='undefined'&&!!B3G.run&&B3G.run.id===B3BENCH.BN.id.slice(5); s.peak=B3C.peak; return s; }")
            sawStage=sawStage or st['stage']; maxc=max(maxc,st['clips'],st['peak'])
            if st['state']=='playing' and st['t']>.8 and not shot:
                pg.screenshot(path=os.path.join(OUT,'play-%s.png'%kind)); shot=True
            if st['state'] in ('ended','none'): break
            time.sleep(.25)
        peak=max(peak,maxc)
        if st['state']!='ended': fail('%s (%s) did not play to the end: state %s %s'%(kind,id,st['state'],st['msg']))
        elif not st['len'] or st['len']<.3: fail('%s (%s) ended with a length of %s'%(kind,id,st['len']))
        if kind=='staged' and not sawStage: fail('the staged move %s never ran its stage row (B3G.run)'%id)
        notes.append('%s %s: ran %.1f s, clips in memory at most %d'%(kind,id,st['len'] or 0,maxc))
        if not shot: fail('no picture was taken of %s'%id)
    if peak>16: fail('%d clips were in memory at once (limit 16)'%peak)
    faults=pg.evaluate('()=>window.__faults')
    if faults: fail('the game logged battle faults: %s'%faults[:3])

    # ---------- 3b. movebench2: the same moment is the same picture; states, winds, answers, no video yet ----------
    ids=json.load(open(os.path.join(ROOT,'data','guide-anims.json')))['anims']
    pg.evaluate("""()=>{ window.__h=async()=>{ await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))));
        const u=fightCtx.canvas.toDataURL('image/png'); let h=2166136261; for(let i=0;i<u.length;i+=5){ h^=u.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h+':'+u.length; };
      window.__ready=async(id,ans)=>{ const N=B3BENCH.BN; N.loop=false; N.turbo=1; N.answer=!!ans; B3BENCH.go(id); const t=performance.now();
        while(performance.now()-t<70000){ const s=B3BENCH.status(),tl=B3BENCH.timeline(); if(s.state==='playing'&&tl&&tl.id===id&&tl.answer===!!ans){ B3BENCH.pause(); return true; } if(s.state==='none') return false; await new Promise(r=>setTimeout(r,100)); }
        return false; };
      window.__play=async(id,ans)=>{ const N=B3BENCH.BN; N.loop=false; N.turbo=4; N.answer=!!ans; B3BENCH.go(id); const t=performance.now(); let st=null;
        while(performance.now()-t<90000){ st=B3BENCH.status(); if(st.state==='ended'||st.state==='none') break; await new Promise(r=>setTimeout(r,150)); } return {st,tl:B3BENCH.timeline()}; }; }""")
    moves=pg.evaluate("""()=>{ const sk=Object.values(B3_SKILLS).filter(S=>S.vibe&&B3_VIBES[S.vibe]);
      const clip=sk.find(S=>S.id!=='lounge_pass_flex'&&S.id!=='zone_one_blockade'&&!(msStageRow('move:'+S.id)&&b3gDefined(msStageRow('move:'+S.id)))&&S.slot!=='cap'&&msClipOf('move:'+S.id));
      return ['move:lounge_pass_flex','move:zone_one_blockade','move:'+clip.id]; }""")
    notes.append('same-moment moves: '+', '.join(moves))
    for mv in moves:
        if not pg.evaluate("(a)=>__ready(a[0],a[1])",[mv,False]): fail('%s did not start for the same-moment test'%mv); continue
        info=pg.evaluate("()=>{ const tl=B3BENCH.timeline(); return {len:tl.len,hit:tl.hit,lanes:tl.lanes.map(l=>l.id+':'+l.segs.length)}; }")
        notes.append('%s: bar len %.2f s, hit %s, lanes %s'%(mv,info['len'],info['hit'],' '.join(info['lanes'])))
        hs={}
        for frac in (.15,.35,.6):
            t=round(info['len']*frac*60)/60
            a=pg.evaluate("async(t)=>{ B3BENCH.seek(t); return __h(); }",t)
            pg.screenshot(path=os.path.join(OUT,'moment-%s-%d.png'%(mv.split(':')[1],int(frac*100))))
            b=pg.evaluate("async(t)=>{ B3BENCH.seek(Math.max(0,t-.5)); await __h(); B3BENCH.seek(t); return __h(); }",t)          # built again from the start
            c=pg.evaluate("async(t)=>{ B3BENCH.seek(Math.max(0,t-.4)); await __h(); B3BENCH.seek(t); return __h(); }",t)          # going on from an earlier moment
            if not (a==b==c): fail('%s at %.2f s: the picture is not the same (%s, %s, %s)'%(mv,t,a,b,c))
            st=pg.evaluate("()=>B3BENCH.status()")
            if st['state']!='paused' or abs(st['t']-t)>.02: fail('%s: after a seek to %.3f the status is %s at %.3f'%(mv,t,st['state'],st['t']))
            hs[frac]=a
        if len(set(hs.values()))<3: fail('%s: three moments gave fewer than three different pictures (%s)'%(mv,hs))
        # one picture on, one back
        t1=pg.evaluate("()=>{ B3BENCH.seek(.5); return B3BENCH.status().t; }"); pg.evaluate("()=>B3BENCH.step(1)"); t2=pg.evaluate("()=>B3BENCH.status().t"); pg.evaluate("()=>B3BENCH.step(-1)"); t3=pg.evaluate("()=>B3BENCH.status().t")
        if not (.017<t2-t1<.067): fail('%s: one picture on moved the clock %.3f s'%(mv,t2-t1))
        if abs(t3-t1)>.06: fail('%s: one picture on and back did not come home (%.3f, %.3f)'%(mv,t1,t3))
    # a move with a stage row, its bar
    tl=pg.evaluate("()=>B3BENCH.timeline()")
    # the bar of a staged move: video, stage, effects and sound lanes, a hit inside the run
    if not pg.evaluate("(a)=>__ready(a,false)",'move:lounge_pass_flex'): fail('lounge_pass_flex did not start for the bar')
    tl=pg.evaluate("()=>B3BENCH.timeline()")
    lanes={l['id']:l['segs'] for l in tl['lanes']}
    if sorted(lanes)!=['fx','snd','stage','video']: fail('lounge_pass_flex bar lanes are %s'%sorted(lanes))
    if not any('NOT ON THE LIST' in g['label'] for g in lanes.get('stage',[])): fail('the stage lane of Lounge Pass Flex has no Words step: %s'%lanes.get('stage'))
    if not lanes.get('video'): fail('the video lane of Lounge Pass Flex is empty')
    if tl['hit'] is None or not (.3<tl['hit']<tl['len']): fail('the HIT line of Lounge Pass Flex is at %s of %s'%(tl['hit'],tl['len']))
    # the answer: one monster attack after the move
    base=tl['len']
    r=pg.evaluate("(a)=>__play(a,true)",'move:lounge_pass_flex')
    if r['st']['state']!='ended': fail('the move with an answer did not play to the end: %s'%r['st'])
    ans=[g for l in r['tl']['lanes'] for g in l['segs'] if g['label'].startswith('Answer: ')]
    if not ans: fail('the bar of a move with an answer has no Answer segment: %s'%json.dumps(r['tl']['lanes'])[:300])
    if r['tl']['len']<base+.8: fail('the answer added only %.2f s (%.2f to %.2f)'%(r['tl']['len']-base,base,r['tl']['len']))
    notes.append('answer: %.2f s with, %.2f s without; segments %s'%(r['tl']['len'],base,[g['label'] for g in ans][:3]))
    pg.screenshot(path=os.path.join(OUT,'answer-lounge.png'))
    pg.evaluate("()=>{ B3BENCH.BN.answer=false; B3BENCH.BN.tlKey=''; }")
    # a wind-up alone: plays to the end and the attack never lands
    r=pg.evaluate("(a)=>__play(a,false)",'wind:mudling:mud_pie')
    if r['st']['state']!='ended': fail('the wind-up alone did not play to the end: %s'%r['st'])
    elif r['tl']['hit'] is not None: fail('the wind-up alone showed a hit at %s'%r['tl']['hit'])
    elif not [g for l in r['tl']['lanes'] if l['id']=='wind' for g in l['segs']]: fail('the wind-up alone has nothing in its Wind-up lane')
    notes.append('wind-up alone: %.2f s, lanes %s'%(r['tl']['len'],' '.join('%s:%d'%(l['id'],len(l['segs'])) for l in r['tl']['lanes'])))
    pg.screenshot(path=os.path.join(OUT,'wind-mudling.png'))
    # every body state and wind-up the frame says it can play
    pf=pg.evaluate("""(L)=>{ const out={ok:0,bad:[],no:[]}; for(const id of L){ if(!B3BENCH.can(id)){ out.no.push(id); continue; } const w=B3BENCH.preflight(id); if(w) out.bad.push([id,w]); else out.ok++; } return out; }""",[k for k,v in ids.items() if v['kind'] in ('state','wind')])
    notes.append('body states and wind-ups: %d can be set up, %d the preview does not play (%s)'%(pf['ok'],len(pf['no']),', '.join(sorted({x.split(':')[2] for x in pf['no'] if x.startswith('body')}))))
    for x in pf['bad']: fail('cannot be set up: %s (%s)'%tuple(x))
    if pf['ok']<60: fail('only %d body states and wind-ups can be set up (expected 60 or more)'%pf['ok'])
    for need in ('body:tom:guard','body:tom:hit','body:tom:dodge','body:tom:ko','body:tom:victory','body:tom:run','body:tom:idle','body:mudling:hit','body:mudling:idle','wind:mudling:mud_pie'):
        if need in pf['no']: fail('the preview cannot play %s'%need)
    # each body state plays; the bar shows what the engine did
    for sid in ('body:tom:idle','body:tom:guard','body:tom:hit','body:tom:dodge','body:tom:ko','body:tom:victory','body:tom:run','body:grace:guard','body:mudling:hit','body:mudling:die'):
        if sid not in ids: continue
        r=pg.evaluate("(a)=>__play(a,false)",sid)
        if r['st']['state']!='ended': fail('%s did not play to the end: %s %s'%(sid,r['st']['state'],r['st']['msg'])); continue
        if r['tl']['len']<1.5: fail('%s ran only %.2f s'%(sid,r['tl']['len']))
        labs=[g['label'] for l in r['tl']['lanes'] for g in l['segs']]
        if sid.endswith(':guard') and not any(('Guard' in x or 'guard' in x or 'Braced' in x) for x in labs): fail('%s: the bar shows no guard (%s)'%(sid,labs))
        if sid.endswith(':run') and not labs: fail('%s: the bar is empty'%sid)
        notes.append('%s: %.2f s, bar %s'%(sid,r['tl']['len'],labs[:4]))
        pg.screenshot(path=os.path.join(OUT,'state-%s.png'%sid.replace(':','-')))
    # a move whose body video is not made yet plays its stage and effects over the standing video
    nv=pg.evaluate("""()=>{ const out=[]; for(const id of msStagedIds().map(i=>i.slice(5))) { const R=msStageRow('move:'+id),S=B3_SKILLS[id]; if(S&&S.vibe&&R.body&&!BCLIPS[R.body.clip]) out.push(id); } return out; }""")
    notes.append('stage rows with no body video: %s'%nv)
    if not nv: fail('no stage row without a body video was found to play (expected Tarmac Porsche Transfer or another)')
    for mid in nv[:3]:
        r=pg.evaluate("(a)=>__play(a,false)",'move:'+mid)
        if r['st']['state']!='ended': fail('%s (no video yet) did not play to the end: %s %s'%(mid,r['st']['state'],r['st']['msg'])); continue
        steps=[g for l in r['tl']['lanes'] if l['id']=='stage' for g in l['segs']]
        vid=[g for l in r['tl']['lanes'] if l['id']=='video' for g in l['segs']]
        if not r['tl']['noVideo']: fail('%s: the timeline does not say NO VIDEO YET'%mid)
        if not steps and (has_steps:=pg.evaluate("(a)=>((msStageRow('move:'+a).steps||[]).length+((msStageRow('move:'+a).setpiece&&msStageRow('move:'+a).setpiece.steps)||[]).length)>0",mid)): fail('%s: the stage lane is empty over the standing video'%mid)
        if not any(g['k']=='need' for g in vid): fail('%s: the video lane has no NO VIDEO segment: %s'%(mid,vid))
        notes.append('%s with no video: stage %s, video lane %s'%(mid,[g['label'] for g in steps][:3],[g['label'] for g in vid][:2]))
        pg.screenshot(path=os.path.join(OUT,'novideo-%s.png'%mid))
    if nv:
        mid=nv[0]
        pg.evaluate("(a)=>{ B3BENCH.BN.loop=false; B3BENCH.BN.turbo=1; B3BENCH.go('move:'+a); }",mid)
        pg.wait_for_function("()=>B3BENCH.status().state==='playing'&&B3BENCH.status().noVideo",timeout=60000)
        pg.wait_for_timeout(500)
        if pg.evaluate("()=>document.getElementById('bench-tag').hidden"): fail('the label NO VIDEO YET is not shown while a move with no video plays')
        txt=pg.evaluate("()=>document.getElementById('bench-tag').textContent")
        if txt!='NO VIDEO YET: SHOWN ON THE STANDING VIDEO': fail('the label reads %r'%txt)
        pg.screenshot(path=os.path.join(OUT,'novideo-label.png'))
        # the game never sets cfg.bench: without it the row is not played (the move keeps what it plays today)
        g=pg.evaluate("(a)=>{ const R=msStageRow('move:'+a),keep=B3.cfg.bench; B3.cfg.bench=false; const off=b3gDefined(R); B3.cfg.bench=true; const on=b3gDefined(R); B3.cfg.bench=keep; return {off,on}; }",mid)
        if g['off'] or not g['on']: fail('cfg.bench does not decide the no-video row (%s)'%g)
        pg.evaluate("()=>B3BENCH.stop()")
    faults=pg.evaluate('()=>window.__faults')
    if faults: fail('the game logged battle faults in phase 2: %s'%faults[:3])
    import glob
    setters=[f for f in glob.glob(os.path.join(ROOT,'engine','b3-*.js'))+glob.glob(os.path.join(ROOT,'data','b3-*.js'))+[os.path.join(ROOT,'index.html')] if re.search(r'bench\s*:\s*true|cfg\.bench\s*=',open(f,encoding='utf-8',errors='ignore').read()) and not f.endswith('b3-bench.js')]
    if setters: fail('cfg.bench is set outside engine/b3-bench.js: %s'%setters)
    pg.close()
    # ---------- 4. the Guide: box, controls, reuse, removal ----------
    for name,w,h in SIZES:
        pg=br.new_page(viewport={'width':w,'height':h}); watch(pg)
        pg.goto(BASE+'/battle-guide.html#anims/move:lounge_pass_flex')
        try: pg.wait_for_selector('#bnstart',state='visible',timeout=60000)
        except Exception: fail('%s: the Preview box did not appear on the sheet of Lounge Pass Flex'%name); pg.close(); continue
        pg.wait_for_timeout(300)
        slot=pg.evaluate("()=>{ const r=document.getElementById('benchslot').getBoundingClientRect(); return {l:r.left,t:r.top,w:r.width,h:r.height}; }")
        if abs(slot['w']/slot['h']-16/9)>.03: fail('%s: the box is %.0f x %.0f, not 16:9'%(name,slot['w'],slot['h']))
        if slot['l']<-1 or slot['t']<-1 or slot['l']+slot['w']>w+1 or slot['t']+slot['h']>h+1: fail('%s: the box is not fully on screen (%s) in %d x %d'%(name,slot,w,h))
        if slot['w']<300: fail('%s: the box is only %.0f px wide'%(name,slot['w']))
        t_tap=time.time()
        pg.click('#bnstart')
        pg.wait_for_function("()=>document.getElementById('benchframe')",timeout=10000)
        fr=[f for f in pg.frames if 'bench.html' in f.url][0]
        pg.wait_for_function("()=>{ const f=document.getElementById('benchframe'); return !!f&&f.getBoundingClientRect().width>10; }",timeout=10000)
        fr.wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done',timeout=90000)
        fr.evaluate("()=>{ window.__tag='same-frame'; B3BENCH.BN.turbo=1; }")
        pg.wait_for_function("()=>{ const c=document.getElementById('bnplay'); return c&&c.textContent==='Pause'; }",timeout=60000)
        tap_ms=int((time.time()-t_tap)*1000)
        bb=fr.evaluate('()=>window.__BENCH_BOOT')
        notes.append('%s: from the tap to the move playing %d ms; the frame booted in %d ms with %d scripts, %.1f MB'%(name,tap_ms,bb['ms'],bb['scripts'],bb['bytes']/1e6))
        if bb['bytes']>=25e6: fail('%s: the frame loaded %.1f MB of script'%(name,bb['bytes']/1e6))
        pg.wait_for_timeout(1200)
        L=pg.evaluate("""()=>{ const f=document.getElementById('benchframe').getBoundingClientRect(),s=document.getElementById('benchslot').getBoundingClientRect(),
            top=document.elementFromPoint(s.left+s.width/2,s.top+s.height/2),vis=e=>{ const r=e.getBoundingClientRect(),c=getComputedStyle(e); return c.display!=='none'&&r.width>0&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1; };
            const btn=['bnplay','bnloop','bnmute'].concat([...document.querySelectorAll('.bsp')].map((b,i)=>'sp'+i)),miss=[];
            const els={bnplay:document.getElementById('bnplay'),bnloop:document.getElementById('bnloop'),bnmute:document.getElementById('bnmute')}; [...document.querySelectorAll('.bsp')].forEach((b,i)=>els['sp'+i]=b);
            for(const k in els){ if(!els[k]||!vis(els[k])) miss.push(k); else if(els[k].getBoundingClientRect().height<30) miss.push(k+' too small'); }
            return {frame:[f.left,f.top,f.width,f.height],slot:[s.left,s.top,s.width,s.height],onTop:top&&top.id==='benchframe',miss,scroll:document.documentElement.scrollWidth>innerWidth+1}; }""")
        if not L['onTop']: fail('%s: something covers the preview frame'%name)
        if any(abs(a-b)>1.5 for a,b in zip(L['frame'],L['slot'])): fail('%s: the frame is not on the box: %s vs %s'%(name,L['frame'],L['slot']))
        if L['miss']: fail('%s: controls missing, cut off or too small: %s'%(name,L['miss']))
        if L['scroll']: fail('%s: the page scrolls sideways'%name)
        pg.screenshot(path=os.path.join(OUT,'guide-%s-%dx%d.png'%(name,w,h)))

        # movebench2: the bar, its lanes, the playhead you drag, one picture on, the answer button
        try: pg.wait_for_selector('#bnbar:not([hidden])',timeout=90000)
        except Exception: fail('%s: the bar did not appear'%name)
        else:
            pg.evaluate("()=>document.getElementById('bnbar').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
            B=pg.evaluate("""()=>{ const b=document.getElementById('bnbar'),r=b.getBoundingClientRect(),hw=document.getElementById('bnhw').getBoundingClientRect(),
                lanes=[...b.querySelectorAll('.ln')].map(l=>l.dataset.lane),sb={};
              for(const i of ['bnstepb','bnstepf','bnans']){ const e=document.getElementById(i),q=e&&e.getBoundingClientRect(); sb[i]=e?[Math.round(q.width),Math.round(q.height),q.left>=-1&&q.right<=innerWidth+1]:null; }
              return {l:r.left,r:r.right,t:r.top,b:r.bottom,lanes,hw:[hw.left,hw.top,hw.width,hw.height],sb,sw:document.documentElement.scrollWidth,iw:innerWidth,ih:innerHeight,hit:!document.getElementById('bnhit').hidden}; }""")
            if B['l']<-1 or B['r']>B['iw']+1 or B['sw']>B['iw']+1: fail('%s: the bar is cut off sideways (%s)'%(name,B))
            if B['b']>B['ih']+1 or B['t']<-1: fail('%s: the bar is not on screen after scrolling to it (%s)'%(name,B))
            for need in ('video','stage','fx','snd'):
                if need not in B['lanes']: fail('%s: the bar has no %s lane (%s)'%(name,need,B['lanes']))
            if not B['hit']: fail('%s: the bar has no HIT line'%name)
            if B['hw'][2]<120: fail('%s: the bar is only %d px wide'%(name,B['hw'][2]))
            for i,v in B['sb'].items():
                if v is None: fail('%s: the control %s is missing'%(name,i))
                elif v[1]<30 or v[0]<36 or not v[2]: fail('%s: the control %s is too small or cut off (%s)'%(name,i,v))
            # drag to the middle
            x0=B['hw'][0]; y0=B['hw'][1]+B['hw'][3]/2; wdt=B['hw'][2]
            pg.mouse.move(x0+wdt*.1,y0); pg.mouse.down(); pg.mouse.move(x0+wdt*.3,y0,steps=4); pg.mouse.move(x0+wdt*.5,y0,steps=4); pg.mouse.up()
            try: pg.wait_for_function("()=>{ const s=document.getElementById('bnplay'); return s&&s.textContent==='Play'; }",timeout=15000)
            except Exception: fail('%s: dragging the bar did not stop the preview (button says %s)'%(name,pg.evaluate("()=>document.getElementById('bnplay').textContent")))
            fs=fr.evaluate("()=>({s:B3BENCH.status(),len:B3BENCH.timeline().len})")
            if fs['s']['state']!='paused' or abs(fs['s']['t']-fs['len']*.5)>fs['len']*.04: fail('%s: dragging to the middle left the clock at %.2f of %.2f (%s)'%(name,fs['s']['t'],fs['len'],fs['s']['state']))
            head=pg.evaluate("()=>parseFloat(document.getElementById('bnhead').style.left)")
            if abs(head-50)>5: fail('%s: the playhead is at %s%% after dragging to the middle'%(name,head))
            pg.screenshot(path=os.path.join(OUT,'guide-drag-%s-%dx%d.png'%(name,w,h)))
            t_a=fs['s']['t']; pg.click('#bnstepf'); pg.wait_for_timeout(500); t_b=fr.evaluate("()=>B3BENCH.status().t")
            if not (.017<t_b-t_a<.067): fail('%s: One picture on moved the clock %.3f s'%(name,t_b-t_a))
            pg.click('#bnstepb'); pg.wait_for_timeout(500); t_c=fr.evaluate("()=>B3BENCH.status().t")
            if abs(t_c-t_a)>.06: fail('%s: One picture back did not come home (%.3f then %.3f)'%(name,t_a,t_c))
            notes.append('%s: bar lanes %s, drag to the middle left the clock at %.2f of %.2f s, one picture %.3f s'%(name,','.join(B['lanes']),fs['s']['t'],fs['len'],t_b-t_a))
            fr.evaluate("()=>{ B3BENCH.BN.turbo=4; }"); pg.click('#bnplay')   # play on from there
        if name=='duo-folded-up':
            # pause holds the clock; speed and loop and mute reach the frame; the next animation reuses the frame; leaving removes it
            pg.click('#bnplay'); pg.wait_for_function("()=>document.getElementById('bnplay').textContent==='Play'",timeout=5000)
            t1=fr.evaluate('()=>B3P.t'); pg.wait_for_timeout(700); t2=fr.evaluate('()=>B3P.t')
            if abs(t2-t1)>1e-6: fail('Pause did not hold the clock (%s to %s)'%(t1,t2))
            pg.click('.bsp[data-s="0.25"]'); pg.wait_for_timeout(200)
            if fr.evaluate('()=>B3BENCH.BN.speed')!=.25: fail('the quarter speed button did not reach the frame')
            pg.click('.bsp[data-s="0.5"]'); pg.wait_for_timeout(200)
            if fr.evaluate('()=>B3BENCH.BN.speed')!=.5: fail('the half speed button did not reach the frame')
            pg.click('#bnloop'); pg.wait_for_timeout(200)
            if fr.evaluate('()=>B3BENCH.BN.loop')!=False: fail('the Loop button did not reach the frame')
            pg.click('#bnmute'); pg.wait_for_timeout(200)
            if fr.evaluate('()=>sound.enabled')!=False: fail('the Mute button did not reach the frame')
            pg.click('#bnmute'); pg.click('.bsp[data-s="1"]'); fr.evaluate('()=>{ B3BENCH.BN.turbo=4; }')
            pg.click('#bnplay')
            pg.wait_for_function("()=>{ const t=document.getElementById('bnplay').textContent; return t==='Play again'||t==='Pause'; }",timeout=5000)
            pg.wait_for_function("()=>document.getElementById('bnplay').textContent==='Play again'",timeout=60000)
            pg.screenshot(path=os.path.join(OUT,'guide-ended-%dx%d.png'%(w,h)))
            # the next animation (a monster attack with a wind-up) uses the same frame
            pg.click('#bclose'); pg.evaluate("()=>{ location.hash='#anims/act:mudling:mud_pie'; }")
            pg.wait_for_selector('#bnstart',state='visible',timeout=20000)
            pg.click('#bnstart')
            pg.wait_for_function("()=>{ const c=document.getElementById('bnplay'); return c&&(c.textContent==='Pause'||c.textContent==='Play again'); }",timeout=60000)
            if fr.evaluate('()=>window.__tag')!='same-frame' or len([f for f in pg.frames if 'bench.html' in f.url])!=1: fail('the next animation did not reuse the preview frame')
            pg.wait_for_function("()=>document.getElementById('bnplay').textContent==='Play again'",timeout=60000)
            pg.evaluate("()=>{ location.hash='#rules'; }"); pg.wait_for_timeout(500)
            if pg.evaluate("()=>!!document.getElementById('benchframe')") or len([f for f in pg.frames if 'bench.html' in f.url])!=0: fail('the preview frame is still there after leaving the Animations tab')
            notes.append('Guide controls, reuse and removal checked at %d x %d'%(w,h))
        pg.close()
    # ---------- 5. nothing paid, nothing sent ----------
    if frame_out: fail('the preview frame asked a server outside this site: %s'%frame_out[:3])
    bad=[u for u in seen_urls if FORBID.search(u)]
    if bad: fail('requests to a paid or dispatch address: %s'%bad[:3])
    hosts=sorted({re.sub(r'^https?://([^/]+).*$',r'\1',u) for u in seen_urls if u.startswith('http')})
    notes.append('hosts asked: '+', '.join(hosts))
    br.close()
for n in notes: print(n)
print('FAILS:',fails)
sys.exit(1 if fails else 0)
