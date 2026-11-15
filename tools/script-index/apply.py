#!/usr/bin/env python3
"""Apply my script edits (Script Editor step 6, docs/SCRIPT_EDITOR.md).  Run from the repo root:  python3 tools/script-index/apply.py [--dry] [--edits path]

Folds Tom's sent edits (data/script-edits.json) into the repo:
  1. the scene source (data/scenes*.js, data/bonus-nine-scoops.js): reworded, removed, added, re-ordered and re-spoken lines, pauses as {wait:n} steps;
  2. docs/emotion-index-lines.tsv, docs/talk-lines.tsv, docs/emotion-reactions.tsv: rows move to the new text (mood, talking pose, reactions, cue words);
  3. clips whose words or speaker no longer exist are purged (tools/clip-audit/purge_unused.js, the standing rule for reworded lines), the Voice Library
     list is refreshed (tools/voice-library/harvest.json patched by hand-safe rules, then make-index.js);
  4. docs/tom-edits.tsv (the humor guide, section 6 of the plan) and claude/tom-line-edits.md source text (docs/tom-edits.md next to it) get every change;
  5. data/script-edits.json is emptied and the generators run.
A scene whose lines are not plain string literals in a {talk:...} step (built from variables, templates) is NOT touched: it is listed as MANUAL and its edits stay
in data/script-edits.json for a person to fold in. After this: python3 tools/script-index/build.py, unused_voice.py, smoke, look at each edited scene (script_editor_test.py
shows how), bump tags, push, tell Tom which lines now wait for a recording."""
import os, re, sys, json, csv, glob, subprocess, datetime, io
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
os.chdir(ROOT)
DRY = '--dry' in sys.argv
EDITS = sys.argv[sys.argv.index('--edits') + 1] if '--edits' in sys.argv else 'data/script-edits.json'
TODAY = datetime.date.today().isoformat()

# ---------- small JS source helpers ----------
def read(p): return open(p, encoding='utf8').read()
def write(p, s):
    if not DRY: open(p, 'w', encoding='utf8').write(s)
def skip_string(s, i):
    q = s[i]; i += 1
    while i < len(s):
        if s[i] == '\\': i += 2; continue
        if s[i] == q: return i + 1
        i += 1
    return i
def skip_ws_comments(s, i):
    while i < len(s):
        if s[i].isspace(): i += 1
        elif s.startswith('//', i): j = s.find('\n', i); i = len(s) if j < 0 else j + 1
        elif s.startswith('/*', i): j = s.find('*/', i); i = len(s) if j < 0 else j + 2
        else: break
    return i
def match_close(s, i):
    """i is at an opener; returns the index of its matching closer (strings and comments skipped)."""
    pairs = {'[': ']', '{': '}', '(': ')'}; stack = [pairs[s[i]]]; i += 1
    while i < len(s):
        c = s[i]
        if c in '\'"`': i = skip_string(s, i); continue
        if s.startswith('//', i) or s.startswith('/*', i): i = skip_ws_comments(s, i); continue
        if c in pairs: stack.append(pairs[c])
        elif c in ')]}':
            if c != stack[-1]: raise ValueError('bracket mismatch')
            stack.pop()
            if not stack: return i
        i += 1
    raise ValueError('unclosed bracket')
def split_top(s):
    """split the inside of an array at top-level commas -> list of raw chunks (whitespace and comments stay with the chunk after them)."""
    out = []; start = 0; i = 0; depth = 0
    while i < len(s):
        c = s[i]
        if c in '\'"`': i = skip_string(s, i); continue
        if s.startswith('//', i) or s.startswith('/*', i): i = skip_ws_comments(s, i); continue
        if c in '[{(': depth += 1
        elif c in ']})': depth -= 1
        elif c == ',' and depth == 0: out.append(s[start:i]); start = i + 1
        i += 1
    out.append(s[start:]); return out
def unescape(lit):
    q = lit[0]; body = lit[1:-1]; out = []; i = 0
    while i < len(body):
        c = body[i]
        if c == '\\':
            n = body[i + 1]
            if n == 'u': out.append(chr(int(body[i + 2:i + 6], 16))); i += 6; continue
            out.append({'n': '\n', 't': '\t'}.get(n, n)); i += 2; continue
        out.append(c); i += 1
    return ''.join(out)
def quote(t): return "'" + t.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"
LIT = re.compile(r"^\s*(?:(?:/\*.*?\*/|//[^\n]*\n)\s*)*('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")\s*$", re.S)
def parse_lit(raw):
    m = LIT.match(raw); return unescape(m.group(1)) if m else None

# ---------- parse one scene block into arrays of elements ----------
class Elem:   # one element of a step array
    def __init__(self, raw): self.raw = raw; self.talk = None; self.lead = re.match(r'^\s*(?:(?:/\*.*?\*/|//[^\n]*\n)\s*)*', raw, re.S).group(0)
class Arr:
    def __init__(self, start, end, elems): self.start = start; self.end = end; self.elems = elems
def parse_talk(raw):
    """-> (who, [line texts], [voice raw or None]) when raw is a plain {talk:'X',lines:[...] (,voice:[...])} step, else None"""
    body = raw.strip()
    # drop leading comments
    body = body[len(re.match(r'^\s*(?:(?:/\*.*?\*/|//[^\n]*\n)\s*)*', body, re.S).group(0)):]
    if not body.startswith('{'): return None
    try: end = match_close(body, 0)
    except ValueError: return None
    if body[end + 1:].strip(): return None
    inner = body[1:end]; parts = split_top(inner); keys = {}
    for p in parts:
        m = re.match(r'^\s*([A-Za-z_]+)\s*:\s*(.*)$', p, re.S)
        if not m: return None
        keys[m.group(1)] = m.group(2).strip()
    if set(keys) - {'talk', 'lines', 'voice'} or 'talk' not in keys or 'lines' not in keys: return None
    who = parse_lit(keys['talk'])
    if who is None or not keys['lines'].startswith('['): return None
    try: lc = match_close(keys['lines'], 0)
    except ValueError: return None
    if keys['lines'][lc + 1:].strip(): return None
    lits = [parse_lit(x) for x in split_top(keys['lines'][1:lc])]
    if any(l is None for l in lits): return None
    voice = [None] * len(lits)
    if 'voice' in keys:
        if not keys['voice'].startswith('['): return None
        vc = match_close(keys['voice'], 0); vs = [x.strip() for x in split_top(keys['voice'][1:vc])]
        if len(vs) != len(lits): return None
        voice = [None if v in ('null', 'undefined', '') else v for v in vs]
    return who, lits, voice
def find_arrays(block):
    """every array that directly holds a {talk:...} step -> list of Arr, with elements parsed. Returns (arrays, bad) ; bad = talk steps we could not read."""
    arrays = {}; bad = 0
    for m in re.finditer(r'\{\s*talk\s*:', block):
        pos = m.start()
        # innermost enclosing opener
        stack = []; i = 0
        # find innermost unclosed '[' before pos by scanning from block start (cheap enough: scene blocks are small)
        i = 0
        while i < pos:
            c = block[i]
            if c in '\'"`': i = skip_string(block, i); continue
            if block.startswith('//', i) or block.startswith('/*', i): i = skip_ws_comments(block, i); continue
            if c in '[{(': stack.append(i)
            elif c in ']})': stack.pop()
            i += 1
        if not stack or block[stack[-1]] != '[': bad += 1; continue
        a0 = stack[-1]
        if a0 not in arrays:
            a1 = match_close(block, a0); arrays[a0] = Arr(a0, a1, [Elem(r) for r in split_top(block[a0 + 1:a1])])
    for arr in arrays.values():
        for e in arr.elems:
            t = parse_talk(e.raw)
            if t: e.talk = t
    return sorted(arrays.values(), key=lambda a: a.start), bad

# ---------- the scene's edits applied to source (same rules as engine/script-edits.js) ----------
def fmt_wait(sec): return '{wait:%s}' % (('%g' % sec))
def apply_scene(sid, block, st, notes):
    arrays, bad = find_arrays(block)
    all_talk_steps = len(re.findall(r'\{\s*talk\s*:', block))
    parsed = sum(1 for a in arrays for e in a.elems if e.talk)
    if bad or parsed != all_talk_steps: return None, 'a talk step is not a plain {talk:..,lines:[..]} step (%d of %d readable)' % (parsed, all_talk_steps)
    seen = {}; units = {}
    for ai, arr in enumerate(arrays):
        for e in arr.elems:
            if not e.talk: continue
            who, lines, voice = e.talk
            e.units = []
            for t, v in zip(lines, voice):
                base = who + '|' + t; seen[base] = seen.get(base, 0) + 1; ref = base if seen[base] == 1 else base + '#' + str(seen[base])
                u = {'who': who, 'text': t, 'voice': v, 'ref': ref, 'g': e, 'arr': ai, 'orig': (who, t), 'pre': 0, 'post': 0}
                e.units.append(u); units[ref] = u
    lines = st.get('lines') or {}; ins = [dict(x) for x in (st.get('ins') or [])]; order = st.get('order') or []
    missing = [r for r in lines if r not in units]
    changed = []
    for ref, u in units.items():
        e = lines.get(ref)
        if not e: continue
        if e.get('rm'): u['rm'] = True; continue
        if e.get('who') and e['who'] != u['who']: u['who'] = e['who']; u['voice'] = None
        if isinstance(e.get('to'), str) and e['to'] != u['text']: u['text'] = e['to']; u['voice'] = None
        u['pre'] = e.get('pre') or 0; u['post'] = e.get('post') or 0; u['meta'] = e
    # global slot check, then per-array permutation and inserts
    ins_by = {x['uid']: x for x in ins}
    known = [r for r in order if r in units and not units[r].get('rm')]
    slots = sorted([u for r, u in units.items() if r in order and not u.get('rm')], key=lambda u: list(units).index(u['ref']))
    if known and len(slots) == len(known):
        for s_, k_ in zip(slots, known):
            if s_['arr'] != units[k_]['arr']: return None, 'a line was moved across a conditional block (kept manual)'
    owner = {}; prev_arr = 0
    for r in order:
        if r in units: prev_arr = units[r]['arr']
        elif r in ins_by: owner[r] = prev_arr
    final = {}   # arr index -> list of items (['raw', Elem] | ['unit', u] | ['wait', sec])
    for ai, arr in enumerate(arrays):
        items = [['raw', e] if not e.talk else None for e in arr.elems]
        seq = []
        for e in arr.elems:
            if not e.talk: seq.append(['raw', e])
            else:
                for u in e.units: seq.append(['unit', u])
        slot_idx = [i for i, it in enumerate(seq) if it[0] == 'unit' and not it[1].get('rm') and it[1]['ref'] in order]
        want = [units[r] for r in order if r in units and units[r]['arr'] == ai and not units[r].get('rm')]
        if len(want) == len(slot_idx):
            for k, w in enumerate(want): seq[slot_idx[k]] = ['unit', w]
        for uid in order:
            x = ins_by.get(uid)
            if not x or owner.get(uid) != ai: continue
            k = order.index(uid); at = -1
            for j in range(k - 1, -1, -1):
                r = order[j]
                idx = next((i for i, it in enumerate(seq) if it[0] == 'unit' and (it[1]['ref'] == r)), -1)
                if idx < 0: idx = next((i for i, it in enumerate(seq) if it[0] == 'unit' and it[1].get('uid') == r), -1)
                if idx >= 0: at = idx; break
            if x.get('beat') is not None and not x.get('who'): nu = {'beat': float(x['beat']), 'uid': uid, 'ref': uid, 'pre': 0, 'post': 0}
            else:
                nu = {'who': x['who'], 'text': x['text'], 'voice': None, 'ref': uid, 'uid': uid, 'arr': ai, 'orig': None, 'pre': x.get('pre') or 0, 'post': x.get('post') or 0, 'meta': x}
                pv = seq[at][1] if at >= 0 and seq[at][0] == 'unit' else None
                if pv and pv.get('who') == nu['who']: nu['g'] = pv['g']
            seq.insert(at + 1, ['unit', nu])
        for x in ins:
            if x['uid'] not in order and owner.get(x['uid'], 0) == ai and ai == 0 and not any(it[0] == 'unit' and it[1].get('uid') == x['uid'] for it in seq):
                seq.append(['unit', {'who': x['who'], 'text': x['text'], 'voice': None, 'ref': x['uid'], 'uid': x['uid'], 'arr': 0, 'orig': None, 'pre': 0, 'post': 0, 'meta': x}])
        final[ai] = seq
    # re-emit each array: keep untouched elements byte for byte
    out = block; shift = 0
    for ai, arr in enumerate(arrays):
        seq = final[ai]; pieces = []; run = None
        def emit_run():
            nonlocal run
            if not run: return
            g = run['g']; us = run['units']
            same = isinstance(g, Elem) and g.units == us and all((u['who'], u['text']) == u['orig'] and not u.get('pre') and not u.get('post') for u in us)
            if same and all(u.get('voice') == v for u, v in zip(us, g.talk[2])): pieces.append(g.raw)
            else:
                lead = (g.lead if isinstance(g, Elem) else run.get('lead', '\n  '))
                body = "{talk:%s,lines:[%s]" % (quote(us[0]['who']), ','.join(quote(u['text']) for u in us))
                if any(u.get('voice') for u in us): body += ',voice:[%s]' % ','.join(u['voice'] or 'null' for u in us)
                pieces.append(lead + body + '}')
            run = None
        lead_default = next((e.lead for e in arr.elems if e.lead.strip() == '' and '\n' in e.lead), '\n  ')
        for it in seq:
            if it[0] == 'raw': emit_run(); pieces.append(it[1].raw); continue
            u = it[1]
            if u.get('rm'): continue
            if u.get('beat') is not None: emit_run(); pieces.append(lead_default + fmt_wait(u['beat'])); continue
            if u.get('pre'): emit_run(); pieces.append(lead_default + fmt_wait(u['pre']))
            g = u.get('g') or u
            if run and run['units'][-1]['who'] == u['who'] and run['g'] is g and not u.get('pre'): run['units'].append(u)
            else: emit_run(); run = {'g': g, 'units': [u], 'lead': lead_default}
            if u.get('post'): emit_run(); pieces.append(lead_default + fmt_wait(u['post']))
        emit_run()
        newtxt = ','.join(pieces)
        a0, a1 = arr.start + 1 + shift, arr.end + shift
        out = out[:a0] + newtxt + out[a1:]; shift += len(newtxt) - (arr.end - arr.start - 1)
    # record what changed for the humor guide, tsvs and clips
    for ref, u in units.items():
        e = lines.get(ref) or {}
        if u.get('rm'): changed.append(('removed', sid, u['orig'], None, u))
        elif (u['who'], u['text']) != u['orig']: changed.append(('reworded', sid, u['orig'], (u['who'], u['text']), u))
        elif any(k in e for k in ('mood', 'talk', 'react')): changed.append(('expression', sid, u['orig'], (u['who'], u['text']), u))
    for x in ins:
        if x.get('beat') is not None and not x.get('who'): changed.append(('beat', sid, None, None, x)); continue
        changed.append(('added', sid, None, (x['who'], x['text']), x))
    if missing: notes.append('%s: %d edited line(s) are no longer in the scene (skipped): %s' % (sid, len(missing), '; '.join(m[:50] for m in missing[:3])))
    return (out, changed, units, final), None

# ---------- tsv helpers ----------
def read_tsv(p):
    with open(p, encoding='utf8', newline='') as f:
        rd = csv.reader(f, delimiter='\t', quoting=csv.QUOTE_NONE); rows = list(rd)
    return rows[0], rows[1:]
def write_tsv(p, head, rows):
    buf = io.StringIO(); w = csv.writer(buf, delimiter='\t', quoting=csv.QUOTE_NONE, quotechar=None, lineterminator='\n', escapechar='\\')
    w.writerow(head)
    for r in rows: w.writerow(r)
    write(p, buf.getvalue())

def patch_moods(done, ix, purge, mood_set, em0):
    """data/emotion-moods.js is edited in place (emotion-apply.py cannot run clean while queued chapter 7 rows exist; same keys, same format)."""
    p = 'data/emotion-moods.js'; s = read(p); k = s.index('const EMOTION_MOODS=') + len('const EMOTION_MOODS=')
    end = s.rindex('}') + 1; d = json.loads(s[k:end])
    for ow, ot in purge:
        for key in [x for x in d if x == ow + '|' + ot or re.match(re.escape(ow + '|' + ot) + r'\|\d+$', x)]: del d[key]
    for sid, (f, changed) in done.items():
        for kind, _, old, new, u in changed:
            if not new or kind == 'removed': continue
            nw, nt = new; meta = u.get('meta') or (u if kind == 'added' else {}); md = meta.get('mood')
            if not md and kind == 'reworded' and old:
                md = next((r[4] for r in em0 if r[3] == old[0] and r[5] == old[1] and r[4] != 'none'), None)
            if md: d[nw + '|' + nt] = md
    write(p, s[:k] + json.dumps(d, ensure_ascii=False, indent=0) + s[end:])

def main():
    if not os.path.exists(EDITS): sys.exit('no edits file ' + EDITS)
    ed = json.load(open(EDITS, encoding='utf8')); scenes = ed.get('scenes') or {}
    # conversations (scriptconvo1): Tom's Merge, Split, titles and purposes from data/script-review.json go into docs/script-convos.tsv
    if not DRY and os.path.exists('data/script-review.json'):
        r = subprocess.run(['python3', 'tools/script-index/convos.py', 'apply-review'], capture_output=True, text=True); print('CONVERSATIONS:', (r.stdout + r.stderr).strip())
    if not scenes: print('Nothing to apply: data/script-edits.json has no scenes.'); return
    ix = json.load(open('data/script-index.json', encoding='utf8'))
    files = [f for f in glob.glob('data/scenes*.js') + glob.glob('data/bonus-*.js')]
    src = {f: read(f) for f in files}
    notes = []; manual = []; done = {}; log = []
    for sid, st in scenes.items():
        hit = None
        for f, s in src.items():
            for m in re.finditer(r"(?m)^SCENES(?:\.%s|\['%s'\])\s*=" % (re.escape(sid), re.escape(sid)), s):
                nxt = re.search(r"(?m)^(?:SCENES[.\[]|const |function |window\.|// ----)", s[m.end():]); end = m.end() + (nxt.start() if nxt else len(s) - m.end())
                hit = (f, m.start(), end)
        if not hit: manual.append((sid, 'scene source not found')); continue
        f, a, b = hit; block = src[f][a:b]
        res, err = apply_scene(sid, block, st, notes)
        if err: manual.append((sid, err)); continue
        out, changed, units, final = res
        src[f] = src[f][:a] + out + src[f][b:]; done[sid] = (f, changed)
        # the tail after the last array of the block can carry the next comment; src offsets shift: recompute for later scenes by reparsing on the new text
    for f in files:
        if src[f] != read(f):
            write(f, src[f])
            if not DRY:
                r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
                if r.returncode: sys.exit('SYNTAX ERROR after editing %s:\n%s\nRestore with git checkout %s' % (f, r.stderr[:600], f))
    # ---- tsvs, humor guide, clips ----
    em_head, em_rows = read_tsv('docs/emotion-index-lines.tsv'); tk_head, tk_rows = read_tsv('docs/talk-lines.tsv'); rx_head, rx_rows = read_tsv('docs/emotion-reactions.tsv')
    all_src = ''.join(src.values()) + ''.join(read(f) for f in glob.glob('data/*.js') if f not in src and 'voice' not in f and 'emotion' not in f and 'talk-types' not in f)
    still_used = lambda who, text: (quote(text) in all_src or json.dumps(text, ensure_ascii=False) in all_src)
    mood_set = {}; purge = []; guide = []; harvest_add = []; harvest_drop = []; talk_set = {}
    for sid, (f, changed) in done.items():
        sc = ix['scenes'].get(sid, {}); ch = str(sc.get('chapter', ''))
        for kind, _, old, new, u in changed:
            meta = u.get('meta') or (u if kind == 'added' else {})
            if kind in ('reworded', 'removed') and old:
                ow, ot = old
                if not still_used(ow, ot):
                    em_rows = [r for r in em_rows if not (r[3] == ow and r[5] == ot)]
                    tk_rows = [r for r in tk_rows if not (r[3] == ow and r[6] == ot)]
                    rx_rows = [r for r in rx_rows if not (r[3] == sid and r[4] == ow and r[5] == ot)] if False else [r for r in rx_rows if not (r[4] == ow and r[5] == ot)]
                    purge.append((ow, ot)); harvest_drop.append((ow, ot))
            if kind in ('reworded', 'added', 'expression') and new:
                nw, nt = new; mood = meta.get('mood')
                if kind == 'reworded' and old:   # rows carry over to the new words
                    pass
                if mood:
                    em_rows = [r for r in em_rows if not (r[3] == nw and r[5] == nt)]
                    em_rows.append([ch, f, '0', nw, mood, nt])
                if kind in ('reworded',) and old and not mood:
                    # copy the old row's mood to the new text
                    pass
                if meta.get('talk'):
                    talk_set[(nw, nt)] = meta['talk']
                    if not any(r[3] == nw and r[6] == nt for r in tk_rows): tk_rows.append([ch, f, '0', nw, mood or 'none', meta['talk'], nt])
                mood_set[(nw, nt)] = mood
                if kind in ('reworded', 'added'): harvest_add.append((nw, nt, sid))
            guide.append((kind, sid, old, new))
    # carry-over for reworded lines: old mood / talk / reactions are re-keyed to the new words when the old words are gone
    # (done above by dropping the old rows; re-add them under the new text from the pre-edit tsv snapshot)
    # -> simpler and exact: reload the snapshot rows and move them
    em0 = read_tsv('docs/emotion-index-lines.tsv')[1]; tk0 = read_tsv('docs/talk-lines.tsv')[1]; rx0 = read_tsv('docs/emotion-reactions.tsv')[1]
    for sid, (f, changed) in done.items():
        sc = ix['scenes'].get(sid, {}); ch = str(sc.get('chapter', ''))
        for kind, _, old, new, u in changed:
            if kind != 'reworded' or not old or not new: continue
            meta = u.get('meta') or (u if kind == 'added' else {}); (ow, ot), (nw, nt) = old, new
            if still_used(ow, ot): continue
            if not meta.get('mood'):
                for r in em0:
                    if r[3] == ow and r[5] == ot and not any(x[3] == nw and x[5] == nt for x in em_rows): em_rows.append([r[0], f, r[2], nw, r[4], nt])
            for r in tk0:
                if r[3] == ow and r[6] == ot and not any(x[3] == nw and x[6] == nt for x in tk_rows): tk_rows.append([r[0], f, r[2], nw, r[4], meta.get('talk') or r[5], nt])
            if meta.get('react') is None:
                for r in rx0:
                    if r[4] == ow and r[5] == ot:
                        at = r[8] if len(r) > 8 else ''
                        rx_rows.append(r[:4] + [nw, nt] + r[6:8] + [at if at and at in nt else ''])
    # reactions Tom set (replace every row for that line)
    for sid, (f, changed) in done.items():
        sc = ix['scenes'].get(sid, {}); ch = str(sc.get('chapter', '')); chn = '21' if ch == 'ns' else ch
        for kind, _, old, new, u in changed:
            meta = u.get('meta') or (u if kind == 'added' else {})
            if meta.get('react') is None or not new or kind == 'removed': continue
            nw, nt = new
            rx_rows = [r for r in rx_rows if not (r[4] == nw and r[5] == nt)]
            for l, m, cue in meta['react']:
                rx_rows.append(['scene', 'Nine Scoops' if ch == 'ns' else ch, f, sid, nw, nt, l, m, cue if cue and cue in nt else ''])
    write_tsv('docs/emotion-index-lines.tsv', em_head, em_rows); write_tsv('docs/talk-lines.tsv', tk_head, tk_rows); write_tsv('docs/emotion-reactions.tsv', rx_head, rx_rows)
    # harvest.json: drop the old lines, add the new ones (patched by hand-safe rules: no indent, no trailing newline)
    hp = 'tools/voice-library/harvest.json'
    if os.path.exists(hp):
        h = json.load(open(hp, encoding='utf8')); L = h['lines']
        for ow, ot in harvest_drop: L[:] = [l for l in L if not (l['speaker'] == ow and l['text'] == ot)]
        for nw, nt, sid in harvest_add:
            if not any(l['speaker'] == nw and l['text'] == nt for l in L): L.append({'speaker': nw, 'text': nt, 'src': 'scene:' + sid})
        write(hp, json.dumps(h, ensure_ascii=False))
    # humor guide
    tp = 'docs/tom-edits.tsv'; head = ['date', 'chapter', 'scene', 'kind', 'speaker', 'before', 'after', 'line before', 'line after']
    rows = read_tsv(tp)[1] if os.path.exists(tp) else []
    for sid, (f, changed) in done.items():
        sc = ix['scenes'].get(sid, {}); ch = str(sc.get('chapter', ''))
        talk_lines = []
        for st_ in sc.get('steps', []):
            if st_['k'] == 'talk':
                for l in st_['lines']: talk_lines.append((st_['who'], l['t']))
        for kind, _, old, new, u in changed:
            if kind not in ('reworded', 'removed', 'added'): continue
            key = old or new; k = next((i for i, x in enumerate(talk_lines) if key and x == tuple(key)), -1)
            prev_ = talk_lines[k - 1] if k > 0 else None; next_ = talk_lines[k + 1] if 0 <= k < len(talk_lines) - 1 else None
            rows.append([TODAY, ch, sid, kind, (new or old)[0], old[1] if old else '', new[1] if new else '', ('%s: %s' % prev_) if prev_ else '', ('%s: %s' % next_) if next_ else ''])
    if not DRY: write_tsv(tp, head, rows)
    spec = {'orphanDialog': []}
    if purge:
        vm = {}
        for l in ix['scenes'].values():
            for st_ in l['steps']:
                if st_['k'] == 'talk' and st_.get('vid'): vm[st_['who']] = st_['vid']
        vm.update(ix.get('speakers') or {})
        for ow, ot in purge:
            if ow in vm: spec['orphanDialog'].append(vm[ow] + '|' + ot)
        json.dump(spec, open('/tmp/script-purge-spec.json', 'w'), ensure_ascii=False)
    # data/script-edits.json: keep only scenes that stayed manual
    keep = {sid: scenes[sid] for sid, _ in manual}
    write(EDITS, json.dumps({'made': datetime.datetime.now().isoformat(timespec='seconds'), 'scenes': keep}, ensure_ascii=False, indent=1) + '\n')
    print('APPLIED scenes:', ', '.join(done) or 'none')
    for sid, why in manual: print('MANUAL (left in data/script-edits.json):', sid, '-', why)
    for n in notes: print('NOTE', n)
    print('lines changed:', sum(1 for g in guide if g[0] in ('reworded', 'removed', 'added')), '| clips to purge:', len(spec['orphanDialog']))
    if DRY: print('(dry run: nothing written)'); return
    # generators
    def run(cmd):
        r = subprocess.run(cmd, capture_output=True, text=True); print('$', ' '.join(cmd), '->', r.returncode)
        if r.returncode: print((r.stdout + r.stderr)[-700:])
        return r.returncode
    for (nw, nt), tp_ in talk_set.items():
        h_, rr = read_tsv('docs/talk-lines.tsv')
        for r in rr:
            if r[3] == nw and r[6] == nt: r[5] = tp_
        write_tsv('docs/talk-lines.tsv', h_, rr)
    chs = sorted({str(ix['scenes'][sid].get('chapter')) for sid in done if ix['scenes'].get(sid)} - {'None'})
    chs = ['21' if c == 'ns' else c for c in chs]
    patch_moods(done, ix, purge, mood_set, em0)
    run(['python3', 'tools/reaction-apply.py', '1', '2'] + [c for c in chs if c not in ('1', '2')])
    run(['python3', 'tools/talk-apply.py'])
    if spec['orphanDialog']:
        run(['node', 'tools/clip-audit/purge_unused.js', '/tmp/script-purge-spec.json', '--apply'])
    run(['node', 'tools/voice-library/make-index.js'])
    print('NEXT: python3 tools/script-index/build.py ; python3 tools/clip-audit/unused_voice.py ; python3 tools/smoke.py ; look at each edited scene ; write the CHANGES entry ; bump tags ; push.')
    print('Lines that now wait for a recording:', '; '.join('%s: %s' % (n[0], n[1][:50]) for k, s_, o, n in guide if k in ('reworded', 'added') and n))
main()
