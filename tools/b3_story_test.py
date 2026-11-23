#!/usr/bin/env python3
"""Battle 3 in the story, stage 15 (b3s15): the switch, the router, a story fight end to end, saves, migration, late joiners, OLD.
Run from the repo root: python3 tools/b3_story_test.py     (needs Chrome: CHROME=/usr/bin/google-chrome if it is not found)
What it checks, in a browser (the rules are checked by `node tools/b3-sim.js check`, tools/b3-check-s15.js):
  1. The ADMIN switch (admin.html) has Old, By chapter and New, the choice is kept on the phone, and By chapter is the default.
  2. The router: By chapter sends chapter 1 map monsters and the story's {battle} step to Battle 3, chapter 2 to battle 2; Old sends
     everything to battle 2; New sends chapter 2 monsters that Battle 3 knows to Battle 3. Nothing but the one door changed.
  3. A story fight on Battle 3 (the scene's three Mudlings, through the real {battle} step): its tips show in the message line and
     use no battle 2 words; the fight has no Warmth bar, no WARMTH command and no HEART; HP carries in as each member's own share; a win
     pays XP, coins and Vibe Points to everyone (bench too), shows the victory card with a VP line per person, removes the monster, sets
     the flag battle:mudling and writes HP back; the Ruckus gauge carries to the next fight and sits in the save (`b3.ruckus`).
  4. A loss writes the loss flag for a boss, leaves everyone at 1 HP and starts no Vibe Points.
  5. Migration: Level floors only where Battle 3 plays and never lowering a level; a pool of 135 per chapter finished, split 2/3 and 1/3
     with overflow; running it twice changes nothing more.
  6. Late joiners: no loadout before the story brings them in; made on arrival from the pool of that moment; a save from before this
     stage with a stale empty record for TNB drops it on load.
  7. An old save (no `b3` field) loads, with the gauge at 0 and floors applied; a new save loads with the switch on Old and chapter 1
     plays on battle 2.
Frames: tools/shots/b3s15-*.png (start, tip, card, landscape start and card, admin).
"""
import threading, http.server, socketserver, functools, os, sys, json, io
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]; errs=[]
def check(name,ok,extra=''):
    print(('ok   ' if ok else 'FAIL ')+name+(' '+str(extra) if (extra and not ok) else ''),flush=True)
    if not ok: fails.append(name)
def real(es): return [e for e in es if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]
def ev(pg,js,arg=None): return pg.evaluate(js,arg) if arg is not None else pg.evaluate(js)
def shot(pg,name): pg.screenshot(path=os.path.join(OUT,'b3s15-'+name+'.png'))
def boot(br,w=430,h=860):
    pg=br.new_page(viewport={'width':w,'height':h})
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3sMode',timeout=180000); pg.wait_for_timeout(1500)
    ev(pg,"()=>{ B7.speed=1; splash.active=false; document.getElementById('splash').hidden=true; }")
    return pg
def fresh(pg,chapter=1,mode='chapter',map='hollow'):
    ev(pg,"([c,m,mp])=>{ localStorage.setItem('aot-b3-story',m); resetStory('full',c); b3sFresh(); currentMap=worlds[mp]; for(const m of ALL_MEMBERS()) m.hp=m.maxHp; for(const w of Object.values(worlds)) if(w.fallen&&w.fallen.length) w.npcs.push(...w.fallen.splice(0)); }",[chapter,mode,map])
def mon(pg,name='mudling',key='__m'):
    return ev(pg,"([n,k])=>{ window[k]=findMonster(n); return !!window[k]; }",[name,key])
def stop_all(pg):
    ev(pg,"()=>{ if(battle.v3&&B3.active) b3End('run'); else if(B2.active) b2End('run'); }"); pg.wait_for_timeout(300)
def play_auto(pg,limit=150):
    ev(pg,"()=>{ B3.cfg.auto=true; if(B3.ui==='deck'&&B3.actor){ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); } }")
    for i in range(limit):
        if ev(pg,"()=>B3.ui==='done'"): return True
        pg.wait_for_timeout(1000)
    return False
def kinds(pg): return ev(pg,"()=>({v3:!!battle.v3,b3:!!B3.active,b2:!!B2.active,ui3:getComputedStyle(document.getElementById('b3-app')).display!=='contents'&&document.getElementById('b3-app').getBoundingClientRect().width>0,ui2:!document.getElementById('b2-ui').hidden})")

with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path=os.environ.get('CHROME') or '/usr/bin/google-chrome',args=['--headless=new','--no-proxy-server','--no-sandbox'])

    # ---- 1. the ADMIN switch
    ap=br.new_page(viewport={'width':390,'height':844}); ap.on('pageerror',lambda e: errs.append(str(e)))
    ap.goto(f'http://127.0.0.1:{port}/admin.html'); ap.wait_for_timeout(600)
    txt=ap.inner_text('#b-story-battles')
    check('admin: the Story battles card has Old, By chapter and New',all(w in txt for w in('Old','By chapter','New')))
    check('admin: By chapter is lit by default',ap.evaluate("document.getElementById('b3s-chapter').classList.contains('on')"))
    ap.click('#b3s-old'); ap.wait_for_timeout(200)
    check('admin: Old is kept on the phone',ap.evaluate("localStorage.getItem('aot-b3-story')")=='old' and ap.evaluate("document.getElementById('b3s-old').classList.contains('on')"))
    ap.click('#b3s-new'); ap.wait_for_timeout(200)
    check('admin: New is kept on the phone',ap.evaluate("localStorage.getItem('aot-b3-story')")=='new')
    ap.click('#b3s-chapter'); ap.wait_for_timeout(200); shot(ap,'admin'); ap.close()

    pg=boot(br)
    ev(pg,"()=>localStorage.removeItem('aot-b3-story')")
    check('default setting is By chapter',ev(pg,"()=>b3sMode()")=='chapter')
    check('By chapter: the chapters on the list are on (11, 12, 13, 14, 15, 16, 17, 18 and 19 too), chapter 20 is off',ev(pg,"()=>[b3sChapterOn(1),b3sChapterOn(2),b3sChapterOn(6),b3sChapterOn(10),b3sChapterOn(11),b3sChapterOn(12),b3sChapterOn(13),b3sChapterOn(14),b3sChapterOn(15),b3sChapterOn(16),b3sChapterOn(17),b3sChapterOn(18),b3sChapterOn(19),b3sChapterOn(20)]")==[True,True,True,True,True,True,True,True,True,True,True,True,True,False])
    check('Old: nothing on',ev(pg,"()=>{ b3sSetMode('old'); return [b3sChapterOn(1),b3sChapterOn(2),b3sChapterOn(5)]; }")==[False,False,False])
    check('New: everything on',ev(pg,"()=>{ b3sSetMode('new'); const r=[b3sChapterOn(1),b3sChapterOn(7)]; b3sSetMode('chapter'); return r; }")==[True,True])
    check('a bad setting falls back to By chapter',ev(pg,"()=>{ localStorage.setItem('aot-b3-story','zzz'); return b3sMode(); }")=='chapter')

    # ---- 2. the router
    fresh(pg,1,'chapter'); mon(pg,'mudling')
    ev(pg,"()=>startBattle(window.__m)"); pg.wait_for_timeout(1500)
    k=kinds(pg); check('chapter 1, By chapter: a map monster fights on Battle 3',k['v3'] and k['b3'] and not k['b2'] and k['ui3'] and not k['ui2'],k)
    check('the monster is the Mudling formation (2 Mudlings)',ev(pg,"()=>B3.F.foes.map(f=>f.id).join(',')")=='mudling,mudling')
    stop_all(pg)
    fresh(pg,20,'chapter'); ev(pg,"()=>{ currentMap=worlds.hollow; }"); mon(pg,'mudling')
    ev(pg,"()=>startBattle(window.__m)"); pg.wait_for_timeout(1500)
    k=kinds(pg); check('chapter 20, By chapter: the same monster fights on battle 2 (chapter 20 is not switched yet; the bonus chapter is switched, tools/ns_b3_test.py)',k['b2'] and not k['v3'] and k['ui2'] and not k['ui3'],k)
    stop_all(pg)
    fresh(pg,1,'old'); mon(pg,'mudling'); ev(pg,"()=>startBattle(window.__m)"); pg.wait_for_timeout(1500)
    k=kinds(pg); check('chapter 1, Old: battle 2',k['b2'] and not k['v3'],k); stop_all(pg)
    fresh(pg,20,'new'); mon(pg,'mudling'); ev(pg,"()=>startBattle(window.__m)"); pg.wait_for_timeout(1500)
    k=kinds(pg); check('chapter 20, New: Battle 3 wherever it has the fight',k['v3'] and not k['b2'],k); stop_all(pg)
    fresh(pg,1,'chapter','hollow'); ev(pg,"()=>{ STORY.mode='demo'; }"); mon(pg,'mudling'); ev(pg,"()=>startBattle(window.__m)"); pg.wait_for_timeout(1500)
    k=kinds(pg); check('the demo (not the full game) always uses battle 2',k['b2'] and not k['v3'],k); stop_all(pg)

    # ---- 3. a story fight end to end, through the story's own {battle} step
    fresh(pg,1,'chapter'); mon(pg,'mudling')
    ev(pg,"()=>{ const r=memberById('rose'); r.hp=Math.round(r.maxHp*.5); window.__coins=coins; window.__xp=party.map(p=>b6Total(p)); playScene([{battle:'mudling',tut:'basics',count:3}]); }")
    pg.wait_for_function("()=>battle.v3&&B3.active&&B3.F",timeout=30000); pg.wait_for_timeout(3500)
    shot(pg,'start-portrait')
    st=ev(pg,"()=>({foes:B3.F.foes.map(f=>f.name).join(','),rose:(()=>{const u=B3.F.party.find(p=>p.id==='rose');return u.hp/u.maxHp;})(),tom:(()=>{const u=B3.F.party.find(p=>p.id==='tom');return u.hp/u.maxHp;})()})")
    check('the scene fight is three Mudlings',st['foes']=='Mudling A,Mudling B,Mudling C',st)
    check('HP carries in as each member\'s own share (Rose half, Tom full)',abs(st['rose']-.5)<.03 and st['tom']>.97,st)
    body=ev(pg,"()=>document.getElementById('battle').innerText")
    check('no WARMTH command, no Warmth bar, no HEART meter on the screen',not any(w in body.upper() for w in('WARMTH','HEART')),body[:200])
    check('the deck has the Basic first and the Pep and RUCKUS meters',ev(pg,"()=>B3.deck[0].grp==='basic'&&!!document.getElementById('b3-pepm')&&!!document.getElementById('b3-rkm')"))
    # play a few turns by hand and read the tips
    tips=[]
    def hand_turns(n):
        for i in range(n):
            pg.wait_for_function("()=>battle.state==='command'&&B3.actor&&B3.ui==='deck'||B3.ui==='done'",timeout=60000)
            if ev(pg,"()=>B3.ui==='done'"): return
            msg=ev(pg,"()=>document.getElementById('b3-msg').textContent"); tips.append((ev(pg,"()=>B3.actor.id"),msg))
            pg.keyboard.press('Enter'); pg.wait_for_timeout(250)   # the deck opens on the Basic, aimed at the front monster
            pg.wait_for_timeout(1200)
    hand_turns(4)
    shot(pg,'tip-portrait')
    seen=[t for a,t in tips if t in [x['text'] for x in ev(pg,"()=>B3_STORY.tips.basics")]]
    check('a Basics tip showed in the message line',len(seen)>=1,tips)
    check('no tip uses a battle 2 word',not any(any(w in t.lower() for w in('warmth','heart','tombo','raspberry')) for a,t in tips),tips)
    check('each tip shows once',len(seen)==len(set(seen)),seen)
    ok=play_auto(pg); check('the fight was won',ok and ev(pg,"()=>B3.F.over")=='win')
    check('the win screen names the Vibe Points',ev(pg,"()=>B3.won")=='+15 Vibe Points.')
    ev(pg,"()=>b3Pick(0)"); pg.wait_for_timeout(1800)
    card=ev(pg,"()=>{const c=document.getElementById('b7-card');return c&&!c.hidden?c.innerText:'';}")
    shot(pg,'card-portrait')
    check('the victory card shows, with XP, coins, a VP line per person and the Ruckus',all(w in card for w in('VICTORY','XP','Pocket Coins','+15 VP','Combos')) and card.count('+15 VP')==3,card)
    check('the card has no HEART line',('HEART' not in card.upper()),card)
    ev(pg,"()=>b7CloseCard(true)"); pg.wait_for_timeout(800)
    r=ev(pg,"""()=>({active:battle.active,v3:battle.v3,result:B2.result,flag:flag('battle:mudling'),
      xp:party.map((p,i)=>b6Total(p)-window.__xp[i]),coins:coins-window.__coins,gone:!currentMap.npcs.includes(window.__m),
      vp:Object.fromEntries(ALL_MEMBERS().filter(m=>m.vibes).map(m=>[m.id,Object.values(m.vibes.vp).reduce((a,b)=>a+b,0)])),
      main:Object.fromEntries(ALL_MEMBERS().filter(m=>m.vibes).map(m=>[m.id,m.vibes.vp[m.vibes.main]])),ruck:B3S.ruckus,
      rose:(()=>{const m=memberById('rose');return m.hp/m.maxHp;})()})""")
    check('the fight is closed and battle 2 is not running',not r['active'] and not r['v3'])
    check('the story step read the result: B2.result win and flag battle:mudling win',r['result']=='win' and r['flag']=='win',r)
    check('everyone in the party got XP and coins were paid',all(x>0 for x in r['xp']) and r['coins']>0,r)
    check('the monster left the map',r['gone'])
    check('everyone with a loadout earned Vibe Points, the bench too (Main +15, Pocket +8)',len(r['vp'])>=7 and all(v==23 for v in r['vp'].values()) and all(v==15 for v in r['main'].values()),r)
    check('Rose\'s HP went back to a share of her own Max HP',0<r['rose']<=1,r)
    ruck=r['ruck']; check('the Ruckus gauge carried out of the fight',ruck>0,r)
    snap=ev(pg,"()=>saveSnapshot().b3")
    check('the save has the gauge: b3.ruckus',snap['v']==1 and snap['ruckus']==round(ruck),snap)
    ev(pg,"()=>{ saveGame('1'); B3S.ruckus=0; }"); ev(pg,"()=>loadGame('1')"); pg.wait_for_timeout(500)
    check('loading the save brings the gauge back',ev(pg,"()=>B3S.ruckus")==round(ruck))
    mon(pg,'skeeter','__m2') or None
    ev(pg,"()=>{ currentMap=worlds.hollow; const m=findMonster('skeeter')||findMonster('grump')||findMonster('mudling'); window.__m3=m; startBattle(m); }"); pg.wait_for_timeout(2500)
    check('the next fight starts with the carried gauge',ev(pg,"()=>Math.round(B3.F.ruckus)")==round(ruck),ev(pg,"()=>B3.F.ruckus"))
    stop_all(pg)

    # ---- 4. a loss, and the boss flag
    fresh(pg,1,'chapter','hollow'); mon(pg,'bigone')
    ev(pg,"()=>startBattle(window.__m)"); pg.wait_for_timeout(2000)
    check('the Big One starts as its own formation',ev(pg,"()=>B3.F.foes.map(f=>f.id).join(',')")=='bigone')
    vp0=0
    ev(pg,"()=>{ B3.F.over='lose'; b3Finish(); }"); pg.wait_for_timeout(300)
    ev(pg,"()=>b3Pick(0)"); pg.wait_for_timeout(500)
    r=ev(pg,"()=>({result:B2.result,flag:flag('battle:bigone'),hp:party.map(p=>p.hp),vp:ALL_MEMBERS().filter(m=>m.vibes).reduce((a,m)=>a+Object.values(m.vibes.vp).reduce((x,y)=>x+y,0),0),active:battle.active})")
    check('a loss: result lose, boss flag lose, everyone at 1 HP, no Vibe Points, fight closed',r['result']=='lose' and r['flag']=='lose' and all(h==1 for h in r['hp']) and r['vp']==vp0 and not r['active'],r)

    # ---- 5. migration
    fresh(pg,20,'chapter','hollow')
    ev(pg,"()=>{ memberById('tom').level=1; b3sMigrate(20); }")
    m=ev(pg,"()=>({lv:ALL_MEMBERS().map(m=>m.id+':'+m.level).join(' '),tom:memberById('tom').vibes.vp,deedee:memberById('deedee').vibes.vp,tnb:!!memberById('tnb').vibes})")
    check('By chapter at chapter 20: a pool of 2565 (19 chapters done), 800 to the first Sig Vibe (capped) and 800 to the second (capped too)',m['tom']['tom_flier']==800 and m['tom']['tom_gamer']==800 and m['deedee']['deedee_neat']==800,m)
    check('By chapter at chapter 20: no level is raised (battle 2 plays chapter 20)',' tom:1' in (' '+m['lv']),m)
    ev(pg,"()=>{ b3sMigrate(20); }")
    check('running it again changes nothing',ev(pg,"()=>memberById('tom').vibes.vp.tom_flier")==800)
    ev(pg,"()=>{ b3sSetMode('new'); memberById('grace').level=49; b3sMigrate(20); }")
    lv=ev(pg,"()=>({tom:memberById('tom').level,grace:memberById('grace').level,hp:memberById('tom').hp===memberById('tom').maxHp})")
    check('New at chapter 20: Level floor 47 (the last on the list, set by chapter 19) is applied, and a higher level is never lowered',lv['tom']==47 and lv['grace']==49,lv)
    ev(pg,"()=>{ b3sSetMode('chapter'); resetStory('full',20); b3sFresh(); b3sMigrate(20); }")
    big=ev(pg,"()=>memberById('tom').vibes.vp")
    check('chapter 20: the pool overflows (2565): both Vibes cap at 800',big['tom_flier']==800 and big['tom_gamer']==800,big)

    # ---- 6. late joiners
    fresh(pg,3,'chapter','hollow'); ev(pg,"()=>b3sMigrate&&b3sMigrate(3)")
    pre=ev(pg,"()=>({tnb:memberById('tnb').vibes||null,nara:memberById('nara').vibes||null,boppy:memberById('boppy').vibes||null,load:b3MemberLoadout(memberById('tnb')),saved:saveSnapshot().members.filter(m=>['tnb','nara','boppy'].includes(m.id)&&m.vibes).length})")
    check('before the story brings them in, TNB, Nara and Boppy have no loadout and none is saved',pre['tnb'] is None and pre['nara'] is None and pre['boppy'] is None and pre['load'] is None and pre['saved']==0,pre)
    ev(pg,"()=>{ const t=memberById('tnb'); if(!forceJoin(t,true)) party.push(t); }")
    post=ev(pg,"()=>{ const L=memberById('tnb').vibes; const top=Math.max(...ALL_MEMBERS().filter(m=>m.vibes&&m.id!=='tnb').map(m=>Object.values(m.vibes.vp).reduce((a,b)=>a+b,0))); return {has:!!L,pool:L&&L.pool&&L.pool.total,top,set:L&&L.pool&&L.pool.set}; }")
    check('when the story brings TNB in his loadout is made, with the pool of that moment (the most VP any one member holds)',post['has'] and post['pool']==post['top'] and post['pool']>0 and post['set'] is False,post)
    ev(pg,"()=>{ saveGame('2'); }"); sv=ev(pg,"()=>JSON.parse(localStorage.getItem('aot-save-2')||'null')")
    check('the save keeps his loadout with the pool',any(m['id']=='tnb' and m.get('vibes') for m in (sv or {}).get('members',[])),'')

    # ---- 7. old save, new save with OLD
    ev(pg,"""()=>{ const sv=JSON.parse(localStorage.getItem('aot-save-2')); delete sv.b3;
      for(const m of sv.members) if(m.id==='nara') m.vibes={main:'nara_pup',pocket:'nara_guard',quirks:[null,null],vp:{nara_pup:0,nara_guard:0},pool:{total:0,set:false}};
      for(const m of sv.members) if(m.id==='tom') delete m.vibes;
      localStorage.setItem('aot-save-2',JSON.stringify(sv)); B3S.ruckus=77; }""")
    ok=ev(pg,"()=>loadGame('2')"); pg.wait_for_timeout(500)
    o=ev(pg,"()=>({ruck:B3S.ruckus,nara:memberById('nara').vibes||null,tom:!!memberById('tom').vibes,tnb:!!memberById('tnb').vibes,ch:STORY.chapter})")
    check('an old save (no b3 field, no Vibes for Tom, a stale empty record for Nara) loads',ok is not False and o['ruck']==0 and o['tom'] and o['nara'] is None and o['tnb'],o)
    ev(pg,"()=>{ saveGame('3'); b3sSetMode('old'); loadGame('3'); currentMap=worlds.hollow; }"); pg.wait_for_timeout(400)
    fresh(pg,1,'old'); mon(pg,'mudling'); ev(pg,"()=>playScene([{battle:'mudling',tut:'basics',count:3}])")
    for _ in range(30):
        pg.wait_for_timeout(1000)
        if ev(pg,"()=>!!B2.active||!!B3.active"): break
    k=kinds(pg); k.update(ev(pg,"()=>({m:!!window.__m,intro:intro.active,dlg:dialog.active,mode:STORY.mode,ch:STORY.chapter,bm:b3sMode(),mp:currentMap.id})")); check('a save made on Battle 3 loads with the switch on Old, and chapter 1\'s scene fight plays on battle 2',k['b2'] and not k['v3'] and ev(pg,"()=>B2.foes.length")==3,k)
    shot(pg,'old-fight')
    stop_all(pg)
    ev(pg,"()=>{ B2.result='win'; }")

    # ---- landscape frames
    fresh(pg,1,'chapter'); mon(pg,'bigone'); ev(pg,"()=>{ toggleLayout(); startBattle(window.__m); }"); pg.wait_for_timeout(4000)
    shot(pg,'start-landscape')
    ev(pg,"()=>{ B3.cfg.auto=true; for(const f of B3.F.foes) f.hp=1; if(B3.ui==='deck'&&B3.actor){ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); } }")
    for i in range(150):
        if ev(pg,"()=>B3.ui==='done'"): break
        pg.wait_for_timeout(1000)
    check('landscape: the Big One fight reaches its win screen',ev(pg,"()=>B3.F.over")=='win',ev(pg,"()=>({ui:B3.ui,over:B3.F.over,round:B3.F.round,foes:B3.F.foes.map(f=>f.hp),party:B3.F.party.map(p=>p.hp),state:battle.state,active:B3.active})"))
    ev(pg,"()=>b3Pick(0)"); pg.wait_for_timeout(1800); shot(pg,'card-landscape')
    card=ev(pg,"()=>{const c=document.getElementById('b7-card');return c&&!c.hidden?c.innerText:'';}")
    check('landscape: the card shows +30 VP lines',card.count('+30 VP')>=3,card)
    ev(pg,"()=>b7CloseCard(true)"); pg.wait_for_timeout(600)
    check('the boss win sets battle:bigone win',ev(pg,"()=>flag('battle:bigone')")=='win')
    ev(pg,"()=>toggleLayout()")
    bad=real(errs); check('no page errors',not bad,bad[:5])
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
