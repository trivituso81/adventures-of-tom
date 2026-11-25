"""Storyline (chapter coherence) and Trajectory (cross-chapter tie-in) audits and Gemini 4 presets, Gemini mocked. Run from repo root: python3 tools/script-studio/audit_test.py"""
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

STORY = {'overallStatus': 'PASS', 'coherenceScore': 6, 'summary': 'Mostly coherent, one random monster.',
  'checks': {k: {'status': st, 'score': sc, 'analysis': 'Analysis for %s.' % k} for k, st, sc in
     [('mythologyAlignment', 'WARN', 5), ('causeAndEffect', 'PASS', 8), ('tieInValue', 'PASS', 7), ('knowledgeGate', 'PASS', 8)]},
  'issues': [{'sceneId': 'ch1_s2', 'lineNumber': 1, 'check': 'Mythology', 'severity': 'high', 'whatFeelsBroken': 'The coin has no source.', 'concreteFix': 'Tie the coin to a flashbulb pop.'}]}
TRAJ = {'overallStatus': 'PASS', 'summary': 'One dangling clue.',
  'escalationCurve': {'status': 'WARN', 'analysis': 'Cube stalls in ch2.', 'chapters': [
     {'chapterNumber': 1, 'source': 'built', 'objectSize': 'fist-sized', 'biggerThanPrevious': True, 'note': ''},
     {'chapterNumber': 2, 'source': 'built', 'objectSize': 'fist-sized', 'biggerThanPrevious': False, 'note': 'No growth.'}]},
  'setupPayoffLedger': [{'clue': 'Gold teeth', 'plantedIn': 'ch1_s1', 'paidOffIn': '', 'status': 'DANGLING', 'note': 'Never returns.', 'fix': 'Pay off in ch13.'}],
  'contradictions': [{'kind': 'Coast', 'chapterNumbers': [2], 'sceneId': 'ch2_s1', 'problem': 'Set in LA but party is on Long Island.', 'fix': 'Move the scene.'}]}

reqs = []
def handler(route):
    body = json.loads(route.request.post_data); prompt = body['contents'][0]['parts'][0]['text']; gc = body['generationConfig']
    model = route.request.url.split('/models/')[1].split(':')[0]
    if 'grading ONE chapter' in prompt: reqs.append(('story', gc, prompt, model)); out = STORY
    elif 'CROSS-CHAPTER TIE-IN AUDIT' in prompt: reqs.append(('traj', gc, prompt, model)); out = TRAJ
    else: route.fulfill(status=500, body='unexpected'); return
    route.fulfill(status=200, content_type='application/json', body=json.dumps({'candidates': [{'content': {'parts': [{'text': json.dumps(out)}]}}]}))

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 1000}).new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/generativelanguage.googleapis.com/**', handler)
    pg.goto(URL)
    # an old save that still names gemini-2.5-pro, plus a stale old-format report that must not crash
    seed = {'activeChapterId': 'ch1', 'activeSceneId': 's1', 'chapters': chapters(),
            'settings': {'apiKey': 'k', 'genModelPreset': 'gemini-2.5-pro', 'auditModelPreset': 'gemini-2.5-pro'},
            'auditReports': {'trajectory': {'ch1': {'overallStatus': 'PASS', 'summary': 'old'}}, 'storyline': {'ch1': {'overallStatus': 'PASS', 'summary': 'old'}}}}
    pg.evaluate('s => localStorage.setItem("aot_script_studio_state_v2", JSON.stringify(s))', seed)
    pg.reload(); pg.wait_for_timeout(1200)
    pg.get_by_role('button', name='API').click(); pg.wait_for_timeout(300)
    sels = pg.locator('select')
    vals = []
    for i in range(sels.count()):
        opts = sels.nth(i).locator('option').evaluate_all('o => o.map(x => x.value)')
        if 'gemini-4-neon' in opts: vals.append((opts, sels.nth(i).input_value()))
    check(len(vals) == 2, 'two model dropdowns found')
    check(all(o[:3] == ['gemini-4-neon', 'gemini-4-carbon', 'gemini-4-hydrogen'] for o, _ in vals), 'presets lead with neon, carbon, hydrogen')
    check(all('gemini-2.5-pro' not in o for o, _ in vals), 'gemini-2.5-pro preset is gone')
    check([v for _, v in vals] == ['gemini-4-neon', 'gemini-4-carbon'], 'old saved 2.5-pro settings migrate to neon (gen) and carbon (audit): %s' % [v for _, v in vals])
    pg.locator('div.fixed button:has(svg.lucide-x)').first.click(); pg.wait_for_timeout(300)
    pg.get_by_text('3. Checkers').click(); pg.wait_for_timeout(500)
    check(pg.get_by_role('button', name='Chapter Coherence Audit').count() == 1 and pg.get_by_role('button', name='Cross-Chapter Tie-In Audit').count() == 1, 'buttons renamed')
    check(pg.get_by_text('Nothing to fix').count() == 0, 'old-format stored report is ignored without a crash')

    pg.get_by_role('button', name='Chapter Coherence Audit').click(); pg.wait_for_timeout(1500)
    s = [r for r in reqs if r[0] == 'story'][0]
    check(s[1].get('temperature') == 0.2 and s[3] == 'gemini-4-carbon', 'storyline: temp 0.2 on the Audit model (carbon)')
    check('=== story-thread.md ===' in s[2] and '=== canon-and-characters.md ===' in s[2], 'storyline sends story-thread and canon')
    check('Orange cube appears' in s[2] and 'Coin found' in s[2] and 'Cube grows' not in s[2], 'storyline sends only the active chapter scenes and beats')
    check('comedy-bible' not in s[2], 'storyline leaves out other docs')
    txt = pg.locator('main').inner_text()
    check('Chapter Coherence Report Card' in txt and '6/10' in txt, 'report card shows the 1-10 score')
    check('WARN' in txt, 'badge is WARN (model said PASS, score 6 and a WARN check)')
    for t in ('Mythology Alignment', 'Internal Cause & Effect', 'Tie-In Value', 'Knowledge Gate Check', 'ch1_s2', 'What feels random or broken', 'The coin has no source.', 'Concrete fix', 'Tie the coin to a flashbulb pop.'):
        check(t in txt, 'storyline report shows ' + t)
    pg.screenshot(path='/tmp/studio-audit-story.png', full_page=True)

    pg.get_by_role('button', name='Cross-Chapter Tie-In Audit').click(); pg.wait_for_timeout(1500)
    t = [r for r in reqs if r[0] == 'traj'][0]
    check(t[1].get('temperature') == 0.2 and t[3] == 'gemini-4-carbon', 'trajectory: temp 0.2 on carbon')
    check('Orange cube appears' in t[2] and 'Cube grows' in t[2], 'trajectory sends every populated chapter')
    check('UNBUILT CHAPTERS (use story-thread.md only): 3, 4' in t[2], 'trajectory marks unbuilt chapters for story-thread')
    check('through Chapter 11' in t[2] and 'Penny' in t[2] and 'gold teeth' in t[2], 'trajectory asks for the escalation curve and the named clues')
    txt = pg.locator('main').inner_text()
    for x in ('Cross-Chapter Tie-In Audit', 'Escalation Curve', 'Cube stalls in ch2.', 'Setup & Payoff Ledger', 'Gold teeth', 'DANGLING', 'Pay off in ch13.', 'Contradictions (1)', 'Set in LA but party is on Long Island.'):
        check(x.lower() in txt.lower(), 'trajectory report shows ' + x)
    check('WARN' in pg.locator('main').inner_text(), 'trajectory badge raised to WARN by the findings')
    pg.screenshot(path='/tmp/studio-audit-traj.png', full_page=True)
    pg.get_by_text('Set in LA but party is on Long Island.').click(); pg.wait_for_timeout(500)
    check(pg.get_by_text('2. Scene Studio').first.is_visible() and 'ch2_s1' in pg.locator('header').inner_text(), 'contradiction card jumps to ch2_s1 in Scene Studio')
    check(not errs, 'no page errors %s' % errs)
    b.close()
srv.shutdown()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
