"""End-to-end check of Script Studio. Run from the repo root: python3 tools/script-studio/e2e_test.py (needs playwright + chromium)."""
import http.server, threading, functools, os, sys, tempfile
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
def hosted(n): return open(os.path.join(ROOT, 'script-studio/reference-vault', n), encoding='utf-8').read()

with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 900}); pg = ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.get_by_text('1. Reference Vault').click(); pg.wait_for_timeout(1500)
    check(pg.get_by_text('Loaded', exact=True).count() == 6, 'fresh session: 6 docs show Loaded')
    hdr = pg.locator('header p').first.inner_text()
    print(hdr); check('6/6 injected' in hdr and '~0 tok' not in hdr, 'header shows 6/6 injected and non-zero tokens')
    pg.screenshot(path='/tmp/studio-vault.png')
    # live edit survives reload
    pg.get_by_text('comedy-bible.md').first.click()
    ta = pg.locator('textarea').first; ta.fill('MY OVERRIDE TEXT'); pg.wait_for_timeout(300)
    pg.reload(); pg.get_by_text('1. Reference Vault').click(); pg.wait_for_timeout(1200)
    pg.get_by_text('comedy-bible.md').first.click()
    check(pg.locator('textarea').first.input_value() == 'MY OVERRIDE TEXT', 'live edit survives reload (not overwritten by hosted)')
    check(pg.get_by_text('Edited', exact=True).count() >= 1 and pg.get_by_text('Revert to Uploaded').count() == 1, 'Edited badge and Revert to Uploaded show')
    pg.get_by_text('Revert to Uploaded').click(); pg.wait_for_timeout(300)
    check(pg.locator('textarea').first.input_value() == hosted('comedy-bible.md'), 'Revert to Uploaded restores hosted text')
    # upload override survives reload
    tmp = os.path.join(tempfile.mkdtemp(), 'story-thread.md'); open(tmp, 'w').write('UPLOADED CUSTOM STORY THREAD')
    pg.locator('input[type=file][accept*=".md"]').set_input_files(tmp); pg.wait_for_timeout(500)
    pg.reload(); pg.get_by_text('1. Reference Vault').click(); pg.wait_for_timeout(1200)
    pg.get_by_text('story-thread.md').first.click()
    check(pg.locator('textarea').first.input_value() == 'UPLOADED CUSTOM STORY THREAD', 'uploaded override survives reload')
    # checkbox inject toggles
    cb = pg.locator('input[type=checkbox]').first; cb.uncheck(); pg.wait_for_timeout(200)
    check('5/6 injected' in pg.locator('header p').first.inner_text(), 'Inject checkbox changes injected count')
    # sync
    pg.get_by_text('Sync Hosted Defaults').click(); pg.wait_for_timeout(300)
    check(pg.get_by_text('Sync Hosted Defaults?').count() == 1, 'confirmation modal opens')
    pg.get_by_role('button', name='Sync Hosted Defaults').last.click(); pg.wait_for_timeout(1500)
    pg.get_by_text('story-thread.md').first.click()
    check(pg.locator('textarea').first.input_value() == hosted('story-thread.md'), 'Sync restores hosted story-thread.md')
    check('6/6 injected' in pg.locator('header p').first.inner_text(), 'Sync re-enables injection on all 6')
    check(pg.get_by_text('Loaded', exact=True).count() == 6, 'still 6 Loaded after sync')
    check(not errs, 'no page errors %s' % errs)
    b.close()
srv.shutdown()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
