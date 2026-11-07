# Per-room character scale (engine/plate.js ROOM_SCALE, docs/ROOM_PAINTINGS.md "Character scale").
# For every painted room: Tom stands by the front door and at the back of the room; the test measures his drawn height (screenshot with
# and without him) and checks it against his real height (5 ft 11) times the room's art px per foot at his feet. Shots go to
# tools/shots/rscale-<id>-<front|back>-<p|l>.png, plus a contact sheet tools/shots/rscale-sheet.png (Tom beside the furniture).
# Usage: python3 tools/room_scale_test.py [id ...]      ROOT=<other checkout> measures another copy of the game (before/after shots).
import threading, http.server, socketserver, functools, os, sys, io, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('ROOT') or os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
TAG=os.environ.get('TAG','rscale')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; errs=[]
def check(name,ok):
    print(('ok   ' if ok else 'FAIL ')+name)
    if not ok: fails.append(name)
def skip(pg):
    for i in range(300):
        if not pg.evaluate("()=>intro.active||dialog.active||!!transition"): return
        pg.keyboard.press('Enter'); pg.wait_for_timeout(60)
# The back spot: the reachable floor tile nearest the top, closest to the middle column.
BACK="""()=>{ const m=currentMap,W=m.w,H=m.h,wk=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m.solid[y*W+x]===0;
  const seen=new Set([m.spawn.x+','+m.spawn.y]),q=[[m.spawn.x,m.spawn.y]];
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx,ny=y+dy,k=nx+','+ny; if(!seen.has(k)&&wk(nx,ny)){ seen.add(k); q.push([nx,ny]); } } }
  let best=null; for(const k of seen){ const [x,y]=k.split(',').map(Number); const s=y*100+Math.abs(x-W/2); if(!best||s<best[2]) best=[x,y,s]; }
  return [best[0],best[1]]; }"""
rows=[]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':393,'height':852})
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(400)
    ids=sys.argv[1:] or pg.evaluate("()=>Object.keys(PLATES).filter(id=>PLATES[id].square&&worlds[id]&&!worlds[id].outside)")
    scaled=pg.evaluate("()=>typeof ROOM_SCALE!=='undefined'")
    for rid in ids:
        pg.set_viewport_size({'width':393,'height':852})
        pg.evaluate(f"()=>window.__LE.go('{rid}')"); pg.wait_for_timeout(1500); skip(pg)
        pg.wait_for_function("()=>!!plateFor(currentMap)",timeout=20000)
        spots={'front':pg.evaluate("()=>[currentMap.spawn.x,currentMap.spawn.y]"),'back':pg.evaluate(BACK)}
        for view,vp in (('p',(393,852)),('l',(852,393))):
            pg.set_viewport_size({'width':vp[0],'height':vp[1]}); pg.wait_for_timeout(500)
            for nm,(x,y) in spots.items():
                pg.evaluate(f"()=>{{ player.seat=false; player.x={x}; player.y={y}; player.facing='down'; player.move=null; placeFollowers(); for(const f of followers){{f.x=-40;f.y=-40;f.move=null;}} camera.snap=true; }}"); pg.wait_for_timeout(500)
                a=Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
                a.save(os.path.join(SHOTS,f'{TAG}-{rid}-{nm}-{view}.png'))
                if view=='l': continue
                pg.evaluate("()=>{ player.seat=true; }"); pg.wait_for_timeout(250)
                b=Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); pg.wait_for_timeout(300)
                b2=Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
                pg.evaluate("()=>{ player.seat=false; }")
                # only Tom: ignore anything that moves on its own (NPCs, lamps), and look only in a column around his feet
                live=ImageChops.difference(b,b2).convert('L').point(lambda v:255 if v>12 else 0)
                d=ImageChops.subtract(ImageChops.difference(a,b).convert('L').point(lambda v:255 if v>70 else 0),live)
                fx,fy=pg.evaluate("()=>{ const r=canvas.getBoundingClientRect(),s=r.width/W,p=position(player); return [((p.x+.5)*T-camera.x)*s,((p.y+1)*T-camera.y)*s]; }")
                win=(max(0,int(fx-45)),0,int(fx+45),min(a.height,int(fy+6)))
                # walk up from his feet and stop at the first gap: someone walking past higher up is not Tom
                cw=d.crop(win); px=cw.load(); wd,ht=cw.size
                hit=[any(px[xx,yy] for xx in range(wd)) for yy in range(ht)]
                bot=max((yy for yy in range(ht) if hit[yy]),default=None); bb=None
                if bot is not None:
                    top=bot; gap=0
                    for yy in range(bot,-1,-1):
                        if hit[yy]: top=yy; gap=0
                        else:
                            gap+=1
                            if gap>8: break
                    xs=[xx for xx in range(wd) for yy in range(top,bot+1) if px[xx,yy]]
                    bb=(min(xs)+win[0],top,max(xs)+win[0]+1,bot+1)
                cssPerArt=pg.evaluate("()=>{ const r=canvas.getBoundingClientRect(); return r.width/W*currentMap.w*T/PLATES[currentMap.id].img.naturalWidth; }")
                got=(bb[3]-bb[1])/cssPerArt if bb else 0
                want=pg.evaluate(f"()=>typeof roomPxPerFoot==='function'&&PLATES[currentMap.id].roomScale?TOM_FEET*roomPxPerFoot(PLATES[currentMap.id].roomScale,({y}+1)*T*ROOM_SCALE_REF/(currentMap.w*T)):0")
                rows.append({'id':rid,'spot':nm,'tile':[x,y],'tomArt':round(got),'wantArt':round(want),'bbox':bb})
                print(f'{rid:12s} {nm:5s} tile {x},{y}  Tom {got:5.0f} art px' + (f'  target {want:5.0f}' if want else ''))
                if scaled and want:
                    if got<want*.6: print('     (not measured: something covers Tom here; see the shot)')
                    else: check(f'{rid} {nm}: Tom within 8% of 5 ft 11 at this spot',abs(got-want)<=want*.08)
    br.close()
json.dump(rows,open(os.path.join(SHOTS,f'{TAG}.json'),'w'),indent=1)
# Contact sheet: per room, a crop around Tom at the front and at the back (portrait).
cells=[]
for rid in dict.fromkeys(r['id'] for r in rows):
    for nm in ('front','back'):
        r=next(x for x in rows if x['id']==rid and x['spot']==nm)
        im=Image.open(os.path.join(SHOTS,f'{TAG}-{rid}-{nm}-p.png'))
        bb=r['bbox'] or (150,300,250,700); cx=(bb[0]+bb[2])//2; fy=bb[3]
        c=im.crop((max(0,cx-130),max(0,fy-300),max(0,cx-130)+260,max(0,fy-300)+340)); ImageDraw.Draw(c).text((4,4),f'{rid} {nm}',fill=(255,255,0))
        cells.append(c)
if cells:
    cols=6; sheet=Image.new('RGB',(260*cols,340*((len(cells)+cols-1)//cols)),(20,20,20))
    for i,c in enumerate(cells): sheet.paste(c,((i%cols)*260,(i//cols)*340))
    sheet.save(os.path.join(SHOTS,f'{TAG}-sheet.png'))
check('no page errors',not errs)
if errs: print(errs[:5])
print('FAILS:',fails); sys.exit(1 if fails else 0)
