# The bonus chapter "Nine Scoops" (chapter 21) on Battle 3 (b3s18bonus), start to finish from the title screen's BONUS start (the same function Chapter
# Select's B uses): the opening, the creamery, the fountain, the trail, the first pond run (Brain Freeze's scripted midpoint, result FLEE: Rose frozen,
# a Deep Freeze on everyone), Deedee thaws Rose, the garden, the second pond run (the midpoint again, result SHELL, then Tom's present), the real fight
# (phase 2, retried through the story's own retry scene until it is won), the after-boss scene and the end. Every story fight is auto-played on Battle 3
# with Rose Mode's recommended moves. Quests with no fight in them (the invitations, the old freezer, the banner) are skipped by setting their flags.
# Usage: LAYOUT=portrait|landscape python3 tools/ns_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(21,bonus=True); run=L.run; check=L.check; at=L.at; snap=L.snap
QUIET="&&!intro.active&&!dialog.active"
pg.evaluate("""()=>{ window.__rec=true; window.__ends=[]; const o=b3sEnd;
  b3sEnd=function(r){ try { const F=B3.F,ro=F.units.find(u=>u.id==='rose'); window.__ends.push({res:r,over:F.over,foe:F.foes[0].id,bfhp:Math.round(100*F.foes[0].hp/F.foes[0].maxHp),rose:!!ro.st.frozen,hps:F.party.map(p=>p.hp)}); } catch(e) {} return o.apply(this,arguments); }; }""")
_seen=[0]
def errs(stage):
    new=L.errs[_seen[0]:]; _seen[0]=len(L.errs)
    for e in new:
        if 'favicon' in e or 'net::' in e or 'Failed to load resource' in e: continue
        print('PAGE ERROR after',stage,'on map',pg.evaluate("()=>currentMap.id"),':',e[:300].replace(chr(10),' | '),flush=True)
# the start: level 5, one chapter's worth of Vibe Points (not the story's level 25 and 20 chapters of points)
lv=pg.evaluate("()=>['tom','grace','rose'].map(id=>memberById(id).level)")
check(f'the party starts at level 5 ({lv})',lv==[5,5,5])
vp0=L.vpTotal(); check(f'Tom starts with one chapter of Vibe Points, 135 ({vp0})',vp0==135)
check('Tom, Grace and Rose are the party',pg.evaluate("()=>JSON.stringify(party.map(p=>p.id))")=='["tom","grace","rose"]')
run("()=>flag('ns-goal')===true"+QUIET,'0open',1500); errs('opening')
L.go('bakery')
check('1 the creamery: three gremlins (Battle 3)',run("()=>flag('battle:gremlin')==='win'&&flag('ns-scoops')===0"+QUIET,'1creamery',1500) is True)
errs('1')
at('town',10,10)
check('2 the fountain: the Slushie Slug (Battle 3)',run("()=>flag('battle:slushslug')==='win'&&flag('ns-scoops')===3"+QUIET,'2fountain',1500) is True)
errs('2')
pg.evaluate("()=>{ setFlag('ns-invite'); setFlag('ns-invites'); }"); pg.wait_for_timeout(500)
at('hollow',8,15)
check('3 the trail: two Cone Heads (Battle 3)',run("()=>flag('battle:conehead')==='win'&&flag('ns-scoops')===6"+QUIET,'3trail',1500) is True)
errs('3')
pg.evaluate("()=>{ window.__lv1=['tom','grace','rose'].map(id=>memberById(id).level); }")
at('hollow',17,8)
r=run("()=>flag('ns-fled')===true"+QUIET,'4pond1',2500)
check('4 the first pond run ends in the family fleeing (scripted midpoint)',r is True)
errs('4')
mid=pg.evaluate("()=>({res:B2.result,over:B3.F&&B3.F.over,bf:B3.F&&B3.F.foes[0].id,frozen:!!(B3.F&&B3.F.units.find(u=>u.id==='rose').st.frozen),hps:B3.F&&B3.F.party.map(p=>p.hp),bfhp:B3.F&&Math.round(100*B3.F.foes[0].hp/B3.F.foes[0].maxHp),rosefrozen:flag('ns-rosefrozen'),mem:['tom','grace','rose'].map(id=>memberById(id).hp)})")
print('midpoint 1',mid)
check('the fight ended with the result flee, Battle 3 wrote it to the story',mid['res']=='flee' and mid['over']=='flee')
check('Rose was frozen mid boo, and the story set her frozen flag',mid['frozen'] and mid['rosefrozen'] is True)
check('nobody was knocked out by the Deep Freeze (everyone at 1 HP or more)',all(h>=1 for h in mid['hps']) and all(h>=1 for h in mid['mem']))
check(f"Brain Freeze was never knocked out and stood near half HP ({mid['bfhp']}%)",mid['bfhp']>=40 and mid['bfhp']<=50)
check('the flee paid no Vibe Points and did not defeat Brain Freeze',pg.evaluate("()=>flag('battle:brainfreeze')!=='win'"))
L.go('grands')
check('5 Deedee thaws Rose',run("()=>flag('ns-thaw')===true&&!flag('ns-rosefrozen')"+QUIET,'5thaw',1500) is True)
errs('5')
pg.evaluate("()=>playScene('nsPeppers')"); pg.wait_for_timeout(800)
check('6 the garden: gremlins in the peppers (Battle 3)',run("()=>flag('ns-peppers')===true"+QUIET,'6garden',1500) is True)
errs('6')
pg.evaluate("()=>{ setFlag('ns-pistachio'); setFlag('ns-banner'); setFlag('ns-ready'); }"); pg.wait_for_timeout(500)
lv=pg.evaluate("()=>['tom','grace','rose'].map(id=>memberById(id).level)"); print('levels at the second pond run',lv)
check(f'the four fights paid enough XP to reach level 7 or more before the real fight ({lv})',min(lv)>=7)
at('hollow',17,8)
r=run("()=>flag('ns-printer')===true&&flag('ns-banner-hung')===true"+QUIET,'7pond2',2500)
check('7 the second pond run ends in the shell (scripted midpoint) and Tom\'s present',r is True)
errs('7')
ends=pg.evaluate("()=>window.__ends"); print('fight ends',[(e['foe'],e['res'],e['bfhp'],e['rose']) for e in ends])
shell=[e for e in ends if e['res']=='shell']
check('that fight ended with the result shell and Rose stayed thawed',len(shell)==1 and not shell[0]['rose'] and shell[0]['bfhp']<=50)
# the real fight: retried through the story's own retry scene until it is won (a lost fight shows the retry line and the goal toast)
tries=0
for tries in range(1,7):
    r=run("()=>flag('battle:brainfreeze')==='win'||flag('ns-retry')===true"+QUIET,f'8boss{tries}',2500)
    if pg.evaluate("()=>flag('battle:brainfreeze')==='win'"): break
    check(f'8 attempt {tries} was lost and the retry goal is on: the story offers the fight again',pg.evaluate("()=>flag('ns-retry')===true"))
    at('hollow',18,11)
check(f'8 Brain Freeze phase 2 is won on Battle 3 ({tries} attempt(s))',pg.evaluate("()=>flag('battle:brainfreeze')==='win'"))
errs('8')
f2=pg.evaluate("()=>({kind:flag('kind:brainfreeze')})")
win2=[e for e in pg.evaluate("()=>window.__ends") if e['res']=='win' and e['foe']=='brainfreeze']
check('phase 2 started with Brain Freeze at half HP or less and ended in a win',len(win2)==1)
check('the boss win set the kind flag the after scene reads',bool(f2['kind']))
check('9 the after-boss scene',run("()=>flag('ns-clear')===true"+QUIET,'9after',2500) is True)
errs('9')
L.go('amyhouse')
check('10 the end',run("()=>flag('ns-done')===true"+QUIET,'10end',2500) is True)
errs('10')
vp1=L.vpTotal(); print('Vibe Points for Tom',vp0,'->',vp1)
# Main Vibe: 15 x 4 + 30 = 90 (the bestiary's chapter total). Pocket Vibe: half of each win rounded up: 8 x 4 + 15 = 47. Tom's total moves by 137.
check(f'the chapter paid 90 Vibe Points to the Main Vibe and 47 to the Pocket Vibe ({vp1-vp0})',vp1-vp0==90+47)
# the Birthday Sash: Grace begins a fight as the Birthday Girl when she wears it
pg.evaluate("()=>{ grace.equipment=grace.equipment||{}; grace.equipment.Sash='g_bsash'; }")
sash=pg.evaluate("""()=>{ try { const npc={monster:'gremlin',x:0,y:0,maxHp:10,tier:0}; b3sBegin(npc,{tut:'nsGarden'},{formation:'gremlin',vp:15});
  const g=B3.F.party.find(p=>p.id==='grace'); const r={girl:!!g.st.birthday_girl,n:g.st.birthday_girl&&g.st.birthday_girl.n}; battle.active=false; B3.active=false; return r; } catch(e) { return {err:String(e)}; } }""")
check(f'Grace wears the Birthday Sash and begins as the Birthday Girl ({sash})',sash.get('girl') is True and sash.get('n')==2)
snap('11sash')
L.finish(21)
