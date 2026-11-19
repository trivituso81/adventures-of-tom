#!/usr/bin/env python3
"""Stand-in for the xAI API for tools/clip-gate/vision_test.py: /v1/language-models and /v1/chat/completions (images in, JSON out).
Answers yes to every question except those named in STUB_NO (comma separated ids); returns usage with cost_in_usd_ticks of STUB_TICKS
(default 50000000 = $0.005). Counts the images it got in /stats."""
import json, os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
STATS = {'calls': 0, 'images': 0, 'bad_image': 0, 'systems': 0}
NO = set(filter(None, os.environ.get('STUB_NO', '').split(',')))
TICKS = int(os.environ.get('STUB_TICKS', '50000000'))


class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def send(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def do_GET(self):
        if self.path == '/stats': return self.send(200, STATS)
        if self.headers.get('Authorization') != 'Bearer testkey': return self.send(401, {'error': 'no'})
        if self.path == '/v1/language-models':
            return self.send(200, {'models': [
                {'id': 'grok-4.7', 'input_modalities': ['text', 'image'], 'prompt_text_token_price': 20000, 'completion_text_token_price': 60000},
                {'id': 'grok-text-only', 'input_modalities': ['text'], 'prompt_text_token_price': 100, 'completion_text_token_price': 100},
                {'id': 'grok-4.20-0309-non-reasoning', 'input_modalities': ['text', 'image'], 'prompt_text_token_price': 12500, 'completion_text_token_price': 25000}]})
        self.send(404, {})

    def do_POST(self):
        if self.headers.get('Authorization') != 'Bearer testkey': return self.send(401, {'error': 'no'})
        body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        STATS['calls'] += 1
        msgs = body['messages']
        STATS['systems'] += any(m['role'] == 'system' for m in msgs)
        user = [m for m in msgs if m['role'] == 'user'][0]['content']
        for c in user:
            if c['type'] == 'image_url':
                STATS['images'] += 1
                u = c['image_url']['url']
                if not u.startswith('data:image/jpeg;base64,/9j/'): STATS['bad_image'] += 1
        txt = [c['text'] for c in user if c['type'] == 'text'][0]
        ids = re.findall(r'^- ([a-z]_[a-z_]+):', txt, re.M)
        ans = {i: {'yes': i not in NO, 'why': 'stand-in'} for i in ids}
        out = json.dumps({'describe': 'stand-in description', 'answers': ans})
        if os.environ.get('STUB_FENCE'): out = '```json\n' + out + '\n```'
        self.send(200, {'choices': [{'message': {'content': out}}], 'usage': {'prompt_tokens': 3000, 'completion_tokens': 400, 'cost_in_usd_ticks': TICKS}})


if __name__ == '__main__':
    HTTPServer(('127.0.0.1', int(sys.argv[1])), H).serve_forever()
