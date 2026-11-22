# Chapter 2 "Smog on 2nd Avenue" on Battle 3 (b3s17a), start to finish from the chapter-select jump through its nine scenes. The story fights
# (two Smoglets, the Ticket Flurry, the Canyon Coyote, The Big Shake) are auto-played on Battle 3; frames and contact sheets go to the out dir.
# Usage: LAYOUT=portrait|landscape python3 tools/ch2_b3_test.py [outdir]
import b3_chapter_lib as L, os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
pg=L.start(2); run=L.run; check=L.check; at=L.at; snap=L.snap
run("()=>flag('ch2-goal')===true&&!intro.active&&!dialog.active",'0arrive')
L.go('lofts')
check('1 loft',run("()=>flag('ch2-tnb')===true&&!intro.active&&!dialog.active",'1loft') is True)
check('TNB joined',pg.evaluate("()=>party.some(p=>p.id==='tnb')"))
at('jpark',6,19); snap('jpark-start')
check('2 porch',run("()=>flag('ch2-nara')===true&&!intro.active&&!dialog.active",'2porch') is True)
check('Nara joined; no Tombo toast needed under Battle 3',pg.evaluate("()=>party.some(p=>p.id==='nara')&&!!flag('met-nara')&&flag('tombo:nara1')===true"))
check('3 smog street, two Smoglets (Battle 3)',run("()=>flag('ch2-lawn')===true&&!intro.active&&!dialog.active",'3smog',1500) is True)
check('Smoglets fight won',pg.evaluate("()=>flag('battle:smoglet')")=='win')
at('jpark',8,9); snap('4start')
check('4 boulevard',run("()=>flag('ch2-source')===true&&!intro.active&&!dialog.active",'4blvd') is True)
at('griffith',12,18)
check('5a flurry (Battle 3)',run("()=>flag('ch2-t1')===true&&flag('battle:tickets')==='win'&&!intro.active&&!dialog.active",'5flurry',1500) is True)
at('griffith',12,11)
check('5b coyote (Battle 3)',run("()=>flag('ch2-tuts')===true&&!intro.active&&!dialog.active",'5coyote',1500) is True)
for n,(x,y) in ((1,(16,8)),(2,(12,10)),(3,(9,9))):
    at('griffith',x,y)
    check('5 glass clue %d'%n,run("()=>flag('ch2-glass%d')===true&&!intro.active&&!dialog.active"%n,'5glass%d'%n) is True)
at('griffith',6,9)
check('6 lemon tree',run("()=>flag('ch2-lemon')===true&&!intro.active&&!dialog.active",'6lemon') in (True,'closeup'))   # the Big Shake's close-up can follow the lemon scene at once
check('bulb pocketed',pg.evaluate("()=>!!flag('ch2-bulb')"))
at('griffith',6,7)
check('7 boss scene and The Big Shake (Battle 3)',run("()=>flag('battle:bigshake')==='win'",'7boss',2000) is not False)
check('boss win set the kind flag',pg.evaluate("()=>!!flag('kind:bigshake')"))
check('8 after',run("()=>flag('ch2-clear')===true&&!intro.active&&!dialog.active",'8after') is True)
check('lemon coin given',pg.evaluate("()=>bag.includes('lemoncoin')"))
at('jpark',14,14)
check('9 end',run("()=>flag('ch2-done')===true&&!intro.active&&!dialog.active",'9end',1400) is True)
pg.wait_for_timeout(3000); snap('10after'); print(L.state())
L.finish(2)
