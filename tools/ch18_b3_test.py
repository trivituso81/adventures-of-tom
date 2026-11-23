# Chapter 18 "No Touching, Please." on Battle 3 (b3s22ch18), start to finish from the chapter-select jump: the Vault lift, the ride up, the Loom Chamber on floor 60 and the fight
# against The Studio Rig (Tom, Grace, Rose and Amy; Julian Vance's sprite until the rig painting exists), the after scene (Tom is gone, Jefferson Park at first light). The fight is
# auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch17_b3_test.py and the route of tools/ch18_test.py (the Battle 2 walk, kept as it was).
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch18_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(18); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=1000   # a boss with no helper, 5 to 7 rounds
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 18 scene steps themselves, the branch that plays while chapter 18 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch18/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
T0=TOASTS()
snap('0start')
check('starts in the Vault with Tom, Grace, Rose and Amy out front and TNB and Nara on the bench',pg.evaluate("()=>currentMap.id==='towervault'&&STORY.chapter===17&&flag('ch17-done')===true&&party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))&&STORY.bench.includes('tnb')&&STORY.bench.includes('nara')"))
check('chapter 18 is on Battle 3 and the switch says so at the Vault',pg.evaluate("()=>b3sChapterOn(18)&&b3sChapterOn(17)&&!b3sChapterOn(19)"))
# the lift
pg.evaluate("()=>{ player.x=10; player.y=2; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(500); snap('1lift')
pg.keyboard.press('Enter'); pg.wait_for_timeout(200)
check('1 the ride up: chapter 18 begins on floor 60 (the Loom Chamber scene starts by itself when the ride ends)',run("()=>STORY.chapter===18&&currentMap.id==='towerpinnacle'&&flag('ch18-open')===true",'1ride',400) is True)
pg.wait_for_timeout(600); snap('2pinnacle')
# the conversation, the fight, the after scene
check('2 the Loom Chamber scene runs and the fight is played on Battle 3',run("()=>flag('ch18-pinnacle')===true&&!battle.active&&(flag('ch18-after')==='pending'||flag('ch18-after')===true)",'2fight',3500) is True)
bf=[f for f in L.fights if f['foes'][:1]==['vance']]
check('the Studio Rig fight happened exactly once and was won',len(bf)==1 and bf[0]['result']=='win')
check('the party was Tom, Grace, Rose and Amy',any(sorted(f['party'])==['amy','grace','rose','tom'] for f in bf))
check('the fight opened with the Studio Rig alone in Front',any(f['foes']==['vance'] for f in bf))
check('the fight paid its 90 Vibe Points (the whole chapter)',any(f['vpPlan']==90 for f in bf))
check('the fight showed chapter 18 tips (the Pet Peeves, and more as the fight went on)',any(f['tut']=='ch18' and any('Composure pips' in t for t in f['tips']) for f in bf))
check('the Battle 3 tips never name a Battle 2 word',not any(f['words'] for f in L.fights))
check('the flag battle:vance is win on Battle 3',pg.evaluate("()=>flag('battle:vance')==='win'"))
check('the pinnacle toast is the Battle 3 one (tap the Rig, the lock, the backdrop)',any('Studio Rig' in t and 'Big Flash' in t for t in T0))
check('the retry toast is there for a lost fight',any('try again' in t for t in T0))
check('3 after the fight Tom is gone, Jefferson Park at first light',run("()=>currentMap.id==='jpark'"+QUIET,'3after',1200) is not False)
check('Tom is gone: flag, party',pg.evaluate("()=>flag('tom-gone')===true&&!party.some(p=>p.id==='tom')&&party.some(p=>p.id==='tnb')&&party.some(p=>p.id==='grace')"))
check('4 the chapter finishes',run("()=>flag('ch18-done')===true"+QUIET,'4done',1200) is True)
# a lost fight does not end the chapter: the same condition the scene, the trigger and Vance's A press read
res=pg.evaluate("()=>{ const o={}; const keep=flag('battle:vance'); setFlag('battle:vance','lose'); o.lose=ch18Over(); setFlag('battle:vance','win'); o.win=ch18Over(); setFlag('battle:vance',keep); return o; }")
check('a lost fight (flag lose) is not over on Battle 3, a win is',res['lose'] is False and res['win'] is True)
pg.wait_for_timeout(1500); snap('5end'); print(L.state())
L.finish(18)
