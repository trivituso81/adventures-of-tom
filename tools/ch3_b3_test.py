# Chapter 3 "Paces & Peppers" on Battle 3 (b3s17b), start to finish from the chapter-select jump: the arrival, Boppy at the dock, the story, the
# pier, the Soggy Socks, the Tangle, the old reeds, the Snag, Sundial Hollow, Old Iron-Gill, the release and home. Every story fight is
# auto-played on Battle 3; frames and contact sheets go to the out dir.
# Usage: LAYOUT=portrait|landscape python3 tools/ch3_b3_test.py [outdir]
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import b3_chapter_lib as L
pg=L.start(3); run=L.run; check=L.check; at=L.at; snap=L.snap
QUIET="&&!intro.active&&!dialog.active"
run("()=>flag('ch3-goal')===true"+QUIET,'0arrive')
L.go('grands')
check('1 Boppy at the dock, he joins',run("()=>flag('ch3-boppy')===true&&party.some(p=>p.id==='boppy')"+QUIET,'1boppy',1500) is True)
at('row',12,18)
check('2 the 1970 story',run("()=>flag('ch3-story')===true"+QUIET,'2story',1500) is True)
at('pier',11,11)
check('3 the pier: Iron-Gill takes the jar',run("()=>flag('ch3-jar')===true"+QUIET,'3pier',1500) is True)
check('Boppy learned his Tombo flag (a flag only: Tombos are skins in stage 16)',pg.evaluate("()=>flag('tombo:boppy1')===true"))
at('reeds',21,11)
check('4 Soggy Socks (Battle 3)',run("()=>flag('battle:soggysock')==='win'"+QUIET,'4sock',2000) is True)
at('reeds',8,12)
check('5 the Tangle (Battle 3)',run("()=>flag('ch3-tuts')===true"+QUIET,'5tangle',2000) is True)
at('reeds',4,3)
check('6 the old reeds',run("()=>flag('ch3-wait')===true"+QUIET,'6wait',1500) is True)
check('7 the Snag (Battle 3)',run("()=>flag('ch3-snag')===true"+QUIET,'7snag',2000) is True)
L.go('sundial')
check('8 Sundial Hollow',run("()=>flag('ch3-coin')===true"+QUIET,'8hollow',1500) is True)
at('sundial',10,5)
check('9 the Deep Pool and Old Iron-Gill (Battle 3)',run("()=>flag('battle:irongill')==='win'",'9boss',2500) is not False)
check('boss win set the kind flag',pg.evaluate("()=>!!flag('kind:irongill')"))
check('10 after Iron-Gill',run("()=>flag('ch3-clear')===true"+QUIET,'10after',1500) is True)
check('Iron-Gill kind ending: the pepper jar is back',pg.evaluate("()=>bag.includes('pepperjar')"))
L.go('grands')
check('11 home',run("()=>flag('ch3-done')===true"+QUIET,'11home',1500) is True)
pg.wait_for_timeout(2500); snap('12after'); print(L.state())
L.finish(3)
