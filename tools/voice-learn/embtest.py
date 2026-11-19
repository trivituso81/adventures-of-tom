# voicelearn3: held-out test with learned speech embeddings. Usage: python3 -I embtest.py  (reads $VL_WORK/stage2/takes_meta.json, results/asr_tiny.json, $VL_WORK/stage2/emb_*.npz)
# Bar fixed BEFORE the run (claude/voice-learning-plan.md): on pure re-roll lines (same script in every take, looped takes removed first),
# 10-fold by line hit rate >= 60% with permutation p < 0.05. Primary tests: layer 6 of each model (3 models, so p must be < 0.05/3 to count).
import os, re, sys, json, numpy as np, pandas as pd, warnings
warnings.filterwarnings('ignore')
from sklearn.linear_model import LogisticRegression
WORK = os.environ.get('VL_WORK', '/tmp/vl'); HERE = os.path.dirname(os.path.abspath(__file__))
meta = pd.DataFrame(json.load(open(WORK + '/stage2/takes_meta.json')))
R = json.load(open(HERE + '/results/asr_tiny.json'))
def norm(s):
    s = s.lower().replace('’', "'"); s = re.sub(r'\[[^\]]*\]', '', s)
    s = re.sub(r"[^a-z0-9' ]", ' ', s); return s.split()
def ins(a, b):
    n, m = len(a), len(b); D = np.zeros((n+1, m+1), int); D[:, 0] = range(n+1); D[0, :] = range(m+1)
    for i in range(1, n+1):
        for j in range(1, m+1):
            D[i, j] = min(D[i-1, j]+1, D[i, j-1]+1, D[i-1, j-1]+(a[i-1] != b[j-1]))
    i, j = n, m; k = 0
    while i > 0 or j > 0:
        if i > 0 and j > 0 and D[i, j] == D[i-1, j-1]+(a[i-1] != b[j-1]): i -= 1; j -= 1
        elif i > 0 and D[i, j] == D[i-1, j]+1: i -= 1
        else: k += 1; j -= 1
    return k
meta['a_ins'] = [ins(norm(s), norm(R[i])) for s, i in zip(meta.script, meta.id)]
meta['voice'] = meta.line.str.split('|').str[1]
clean = meta[meta.a_ins < 3].copy()
g = clean.groupby('line')
clean['n'] = g.id.transform('count'); clean['same'] = g.script.transform(lambda s: s.nunique() == 1)
clean = clean[clean.n >= 2]
clean = clean[clean.groupby('line').kept.transform('sum') == 1]       # the kept take must survive the filter
pure = clean[clean.same].reset_index(drop=True); allc = clean.reset_index(drop=True)
print('takes', len(meta), 'clean', len(clean), 'pure re-roll lines', pure.line.nunique(), 'takes', len(pure), 'all clean lines', allc.line.nunique())
CS = (0.003, 0.03, 0.3)
def prep(d, X):
    X = X.copy(); X -= pd.DataFrame(X).groupby(d.line.values).transform('mean').values       # subtract line mean
    return X / (X.std(0) + 1e-9)
def folds_of(lines, seed, k=10):
    ls = np.array(sorted(set(lines))); r = np.random.default_rng(seed); r.shuffle(ls)
    return {l: i % k for i, l in enumerate(ls)}
def hit(d, X, y, C, seed, k=10):
    f = d.line.map(folds_of(d.line, seed, k)).values; hits = []
    for q in range(k):
        tr = f != q; te = ~tr
        p = LogisticRegression(C=C, max_iter=300).fit(X[tr], y[tr]).decision_function(X[te])
        sub = d[te].reset_index(drop=True); yy = y[te]
        for l, ix in sub.groupby('line').indices.items(): hits.append(float(yy[ix][np.argmax(p[ix])]))
    return np.mean(hits)
def permy(d, y, rng):
    y = y.copy()
    for l, ix in d.groupby('line').indices.items(): y[ix] = y[ix][rng.permutation(len(ix))]
    return y
def study(d, X, name, nperm=40, seeds=3):
    X = prep(d, X); y = d.kept.values.astype(int); ch = np.mean(1 / d.groupby('line').size())
    obs = {C: np.mean([hit(d, X, y, C, s) for s in range(seeds)]) for C in CS}
    rng = np.random.default_rng(5)
    nul = [{C: hit(d, X, permy(d, y, rng), C, 0) for C in CS} for _ in range(nperm)]
    mx = np.array([max(n.values()) for n in nul]); best = max(obs.values())
    p = (mx >= best).mean()
    print(f'{name:34s} lines {d.line.nunique():3d} chance {ch:.3f} | ' + ' '.join(f'C={C}:{obs[C]:.3f}' for C in CS) + f' | best {best:.3f} null-best mean {mx.mean():.3f} p {p:.3f}', flush=True)
    return dict(name=name, lines=int(d.line.nunique()), chance=float(ch), hit={str(C): float(v) for C, v in obs.items()}, best=float(best), nullmax_mean=float(mx.mean()), p=float(p))
def load(f):
    z = np.load(f); idx = {i: k for k, i in enumerate(z['ids'])}; return z, idx
out = []
for tag, kind in (('w2v', 'wav2vec2-base'), ('hub', 'hubert-base'), ('emo', 'wav2vec2-base emotion (superb-er)')):
    f = f'{WORK}/stage2/emb_{tag}.npz'
    if not os.path.exists(f): continue
    z, idx = load(f); H = z['H']
    for dn, d in (('PURE', pure), ('ALLCLEAN', allc)):
        ix = [idx[i] for i in d.id]
        out.append(study(d, H[ix, 6], f'{tag} L6 {dn}'))
    if len(sys.argv) > 1 and sys.argv[1] == 'sweep':      # secondary: other layers, pure re-rolls only; not part of the pass bar
        ix = [idx[i] for i in pure.id]
        for L in (2, 4, 8, 10, 12): out.append(study(pure, H[ix, L], f'{tag} L{L} PURE (secondary)', nperm=25, seeds=2))
        out.append(study(pure, H[ix][:, 4:9].mean(1), f'{tag} mean L4-8 PURE (secondary)', nperm=25, seeds=2))
    if tag == 'emo':
        ix = [idx[i] for i in pure.id]
        out.append(study(pure, z['logits'][ix], 'emo 4 logits PURE (secondary)', nperm=25, seeds=2))
json.dump(out, open(WORK + '/stage2/embtest_results.json', 'w'), indent=1)
# Added after the sweep showed two exploratory layers near 60%: max-over-variants permutation null. Usage: embtest.py maxnull
if len(sys.argv) > 1 and sys.argv[1] == 'maxnull':
    cfg = []
    for tag in ('w2v', 'hub', 'emo'):
        z, idx = load(f'{WORK}/stage2/emb_{tag}.npz'); ix = [idx[i] for i in pure.id]
        for L in (2, 4, 6, 8, 10, 12): cfg.append((f'{tag} L{L}', prep(pure, z['H'][ix, L])))
        cfg.append((f'{tag} mean L4-8', prep(pure, z['H'][ix][:, 4:9].mean(1))))
    y = pure.kept.values.astype(int); rng = np.random.default_rng(99)
    obs = {n: max(np.mean([hit(pure, X, y, C, s) for s in range(2)]) for C in CS) for n, X in cfg}
    top = max(obs.values()); print('observed best over', len(cfg), 'variants', round(top, 3), max(obs, key=obs.get), flush=True)
    nm = []
    for k in range(60):
        yp = permy(pure, y, rng); nm.append(max(hit(pure, X, yp, C, 0) for n, X in cfg for C in CS))
        if k % 10 == 9: print(k + 1, 'perms; null max mean', round(np.mean(nm), 3), 'p so far', (np.array(nm) >= top).mean(), flush=True)
    print('MAXNULL variants', len(cfg), 'observed', round(top, 3), 'null max mean', round(np.mean(nm), 3), '95th', round(np.percentile(nm, 95), 3), 'p', (np.array(nm) >= top).mean())
