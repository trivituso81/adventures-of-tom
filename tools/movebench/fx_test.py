#!/usr/bin/env python3
"""movebench/fx_test.py (movebench7): the Effects section of the Move Workbench (battle-guide.html, claude/movebench-plan.md sections e.1 and e.3). FAILS when:
  - an effect of the library is missing from the picker, or its sample (the game's own drawer, P1_VFX) draws nothing at the middle of its length;
  - the effects list does not show the move's effects, Add an effect does not open the picker of all 37, or a picked effect is not added with its defaults (an empty `params`);
  - one setting of EACH control kind (range, choice, true or false, number, colour, button code, text, drawn object, another effect of the move) set through the page does not reach the effect
    as the frame's fight armed it (B3V cue: its params), and When, On whom, a sound and Switch off do not reach the cue either; a setting put back to its default leaves no params;
  - Undo does not take the last effect change away, the draft is not the one field `effects` of the diff, or Save draft writes more than the effects (against the stand-in GitHub of page_test.py);
  - an effect id with no drawer is not a pink dashed box in the preview with the tag PINK BOXES ARE NOT FINAL (and nothing pink in the game's own table);
  - at the five sizes the section, its buttons (44 px) or a control is missing, cut off or makes the page scroll sideways;
  - the page sends anything but plain reads of this site (and the stand-in GitHub).
Usage (repo root): python3 -I tools/movebench/fx_test.py [outdir]    Pictures go to outdir (default tools/shots/movebench). Prints FAILS: [] when all pass."""
import threading, http.server, socketserver, functools, os, sys, re, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'shots', 'movebench'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True; daemon_threads = True
    def handle_error(self, *a): pass
srv = Srv(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d' % PORT
FX = json.load(open(os.path.join(ROOT, 'data', 'movebench-fx.json'), encoding='utf-8'))
fails = []; notes = []; sent = []
def fail(m): fails.append(m); print('FAIL', m, flush=True)
SIZES = [('phone-upright', 466, 657), ('folded-sideways', 678, 445), ('open-sideways', 951, 648), ('open-upright', 669, 869)]
AID = 'move:lounge_pass_flex'
def watch(pg):
    pg.on('pageerror', lambda e: fail('page error: ' + str(e)[:200]))
    def req(r):
        u = r.url
        if r.method != 'GET' and not u.startswith('data:') and not u.startswith('blob:'): sent.append((r.method, u))
        if not (u.startswith(BASE) or u.startswith('data:') or u.startswith('blob:') or u.startswith('https://api.github.com/')): sent.append(('OUT', u))   # the Guide's own plain reads of the board and queue are allowed
    pg.on('request', req)
def open_wb(pg, w, h, play=True):
    pg.set_viewport_size({'width': w, 'height': h})
    pg.goto(BASE + '/battle-guide.html#anims/' + AID)
    pg.wait_for_selector('#wbfx .fxc', timeout=90000)
    if play:
        pg.wait_for_selector('#bnstart', state='visible', timeout=90000); pg.click('#bnstart')
        pg.wait_for_function("()=>{const c=document.getElementById('bnplay');return c&&(c.textContent==='Pause'||c.textContent==='Play again');}", timeout=120000)
        fr = frame(pg); fr.wait_for_function('()=>window.B3BENCH&&window.__BENCH_BOOT&&window.__BENCH_BOOT.done', timeout=90000)
        pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=120000)
def frame(pg): return [f for f in pg.frames if 'bench.html' in f.url][0]
def cues(pg):
    """Pause, jump the preview to just after the hit and read what the frame's fight armed (B3V cues)."""
    pg.evaluate('()=>{BENCH.tl&&0;}')
    fr = frame(pg); fr.evaluate('()=>{B3BENCH.pause&&B3BENCH.pause();}')
    hit = pg.evaluate('()=>BENCH.tl&&BENCH.tl.run&&BENCH.tl.run.hit')
    fr.evaluate('(t)=>B3BENCH.seek(t)', (hit or 1.9) + 0.25)
    pg.wait_for_timeout(300)
    return fr.evaluate("()=>B3V.cues.map(c=>c.fx.map(e=>({fx:e.fx,at:e.at,on:e.on,params:e.params,sfx:e.sfx})))[0]||[]")
def wait_tl(pg):
    pg.wait_for_function('()=>BENCH.tl&&BENCH.tl.run', timeout=90000)
def click(pg, sel):
    loc = pg.locator(sel).first; loc.scroll_into_view_if_needed(); loc.click()
def effects(pg): return pg.evaluate('()=>(WB.draft.effects||[]).map(e=>JSON.parse(JSON.stringify(e)))')
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    words = json.load(open(os.path.join(ROOT, 'data', 'movebench-words.json'), encoding='utf-8'))
    src = open(os.path.join(ROOT, 'battle-guide.html'), encoding='utf-8').read()
    for k in sorted(set(re.findall(r"""\bWA?\('([a-z_]+(?:\.[a-z_0-9]+)+)'""", src))):
        v = words
        for part in k.split('.'): v = v.get(part) if isinstance(v, dict) else None
        if v is None: fail('the page asks for the word %s and data/movebench-words.json has none' % k)
    pg = br.new_page(viewport={'width': 951, 'height': 648}); watch(pg)
    open_wb(pg, 951, 648)
    # ---------- 1. the list shows the move's own effects, and the picker holds all 37 with a drawing that moves ----------
    rows = pg.evaluate("()=>[...document.querySelectorAll('#wbfx .fxc')].map(r=>r.querySelector('.fxm b').textContent)")
    if len(rows) != 2: fail('the list should show the 2 effects of Lounge Pass Flex, it shows %r' % rows)
    if not pg.evaluate("()=>document.getElementById('wbfxcount').textContent==='2 effects'"): fail('the Effects count is not "2 effects"')
    click(pg, '[data-fx=add]'); pg.wait_for_selector('.fxpick .fxtile', timeout=5000)
    tiles = pg.evaluate("()=>[...document.querySelectorAll('.fxtile')].map(t=>t.dataset.v)")
    if sorted(tiles) != sorted(FX['fx'].keys()): fail('the picker shows %d effects, the library has %d' % (len(tiles), len(FX['fx'])))
    blank = pg.evaluate("""()=>{const out=[];for(const cv of document.querySelectorAll('.fxtile canvas.fxs')){const id=cv.dataset.fxs;
        const L=P1_VFX_LEAD[id],M=P1_VFX_MS[id],len=typeof M==='function'?M(null):(M||500),lead=typeof L==='function'?L(null):(L||0);let drew=false;
        for(const f of [.35,.5,.65]){fxDraw(cv,Math.round(len*f));const g=cv.getContext('2d'),d=g.getImageData(0,0,cv.width,cv.height).data;let n=0;
          for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2];if(Math.abs(r-10)+Math.abs(gg-22)+Math.abs(b-26)>60&&!(r===255&&gg===255&&b===255&&false))n++;}
          if(n>120){drew=true;break;}}
        if(!drew)out.push(id);}return out;}""")
    if blank: fail('the sample of %d effects draws nothing at the middle of its length: %s' % (len(blank), blank[:5]))
    pg.evaluate('()=>{const t=document.querySelector(".fxpick");t&&t.scrollIntoView();}'); pg.wait_for_timeout(700)
    pg.screenshot(path=os.path.join(OUT, 'fx-picker-951x648.png'))
    # a moving sample: two draws a moment apart differ
    a = pg.evaluate("()=>{const cv=document.querySelector('.fxtile[data-v=vfx_core_clobber_impact] canvas');fxDraw(cv,150);const x=cv.toDataURL();fxDraw(cv,300);return x!==cv.toDataURL();}")
    if not a: fail('the sample of the starburst does not move between two moments')
    # ---------- 2. pick effects: each is added with its defaults ----------
    ADD = ['vfx_core_clobber_impact', 'vfx_core_drench_splash', 'vfx_core_composure_break', 'setpiece_50yr_dust_tsunami', 'setpiece_giant_sky_controller', 'setpiece_michael_sprint_and_chopper', 'proj_arc_single']
    for fid in ADD:
        if not pg.evaluate("()=>!!document.querySelector('.fxpick')"): click(pg, '[data-fx=add]'); pg.wait_for_selector('.fxpick .fxtile')
        click(pg, '.fxtile[data-v=%s]' % fid); pg.wait_for_selector('.fxpanel', timeout=5000)
        e = effects(pg)[-1]
        if e != {'fx': fid}: fail('picked %s, the list holds %r (an effect picked should have no settings of its own)' % (fid, e))
    n_after = len(effects(pg))
    if n_after != 2 + len(ADD): fail('after picking %d effects the list holds %d' % (len(ADD), n_after))
    # ---------- 3. one setting of each control kind, through the page ----------
    def panel(i):
        if pg.evaluate('()=>WB.fxOpen') != i: click(pg, '.fxc[data-i="%d"] [data-fx=open]' % i); pg.wait_for_selector('.fxc[data-i="%d"] .fxpanel' % i)
    def param(i, name): return '.fxc[data-i="%d"] .fxp[data-pn="%s"]' % (i, name)
    ix = {f: 2 + k for k, f in enumerate(ADD)}
    # range: hits 3 (a slider: set its value and fire input)
    panel(ix['vfx_core_clobber_impact'])
    pg.evaluate("""(sel)=>{const r=document.querySelector(sel+' input[type=range]');r.value=3;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));}""", param(ix['vfx_core_clobber_impact'], 'hits'))
    # colour: blue swatch
    panel(ix['vfx_core_clobber_impact']); click(pg, param(ix['vfx_core_clobber_impact'], 'color') + ' .fxsw2[data-v="#0ea5e9"]')
    # bool: pierceShield on
    panel(ix['vfx_core_clobber_impact']); click(pg, param(ix['vfx_core_clobber_impact'], 'pierceShield') + ' .fxsw')
    # choice: drench mode row_wave
    panel(ix['vfx_core_drench_splash']); click(pg, param(ix['vfx_core_drench_splash'], 'mode') + ' button[data-v=row_wave]')
    # bool on another effect: composure triggeredBreak, then a number on the tsunami: sweepMs Slow (third step)
    panel(ix['vfx_core_composure_break']); click(pg, param(ix['vfx_core_composure_break'], 'triggeredBreak') + ' .fxsw')
    panel(ix['setpiece_50yr_dust_tsunami']); click(pg, param(ix['setpiece_50yr_dust_tsunami'], 'sweepMs') + ' .wbseg button:nth-child(3)')
    # list: the button code loses its last letter and gets an A
    panel(ix['setpiece_giant_sky_controller']); click(pg, param(ix['setpiece_giant_sky_controller'], 'buttonSeq') + ' button[data-v="-"]'); click(pg, param(ix['setpiece_giant_sky_controller'], 'buttonSeq') + ' .wbseg button[data-v=U]')
    # text: the ticker
    panel(ix['setpiece_michael_sprint_and_chopper'])
    pg.fill(param(ix['setpiece_michael_sprint_and_chopper'], 'tickerText') + ' input[type=text]', 'HELLO TOM'); pg.press(param(ix['setpiece_michael_sprint_and_chopper'], 'tickerText') + ' input[type=text]', 'Tab')
    pg.wait_for_selector('.fxc[data-i="%d"] .fxpanel' % ix['setpiece_michael_sprint_and_chopper'])
    click(pg, param(ix['setpiece_michael_sprint_and_chopper'], 'mode') + ' button[data-v=livnews_chopper]')
    # sprite and effect: the thrown object and what it does on landing
    panel(ix['proj_arc_single']); click(pg, param(ix['proj_arc_single'], 'spriteId') + ' button[data-v=jar]'); click(pg, param(ix['proj_arc_single'], 'impactVfxId') + ' button[data-v=vfx_core_clobber_impact]')
    # When (before the hit, 0.3 s earlier), On whom (every monster), a sound, Switch off
    panel(ix['vfx_core_drench_splash'])
    click(pg, '.fxc[data-i="%d"] [data-fx=wm][data-v=before]' % ix['vfx_core_drench_splash'])
    click(pg, '.fxc[data-i="%d"] [data-fx=ws][data-v="-1"]' % ix['vfx_core_drench_splash'])
    click(pg, '.fxc[data-i="%d"] [data-fx=on][data-v=each_target]' % ix['vfx_core_drench_splash'])
    pg.select_option('.fxc[data-i="%d"] select[data-fx=snd]' % ix['vfx_core_drench_splash'], 'splat')
    panel(ix['vfx_core_composure_break']); click(pg, '.fxc[data-i="%d"] [data-fx=off]' % ix['vfx_core_composure_break'])
    want = effects(pg)
    exp = {
      ix['vfx_core_clobber_impact']: {'params': {'hits': 3, 'color': '#0ea5e9', 'pierceShield': True}},
      ix['vfx_core_drench_splash']: {'params': {'mode': 'row_wave'}, 'at': {'plus': -.3}, 'on': 'each_target', 'sfx': 'splat'},
      ix['vfx_core_composure_break']: {'params': {'triggeredBreak': True}, 'off': True},
      ix['setpiece_50yr_dust_tsunami']: {'params': {'sweepMs': 2475}},
      ix['setpiece_giant_sky_controller']: {'params': {'buttonSeq': ['U', 'U', 'D', 'D', 'L', 'R', 'L', 'R', 'B', 'U']}},
      ix['setpiece_michael_sprint_and_chopper']: {'params': {'tickerText': 'HELLO TOM', 'mode': 'livnews_chopper'}},
      ix['proj_arc_single']: {'params': {'spriteId': 'jar', 'impactVfxId': 'vfx_core_clobber_impact'}},
    }
    for i, ex in exp.items():
        got = {k: v for k, v in want[i].items() if k != 'fx'}
        if got != ex: fail('effect %d (%s): the draft holds %r, expected %r' % (i, want[i]['fx'], got, ex))
    if pg.evaluate('()=>Object.keys(wbDiff())') != ['effects']: fail('the diff of an effects change is not the one field effects: %r' % pg.evaluate('()=>Object.keys(wbDiff())'))
    # the frame's fight arms them the same way
    pg.wait_for_timeout(2500); wait_tl(pg); got = cues(pg)
    byfx = {}
    for c in got: byfx.setdefault(c['fx'], c)
    for i, ex in exp.items():
        f = want[i]['fx']
        if ex.get('off'):
            if f in byfx: fail('%s is switched off and the frame armed it' % f)
            continue
        c = byfx.get(f)
        if not c: fail('the frame did not arm %s (armed: %s)' % (f, [x['fx'] for x in got])); continue
        for k, v in ex.items():
            if c.get(k if k != 'at' else 'at') != v: fail('%s: the frame armed %s=%r, the page set %r' % (f, k, c.get(k), v))
    notes.append('armed by the frame: ' + ', '.join('%s %s' % (c['fx'].split('_', 2)[-1][:12], json.dumps(c['params'])) for c in got if c['params']))
    pg.screenshot(path=os.path.join(OUT, 'fx-list-951x648.png'))
    # a setting put back to its default leaves no params; Undo takes the last change away
    panel(ix['vfx_core_clobber_impact']); click(pg, param(ix['vfx_core_clobber_impact'], 'hits') + ' [data-fx=pr]')
    if 'hits' in (effects(pg)[ix['vfx_core_clobber_impact']].get('params') or {}): fail('Back to normal left the setting in the draft')
    before = len(effects(pg)); click(pg, '.fxc[data-i="%d"] [data-fx=remove]' % (before - 1) if pg.evaluate('()=>WB.fxOpen')==before-1 else '.fxc[data-i="%d"] [data-fx=open]' % (before - 1))
    if pg.evaluate('()=>WB.fxOpen') == before - 1: click(pg, '.fxc[data-i="%d"] [data-fx=remove]' % (before - 1))
    if len(effects(pg)) != before - 1: fail('Remove effect did not take the effect off')
    pg.click('#wbundo'); pg.wait_for_timeout(200)
    if len(effects(pg)) != before: fail('Undo did not bring the removed effect back')
    # ---------- 4. no drawer: a pink dashed box, the tag, nothing in the game's table ----------
    pg.evaluate("()=>{WB.draft.effects=[{fx:'vfx_future_test'}];wbSend();wbPaint();wbFxPaint();}")
    if pg.evaluate("()=>document.getElementById('wbpink').hidden"): fail('an effect with no drawer shows no PINK BOXES ARE NOT FINAL tag')
    if 'PINK BOXES ARE NOT FINAL' not in pg.evaluate("()=>document.getElementById('wbpink').textContent"): fail('the pink tag has the wrong words')
    if not pg.evaluate("()=>/no drawing yet/.test(document.querySelector('#wbfx .fxc').textContent)"): fail('the list does not say the effect has no drawing yet')
    if pg.evaluate("()=>typeof P1_VFX!=='undefined'&&!!P1_VFX['vfx_future_test']"): fail('the placeholder is in the game table P1_VFX')
    pg.wait_for_timeout(2500); wait_tl(pg); fr = frame(pg)
    got = cues(pg)
    if not any(c['fx'] == 'vfx_future_test' for c in got): fail('the frame did not arm the effect with no drawer (the pink box needs the cue)')
    cnt = fr.evaluate("""()=>{const cv=[...document.querySelectorAll('canvas')].sort((a,b)=>b.width*b.height-a.width*a.height)[0],g=cv.getContext('2d'),d=g.getImageData(0,0,cv.width,cv.height).data;let n=0;
      for(let i=0;i<d.length;i+=4)if(d[i]>230&&d[i+1]>60&&d[i+1]<130&&d[i+2]>170)n++;return n;}""")
    if cnt < 40: fail('no pink dashed box in the frame at the effect moment (%d pink pixels)' % cnt)
    pg.screenshot(path=os.path.join(OUT, 'fx-pink-951x648.png'))
    # ---------- 5. Save draft writes only the effects ----------
    pg.evaluate("()=>{WB.draft.effects=[{fx:'vfx_core_clobber_impact',params:{hits:2}}];wbSend();wbPaint();wbFxPaint();}")
    d = pg.evaluate('()=>wbDiff()')
    if list(d.keys()) != ['effects'] or d['effects'] != [{'fx': 'vfx_core_clobber_impact', 'params': {'hits': 2}}]: fail('the diff of the effects is %r' % d)
    pg.close()
    # ---------- 5b. Save draft against a stand-in GitHub: ONE file, the draft has the effects, the live part is untouched ----------
    import base64, hashlib, urllib.parse
    GHB = 'http://gh.test'; PATH = 'data/moves/move-lounge-pass-flex.json'; store = {'text': open(os.path.join(ROOT, PATH), encoding='utf-8').read(), 'puts': [], 'disp': 0}
    HDR = {'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PUT,POST,OPTIONS', 'content-type': 'application/json'}
    def gh(route, req):
        u = urllib.parse.urlparse(req.url)
        if req.method == 'OPTIONS': return route.fulfill(status=204, headers=HDR)
        if u.path.endswith('/dispatches'): store['disp'] += 1; return route.fulfill(status=204, headers=HDR)
        if u.path.endswith('/commits'): return route.fulfill(status=200, headers=HDR, body='[]')
        if u.path.endswith('/' + PATH) and req.method == 'GET':
            sha = hashlib.sha1(store['text'].encode()).hexdigest()
            return route.fulfill(status=200, headers=HDR, body=json.dumps({'sha': sha, 'content': base64.encodebytes(store['text'].encode()).decode()}))
        if u.path.endswith('/' + PATH) and req.method == 'PUT':
            b = json.loads(req.post_data); store['text'] = base64.b64decode(b['content']).decode(); store['puts'].append(json.loads(store['text']))
            return route.fulfill(status=200, headers=HDR, body=json.dumps({'content': {'sha': hashlib.sha1(store['text'].encode()).hexdigest()}}))
        return route.fulfill(status=404, headers=HDR, body='{}')
    p3 = br.new_page(viewport={'width': 951, 'height': 648}); p3.on('pageerror', lambda e: fail('page error: ' + str(e)[:200])); p3.route(GHB + '/**', gh)
    p3.goto(BASE + '/battle-guide.html?gh=%s#anims/%s' % (GHB, AID)); p3.wait_for_selector('#wbfx .fxc', timeout=90000); p3.wait_for_function("()=>WB.file&&WB.src==='api'", timeout=30000)
    before_live = json.loads(store['text'])['live']
    click(p3, '[data-fx=add]'); p3.wait_for_selector('.fxtile'); click(p3, '.fxtile[data-v=vfx_core_heal_cleanse]'); p3.wait_for_selector('.fxpanel')
    p3.evaluate("(sel)=>{const r=document.querySelector(sel+' input[type=range]');r.value=60;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));}", '.fxc[data-i="2"] .fxp[data-pn="healPct"]')
    click(p3, '#wbsave'); p3.wait_for_function("()=>document.getElementById('wbunsaved').innerText.includes('saved')||WB.file.draft", timeout=15000); p3.wait_for_timeout(500)
    if len(store['puts']) != 1: fail('Save draft made %d writes, expected 1' % len(store['puts']))
    else:
        d = store['puts'][0]
        if d['live'] != before_live: fail('Save draft changed the live part of the file')
        want = [e for e in before_live['effects']] + [{'fx': 'vfx_core_heal_cleanse', 'params': {'healPct': 60}}]
        if (d.get('draft') or {}).get('effects') != want: fail('the saved draft holds effects %r, expected %r' % ((d.get('draft') or {}).get('effects'), want))
        if d.get('finished') != json.loads(open(os.path.join(ROOT, PATH), encoding='utf-8').read()).get('finished'): fail('Save draft set the finished field')
        import schema
        E_, W_ = schema.validate(d, schema.ctx())
        if E_: fail('the saved file does not match the schema: %s' % E_[:3])
    if not store['disp']: fail('Save draft did not poke move-apply')
    p3.close()
    # ---------- 6. the five sizes: the section, its buttons and controls are reachable and the page does not scroll sideways ----------
    for name, w, h in SIZES:
        p2 = br.new_page(viewport={'width': w, 'height': h}); watch(p2)
        p2.goto(BASE + '/battle-guide.html#anims/' + AID); p2.wait_for_selector('#wbfx .fxc', timeout=90000)
        p2.evaluate("()=>{wbGo('effects');}"); p2.wait_for_timeout(300)
        click(p2, '#wbfx .fxc:first-child [data-fx=open]'); p2.wait_for_selector('.fxpanel'); p2.wait_for_timeout(300)
        m = p2.evaluate("""()=>{const bad=[];const els=[...document.querySelectorAll('#wbfx button,#wbfx input,#wbfx select')];
          for(const b of els){const r=b.getBoundingClientRect();if(r.width===0)continue;if(r.height<36||r.width<28)bad.push(['small',b.dataset.fx||b.className,Math.round(r.width),Math.round(r.height)]);
            if(r.right>innerWidth+1||r.left<-1)bad.push(['cut',b.dataset.fx||b.className,Math.round(r.left),Math.round(r.right)]);}
          return {bad:bad.slice(0,6),sw:document.documentElement.scrollWidth,iw:innerWidth,n:els.length,sec:!!document.getElementById('s-effects')};}""")
        if not m['sec']: fail('%s: no Effects section' % name)
        if m['bad']: fail('%s: controls too small or cut off: %s' % (name, m['bad']))
        if m['sw'] > m['iw'] + 1: fail('%s: the page scrolls sideways (%d > %d)' % (name, m['sw'], m['iw']))
        p2.evaluate("()=>{document.getElementById('s-effects').scrollIntoView();}"); p2.wait_for_timeout(300)
        p2.screenshot(path=os.path.join(OUT, 'fx-section-%s-%dx%d.png' % (name, w, h)))
        notes.append('%s %dx%d: %d controls in the first effect, none cut off' % (name, w, h, m['n']))
        p2.close()
    bad = [x for x in sent if x[0] != 'GET' or x[0] == 'OUT']
    if bad: fail('the page sent something that is not a plain read of this site: %s' % bad[:3])
    br.close()
for n in notes: print(n)
print('FAILS:', fails)
sys.exit(1 if fails else 0)
