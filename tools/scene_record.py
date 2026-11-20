#!/usr/bin/env python3
"""Plays a cutscene in the real game on a FIXED clock and saves frames at 10 per second (fix-heist1play-5).

Why: a scene staged in tile coordinates on a flat painting looks fine in data/scenes.js and wrong on screen (a figure inside a stool, behind a
counter cutout, standing still while a voice clip plays). Real time in a headless browser is too slow and uneven to judge that, so this tool
replaces requestAnimationFrame, performance.now and the audio clock with a virtual clock that advances 1/60 s per game frame, and plays the
dialogue voice clips as events of their real length (decoded once, never played), so the timeline equals the phone's.

Usage (repo root):
  SCENE=ch1Theft MAP=grands CH=1 START=doorIn STOP="despawn:Big Mudling" TAIL=3 LAND=0 OUT=/tmp/rec python3 tools/scene_record.py
Env: SCENE, MAP, CH, LAND (1 = landscape 932x430), OUT (frames land in OUT/f-0000.png ...), START (sfx name: capture starts at its first call,
default the first frame), STOP (despawn:<name> or an end time in seconds; capture stops TAIL seconds later), FPS (default 10),
CROP=x0,y0,x1,y1 (screen pixels), LOG=1 writes OUT/log.json with every actor's tile, lift and pose per captured frame.
Needs playwright + a chromium (CHROMIUM=<path> if the default is not installed)."""
import threading, http.server, socketserver, functools, os, sys, json, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SCENE = os.environ.get('SCENE', 'ch1Theft'); MAP = os.environ.get('MAP', 'grands'); CH = int(os.environ.get('CH', '1'))
LAND = os.environ.get('LAND') == '1'; OUT = os.environ.get('OUT', '/tmp/scene-rec'); FPS = int(os.environ.get('FPS', '10'))
START = os.environ.get('START', ''); STOP = os.environ.get('STOP', 'despawn:Big Mudling'); TAIL = float(os.environ.get('TAIL', '3'))
CROP = [int(v) for v in os.environ['CROP'].split(',')] if os.environ.get('CROP') else None
MAXT = float(os.environ.get('MAXT', '90'))
VW, VH = (932, 430) if LAND else (430, 860)
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.startswith('f-') and f.endswith('.png'): os.remove(os.path.join(OUT, f))

INIT = """
(()=>{ let vt=0,q=[],id=1; const P=performance; try{ P.now=()=>vt; }catch(e){}
  window.requestAnimationFrame=cb=>{ q.push([id,cb]); return id++; };
  window.cancelAnimationFrame=i=>{ q=q.filter(x=>x[0]!==i); };
  window.__vt=()=>vt; window.__hooks=[];
  window.__tick=n=>{ for(let k=0;k<n;k++){ vt+=1000/60; const cur=q; q=[]; for(const [i,cb] of cur){ try{ cb(vt); }catch(e){ console.error('raf '+e); } } for(const h of window.__hooks) try{ h(vt); }catch(e){ console.error('hook '+e); } } return vt; };
  try{ Object.defineProperty(BaseAudioContext.prototype,'currentTime',{get(){ return vt/1000; }}); }catch(e){}
})();
"""

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

SETUP = """async ([map,ch,scene,land,start,stop,grid,probe,cam])=>{
  const L=window.__LE; splash.active=false; document.getElementById('splash').hidden=true;
  try{ L.setChapter(ch); }catch(e){ console.error('chapter '+e); }
  for(const id of ['grace','rose']){ try{ L.forceJoin(L.MEMBERS()[id],true); }catch(e){ console.error('join '+id+' '+e); } }
  if(land&&!document.documentElement.classList.contains('landscape')){ try{ L.toggleLayout(); }catch(e){ console.error('layout '+e); } }
  L.go(map); player.x=8; player.y=10; try{ placeFollowers(); }catch(e){}
  // Voice clips: decode each line's clip once for its length, then play it as a virtual-time event (no real audio).
  const DUR=new Map(); const key=b=>b.length+':'+b.slice(0,120)+b.slice(-60);
  const lines=[]; (function walk(o){ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object'){ if(o.talk&&o.lines) for(const t of [].concat(o.lines)) lines.push([o.talk,t]);
      for(const k of ['all','seq','then','else']) if(o[k]) walk(o[k]); } })(L.SCENES[scene]);
  for(let i=0;i<200&&!dvClip('Rose','AHHH! DEEDEE!');i++){ window.__tick(3); await new Promise(r=>setTimeout(r,200)); }   // the chapter's voice file loads in real time
  const ac=new (window.AudioContext||window.webkitAudioContext)(); let found=0,missing=[];
  for(const [n,t] of lines){ const b=dvClip(n,t); if(!b){ missing.push(n+': '+t.slice(0,40)); continue; } if(DUR.has(key(b))) continue;
    try{ const bin=atob(b),u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); const buf=await ac.decodeAudioData(u.buffer); DUR.set(key(b),buf.duration); found++; }catch(e){ missing.push('decode '+n); } }
  window.__clipInfo={found,missing};
  dvPlay=function(b64){ dvStop(); DV.playing=true; const d=DUR.get(key(b64))||2; DV.t0=window.__vt()/1000; DV.dur=d; window.__clipEnd=window.__vt()+d*1000; DV.src=null; };
  window.__hooks.push(vt=>{ if(DV.playing&&window.__clipEnd&&vt>=window.__clipEnd){ DV.playing=false; window.__clipEnd=0; } });
  // markers
  window.__marks={}; const mk=(n)=>{ if(window.__marks[n]==null) window.__marks[n]=window.__vt(); };
  for(const s of ['doorIn','bonk','doorOut','splat']){ const f=sfx[s]; sfx[s]=function(...a){ mk('sfx:'+s); return f.apply(this,a); }; }
  const sd=storyDespawn; storyDespawn=function(n){ mk('despawn:'+n); return sd(n); };
  if(grid){ const o7=b7DrawMapFx; b7DrawMapFx=function(t){ o7(t); const m=currentMap; if(!m) return; ctx.save(); ctx.lineWidth=.6; ctx.font='6px sans-serif';
      for(let y=0;y<=m.h;y++) for(let x=0;x<=m.w;x++){ const blocked=x<m.w&&y<m.h&&!walkable(m,x,y); if(blocked){ ctx.fillStyle='rgba(200,0,0,.18)'; ctx.fillRect(x*T,y*T,T,T); }
        ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.strokeRect(x*T,y*T,T,T); ctx.fillStyle='#fff'; ctx.fillText(x+','+y,x*T+1,y*T+7); }
      const Z=(typeof PLATE_BEHIND!=='undefined'&&PLATE_BEHIND[m.id])||[]; ctx.strokeStyle='#ff00ff'; ctx.lineWidth=1; const s=T/64;
      for(const z of Z){ if(z.pts) continue; ctx.strokeRect(z.x*s,z.y*s,z.w*s,z.h*s); ctx.beginPath(); ctx.moveTo(z.x*s,z.base*s); ctx.lineTo((z.x+z.w)*s,z.base*s); ctx.stroke(); }
      ctx.restore(); }; }
  let list=L.SCENES[scene]; if(grid){ list=[{wait:60}]; sceneCam=[6.5,9.4]; }
  if(probe){ list=[{noHuddle:true},{call:()=>{ storyPosesLoad('deedee'); storyPosesLoad('boppy'); }},{place:'Deedee',at:[7,9],dir:'right'},{place:'Boppy',at:[13,10],dir:'up'},
      {place:'tom',at:[9,9],dir:'left'},{place:'grace',at:[10,10],dir:'left'},{place:'rose',at:[8,10],dir:'left'},{call:()=>{ const r=sceneActor('rose'); if(r){ r.seat=false; r.lift=0; r.depthBias=0; r.noShadow=false; } setFlag('ride',false); }},
      ...probe,{wait:600}]; if(cam) sceneCam=cam; } L.playScene(list); return {lines:lines.length};
}"""

LOGJS = """()=>{ const out={}; const acts=[player,...followers,...currentMap.npcs]; for(const a of acts){ if(!a||!(a.name||a.isPlayer||a.id)) continue; const p=position(a);
  const n=a.isPlayer?'tom':(a.name||a.id||a.monster); if(n==='tom'&&!a.isPlayer) continue;
  out[n]={x:+p.x.toFixed(2),y:+p.y.toFixed(2),lift:+(a.lift||0).toFixed(1),pose:a.scenePose?(Array.isArray(a.scenePose.f)?a.scenePose.f.join('/'):a.scenePose.f)+(a.scenePose.dir?':'+a.scenePose.dir:''):null,hid:!!a.hidden,seat:!!a.seat}; }
  out.__dialog=dialog.active?dialog.name:null; return out; }"""

def main():
    with sync_playwright() as pw:
        kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
        if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
        elif os.path.exists('/usr/bin/google-chrome'): kw['executable_path'] = '/usr/bin/google-chrome'
        br = pw.chromium.launch(**kw); ctx = br.new_context(viewport={'width': VW, 'height': VH}); ctx.add_init_script(INIT); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto(f'http://127.0.0.1:{port}/index.html')
        pg.wait_for_function('()=>window.__LE&&window.__LE.playScene', timeout=60000)
        for _ in range(400):   # boot gate: tick the game until the loading card is gone (images load in real time)
            pg.evaluate('()=>window.__tick(6)'); time.sleep(.03)
            if pg.evaluate("()=>document.documentElement.classList.contains('js-running')"): break
        for _ in range(30): pg.evaluate('()=>window.__tick(6)'); time.sleep(.03)
        info = pg.evaluate(SETUP, [MAP, CH, SCENE, LAND, START, STOP, os.environ.get('GRID') == '1', json.loads(os.environ['PROBE']) if os.environ.get('PROBE') else None, json.loads(os.environ['CAM']) if os.environ.get('CAM') else None])
        print('scene lines', info, pg.evaluate('()=>window.__clipInfo'))
        # warm up (sheets load in real time; the scene's preload step waits for them) until the START marker, or just start.
        t_cap0 = None; frames = []; log = []; stop_at = None; n = 0
        step = 60 // FPS
        t_wall = time.time()
        while True:
            pg.evaluate(f'()=>window.__tick({step})'); time.sleep(.012)
            vt = pg.evaluate('()=>window.__vt()')/1000
            marks = pg.evaluate('()=>window.__marks')
            if t_cap0 is None:
                if (not START) or ('sfx:' + START) in marks: t_cap0 = vt
                else:
                    if time.time() - t_wall > 120: print('START marker never came'); break
                    continue
            if (os.environ.get('GRID') == '1' or os.environ.get('PROBE')) and stop_at is None: stop_at = t_cap0 + float(os.environ.get('PROBE_T', '1.0'))
            if stop_at is None:
                if STOP.startswith('despawn:'):
                    if STOP in marks: stop_at = marks[STOP]/1000 + TAIL
                else:
                    stop_at = t_cap0 + float(STOP) + TAIL
            fn = os.path.join(OUT, f'f-{n:04d}.png')
            if CROP: pg.screenshot(path=fn, clip={'x': CROP[0], 'y': CROP[1], 'width': CROP[2]-CROP[0], 'height': CROP[3]-CROP[1]})
            else: pg.screenshot(path=fn)
            frames.append(round(vt - t_cap0, 2))
            if os.environ.get('LOG'): log.append({'t': round(vt - t_cap0, 2), **pg.evaluate(LOGJS)})
            n += 1
            if stop_at is not None and vt >= stop_at: break
            if vt - t_cap0 > MAXT: print('MAXT reached'); break
        if os.environ.get('LOG'): json.dump({'marks': {k: round(v/1000 - t_cap0, 2) for k, v in marks.items()}, 'frames': log}, open(os.path.join(OUT, 'log.json'), 'w'))
        print('frames', n, 'seconds', frames[-1] if frames else 0, 'marks', {k: round(v/1000 - t_cap0, 2) for k, v in pg.evaluate('()=>window.__marks').items()})
        print('errors:', errs[:6])
        br.close()
main()
