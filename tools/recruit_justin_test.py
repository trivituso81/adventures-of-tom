# Justin as a recruit: talk to him in the Gregori house (amyhouse), join, swap with Amy, leave, rejoin; menu tabs, save/load, a fight, region and chapter rules.
# Shots: tools/shots/recruit-justin-*.png.   Usage: python3 tools/recruit_justin_test.py
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
errs=[]; fails=[]
def check(name,ok,extra=''):
    print(('ok   ' if ok else 'FAIL ')+name,extra)
    if not ok: fails.append(name)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw); pg=br.new_page(viewport={'width':430,'height':860})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    E=lambda js,*a: pg.evaluate(js,*a)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    E("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(400)
    def clear():
        for i in range(400):
            if not E("()=>intro.active||dialog.active||!!transition"): return True
            pg.keyboard.press('Enter'); pg.wait_for_timeout(70)
        return False
    clear()
    ids=lambda: E("()=>party.map(p=>p.id)")
    def to_house():
        E("()=>window.__LE.go('amyhouse')"); pg.wait_for_timeout(1500); clear()
    def face_justin():
        E("()=>{ const n=currentMap.npcs.find(n=>n.name==='Justin'); if(!n) return; n.roam=0; n.move=null; n.path=[]; player.x=n.x; player.y=n.y+1; player.facing='up'; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(500)
    def talk(pick=None,maxp=40):
        """Talk to Justin; press Enter through the pages; at the choice press the label containing `pick` (None: stop at the choice)."""
        E("()=>{ if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); }")   # the menu leaves a button focused, which would eat Enter
        pg.keyboard.press('Enter'); pg.wait_for_timeout(150)
        for i in range(maxp):
            if E("()=>!!(dialog.active&&dialog.choice&&onChoicePage()&&dialog.shown>=dialog.chars.length)"):
                labels=E("()=>dialog.choice.options.map(o=>o.label)")
                if pick is None: return labels
                k=next((i for i,l in enumerate(labels) if pick in l),None)
                if k is None: return labels
                E("(k)=>{ dialog.choice.sel=k; }",k); pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
                return labels
            if not E("()=>dialog.active"): return None
            pg.keyboard.press('Enter'); pg.wait_for_timeout(110)
        return None
    # ---- 1. Demo mode (free play): three in the party, Justin offers; YES joins ----
    to_house(); face_justin()
    check('Justin stands in the Gregori house',E("()=>!!currentMap.npcs.find(n=>n.name==='Justin'&&n.dad)"))
    labels=talk(None); check('Justin offers YES / NOT RIGHT NOW',bool(labels) and any('YES' in l for l in labels),labels)
    pg.screenshot(path=os.path.join(SHOTS,'recruit-justin-offer.png'))
    E("()=>{ dialog.choice.sel=0; }"); pg.keyboard.press('Enter'); pg.wait_for_timeout(300); clear()
    check('Justin joined the fourth slot',ids()==['tom','grace','rose','justin'],ids())
    check('Justin follows (follower exists)',E("()=>followers.some(f=>f.member.id==='justin')"))
    check('his NPC left the room while he travels',E("()=>!currentMap.npcs.some(n=>n.name==='Justin')"))
    E("()=>{ player.x=9; player.y=9; player.move=null; placeFollowers(); camera.snap=true; }"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(SHOTS,'recruit-justin-joined.png'))
    # ---- 2. Menu tabs with Justin selected ----
    E("()=>{ openMenu(); }"); pg.wait_for_timeout(300)
    for tab in ['home','items','gear','status','stamps','saves','options']:
        for ch in range(4):
            E("(a)=>{ menuChar=a[1]; setMenuTab(a[0]); }",[tab,ch]); pg.wait_for_timeout(120)
    E("()=>{ menuChar=3; setMenuTab('status'); }"); pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(SHOTS,'recruit-justin-status.png'))
    E("()=>{ menuChar=0; setMenuTab('home'); }"); pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(SHOTS,'recruit-justin-menu.png'))
    E("()=>closeMenu()"); pg.wait_for_timeout(200)
    check('no errors opening every menu tab',not [e for e in errs if 'AudioContext' not in e and 'Failed to load' not in e],errs[:3])
    # ---- 3. A fight with Justin along: he fights in slot 4 ----
    E("()=>{ const m=allMonsters()[0]; startBattle(m,{}); }"); pg.wait_for_timeout(2500)
    fighters=E("()=>B2.active?B2.party.map(p=>p.id):null"); check('fight runs with Justin as the fourth fighter',fighters==['tom','grace','rose','justin'],fighters)
    E("()=>{ for(const f of B2.foes) f.hp=1; }")
    for i in range(40):
        if not E("()=>B2.active"): break
        if E("()=>battle.state==='command'&&B2.actor&&B2.actor.side==='party'"):
            E("()=>{ window.__LE.b2Dir('right'); }"); pg.wait_for_timeout(250); E("()=>window.__LE.b2A()"); pg.wait_for_timeout(250); E("()=>window.__LE.b2A()")
        pg.wait_for_timeout(1200)
    for i in range(80):
        if not E("()=>B2.active||dialog.active||!!transition"): break
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
    check('fight ended, Justin still in party',E("()=>!B2.active")and 'justin' in ids(),ids())
    # ---- 4. Instant-win path (overlevelled monster) hands XP to the whole party ----
    E("()=>{ const n=allMonsters()[1]||allMonsters()[0]; try{ b7InstantWin(n); }catch(e){ window.__iwErr=String(e); } }"); pg.wait_for_timeout(600)
    check('instant win with Justin along',E("()=>!window.__iwErr"),E("()=>window.__iwErr||''"))
    # ---- 5. Save and load keep Justin ----
    E("()=>saveGame('1',true)"); E("()=>{ recruitLeave(justin,true); }"); check('left quietly',ids()==['tom','grace','rose'],ids())
    check('his NPC is back at home after leaving',E("()=>!!worlds.amyhouse.npcs.find(n=>n.name==='Justin')"))
    E("()=>loadGame('1')"); pg.wait_for_timeout(800)
    check('load puts Justin back in the party',ids()==['tom','grace','rose','justin'],ids())
    check('no duplicate Justin NPC after load',E("()=>worlds.amyhouse.npcs.filter(n=>n.name==='Justin').length===0"))
    # ---- 6. Swap with Amy in the fourth slot ----
    E("()=>{ recruitLeave(justin,true); }")
    E("()=>{ const a=worlds.amyhouse.npcs.find(n=>n.name==='Amy'); recruitJoin(amy,a,true,worlds.amyhouse); }"); check('Amy in the fourth slot',ids()[-1]=='amy',ids())
    to_house(); face_justin(); labels=talk(None)
    check('with Amy along Justin still offers',bool(labels) and any('YES' in l for l in labels),labels)
    E("()=>{ dialog.choice.sel=0; }"); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    lab2=E("()=>dialog.active&&dialog.choice?dialog.choice.options.map(o=>o.label):null"); check('full party offers SWAP OUT AMY',bool(lab2) and 'SWAP OUT AMY' in lab2,lab2)
    k=lab2.index('SWAP OUT AMY'); E("(k)=>{ dialog.choice.sel=k; }",k); pg.keyboard.press('Enter'); pg.wait_for_timeout(300); clear()
    check('Amy out, Justin in',ids()==['tom','grace','rose','justin'],ids())
    check('Amy is home again',E("()=>!!worlds.amyhouse.npcs.find(n=>n.name==='Amy')"))
    # ---- 7. Chapter rules (full story mode) ----
    E("()=>{ recruitLeave(justin,true); }")
    res=E("""()=>{ const out={}; const save=[STORY.chapter,STORY.flags];
      for(const n of [1,2,3,5,7,9,10,12,15]) { STORY.chapter=n; STORY.flags={}; out[n]=canBeHere(justin); }
      STORY.chapter=5; STORY.flags={'ch5-done':true}; out['5done']=canBeHere(justin);
      STORY.chapter=10; STORY.flags={'ch10-done':true}; out['10done']=canBeHere(justin);
      STORY.chapter=save[0]; STORY.flags=save[1]; return out; }""")
    print('canBeHere(justin) in Long Island by chapter:',res)
    for n in ['1','2','3','7','9','12','15','5done','10done']: check(f'Justin may join in chapter {n} on Long Island',res[n] is True,res[n])
    for n in ['5','10']: check(f'Justin stays home in chapter {n} until its scene is over',res[n] is False,res[n])
    # in Los Angeles he cannot be in the party: join on Long Island, fly west, the party rules send him home
    E("()=>{ window.__LE.go('amyhouse'); }"); pg.wait_for_timeout(1200); clear(); face_justin(); talk('YES'); clear()
    check('joined again for the region test','justin' in ids(),ids())
    E("()=>{ window.__LE.go('jpark'); }"); pg.wait_for_timeout(1500); clear()
    E("()=>{ applyPartyRules(); }"); pg.wait_for_timeout(300)
    check('Justin goes home when the party is in Los Angeles',E("()=>!inParty(justin)")==True and E("()=>regionOf(currentMap)")=='la',ids())
    check('and he is back at his spot in the Gregori house',E("()=>!!worlds.amyhouse.npcs.find(n=>n.name==='Justin')"))
    E("()=>{ window.__LE.go('amyhouse'); }"); pg.wait_for_timeout(1200); clear()
    # Chapter 10 before its dinner: he is not offered, and an earlier recruit is sent home when the chapter starts
    E("()=>{ STORY.mode='full'; chapterJump(9); }"); pg.wait_for_timeout(1500); clear()
    E("()=>{ window.__LE.go('amyhouse'); }"); pg.wait_for_timeout(1200); clear(); face_justin(); talk('YES'); clear()
    check('Justin joins in chapter 9 (full story mode)','justin' in ids(),ids())
    E("()=>{ setChapter(10); }"); pg.wait_for_timeout(300)
    check('Justin is sent home when chapter 10 starts',E("()=>!inParty(justin)"),ids())
    check('and the real Justin NPC is back in the Gregori house',E("()=>!!worlds.amyhouse.npcs.find(n=>n.name===\'Justin\')"))
    E("()=>{ window.__LE.go('amyhouse'); }"); pg.wait_for_timeout(1200); clear(); face_justin()
    labels=talk(None); check('chapter 10 before the dinner: no offer (he is at work in the story)',labels is None,labels)
    pg.screenshot(path=os.path.join(SHOTS,'recruit-justin-ch10-no-offer.png'))
    real=[e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
    check('no console errors',not real,real[:4])
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
