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
import base64, json, sys, zlib, struct, hashlib, time
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

LOG, FILES, VIDEOS, PICK = [], {}, {}, {}
REFS = {}   # keysecrets3: branches made through the git data API (blobs, trees, commits, refs)
import os
_seed = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'art-prompts.json')
if os.path.exists(_seed):
    _raw = open(_seed, 'rb').read()
    if os.environ.get('STUB_CLEAR') or os.environ.get('STUB_GROUP'):   # a test wants this entry as never approved (comma separated ids)
        _d = json.loads(_raw)
        for _e in _d['entries']:
            if _e['id'] in os.environ['STUB_CLEAR'].split(','): _e.update(status='draft', versions=[], rejects=[])
        if os.environ.get('STUB_GROUP'):   # clipbatch1: 'id1,id2=Chapter 1' puts those entries in that group (the Library's chapter batch button needs a group named Chapter n)
            _ids, _g = os.environ['STUB_GROUP'].split('=', 1)
            for _e in _d['entries']:
                if _e['id'] in _ids.split(','): _e['group'] = _g
                elif _e.get('group') == _g: _e['group'] = _g + ' (not in this test)'   # clipch1: the real chapter's other entries stay out of the test's batch
        _raw = (json.dumps(_d, indent=1) + '\n').encode()
    _b = base64.b64encode(_raw).decode()
    FILES['data/art-prompts.json'] = {'sha': 'seed', 'content': '\n'.join(_b[i:i + 60] for i in range(0, len(_b), 60))}   # GitHub wraps base64 lines
_bp = os.environ.get('STUB_BOARD') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'board.json')   # STUB_BOARD: a test board (board2)
if os.path.exists(_bp):   # board1: the Board page saves data/board.json the same way
    _b = base64.b64encode(open(_bp, 'rb').read()).decode()
    FILES['data/board.json'] = {'sha': 'seedboard', 'content': '\n'.join(_b[i:i + 60] for i in range(0, len(_b), 60))}
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
            still = PICK.get(self.path.split('?', 1)[-1]) == 'still' and os.environ.get('STUB_VIDEO_STILL')   # clipbatch1: a request whose prompt says STILL gets a video that does not move
            b = open(os.environ['STUB_VIDEO_STILL'] if still else os.environ['STUB_VIDEO'], 'rb').read()
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
        if self.path.startswith('/v1/language-models'):   # artgen2: the list the QA picks its model from (cheapest with image input, not a reasoning one)
            if self.headers.get('Authorization') != 'Bearer test': return self._send(401, {'error': 'bad key'})
            return self._send(200, {'models': [{'id': 'stub-reasoning', 'input_modalities': ['text', 'image'], 'prompt_text_token_price': 1, 'completion_text_token_price': 1},
                                               {'id': 'stub-vision-non-reasoning', 'input_modalities': ['text', 'image'], 'prompt_text_token_price': 5, 'completion_text_token_price': 5},
                                               {'id': 'stub-text-non-reasoning', 'input_modalities': ['text'], 'prompt_text_token_price': 0, 'completion_text_token_price': 0}]})
        if self.path == '/log': return self._send(200, LOG)
        if self.path == '/files': return self._send(200, FILES)
        if self.path.startswith('/repos/') and '/commits/main' in self.path:   # boardux1: the board's sync light asks for the newest commit on main (STUB_COMMIT_AT, an ISO time; default now)
            at = os.environ.get('STUB_COMMIT_AT') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            return self._send(200, {'sha': 'stub', 'commit': {'committer': {'date': at}}})
        if self.path.startswith('/repos/') and '/actions/workflows/board-sync.yml/runs' in self.path:   # STUB_RUNS: JSON list of {conclusion, updated_at}; default one success now
            runs = json.loads(os.environ['STUB_RUNS']) if os.environ.get('STUB_RUNS') else [{'conclusion': 'success', 'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}]
            return self._send(200, {'workflow_runs': [dict(r, status='completed') for r in runs]})
        if self.path.startswith('/repos/') and '/git/ref/heads/' in self.path:   # keysecrets3: does branch <name> exist yet
            return self._send(200, {'ref': self.path.split('/git/ref/', 1)[1]}) if self.path.split('/git/ref/heads/', 1)[1].split('?')[0] in REFS else self._send(404, {'message': 'Not Found'})
        if self.path.startswith('/repos/'):
            p = self.path.split('/contents/', 1)[-1].split('?')[0]
            if '/git/blobs/' in self.path:   # bigboard1: the git blob API, which (unlike the contents API) sends a file of any size
                want = self.path.split('/git/blobs/', 1)[1].split('?')[0]
                for q, f in FILES.items():
                    if f['sha'] == want:
                        LOG.append({'github': 'GET', 'blob': q})
                        return self._send(200, {'sha': want, 'content': f['content'], 'encoding': 'base64', 'size': len(base64.b64decode(f['content']))})
                return self._send(404, {'message': 'Not Found'})
            if p in FILES:
                # bigboard1: like GitHub, the contents API sends an empty `content` and encoding "none" for a file over 1 MiB (1,048,576 bytes)
                if len(base64.b64decode(FILES[p]['content'] or '')) > 1048576:
                    return self._send(200, {'sha': FILES[p]['sha'], 'content': '', 'encoding': 'none', 'size': len(base64.b64decode(FILES[p]['content'])), 'path': p, 'type': 'file'})
                return self._send(200, {'sha': FILES[p]['sha'], 'content': FILES[p]['content'], 'path': p})
            return self._send(404, {'message': 'Not Found'})
        self._send(404)
    def _body(self):
        n = int(self.headers.get('Content-Length') or 0)
        try: return json.loads(self.rfile.read(n) or b'{}')
        except Exception: return None
    def do_POST(self):
        b = self._body()
        if self.headers.get('Authorization') != 'Bearer test': return self._send(401, {'error': 'bad key'})
        if self.path.startswith('/repos/') and '/git/' in self.path:   # keysecrets3: just enough of the git data API for a page to make a branch from an empty history
            kind = self.path.rsplit('/', 1)[1]
            LOG.append({'github': 'POST', 'git': kind, 'ref': (b or {}).get('ref', '')})
            if kind == 'refs':
                name = str((b or {}).get('ref', '')).replace('refs/heads/', '')
                if name in REFS: return self._send(422, {'message': 'Reference already exists'})
                REFS[name] = (b or {}).get('sha', ''); return self._send(201, {'ref': b.get('ref')})
            return self._send(201, {'sha': hashlib.sha1((self.path + json.dumps(b, sort_keys=True)).encode()).hexdigest()})
        if self.path == '/v1/videos/generations':
            ok = isinstance(b, dict) and b.get('model') and b.get('prompt') and isinstance(b.get('image'), dict) and str(b['image'].get('url', '')).startswith('data:image/') and isinstance(b.get('duration'), int) and b.get('resolution') in ('480p', '720p', '1080p')
            if not ok: return self._send(400, {'error': 'bad request shape'})
            inflight = sum(1 for k, n in VIDEOS.items() if n < 3)   # requests sent and not yet finished, before this one (a batch must not flood the service)
            rid = 'req%d' % (len(VIDEOS) + 1); VIDEOS[rid] = 0
            if 'STILL' in str(b.get('prompt')): PICK[rid] = 'still'
            LOG.append({'xai': self.path, 'model': b['model'], 'duration': b['duration'], 'resolution': b['resolution'], 'rid': rid, 'inflight': inflight})
            return self._send(200, {'request_id': rid})
        if self.path == '/v1/chat/completions':   # artgen2: a stand-in checker. Marker words in the PROMPT text choose the answers:
            # FAIL:<qid> answers no to that question every time, MISS:<qid> leaves it out, FLAKY:<qid> says no on the first call only, DOWN stops with a 500.
            msgs = (b or {}).get('messages') or []; parts = (msgs[-1].get('content') if msgs else None) or []
            parts = parts if isinstance(parts, list) else [{'type': 'text', 'text': str(parts)}]
            txt = ' '.join(x.get('text', '') for x in parts if x.get('type') == 'text'); nimg = sum(1 for x in parts if x.get('type') == 'image_url')
            usage = {'prompt_tokens': 1000 * (nimg + 1), 'completion_tokens': 200, 'cost_in_usd_ticks': 50000000 * (nimg + 1)}   # $0.005 per image + text
            if 'DOWN' in txt and nimg: return self._send(500, {'error': 'down'})
            if 'List up to' in txt and not nimg:
                LOG.append({'xai': 'chat-criteria', 'model': b.get('model')})
                req = ['Is there a red hat?', 'Is the cat sitting?'] + (['Is the tail long?'] if 'TAIL' in txt else [])
                return self._send(200, {'choices': [{'message': {'content': json.dumps({'requirements': req})}}], 'usage': usage})
            import re as _re
            qids = _re.findall(r'^((?:f_[a-z]+|p\d+)): ', txt.split('QUESTIONS', 1)[-1], _re.M)
            n = sum(1 for l in LOG if l.get('xai') == 'chat' and l.get('sig') == hashlib.sha1(txt.encode()).hexdigest()[:8])
            LOG.append({'xai': 'chat', 'model': b.get('model'), 'imgs': nimg, 'qids': qids, 'sig': hashlib.sha1(txt.encode()).hexdigest()[:8]})
            ans = {}
            for q in qids:
                if 'MISS:' + q in txt: continue
                no = ('FAIL:' + q in txt) or ('FLAKY:' + q in txt and n == 0)
                ans[q] = {'yes': not no, 'why': 'stub says no' if no else 'looks fine'}
            return self._send(200, {'choices': [{'message': {'content': json.dumps(ans)}}], 'usage': usage})
        if self.path in ('/v1/images/generations', '/v1/images/edits'):
            ok = isinstance(b, dict) and b.get('model') and b.get('prompt')
            if self.path.endswith('edits'):
                ims = b.get('images') if isinstance(b, dict) else None
                ok = ok and isinstance(ims, list) and 1 <= len(ims) <= 5 and all(i.get('type') == 'image_url' and str(i.get('url', '')).startswith('data:') for i in ims)
            if not ok: return self._send(400, {'error': 'bad request shape'})
            LOG.append({'xai': self.path, 'refs': len(b.get('images') or []), 'prompt': b['prompt'][:80], 'ar': b.get('aspect_ratio'), 'res': b.get('resolution'), 'refhash': [hashlib.sha1(i['url'].split(',', 1)[-1].encode()).hexdigest()[:10] for i in (b.get('images') or [])]})
            return self._send(200, {'data': [{'b64_json': base64.b64encode(png()).decode(), 'mime_type': 'image/png'}]})
        self._send(404)
    def do_PUT(self):
        if os.environ.get('STUB_PUT_DELAY'): time.sleep(float(os.environ['STUB_PUT_DELAY']))   # tapfb1: a slow GitHub, so a test can see the busy spinner
        if not self.path.startswith('/repos/'): return self._send(404)
        if not (self.headers.get('Authorization') or '').endswith(' test'): return self._send(401, {'message': 'Bad credentials'})
        b = self._body() or {}
        p = self.path.split('/contents/', 1)[-1].split('?')[0]
        if p in FILES and b.get('sha') != FILES[p]['sha']: return self._send(409, {'message': 'sha mismatch'})
        sha = 'sha%d' % (len(LOG) + 1)
        FILES[p] = {'sha': sha, 'content': b.get('content', '')}
        LOG.append({'github': 'PUT', 'path': p, 'bytes': len(b.get('content', '')), 'msg': b.get('message', '')[:80], 'branch': b.get('branch', '')})
        self._send(201, {'content': {'sha': sha, 'path': p}})

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
