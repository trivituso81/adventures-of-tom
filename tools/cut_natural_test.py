# Natural-play cutscene test (cutpolish1, from claude/cutscene-polish/cut_natural_run.py).
# Plays chapter 1 scenes the way a player does: no SKIP, no FAST, Enter only after a line finished typing, state logged every 100 ms.
# Usage: python3 -I tools/cut_natural_test.py <out dir> [modes: open row theft free] [LAYOUT=landscape in the environment]
# Needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH (see claude/next.md "Tests"). Prints FAILS: [] when every check passes.
# Checks: a scene has not ended 5 s after its last line closed; a party member named in a walk step moves; two party members share a tile
# at the end of a scene; the arrows show during a scene; FAST or SKIP show over a modal; a queued toast shows for under 2.5 s;
# the (A) button shows between lines; a scene that has to end under the harness's own timeout does not.
import threading, http.server, socketserver, functools, os, json, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/cutnat'
MODES = sys.argv[2:] or ['open', 'row', 'theft', 'free']
LAYOUT = os.environ.get('LAYOUT', 'portrait')
os.makedirs(OUT, exist_ok=True)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

# Wraps the walk step so every walk of a party member is recorded: who, where from, where to, how many tiles the route had.
HOOK = r"""()=>{ window.__walks=[]; const orig=S.walk;
  S.walk=(a,tiles,dur,onStep)=>{ const st=orig(a,tiles,dur,onStep),s0=st.start.bind(st),u0=st.update.bind(st);
    const rec={who:a?(a.isPlayer?'tom':(a.member&&a.member.id)||a.name||'?'):null,party:!!a&&(a.isPlayer||followers.includes(a)),n:(tiles||[]).length,from:null,to:null,done:false};
    st.start=function(){ if(a){ const p=position(a); rec.from=[p.x,p.y]; } window.__walks.push(rec); return s0(); };
    st.update=function(dt){ const r=u0(dt); if(r&&a&&!rec.done){ const p=position(a); rec.to=[p.x,p.y]; rec.done=true; } return r; };
    return st; };
  // cutpolish2: count (a) story sheets released while a scene runs and (b) draws of a painted story pose that fell back to the small row-string copy (the blur).
  // facehold1: the automatic staging (huddle, gather, approach, around) must never turn someone standing still away from the way a {face} step set them.
  // {face} sets the want, a {walk} clears it; a turn by any authored step (a call, a hop, the scene end) is the script's own and is not counted.
  window.__wf=[]; const of=SCENE_OPS.face,ow=SCENE_OPS.walk;
  SCENE_OPS.face=o=>{ const st=of(o),s0=st.start.bind(st); st.start=function(){ const r=s0(); const a=sceneActor(o.face); if(a) a._faceWant=o.dir; return r; }; return st; };
  SCENE_OPS.walk=o=>{ const st=ow(o); if(st&&st.start){ const s0=st.start.bind(st); st.start=function(){ const a=sceneActor(o.walk); if(a) a._faceWant=null; return s0(); }; } return st; };
  for(const op of ['huddle','gather','approach','around']) { const f=SCENE_OPS[op]; if(!f) continue;
    SCENE_OPS[op]=o=>{ const st=f(o); if(!st||!st.start) return st; const who=()=>[player,...followers].filter(a=>!a.hidden&&!a.seat);
      const look=(snap)=>{ for(const [a,fc,x,y] of snap) { const p=position(a); if(a._faceWant&&a.facing!==fc&&a.facing!==a._faceWant&&Math.abs(p.x-x)<.01&&Math.abs(p.y-y)<.01)
        window.__wf.push({op,who:a.isPlayer?'tom':(a.member&&a.member.id)||a.name,now:a.facing,set:a._faceWant,line:dialog.active?dialog.name:null}); } };
      const s0=st.start.bind(st),u0=st.update?st.update.bind(st):null; let snap=null;
      st.start=function(){ snap=who().map(a=>{ const p=position(a); return [a,a.facing,p.x,p.y]; }); const r=s0(); if(!u0) look(snap); return r; };
      if(u0) st.update=function(dt){ const r=u0(dt); if(r&&snap) { look(snap); snap=null; } return r; };   // judged when the step ends: someone it walked has moved
      return st; }; }
  window.__rel=[]; window.__blur=[]; const pr=paintedRelease; paintedRelease=function(a){ if(intro.active&&/Story$|^mudlingHeist$/.test(a.id)) window.__rel.push(a.id); return pr.apply(this,arguments); };
  const pc=paintedCanvas; paintedCanvas=function(rows,flash){ const r=pc.apply(this,arguments); if(!r&&intro.active&&rows&&rows._paint){ const A=rows._paint.a,id=typeof A==='string'?A:(A&&A.id); if(/Story$|^mudlingHeist$/.test(id||'')) window.__blur.push(id+':'+rows._paint.f); } return r; }; }"""

SNAP = r"""()=>{ const P=a=>{ const p=position(a); return [Math.round(p.x*100)/100,Math.round(p.y*100)/100]; };
  const g=followers.find(f=>f.member===grace), r=followers.find(f=>f.member===rose);
  const vis=id=>{ const e=document.getElementById(id); if(!e) return null; const cs=getComputedStyle(e); return !(e.hidden||cs.display==='none'||cs.visibility==='hidden'); };
  const dirVis=(()=>{ const e=document.querySelector('#dpad .dir'); if(!e) return null; const cs=getComputedStyle(e); return cs.visibility!=='hidden'&&cs.display!=='none'; })();
  const pose=a=>a&&a.scenePose?(Array.isArray(a.scenePose.f)?a.scenePose.f.join('/'):String(a.scenePose.f||a.scenePose.foe)):null;
  const tt=document.getElementById('toast');
  return {ia:intro.active,ph:intro.phase,sid:intro.sid||null,da:dialog.active,who:dialog.active?dialog.name:null,
    line:dialog.active?(dialog.lines[dialog.index]||'').slice(0,34):null,done:dialog.active?dialog.shown>=dialog.chars.length:null,
    cut:vis('cut-ctrl'),cls:document.documentElement.classList.contains('cutscene'),talking:document.documentElement.classList.contains('talking'),
    dpad:dirVis,aw:vis('action-wrap'),toast:tt.classList.contains('visible')?tt.textContent.slice(0,40):null,
    map:currentMap.id,tom:P(player),tp:pose(player),g:g?P(g):null,gp:pose(g),r:r?P(r):null,rp:pose(r),rs:!!(r&&r.seat),rh:!!(r&&r.hidden),ride:!!STORY.flags.ride,pan:(typeof SCENE_PROPS!=='undefined'&&SCENE_PROPS.muffinpan)?!!SCENE_PROPS.muffinpan.show:null,
    close:typeof closeup!=='undefined'&&!!closeup.active,show:!!intro.showcase,card:!!intro.card,
    flags:Object.keys(STORY.flags).filter(k=>/^(opening|ch1)/.test(k)).join(',')};
}"""

SETUP = {
 'open': "()=>{ chapterJump(1); }",
 'row': """()=>{ endIntro(); resetStory('full',1); b6Prep(1); for(const k of ['opening-done','ch1-goal','saw-squishy','tombo:rose1','tombo:grace1','ride']) STORY.flags[k]=true;   // ride: Rose is on Tom's shoulders from the opening to the kitchen (cutpolish3)
  setChapter(1,{apply:false}); for(const f of followers) f.hidden=false; currentMap=town; let P=null,at=null;
  for(const [k,p] of town.portals) if(p.kind==='edge'&&p.to==='row') { P=p; at=k; }
  const xy=String(at).split(',').map(Number); player.x=xy[0]; player.y=xy[1]; player.facing='down'; player.hidden=false; player.move=null;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); beginTransition(P); }""",
 'theft': """()=>{ endIntro(); resetStory('full',1); b6Prep(1); for(const k of ['opening-done','ch1-goal','ch1-amy','saw-squishy','tombo:rose1','tombo:grace1','ride']) STORY.flags[k]=true;
  setChapter(1,{apply:false}); for(const f of followers) f.hidden=false; const h=houseById.grands; currentMap=worlds[h.area]||town; player.x=h.door.x; player.y=h.door.y+1; player.facing='up'; player.hidden=false; player.move=null;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
  const portal=currentMap.portals.get(key(h.door.x,h.door.y)); beginTransition(portal); }""",
}

# follow1: free walking. `moveInput` (what the arrow keys feed) is replaced by an autopilot that follows window.__ap.goals; every animation frame the page
# records Tom's position and, for each follower in the line, where it is and where its spot in the walking line is (the same formula movePlayer uses).
FREE_HOOK = r"""()=>{ const ap=window.__ap={goals:[],on:false,rec:[],stuck:0};
  moveInput=function(){ if(!ap.on||player.move||transition||intro.active||dialog.active) return null;
    const g=ap.goals[0]; if(!g){ ap.on=false; return null; }
    if(g.map!==currentMap.id){ if(ap.goals.some(h=>h.map===currentMap.id)) ap.goals.shift(); return null; }   // the portal took Tom to the next map before his goal tile counted
    const p={x:Math.round(player.x),y:Math.round(player.y)}; if(p.x===g.x&&p.y===g.y){ ap.goals.shift(); return null; }
    const path=findPath(currentMap,player,g); if(!path.length){ ap.stuck++; return null; }
    const n=path[0]; return n.x>p.x?'right':n.x<p.x?'left':n.y>p.y?'down':'up'; };
  const spot=f=>{ const k=lineIndex(f),gap=(currentMap&&!currentMap.outside)?1.5:1,at=Math.max(0,trail.length-1-gap*(k+1)-(f.lag||0)),lo=Math.floor(at),a=trail[lo],b=trail[Math.ceil(at)];
    if(!a||!b) return null; const fr=at-lo; return {x:a.x+(b.x-a.x)*fr,y:a.y+(b.y-a.y)*fr}; };
  const tick=()=>{ if(ap.on){ const tp=position(player);
      ap.rec.push({t:performance.now()/1000,map:currentMap.id,tx:tp.x,ty:tp.y,ia:!!intro.active,da:!!dialog.active,tr:!!transition,
        f:followers.filter(f=>!f.seat).map(f=>{ const p=position(f),s=spot(f); return {id:(f.member&&f.member.id)||f.name,x:p.x,y:p.y,sx:s?s.x:null,sy:s?s.y:null,hid:!!f.hidden}; })}); }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick); }"""
FREE_SETUP = """()=>{ endIntro(); resetStory('full',1); b6Prep(1); for(const k of ['opening-done','ch1-goal','ch1-amy','saw-squishy','tombo:rose1','tombo:grace1']) STORY.flags[k]=true;   // no `ride`: Rose walks too
  setChapter(1,{apply:false}); for(const f of followers){ f.hidden=false; f.seat=false; } currentMap=town; player.x=8; player.y=6; player.facing='down'; player.hidden=false; player.move=null;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld(); }"""
FREE_GOALS = [{'map': 'town', 'x': 13, 'y': 25}, {'map': 'row', 'x': 14, 'y': 19}]
FREE_LIMIT = 150
ENDFLAG = {'open': 'ch1-goal', 'row': 'ch1-amy', 'theft': 'ch1-theft'}
LIMIT = {'open': 330, 'row': 200, 'theft': 300}

def run(pw, mode):
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    pg = br.new_page(viewport={'width': 430, 'height': 860} if LAYOUT == 'portrait' else {'width': 860, 'height': 430})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=240000)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    if LAYOUT == 'landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }")
    pg.evaluate(HOOK)
    pg.evaluate(SETUP[mode])
    log = []; t0 = time.time(); doneAt = None; idle = 0; shots = 0; last = None
    while time.time() - t0 < LIMIT[mode]:
        s = pg.evaluate(SNAP); s['t'] = round(time.time() - t0, 2); log.append(s)
        if s['close']:
            if doneAt is None: doneAt = time.time()
            elif time.time() - doneAt > 2.5: pg.keyboard.press('Enter'); doneAt = None
        elif s['da'] and s['done']:
            if doneAt is None: doneAt = time.time()
            elif time.time() - doneAt > 0.7: pg.keyboard.press('Enter'); doneAt = None
        else: doneAt = None
        if ENDFLAG[mode] in s['flags'] and not s['ia'] and not s['da']:
            idle += 1
            if idle == 20: pg.screenshot(path=os.path.join(OUT, f'{mode}-{LAYOUT}-end.png'))
            if idle > 90: break    # 9 s after the scene: long enough for the queued toasts to show
        else: idle = 0
        key = (s['sid'], s['who'], s['tp'], s['gp'], s['rp'])
        if key != last and shots < 40 and s['ia']:
            pg.wait_for_timeout(120); pg.screenshot(path=os.path.join(OUT, '%s-%s-%03d.png' % (mode, LAYOUT, shots))); shots += 1
        last = key
        pg.wait_for_timeout(100)
    walks = pg.evaluate("()=>window.__walks")
    pre = pg.evaluate("()=>({rel:window.__rel,blur:window.__blur,wf:window.__wf})")
    br.close()
    return log, walks, errs, pre

def analyse(mode, log, walks, errs):
    fails = []; facts = {}
    ended = ENDFLAG[mode] in (log[-1]['flags'] if log else '')
    if not ended: fails.append(f'{mode}: scene never reached flag {ENDFLAG[mode]} within {LIMIT[mode]} s')
    if errs: fails.append(f'{mode}: page errors {errs[:3]}')
    # 1. a scene still running 5 s after its last line closed
    lastda = None; worst = 0
    for s in log:
        if s['ia'] and s['ph'] == 'scene':
            if s['da']: lastda = s['t']
            elif lastda is not None: worst = max(worst, s['t'] - lastda)
        elif not s['ia']: lastda = None
    facts['longest_gap_after_a_line_s'] = round(worst, 1)
    # a gap this long that is NOT followed by another line is the check; gaps between lines are legitimate walks, so measure only the tail
    tail = None; lastline = None
    for s in log:
        if s['da']: lastline = s['t']; tail = None
        elif lastline is not None and not s['ia'] and tail is None: tail = s['t'] - lastline
    facts['last_line_to_scene_end_s'] = round(tail, 1) if tail is not None else None
    if tail is not None and tail > 5: fails.append(f'{mode}: scene ended {tail:.1f} s after its last line (limit 5)')
    # 2. party walks that did not move
    for w in walks:
        if w['party'] and w['done'] and w['from'] == w['to'] and w['n'] > 0: pass
        if w['party'] and w['n'] == 0 and w['from'] is not None: fails.append(f"{mode}: {w['who']} walk step had an empty route at {w['from']}")
        elif w['party'] and w['done'] and w['n'] > 0 and w['from'] == w['to']: fails.append(f"{mode}: {w['who']} walk step did not move from {w['from']}")
    facts['party_walks'] = [(w['who'], w['n'], w['from'], w['to']) for w in walks if w['party']]
    # 3. two party members on one tile at the end of the scene
    endi = next((i for i, s in enumerate(log) if i and log[i - 1]['ia'] and not s['ia']), None)
    if endi is not None:
        s = log[min(endi + 5, len(log) - 1)]
        tiles = [tuple(s[k]) for k in ('tom', 'g', 'r') if s[k] and not (k == 'r' and s['rs'])]   # a seated Rose shares Tom's tile by design
        facts['tiles_just_after_scene'] = {k: s[k] for k in ('tom', 'g', 'r')}
        if len(set((round(a), round(b)) for a, b in tiles)) < len(tiles): fails.append(f"{mode}: party shares a tile just after the scene {facts['tiles_just_after_scene']}")
    # cutpolish3: Rose rides from the opening to the kitchen. open and row: seated and the flag set at the end; theft: seated when the scene starts, on the
    # ground with the flag cleared before the first line, never seated again after; she never stands on Tom's tile once down; never hidden.
    if endi is not None:
        e = log[min(endi + 5, len(log) - 1)]
        if mode in ('open', 'row') and not (e['rs'] and e['ride']): fails.append(f"{mode}: Rose is not on Tom's shoulders after the scene (seat {e['rs']}, flag {e['ride']})")
        if mode == 'theft' and (e['rs'] or e['ride']): fails.append(f"theft: Rose still riding after the scene (seat {e['rs']}, flag {e['ride']})")
    if mode in ('open', 'row'):
        walkers = [s for s in log if s['ia'] and s['ph'] == 'scene' and s['t'] > 3 and s['rs']]
        off = [s for s in walkers if abs(s['r'][0] - s['tom'][0]) > 1.01 or abs(s['r'][1] - s['tom'][1]) > 1.01]
        facts['rose_off_tom_while_seated_samples'] = len(off)
        if off: fails.append(f"{mode}: seated Rose was away from Tom in {len(off)} samples, first {off[0]['r']} vs {off[0]['tom']}")
    if mode == 'theft':   # heistart: after the grab the pan prop must be hidden (the step {prop,hide:true} once did nothing)
        pans = [e['pan'] for e in log if e['pan'] is not None]
        if True not in pans: fails.append('theft: the muffin pan prop was never shown')
        elif pans[-1]: fails.append('theft: the muffin pan prop is still shown at the end of the scene')
    if mode == 'theft':
        first = next((i for i, s in enumerate(log) if s['ia'] and s['da']), None)
        if first is not None:
            f0 = log[first]; facts['rose_at_first_line'] = (f0['rs'], f0['ride'], f0['r'], f0['tom'])
            if f0['rs'] or f0['ride']: fails.append(f"theft: Rose still on Tom's shoulders at Deedee's first line {facts['rose_at_first_line']}")
            if tuple(f0['r']) == tuple(f0['tom']): fails.append(f"theft: Rose on Tom's tile at the first line {facts['rose_at_first_line']}")
        if any(s['rh'] and s['ia'] for s in log): fails.append('theft: Rose hidden during the scene')
    # facehold1: nobody turned away from the way a {face} step set them while they stood still
    # 4. arrows during a scene; 5. FAST/SKIP over a modal; 6. (A) button between lines
    sc = [s for s in log if s['ia'] and s['ph'] == 'scene']
    if any(s['dpad'] for s in sc[3:]): fails.append(f'{mode}: arrows showed during a scene')
    if any(s['cut'] and (s['show'] or s['card'] or s['close']) for s in log): fails.append(f'{mode}: FAST or SKIP showed over a modal')
    between = [s for s in sc[3:] if not s['da'] and s['aw']]
    facts['a_button_between_lines_samples'] = len(between)
    if between: fails.append(f'{mode}: (A) button visible between lines in {len(between)} samples')
    # 7. every toast on screen at least 2.5 s (toasts at the very end of the log are cut off by the run, not by the game)
    runs = []; cur = None
    boot = next((s['t'] for s in log if not s['toast']), 0)    # the boot toast of a new game (engine/draw.js) is not a queued one
    for s in log:
        if s['t'] <= boot: continue
        if s['toast']:
            if cur and cur[0] == s['toast']: cur[2] = s['t']
            else:
                if cur: runs.append(cur)
                cur = [s['toast'], s['t'], s['t']]
        elif cur: runs.append(cur); cur = None
    if cur: runs.append(cur)
    facts['toasts'] = [(t[0], round(t[2] - t[1] + .1, 1)) for t in runs]
    for t in runs:
        if t[0].startswith(('Goal', 'Tap the map', 'Got ')) and t[2] - t[1] + .1 < 2.4: fails.append(f'{mode}: queued toast "{t[0]}" shown {t[2]-t[1]+.1:.1f} s (limit 2.4: samples are 0.1 s apart)')
    # queued toasts must not appear during a scene
    if any(s['toast'] and s['t'] > boot and s['toast'].startswith(('Goal', 'Tap the map', 'Got ')) and s['ia'] for s in log): fails.append(f'{mode}: a queued toast showed during a scene')
    # pose hold (fact, not a failure): of the lines that closed while someone held a pose, how many kept it 0.3 s later
    held = kept = 0
    for i in range(1, len(log)):
        a, b = log[i - 1], log[i]
        if a['da'] and not b['da'] and b['ia']:
            pa = [a[k] for k in ('tp', 'gp', 'rp')]
            if any(pa):
                held += 1
                later = next((x for x in log[i:i + 8] if x['t'] >= b['t'] + .3), None)
                if later and any(later[k] for k in ('tp', 'gp', 'rp')): kept += 1
    facts['pose_held_after_line'] = f'{kept}/{held}'
    return fails, facts


def run_free(pw):
    kw = {'args': ['--headless=new', '--no-proxy-server', '--autoplay-policy=no-user-gesture-required']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    pg = br.new_page(viewport={'width': 430, 'height': 860} if LAYOUT == 'portrait' else {'width': 860, 'height': 430})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=240000)
    pg.evaluate("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
    if LAYOUT == 'landscape': pg.evaluate("()=>{ layout.mode='landscape'; applyLayout(); }")
    pg.evaluate(FREE_SETUP)
    pg.evaluate(FREE_HOOK)
    pg.evaluate("g=>{ window.__ap.goals=g; window.__ap.on=true; }", FREE_GOALS)
    t0 = time.time(); shots = 0
    while time.time() - t0 < FREE_LIMIT:
        pg.wait_for_timeout(500)
        st = pg.evaluate("()=>({on:window.__ap.on,n:window.__ap.goals.length,map:currentMap.id,ia:!!intro.active,stuck:window.__ap.stuck})")
        if shots < 6 and st['on']: pg.screenshot(path=os.path.join(OUT, f'free-{LAYOUT}-{shots}.png')); shots += 1
        if not st['on'] or st['ia'] or st['stuck'] > 20: break
    res = pg.evaluate("()=>({rec:window.__ap.rec,stuck:window.__ap.stuck,ia:!!intro.active,left:window.__ap.goals.length})")
    br.close()
    return res, errs

def analyse_free(res, errs):
    fails = []; rec = res['rec']; facts = {}
    if errs: fails.append(f'free: page errors {errs[:3]}')
    if res['ia']: fails.append('free: a scene started during the walk')
    if res['stuck'] > 20: fails.append('free: the autopilot found no path')
    if res['left']: fails.append(f"free: the walk did not finish ({res['left']} goals left)")
    tiles = 0; last = None
    for r in rec:
        c = (r['map'], round(r['tx']), round(r['ty']))
        if abs(r['tx'] - round(r['tx'])) < .01 and abs(r['ty'] - round(r['ty'])) < .01 and c != last: tiles += 1 if last and last[0] == c[0] else 0; last = c
    facts['tom_tiles_walked'] = tiles
    if tiles < 30: fails.append(f'free: Tom walked only {tiles} tiles (need 30)')
    worst = {}; bad = {}; first = {}
    for r in rec:
        if r['tr']: continue
        for f in r['f']:
            if f['sx'] is None: continue
            d = ((f['x'] - f['sx']) ** 2 + (f['y'] - f['sy']) ** 2) ** .5
            worst[f['id']] = max(worst.get(f['id'], 0), d)
            if d > 2:
                b = bad.setdefault(f['id'], {'start': None, 'longest': 0})
                if b['start'] is None: b['start'] = r['t']; first.setdefault(f['id'], (r['map'], round(r['tx'], 1), round(r['ty'], 1), round(f['x'], 1), round(f['y'], 1), round(f['sx'], 1), round(f['sy'], 1)))
                b['longest'] = max(b['longest'], r['t'] - b['start'])
            elif f['id'] in bad: bad[f['id']]['start'] = None
    facts['frames'] = len(rec); facts['worst_follower_off_spot_tiles'] = {k: round(v, 2) for k, v in worst.items()}
    facts['longest_off_spot_over_2_tiles_s'] = {k: round(v['longest'], 2) for k, v in bad.items()}
    for k, v in bad.items():
        if v['longest'] > .5: fails.append(f"free: {k} was more than 2 tiles off its line spot for {v['longest']:.2f} s (map, tom, follower, spot: {first[k]})")
    return fails, facts

if __name__ == '__main__':
    allf = []; res = {}
    with sync_playwright() as pw:
        for m in MODES:
            if m == 'free':
                fr, ferrs = run_free(pw)
                json.dump({'res': fr, 'errs': ferrs}, open(os.path.join(OUT, f'free-{LAYOUT}.json'), 'w'))
                f, facts = analyse_free(fr, ferrs); allf += f; res[m] = facts
                print(m, LAYOUT, json.dumps(facts)[:900]); continue
            log, walks, errs, pre = run(pw, m)
            json.dump({'log': log, 'walks': walks, 'errs': errs, 'pre': pre}, open(os.path.join(OUT, f'{m}-{LAYOUT}.json'), 'w'))
            f, facts = analyse(m, log, walks, errs); allf += f; res[m] = facts
            facts['story_sheets_released_in_scene'] = len(pre['rel']); facts['blurred_pose_draws'] = len(pre['blur'])
            wf = pre.get('wf') or []; facts['wrong_facing_turns'] = len(wf)   # facehold1
            if wf: allf.append(f"{m}: the automatic staging turned someone away from their {{face}} step {len(wf)} times, first {wf[0]}")
            if pre['rel']: allf.append(f"{m}: story sheets released mid-scene {sorted(set(pre['rel']))}")
            if pre['blur']: allf.append(f"{m}: painted pose drawn blurry (sheet not ready) {len(pre['blur'])} times, e.g. {sorted(set(pre['blur']))[:4]}")
            print(m, LAYOUT, 'frames', len(log), json.dumps(facts)[:900])
    json.dump({'fails': allf, 'facts': res}, open(os.path.join(OUT, f'result-{LAYOUT}.json'), 'w'), indent=1)
    print('FAILS:', allf)
