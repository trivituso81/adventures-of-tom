#!/usr/bin/env python3
"""Collect every line of dialogue the game can show (scenes, NPCs, monsters, recruit and travel talk, departures, arrivals),
with its speaker and where it comes from, by running tools/clip-audit/harvest.js inside the game in headless Chromium.
Writes tools/voice-library/harvest.json, which make-index.js uses to list lines that have no clip yet.
Run from the repo root (starts its own server):  python3 tools/voice-library/harvest.py"""
import os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
JS = open(os.path.join(ROOT, 'tools', 'clip-audit', 'harvest.js'), encoding='utf8').read()
with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--headless=new', '--no-proxy-server'])
    pg = br.new_page(viewport={'width': 430, 'height': 860}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start', timeout=60000)
    res = pg.evaluate(JS)
    out = [{k: o[k] for k in ('speaker', 'text', 'src', 'map') if k in o} for o in res['out']]
    json.dump({'lines': out}, open(os.path.join(ROOT, 'tools', 'voice-library', 'harvest.json'), 'w'), ensure_ascii=False)
    print(len(out), 'dialogue lines; page errors:', errs[:3], 'harvest errors:', res['errs'][:5])
    br.close()
