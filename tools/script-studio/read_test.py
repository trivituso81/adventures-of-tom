"""Read Mode test. Run from repo root: python3 tools/script-studio/read_test.py (needs playwright + chromium)."""
import http.server, threading, functools, os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
H.log_message = lambda *a, **k: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/script-studio/' % srv.server_address[1]
fails = []
def check(ok, msg):
    print(('PASS ' if ok else 'FAIL ') + msg)
    if not ok: fails.append(msg)
def line(i, t, sp, tx, mood='none'): return {'id': 'l%s' % i, 'type': t, 'speaker': sp, 'mood': mood, 'text': tx, 'locked': False, 'flags': [], 'customNote': ''}
def scene(i, sid, title, loc, lines, qa=None):
    return {'id': 's%d' % i, 'sceneId': sid, 'title': title, 'mapId': '', 'location': loc, 'requiredSpeakers': [], 'mandatoryBeats': [], 'knowledgeGate': '', 'physicalSegue': '',
            'triggers': {'combatEncounter': '', 'textMessageBeat': '', 'closeupScreen': ''},
            'sliders': {'humorDensity': 7, 'banterSpeed': 8, 'groundedVsGoofy': 6, 'sentimentWarmth': 3, 'minLines': 4, 'maxLines': 8, 'directorNotes': ''},
            'lines': lines, 'history': [], **({'qa': qa} if qa else {})}
S1 = scene(1, 'ch1_a', 'The Door', 'Rivituso House', [
    line(1, 'action', 'Narrator', 'Boppy squints at the sign.'),
    line(2, 'dialogue', 'Boppy', "I don't trust a door this early.", 'grumpy'),
    line(3, 'dialogue', 'TNB', "It's just a door."),
    line(6, 'action', 'Narrator', 'If the party loses, the screen fades to a gray kitchen.')], {'passed': True, 'score': 9, 'retries': 1, 'notes': [], 'issues': [], 'at': 'x'})
S2 = scene(2, 'ch1_b', 'The Lamp', 'Kitchen', [line(4, 'dialogue', 'Grace', 'Rose is on the lamp.'), line(5, 'dialogue', 'Amy', 'Get down, please.')],
           {'passed': False, 'score': 6, 'retries': 2, 'notes': ['L2 (Amy) Voice [high]: flat'], 'issues': [], 'at': 'x'})
chs = [{'id': 'ch%d' % i, 'number': i, 'label': 'Chapter %d' % i, 'title': 'Chapter %d' % i, 'purpose': '', 'disabledBannedWords': [], 'scenes': [S1, S2] if i == 1 else []} for i in range(1, 22)]
seed = {'activeChapterId': 'ch1', 'activeSceneId': 's1', 'settings': {'apiKey': 'k'}, 'chapters': chs}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 900}).new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.setItem('aot_script_studio_state_v2', %s);sessionStorage.setItem('__s','1')}" % json.dumps(json.dumps(seed)))
    pg.goto(URL); pg.wait_for_timeout(800)
    pg.get_by_text('2. Scene Studio').click(); pg.wait_for_timeout(500)
    check(pg.get_by_test_id('mode-edit').count() == 1 and pg.get_by_test_id('mode-read').count() == 1, 'Edit Mode | Read Mode toggle in the header')
    check(pg.locator('textarea').count() > 0, 'edit mode has editing controls')
    pg.get_by_test_id('mode-read').click(); pg.wait_for_timeout(300)
    check(pg.locator('textarea').count() == 0 and pg.locator('select:visible').count() == 0 and pg.locator('input:visible').count() == 0 and pg.locator('aside').count() == 0, 'read mode hides textareas, dropdowns, inputs and sidebars')
    check(pg.get_by_test_id('read-scene').count() == 1, 'Current Scene shows one scene')
    txt = pg.get_by_test_id('read-view').inner_text()
    check('Narrator' not in txt and 'BOPPY' in txt.upper() and '(grumpy)' in txt and '(none)' not in txt, 'no Narrator label, speaker and mood shown, no (none)')
    check('Rivituso House' in txt and 'ch1_a' in txt, 'scene header shows id and location')
    check('QA: 9/10' in txt and pg.get_by_test_id('read-qa-notes').count() == 0, 'compact QA pill, notes collapsed')
    pg.get_by_test_id('read-qa-pill').click(); pg.wait_for_timeout(150)
    check(pg.get_by_test_id('read-qa-notes').count() == 1, 'clicking the pill expands the notes')
    check(pg.evaluate("[...document.querySelectorAll('[data-testid=read-line] .italic')].length") == 2, 'action lines are italic prose')
    check(pg.evaluate("document.querySelector('[data-testid=read-line] .uppercase') !== null && getComputedStyle(document.querySelector('[data-testid=read-line] .uppercase')).textTransform === 'uppercase'"), 'speaker name is uppercase bold')
    br = pg.get_by_test_id('read-branch')
    check(br.count() == 1 and '[IF PARTY LOSES]' in br.inner_text(), 'conditional action line is badged [IF PARTY LOSES]: %s' % br.inner_text().replace('\n', ' '))
    check(pg.evaluate("parseFloat(getComputedStyle(document.querySelector('[data-testid=read-branch]')).marginLeft) > 10"), 'conditional block is indented')
    pg.get_by_role('button', name='Full Chapter').click(); pg.wait_for_timeout(300)
    check(pg.get_by_test_id('read-scene').count() == 2, 'Full Chapter shows both scenes continuously')
    full = pg.get_by_test_id('read-view').inner_text()
    check('Kitchen' in full and 'QA: 6/10' in full, 'second scene header has location and its QA pill')
    pg.screenshot(path='/tmp/read-mode.png')
    pg.get_by_test_id('read-line').nth(5).click(); pg.wait_for_timeout(700)
    check(pg.get_by_test_id('read-view').count() == 0 and pg.locator('textarea').count() > 0, 'clicking a line returns to Edit Mode')
    sc = pg.evaluate("document.getElementById('line-card-1') && document.getElementById('line-card-1').getBoundingClientRect().top")
    ta = pg.locator('#line-card-1 textarea').input_value()
    check(ta == 'Get down, please.', 'it opened the clicked line of the clicked scene (%r)' % ta)
    check(sc is not None and 0 <= sc <= 900, 'the line is scrolled into view (top=%s)' % sc)
    check(not errs, 'no page errors %s' % errs)
    b.close()
srv.shutdown()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
