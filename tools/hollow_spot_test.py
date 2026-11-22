# r-20261121-172017-kfe3: chapter 1's grey patch, orange block and bulb at Boppy's spot show only after the Log is beaten (scene ch1Spot).
import threading, http.server, socketserver, functools, os, sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
JS=r"""()=>{ splash.active=false; document.getElementById('splash').hidden=true; endIntro(); resetStory('full',1);
  const r={};
  for(const [n,fl] of [['trail',{'ch1-trail':true,'ch1-tuts':true}],['logbeaten',{'ch1-trail':true,'ch1-tuts':true,'ch1-beat:log':true}],['spotseen',{'ch1-trail':true,'ch1-spot':true}]]) {
    for(const k of Object.keys(STORY.flags)) if(k.startsWith('ch1-')) delete STORY.flags[k];
    Object.assign(STORY.flags,fl); r[n]=[hollowSpotHidden(),AMBER_SPOTS[0].show()]; }
  return r; }"""
fails=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROME') or None); pg=b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_timeout(4000)
    r=pg.evaluate(JS); print(r)
    if r['trail']!=[True,False]: fails.append('hidden while following the wrappers')
    if r['spotseen']!=[False,True]: fails.append('shown after scene 5')
    if r['logbeaten'][0]!=True: fails.append('still hidden until scene 5 plays (the spot scene triggers it)')
    if errs: fails.append('page errors '+str(errs[:2]))
    b.close()
print('FAIL '+'; '.join(fails) if fails else 'PASS'); sys.exit(1 if fails else 0)
