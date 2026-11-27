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
fails=[]; notes=[]; seen_urls=set()
def fail(m): fails.append(m); print('FAIL',m,flush=True)
frame_out=[]
def watch(pg):
    def req(r):
        seen_urls.add(r.url)
        try:
            if 'bench.html' in r.frame.url and not r.url.startswith(BASE) and not r.url.startswith('data:') and not r.url.startswith('blob:'): frame_out.append(r.url)
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
    if any('/data/voice' in u for u in seen_urls): fail('bench.html asked for a voice file')
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
      const staged=sk.find(S=>B3_STAGE[S.id]&&b3gDefined(B3_STAGE[S.id])&&S.slot!=='cap'),clip=sk.find(S=>!(B3_STAGE[S.id]&&b3gDefined(B3_STAGE[S.id]))&&S.anim&&S.anim.kind==='clip'),def=sk.find(S=>S.slot!=='cap'&&!(B3_STAGE[S.id]&&b3gDefined(B3_STAGE[S.id]))&&!(S.anim&&S.anim.kind==='clip'));
      let wind=null; for(const f of Object.values(B3_FOES)) for(const a of f.acts) if(!wind&&a.wind&&a.hits!=='attacker') wind=f.id+':'+a.id;
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
