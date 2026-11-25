"""EP Note test (mocked Gemini). Run from repo root: python3 tools/script-studio/epnote_test.py"""
import http.server, threading, functools, os, sys, json, time
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
def line(i, t, sp, tx): return {'id': 'l%s' % i, 'type': t, 'speaker': sp, 'mood': 'none', 'text': tx, 'locked': False, 'flags': [], 'customNote': ''}
def mk_scene(lines):
    return {'id': 's1', 'sceneId': 'ch1_a', 'title': 'The Door', 'mapId': '', 'location': 'House', 'requiredSpeakers': ['Boppy', 'TNB'], 'mandatoryBeats': ['BEAT_A'], 'knowledgeGate': '', 'physicalSegue': '',
            'triggers': {'combatEncounter': '', 'textMessageBeat': '', 'closeupScreen': ''},
            'sliders': {'humorDensity': 7, 'banterSpeed': 8, 'groundedVsGoofy': 6, 'sentimentWarmth': 3, 'minLines': 3, 'maxLines': 6, 'directorNotes': ''},
            'lines': lines, 'history': []}
GOOD = [line(1, 'action', 'Narrator', 'Boppy squints at the sign.'), line(2, 'dialogue', 'Boppy', "I don't trust a door this early."), line(3, 'dialogue', 'TNB', "It's just a door, Boppy.")]
NOTE = 'Make Boppy blame the pepper from lunch'
def chs(lines):
    return [{'id': 'ch%d' % i, 'number': i, 'label': 'Chapter %d' % i, 'title': 'Chapter %d' % i, 'purpose': '', 'disabledBannedWords': [], 'scenes': [mk_scene(lines)] if i == 1 else []} for i in range(1, 22)]
def session(lines, action, note):
    prompts = []; crit = {'n': 0}
    def handler(route):
        body = json.loads(route.request.post_data); prompt = body['contents'][0]['parts'][0]['text']
        def ok(t): route.fulfill(status=200, content_type='application/json', body=json.dumps({'candidates': [{'content': {'parts': [{'text': t}]}}]}))
        prompts.append(prompt)
        if 'Write ONE scene as a plain-text script' in prompt: ok('ACTION: x')
        elif 'Convert this plain-text scene script' in prompt: ok(json.dumps({'lines': [{'type': l['type'], 'speaker': l['speaker'], 'mood': 'none', 'text': l['text']} for l in GOOD]}))
        elif 'Showrunner reviewing' in prompt:
            crit['n'] += 1
            ok(json.dumps({'pass': crit['n'] > 1, 'score': 9 if crit['n'] > 1 else 6, 'issues': [] if crit['n'] > 1 else [{'lineIndex': 2, 'speaker': 'Boppy', 'category': 'Comedy', 'severity': 'medium', 'problem': 'flat', 'fix': 'sharper'}]}))
        elif 'Your draft failed QA' in prompt: ok(json.dumps({'lines': [{'type': 'dialogue', 'speaker': 'Boppy', 'mood': 'none', 'text': 'Nobody opens a door this early unless it is a trap.'} if i == 1 else {'type': l['type'], 'speaker': l['speaker'], 'mood': 'none', 'text': l['text']} for i, l in enumerate(GOOD)]}))
        elif 'SURGICAL REWRITE' in prompt: ok(json.dumps({'patches': [{'lineNumber': 2, 'type': 'dialogue', 'speaker': 'Boppy', 'mood': 'none', 'text': 'Pepper again. It is always the pepper.'}]}))
        else: route.fulfill(status=500, body='unexpected')
    seed = {'activeChapterId': 'ch1', 'activeSceneId': 's1', 'settings': {'apiKey': 'k'}, 'chapters': chs(lines)}
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 900}).new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.setItem('aot_script_studio_state_v2', %s);sessionStorage.setItem('__s','1')}" % json.dumps(json.dumps(seed)))
        pg.route('**/generativelanguage.googleapis.com/**', handler)
        pg.goto(URL); pg.wait_for_timeout(800); pg.get_by_text('2. Scene Studio').click(); pg.wait_for_timeout(500)
        box = pg.get_by_test_id('ep-note')
        out = {'present': box.count() == 1, 'next_to': pg.evaluate("(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Rewrite/.test(x.textContent));const i=document.querySelector('[data-testid=ep-note]');return b&&i&&b.nextElementSibling===i})()")}
        if note: box.fill(note)
        pg.get_by_role('button', name=action).click()
        for _ in range(300):
            pg.wait_for_timeout(50)
            if pg.evaluate("!document.body.innerText.match(/Drafting|QA check|Auto-fixing|Rewriting|Compiling/)") and len(prompts) >= 1 and pg.evaluate("document.querySelectorAll('textarea').length") > 0: break
        pg.wait_for_timeout(500)
        out['after'] = box.input_value(); out['errs'] = errs; out['prompts'] = prompts
        b.close()
    return out
TOP = 'TOP PRIORITY INSTRUCTION FROM THE EXECUTIVE PRODUCER'
o = session([], 'Generate Scene', NOTE)
check(o['present'] and o['next_to'], 'EP Note input sits right next to the Rewrite button')
writer = [p for p in o['prompts'] if 'Write ONE scene' in p]
check(writer and writer[0].startswith(TOP) and NOTE in writer[0].split('\n')[0], 'Generate Scene: the note is the very first line of the Writer prompt')
rw = [p for p in o['prompts'] if 'Your draft failed QA' in p]
check(rw and rw[0].startswith(TOP) and NOTE in rw[0], 'auto-fix rewrite prompt carries the note too')
check(not any(TOP in p for p in o['prompts'] if 'Convert this plain-text' in p or 'Showrunner reviewing' in p), 'formatter and critic prompts do not get the note')
check(o['after'] == '', 'box is cleared after Generate Scene')
o = session([], 'Generate Scene', '')
check(not any(TOP in p for p in o['prompts']), 'no note typed: no EP line in any prompt')
o = session(GOOD, 'Rewrite Unlocked', NOTE)
sg = [p for p in o['prompts'] if 'SURGICAL REWRITE' in p]
check(sg and sg[0].startswith(TOP) and NOTE in sg[0].split('\n')[0], 'Rewrite Unlocked: the note is the first line of the prompt')
check(o['after'] == '', 'box is cleared after Rewrite Unlocked')
check(not o['errs'], 'no page errors %s' % o['errs'])
srv.shutdown()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
