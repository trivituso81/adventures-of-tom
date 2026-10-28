# Speech windows: where the voice actually starts and ends inside a baked clip, so a move's beats can land on its words.
# Usage (repo root):  python3 tools/speech_windows.py amy:tombo2 tom:tomboamy2 [who:kind:textprefix ...]
# Prints one JSON line per clip: total length and the voiced segments [start_ms, end_ms] (pauses over 140 ms split segments).
# Use the numbers in a move's timeline; multiply any span that waits on a voice by the battle speed K (b7Speed()), because the
# timeline runs K times faster than the audio. Env: BUILD (folder to serve), CHROMIUM (browser binary).
import sys, os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.environ.get('BUILD',os.path.dirname(HERE))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
want=[(a.split(':')+[''])[:3] for a in sys.argv[1:]]
JS="""async(want)=>{ const out=[]; const ctx=new OfflineAudioContext(1,44100,44100);
  for(const [w,k,pref] of want){ for(const c of ((VOICE_CLIPS.clips[w]||{})[k]||[])){ if(!c||(pref&&!c.text.startsWith(pref))) continue;
    const bin=atob(c.mp3),u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
    const ab=await ctx.decodeAudioData(u.buffer); const d=ab.getChannelData(0),fr=Math.round(ab.sampleRate*.010);
    const rms=[]; for(let i=0;i+fr<=d.length;i+=fr){ let s=0; for(let j=0;j<fr;j++) s+=d[i+j]*d[i+j]; rms.push(Math.sqrt(s/fr)); }
    const peak=Math.max(...rms), thr=Math.max(.008,peak*.06); const segs=[]; let st=null,last=null;
    rms.forEach((v,i)=>{ if(v>thr){ if(st===null) st=i; last=i; } else if(st!==null&&i-last>14){ segs.push([st*10,(last+1)*10]); st=null; } });
    if(st!==null) segs.push([st*10,(last+1)*10]);
    out.push({who:w,kind:k,text:c.text,dur_ms:Math.round(ab.duration*1000),segs}); } } return out; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page()
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=30000); pg.wait_for_timeout(500)
    for r in pg.evaluate(JS,want): print(json.dumps(r))
    br.close()
