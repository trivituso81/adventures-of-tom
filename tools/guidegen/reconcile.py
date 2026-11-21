#!/usr/bin/env python3
"""guidegen1b: fold Tom's note into a video prompt with the smallest change, and check the result in code.

  python3 -I tools/guidegen/reconcile.py --requests [--out DIR] [--model ID] [--dry-run]
      works through data/guide-reconcile.json (what UPDATE THE PROMPT in the Battle Guide asked for), empties the queue on main BEFORE it
      pays, and writes one answer per request to DIR/reconcile/<slug>.json (the workflow keeps DIR on the branch `guidegen`).
  python3 -I tools/guidegen/reconcile.py --replay [--cap 0.6] [--out FILE] [--model ID] [--dry-run]
      replays Tom's chapter 1 REDO notes (data/art-prompts.json rejects from the review), the Boop history of CLAUDE.md and a few notes that
      cannot be done, through the same code, and reports how many came back as a clean small edit (plan section 8).

The text model is xAI's, with the repo secret XAI_API_KEY that the clip gate already uses (same client as tools/clip-gate/vision.py). No new key.
Env: XAI_API_KEY (never printed), XAI_BASE (test stand-in, default https://api.x.ai).

Library:
  split(prompt) -> [(label, text)]          parts of a prompt by their labels
  check(old, new, claimed, kind) -> [why]   the smallest-change rules, run on the model's answer in code (empty list = fine)
  reconcile(ask, old, note, ctx) -> dict    asks, checks, sends a broken answer back once, marks a second failure `check`
  ask is a function (system, user) -> (text, usage dollars); the dict is {ok, question, prompt, kept, changed, unused, check, why, spent, tries}
"""
import json, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))

BANNED = ['16-bit', '32-bit', 'snes', 'super nintendo', 'pixel art', 'retro', 'sprite', 'final fantasy', 'chrono trigger']
HEAD_PARTS = ('WHAT THIS IS', 'LOOK', 'CAMERA AND BACKGROUND')
FROZEN = ('PREAMBLE', 'TAIL')

SYSTEM = """You edit ONE video prompt for a family role-playing game. The prompt makes a short video of a hand-painted character or creature from a start picture.
You get: the CURRENT PROMPT (three or four labelled parts), TOM'S NOTE about the animation (what he saw, or what he wants), and whether a video of it already exists.
Your job is the SMALLEST CHANGE that carries his note, and an honest check that it makes sense.

Rules (all of them):
1. Start from the current prompt. Change only what the note names. Copy every other word exactly, including every part the note does not touch.
2. Almost always only the MOTION part changes. Change WHAT THIS IS, LOOK or CAMERA AND BACKGROUND only when the note is about the picture itself (the face, glasses, size, facing, feet, background). Never change the first line or the last line.
3. MOTION says each action once, names how many times, and ends in a pose that is held. Never describe one action two ways: that comes back as two actions. Keep "once" and "without repeating" where the current prompt has them.
4. Keep the rules that hold the picture steady: facing, feet planted on the same spot, locked camera, flat magenta background, silent.
5. A note about one fault is not a new rule for everything. "Too long" means cut the repeats, not cut it to a fifth. Do not turn a note into "never X" unless he said never.
6. Keep at least 70% of the current words of any part you change, and keep that part within 20% of its length.
7. Never use these words: 16-bit, 32-bit, SNES, Super Nintendo, pixel art, retro, Final Fantasy, Chrono Trigger. Do not add the word sprite.
8. Plain words, no em dashes.

If the note cannot be carried, do NOT guess. Ask ONE short plain question instead of writing a prompt, when the note contradicts itself or the current prompt, asks for something a silent locked-camera clip cannot show (sound, a camera move, a second character, a different face or outfit), or says only that it is bad or unclear with nothing to change ("complete fail", "I don't know what this is").

Reply with JSON only:
{"question": null or "one short plain question",
 "prompt": "the complete new prompt, every part, or null when you ask a question",
 "changed_parts": ["MOTION"],   (labels of the parts you changed: MOTION, WHAT THIS IS, LOOK, CAMERA AND BACKGROUND)
 "kept": "one plain line: what stayed the same",
 "changed": "one plain line: what changed and why it carries his note",
 "unused": "one plain line: any part of his note you could not use and why, or \\"nothing\\""}"""


# ---------------------------------------------------------------- parts and the checks
def split(prompt):
    """Blocks split on blank lines. A block is labelled by its first line when that is ALL CAPS (a parenthesis after it is dropped) or starts with MOTION:.
    The first block is PREAMBLE, an unlabelled block after MOTION is TAIL."""
    out = []
    for i, b in enumerate(re.split(r'\n\s*\n', prompt.strip())):
        first = b.split('\n', 1)[0].strip()
        m = re.match(r'^([A-Z][A-Z ]+?)(?: \(.*\))?$', first)
        if i == 0: lab = 'PREAMBLE'
        elif first.startswith('MOTION:'): lab = 'MOTION'
        elif m: lab = m.group(1).strip()
        else: lab = 'TAIL' if any(l == 'MOTION' for l, _ in out) else 'PREAMBLE'
        out.append((lab, b.strip()))
    return out


def words(t):
    return re.findall(r"[a-z0-9']+", t.lower())


def kept_share(old, new):
    from collections import Counter
    a, b = Counter(words(old)), Counter(words(new))
    return sum((a & b).values()) / max(1, sum(a.values()))


def ngram_repeat(t, n=6):
    w = words(t); seen = set()
    for i in range(len(w) - n + 1):
        g = tuple(w[i:i + n])
        if g in seen: return True
        seen.add(g)
    return False


def check(old, new, claimed, kind='family'):
    """The smallest-change rules. Returns the list of what is wrong (empty: fine)."""
    why = []
    o, n = split(old), split(new)
    ol, nl = [l for l, _ in o], [l for l, _ in n]
    if ol != nl:
        return ['the parts are not the same, in the same order, as the current prompt (current: %s; new: %s)' % (', '.join(ol), ', '.join(nl))]
    od, nd = dict(o), dict(n)
    changed = [l for l in ol if od[l] != nd[l]]
    if not changed: why.append('nothing changed, so the note was not carried')
    for l in changed:
        if l in FROZEN: why.append('the %s part must be copied exactly' % l.lower())
    claimed = [c for c in (claimed or []) if c]
    if sorted(changed) != sorted(set(claimed)):
        why.append('the parts that changed (%s) are not the parts named as changed (%s)' % (', '.join(changed) or 'none', ', '.join(claimed) or 'none'))
    for l in changed:
        if l in FROZEN: continue
        a, b = od[l], nd[l]
        if kept_share(a, b) < 0.7: why.append('%s keeps only %d%% of its current words (needs 70%%)' % (l, round(100 * kept_share(a, b))))
        la, lb = len(words(a)), len(words(b))
        if not (0.8 * la - 8 <= lb <= max(1.2 * la, la + 15)): why.append('%s went from %d to %d words (must stay within 20%%)' % (l, la, lb))
    mo, mn = od.get('MOTION', ''), nd.get('MOTION', '')
    if mn:
        for ph in ('once', 'without repeating'):
            if ph in mo.lower() and ph not in mn.lower(): why.append('MOTION lost "%s"' % ph)
        sents = [re.sub(r'\W+', ' ', s).strip().lower() for s in re.split(r'(?<=[.!?])\s+', mn) if s.strip()]
        if len(sents) != len(set(sents)) or (ngram_repeat(mn) and not ngram_repeat(mo)): why.append('MOTION says something twice, which comes back as two actions')
    if set(changed) & set(HEAD_PARTS):
        low = new.lower()
        for need in (('magenta',), ('facing', 'faces', 'turned to', 'viewing angle')):
            if not any(x in low for x in need): why.append('the rules that hold the picture steady lost "%s"' % need[0])
        if kind == 'family' and 'planted' not in low: why.append('the rules that hold the picture steady lost the planted feet')
    bad = [b for b in BANNED if b in new.lower() and b not in old.lower()]
    if bad: why.append('new words that are not allowed: ' + ', '.join(bad))
    if '—' in new or '–' in new: why.append('a dash character was used')
    return why


# ---------------------------------------------------------------- asking
def parse(txt):
    t = (txt or '').strip()
    if t.startswith('```'): t = t.strip('`'); t = t[t.find('{'):]
    d = json.loads(t[t.find('{'):t.rfind('}') + 1])
    q = d.get('question')
    q = q.strip() if isinstance(q, str) and q.strip() and q.strip().lower() not in ('null', 'none') else None
    p = d.get('prompt')
    return {'question': q, 'prompt': p.strip() if isinstance(p, str) and p.strip() else None,
            'claimed': d.get('changed_parts') if isinstance(d.get('changed_parts'), list) else [],
            'kept': str(d.get('kept') or '')[:300], 'changed': str(d.get('changed') or '')[:300], 'unused': str(d.get('unused') or 'nothing')[:300]}


def user_text(old, note, ctx):
    return ('KIND: %s\nA VIDEO OF THIS ANIMATION %s.\n\nCURRENT PROMPT\n%s\n\nTOM\'S NOTE\n%s\n' % (
        'a family member (Wan video model)' if ctx.get('kind', 'family') == 'family' else 'a monster (xAI video model)',
        'ALREADY EXISTS and his note is about it' if ctx.get('hasVideo') else 'DOES NOT EXIST yet; the prompt is a draft and his note is an addition',
        old, note.strip()))


def reconcile(ask, old, note, ctx=None):
    """One note into one prompt. A broken answer is sent back once with what was wrong; a second failure is returned with check=True."""
    ctx = ctx or {}
    user = user_text(old, note, ctx); spent = 0.0; why = []; r = None
    for tries in (1, 2):
        txt, cost = ask(SYSTEM, user if tries == 1 else user + '\n\nYOUR LAST ANSWER BROKE THESE RULES. Fix only those and send the whole JSON again:\n- ' + '\n- '.join(why))
        spent += cost
        try: r = parse(txt)
        except Exception as ex:
            why = ['the reply was not the JSON asked for (%s)' % type(ex).__name__]; r = None; continue
        if r['question'] and not r['prompt']:
            return {'ok': True, 'question': r['question'], 'prompt': None, 'kept': '', 'changed': '', 'unused': r['unused'], 'check': False, 'why': [], 'spent': round(spent, 4), 'tries': tries}
        if not r['prompt']: why = ['no prompt and no question were given']; continue
        why = check(old, r['prompt'], r['claimed'], ctx.get('kind', 'family'))
        if not why:
            return {'ok': True, 'question': None, 'prompt': r['prompt'], 'kept': r['kept'], 'changed': r['changed'], 'unused': r['unused'], 'check': False, 'why': [], 'spent': round(spent, 4), 'tries': tries}
    # second failure: hand the last answer back, marked, so Tom can read it and decide
    return {'ok': False, 'question': None, 'prompt': (r or {}).get('prompt'), 'kept': (r or {}).get('kept', ''), 'changed': (r or {}).get('changed', ''), 'unused': (r or {}).get('unused', ''),
            'check': True, 'why': why, 'spent': round(spent, 4), 'tries': 2}


def pick_text_model(models, want=None):
    """The strongest model that does not reason (its reasoning tokens would be billed as output): the dearest non-reasoning text model.
    Only the ORDER of the listed prices is used. An input `model` overrides."""
    if want:
        for m in models:
            if m.get('id') == want or want in (m.get('aliases') or []): return m
        raise SystemExit('Model %s is not in the xAI list.' % want)
    c = [m for m in models if 'text' in (m.get('output_modalities') or ['text'])]
    nr = [m for m in c if 'non-reasoning' in m.get('id', '') and 'code' not in m.get('id', '') and 'mini' not in m.get('id', '')]
    pool = nr or [m for m in c if 'non-reasoning' in m.get('id', '')] or c
    if not pool: raise SystemExit('No xAI text model found in /v1/language-models.')
    return max(pool, key=lambda m: ((m.get('completion_text_token_price') or 0), (m.get('prompt_text_token_price') or 0)))


def xai_ask(key, base, model):
    import vision
    x = vision.Xai(key, base)
    def ask(system, user):
        body = {'model': model, 'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
                'response_format': {'type': 'json_object'}, 'max_tokens': 1800, 'temperature': 0.2}
        r = x._post('/v1/chat/completions', body)
        if r.status_code == 400 and 'response_format' in r.text:
            body.pop('response_format'); r = x._post('/v1/chat/completions', body)
        if r.status_code == 401: raise SystemExit('xAI refused the key (401). Check the repo secret XAI_API_KEY.')
        if r.status_code >= 400: raise RuntimeError('xAI chat HTTP %d: %s' % (r.status_code, r.text[:300]))
        j = r.json()
        return j['choices'][0]['message']['content'], vision.usd(j.get('usage'), model)
    return x, ask


# ---------------------------------------------------------------- requests on main
def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)
def jdump(d): return json.dumps(d, indent=1, ensure_ascii=False) + '\n'


def load_requests(root=ROOT):
    try: return json.load(open(os.path.join(root, 'data', 'guide-reconcile.json'), encoding='utf-8'))
    except (OSError, ValueError): return {'requests': []}


def take_requests(ats, root=ROOT, remote='origin'):
    """Remove the requests with these `at` stamps from data/guide-reconcile.json on main (retried against a main that moved)."""
    def git(*a, check=True):
        p = subprocess.run(['git', '-C', root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:]))
        return p
    for k in range(8):
        git('fetch', '--depth', '1', remote, 'main'); git('checkout', '-q', '-B', 'main', 'FETCH_HEAD'); git('reset', '-q', '--hard', 'FETCH_HEAD')
        doc = load_requests(root); doc['requests'] = [r for r in doc.get('requests') or [] if r.get('at') not in ats]
        open(os.path.join(root, 'data', 'guide-reconcile.json'), 'w', encoding='utf-8').write(jdump(doc))
        git('add', 'data/guide-reconcile.json')
        if not git('status', '--porcelain', '--', 'data/guide-reconcile.json', check=False).stdout.strip(): return
        git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', 'guide: reconcile requests taken [skip ci]')
        if git('push', remote, 'HEAD:main', check=False).returncode == 0: return
        say('push refused, trying again (%d)' % (k + 1)); time.sleep(3 + 2 * k)
    raise RuntimeError('could not push the emptied request list 8 times')


def slug_of(anim_id): return re.sub(r'[^a-z0-9]+', '-', anim_id.lower()).strip('-')


def run_requests(out, ask, model, cap_default=0.10, dry=False, root=ROOT, take=True):
    doc = load_requests(root); reqs = [r for r in doc.get('requests') or [] if r.get('id') and (r.get('note') or '').strip() and r.get('prompt')]
    say('%d reconcile request(s) found' % len(reqs))
    if take and reqs and not dry: take_requests({r.get('at') for r in doc.get('requests') or []}, root)
    os.makedirs(os.path.join(out, 'reconcile'), exist_ok=True)
    total = 0.0
    for r in reqs:
        cap = min(float(r.get('cap') or cap_default), 0.50)
        if dry: say('dry run: would ask for', r['id']); continue
        tried = {'n': 0, 'spent': 0.0}
        def capped(system, user, _a=ask):
            if tried['spent'] >= cap: raise RuntimeError('this request reached its cap of $%.2f' % cap)
            t, c = _a(system, user); tried['spent'] += c; return t, c
        try:
            res = reconcile(capped, r['prompt'], r['note'], {'kind': r.get('kind', 'family'), 'hasVideo': bool(r.get('hasVideo'))})
        except Exception as ex:
            res = {'ok': False, 'question': None, 'prompt': None, 'kept': '', 'changed': '', 'unused': '', 'check': True, 'why': ['the model did not answer: %s' % str(ex)[:200]], 'spent': round(tried['spent'], 4), 'tries': 0}
        res.update({'id': r['id'], 'at': r.get('at'), 'note': r['note'], 'basedOn': r['prompt'], 'rev': r.get('rev', 0), 'model': model, 'done': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())})
        total += res['spent']
        open(os.path.join(out, 'reconcile', slug_of(r['id']) + '.json'), 'w', encoding='utf-8').write(jdump(res))
        say('%s: %s, $%.4f' % (r['id'], 'question' if res['question'] else ('ok' if res['ok'] else 'CHECK THIS ONE'), res['spent']))
    say('spent $%.4f' % total)
    return total


# ---------------------------------------------------------------- the replay (plan section 8)
IMPOSSIBLE = [
    ('Boop with sound', 'rose-boop', 'Make her say boop out loud and add a pop sound when she touches the screen.', 'asks for sound in a silent clip'),
    ('Boop camera', 'rose-boop', 'Zoom the camera in on her finger at the end.', 'asks for a camera move'),
    ('Boop both ways', 'rose-boop', 'Make it faster. Also make it slower and more gentle.', 'contradicts itself'),
    ('Boop vague', 'rose-boop', 'complete fail', 'says only that it failed'),
]
BOOP_NOTES = [
    ('Boop: pointed at the viewer', 'rose-boop', 'She points at the viewer and moves off her spot. She should face left with her feet planted and reach with one finger.', 'the 49 word swing in CLAUDE.md'),
    ('Boop: three reaches', 'rose-boop', 'Her finger goes up, then she pokes twice. It should be one poke.', 'the 330 word prompt in CLAUDE.md'),
]


def replay_cases(root=ROOT):
    sys.path.insert(0, root)
    ents = json.load(open(os.path.join(root, 'data', 'art-prompts.json'), encoding='utf-8'))['entries']
    guide = json.load(open(os.path.join(root, 'data', 'guide-anims.json'), encoding='utf-8'))['anims']
    by_entry = {}
    for a in guide.values():
        if a.get('entry'): by_entry.setdefault(a['entry'], a)
    cases = []
    for e in ents:
        if not str(e.get('id', '')).startswith('clip-'): continue
        notes = [x for x in e.get('rejects') or [] if x.get('from') == 'review' and (x.get('note') or '').strip()]
        if not notes: continue
        a = by_entry.get(e['id']); kind = 'xai' if (a and a['route'] == 'xai') or re.match(r'clip-(mudling|skeeter|grump|toad|log|bigone)', e['id']) else 'family'
        seen = set()
        for x in notes:   # every distinct note he wrote on this clip (a repeat from pressing REDO twice is one note)
            nt = x['note'].strip()
            if nt in seen: continue
            seen.add(nt)
            cases.append({'label': e['id'] + (' #%d' % len(seen) if len(seen) > 1 else ''), 'prompt': e.get('prompt') or '', 'note': nt, 'kind': 'family' if kind == 'family' else 'monster', 'hasVideo': True, 'src': 'Tom\'s REDO note'})
    boop = next((e for e in ents if e.get('id') == 'clip-rose-boop'), None)
    bp = (boop or {}).get('prompt') or ''
    if not bp:
        js = open(os.path.join(root, 'tools', 'art-library', 'clip-prompts.js'), encoding='utf-8').read()
        m = re.search(r"BOOP_APPROVED\s*=\s*`([^`]*)`", js); bp = m.group(1) if m else ''
    for lab, _, note, src in BOOP_NOTES + IMPOSSIBLE:
        cases.append({'label': lab, 'prompt': bp, 'note': note, 'kind': 'family', 'hasVideo': True, 'src': src, 'expect': 'question' if src in ('asks for sound in a silent clip', 'asks for a camera move', 'contradicts itself', 'says only that it failed') else 'prompt'})
    return [c for c in cases if c['prompt'].strip()]


def run_replay(ask, cases, cap, out=None):
    rows, spent = [], 0.0
    for c in cases:
        if spent >= cap: say('cap reached, stopping at $%.3f' % spent); break
        def capped(system, user):
            t, cst = ask(system, user); nonlocal_spent[0] += cst; return t, cst
        nonlocal_spent = [0.0]
        try: r = reconcile(capped, c['prompt'], c['note'], c)
        except Exception as ex: r = {'ok': False, 'question': None, 'prompt': None, 'why': [str(ex)[:150]], 'check': True, 'spent': nonlocal_spent[0], 'tries': 0, 'changed': '', 'kept': '', 'unused': ''}
        spent += nonlocal_spent[0]
        kept = round(100 * kept_share(c['prompt'], r['prompt'])) if r.get('prompt') else None
        rows.append({'label': c['label'], 'src': c['src'], 'note': c['note'], 'expect': c.get('expect'), 'result': 'question' if r.get('question') else ('ok' if r['ok'] else 'check'), 'tries': r['tries'],
                     'kept_words_pct': kept, 'question': r.get('question'), 'changed': r.get('changed'), 'unused': r.get('unused'), 'why': r.get('why'), 'spent': round(nonlocal_spent[0], 4)})
        say('%-34s %-8s tries %s kept %s%% $%.4f' % (c['label'][:34], rows[-1]['result'], r['tries'], kept, nonlocal_spent[0]))
    rep = {'rows': rows, 'spent': round(spent, 4), 'cases': len(cases)}
    if out: open(out, 'w', encoding='utf-8').write(jdump(rep))
    return rep


def main(argv):
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument('--requests', action='store_true'); ap.add_argument('--replay', action='store_true')
    ap.add_argument('--out', default='guidegen-out'); ap.add_argument('--model', default=''); ap.add_argument('--cap', type=float, default=0.6)
    ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--no-take', action='store_true')
    a = ap.parse_args(argv)
    key = os.environ.get('XAI_API_KEY', '')
    if not a.dry_run and not key: raise SystemExit('Repo secret XAI_API_KEY is empty or missing.')
    if a.requests and a.dry_run:
        run_requests(a.out, None, '', dry=True); return 0
    if a.replay and a.dry_run:
        cs = replay_cases(); say('%d replay cases (%d are notes that cannot be done)' % (len(cs), sum(1 for c in cs if c.get('expect') == 'question'))); return 0
    base = os.environ.get('XAI_BASE', 'https://api.x.ai')
    import vision
    x = vision.Xai(key, base); m = pick_text_model(x.models(), a.model or None); model = m['id']
    say('text model:', model)
    _, ask = xai_ask(key, base, model)
    os.makedirs(a.out, exist_ok=True)
    if a.requests: run_requests(a.out, ask, model, take=not a.no_take); return 0
    if a.replay:
        rep = run_replay(ask, replay_cases(), a.cap, os.path.join(a.out, 'replay.json') if a.out else None)
        say('replay: %d cases, $%.3f' % (rep['cases'], rep['spent'])); return 0
    ap.error('give --requests or --replay')


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
