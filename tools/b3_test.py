# Battle 3 screen test: plays the NEW BATTLE Lab fights in a real browser and saves contact sheets of frames to look at.
# Usage (repo root):  python3 tools/b3_test.py            every fight in data/b3-lab.js
#                     python3 tools/b3_test.py new1       one fight
#                     python3 tools/b3_test.py s3         only the stage 3 section (The Big One: pips, Mark, Break, adds), about 5 min
#                     python3 tools/b3_test.py s4         only the stage 4 section (the Vibes screen, the Lab's Ranks, the save fields), about 2 min
# Env: CHROMIUM = chromium binary (optional), SEED = the fight's seed (default 7), OUT = folder for the sheets (default tools/shots).
#
# For each fight it checks, and prints FAILS: [] when all pass:
#   1. By hand, portrait, through the real screen (keys for Tom and Deedee, taps for Grace and Rose): BASIC, SKILLS, picking a
#      target from the list, tapping an enemy on the picture, tapping a party card. Deedee's Windex Spritz then a Clobber hit
#      must set off Hydro-Slip!, and the monster's face must move later on the turn bar. The fight is played to a win, and
#      CONTINUE must land back on the NEW BATTLE list.
#   2. The same seed played by the simple player on screen gives the same turn order as `node tools/b3-sim.js <fight> 1 --seed=N`,
#      and after every turn the first face on the bar is the unit that really acts next.
#   3. A fight the party loses (2% HP against 20x monster HP, with the monsters poked to 6 times their Speed) reaches the lose
#      screen. The Speed poke is there because a lone boss that acts once a round cannot out-pace four people using Pick-Me-Up
#      on each other: at 20x HP the simulator's fight against The Big One runs about 420 turns before the family loses.
#   4. Landscape: a turn by hand, frames of a whole fight, and EXIT back to the list.
#   5. Stage 2, once, on the Pond Grump fight (portrait, then a short pass in landscape): Zone One Blockade, "Giddyup, Tata!"
#      Launch and Wet-Floor Hazard from the SKILLS list; a monster slips and Tom's ward answers; the full status list opens by
#      tapping a party card and a monster, and shows every status when the card can only show 3; Pick-Me-Up revives; Suite Door
#      Slide takes a hit for Grace; Crunchy Sugar-Cube Pop cancels a wind-up. Monsters are aimed by pokes so every run shows each.
#   6. Stage 3, once, on The Big One (portrait, then a short pass in landscape): Composure pips show under the boss and a Pet Peeve
#      hit takes one; Big Glare Marks Rose (the MARKED chip on her card, the arrow over her head, both lists); Tom's Suite Door
#      Slide takes Swamp Chomp; Crunchy Sugar-Cube Pop cancels the next one; a Break cancels the third, shows BREAK!, tips the
#      boss's face on the turn bar and empties its pips, and they come back as its next turn begins; two adds walk in.
#   6b. Stage 4, once: NEW BATTLE > VIBES AND RANKS opens the Vibes screen (portrait); Main and Pocket trade places; the Rank picker;
#      the two Quirk slots; rows (the last one in Front is refused); keys and gamepad; a Lab fight then uses those Vibes (BASIC, the
#      SKILLS list with POCKET tags, the Lean, the rows) and a win pays Vibe Points, kept across a reload. Then the save: the new
#      fields are written, the pause menu's VIBES command opens the same screen (portrait and landscape), a change lands in the
#      autosave and in the Lab's book, save then load brings it back, and three old or broken saves load with fresh loadouts.
#   7. A battle 2 fight still starts and shows its own screen afterwards.
# Sheets: b3-<fight>-hand.png, b3-<fight>-slip.png and b3-<fight>-slip-bar.png (the Hydro-Slip! frames: the stage, and every turn bar
# stacked and doubled), b3-<fight>-lose.png, b3-<fight>-land.png, b3-s2-moves.png (the stage during the stage 2 moves),
# b3-s2-info.png (the status lists and Pick-Me-Up), b3-s2-land.png, b3-s3-mark.png (pips, the Mark, the bite taken and cancelled),
# b3-s3-break.png (the Break frames), b3-s3-info.png (the lists and the adds), b3-s3-land.png, b3-s4-lab.png (the Vibes screen from
# the Lab), b3-s4-fight.png (the fight with changed Vibes), b3-s4-menu.png (the pause menu's door, with a landscape frame), and three
# full-size frames: b3-s4-vibes-portrait.png, b3-s4-vibes-menu-landscape.png, b3-s4-menu-landscape.png, b3-s4-fight-skills.png.
import threading, http.server, socketserver, functools, os, sys, json, subprocess, io
from playwright.sync_api import sync_playwright
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
OUT=os.environ.get('OUT',os.path.join(HERE,'shots')); os.makedirs(OUT,exist_ok=True)
SEED=int(os.environ.get('SEED','7'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address=True; daemon_threads=True
    def handle_error(self,*a): pass
srv=Srv(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def shot(pg): return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
def sheet(frames,cols,path,scale=.5):
    if not frames: return
    w,h=frames[0].size; w2,h2=int(w*scale),int(h*scale); rows=(len(frames)+cols-1)//cols
    S=Image.new('RGB',(w2*cols,h2*rows),'#000')
    for k,f in enumerate(frames): S.paste(f.resize((w2,h2),Image.LANCZOS),((k%cols)*w2,(k//cols)*h2))
    S.save(path); print('  sheet',os.path.relpath(path,ROOT),len(frames),'frames')
def wait_cmd(pg,t=40000): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&(B3.actor||B3.ui==='done')",timeout=t)
def state(pg): return pg.evaluate("""()=>({ui:B3.ui,actor:B3.actor&&B3.actor.id,key:B3.actor&&B3.actor.key,pep:B3.actor&&B3.actor.pep,over:B3.F.over,
  foes:B3.F.foes.map(f=>({key:f.key,id:f.id,alive:!f.ko&&f.hp>0,hp:f.hp,drenched:!!f.st.drenched})),
  bar:[...document.querySelectorAll('#b3-bar .b2-tk')].map(e=>e.dataset.k+(e.classList.contains('now')?'!':'')+(e.classList.contains('ghost')?'?':'')),
  placed:B3.F.party.map(p=>p.placed),turns:B3.F.turnLog.length})""")
# Every test fight starts from the Lab's fresh loadouts (every Vibe at Rank 2), so Vibe Points won by an earlier test fight never
# change what the next one starts with. keep=True: use the Lab's book as it stands (the stage 4 section sets it up first).
def start(pg,idx,opt,keep=False): pg.evaluate("([i,o,keep])=>{ if(!keep) b3LabReset(); splash.active=false; document.getElementById('splash').hidden=true; b3Lab(i,o); }",[idx,opt,keep])
def tap_foe(pg,key):
    # the middle of that enemy, from canvas coordinates (576 x 324) to the page; works when the stage is turned a quarter turn too
    p=pg.evaluate("""(key)=>{ const b=b3FoeBox(key),cv=document.getElementById('battle-canvas'),r=cv.getBoundingClientRect(),u=b.x/576,v=(b.y-b.h/2)/324;
      return layout.rotated?{x:r.right-v*r.width,y:r.top+u*r.height}:{x:r.left+u*r.width,y:r.top+v*r.height}; }""",key)
    pg.mouse.click(p['x'],p['y'])
def errors(errs): return [e for e in errs if 'AudioContext' not in e and 'autoplay' not in e.lower() and 'Failed to load resource' not in e]

def hand_fight(pg,idx,fid):
    """Portrait, by hand. Returns the frames."""
    frames=[]; slip=[]; did={'skill':False,'slip':False,'tapfoe':False,'card':False,'keys':False}
    start(pg,idx,{'seed':SEED}); wait_cmd(pg); pg.wait_for_timeout(350)
    for turn in range(60):
        st=state(pg)
        if st['ui']=='done': break
        if not st['bar'] or not st['bar'][0].startswith(st['key']+'#') or not st['bar'][0].endswith('!'): fails.append(f"{fid} hand: the bar does not start with the actor: {st['bar'][:3]} vs {st['key']}")
        who=st['actor']; live=[f for f in st['foes'] if f['alive']]; wet=[f for f in live if f['drenched']]
        if len(frames)<10 or turn%4==0: frames.append(shot(pg))
        expect_slip=False
        if who=='grace' and not did['skill'] and st['pep']>=3:
            # SKILLS by taps: the first tap highlights the row and explains it, the second uses it; then a party card picks who.
            pg.click('#b3-cmd .b2-x.right'); pg.wait_for_timeout(250); frames.append(shot(pg))
            pg.dispatch_event('#b3-ui','pointerdown',{'pointerType':'touch'})
            pg.click('#b3-cmd .b2-btn[data-i="0"]'); pg.wait_for_timeout(250)
            if state(pg)['ui']!='target': fails.append(f'{fid} hand: tapping NeeDoh Stretch Pass did not open the target list')
            frames.append(shot(pg))
            pg.click('#b3-party .b2-pc[data-i="2"]'); did['skill']=True; did['card']=True
            pg.wait_for_timeout(1100); frames.append(shot(pg))
        else:
            if who=='deedee': tgt=([f for f in live if not f['drenched']] or live)[0]
            elif who in('grace','rose') and wet: tgt=wet[0]; expect_slip=True
            else: tgt=live[-1] if who=='tom' else ([f for f in live if not f['drenched']] or live)[-1]
            if who in('tom','deedee'):
                pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(200); did['keys']=True
                s2=state(pg)
                if s2['ui']=='target':
                    order=[f['key'] for f in live]
                    for _ in range(order.index(tgt['key'])): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(80)
                    if turn<3: frames.append(shot(pg))
                    pg.keyboard.press('Enter')
            else:
                pg.click('#b3-cmd .b2-x.up'); pg.wait_for_timeout(200)
                if state(pg)['ui']=='target': tap_foe(pg,tgt['key']); did['tapfoe']=True
            if expect_slip and not did['slip']:
                bar0=pg.evaluate("()=>B3.view.bar.map(e=>e.k)")
                for k in range(12): pg.wait_for_timeout(230); slip.append(shot(pg))
                log=pg.evaluate("()=>B3.log.slice(-6).join(' | ')")
                if 'Hydro-Slip!' in log: did['slip']=True
                else: fails.append(f'{fid} hand: a Clobber hit on a Drenched monster did not show Hydro-Slip!: {log}')
            else:
                pg.wait_for_timeout(800)
                if turn<6: frames.append(shot(pg))
        wait_cmd(pg); pg.wait_for_timeout(200)
    st=state(pg)
    if st['over']!='win': fails.append(f"{fid} hand: expected a win, got {st['over']}")
    pg.wait_for_timeout(500); frames.append(shot(pg))
    solo=pg.evaluate("()=>B3.F.foes.length")==1   # one monster: BASIC fires at once, so there is no target to tap
    for k,v in did.items():
        if not v and not(solo and k=='tapfoe'): fails.append(f'{fid} hand: never used {k}')
    pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(700)
    back=pg.evaluate("()=>({mode:splash.mode,active:splash.active,hidden:document.getElementById('battle').hidden,b3:B3.active,v3:!!battle.v3,cls:document.getElementById('battle').className})")
    if not(back['mode']=='lab3' and back['active'] and back['hidden'] and not back['b3'] and not back['v3']): fails.append(f'{fid} hand: CONTINUE did not land on the NEW BATTLE list: {back}')
    frames.append(shot(pg))
    sheet(frames,6,os.path.join(OUT,f'b3-{fid}-hand.png'))
    if slip:
        # the Hydro-Slip! frames: every turn bar stacked and doubled (the monster's face slides right), then the stage
        w,h=slip[0].size; bars=Image.new('RGB',(w*2,90*len(slip)),'#000')
        for k,f in enumerate(slip): bars.paste(f.crop((0,0,w,44)).resize((w*2,88),Image.LANCZOS),(0,k*90))
        bars.save(os.path.join(OUT,f'b3-{fid}-slip-bar.png')); print('  sheet',f'tools/shots/b3-{fid}-slip-bar.png',len(slip),'bars')
        sheet([f.crop((0,44,w,294)) for f in slip],4,os.path.join(OUT,f'b3-{fid}-slip.png'),scale=1)

def who(pg): return pg.evaluate("()=>B3.actor&&B3.actor.id")
def burst(pg,n,gap=260,rot=False):
    fr=[]
    for k in range(n):
        pg.wait_for_timeout(gap); f=shot(pg); fr.append(f.rotate(90,expand=True) if rot else f)
    return fr
def skill(pg,name):
    """Opens SKILLS with the keys and puts the cursor on a Skill. Returns the names in the list."""
    pg.mouse.move(2,2)   # a mouse left resting over the list would move the cursor to the row under it
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(220)
    names=pg.evaluate("()=>[...document.querySelectorAll('#b3-cmd .b2-btn .b2-sn')].map(e=>e.textContent)")
    if name not in names: fails.append(f'stage 2: {name} is not in the SKILLS list: {names}'); return names
    for _ in range(names.index(name)): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(80)
    return names
def basic(pg):
    pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(200)
    if pg.evaluate("()=>B3.ui")=='target': pg.keyboard.press('Enter')
def log(pg,n=30): return pg.evaluate("(n)=>B3.log.slice(-n).join(' | ')",n)
# The stage 2 and stage 3 sections are scripted turn by turn against the bare units those stages built (cfg.plain: first Vibe only,
# no Lean, so everyone has Speed 100 and the family acts Grace, Tom, Rose, Deedee). They test those stages' moves and screens, not
# loadouts; the hand-played fights above and the stage 4 section use real loadouts.
POKE_ROWS="""()=>{ B3_STATUS.t_taunt={id:'t_taunt',name:'Test taunt',kind:'buff',group:null,dur:{n:99,unit:'turn'},mods:[],flags:['taunt'],short:'TAUNT',color:'#fff',weight:0,desc:'Test: monsters aim here.'};
  for(const f of B3.F.foes) f.hp=f.maxHp=9999; b3ViewSync(); b3Render(); }"""
def stage2_fight(pg,idx):
    """Portrait. The stage 2 moves through the real screen, with the monsters aimed by pokes. Returns nothing; writes sheets."""
    S='stage 2: '; fr=[]; info=[]
    start(pg,idx,{'seed':SEED,'plain':True}); wait_cmd(pg); pg.wait_for_timeout(300); pg.evaluate(POKE_ROWS)
    if who(pg)!='grace': fails.append(S+f'expected Grace first, got {who(pg)}')
    basic(pg); wait_cmd(pg); pg.wait_for_timeout(150)
    # Tom: Zone One Blockade
    names=skill(pg,'Zone One Blockade'); fr.append(shot(pg))
    if names!=['Zone One Blockade','Suite Door Slide']: fails.append(S+f"Tom's SKILLS list: {names}")
    pg.keyboard.press('Enter'); fr+=burst(pg,4); wait_cmd(pg)
    if not pg.evaluate("()=>B3.view.u.p1.st.includes('zone_one')&&B3.F.party[1].pep===2"): fails.append(S+'Zone One Blockade is not on Tom, or did not cost 2 Pep')
    if 'BLOCKADE' not in pg.inner_text('#b3-party .b2-pc[data-i="1"]'): fails.append(S+"Tom's card does not show BLOCKADE")
    # Rose: "Giddyup, Tata!" Launch on the first monster
    skill(pg,'"Giddyup, Tata!" Launch'); pg.keyboard.press('Enter'); pg.wait_for_timeout(220); pg.keyboard.press('Enter'); fr+=burst(pg,7); wait_cmd(pg)
    if not pg.evaluate("()=>B3.view.u.p3.st.includes('giddyup')&&B3.view.u.f0.st.includes('toasty')"): fails.append(S+'Giddyup did not buff Deedee or leave Toasty')
    # Deedee: Wet-Floor Hazard, then the Mudling's melee Wobble at Tom
    skill(pg,'Wet-Floor Hazard'); pg.keyboard.press('Enter'); fr+=burst(pg,4)
    if pg.evaluate("()=>B3.view.haz.length")!=1: fails.append(S+'the wet floor is not on the screen')
    pg.evaluate("()=>{ b3AddStatus(B3.F,B3.F.party[1],'t_taunt',{}); B3.F.foes[1].actIx=0; B3.F.foes[0].actIx=0; }")
    fr+=burst(pg,26,240); wait_cmd(pg); L=log(pg)
    if 'slips on the wet floor' not in L: fails.append(S+'no monster slipped: '+L[-300:])
    if 'Tom: Zone One Blockade!' not in L: fails.append(S+"Tom's ward did not answer: "+L[-300:])
    if pg.evaluate("()=>B3.view.haz[0]&&B3.view.haz[0].uses")!=1: fails.append(S+'the wet floor should have 1 slip left')
    # The full list: Tom's card, a monster, the keys
    pg.click('#b3-party .b2-pc[data-i="1"]'); pg.wait_for_timeout(300); info.append(shot(pg)); T=pg.inner_text('#b3-cmd')
    if pg.evaluate("()=>B3.ui")!='info' or 'Zone One Blockade' not in T or 'turn' not in T: fails.append(S+"tapping Tom's card did not open his list: "+T[:200])
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); info.append(shot(pg)); T=pg.inner_text('#b3-cmd')
    v=pg.evaluate("()=>({ui:B3.ui,key:B3.infoKey,rows:document.querySelectorAll('#b3-cmd .b3-inf').length,want:b3Carried(B3.F,B3.F.foes[0]).length})")
    if v['ui']!='info' or v['key']!='f0' or v['rows']!=v['want'] or 'Wet Floor' not in T: fails.append(S+f'tapping a monster did not open its list: {v} {T[:160]}')
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>B3.infoKey")=='f0': fails.append(S+'the down key did not step to the next unit')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>B3.ui")!='cross': fails.append(S+'Esc did not close the list')
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>[B3.ui,B3.infoKey]")!=['info',pg.evaluate("()=>B3.actor.key")]: fails.append(S+'the I key did not open the list on whoever is up')
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(150)
    # The 3-icon rule: six statuses on Grace, 3 chips on her card, all six in her list
    pg.evaluate("()=>{ const g=B3.F.party[0]; for(const id of ['drenched','slow','fatigue','windexed','stress_melted','giddyup']) b3AddStatus(B3.F,g,id,{}); b3ViewSync(); b3Render(); }")
    chips=pg.evaluate("()=>document.querySelectorAll('#b3-party .b2-pc[data-i=\"0\"] .b3-chips .b2-st').length")
    pg.click('#b3-party .b2-pc[data-i="0"]'); pg.wait_for_timeout(250); info.append(shot(pg))
    rows=pg.evaluate("()=>document.querySelectorAll('#b3-cmd .b3-inf').length")
    if chips!=3 or rows!=6: fails.append(S+f'six statuses should show 3 icons and 6 list rows, got {chips} and {rows}')
    pg.evaluate("()=>{ const g=B3.F.party[0]; for(const id of Object.keys(g.st)) b3EndStatus(B3.F,g,id); b3ViewSync(); b3Back(); }"); pg.wait_for_timeout(150)
    # Pick-Me-Up: Rose is knocked out by a poke; Grace revives her from the SKILLS list
    pg.evaluate("()=>{ const r=B3.F.party[2]; r.hp=0; const b=[]; b3KoCheck(B3.F,{actor:B3.F.foes[0],beats:b,g:'pre'}); for(const x of b) b3Show(x); b3ViewSync(); B3.actor.pep=10; b3Render(); }")
    pg.wait_for_timeout(400); names=skill(pg,'Pick-Me-Up'); info.append(shot(pg))
    pg.keyboard.press('Enter'); info+=burst(pg,5); wait_cmd(pg); info.append(shot(pg))   # one member is down, so there is nobody to choose between
    v=pg.evaluate("()=>({ko:B3.F.party[2].ko,hp:B3.F.party[2].hp,view:B3.view.u.p2.ko,bar:B3.view.bar.some(e=>e.k==='p2')})")
    if v['ko'] or v['view'] or v['hp']!=29 or not v['bar']: fails.append(S+f'Pick-Me-Up did not bring Rose back at 29 HP and onto the bar: {v}')
    # Suite Door Slide: the Pond Grump's Bog Splash is aimed at Grace and lands on Tom
    for turn in range(8):
        if who(pg)=='tom': break
        basic(pg); wait_cmd(pg); pg.wait_for_timeout(120)
    pg.evaluate("()=>{ B3.actor.pep=10; b3Render(); }"); skill(pg,'Suite Door Slide'); pg.keyboard.press('Enter'); fr+=burst(pg,4); wait_cmd(pg)
    if not pg.evaluate("()=>!!B3.F.party[0].st.suite_door&&!!B3.F.party[2].st.suite_door&&!B3.F.party[3].st.suite_door"): fails.append(S+'Suite Door Slide should cover Grace and Rose only')
    pg.evaluate("()=>{ b3EndStatus(B3.F,B3.F.party[1],'t_taunt'); b3AddStatus(B3.F,B3.F.party[0],'t_taunt',{}); B3.F.foes[0].charge=null; B3.F.foes[0].actIx=1; B3.F.foes[1].actIx=1; b3ViewSync(); }")
    hp0=pg.evaluate("()=>B3.F.party[0].hp")
    for turn in range(8):
        if 'steps in for Grace' in log(pg,12): break
        basic(pg); fr+=burst(pg,9,250); wait_cmd(pg)
    if 'Tom steps in for Grace' not in log(pg,16): fails.append(S+'Tom never stepped in for Grace: '+log(pg,10)[-300:])
    if pg.evaluate("()=>B3.F.party[0].hp")!=hp0: fails.append(S+'Grace lost HP behind the suite door')
    # Crunchy Sugar-Cube Pop: the Pond Grump is winding up Soggy Slap (a poke); Grace cancels it
    for turn in range(8):
        if who(pg)=='grace': break
        basic(pg); wait_cmd(pg); pg.wait_for_timeout(120)
    pg.evaluate("()=>{ const f=B3.F.foes[0]; f.charge=f.D.acts[2]; B3.actor.pep=10; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(200)
    skill(pg,'Crunchy Sugar-Cube Pop'); pg.keyboard.press('Enter'); pg.wait_for_timeout(250); fr.append(shot(pg)); pg.keyboard.press('Enter'); fr+=burst(pg,6); wait_cmd(pg)
    if 'It was cancelled' not in log(pg,10) or pg.evaluate("()=>!!B3.F.foes[0].charge"): fails.append(S+'Crunchy Sugar-Cube Pop did not cancel the wind-up: '+log(pg,8)[-240:])
    # Finish: the simple player takes over against 1 HP monsters
    pg.evaluate("()=>{ for(const f of B3.F.foes) f.hp=1; b3ViewSync(); B3.cfg.auto=true; const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }")
    pg.wait_for_function("()=>B3.ui==='done'",timeout=60000); pg.wait_for_timeout(400); fr.append(shot(pg))
    if pg.evaluate("()=>B3.F.over")!='win': fails.append(S+'the fight did not end in a win')
    pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(600)
    if pg.evaluate("()=>splash.mode")!='lab3': fails.append(S+'CONTINUE did not go back to the list')
    w=fr[0].size[0]; sheet([f.crop((0,0,w,300)) for f in fr],6,os.path.join(OUT,'b3-s2-moves.png'),scale=.75)
    sheet(info,5,os.path.join(OUT,'b3-s2-info.png'),scale=.6)
def stage2_land(pg,idx):
    """Landscape: the SKILLS list, a ward, the status list."""
    S='stage 2 landscape: '; fr=[]
    pg.evaluate("()=>{ B7.speed=1; toggleLayout(); }"); pg.wait_for_timeout(500); rot=pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    start(pg,idx,{'seed':SEED,'plain':True}); wait_cmd(pg); pg.wait_for_timeout(300); pg.evaluate(POKE_ROWS)
    basic(pg); wait_cmd(pg); pg.wait_for_timeout(150)
    skill(pg,'Zone One Blockade'); fr.append(R(shot(pg))); pg.keyboard.press('Enter'); fr+=burst(pg,3,rot=rot); wait_cmd(pg)
    basic(pg); wait_cmd(pg); pg.wait_for_timeout(150)
    skill(pg,'Wet-Floor Hazard'); fr.append(R(shot(pg))); pg.keyboard.press('Enter'); fr+=burst(pg,3,rot=rot)
    pg.evaluate("()=>{ b3AddStatus(B3.F,B3.F.party[1],'t_taunt',{}); B3.F.foes[1].actIx=0; B3.F.foes[0].actIx=0; }")
    fr+=burst(pg,14,330,rot=rot); wait_cmd(pg)
    if 'Tom: Zone One Blockade!' not in log(pg): fails.append(S+"Tom's ward did not answer")
    pg.click('#b3-party .b2-pc[data-i="1"]'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.ui")!='info': fails.append(S+"tapping Tom's card did not open his list")
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.infoKey")!='f0': fails.append(S+'tapping a monster did not open its list')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); pg.click('#b3-exit'); pg.wait_for_timeout(500)
    if pg.evaluate("()=>splash.mode")!='lab3' or pg.evaluate("()=>B3.active"): fails.append(S+'EXIT did not go back to the list')
    sheet(fr,4,os.path.join(OUT,'b3-s2-land.png'),scale=.6)
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)

# Stage 3 pokes: count the Breaks and the Marks on Rose as they are shown, and (while `keep` is set) top the boss's pips up at
# every family turn, so that the scripted Mark steps are not cut short by a Break that the family's own hits bring on.
S3_HOOK="""()=>{ window.__s3={brk:0,marks:0,keep:false}; if(!window.__s3wrap){ window.__s3wrap=1;
  const os=b3Show; b3Show=function(b){ if(b.t==='break') window.__s3.brk++; if(b.t==='telegraph'&&b.mark==='p2') window.__s3.marks++; return os.apply(this,arguments); };
  const oo=b3Open; b3Open=function(m){ if(window.__s3.keep&&B3.F&&m==='cross'){ const f=B3.F.foes[0]; if(f.maxPips&&!f.broken&&!f.flusterTurn){ f.pips=f.maxPips; f.pipLock=false; b3ViewSync(); } } return oo.apply(this,arguments); }; } }"""
def glare_at_rose(pg,S,fr,n):
    """Pokes The Big One into Big Glare at Rose and plays Basics until it has Marked her n times in all."""
    pg.evaluate("()=>{ const f=B3.F.foes[0]; b3AddStatus(B3.F,B3.F.party[2],'t_taunt',{}); f.actIx=0; f.charge=null; f.mark=null; f.wait=Math.min(f.wait,1); }")
    for turn in range(8):
        if pg.evaluate("()=>window.__s3.marks")>=n: break
        basic(pg); fr+=burst(pg,7,260); wait_cmd(pg)
    else: fails.append(S+f'The Big One never Marked Rose (time {n}): '+log(pg,8)[-300:])
    pg.evaluate("()=>{ b3EndStatus(B3.F,B3.F.party[2],'t_taunt'); b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(150)
def hold(pg,ticks=160):
    """Keeps the boss's next turn back until the whole family has had a turn (they all act inside 100 ticks)."""
    pg.evaluate("(n)=>{ B3.F.foes[0].wait=n; b3Render(); }",ticks); pg.wait_for_timeout(100)
def breaks(pg): return pg.evaluate("()=>window.__s3.brk")
def marked(pg): return pg.evaluate("()=>({mark:B3.view.mark.f0||null,charge:B3.view.charge.f0||null,chip:document.querySelector('#b3-party .b2-pc[data-i=\"2\"]').innerText.includes('MARKED'),real:B3.F.foes[0].mark,rc:B3.F.foes[0].charge&&B3.F.foes[0].charge.id})")
def stage3_fight(pg,idx):
    """Portrait, The Big One. Composure, the Mark and its three answers, a Break, and adds. Monsters are aimed by pokes."""
    S='stage 3: '; fr=[]; brk=[]; info=[]
    start(pg,idx,{'seed':SEED,'plain':True}); wait_cmd(pg); pg.wait_for_timeout(300); pg.evaluate(POKE_ROWS); pg.evaluate(S3_HOOK)
    v=pg.evaluate("()=>[B3.view.u.f0.pips,B3.view.u.f0.maxPips,B3.view.u.f0.st.includes('muffin_crown')]")
    if v!=[6,6,True]: fails.append(S+f'The Big One should start with 6 of 6 pips and its crown: {v}')
    fr.append(shot(pg))
    basic(pg); wait_cmd(pg); pg.wait_for_timeout(150)                      # Grace
    if who(pg)!='tom': fails.append(S+f'expected Tom second, got {who(pg)}')
    basic(pg); fr+=burst(pg,6,250); wait_cmd(pg)                          # Tom: Racket is its Pet Peeve
    if pg.evaluate("()=>B3.view.u.f0.pips")!=5: fails.append(S+'a Pet Peeve hit did not take 1 pip on screen')
    # Big Glare at Rose: the Mark
    shot(pg).save(os.path.join(OUT,'b3-s3-pips.png'))
    pg.evaluate("()=>{ window.__s3.keep=true; }")
    glare_at_rose(pg,S,fr,1); m=marked(pg); fr.append(shot(pg)); shot(pg).save(os.path.join(OUT,'b3-s3-marked.png'))
    if m!={'mark':'p2','charge':'Swamp Chomp','chip':True,'real':'p2','rc':'swamp_chomp'}: fails.append(S+f'after Big Glare the screen should show Rose Marked for Swamp Chomp: {m}')
    if not pg.evaluate("()=>!!document.querySelector('#b3-bar .b2-tk.foe .b2-int')"): fails.append(S+'the boss has no wind-up badge on the turn bar')
    hold(pg)
    pg.click('#b3-party .b2-pc[data-i="2"]'); pg.wait_for_timeout(300); info.append(shot(pg)); T=pg.inner_text('#b3-cmd')
    if 'Marked' not in T or 'Swamp Chomp' not in T: fails.append(S+"Rose's list does not say who Marked her: "+T[:200])
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); info.append(shot(pg)); T=pg.inner_text('#b3-cmd')
    if 'Composure' not in T or 'Winding up Swamp Chomp' not in T or 'aimed at Rose' not in T: fails.append(S+"the boss's list does not show Composure and the wind-up: "+T[:260])
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    # Answer 1: Tom's Suite Door Slide takes the bite
    for turn in range(6):
        if who(pg)=='tom': break
        basic(pg); wait_cmd(pg); pg.wait_for_timeout(120)
    pg.evaluate("()=>{ B3.actor.pep=10; b3Render(); }"); skill(pg,'Suite Door Slide'); pg.keyboard.press('Enter'); fr+=burst(pg,4); wait_cmd(pg)
    hp0=pg.evaluate("()=>B3.F.party[2].hp"); pg.evaluate("()=>{ B3.F.foes[0].wait=1; }")
    for turn in range(6):
        if 'Tom steps in for Rose' in log(pg,14): break
        basic(pg); fr+=burst(pg,9,250); wait_cmd(pg)
    L=log(pg,16)
    if 'Tom steps in for Rose' not in L or 'The Big One uses Swamp Chomp.' not in L: fails.append(S+'Tom did not take Swamp Chomp for Rose: '+L[-300:])
    if pg.evaluate("()=>B3.F.party[2].hp")!=hp0: fails.append(S+'Rose lost HP to the bite Tom took')
    m=marked(pg)
    if m['mark'] or m['chip'] or m['real'] or m['charge']: fails.append(S+f'the Mark should be gone after the bite: {m}')
    # Answer 2: Grace's Crunchy Sugar-Cube Pop cancels it
    glare_at_rose(pg,S,fr,2); hold(pg)
    for turn in range(6):
        if who(pg)=='grace': break
        basic(pg); wait_cmd(pg); pg.wait_for_timeout(120)
    pg.evaluate("()=>{ B3.actor.pep=10; b3Render(); }"); skill(pg,'Crunchy Sugar-Cube Pop'); fr.append(shot(pg)); pg.keyboard.press('Enter'); pg.wait_for_timeout(220)
    if pg.evaluate("()=>B3.ui")=='target': pg.keyboard.press('Enter')
    fr+=burst(pg,7); wait_cmd(pg); m=marked(pg)
    if 'loses Swamp Chomp. It was cancelled' not in log(pg,10) or m['mark'] or m['chip'] or m['real'] or m['rc']: fails.append(S+f'Crunchy Sugar-Cube Pop did not cancel the bite and the Mark: {m} '+log(pg,6)[-240:])
    # Answer 3: a Break cancels it. The boss is down to its last pip (a poke); the next pip off Breaks it.
    glare_at_rose(pg,S,fr,3); hold(pg,95); n0=breaks(pg)
    pg.evaluate("()=>{ window.__s3.keep=false; const f=B3.F.foes[0]; f.pips=1; f.pipLock=false; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(200); brk.append(shot(pg))
    for turn in range(6):
        if breaks(pg)>n0: break
        basic(pg); brk+=burst(pg,10,220); wait_cmd(pg)
    shot(pg).save(os.path.join(OUT,'b3-s3-flustered.png'))
    L=log(pg,14); v=pg.evaluate("()=>({fl:B3.view.u.f0.st.includes('flustered'),pips:B3.view.u.f0.pips,bar:!!document.querySelector('#b3-bar .b2-tk.b3-flus'),badge:(document.querySelector('#b3-bar .b2-tk.b3-flus .b2-int')||{}).textContent,lock:B3.F.foes[0].pipLock,guard:B3.F.foes[0].st.flustered&&true})")
    if breaks(pg)!=n0+1 or 'BREAK!' not in L or 'loses Swamp Chomp' not in L: fails.append(S+'the Break did not show, or did not cancel the wind-up: '+L[-300:])
    if not(v['fl'] and v['pips']==0 and v['bar'] and v['badge']=='BREAK' and v['lock']): fails.append(S+f'after the Break the screen should show a Flustered boss with empty pips and a tipped face on the bar: {v}')
    m=marked(pg)
    if m['mark'] or m['chip'] or m['real']: fails.append(S+f'the Mark should be gone after the Break: {m}')
    brk.append(shot(pg))
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); info.append(shot(pg)); T=pg.inner_text('#b3-cmd')
    if 'Flustered' not in T or 'until its next turn' not in T or '0 OF 6' not in T: fails.append(S+"the boss's list does not show Flustered: "+T[:260])
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    # Its next turn begins: Flustered ends and the pips are back
    pg.evaluate("()=>{ B3.F.foes[0].wait=Math.min(B3.F.foes[0].wait,1); }")
    for turn in range(6):
        if pg.evaluate("()=>B3.view.u.f0.pips")==6: break
        basic(pg); brk+=burst(pg,8,250); wait_cmd(pg)
    v=pg.evaluate("()=>[B3.view.u.f0.pips,B3.view.u.f0.st.includes('flustered'),!!document.querySelector('#b3-bar .b2-tk.b3-flus')]")
    if v!=[6,False,False]: fails.append(S+f'on its next turn the pips should be back and Flustered gone: {v}')
    # Adds walk in (a poke: no chapter 1 monster calls any)
    pg.evaluate("""()=>{ const F=B3.F,c={F,actor:F.foes[0],beats:[],g:'pre',rec:0,targets:[],hit:[],detonated:{}};
      b3RunEffects(F,c,[{op:'summon',id:'mudling',row:'front',n:2},{op:'summon',id:'skeeter',row:'back'}]); for(const b of c.beats) b3Show(b); b3Render(); }""")
    pg.wait_for_timeout(900); info.append(shot(pg)); shot(pg).save(os.path.join(OUT,'b3-s3-adds.png'))
    v=pg.evaluate("()=>({n:B3.F.foes.length,laid:['f1','f2','f3'].every(k=>!!B3P.foe[k]),names:B3.F.foes.map(f=>f.name),hp:B3.F.foes[1].maxHp,bar:B3.view.bar.some(e=>e.k==='f1')})")
    if not(v['n']==4 and v['laid'] and v['names'][1:]==['Mudling A','Mudling B','Skeeter Swarm'] and v['hp']==30): fails.append(S+f'the adds did not join as expected: {v}')
    tap_foe(pg,'f3'); pg.wait_for_timeout(300); info.append(shot(pg))
    if pg.evaluate("()=>B3.infoKey")!='f3': fails.append(S+'tapping an add did not open its list')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(250)
    if pg.evaluate("()=>B3.ui")!='target' or pg.evaluate("()=>B3.opts.length")!=4: fails.append(S+'the target list should offer the boss and the three adds')
    info.append(shot(pg)); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    # Finish: the simple player takes over against 1 HP monsters
    pg.evaluate("()=>{ for(const f of B3.F.foes) f.hp=1; b3ViewSync(); B3.cfg.auto=true; const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }")
    pg.wait_for_function("()=>B3.ui==='done'",timeout=90000); pg.wait_for_timeout(400); fr.append(shot(pg))
    if pg.evaluate("()=>B3.F.over")!='win': fails.append(S+'the fight did not end in a win')
    pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(600)
    if pg.evaluate("()=>splash.mode")!='lab3': fails.append(S+'CONTINUE did not go back to the list')
    w=fr[0].size[0]
    sheet([f.crop((0,0,w,300)) for f in fr][::2],6,os.path.join(OUT,'b3-s3-mark.png'),scale=.75)
    sheet([f.crop((0,0,w,300)) for f in brk],6,os.path.join(OUT,'b3-s3-break.png'),scale=.75)
    sheet(info,4,os.path.join(OUT,'b3-s3-info.png'),scale=.6)
def stage3_land(pg,idx):
    """Landscape: the pips, the Mark, a Break."""
    S='stage 3 landscape: '; fr=[]
    pg.evaluate("()=>{ B7.speed=1; toggleLayout(); }"); pg.wait_for_timeout(500); rot=pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    start(pg,idx,{'seed':SEED,'plain':True}); wait_cmd(pg); pg.wait_for_timeout(300); pg.evaluate(POKE_ROWS); pg.evaluate(S3_HOOK)
    fr.append(R(shot(pg)))
    glare_at_rose(pg,S,[],1); hold(pg,95); fr.append(R(shot(pg))); m=marked(pg)
    if not(m['mark']=='p2' and m['chip']): fails.append(S+f'Rose is not shown Marked: {m}')
    pg.click('#b3-party .b2-pc[data-i="2"]'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.ui")!='info': fails.append(S+"tapping Rose's card did not open her list")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    pg.evaluate("()=>{ const f=B3.F.foes[0]; f.pips=1; f.pipLock=false; b3ViewSync(); b3Render(); }")
    for turn in range(6):
        if breaks(pg): break
        basic(pg); fr+=burst(pg,5,300,rot=rot); wait_cmd(pg)
    R(shot(pg)).save(os.path.join(OUT,'b3-s3-land-break.png'))
    if not breaks(pg) or not pg.evaluate("()=>!!document.querySelector('#b3-bar .b2-tk.b3-flus')"): fails.append(S+'no Break on screen')
    fr.append(R(shot(pg)))
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.infoKey")!='f0': fails.append(S+'tapping the boss did not open its list')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); pg.click('#b3-exit'); pg.wait_for_timeout(500)
    if pg.evaluate("()=>splash.mode")!='lab3' or pg.evaluate("()=>B3.active"): fails.append(S+'EXIT did not go back to the list')
    sheet(fr,4,os.path.join(OUT,'b3-s3-land.png'),scale=.6)
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)

FAST_FOES="()=>{ for(const f of B3.F.foes) { f.spd*=6; f.wait/=6; } }"
def auto_fight(pg,idx,fid,opt,frames=None,every=450,poke=None):
    """The simple player on screen. Records every turn and the bar after every turn."""
    pg.evaluate("""()=>{ window.__b3={ends:[],turns:[]}; if(!window.__b3wrap){ window.__b3wrap=1; const os=b3Show; b3Show=function(b){ if(b.t==='endTurn') window.__b3.ends.push(b.bar.length?b.bar[0].k:null); if(b.t==='turn') window.__b3.turns.push(b.who); return os.apply(this,arguments); }; } }""")
    start(pg,idx,dict(opt,auto=True))
    if poke: pg.evaluate(poke)
    for k in range(400):
        pg.wait_for_timeout(every)
        if frames is not None and len(frames)<24: frames.append(shot(pg))
        if pg.evaluate("()=>B3.ui==='done'"): break
    else: fails.append(f'{fid}: the auto fight did not finish')
    pg.wait_for_timeout(400)
    if frames is not None: frames.append(shot(pg))
    return pg.evaluate("()=>({over:B3.F.over,order:B3.F.turnLog,rounds:B3.F.clock/100,ends:window.__b3.ends,turns:window.__b3.turns})")

# ---------- Stage 4: the Vibes screen, the Lab's Ranks, the save fields ----------
def vib(pg,k,wait=230): pg.click(f'#b3-vibes [data-k="{k}"]'); pg.wait_for_timeout(wait)
def vstate(pg): return pg.evaluate("""()=>({open:B3V.open,door:B3V.door,sel:B3V.sel,say:document.querySelector('#b3-vibes .b3v-say').textContent,head:document.querySelector('#b3-vibes .b3v-title span').textContent,
  hidden:document.getElementById('b3-vibes').hidden,focus:document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.k||null:null,
  tabs:[...document.querySelectorAll('#b3-vibes .b3v-tab span')].map(e=>e.textContent),
  cards:[...document.querySelectorAll('#b3-vibes .b3v-card')].map(c=>({role:c.querySelector('.b3v-role').textContent,name:c.querySelector('.b3v-ct b').textContent,vp:c.querySelector('.b3v-vp').textContent,
    live:[...c.querySelectorAll('.b3v-row.live span')].map(e=>e.textContent),rows:c.querySelectorAll('.b3v-row').length})),
  slots:[...document.querySelectorAll('#b3-vibes .b3v-slots')].map(r=>[...r.querySelectorAll('.b3v-slot')].map(b=>b.querySelector('b').textContent+(b.classList.contains('on')?'*':''))),
  rank:[...document.querySelectorAll('#b3-vibes .b3v-rk.on')].map(e=>e.textContent),picks:[...document.querySelectorAll('#b3-vibes .b3v-q b')].map(e=>e.textContent)})""")
def vbottom(pg): pg.evaluate("()=>{ document.querySelector('#b3-vibes .b3v-body').scrollTop=99999; }"); pg.wait_for_timeout(120)
def stage4(pg,lab):
    S='stage 4: '; fr=[]; ff=[]
    def need(cond,what):
        if not cond: fails.append(S+what)
    # --- The Lab's door: NEW BATTLE > VIBES AND RANKS ---
    pg.evaluate("()=>{ b3LabReset(); const el=document.getElementById('splash'); el.hidden=false; el.classList.remove('out'); splash.active=true; splashSetMode('lab3'); }"); pg.wait_for_timeout(300)
    names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
    need('VIBES AND RANKS' in names and names[-1]=='BACK',f'the NEW BATTLE list has no VIBES AND RANKS row: {names}')
    box=pg.evaluate("()=>{ const b=[...document.querySelectorAll('#splash .sp-choice')].find(e=>e.textContent.includes('VIBES AND RANKS')),r=b.getBoundingClientRect(),c=document.querySelector('#splash .sp-choices').getBoundingClientRect(); return r.bottom<=c.bottom+1&&r.top>=c.top-1; }")
    need(box,'VIBES AND RANKS is not fully on screen on the NEW BATTLE list')
    fr.append(shot(pg))
    pg.click('#splash .sp-choice:has-text("VIBES AND RANKS")'); pg.wait_for_timeout(450); v=vstate(pg); fr.append(shot(pg))
    need(v['open'] and not v['hidden'] and v['door']=='lab',f'the Vibes screen did not open from the Lab: {v}')
    need(v['tabs']==['TOM','GRACE','ROSE','DEEDEE'],f"the Lab's Vibes screen should list Tom, Grace, Rose and Deedee: {v['tabs']}")
    need(v['rank']==['2'],f"the Lab starts with every Vibe at Rank 2: {v['rank']}")
    c=v['cards']
    need(len(c)==2 and c[0]['role']=='MAIN VIBE' and c[0]['name']=='Frequent Flier' and '60 / 220 VP' in c[0]['vp'] and c[0]['rows']==7,f'Tom\'s Main Vibe card is wrong: {c[:1]}')
    need(c[0]['live']==['Lounge Pass Flex','Zone One Blockade','Suite Door Slide'],f"what is in use from the Main Vibe at Rank 2: {c[0]['live']}")
    need(c[1]['role']=='POCKET VIBE' and c[1]['name']=='Gamer Geek' and c[1]['live']==['Controller Toss'],f'the Pocket Vibe adds only its unlocked Skills: {c[1:]}')
    vib(pg,'row-tom_flier-suite_door_slide'); v=vstate(pg); need('Skill, 3 Pep' in v['say'] and 'Tom' in v['say'],f"tapping a Skill row should say what it does: {v['say']}")
    vib(pg,'row-tom_flier-upgrade_certificate'); v=vstate(pg); need('Unlocks at Rank 3 (220 Vibe Points)' in v['say'],f"a locked Quirk should say when it unlocks: {v['say']}")
    # Main and Pocket trade places
    vib(pg,'main-tom_gamer',350); v=vstate(pg); c=v['cards']; fr.append(shot(pg))
    need(c[0]['role']=='MAIN VIBE' and c[0]['name']=='Gamer Geek' and c[0]['live']==['Cartridge Blow','Controller Toss'],f'MAKE MAIN on Gamer Geek: {c[:1]}')
    need(c[1]['role']=='POCKET VIBE' and c[1]['name']=='Frequent Flier' and c[1]['live']==['Zone One Blockade','Suite Door Slide'],f'Frequent Flier should now be the Pocket Vibe: {c[1:]}')
    kept=pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-b3-lab')).book.tom")
    need(kept['main']=='tom_gamer' and kept['pocket']=='tom_flier',f"the Lab's change is kept on the device at once: {kept}")
    # The Rank picker and the Quirk slots
    vib(pg,'rank-5'); v=vstate(pg); need(v['rank']==['5'] and all('MASTERED' in x['vp'] for x in v['cards']),f"Rank 5 for every Vibe: {v['rank']} {[x['vp'] for x in v['cards']]}")
    vbottom(pg); vib(pg,'quirk-0',350); v=vstate(pg); fr.append(shot(pg))
    need(v['picks']==['Elixir Hoarder','New Game Plus','Upgrade Certificate','Million-Miler Status','EMPTY','BACK'] or sorted(v['picks'][:4])==sorted(['Elixir Hoarder','New Game Plus','Upgrade Certificate','Million-Miler Status']),f"the Quirk list at Rank 5 should hold Tom's four Quirks: {v['picks']}")
    vib(pg,'pick-upgrade_certificate',350); vbottom(pg); v=vstate(pg); need(v['slots'][0]==['Upgrade Certificate*','Empty'],f"picking a Quirk fills the slot: {v['slots']}")
    vib(pg,'quirk-1',300); vib(pg,'pick-upgrade_certificate',300); vbottom(pg); v=vstate(pg); need(v['slots'][0]==['Empty','Upgrade Certificate*'],f"the same Quirk in the other slot moves it: {v['slots']}")
    vib(pg,'quirk-0',300); vib(pg,'pick-elixir_hoarder',300); vbottom(pg); v=vstate(pg); fr.append(shot(pg)); need(v['slots'][0]==['Elixir Hoarder*','Upgrade Certificate*'],f"two Quirks from two Vibes: {v['slots']}")
    vib(pg,'quirk-0',300); pg.keyboard.press('Escape'); pg.wait_for_timeout(250); v=vstate(pg); need(v['open'] and not v['picks'],f'Esc in the Quirk list should go back to the Vibes, not close the screen: {v["open"]} {v["picks"]}')
    pg.evaluate("()=>{ document.querySelector('#b3-vibes .b3v-body').scrollTop=0; }"); vib(pg,'rank-2'); vbottom(pg); v=vstate(pg); need(v['slots'][0]==['Empty','Empty'] and v['rank']==['2'],f"back at Rank 2 the Quirks come off: {v['slots']}")
    vib(pg,'quirk-0'); v=vstate(pg); need('No Quirk is unlocked yet' in v['say'] and not v['picks'],f"an empty Quirk slot before Rank 3 should say why: {v['say']}")
    # Rows: three to the Back, the fourth is refused
    for i,who_ in ((1,'grace'),(2,'rose'),(3,'deedee')):
        vib(pg,f'who-{i}'); vbottom(pg); vib(pg,'rowpick-back')
    fr.append(shot(pg))
    rows=pg.evaluate("()=>{ const B=b3LabBook(); return ['tom','grace','rose','deedee'].map(id=>b3RowOf(B[id])); }")
    need(rows==['front','back','back','back'],f'three of them moved to the Back row: {rows}')
    vib(pg,'who-0'); vbottom(pg); vib(pg,'rowpick-back'); v=vstate(pg); fr.append(shot(pg))
    need('Someone has to stand in Front' in v['say'] and pg.evaluate("()=>b3RowOf(b3LabBook().tom)")=='front',f"the last one in Front cannot go to the Back: {v['say']}")
    # Keys and gamepad
    pg.mouse.move(2,2); pg.keyboard.press('KeyE'); pg.wait_for_timeout(200); v=vstate(pg); need(v['sel']==1 and v['focus']=='who-1',f"E should move to the next family member: {v['sel']} {v['focus']}")
    seen=[]
    for _ in range(4): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(110); seen.append(vstate(pg)['focus'])
    need(len(set(seen))==4 and all(seen),f'the arrow keys should walk down the buttons: {seen}')
    pg.keyboard.press('KeyQ'); pg.wait_for_timeout(200); need(vstate(pg)['sel']==0,'Q should move back to Tom')
    for _ in range(12):
        if vstate(pg)['focus']=='pocket-tom_gamer': break
        pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(90)
    f0=vstate(pg)['focus']; pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(120); f1=vstate(pg)['focus']
    pg.evaluate("()=>window.__LE.b3vPad('down',true,false,false)"); pg.wait_for_timeout(120); f2=vstate(pg)['focus']
    need(f2 and f2!=f1,f'the gamepad should move the cursor too: {f0} {f1} {f2}')
    fr.append(shot(pg))
    pg.evaluate("()=>window.__LE.b3vPad(null,false,false,true)"); pg.wait_for_timeout(350)
    back=pg.evaluate("()=>({open:B3V.open,hidden:document.getElementById('b3-vibes').hidden,mode:splash.mode,name:(splash.list[splash.sel]||{}).name})")
    need(not back['open'] and back['hidden'] and back['mode']=='lab3' and back['name']=='VIBES AND RANKS',f'B should close the screen and land on VIBES AND RANKS: {back}')
    # --- A Lab fight with these Vibes: Gamer Geek as Main, three in the Back row ---
    idx=lab.index('new1'); pg.evaluate("()=>{ B7.speed=2; }"); start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.wait_for_timeout(300)
    for _ in range(12):
        if who(pg)=='tom': break
        pg.evaluate("()=>{ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }"); wait_cmd(pg); pg.wait_for_timeout(200)
    need(who(pg)=='tom','never reached Tom\'s turn in the Lab fight')
    cross=pg.evaluate("()=>document.querySelector('#b3-cmd .b2-x.up small').textContent"); ff.append(shot(pg))
    need(cross=='Cartridge Blow',f'with Gamer Geek as Main, BASIC should be Cartridge Blow: {cross}')
    pg.mouse.move(2,2); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(250); ff.append(shot(pg))
    sk=pg.evaluate("()=>[...document.querySelectorAll('#b3-cmd .b2-btn[data-i]')].map(b=>b.querySelector('.b2-sn').textContent+(b.querySelector('.b3-pk')?' [POCKET]':''))")
    need(sk==['Controller Toss','Zone One Blockade [POCKET]','Suite Door Slide [POCKET]'],f'the SKILLS list should be the Main Vibe\'s Skill, then the Pocket Vibe\'s two, tagged: {sk}')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); pg.click('#b3-party .b2-pc[data-i="1"]'); pg.wait_for_timeout(300); ff.append(shot(pg))
    inf=pg.evaluate("()=>document.querySelector('#b3-cmd .b3-info').textContent")
    need('Gamer Geek' in inf and 'RANK 2' in inf and 'Striker Lean' in inf and 'Frequent Flier' in inf,f'tapping Tom should show his Vibes: {inf[:200]}')
    frows=pg.evaluate("()=>B3.F.party.map(p=>p.id+':'+p.row+':'+p.vibe)")
    need(frows==['grace:back:grace_squishy','tom:front:tom_gamer','rose:back:rose_sugar','deedee:back:deedee_neat'],f'the fight should use the rows and Vibes set on the screen: {frows}')
    stats=pg.evaluate("()=>{ const t=B3.F.party[1]; return {hp:t.maxHp,atk:Math.round(b3Stat(t,'atk')*10)/10}; }")
    need(stats=={'hp':115,'atk':29.9},f'Tom with the Striker Lean: 115 HP and 29.9 Attack at level 2: {stats}')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    for _ in range(80):
        if pg.evaluate("()=>B3.ui")=='done': break
        pg.evaluate("()=>{ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }"); wait_cmd(pg,60000); pg.wait_for_timeout(120)
    pg.wait_for_timeout(500); ff.append(shot(pg))
    won=pg.evaluate("()=>({over:B3.F.over,btn:document.querySelector('#b3-cmd [data-done] em').textContent,msg:document.getElementById('b3-msg').textContent,vp:b3LabBook().tom.vp,g:b3LabBook().grace.vp})")
    need(won['over']=='win' and '+10 Vibe Points' in won['btn'] and '+10 Vibe Points' in won['msg'],f'a Lab win should say the Vibe Points it paid: {won}')
    need(won['vp']=={'tom_flier':65,'tom_gamer':70} and won['g']=={'grace_squishy':70,'grace_craft':65},f"10 VP to each Main Vibe and 5 to each Pocket Vibe: {won['vp']} {won['g']}")
    pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(600)
    # Kept on the device across a reload
    pg.reload(); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start&&window.__LE.b3vOpen',timeout=180000); pg.wait_for_timeout(1200)
    again=pg.evaluate("()=>{ const B=b3LabBook(); return {main:B.tom.main,vp:B.tom.vp.tom_gamer,rose:b3RowOf(B.rose)}; }")
    need(again=={'main':'tom_gamer','vp':70,'rose':'back'},f"the Lab's Vibes should survive a reload: {again}")
    pg.evaluate("()=>{ b3LabReset(); }")
    # --- The save fields ---
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(200)
    sv=pg.evaluate("()=>{ saveGame('7',true); const s=readSave('7'); return {tom:s.members.find(m=>m.id==='tom'),amy:s.members.find(m=>m.id==='amy'),n:s.members.filter(m=>m.vibes).map(m=>m.id)}; }")
    need(sv['tom'].get('vibes')=={'main':'tom_flier','pocket':'tom_gamer','quirks':[None,None],'vp':{'tom_flier':0,'tom_gamer':0}} and sv['tom'].get('row') is None,f"a new game saves a fresh loadout per member: {sv['tom'].get('vibes')}")
    need(sv['n']==['tom','grace','rose','deedee'] and 'vibes' not in sv['amy'],f"only family members with a kit get the fields for now: {sv['n']}")
    need('stamps' in sv['tom'] and 'ranks' in sv['tom'] and 'loadouts' in sv['tom'],'the old save fields (stamps, ranks, loadouts) must stay')
    # The pause menu's door
    pg.evaluate("()=>{ openMenu(true); }"); pg.wait_for_timeout(350)
    cmds=pg.evaluate("()=>[...document.querySelectorAll('#menu .mcmd')].map(b=>({t:b.textContent,vis:b.getBoundingClientRect().bottom<=document.querySelector('#menu .mcmds-win').getBoundingClientRect().bottom+1}))")
    need(any(x['t']=='Vibes' for x in cmds) and all(x['vis'] for x in cmds),f'the pause menu should list Vibes with every command on screen: {cmds}')
    mm=[shot(pg)]
    pg.click('#menu [data-k="cmd-vibes"]'); pg.wait_for_timeout(450); v=vstate(pg); mm.append(shot(pg))
    need(v['open'] and v['door']=='menu' and v['tabs']==['TOM','GRACE','ROSE'],f"the pause menu's Vibes screen should list the party: {v['tabs']} {v['open']}")
    need('Story fights still use the old battle' in v['head'],f"the pause menu's screen should say where the Vibes are used: {v['head']}")
    need(not v['rank'] and pg.evaluate("()=>!document.querySelector('#b3-vibes .b3v-rank')"),'the Rank picker belongs to the Lab only')
    need(v['cards'][0]['live']==['Lounge Pass Flex','Zone One Blockade'] and '0 / 60 VP' in v['cards'][0]['vp'],f"a new game is Rank 1 with 0 VP: {v['cards'][0]}")
    vib(pg,'main-tom_gamer',350); vib(pg,'who-1'); vbottom(pg); vib(pg,'rowpick-back'); mm.append(shot(pg))
    pg.keyboard.press('KeyM'); pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(150)
    need(pg.evaluate("()=>menuOpen&&B3V.open&&menuTab==='home'"),'keys must not reach the pause menu while the Vibes screen is open over it')
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(600); rot=pg.evaluate("()=>layout.rotated"); f=shot(pg); land=f.rotate(90,expand=True) if rot else f
    fits=pg.evaluate("()=>{ const p=document.querySelector('#b3-vibes .b3v-panel').getBoundingClientRect(),g=document.getElementById('stage').getBoundingClientRect(); return p.left>=g.left-1&&p.right<=g.right+1&&p.top>=g.top-1&&p.bottom<=g.bottom+1; }")
    need(fits,'landscape: the Vibes panel does not fit inside the stage')
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(450)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(400); mm.append(shot(pg))
    # The pause menu in landscape: its command list scrolls when the screen is short (it did before Vibes was added, on a phone
    # 393 high). Every one of the nine commands must be reachable.
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(600); f=shot(pg); land2=f.rotate(90,expand=True) if rot else f
    cmds=pg.evaluate("()=>{ const w=document.querySelector('#menu .mcmds-win'); return [...document.querySelectorAll('#menu .mcmd')].map(b=>{ b.scrollIntoView({block:'nearest'}); const r=b.getBoundingClientRect(),W=w.getBoundingClientRect(); return {t:b.textContent,vis:r.left>=W.left-1&&r.right<=W.right+1&&r.top>=W.top-1&&r.bottom<=W.bottom+1}; }); }")
    need(len(cmds)==9 and all(x['vis'] for x in cmds),f'landscape: a pause menu command cannot be reached: {cmds}')
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(450)
    after=pg.evaluate("""()=>{ const a=readSave('auto')||{members:[]},t=a.members.find(m=>m.id==='tom')||{},g=a.members.find(m=>m.id==='grace')||{};
      return {open:B3V.open,menu:menuOpen,auto:(t.vibes||{}).main,grow:g.row,lab:b3LabBook().tom.main,labrow:b3RowOf(b3LabBook().grace),labvp:b3LabBook().tom.vp.tom_gamer,focus:document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.k:null}; }""")
    need(not after['open'] and after['menu'],f'Esc should close the Vibes screen and leave the pause menu open: {after}')
    need(after['auto']=='tom_gamer' and after['grow']=='back',f"closing the screen should put the change in the autosave: {after}")
    need(after['lab']=='tom_gamer' and after['labrow']=='back' and after['labvp']==60,f"what is set in the pause menu is what a Lab fight uses (Vibes and row, not Vibe Points): {after}")
    need(after['focus']=='cmd-vibes',f"the cursor should be back on Vibes in the pause menu: {after['focus']}")
    # Save, wipe, load
    rt=pg.evaluate("""()=>{ saveGame('7',true); for(const m of ALL_MEMBERS()) m.vibes=null; const ok=loadGame('7'); const t=b3Member('tom').vibes,g=b3Member('grace').vibes;
      return {ok,tom:t&&t.main,pocket:t&&t.pocket,grow:g&&g.row,vp:t&&t.vp}; }""")
    need(rt=={'ok':True,'tom':'tom_gamer','pocket':'tom_flier','grow':'back','vp':{'tom_flier':0,'tom_gamer':0}},f'save then load should bring the Vibes back: {rt}')
    # A save from before the fields existed (a battle 2 save), one with junk in them, and one from before members were saved at all
    old=pg.evaluate("""()=>{ const put=(slot,s)=>{ const raw=JSON.stringify(s); SAVE_CACHE[slot]=raw; localStorage.setItem('aot-save-'+slot,raw); };
      const a=readSave('7'); for(const m of a.members) { delete m.vibes; delete m.row; } put('8',a);
      const b=readSave('7'); for(const m of b.members) { m.vibes={main:'nope',pocket:7,quirks:'x',vp:{tom_flier:'lots',grace_craft:99999}}; m.row='up'; } put('9',b);
      const c=readSave('7'); delete c.members; put('10',c);
      const out={};
      for(const slot of ['8','9','10']) { const ok=loadGame(slot),t=b3Member('tom').vibes,g=b3Member('grace').vibes,d=b3Member('deedee').vibes;
        out[slot]={ok,tom:t&&[t.main,t.pocket,t.vp.tom_flier,t.vp.tom_gamer,t.row].join(),grace:g&&[g.main,g.vp.grace_craft,g.row].join(),deedee:d&&d.main}; }
      saveGame('8',true); const again=readSave('8').members.find(m=>m.id==='tom'); out.resaved=!!(again.vibes&&again.vibes.main==='tom_flier'&&'stamps' in again);
      for(const slot of ['7','8','9','10']) { delete SAVE_CACHE[slot]; localStorage.removeItem('aot-save-'+slot); }
      return out; }""")
    need(old['8']=={'ok':True,'tom':'tom_flier,tom_gamer,0,0,','grace':'grace_squishy,0,','deedee':'deedee_neat'},f"a save from before the Vibe fields should load with fresh loadouts: {old['8']}")
    need(old['9']=={'ok':True,'tom':'tom_flier,tom_gamer,0,0,','grace':'grace_squishy,800,','deedee':'deedee_neat'},f"junk in the fields should be repaired, not crash: {old['9']}")
    need(old['10']['ok'] and old['10']['tom']=='tom_flier,tom_gamer,0,0,',f"a very old save with no member list should load with fresh loadouts: {old['10']}")
    need(old['resaved'],'saving an old save again should add the Vibe fields and keep the old ones')
    pg.evaluate("()=>{ if(menuOpen) closeMenu(); b3LabReset(); }"); pg.wait_for_timeout(200)
    sheet(fr,4,os.path.join(OUT,'b3-s4-lab.png')); sheet(ff,4,os.path.join(OUT,'b3-s4-fight.png')); sheet(mm,4,os.path.join(OUT,'b3-s4-menu.png'))
    # Full-size frames of the three views Tom will use most, to look at closely.
    for name,im in (('b3-s4-vibes-portrait.png',fr[1]),('b3-s4-vibes-menu-landscape.png',land),('b3-s4-menu-landscape.png',land2),('b3-s4-fight-skills.png',ff[1])): im.save(os.path.join(OUT,name))

with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    lab=pg.evaluate("()=>B3_LAB.map(L=>L.id)"); only=[a for a in sys.argv[1:] if a in('s3','s4')]; want=[a for a in sys.argv[1:] if not a.startswith('-') and a not in('s3','s4')] or ([] if only else lab)
    # The way in: ADMIN > BATTLE LAB shows NEW BATTLE, which opens the list.
    pg.evaluate("()=>{ splashSetMode('lab'); }"); pg.wait_for_timeout(200)
    names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
    if not names or names[0]!='NEW BATTLE': fails.append(f'the Lab list does not start with NEW BATTLE: {names}')
    pg.click('#splash .sp-choice[data-i="0"]'); pg.wait_for_timeout(600)
    names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)"); print('NEW BATTLE list:',names)
    shot(pg).save(os.path.join(OUT,'b3-lab-list.png'))
    for fid in want:
        if fid not in lab: fails.append(f'no Lab fight called {fid}'); continue
        idx=lab.index(fid); print('fight',fid)
        pg.evaluate("()=>{ B7.speed=1; }")
        hand_fight(pg,idx,fid)
        # 2. the simulator's order
        pg.evaluate("()=>{ B7.speed=2; }")
        R=auto_fight(pg,idx,fid,{'seed':SEED},every=300)
        sim=json.loads(subprocess.run(['node',os.path.join(HERE,'b3-sim.js'),fid,'1',f'--seed={SEED}','--json','--order'],capture_output=True,text=True).stdout)
        if R['order']!=sim['order']: fails.append(f"{fid}: screen order differs from the simulator: {R['order'][:12]} vs {sim['order'][:12]}")
        else: print(f"  same {len(R['order'])} turns as the simulator, {R['over']} in {R['rounds']:.2f} rounds")
        if R['over']!='win': fails.append(f"{fid}: auto fight result {R['over']}")
        bad=[(i,e,R['turns'][i+1]) for i,e in enumerate(R['ends']) if i+1<len(R['turns']) and e!=R['turns'][i+1]]
        if bad: fails.append(f'{fid}: the bar\'s first face was not the next to act {len(bad)} times: {bad[:4]}')
        else: print(f"  the bar named the next unit right after all {len(R['ends'])} turns")
        pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(400)
        # 3. a loss
        fr=[]; R=auto_fight(pg,idx,fid,{'seed':SEED,'hpPct':.02,'mods':{'foeHp':20}},frames=fr,every=500,poke=FAST_FOES)
        if R['over']!='lose': fails.append(f"{fid}: the fight set up to be lost ended {R['over']}")
        sheet(fr[-8:],4,os.path.join(OUT,f'b3-{fid}-lose.png'))
        pg.click('#b3-cmd [data-done]'); pg.wait_for_timeout(500)
        if pg.evaluate("()=>splash.mode")!='lab3': fails.append(f'{fid}: CONTINUE after a loss did not go back to the list')
        # 4. landscape (the phone's own toggle: the stage turns a quarter turn)
        pg.evaluate("()=>{ B7.speed=1; toggleLayout(); }"); pg.wait_for_timeout(500)
        fr=[]; start(pg,idx,{'seed':SEED}); wait_cmd(pg); pg.wait_for_timeout(400); fr.append(shot(pg)); first=state(pg)['actor']
        pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(250); fr.append(shot(pg))
        key=[f['key'] for f in state(pg)['foes'] if f['alive']][0]
        if state(pg)['ui']=='target': tap_foe(pg,key)
        pg.wait_for_timeout(900); fr.append(shot(pg)); wait_cmd(pg); pg.wait_for_timeout(250)
        if state(pg)['actor'] in(first,None) or pg.evaluate("()=>B3.F.turnLog.length")<2: fails.append(f"{fid} landscape: tapping the enemy did not use {first}'s Basic (now {state(pg)['actor']})")
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(250); fr.append(shot(pg)); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
        pg.click('#b3-exit'); pg.wait_for_timeout(500)
        if pg.evaluate("()=>splash.mode")!='lab3' or pg.evaluate("()=>B3.active"): fails.append(f'{fid} landscape: EXIT did not go back to the list')
        R=auto_fight(pg,idx,fid,{'seed':SEED},frames=fr,every=700)
        pg.evaluate("()=>b3Pick(0)"); pg.wait_for_timeout(400)
        rot=pg.evaluate("()=>layout.rotated")
        sheet([f.rotate(90,expand=True) if rot else f for f in fr[:16]],4,os.path.join(OUT,f'b3-{fid}-land.png'))
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 5. stage 2: the Skills, wards, hazards, status lists and Pick-Me-Up, on the Pond Grump fight
    if 'new3' in want:
        print('stage 2 moves'); pg.evaluate("()=>{ B7.speed=1; }")
        stage2_fight(pg,lab.index('new3')); stage2_land(pg,lab.index('new3'))
    # 6. stage 3: Composure, the Mark, the Break, adds, on The Big One
    if 'new6' in want or 's3' in sys.argv:
        print('stage 3 moves'); pg.evaluate("()=>{ B7.speed=1; }")
        stage3_fight(pg,lab.index('new6')); stage3_land(pg,lab.index('new6'))
    # 6b. stage 4: the Vibes screen from both doors, the Lab's Ranks, a fight with changed Vibes, the save fields
    if 's4' in sys.argv or not only and len(want)==len(lab):
        print('stage 4: Vibes'); stage4(pg,lab)
    # 7. battle 2 still owns its screen
    pg.evaluate("()=>{ B7.speed=1; splash.active=false; document.getElementById('splash').hidden=true; window.__LE.b2Start({party:['tom','grace','rose'],level:12,foes:[['mudling','front']],bag:[]}); }")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
    v=pg.evaluate("()=>({b2:!document.getElementById('b2-ui').hidden,b3:!document.getElementById('b3-ui').hidden,bar3:!document.getElementById('b3-bar').hidden,v3:document.getElementById('battle').classList.contains('v3'),tools:!document.getElementById('b3-tools').hidden})")
    if not v['b2'] or v['b3'] or v['bar3'] or v['v3'] or v['tools']: fails.append(f'battle 2 after Battle 3: wrong boxes showing: {v}')
    shot(pg).save(os.path.join(OUT,'b3-then-b2.png'))
    pg.evaluate("()=>b2End('run')"); pg.wait_for_timeout(300)
    faults=pg.evaluate("()=>window.__faults||[]")
    if faults: fails.append(f'game faults: {faults[:4]}')
    real=errors(errs)
    if real: fails.append(f'errors: {real[:5]}')
    br.close()
print('FAILS:',fails)
raise SystemExit(1 if fails else 0)
