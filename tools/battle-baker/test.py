#!/usr/bin/env python3
"""Playwright check of the Battle Voice Baker with ElevenLabs mocked. python3 tools/battle-baker/test.py"""
import os, sys, json, threading, http.server, functools, base64, glob
from playwright.sync_api import sync_playwright
REPO=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..')); OUT=os.path.join(REPO,'tools','battle-baker','out'); os.makedirs(OUT,exist_ok=True)
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Access-Control-Allow-Origin','*'); super().end_headers()
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(H,directory=REPO)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
MP3=base64.b64decode('//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAGhgBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV')
sent=[]
def mock(route):
    req=route.request; sent.append((req.url,req.post_data)); route.fulfill(status=200,content_type='audio/mpeg',body=MP3)
ok=True
def check(c,m):
    global ok; print(('PASS ' if c else 'FAIL ')+m); ok=ok and c
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM'),args=['--headless=new']); ctx=b.new_context(accept_downloads=True,viewport={'width':430,'height':900}); pg=ctx.new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('https://api.elevenlabs.io/**',mock)
    pg.goto('file://'+os.path.join(OUT,'Battle-Voice-Baker.html')+'?base=http://127.0.0.1:%d/'%port)
    pg.fill('#key','test'); pg.wait_for_selector('.card'); pg.wait_for_function("__BVB.CUR.tom&&__BVB.CUR.tom.state==='ok'")
    check(pg.locator('.tab').count()==8,'8 tabs')
    check(pg.locator('.card .play[data-act=cur]:not([disabled])').count()>0,'current play buttons enabled')
    pg.screenshot(path=OUT+'/shot-tom.png')
    pg.click('.card [data-act=gen]'); pg.wait_for_selector('.take')
    check(len(sent)==1 and 'eleven_v4' in sent[0][1],'tts request sent')
    pg.click('.take input[data-act=keep]')
    check('1 line' in pg.inner_text('#progress'),'progress counts 1')
    pg.click('.tab[data-tab=nara]'); pg.wait_for_function("__BVB.CUR.nara&&__BVB.CUR.nara.state==='ok'")
    pg.click('.card [data-act=gen]'); pg.wait_for_selector('.take'); pg.click('.take input[data-act=keep]')
    check('/sound-generation' in sent[-1][0],'nara uses sound-generation')
    pg.screenshot(path=OUT+'/shot-nara.png')
    with pg.expect_download() as d: pg.click('#save')
    path=d.value.path(); J=json.load(open(path))
    check(set(J['clips'])=={'tom','nara'},'only changed chars exported: %s'%list(J['clips']))
    live=len(json.load(open(path))['voices']['tom'].get('scripts',{}))
    check(live>5,'tom scripts preserved (%d)'%live)
    d=os.path.join(OUT,'voices-test.json'); open(d,'w').write(json.dumps(J))
    check(not errs,'no page errors '+str(errs))
    b.close()
sys.exit(0 if ok else 1)
