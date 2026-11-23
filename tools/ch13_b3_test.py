# Chapter 13 "The Sub-Rail" on Battle 3 (b3s22ch13), start to finish from the chapter-select jump: Sol at the cab stand, the depot, a tunnel fight (an Elite with a Hexer),
# HUSH-9, the Dual-Coast Drill Worm (boss, with its Wired Relay Hushling), the melt, Boppy at the gate. The Gold Knight has no scene yet (data only, built for chapter 14), so he
# is checked in the Lab and in tools/b3-check-s22ch13.js, not here. Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch11_b3_test.py.
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch13_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(13); run=L.run; check=L.check; at=L.at; snap=L.snap
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 13 scene steps themselves, the branch that plays while chapter 13 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch13/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
check('starts at the cab stand',pg.evaluate("()=>currentMap.id")=='lacab'); snap('0cab')
pg.evaluate("()=>playScene('ch13Open')")
check('1 Sol sends the family down: the depot, TNB and Nara join',run("()=>flag('ch13-open')===true"+QUIET,'1open',1500) is True and pg.evaluate("()=>currentMap.id")=='subdepot')
check('the party is Tom, Amy, TNB and Nara (the four the Lab fights use)',pg.evaluate("()=>['amy','tnb','nara'].every(id=>party.some(p=>p.id===id))"))
snap('1depot')
pg.evaluate("()=>playScene('ch13Depot')")
check('2 the depot scene plays',run("()=>flag('ch13-depot')===true"+QUIET,'2depot',1500) is True)
at('subtunnel',10,10); snap('3tunnel')
check('the tunnel monsters are in the world (Hushling, Signal Fault, Turnstile Grump)',pg.evaluate("()=>['hushling','signalfault','turnstile'].every(id=>!!findMonster(id))"))
check('every monster of the tunnel has a Battle 3 fight',pg.evaluate("()=>CH13_TUNNEL_SPOTS.every(s=>!!B3_FORMATIONS[s[0]])"))
# a map monster of the tunnel: the Signal Fault (Elite, with a Hushling in Back)
# (the tunnel's monsters drift and do not notice a person three tiles away, so the fight is started the way the map starts it: startBattle on the monster)
at('subtunnel',11,3,'right'); pg.evaluate("()=>startBattle(findMonster('signalfault'))"); pg.wait_for_timeout(1500)
check('3 the Signal Fault (Elite, Battle 3)',run("()=>!battle.active&&B3.result==='win'"+QUIET,'3signal',60) is True)   # a map monster sets no battle: flag, so the stop is the fight's own result
check('the Signal Fault fight had its Hushling in Back',any(f['foes']==['signalfault','hushling'] for f in L.fights))
# HUSH-9 and the Drill Worm: the scenes start the boss fight
pg.evaluate("()=>{ currentMap=worlds['subtunnel']; player.x=22; player.y=5; player.move=null; placeFollowers(); storyWorld(); }"); pg.wait_for_timeout(600)
pg.evaluate("()=>playScene('ch13Hush')")
check('4 HUSH-9 debuts',run("()=>flag('ch13-hush')===true"+QUIET,'4hush',1500) is True)
at('subchamber',6,6,'right'); snap('5chamber')
pg.evaluate("()=>playScene('ch13Worm')"); pg.wait_for_timeout(800)
check('5 the Drill Worm rises, the boss fight (Battle 3)',run("()=>flag('battle:drillworm')==='win'",'5boss',2500) is not False)
check('the Drill Worm fight started with the Worm in Front and a Wired Relay Hushling in Back',any(f['foes']==['drillworm','relayhushling'] for f in L.fights))
check('the Drill Worm fight showed the chapter 13 tips (the helper link tip among them)',any(f['tag']=='5boss' and any('Wired Relay Hushling' in t for t in f['tips']) for f in L.fights) or any(f['tut']=='ch13' for f in L.fights))
check('the Battle 3 toasts name the helper link, not Chatter, Kinetic or TAKE FIVE',any('takes 25% less damage while a Wired Relay Hushling stands' in t for t in TOASTS()) and any('Wired Relay Hushling in Back shields it' in t for t in TOASTS()) and not any(('▼ Bag' in t and 'TAKE FIVE' in t) for t in TOASTS() if 'Wired Relay' in t))
check('the Gold Knight is in no chapter 13 scene (his fight waits for a scene card)',pg.evaluate("()=>{ let hit=false; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.battle==='goldknight') hit=true; if(o.then) walk(o.then); if(o.else) walk(o.else); } }; for(const k of Object.keys(SCENES)) { if(!/^ch13/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return !hit; }"))
check('6 after the boss: the melt, Boppy at the gate, chapter complete',run("()=>flag('ch13-done')===true"+QUIET,'6after',2500) is True)
check('the doorway is open (the melt)',pg.evaluate("()=>flag('ch13-melted')===true"))
pg.wait_for_timeout(2500); snap('7end'); print(L.state())
L.finish(13)
