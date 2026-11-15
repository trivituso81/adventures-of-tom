#!/usr/bin/env python3
"""Script Editor test (Script Editor steps 2 to 4 and 6). Run from the repo root:  python3 tools/script_editor_test.py /tmp/se
Loads script.html in portrait, landscape and desktop; edits ch2Starter through the real controls (reword, remove, reorder, add a line, a silent beat,
a mood, a pause); checks the Copy text; then presses PLAY and checks the real game says the edited lines in the edited order. Prints FAILS: [] when all pass."""
import os, sys, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/se'; os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def check(name, ok, extra=''):
    print(('ok   ' if ok else 'FAIL ') + name, extra if not ok else '', flush=True)
    if not ok: fails.append(name)
SC = 'ch2Starter'
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    ctx = br.new_context(viewport={'width': 430, 'height': 860}); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/script.html'); pg.wait_for_function('()=>window.__SCRIPT_READY', timeout=60000)
    pg.screenshot(path=f'{OUT}/01-list-portrait.png')
    pg.set_viewport_size({'width': 860, 'height': 430}); pg.screenshot(path=f'{OUT}/02-list-landscape.png')
    pg.set_viewport_size({'width': 1280, 'height': 900}); pg.screenshot(path=f'{OUT}/03-list-desktop.png')
    pg.set_viewport_size({'width': 430, 'height': 860})
    pg.click('[data-ch="2"]'); pg.click(f'[data-scene="{SC}"]'); pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/04-scene-portrait.png')
    n = pg.evaluate("()=>document.querySelectorAll('#sc-%s .row').length" % SC); check('scene shows its 11 lines', n == 11, n)
    # copy text, words only
    txt = pg.evaluate("(id)=>sceneText(id,false)", SC)
    check('copy text has speaker lines', 'TOM: Which songs?' in txt and 'TNB: ' in txt and 'Scene: ' in txt, txt[:200])
    check('copy has no key', '|' not in txt)
    # 1. reword "Which songs?"
    pg.click(f'#sc-{SC} .row:has-text("Which songs?") .tx'); ta = pg.locator('textarea.tx'); ta.fill("Which songs, exactly?"); pg.click('[data-done]'); pg.wait_for_timeout(200)
    check('reworded line shows', pg.locator(f'#sc-{SC} .row:has-text("Which songs, exactly?")').count() == 1)
    check('recorded warning shows', pg.locator('text=silences the recording').count() >= 1)
    # 2. remove the Bohemian line
    pg.click(f'#sc-{SC} .row:has-text("Bohemian") [data-del]'); pg.wait_for_timeout(200)
    check('removed line is struck', pg.locator(f'#sc-{SC} .row.rm').count() == 1)
    # 3. move "Another One" line up above "Which songs, exactly?"
    pg.click(f'#sc-{SC} .row:has-text("Another One Bites") [data-mv^="up"]'); pg.wait_for_timeout(200)
    order = pg.evaluate("(id)=>flat(view(id),0,[]).filter(r=>r.o&&r.o.refs&&!r.o.rm).map(r=>r.o.lines[0].slice(0,18))", SC)
    ia_ = next((i for i, x in enumerate(order) if x.startswith('"Another One')), -1); iw_ = next((i for i, x in enumerate(order) if x.startswith('Which songs')), -1)
    check('move changed the order', 0 <= ia_ < iw_, order)
    # 4. add a line after "Another One" and a silent beat, change a mood, set a pause
    pg.click(f'#sc-{SC} .row:has-text("Another One Bites") [data-panel]'); pg.wait_for_timeout(150)
    pg.screenshot(path=f'{OUT}/05-panel.png')
    pg.click(f'#sc-{SC} [data-addafter]'); pg.wait_for_timeout(200)
    pg.locator('textarea.tx').fill("Nara just barked in harmony."); pg.click('[data-done]'); pg.wait_for_timeout(200)
    check('added line shows', pg.locator(f'#sc-{SC} .row:has-text("Nara just barked in harmony.")').count() == 1)
    pg.click(f'#sc-{SC} .row:has-text("Another One Bites") [data-panel]'); pg.click(f'#sc-{SC} [data-beatafter]'); pg.wait_for_timeout(200)
    check('silent beat shows', pg.locator(f'#sc-{SC} .beat').count() == 1)
    pg.click(f'#sc-{SC} .row:has-text("Babe. That") [data-panel]'); pg.wait_for_timeout(150)
    pg.click(f'#sc-{SC} [data-pickmood]'); pg.wait_for_timeout(200); pg.screenshot(path=f'{OUT}/06-moodsheet.png'); pg.click('button[data-pm="angry"]'); pg.wait_for_timeout(200)
    check('mood changed to angry', pg.locator(f'#sc-{SC} .tag.chg:has-text("angry")').count() == 1)
    # a reaction on the reworded Tom line: TNB looks surprised when the line reaches "songs"
    pg.click(f'#sc-{SC} .row:has-text("Which songs, exactly?") [data-panel]'); pg.wait_for_timeout(150)
    pg.click(f'#sc-{SC} .row:has-text("Which songs, exactly?") [data-radd]'); pg.wait_for_timeout(150); pg.click('button[data-pm="TNB"]'); pg.wait_for_timeout(200); pg.click('button[data-pm="surprised"]'); pg.wait_for_timeout(200)
    pg.click(f'#sc-{SC} .row:has-text("Which songs, exactly?") [data-rcue]'); pg.wait_for_timeout(150); pg.screenshot(path=f'{OUT}/06b-cue.png')
    pg.click(f'#sc-{SC} .row:has-text("Which songs, exactly?") [data-cuew$="|2"]'); pg.wait_for_timeout(200)
    rs = json.loads(pg.evaluate("()=>JSON.stringify(DRAFT.scenes.%s.lines['Tom|Which songs?'].react)" % SC)); check('reaction saved with a cue word', rs and rs[0][0] == 'tnb' and rs[0][1] == 'surprised' and rs[0][2] == "songs", rs)
    pg.click(f'#sc-{SC} .row:has-text("Which songs, exactly?") [data-panel]')
    pg.click(f'#sc-{SC} .row:has-text("Babe. That") [data-panel]'); pg.wait_for_timeout(150)
    pg.select_option(f'#sc-{SC} [data-pre]', '1'); pg.wait_for_timeout(200)
    check('pause shows', pg.locator(f'#sc-{SC} .tag:has-text("pause before 1")').count() == 1)
    pg.screenshot(path=f'{OUT}/07-edited-portrait.png')
    st = pg.evaluate("(id)=>JSON.stringify(DRAFT.scenes[id])", SC); print('state', st[:600])
    check('edits saved on the phone', bool(json.loads(pg.evaluate("()=>localStorage.getItem('aot-script-draft')"))['scenes'].get(SC)))
    txt2 = pg.evaluate("(id)=>sceneText(id,true)", SC)
    check('copy matches edits', 'Which songs, exactly?' in txt2 and 'Bohemian' not in txt2 and 'Nara just barked in harmony.' in txt2 and 'silent beat' in txt2 and '(angry)' in txt2 and 'Pause 1 seconds' in txt2, txt2)
    # 5. what the game's overlay produces
    pg.screenshot(path=f'{OUT}/08-full.png', full_page=False)
    # Play: the real game with the edits applied
    pg.click(f'[data-play="{SC}"]'); pg.wait_for_function('()=>window.__LE&&window.__LE.playScene&&window.__LE.chapterJump', timeout=180000)
    pg.wait_for_function('()=>typeof dialog!=="undefined"&&dialog.active', timeout=60000)
    seen = []; last = None; moods = []; t = 0
    while t < 120:
        pg.wait_for_timeout(200); t += .2
        st = pg.evaluate("()=>({d:dialog.active,n:dialog.name,i:dialog.index,txt:dialog.active?dialog.lines[dialog.index]:'',typed:dialog.active&&dialog.shown>=dialog.chars.length,a:intro.active,w:intro.wait})")
        if st['d']:
            k = (st['n'], st['i'], st['txt'])
            if k != last:
                seen.append(st['n'] + ': ' + st['txt']); last = k
                if len(seen) in (3, 4): pg.screenshot(path=f'{OUT}/09-play-{len(seen)}.png')
            if st['typed']:
                if st['txt'] == 'Which songs, exactly?':
                    pg.wait_for_timeout(1800); li = pg.evaluate("()=>EMO.listeners.map(a=>a.scenePose&&a.scenePose.f)"); check('listener reacts at the cue (TNB surprised)', 'em_surprised' in li, li); pg.screenshot(path=f'{OUT}/10-reaction.png')
                if st['txt'] == 'Nara just barked in harmony.':
                    pg.wait_for_timeout(1200); src = pg.evaluate("()=>[...document.querySelectorAll('#dialog img')].map(i=>i.src).join(' ')"); check('mood face on the added line is angry', 'angry' in src, src); pg.screenshot(path=f'{OUT}/11-angry.png')
                pg.wait_for_timeout(350); pg.evaluate("()=>advanceDialog()")
        elif not st['a'] and seen: break
    print(*seen, sep='\n')
    texts = [s.split(': ', 1)[1] for s in seen]
    check('game plays the reworded line', 'Which songs, exactly?' in texts, texts)
    check('game skips the removed line', not any('Bohemian' in x for x in texts))
    check('game plays the added line', 'Nara just barked in harmony.' in texts)
    ia = next((i for i, x in enumerate(texts) if x.startswith('"Another One')), -1); iw = texts.index('Which songs, exactly?') if 'Which songs, exactly?' in texts else -1
    check('game plays the moved line first', 0 <= ia < iw, (ia, iw))
    check('added line follows the moved line', texts.index('Nara just barked in harmony.') == ia + 1 if 'Nara just barked in harmony.' in texts and ia >= 0 else False)
    check('overlay wrapped only the edited scene', pg.evaluate("()=>Object.keys(SE.orig)") == [SC], pg.evaluate("()=>Object.keys(SE.orig)"))
    # a game with no edits is unchanged
    pg2 = ctx.new_page(); pg2.goto(f'http://127.0.0.1:{port}/script.html'); pg2.evaluate("()=>localStorage.removeItem('aot-script-draft')")
    pg2.goto(f'http://127.0.0.1:{port}/index.html'); pg2.wait_for_function('()=>window.__LE&&window.__LE.playScene', timeout=180000); pg2.wait_for_timeout(800)
    check('no edits: nothing wrapped', pg2.evaluate("()=>Object.keys(SE.orig).length")==0)
    check('no edits: scene is the original array', pg2.evaluate("()=>Array.isArray(SCENES.ch2Starter)||typeof SCENES.ch2Starter==='function'"))
    check('no page errors', not errs, errs[:3])
    br.close()
print('FAILS:', fails)
