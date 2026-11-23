# Chapter 15 "The family dinner" on Battle 3 (b3s22ch15), start to finish from the chapter-select jump: the eight-seat table, HUSH-9 Final Form at the door, the one story fight
# (HUSH-9 in Front with two Hushling pods in Back, the bestiary's Windowsill Radio, a boss on Battle 3), and the after scene (the kind ending, the Hush Chip, chapter complete).
# Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch11_b3_test.py and tools/ch14_b3_test.py.
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch15_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(15); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=900   # a boss with two pods, about 6 rounds
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 15 scene steps themselves, the branch that plays while chapter 15 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch15/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
# where each foe was drawn when the fight opened (the pods must not sit behind the boss, which is drawn 2.5 times large)
pg.evaluate("()=>{ window.__lay=null; const o=b3LayoutFoes; b3LayoutFoes=function(){ const r=o.apply(this,arguments); if(!window.__lay) window.__bg=(B3.cfg&&B3.cfg.bg)||null; if(!window.__lay) window.__lay=B3.F.foes.map(f=>({id:f.id,row:f.row,px:B3P.foe[f.key].px,py:B3P.foe[f.key].py,sc:B3P.foe[f.key].sc})); return r; }; }")
T0=TOASTS()   # read once at the start: a scene that has run changes the flags its own conditions read
snap('0start')
check('1 the jump starts the dinner scene',run("()=>flag('ch15-open')==='pending'||flag('ch15-open')===true",'1open',1500) is True)
check('2 the table scene, HUSH-9 arrives, and the one fight (HUSH-9 and two pods, Battle 3)',run("()=>flag('battle:hush9final')==='win'",'2table',3500) is not False)
check('the party was Tom, Grace, Rose and Amy',any(sorted(f['party'])==['amy','grace','rose','tom'] for f in L.fights))
check('the fight opened with HUSH-9 in Front and two Hushling pods in Back',any(f['foes']==['hush9final','hushpod','hushpod'] for f in L.fights))
check('the fight ended in a win on Battle 3',any(f['foes'][:1]==['hush9final'] and f['result']=='win' and f['v3'] for f in L.fights))
check('the fight showed the chapter 15 tips (the speaker pods and the Pet Peeves)',any(f['tut']=='ch15' and any('speaker pods' in t or 'Racket or Clobber' in t for t in f['tips']) for f in L.fights))
check('the opening toast is the Battle 3 one (the pods and Racket and Clobber; no Bag, no BENCH CALL, no PULL UP A CHAIR)',
      any('speaker pods' in t and 'Racket and Clobber' in t for t in T0) and not any('BENCH CALL' in t or '▼ Bag' in t or 'PULL UP A CHAIR' in t for t in T0 if 'speaker pods' in t))
lay=pg.evaluate("()=>window.__lay")
check('the fight is drawn on the dining room picture, not the pond',pg.evaluate("()=>window.__bg==='dinner'"))
check('the pods are drawn in the gap in front of HUSH-9, not behind it (left of the family, in front of the boss)',bool(lay) and all(p['px']>boss['px']-1 and p['py']!=boss['py'] for boss in [l for l in lay if l['id']=='hush9final'] for p in lay if p['id']=='hushpod') and len([l for l in lay if l['id']=='hushpod'])==2)
check('the fight is one battle step (HUSH-9), in the retry scene and spread into the opening scene, so two in all',pg.evaluate("()=>{ let n=0; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if('battle' in o) n++; if(o.then) walk(o.then); if(o.else) walk(o.else); } }; for(const k of Object.keys(SCENES)) { if(!/^ch15/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return n===2; }"))
check('the boss win set the kind flag (the kind ending plays after it)',pg.evaluate("()=>!!flag('kind:hush9final')"))
check('3 after the fight: the chip cracks, Vance’s message, the Hush Chip, chapter complete',run("()=>flag('ch15-done')===true"+QUIET,'3after',2500) is True)
check('the Family Finish toast is the Battle 3 Tombo skin one (Fifty-One Years & Counting, Full Family Ruckus)',any('Tombo skin: Fifty-One Years' in t and 'Full Family Ruckus' in t for t in TOASTS()))
check('the Fifty-One Years & Counting Tombo flag is set',pg.evaluate("()=>!!flag('tombo:ff3')"))
pg.wait_for_timeout(2500); snap('4end'); print(L.state())
L.finish(15)
