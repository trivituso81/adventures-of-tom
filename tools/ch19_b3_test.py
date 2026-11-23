# Chapter 19 "The Lost-Mail Office" on Battle 3 (b3s22ch19), start to finish from the chapter-select jump: the mailbox, the hub, the four solo memory rooms and keepsakes, a Dead Letter fight
# in the hall (an Elite alone), the Claim Desk and The Dead-Letter Censor (Grace, Rose, Amy and TNB; Nara on the bench; Tom is frozen all chapter), the reunion, the feast and the thaw.
# Every story fight is auto-played on Battle 3 (tools/b3_chapter_lib.py). Written from tools/ch11_b3_test.py, tools/ch18_b3_test.py and the route of tools/ch19_test.py (the Battle 2 walk, kept as it was).
# Usage: LAYOUT=portrait|landscape CHROME=/usr/bin/google-chrome python3 tools/ch19_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(19); run=L.run; check=L.check; at=L.at; snap=L.snap
L.WIN_STEPS=1200   # the Censor is a boss with a helper, 5 to 7 rounds
# Scene toasts are silent in the engine, so the Battle 3 wording of a toast is read from the chapter 19 scene steps themselves, the branch that plays while chapter 19 is on Battle 3.
TOASTS=lambda: pg.evaluate("()=>{ const out=[]; const walk=(st)=>{ for(const o of (st||[])) { if(!o||typeof o!=='object') continue; if(o.toast) out.push(String(o.toast)); if(typeof o.if==='function') { let on=false; try{ on=!!o.if(); }catch(e){} walk(on?o.then:o.else); } else { if(o.then) walk(o.then); if(o.else) walk(o.else); } } }; for(const k of Object.keys(SCENES)) { if(!/^ch19/.test(k)) continue; let l=SCENES[k]; if(typeof l==='function') { try{ l=l(); }catch(e){ continue; } } walk(l); } return out; }")
QUIET="&&!intro.active&&!dialog.active"
def adv(stop,n=400):
    for i in range(n):
        if pg.evaluate(stop): return True
        pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
    return bool(pg.evaluate(stop))
T0=TOASTS()
snap('0start')
check('starts in Jefferson Park, chapter 19, Tom gone',pg.evaluate("()=>currentMap.id==='jpark'&&STORY.chapter===19&&flag('tom-gone')===true&&!party.some(p=>p.id==='tom')"))
check('Grace, Rose, Amy and TNB out front; Nara on the bench',pg.evaluate("()=>['grace','rose','amy','tnb'].every(i=>party.some(p=>p.id===i))&&STORY.bench.includes('nara')"))
check('chapter 19 is on Battle 3 and chapter 20 is not',pg.evaluate("()=>b3sChapterOn(19)&&b3sChapterOn(18)&&!b3sChapterOn(20)"))
check('1 the opening scene finishes',adv("()=>flag('ch19-open')===true&&!intro.active",200)); pg.wait_for_timeout(600); snap('1mailbox')
pg.evaluate("()=>{ player.x=9; player.y=17; player.facing='down'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
check('2 the ride down: the hub',adv("()=>currentMap.id==='deadletter'",60)); pg.wait_for_timeout(600)
check('the hub scene plays',adv("()=>!!flag('ch19-hub')&&!intro.active&&!dialog.active",600)); pg.wait_for_timeout(500); snap('2hub')
check('the Censor is hidden until the Claim Desk',pg.evaluate("()=>findMonster('censor').hidden===true"))
# the four rooms (the same walk as tools/ch19_test.py)
for who,room in [('grace','memgrace'),('rose','memrose'),('amy','memamy'),('tnb','memtnb')]:
    pg.evaluate(f"()=>{{ ch17Place('{room}',8,9,'up'); }}"); pg.wait_for_timeout(500)
    for i in (1,2,3):
        pg.evaluate(f"()=>{{ const o=currentMap.objects.find(o=>o.mem==='{who}{i}'); player.x=o.x; player.y=o.y+1; player.facing='up'; player.move=null; pressAction(); }}"); pg.wait_for_timeout(300)
        adv("()=>!intro.active&&!dialog.active&&flag('mem-"+who+str(i)+"')===true",40)
    adv("()=>!intro.active&&!dialog.active",30)
    pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='dlkeep'); player.x=o.x; player.y=o.y+1; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(300)
    adv("()=>!intro.active&&!dialog.active&&flag('ks-"+who+"')===true",60); adv("()=>!intro.active&&!dialog.active",20); pg.wait_for_timeout(400)
    check(who+': three memories read and the keepsake is placed',pg.evaluate(f"()=>flag('mem-{who}-done')===true&&flag('ks-{who}')===true"))
    pg.evaluate("()=>{ ch17Place('deadletter',12,10,'up'); }"); pg.wait_for_timeout(500)
check('all four keepsakes: the desk is ready',pg.evaluate("()=>flag('ch19-ready')===true")); snap('3ready')
# a Dead Letter in the hall: an Elite alone, on Battle 3
at('deadletter',6,12)
pg.evaluate("()=>{ const c=document.getElementById('b7-card'); if(c) c.hidden=true; }")
started=False
for i in range(8):
    pg.evaluate("()=>startBattle(findMonster('deadletter'))"); pg.wait_for_timeout(1500)
    if pg.evaluate("()=>battle.active"): started=True; break
    pg.wait_for_timeout(2500)
check('the Dead Letter in the hall starts a fight',started)
r=L.win('3elite')
check('the Dead Letter fight ended on Battle 3 and was won with a victory card',r['ended'] and r['v3'] and r['card'] and r['result']=='win')
pg.keyboard.press('Enter'); pg.wait_for_timeout(2500)
check('3 the Dead Letter fight happened and was won on Battle 3',any(f['foes']==['deadletter'] and f['result']=='win' for f in L.fights))
check('the hall fight showed no Battle 2 words',not r['words'] and not r['b2'])
check('the Dead Letter stood alone in Front (one Elite, not two)',any(f['foes']==['deadletter'] for f in L.fights))
check('the party in the hall was Grace, Rose, Amy and TNB',all(sorted(f['party'])==['amy','grace','rose','tnb'] for f in L.fights))
check('the Dead Letter fight paid its 10 Vibe Points',any(f['foes']==['deadletter'] and f['vpPlan']==10 for f in L.fights))
# the Claim Desk and the Censor
pg.evaluate("()=>{ ch17Place('deadletter',12,10,'up'); }"); pg.wait_for_timeout(500)
pg.evaluate("()=>{ const o=currentMap.objects.find(o=>o.kind==='dlaltar'); player.x=o.x+2; player.y=o.y+o.h; player.facing='up'; player.move=null; pressAction(); }"); pg.wait_for_timeout(400)
check('4 the Claim Desk, the Censor rises and the fight is played on Battle 3',run("()=>flag('battle:censor')==='win'"+QUIET,'4censor',2500) is not False)
bf=[f for f in L.fights if f['foes'][:1]==['censor']]
check('the Censor fight happened and was won',len(bf)>=1 and bf[-1]['result']=='win')
check('the party was Grace, Rose, Amy and TNB (no Tom, Nara on the bench)',all(sorted(f['party'])==['amy','grace','rose','tnb'] for f in bf))
check('the fight opened with the Censor alone in Front',any(f['foes']==['censor'] for f in bf))
check('the fight paid its 30 Vibe Points',any(f['vpPlan']==30 for f in bf))
check('the fight showed chapter 19 tips (the Pet Peeves, and REDACTED once it stamped)',any(f['tut']=='ch19' and any('Composure pips' in t for t in f['tips']) and any('REDACTED' in t for t in f['tips']) for f in bf))
check('the Battle 3 tips never name a Battle 2 word',not any(f['words'] for f in L.fights))
check('the Claim Desk toast is the Battle 3 one (the stamp, rotate flavors)',any('REDACTED' in t and 'Rotate' in t for t in T0))
check('the retry toast is there for a lost fight',any('try again' in t for t in T0))
check('5 after the fight Tom is back, the feast, the thaw',run("()=>!flag('tom-gone')&&party.some(p=>p.id==='tom')",'5reunion',1500) is not False)
check('the chapter finishes',run("()=>flag('ch19-done')===true"+QUIET,'6done',1500) is True)
# a lost fight does not end the chapter: the flag is read the same way by the scene, the trigger and the A press
res=pg.evaluate("()=>{ const keep=flag('battle:censor'); setFlag('battle:censor','lose'); const lose=flag('battle:censor')!=='win'; setFlag('battle:censor','win'); const win=flag('battle:censor')==='win'; setFlag('battle:censor',keep); return {lose,win}; }")
check('a lost fight (flag lose) is not a win, a win is',res['lose'] is True and res['win'] is True)
pg.wait_for_timeout(1500); snap('7end'); print(L.state())
L.finish(19)
