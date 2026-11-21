# Item definition banner test (itemdef1, data/item-defs.js and itemBanner in engine/party-banner.js). Real browser.
# Tom 2026-11-20: every item banner reads like a JRPG item definition: name and type, a short description, IN BATTLE and IN STORY.
# Checks, for every item in the game (all chapter files load at boot):
#   D1 itemDef gives all four parts, none empty
#   D2 key items and story gifts (keepsake, or no price, no sell and not shop gear) have their own IN STORY line in ITEM_STORY
#   D3 no em dash anywhere in the item text, and the written lines use contractions
#   D4 every ITEM_STORY, ITEM_TYPE and ITEM_BATTLE key is a real item
#   D5 the banner fits on screen for every item with the longest source note, portrait and landscape (card inside the stage, nothing cut off inside the card)
#   D6 several items: one banner, one page per item, A turns the page, the last page closes it
# Shots: tools/shots/itemdef-<viewport>.png (a contact sheet of six kinds of item).
# Usage: python3 tools/itemdef_test.py
import threading, http.server, socketserver, functools, os, re, io
from PIL import Image
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
    def handle(self):
        try: super().handle()
        except (BrokenPipeError,ConnectionResetError): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def check(name,ok,detail=''):
    print(('ok   ' if ok else 'FAIL ')+name+(('  '+str(detail)[:400]) if not ok and detail else ''))
    if not ok: fails.append(name)
UNCONTRACTED=re.compile(r"\b(is not|are not|do not|does not|did not|has never|have never|cannot|can not|it is|that is|you are|they are|we are|I am|he is|she is|will not|would not|has had|has been)\b",re.I)
LONG_NOTE='A medal fell out of the rubble: I SURVIVED THE BIG SHAKE. Tom put it on immediately. Then in a pocket. Grace put on the Lavender Tee.'   # the longest drop line, plus an auto-gear note
SHOW_KINDS=['dragonflycoin','n_steamer','cookie','e_china','parkticket','g_bsash']
FIT="""()=>{ const w=document.getElementById('party-banner'),c=w.querySelector('.pb-card'),g=document.getElementById('game')||document.body;
  const r=c.getBoundingClientRect(),s=g.getBoundingClientRect(),i=w.querySelector('.pb-item');
  return {top:r.top-s.top,bottom:s.bottom-r.bottom,left:r.left-s.left,right:s.right-r.right,clip:i.scrollHeight>c.clientHeight+2}; }"""
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block').new_page()
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.itemBanner'); pg.wait_for_timeout(1500)
    # ---- data checks ----
    d=pg.evaluate("""()=>{ const out={}; for(const id in items) out[id]=Object.assign(itemDef(id),{it:{keepsake:!!items[id].keepsake,slot:items[id].slot||null,price:items[id].price||0,sell:items[id].sell||0,tier:items[id].tier||0}});
      return {defs:out,story:ITEM_STORY,type:ITEM_TYPE,battle:ITEM_BATTLE}; }""")
    defs=d['defs']
    empty=[i for i,x in defs.items() if not all(x[k] for k in ('name','type','desc','battle','story'))]
    check(f'D1 all {len(defs)} items have name, type, description, IN BATTLE and IN STORY',not empty,empty)
    need=[i for i,x in defs.items() if x['it']['keepsake'] or (not x['it']['price'] and not x['it']['sell'] and not x['it']['tier'] and (x['it']['slot'] or x['type'].startswith('Key Item')))]
    miss=[i for i in need if i not in d['story']]
    check(f'D2 the {len(need)} key items and story gifts have their own IN STORY line',not miss,miss)
    dash=[i for i,x in defs.items() if any('—' in x[k] for k in ('name','type','desc','battle','story'))]
    check('D3 no em dash in any item text',not dash,dash)
    written=list(d['story'].values())+list(d['battle'].values())+list(d['type'].values())
    src=open(os.path.join(ROOT,'data','item-defs.js'),encoding='utf8').read()
    kinds=re.findall(r"^\s+[a-z]+:'([^']*)',?$",src.split('const ITEM_STORY_KIND=')[1].split('function ')[0],re.M)
    bad=[t for t in written+kinds if UNCONTRACTED.search(t)]
    check('D3 the written lines use contractions',not bad,bad)
    ghosts=[k for k in list(d['story'])+list(d['type'])+list(d['battle']) if k not in defs]
    check('D4 every written line belongs to a real item',not ghosts,ghosts)
    # ---- banner checks ----
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(1); }"); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{ intro.active=false; dialog.active=false; }")
    for name,(w,h) in {'portrait':(390,844),'landscape':(844,390)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(700)
        pg.evaluate("()=>itemBanner(['cookie'])"); pg.wait_for_timeout(900)
        bad=[]
        for i in defs:
            f=pg.evaluate("([id,note])=>{ pbItem.pages=[[id,1]]; pbItem.at=0; pbItem.note=note; pbItemPage(); return ("+FIT+")(); }",[i,LONG_NOTE])
            if f['clip'] or min(f['top'],f['bottom'],f['left'],f['right'])<0: bad.append((i,f))
        check(f'D5 {name}: the banner fits on screen for all {len(defs)} items',not bad,bad[:4])
        tiles=[]
        for i in SHOW_KINDS:
            pg.evaluate("id=>{ pbItem.pages=[[id,1]]; pbItem.at=0; pbItem.note=id==='cookie'?'It went in a pocket.':''; pbItemPage(); }",i); pg.wait_for_timeout(250)
            tiles.append(Image.open(io.BytesIO(pg.screenshot())))
        pg.wait_for_timeout(1200); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
        cols=3 if name=='portrait' else 2; tw,th=tiles[0].size; sheet=Image.new('RGB',(tw*cols,th*((len(tiles)+cols-1)//cols)),'white')
        for k,t in enumerate(tiles): sheet.paste(t,((k%cols)*tw,(k//cols)*th))
        sheet.save(os.path.join(SHOTS,f'itemdef-{name}.png'))
        # D6 pages
        PG="()=>{ const w=document.getElementById('party-banner'); return w.classList.contains('on')?[w.querySelector('.pb-name').textContent,w.querySelector('.pb-page').textContent,w.querySelector('.pb-ihint').textContent]:null; }"
        pg.evaluate("()=>grantItem(['dragonflycoin','juice','juice'])"); pg.wait_for_timeout(800)
        a=pg.evaluate(PG); pg.wait_for_timeout(500); pg.keyboard.press('Enter'); pg.wait_for_timeout(60)
        pg.keyboard.press('Enter'); pg.wait_for_timeout(60); held_early=pg.evaluate("()=>partyBannerHeld()")   # a second press right after the page turn is ignored (PB_MIN)
        b=pg.evaluate(PG); pg.wait_for_timeout(1200); pg.keyboard.press('Enter'); pg.wait_for_timeout(700)
        check(f'D6 {name}: page 1 of 2, then page 2 with the count, then closed',a and a[0]=='Dragonfly Coin' and a[1]=='1 of 2' and 'next item' in a[2] and b and b[0]=='Juice Box x2' and b[1]=='2 of 2' and 'continue' in b[2] and held_early and not pg.evaluate("()=>partyBannerHeld()"),(a,b))
    check('no page errors',not errs,errs[:3])
    br.close()
print('FAILED' if fails else 'PASSED'); raise SystemExit(1 if fails else 0)
