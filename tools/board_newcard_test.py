#!/usr/bin/env python3
"""newcard1 test: python3 tools/board_newcard_test.py [outdir]
Drives board.html through the stub GitHub at phone (390 x 844) and wide (1440 x 900) sizes:
- sizeIdea gives the model and effort of claude/handoff-rules.md for a table of sample ideas (rows A to E, each effort level);
- + New card opens a form; typing shows the card name, theme, model and effort before anything is saved;
- Create card saves a complete Claude card (tag, prompt with no blank, his words in the history) that tools/board_check.py accepts;
- a Sonnet 5.5 medium idea starts by itself (auto and start) unless the box is unticked; other sizes show Copy prompt with the model and effort;
- a model picked by hand is saved as his choice; a browser with no token saves nothing and says why.
Saves pictures in outdir. Prints FAILS: []."""
import base64, json, os, subprocess, sys, tempfile, urllib.request
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from board_shots import Rig, test_board, isoz, INIT
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/board_newcard'; os.makedirs(out, exist_ok=True)
fails = []
def check(name, ok, detail=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(detail)[:400]))
    if not ok: fails.append(name)

SIZES = [   # idea, model, effort, theme
    ('New feature idea: a photo mode where I can hide the menus and take a picture of the family', 'Claude Sonnet 5.5', 'high', 'Game Shell'),
    ('Add a button on the board to archive old conversations', 'Claude Sonnet 5.5', 'medium', 'Tools'),
    ('I want a new tool in admin that lists every unused picture', 'Claude Sonnet 5.5', 'high', 'Tools'),
    ('The game crashes sometimes when I open the shop and I am not sure why', 'Claude Sonnet 5.5', 'high', None),
    ('Make the D-pad a little bigger', 'Claude Sonnet 5.5', 'medium', 'Game Shell'),
    ('What does the Stampcard do?', 'Claude Haiku 5.5', 'low', None),
    ('Why is Boppy in chapter 3', 'Claude Haiku 5.5', 'low', None),
    ('Merge my voice takes', 'Claude Sonnet 5.5', 'medium', 'Voice Clips'),
    ('Install the approved kitchen pictures', 'Claude Sonnet 5.5', 'medium', 'Areas'),
    ("Grace's joke about the violin in chapter 2 is not funny, make it sharper", 'Claude Opus 5.5', 'medium', 'Story and Dialogue'),
    ('Rewrite the whole chapter 4 script from scratch with more banter', 'Claude Opus 5.5', 'high', 'Story and Dialogue'),
    ("Rose's hero pose should have her lamby", 'Claude Opus 5.5', 'medium', 'Characters'),
    ('Rework the battle system rules so fights are shorter', 'Claude Fable 5.2', 'high', 'Battle System'),
    ('Use Fable to plan a small follow-up to the story', 'Claude Fable 5.2', 'medium', None),
    ('A fishing minigame with Boppy at Cattail Pier', 'Claude Sonnet 5.5', 'high', None),
]
b = test_board(extra=False)
b['routines'] = [{'id': 'sonnet-medium', 'model': 'Claude Sonnet 5.5', 'effort': 'medium', 'env': 'SONNET_MEDIUM', 'enabled': True}]
N0 = len(b['cards'])
ENV = {'STUB_COMMIT_AT': isoz(30), 'STUB_RUNS': json.dumps([{'conclusion': 'success', 'updated_at': isoz(12)}])}
rig = None
def saved_doc():
    j = json.load(urllib.request.urlopen(rig.url.split('?gh=')[1] + '/repos/trivituso81/adventures-of-tom/contents/data/board.json'))
    return json.loads(base64.b64decode(j['content']))
def make(pg, text, shot=None):
    pg.click('#newb'); pg.wait_for_selector('#nctxt', state='visible'); pg.fill('#nctxt', text); pg.wait_for_timeout(150)
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for name, (w, h) in (('phone', (390, 844)), ('wide', (1440, 900))):
            if rig: rig.stop()
            rig = Rig(b, 8087 if name == 'phone' else 8089, ENV)
            ctx = br.new_context(viewport={'width': w, 'height': h}); pg = ctx.new_page(); pg.add_init_script(INIT)
            pg.goto(rig.url); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(600)
            if name == 'phone':
                for text, model, effort, theme in SIZES:
                    z = pg.evaluate('t=>window.__board.sizeIdea(t)', text)
                    check(f'size: {text[:44]} -> {model[7:]}, {effort}', z['model'] == model and z['effort'] == effort and (theme is None or z['theme'] == theme), z)
                    check(f'title: {text[:44]}', 0 < len(z['title']) <= 60 and '<' not in z['title'], z['title'])
            check(f'{name}: + New card is on the page and it does not scroll sideways', pg.is_visible('#newb') and pg.evaluate('document.documentElement.scrollWidth') <= w)
            pg.screenshot(path=f'{out}/{name}-page.png')
            # 1) a feature idea: Sonnet high, not auto, Copy prompt
            pg.click('#newb'); pg.wait_for_selector('#nctxt', state='visible')
            check(f'{name}: nothing is sized before he types', not pg.is_visible('#ncsize') and pg.is_visible('#nchint'))
            pg.click('#ncgo'); check(f'{name}: empty idea is refused', 'Type your idea first' in pg.inner_text('#serr'))
            idea = 'New feature idea: a photo mode where I can hide the menus <and> take a picture of the family. It should work in "landscape" too'
            pg.fill('#nctxt', idea); pg.wait_for_timeout(200)
            check(f'{name}: the size shows as he types', pg.inner_text('#ncbig') == 'Sonnet 5.5, effort high', pg.inner_text('#ncbig'))
            check(f'{name}: the card name shows', pg.inner_text('#nctitle').startswith('A photo mode where I can hide the menus'), pg.inner_text('#nctitle'))
            check(f'{name}: no auto-start box for a size START cannot run', not pg.is_visible('#ncautorow'))
            pg.screenshot(path=f'{out}/{name}-form.png')
            pg.click('#ncgo'); pg.wait_for_selector('#sheet[data-kind=made]'); pg.wait_for_timeout(200)
            pg.screenshot(path=f'{out}/{name}-made.png')
            d = saved_doc(); c = d['cards'][-1]
            check(f'{name}: one card was added', len(d['cards']) == N0 + 1, len(d['cards']))
            check(f'{name}: it is a Claude card, Up next, with an idea- tag', c['lane'] == 'claude' and c['col'] == 'up' and c['tag'].startswith('idea-') and c['id'] == 'c-' + c['tag'], (c['id'], c['tag']))
            check(f'{name}: model and effort with their reasons', c['prompt']['model'].startswith('Claude Sonnet 5.5 (row C:') and c['prompt']['effort'].startswith('high ('), c['prompt'])
            check(f'{name}: his words are in the prompt and the history, with no blank', 'photo mode' in c['prompt']['text'] and '<' not in json.dumps(c['prompt']) and 'photo mode' in c['history'][0]['t'])
            check(f'{name}: the prompt claims the card and ends with the permission line', ('board: start ' + c['id']) in c['prompt']['text'] and c['prompt']['text'].endswith('You have my full permission to access the repo.'))
            check(f'{name}: not auto-started', not c.get('auto') and not c.get('start'))
            check(f'{name}: the made screen shows the size and Copy prompt', 'Sonnet 5.5, effort high' in pg.inner_text('#sheet') and pg.is_visible(f'#sheet [data-act=copy][data-id="{c["id"]}"]'))
            pg.click('#bdone'); pg.wait_for_timeout(200)
            pg.click('#tabs [data-view=claude]'); pg.wait_for_timeout(200)
            check(f'{name}: the card is in the Claude view', pg.query_selector(f'.card[data-id="{c["id"]}"]') is not None)
            # 2) the same idea again gets its own tag
            make(pg, idea); pg.click('#ncgo'); pg.wait_for_selector('#sheet[data-kind=made]'); pg.click('#bdone')
            c2 = saved_doc()['cards'][-1]
            check(f'{name}: a second card with the same name gets its own id', c2['id'] != c['id'] and c2['tag'] == c['tag'] + '-2', c2['id'])
            # 3) a Sonnet medium idea starts by itself
            make(pg, 'Make the D-pad a little bigger')
            check(f'{name}: the auto-start box shows, ticked', pg.is_visible('#ncautorow') and pg.is_checked('#ncauto'))
            pg.click('#ncgo'); pg.wait_for_selector('#sheet[data-kind=made]')
            c3 = saved_doc()['cards'][-1]
            check(f'{name}: Sonnet medium is saved with auto and start', c3.get('auto') is True and c3.get('start') is True and 'starts it by itself' in c3['next'], c3)
            check(f'{name}: the made screen says it starts by itself', 'starts this by itself' in pg.inner_text('#sheet') and not pg.query_selector('#sheet [data-act=copy]'))
            pg.click('#bdone')
            # 4) unticked: saved without start, START offered
            make(pg, 'Make the A button a little bigger'); pg.uncheck('#ncauto'); pg.click('#ncgo'); pg.wait_for_selector('#sheet[data-kind=made]')
            c4 = saved_doc()['cards'][-1]
            check(f'{name}: unticked saves no start and offers START', not c4.get('start') and not c4.get('auto') and pg.is_visible('#sheet [data-act=start]'), c4.get('start'))
            pg.click('#bdone')
            # 5) his own model choice
            make(pg, 'Make the pause menu music quieter'); pg.evaluate("document.getElementById('ncchg').open=true"); pg.select_option('#ncmo', 'Claude Opus 5.5'); pg.wait_for_timeout(150)
            check(f'{name}: a picked model shows at once', pg.inner_text('#ncbig') == 'Opus 5.5, effort medium', pg.inner_text('#ncbig'))
            pg.fill('#nctxt', 'Make the pause menu music quieter please'); pg.wait_for_timeout(150)
            check(f'{name}: typing more keeps his pick', pg.inner_text('#ncbig') == 'Opus 5.5, effort medium')
            if name == 'phone': pg.screenshot(path=f'{out}/{name}-form-change.png')
            pg.click('#ncgo'); pg.wait_for_selector('#sheet[data-kind=made]'); pg.click('#bdone')
            c5 = saved_doc()['cards'][-1]
            check(f'{name}: the pick is saved as his choice', c5['prompt']['model'].startswith('Claude Opus 5.5 (your choice on the board; the rules said Sonnet 5.5'), c5['prompt']['model'])
            # the saved board passes the board check
            tf = os.path.join(tempfile.mkdtemp(), 'board.json'); json.dump(saved_doc(), open(tf, 'w'), indent=1)
            r = subprocess.run([sys.executable, os.path.join(HERE, 'board_check.py'), tf], capture_output=True, text=True)
            check(f'{name}: tools/board_check.py accepts the saved board', r.returncode == 0, r.stdout[-400:])
            ctx.close()
        # no token: nothing saves
        ctx = br.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
        pg.goto(rig.site); pg.wait_for_selector('.card >> visible=true'); pg.wait_for_timeout(400)
        n = len(saved_doc()['cards'])
        pg.click('#newb'); pg.wait_for_selector('#nctxt', state='visible'); pg.fill('#nctxt', 'A photo mode'); pg.click('#ncgo'); pg.wait_for_timeout(300)
        check('no token: the form says this browser cannot save and nothing is saved', 'no GitHub token' in pg.inner_text('#sheet') and len(saved_doc()['cards']) == n)
        pg.screenshot(path=f'{out}/phone-notoken.png')
        ctx.close(); br.close()
finally:
    if rig: rig.stop()
print('pictures in', out); print('FAILS:', fails)
sys.exit(1 if fails else 0)
