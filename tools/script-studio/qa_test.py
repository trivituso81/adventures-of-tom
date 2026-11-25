"""Generate Scene QA pipeline test with a mocked Gemini API. Run from repo root: python3 tools/script-studio/qa_test.py (needs playwright + chromium)."""
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

def L(t, sp, tx, mood='none'): return {'type': t, 'speaker': sp, 'mood': mood, 'text': tx}
BAD = [
    L('action', 'Narrator', 'Boppy squints at the sign. "I do not like this one bit," he says.'),
    L('dialogue', 'Boppy', 'It is a lifesaver that nobody asked me, Tommy, and I will not pretend otherwise — ever.'),
    L('dialogue', 'TNB', 'Wow, the WELCOME COMMITTEE is here!'),
    L('dialogue', 'Grace', 'Tata, Rosie is jumping on the amber lamp again, and she is being aggressively silly today.'),
]
GOOD = [
    L('action', 'Narrator', 'Boppy squints at the sign, then at his stomach, then at the sign again.'),
    L('dialogue', 'Boppy', "I don't trust a door that's open this early, and my stomach agrees with me."),
    L('dialogue', 'TNB', "Huh. I think it's just a door, Boppy. A very welcoming one, though."),
    L('dialogue', 'Grace', "Cozy Rosie is jumping on the lamp again, and she's wearing Lamby like a hat."),
]

def run(scenario):
    reqs = []
    state = {'critic': 0, 'rewrites': 0}
    def handler(route):
        body = json.loads(route.request.post_data)
        prompt = body['contents'][0]['parts'][0]['text']
        time.sleep(0.25)
        gc = body['generationConfig']
        def ok(text): route.fulfill(status=200, content_type='application/json', body=json.dumps({'candidates': [{'content': {'parts': [{'text': text}]}}]}))
        if 'Write ONE scene as a plain-text script' in prompt:
            reqs.append(('draft', gc, prompt)); ok('ACTION: Boppy squints.\nBOPPY: It is a lifesaver.')
        elif 'Convert this plain-text scene script' in prompt:
            reqs.append(('format', gc, prompt)); ok(json.dumps({'lines': BAD}))
        elif 'Showrunner reviewing' in prompt:
            reqs.append(('critic', gc, prompt)); state['critic'] += 1
            good = (scenario == 'fix1' and state['critic'] >= 2) or (scenario == 'fixlater' and state['rewrites'] >= 3)
            ok(json.dumps({'pass': good, 'score': 9 if good else 6, 'issues': [] if good else [{'lineIndex': 2, 'speaker': 'Boppy', 'category': 'Voice', 'problem': 'Not funny and not Boppy.', 'fix': 'Anchor it in his stomach complaint.'}]}))
        elif 'Your draft failed QA' in prompt:
            redo = 'YOUR LAST ATTEMPT FAILED' in prompt
            reqs.append(('redo' if redo else 'rewrite', gc, prompt))
            if not redo: state['rewrites'] += 1
            ok(json.dumps({'lines': GOOD if scenario == 'fix1' or (scenario == 'fixlater' and state['rewrites'] >= 3) else BAD}))
        else:
            route.fulfill(status=500, body='unexpected prompt')
    seed = {
        'activeChapterId': 'ch1', 'activeSceneId': 's1',
        'settings': {'apiKey': 'test-key'},
        'chapters': [{'id': 'ch%d' % i, 'number': i, 'label': 'Chapter %d' % i, 'title': 'Chapter %d' % i, 'purpose': '', 'disabledBannedWords': [],
            'scenes': [{'id': 's1', 'sceneId': 'ch1_s1', 'title': 'Door', 'mapId': '', 'location': 'Rivituso House', 'requiredSpeakers': ['Boppy', 'TNB', 'Grace'],
                'mandatoryBeats': ['Boppy distrusts the open door'], 'knowledgeGate': 'Nobody knows about the gold coin yet.', 'physicalSegue': '',
                'triggers': {'combatEncounter': '', 'textMessageBeat': '', 'closeupScreen': ''},
                'sliders': {'humorDensity': 7, 'banterSpeed': 8, 'groundedVsGoofy': 6, 'sentimentWarmth': 3, 'minLines': 4, 'maxLines': 8, 'directorNotes': 'Keep it dry.'},
                'lines': [], 'history': []}] if i == 1 else []} for i in range(1, 22)],
    }
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 900}).new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script('''window.__seen=[];new MutationObserver(()=>{for(const el of document.querySelectorAll("span.font-medium")){const t=el.textContent;if(/Drafting|QA check|Auto-fixing|Formatting/.test(t)&&!window.__seen.includes(t))window.__seen.push(t)}}).observe(document,{childList:true,subtree:true,characterData:true});''')
        pg.route('**/generativelanguage.googleapis.com/**', handler)
        pg.goto(URL)
        pg.evaluate('s => localStorage.setItem("aot_script_studio_state_v2", JSON.stringify(s))', seed)
        pg.reload(); pg.get_by_text('2. Scene Studio').click(); pg.wait_for_timeout(1500)
        pg.get_by_role('button', name='Generate Scene').click()
        for _ in range(600):
            if pg.locator('details summary').count(): break
            pg.wait_for_timeout(50)
        seen = set(pg.evaluate('window.__seen'))
        pg.wait_for_timeout(300)
        summary = pg.locator('details summary').first.inner_text()
        pg.screenshot(path='/tmp/studio-qa-%s.png' % scenario)
        pg.locator('details summary').first.click(); pg.wait_for_timeout(200)
        detail = pg.locator('details').first.inner_text()
        lines = pg.locator('textarea').count()
        fixinfo = None
        if scenario in ('never', 'fix1'):
            fixinfo = pg.get_by_role('button', name='Fix Remaining Issues').count()
        if scenario == 'fixlater':
            btn = pg.get_by_role('button', name='Fix Remaining Issues')
            before = btn.count()
            btn.click()
            for _ in range(200):
                if pg.locator('details summary').first.inner_text().find('QA passed') >= 0: break
                pg.wait_for_timeout(50)
            fixinfo = (before, pg.locator('details summary').first.inner_text(), pg.get_by_role('button', name='Fix Remaining Issues').count())
        b.close()
    return reqs, state, seen, summary, detail, errs, lines, fixinfo

# Scenario A: fails once, auto-fixed by retry 1.
reqs, st, seen, summary, detail, errs, nlines, fixinfo = run('fix1')
kinds = [r[0] for r in reqs]
print(kinds, '|', summary.replace('\n', ' '))
check(kinds == ['draft', 'format', 'critic', 'rewrite', 'critic'], 'fix1: order is draft, format, critic, rewrite, critic')
check(reqs[0][1].get('temperature') == 0.85 and 'responseMimeType' not in reqs[0][1], 'pass 1: temp 0.85, no JSON mime type')
check(reqs[1][1].get('temperature') == 0.1 and reqs[1][1].get('responseMimeType') == 'application/json', 'pass 2: temp 0.1, JSON')
check(reqs[2][1].get('temperature') == 0.2, 'pass 3 critic: temp 0.2')
d = reqs[0][2]
check('Boppy' in d and 'DOSSIER: TNB' in d and 'DOSSIER: Grace' in d, 'pass 1 has dossiers for the required speakers')
check('**Deedee**' not in d.split('=== SPEAKER DOSSIERS')[1].split('=== END DOSSIERS')[0], 'pass 1 dossiers leave out other characters')
check('battle-spec-v11.md' not in d and 'bestiary-v11.md' not in d and 'workshop-and-map-spec.md' not in d, 'no combat docs without a combat encounter')
check('Boppy distrusts the open door' in d and 'Nobody knows about the gold coin yet.' in d and 'Keep it dry.' in d, 'pass 1 has beats, knowledge gate and director notes')
rw = reqs[3][2]
for needle in ('EM_DASH', 'NO_CONTRACTION', 'QUOTE_IN_ACTION', 'BANNED_TERM', 'ROSIE', 'CLICHE', 'TNB_BANG', 'TNB_CAPS', 'Not funny and not Boppy.'):
    check(needle in rw, 'rewrite prompt lists ' + needle)
check({'Drafting...', 'Running QA check (Attempt 1/2)...', 'Auto-fixing issues (retry 1/2)...', 'Running QA check (Attempt 2/2)...'} <= seen, 'live status shown: %s' % sorted(seen))
check('QA passed' in summary and '9/10' in summary and '1 auto-fix' in summary, 'badge: passed, 9/10, 1 auto-fix')
check('No remaining notes' in detail, 'badge details: no remaining notes')
check(nlines >= 4, 'final script shown')
check(fixinfo == 0, 'no Fix Remaining Issues button on a scene that passed')
check('TATA' in rw and 'Ta-Ta' in rw, 'linter flags "Tata" and the rewrite prompt says to use Ta-Ta')
dp = reqs[0][2]
check('NEVER thesaurus-paraphrase' in dp and 'NEVER shoehorn' in dp and 'SkyMiles' in dp and 'plot facts only' in dp and 'Invent fresh comedic dialogue' in dp, 'pass 1 prompt has the beat and trivia rules')
check('NEVER thesaurus-paraphrase' in rw and 'NEVER shoehorn' in rw and 'Invent fresh comedic dialogue' in rw, 'pass 4 prompt has the beat and trivia rules')
crit = [r for r in reqs if r[0] == 'critic'][0][2]
check('Do NOT flag a line merely because its wording differs from a mandatory beat' in crit and 'flat, unfunny paraphrase' in crit, 'critic is told not to police beat wording, only flat paraphrase')
check('PRESERVE every UNFLAGGED line exactly' in rw and 'Rewrite ONLY the flagged lines' in rw and 'FLAGGED LINES: L1, L2, L3, L4' in rw and 'MUST rewrite EVERY flagged line' in rw, 'pass 4 prompt is surgical and names the flagged lines')
check(not errs, 'no page errors %s' % errs)

# Scenario B: never passes, stops after 2 retries and shows remaining notes.
reqs, st, seen, summary, detail, errs, nlines, fixinfo = run('never')
kinds = [r[0] for r in reqs]
print(kinds, '|', summary.replace('\n', ' '))
check(kinds == ['draft', 'format', 'critic', 'rewrite', 'redo', 'critic', 'rewrite', 'redo', 'critic'], 'never: max 2 retries then stops (each rewrite that leaves a flagged line unchanged gets one forced redo)')
check('needs a look' in summary and '2 auto-fixes' in summary, 'badge: needs a look, 2 auto-fixes')
check(fixinfo == 1, 'Fix Remaining Issues button shown under 8/10')
check('linter:' in detail and 'Voice:' in detail, 'badge lists remaining linter and critic notes')
check(not errs, 'no page errors %s' % errs)

# Scenario C: stays below 8 after the auto loop, then Fix Remaining Issues repairs it without restarting from pass 1.
reqs, st, seen, summary, detail, errs, nlines, fixinfo = run('fixlater')
kinds = [r[0] for r in reqs]
print(kinds, '|', fixinfo)
check(kinds == ['draft', 'format', 'critic', 'rewrite', 'redo', 'critic', 'rewrite', 'redo', 'critic', 'rewrite', 'critic'], 'fixlater: one extra rewrite plus one QA check, no new draft or format')
fp = reqs[9][2]
check('Not funny and not Boppy.' in fp and 'TATA' in fp and 'PRESERVE every UNFLAGGED line' in fp, 'fix pass sends the saved Critic issue and the linter errors, surgically')
check(reqs[9][1].get('temperature') == 0.6 and reqs[10][1].get('temperature') == 0.2, 'fix pass: rewrite 0.6, then critic 0.2')
check(fixinfo[0] == 1 and 'QA passed' in fixinfo[1] and '3 auto-fixes' in fixinfo[1] and fixinfo[2] == 0, 'badge after the fix: passed, 3 auto-fixes, button gone: %s' % (fixinfo,))
check(not errs, 'no page errors %s' % errs)

def scene(i, sid, beat):
    return {'id': 's%d' % i, 'sceneId': sid, 'title': sid, 'mapId': '', 'location': 'Long Island', 'requiredSpeakers': ['Tom'], 'mandatoryBeats': [beat],
            'knowledgeGate': 'Nobody knows about the camera yet.', 'physicalSegue': '', 'triggers': {'combatEncounter': '', 'textMessageBeat': '', 'closeupScreen': ''},
            'sliders': {'humorDensity': 7, 'banterSpeed': 8, 'groundedVsGoofy': 6, 'sentimentWarmth': 3, 'minLines': 4, 'maxLines': 8, 'directorNotes': ''},
            'lines': [{'id': 'l1', 'type': 'dialogue', 'speaker': 'Tom', 'mood': 'none', 'text': "That cube wasn't there yesterday, and I'd like that on the record.", 'locked': False, 'flags': [], 'customNote': ''}], 'history': []}
def chapters():
    out = []
    for i in range(1, 22):
        sc = []
        if i == 1: sc = [scene(1, 'ch1_s1', 'Orange cube appears'), scene(2, 'ch1_s2', 'Coin found')]
        if i == 2: sc = [scene(3, 'ch2_s1', 'Cube grows')]
        out.append({'id': 'ch%d' % i, 'number': i, 'label': 'Chapter %d' % i, 'title': 'Chapter %d' % i, 'purpose': '', 'disabledBannedWords': [], 'scenes': sc})
    return out


# Seeded scenarios: the scene already carries a QA badge with saved Critic issues and one linter error ("Tata").
OLD2 = "Truly, this establishment looks open, and that disturbs me greatly."
OLD3 = "Maybe it's just a door, Boppy. A normal door that's open on a weekday."
SEED = [L('action', 'Narrator', 'Boppy squints at the sign, then at his stomach.'), L('dialogue', 'Boppy', OLD2), L('dialogue', 'TNB', OLD3),
        L('dialogue', 'Grace', "Tata, Cozy Rosie is on the lamp again, wearing Lamby like a hat.")]
NEW2 = "Nobody opens a door this early unless it's a trap, and my stomach knows it."
NEW3 = "Or it's a door, Boppy. Doors do that. Want to test it with a cinnamon roll?"
NEW4 = "Ta-Ta, Cozy Rosie is on the lamp again, wearing Lamby like a hat."
ISSUES = [{'lineIndex': 2, 'speaker': 'Boppy', 'category': 'Comedy', 'problem': 'Flat, says nothing funny.', 'fix': 'Give him a gut-based conspiracy.'},
          {'lineIndex': 3, 'speaker': 'TNB', 'category': 'Voice', 'problem': 'TNB would not explain the obvious.', 'fix': 'Dry, offers a practical test.'}]

def run_seeded(mode):
    reqs = []
    def handler(route):
        body = json.loads(route.request.post_data); prompt = body['contents'][0]['parts'][0]['text']
        def ok(o): route.fulfill(status=200, content_type='application/json', body=json.dumps({'candidates': [{'content': {'parts': [{'text': json.dumps(o)}]}}]}))
        if 'Your draft failed QA' in prompt:
            redo = 'YOUR LAST ATTEMPT FAILED' in prompt
            reqs.append(('redo' if redo else 'rewrite', prompt))
            if mode == 'lazy' and not redo:  # only the linter error changes, every Critic-flagged line comes back word for word
                ok({'lines': [SEED[0], SEED[1], SEED[2], L('dialogue', 'Grace', NEW4)]})
            elif mode == 'lazy':
                ok({'lines': [SEED[0], L('dialogue', 'Boppy', NEW2), L('dialogue', 'TNB', NEW3), L('dialogue', 'Grace', NEW4)]})
            else:  # lint: new Critic fixes, but with MORE linter errors than before (two vs one)
                ok({'lines': [SEED[0], L('dialogue', 'Boppy', "I do not trust a door that's open this early, and my stomach agrees."), L('dialogue', 'TNB', 'Or it is a door \u2014 want to test it with a cinnamon roll, Boppy?'), L('dialogue', 'Grace', NEW4)]})
        elif 'Showrunner reviewing' in prompt:
            reqs.append(('critic', prompt))
            ok({'pass': mode == 'lazy', 'score': 9 if mode == 'lazy' else 7, 'issues': [] if mode == 'lazy' else [{'lineIndex': 3, 'speaker': 'TNB', 'category': 'Voice', 'problem': 'Still a little flat.', 'fix': 'Tighten.'}]})
        else: route.fulfill(status=500, body='unexpected')
    chs = chapters()
    sc = scene(1, 'ch1_s1', 'Orange cube appears'); sc['lines'] = [dict(l, id='x%d' % i, locked=False, flags=[], customNote='') for i, l in enumerate(SEED)]
    sc['qa'] = {'passed': False, 'score': 6, 'retries': 2, 'notes': ['n'], 'issues': ISSUES, 'at': '2026-11-25T00:00:00Z'}
    chs[0]['scenes'] = [sc]
    seed = {'activeChapterId': 'ch1', 'activeSceneId': 's1', 'settings': {'apiKey': 'k'}, 'chapters': chs}
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 900}).new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/generativelanguage.googleapis.com/**', handler)
        pg.goto(URL); pg.evaluate('s => localStorage.setItem("aot_script_studio_state_v2", JSON.stringify(s))', seed)
        pg.reload(); pg.get_by_text('2. Scene Studio').click(); pg.wait_for_timeout(1200)
        pg.locator('details summary').first.click()
        pg.get_by_role('button', name='Fix Remaining Issues').click()
        for _ in range(300):
            if len([r for r in reqs if r[0] == 'critic']) >= 1: break
            pg.wait_for_timeout(50)
        pg.wait_for_timeout(600)
        texts = pg.locator('textarea').evaluate_all('t => t.map(x => x.value)')
        summary = pg.locator('details summary').first.inner_text()
        toast = pg.locator('body').inner_text()
        b.close()
    return reqs, texts, summary, toast, errs

# Scenario D: the model only fixes the linter error; the forced redo makes it replace the Critic-flagged lines too.
reqs, texts, summary, body, errs = run_seeded('lazy')
kinds = [r[0] for r in reqs]; print(kinds, '|', summary.replace('\n', ' '))
check(kinds == ['rewrite', 'redo', 'critic'], 'lazy: a rewrite that leaves flagged lines unchanged gets one forced redo, then QA')
rp = reqs[0][1]
check('FLAGGED LINES: L2, L3, L4' in rp, 'fix prompt lists the Critic-flagged lines and the linter line')
check('Flat, says nothing funny.' in rp and 'Give him a gut-based conspiracy.' in rp and 'TNB would not explain the obvious.' in rp and 'Dry, offers a practical test.' in rp, 'fix prompt carries every Critic issue (problem and fix)')
check('[TATA]' in rp and 'Ta-Ta' in rp and 'LINTER ERRORS' in rp, 'fix prompt carries the linter error')
check('MUST rewrite EVERY flagged line' in rp, 'fix prompt requires every flagged line to be rewritten')
rd = reqs[1][1]
check(OLD2 in rd and OLD3 in rd and 'word for word' in rd, 'redo prompt names the lines that came back unchanged')
check(NEW2 in texts and NEW3 in texts, 'Critic-flagged lines are replaced in the scene, not just the linter line')
check(OLD2 not in texts and OLD3 not in texts and NEW4 in texts, 'old flagged text is gone and Tata is fixed')
check('QA passed' in summary and '9/10' in summary and '3 auto-fixes' in summary, 'badge updated from the new QA run: %s' % summary.replace('\n', ' '))
check(not errs, 'no page errors %s' % errs)

# Scenario E: the rewrite fixes Critic issues (score 6 to 7) but has one more linter error; it must NOT revert.
reqs, texts, summary, body, errs = run_seeded('lint')
kinds = [r[0] for r in reqs]; print(kinds, '|', summary.replace('\n', ' '))
check(kinds == ['rewrite', 'critic'], 'lint: changed flagged lines need no redo')
check(any('cinnamon roll' in t for t in texts) and OLD2 not in texts, 'a higher Critic score keeps the rewrite even with one more linter error')
check('7/10' in summary and 'previous version was kept' not in body, 'badge shows the new 7/10 and no silent revert')
check(not errs, 'no page errors %s' % errs)
srv.shutdown()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
