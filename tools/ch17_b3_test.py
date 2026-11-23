# Chapter 17 "Ascent of the Glass Tower" on Battle 3 (b3s22ch17), start to finish from the chapter-select jump: Sol, the lobby, the stairs (Tom, Grace, Rose), the hatch, the shelf hall
# (Tom, Amy, TNB, Nara), six shelves, the race, the Vault and the Twin Lenses (boss, Tom, Grace, Rose and Amy, two stances), the after scene. Every story fight is auto-played on Battle 3
# (tools/b3_chapter_lib.py). The map monsters of the stairs and the shelf hall are started the way the map starts them (startBattle on the monster). Written from tools/ch11_b3_test.py,
# tools/ch16_b3_test.py and the route of tools/ch17_test.py (the Battle 2 walk, kept as it was).
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch17_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(17); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=1000   # a boss with a helper, 5 to 7 rounds
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 17 scene steps themselves, the branch that plays while chapter 17 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch17/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
def begin(mon,mapid=None,x=6,y=30):
    """Start a map monster's fight the way the map does; a fight that has only just ended leaves the map busy for a moment, so it is asked again until the battle is on."""
    pg.keyboard.press('Enter'); pg.wait_for_timeout(6000)   # the last fight's victory card is still closing: a map fight started within a second or two of it is ended by it (a player cannot start one that fast)
    pg.evaluate("()=>{ const c=document.getElementById('b7-card'); if(c) c.hidden=true; }")   # the last fight's victory card is still on the page; the helper plays a fight only when it sees the card hidden at the start
    for i in range(8):
        if mapid: at(mapid,x,y,'up')
        pg.evaluate(f"()=>startBattle(findMonster('{mon}'))"); pg.wait_for_timeout(1500)
        if pg.evaluate("()=>battle.active"): return True
        pg.wait_for_timeout(2500)
    return False
T0=TOASTS()   # read once at the start: a scene that has run changes the flags its own conditions read
snap('0start')
pg.evaluate("()=>{ window.__lens=[]; const o=b3Show; b3Show=function(b){ if(b&&b.t==='stance') window.__lens.push(b.stance+'|'+b.why); return o.apply(this,arguments); }; }")
check('starts at the cab stand',pg.evaluate("()=>currentMap.id==='lacab'&&STORY.chapter===16"))
pg.evaluate("()=>{ talkToDriver(currentMap.npcs.find(n=>n.name==='Sol')); }")
check('1 Sol starts chapter 17 and the family reaches the boulevard',run("()=>flag('ch17-open')===true"+QUIET,'1open',1500) is True and pg.evaluate("()=>STORY.chapter===17&&currentMap.id==='blvd'"))
check('team stairs: Tom, Grace, Rose, with the adults on the bench',pg.evaluate("()=>party.length===3&&['tom','grace','rose'].every(i=>party.some(p=>p.id===i))&&['amy','tnb','nara'].every(i=>STORY.bench.includes(i))"))
pg.evaluate("()=>{ player.x=24; player.y=12; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
check('2 the glass doors, the lobby and Sol\'s scene',run("()=>flag('ch17-lobby')===true"+QUIET,'2lobby',900) is True and pg.evaluate("()=>currentMap.id==='towerlobby'"))
snap('2lobby')

# the stairs: a Curator and a Pause Sprite, then a Brass Desk Weight and a Pause Sprite, fought by the stairs team of three
check('the stairs hold every kind of monster of the chapter (Pause Sprite, Brass Desk Weight, Curator) and each has a Battle 3 fight',pg.evaluate("()=>{ const ids=[...new Set(CH17_STAIR_SPOTS.concat(CH17_SHELF_SPOTS).map(s=>s[0]))]; return ids.sort().join()==='curator,paperweight,pausesprite'&&ids.every(i=>!!B3_FORMATIONS[i]); }"))
at('towerstairs',6,30,'up'); snap('3stairs')
for mon,foes in (('curator',['curator','pausesprite']),('paperweight',['paperweight','pausesprite']),('pausesprite',['curator','pausesprite'])):
    n0=len(L.fights); check(f'the {mon} on the stairs starts its fight',begin(mon,'towerstairs'))
    check(f'3 stairs fight against the {mon} (Battle 3)',run("()=>!battle.active&&B3.result==='win'"+QUIET,'3'+mon,80) is True)
    check(f'the {mon} fight opened with {foes[0]} in Front and a {foes[1]} in Back, Tom, Grace and Rose fighting',any(f['foes']==foes and sorted(f['party'])==['grace','rose','tom'] for f in L.fights[n0:]))
    check(f'the {mon} fight paid its 5 Vibe Points',any(f['foes']==foes and f['vpPlan']==5 for f in L.fights[n0:]))
pg.evaluate("()=>{ ch17Place('towerstairs',4,3,'up'); }"); pg.wait_for_timeout(900)
check('4 the landing scene',run("()=>flag('ch17-landing')===true"+QUIET,'4landing',400) is True)
pg.evaluate("()=>{ player.x=14; player.y=3; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
check('5 through the hatch to the shelf hall, the Archive scene',run("()=>currentMap.id==='towershelves'"+QUIET,'5hatch',400) is True)
check('team shelves: Tom, Amy, TNB and Nara',pg.evaluate("()=>party.length===4&&['tom','amy','tnb','nara'].every(i=>party.some(p=>p.id===i))&&girlsAway()"))
n0=len(L.fights); check('the Brass Desk Weight in the shelf hall starts its fight',begin('paperweight'))
check('6 a Brass Desk Weight in the shelf hall (Battle 3)',run("()=>!battle.active&&B3.result==='win'"+QUIET,'6desk',80) is True)
check('the shelf hall fight was Tom, Amy, TNB and Nara against a Brass Desk Weight with a Pause Sprite',any(f['foes']==['paperweight','pausesprite'] and sorted(f['party'])==['amy','nara','tnb','tom'] for f in L.fights[n0:]))
snap('6shelves')
for i,(sx,sy,sw,sh) in enumerate([[3,2,5,3],[9,2,6,3],[16,2,5,3],[2,9,7,4],[10,9,7,4],[18,9,7,4]]):
    if i<3: pg.evaluate(f"()=>{{ player.x={sx+1}; player.y={sy+sh}; player.facing='up'; player.move=null; pressAction(); }}")
    else: pg.evaluate(f"()=>{{ player.x={sx+1}; player.y={sy-1}; player.facing='down'; player.move=null; pressAction(); }}")
    pg.wait_for_timeout(300)
    run(f"()=>flag('shelf-{i}')===true"+QUIET,f'7shelf{i}',200)
check('7 all six shelves are smashed and the locks drop',run("()=>flag('ch17-locks')===true"+QUIET,'7locks',500) is True and pg.evaluate("()=>flag('ch17-smashed')===6"))
snap('7done')
pg.evaluate("()=>{ player.x=1; player.y=5; player.facing='left'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
check('8 back at the stairs the final team is Tom, Grace, Rose and Amy',run("()=>currentMap.id==='towerstairs'"+QUIET,'8regroup',300) is True and pg.evaluate("()=>party.length===4&&['tom','grace','rose','amy'].every(i=>party.some(p=>p.id===i))"))
pg.evaluate("()=>{ player.x=11; player.y=3; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
check('9 the race to the Vault',run("()=>flag('ch17-race')===true"+QUIET,'9race',900) is True and pg.evaluate("()=>flag('tombo:amy3')===true&&currentMap.id==='towervault'"))
snap('9vault')

# the boss: the Archivist's Twin Lenses, in the two stances the new battle gives it
check('10 the Vault scene and the boss fight (Battle 3)',run("()=>flag('battle:twinlens')==='win'",'10boss',3500) is not False)
bf=[f for f in L.fights if f['foes'][:1]==['twinlens']]   # (the Vault scene starts at the end of the race, so its fight is played by that step)
check('the party was Tom, Grace, Rose and Amy',any(sorted(f['party'])==['amy','grace','rose','tom'] for f in bf))
check('the fight opened with the Twin Lenses alone in Front',any(f['foes']==['twinlens'] for f in bf))
check('the fight ended in a win on Battle 3 and paid its 30 Vibe Points',any(f['result']=='win' and f['v3'] and f['vpPlan']==30 for f in bf))
check('the fight showed the chapter 17 tips (the lens and the Pet Peeves)',any(f['tut']=='ch17' and any('swap lens' in t or 'Composure pips' in t for t in f['tips']) for f in bf))
check('the Battle 3 tips never name a Battle 2 word',not any(f['words'] for f in L.fights))
lens=pg.evaluate("()=>window.__lens||[]")
check('the lens swapped during the fight (at a round divider at least once): '+', '.join(lens[:6]),any(x.endswith('|round') for x in lens))
check('the Vault toast is the Battle 3 one (the lens it wears changes every round; no Kinetic, Sparkle or amber lens)',any('lens it wears changes every round' in t for t in T0) and not any(('Kinetic' in t or 'amber' in t) for t in T0 if 'Tip' in t and 'lens' in t and 'wears' in t))
check('3 after the fight: the lens is gone and the chapter is complete',run("()=>flag('ch17-done')===true"+QUIET,'11after',2500) is True)
check('the lens is gone from the Vault',pg.evaluate("()=>{ const m=findMonster('twinlens'); return !m||m.hidden; }"))
pg.wait_for_timeout(2500); snap('12end'); print(L.state())
L.finish(17)
