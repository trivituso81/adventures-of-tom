# Clip test: a battle clip (engine/clips.js) plays in a real fight and the damage lands on its impact frame.
# Starts the Battle Lab's CLIP TEST fight, fires Rose's Boop, and checks:
#   1. the clip's picture is NOT loaded before the fight (clips are loaded per battle) and is loaded in it
#   2. Rose's body is drawn from clip frames, in order, start to last frame (a slow test browser may skip some: the clip plays by time)
#   3. the monster loses HP while the impact frame (or the one after) is on screen, not earlier
#   4. the move ends, with no errors, and the lab flag is cleared on leaving
# Saves frames to tools/shots/clip-<layout>-<n>.png and a contact sheet tools/shots/clip-<layout>.png (portrait and landscape).
# Usage (repo root):  python3 tools/clip_test.py [--speed2]
import base64, sys, time, threading, http.server, socketserver, os, functools
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('BUILD',os.path.dirname(HERE)); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
speed=2 if '--speed2' in sys.argv else 1
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
START="""(speed)=>{ try{ B7.speed=speed; }catch(e){} const i=B2_LAB.findIndex(L=>L.clip); splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true; b2Lab(i); return i; }"""
READY="()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'&&paintedFightReady(); }"
FIRE="""()=>{ const L=window.__LE,B2=L.B2,u=B2.party.find(p=>p.id==='rose'),act=L.B2_SKILLS.rose.o3.find(a=>a.key==='boop');
  for(const f of B2.foes){ f.maxHp=f.hp=99999; }
  B2.actor=u; L.battle.actor=u.idx; const o=L.b2TargetOptions(act,u)[0];
  window.__log=[]; window.__hp0=B2.foes[0].hp; window.__t0=performance.now();
  window.__tick=setInterval(()=>{ const st=RFX.ST.cur,fr=st&&st.fx&&st.fx.path&&st.frame,p=fr&&fr._paint; window.__log.push([Math.round(performance.now()-window.__t0),p&&p.a==='clip_'+window.__clip?p.f:-1,B2.foes[0].hp]); },16);
  L.b2Do(act,o); return o.label; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server','--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for layout,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':430,'height':860})):
        pg=br.new_page(viewport=vp,device_scale_factor=2)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=30000); pg.wait_for_timeout(2500)
        CID=pg.evaluate("()=>window.__clip='rose_boop'")   # Boop plays her real Boop clip (Rm.boopClip)
        if pg.evaluate("(id)=>!!PAINTED['clip_'+id].img",CID): fails.append(layout+': the clip picture was loaded before any fight')
        if layout=='landscape': pg.evaluate("()=>window.__LE.toggleLayout()")   # landscape is the game's own toggle: the whole stage turns on the upright phone
        if pg.evaluate(START,speed)<0: fails.append('no CLIP TEST fight in B2_LAB'); break
        pg.wait_for_function(READY,timeout=40000)
        if not pg.evaluate("(id)=>bclipReady(id)",CID): fails.append(layout+': the clip picture is not loaded in the fight')
        C=pg.evaluate("(id)=>({n:BCLIPS[id].n,impact:BCLIPS[id].impact,dur:BCLIPS[id].dur,at:BCLIPS[id].ms[BCLIPS[id].impact]})",CID)
        pg.evaluate(FIRE); t0=time.time(); frames=[]
        times=[.5]+[.9+C['dur']/1000*k/9 for k in range(10)]+[.9+C['dur']/1000+.5]
        for k,ft in enumerate(times):
            dt=ft/speed-(time.time()-t0)
            if dt>0: pg.wait_for_timeout(int(dt*1000))
            fn=os.path.join(SHOTS,f'clip-{layout}-{k}.png'); pg.screenshot(path=fn); frames.append(fn)
        try: pg.wait_for_function("()=>window.__LE.battle.state==='command'||!window.__LE.B2.active",timeout=20000)
        except Exception: fails.append(layout+': the move did not finish')
        log=pg.evaluate("()=>{ clearInterval(window.__tick); return window.__log; }"); hp0=pg.evaluate("()=>window.__hp0")
        seen=[f for _,f,_ in log if f>=0]; order=[f for i,f in enumerate(seen) if i==0 or f!=seen[i-1]]
        hit=next((r for r in log if r[2]<hp0),None)
        print(layout,'clip',CID,'frames seen',len(order),'of',C['n'],'first',order[:1],'last',order[-1:],'| hit at',hit,'| impact frame',C['impact'])
        if not order or order[0]>2 or order[-1]<C['n']-3 or order!=sorted(order): fails.append(f'{layout}: clip frames out of order or cut short: {order}')
        if len(order)<C['n']*(.55 if speed==1 else .3): fails.append(f'{layout}: only {len(order)} of {C["n"]} clip frames were drawn')
        if not hit: fails.append(layout+': no damage landed')
        elif hit[1] not in (C['impact'],C['impact']+1): fails.append(f'{layout}: damage landed on clip frame {hit[1]}, impact frame is {C["impact"]}')
        errs=[e for e in errs if 'Failed to load resource' not in e]
        if errs: fails.append(f'{layout} errors: {errs[:5]}')
        if pg.evaluate("()=>(window.__faults||[]).length"): fails.append(layout+': game fault: '+str(pg.evaluate("()=>window.__faults.slice(0,3).map(String)")))
        th=[Image.open(f) for f in frames]; w,h=th[0].size; sc=360/max(w,h); tw,tH=int(w*sc),int(h*sc); cols=6; rows=-(-len(th)//cols)
        sheet=Image.new('RGB',(cols*tw,rows*tH),'black')
        for i,im in enumerate(th): sheet.paste(im.resize((tw,tH)),((i%cols)*tw,(i//cols)*tH))
        sheet.save(os.path.join(SHOTS,f'clip-{layout}.png'))
        pg.close()
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
