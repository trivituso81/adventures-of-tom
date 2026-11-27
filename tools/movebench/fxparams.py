#!/usr/bin/env python3
"""tools/movebench/fxparams.py (movebench7): reads art-factory/aot-stage2c-vfx-library-v11.json and the defaults each drawer in engine/vfx-library.js starts with, and writes
data/movebench-fx.json: per effect its name, layer, colour, summary and each setting's kind, range, choices and default. The Effects section of the Move Workbench (battle-guide.html) is built
from this file alone, so a new library entry reaches the page with its settings and nothing is typed into the page. The plain words of every effect, setting and choice are in
data/movebench-words.json (spec_test.py fails when one is missing).
Usage (repo root): python3 tools/movebench/fxparams.py [--check]     --check exits 1 when data/movebench-fx.json is not what the library and the drawers say."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import schema
ROOT = schema.ROOT
OUT = os.path.join(ROOT, 'data', 'movebench-fx.json')
VFXJS = os.path.join(ROOT, 'engine', 'vfx-library.js')
KINDS = ['range', 'choice', 'bool', 'number', 'color', 'list', 'text', 'who', 'sprite', 'effect']
def js_value(t):
    t = t.strip()
    if t in ('true', 'false'): return t == 'true'
    if t == 'null': return None
    if re.match(r'^-?(\d+\.?\d*|\.\d+)$', t): return float(t)
    if len(t) >= 2 and t[0] in "'\"" and t[-1] == t[0]: return t[1:-1]
    if t.startswith('['):
        inner = t[1:-1].strip()
        return [js_value(x) for x in schema.split_top(inner)] if inner else []
    return None
def drawer_defaults(js):
    """{effect id: {param: default}} from `Object.assign(P1_VFX,{id:vlFn,...})` and each function's `p=vlP(p,{...})`."""
    fn_of = {}
    for m in re.finditer(r'Object\.assign\(P1_VFX,\{(.*?)\}\);', js, re.S):
        for a, b in re.findall(r'([a-z0-9_]+):(vl[A-Za-z0-9]+)', m.group(1)): fn_of[a] = b
    out = {}
    for fid, fn in fn_of.items():
        m = re.search(r'function %s\(g,x,y,u,z,p\)\{[^\n]*?p=vlP\(p,\{' % fn, js)
        if not m: continue
        i = m.end(); d = 1; j = i
        while j < len(js) and d:
            if js[j] == '{': d += 1
            elif js[j] == '}': d -= 1
            j += 1
        body = js[i:j - 1]
        vals = {}
        for item in schema.split_top(body):
            if ':' in item:
                n, v = item.split(':', 1); vals[n.strip()] = js_value(v)
        out[fid] = vals
    return out
def build():
    lib = json.load(open(schema.LIB, encoding='utf8'))
    dd = drawer_defaults(open(VFXJS, encoding='utf8').read())
    fx = {}
    for a in lib['assets']:
        ps = schema.parse_params(a['params']); dv = dd.get(a['id'], {}); params = {}
        for n, p in ps.items():
            q = dict(p); k = q['kind']
            d = dv.get(n)
            if k == 'who': pass
            elif k == 'range':
                if d is None or not (q['lo'] <= d <= q['hi']): d = q['lo']
                q['default'] = d; q['int'] = float(q['lo']).is_integer() and float(q['hi']).is_integer()
            elif k == 'choice':
                q['default'] = d if d in q['choices'] else q['choices'][0]
            elif k == 'bool':
                if q.get('default') is None: q['default'] = bool(d) if isinstance(d, bool) else False
            elif k == 'number':
                if q.get('default') is None: q['default'] = d if isinstance(d, (int, float)) and not isinstance(d, bool) else 1.0
                q['int'] = float(q['default']).is_integer()
            elif k == 'color':
                if not q.get('default'): q['default'] = d if isinstance(d, str) else '#ffffff'
            elif k == 'text':
                q['default'] = d if isinstance(d, str) else ''
            elif k == 'list':
                q['default'] = d if isinstance(d, list) else []
            elif k in ('sprite', 'effect'):
                q['default'] = ''
            for key in ('lo', 'hi', 'default'):
                if key in q and isinstance(q[key], float) and q[key].is_integer(): q[key] = int(q[key])
            params[n] = q
        fx[a['id']] = {'name': a['name'], 'category': a['category'], 'layer': a['layer'], 'color': a['color'], 'summary': a['summary'], 'params': params}
    sounds = sorted(schema.sound_names())
    return {'v': 1, 'note': 'Written by tools/movebench/fxparams.py from art-factory/aot-stage2c-vfx-library-v11.json and engine/vfx-library.js. Do not edit by hand.', 'fx': fx, 'sounds': sounds}
def text(doc): return json.dumps(doc, indent=1, ensure_ascii=False) + '\n'
if __name__ == '__main__':
    doc = build(); t = text(doc)
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf8').read() if os.path.exists(OUT) else ''
        if cur != t: print('data/movebench-fx.json is not fresh: run python3 tools/movebench/fxparams.py'); sys.exit(1)
        print('data/movebench-fx.json is fresh (%d effects)' % len(doc['fx'])); sys.exit(0)
    open(OUT, 'w', encoding='utf8').write(t); print('wrote data/movebench-fx.json: %d effects, %d sounds' % (len(doc['fx']), len(doc['sounds'])))
