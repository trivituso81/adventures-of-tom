#!/usr/bin/env python3
"""falq: the one place that talks to fal.ai's queue (artfallback1, 2026-11-21). Used by tools/art-library/wangen.py (the Wan proof jobs, Action
`wan-gen`) and tools/art-library/artgen.py (Art Library pictures when xAI has missed twice, Action `art-gen`). Never run on its own.

What is here: the queue client (price lookup, send, poll, download, with the key scrubbed from every message), the errors a caller tells apart
(Stop: stop this call; KeyRefused: the key was refused, stop everything; Refusal: fal turned the request down, a 4xx other than the key or a
rate limit; Gone: fal accepted it and then could not make it), data-address pictures, and the live price rule (the higher of the estimate and
fal's own unit price is what is booked). The money ledger and the cap stay with each caller: wangen keeps a ledger for the whole proof on
branch `wangen`, artgen keeps a per-run cap.

Env: WANGEN_POLL (seconds between status checks; tests set it small)."""
import os, time, json, base64

POLL_S = float(os.environ.get('WANGEN_POLL') or 5)
POLL_MAX_S = 20 * 60


def say(*a):
    print(time.strftime('%H:%M:%S'), *a, flush=True)


class Stop(Exception): pass
class KeyRefused(Stop): pass   # fal refused the key (401 or 403): no call of this run can work
class Refusal(Stop): pass      # fal turned the request down (a 4xx that is not the key and not a rate limit): nothing was charged
class Gone(Stop): pass   # the request is dead (fal reported an error): its pending record is dropped; the ledger keeps the estimate


def data_uri(png):
    return 'data:image/png;base64,' + base64.b64encode(png).decode()


def shown(body):
    return {k: ('<data uri, %d KB>' % (len(v) * 3 // 4 // 1024) if isinstance(v, str) and v.startswith('data:') else
                ['<data uri, %d KB>' % (len(x) * 3 // 4 // 1024) for x in v] if isinstance(v, list) and v and str(v[0]).startswith('data:') else v)
            for k, v in body.items()}


def apply_live(est, live, kind, duration=None):
    """The estimate after fal's own price is read (live = Fal.price()'s answer, or None): the higher of the two is what gets booked."""
    if not live: return est
    if kind == 'video' and live[1] and live[1].startswith('second'): return max(est, round(live[0] * float(duration), 4))
    if live[1] in ('image', 'images', 'video', 'videos'): return max(est, live[0])
    return est


def image_url(res):
    return ((res.get('images') or [{}])[0]).get('url')


class Fal:
    def __init__(self, key, queue, api):
        import requests
        self.key, self.queue, self.api, self.s = key, queue.rstrip('/'), api.rstrip('/'), requests.Session()
        self.hdr = {'Authorization': 'Key ' + key, 'Content-Type': 'application/json'}

    def clean(self, t):
        return str(t).replace(self.key, '[key]')[:400] if self.key else str(t)[:400]

    @staticmethod
    def shape_error(r):
        """fal's validation errors are a list of {loc, msg, type} (the field that is wrong); a refusal of the prompt itself is not."""
        try: d = r.json().get('detail')
        except Exception: return False
        return isinstance(d, list) and any(isinstance(x, dict) and 'loc' in x for x in d)

    def price(self, endpoint):
        """The live unit price (free call; also proves the key works). Returns (unit_price, unit) or None."""
        r = self.s.get(self.api + '/v1/models/pricing', params={'endpoint_id': endpoint}, headers=self.hdr, timeout=30)
        if r.status_code in (401, 403): raise KeyRefused('fal refused the key (%d): %s' % (r.status_code, self.clean(r.text)))
        if not r.ok: say('price lookup said %d: %s' % (r.status_code, self.clean(r.text))); return None
        p = (r.json().get('prices') or [None])[0]
        return (float(p['unit_price']), p.get('unit')) if p else None

    def send(self, endpoint, body):
        for tr in range(4):
            r = self.s.post(self.queue + '/' + endpoint, headers=self.hdr, data=json.dumps(body), timeout=180)
            if r.status_code in (429, 503) and tr < 3: time.sleep(int(r.headers.get('Retry-After') or 5)); continue   # not accepted: nothing charged
            break
        if r.status_code in (401, 403): raise KeyRefused('fal refused the key (%d): %s' % (r.status_code, self.clean(r.text)))
        if r.status_code == 422 and self.shape_error(r):   # the request body does not fit the model's schema: a bug to fix, not a refusal of the prompt
            raise Stop('fal said the request does not fit the model (422): %s' % self.clean(r.text))
        if 400 <= r.status_code < 500 and r.status_code != 429: raise Refusal('fal said %d: %s' % (r.status_code, self.clean(r.text)))   # artfallback1: the request itself was turned down
        if not r.ok: raise Stop('fal said %d: %s' % (r.status_code, self.clean(r.text)))
        j = r.json()
        if not j.get('request_id'): raise Stop('fal gave no request id: ' + self.clean(r.text))
        return {'rid': j['request_id'], 'status_url': j['status_url'], 'response_url': j['response_url']}

    def wait(self, pend, tell=None):
        t0 = time.time()
        while time.time() - t0 < POLL_MAX_S:
            try: r = self.s.get(pend['status_url'], headers=self.hdr, timeout=60)
            except Exception: time.sleep(POLL_S); continue
            if r.status_code in (401, 403): raise KeyRefused('fal refused the key while waiting (%d); the request is kept: run again' % r.status_code)
            j = r.json() if r.ok else {}
            if tell and j.get('status'):
                try: tell(j['status'])
                except Exception: pass
            if j.get('status') == 'COMPLETED':
                if j.get('error'): raise Gone('fal could not make it: %s' % self.clean(j.get('error')))
                break
            time.sleep(POLL_S)
        else: raise Stop('not ready after 20 minutes; the request is kept: run again (no new charge)')
        r = self.s.get(pend['response_url'], headers=self.hdr, timeout=120)
        if not r.ok: raise Stop('fal result said %d: %s' % (r.status_code, self.clean(r.text)))
        return r.json()

    def download(self, url):
        if url.startswith('data:'): return base64.b64decode(url.split(',', 1)[1])
        last = None
        for tr in range(5):
            try:
                r = self.s.get(url, timeout=300)
                if r.ok and len(r.content) > 1000: return r.content
                last = 'HTTP %d, %d bytes' % (r.status_code, len(r.content))
            except Exception as x: last = str(x)[:150]
            time.sleep(2 + 3 * tr)
        raise Stop('could not download the result (%s); the request is kept: run again (no new charge)' % last)
