# NEW QUEST banner test (questbanner1, questBanner in engine/party-banner.js, questGiven in engine/story.js). Real browser.
# Tom 2026-11-27: "After a new quest is given, display a new quest interstitial similar to the item, new chapter, or party join/leave interstitial."
# Checks:
#   Q1 a new goal in the full story shows one NEW QUEST banner: the first sentence as the title, the rest as the description, the chapter
#   Q2 a plain statement goal ("The story is complete. ...") shows no banner; the same goal set twice shows one banner
#   Q3 the banner holds the game (partyBannerHeld) and A / Enter closes it after PB_MIN
#   Q4 two goals in a row before the first shows: one banner, the newer goal
#   Q5 it waits while a chapter card is up, then shows
#   Q6 a multi-part step lists its parts
#   Q7 Aunt Ellie's bet shows a SIDE QUEST banner with the reward and no tracker line
#   Q8 the banner fits on screen for every goal written in the game, portrait and landscape
# Shots: tools/shots/questbanner-<viewport>.png
# Usage: python3 tools/questbanner_test.py
import threading, http.server, socketserver, functools, os, re, io, glob
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
GOALS=sorted({m for f in glob.glob(os.path.join(ROOT,'data','*.js')) for m in re.findall(r"toast:'Goal: ((?:[^'\\]|\\.)+)'",open(f,encoding='utf8').read())})
GOALS=[g.replace("\\'","'") for g in GOALS]
FIT="""()=>{ const w=document.getElementById('party-banner'),c=w.querySelector('.pb-card'),g=document.getElementById('game')||document.body;
  const r=c.getBoundingClientRect(),s=g.getBoundingClientRect(),i=w.querySelector('.pb-quest');
  return {top:r.top-s.top,bottom:s.bottom-r.bottom,left:r.left-s.left,right:s.right-r.right,clip:i.scrollHeight>c.clientHeight+2}; }"""
STATE="""()=>{ const w=document.getElementById('party-banner'); if(!w||!w.classList.contains('on')||!w.classList.contains('quest')) return null;
  return {tag:w.querySelector('.pb-qtag').textContent,ch:w.querySelector('.pb-qch').textContent,title:w.querySelector('.pb-qtitle').textContent,
    desc:w.querySelector('.pb-qdesc').textContent,parts:[...w.querySelectorAll('.pb-qparts li')].map(l=>l.textContent),note:w.querySelector('.pb-qnote').textContent,
    where:!w.querySelector('.pb-qwhere').hidden,held:partyBannerHeld()}; }"""
CLEAR="()=>{ pbQueue.length=0; pbQuestWait=null; if(pbShown){ pbAt=-1e9; partyBannerDismiss(); } pbBusy=false; }"
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block').new_page()
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.questBanner'); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; window.__LE.chapterJump(3); }"); pg.wait_for_timeout(3500)
    pg.evaluate("()=>{ intro.active=false; intro.card=null; dialog.active=false; }"); pg.wait_for_timeout(300)
    pg.evaluate(CLEAR); pg.wait_for_timeout(600)
    check('setup: full story',pg.evaluate("()=>STORY.mode")=='full')
    # Q1
    pg.evaluate("()=>storySetGoal('Goal: follow Old Iron-Gill west, into the Whispering Marsh. The marsh is loud tonight.')"); pg.wait_for_timeout(700)
    s=pg.evaluate(STATE)
    check('Q1 a new goal shows NEW QUEST with title, description and chapter',bool(s) and s['tag']=='NEW QUEST' and s['title']=='Follow Old Iron-Gill west, into the Whispering Marsh.' and s['desc']=='The marsh is loud tonight.' and s['ch']=='Chapter 3' and s['where'],s)
    # Q3
    check('Q3 the banner holds the game',bool(s) and s['held'])
    pg.wait_for_timeout(500); pg.keyboard.press('Enter'); pg.wait_for_timeout(600)
    check('Q3 Enter closes it and frees the game',pg.evaluate(STATE) is None and not pg.evaluate("()=>partyBannerHeld()"))
    # Q2
    pg.evaluate("()=>storySetGoal('Goal: The story is complete. The world is yours to wander.')"); pg.wait_for_timeout(700)
    check('Q2 a plain statement goal shows no banner',pg.evaluate(STATE) is None)
    pg.evaluate("()=>{ storySetGoal('Goal: the Reading Room.'); }"); pg.wait_for_timeout(700)
    s=pg.evaluate(STATE); check('Q2 a place goal reads as an instruction',bool(s) and s['title']=='Go to the Reading Room.',s)
    pg.evaluate(CLEAR); pg.wait_for_timeout(500)
    pg.evaluate("()=>storySetGoal('Goal: the Reading Room.')"); pg.wait_for_timeout(700)
    check('Q2 the same goal again shows no banner',pg.evaluate(STATE) is None)
    # Q4
    pg.evaluate("()=>{ battle.active=true; storySetGoal('Goal: up the stairs to the stage set (top).'); storySetGoal('Goal: walk Amy out to her minivan, in the schoolyard parking lot.'); }"); pg.wait_for_timeout(600)
    check('Q4 nothing shows during a fight',pg.evaluate(STATE) is None)
    pg.evaluate("()=>{ battle.active=false; }"); pg.wait_for_timeout(1000)
    s=pg.evaluate(STATE); check('Q4 one banner, the newer goal',bool(s) and s['title'].startswith('Walk Amy out'),s)
    pg.evaluate(CLEAR); pg.wait_for_timeout(600)
    check('Q4 no second banner queued',pg.evaluate(STATE) is None and pg.evaluate("()=>pbQueue.length")==0)
    # Q5
    pg.evaluate("()=>{ intro.card={n:3,t:1}; storySetGoal('Goal: the Paint Shop (top left), the Machine Shop (top right), the Lunchroom (bottom left). Get the pilot lights lit.'); }"); pg.wait_for_timeout(600)
    check('Q5 nothing shows while a chapter card is up',pg.evaluate(STATE) is None)
    pg.evaluate("()=>{ intro.card=null; }"); pg.wait_for_timeout(1000)
    s=pg.evaluate(STATE)
    check('Q5 it shows after the card',bool(s))
    check('Q6 a multi-part step lists its parts',bool(s) and s['parts']==['Paint Shop','Machine Shop','Lunchroom'],s)
    pg.evaluate(CLEAR); pg.wait_for_timeout(600)
    # Q7
    pg.evaluate("()=>ellieQuestBanner(ELLIE_BETS[2])"); pg.wait_for_timeout(700)
    s=pg.evaluate(STATE)
    check('Q7 Aunt Ellie bet: SIDE QUEST with reward, no tracker line',bool(s) and s['tag']=='SIDE QUEST' and 'Aunt Ellie' in s['note'] and not s['where'] and 'chapter 3' in s['desc'],s)
    pg.evaluate(CLEAR); pg.wait_for_timeout(600)
    src=open(os.path.join(ROOT,'data','ellie-quests.js'),encoding='utf8').read()
    check('Q7 the old Ellie toast is gone','prize for you if you finish this one' not in src)
    # Q8 fit + shots
    tasks=pg.evaluate("g=>g.filter(t=>questIsTask(t))",GOALS)
    check(f'Q8 goals found ({len(GOALS)} written, {len(tasks)} are quests)',len(tasks)>60)
    for name,(w,h) in {'portrait':(390,844),'landscape':(844,390)}.items():
        pg.set_viewport_size({'width':w,'height':h}); pg.wait_for_timeout(700)
        bad=[]
        for t in tasks:
            pg.evaluate(CLEAR); pg.evaluate("t=>{ pbQuestWait=null; questGiven(t); }",t); pg.wait_for_timeout(60)
            f=pg.evaluate(FIT)
            if f['clip'] or min(f['top'],f['bottom'],f['left'],f['right'])<0: bad.append((t[:50],f))
        check(f'Q8 {name}: fits for all {len(tasks)} quests',not bad,bad[:3])
        tiles=[]
        for t in ['follow the muddy trail to Grump Hollow, north of the Square.',GOALS[[g.startswith('clear the three sets') for g in GOALS].index(True)],None]:
            pg.evaluate(CLEAR); pg.wait_for_timeout(450)
            if t: pg.evaluate("t=>questGiven(t)",t)
            else: pg.evaluate("()=>ellieQuestBanner(ELLIE_BETS[4])")
            pg.wait_for_timeout(900); tiles.append(Image.open(io.BytesIO(pg.screenshot())))
        pg.evaluate(CLEAR)
        cols=3 if name=='portrait' else 1; tw,th=tiles[0].size; sheet=Image.new('RGB',(tw*cols,th*((len(tiles)+cols-1)//cols)),'white')
        for k,t in enumerate(tiles): sheet.paste(t,((k%cols)*tw,(k//cols)*th))
        sheet.save(os.path.join(SHOTS,f'questbanner-{name}.png'))
    check('no page errors',not errs,errs[:3])
    br.close()
print('PASS' if not fails else 'FAILED: '+', '.join(fails))
raise SystemExit(1 if fails else 0)
