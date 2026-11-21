#!/usr/bin/env python3
"""artgen2: QA of a generated picture against its prompt. A vision model answers a fixed checklist plus the requirements it reads out of the
prompt; three runs, majority. Plan: claude/artgen-plan.md section 5.

  python3 -I tools/art-library/artqa.py --replay 40 --cap 1.5 [--out DIR] [--repo DIR] [--runs 3]
  python3 -I tools/art-library/artqa.py --file picture.png --id entry-id [--cap 0.2]

Env: XAI_API_KEY (never printed), XAI_BASE (test stand-in; default https://api.x.ai).
Library (used by artgen.py): questions_for(entry, prompt, n_refs), judge(...), qa_picture(...), score_record(...), load_policy().
Reuses tools/clip-gate/vision.py (Xai transport, pick_model, usd, parse, verdict); nothing is copied from it.
Yes means fine; an answer that is missing or unsure counts as no. Fixed questions are the hold questions (policy file); prompt questions
are advisory (never hold) in this phase. --replay judges the newest approved pictures of Tom's own library and prints how often each
question says no to a picture he approved (false alarms): the evidence for moving a question from hold to advisory."""
import os, sys, re, io, json, time, base64, hashlib, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', 'clip-gate'))
import vision as V   # noqa: E402

POLICY = os.path.join(HERE, 'artqa-policy.json')
LONG_SIDE = 1536
MAX_PROMPT_Q = 10

FIXED = [
    ('f_one', 'Is this one single image (not a collage of separate attempts, no borders or frames added around it)?'),
    ('f_paint', 'Is it a smooth hand-painted picture with soft shading and no thick black outlines, and clearly not pixel art?'),
    ('f_text', 'Is the picture free of letters, words, numbers, watermarks and signatures that the prompt does not ask for?'),
    ('f_bg', 'Does the background match what the prompt asks for (for a flat color background: one flat color with no gradient, floor, shadow band or scenery)?'),
    ('f_crop', 'Is every figure and object fully inside the picture with space around it, nothing cut off at an edge?'),
    ('f_count', 'Does the picture show exactly the number of poses, cells or items the prompt asks for, laid out as asked?'),
    ('f_same', 'Is the character or creature the same one as in the reference picture (same face, colors, proportions, outfit, finish)?'),
    ('f_anat', 'Do faces, eyes and hands look right (no extra or missing fingers or limbs, no warped face)?'),
]
FIXED_Q = dict(FIXED)
OBJECT_TABS = {'Props', 'Areas', 'Rooms', 'Title'}
SUBJECT = re.compile(r'\b(character|creature|monster|prop|sheet|sprite|pose|poses|figure|person|people|portrait|object|enemy|boss|man|woman|girl|boy|child|kid|animal|dog|cat)\b', re.I)
BODY = re.compile(r'\b(person|people|character|creature|monster|enemy|boss|face|man|woman|girl|boy|child|kid|animal|hands?|portrait)\b', re.I)
COUNT = re.compile(r'(\b\d+\s*[x×]\s*\d+\b|\bgrid\b|\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s+(?:poses|cells|frames|items|panels|rows|columns|pictures)\b)', re.I)


def load_policy():
    try: return json.load(open(POLICY, encoding='utf-8'))
    except Exception: return {'threshold': 0.9, 'hold': [k for k, _ in FIXED], 'advisory': {}, 'min_record': 20}


def questions_for(entry, prompt, n_refs):
    """The fixed questions asked of this entry (the table in plan section 5.1): list of (id, text)."""
    p = prompt or ''
    out = [('f_one', FIXED_Q['f_one'])]
    if (entry.get('tab') or '') != 'Clips': out.append(('f_paint', FIXED_Q['f_paint']))
    out.append(('f_text', FIXED_Q['f_text']))
    if re.search(r'background', p, re.I): out.append(('f_bg', FIXED_Q['f_bg']))
    if SUBJECT.search(p): out.append(('f_crop', FIXED_Q['f_crop']))
    if COUNT.search(p): out.append(('f_count', FIXED_Q['f_count']))
    # fix-artgen2look: the object tabs hold no character, so the character questions only made false fails there (a gate was failed for
    # "No character or creature in prompt or image" because its reference was the area painting).
    who = (entry.get('tab') or '') not in OBJECT_TABS
    if n_refs and who: out.append(('f_same', FIXED_Q['f_same']))
    if BODY.search(p) and who: out.append(('f_anat', FIXED_Q['f_anat']))
    return out


def jpeg(png, side=LONG_SIDE):
    from PIL import Image
    im = Image.open(io.BytesIO(png)).convert('RGB')
    w, h = im.size
    if max(w, h) > side:
        k = side / max(w, h); im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=86); return b.getvalue()


SYSTEM = ('You check pictures made by an image generator for a children\'s video game against the prompt that was given to it. '
          'You look carefully, answer only what is visible, and are honest: yes means fine, no means a fault. If you are unsure, answer no. '
          'Always reply with JSON only.')


class Judge:
    """Calls the chat endpoint. Dollars spent are counted from the usage xAI sends (V.usd)."""
    def __init__(self, key, base, model=None):
        self.x = V.Xai(key, base); self.key = key; self.spent = 0.0; self.calls = 0
        self.model = model

    def pick(self):
        if not self.model:
            m = V.pick_model(self.x.models()); self.model = m.get('id') if isinstance(m, dict) else m
        return self.model

    def chat(self, images, text, max_tokens=1500):
        content = [{'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + base64.b64encode(b).decode(), 'detail': 'high'}} for b in images]
        content.append({'type': 'text', 'text': text})
        body = {'model': self.model, 'messages': [{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': content}], 'response_format': {'type': 'json_object'}, 'max_tokens': max_tokens}
        r = self.x._post('/v1/chat/completions', body, tries=2)
        if r.status_code == 400 and 'response_format' in r.text:
            body.pop('response_format'); r = self.x._post('/v1/chat/completions', body, tries=2)
        if r.status_code == 401: raise SystemExit('xAI refused the key (401).')
        if r.status_code >= 400: raise RuntimeError('xAI chat HTTP %d: %s' % (r.status_code, r.text.replace(self.key, '[key]')[:300]))
        j = r.json(); self.calls += 1
        self.spent += V.usd(j.get('usage'), self.model)
        try: return j['choices'][0]['message']['content']
        except Exception: raise RuntimeError('xAI chat answer had no text')


def parse_answers(txt):
    """{id: {yes, why}} from the model's JSON ({id: {...}} or {"answers": {id: {...}}})."""
    t = (txt or '').strip()
    a, b = t.find('{'), t.rfind('}')
    d = json.loads(t[a:b + 1])
    if isinstance(d.get('answers'), dict): d = d['answers']
    return V.parse(json.dumps({'answers': d}))[1]


def criteria_for(judge, prompt, cache_dir=None):
    """Up to 10 checkable requirements read out of the prompt (text only call), cached by the prompt's sha1 so a re-make is judged on the same list."""
    key = hashlib.sha1((prompt or '').strip().encode('utf-8')).hexdigest()
    f = os.path.join(cache_dir, 'criteria', key + '.json') if cache_dir else None
    if f and os.path.exists(f):
        try: return json.load(open(f, encoding='utf-8'))['requirements']
        except Exception: pass
    txt = judge.chat([], 'Here is the prompt an image generator was given.\n\nPROMPT\n' + (prompt or '').strip()[:6000] + '\n\n'
                     'List up to %d requirements from this prompt that a person can check just by looking at the finished picture. Each one is a yes or no '
                     'question written so that yes means the picture is right. Say each thing once. Leave out anything about painting style, outlines, text '
                     'and background (those are checked elsewhere) and anything a viewer could not see. Reply as JSON: {"requirements": ["...", ...]}' % MAX_PROMPT_Q, 600)
    try:
        a, b = txt.find('{'), txt.rfind('}'); d = json.loads(txt[a:b + 1]); req = [str(x).strip()[:300] for x in (d.get('requirements') or []) if str(x).strip()][:MAX_PROMPT_Q]
    except Exception: req = []
    if f:
        os.makedirs(os.path.dirname(f), exist_ok=True)
        json.dump({'requirements': req}, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return req


def score_record(items, model, runs, spent):
    yes = sum(1 for i in items if i['yes'])
    return {'score': round(yes / len(items), 3) if items else 0.0, 'yes': yes, 'of': len(items), 'model': model, 'runs': runs, 'spent': round(spent, 4), 'items': items}


def qa_picture(judge, entry, prompt, png, ref_pngs, cache_dir=None, runs=3, room=None):
    """Judge one picture. room: dollars still allowed (None = no limit); a call that would pass it is not made. Returns the qa record.
    Items: {id, q, kind: fixed|prompt, yes, why}. Fewer runs than asked is recorded in `runs`; no run at all gives {'skipped': why}."""
    start = judge.spent
    def left(): return None if room is None else room - (judge.spent - start)
    fixed = questions_for(entry, prompt, len(ref_pngs))
    if left() is not None and left() < 0.01: return {'skipped': 'the spend cap would be passed: kept without QA'}
    req = criteria_for(judge, prompt, cache_dir)
    qs = [(k, t, 'fixed') for k, t in fixed] + [('p%d' % (i + 1), t, 'prompt') for i, t in enumerate(req)]
    imgs = [jpeg(png)] + [jpeg(r) for r in ref_pngs]
    lab = 'Image 1 is the picture to check.' + ''.join(' Image %d is Reference %d, a picture that was sent to the generator with the prompt.' % (i + 2, i + 1) for i in range(len(ref_pngs)))
    text = (lab + '\n\nPROMPT THE GENERATOR WAS GIVEN\n' + (prompt or '').strip()[:6000] + '\n\nQUESTIONS (yes = fine, no = a fault; one short reason of at most 20 words)\n'
            + '\n'.join('%s: %s' % (k, t) for k, t, _ in qs) + '\n\nReply as JSON: {"<question id>": {"yes": true or false, "why": "..."}, ...}')
    got, per_call = [], None
    for _ in range(runs):
        if left() is not None and (left() < (per_call or 0.01)): break
        before = judge.spent
        try: got.append(parse_answers(judge.chat(imgs, text)))
        except SystemExit: raise
        except Exception:
            if not got: break   # the checker is down: do not wait through every run
        per_call = judge.spent - before
    if not got: return {'skipped': 'the QA calls failed or the cap would be passed: kept without QA'}
    items = []
    for k, t, kind in qs:
        v = [g[k]['yes'] for g in got if k in g]
        yes = sum(v) * 2 > len(got)     # missing counts as no; a tie counts as no
        why = next((g[k]['why'] for g in got if k in g and g[k]['yes'] == yes and g[k]['why']), '')
        if not v: why = 'the checker gave no answer'
        items.append({'id': k, 'q': t, 'kind': kind, 'yes': yes, 'why': why})
    return score_record(items, judge.model, len(got), judge.spent - start)


def short(qa):
    return 'QA %d of %d' % (qa['yes'], qa['of']) if 'yes' in qa else 'QA not run'


def failed_lines(qa):
    return [{'id': i['id'], 'q': i['q'], 'why': i['why']} for i in qa.get('items', []) if not i['yes']]


# ------------------------------------------------------------------ replay on pictures Tom already approved
def replay(repo_root, n, cap, runs, out):
    import artgen
    key = os.environ.get('XAI_API_KEY', '')
    if not key: raise SystemExit('XAI_API_KEY is empty')
    repo = artgen.Repo(repo_root, os.environ.get('ARTGEN_REMOTE', 'origin'))
    doc = repo.entries(); by = {e['id']: e for e in doc['entries']}
    pool = []
    for e in doc['entries']:
        vs = e.get('versions') or []
        if e.get('status') != 'approved' or e.get('clip') or not vs: continue
        v = max(vs, key=lambda x: x.get('at') or 0)
        if repo.has(v['file']): pool.append((v.get('at') or 0, e, v))
    pool.sort(key=lambda t: -t[0])
    j = Judge(key, os.environ.get('XAI_BASE', 'https://api.x.ai')); j.pick()
    print('model', j.model, '| judging up to', n, 'newest approved pictures, cap $%.2f' % cap, flush=True)
    rows, no, asked, cache = [], {}, {}, os.path.join(out, 'artqa-replay')
    for at, e, v in pool:
        if len(rows) >= n: break
        if j.spent >= cap: print('cap reached'); break
        try:
            png = repo.read(v['file']); refs = [artgen.newest_ref(by, p) for p in (e.get('refs') or [])]
            rp = [repo.read(p) for p in refs if repo.has(p)]
            qa = qa_picture(j, e, (e.get('prompt') or '').strip(), png, rp, cache, runs, room=cap - j.spent)
        except Exception as x:
            print(e['id'], 'skipped:', str(x)[:120]); continue
        if 'items' not in qa: print(e['id'], qa.get('skipped')); continue
        rows.append({'id': e['id'], 'tab': e.get('tab'), 'score': qa['score'], 'yes': qa['yes'], 'of': qa['of'], 'runs': qa['runs'], 'failed': failed_lines(qa), 'items': qa['items']})
        for i in qa['items']:
            asked[i['id'] if i['kind'] == 'fixed' else 'prompt'] = asked.get(i['id'] if i['kind'] == 'fixed' else 'prompt', 0) + 1
            if not i['yes']: no[i['id'] if i['kind'] == 'fixed' else 'prompt'] = no.get(i['id'] if i['kind'] == 'fixed' else 'prompt', 0) + 1
        print('%-40s %s  spent $%.2f' % (e['id'], short(qa), j.spent), flush=True)
    N = len(rows)
    clean = sum(1 for r in rows if r['score'] >= load_policy()['threshold'] and all(i['yes'] for i in r['items'] if i['kind'] == 'fixed'))
    print('\n== REPLAY: %d approved pictures judged, spent $%.2f (model %s) ==' % (N, j.spent, j.model))
    print('%-10s %6s %6s %8s' % ('question', 'asked', 'said no', 'no rate'))
    for k in [k for k, _ in FIXED] + ['prompt']:
        if asked.get(k): print('%-10s %6d %6d %7.0f%%' % (k, asked[k], no.get(k, 0), 100.0 * no.get(k, 0) / asked[k]))
    print('Pictures at score %.1f or more with every fixed question yes: %d of %d (%.0f%%)' % (load_policy()['threshold'], clean, N, 100.0 * clean / N if N else 0))
    res = {'n': N, 'spent': round(j.spent, 2), 'model': j.model, 'asked': asked, 'no': no, 'clean': clean, 'rows': rows}
    os.makedirs(out, exist_ok=True)
    json.dump(res, open(os.path.join(out, 'artqa-replay.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    try:   # costs2: the replay's xAI vision money goes to usage in data/costs.json (a no-op unless COSTS_LOG_REPO is set, as the art-gen Action does)
        sys.path.insert(0, os.path.join(HERE, '..')); import costlog
        costlog.log_from_env([{'service': 'xai', 'amount': j.spent, 'what': 'art-gen Action: QA replay on %d approved pictures' % N, 'source': 'art-gen run (artqa replay)'}])
    except Exception as x: print('warning: could not log the spend:', str(x)[:200])
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--replay', type=int, default=0); ap.add_argument('--cap', type=float, default=1.5); ap.add_argument('--runs', type=int, default=3)
    ap.add_argument('--out', default=os.path.join(os.getcwd(), 'artqa-out')); ap.add_argument('--repo', default=os.path.abspath(os.path.join(HERE, '..', '..')))
    ap.add_argument('--file', default=''); ap.add_argument('--id', default='')
    a = ap.parse_args()
    if a.replay: replay(a.repo, a.replay, a.cap, a.runs, a.out); return 0
    if a.file:
        key = os.environ.get('XAI_API_KEY', '')
        if not key: raise SystemExit('XAI_API_KEY is empty')
        doc = json.load(open(os.path.join(a.repo, 'data', 'art-prompts.json'), encoding='utf-8')); e = next((x for x in doc['entries'] if x['id'] == a.id), {'id': a.id, 'tab': ''})
        j = Judge(key, os.environ.get('XAI_BASE', 'https://api.x.ai')); j.pick()
        qa = qa_picture(j, e, (e.get('prompt') or '').strip(), open(a.file, 'rb').read(), [], a.out, a.runs, room=a.cap)
        print(json.dumps(qa, indent=1)); return 0
    ap.print_help(); return 2


if __name__ == '__main__':
    sys.exit(main())
