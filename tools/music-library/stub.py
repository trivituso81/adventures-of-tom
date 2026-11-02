#!/usr/bin/env python3
"""Fake ElevenLabs Music endpoint for testing the Music Library (no real key).
Run: python3 tools/music-library/stub.py [port]   (default 8822)
POST /v1/music?output_format=mp3_44100_128  with header xi-api-key: test
  body {prompt, music_length_ms, model_id, force_instrumental:true}; answers a 3 second mp3 (made once with ffmpeg at start).
  401 for any other key, 400 when the body shape is wrong (no prompt, no length, force_instrumental not true, no 'Instrumental only' in the prompt).
GET /log   the calls received so far (prompt first 60 chars, length, model, instrumental flag).
CORS is open so a page on another port can call it."""
import json, os, subprocess, sys, tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
def make_mp3():
    p = os.path.join(tempfile.mkdtemp(prefix='mstub-'), 'tone.mp3')
    r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=330:duration=3',
                        '-f', 'lavfi', '-i', 'sine=frequency=495:duration=3', '-filter_complex', '[0][1]amix=inputs=2',
                        '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k', p], capture_output=True, text=True)
    if r.returncode:
        src = os.path.join(HERE, '..', '..', 'music', 'levelup.mp3')   # fallback: a real 4 s track from the repo
        return open(src, 'rb').read()
    return open(p, 'rb').read()
MP3 = make_mp3()
LOG = []
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body=b'', ctype='application/json'):
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'xi-api-key, content-type, accept')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self): self._send(204)
    def do_GET(self):
        if self.path == '/log': return self._send(200, json.dumps(LOG).encode())
        if self.path == '/size': return self._send(200, json.dumps({'bytes': len(MP3)}).encode())
        self._send(404, b'{}')
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0)
        try: b = json.loads(self.rfile.read(n) or b'{}')
        except Exception: b = None
        if self.headers.get('xi-api-key') != 'test':
            return self._send(401, json.dumps({'detail': {'status': 'invalid_api_key', 'message': 'Invalid API key'}}).encode())
        if not self.path.startswith('/v1/music'): return self._send(404, b'{}')
        ok = isinstance(b, dict) and b.get('prompt') and isinstance(b.get('music_length_ms'), int) and b.get('model_id') and b.get('force_instrumental') is True and 'Instrumental only' in b['prompt']
        if not ok: return self._send(400, json.dumps({'detail': 'bad request shape'}).encode())
        LOG.append({'prompt': b['prompt'][:60], 'full_len': len(b['prompt']), 'ms': b['music_length_ms'], 'model': b['model_id'], 'instrumental': b['force_instrumental'], 'tail': b['prompt'][-40:]})
        return self._send(200, MP3, 'audio/mpeg')
if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8822
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
