#!/usr/bin/env python3
"""In-game frame grab of the switch between the painted stance and a clip (clipgate2).

Tom's note on tom-give was that his size pulses. The measured gate found the video steady (within 1% of the start picture), so the pulse
is either in the baked pictures or in the switch from the painted battle stance to the clip's first picture and back. This plays the
clip in CHAPTER 1 REVIEW (the real fight, the real draw code) and records, for every draw of the owner's stance sheet and of the clip's
sheet, the figure's drawn height and feet line on screen (the alpha box of the source rectangle times the draw scale).

  python3 -I tools/clip-gate/grab.py <clip id, e.g. clip-tom-give> [--out DIR] [--layout portrait|landscape]
Prints the drawn figure height (CSS px) of the stance before, the clip's first, smallest, largest and last pictures, and the stance after,
with ratios to the stance before, and flags `switch` when any ratio is more than SWITCH away from 1 (limit below).
Saves DIR/<id>-before.png, -mid.png, -after.png. Needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH; about 40 s. Exit 1 on a flag.
Library: grab(clip_id, out, layout) -> dict"""
import functools, http.server, json, os, socketserver, statistics, sys, threading

SWITCH = .06     # the drawn figure may differ 6% in height between the stance and any picture of the clip before it reads as a pulse
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))

START = """async(id)=>{ const d=await (await fetch('data/art-prompts.json',{cache:'no-store'})).json();
  CRV.testEntries=[id].map(id=>Object.assign({},d.entries.find(e=>e.id===id),{group:'Chapter 1'}));
  const i=B2_LAB.findIndex(L=>L.name==='CHAPTER 1 REVIEW'); splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true; b2Lab(i); return i; }"""
READY = "()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'&&paintedFightReady()&&document.querySelectorAll('#crv .crv-row').length>0; }"
HOOK = """([stanceKey,clipKey])=>{
  window.__rec=[]; const owner=new WeakMap(), cache=new WeakMap(); const dpr=(window.devicePixelRatio||1);
  const po=window.paintedCanvas;      // the painted frame of a row set is a cached canvas (engine/painted.js): remember which sheet each canvas came from
  window.paintedCanvas=function(rows){ const c=po.apply(this,arguments); const p=rows&&rows._paint; if(c&&p) owner.set(c,p.a); return c; };
  const cv=document.createElement('canvas'), cx=cv.getContext('2d',{willReadFrequently:true});
  const box=(c)=>{ if(cache.has(c)) return cache.get(c); const w=c.width,h=c.height; cv.width=w; cv.height=h; cx.clearRect(0,0,w,h); cx.drawImage(c,0,0);
    const d=cx.getImageData(0,0,w,h).data; let t=-1,b=-1,l=w,r=-1;
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(d[(y*w+x)*4+3]>40){ if(t<0) t=y; b=y; if(x<l) l=x; if(x>r) r=x; }
    const o=t<0?null:[t,b,l,r,h]; cache.set(c,o); return o; };
  const orig=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(img,...a){
    const a0=owner.get(img);
    if(a0&&(a0===stanceKey||a0===clipKey)&&a.length>=4){ const bb=box(img), m=this.getTransform(), dx=a[0], dy=a[1], dh=a[3];
      if(bb){ const k=Math.abs(m.d)*dh/bb[4]/dpr;     // drawn CSS px per canvas px
        window.__rec.push({t:performance.now(),w:a0===stanceKey?'stance':'clip',vh:(bb[1]-bb[0]+1)*k,vw:(bb[3]-bb[2]+1)*k,feet:(m.f+(dy+bb[1]*dh/bb[4])*m.d)/dpr}); } }
    return orig.call(this,img,...a); }; }"""


def grab(clip_id, out=None, layout='portrait'):
    from playwright.sync_api import sync_playwright
    owner = clip_id.split('-')[1]
    cid = clip_id[len('clip-'):].replace('-', '_')
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    res = {}
    with sync_playwright() as pw:
        kw = {'args': ['--headless=new', '--no-proxy-server']}
        if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
        br = pw.chromium.launch(**kw)
        pg = br.new_page(viewport={'width': 430, 'height': 860}, device_scale_factor=2)
        pg.goto(f'http://127.0.0.1:{port}/index.html', wait_until='commit', timeout=120000); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start', timeout=60000); pg.wait_for_timeout(2500)
        if layout == 'landscape': pg.evaluate('()=>window.__LE.toggleLayout()')
        if pg.evaluate(START, clip_id) < 0: raise SystemExit('no CHAPTER 1 REVIEW fight in B2_LAB')
        pg.wait_for_function(READY, timeout=90000)
        stance = pg.evaluate("(o)=>Object.keys(PAINTED).filter(k=>PAINTED[k].img&&PAINTED[k].ready&&k===o+'Battle')[0]||null", owner)
        if not stance: raise SystemExit('no painted battle stance sheet for ' + owner)
        pg.evaluate("()=>{ for(const f of B2.foes) f.maxHp=f.hp=99999; }")
        pg.wait_for_function(f"()=>PAINTED.clip_{cid}&&PAINTED.clip_{cid}.ready", timeout=30000) if False else None
        pg.evaluate(HOOK, [stance, 'clip_' + cid])
        pg.wait_for_timeout(1500)
        t_play = pg.evaluate('()=>performance.now()')
        if out:
            os.makedirs(out, exist_ok=True); pg.screenshot(path=os.path.join(out, clip_id + '-before.png'))
        pg.click(f'#crv .crv-row[data-id="{clip_id}"] [data-crv=play]')
        pg.wait_for_timeout(1400)
        if out: pg.screenshot(path=os.path.join(out, clip_id + '-mid.png'))
        pg.wait_for_function('()=>!CRV.cur', timeout=30000)
        pg.wait_for_timeout(1500)
        if out: pg.screenshot(path=os.path.join(out, clip_id + '-after.png'))
        rec = pg.evaluate('()=>window.__rec')
        br.close()
    srv.shutdown()
    before = [r for r in rec if r['w'] == 'stance' and r['t'] < t_play]
    clip = [r for r in rec if r['w'] == 'clip']
    if not before or not clip:
        raise SystemExit(f'grab found no draws (stance before {len(before)}, clip {len(clip)})')
    t_end = clip[-1]['t']
    after = [r for r in rec if r['w'] == 'stance' and r['t'] > t_end + 150]
    sb = statistics.median(r['vh'] for r in before)
    row = {'stance_before': sb, 'clip_first': clip[0]['vh'], 'clip_min': min(r['vh'] for r in clip), 'clip_max': max(r['vh'] for r in clip),
           'clip_last': clip[-1]['vh'], 'stance_after': statistics.median(r['vh'] for r in after) if after else None,
           'feet_before': statistics.median(r['feet'] for r in before), 'feet_clip_first': clip[0]['feet'], 'feet_clip_last': clip[-1]['feet'],
           'draws': {'stance_before': len(before), 'clip': len(clip), 'stance_after': len(after)}}
    row['ratios'] = {k: (None if row[k] is None else round(row[k] / sb, 3)) for k in ('clip_first', 'clip_min', 'clip_max', 'clip_last', 'stance_after')}
    bad = {k: v for k, v in row['ratios'].items() if v is not None and abs(v - 1) > SWITCH}
    row['flag'] = {'switch': bad} if bad else {}
    return row


if __name__ == '__main__':
    a = sys.argv[1:]
    out = a[a.index('--out') + 1] if '--out' in a else None
    lay = a[a.index('--layout') + 1] if '--layout' in a else 'portrait'
    r = grab(a[0], out, lay)
    print(json.dumps(r, indent=1))
    sys.exit(1 if r['flag'] else 0)
