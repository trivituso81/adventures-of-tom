#!/usr/bin/env python3
"""Clip quality gate, vision part (clipgate2).

Asks an xAI vision model the questions the measured gate cannot answer: faces, what a pose reads as, objects and body
parts, monster eyes and drops. Plan and pass bar: claude/clip-gate-plan.md section 4.

  python3 -I tools/clip-gate/vision.py [--group "Chapter 1"] [--ids a,b] [--runs 3] [--cap 1.8] [--cache DIR]
                                       [--out vision.json] [--model ID] [--dry-run] [--images DIR]

Env: XAI_API_KEY (never printed), XAI_BASE (test stand-in, default https://api.x.ai).
Per clip: the pictures the game shows (gate.played, loops forward then back) as a grid on grey with the game time under
each, plus a second picture (the start picture large and a strip of head crops), a move card written as a rule for that KIND
of move (never from the clip's own review note), and a fixed checklist answered as JSON {id: {yes, why}} (yes = fine).
The model also describes the action blind first (one sentence, before it reads the card).
Money: the spend is counted from the usage xAI returns (cost_in_usd_ticks when present, else the model's listed prices,
else a pessimistic price) and the run stops before a call that could pass --cap. Runs go round-robin (run 1 over all clips,
then run 2, ...) so a stop still leaves whole runs. Answers are kept in --out as they arrive; a rerun with the same --out
skips calls already paid for.
Library: build_images(entry, meas, hd) -> (grid_jpeg, head_jpeg, info); questions(owner, move, kind); card(owner, move, kind);
         ask(...); verdict(answers) -> majority.
"""
import base64, io, json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

PEOPLE = {'tom', 'grace', 'rose', 'deedee', 'amy', 'tnb', 'boppy', 'justin'}

# ---------------------------------------------------------------- the questions (yes = fine, no = a fault)
Q = {
    # every person clip
    'p_same': 'In every picture, is it the same person as the start picture, with the same face, hair and outfit?',
    'p_noobj': 'Is every object the figure holds or that appears in the pictures named by the move card? Answer no if something shows up that the card does not name (a prop, an extra limb, glasses, a tool).',
    'p_parts': 'Do the hands, glasses (if any) and skin keep the same colour and shape as in the start picture? Answer no if hands, skin or glasses change colour or shape, or the eyes change.',
    # idle
    'i_blink': 'Is there a quick blink: the eyes close and open again within about two pictures?',
    'i_relaxed': 'Does the figure stay in a relaxed upright stance like the start picture, with no leaning back or odd new pose?',
    # monster idle
    'm_animated': 'Does something visibly move (breathing, a blink, the top of the body)?',
    'm_blink_quick': 'Is the blink quick, the eyes closing and opening again within about two pictures, not a slow close?',
    'm_pupils': 'Do the pupils stay still apart from one quick glance, with no pupils moving one way and then sliding back the way they came?',
    'm_drops': 'Do drips and drops only move downward, never bouncing back up?',
    # guard
    'g_cover': 'Do both forearms come up in front so that the face and the chest are covered, like a shield (not a push or a reach)?',
    # hit
    'h_grimace': 'Does the face wince or grimace (eyes squeezed shut, mouth tight) at the moment of the hit?',
    'h_stagger': 'Does the body stagger backwards (away from the way it faces, so to the right, as the figure faces left)?',
    # dodge
    'd_back': 'Does the figure move away from the front (back or to the side), with no leaning or stepping forward and no leg sweeping forward?',
    # ko
    'k_dizzy': 'Before the figure falls, does the face look dizzy or woozy (swirly or crossed eyes, wobbling)?',
    'k_nohop': 'Before the fall there is no jumping or bouncing up and down?',
    'k_back': 'Does the figure fall backwards and end lying on its back with the head toward the back (to the right, as the figure faces left)?',
    # run
    'r_stride': 'Does it read as running: long alternating strides with swinging arms (not high knees like a warm-up, not skipping)?',
    # victory
    'v_big': 'Is it a big celebration: arms thrown up, a jump or a cheer, a big happy face (not a mild gesture)?',
    # named moves
    'n_name': 'Could a stranger who sees only these pictures name the move on the card? Does what you see match the card, with the key object visible?',
    'n_nowave': 'Is the action deliberate, with a clear beginning, peak and end (not random waving or flailing)?',
}

MOVE_KIND = {
    'idle': 'idle', 'guard': 'guard', 'hit': 'hit', 'dodge': 'dodge', 'ko': 'ko', 'run': 'run', 'victory': 'victory',
}

CARDS = {
    'guard': 'Guard: the character braces to block an attack. Both forearms are raised to cover the face and chest like a shield.',
    'hit': 'Hit: the character is struck. The face winces and the body staggers backwards, then recovers.',
    'dodge': 'Dodge: the character avoids an attack by moving back or to the side.',
    'ko': 'Knocked out: the character gets dizzy, falls over backwards, lies on the back and stays down.',
    'run': 'Run: the character runs in place with long alternating strides and swinging arms, like a sprint.',
    'victory': 'Victory: a big celebration after winning (arms up, a jump or a cheer).',
    'cast': 'Cast: the character casts a helping spell. It reads as a deliberate cast with a clear start, peak and end, not as waving.',
    'give': 'Give: the character hands an item to a friend. The reaching hand holds something and offers it.',
    'loungepass': 'Lounge Pass Flex: Tom presents a lounge pass card, showing it off to someone in front of him.',
    'blockade': 'Zone One Blockade: Tom throws his body into the way, a hip check that blocks the path.',
    'squeeze': 'Soup Dumpling Squeeze: Grace squeezes a squishy dumpling toy hard with a delighted grin.',
    'cubepop': 'Crunchy Sugar Cube Pop: Grace crushes a small clear squishy cube in her fist.',
    'tackle': 'Lamb Tuck Ankle Tackle: Rose lunges low and forward to tackle at ankle height.',
    'lava': 'The Floor Is Lava: Rose hops to keep her feet off the floor, like the game, with a playful balancing move.',
    'giddyup': 'Giddyup Tata Launch: Rose launches herself high into the air like a cannonball.',
    'wetfloor': 'Wet Floor Hazard: Deedee mops the floor in front of her to make it wet and slippery.',
    'scrub': 'Hand Me My Glasses Scrub: Deedee puts on her reading glasses and scrubs forward with a household tool.',
    'idle': 'Idle: the character stands relaxed, breathes slowly and blinks quickly now and then. The pose never changes.',
    'monster_idle': 'Idle of a monster: it waits in place, breathing slowly, with one quick blink and a glance. Nothing falls off it.',
}


def questions(owner, move, kind):
    """The checklist ids for this clip."""
    person = owner in PEOPLE
    ids = []
    if person:
        ids += ['p_same', 'p_noobj', 'p_parts']
    if move == 'idle':
        ids += ['i_blink', 'i_relaxed'] if person else ['m_animated', 'm_blink_quick', 'm_pupils', 'm_drops']
    elif move == 'guard':
        ids += ['g_cover']
    elif move == 'hit':
        ids += ['h_grimace', 'h_stagger'] if person else []
    elif move == 'dodge':
        ids += ['d_back']
    elif move == 'ko':
        ids += ['k_dizzy', 'k_nohop', 'k_back'] if person else []
    elif move == 'run':
        ids += ['r_stride']
    elif move == 'victory':
        ids += ['v_big']
    elif person:
        ids += ['n_name', 'n_nowave']
    return ids


def card(owner, move, kind):
    if move == 'idle' and owner not in PEOPLE:
        return CARDS['monster_idle']
    return CARDS.get(move) or 'Move: ' + move


# ---------------------------------------------------------------- pictures
def _imports():
    import numpy as np, cv2
    from PIL import Image, ImageDraw
    import measure
    return np, cv2, Image, ImageDraw, measure


def _label(img, text, Image, ImageDraw):
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, img.width, 18], fill=(255, 255, 255))
    d.text((3, 3), text, fill=(0, 0, 0))


def pick(pl, n=12, extra=()):
    """Positions in the played list: n evenly spaced (first and last included) plus the extra ones, in order."""
    L = len(pl)
    if L <= n:
        pos = list(range(L))
    else:
        pos = sorted({round(i * (L - 1) / (n - 1)) for i in range(n)})
    return sorted(set(pos) | {e for e in extra if 0 <= e < L})


def build_images(e, meas, hd, gate_mod, video=None, jpeg_q=86):
    """Returns (grid_jpeg_bytes, head_jpeg_bytes, info). Needs the raw video (decoded again here)."""
    np, cv2, Image, ImageDraw, measure = _imports()
    kind = e['clip'].get('kind') or 'strike'
    F, fps = measure.frames(video or meas['video'])
    mf = meas['frames']
    pl = gate_mod.played(hd, meas['fps'], kind) if hd else [(i, 1 / meas['fps']) for i in range(len(mf))]
    pl = [(i, dt) for i, dt in pl if i < len(F) and i < len(mf) and not mf[i].get('empty')]
    ts, t = [], 0.0
    for _, dt in pl:
        ts.append(t); t += dt
    half = None
    if kind == 'loop' and hd:
        n_fwd = len(gate_mod.played(hd, meas['fps'], 'strike'))
        half = n_fwd
    h0 = meas['first']['h']
    extra = []
    ev = [(k, (mf[i].get('eye') or 0)) for k, (i, _) in enumerate(pl)]
    if ev:
        extra.append(max(ev, key=lambda x: x[1])[0])                       # the eye event
    tops = [(k, mf[i]['top']) for k, (i, _) in enumerate(pl)]
    t0 = meas['first']['top']
    for k, tp in tops:
        if (tp - t0) / h0 > .15:                                           # the fall starts
            extra += [max(0, k - 1), k]
            break
    cxs = [(k, mf[i]['cx']) for k, (i, _) in enumerate(pl)]
    if cxs:
        extra += [max(cxs, key=lambda x: x[1])[0], min(cxs, key=lambda x: x[1])[0]]
    pos = pick(pl, 12, extra[:4])
    pos = pos[:16]
    masks = {}
    for p in pos:
        masks[p] = measure.key(F[pl[p][0]])
    m00 = measure.key(F[0])
    ys = np.concatenate([np.nonzero(m.any(1))[0] for m in list(masks.values()) + [m00]])
    xs = np.concatenate([np.nonzero(m.any(0))[0] for m in list(masks.values()) + [m00]])
    Hh, Ww = F.shape[1:3]
    pad = int(.05 * h0)
    y0, y1 = max(0, int(ys.min()) - pad), min(Hh, int(ys.max()) + pad + 1)
    x0, x1 = max(0, int(xs.min()) - pad), min(Ww, int(xs.max()) + pad + 1)

    def cut(fi, m):
        im = F[fi].copy()
        bg = ~cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)   # one pixel in: the magenta edge goes grey
        im[bg] = (128, 128, 128)
        return Image.fromarray(im[y0:y1, x0:x1])

    cw = 256
    s = cw / (x1 - x0)
    ch = int((y1 - y0) * s)
    cols = 4
    rows = (len(pos) + cols - 1) // cols
    grid = Image.new('RGB', (cols * cw, rows * (ch + 18)), (128, 128, 128))
    for k, p in enumerate(pos):
        fi = pl[p][0]
        c = cut(fi, masks[p]).resize((cw, ch), Image.LANCZOS)
        cell = Image.new('RGB', (cw, ch + 18), (128, 128, 128))
        cell.paste(c, (0, 18))
        tag = 'back' if (half is not None and p >= half) else ''
        _label(cell, f'{k + 1}  t={ts[p]:.2f}s {tag}'.strip(), Image, ImageDraw)
        grid.paste(cell, ((k % cols) * cw, (k // cols) * (ch + 18)))
    # image 2: the start picture large, then head crops (8 of the pictures, following each picture's own top)
    big_h = 384
    start = cut(0, m00)
    start = start.resize((int(start.width * big_h / start.height), big_h), Image.LANCZOS)
    hp = pick(pl, 8, [q for q in extra[:2]])[:8]
    side = max(8, int(.34 * h0))
    heads = []
    for p in hp:
        fi = pl[p][0]
        m = masks.get(p)
        if m is None:
            m = measure.key(F[fi])
        yy, xx = np.nonzero(m)
        top = int(yy.min())
        rowsel = yy < top + int(.26 * h0)
        cx = int(xx[rowsel].mean()) if rowsel.any() else int(xx.mean())
        ya = max(0, top - int(.03 * h0)); xa = max(0, cx - side // 2)
        ya = min(ya, Hh - side); xa = min(xa, Ww - side)
        im = F[fi].copy()
        bg = ~cv2.erode(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)   # one pixel in: the magenta edge goes grey
        im[bg] = (128, 128, 128)
        c = Image.fromarray(im[ya:ya + side, xa:xa + side]).resize((cw, cw), Image.LANCZOS)
        cell = Image.new('RGB', (cw, cw + 18), (128, 128, 128)); cell.paste(c, (0, 18))
        _label(cell, f'head  t={ts[p]:.2f}s', Image, ImageDraw)
        heads.append(cell)
    img2 = Image.new('RGB', (cols * cw, big_h + 18 + 2 * (cw + 18)), (128, 128, 128))
    cell = Image.new('RGB', (start.width, big_h + 18), (128, 128, 128)); cell.paste(start, (0, 18))
    _label(cell, 'start picture', Image, ImageDraw)
    img2.paste(cell, ((img2.width - start.width) // 2, 0))
    for k, c in enumerate(heads):
        img2.paste(c, ((k % cols) * cw, big_h + 18 + (k // cols) * (cw + 18)))

    def jpg(im):
        b = io.BytesIO(); im.save(b, 'JPEG', quality=jpeg_q); return b.getvalue()
    return jpg(grid), jpg(img2), {'pictures': len(pos), 'game_times': [round(ts[p], 2) for p in pos], 'grid': grid.size, 'second': img2.size,
                                  'game_seconds': round(t, 2)}


# ---------------------------------------------------------------- the model
SYSTEM = ('You are a careful animation reviewer for a children\'s video game. You look at pictures taken from a short clip of a '
          'hand-painted cartoon character on a grey background and answer yes/no questions about them. Answer from what you see in the '
          'pictures only. Reply with JSON and nothing else.')


def prompt_text(owner, move, kind, qids, info):
    ql = '\n'.join(f'- {q}: {Q[q]}' for q in qids)
    return (f'Image 1 is the clip as the game shows it: {info["pictures"]} pictures in time order (left to right, top to bottom), '
            f'each labelled with its game time in seconds. A label ending in "back" is a picture of the loop playing backwards. '
            f'The figure faces left at the start. Image 2 is the start picture large, then close crops of the head at several times.\n\n'
            f'MOVE CARD (what this clip is meant to be): {card(owner, move, kind)}\n\n'
            'First, before using the card, describe in one sentence what the figure actually does. Then answer each question with yes '
            '(fine) or no (a fault), with a short reason of at most 20 words.\n\nQUESTIONS\n' + ql + '\n\n'
            'Reply as JSON: {"describe": "...", "answers": {"<question id>": {"yes": true or false, "why": "..."}, ...}}')


class Xai:
    def __init__(self, key, base):
        self.key, self.base = key, base.rstrip('/')

    def _post(self, path, body, tries=3):
        import requests
        last = None
        for k in range(tries):
            try:
                r = requests.post(self.base + path, json=body, headers={'Authorization': 'Bearer ' + self.key}, timeout=180)
            except Exception as ex:
                last = str(type(ex).__name__); time.sleep(3 * (k + 1)); continue
            if r.status_code in (429, 500, 502, 503):
                last = 'HTTP %d' % r.status_code; time.sleep(5 * (k + 1)); continue
            return r
        raise RuntimeError('xAI did not answer: ' + str(last))

    def models(self):
        import requests
        r = requests.get(self.base + '/v1/language-models', headers={'Authorization': 'Bearer ' + self.key}, timeout=60)
        if r.status_code == 401:
            raise SystemExit('xAI refused the key (401). Check the repo secret XAI_API_KEY.')
        r.raise_for_status()
        return r.json().get('models', [])

    def chat(self, model, images, text):
        content = [{'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + base64.b64encode(b).decode(), 'detail': 'high'}} for b in images]
        content.append({'type': 'text', 'text': text})
        body = {'model': model, 'messages': [{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': content}],
                'response_format': {'type': 'json_object'}, 'max_tokens': 1500}
        r = self._post('/v1/chat/completions', body)
        if r.status_code == 400 and 'response_format' in r.text:
            body.pop('response_format')
            r = self._post('/v1/chat/completions', body)
        if r.status_code == 401:
            raise SystemExit('xAI refused the key (401). Check the repo secret XAI_API_KEY.')
        if r.status_code >= 400:
            raise RuntimeError('xAI chat HTTP %d: %s' % (r.status_code, r.text[:300]))
        return r.json()


def pick_model(models, want=None):
    """The cheapest model that takes image input and does not reason (its reasoning tokens would be billed as output).
    models: the /v1/language-models list. Returns (id, price_in_per_M, price_out_per_M or None)."""
    def ok(m):
        return 'image' in (m.get('input_modalities') or [])
    def price(m):
        # xAI lists prices in 1e-2 cent per 1M?? Unit is not relied on: only the ORDER of prices is used here.
        return (m.get('prompt_text_token_price') or 10 ** 9, m.get('completion_text_token_price') or 10 ** 9)
    if want:
        for m in models:
            if m.get('id') == want or want in (m.get('aliases') or []):
                return m
        raise SystemExit('Model %s is not in the xAI list.' % want)
    c = [m for m in models if ok(m)]
    nr = [m for m in c if 'non-reasoning' in m.get('id', '')]
    pool = nr or c
    if not pool:
        raise SystemExit('No xAI model with image input found in /v1/language-models.')
    return min(pool, key=price)


def parse(txt):
    t = (txt or '').strip()
    if t.startswith('```'):
        t = t.strip('`')
        t = t[t.find('{'):]
    a, b = t.find('{'), t.rfind('}')
    d = json.loads(t[a:b + 1])
    ans = {}
    for k, v in (d.get('answers') or {}).items():
        if isinstance(v, dict):
            y = v.get('yes')
            if isinstance(y, str):
                y = y.strip().lower() in ('yes', 'true')
            ans[k] = {'yes': bool(y), 'why': str(v.get('why', ''))[:200]}
        elif isinstance(v, bool):
            ans[k] = {'yes': v, 'why': ''}
    return str(d.get('describe', ''))[:400], ans


def usd(usage, model):
    """Dollars of one call. cost_in_usd_ticks (1e-10 dollars) when xAI sends it, else tokens at a pessimistic $5 in / $15 out per M."""
    if usage and usage.get('cost_in_usd_ticks') is not None:
        return usage['cost_in_usd_ticks'] / 1e10
    pt, ct = (usage or {}).get('prompt_tokens', 0), (usage or {}).get('completion_tokens', 0)
    return pt * 5e-6 + ct * 15e-6


def verdict(runs, qids):
    """runs: list of {qid: {yes, why}}. Majority per question (a tie counts as no, the stricter reading)."""
    out = {}
    for q in qids:
        v = [r[q]['yes'] for r in runs if q in r]
        if not v:
            continue
        y = sum(v)
        out[q] = {'yes': y * 2 > len(v), 'votes_yes': y, 'of': len(v), 'why': [r[q]['why'] for r in runs if q in r and not r[q]['yes']][:2]}
    return out


def main():
    import gate
    a = sys.argv[1:]
    def opt(k, d=None):
        return a[a.index(k) + 1] if k in a else d
    group, ids = opt('--group', 'Chapter 1'), opt('--ids')
    runs_n, cap = int(opt('--runs', 3)), float(opt('--cap', 1.8))
    cache, out, want, imgdir = opt('--cache'), opt('--out', 'vision.json'), opt('--model'), opt('--images')
    dry = '--dry-run' in a
    from measure import measure
    d = json.load(open('data/art-prompts.json', encoding='utf-8'))
    E = [e for e in d['entries'] if e.get('group') == group and e.get('clip') and e.get('versions')]
    if ids:
        E = [e for e in E if e['id'] in set(ids.split(','))]
    key = os.environ.get('XAI_API_KEY', '')
    if not key and not dry:
        raise SystemExit('XAI_API_KEY is empty or missing.')
    xai = Xai(key, os.environ.get('XAI_BASE', 'https://api.x.ai'))
    state = json.load(open(out)) if os.path.exists(out) else {'model': None, 'spent': 0.0, 'calls': 0, 'tokens': {'in': 0, 'out': 0}, 'clips': {}}
    model = want or state.get('model')
    if not dry and not model:
        m = pick_model(xai.models())
        model = m['id']
    if dry:
        model = model or '(chosen at run time from /v1/language-models)'
    state['model'] = model
    print('model', model, '| cap $%.2f' % cap, '| runs', runs_n, '| clips', len(E), flush=True)
    prep = {}
    for e in E:
        vid = e['versions'][-1]['file'].replace('.json', '.mp4')
        cp = os.path.join(cache, e['id'] + '.json') if cache else None
        if cp and os.path.exists(cp):
            meas = json.load(open(cp))
        else:
            meas = measure(vid)
            if cp:
                os.makedirs(cache, exist_ok=True); json.dump(meas, open(cp, 'w'))
        hd = gate.baked_header(e['clip']['id'])
        o, mv = gate.owner_move(e)
        kind = e['clip'].get('kind') or 'strike'
        g, h, info = build_images(e, meas, hd, gate, video=vid)
        if imgdir:
            os.makedirs(imgdir, exist_ok=True)
            open(os.path.join(imgdir, e['id'] + '-grid.jpg'), 'wb').write(g)
            open(os.path.join(imgdir, e['id'] + '-head.jpg'), 'wb').write(h)
        qids = questions(o, mv, kind)
        prep[e['id']] = (g, h, info, o, mv, kind, qids)
    if dry:
        n = sum(1 for p in prep.values() if p[6])
        print(f'dry run: {n} clips with questions, {n * runs_n} calls; images in {imgdir}')
        return
    stop = False
    for r in range(runs_n):
        for e in E:
            c = state['clips'].setdefault(e['id'], {'runs': []})
            if len(c['runs']) > r or stop:
                continue
            g, h, info, o, mv, kind, qids = prep[e['id']]
            if not qids:
                continue
            avg = state['spent'] / state['calls'] if state['calls'] else .02
            if state['spent'] + max(avg * 1.5, .01) > cap:
                print('STOP: the next call could pass the cap of $%.2f (spent $%.3f)' % (cap, state['spent']), flush=True)
                stop = True
                continue
            resp = xai.chat(model, [g, h], prompt_text(o, mv, kind, qids, info))
            u = resp.get('usage') or {}
            cost = usd(u, model)
            state['spent'] = round(state['spent'] + cost, 6); state['calls'] += 1
            state['tokens']['in'] += u.get('prompt_tokens', 0); state['tokens']['out'] += u.get('completion_tokens', 0)
            try:
                desc, ans = parse(resp['choices'][0]['message']['content'])
            except Exception as ex:
                desc, ans = 'PARSE FAILED: ' + type(ex).__name__, {}
            c['runs'].append({'describe': desc, 'answers': ans, 'usage': u, 'usd': round(cost, 6)})
            json.dump(state, open(out, 'w'), indent=1)
            print(f'run {r + 1} {e["id"]:24s} ${cost:.4f}  total ${state["spent"]:.3f}  tokens {u.get("prompt_tokens")}/{u.get("completion_tokens")}', flush=True)
    for e in E:
        c = state['clips'].get(e['id'])
        if c and c['runs']:
            c['verdict'] = verdict([r['answers'] for r in c['runs']], prep[e['id']][6])
            c['flags'] = sorted(q for q, v in c['verdict'].items() if not v['yes'])
    json.dump(state, open(out, 'w'), indent=1)
    print('DONE calls %d spent $%.3f tokens in %d out %d' % (state['calls'], state['spent'], state['tokens']['in'], state['tokens']['out']))


if __name__ == '__main__':
    main()
