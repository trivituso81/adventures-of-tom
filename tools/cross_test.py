# Command cross test: ▲ ATTACK, ▶ HEAL, ◀ WARMTH, ▼ BAG. Prints which list every move and Tombo sits in, checks that each sits in exactly
# one list, and saves screenshots of the cross and each list (portrait and landscape) to tools/shots/cross-*.png.
# Usage (repo root):  python3 tools/cross_test.py [--shots]      Env: BUILD, CHROMIUM
import sys, threading, http.server, socketserver, os, functools, json
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.environ.get('BUILD',os.path.dirname(HERE)); SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
shots='--shots' in sys.argv
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
READY="()=>{ const L=window.__LE; return L.battle.state==='command'&&L.B2.actor&&L.B2.actor.side==='party'; }"
PARTIES=[['tom','grace','rose','amy'],['deedee','boppy','tnb','nara'],['justin','olivia']]
START="""(party)=>{ splash.active=false; const el=document.getElementById('splash'); if(el) el.hidden=true;
  window.__LE.b2Start({party,level:30,foes:[['mudling','front'],['mudling','front']],bag:[],heart:60,allSkills:true,tombos:'all'}); return true; }"""
DUMP="""()=>{ const out={};
  for(const u of B2.party){ const k=u.kit; out[u.id]=[k.basic,k.special,...k.skills].filter(Boolean).map(s=>[s.key,s.name,b2MoveCat(u,s)]); }
  out.tombos=B2_TOMBOS.map(T=>[T.id,T.name,b2TomboCat(T)]);
  return out; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860},device_scale_factor=2)
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=20000)
    pg.wait_for_timeout(800)
    d={}
    for party in PARTIES:
        pg.evaluate(START,party); pg.wait_for_function(READY,timeout=30000)
        d.update(pg.evaluate(DUMP))
    fails=[]
    for who,moves in d.items():
        if who=='tombos': continue
        by={'attack':[],'heal':[],'warmth':[]}
        for key,name,cat in moves:
            if cat not in by: fails.append(f'{who}.{key}: bad category {cat}'); continue
            by[cat].append(name)
        print(f'{who:7} ATTACK {by["attack"]}\n        HEAL   {by["heal"]}\n        WARMTH {by["warmth"]}')
    tb={'attack':[],'heal':[],'warmth':[]}
    for tid,name,cat in d['tombos']:
        if cat not in tb: fails.append(f'tombo {tid}: bad category {cat}'); continue
        tb[cat].append(tid)
    print('TOMBOS', {k:len(v) for k,v in tb.items()}, 'of', len(d['tombos']))
    for k,v in tb.items(): print(' ',k,v)
    # Interaction: a Warmth move and a Tombo are picked through the menu rows, and tips and recommendations aim at the right list.
    pg.evaluate(START,PARTIES[0]); pg.wait_for_function(READY,timeout=30000)
    r=pg.evaluate("""()=>{ const out={}; const rose=B2.party.find(p=>p.id==='rose'),tom=B2.party.find(p=>p.id==='tom');
      B2.heart=100; B2.actor=rose; battle.actor=rose.idx; B2.tab='warmth'; b2Open('skills');
      const rows=b2SkillRows(rose); out.warmthFirst=rows[0]&&rows[0].name;
      out.warmthTombos=rows.filter(x=>x.T).length;
      out.aimTombo=b2TipAim({tombo:'rose1'},rose); out.aimTomboTom=b2TipAim({tombo:'rose1'},tom);
      out.aimKeys=b2TipAim({dir:'left',keys:['silly']},rose); out.aimUp=b2TipAim({dir:'up'},rose);
      B2.actor=tom; battle.actor=tom.idx; const rec=b7Recommend(tom); out.rec=rec&&rec.dir; out.recMapped=rec&&b7RecMap(tom,rec).dir;
      B2.tab='attack'; b2Open('skills'); const ar=b2SkillRows(tom); const ti=ar.findIndex(x=>x.T&&x.T.id==='rose1'); out.tomboIdx=ti;
      B2.sel=ti; b2Pick(ti); out.afterPickUi=B2.ui; out.heart0=B2.heart;
      return out; }""")
    print('INTERACTION',json.dumps(r))
    if r['warmthFirst']!='RASPBERRY': fails.append('Rose Warmth list should start with RASPBERRY: '+str(r['warmthFirst']))
    if r['aimTombo'] is None or r['aimTombo']['dir']!='up' or r['aimTombo']['i']<1: fails.append('Tombo tip should aim at a row in ATTACK: '+str(r['aimTombo']))
    if r['aimKeys'] is None or r['aimKeys']['dir']!='left': fails.append('keys tip should aim left: '+str(r['aimKeys']))
    if r['tomboIdx']<1: fails.append('rose1 Tombo row missing from Tom ATTACK list')
    if r['afterPickUi'] not in ('target','busy'): fails.append('picking a Tombo row did nothing: '+str(r['afterPickUi']))
    if r['afterPickUi']=='target': pg.evaluate("()=>{ B2.sel=0; b2Pick(0); }")
    pg.wait_for_function("()=>battle.state!=='command'",timeout=10000)
    pg.wait_for_function("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'",timeout=90000)
    heart=pg.evaluate("()=>B2.heart")
    print('HEART before/after Tombo',r['heart0'],heart)
    if not heart<r['heart0']: fails.append('the Tombo did not spend HEART')
    if shots:
        for vp,tag in (({'width':430,'height':860},'p'),({'width':860,'height':430},'l')):
            pg.set_viewport_size(vp)
            pg.evaluate(START,PARTIES[0]); pg.wait_for_function(READY,timeout=30000)
            pg.evaluate("()=>{ B2.heart=100; B2.actor=B2.party.find(p=>p.id==='rose'); battle.actor=B2.actor.idx; b2Open('cross'); }")
            pg.wait_for_timeout(600); pg.screenshot(path=os.path.join(SHOTS,f'cross-rose-cross-{tag}.png'))
            for tab in ('attack','warmth','heal'):
                pg.evaluate(f"()=>{{ B2.heart=100; B2.actor=B2.party.find(p=>p.id==='rose'); battle.actor=B2.actor.idx; B2.tab='{tab}'; b2Open('skills'); }}")
                pg.wait_for_timeout(400); pg.screenshot(path=os.path.join(SHOTS,f'cross-rose-{tab}-{tag}.png'))
    if errs: fails+=['page error: '+e for e in errs[:5]]
    print('FAILS:',fails)
    br.close()
