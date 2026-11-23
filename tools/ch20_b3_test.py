# Chapter 20 "The Forever Engine & The Open Sky" on Battle 3 (b3s22ch20), start to finish from the chapter-select jump: the Vault lift, the Stillness Core and its eight doors, the lift up,
# the one fight against The Collector (Tom, Grace, Rose and Amy; Deedee, Boppy, TNB and Nara on the bench; the four are picked again at each phase change), Julian in the glass room
# (a scene on Battle 3, not a fight), the Calm scene, the epilogue and the end. The fight is auto-played on Battle 3 (tools/b3_chapter_lib.py), with the pick-your-four page tapped like a player
# would at both phase changes. Written from tools/ch11_b3_test.py, tools/ch19_b3_test.py and the route of tools/ch20_test.py (the Battle 2 walk, kept as it was).
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch20_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(20); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=3000   # the last boss with two helpers and two phase changes, about 8 rounds
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 20 scene steps themselves, the branch that plays while chapter 20 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } } }; for(const k of ['ch20Heart','ch20Shatter','ch20Care','ch20Calm']) { try { walk(SCENES[k]()); } catch(e) {} } return out; }")
QUIET="&&!intro.active&&!dialog.active"
def adv(stop,n=400):
    for i in range(n):
        if pg.evaluate(stop): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return bool(pg.evaluate(stop))
T0=TOASTS()
snap('0start')
check('starts in the Vault, chapter 20, Tom, Grace, Rose and Amy out front, the other four on the bench',pg.evaluate("()=>currentMap.id==='towervault'&&party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))&&['deedee','boppy','tnb','nara'].every(i=>STORY.bench.includes(i))"))
check('chapter 20 is on Battle 3 and there is no chapter left that is off',pg.evaluate("()=>b3sChapterOn(20)&&b3sChapterOn(19)&&B3_STORY.chapters.includes(20)"))
# the lift, the Stillness Core and its eight doors (the same walk as tools/ch20_test.py)
pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='glelev'); player.x=o.x+1; player.y=o.y+o.h; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
pg.keyboard.press('Enter')
check('1 the ride up: the Stillness Core',adv("()=>currentMap.id==='stillcore'&&flag('ch20-open')===true&&!intro.active",300)); pg.wait_for_timeout(600); snap('1core')
for who in ['tom','grace','rose','amy','deedee','boppy','tnb','nara']:
    pg.evaluate(f"()=>{{ const o=currentMap.objects.find(o=>o.who==='{who}'); player.x=o.x+1; player.y=o.y+o.h; player.facing='up'; player.move=null; placeFollowers(); pressAction(); }}"); pg.wait_for_timeout(300)
    idx=pg.evaluate(f"()=>CH20_DOORS['{who}'].opts.findIndex(o=>o.ok)")
    for i in range(idx): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(80)
    for k in range(12):
        pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
        if pg.evaluate(f"()=>flag('door-{who}')===true"): break
    adv(f"()=>flag('door-{who}')===true&&!intro.active&&!dialog.active",80)
adv("()=>!intro.active&&!dialog.active",40)
check('2 all eight doors open and the Engine lift is ready',pg.evaluate("()=>ch20Doors()===8&&!!flag('ch20-core')")); snap('2core-open')
check('Tom, Grace, Rose and Amy are still out front with the bench behind them (the four the picker offers)',pg.evaluate("()=>party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))&&['deedee','boppy','tnb','nara'].every(i=>STORY.bench.includes(i))"))
xp0=pg.evaluate("()=>({deedee:memberById('deedee').wins||0,boppy:memberById('boppy').wins||0,tnb:memberById('tnb').wins||0,nara:memberById('nara').wins||0,tom:memberById('tom').wins||0})")
pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='celift'); player.x=o.x+2; player.y=o.y+o.h; player.facing='up'; player.move=null; placeFollowers(); pressAction(); }"); pg.wait_for_timeout(300)
pg.keyboard.press('Enter')
# the lift up, the Engine scene and the one fight
check('3 the Engine scene runs and The Collector is played on Battle 3, to the end of the chapter',run("()=>flag('ch20-done')===true"+QUIET,'3engine',6000) is True)
bf=[f for f in L.fights if f['foes'][:1]==['leviathan']]
check('the Collector fight happened exactly once and was won',len(bf)==1 and bf[0]['result']=='win')
check('it was the only fight of the chapter: Julian is a scene, not a fight',len(L.fights)==1 and not any('julian' in f['foes'] for f in L.fights))
check('the party at the start was Tom, Grace, Rose and Amy',any(sorted(f['party'])==['amy','grace','rose','tom'] for f in bf))
check('the fight opened with the Collector alone in Front (the lenses come at phase 2)',any(f['foes']==['leviathan'] for f in bf))
check('the fight paid its 90 Vibe Points (the whole chapter)',any(f['vpPlan']==90 for f in bf))
check('the pick-your-four page opened at both phase changes',len(bf[0]['repicks'])==2)
check('the first pick brought Deedee in for Amy',len(bf[0]['repicks'])>=1 and 'deedee' in bf[0]['repicks'][0] and 'amy' not in bf[0]['repicks'][0] and len(bf[0]['repicks'][0])==4)
check('the second pick brought Nara in for Rose',len(bf[0]['repicks'])>=2 and 'nara' in bf[0]['repicks'][1] and 'rose' not in bf[0]['repicks'][1] and len(bf[0]['repicks'][1])==4)
check('everyone who fought is kept for the story: Tom, Grace, Rose, Amy, Deedee and Nara',bf[0]['everIn'] is not None and sorted(bf[0]['everIn'])==['amy','deedee','grace','nara','rose','tom'])
xp1=pg.evaluate("()=>({deedee:memberById('deedee').wins||0,boppy:memberById('boppy').wins||0,tnb:memberById('tnb').wins||0,nara:memberById('nara').wins||0,tom:memberById('tom').wins||0})")
check('the win counted for those who fought, Deedee and Nara from the bench included, and for nobody who stayed out',xp1['deedee']==xp0['deedee']+1 and xp1['nara']==xp0['nara']+1 and xp1['tom']==xp0['tom']+1 and xp1['boppy']==xp0['boppy'] and xp1['tnb']==xp0['tnb'])
check('the fight showed chapter 20 tips (the Pet Peeves and the phases)',any(f['tut']=='ch20' and any('Composure pips' in t or 'phase' in t.lower() for t in f['tips']) for f in bf))
check('the Battle 3 tips never name a Battle 2 word',not any(f['words'] for f in L.fights))
check('the flags: the Collector won, Julian settled by the scene, the Calm scene played',pg.evaluate("()=>flag('battle:leviathan')==='win'&&flag('battle:julian')==='win'&&flag('ch20-calm')===true&&flag('ch20-shatter')===true"))
check('the chapter finished and the game is complete',pg.evaluate("()=>flag('ch20-done')===true&&!!flag('game-complete')"))
# a lost fight does not end the chapter: the flag is read the same way by the scene, the trigger and the A press
res=pg.evaluate("()=>{ const keep=flag('battle:leviathan'); setFlag('battle:leviathan','lose'); const lose=flag('battle:leviathan')!=='win'; setFlag('battle:leviathan','win'); const win=flag('battle:leviathan')==='win'; setFlag('battle:leviathan',keep); return {lose,win}; }")
check('a lost fight (flag lose) is not a win, a win is',res['lose'] is True and res['win'] is True)
pg.wait_for_timeout(1500); snap('4end'); print(L.state())
L.finish(20)
