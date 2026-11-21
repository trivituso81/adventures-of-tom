# Chapter 5 "Parent-Teacher Conference of Doom" on Battle 3 (b3s17), start to finish from the chapter-select jump: the arrival, Amy joins, Mr. Pruitt,
# the field, the hall, the three clock fights, the clocks, The Red Pen, and home. Every story fight is auto-played on Battle 3.
# Usage: LAYOUT=portrait|landscape python3 tools/ch5_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(5); run=L.run; check=L.check; at=L.at; snap=L.snap
QUIET="&&!intro.active&&!dialog.active"
run("()=>flag('ch5-goal')===true"+QUIET,'0arrive')
check('Amy joined the party',pg.evaluate("()=>party.some(p=>p.id==='amy')"))
L.go('schoolyard')
check('1 Mr. Pruitt',run("()=>flag('ch5-pruitt')===true"+QUIET,'1pruitt',1500) is True)
at('schoolyard',18,9)
check('2 the field',run("()=>flag('ch5-field')===true"+QUIET,'2field',1500) is True)
L.go('school')
check('3 the hall',run("()=>flag('ch5-hall')===true"+QUIET,'3hall',1500) is True)
at('school',4,4)
check('4a Tardy Bell (Battle 3)',run("()=>flag('battle:tardybell')==='win'&&flag('ch5-art')===true"+QUIET,'4bell',2000) is True)
at('school',13,4)
check('4b Glitter Glue (Battle 3)',run("()=>flag('battle:glitterglue')==='win'&&flag('ch5-music')===true"+QUIET,'4glue',2000) is True)
at('school',23,4)
check('4c Dodgeball Dread (Battle 3)',run("()=>flag('battle:dodgeball')==='win'&&flag('ch5-gym')===true"+QUIET,'4dodge',2000) is True)
pg.evaluate("()=>{ setFlag('ch5-clock-art'); setFlag('ch5-clock-music'); setFlag('ch5-clock-gym'); playScene('ch5Clocks'); }"); pg.wait_for_timeout(800)
check('5 the clocks',run("()=>flag('ch5-clocks')===true"+QUIET,'5clocks',1500) is True)
L.go('cafetorium')
check('6 The Red Pen (Battle 3)',run("()=>flag('battle:redpen')==='win'",'6boss',2500) is not False)
check('boss win set the kind flag',pg.evaluate("()=>!!flag('kind:redpen')"))
check('7 after the boss',run("()=>flag('ch5-clear')===true"+QUIET,'7after',1500) is True)
check('kickball coin given',pg.evaluate("()=>bag.includes('kickcoin')"))
L.go('schoolyard')
check('8 end',run("()=>flag('ch5-done')===true"+QUIET,'8end',1500) is True)
pg.wait_for_timeout(2500); snap('9after'); print(L.state())
L.finish(5)
