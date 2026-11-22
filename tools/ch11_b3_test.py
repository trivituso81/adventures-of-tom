# Chapter 11 "The Layover Between Worlds" on Battle 3 (b3s22a), start to finish from the chapter-select jump: the house, Flight Zero, Gate 00, the concourse,
# the Standby Sprite (Elite), TNB and Nara arriving, the gold bench swap, Julian Vance at Gate Infinity, FINAL CALL (boss), coin nine, LONG ISLAND: CLOSED.
# Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch5_b3_test.py.
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch11_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(11); run=L.run; check=L.check; at=L.at; snap=L.snap
# Scene toasts are silent in the engine (a scene's toast step shows nothing), so the Battle 3 wording of a toast is read from the chapter 11 scene steps themselves, the branch that plays while chapter 11 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch11/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
check('1 the house, Flight Zero and Gate 00 play',run("()=>flag('ch11-gate00')===true"+QUIET,'1opening',1500) is True)
check('Amy joined the party on the plane',pg.evaluate("()=>party.some(p=>p.id==='amy')"))
L.go('concourse')
check('2 the concourse',run("()=>flag('ch11-conc')===true"+QUIET,'2conc',1500) is True)
check('map monsters of the concourse are in the world (Lost Luggage, Red-Eye, the Standby Sprite, FINAL CALL)',pg.evaluate("()=>['lostluggage','redeye','standbysprite','finalcall'].every(id=>!!findMonster(id))"))
at('concourse',21,12)
check('3 the Standby Sprite (Elite, Battle 3)',run("()=>flag('battle:standbysprite')==='win'&&flag('ch11-stby')===true"+QUIET,'3stby',2500) is True)
check('the Standby Sprite fight had its Elite: Standby Sprite in Front, Red-Eye in Back',any(f['foes']==['standbysprite','redeye'] for f in L.fights))
at('concourse',33,10)
check('4 TNB and Nara arrive',run("()=>flag('ch11-met')===true"+QUIET,'4meet',1500) is True)
check('the Sleepover toast names the skin and the Full Family Ruckus, not HEART',any('Sleepover at Tom' in t and 'Full Family Ruckus' in t and 'HEART' not in t for t in TOASTS()))
check('TNB and Nara waited on the bench',pg.evaluate("()=>benchIds().includes('tnb')&&benchIds().includes('nara')"))
# one swap at a gold bench: TNB takes Amy's place, then Amy comes back, so the fight is the usual four and each is a real fighter
check('bench swap works with the kits (TNB in, then back)',pg.evaluate("()=>{ const M=MEMBERS(); const a=benchSwap(M.tnb,M.amy); const inP=party.some(p=>p.id==='tnb'); const f=b3sFighters().map(p=>p.id); const b=benchSwap(M.amy,M.tnb); return a&&inP&&f.length===4&&b&&party.some(p=>p.id==='amy')&&!party.some(p=>p.id==='tnb'); }"))
snap('4bench')
# Julian Vance at Gate Infinity, then the boss (the scene starts the fight)
pg.evaluate("()=>{ currentMap=worlds['concourse']; player.x=35; player.y=9; player.move=null; placeFollowers(); storyWorld(); }"); pg.wait_for_timeout(600)
pg.evaluate("()=>playScene('ch11Vance')"); pg.wait_for_timeout(800)
check('5 Julian Vance, FINAL CALL steps out, the boss fight (Battle 3)',run("()=>flag('battle:finalcall')==='win'",'5boss',2500) is not False)
check('the bench tip is the Battle 3 one (sit on a gold bench; no Bag, no BENCH CALL)',any('gold Boarding Gate bench' in t for t in TOASTS()) and not any('BENCH CALL' in t or '▼ Bag' in t for t in TOASTS()))
check('the boss win set the kind flag (the kind ending plays after it)',pg.evaluate("()=>!!flag('kind:finalcall')"))
check('FINAL CALL was the only monster at the start (it calls Lost Luggage itself)',any(f['foes'][:1]==['finalcall'] for f in L.fights))
check('6 after the boss: coin nine, LONG ISLAND: CLOSED, chapter complete',run("()=>flag('ch11-done')===true"+QUIET,'6after',2500) is True)
check('Long Island closed (the dome goes amber)',pg.evaluate("()=>flag('ch11-closed')===true"))
pg.wait_for_timeout(2500); snap('7end'); print(L.state())
L.finish(11)
