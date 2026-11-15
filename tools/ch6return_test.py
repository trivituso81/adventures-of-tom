# Chapter 6 stage 4 test (ch6build): plays the three return scenes (SCENES.ch6Lemon, ch6Hat, ch6Call) from the state at the end of the crock scene,
# in portrait and landscape, advancing every dialogue page and saving a frame about every 1.2 s plus a contact sheet. Checks: no page errors, the
# scene ends, the done flags are set, no monsters left on the freed maps, the call ends back on Tom's map with the party showing, the six coins are gone.
# Usage (repo root): python3 tools/ch6return_test.py /tmp/ret [lemon|hat|call ...]   (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH like the other tools)
import threading, http.server, socketserver, functools, os, json, sys
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
only=sys.argv[2:] or ['lemon','hat','call']
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE=['ch6-sal','ch6-goal','ch6-tnb','ch6-nara','ch6-park','ch6-play','ch6-garden','ch6-picnic','ch6-door','ch6-oak','ch6-board','ch6-ladder','ch6-boss','ch6-clear','ch6-wrap','ch6-oak-block','ch6-disc','bb-oakpark','bb-oakpark-run','ch6-street','ch6-crock','ch6-take','ch6-ret']
CASES={'lemon':dict(scene='ch6Lemon',map='griffith',start=[5,11,'up'],flags=[],freed=['griffith'],done=['bb-griffith']),
       'hat':dict(scene='ch6Hat',map='stage7',start=[9,13,'up'],flags=['ch6-lemon','bb-griffith'],freed=['stage7'],done=['bb-stage7']),
       'call':dict(scene='ch6Call',map='jpark',start=[6,19,'up'],flags=['ch6-lemon','bb-griffith','ch6-hat','bb-stage7'],freed=['hollow','sundial','schoolyard'],done=['bb-hollow','bb-sundial','bb-schoolyard','ch6-done'])}
SETUP=r"""(C)=>{ splash.active=false; document.getElementById('splash').hidden=true; endIntro(); window.__err=[];
  resetStory('full',6); const st=chselStateBefore(6); Object.assign(STORY.flags,st.flags);
  for(const f of C.flags) STORY.flags[f]=true; STORY.flags['battle:chairman']='win';
  for(const id of ['lemoncoin','hatcoin','dragonflycoin','fishcoin','kickcoin']) if(!bag.includes(id)) bag.push(id);
  setChapter(6,{apply:false}); STORY.override=null; b6Prep(10);
  for(const m of extras()) recruitLeave(m,true);
  if(!girlsAway()) setGirlsAway(true);
  forceJoin(tnb,true); forceJoin(nara,true);
  window.storyTriggers=()=>false;
  currentMap=worlds[C.map]; const s=C.start; player.x=s[0]; player.y=s[1]; player.facing=s[2]; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
  if(C.layout==='landscape'){ layout.mode='landscape'; applyLayout(); } else { layout.mode='portrait'; applyLayout(); }
  return {party:party.map(p=>p.id),map:currentMap.id};
}"""
res={}; fails=[]
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    for name in only:
        C=dict(CASES[name]); C['flags']=BASE+C['flags']
        for lay,vp in (('portrait',{'width':430,'height':860}),('landscape',{'width':860,'height':430})):
            pg=br.new_page(viewport=vp); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
            pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.bbPlay&&window.__LE.callTo',timeout=180000); pg.wait_for_timeout(800)
            C['layout']=lay; info=pg.evaluate(SETUP,C); pg.wait_for_timeout(600)
            pg.evaluate("(n)=>{ playScene(SCENES[n]); }",C['scene'])
            shots=[]; t=0; tick=.3; lastshot=-9; dw=0; guard=0
            while t<260:
                pg.wait_for_timeout(int(tick*1000)); t+=tick
                st=pg.evaluate("()=>({a:intro.active,d:dialog.active,typed:dialog.active&&dialog.shown>=dialog.chars.length,who:dialog.name,map:currentMap.id,bb:BB.run?Math.round(BB.t*10)/10:null})")
                if st['d'] and st['typed']:
                    dw+=1
                    if dw>=3: dw=0; pg.evaluate("()=>{ advanceDialog(); }")
                else: dw=0
                if t-lastshot>=1.2 and len(shots)<110:
                    fn=os.path.join(OUT,f'{name}-{lay}-{len(shots):03d}.png'); pg.screenshot(path=fn); shots.append((fn,st)); lastshot=t
                if not st['a'] and not st['d'] and not st['bb']:
                    guard+=1
                    if guard>=4: break
                else: guard=0
            pg.wait_for_timeout(1500); fn=os.path.join(OUT,f'{name}-{lay}-end.png'); pg.screenshot(path=fn); shots.append((fn,{}))
            end=pg.evaluate("""(C)=>({map:currentMap.id,done:C.done.map(f=>[f,!!flag(f)]),mons:C.freed.map(m=>[m,worlds[m].npcs.filter(n=>n.monster).length]),bag:['lemoncoin','hatcoin','dragonflycoin','fishcoin','kickcoin'].filter(i=>bag.includes(i)),
                hidden:[player.hidden,...followers.map(f=>f.hidden)],cast:worlds.hollow.npcs.filter(n=>n.callActor).length+worlds.sundial.npcs.filter(n=>n.callActor).length+worlds.schoolyard.npcs.filter(n=>n.callActor).length,frame:!!document.getElementById('callframe'),active:intro.active})""",C)
            r={'end':end,'errs':errs[:6],'frames':len(shots),'secs':round(t)}; res[name+'-'+lay]=r
            bad=errs or not all(d[1] for d in end['done']) or any(m[1] for m in end['mons']) or end['active'] or t>=259
            if name=='lemon' or name=='hat': bad=bad or end['bag'] and name=='lemon' and 'lemoncoin' in end['bag']
            if name=='call': bad=bad or end['cast'] or end['frame'] or [i for i in end['bag'] if i not in ('lemoncoin','hatcoin')] or end['map']!='jpark' or any(end['hidden'][:1])
            if bad: fails.append(name+'-'+lay)
            ims=[Image.open(f) for f,_ in shots]; cols=10; w,h=ims[0].size; sc=170/w; tw,th=int(w*sc),int(h*sc); rows=(len(ims)+cols-1)//cols
            sheet=Image.new('RGB',(cols*tw,rows*th),(20,20,20))
            for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th))
            sheet.save(os.path.join(OUT,f'{name}-{lay}-sheet.png')); pg.close()
    br.close()
json.dump(res,open(os.path.join(OUT,'result.json'),'w'),indent=1); print(json.dumps(res,indent=1)); print('FAILS:',fails)
