# Chapter 16 "The town square" on Battle 3 (b3s22ch16), start to finish from the chapter-select jump: the family photograph, the stone parents, Marlowe at the camera, the one story
# fight (Marlowe in Front with two Grey Notes in Back, the bestiary's Square's Sign, a boss on Battle 3, no kind route), the silent end and the after scene (the snow globe, chapter complete).
# Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch11_b3_test.py and tools/ch15_b3_test.py.
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch16_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(16); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=900   # a boss with two helpers, about 7 rounds
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 16 scene steps themselves, the branch that plays while chapter 16 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch16/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
# where each foe was drawn when the fight opened (the Grey Notes must not sit behind Marlowe, who is drawn 2.5 times large)
pg.evaluate("()=>{ window.__lay=null; const o=b3LayoutFoes; b3LayoutFoes=function(){ const r=o.apply(this,arguments); if(!window.__lay) window.__bg=(B3.cfg&&B3.cfg.bg)||null; if(!window.__lay) window.__lay=B3.F.foes.map(f=>({id:f.id,row:f.row,px:B3P.foe[f.key].px,py:B3P.foe[f.key].py,sc:B3P.foe[f.key].sc})); return r; }; }")
T0=TOASTS()   # read once at the start: a scene that has run changes the flags its own conditions read
snap('0start')
check('1 the jump starts the photograph scene',run("()=>flag('ch16-open')==='pending'||flag('ch16-open')===true",'1open',1500) is True)
snd0=pg.evaluate("()=>sound.enabled")
check('2 the stone parents, Marlowe at the camera, and the one fight (Marlowe and two Grey Notes, Battle 3)',run("()=>flag('battle:marlowe16')==='win'",'2square',3500) is not False)
check('the party was Tom, Amy, TNB and Nara',any(sorted(f['party'])==['amy','nara','tnb','tom'] for f in L.fights))
check('the fight opened with Marlowe in Front and two Grey Notes in Back',any(f['foes']==['marlowe16','greynoteh','greynoteh'] for f in L.fights))
check('the fight ended in a win on Battle 3',any(f['foes'][:1]==['marlowe16'] and f['result']=='win' and f['v3'] for f in L.fights))
check('the fight showed the chapter 16 tips (the Grey Notes and the Pet Peeves)',any(f['tut']=='ch16' and any('Grey Notes in Back' in t or 'Racket or Drench' in t for t in f['tips']) for f in L.fights))
check('the Battle 3 tips never name a Battle 2 word',not any(f['words'] for f in L.fights))
check('the opening toast is the Battle 3 one (Racket and Drench don’t bounce; shield before Overexposure; no Chatter, Splash or Kinetic)',
      any('Racket and Drench hits' in t and 'Shield everyone' in t for t in T0) and not any('Chatter' in t or 'Kinetic' in t for t in T0 if 'Overexposure' in t.title()))
lay=pg.evaluate("()=>window.__lay")
check('the fight is drawn on a picture (the Square has no battle picture of its own yet, so the pond)',pg.evaluate("()=>typeof window.__bg==='string'&&window.__bg.length>0"))
check('the Grey Notes are drawn in the gap in front of Marlowe, not behind him',bool(lay) and all(p['px']>boss['px']-1 and p['py']!=boss['py'] for boss in [l for l in lay if l['id']=='marlowe16'] for p in lay if p['id']=='greynoteh') and len([l for l in lay if l['id']=='greynoteh'])==2)
check('there is no kind route: the chapter 16 scenes never read a kind flag (the engine sets one on every boss win; nothing here uses it)',"kind:" not in open(os.path.join(L.ROOT,'data','scenes-ch16.js'),encoding='utf-8').read() and pg.evaluate("()=>!!flag('battle:marlowe16')"))
check('the fall is silent: sound is off after the fight, as the scene wants',snd0 is False or pg.evaluate("()=>sound.enabled===false"))
check('3 after the fight: the amber goes out, the warm statues, Vance’s voice, the snow globe, chapter complete',run("()=>flag('ch16-done')===true"+QUIET,'3after',2500) is True)
check('the sound is back on after the aftermath',snd0 is False or pg.evaluate("()=>sound.enabled===true"))
pg.wait_for_timeout(2500); snap('4end'); print(L.state())
L.finish(16)
