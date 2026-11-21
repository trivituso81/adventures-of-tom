#!/usr/bin/env python3
"""Stand-in ElevenLabs server for the Voice Library tests (keysecrets3). No real key, no money.
Run: python3 tools/voice-library/stub.py [port]   (default 8832)
Answers (header xi-api-key must be 'test', else 401 like ElevenLabs):
  POST /v1/text-to-speech/<voice>?output_format=mp3_44100_128   body {text, model_id, voice_settings{stability, similarity_boost[, speed]}[, seed]}
  POST /v1/sound-generation?output_format=mp3_44100_128         body {text, duration_seconds, prompt_influence, model_id:'eleven_text_to_sound_v2'}
  POST /v1/speech-to-speech/<voice>?output_format=mp3_44100_128 multipart: audio (file), model_id 'eleven_english_sts_v2', voice_settings (json string), remove_background_noise 'true'
  GET  /v1/history?page_size=..[&start_after_history_item_id=..]  pages of {history:[{history_item_id, voice_id, text, date_unix}], has_more, last_history_item_id}
  GET  /log (every call received: path, voice, the body fields, the multipart fields), POST /config (see below), GET /size
Answers by the words of the text (markers in the text), so a test chooses what comes back:
  [LONG] a 14 second take (the voice looped); [TWICE] the phrase said twice with a pause between (the page called this a doubled take); otherwise one 1.5 second phrase.
  [FAIL402] answers 402; [FAIL401] answers 401; [REFUSE] answers 422 'text refused'; [BUSY] answers 429 on the first call of that text, then fine.
Voice ids: one that starts with 'gone' answers 404 (a deleted voice); everything else is fine.
POST /config {"seed": "reject"}  makes any tts body that holds a seed answer 400 'seed is not supported' (the page then sends it again without one);
              {"history": [...], "pages": n}  sets the history pages; {"history_fail": 403}  makes the history answer 403; {"reset": true} clears the log and the config."""
import io, json, os, subprocess, sys, tempfile
from email.parser import BytesParser
from email.policy import default as email_default
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import numpy as np

SR = 44100


def phrase(n_syl=4):
    """About 1.5 s of speech-like sound: four syllables (a tone with a rounded loudness shape that never reaches silence), tiny gaps between them."""
    out = []
    for i in range(n_syl):
        t = np.arange(int(SR * 0.28)) / SR
        env = (0.3 + 0.7 * np.sin(np.pi * t / 0.28) ** 2) * (0.6 + 0.1 * i)
        out.append(env * np.sin(2 * np.pi * (220 + 40 * i) * t)); out.append(np.zeros(int(SR * 0.05)))
    return np.concatenate(out)


def mp3_of(x):
    d = tempfile.mkdtemp(prefix='vstub-'); w, m = d + '/a.raw', d + '/a.mp3'
    open(w, 'wb').write((np.clip(x, -1, 1) * 30000).astype('<i2').tobytes())
    r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', w, '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', str(SR), m], capture_output=True)
    if r.returncode:
        import soundfile; soundfile.write(m, x, SR, format='MP3')
    return open(m, 'rb').read()


P = phrase()
SHORT = mp3_of(P)
TWICE = mp3_of(np.concatenate([P, np.zeros(int(SR * 0.55)), P]))
LONG = mp3_of(np.concatenate([P] * 9 + [np.zeros(int(SR * 0.3))] * 0))
SFX = mp3_of(P * 0.7)
LOG, CONF, SEEN = [], {}, {}


class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body=b'', ctype='application/json'):
        if not isinstance(body, bytes): body = json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', ctype); self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'xi-api-key, content-type, accept'); self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self): self._send(204)
    def _key(self): return self.headers.get('xi-api-key') == 'test'
    def _auth_fail(self): return self._send(401, {'detail': {'status': 'invalid_api_key', 'message': 'Invalid API key'}})
    def do_GET(self):
        if self.path == '/log': return self._send(200, LOG)
        if self.path == '/size': return self._send(200, {'short': len(SHORT), 'twice': len(TWICE), 'long': len(LONG)})
        if self.path.startswith('/v1/history'):
            if not self._key(): return self._auth_fail()
            if CONF.get('history_fail'): return self._send(CONF['history_fail'], {'detail': {'status': 'missing_permissions', 'message': 'The API key is missing the permission history_read'}})
            items = CONF.get('history') or []; per = max(1, (len(items) + CONF.get('pages', 1) - 1) // CONF.get('pages', 1)) if items else 1
            after = self.path.split('start_after_history_item_id=')[1].split('&')[0] if 'start_after_history_item_id=' in self.path else None
            i0 = 0
            if after:
                ids = [h['history_item_id'] for h in items]
                i0 = ids.index(after) + 1 if after in ids else len(items)
            page = items[i0:i0 + per]; more = i0 + per < len(items)
            LOG.append({'path': 'history', 'after': after, 'n': len(page)})
            return self._send(200, {'history': page, 'has_more': more, 'last_history_item_id': page[-1]['history_item_id'] if page else None})
        self._send(404, {})
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0); raw = self.rfile.read(n)
        if self.path == '/config':
            c = json.loads(raw or b'{}')
            if c.get('reset'): LOG.clear(); CONF.clear(); SEEN.clear()
            CONF.update({k: v for k, v in c.items() if k != 'reset'}); return self._send(200, {})
        if not self._key(): return self._auth_fail()
        path = self.path.split('?')[0]; q = self.path.split('?', 1)[1] if '?' in self.path else ''
        if q != 'output_format=mp3_44100_128': return self._send(400, {'detail': 'output_format must be mp3_44100_128, got %r' % q})
        if path.startswith('/v1/text-to-speech/'):
            voice = path.rsplit('/', 1)[1]
            try: b = json.loads(raw)
            except Exception: return self._send(400, {'detail': 'not json'})
            vs = b.get('voice_settings') or {}
            if not (isinstance(b.get('text'), str) and b['text'].strip() and b.get('model_id') and isinstance(vs.get('stability'), (int, float)) and isinstance(vs.get('similarity_boost'), (int, float))):
                return self._send(400, {'detail': 'bad request shape'})
            LOG.append({'path': 'tts', 'voice': voice, 'text': b['text'], 'model_id': b['model_id'], 'voice_settings': vs, 'seed': b.get('seed', 'none'), 'accept': self.headers.get('Accept')})
            if voice.startswith('gone'): return self._send(404, {'detail': {'status': 'voice_not_found', 'message': 'A voice with the voice_id %s was not found.' % voice}})
            if b.get('seed') is not None and CONF.get('seed') == 'reject': return self._send(400, {'detail': {'status': 'invalid', 'message': 'seed is not supported for this model'}})
            t = b['text']
            if '[FAIL401]' in t: return self._auth_fail()
            if '[FAIL402]' in t: return self._send(402, {'detail': {'status': 'quota_exceeded', 'message': 'You have 0 credits remaining'}})
            if '[REFUSE]' in t: return self._send(422, {'detail': [{'msg': 'text refused'}]})
            if '[BUSY]' in t:
                SEEN[t] = SEEN.get(t, 0) + 1
                if SEEN[t] == 1: return self._send(429, {'detail': {'status': 'too_many_concurrent_requests', 'message': 'Too many concurrent requests'}})
            if '[LONG]' in t: return self._send(200, LONG, 'audio/mpeg')
            if '[TWICE]' in t and SEEN.setdefault('twice' + t, 0) < CONF.get('twice_times', 99):
                SEEN['twice' + t] += 1; return self._send(200, TWICE, 'audio/mpeg')
            return self._send(200, SHORT, 'audio/mpeg')
        if path == '/v1/sound-generation':
            try: b = json.loads(raw)
            except Exception: return self._send(400, {'detail': 'not json'})
            if not (b.get('text') and isinstance(b.get('duration_seconds'), (int, float)) and isinstance(b.get('prompt_influence'), (int, float)) and b.get('model_id') == 'eleven_text_to_sound_v2'):
                return self._send(400, {'detail': 'bad request shape'})
            LOG.append({'path': 'sfx', 'text': b['text'], 'duration_seconds': b['duration_seconds'], 'prompt_influence': b['prompt_influence'], 'model_id': b['model_id']})
            return self._send(200, SFX, 'audio/mpeg')
        if path.startswith('/v1/speech-to-speech/'):
            voice = path.rsplit('/', 1)[1]
            msg = BytesParser(policy=email_default).parsebytes(b'Content-Type: ' + self.headers['Content-Type'].encode() + b'\r\n\r\n' + raw)
            fields, audio = {}, None
            for part in msg.iter_parts():
                nm = part.get_param('name', header='content-disposition')
                if part.get_filename(): audio = {'filename': part.get_filename(), 'type': part.get_content_type(), 'bytes': len(part.get_payload(decode=True))}
                else: fields[nm] = part.get_content()
            if not (audio and audio['bytes'] > 0 and fields.get('model_id') == 'eleven_english_sts_v2' and fields.get('remove_background_noise') == 'true' and fields.get('voice_settings')):
                return self._send(400, {'detail': 'bad request shape'})
            LOG.append({'path': 'sts', 'voice': voice, 'audio': audio, 'model_id': fields['model_id'], 'voice_settings': json.loads(fields['voice_settings']), 'remove_background_noise': fields['remove_background_noise']})
            if voice.startswith('gone'): return self._send(404, {'detail': {'status': 'voice_not_found', 'message': 'voice not found'}})
            return self._send(200, SHORT, 'audio/mpeg')
        self._send(404, {})


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8832
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
