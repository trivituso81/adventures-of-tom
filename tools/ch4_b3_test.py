# Chapter 4 "Backlot Bedlam" on Battle 3 (b3s17c), start to finish from the chapter-select jump: the arrival, Nara, the gate, the backlot's three
# fights, Stage 7, the rig, the hat, The Director's Cut, the backup and home. Every story fight is auto-played on Battle 3.
# Usage: LAYOUT=portrait|landscape python3 tools/ch4_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(4); run=L.run; check=L.check; at=L.at; snap=L.snap
QUIET="&&!intro.active&&!dialog.active"
run("()=>flag('ch4-goal')===true"+QUIET,'0arrive')
check('TNB joined the party',pg.evaluate("()=>party.some(p=>p.id==='tnb')"))
L.go('jpark')
check('1 Nara joins on the porch',run("()=>flag('ch4-nara')===true&&party.some(p=>p.id==='nara')"+QUIET,'1nara',1500) is True)
L.go('studio')
check('2 the studio gate',run("()=>flag('ch4-gate')===true"+QUIET,'2gate',1500) is True)
L.go('backlot')
check('3 fetch: the backlot opens',run("()=>flag('ch4-fetch')===true"+QUIET,'3fetch',1500) is True)
at('backlot',11,11)
check('4a Cue Card Crab (Battle 3)',run("()=>flag('battle:cuecrab')==='win'&&flag('ch4-main')===true"+QUIET,'4crab',2000) is True)
at('backlot',4,6)
check('4b Clapper Snapper (Battle 3)',run("()=>flag('battle:clapper')==='win'&&flag('ch4-west')===true"+QUIET,'4clapper',2000) is True)
at('backlot',13,4)
check('4c Boom Mic Moth (Battle 3)',run("()=>flag('battle:boommoth')==='win'&&flag('ch4-ny')===true"+QUIET,'4moth',2000) is True)
check('the three sets are done: ch4-sets',pg.evaluate("()=>!!flag('ch4-sets')"))
L.go('stage7')
check('5 Stage 7',run("()=>flag('ch4-stage')===true"+QUIET,'5stage',1500) is True)
pg.evaluate("()=>playScene('ch4Rig')"); pg.wait_for_timeout(800)
check('6 the rig',run("()=>flag('ch4-rig')===true"+QUIET,'6rig',1500) is True)
check('7 the hat',run("()=>flag('ch4-hatdone')===true"+QUIET,'7hat',2000) is True)
L.go('stageset')
check("8 The Director's Cut (Battle 3)",run("()=>flag('battle:directorscut')==='win'",'8boss',2500) is not False)
check('boss win set the kind flag',pg.evaluate("()=>!!flag('kind:directorscut')"))
check('9 after the boss',run("()=>flag('ch4-clear')===true"+QUIET,'9after',1500) is True)
check('hat coin given',pg.evaluate("()=>bag.includes('hatcoin')"))
L.go('stage7')
check('10 backup',run("()=>flag('ch4-backup')===true"+QUIET,'10backup',1500) is True)
L.go('studio')
check('11 end',run("()=>flag('ch4-done')===true"+QUIET,'11end',1500) is True)
pg.wait_for_timeout(2500); snap('12after'); print(L.state())
L.finish(4)
