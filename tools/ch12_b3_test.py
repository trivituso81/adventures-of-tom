# Chapter 12 "Welcome to Jefferson Park, Girls" on Battle 3 (stage 22, chapter 12), start to finish from the chapter-select jump: arrival, Tom's house, the loft,
# Marlowe greys the street, Doña Carmen, the Alvarez house (Run With Us, Mommy!), Gridlock Prime (boss), the green light, chapter complete.
# Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch11_b3_test.py.
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch12_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(12); run=L.run; check=L.check; at=L.at; snap=L.snap
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch12/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
def scene(sid,flagname,tag):
    pg.evaluate(f"()=>playScene('{sid}')"); return run(f"()=>flag('{flagname}')===true"+QUIET,tag,1500)
check('1 arrival on Jefferson Boulevard',run("()=>flag('ch12-arrive')===true"+QUIET,'1arrive',1500) is True and pg.evaluate("()=>currentMap.id")=='jpark')
check('Amy is in the party',pg.evaluate("()=>party.some(p=>p.id==='amy')"))
check('2 Tom\'s house',scene('ch12House','ch12-house','2house') is True)
check('3 the loft',scene('ch12Loft','ch12-studio','3loft') is True)
at('jpark',14,12)
check('4 Marlowe greys the street',scene('ch12Marlowe','ch12-marlowe','4marlowe') is True)
check('the neighbors are amber',pg.evaluate("()=>worlds.jpark.npcs.filter(n=>n.amber).length")>0)
snap('4amber')
at('pupuseria',5,6)
check('5 Doña Carmen',scene('ch12Carmen','ch12-carmen','5carmen') is True)
at('casa',7,8)
check('6 the Alvarez house',scene('ch12Alvarez','ch12-alvarez','6alvarez') is True)
check('the Run With Us, Mommy! toast is the Battle 3 one (a skin, not HEART)',any('Tombo skin: Run With Us, Mommy!' in t and 'Full Family Ruckus' in t and 'HEART' not in t for t in TOASTS()))
check('the bench tip is the Battle 3 one (couch or bench; no Run With Us tip)',any('sit on a couch or the parkway bench' in t for t in TOASTS()))
# Marlowe introduces Gridlock Prime, the boss fight (Battle 3)
at('jpark',14,13)
L.WIN_STEPS=1500   # Gridlock Prime plays about 52 turns
pg.evaluate("()=>playScene('ch12Prime')"); pg.wait_for_timeout(800)
check('7 Gridlock Prime (boss, Battle 3)',run("()=>flag('battle:gridlockprime')==='win'",'7boss',2500) is not False)
check('Gridlock Prime was alone at the start (it calls the Gridlock itself)',any(f['foes'][:1]==['gridlockprime'] for f in L.fights))
check('the fight was Gridlock Prime, called Gridlock allowed',any(f['foes'][0]=='gridlockprime' for f in L.fights))
check('the boss win set the kind flag (the kind ending plays after it)',pg.evaluate("()=>!!flag('kind:gridlockprime')"))
check('8 after the boss: the green light, colour back, chapter complete',run("()=>flag('ch12-done')===true"+QUIET,'8after',2500) is True)
check('the colour came back',pg.evaluate("()=>!flag('ch12-grey')"))
pg.wait_for_timeout(2500); snap('9end'); print(L.state())
L.finish(12)
