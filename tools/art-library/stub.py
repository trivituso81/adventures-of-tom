#!/usr/bin/env python3
"""Fake xAI and GitHub endpoints for testing the Art Library (no real keys).
Run: python3 tools/art-library/stub.py [port]   (default 8765)
xAI:    POST /v1/images/generations and /v1/images/edits  (Bearer must be 'test'; 401 otherwise; 400 if the body shape is wrong)
        POST /v1/videos/generations (needs model, prompt, image.url as a data: address, duration, resolution) answers {request_id};
        GET /v1/videos/<request_id> answers {status:'pending'} twice, then {status:'done', video:{url}}; the url serves the file named
        by the STUB_VIDEO environment variable (GET /video.bin; with STUB_VIDEO_NOCORS=1 it is sent without the CORS header, like a
        video host that does not let a web page keep a copy).
GitHub: PUT /repos/<o>/<r>/contents/<path>, GET same path (404 until put; data/art-prompts.json is pre-seeded from the repo with sha 'seed'; a PUT to an existing path without the right sha answers 409; GET /files lists everything stored). Calls are logged to /log (GET) for assertions.
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

LOG, FILES, VIDEOS = [], {}, {}
import os
_seed = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'art-prompts.json')
if os.path.exists(_seed):
    _raw = open(_seed, 'rb').read()
    if os.environ.get('STUB_CLEAR'):   # a test wants this entry as never approved (comma separated ids)
        _d = json.loads(_raw)
        for _e in _d['entries']:
            if _e['id'] in os.environ['STUB_CLEAR'].split(','): _e.update(status='draft', versions=[], rejects=[])
        _raw = (json.dumps(_d, indent=1) + '\n').encode()
    _b = base64.b64encode(_raw).decode()
    FILES['data/art-prompts.json'] = {'sha': 'seed', 'content': '\n'.join(_b[i:i + 60] for i in range(0, len(_b), 60))}   # GitHub wraps base64 lines
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
        if self.path.startswith('/video.bin'):
            b = open(os.environ['STUB_VIDEO'], 'rb').read()
            self.send_response(200); self.send_header('Content-Type', 'video/webm'); self.send_header('Accept-Ranges', 'bytes')
            if not os.environ.get('STUB_VIDEO_NOCORS'): self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b); return
        if self.path.startswith('/v1/videos/'):
            if self.headers.get('Authorization') != 'Bearer test': return self._send(401, {'error': 'bad key'})
            rid = self.path.rsplit('/', 1)[-1]
            if rid not in VIDEOS: return self._send(404, {'error': 'no such request'})
            VIDEOS[rid] += 1; LOG.append({'xai': 'poll', 'rid': rid})
            if VIDEOS[rid] < 3: return self._send(200, {'status': 'pending'})
            return self._send(200, {'status': 'done', 'video': {'url': 'http://%s/video.bin?%s' % (self.headers.get('Host'), rid), 'duration': 3}, 'model': 'stub'})
        if self.path == '/log': return self._send(200, LOG)
        if self.path == '/files': return self._send(200, FILES)
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
        if self.path == '/v1/videos/generations':
            ok = isinstance(b, dict) and b.get('model') and b.get('prompt') and isinstance(b.get('image'), dict) and str(b['image'].get('url', '')).startswith('data:image/') and isinstance(b.get('duration'), int) and b.get('resolution') in ('480p', '720p', '1080p')
            if not ok: return self._send(400, {'error': 'bad request shape'})
            kf, lf = b.get('keyframes') or [], b.get('last_frame')   # pinned pictures (clippin1): the full model only, times strictly inside the clip
            pin_ok = isinstance(kf, list) and len(kf) <= 4 and all(isinstance(k, dict) and str((k.get('image') or {}).get('url', '')).startswith('data:image/') and isinstance(k.get('timestamp_s'), (int, float)) and 0 < k['timestamp_s'] < b['duration'] for k in kf) and (lf is None or (isinstance(lf, dict) and str(lf.get('url', '')).startswith('data:image/')))
            if not pin_ok or ((kf or lf) and b['model'] != 'grok-imagine-video-1.5'): return self._send(400, {'error': 'bad pinned pictures'})
            rid = 'req%d' % (len(VIDEOS) + 1); VIDEOS[rid] = 0
            LOG.append({'xai': self.path, 'model': b['model'], 'duration': b['duration'], 'resolution': b['resolution'], 'rid': rid, 'keys': [k['timestamp_s'] for k in kf], 'last': bool(lf), 'words': len(b['prompt'].split())})
            return self._send(200, {'request_id': rid})
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
