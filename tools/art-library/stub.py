#!/usr/bin/env python3
"""Fake xAI and GitHub endpoints for testing the Art Library (no real keys).
Run: python3 tools/art-library/stub.py [port]   (default 8765)
xAI:    POST /v1/images/generations and /v1/images/edits  (Bearer must be 'test'; 401 otherwise; 400 if the body shape is wrong)
GitHub: PUT /repos/<o>/<r>/contents/<path>, GET same path (404 until put). Calls are logged to /log (GET) for assertions.
CORS is open so a page on another port can call it."""
import base64, json, sys, zlib, struct
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

def png(w=96, h=128):
    raw = b''.join(b'\x00' + bytes([(x * 3) % 256, (y * 2) % 256, 180]) * 1 * 1 for y in range(h) for x in range(w))
    # simple RGB gradient
    rows = []
    for y in range(h):
        rows.append(b'\x00' + b''.join(bytes([(x * 255 // w), (y * 255 // h), 160]) for x in range(w)))
    data = zlib.compress(b''.join(rows))
    def ch(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + ch(b'IDAT', data) + ch(b'IEND', b'')

LOG, FILES = [], {}
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, obj=None):
        b = json.dumps(obj if obj is not None else {}).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'authorization, content-type, x-github-api-version, accept')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self): self._send(204)
    def do_GET(self):
        if self.path == '/log': return self._send(200, LOG)
        if self.path.startswith('/repos/'):
            p = self.path.split('/contents/', 1)[-1].split('?')[0]
            if p in FILES: return self._send(200, {'sha': FILES[p]['sha'], 'content': FILES[p]['content'], 'path': p})
            return self._send(404, {'message': 'Not Found'})
        self._send(404)
    def _body(self):
        n = int(self.headers.get('Content-Length') or 0)
        try: return json.loads(self.rfile.read(n) or b'{}')
        except Exception: return None
    def do_POST(self):
        b = self._body()
        if self.headers.get('Authorization') != 'Bearer test': return self._send(401, {'error': 'bad key'})
        if self.path in ('/v1/images/generations', '/v1/images/edits'):
            ok = isinstance(b, dict) and b.get('model') and b.get('prompt')
            if self.path.endswith('edits'):
                ims = b.get('images') if isinstance(b, dict) else None
                ok = ok and isinstance(ims, list) and 1 <= len(ims) <= 5 and all(i.get('type') == 'image_url' and str(i.get('url', '')).startswith('data:') for i in ims)
            if not ok: return self._send(400, {'error': 'bad request shape'})
            LOG.append({'xai': self.path, 'refs': len(b.get('images') or []), 'prompt': b['prompt'][:80]})
            return self._send(200, {'data': [{'b64_json': base64.b64encode(png()).decode(), 'mime_type': 'image/png'}]})
        self._send(404)
    def do_PUT(self):
        if not self.path.startswith('/repos/'): return self._send(404)
        if not (self.headers.get('Authorization') or '').endswith(' test'): return self._send(401, {'message': 'Bad credentials'})
        b = self._body() or {}
        p = self.path.split('/contents/', 1)[-1].split('?')[0]
        if p in FILES and b.get('sha') != FILES[p]['sha']: return self._send(409, {'message': 'sha mismatch'})
        sha = 'sha%d' % (len(LOG) + 1)
        FILES[p] = {'sha': sha, 'content': b.get('content', '')}
        LOG.append({'github': 'PUT', 'path': p, 'bytes': len(b.get('content', '')), 'msg': b.get('message', '')[:80]})
        self._send(201, {'content': {'sha': sha, 'path': p}})

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
