#!/usr/bin/env python3
"""Headless test for Send my takes to Claude (voicelearn1). Run (repo root): python3 tools/voice-library/send_takes_test.py   (FAILS: [] at the end)
Stand-in GitHub on the page's ?gh= address. Checks: the `takes` branch is created when missing; a line with one take is not sent; lines with
two or more takes go with audio, script, kept flag; parts stay under 20 MB (big fake audio forces a split); state.json holds the trail; a second
press sends nothing; a later take sends only the new ones; a failing GitHub keeps everything waiting and a retry sends it; the button works
and the auto send fires. Screenshot: tools/shots/vl-send.png."""
import os, json, base64, threading, http.server, socketserver, functools, re
from playwright.sync_api import sync_playwright
ROOT=os.environ.get('ROOT',os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
GH={'branch':False,'down':False,'puts':[],'refs':[],'posts':[]}
class G(http.server.BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def _h(self,code,body=b'{}'):
        self.send_response(code)
        for k,v in (('Access-Control-Allow-Origin','*'),('Access-Control-Allow-Headers','*'),('Access-Control-Allow-Methods','GET,PUT,POST,OPTIONS'),('Content-Type','application/json')): self.send_header(k,v)
        self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self): self._h(204,b'')
    def do_GET(self):
        if '/git/ref/heads/takes' in self.path: self._h(200 if GH['branch'] else 404, b'{"object":{"sha":"abc"}}' if GH['branch'] else b'{}')
        else: self._h(404)
    def do_POST(self):
        b=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))) or b'{}')
        GH['posts'].append((self.path,b))
        if self.path.endswith('/git/refs'): GH['branch']=True; GH['refs'].append(b)
        self._h(201,b'{"sha":"deadbeef"}')
    def do_PUT(self):
        n=int(self.headers.get('Content-Length','0')); raw=self.rfile.read(n); b=json.loads(raw or b'{}')
        if GH['down']: self._h(503); return
        GH['puts'].append({'path':self.path,'branch':b.get('branch'),'bytes':n,'content':b.get('content','')}); self._h(201,b'{"content":{}}')
gsrv=socketserver.ThreadingTCPServer(('127.0.0.1',0),G); gport=gsrv.server_address[1]
threading.Thread(target=gsrv.serve_forever,daemon=True).start()
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c: fails.append(m)
def parts(): return [p for p in GH['puts'] if re.search(r'/part-\d+\.json$',p['path'])]
def decode(p): return json.loads(base64.b64decode(p['content']))
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None,args=['--headless=new'])
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
    ctx.add_init_script("localStorage.setItem('aot-gh-token','test-token')")
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/data/merged-takes.json*',lambda r:r.fulfill(status=200,body='{"hashes":[]}',headers={'Content-Type':'application/json'}))
    pg.goto(f'http://127.0.0.1:{port}/voices.html?gh=http://127.0.0.1:{gport}')
    pg.wait_for_function('()=>window.__VL&&__VL.IDX&&__VL.IDX.items',timeout=60000); pg.wait_for_timeout(1500)
    # three lines: A two takes (small), B three takes (big audio, forces a split), C one take (must not be sent)
    info=pg.evaluate("""async()=>{ const its=__VL.IDX.items.filter(i=>i.t==='d').slice(0,3); const mp3=await __VL.builtIn(its[0]);
      const big=mp3+'A'.repeat(7*1024*1024); const sl=ms=>new Promise(r=>setTimeout(r,ms)); const out={};
      out.a=[(await __VL.addTake(its[0],mp3,'new take','[quick] one')).id,(await (async()=>{await sl(5); return __VL.addTake(its[0],mp3,'new take','[flat] two');})()).id];
      await sl(5); out.b=[]; for(const sc of ['[x] b1','[x] b2','[x] b3']){ out.b.push((await __VL.addTake(its[1],big,'new take',sc)).id); await sl(5); }
      out.c=[(await __VL.addTake(its[2],mp3,'new take','[solo] only')).id];
      out.lines=its.map(i=>__VL.lk(i)); return out; }""")
    ok(pg.evaluate("()=>__VL.takesToSend().length")==5,'5 takes wait (a line with one take is left out)')
    ok('5 waiting' in pg.inner_text('#sendtakes'),'button shows the count: '+pg.inner_text('#sendtakes'))
    pg.screenshot(path='tools/shots/vl-send.png')
    pg.click('#sendtakes'); pg.wait_for_function("()=>!__VL.takesToSend().length",timeout=120000)
    ok(GH['branch'] and len(GH['refs'])==1 and GH['refs'][0]['ref']=='refs/heads/takes','the takes branch was created from an empty history (no parents): '+str([p[0].split('/')[-1] for p in GH['posts']]))
    ok(any(p[0].endswith('/git/commits') and p[1].get('parents')==[] for p in GH['posts']),'orphan commit')
    ok(all(p['branch']=='takes' for p in GH['puts']),'every file goes to branch takes')
    P=parts(); ok(len(P)>=2,'big audio split into %d parts'%len(P))
    ok(all(p['bytes']<20*1024*1024 for p in GH['puts']),'every request under 20 MB: max %.1f MB'%(max(p['bytes'] for p in GH['puts'])/1048576))
    takes=[t for p in P for t in decode(p)['takes']]
    ok(sorted(t['id'] for t in takes)==sorted(info['a']+info['b']),'sent exactly the takes of lines with 2+ takes (%d)'%len(takes))
    ok(all(t['mp3'] and t['script'] and t['line'] for t in takes),'each take carries audio, script and line')
    kept=[t['id'] for t in takes if t['kept']]
    ok(sorted(kept)==sorted([info['a'][1],info['b'][2]]),'kept flag is on the newest take of each line: %d kept'%len(kept))
    st=[p for p in GH['puts'] if p['path'].endswith('/state.json')]
    ok(len(st)==1 and decode(st[0])['kind']=='takes-state' and len(decode(st[0])['trail'])==6,'state.json holds the trail (6 takes in all)')
    ok(len({p['path'].split('/')[-2] for p in GH['puts']})==1,'one session folder per send')
    n=len(GH['puts']); pg.click('#sendtakes'); pg.wait_for_timeout(800)
    ok(len(GH['puts'])==n,'a second press sends nothing')
    # a later take: only the new one goes; the single-take line C now has 2 takes so both of its takes go
    pg.evaluate("""async(l)=>{ const it=__VL.itemByKey(l[0]); const mp3=await __VL.builtIn(it); await __VL.addTake(it,mp3,'new take','[new] three'); }""",info['lines'])
    pg.evaluate("""async(l)=>{ const it=__VL.itemByKey(l[2]); const mp3=await __VL.builtIn(it); await __VL.addTake(it,mp3,'new take','[solo] second'); }""",info['lines'])
    ok(pg.evaluate("()=>__VL.takesToSend().length")==3,'new take of line A plus both takes of line C wait: %d'%pg.evaluate("()=>__VL.takesToSend().length"))
    GH['down']=True; n=len(GH['puts']); pg.click('#sendtakes'); pg.wait_for_timeout(9000)
    ok(len(GH['puts'])==n and pg.evaluate("()=>__VL.takesToSend().length")==3,'GitHub down: nothing marked sent, 3 still waiting')
    ok('kept on this phone' in pg.inner_text('#toast'),'toast says they are kept on the phone: '+pg.inner_text('#toast')[:80])
    GH['down']=False; pg.wait_for_timeout(500); pg.click('#sendtakes'); pg.wait_for_function("()=>!__VL.takesToSend().length",timeout=60000)
    last=[t['id'] for p in parts()[len(P):] for t in decode(p)['takes']]
    ok(len(last)==3 and info['a'][0] not in last,'retry sent the 3 new ones only (%d)'%len(last))
    # auto send: shorten the wait by faking timers
    pg.evaluate("""()=>{ window.__realST=window.setTimeout; window.setTimeout=(f,ms,...a)=>window.__realST(f,ms===120000?300:ms,...a); }""")
    n=len(GH['puts'])
    pg.evaluate("""async(l)=>{ const it=__VL.itemByKey(l[1]); const mp3=await __VL.builtIn(it); await __VL.addTake(it,mp3,'new take','[auto] four'); }""",info['lines'])
    pg.wait_for_function("()=>!__VL.takesToSend().length",timeout=30000)
    ok(len(GH['puts'])>n,'the automatic send went out after the quiet wait')
    ok(not errs,'no page errors '+str(errs[:2]))
    b.close()
print('FAILS:',fails)
