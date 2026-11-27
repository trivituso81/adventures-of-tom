# tools/movebench/golden.py (movebench3): records what the game plays today, move by move, so the phases that move the engine onto the spec can prove nothing changed.
# Each animation is played once in the stub fight of engine/b3-bench.js (fixed seed, the clock stepped by hand 1/60 s at a time, nothing drawn) and its timeline is written down:
# the moment of each beat that touches someone, each hit stop, each effect cue the engine armed (id, layer, params, contact moment, target count), each stage step fired, each sound,
# the videos, the stage run's hit and marks, the move's end. Section b.6 of claude/movebench-plan.md says what a timeline holds.
#   python3 -I tools/movebench/golden.py record [--out FILE] [--only ID,ID] [--workers N]   writes tools/movebench/golden.json (needs the untouched engine; see golden_test.py)
#   python3 -I tools/movebench/golden.py compare [--only ID,ID] [--workers N]               plays them again and prints the differences against golden.json (exit 1 on any)
# Importable: record_all(ids, workers) returns {id: record}; diff(a, b) returns a list of differences; TOL is the allowed difference in seconds (1 ms).
import threading, http.server, socketserver, functools, os, sys, json, time, argparse
from concurrent.futures import ThreadPoolExecutor
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GOLDEN=os.path.join(ROOT,'tools','movebench','golden.json')
TOL=0.0011
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
def serve():
    srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); return srv
def boot(br,base):
    pg=br.new_page(viewport={'width':466,'height':262})
    pg.goto(base+'/bench.html')
    pg.wait_for_function('()=>window.__BENCH_BOOT&&(window.__BENCH_BOOT.done||window.__BENCH_BOOT.error)',timeout=180000)
    b=pg.evaluate('()=>window.__BENCH_BOOT')
    if b['error']: raise RuntimeError('bench.html did not boot: '+b['error'])
    pg.evaluate("()=>{ window.__faults=[]; const g=gameFault; window.gameFault=function(w,e){ window.__faults.push(w+': '+(e&&e.message||e)); return g.apply(this,arguments); }; }")
    return pg
def all_ids():
    with sync_playwright() as pw:
        srv=serve(); br=pw.chromium.launch(**launch_kw()); pg=boot(br,'http://127.0.0.1:%d'%srv.server_address[1])
        ids=pg.evaluate('()=>B3BENCH.goldenIds()'); br.close(); srv.shutdown(); return ids
def launch_kw():
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    return kw
def record_all(ids,workers=4,log=print):
    ids=list(ids); out={}; lock=threading.Lock(); n=[0]; t0=time.time()
    chunks=[ids[i::workers] for i in range(workers)]
    srv=serve(); base='http://127.0.0.1:%d'%srv.server_address[1]
    def work(chunk):
        with sync_playwright() as pw:
            br=pw.chromium.launch(**launch_kw()); pg=boot(br,base)
            for id in chunk:
                try: r=pg.evaluate('(id)=>B3BENCH.golden(id)',id)
                except Exception as e: r={'id':id,'error':'evaluate: '+str(e)[:200]}
                if isinstance(r,dict) and r.get('loaded') is False:   # something it needs never loads (Suite Door Slide's stage picture is not wired): the run would only record how long the wait lasted, which is not the game's
                    r={'id':id,'kind':r.get('kind'),'loaded':False,'skipped':'a clip or stage picture the move needs does not load here, so the run would only show the wait'}
                with lock:
                    out[id]=r; n[0]+=1
                    if n[0]%10==0: log('  %d of %d  (%d s)'%(n[0],len(ids),time.time()-t0))
            br.close()
    with ThreadPoolExecutor(max_workers=workers) as ex: list(ex.map(work,[c for c in chunks if c]))
    srv.shutdown()
    return {k:out[k] for k in ids}
def same(a,b,path,out):
    if isinstance(a,(int,float)) and isinstance(b,(int,float)) and not isinstance(a,bool) and not isinstance(b,bool):
        if abs(a-b)>TOL: out.append('%s: %s != %s'%(path,a,b))
    elif isinstance(a,dict) and isinstance(b,dict):
        for k in sorted(set(a)|set(b)):
            if k not in a or k not in b: out.append('%s.%s: only in %s'%(path,k,'new' if k in a else 'golden'))
            else: same(a[k],b[k],path+'.'+k,out)
    elif isinstance(a,list) and isinstance(b,list):
        if len(a)!=len(b): out.append('%s: %d items != %d items'%(path,len(a),len(b)))
        for i,(x,y) in enumerate(zip(a,b)): same(x,y,'%s[%d]'%(path,i),out)
    elif a!=b: out.append('%s: %r != %r'%(path,a,b))
def diff(new,old):
    out=[]; same(new,old,'',out); return out
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('mode',choices=['record','compare','ids']); ap.add_argument('--out'); ap.add_argument('--only'); ap.add_argument('--workers',type=int,default=4)
    a=ap.parse_args()
    ids=a.only.split(',') if a.only else all_ids()
    if a.mode=='ids': print('\n'.join(ids)); return 0
    t0=time.time(); rec=record_all(ids,a.workers); bad=[k for k,v in rec.items() if v.get('error') or (not v.get('finished') and not v.get('skipped'))]
    if a.mode=='record':
        doc={'about':'Written by tools/movebench/golden.py record on the engine as it was before the spec (movebench3, 2026-11-26). Phases 4, 8 and 12 must reproduce every value within 1 ms; a difference is a bug in the phase, never a new golden. Do not edit.','tol':TOL,'count':len(rec),'animations':rec}
        out=a.out or GOLDEN; open(out,'w').write(json.dumps(doc,indent=1,sort_keys=True)+'\n'); print('wrote %s: %d animations, %d not finished or with an error, %d s'%(out,len(rec),len(bad),time.time()-t0)); return 0
    gold=json.load(open(GOLDEN))['animations']; fails=0
    for k,v in rec.items():
        if k not in gold: print('NOT IN GOLDEN',k); fails+=1; continue
        d=diff(v,gold[k])
        if d: fails+=1; print('DIFF',k); [print('   ',x) for x in d[:8]]
    print('compared %d animations, %d differ, %d s'%(len(rec),fails,time.time()-t0)); return 1 if fails else 0
if __name__=='__main__': sys.exit(main())
