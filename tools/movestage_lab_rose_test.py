# movelab2 (card c-movelab-rose): the Move Lab's person picker. Starts MOVE LAB, switches to Rose and fails on:
#   R1 Rose's twelve moves are not listed (3 Vibes x basic, s1, s2, cap, in ladder order), or the header does not say MOVE LAB: ROSE
#   R2 the picker does not switch back to Tom's eight, or the fight loses a party member
#   R3 a Rose move does not play through b3Act (her loadout is open at the top Rank) and finish
#   R4 Keep writes to the wrong card (must be t-rosestage-lab with who:rose), or Tweak makes a card that does not name Rose
#   R5 the panel does not sit under the canvas in portrait and landscape
# Usage (repo root): python3 tools/movestage_lab_rose_test.py   prints FAILS: [] when all pass.   Env: OUT (pictures), CHROMIUM.
# Pictures: movestage-lab-rose-<portrait|landscape>.png
import threading, http.server, socketserver, functools, os, re, json, base64
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); port=srv.server_address[1]
fails=[]
def need(c,w):
    if not c: fails.append(w)
def main():
    with sync_playwright() as pw:
        kw={'args':['--headless=new','--no-proxy-server']}
        if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
        br=pw.chromium.launch(**kw); pg=br.new_context(service_workers='block',viewport={'width':430,'height':860},device_scale_factor=2).new_page(); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; }")
        def start():
            i=pg.evaluate("()=>B3_LAB.findIndex(L=>L.movelab)"); need(i>=0,'there is a MOVE LAB row in data/b3-lab.js')
            pg.evaluate("(i)=>{ b3Lab(i); }",i)
            pg.wait_for_function("()=>battle.state==='command'&&B3.ui==='deck'&&b3mlCanPlay()",timeout=60000)
        def rose():
            pg.click('#b3-ml [data-ml=who][data-id=rose]')
            pg.wait_for_function("()=>B3ML.who==='rose'&&b3mlCanPlay()",timeout=60000)
        for lay in ('portrait','landscape'):
            if lay=='landscape':
                pg.evaluate("()=>{ b3Exit(); }"); pg.wait_for_timeout(500); pg.evaluate("()=>window.__LE.toggleLayout()"); pg.wait_for_timeout(800)
            start(); rose()
            L=pg.evaluate("()=>b3mlList().map(G=>({vibe:G.vibe,moves:G.moves.map(m=>m.slot)}))")
            need(len(L)==3 and all(g['moves']==['basic','s1','s2','cap'] for g in L),f'R1 {lay}: Rose has 3 Vibes of 4 moves in ladder order: {L}')
            need(pg.evaluate("()=>/MOVE LAB: ROSE/.test(document.getElementById('b3-ml').innerText)&&document.querySelectorAll('#b3-ml .ml-m').length===12"),f'R1 {lay}: the panel says MOVE LAB: ROSE and shows 12 moves')
            need(pg.evaluate("()=>B3.F.party.map(u=>u.id).join()")=='tom,grace,rose,deedee',f'R2 {lay}: the fight keeps all four')
            pg.screenshot(path=os.path.join(OUT,f'movestage-lab-rose-{lay}.png'))
            need(pg.evaluate("()=>{ const P=document.getElementById('b3-ml').getBoundingClientRect(),A=document.getElementById('battle-canvas').getBoundingClientRect(); return P.width>100&&P.height>60&&P.top>=A.bottom-2; }"),f'R5 {lay}: the panel sits below the canvas')
        # R3 play a Rose basic through the real rules
        mid=pg.evaluate("()=>b3mlList()[0].moves[0].id")
        pg.evaluate("(m)=>{ window.__LE.b3mlPlay(m); }",mid)
        pg.wait_for_function("()=>B3ML.res&&!B3ML.busy",timeout=60000)
        need(pg.evaluate("(m)=>B3ML.res.id===m&&B3ML.res.len>0",mid),'R3 a Rose move plays and finishes with a length')
        # R4 board
        saved=[]
        def board(r):
            rq=r.request
            if rq.method=='PUT': saved.append(json.loads(rq.post_data)); r.fulfill(status=200,content_type='application/json',body='{}'); return
            doc={'cards':[{'id':'t-rosestage-lab','lane':'tom','col':'wait','history':[],'tag':'rosestage1'},{'id':'t-movestage-lab','lane':'tom','col':'wait','history':[],'tag':'movestage2'}]}
            r.fulfill(status=200,content_type='application/json',body=json.dumps({'sha':'abc','content':base64.b64encode(json.dumps(doc).encode()).decode()}))
        pg.route(re.compile(r'/repos/trivituso81/adventures-of-tom/contents/data/board.json'),board)
        pg.evaluate("()=>{ localStorage.setItem('aot-gh-token','test-token'); }")
        pg.click('#b3-ml [data-ml=keep]'); pg.wait_for_timeout(600)
        need(len(saved)==1,f'R4 Keep saves one change ({len(saved)})')
        if saved:
            doc=json.loads(base64.b64decode(saved[0]['content']).decode()); c={k['id']:k for k in doc['cards']}
            need(c['t-rosestage-lab'].get('keeps',{}).get(mid,{}).get('who')=='rose' and not c['t-movestage-lab'].get('keeps'),f'R4 Keep goes to t-rosestage-lab with who rose')
        pg.click('#b3-ml [data-ml=tweak]'); pg.fill('#ml-note','Hold the words longer'); pg.click('#b3-ml [data-ml=send]'); pg.wait_for_timeout(600)
        need(len(saved)==2,'R4 Tweak saves a card')
        if len(saved)>1:
            doc=json.loads(base64.b64decode(saved[1]['content']).decode()); c=[k for k in doc['cards'] if k['id'].startswith('c-move')]
            need(len(c)==1 and c[0]['move'].get('who')=='rose' and 'Rose' in c[0]['title'] and 'picker on Rose' in c[0]['prompt']['text'],f'R4 the Tweak card names Rose: {c[:1]}')
        # R2 back to Tom
        pg.click('#b3-ml [data-ml=who][data-id=tom]'); pg.wait_for_function("()=>B3ML.who==='tom'&&b3mlCanPlay()",timeout=60000)
        need(pg.evaluate("()=>document.querySelectorAll('#b3-ml .ml-m').length")==8,'R2 the picker goes back to Tom\'s eight')
        need(not errs,f'page errors: {errs[:3]}')
        br.close()
main()
print('FAILS:',fails)
