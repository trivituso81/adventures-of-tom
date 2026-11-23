# Chapter 14 "The Dome" (Long Island under the dome) on Battle 3 (b3s22ch14), start to finish from the chapter-select jump: the arrival at the Rivituso door, Deedee on the porch,
# Warden Boppy at the gate, the one story fight (Boppy's Gold Armor, `warden`, a boss on Battle 3), and the melt after it. The Part 1 monsters that come back (34 `_r` rows) have no scene
# yet (the built chapter places none), so they are checked in the Lab and in tools/b3-check-s22ch14.js, not here. Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py).
# Written from tools/ch13_b3_test.py.
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch14_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(14); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=900   # the armor is a 7 round boss
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 14 scene steps themselves, the branch that plays while chapter 14 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch14/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
snap('0start')
T0=TOASTS()   # read once at the start: a scene that has run changes the flags its own conditions read
pg.evaluate("()=>playScene('ch14Open')")
check('1 the family arrives at the Rivituso door and Boppy says halt',run("()=>flag('ch14-open')===true"+QUIET,'1open',1500) is True)
snap('1door')
pg.evaluate("()=>playScene('ch14Deedee')")
check('2 Deedee on the porch: the amber scene plays',run("()=>flag('ch14-deedee')===true"+QUIET,'2deedee',1500) is True)
snap('2deedee')
pg.evaluate("()=>playScene('ch14Gate')"); pg.wait_for_timeout(800)
check('3 the gate scene and the one fight: Boppy’s Gold Armor (boss, Battle 3)',run("()=>flag('battle:warden')==='win'",'3gate',3500) is not False)
check('the fight was the armor alone',any(f['foes']==['warden'] for f in L.fights))
check('the armor fight showed the chapter 14 tips',any(f['tut']=='ch14' and any('gold armor' in t.lower() or 'Boppy' in t for t in f['tips']) for f in L.fights))
check('the fight ended in a win on Battle 3',any(f['foes']==['warden'] and f['result']=='win' and f['v3'] for f in L.fights))
check('the Battle 3 toast says the hits land on the armor, not Boppy, and no Battle 2 word',any('land on the gold armor, never on Boppy' in t for t in T0) and not any(('hitting him heals' in t or 'MAKE HIM LAUGH' in t) for t in T0))
check('the fight scene starts only one battle (the Warden)',pg.evaluate("()=>{ let n=0; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if('battle' in o) n++; if(o.then) walk(o.then); if(o.else) walk(o.else); } }; for(const k of Object.keys(SCENES)) { if(!/^ch14/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return n===1; }"))
check('4 after the fight: the gold goes soft, chapter complete',run("()=>flag('ch14-done')===true"+QUIET,'4after',2500) is True)
pg.wait_for_timeout(2500); snap('5end'); print(L.state())
L.finish(14)
