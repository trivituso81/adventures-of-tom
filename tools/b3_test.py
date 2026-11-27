# Battle 3 screen test: plays the NEW BATTLE Lab fights in a real browser and saves contact sheets of frames to look at.
# Usage (repo root):  python3 tools/b3_test.py            every fight in data/b3-lab.js
#                     python3 tools/b3_test.py new1       one fight
#                     python3 tools/b3_test.py s3         only the stage 3 section (The Big One: pips, Mark, Break, adds), about 5 min
#                     python3 tools/b3_test.py s4         only the stage 4 section (the Vibes screen, the Lab's Ranks, the save fields), about 2 min
#                     python3 tools/b3_test.py s5         only the stage 5a section (Rank 5 on The Big One: the four Capstones, the free Skill, Traits and Quirks), about 3 min
#                     python3 tools/b3_test.py s8         only the stage 8 section (video clips: idle loops, clip moves on the impact frame, The Big One's acts, body states, the fallback), about 4 min
#                     python3 tools/b3_test.py s16        only the stage 16 section (Tombo skins: the skin's name on the tray and the screen at a Full Family Ruckus, the recorded lines, portrait and landscape), about 1 min
#                     python3 tools/b3_test.py s21        only the stage 21 section (Casual Mode: the Freelancer chip locked at Rank 4 and open at Rank 5, its Basic and two Secondary Vibes, a Lab fight in it, portrait and landscape), about 2 min
#                     python3 tools/b3_test.py s7         only the stage 7 section (Rose Mode: pictures, preview, the recommended move, keys and pad), about 2 min
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
#   6c. Stage 5a, once, on The Big One with every Vibe at Rank 5 and both Quirks of the first Sig Vibes equipped (portrait, then a
#      short pass in landscape): Tom starts in Guard Stance; a tap list names the Trait and the Quirks; Grace's Colossal
#      Diamond-Gold Dumpling opens the FREE SKILL list for Rose (no way back out of it, FREE on every row) and Rose's free Skill
#      plays without moving her on the bar; Deedee's Fifty-Year Dust Tsunami scrubs the Crown, leaves the boss Drenched and
#      Shined and the family with Attack up; Tom's Tarmac Porsche Transfer puts ALL EYES on him and the boss then aims at him;
#      Rose's Double-Lamby Return-Cart Blitz lands six hits and gives her Speed; Tom steps in for Grace, stamps a Certificate
#      (the number on his portrait) and answers with Million-Miler Status; Controller Toss cashes the Certificates; Deedee's
#      Scrub on the Drenched boss shows Spotless Floor's extra pip.
#   7. A battle 2 fight still starts and shows its own screen afterwards.
# Sheets: b3-<fight>-hand.png, b3-<fight>-slip.png and b3-<fight>-slip-bar.png (the Hydro-Slip! frames: the stage, and every turn bar
# stacked and doubled), b3-<fight>-lose.png, b3-<fight>-land.png, b3-s2-moves.png (the stage during the stage 2 moves),
# b3-s2-info.png (the status lists and Pick-Me-Up), b3-s2-land.png, b3-s3-mark.png (pips, the Mark, the bite taken and cancelled),
# b3-s3-break.png (the Break frames), b3-s3-info.png (the lists and the adds), b3-s3-land.png, b3-s4-lab.png (the Vibes screen from
# the Lab), b3-s4-fight.png (the fight with changed Vibes), b3-s4-menu.png (the pause menu's door, with a landscape frame), and three
# full-size frames: b3-s4-vibes-portrait.png, b3-s4-vibes-menu-landscape.png, b3-s4-menu-landscape.png, b3-s4-fight-skills.png.
# Stage 5a: b3-s5-caps.png (the four Capstones and the free Skill), b3-s5-quirks.png (stepping in, Certificates, Million-Miler,
# Spotless Floor), b3-s5-land.png, and full-size b3-s5-free-portrait.png, b3-s5-info-portrait.png, b3-s5-free-landscape.png.
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
  bar:[...document.querySelectorAll('#b3-bar .bt-tk')].map(e=>e.dataset.k+(e.classList.contains('now')?'!':'')+(e.classList.contains('ghost')?'?':'')),
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
            # A move by touch (battleux1): the first tap highlights it and the tray says what it does, a tap on a family card aims it, the second tap uses it.
            i=pg.evaluate("()=>B3.deck.findIndex(e=>e.grp!=='basic'&&!e.ruckus&&e.can.ok&&e.opts.some(o=>o.label==='Rose'))")
            row=f'#b3-rows .bx-mv[data-i="{i}"]'
            pg.click(row); pg.wait_for_timeout(250); frames.append(shot(pg))
            nm=pg.evaluate("()=>B3.deck[B3.sel].name"); does=pg.evaluate("()=>{ const S=B3.deck[B3.sel].S; return (b3Details()?S.desc:S.short||S.desc).slice(0,30); }")
            if pg.evaluate("()=>B3.sel")!=i or state(pg)['ui']!='deck': fails.append(f'{fid} hand: the first tap on a move did not just highlight it')
            elif does not in pg.inner_text('#b3-tray'): fails.append(f'{fid} hand: the tray does not say what {nm} does after the first tap')
            else: did['card']=True
            aim(pg,'Rose'); frames.append(shot(pg))
            if pg.evaluate("()=>b3AimOpt().label")!='Rose' or state(pg)['turns']!=st['turns']: fails.append(f'{fid} hand: tapping Rose did not aim {nm} at her without using it')
            pg.click(row); did['skill']=True
            pg.wait_for_timeout(1100); frames.append(shot(pg))
        else:
            if who=='deedee': tgt=([f for f in live if not f['drenched']] or live)[0]
            elif who in('grace','rose') and wet: tgt=wet[0]; expect_slip=True
            else: tgt=live[-1] if who=='tom' else ([f for f in live if not f['drenched']] or live)[-1]
            many=pg.evaluate("()=>b3Entry().opts.length")>1
            if who in('tom','deedee'):
                # keys: left and right step the aim through the valid targets, Enter uses the highlighted move
                if many:
                    for _ in range(8):
                        if pg.evaluate("()=>b3AimOpt().key")==tgt['key']: break
                        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(80)
                    did['keys']=True
                    if turn<3: frames.append(shot(pg))
                else: did['keys']=True
                pg.keyboard.press('Enter')
            else:
                if many:
                    tap_foe(pg,tgt['key']); did['tapfoe']=True; pg.wait_for_timeout(200)
                    if pg.evaluate("()=>b3AimOpt().key")!=tgt['key']: fails.append(f"{fid} hand: tapping {tgt['key']} on the picture did not aim at it")
                pg.click(f'#b3-rows .bx-mv[data-i="{pg.evaluate("()=>B3.sel")}"]'); pg.wait_for_timeout(200)
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
        if not v and not(solo and k=='tapfoe') and not(fid=='new7' and k=='slip'): fails.append(f'{fid} hand: never used {k}')   # new7 has no Drench source (Deedee is out), so no slip is possible
    pg.click('#b3-app [data-done]'); pg.wait_for_timeout(700)
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
def deck_names(pg): return pg.evaluate("()=>B3.deck.map(e=>e.name)")
def select_row(pg,name):
    """Highlights a move by name with the number keys (1 to 9; a deck longer than that uses the same call the tap uses). Returns the names in the deck."""
    pg.mouse.move(2,2)   # a mouse left resting over the deck would highlight the row under it
    names=deck_names(pg)
    if name not in names: fails.append(f'{name} is not in the deck: {names}'); return names
    i=names.index(name)
    if i<9: pg.keyboard.press('Digit'+str(i+1))
    else: pg.evaluate("(i)=>b3Select(i)",i)
    pg.wait_for_timeout(180); return pg.evaluate("()=>B3.deck.filter(e=>e.grp!=='basic'&&!e.ruckus).map(e=>e.name)")
def skill(pg,name):
    """Highlights a Skill in the deck (the first tap or key: it only shows the move). The next Enter uses it. Returns the names in the deck."""
    return select_row(pg,name)
def basic(pg):
    """Uses the Basic on its default aim (the deck opens with the Basic highlighted; a number key puts it back if the highlight moved)."""
    pg.mouse.move(2,2)
    i=pg.evaluate("()=>B3.deck.findIndex(e=>e.grp==='basic')")
    if i>=0 and pg.evaluate("()=>B3.sel")!=i: pg.evaluate("(i)=>b3Select(i)",i); pg.wait_for_timeout(120)
    pg.keyboard.press('Enter')
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
    if 'BLOCKADE' not in pg.evaluate("()=>document.querySelector('#b3-party .bx-pc[data-i=\"1\"]').textContent"): fails.append(S+"Tom's card does not carry the BLOCKADE chip")
    # Rose: "Giddyup, Tata!" Launch on the first monster
    skill(pg,'"Giddyup, Tata!" Launch'); pg.keyboard.press('Enter'); pg.wait_for_timeout(220); pg.keyboard.press('Enter'); fr+=burst(pg,7); wait_cmd(pg)
    if not pg.evaluate("()=>B3.view.u.p3.st.includes('giddyup')&&B3.view.u.f0.st.includes('toasty')"): fails.append(S+'Giddyup did not buff Deedee or leave Toasty')
    # Deedee: Wet-Floor Hazard, then the Mudling's melee Wobble at Tom
    skill(pg,'Wet-Floor Hazard'); pg.keyboard.press('Enter'); fr+=burst(pg,4)
    for _ in range(40):
        if pg.evaluate("()=>B3.view.haz.length")==1: break
        pg.wait_for_timeout(150)
    if pg.evaluate("()=>B3.view.haz.length")!=1: fails.append(S+'the wet floor is not on the screen')
    pg.evaluate("()=>{ b3AddStatus(B3.F,B3.F.party[1],'t_taunt',{}); B3.F.foes[1].actIx=0; B3.F.foes[0].actIx=0; }")
    fr+=burst(pg,26,240); wait_cmd(pg); L=log(pg)
    if 'slips on the wet floor' not in L: fails.append(S+'no monster slipped: '+L[-300:])
    if 'Tom: Zone One Blockade!' not in L: fails.append(S+"Tom's ward did not answer: "+L[-300:])
    if pg.evaluate("()=>B3.view.haz[0]&&B3.view.haz[0].uses")!=1: fails.append(S+'the wet floor should have 1 slip left')
    # What a unit carries: Tom's card puts him in the tray, I opens the full list as a sheet, the arrows step through everyone, Esc closes it
    pg.click('#b3-party .bx-pc[data-i="1"]'); pg.wait_for_timeout(300); info.append(shot(pg)); T=pg.inner_text('#b3-tray')
    if pg.evaluate("()=>[B3.ui,B3.look]")!=['deck','p1'] or 'zone one blockade' not in T.lower(): fails.append(S+"tapping Tom's card did not show him in the tray: "+T[:200])
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(250); T=pg.inner_text('#b3-sheet')
    if pg.evaluate("()=>B3.sheet")!='p1' or 'Zone One Blockade' not in T or 'turn' not in T: fails.append(S+"I did not open Tom's full list: "+T[:200])
    for _ in range(8):
        if pg.evaluate("()=>B3.sheet")=='f0': break
        pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(120)
    pg.wait_for_timeout(200); info.append(shot(pg)); T=pg.inner_text('#b3-sheet')
    v=pg.evaluate("()=>({key:B3.sheet,rows:document.querySelectorAll('#b3-sheet .sh-r').length,want:b3Carried(B3.F,B3.F.foes[0]).length})")
    if v['key']!='f0' or v['rows']!=v['want'] or 'Wet Floor' not in T: fails.append(S+f'the arrows did not reach the monster\'s full list: {v} {T[:160]}')
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>B3.sheet")=='f0': fails.append(S+'the down key did not step to the next unit')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>[B3.ui,B3.sheet]")!=['deck',None]: fails.append(S+'Esc did not close the list')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)   # puts Tom away from the tray
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>[B3.ui,B3.sheet]")!=['deck',pg.evaluate("()=>B3.actor.key")]: fails.append(S+'the I key did not open the list on whoever is up')
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>B3.sheet"): fails.append(S+'the I key did not close the list')
    # The 3-icon rule: six statuses on Grace, 3 chips on her card, all six in her list
    pg.evaluate("()=>{ const g=B3.F.party[0]; for(const id of ['drenched','slow','fatigue','windexed','stress_melted','giddyup']) b3AddStatus(B3.F,g,id,{}); b3ViewSync(); b3Render(); }")
    chips=pg.evaluate("()=>document.querySelectorAll('#b3-party .bx-pc[data-i=\"0\"] .st').length")
    pg.click('#b3-party .bx-pc[data-i="0"]'); pg.wait_for_timeout(250); info.append(shot(pg))
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(250)
    rows=pg.evaluate("()=>document.querySelectorAll('#b3-sheet .sh-r').length")
    if chips!=3 or rows!=6: fails.append(S+f'six statuses should show 3 icons and 6 list rows, got {chips} and {rows}')
    pg.evaluate("()=>{ const g=B3.F.party[0]; for(const id of Object.keys(g.st)) b3EndStatus(B3.F,g,id); b3ViewSync(); b3Back(); b3Back(); }"); pg.wait_for_timeout(150)
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
    skill(pg,'Crunchy Sugar-Cube Pop'); aim(pg,pg.evaluate("()=>B3.F.foes[0].name")); fr.append(shot(pg)); pg.keyboard.press('Enter'); pg.wait_for_timeout(250); fr+=burst(pg,6); wait_cmd(pg)
    if 'It was cancelled' not in log(pg,10) or pg.evaluate("()=>!!B3.F.foes[0].charge"): fails.append(S+'Crunchy Sugar-Cube Pop did not cancel the wind-up: '+log(pg,8)[-240:])
    # Finish: the simple player takes over against 1 HP monsters
    pg.evaluate("()=>{ for(const f of B3.F.foes) f.hp=1; b3ViewSync(); B3.cfg.auto=true; const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }")
    pg.wait_for_function("()=>B3.ui==='done'",timeout=60000); pg.wait_for_timeout(400); fr.append(shot(pg))
    if pg.evaluate("()=>B3.F.over")!='win': fails.append(S+'the fight did not end in a win')
    pg.click('#b3-app [data-done]'); pg.wait_for_timeout(600)
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
    pg.click('#b3-party .bx-pc[data-i="1"]'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.look")!='p1': fails.append(S+"tapping Tom's card did not show him in the tray")
    tap_foe(pg,'f1'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>b3AimOpt().key")!='f1': fails.append(S+'tapping a monster did not aim the Basic at it')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); pg.click('#b3-exit'); pg.wait_for_timeout(500)
    if pg.evaluate("()=>splash.mode")!='lab3' or pg.evaluate("()=>B3.active"): fails.append(S+'EXIT did not go back to the list')
    sheet(fr,4,os.path.join(OUT,'b3-s2-land.png'),scale=.6)
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)

# Stage 3 pokes: count the Breaks and the Marks on Rose as they are shown, and (while `keep` is set) top the boss's pips up at
# every family turn, so that the scripted Mark steps are not cut short by a Break that the family's own hits bring on.
S3_HOOK="""()=>{ window.__s3={brk:0,marks:0,keep:false}; if(!window.__s3wrap){ window.__s3wrap=1;
  const os=b3Show; b3Show=function(b){ if(b.t==='break') window.__s3.brk++; if(b.t==='telegraph'&&b.mark==='p2') window.__s3.marks++; return os.apply(this,arguments); };
  const oo=b3OpenDeck; b3OpenDeck=function(){ if(window.__s3.keep&&B3.F){ const f=B3.F.foes[0]; if(f.maxPips&&!f.broken&&!f.flusterTurn){ f.pips=f.maxPips; f.pipLock=false; b3ViewSync(); } } return oo.apply(this,arguments); }; } }"""
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
def marked(pg): return pg.evaluate("()=>({mark:B3.view.mark.f0||null,charge:B3.view.charge.f0||null,chip:document.querySelector('#b3-party .bx-pc[data-i=\"2\"]').innerText.toUpperCase().includes('MARKED'),real:B3.F.foes[0].mark,rc:B3.F.foes[0].charge&&B3.F.foes[0].charge.id})")
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
    if not pg.evaluate("()=>!!document.querySelector('#b3-bar .bt-tk.foe .bt-int')"): fails.append(S+'the boss has no wind-up badge on the turn bar')
    hold(pg)
    pg.click('#b3-party .bx-pc[data-i="2"]'); pg.wait_for_timeout(300); info.append(shot(pg)); T=tray_full(pg,'p2')
    if 'marked' not in T or 'swamp chomp' not in T: fails.append(S+"Rose's tray does not say who Marked her: "+T[:200])
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); info.append(shot(pg)); T=tray_full(pg,'f0')
    if 'composure' not in T or 'winding up swamp chomp' not in T or 'rose' not in T: fails.append(S+"the boss's tray does not show Composure and the wind-up: "+T[:260])
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
    fr+=burst(pg,7); wait_cmd(pg); m=marked(pg)
    if 'loses Swamp Chomp. It was cancelled' not in log(pg,10) or m['mark'] or m['chip'] or m['real'] or m['rc']: fails.append(S+f'Crunchy Sugar-Cube Pop did not cancel the bite and the Mark: {m} '+log(pg,6)[-240:])
    # Answer 3: a Break cancels it. The boss is down to its last pip (a poke); the next pip off Breaks it.
    glare_at_rose(pg,S,fr,3); hold(pg,95); n0=breaks(pg)
    pg.evaluate("()=>{ window.__s3.keep=false; const f=B3.F.foes[0]; f.pips=1; f.pipLock=false; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(200); brk.append(shot(pg))
    for turn in range(6):
        if breaks(pg)>n0: break
        basic(pg); brk+=burst(pg,10,220); wait_cmd(pg)
    shot(pg).save(os.path.join(OUT,'b3-s3-flustered.png'))
    L=log(pg,14); v=pg.evaluate("()=>({fl:B3.view.u.f0.st.includes('flustered'),pips:B3.view.u.f0.pips,bar:!!document.querySelector('#b3-bar .bt-tk.b3-flus'),badge:(document.querySelector('#b3-bar .bt-tk.b3-flus .bt-int')||{}).textContent,lock:B3.F.foes[0].pipLock,guard:B3.F.foes[0].st.flustered&&true})")
    if breaks(pg)!=n0+1 or 'BREAK!' not in L or 'loses Swamp Chomp' not in L: fails.append(S+'the Break did not show, or did not cancel the wind-up: '+L[-300:])
    if not(v['fl'] and v['pips']==0 and v['bar'] and v['badge']=='BREAK' and v['lock']): fails.append(S+f'after the Break the screen should show a Flustered boss with empty pips and a tipped face on the bar: {v}')
    m=marked(pg)
    if m['mark'] or m['chip'] or m['real']: fails.append(S+f'the Mark should be gone after the Break: {m}')
    brk.append(shot(pg))
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); info.append(shot(pg)); T=tray_full(pg,'f0')
    if 'flustered' not in T or 'until its next turn' not in T or '0 of 6' not in T: fails.append(S+"the boss's list does not show Flustered: "+T[:260])
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    # Its next turn begins: Flustered ends and the pips are back
    pg.evaluate("()=>{ B3.F.foes[0].wait=Math.min(B3.F.foes[0].wait,1); }")
    for turn in range(6):
        if pg.evaluate("()=>B3.view.u.f0.pips")==6: break
        basic(pg); brk+=burst(pg,8,250); wait_cmd(pg)
    v=pg.evaluate("()=>[B3.view.u.f0.pips,B3.view.u.f0.st.includes('flustered'),!!document.querySelector('#b3-bar .bt-tk.b3-flus')]")
    if v!=[6,False,False]: fails.append(S+f'on its next turn the pips should be back and Flustered gone: {v}')
    # Adds walk in (a poke: no chapter 1 monster calls any)
    pg.evaluate("""()=>{ const F=B3.F,c={F,actor:F.foes[0],beats:[],g:'pre',rec:0,targets:[],hit:[],detonated:{}};
      b3RunEffects(F,c,[{op:'summon',id:'mudling',row:'front',n:2},{op:'summon',id:'skeeter',row:'back'}]); for(const b of c.beats) b3Show(b); b3Render(); }""")
    pg.wait_for_timeout(900); info.append(shot(pg)); shot(pg).save(os.path.join(OUT,'b3-s3-adds.png'))
    v=pg.evaluate("()=>({n:B3.F.foes.length,laid:['f1','f2','f3'].every(k=>!!B3P.foe[k]),names:B3.F.foes.map(f=>f.name),hp:B3.F.foes[1].maxHp,bar:B3.view.bar.some(e=>e.k==='f1')})")
    if not(v['n']==4 and v['laid'] and v['names'][1:]==['Mudling A','Mudling B','Skeeter Swarm'] and v['hp']==30): fails.append(S+f'the adds did not join as expected: {v}')
    tap_foe(pg,'f3'); pg.wait_for_timeout(300); info.append(shot(pg))
    if pg.evaluate("()=>b3AimOpt().key")!='f3': fails.append(S+'tapping an add did not aim the Basic at it')
    if pg.evaluate("()=>b3Entry().opts.length")!=4: fails.append(S+'the Basic should reach the boss and the three adds')
    info.append(shot(pg))
    # Finish: the simple player takes over against 1 HP monsters
    pg.evaluate("()=>{ for(const f of B3.F.foes) f.hp=1; b3ViewSync(); B3.cfg.auto=true; const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }")
    pg.wait_for_function("()=>B3.ui==='done'",timeout=90000); pg.wait_for_timeout(400); fr.append(shot(pg))
    if pg.evaluate("()=>B3.F.over")!='win': fails.append(S+'the fight did not end in a win')
    pg.click('#b3-app [data-done]'); pg.wait_for_timeout(600)
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
    pg.click('#b3-party .bx-pc[data-i="2"]'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.look")!='p2': fails.append(S+"tapping Rose's card did not show her in the tray")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    pg.evaluate("()=>{ const f=B3.F.foes[0]; f.pips=1; f.pipLock=false; b3ViewSync(); b3Render(); }")
    for turn in range(6):
        if breaks(pg): break
        basic(pg); fr+=burst(pg,5,300,rot=rot); wait_cmd(pg)
    R(shot(pg)).save(os.path.join(OUT,'b3-s3-land-break.png'))
    if not breaks(pg) or not pg.evaluate("()=>!!document.querySelector('#b3-bar .bt-tk.b3-flus')"): fails.append(S+'no Break on screen')
    fr.append(R(shot(pg)))
    tap_foe(pg,'f0'); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    if pg.evaluate("()=>B3.look||b3AimOpt().key")!='f0': fails.append(S+'tapping the boss did not show or aim at it')
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
def vib(pg,k,wait=250): pg.click(f'#m2 [data-k="{k}"]'); pg.wait_for_timeout(wait)
def vstate(pg): return pg.evaluate("""()=>({open:M2.open,lab:M2.lab,tab:M2.tab,who:M2.who,hidden:document.getElementById('m2').hidden,
  people:[...document.querySelectorAll('#m2 .m2-fc')].map(b=>b.dataset.a),rank:[...document.querySelectorAll('#m2 [data-m2=rank].on')].map(e=>e.textContent),
  focus:document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.k||null:null,tabs:[...document.querySelectorAll('#m2 .m2-tab span')].map(e=>e.textContent)})""")
def stage4(pg,lab):
    S='stage 4: '; fr=[]; ff=[]
    def need(cond,what):
        if not cond: fails.append(S+what)
    # --- The Lab's door: NEW BATTLE > VIBES AND RANKS opens the Vibes page of the new menu on the Lab's book (card c-menu4) ---
    pg.evaluate("()=>{ b3LabReset(); const el=document.getElementById('splash'); el.hidden=false; el.classList.remove('out'); splash.active=true; splashSetMode('lab3'); }"); pg.wait_for_timeout(300)
    names=pg.evaluate("()=>[...document.querySelectorAll('#splash .sp-choice .sp-name')].map(e=>e.textContent)")
    need('VIBES AND RANKS' in names and names[-1]=='BACK',f'the NEW BATTLE list has no VIBES AND RANKS row: {names}')
    fr.append(shot(pg))
    pg.click('#splash .sp-choice:has-text("VIBES AND RANKS")'); pg.wait_for_timeout(600); v=vstate(pg); fr.append(shot(pg))
    need(v['open'] and v['lab'] and not v['hidden'] and v['tab']=='vibes',f'the Vibes page did not open from the Lab: {v}')
    need(v['tabs']==['Vibes'],f"the Lab door shows the Vibes page alone: {v['tabs']}")
    need(v['people']==['tom','grace','rose','amy','deedee','boppy','tnb','nara','justin','olivia'],f"the Lab's Vibes page should list everyone with a kit: {v['people']}")
    need(v['rank']==['2'],f"the Lab starts with every Vibe at Rank 2: {v['rank']}")
    # Main and Pocket trade places (Tom: Frequent Flier Main, Gamer Geek Pocket at the start)
    vib(pg,'main-tom_gamer',350); fr.append(shot(pg))
    kept=pg.evaluate("()=>JSON.parse(localStorage.getItem('aot-b3-lab')).book.tom")
    need(kept['main']=='tom_gamer' and kept['pocket']=='tom_flier',f"the Lab's change is kept on the device at once: {kept}")
    live=pg.evaluate("()=>({story:b3Member('tom').vibes&&b3Member('tom').vibes.main})")
    need(live['story']!='tom_gamer',f"a change in the Lab must not touch the save's book: {live}")
    # The Rank picker and the Quirk slots
    vib(pg,'rank-5'); v=vstate(pg); need(v['rank']==['5'] and pg.evaluate("()=>b3VibeRank(b3LabBook().tom,'tom_gamer')")==5,f"Rank 5 for every Vibe: {v['rank']}")
    vib(pg,'q-0',350); fr.append(shot(pg))
    picks=pg.evaluate("()=>[...document.querySelectorAll('#m2 [data-m2=pick]')].map(b=>b.dataset.a)")
    need(set(['elixir_hoarder','new_game_plus','upgrade_certificate','million_miler_status'])<=set(picks),f"the Quirk list at Rank 5 should hold Tom's four Quirks: {picks}")
    vib(pg,'pick-upgrade_certificate',350); q=pg.evaluate("()=>b3LabBook().tom.quirks"); need(q==['upgrade_certificate',None],f"picking a Quirk fills the slot: {q}")
    vib(pg,'q-1',300); vib(pg,'pick-upgrade_certificate',350); q=pg.evaluate("()=>b3LabBook().tom.quirks"); need(q==[None,'upgrade_certificate'],f"the same Quirk in the other slot moves it: {q}")
    vib(pg,'q-0',300); vib(pg,'pick-elixir_hoarder',350); q=pg.evaluate("()=>b3LabBook().tom.quirks"); fr.append(shot(pg)); need(q==['elixir_hoarder','upgrade_certificate'],f"two Quirks from two Vibes: {q}")
    vib(pg,'q-0',300); pg.keyboard.press('Escape'); pg.wait_for_timeout(250); v=vstate(pg); need(v['open'] and v['lab'],f'Esc in the Quirk list should go back to the Vibes, not close the page: {v}')
    vib(pg,'rank-2',350); q=pg.evaluate("()=>b3LabBook().tom.quirks"); v=vstate(pg); need(q==[None,None] and v['rank']==['2'],f"back at Rank 2 the Quirks come off: {q} {v['rank']}")
    # Rows: everyone but Tom to the Back, then the last one in Front cannot go
    for who_ in ('grace','rose','amy','deedee','boppy','tnb','nara','justin','olivia'):
        vib(pg,'w-'+who_,200); vib(pg,'row-back',200)
    fr.append(shot(pg))
    rows=pg.evaluate("()=>{ const B=b3LabBook(); return ['tom','grace','rose','amy','deedee','boppy','tnb','nara','justin','olivia'].map(id=>b3RowOf(B[id])); }")
    need(rows==['front']+['back']*9,f'everyone but Tom moved to the Back row: {rows}')
    vib(pg,'w-tom',200); fr.append(shot(pg))
    need(pg.evaluate("()=>document.querySelector('#m2 [data-k=\"row-back\"]').disabled") is True and pg.evaluate("()=>b3RowOf(b3LabBook().tom)")=='front',"the last one in Front cannot go to the Back (the button is off)")
    # Keys and gamepad
    pg.mouse.move(2,2); pg.keyboard.press('KeyE'); pg.wait_for_timeout(250); v=vstate(pg); need(v['who']=='grace',f"E should move to the next family member: {v['who']}")
    pg.keyboard.press('KeyQ'); pg.wait_for_timeout(250); need(vstate(pg)['who']=='tom','Q should move back to Tom')
    seen=[]
    for _ in range(4): pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(110); seen.append(vstate(pg)['focus'])
    need(len(set(seen))>=3 and all(seen),f'the arrow keys should walk down the buttons: {seen}')
    pg.evaluate("()=>m2Pad({dir:'down',dirEdge:true})"); pg.wait_for_timeout(120); need(vstate(pg)['focus'] not in (None,seen[-1]),'the gamepad should move the cursor too')
    fr.append(shot(pg))
    pg.evaluate("()=>m2Pad({B:true})"); pg.wait_for_timeout(450)
    back=pg.evaluate("()=>({open:M2.open,hidden:document.getElementById('m2').hidden,mode:splash.mode,name:(splash.list[splash.sel]||{}).name})")
    need(not back['open'] and back['hidden'] and back['mode']=='lab3' and back['name']=='VIBES AND RANKS',f'B should close the page and land on VIBES AND RANKS: {back}')
    # the old overlay and its names are gone
    gone=pg.evaluate("()=>['B3V','b3vOpen','b3vRender','b3vPad'].filter(n=>{ try { return eval('typeof '+n)!=='undefined'; } catch(e) { return false; } })")
    need(not gone,f'the old Vibes overlay is still defined: {gone}')
    # --- A Lab fight with these Vibes: Gamer Geek as Main, three in the Back row ---
    idx=lab.index('new1'); pg.evaluate("()=>{ B7.speed=2; }"); start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.wait_for_timeout(300)
    for _ in range(12):
        if who(pg)=='tom': break
        pg.evaluate("()=>{ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }"); wait_cmd(pg); pg.wait_for_timeout(200)
    need(who(pg)=='tom','never reached Tom\'s turn in the Lab fight')
    cross=pg.evaluate("()=>B3.deck.find(e=>e.grp==='basic').name"); ff.append(shot(pg))
    need(cross=='Cartridge Blow',f'with Gamer Geek as Main, BASIC should be Cartridge Blow: {cross}')
    ff.append(shot(pg))
    sk=pg.evaluate("()=>B3.deck.filter(e=>e.grp!=='basic'&&!e.ruckus).map(e=>e.name+(e.grp==='pocket'?' [POCKET]':''))")
    need(sk==['Controller Toss','Winged Shell Lock-On','Zone One Blockade [POCKET]','Suite Door Slide [POCKET]'],f'the SKILLS list should be the Main Vibe\'s two Skills, then the Pocket Vibe\'s two, tagged: {sk}')
    pg.click('#b3-party .bx-pc[data-i="1"]'); pg.wait_for_timeout(300); pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); ff.append(shot(pg))
    inf=pg.evaluate("()=>document.getElementById('b3-sheet').textContent")
    need('Gamer Geek' in inf and 'RANK 2' in inf and 'Striker Lean' in inf and 'Frequent Flier' in inf,f'tapping Tom should show his Vibes: {inf[:200]}')
    frows=pg.evaluate("()=>B3.F.party.map(p=>p.id+':'+p.row+':'+p.vibe)")
    need(frows==['grace:back:grace_squishy','tom:front:tom_gamer','rose:back:rose_sugar','deedee:back:deedee_neat'],f'the fight should use the rows and Vibes set on the screen: {frows}')
    stats=pg.evaluate("()=>{ const t=B3.F.party[1]; return {hp:t.maxHp,atk:Math.round(b3Stat(t,'atk')*10)/10}; }")
    need(stats=={'hp':115,'atk':29.9},f'Tom with the Striker Lean: 115 HP and 29.9 Attack at level 2: {stats}')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    for _ in range(80):
        if pg.evaluate("()=>B3.ui")=='done': break
        pg.evaluate("()=>{ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }"); wait_cmd(pg,60000); pg.wait_for_timeout(120)
    pg.wait_for_timeout(500); ff.append(shot(pg))
    won=pg.evaluate("()=>({over:B3.F.over,btn:(document.querySelector('#b3-tray small')||{}).textContent||'',msg:document.getElementById('b3-msg').textContent,vp:b3LabBook().tom.vp,g:b3LabBook().grace.vp})")
    need(won['over']=='win' and '+10 Vibe Points' in won['btn'] and '+10 Vibe Points' in won['msg'],f'a Lab win should say the Vibe Points it paid: {won}')
    need(won['vp']=={'tom_flier':65,'tom_gamer':70,'tom_baker':60} and won['g']=={'grace_squishy':70,'grace_craft':65,'grace_stage':60},f"10 VP to each Main Vibe and 5 to each Pocket Vibe: {won['vp']} {won['g']}")
    pg.click('#b3-app [data-done]'); pg.wait_for_timeout(600)
    # Kept on the device across a reload
    pg.reload(); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start&&window.__LE.b3LabBook',timeout=180000); pg.wait_for_timeout(1200)
    again=pg.evaluate("()=>{ const B=b3LabBook(); return {main:B.tom.main,vp:B.tom.vp.tom_gamer,rose:b3RowOf(B.rose)}; }")
    need(again=={'main':'tom_gamer','vp':70,'rose':'back'},f"the Lab's Vibes should survive a reload: {again}")
    pg.evaluate("()=>{ b3LabReset(); }")
    # --- The save fields ---
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }"); pg.wait_for_timeout(200)
    sv=pg.evaluate("()=>{ saveGame('7',true); const s=readSave('7'); return {tom:s.members.find(m=>m.id==='tom'),mike:s.members.find(m=>m.id==='michael'),n:s.members.filter(m=>m.vibes).map(m=>m.id),cast:Object.keys(B3_CAST)}; }")
    need(sv['tom'].get('vibes')=={'main':'tom_flier','pocket':'tom_gamer','quirks':[None,None],'vp':{'tom_flier':0,'tom_gamer':0,'tom_baker':0}} and sv['tom'].get('row') is None,f"a new game saves a fresh loadout per member: {sv['tom'].get('vibes')}")
    need(sorted(sv['n'])==sorted(i for i in sv['cast'] if i in sv['n']) and set(sv['n'])>={'tom','grace','rose','deedee'} and not (set(sv['n'])&{'boppy','tnb','nara'}) and (not sv['mike'] or 'vibes' not in sv['mike']),f"a new save has a loadout for every member with a kit except the late joiners (Boppy, TNB and Nara get theirs when the story recruits them, stage 15): {sv['n']}")
    need('stamps' in sv['tom'] and 'ranks' in sv['tom'] and 'loadouts' in sv['tom'],'the old save fields (stamps, ranks, loadouts) must stay')
    # The menu's door: the Vibes tab of the new menu, on the save's book (the Lab's book follows Main, Pocket and row, not Vibe Points)
    pg.evaluate("()=>{ openMenu(true); m2Tab('vibes'); }"); pg.wait_for_timeout(450)
    mm=[shot(pg)]
    v=pg.evaluate("()=>({open:M2.open,lab:M2.lab,people:[...document.querySelectorAll('#m2 .m2-fc')].map(b=>b.dataset.a),rank:document.querySelectorAll('#m2 [data-m2=rank]').length,tabs:document.querySelectorAll('#m2 .m2-tab').length})")
    need(v['open'] and not v['lab'] and v['people']==['tom','grace','rose'],f"the menu's Vibes page should list the party: {v}")
    need(v['rank']==0 and v['tabs']==5,f"the Rank picker belongs to the Lab only, and the menu keeps its five tabs: {v}")
    vib(pg,'main-tom_gamer',350); vib(pg,'w-grace',250); vib(pg,'row-back',250); mm.append(shot(pg))
    pg.keyboard.press('KeyM'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{ M2.keys=true; toggleLayout(); }"); pg.wait_for_timeout(600); rot=pg.evaluate("()=>layout.rotated"); f=shot(pg); land=f.rotate(90,expand=True) if rot else f
    fits=pg.evaluate("()=>{ const p=document.querySelector('#m2 .m2-grid').getBoundingClientRect(),g=document.getElementById('stage').getBoundingClientRect(); return p.left>=g.left-1&&p.right<=g.right+1&&p.top>=g.top-1&&p.bottom<=g.bottom+1; }")
    need(fits,'landscape: the menu does not fit inside the stage')
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(450)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(400); mm.append(shot(pg))
    after=pg.evaluate("""()=>{ const a=readSave('auto')||{members:[]},t=a.members.find(m=>m.id==='tom')||{},g=a.members.find(m=>m.id==='grace')||{};
      return {open:M2.open,menu:menuOpen,auto:(t.vibes||{}).main,grow:g.row,lab:b3LabBook().tom.main,labrow:b3RowOf(b3LabBook().grace),labvp:b3LabBook().tom.vp.tom_gamer}; }""")
    need(not after['open'] and not after['menu'],f'Esc should close the menu: {after}')
    need(after['auto']=='tom_gamer' and after['grow']=='back',f"closing the menu should put the change in the autosave: {after}")
    need(after['lab']=='tom_gamer' and after['labrow']=='back' and after['labvp']==60,f"what is set in the menu is what a Lab fight uses (Vibes and row, not Vibe Points): {after}")
    # Save, wipe, load
    rt=pg.evaluate("""()=>{ saveGame('7',true); for(const m of ALL_MEMBERS()) m.vibes=null; const ok=loadGame('7'); const t=b3Member('tom').vibes,g=b3Member('grace').vibes;
      return {ok,tom:t&&t.main,pocket:t&&t.pocket,grow:g&&g.row,vp:t&&t.vp}; }""")
    need(rt=={'ok':True,'tom':'tom_gamer','pocket':'tom_flier','grow':'back','vp':{'tom_flier':0,'tom_gamer':0,'tom_baker':0}},f'save then load should bring the Vibes back: {rt}')
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
    # Full-size frames of the views Tom will use most, to look at closely.
    for name,im in (('b3-s4-vibes-portrait.png',fr[1]),('b3-s4-vibes-menu-landscape.png',land),('b3-s4-fight-skills.png',ff[1])): im.save(os.path.join(OUT,name))

# ---------- Stage 5a: the Traits, Quirks and Capstones of the four first Sig Vibes, at Rank 5 on The Big One ----------
S5_BOOK="""()=>{ const B=b3LabReset(5),Q={tom:['upgrade_certificate','million_miler_status'],grace:['slow_rise_memory_foam','ultra_rare_limited_edition'],rose:['twin_lamb_relay','its_our_longboard_now'],deedee:['car_crumb_vacuum','spit_shine']};
  for(const id in Q) Q[id].forEach((q,i)=>b3SetQuirk(id,B[id],i,q)); b3LabSave(); return Object.keys(Q).map(id=>B[id].quirks.join('+')); }"""
# Before each scripted family turn: full Pep and HP for the family, and the boss's pips topped up so a Break never gets in the way.
S5_PREP="""()=>{ for(const p of B3.F.party) { p.pep=10; if(!p.ko) p.hp=p.maxHp; } const f=B3.F.foes[0]; if(!f.broken&&!f.flusterTurn) { f.pips=f.maxPips; f.pipLock=false; } b3ViewSync(); b3Render(); }"""
def s5(pg): return pg.evaluate("""()=>{ const F=B3.F,P={}; for(const p of F.party) P[p.id]=p; const f=F.foes[0],chips=i=>[...document.querySelectorAll('#b3-party .bx-pc[data-i="'+i+'"] .st')].map(e=>e.textContent);
  return {ui:B3.ui,actor:B3.actor&&B3.actor.id,grant:F.grant&&F.grant.key,turns:F.turnLog.length,ruckus:F.ruckus,pips:f.pips,
    foe:Object.keys(f.st),hp:f.hp,tom:Object.keys(P.tom.st),grace:Object.keys(P.grace.st),rose:Object.keys(P.rose.st),deedee:Object.keys(P.deedee.st),
    cert:P.tom.counters.certificate||0,roseWait:P.rose.wait,roseTurns:P.rose.turns,clock:F.clock,chips:[0,1,2,3].map(chips),
    ctr:(document.querySelector('#b3-party .bx-pc[data-i="1"] .ctr')||{}).textContent||'',
    rows:[...document.querySelectorAll('#b3-rows .bx-mv .nm')].map(e=>e.textContent.replace(/^\\d+/,'').replace(/^★ /,'')),costs:[...document.querySelectorAll('#b3-rows .bx-mv .cost')].map(e=>e.textContent),
    free:(document.querySelector('#b3-rows .bx-free')||{}).textContent||'',back:!!document.querySelector('#b3-app [data-back]'),msg:document.getElementById('b3-msg').textContent,
    bar:[...document.querySelectorAll('#b3-bar .bt-tk')].map(e=>e.dataset.k+(e.classList.contains('now')?'!':'')+(e.classList.contains('ghost')?'?':''))}; }""")
def pick_row(pg,name):
    """With a free Skill's deck open: highlight a row and use it (Enter)."""
    names=select_row(pg,name)
    if name in names: pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
def aim(pg,label):
    """Aims the highlighted move at a named target the way a player does: a tap on the monster on the picture, or on the family member's card. No label: keep the default aim."""
    if not label or pg.evaluate("()=>B3.ui")!='deck': return
    o=pg.evaluate("""(label)=>{ const e=b3Entry(); if(!e) return null; const i=e.opts.findIndex(o=>o.label===label); if(i<0) return null; const u=e.opts[i].units[0]; return {foe:u.side==='foe',key:u.key,i:B3.F.party.indexOf(u)}; }""",label)
    if not o: fails.append(f'aim: {label} is not one of the targets of the highlighted move'); return
    if o['foe']: tap_foe(pg,o['key'])
    else: pg.click(f'#b3-party .bx-pc[data-i="{o["i"]}"]')
    pg.wait_for_timeout(200)
def use(pg,name,target=None):
    """Highlights a move, aims it (a tap) when a target is named, and uses it (Enter)."""
    skill(pg,name); aim(pg,target); pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
def turn_of(pg,member,S,limit=8):
    """Plays Basics until it is that family member's turn (monsters take theirs in between). Returns False if it never comes."""
    for _ in range(limit):
        wait_cmd(pg); pg.wait_for_timeout(250)
        if pg.evaluate("()=>B3.ui==='done'"): break
        if who(pg)==member: pg.evaluate(S5_PREP); return True
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); pg.wait_for_timeout(500)
    fails.append(f"{S}{member}'s turn never came"); return False
def stage5(pg,lab):
    S='stage 5a: '; caps=[]; qk=[]; idx=lab.index('new6')
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    q=pg.evaluate(S5_BOOK); need(all('+' in x for x in q),f'the Lab book did not take both Quirks for everyone: {q}')
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    v=s5(pg); caps.append(shot(pg))
    need(v['actor']=='grace',f"Grace should open at Rank 5: {v['actor']}")
    need('guard_stance' in v['tom'] and 'GUARD' in v['chips'][1],f"Priority Boarding: Tom should start in Guard Stance with its chip on his card: {v['tom']} {v['chips'][1]}")
    # The list a tap opens names the Trait and the Quirks
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText"); f=shot(pg); f.save(os.path.join(OUT,'b3-s5-info-portrait.png')); caps.append(f)
    need('Sensory Satisfying' in txt and 'TRAIT' in txt and 'Slow-Rise Memory Foam' in txt and 'Ultra-Rare Limited Edition' in txt and 'QUIRK' in txt,f"Grace's list should name her Trait and both Quirks: {txt[:300]}")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    # Grace: Colossal Diamond-Gold Dumpling for Rose
    names=skill(pg,'Colossal Diamond-Gold Dumpling'); caps.append(shot(pg)); need(pg.evaluate("()=>[B3.ui,B3.deck[B3.sel].name]")==['deck','Colossal Diamond-Gold Dumpling'],'the first press should only highlight the Capstone')
    before=s5(pg); need(any(k.endswith('?') for k in before['bar']),f"the turn bar shows Grace's ghost for the highlighted Capstone: {before['bar']}")
    aim(pg,'Rose'); pg.keyboard.press('Enter'); pg.wait_for_timeout(250); caps+=burst(pg,3,330)
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor&&B3.ui==='deck'&&!!b3Granted()",timeout=20000); pg.wait_for_timeout(300)
    v=s5(pg); f=shot(pg); f.save(os.path.join(OUT,'b3-s5-free-portrait.png')); caps.append(f)
    need(v['actor']=='rose' and v['grant']=='p2',f"the free Skill should be Rose's to pick: actor {v['actor']}, grant {v['grant']}")
    need(v['free']=='Free Skill for Rose' and not v['back'],f"the list should be headed Free Skill for Rose with no Back row: '{v['free']}', back {v['back']}")
    need(v['rows']==['The Floor Is Lava!','"Giddyup, Tata!" Launch','Tattered Lamby Boomerang','Sofa-Cushion Citadel'] and all(c=='Free' for c in v['costs']),f"Rose's free choices: {v['rows']} {v['costs']}")
    need(v['bar'][0]=='p2#1!' and not any(k.endswith('?') for k in v['bar']),f"the bar shows Rose picking, with no ghost (a free Skill moves nobody): {v['bar']}")
    need('Free from Grace' in v['msg'],f"the message line should say it is free: {v['msg']}")
    need('so_satisfying' in v['deedee'] and 'SATISFYING' in v['chips'][3],f"Sensory Satisfying: Deedee is next after Grace and should carry it: {v['deedee']} {v['chips'][3]}")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200); need(pg.evaluate("()=>B3.ui==='deck'&&!!b3Granted()&&b3Entry().can.ok"),'Esc should not leave the free Skill deck')
    w0=v['roseWait']-0; c0=v['clock']; t0=v['turns']
    # Rose takes The Floor Is Lava! (Clobber leaves no Prime, so the Tsunami that follows leaves the boss Drenched; the landscape pass takes the Launch)
    pick_row(pg,'The Floor Is Lava!'); aim(pg,None); caps+=burst(pg,4,330); wait_cmd(pg); pg.wait_for_timeout(300); v=s5(pg)
    need(v['grant'] is None and v['roseTurns']==0,f"after the free Skill the door is closed and it was not Rose's turn: grant {v['grant']}, Rose's turns {v['roseTurns']}")
    need(abs((v['roseWait']+v['clock'])-(w0+c0))<1e-6,f"Rose keeps her place on the bar: due at {w0+c0:.2f} before, {v['roseWait']+v['clock']:.2f} after")
    need(v['actor']=='deedee',f"the turn order carries on with Deedee: {v['actor']}")
    L=log(pg,40); need('gets a free Skill from Grace' in L and 'for free' in L,f'the log should say who got the free Skill and that it was free: {L[-400:]}')
    # Deedee: Fifty-Year Dust Tsunami
    pg.evaluate(S5_PREP); p0=s5(pg)['pips']; use(pg,'Fifty-Year Dust Tsunami'); caps+=burst(pg,4,330); wait_cmd(pg); pg.wait_for_timeout(300); v=s5(pg); caps.append(shot(pg))
    need('muffin_crown' not in v['foe'] and 'drenched' in v['foe'] and 'spit_shine' in v['foe'],f"the Tsunami should scrub the Crown and leave the boss Drenched and Shined: {v['foe']}")
    need(all('crumb_free' in v[k] for k in ('tom','grace','rose','deedee')),f"Car-Crumb Vacuum: the whole family should have Attack up: {[v[k] for k in ('tom','grace','rose','deedee')]}")
    need(v['actor']=='tom',f"Tom is up after Deedee: {v['actor']}")
    # Tom: Tarmac Porsche Transfer
    pg.evaluate(S5_PREP); h0=s5(pg)['hp']; use(pg,'Tarmac Porsche Transfer'); caps+=burst(pg,4,330); wait_cmd(pg); pg.wait_for_timeout(300); v=s5(pg); caps.append(shot(pg))
    need('high_beams' in v['tom'] and 'ALL EYES' in v['chips'][1],f"High Beams should be on Tom with its chip: {v['tom']} {v['chips'][1]}")
    need(v['hp']<h0,'the Porsche should hurt the boss')
    # Rose: Double-Lamby Return-Cart Blitz
    if turn_of(pg,'rose',S):
        pg.evaluate("()=>{ B3.F.ruckus=40; }"); r0=s5(pg)['ruckus']; pg.evaluate("()=>{ window.__s5hits=0; if(!window.__s5wrap){ window.__s5wrap=1; const os=b3Show; b3Show=function(b){ if(b.t==='hit'&&b.tgt==='f0'&&b.src==='p2') window.__s5hits++; return os.apply(this,arguments); }; } }")
        use(pg,'Double-Lamby Return-Cart Blitz'); caps+=burst(pg,7,360); wait_cmd(pg); pg.wait_for_timeout(300); v=s5(pg); caps.append(shot(pg))
        n=pg.evaluate("()=>window.__s5hits"); need(n==6,f'the Blitz should show six hits on the boss: {n}')
        need(v['ruckus']>=r0+12,f"Bouncy Physics: six hits should add 12% to the gauge: {r0} to {v['ruckus']}")
    # The boss has had its first turn by now, with High Beams on Tom: whatever it used, it aimed at Tom
    aimed=pg.evaluate("()=>Object.values(B3.F.foes[0].lastAim||{}).map(x=>x.key)")
    need(len(aimed)>0 and all(k=='p1' for k in aimed),f'with High Beams on Tom the boss should aim at Tom (p1): {aimed}')
    sheet(caps,5,os.path.join(OUT,'b3-s5-caps.png'))
    # Tom steps in for Grace: a Certificate, and Million-Miler Status answers
    if turn_of(pg,'tom',S):
        # The family's Basics keep pushing the boss back (Windex Spritz then a Clobber hit is a Hydro-Slip!), so the test pokes it
        # to the front of the bar, clears what would make it miss or bite a Marked Tom, and aims a Tail Slap at Grace right after Tom's turn.
        pg.evaluate("()=>{ const F=B3.F,t=F.party[1],f=F.foes[0]; b3EndStatus(F,t,'high_beams'); for(const id of ['blind','windexed','flustered']) b3EndStatus(F,f,id); f.broken=false; f.charge=null; f.mark=null; f.actIx=f.D.acts.findIndex(A=>A.id==='tail_slap'); f.wait=.01; b3AddStatus(F,F.party[0],'t_taunt',{}); b3ViewSync(); b3Render(); }")
        use(pg,'Suite Door Slide'); qk+=burst(pg,8,330); wait_cmd(pg); pg.wait_for_timeout(250)
        qk.append(shot(pg)); v=s5(pg); L=log(pg,60); got=v['cert']>=1
        need(got and v['ctr']==str(v['cert']),f"stepping in for Grace should stamp a Certificate and show its number on Tom's portrait: {v['cert']} '{v['ctr']}'")
        need('Tom: Upgrade Certificate.' in L,f'the screen should name Upgrade Certificate when it stamps: {L[-500:]}')
        need('Tom: Million-Miler Status!' in L,f'Million-Miler Status should answer when Tom steps in: {L[-500:]}')
        if turn_of(pg,'tom',S):
            c=s5(pg)['cert']; pg.evaluate("()=>{ window.__s5d=[]; const os=b3Show; if(!window.__s5wrap2){ window.__s5wrap2=1; b3Show=function(b){ if(b.t==='hit'&&b.src==='p1') window.__s5d.push(b.dmg); return os.apply(this,arguments); }; } }")
            use(pg,'Controller Toss'); qk+=burst(pg,3,330); wait_cmd(pg); pg.wait_for_timeout(250); v=s5(pg); qk.append(shot(pg))
            need(c>=1 and v['cert']==0 and v['ctr']=='',f"Controller Toss should cash the Certificates: {c} before, {v['cert']} after, portrait '{v['ctr']}'")
    # Deedee's Scrub on the Drenched boss: Hydro-Slip! and Spotless Floor's extra pip
    if turn_of(pg,'deedee',S):
        pg.evaluate("()=>{ const F=B3.F,f=F.foes[0]; if(!f.st.drenched) b3AddStatus(F,f,'drenched',{src:F.party[3]}); f.pips=f.maxPips; f.pipLock=false; F.party[3].used={}; b3ViewSync(); b3Render(); }")
        p0=s5(pg)['pips']; use(pg,'"Hand Me My Glasses" Scrub'); qk+=burst(pg,4,330); wait_cmd(pg); pg.wait_for_timeout(250); v=s5(pg); L=log(pg,30); qk.append(shot(pg))
        need('Deedee: Spotless Floor.' in L and v['pips']==p0-2,f"Spotless Floor: Hydro-Slip!'s pip and 1 more should come off ({p0} to {v['pips']}): {L[-300:]}")
    sheet(qk,5,os.path.join(OUT,'b3-s5-quirks.png'))
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    # Landscape: the free Skill list and a Capstone
    pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(500); rot=pg.evaluate("()=>layout.rotated"); R=lambda f: f.rotate(90,expand=True) if rot else f; fr=[]
    pg.evaluate(S5_BOOK); start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300); fr.append(R(shot(pg)))
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); fr.append(R(shot(pg))); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    use(pg,'Colossal Diamond-Gold Dumpling','Rose'); fr+=[R(f) for f in burst(pg,2,400)]
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&B3.actor&&B3.ui==='deck'&&!!b3Granted()",timeout=20000); pg.wait_for_timeout(300); v=s5(pg); f=R(shot(pg)); f.save(os.path.join(OUT,'b3-s5-free-landscape.png')); fr.append(f)
    need(v['actor']=='rose' and v['free']=='Free Skill for Rose',f"landscape: the free Skill list should open for Rose: {v['actor']} '{v['free']}'")
    vis=pg.evaluate("()=>{ const h=document.querySelector('#b3-rows .bx-free'),b=document.getElementById('b3-side').getBoundingClientRect(),r=h.getBoundingClientRect(); return r.width>0&&r.height>0&&r.top>=b.top-1&&r.bottom<=b.bottom+1&&r.left>=b.left-1&&r.right<=b.right+1; }")
    need(vis,'landscape: the FREE SKILL heading is not inside the deck box')
    pick_row(pg,'"Giddyup, Tata!" Launch'); aim(pg,None); fr+=[R(f) for f in burst(pg,3,400)]; wait_cmd(pg); pg.wait_for_timeout(250)
    need(s5(pg)['actor']=='deedee','landscape: the turn order should carry on with Deedee after the free Skill')
    pg.evaluate(S5_PREP); use(pg,'Fifty-Year Dust Tsunami'); fr+=[R(f) for f in burst(pg,3,400)]; wait_cmd(pg); pg.wait_for_timeout(250); fr.append(R(shot(pg)))
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    if pg.evaluate("()=>splash.mode")!='lab3' or pg.evaluate("()=>B3.active"): fails.append(S+'landscape: EXIT did not go back to the list')
    sheet(fr,4,os.path.join(OUT,'b3-s5-land.png'))
    pg.evaluate("()=>{ toggleLayout(); b3LabReset(); B7.speed=1; }"); pg.wait_for_timeout(400)

S5B_BOOK="""()=>{ const B=b3LabReset(5),Q={tom:['elixir_hoarder','new_game_plus'],grace:['permanent_marker','double_coat'],rose:['twin_lamb_relay','its_our_longboard_now'],deedee:['car_crumb_vacuum','spit_shine']};
  for(const id of ['tom','grace']) b3SetMain(id,B[id],B[id].pocket);
  for(const id in Q) Q[id].forEach((q,i)=>b3SetQuirk(id,B[id],i,q)); b3LabSave(); return Object.keys(Q).map(id=>B[id].main+':'+B[id].quirks.join('+')); }"""
# Records every act a monster starts (who it aimed at), so a test can compare the aim with what Cartridge Blow showed.
S5B_HOOK="""()=>{ window.__b5=[]; if(!window.__b5w) { window.__b5w=1; const os=b3Show; b3Show=function(b){ if(b.t==='act'&&b.foe) window.__b5.push({src:b.src,tgts:b.tgts,name:b.name}); return os.apply(this,arguments); }; } }"""
def s5b(pg): return pg.evaluate("""()=>{ const F=B3.F,f=F.foes[0],I=f.intent,P={}; for(const p of F.party) P[p.id]=p;
  return {intent:I&&{act:I.act,aim:I.aim,kind:I.kind,name:I.name},lock:f.aimLock&&f.aimLock.key,viewAim:B3.view.aim[f.key]||null,acts:(window.__b5||[]).slice(),foe:Object.keys(f.st),pips:f.pips,
    tom:Object.keys(P.tom.st),grace:Object.keys(P.grace.st),haz:B3.view.haz.map(h=>h.id),hazText:F.hazards.map(h=>h.id),
    chips:[...document.querySelectorAll('#b3-party .bx-pc')].map(e=>[...e.querySelectorAll('.st')].map(x=>x.textContent)),
    cards:[...document.querySelectorAll('#b3-party .bx-pc')].map(e=>!!e.querySelector('.nx')),log:B3.log.slice(-60).join(' | ')}; }""")
def stage5b(pg,lab,landscape=False):
    S='stage 5b'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new6')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    q=pg.evaluate(S5B_BOOK); need(q[0].startswith('tom_gamer:elixir_hoarder+new_game_plus') and q[1].startswith('grace_craft:permanent_marker+double_coat'),f'the Lab book did not take the second Vibes and their Quirks: {q}')
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.evaluate(S5B_HOOK); pg.wait_for_timeout(300)
    if not turn_of(pg,'tom',S): return
    caps.append(R(shot(pg)))
    # The tap list names Gamer Geek's Trait and both Quirks
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
    if not landscape: f=shot(pg); f.save(os.path.join(OUT,'b3-s5b-info-portrait.png')); caps.append(f)
    need('Gamer\u2019s Intuition' in txt and 'Elixir Hoarder' in txt and 'New Game Plus' in txt and 'TRAIT' in txt,f"Tom's list should name his Trait and both Quirks: {txt[:300]}")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    # Cartridge Blow: the hit, then who the boss will aim at, on the card and over the head
    basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(400); v=s5b(pg); caps.append(R(shot(pg)))
    need(v['intent'] and v['intent']['aim'] and v['intent']['kind']=='strike' and v['lock']==v['intent']['aim'],f"Cartridge Blow should show and hold the boss's next aim: {v['intent']} {v['lock']}")
    ai=['p0','p1','p2','p3'].index(v['intent']['aim']) if v['intent'] and v['intent']['aim'] else -1
    need(v['viewAim']==(v['intent'] or {}).get('aim') and ai>=0 and v['cards'][ai] and sum(v['cards'])==1,f"exactly the aimed family member's card should say NEXT TARGET: {v['cards']} {v['viewAim']}")
    need(ai>=0 and 'NEXT TARGET' in v['chips'][ai],f"the chip text: {v['chips']}")
    if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s5b-aim-portrait.png'))
    shown=(v['intent'] or {}).get('aim'); n0=len(v['acts'])
    for _ in range(8):
        v=s5b(pg)
        if len(v['acts'])>n0: break
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(300)
    v=s5b(pg); need(len(v['acts'])>n0 and v['acts'][n0]['tgts']==[shown],f"the boss should go exactly where Cartridge Blow said ({shown}): {v['acts'][n0:n0+1]}")
    need(v['intent'] is None and v['viewAim'] is None and not any(v['cards']),f"the boss's turn spends what it showed, on the field and the cards: {v['intent']} {v['cards']}")
    if landscape:
        sheet(caps,3,os.path.join(OUT,'b3-s5b-land.png'),scale=.6); return
    # Winged Shell Lock-On, then the boss attacks into it
    if not turn_of(pg,'tom',S): return
    n0=len(s5b(pg)['acts']); use(pg,'Winged Shell Lock-On'); wait_cmd(pg); pg.wait_for_timeout(300); v=s5b(pg); caps.append(shot(pg))
    need('winged_shell' in v['foe'],f"the shell should be on the boss: {v['foe']}")
    for _ in range(8):
        v=s5b(pg)
        if len(v['acts'])>n0: break
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(300)
    pg.wait_for_timeout(1200); v=s5b(pg); caps.append(shot(pg))
    need('winged_shell' not in v['foe'] and 'Winged Shell!' in v['log'],f"the shell should have slammed the boss and been used up: {v['foe']} {v['log'][-300:]}")
    # Grace: Bedazzle-Gun Glue Trap, then the boss gets stuck
    if not turn_of(pg,'grace',S): return
    n0=len(s5b(pg)['acts']); use(pg,'Bedazzle-Gun Glue Trap'); wait_cmd(pg); pg.wait_for_timeout(300); v=s5b(pg); f=shot(pg); caps.append(f); f.save(os.path.join(OUT,'b3-s5b-glue-portrait.png'))
    need('glue_trap' in v['haz'] and 'glue_trap' in v['hazText'],f"the Glue Trap should be on the floor and on screen: {v['haz']}")
    for _ in range(8):
        v=s5b(pg)
        if len(v['acts'])>n0: break
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(300)
    pg.wait_for_timeout(1200); v=s5b(pg); caps.append(shot(pg))
    need('fatigue' in v['foe'] and 'gets stuck in the glue trap' in v['log'],f"the boss should be caught in the glue and Fatigued: {v['foe']} {v['log'][-300:]}")
    # Makeover (Grace) and Konami Code (Tom)
    if not turn_of(pg,'grace',S): return
    use(pg,'Masterpiece Portrait Makeover'); wait_cmd(pg); pg.wait_for_timeout(300); v=s5b(pg); need('razzle_weak' in v['foe'],f"Makeover should leave Razzle Weakness on the boss: {v['foe']}"); caps.append(shot(pg))
    if not turn_of(pg,'tom',S): return
    p0=pg.evaluate("()=>B3.F.foes[0].pips"); use(pg,'Konami Code'); wait_cmd(pg); pg.wait_for_timeout(300); v=s5b(pg); caps.append(shot(pg))
    need(v['pips']<=p0-2 or v['pips']==0,f"Konami Code should take 2 Composure pips off the boss: {p0} to {v['pips']}")
    sheet(caps,4,os.path.join(OUT,'b3-s5b.png'),scale=.55)
S5C_BOOK="""()=>{ const B=b3LabReset(5),Q={rose:['mint_condition_backup','emergency_stuffy_swap'],deedee:['first_ring_pickup','warm_beats_cold']};
  for(const id of ['rose','deedee']) b3SetMain(id,B[id],B[id].pocket);
  for(const id in Q) Q[id].forEach((q,i)=>b3SetQuirk(id,B[id],i,q)); b3LabSave(); return Object.keys(Q).map(id=>B[id].main+':'+B[id].quirks.join('+')); }"""
def s5c(pg): return pg.evaluate("""()=>{ const F=B3.F,P={}; for(const p of F.party) P[p.id]=p; const f=F.foes[0];
  return {shield:F.party.map(p=>(p.shields||[]).reduce((a,x)=>a+x.amt,0)),fort:F.party.map(p=>!!p.st.pillow_fort),jacket:F.party.map(p=>!!p.st.jacket),
    foe:Object.keys(f.st),later:F.later.length,rosePep:P.rose.pep,deedeePep:P.deedee.pep,log:B3.log.slice(-60).join(' | ')}; }""")
def stage5c(pg,lab,landscape=False):
    S='stage 5c'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new6')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    q=pg.evaluate(S5C_BOOK); need(q[0].startswith('rose_cozy:mint_condition_backup+emergency_stuffy_swap') and q[1].startswith('deedee_nurse:first_ring_pickup+warm_beats_cold'),f'the Lab book did not take the second Vibes and their Quirks: {q}')
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    if not turn_of(pg,'rose',S): return
    caps.append(R(shot(pg)))
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
    need('Well-Loved Original' in txt and 'Mint-Condition Backup' in txt and 'Emergency Stuffy Swap' in txt,f"Rose's list should name her Trait and both Quirks: {txt[:300]}")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    use(pg,'Sofa-Cushion Citadel'); wait_cmd(pg); pg.wait_for_timeout(500); v=s5c(pg); caps.append(R(shot(pg)))
    if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s5c-citadel-portrait.png'))
    need(all(x>0 for x in v['shield']) and all(v['fort']),f"Citadel should put a shield and a pillow fort on all four: {v['shield']} {v['fort']}")
    if not turn_of(pg,'deedee',S): return
    use(pg,'"Bring a Jacket!" Ward'); wait_cmd(pg); pg.wait_for_timeout(500); v=s5c(pg); caps.append(R(shot(pg)))
    need(sum(v['jacket'])==2,f"the Ward should put a jacket on exactly two family members: {v['jacket']}")
    if not turn_of(pg,'rose',S): return
    use(pg,'Tattered Lamby Boomerang'); wait_cmd(pg); pg.wait_for_timeout(500); v=s5c(pg); caps.append(R(shot(pg)))
    need('lamby_stuck' in v['foe'] and v['later']>=1,f"the Boomerang should leave Lamby stuck on the boss with the tackle waiting: {v['foe']} {v['later']}")
    for _ in range(6):
        if 'Give Lamby Back!' in s5c(pg)['log']: break
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(400)
    pg.wait_for_timeout(600); v=s5c(pg); caps.append(R(shot(pg)))
    need('Give Lamby Back!' in v['log'] and 'lamby_stuck' not in v['foe'],f"Rose's next turn should bring Lamby back and clear the mark: {v['foe']} {v['log'][-200:]}")
    sheet(caps,3 if landscape else 3,os.path.join(OUT,'b3-s5c'+('-land' if landscape else '')+'.png'),scale=.55)

def s6(pg): return pg.evaluate("""()=>{ const F=B3.F; return {ui:B3.ui,actor:B3.actor&&B3.actor.id,ruckus:F.ruckus,view:B3.view.ruckus,turns:F.turnLog.length,
    btn:(document.querySelector('#b3-rkm b')||{}).textContent||'',fill:(document.querySelector('#b3-rkm .track i')||{style:{}}).style.cssText||'',
    rows:[...document.querySelectorAll('#b3-rows .bx-mv.ruck .nm')].map(e=>e.textContent.replace(/^\\d+/,'')),costs:[...document.querySelectorAll('#b3-rows .bx-mv.ruck .cost')].map(e=>e.textContent),
    gold:[...document.querySelectorAll('#b3-rows .bx-mv')].map(e=>e.classList.contains('ruck')),msg:document.getElementById('b3-msg').textContent,
    pep:F.party.map(p=>p.pep),next:F.units.slice().sort(b3Before).map(u=>u.key).slice(0,5),log:B3.log.slice(-40).join(' | '),stored:localStorage.getItem('aot-b3-ruckus')}; }""")
def stage6(pg,lab,landscape=False):
    S='stage 6'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new6')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    pg.evaluate("()=>localStorage.removeItem('aot-b3-ruckus')")
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    v=s6(pg); need(v['ruckus']==0 and v['btn']=='0%' and not v['rows'],f"a fresh fight shows RUCKUS 0% with no RUCKUS move in the deck: {v['ruckus']} {v['btn']} {v['rows']}")
    caps.append(R(shot(pg)))
    # Fill it to 100: the meter is full and the two gold moves lead the deck.
    pg.evaluate("()=>{ B3.F.ruckus=100; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(200); v=s6(pg)
    need(v['btn']=='100%' and '100%' in v['fill'],f"RUCKUS at 100% should be full: {v['btn']} {v['fill']}")
    need(len(v['rows'])==2 and v['gold'][:2]==[True,True] and v['rows'][0].upper()=='DOUBLE TEAM' and v['rows'][1].upper()=='FAMILY RUCKUS' and v['costs']==['50%','100%'],f"the gold moves should lead the deck with both spends: {v['rows']} {v['costs']} {v['gold']}")
    caps.append(R(shot(pg)))
    # Double Team: the first member of a party turn, partner next on the bar. The first tap only shows it, the second uses it.
    turns0=s6(pg)['turns']; peps=s6(pg)['pep']; who0=who(pg); nxt=s6(pg)['next'][1]
    pg.keyboard.press('Digit1'); pg.wait_for_timeout(250); caps.append(R(shot(pg)))
    need(pg.evaluate("()=>[B3.ui,B3.deck[B3.sel].ruckus]")==['deck','double'] and s6(pg)['turns']==turns0,'the first press on Double Team should only highlight it')
    pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    need(s6(pg)['ui']=='busy' or s6(pg)['ui']=='deck','Double Team on a lone boss should go without choosing a target')
    pg.wait_for_timeout(1500); caps.append(R(shot(pg)))
    wait_cmd(pg); pg.wait_for_timeout(500); v=s6(pg)
    need('Double Team' in v['log'],f"the log should name Double Team: {v['log'][-240:]}")
    need(v['ruckus']<100 and v['ruckus']>=50,f"50% was spent (and the pair's own hits filled some): {v['ruckus']}")
    # The partner kept their own turn: it is now the partner's.
    need(who(pg) is not None,'a family member should be up after the pair')
    caps.append(R(shot(pg)))
    # Full Family Ruckus needs a family member next: find a turn where one is, fill the gauge and spend it.
    for _ in range(10):
        pg.evaluate("()=>{ B3.F.ruckus=100; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(150)
        nx=pg.evaluate("()=>{ const o=b3TurnOrder(B3.F).filter(x=>x!==B3.actor)[0]; return o&&o.side; }")
        if nx=='party': break
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(300)
    pg.keyboard.press('Digit2'); pg.wait_for_timeout(250)
    v=s6(pg); need(pg.evaluate("()=>B3.deck[B3.sel].ruckus")=='full','the deck should have the Full spend highlighted: '+str(v['ui'])); caps.append(R(shot(pg)))
    full_name=pg.evaluate("()=>B3.deck[B3.sel].name")   # b3s16: a pair with a live Tombo skin reads the skin's name; the others read Full Family Ruckus
    pg.keyboard.press('Enter'); pg.wait_for_timeout(2500); wait_cmd(pg); pg.wait_for_timeout(600); v=s6(pg)
    need(full_name+'!' in v['log'],f"the log should name {full_name} (Family Ruckus or the pair's Tombo skin): {v['log'][-240:]}")
    caps.append(R(shot(pg)))
    # The gauge goes on to the next fight: leave and read what the Lab stored.
    g=s6(pg)['ruckus']; pg.click('#b3-exit'); pg.wait_for_timeout(500)
    st=pg.evaluate("()=>localStorage.getItem('aot-b3-ruckus')"); need(st==str(round(g)),f'leaving should store the gauge ({g}): {st}')
    sheet(caps,4,os.path.join(OUT,'b3-s6'+('-land' if landscape else '')+'.png'),scale=.5)
    pg.evaluate("()=>localStorage.removeItem('aot-b3-ruckus')")

def stage16(pg,lab,landscape=False):
    """Stage 16: Tombo skins. A Full Family Ruckus in a Lab fight shows the live skin's name on the tray and on the screen, says the pair's
    recorded lines, and the plain name comes back for a pair with no skin. Story flags and the Lab's all-unlocked rule are checked on the page."""
    S='stage 16'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new6')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }"); pg.evaluate("()=>localStorage.removeItem('aot-b3-ruckus')")
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    # The choosing rule on the real page: no flag, no skin; a flag makes it live; the Lab counts every skin as unlocked.
    r=pg.evaluate("""()=>{ const out={}; const lab=B3.cfg.lab; B3.cfg.lab=false; const save={...STORY.flags};
      for(const k of Object.keys(STORY.flags)) if(/^tombo:/.test(k)) delete STORY.flags[k];
      out.none=!b3SkinFor('tom','grace'); STORY.flags['tombo:grace1']=true; out.one=(b3SkinFor('tom','grace')||{}).name; STORY.flags['tombo:grace2']=true; out.two=(b3SkinFor('grace','tom')||{}).name;
      B3.cfg.lab=true; out.lab=(b3SkinFor('tom','deedee')||{}).name; out.nopair=!b3SkinFor('grace','deedee')&&!b3SkinFor('tom','justin');
      B3.cfg.lab=lab; for(const k of Object.keys(STORY.flags)) delete STORY.flags[k]; Object.assign(STORY.flags,save); return out; }""")
    need(r['none'],'no Tombo flag should mean no skin: '+str(r)); need(r['one']=='Squishy Delivery' and r['two']=='Uncle Spotter Toss',"tombo:grace1 then grace2 should make Squishy Delivery then Uncle Spotter Toss live: "+str(r))
    need(r['lab']=='Tom Cooks for Mom' and r['nopair'],"the Lab counts every skin as unlocked (Tom and Deedee: Tom Cooks for Mom), and Grace with Deedee or Tom with Justin has none: "+str(r))
    # Spy on the spoken lines.
    pg.evaluate("()=>{ window.__said=[]; if(window.__sayWrapped) return; window.__sayWrapped=true; const o=window.say; window.say=function(){ window.__said.push([arguments[0],arguments[1]]); return o.apply(this,arguments); }; }")
    def find_pair(skin,tries=40):
        """Play basics until a family pair with (skin=True) or without (False) a live skin is up, with the gauge full."""
        for _ in range(tries):
            pg.evaluate("()=>{ B3.F.ruckus=100; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(120)
            ok_=pg.evaluate("""(want)=>{ const u=B3.actor,p=b3TurnOrder(B3.F).filter(x=>x!==u)[0]; return !!(u&&p&&p.side==='party'&&u.side==='party'&&(!!b3SkinFor(u.id,p.id))===want); }""",skin)
            if ok_: return True
            pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(250)
        return False
    def fire(label):
        pg.evaluate("()=>{ window.__said.length=0; }")
        info=pg.evaluate("""()=>{ const u=B3.actor,p=b3TurnOrder(B3.F).filter(x=>x!==u)[0],sk=b3SkinFor(u.id,p.id),e=B3.deck.find(d=>d.ruckus==='full'); return {a:u.id,b:p.id,skin:sk&&sk.name,deck:e&&e.name,lines:sk?b3SkinLines(sk,u.id,p.id).map(l=>l.join('.')):[]}; }""")
        nm=info['skin'] or 'Family Ruckus'
        need(info['deck']==nm,f"{label}: the Family Ruckus row should read {nm}: {info}")
        pg.keyboard.press('Digit2'); pg.wait_for_timeout(300)
        row=pg.evaluate("()=>{ const r=document.querySelector('#b3-rows .bx-mv.sel .nm'); return r?r.innerText:''; }"); tray=pg.evaluate("()=>(document.querySelector('#b3-tray')||{}).innerText||''")
        need(nm in row and nm not in tray,f"{label}: the highlighted row should name {nm} and the tray should not repeat it (b3look): {row} | {tray[:120]}"); caps.append(R(shot(pg)))
        pg.keyboard.press('Enter')
        seen=False; w=[]
        for _ in range(14):
            pg.wait_for_timeout(120)
            w=pg.evaluate("()=>(B3P.words||[]).map(w=>w.text)")
            if (nm.upper()+'!') in w and not seen: seen=True; caps.append(R(shot(pg)))
        need(seen,f"{label}: the screen should flash {nm} in big letters: last words {w}")
        wait_cmd(pg); pg.wait_for_timeout(600)
        lg=pg.evaluate("()=>B3.log.slice(-60).join(' | ')"); said=pg.evaluate("()=>window.__said")
        need((info['a'] and nm+'!' in lg),f"{label}: the log should name {nm}: {lg[-240:]}")
        need(['.'.join(x) for x in said]==info['lines'],f"{label}: the pair's recorded lines should play in order {info['lines']}: {said}")
        return info
    # A pair with no skin keeps the plain name and says nothing extra; then a Tom pair shows its skin and speaks its lines.
    need(find_pair(False),'a family pair with no skin should come up in the Lab'); fire('no skin')
    need(find_pair(True),'a Tom pair with a skin should come up in the Lab'); info=fire('skin '+str(pg.evaluate("()=>B3.actor&&B3.actor.id")))
    need(info['skin'] is not None and len(info['lines'])==2,f"a Tom pair's skin plays two lines: {info}")
    caps.append(R(shot(pg)))
    pg.click('#b3-exit'); pg.wait_for_timeout(400)
    sheet(caps,4,os.path.join(OUT,'b3-s16'+('-land' if landscape else '')+'.png'),scale=.5)
    pg.evaluate("()=>localStorage.removeItem('aot-b3-ruckus')")

def tray_full(pg,key):
    """The tray's one line plus the full list sheet for one unit (battleux1: the tray is one line, the sheet holds the long text), lower-cased."""
    pg.evaluate("(k)=>b3OpenSheet(k)",key); pg.wait_for_timeout(250)
    T=(pg.inner_text('#b3-tray')+' '+pg.inner_text('#b3-sheet')).lower()
    pg.keyboard.press('Escape'); pg.wait_for_timeout(120); return T
def s7(pg): return pg.evaluate("""()=>{ const q=sel=>[...document.querySelectorAll(sel)];
    return {ui:B3.ui,sel:B3.sel,actor:B3.actor&&B3.actor.id,turns:B3.F.turnLog.length,over:B3.F.over,rec:q('#b3-rows .bx-mv.rec').length,recAt:q('#b3-rows .bx-mv').findIndex(e=>e.classList.contains('rec')),
      deckRec:B3.deck.findIndex(e=>e.rec),n:B3.deck.length,look:B3.look,sheet:B3.sheet,aim:B3.aimK,say:document.getElementById('b3-msg').textContent,
      tray:document.getElementById('b3-tray').innerText,keys:document.getElementById('b3-app').classList.contains('keys'),det:document.getElementById('b3-app').classList.contains('det'),
      useBtn:q('#b3-rows .bx-mv.sel .use').length,logTail:B3.log.slice(-6).join(' | ')}; }""")
def stage7(pg,lab,landscape=False):
    """The deck's behaviour (battleux1): the first tap shows and the second uses (mouse too), the recommended move in Rose Mode, the keys and the pad,
    the aim, the DETAILS switch and the bar's tools. The pictures on the deck are battleux3's."""
    S='stage 7'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new1')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('rose'); }"); need(pg.evaluate("()=>b7Diff().pictures&&b7Diff().recommend"),'Rose Mode should turn on pictures and the recommended move')
    pg.evaluate(S5_BOOK)
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(400); pg.mouse.move(2,2)
    # 1. the deck opens on the recommended move (Rose Mode), one row glowing
    v=s7(pg); caps.append(R(shot(pg)))
    need(v['ui']=='deck' and v['rec']==1 and v['recAt']==v['sel']==v['deckRec'],f"the deck should open on the one recommended move: {v['ui']} rec {v['rec']} at {v['recAt']} sel {v['sel']}")
    # 2. keys: Up and Down move the highlight and use nothing; a number key highlights; the tray follows
    n0=v['turns']; sel0=v['sel']
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(200); v=s7(pg)
    need(v['sel']==(sel0+1)%v['n'] and v['turns']==n0 and v['keys'],f"Down moves the highlight one row and uses nothing, and the keys hint shows: sel {sel0} -> {v['sel']} turns {v['turns']} keys {v['keys']}")
    pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(150); need(s7(pg)['sel']==sel0,'Up goes back one row')
    pg.keyboard.press('Digit1'); pg.wait_for_timeout(150); need(s7(pg)['sel']==0 and s7(pg)['turns']==n0,'Digit1 highlights the first move and uses nothing')
    # 3. a click: the first shows (the tray says what it does), the second on the same move uses it. A mouse is a tap like any other.
    pg.mouse.move(2,2); i=1 if v['n']>1 else 0
    row=f'#b3-rows .bx-mv[data-i="{i}"]'; pg.click(row); pg.wait_for_timeout(300); v=s7(pg)
    need(v['sel']==i and v['turns']==n0 and not v['keys'],f"the first click highlights and uses nothing: sel {v['sel']} turns {v['turns']} keys {v['keys']}")
    need(pg.evaluate("()=>{ const e=b3Entry(),S=e.S; return e.ruckus?B3_RUCKUS[e.ruckus].short:(b3Details()?S.desc:S.short||S.desc); }")[:30] in v['tray'],'the tray says what the highlighted move does'); caps.append(R(shot(pg)))
    # 4. the aim: left and right step through the targets, a tap on a monster aims at it, a tap on a family card shows that member
    pg.keyboard.press('Digit1'); pg.wait_for_timeout(150)
    if pg.evaluate("()=>b3Entry().opts.length")>1:
        a0=s7(pg)['aim']; pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(200); a1=s7(pg)['aim']; need(a1!=a0,f'Right steps the aim: {a0} -> {a1}')
        pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(200); need(s7(pg)['aim']==a0,'Left steps it back')
        other=pg.evaluate("()=>{ const o=b3Entry().opts.find(o=>o.key!==B3.aimK); return o&&o.units[0].key; }")
        if other: tap_foe(pg,other); pg.wait_for_timeout(250); need(s7(pg)['aim']==other,f'a tap on {other} aims the move at it')
    pg.click('#b3-party .bx-pc[data-i="1"]'); pg.wait_for_timeout(250); need(s7(pg)['look']=='p1' or s7(pg)['aim']=='p1','a tap on a family card shows or aims at that member')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); need(s7(pg)['look'] is None,'Esc puts the shown member away')
    # 5. I opens the full list, I again closes it; the pad's Y does the same; B closes
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(250); need(s7(pg)['sheet'] is not None,'I opens the list for whoever is up'); caps.append(R(shot(pg)))
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(200); need(s7(pg)['sheet'] is None,'I again closes it')
    pg.evaluate("()=>b3Pad(null,null,false,false,true)"); pg.wait_for_timeout(250); need(s7(pg)['sheet'] is not None,"the pad's Y opens the list")
    pg.evaluate("()=>b3Pad(null,null,false,true,false)"); pg.wait_for_timeout(250); need(s7(pg)['sheet'] is None,"the pad's B closes it")
    # 6. the pad: D-pad down moves the highlight, up moves back, A uses
    a=s7(pg)['sel']; pg.evaluate("()=>b3Pad('down',true,false,false,false)"); pg.wait_for_timeout(200); b=s7(pg)['sel']; pg.evaluate("()=>b3Pad('up',true,false,false,false)"); pg.wait_for_timeout(200)
    need(b==(a+1)%s7(pg)['n'] and s7(pg)['sel']==a,f"the pad's D-pad down and up move the highlight: {a} -> {b} -> {s7(pg)['sel']}")
    # 7. A on the recommended move really plays a turn (and one tap of A is enough: the highlight is already there)
    t0=s7(pg)['turns']; rec=s7(pg)['deckRec']
    pg.evaluate("(r)=>b3Select(r)",rec); pg.wait_for_timeout(150); pg.evaluate("()=>b3Pad(null,null,true,false,false)")
    for _ in range(4):
        pg.wait_for_timeout(2200); wait_cmd(pg); pg.wait_for_timeout(300)
        if s7(pg)['turns']>t0 or s7(pg)['over']: break
    need(s7(pg)['turns']>t0 or s7(pg)['over'],f"A on the recommended move plays a turn: {t0} -> {s7(pg)['turns']} {s7(pg)['logTail'][-120:]}")
    caps.append(R(shot(pg)))
    # 8. the glow stays on exactly one move at the start of every turn for ten turns, and one press of Enter plays it
    bad=[]
    for k in range(10):
        pg.evaluate(S5_PREP); pg.mouse.move(2,2); v=s7(pg)
        if v['ui']=='deck' and (v['rec']!=1 or v['sel']!=v['deckRec']): bad.append((v['actor'],v['rec'],v['sel'],v['deckRec']))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(2200)
        if pg.evaluate("()=>B3.F.over||B3.ui==='done'"): break
        wait_cmd(pg)
    need(bad==[],f"one glowing move, already highlighted, at the start of every turn: {bad}")
    # 9. DETAILS: the switch is in the bar, the choice is kept on the device, and the deck class follows it
    pg.evaluate("()=>localStorage.removeItem(M2_DET_KEY)")
    d0=pg.evaluate("()=>b3Details()"); pg.locator('[data-tool="details"]:visible').first.click(); pg.wait_for_timeout(200)
    need(pg.evaluate("()=>b3Details()")==(not d0) and pg.evaluate("()=>localStorage.getItem(M2_DET_KEY)")==('off' if d0 else 'on'),'the DETAILS switch flips and is kept in localStorage, the setting the menu uses')
    need(s7(pg)['det']==(not d0),'the deck changes with the DETAILS switch'); pg.locator('[data-tool="details"]:visible').first.click(); pg.wait_for_timeout(150)
    # 10. the bar's tools: speed cycles, EXIT leaves (below, after the loadout check)
    sp=pg.evaluate("()=>B7.speed"); pg.click('#b3-speed'); pg.wait_for_timeout(150); need(pg.evaluate("()=>B7.speed")!=sp,'the speed button changes the speed'); pg.evaluate("()=>{ B7.speed=1; }")
    # 10. Rose Mode picks the loadouts: every member went into the fight with the Sig Vibes and the newest written Quirks, whatever the book says
    ra=pg.evaluate("()=>B3.F.party.map(p=>{ const L=b3RoseLoadout(p.id,b3LabBook()[p.id]); return {id:p.id,main:p.vibe===L.main,pocket:p.pocket===L.pocket,quirks:p.quirks.join()===L.quirks.filter(Boolean).join()}; })")
    need(all(x['main'] and x['pocket'] and x['quirks'] for x in ra),f"each member started with Rose Mode's automatic loadout: {ra}")
    need(pg.evaluate("()=>b3LabBook().deedee.quirks.join()")=='car_crumb_vacuum,spit_shine','the Lab book itself (the Quirks Tom picked) was not rewritten by the fight: '+pg.evaluate("()=>b3LabBook().deedee.quirks.join()"))
    # 11. Rose Mode picks the loadouts in a fight itself; the Vibes page (m2-vibes) is the same page in every difficulty, so only the exit is checked here
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    sheet(caps,4,os.path.join(OUT,'b3-s7'+('-land' if landscape else '')+'.png'),scale=.5)
    pg.evaluate("()=>{ b7SetDiff('grace'); }"); pg.click('#b3-exit') if pg.evaluate("()=>!!document.getElementById('b3-exit')&&B3.active") else None; pg.wait_for_timeout(400)

# ---------- Stage 9b: TNB complete (Ceramicist and Longboarder), on the Log Lump fight with TNB in Deedee's place ----------
S9B_BOOK="""(boarder)=>{ const B=b3LabReset(5),Q=boarder?['tap_card_transfer','no_car_no_tickets']:['coaster_policy','kintsugi_gold_seam'];
  if(boarder) b3SetMain('tnb',B.tnb,B.tnb.pocket); Q.forEach((q,i)=>b3SetQuirk('tnb',B.tnb,i,q)); b3LabSave(); return B.tnb.main+':'+B.tnb.quirks.join('+'); }"""
def s9b(pg): return pg.evaluate("""()=>{ const F=B3.F,P={}; for(const p of F.party) P[p.id]=p; const f=F.foes[0];
  return {actor:B3.actor&&B3.actor.id,ui:B3.ui,sh:F.party.map(p=>(p.shields||[]).map(x=>({amt:Math.round(x.amt),clay:!!x.clay,glaze:x.glaze||0}))),
    haz:F.hazards.map(h=>h.id+':'+h.side+':'+h.uses),st:F.party.map(p=>Object.keys(p.st)),foe:Object.keys(f.st),hp:F.party.map(p=>p.hp),maxHp:F.party.map(p=>p.maxHp),
    ruckus:F.ruckus,mult:F.party.map(p=>p.st.e_bike?p.st.e_bike.mult||1:0),foeHp:F.foes.map(x=>x.hp),log:B3.log.slice(-80).join(' | '),
    tags:[...document.querySelectorAll('#b3-party .bx-pc')].map(e=>e.innerText.replace(/\\n/g,' '))}; }""")
def stage10(pg,lab,landscape=False):
    S='stage 10'+(' landscape' if landscape else '')+': '; caps=[]
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    start(pg,lab.index('new10'),{'seed':SEED}); wait_cmd(pg); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    names=pg.evaluate("()=>B3.F.party.map(p=>p.id)"); need(sorted(names)==['amy','justin','olivia','tom'],f'the stage 10 party is Tom, Amy, Justin and Olivia: {names}')
    vib=pg.evaluate("()=>B3.F.party.map(p=>p.id+':'+p.vibe+'/'+(p.pocket||''))"); need(any(v.startswith('amy:amy_fitness/amy_classroom') for v in vib) and any(v.startswith('justin:justin_basement/justin_wire') for v in vib) and any(v.startswith('olivia:olivia_rope/olivia_mom') for v in vib),f'each of them has their Sig 1 Main and Sig 2 Pocket: {vib}')
    for who_,trait,sk in (('amy','Workout Streak','Burpee Blitz'),('justin','Load-Bearing Swing','Demo-Day Prybar'),('olivia','Unbroken Rhythm','Criss-Cross Double-Under')):
        if not turn_of(pg,who_,S): return
        caps.append(R(shot(pg)))
        if not landscape: R(shot(pg)).save(os.path.join(OUT,f'b3-s10-{who_}-portrait.png'))
        pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
        need(trait in txt,f"{who_}'s list should name the Trait {trait}: {txt[:300]}")
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        names_=pg.evaluate("()=>B3.deck.filter(e=>e.grp!=='basic'&&!e.ruckus).map(e=>e.name)"); need(any(sk in n for n in names_),f'{who_}: the SKILLS list should hold {sk}: {names_}')
        sel=[n for n in names_ if sk in n]
        if sel:
            pg.evaluate("()=>{ B3.actor.pep=10; b3Render(); }")
            skill(pg,sel[0]); pg.keyboard.press('Enter'); pg.wait_for_timeout(250)
            if pg.evaluate("()=>B3.ui")=='target': caps.append(R(shot(pg)))
            aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(500); caps.append(R(shot(pg)))
            if who_=='amy':
                say=pg.evaluate("()=>document.getElementById('b3-say')?document.getElementById('b3-say').innerText:''"); need('Free from Amy' not in say,f'a self-grant should not say "Free from Amy": {say}')
    sheet(caps,3,os.path.join(OUT,'b3-s10'+('-land' if landscape else '')+'.png'),scale=.5)
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
def stage9c(pg,lab,landscape=False):
    S='stage 9c'+(' landscape' if landscape else '')+': '; caps=[]
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    # Nara and TNB with Tom: Nara's Skills, including Vacuum-Cleaner Bolt aimed at a row
    start(pg,lab.index('new8'),{'seed':SEED}); wait_cmd(pg); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    names=pg.evaluate("()=>B3.F.party.map(p=>p.id)"); need(sorted(names)==['nara','tnb','tom'],f'the chapter 2 party is Tom, TNB and Nara: {names}')
    if turn_of(pg,'nara',S):
        caps.append(R(shot(pg)))
        pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
        need('Nervous Vibrations' in txt,f"Nara's list should name her Trait: {txt[:300]}")
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        sk=pg.evaluate("()=>B3.deck.filter(e=>e.grp!=='basic'&&!e.ruckus).map(e=>e.name)"); need('Vacuum-Cleaner Bolt!' in sk and "Don't Leave Me Meltdown" in sk or any('Vacuum' in n for n in sk),f'the SKILLS list should hold her Skills: {sk}')
        skill(pg,[n for n in sk if 'Vacuum' in n][0] if any('Vacuum' in n for n in sk) else sk[0]); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
        if pg.evaluate("()=>B3.ui")=='target':
            labels=pg.evaluate("()=>B3.opts.map(o=>o.label)"); need(all(l.startswith(('Front row','Back row')) for l in labels),f'a row Skill should offer rows: {labels}'); caps.append(R(shot(pg)))
            pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        wait_cmd(pg); caps.append(R(shot(pg)))
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    # Boppy with Tom, Grace and Rose against the Big One
    start(pg,lab.index('new9'),{'seed':SEED}); wait_cmd(pg); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    names=pg.evaluate("()=>B3.F.party.map(p=>p.id)"); need(sorted(names)==['boppy','grace','rose','tom'],f'the chapter 3 party has Boppy: {names}')
    if turn_of(pg,'boppy',S):
        caps.append(R(shot(pg)))
        if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s9c-boppy-portrait.png'))
        pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
        need('Boppy' in txt or 'Warden' in txt or 'Stomach' in txt or 'Speed' in txt or len(txt)>20,f"Boppy's list should open: {txt[:200]}")
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(500); caps.append(R(shot(pg)))
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    # The pool on the Vibes screen: Nara arrives with the pool, unlocked until confirmed
    st=pg.evaluate("""()=>{ const B=b3LabBook(),L=B.nara; return {open:b3PoolOpen(L),total:L.pool&&L.pool.total,sum:b3VibeTotal('nara',L),tnb:!!B.tnb.pool}; }""")
    need(st['open'] and st['total']==st['sum'] and st['tnb'],f'the Lab book should hold the pool for late joiners: {st}')
    pg.evaluate("()=>{ const el=document.getElementById('splash'); el.hidden=false; el.classList.remove('out'); splash.active=true; splashSetMode('lab3'); m2OpenLab(); M2.who='nara'; m2Render(); }"); pg.wait_for_timeout(500)
    txt=pg.evaluate("()=>document.getElementById('m2').innerText"); need('Vibe Points' in txt and pg.evaluate("()=>!!document.querySelector('#m2 .m2-pool')"),f"Nara's Vibes page should show the pool: {txt[:300]}")
    caps.append(R(shot(pg)))
    if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s9c-pool-portrait.png'))
    pg.click('#m2 [data-k="poollock"]'); pg.wait_for_timeout(300)
    need(pg.evaluate("()=>!document.querySelector('#m2 .m2-pool')"),'locking the split should hide the pool')
    pg.evaluate("()=>{ m2CloseNew(); }"); pg.wait_for_timeout(300)
def stage21(pg,lab,landscape=False):
    """Stage 21: Casual Mode ("Freelancer") on the Vibes page and in a Lab fight, portrait and landscape. Locked at Rank 4, open at Rank 5."""
    S='stage 21'+(' landscape' if landscape else '')+': '; caps=[]
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=2; b3LabReset(4); const el=document.getElementById('splash'); el.hidden=false; el.classList.remove('out'); splash.active=true; splashSetMode('lab3'); m2OpenLab(); M2.who='tom'; M2.vibe=null; m2Render(); }"); pg.wait_for_timeout(500)
    st=pg.evaluate("()=>({free:!!document.querySelector('#m2 .m2-vcard.free'),cards:document.querySelectorAll('#m2 .m2-vcard').length,txt:(document.querySelector('#m2 .m2-fcount')||{}).innerText||'',open:!!document.querySelector('#m2 .m2-fcount.open')})")
    need(not st['free'] and not st['open'] and 'Freelancer' in st['txt'] and st['cards']==3,f'at Rank 4 Freelancer should show locked (a count, no card): {st}')
    caps.append(R(shot(pg)))
    pg.click('#m2 [data-k="rank-5"]'); pg.wait_for_timeout(400)
    st=pg.evaluate("()=>({free:!!document.querySelector('#m2 .m2-vcard.free'),open:!!document.querySelector('#m2 .m2-fcount.open'),rank:b3LabRank()})")
    need(st['free'] and st['open'] and st['rank']==5,f'at Rank 5 the Freelancer card should be open: {st}')
    pg.click('#m2 [data-k="vc-freelancer"]'); pg.wait_for_timeout(400); caps.append(R(shot(pg)))
    d=pg.evaluate("()=>({txt:document.querySelector('#m2 .m2-kit')?document.querySelector('#m2 .m2-vibes, #m2').innerText:'',kr:document.querySelectorAll('#m2 .m2-kit .m2-kr').length,main:!!document.querySelector('#m2 [data-k=main-freelancer]'),pickers:document.querySelectorAll('#m2 .m2-frs').length,sub:(document.querySelector('#m2 .m2-sub')||{}).innerText})")
    need(d['kr']==3 and d['main'] and d['pickers']==0 and d['sub']=='Casual Mode',f'Freelancer, not yet Primary, should list the three Traits and offer Primary on its card only: {d}')
    pg.click('#m2 [data-k="main-freelancer"]'); pg.wait_for_timeout(500)
    b=pg.evaluate("()=>{ const L=b3LabBook().tom; return {main:L.main,p:L.pocket,p2:L.pocket2,basic:L.basic,pickers:document.querySelectorAll('#m2 .m2-frs').length,names:[...document.querySelectorAll('#m2 .m2-vcard')].map(e=>e.innerText.replace(/\\s+/g,' ')).join(' | ')}; }")
    need(b['main']=='freelancer' and b['p']=='tom_flier' and b['p2']=='tom_gamer' and b['pickers']==3,f'Make it Primary should put Tom in Casual Mode with his old Vibes as Secondary: {b}')
    caps.append(R(shot(pg)))
    other=pg.evaluate("()=>b3Basics('tom').find(x=>x!==b3LabBook().tom.basic)")
    pg.click(f'#m2 [data-k="fb-{other}"]'); pg.wait_for_timeout(300)
    pg.click('#m2 [data-k="fp1-tom_baker"]'); pg.wait_for_timeout(300)
    b=pg.evaluate("()=>{ const L=b3LabBook().tom; return {basic:L.basic,p:L.pocket,p2:L.pocket2,on:[...document.querySelectorAll('#m2 .m2-frs .m2-seg.on')].length}; }")
    need(b['basic']==other and b['p2']=='tom_baker' and b['p']=='tom_flier' and b['on']==3,f'the Basic and second Secondary Vibe pickers should save: {b}')
    caps.append(R(shot(pg)))
    # the header stats carry no Lean bonus in Casual Mode (the same numbers as a Vibe with no Lean)
    hp=pg.evaluate("()=>{ const m=m2Who(),L=m2Loadout(m); const a=m2Stats(m).hp; L.main='tom_flier'; const b=m2Stats(m).hp; L.main='freelancer'; return {a,b}; }")
    need(hp['a']<=hp['b'],f'Casual Mode has no Lean, so its Health is not above a Lean Vibe: {hp}')
    pg.evaluate("()=>{ m2CloseNew(); }"); pg.wait_for_timeout(300)
    # a Lab fight in Casual Mode
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    start(pg,lab.index('new1'),{'seed':SEED},keep=True); wait_cmd(pg); pg.wait_for_timeout(300)
    for _ in range(12):
        if who(pg)=='tom': break
        pg.evaluate("()=>{ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }"); wait_cmd(pg); pg.wait_for_timeout(200)
    need(who(pg)=='tom',"never reached Tom's turn")
    f=pg.evaluate("()=>{ const t=B3.F.party.find(p=>p.id==='tom'); return {vibe:t.vibe,lean:t.lean,traits:t.traits.length,basic:B3.deck.find(e=>e.grp==='basic').id,want:t.basic,groups:[...new Set(B3.deck.filter(e=>!e.ruckus&&e.grp!=='basic'&&e.grp!=='any').map(e=>e.grp))]}; }")
    need(f['vibe']=='freelancer' and f['lean'] is None and f['traits']==3 and f['basic']==f['want']==other,f'the fight should use Casual Mode and the picked Basic: {f}')
    need(f['groups']==['pocket'],f'every Skill of a Freelancer comes through a Pocket Vibe: {f}')
    caps.append(R(shot(pg)))
    pg.click('#b3-party .bx-pc[data-i="1"]'); pg.wait_for_timeout(300); pg.keyboard.press('KeyI'); pg.wait_for_timeout(300)
    inf=pg.evaluate("()=>document.getElementById('b3-sheet').textContent")
    need('Freelancer' in inf and 'No Lean' in inf and 'Priority Boarding' in inf and "Gamer's Intuition" in inf.replace('\u2019',"'"),f'tapping Tom should name Freelancer and all three Traits: {inf[:260]}')
    caps.append(R(shot(pg)))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    for _ in range(80):
        if pg.evaluate("()=>B3.ui")=='done': break
        pg.evaluate("()=>{ const p=b3Auto(B3.F,B3.actor); b3Commit(p.skill,p.target); }"); wait_cmd(pg,60000); pg.wait_for_timeout(120)
    won=pg.evaluate("()=>({over:B3.F.over,vp:b3LabBook().tom.vp,main:b3LabBook().tom.main})")
    need(won['over']=='win' and won['main']=='freelancer' and set(won['vp'].values())=={800},f'the win should leave Casual Mode on and give it no Vibe Points: {won}')
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    # back out: Primary on a real Vibe's card makes it Primary again
    pg.evaluate("()=>{ const el=document.getElementById('splash'); el.hidden=false; el.classList.remove('out'); splash.active=true; splashSetMode('lab3'); m2OpenLab(); M2.who='tom'; m2Render(); }"); pg.wait_for_timeout(400)
    pg.click('#m2 [data-k="main-tom_gamer"]'); pg.wait_for_timeout(400)
    b=pg.evaluate("()=>{ const L=b3LabBook().tom; return {main:L.main,p:L.pocket,p2:L.pocket2,basic:L.basic}; }")
    need(b['main']=='tom_gamer' and b['p2'] is None and b['basic'] is None and b['p'] not in (None,'tom_gamer'),f'Primary on Gamer Geek should leave Casual Mode cleanly: {b}')
    caps.append(R(shot(pg)))
    pg.evaluate("()=>{ m2CloseNew(); b3LabReset(); }"); pg.wait_for_timeout(300)
    sheet(caps,3,os.path.join(OUT,'b3-s21'+('-land' if landscape else '')+'.png'),scale=.5)

def stage9b(pg,lab,landscape=False):
    S='stage 9b'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new7')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; }")
    q=pg.evaluate(S9B_BOOK,False); need(q.startswith('tnb_potter:coaster_policy+kintsugi_gold_seam'),f'the Lab book did not take TNB Ceramicist and his Quirks: {q}')
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    names=pg.evaluate("()=>B3.F.party.map(p=>p.id)"); need(names==['grace','tom','tnb','rose'],f'TNB stands third with Grace, Tom and Rose: {names}')
    if not turn_of(pg,'tnb',S): return
    caps.append(R(shot(pg)))
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
    need('Wet Clay to Stoneware' in txt and 'Coaster Policy' in txt and 'Kintsugi Gold Seam' in txt,f"TNB's list should name his Trait and both Quirks: {txt[:300]}")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    names=pg.evaluate("()=>B3.deck.filter(e=>e.grp!=='basic'&&!e.ruckus).map(e=>e.name)"); need(all(n in names for n in ['Center the Bowl','Three-AM Kiln Firing','Grand Amphora Masterpiece']),f'the SKILLS list should hold his three Ceramicist Skills: {names}')
    use(pg,'Center the Bowl','Grace'); wait_cmd(pg); pg.wait_for_timeout(500); v=s9b(pg); caps.append(R(shot(pg)))
    if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s9b-bowl-portrait.png'))
    need(v['sh'][0] and v['sh'][0][0]['clay'],f"Center the Bowl should give Grace a clay shield: {v['sh']}")
    if not turn_of(pg,'tnb',S): return
    use(pg,'Three-AM Kiln Firing'); wait_cmd(pg); pg.wait_for_timeout(500); v=s9b(pg); caps.append(R(shot(pg)))
    need(any(x['glaze'] for x in v['sh'][0]) or not v['sh'][0],f"Kiln Firing should fire Grace's clay shield into Fired Glaze (or it was already used up): {v['sh'][0]}")
    need(all('kiln_glow' in st for st in v['st']),f"the whole family should have Kiln Glow: {v['st']}"); need('toasty' in v['foe'],f"the monster should be Toasty: {v['foe']}")
    if not turn_of(pg,'tnb',S): return
    use(pg,'Grand Amphora Masterpiece'); wait_cmd(pg); pg.wait_for_timeout(500); v=s9b(pg); caps.append(R(shot(pg)))
    if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s9b-amphora-portrait.png'))
    need(any(h.startswith('amphora:party') for h in v['haz']) or 'Grand Amphora' in v['log'],f"the Grand Amphora should stand on the family's floor: {v['haz']}")
    for _ in range(8):
        if 'soaks' in s9b(pg)['log'] and 'whole' in s9b(pg)['log']: break
        pg.evaluate(S5_PREP); basic(pg); aim(pg,None); wait_cmd(pg); pg.wait_for_timeout(450)
    v=s9b(pg); caps.append(R(shot(pg)))
    need('soaks' in v['log'] and 'whole' in v['log'],f"a monster attack should be soaked whole by the Amphora: {v['log'][-300:]}")
    # Longboarder as Main
    pg.click('#b3-exit'); pg.wait_for_timeout(500)
    q=pg.evaluate(S9B_BOOK,True); need(q.startswith('tnb_boarder:tap_card_transfer+no_car_no_tickets'),f'the Lab book did not take TNB Longboarder and his Quirks: {q}')
    start(pg,idx,{'seed':SEED},keep=True); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.wait_for_timeout(300)
    if not turn_of(pg,'tnb',S): return
    pg.keyboard.press('KeyI'); pg.wait_for_timeout(300); txt=pg.evaluate("()=>document.getElementById('b3-sheet').innerText")
    need('Carving Momentum' in txt and 'TAP-Card Transfer' in txt and 'No Car, No Tickets' in txt,f"TNB's list should name Carving Momentum and both Quirks: {txt[:300]}")
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    use(pg,'E-Bike Tag-Along','Grace'); wait_cmd(pg); pg.wait_for_timeout(500); v=s9b(pg); caps.append(R(shot(pg)))
    need('e_bike' in v['st'][0] and 'fresh_ride' in v['st'][0],f"E-Bike Tag-Along should put the e-bike and Fresh Ride on Grace: {v['st'][0]}")
    if not turn_of(pg,'tnb',S): return
    pg.evaluate("()=>{ const F=B3.F; F.party[0].hp=40; b3ViewSync(); b3Render(); }"); pg.wait_for_timeout(200)
    use(pg,'Waymo Tailgate Rescue','Grace'); wait_cmd(pg); pg.wait_for_timeout(500); v=s9b(pg); caps.append(R(shot(pg)))
    if not landscape: R(shot(pg)).save(os.path.join(OUT,'b3-s9b-waymo-portrait.png'))
    need(v['hp'][0]>40 and 'shares' in v['log'],f"Waymo Tailgate Rescue on a hurt Grace should share HP with her: {v['hp'][0]} {v['log'][-200:]}")
    if not turn_of(pg,'tnb',S): return
    use(pg,'Baxter Hill Longboard Express'); wait_cmd(pg); pg.wait_for_timeout(500); v=s9b(pg); caps.append(R(shot(pg)))
    need(v['mult'][0]==2 or 'e_bike' not in v['st'][0],f"Baxter Hill should double Grace's E-Bike (unless it ran out): {v['mult']} {v['st'][0]}")
    sheet(caps,4,os.path.join(OUT,'b3-s9b'+('-land' if landscape else '')+'.png'),scale=.45)
    pg.click('#b3-exit'); pg.wait_for_timeout(500)

# ---------- Stage 8: video clips in Battle 3 (idle loops, clip moves landing on the impact frame, body states, The Big One's acts) ----------
S8_TRACE="""()=>{ if(window.__c8) { window.__c8.hits=[]; window.__c8.moves=[]; return; } window.__c8={hits:[],moves:[],cl:{}}; setInterval(()=>{ for(const k in B3P.fa){ const A=B3P.fa[k]; if(A&&A.cl) window.__c8.cl[A.cl.id]=1; } },50);
  const os=b3Show,om=b3PlayMove;
  b3Show=function(b){ if(b.t==='hit'){ const cur=[]; for(const k in B3P.body){ const B=B3P.body[k]; if(B&&B.kind==='cmove') cur.push({who:k,t0:B.t0,T0:B.T0,id:B.C.id,imp:B.C.kind==='strike'?B.C.ms[B.C.impact]/1000:null,dur:B.C.dur/1000}); }
      for(const k in B3P.fa){ const A=B3P.fa[k]; if(A&&A.cl&&B3P.t<A.cl.t0+A.cl.dur) cur.push({who:k,t0:A.cl.t0,T0:0,id:A.cl.id,imp:BCLIPS[A.cl.id].kind==='strike'?BCLIPS[A.cl.id].ms[BCLIPS[A.cl.id].impact]/1000:null,dur:A.cl.dur}); }
      window.__c8.hits.push({t:B3P.t,tgt:b.tgt,cur}); } return os.apply(this,arguments); };
  b3PlayMove=function(beats,done,mid,waited){ const h=beats[0]; if(h.t==='act'&&!waited) { const an=msAnimOf(h); window.__c8.moves.push({src:h.src,id:h.id,clip:an&&an.clip||null,ready:an?b3cReady(an.clip):null,foe:!!h.foe}); }; return om.apply(this,arguments); }; }"""
def s8(pg): return pg.evaluate("""()=>({ui:B3.ui,actor:B3.actor&&B3.actor.id,over:B3.F.over,loaded:b3cLoaded(),peak:B3C.peak,
  idle:B3.F.foes.map(u=>{ const id=b3cOf(u.id,'idle'); return id+':'+b3cReady(id); }),moves:window.__c8?window.__c8.moves.length:0})""")
def shoot_move(pg,frames,n=10,gap=170):
    for k in range(n): pg.wait_for_timeout(gap); frames.append(shot(pg))
def stage8(pg,lab,landscape=False):
    S='stage 8'+(' landscape' if landscape else '')+': '; caps=[]; idx=lab.index('new6')
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    pg.evaluate("()=>{ B7.speed=1; b7SetDiff('grace'); }")
    start(pg,idx,{'seed':SEED}); wait_cmd(pg); pg.evaluate(POKE_ROWS); pg.evaluate(S5_PREP); pg.evaluate(S8_TRACE); pg.wait_for_timeout(900 if not landscape else 4500)
    v=s8(pg); caps.append(R(shot(pg)))
    need(all(x.endswith(':true') for x in v['idle']),f"every monster's idle loop is loaded when the fight opens: {v['idle']}")
    need(v['loaded']<=10,f"no more than the idle loops plus a few leftovers are loaded at the start (about 10 MB each): {v['loaded']}")
    # the idle loop is what is drawn: the same picture changes over a second
    a=pg.evaluate("()=>B3.F.party.map(u=>{ const vu=B3.view.u[u.key],id=b3cOf(u.id,'idle'); if(!id) return 'no idle video: '+u.id; b3cWant(id,9000); return bclipReady(id)?!!b3cMemberFrame(u,vu,B3P.t,null):'loading'; })")
    need(all(x is True or x=='loading' for x in a),f'each family member stands in their idle video (wanch1; wanch2a: there is no painted pose to fall back on): {a}')
    # 1. each family member's Basic lands on its clip's impact frame
    for member in ['tom','grace','rose','deedee']:
        if not turn_of(pg,member,S): continue
        n0=pg.evaluate("()=>window.__c8.hits.length"); basic(pg); aim(pg,None); fr=[]
        shoot_move(pg,fr,8,200); caps.append(R(fr[2])); caps.append(R(fr[4]))
        if member=='rose': sheet([R(f) for f in fr],4,os.path.join(OUT,'b3-s8-rose-move'+('-land' if landscape else '')+'.png'),scale=.5)
        wait_cmd(pg); pg.wait_for_timeout(200)
        H=pg.evaluate("(n)=>window.__c8.hits.slice(n)",n0)
        key=pg.evaluate('(m)=>B3.F.party.find(u=>u.id===m).key',member)
        first=[h for h in H if any(c['who']==key and c['imp'] is not None for c in h['cur'])]
        need(len(H)>=1,f'{member}: the Basic should land a hit: {H[:2]}')
        hasclip=pg.evaluate("(m)=>{ const v=B3_VIBES[B3_CAST[m].vibes[0]]; return Object.values(B3_SKILLS).some(s=>s.vibe===v.id&&s.slot==='basic'&&msClipOf('move:'+s.id)); }",member)   # movebench12: the move's spec says
        if not hasclip: need(not first,f'{member}: the Basic has no clip in its kit row, yet one played: {H[:2]}')
        else: need(len(first)>=1,f'{member}: the Basic should be played by its clip and show a hit: {H[:2]}')
        if first:
            c=[c for c in first[0]['cur'] if c['who']==key][0]; d=first[0]['t']-(c['t0']+c['T0'])-c['imp']
            need(-.02<=d<=.14,f"{member}: the hit should show on the clip's impact frame (off by {d:.3f} s, clip {c['id']})")
            print('  ',member,c['id'],'hit off the impact frame by',round(d,3),'s')
    # 2. the Big One's acts: low HP so every act comes up; each act that has a clip is played by it
    pg.evaluate("()=>{ const f=B3.F.foes[0]; f.maxHp=f.hp=6000; f.hp=2700; b3ViewSync(); b3Render(); }")
    seen=set(); bfr=[]
    for k in range(34):
        wait_cmd(pg,90000); pg.wait_for_timeout(150)
        if pg.evaluate("()=>B3.ui==='done'"): break
        pg.evaluate(S5_PREP); pg.evaluate("()=>{ const f=B3.F.foes[0]; if(f.hp>5000) f.hp=2700; }")
        for m in pg.evaluate("()=>window.__c8.moves.filter(m=>m.foe).map(m=>m.id)"): seen.add(m)
        if len(bfr)<10 and pg.evaluate("()=>{ const f=B3.F.foes[0]; return !!f.charge||!!(B3P.fa.f0&&B3P.fa.f0.cl); }"): bfr.append(R(shot(pg)))
        basic(pg); aim(pg,None); pg.wait_for_timeout(300)
        if {'big_glare','tail_slap','swamp_chomp','muddy_belly_flop','crown_polish'}<=seen: break
    M=pg.evaluate("()=>window.__c8.moves.filter(m=>m.foe)")
    cl=pg.evaluate("()=>Object.keys(window.__c8.cl)")
    need(all(m['clip'] in cl for m in M if m['clip']),f"every Big One act with a clip was played by it: {[m['clip'] for m in M if m['clip'] and m['clip'] not in cl]} (played {cl})")
    need({'big_glare','swamp_chomp'}<=seen,f'the Big One used Big Glare and Swamp Chomp: {sorted(seen)}')
    print('   Big One acts seen:',sorted(seen))
    caps+=bfr[:6]
    # 3. body states: the family are videos only (wanch2a); a monster hit and a Flustered monster are clips
    pg.wait_for_timeout(600)
    st2=pg.evaluate("""()=>{ const out={}; const u=B3.F.party[0],vu=B3.view.u[u.key]; delete B3P.body[u.key];
      out.paint=typeof b3PaintState==='undefined'&&typeof B3_BODY_PAINT==='undefined';   // wanch2a: the painted body states are purged
      out.vic=B3.F.party.every(m=>b3cVideoOnly(m));   // every family member in this fight is video-only (idea-tomgrace)
      const f=B3.F.foes[0],A=B3P.fa[f.key]; A.cl=null; b3cFoeClip(f.key,'hit'); out.foeHit=!!A.cl;
      vu.st.push('flustered'); A.flusT=B3P.t-1; out.flus=!!b3cFoeFrame(f,A,vu.st?B3.view.u[f.key]:null,B3P.t); return out; }""")
    print('   states',st2)
    need(st2['paint'] and st2['vic'],f'the painted body states are gone and the four fighters are video-only (wanch2a): {st2}')
    need(st2['foeHit'],f'a monster hit clip is available and drawn: {st2}')
    # Flustered: the held picture, then restore
    pg.evaluate("()=>{ const f=B3.F.foes[0],vf=B3.view.u[f.key]; if(!vf.st.includes('flustered')) vf.st.push('flustered'); B3P.fa[f.key].flusT=B3P.t-.2; }"); pg.wait_for_timeout(1700); caps.append(R(shot(pg)))
    pg.evaluate("()=>{ const f=B3.F.foes[0],vf=B3.view.u[f.key]; vf.st=vf.st.filter(x=>x!=='flustered'); }")
    pg.evaluate("()=>{ const f=B3.F.foes[0]; f.hp=1; }")
    # 4. finish the fight: the boss falls with its defeated clip and the family cheers from the victory clips
    for k in range(30):
        if pg.evaluate("()=>B3.ui==='done'"): break
        wait_cmd(pg,90000); pg.wait_for_timeout(150)
        if pg.evaluate("()=>B3.ui==='done'"): break
        pg.evaluate("()=>{ const f=B3.F.foes[0]; f.hp=1; }"); basic(pg); aim(pg,None); pg.wait_for_timeout(250)
        if k==0: shoot_move(pg,caps,3,330)
    pg.wait_for_timeout(2600); caps.append(R(shot(pg)))
    done=pg.evaluate("""()=>({over:B3.F.over,vic:B3.F.party.map(u=>{ const f=b3cMemberFrame(u,B3.view.u[u.key],B3P.t,B3P.body[u.key]); return !!f&&!!f._clip; }),die:!!(B3P.fa.f0&&B3P.fa.f0.die!=null),loaded:b3cLoaded(),peak:B3C.peak})""")
    print('   end',done)
    need(done['over']=='win','the boss fight was won')
    want=pg.evaluate("()=>B3.F.party.map(u=>!!b3cOf(u.id,'victory'))")
    need(done['vic']==want,f"the family cheers from their victory videos: {done['vic']} want {want}")
    need(done['peak']<=16,f"no more than 16 clip pictures (about 160 MB) were ever held at once: peak {done['peak']}")
    sheet(caps[:24],4,os.path.join(OUT,'b3-s8'+('-land' if landscape else '')+'.png'),scale=.5)
    f=shot(pg); f.save(os.path.join(OUT,'b3-s8-end-'+('landscape' if landscape else 'portrait')+'.png'))
    pg.click('#b3-app [data-done]'); pg.wait_for_timeout(500)
    # 5. a clip that cannot load: the move waits 2.5 s, then plays its default animation and the hit still lands
    if not landscape:
        pg.evaluate("()=>{ b3LabReset(); }"); start(pg,lab.index('new1'),{'seed':SEED}); wait_cmd(pg); pg.evaluate(S8_TRACE)
        pg.evaluate("()=>{ const a=PAINTED.clip_deedee_windex; window.__wsrc=a.src; paintedRelease(a); a.src='art/clips/does-not-exist.webp'; a.failed=false; B3C.need.delete('deedee_windex'); }")
        if turn_of(pg,'deedee',S):
            n0=pg.evaluate("()=>window.__c8.hits.length"); basic(pg); aim(pg,None); pg.wait_for_timeout(300)
            wait_cmd(pg,60000); H=pg.evaluate("(n)=>window.__c8.hits.slice(n)",n0); body=pg.evaluate("()=>window.__c8.moves.slice(-3).map(m=>m.id+':'+m.ready)")
            need(len(H)>=1,f'a move whose clip cannot load still lands its hit after the wait: {H} {body}')
            need(not any(c['id']=='deedee_windex' for h in H for c in h['cur']),'that move was played by the default animation, not the missing clip')
        pg.evaluate("()=>{ const a=PAINTED.clip_deedee_windex; a.src=window.__wsrc; a.failed=false; }")
        pg.click('#b3-exit'); pg.wait_for_timeout(500)
# ---------- Stage 11: chapters 2 to 4 (the dive, ACTION! and CUT!, Faultline Guard, Skill Lock, Scene One) ----------
S11_WRAP="""()=>{ window.__s11={rows:[],summons:[],acts:[],statuses:[],pulls:[],soaks:[],misses:[]}; if(!window.__s11wrap){ window.__s11wrap=1; const os=b3Show; b3Show=function(b){ const H=window.__s11;
  if(b.t==='row') H.rows.push(b.tgt+':'+b.row); if(b.t==='summon') H.summons.push(b.id); if(b.t==='act'&&b.foe) H.acts.push(b.id); if(b.t==='status') H.statuses.push(b.tgt+':'+b.id);
  if(b.t==='pull') H.pulls.push(b.tgt); if(b.t==='soak') H.soaks.push(b.id); if(b.t==='miss') H.misses.push(b.why); return os.apply(this,arguments); }; } }"""
def s11_run(pg,lab,fid,poke,frames,every=550,limit=360,watch=None,landscape=False,tag='s11'):
    """One chapter 2 to 4 fight played by the simple player on screen, with a poke at the start; returns what the screen was told."""
    idx=lab.index(fid); pg.evaluate("()=>{ B7.speed=2; }"); pg.evaluate(S11_WRAP)
    start(pg,idx,{'seed':SEED,'auto':True})
    if poke: pg.evaluate(poke)
    seen=set()
    for k in range(limit):
        pg.wait_for_timeout(every)
        if len(frames)<40: frames.append(shot(pg))
        for name,cond in (watch or {}).items():
            if name not in seen and pg.evaluate(cond): seen.add(name); pg.wait_for_timeout(350); shot(pg).save(os.path.join(OUT,f'b3-{tag}-{name}-'+('landscape' if landscape else 'portrait')+'.png'))
        if pg.evaluate("()=>B3.ui==='done'"): break
    else: fails.append(f'stage {tag[1:]} {fid}: the auto fight did not finish')
    pg.wait_for_timeout(300)
    R=pg.evaluate("()=>Object.assign({over:B3.F.over},window.__s11)"); pg.click('#b3-app [data-done]'); pg.wait_for_timeout(500)
    return R
def stage11(pg,lab,landscape=False):
    S='stage 11'+(' landscape' if landscape else '')+': '; caps=[]
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R_=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    def pick(fr,n): return [R_(fr[i]) for i in sorted(set(int(j*(len(fr)-1)/max(1,n-1)) for j in range(n)))] if fr else []
    # Old Iron-Gill: the first foe turn is a dive (it has taken turns already), then Deep Dive; it surfaces; a Soggy Sock is called
    fr=[]; R=s11_run(pg,lab,'new21',"()=>{ B3.F.foes[0].turns=3; }",fr,every=500,landscape=landscape,watch={'dive':"()=>window.__s11.rows.some(r=>r.endsWith(':back'))",'surface':"()=>window.__s11.rows.some(r=>r.endsWith(':front'))"})
    need(R['over']=='win',f"Old Iron-Gill fight ended {R['over']}")
    need(any(r.endswith(':back') for r in R['rows']) and any(r.endswith(':front') for r in R['rows']),f"Iron-Gill should dive to Back and come up again: {R['rows']}")
    need('soggysock' in R['summons'],f"Inlet Submerge should call a Soggy Sock: {R['summons']}")
    need(any(a.startswith('inlet_submerge') for a in R['acts']) and any(a.startswith('deep_dive') for a in R['acts']),f"the dive and Deep Dive should both be played (a Break may cancel the first): {R['acts'][:12]}")
    caps+=pick(fr,6)
    # The Director's Cut: ACTION! at 60% HP calls Extra Extras and pulls everyone, CUT! stuns
    fr=[]; R=s11_run(pg,lab,'new27',"()=>{ const e=B3.F.foes[0]; e.hp=Math.floor(e.maxHp*.55); }",fr,every=500,landscape=landscape,watch={'action':"()=>window.__s11.summons.includes('extra')"})
    need(R['over']=='win',f"Director fight ended {R['over']}")
    need('action' in R['acts'] and R['summons'].count('extra')>=1,f"ACTION! should play and call Extra Extras: {R['acts'][:10]} {R['summons']}")
    need(any(x.endswith(':action_speed') for x in R['statuses']),'ACTION! should put its Speed buff on the monsters')
    caps+=pick(fr,6)
    # The Big Shake: below half HP it takes Faultline Guard
    fr=[]; R=s11_run(pg,lab,'new16',"()=>{ const e=B3.F.foes[0]; e.maxHp*=4; e.hp=Math.floor(e.maxHp*.45); }",fr,every=500)
    need(R['over']=='win',f"Big Shake fight ended {R['over']}")
    need('faultline_guard' in R['acts'] and any(x.endswith(':faultline_guard') for x in R['statuses']),f"Faultline Guard should be cast and show as a status: {R['acts'][:10]}")
    caps+=pick(fr,4)
    # Boom Mic Moth: Mic Feedback puts Skill Lock on the family, and the lock shows on the screen
    fr=[]; R=s11_run(pg,lab,'new23',"()=>{ for(const f of B3.F.foes) if(f.id==='boommoth') { f.actIx=1; f.spd=999; } }",fr,every=500)
    need(R['over']=='win',f"Boom Mic Moth fight ended {R['over']}")
    need(any(x.endswith(':skill_lock') for x in R['statuses']),f"Mic Feedback should put Skill Lock on someone: {R['acts'][:10]}")
    caps+=pick(fr,3)
    # Clapper Snapper opens with Scene One, Marker!
    fr=[]; R=s11_run(pg,lab,'new24',None,fr,every=500)
    need(R['over']=='win',f"Clapper Snapper fight ended {R['over']}")
    need('scene_one' in R['acts'][:3],f"the Clapper Snapper should open with Scene One, Marker!: {R['acts'][:5]}")
    caps+=pick(fr,3)
    sheet(caps,5,os.path.join(OUT,'b3-s11'+('-land' if landscape else '')+'.png'),scale=.4)
# ---------- Stage 12: chapters 5 to 7 (stage 12a: the school, Strict Grading and Points Off, SEE ME, Glitter Burst, You're Late!) ----------
def stage12(pg,lab,landscape=False):
    S='stage 12'+(' landscape' if landscape else '')+': '; caps=[]
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R_=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    def pick(fr,n): return [R_(fr[i]) for i in sorted(set(int(j*(len(fr)-1)/max(1,n-1)) for j in range(n)))] if fr else []
    # The Red Pen: at 55% HP Strict Grading goes up (shown as a status on the monster), and a hit on it is answered by Points Off
    fr=[]; R=s11_run(pg,lab,'new32',"()=>{ const e=B3.F.foes[0]; e.hp=Math.floor(e.maxHp*.54); e.spd=999; }",fr,every=450,landscape=landscape,tag='s12',watch={'grading':"()=>window.__s11.statuses.some(x=>x.endsWith(':strict_grading'))"})
    need(R['over']=='win',f"Red Pen fight ended {R['over']}")
    need('strict_grading_first' in R['acts'],f"Strict Grading should be raised at 55% HP: {R['acts'][:8]}")
    need(any(x.endswith(':strict_grading') for x in R['statuses']),'Strict Grading should show as a status on the monster')
    caps+=pick(fr,6)
    # Dodgeball Dread: the Elite plays through (its bounce is a starting status)
    fr=[]; R=s11_run(pg,lab,'new31',None,fr,every=500,landscape=landscape,tag='s12')
    need(R['over']=='win',f"Dodgeball Dread fight ended {R['over']}")
    caps+=pick(fr,3)
    # Glitter Glue: Glitter Burst winds up and blinds exactly one family member
    fr=[]; R=s11_run(pg,lab,'new30',"()=>{ for(const f of B3.F.foes) if(f.id==='glitterglue') { f.actIx=2; f.spd=999; } }",fr,every=500,landscape=landscape,tag='s12')
    need(R['over']=='win',f"Glitter Glue fight ended {R['over']}")
    need('glitter_burst' in R['acts'] and any(x.endswith(':blind') for x in R['statuses']),f"Glitter Burst should blind someone: {R['acts'][:8]}")
    caps+=pick(fr,3)
    # Tardy Bell: You're Late! slows and pushes
    fr=[]; R=s11_run(pg,lab,'new29',"()=>{ for(const f of B3.F.foes) if(f.id==='tardybell') { f.actIx=1; f.spd=999; } }",fr,every=500,landscape=landscape,tag='s12')
    need(R['over']=='win',f"Tardy Bell fight ended {R['over']}")
    need('youre_late' in R['acts'] and any(x.endswith(':slow') for x in R['statuses']),f"You're Late! should slow someone: {R['acts'][:8]}")
    caps+=pick(fr,3)
    fr=[]; R=s11_run(pg,lab,'new28',None,fr,every=500,landscape=landscape,tag='s12')
    need(R['over']=='win',f"Pop Quiz fight ended {R['over']}")
    caps+=pick(fr,2)
    # Chapter 6. Chairman Cheeks: it is the 4th round, so he calls an Acorn Cache into Back on his first turn; below 50% HP The Big Stash winds up
    fr=[]; R=s11_run(pg,lab,'new38',"()=>{ B3.F.round=4; B3.F.foes[0].turns=3; B3.F.foes[0].hp=Math.floor(B3.F.foes[0].maxHp*.9); }",fr,every=500,landscape=landscape,tag='s12',watch={'cache':"()=>window.__s11.summons.includes('acorncache')"})
    need(R['over']=='win',f"Chairman Cheeks fight ended {R['over']}")
    need('acorncache' in R['summons'],f"Stash for Winter should call an Acorn Cache: {R['summons']}")
    need(any(a.startswith('stash_for_winter') or a.startswith('stash_eat') for a in R['acts']),f"Stash for Winter should be played: {R['acts'][:8]}")
    caps+=pick(fr,6)
    for fid,foe,ix,act in (('new37','cheekstuffer',2,'snack_snatch'),('new36','twigspy',1,'stakeout_mark'),('new35','peanutgallery',1,'cheap_seat_heckle'),('new34','stickysap',2,'sap_flow'),('new33','acornagent',2,'code_red')):
        # two Acorn Agents at speed 999 would act again and again before the family; only the first one is rushed, and not for the plain pair
        fr=[]; R=s11_run(pg,lab,fid,"()=>{ let n=0; for(const f of B3.F.foes) if(f.id==='%s'&&n++===0) { f.actIx=%d; if('%s'!=='acornagent') f.spd=999; } }"%(foe,ix,foe),fr,every=500,landscape=landscape,tag='s12')
        need(R['over']=='win',f"{fid} fight ended {R['over']}")
        need(any(a.startswith(act) for a in R['acts']),f"{foe} should play {act}: {R['acts'][:8]}")
        caps+=pick(fr,2)
    # Chapter 7. The Unread below half HP: its first turn is the Bookmark Ribbon (Guard and Mend on itself), then THE END winds up
    fr=[]; R=s11_run(pg,lab,'new44',"()=>{ const e=B3.F.foes[0]; e.hp=Math.floor(e.maxHp*.49); e.actIx=3; }",fr,every=500,landscape=landscape,tag='s12',watch={'ribbon':"()=>window.__s11.statuses.some(x=>x.endsWith(':bookmark_guard'))"})
    need(R['over']=='win',f"The Unread fight ended {R['over']}")
    need(any(a.startswith('bookmark_ribbon') for a in R['acts']),f"Bookmark Ribbon should be played: {R['acts'][:8]}")
    caps+=pick(fr,6)
    for fid,foe,ix,act in (('new43','popup',1,'jump_out_scare'),('new42','knowitall',1,'actually'),('new41','cliffhanger',1,'plot_twist'),('new40','dogear',0,'page_nip'),('new39','shusher',1,'shhh')):
        fr=[]; R=s11_run(pg,lab,fid,"()=>{ let n=0; for(const f of B3.F.foes) if(f.id==='%s'&&n++===0) { f.actIx=%d; f.spd=999; } }"%(foe,ix),fr,every=500,landscape=landscape,tag='s12')
        need(R['over']=='win',f"{fid} fight ended {R['over']}")
        need(any(a.startswith(act) for a in R['acts']),f"{foe} should play {act}: {R['acts'][:8]}")
        caps+=pick(fr,2)
    sheet(caps,6,os.path.join(OUT,'b3-s12'+('-land' if landscape else '')+'.png'),scale=.4)
def stage13(pg,lab,landscape=False,parts='a'):
    """Stage 13: chapters 8 to 10 and the bonus chapter. `parts` is the letters of the chapters to play: a = 8, b = 9, c = 10, d = bonus."""
    S='stage 13'+(' landscape' if landscape else '')+': '; caps=[]
    rot=landscape and pg.evaluate("()=>layout.rotated")
    R_=lambda f: f.rotate(90,expand=True) if rot else f
    def need(cond,what):
        if not cond: fails.append(S+what)
    def pick(fr,n): return [R_(fr[i]) for i in sorted(set(int(j*(len(fr)-1)/max(1,n-1)) for j in range(n)))] if fr else []
    def rush(fid,foe,ix,act,status=None,fast=False):
        # the first monster of that id is made to take that act first; the rest of the fight is the simple player's
        fr=[]; R=s11_run(pg,lab,fid,"()=>{ let n=0; for(const f of B3.F.foes) if(f.id==='%s'&&n++===0) { f.actIx=%d; f.maxHp=Math.floor(f.maxHp*1.6); f.hp=f.maxHp; if(%s) f.spd*=1.5; } }"%(foe,ix,'true' if fast else 'false'),fr,every=500,landscape=landscape,tag='s13')
        need(R['over']=='win',f"{fid} fight ended {R['over']}")
        if act: need(any(a.startswith(act) for a in R['acts']),f"{foe} should play {act}: {R['acts']}")
        if status: need(any(x.endswith(':'+status) for x in R['statuses']),f"{foe}'s {act} should put {status} on the screen: {R['statuses'][:8]}")
        return fr
    if 'a' in parts:
        # Chapter 8. Old Ironbelly below half HP: BROIL winds up first, then Full Furnace; the boss itself shows Toasty
        fr=[]; R=s11_run(pg,lab,'new50',"()=>{ const e=B3.F.foes[0]; e.maxHp*=2; e.hp=Math.floor(e.maxHp*.49); e.actIx=3; }",fr,every=500,landscape=landscape,tag='s13',watch={'toasty':"()=>window.__s11.statuses.some(x=>x.endsWith(':toasty'))"})
        need(R['over']=='win',f"Old Ironbelly fight ended {R['over']}")
        need(any(a.startswith('broil') for a in R['acts']) and any(a.startswith('full_furnace') for a in R['acts']),f"BROIL and Full Furnace should both be played: {R['acts'][:10]}")
        need(any(x.endswith(':toasty') for x in R['statuses']) and any(x.endswith(':full_furnace') for x in R['statuses']),'Toasty and Full Furnace should show as statuses')
        caps+=pick(fr,6)
        # The Picky Eater's wind-up is usually Broken by the family's pips, so only the win is checked for it here (the rule test covers the fire).
        for fid,foe,ix,act,st in (('new49','pickyeater',2,None,None),('new48','thedraft',0,'pilot_light_gust',None),('new47','wetblanket',2,'dampen_spirits','drenched'),('new46','leftover',1,'mystery_tupperware','blind'),('new45','lukewarm',1,'cold_shoulder','slow')):
            caps+=pick(rush(fid,foe,ix,act,st,fast=foe in ('leftover','lukewarm','thedraft','wetblanket')),2)
    if 'b' in parts:
        # Chapter 9. The Mirrorball: Facet Dazzle blinds one and leaves her Dazzled; at low HP LAST DANCE winds up
        fr=[]; R=s11_run(pg,lab,'new56',"()=>{ const e=B3.F.foes[0]; e.maxHp=Math.floor(e.maxHp*1.3); e.hp=e.maxHp; e.actIx=1; }",fr,every=500,landscape=landscape,tag='s13',watch={'dazzled':"()=>window.__s11.statuses.some(x=>x.endsWith(':dazzled'))"})
        need(R['over']=='win',f"The Mirrorball fight ended {R['over']}")
        need(any(a.startswith('facet_dazzle') for a in R['acts']),f"Facet Dazzle should be played: {R['acts'][:10]}")
        need(any(x.endswith(':facet_spin') for x in R['statuses']) and any(x.endswith(':dazzled') for x in R['statuses']),f"Facet Spin and Dazzled should show as statuses: {R['statuses'][:10]}")
        caps+=pick(fr,6)
        fr=[]; R=s11_run(pg,lab,'new56',"()=>{ const e=B3.F.foes[0]; e.maxHp=Math.floor(e.maxHp*2.2); e.hp=Math.floor(e.maxHp*.49); e.actIx=4; e.spd*=1.5; }",fr,every=500,landscape=landscape,tag='s13')
        need(R['over']=='win',f"The Mirrorball (low HP) fight ended {R['over']}")
        need(any(a.startswith('last_dance') for a in R['acts']),f"LAST DANCE should be played below half HP: {R['acts'][:10]}")
        caps+=pick(fr,4)
        for fid,foe,ix,act,st in (('new55','wallflower',1,None,None),('new54','soreloser',1,'cheater','cheater'),('new53','coathanger',1,'coat_cling','slow'),('new52','stuffedshirt',0,'hmph','hmph'),('new51','velvetrope',1,'not_on_the_list',None)):
            caps+=pick(rush(fid,foe,ix,act,st,fast=foe in ('velvetrope','soreloser','stuffedshirt','coathanger')),2)
    if 'c' in parts:
        # Chapter 10. The Last Call: Boarding Group Nine marks one ally (the mark shows), GATE CLOSED slams them; below half HP FINAL BOARDING winds up
        fr=[]; R=s11_run(pg,lab,'new62',"()=>{ const e=B3.F.foes[0]; e.maxHp=Math.floor(e.maxHp*1.3); e.hp=e.maxHp; e.actIx=2; e.spd*=1.5; }",fr,every=500,landscape=landscape,tag='s13',watch={'mark':"()=>!!B3.F.foes[0].mark"})
        need(R['over']=='win',f"The Last Call fight ended {R['over']}")
        need(any(a.startswith('boarding_group_nine') for a in R['acts']),f"Boarding Group Nine should be played: {R['acts'][:10]}")
        caps+=pick(fr,6)
        fr=[]; R=s11_run(pg,lab,'new62',"()=>{ const e=B3.F.foes[0]; e.maxHp=Math.floor(e.maxHp*2.2); e.hp=Math.floor(e.maxHp*.49); e.actIx=5; e.spd*=1.5; }",fr,every=500,landscape=landscape,tag='s13')
        need(R['over']=='win',f"The Last Call (low HP) fight ended {R['over']}")
        need(any(a.startswith('final_boarding') for a in R['acts']),f"FINAL BOARDING should be played below half HP: {R['acts'][:10]}")
        caps+=pick(fr,4)
        for fid,foe,ix,act,st in (('new61','armresthog',0,None,None),('new60','unclaimed',0,'carousel_spin','slow'),('new59','longline',1,'step_back_behind_yellow',None),('new58','jetlag',1,'three_am_glare','blind'),('new57','carryon',1,'overhead_bin_drop','bin_drop')):
            caps+=pick(rush(fid,foe,ix,act,st,fast=foe in ('carryon','jetlag','longline','unclaimed')),2)
    if 'd' in parts:
        # Bonus chapter. Brain Freeze: Temple Throb winds up (fatigue), then below half HP the Frosted Lid and Deep Freeze
        fr=[]; R=s11_run(pg,lab,'new66',"()=>{ const e=B3.F.foes[0]; e.maxHp=Math.floor(e.maxHp*1.3); e.hp=e.maxHp; e.actIx=3; e.spd*=1.5; }",fr,every=500,landscape=landscape,tag='s13')
        need(R['over']=='win',f"Brain Freeze fight ended {R['over']}")
        need(any(a.startswith('ice_cube_pitch') for a in R['acts']),f"Ice-Cube Pitch should be played: {R['acts'][:10]}")
        caps+=pick(fr,6)
        fr=[]; R=s11_run(pg,lab,'new66',"()=>{ const e=B3.F.foes[0]; e.maxHp=Math.floor(e.maxHp*2.2); e.hp=Math.floor(e.maxHp*.49); e.spd*=1.5; }",fr,every=500,landscape=landscape,tag='s13')
        need(R['over']=='win',f"Brain Freeze (low HP) fight ended {R['over']}")
        need(any(a.startswith('frosted_lid') for a in R['acts']) and any(x.endswith(':frosted_lid') for x in R['statuses']),f"Frosted Lid should be played and shown below half HP: {R['acts'][:10]} {R['statuses'][:8]}")
        caps+=pick(fr,4)
        for fid,foe,ix,act,st in (('new65','slushslug',0,None,None),('new64','conehead',1,'mint_chip_drip','drenched'),('new63','gremlin',2,'sprinkle_spray','dazzled')):
            caps+=pick(rush(fid,foe,ix,act,st,fast=foe in ('gremlin','conehead')),2)
    sheet(caps,6,os.path.join(OUT,'b3-s13'+('-land' if landscape else '')+'.png'),scale=.4)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append('page error: '+str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b3Start',timeout=180000); pg.wait_for_timeout(1500)
    lab=pg.evaluate("()=>B3_LAB.map(L=>L.id)"); only=[a for a in sys.argv[1:] if a in('s3','s4','s5','s5b','s5c','s6','s7','s8','s9b','s9c','s10','s11','s12','s13a','s13b','s13c','s13','s16','s21')]; want=[a for a in sys.argv[1:] if not a.startswith('-') and a not in('s3','s4','s5','s5b','s5c','s6','s7','s8','s9b','s9c','s10','s11','s12','s13a','s13b','s13c','s13','s16','s21')] or ([] if only else lab)
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
        pg.click('#b3-app [data-done]'); pg.wait_for_timeout(500)
        if pg.evaluate("()=>splash.mode")!='lab3': fails.append(f'{fid}: CONTINUE after a loss did not go back to the list')
        # 4. landscape (the phone's own toggle: the stage turns a quarter turn)
        pg.evaluate("()=>{ B7.speed=1; toggleLayout(); }"); pg.wait_for_timeout(500)
        fr=[]; start(pg,idx,{'seed':SEED}); wait_cmd(pg); pg.wait_for_timeout(400); fr.append(shot(pg)); first=state(pg)['actor']
        key=[f['key'] for f in state(pg)['foes'] if f['alive']][-1]
        if pg.evaluate("()=>b3Entry().opts.length")>1:
            tap_foe(pg,key); pg.wait_for_timeout(250); fr.append(shot(pg))
            if pg.evaluate("()=>b3AimOpt().key")!=key: fails.append(f"{fid} landscape: tapping the enemy on the picture did not aim at it")
        pg.click(f'#b3-rows .bx-mv[data-i="{pg.evaluate("()=>B3.sel")}"]')   # the second tap uses the highlighted Basic
        pg.wait_for_timeout(900); fr.append(shot(pg)); wait_cmd(pg); pg.wait_for_timeout(250)
        if state(pg)['actor'] in(first,None) or pg.evaluate("()=>B3.F.turnLog.length")<2: fails.append(f"{fid} landscape: the second tap did not use {first}'s Basic (now {state(pg)['actor']})")
        pg.keyboard.press('KeyI'); pg.wait_for_timeout(250); fr.append(shot(pg)); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
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
    # 6c. stage 5a: the Traits, Quirks and Capstones of the four first Sig Vibes, at Rank 5 on The Big One
    if 's5' in sys.argv or not only and len(want)==len(lab):
        print('stage 5a: Traits, Quirks, Capstones'); stage5(pg,lab)
    # 6d. stage 5b: Gamer Geek and Craft Artist complete, at Rank 5 on The Big One (portrait, then a short pass in landscape)
    if 's5b' in sys.argv or not only and len(want)==len(lab):
        print('stage 5b: Gamer Geek and Craft Artist'); stage5b(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage5b(pg,lab,True)
        pg.click('#b3-exit'); pg.wait_for_timeout(500); pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 6e. stage 5c: Cozy Rosie and Registered Nut complete (portrait, then a pass in landscape)
    if 's5c' in sys.argv or not only and len(want)==len(lab):
        print('stage 5c: Cozy Rosie and Registered Nut'); stage5c(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage5c(pg,lab,True)
        pg.click('#b3-exit'); pg.wait_for_timeout(500); pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 6f. stage 6: the Family Ruckus (portrait, then a pass in landscape)
    if 's6' in sys.argv or not only and len(want)==len(lab):
        print('stage 6: Family Ruckus'); stage6(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage6(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 6g. stage 7: tap to preview, Rose Mode pictures, the recommended move (portrait, then a pass in landscape)
    if 's16' in sys.argv or not only and len(want)==len(lab):
        print('b3s16: Tombo skins'); stage16(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage16(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    if 's7' in sys.argv or not only and len(want)==len(lab):
        print('stage 7: preview and Rose Mode'); stage7(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage7(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 6h. stage 8: video clips in Battle 3 (portrait, then a pass in landscape)
    if 's8' in sys.argv or not only and len(want)==len(lab):
        print('stage 8: clips'); stage8(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage8(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 6i. b3s9: the SKILLS list and the skill card (portrait, then landscape)
    if 's9b' in sys.argv or not only and len(want)==len(lab):
        print('b3s9b: TNB'); stage9b(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage9b(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    if 's21' in sys.argv or not only and len(want)==len(lab):
        print('b3s21: Casual Mode'); stage21(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage21(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    if 's9c' in sys.argv or not only and len(want)==len(lab):
        print('b3s9c: Nara and Boppy'); stage9c(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage9c(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    if 's10' in sys.argv or not only and len(want)==len(lab):
        print('b3s10: Amy, Justin and Olivia'); stage10(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage10(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    if 's11' in sys.argv or not only and len(want)==len(lab):
        print('b3s11: chapters 2 to 4'); stage11(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage11(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    if 's12' in sys.argv or not only and len(want)==len(lab):
        print('b3s12: chapters 5 to 7'); stage12(pg,lab)
        pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage12(pg,lab,True)
        pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    for part,letters,label in (('s13a','a','chapter 8'),('s13b','b','chapter 9'),('s13c','c','chapter 10'),('s13','d','the bonus chapter')):
        if part in sys.argv:
            print('b3'+part+': '+label); stage13(pg,lab,False,letters)
            pg.evaluate("()=>{ B7.speed=1; splash.active=false; toggleLayout(); }"); pg.wait_for_timeout(500); stage13(pg,lab,True,letters)
            pg.evaluate("()=>{ toggleLayout(); }"); pg.wait_for_timeout(400)
    # 7. battle 2 still owns its screen
    pg.evaluate("()=>{ B7.speed=1; splash.active=false; document.getElementById('splash').hidden=true; window.__LE.b2Start({party:['tom','grace','rose'],level:12,foes:[['mudling','front']],bag:[]}); }")
    pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
    v=pg.evaluate("()=>{ const shown=id=>getComputedStyle(document.getElementById(id)).display!=='none'&&document.getElementById(id).getBoundingClientRect().width>0; return {b2:!document.getElementById('b2-ui').hidden,b3:shown('b3-side'),bar3:shown('b3-bar'),v3:document.getElementById('battle').classList.contains('v3'),tools:shown('b3-tools')}; }")
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
